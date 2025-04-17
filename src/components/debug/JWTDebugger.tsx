
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
          const functionResponse = await fetch(`${import.meta.env.VITE_SUPABASE_FUNCTIONS_URL}/set-claims`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${session.access_token}`
            },
            body: JSON.stringify({ user_id: session.user.id })
          });
          
          if (!functionResponse.ok) {
            console.error("❌ Error in set-claims function:", await functionResponse.text());
          } else {
            const responseData = await functionResponse.json();
            console.log("✅ Claims function response:", responseData);
          }
        } catch (fnError) {
          console.error("❌ Failed to call set-claims function:", fnError);
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
