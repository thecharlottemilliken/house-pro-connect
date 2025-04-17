
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface Project {
  id: string;
  title: string;
  created_at: string;
  state: string;
  property: {
    property_name: string;
    address_line1: string;
    city: string;
    state: string;
  };
  owner: {
    id: string;
    name: string;
    email: string;
  };
}

interface ProfileInfo {
  id: string;
  name: string;
  email: string;
}

export const useCoachProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      console.log("Fetching projects...");

      const { data: projectsData, error: projectsError } = await supabase
        .from("projects")
        .select(`
          id,
          title,
          created_at,
          state,
          user_id,
          property_id
        `)
        .order("created_at", { ascending: false });

      if (projectsError) throw projectsError;
      if (!projectsData || projectsData.length === 0) {
        setProjects([]);
        setIsLoading(false);
        return;
      }

      const propertyIds = projectsData.map((project) => project.property_id);
      const userIds = projectsData.map((project) => project.user_id);

      console.log("Project user IDs:", userIds);

      const { data: propertiesData } = await supabase
        .from("properties")
        .select(`
          id, 
          property_name,
          address_line1,
          city,
          state
        `)
        .in("id", propertyIds);

      const propertiesMap = new Map();
      if (propertiesData) {
        propertiesData.forEach((property) => {
          propertiesMap.set(property.id, property);
        });
      }

      // Fetch user profile data - try multiple approaches
      const profilesMap = await fetchUserProfiles(userIds);
      
      const processedProjects: Project[] = projectsData.map((project) => {
        const property = propertiesMap.get(project.property_id) || {
          property_name: "Unknown Property",
          address_line1: "Address not available",
          city: "Unknown",
          state: "Unknown",
        };

        const owner = profilesMap.get(project.user_id);
        const ownerData: ProfileInfo = owner || {
          id: project.user_id,
          name: `User ${project.user_id.substring(0, 6)}`,
          email: "email@unknown.com",
        };

        return {
          id: project.id,
          title: project.title,
          created_at: project.created_at,
          state: project.state,
          property,
          owner: ownerData,
        };
      });

      console.log("Processed projects:", processedProjects.length);
      console.table(
        processedProjects.map((p) => ({
          title: p.title,
          ownerName: p.owner.name,
          ownerEmail: p.owner.email,
        }))
      );

      setProjects(processedProjects);
    } catch (error: any) {
      console.error("Error fetching projects:", error);
      toast({
        title: "Error",
        description: "Failed to load projects. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Comprehensive function to fetch user profiles using multiple strategies
  const fetchUserProfiles = async (userIds: string[]): Promise<Map<string, ProfileInfo>> => {
    const profilesMap = new Map<string, ProfileInfo>();
    
    // Try strategy 1: Direct profiles table query with role-based access
    try {
      console.log("Strategy 1: Fetching profiles with coach role access...");
      
      // This query should work if the coach RLS policy is correctly set up
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, name, email")
        .in("id", userIds);

      if (!profilesError && profilesData && profilesData.length > 0) {
        console.log("✅ Found profile data for users:", profilesData.length);
        profilesData.forEach((profile) => {
          profilesMap.set(profile.id, profile);
        });
        return profilesMap;
      } else if (profilesError) {
        console.error("❌ Error in strategy 1:", profilesError);
      } else {
        console.warn("⚠️ No profiles found with strategy 1");
      }
    } catch (err) {
      console.error("❌ Exception in strategy 1:", err);
    }
    
    // Try strategy 2: Get emails using direct RPC function
    try {
      console.log("Strategy 2: Using RPC get_user_email function...");
      
      for (const userId of userIds) {
        if (!profilesMap.has(userId)) {
          const { data, error } = await supabase.rpc('get_user_email', { user_id: userId });
          
          if (!error && data) {
            console.log(`✅ Got email for user ${userId}:`, data);
            profilesMap.set(userId, {
              id: userId,
              name: `User ${userId.substring(0, 6)}`,
              email: data
            });
          } else if (error) {
            console.error(`❌ Error getting email for user ${userId}:`, error);
          }
        }
      }
    } catch (err) {
      console.error("❌ Exception in strategy 2:", err);
    }

    // Try strategy 3: Last resort - use direct auth admin function if available in edge function
    if (profilesMap.size < userIds.length) {
      try {
        console.log("Strategy 3: Calling edge function to get user data...");
        
        // Using a fetch call to edge function as last resort (Note: you'd need to implement this edge function)
        const session = await supabase.auth.getSession();
        if (session?.data?.session?.access_token) {
          const missingUserIds = userIds.filter(id => !profilesMap.has(id));
          
          console.log("Attempting to fetch data for missing users:", missingUserIds);
          
          // This is a placeholder - you would need to implement this edge function
          const functionUrl = "https://gluggyghzalabvlvwqqk.supabase.co/functions/v1/get-user-data";
          const response = await fetch(functionUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${session.data.session.access_token}`
            },
            body: JSON.stringify({ user_ids: missingUserIds })
          });
          
          if (response.ok) {
            const userData = await response.json();
            if (userData && userData.users) {
              console.log("✅ Got user data from edge function:", userData.users.length);
              userData.users.forEach((user: any) => {
                profilesMap.set(user.id, {
                  id: user.id,
                  name: user.name || `User ${user.id.substring(0, 6)}`,
                  email: user.email || "unknown@email.com"
                });
              });
            }
          } else {
            console.error("❌ Edge function failed:", await response.text());
          }
        }
      } catch (err) {
        console.error("❌ Exception in strategy 3:", err);
      }
    }
    
    console.log(`Final profile map has ${profilesMap.size}/${userIds.length} users`);
    return profilesMap;
  };

  return { projects, isLoading, fetchProjects };
};
