
// src/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface ActionItem {
  project_id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  icon_name: string;
  action_type: string;
  action_data: Record<string, unknown>;
  for_role?: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const authorizationHeader = req.headers.get('Authorization')
    if (!authorizationHeader) {
      console.error("Missing Authorization header")
      return new Response(JSON.stringify({ error: 'Missing Authorization header' }), { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    // Initialize standard Supabase client (with user's JWT)
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    
    // Initialize admin client with service role key - this bypasses RLS
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey);
    
    console.log(`Initializing Supabase client with URL: ${supabaseUrl}`);
    
    const supabaseClient = createClient(
      supabaseUrl,
      supabaseAnonKey,
      { global: { headers: { Authorization: authorizationHeader } } }
    );
    
    // Parse request body
    const { projectId } = await req.json()
    
    if (!projectId) {
      console.error("Project ID is required")
      return new Response(JSON.stringify({ error: 'Project ID is required' }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    // Get user info for permission checks
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !user) {
      console.error("Authentication error:", userError)
      return new Response(JSON.stringify({ error: 'User not authenticated' }), { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }
    
    // Log successful auth
    console.log(`Generating action items for project ${projectId} by user ${user.id}`)
    
    // Generate action items based on project state and SOW status
    const actionItems = await generateActionItems(supabaseClient, adminClient, projectId, user.id)
    
    return new Response(
      JSON.stringify({ success: true, actionItems }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error("Error generating action items:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

async function generateActionItems(supabase, adminClient, projectId: string, userId: string) {
  try {
    console.log(`Starting action items generation for project ${projectId}`)
    
    // First, fetch project data and SOW status
    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .select('title, user_id')
      .eq('id', projectId)
      .maybeSingle()
    
    if (projectError) {
      console.error("Error fetching project data:", projectError)
      throw new Error(`Failed to fetch project data: ${projectError.message}`)
    }
    
    console.log("Project data fetched:", projectData)
    
    // Get team members
    const { data: teamMembers, error: teamError } = await supabase
      .from('project_team_members')
      .select('user_id, role')
      .eq('project_id', projectId)
    
    if (teamError) {
      console.error("Error fetching team members:", teamError)
      throw new Error(`Failed to fetch team members: ${teamError.message}`)
    }
    
    console.log(`Team members found: ${teamMembers?.length || 0}`)
    
    // Get user role from profiles table
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle();
      
    if (profileError) {
      console.error("Error fetching user profile:", profileError)
      throw new Error(`Failed to fetch user profile: ${profileError.message}`)
    }
    
    const userRole = userProfile?.role || '';
    console.log(`User role: ${userRole}`)
    
    // Get SOW data
    const { data: sowData, error: sowError } = await supabase
      .from('statement_of_work')
      .select('*')
      .eq('project_id', projectId)
      .maybeSingle()
    
    if (sowError) {
      console.error("Error fetching SOW data:", sowError)
      throw new Error(`Failed to fetch SOW data: ${sowError.message}`)
    }
    
    console.log("SOW data:", sowData ? `Status: ${sowData.status}` : "No SOW found")
    
    // Create action items array
    const actionItems: ActionItem[] = []
    
    // Find coach team member(s)
    const coaches = teamMembers?.filter(member => member.role === 'coach') || []
    const coachIds = coaches.map(coach => coach.user_id)
    
    // Find project owner ID
    const ownerId = projectData?.user_id
    
    // FIRST, CLEAN UP EXISTING SOW-RELATED ACTION ITEMS
    // This ensures we don't have stale tasks related to previous states
    // Important: Remove this task by title rather than based on current data
    const taskTitlesToClean = [
      'Create Statement of Work (SOW)',
      'Finish completing the SOW',
      'Review Statement of Work',
      'Review Revised Statement of Work',
      'Update SOW with Revisions'
    ];
    
    try {
      console.log("Cleaning up previous SOW action items")
      // Delete action items by title using admin client to bypass RLS
      for (const title of taskTitlesToClean) {
        const { error: deleteError } = await adminClient
          .from('project_action_items')
          .delete()
          .eq('project_id', projectId)
          .eq('title', title);
          
        if (deleteError) {
          console.error(`Error deleting task "${title}":`, deleteError);
        }
      }
    } catch (err) {
      console.error("Error during cleanup:", err);
      // Continue despite cleanup errors
    }
    
    // Define SOW-related action items based on SOW state
    if (sowData) {
      console.log(`Generating actions for SOW with status: ${sowData.status}`)
      
      // If SOW is in "draft" state, create action for coach to complete it
      if (sowData.status === 'draft') {
        actionItems.push({
          project_id: projectId,
          title: 'Finish completing the SOW',
          description: 'Complete the Statement of Work for this project',
          priority: 'high',
          icon_name: 'file-pen',
          action_type: 'sow',
          action_data: { route: `/project-sow/${projectId}` },
          for_role: 'coach'
        });
      }
      
      // If SOW is ready for review, create action for owner to review it
      if (sowData.status === 'ready for review') {
        // Check if this is a revision (previous feedback exists)
        const isRevision = sowData.feedback !== null;
        
        console.log(`SOW ready for review, isRevision: ${isRevision}`)
        
        actionItems.push({
          project_id: projectId,
          title: isRevision ? 'Review Revised Statement of Work' : 'Review Statement of Work',
          description: isRevision 
            ? 'The revised Statement of Work is ready for your review'
            : 'Review the scope of work before proceeding',
          priority: 'high',
          icon_name: 'clipboard-check',
          action_type: 'navigate',
          action_data: { 
            route: `/project-sow/${projectId}?review=true${isRevision ? '&revised=true' : ''}` 
          },
          for_role: 'resident'
        });
      }
      
      // If SOW needs revisions, create action for coach
      if (sowData.status === 'pending revision') {
        console.log("SOW needs revision, creating action item for coach")
        
        actionItems.push({
          project_id: projectId,
          title: 'Update SOW with Revisions',
          description: 'Revisions requested by the resident need to be addressed',
          priority: 'high',
          icon_name: 'file-pen',
          action_type: 'sow',
          action_data: { route: `/project-sow/${projectId}` },
          for_role: 'coach'
        });
      }
      
      // If SOW is approved, no SOW-related tasks are added
      if (sowData.status === 'approved') {
        console.log("SOW is approved, no SOW-related tasks needed")
      }
    } else {
      // If SOW doesn't exist yet, create action for coach to create it
      console.log("No SOW found, creating action item for coach to create one")
      
      actionItems.push({
        project_id: projectId,
        title: 'Create Statement of Work (SOW)',
        description: 'Draft a Statement of Work for this project',
        priority: 'high',
        icon_name: 'file-plus',
        action_type: 'sow',
        action_data: { route: `/project-sow/${projectId}` },
        for_role: 'coach'
      });
    }

    // Design-related actions
    // Fetch project to check design data
    const { data: project, error: projectDataError } = await supabase
      .from('projects')
      .select('design_preferences')
      .eq('id', projectId)
      .single();
    
    if (projectDataError) {
      console.error("Error fetching project design preferences:", projectDataError)
      throw new Error(`Failed to fetch project design preferences: ${projectDataError.message}`)
    }
    
    const designPrefs = project.design_preferences || {};
    
    // If before photos are missing
    const hasBeforePhotos = designPrefs.beforePhotos && 
      Object.keys(designPrefs.beforePhotos || {}).length > 0;
      
    if (!hasBeforePhotos) {
      actionItems.push({
        project_id: projectId,
        title: 'Upload Before Photos',
        description: 'Add photos of your current space',
        priority: 'medium',
        icon_name: 'camera',
        action_type: 'navigate',
        action_data: { route: `/project-design/${projectId}` },
        for_role: 'owner'
      });
    }
    
    // If room measurements are missing
    const hasRoomMeasurements = designPrefs.roomMeasurements && 
      Object.keys(designPrefs.roomMeasurements || {}).length > 0;
      
    if (!hasRoomMeasurements) {
      actionItems.push({
        project_id: projectId,
        title: 'Add Room Measurements',
        description: 'Provide accurate measurements for design planning',
        priority: 'medium',
        icon_name: 'ruler',
        action_type: 'navigate',
        action_data: { route: `/project-design/${projectId}` },
        for_role: 'owner'
      });
    }
    
    // Additional standard action items
    actionItems.push({
      project_id: projectId,
      title: 'Upload Room Blueprints',
      description: 'Upload your floor plans to help designers visualize the space.',
      priority: 'medium',
      icon_name: 'file-text',
      action_type: 'navigate',
      action_data: { route: `/project-design/${projectId}` }
    });
    
    actionItems.push({
      project_id: projectId,
      title: 'Add Design Inspirations',
      description: 'Share design ideas or Pinterest boards that inspire your vision.',
      priority: 'low',
      icon_name: 'pen-box',
      action_type: 'navigate',
      action_data: { route: `/project-design/${projectId}` }
    });
    
    console.log(`Created ${actionItems.length} action items to insert`)
    
    // Insert the new action items using the admin client to bypass RLS
    const createdItems = [];
    for (const item of actionItems) {
      try {
        // No need to filter by user role when using admin client
        // We'll insert all items regardless of role
        console.log(`Inserting action item: ${item.title}`)
        
        const { data, error } = await adminClient
          .from('project_action_items')
          .insert(item)
          .select();
        
        if (error) {
          console.error("Error inserting action item:", error);
          continue;
        }
        
        if (data) {
          createdItems.push(data[0]);
        }
      } catch (err) {
        console.error("Error with action item:", err);
      }
    }
    
    console.log(`Successfully inserted ${createdItems.length} action items`)
    return createdItems;
  } catch (error) {
    console.error('Error generating action items:', error);
    throw error;
  }
}
