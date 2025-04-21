
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

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

    // Create a RPC call to insert_team_member function that will bypass RLS
    // This is safer than trying to insert directly which might fail due to RLS
    const { data, error } = await supabase.rpc('insert_team_member', {
      p_project_id: projectId,
      p_user_id: userData?.id || null,
      p_role: role,
      p_email: cleanEmail,
      p_name: name || cleanEmail.split('@')[0]
    });

    if (error) {
      console.error("RPC insert_team_member failed, attempting direct insert:", error);
      
      // Fallback to direct insert if RPC fails
      const { error: insertError } = await supabase
        .from("project_team_members")
        .insert({
          project_id: projectId,
          user_id: userData?.id || null,
          role: role,
          email: cleanEmail,
          name: name || cleanEmail.split('@')[0]
        });
        
      if (insertError) throw insertError;
    }
    
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
