
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: any | null;
  isLoading: boolean;
  signUp: (email: string, password: string, userData: any) => Promise<{ data?: any, error: any | null }>;
  signIn: (email: string, password: string) => Promise<{ data?: any, error: any | null }>;
  signOut: () => Promise<{ error: any | null }>;
  updateProfile: (data: any) => Promise<{ error: any | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(() => {
            fetchProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      console.log("Fetching profile for user:", userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, email, role')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        
        if (error.message && error.message.includes('infinite recursion')) {
          console.log("Attempting to get role directly via user metadata to avoid recursion");
          const userMeta = user?.user_metadata;
          setProfile({
            id: userId,
            email: user?.email,
            name: userMeta?.name || "User",
            role: userMeta?.role || null
          });
        }
        return;
      }

      console.log("Profile data loaded:", data);
      setProfile(data);
    } catch (error) {
      console.error('Error in fetchProfile:', error);
    }
  };
  
  const refreshProfile = async () => {
    if (!user) return;
    await fetchProfile(user.id);
  };

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      setIsLoading(true);
      
      // First, validate the data and prepare the user metadata
      const userMetadata = {
        name: userData.name || '',
        role: userData.role || 'resident',
      };
      
      console.log("Creating account with metadata:", userMetadata);
      
      // First create the user account
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userMetadata,
        },
      });

      if (error) {
        toast({
          title: "Signup error",
          description: error.message || "Failed to create account",
          variant: "destructive",
        });
        return { error };
      }
      
      console.log("Account created successfully with role:", userData.role);
      
      // Make sure a profile record is properly created in the database
      if (data?.user) {
        try {
          // Check if profile exists
          const { data: profileData, error: profileCheckError } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', data.user.id)
            .single();
            
          // If profile doesn't exist, create it manually
          if (profileCheckError || !profileData) {
            const { error: insertError } = await supabase
              .from('profiles')
              .insert({
                id: data.user.id,
                name: userMetadata.name,
                email: email,
                role: userMetadata.role,
              });
              
            if (insertError) {
              console.error("Error creating profile record:", insertError);
            } else {
              console.log("Profile record created successfully");
            }
          }
        } catch (profileError) {
          console.error("Error checking/creating profile:", profileError);
        }
        
        // For service_pro accounts, make sure to create entry in service_pro_profiles table
        if (userData.role === 'service_pro' && data?.user) {
          try {
            console.log("Creating service_pro_profile for user:", data.user.id);
            
            const { error: serviceProError } = await supabase
              .from('service_pro_profiles')
              .insert({
                id: data.user.id
              });
              
            if (serviceProError) {
              console.error("Error creating service pro profile:", serviceProError);
            } else {
              console.log("Service pro profile created successfully");
            }
          } catch (serviceProError) {
            console.error("Error creating service pro profile:", serviceProError);
          }
        }
      }
      
      // For coaching accounts, explicitly call the set-claims function after signup
      if (userData.role === 'coach' && data?.user) {
        try {
          console.log("Setting coach claims for user:", data.user.id);
          
          // Call the set-claims edge function directly
          const response = await supabase.functions.invoke('set-claims', {
            body: { user_id: data.user.id }
          });
          
          console.log("Set-claims response:", response);
          
          if (response.error) {
            console.error("Error setting coach claims:", response.error);
            // We continue with sign-in attempt regardless
          }
        } catch (setClaimError) {
          console.error("Error calling set-claims function:", setClaimError);
          // Even if this fails, we continue with sign-in
        }
      }
      
      toast({
        title: "Account created successfully",
        description: "You can now sign in with your credentials",
      });

      // Now sign in with the credentials
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (signInError) {
        console.error("Sign in after signup failed:", signInError);
        // Don't navigate since login failed
        return { data, error: null };
      }
      
      // Sign in succeeded, navigate to appropriate dashboard based on role
      if (userData.role === 'service_pro') {
        navigate('/service-pro-dashboard');
      } else {
        navigate('/dashboard');
      }
      
      return { data, error: null };
    } catch (error: any) {
      console.error("Unexpected error during signup:", error);
      toast({
        title: "Signup error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
      return { error };
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) return { error };
      
      toast({
        title: "Signed in successfully",
        description: "Welcome back!",
      });
      
      navigate('/dashboard');
      return { data, error: null };
    } catch (error: any) {
      return { error };
    }
  };

  const signOut = async () => {
    try {
      try {
        await supabase.auth.signOut();
      } catch (error: any) {
        console.log("Backend sign out had an issue:", error.message);
      }
      
      setSession(null);
      setUser(null);
      setProfile(null);
      
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account",
      });
      
      navigate('/');
      
      return { error: null };
    } catch (error) {
      console.error("Sign out failed in catch block:", error);
      return { error };
    }
  };

  const updateProfile = async (data: any) => {
    try {
      if (!user) return { error: new Error('No user logged in') };

      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user.id);

      if (error) return { error };

      fetchProfile(user.id);
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
      
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        isLoading,
        signUp,
        signIn,
        signOut,
        updateProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
