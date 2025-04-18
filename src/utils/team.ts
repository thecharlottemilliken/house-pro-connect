
import { supabase } from "@/integrations/supabase/client";

export const addTeamMember = async (projectId: string, email: string, role: string, name?: string) => {
  try {
    const cleanEmail = email.trim().toLowerCase();
    
    // First check if the user already exists as a team member
    const { data: existingMember, error: checkError } = await supabase
      .from("project_team_members")
      .select("id")
      .eq("project_id", projectId)
      .eq("email", cleanEmail)
      .maybeSingle();

    if (checkError) throw checkError;

    if (existingMember) {
      return { success: false, error: "This person is already a team member" };
    }

    // Check if the email exists in profiles
    const { data: userData, error: userError } = await supabase
      .from("profiles")
      .select("id, email")
      .eq("email", cleanEmail)
      .maybeSingle();

    if (userError) throw userError;

    const { error } = await supabase.from("project_team_members").insert({
      project_id: projectId,
      user_id: userData?.id || '00000000-0000-0000-0000-000000000000',
      role: role,
      email: cleanEmail,
      name: name || cleanEmail.split('@')[0]
    });

    if (error) throw error;
    
    return { success: true };
  } catch (err: any) {
    console.error("Error adding team member:", err);
    return { success: false, error: err.message };
  }
};

export const removeTeamMember = async (memberId: string) => {
  try {
    const { error } = await supabase
      .from("project_team_members")
      .delete()
      .eq("id", memberId);

    if (error) throw error;
    
    return { success: true };
  } catch (err: any) {
    console.error("Error removing team member:", err);
    return { success: false, error: err.message };
  }
};
