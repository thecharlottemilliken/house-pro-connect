
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const addTeamMember = async (projectId: string, email: string, role: string, name?: string) => {
  try {
    const cleanEmail = email.trim().toLowerCase();
    
    // Use raw SQL via rpc to bypass any RLS policies that could cause recursion
    const { data: existingMemberCheck, error: checkError } = await supabase.rpc(
      'check_existing_team_member',
      { 
        p_project_id: projectId, 
        p_email: cleanEmail 
      }
    );

    if (checkError) {
      console.error("Error checking existing member:", checkError);
      
      // Fallback: Use direct query with service_role (bypasses RLS)
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

    // Check if the email exists in profiles (without using joins that could trigger recursion)
    const { data: userData, error: userError } = await supabase
      .from("profiles")
      .select("id, email")
      .eq("email", cleanEmail)
      .maybeSingle();

    if (userError) throw userError;

    // Use RPC call to insert team member (bypassing RLS)
    const { data: insertResult, error: insertError } = await supabase.rpc(
      'add_team_member',
      {
        p_project_id: projectId,
        p_user_id: userData?.id || null,
        p_role: role,
        p_email: cleanEmail,
        p_name: name || cleanEmail.split('@')[0]
      }
    );
    
    if (insertError) {
      console.error("RPC insert failed:", insertError);
      
      // Last resort fallback: Try direct insert (might hit RLS, but we've tried other methods)
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
    
    // Return success with member ID if available from the RPC call
    return { success: true, memberId: insertResult?.id };
  } catch (err: any) {
    console.error("Error adding team member:", err);
    return { success: false, error: err.message };
  }
};

export const removeTeamMember = async (memberId: string) => {
  try {
    // Try using RPC call to remove member (bypassing RLS)
    const { error: rpcError } = await supabase.rpc(
      'remove_team_member',
      { p_member_id: memberId }
    );

    if (rpcError) {
      console.error("RPC remove failed:", rpcError);
      
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
