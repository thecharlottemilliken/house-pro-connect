
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
      return new Response(JSON.stringify({ error: 'Missing Authorization header' }), { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authorizationHeader } } }
    )
    
    // Parse request body
    const { projectId } = await req.json()
    
    if (!projectId) {
      return new Response(JSON.stringify({ error: 'Project ID is required' }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    // Generate action items based on project state and SOW status
    const actionItems = await generateActionItems(supabaseClient, projectId)
    
    return new Response(
      JSON.stringify({ success: true, actionItems }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

async function generateActionItems(supabase, projectId: string) {
  try {
    // First, fetch project data and SOW status
    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .select('title, user_id')
      .eq('id', projectId)
      .single()
    
    if (projectError) throw projectError
    
    // Get team members
    const { data: teamMembers, error: teamError } = await supabase
      .from('project_team_members')
      .select('user_id, role')
      .eq('project_id', projectId)
    
    if (teamError) throw teamError
    
    // Get SOW data
    const { data: sowData, error: sowError } = await supabase
      .from('statement_of_work')
      .select('*')
      .eq('project_id', projectId)
      .maybeSingle()
    
    if (sowError) throw sowError
    
    // Create action items array
    const actionItems: ActionItem[] = []
    
    // Find coach team member(s)
    const coaches = teamMembers.filter(member => member.role === 'coach')
    const coachIds = coaches.map(coach => coach.user_id)
    
    // Find project owner ID
    const ownerId = projectData.user_id
    
    // Define SOW-related action items based on SOW state
    if (sowData) {
      // If SOW is in "draft" or doesn't exist, create action for coach to create it
      if (sowData.status === 'draft') {
        actionItems.push({
          project_id: projectId,
          title: 'Create Statement of Work (SOW)',
          description: 'Define the scope of work, materials, and labor requirements',
          priority: 'high',
          icon_name: 'file-plus',
          action_type: 'sow',
          action_data: { route: `/project-sow/${projectId}` },
          for_role: 'coach'
        })
      }
      
      // If SOW is ready for review, create action for owner to review it
      if (sowData.status === 'ready for review') {
        // Check if this is a revision (previous feedback exists)
        const isRevision = sowData.feedback !== null;
        
        actionItems.push({
          project_id: projectId,
          title: isRevision ? 'Review Revised SOW' : 'Review Statement of Work',
          description: isRevision 
            ? 'The revised Statement of Work is ready for your review'
            : 'Review the scope of work before proceeding',
          priority: 'high',
          icon_name: 'file-text',
          action_type: 'sow',
          action_data: { 
            route: `/project-sow/${projectId}?review=true${isRevision ? '&revised=true' : ''}` 
          }
        })
      }
      
      // If SOW needs revisions, create action for coach
      if (sowData.status === 'pending revision') {
        actionItems.push({
          project_id: projectId,
          title: 'Update SOW with Revisions',
          description: 'Revisions requested by the resident need to be addressed',
          priority: 'high',
          icon_name: 'file-pen',
          action_type: 'sow',
          action_data: { route: `/project-sow/${projectId}` },
          for_role: 'coach'
        })
      }
    } else {
      // If SOW doesn't exist yet, create action for coach to create it
      actionItems.push({
        project_id: projectId,
        title: 'Create Statement of Work (SOW)',
        description: 'Define the scope of work, materials, and labor requirements',
        priority: 'high',
        icon_name: 'file-plus',
        action_type: 'sow',
        action_data: { route: `/project-sow/${projectId}` },
        for_role: 'coach'
      })
    }
    
    // First, clear out any existing action items for this project
    const { error: deleteError } = await supabase
      .from('project_action_items')
      .delete()
      .eq('project_id', projectId)
      
    if (deleteError) throw deleteError
    
    // Then, insert the new action items
    if (actionItems.length > 0) {
      const { data, error } = await supabase
        .from('project_action_items')
        .insert(actionItems)
        .select()
      
      if (error) throw error
      
      return data
    }
    
    return []
  } catch (error) {
    console.error('Error generating action items:', error)
    throw error
  }
}
