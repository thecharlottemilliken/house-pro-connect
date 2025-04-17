
import { supabase } from "@/integrations/supabase/client";

export const addTeamMember = async (projectId: string, email: string, role: string, name?: string) => {
  try {
    const { data: userData, error: userError } = await supabase
      .from("profiles")
      .select("id, email")
      .eq("email", email)
      .maybeSingle();

    if (userError) throw userError;

    const { error } = await supabase.from("project_team_members").insert({
      project_id: projectId,
      user_id: userData?.id || '00000000-0000-0000-0000-000000000000',
      role: role,
      email: email,
      name: name || email.split('@')[0]
    });

    if (error) throw error;
    
    return { success: true };
  } catch (err: any) {
    console.error("Error adding team member:", err);
    return { success: false, error: err.message };
  }
};
