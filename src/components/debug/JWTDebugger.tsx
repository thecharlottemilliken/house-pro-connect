import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const JWTDebugger = () => {
  useEffect(() => {
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error("❌ Error getting session:", error);
      } else {
        console.log("✅ JWT app_metadata:", data?.session?.user?.app_metadata);
        console.log("👤 User ID:", data?.session?.user?.id);
        console.log("📧 Email:", data?.session?.user?.email);
        console.log("📧 App Role:",data?.session?.user?.app_metadata?.app_role));
      }
    };

    checkSession();
  }, []);

  return null; // this component renders nothing but runs on mount
};

export default JWTDebugger;
