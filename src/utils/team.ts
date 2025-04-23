
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface AddTeamMemberResult {
  success: boolean;
  memberId?: string;
  error?: string;
}

export const addTeamMember = async (projectId: string, email: string, role: string, name?: string): Promise<AddTeamMemberResult> => {
  try {
    const cleanEmail = email.trim().toLowerCase();
    
    // Check if member already exists
    const { data: existingMemberCheck, error: checkError } = await supabase.functions.invoke(
      'check-existing-team-member', {
        body: { 
          projectId, 
          email: cleanEmail 
        }
      }
    );

    if (checkError) {
      console.error("Error checking existing member:", checkError);
      
      // Fallback: Use direct query
      const { data: existingMember, error: directCheckError } = await supabase
        .from("project_team_members")
        .select("id")
        .eq("project_id", projectId)
        .eq("email", cleanEmail)
        .maybeSingle();
        
      if (directCheckError) throw directCheckError;
      
      if (existingMember) {
        return { success: false, error: "This person is already a team member" };
      }
    } else if (existingMemberCheck && existingMemberCheck.exists) {
      return { success: false, error: "This person is already a team member" };
    }

    // Check if the email exists in profiles
    const { data: userData, error: userError } = await supabase
      .from("profiles")
      .select("id, email")
      .eq("email", cleanEmail)
      .maybeSingle();

    if (userError) throw userError;

    // Add team member using edge function
    const { data: insertResult, error: insertError } = await supabase.functions.invoke(
      'add-team-member', {
        body: {
          projectId,
          userId: userData?.id || null,
          role,
          email: cleanEmail,
          name: name || cleanEmail.split('@')[0]
        }
      }
    );
    
    if (insertError) {
      console.error("Team member insert failed:", insertError);
      
      // Last resort fallback: Try direct insert
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
      
      if (error) throw error;
      
      return { success: true, memberId: data?.id };
    }
    
    // Return success with member ID if available
    return { success: true, memberId: insertResult?.id };
  } catch (err: any) {
    console.error("Error adding team member:", err);
    return { success: false, error: err.message };
  }
};

export const removeTeamMember = async (memberId: string): Promise<{success: boolean, error?: string}> => {
  try {
    // Use edge function to remove member
    const { error: removeError } = await supabase.functions.invoke(
      'remove-team-member', {
        body: { memberId }
      }
    );

    if (removeError) {
      console.error("Team member removal failed:", removeError);
      
      // Fallback: Try direct delete
      const { error } = await supabase
        .from("project_team_members")
        .delete()
        .eq("id", memberId);

      if (error) throw error;
    }
    
    return { success: true };
  } catch (err: any) {
    console.error("Error removing team member:", err);
    return { success: false, error: err.message };
  }
};
