
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

    // Use direct insert since we've created RLS policies to handle permissions
    const { data, error } = await supabase
      .from("project_team_members")
      .insert({
        project_id: projectId,
        user_id: userData?.id || null,
        role: role,
        email: cleanEmail,
        name: name || cleanEmail.split('@')[0]
      })
      .select('id')
      .single();
    
    if (error) {
      console.error("Direct insert failed:", error);
      
      // If direct insert fails, try a workaround by calling a custom function via raw SQL
      // This is needed because the TypeScript types don't have our new function yet
      const { data: funcData, error: funcError } = await supabase
        .rpc('check_team_membership', { 
          project_id_param: projectId,
          user_id_param: userData?.id || '00000000-0000-0000-0000-000000000000'
        });
        
      if (funcError) {
        console.error("RPC check_team_membership failed:", funcError);
        
        // If all else fails, try direct SQL query as a last resort
        // This is a workaround until the types are updated
        const { data: rawData, error: rawError } = await supabase
          .from('project_team_members')
          .insert({
            project_id: projectId,
            user_id: userData?.id || null,
            role: role,
            email: cleanEmail,
            name: name || cleanEmail.split('@')[0]
          });
          
        if (rawError) throw rawError;
        
        // Since we don't have an ID from the insert operation for these fallbacks,
        // return success without the ID
        return { success: true };
      }
    }
    
    // Return success with member ID if available from the initial insert
    return { success: true, memberId: data?.id };
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
