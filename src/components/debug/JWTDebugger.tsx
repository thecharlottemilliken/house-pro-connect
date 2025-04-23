
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { jwtDecode } from "jwt-decode";

const JWTDebugger = () => {
  useEffect(() => {
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error("❌ Error getting session:", error);
        return;
      }
      
      const session = data?.session;
      if (!session) {
        console.log("⚠️ No active session found");
        return;
      }

      try {
        const decodedToken = jwtDecode(session.access_token);
        console.log("✅ JWT decoded:", decodedToken);
        console.log("👤 User ID:", session.user.id);
        console.log("📧 Email:", session.user.email);
        
        // Log app_metadata explicitly
        console.log("🔑 App Metadata:", session.user.app_metadata);
        
        // Check specifically for app_role
        if (decodedToken) {
          // @ts-ignore - allowing flexible token inspection
          const appRole = decodedToken.app_role || decodedToken.app_metadata?.app_role;
          console.log("👑 App Role from token:", appRole || "No app_role found in token");
        }
        
        // Check JWT token for role (app_metadata.app_role)
        if (session.user.app_metadata && session.user.app_metadata.app_role) {
          console.log("🏅 App Role from metadata:", session.user.app_metadata.app_role);
        } else {
          console.log("⚠️ No app_role found in app_metadata");
        }
        
        // Check if user has coach role in profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
          
        console.log("👨‍🏫 Profile role:", profileData?.role || "No role in profile");
        
        // Try to call the set-claims function to ensure it works
        try {
          console.log("🔄 Attempting to call set-claims function...");
          const functionResponse = await fetch("https://gluggyghzalabvlvwqqk.supabase.co/functions/v1/set-claims", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${session.access_token}`
            },
            body: JSON.stringify({ user_id: session.user.id })
          });
          
          if (!functionResponse.ok) {
            const errorText = await functionResponse.text();
            console.error(`❌ Error in set-claims function (${functionResponse.status}):`, errorText);
          } else {
            const responseData = await functionResponse.json();
            console.log("✅ Claims function response:", responseData);
            
            // Refresh session to get updated claims
            const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
            if (refreshError) {
              console.error("Failed to refresh session:", refreshError);
            } else {
              console.log("Session refreshed, new token:", refreshData?.session ? "received" : "not received");
              if (refreshData?.session) {
                const refreshedToken = jwtDecode(refreshData.session.access_token);
                console.log("Refreshed JWT decoded:", refreshedToken);
              }
            }
          }
        } catch (fnError) {
          console.error("❌ Failed to call set-claims function:", fnError);
        }
        
        // Debug projects access for coach
        if (profileData?.role === 'coach') {
          try {
            console.log("👀 Testing direct projects access...");
            const { data: projectsData, error: projectsError } = await supabase
              .from('projects')
              .select('id, title')
              .limit(3);
              
            if (projectsError) {
              console.error("❌ Error accessing projects:", projectsError);
            } else {
              console.log("✅ Projects access success:", projectsData?.length || 0, "projects found");
            }
          } catch (projectsError) {
            console.error("❌ Failed to access projects:", projectsError);
          }
        }
      } catch (decodeError) {
        console.error("❌ Error decoding JWT:", decodeError);
      }
    };

    checkSession();
  }, []);

  return null; // this component renders nothing but runs on mount
};

export default JWTDebugger;
