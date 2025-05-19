
import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.32.0";

type ProjectDataTypeSimple = {
  id: string;
  state: string;
  title: string;
  design_preferences?: any;
  construction_preferences?: any;
  management_preferences?: any;
  user_id: string;
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const body = await req.json();
    const { projectId } = body;
    
    if (!projectId) {
      return new Response(JSON.stringify({ error: 'Missing project ID in request body' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    console.log("Generating action items for project:", projectId);
    
    // Fetch project data from Supabase
    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();
    
    if (projectError || !projectData) {
      console.error("Error fetching project data:", projectError);
      return new Response(JSON.stringify({ error: `Error fetching project data: ${projectError?.message}` }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    console.log("Project data fetched:", projectData);
    
    // Check for existing action items to prevent duplicates
    const { data: existingItems, error: existingItemsError } = await supabase
      .from('project_action_items')
      .select('id, title')
      .eq('project_id', projectId);
    
    if (existingItemsError) {
      console.error("Error checking existing action items:", existingItemsError);
      return new Response(JSON.stringify({ error: `Error checking existing action items: ${existingItemsError.message}` }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    console.log("Existing action items:", existingItems);
    
    // Generate action items based on project state and preferences
    let actionItems = [];
    const existingTitles = new Set(existingItems?.map(item => item.title) || []);
    
    // SOW creation action item
    if (!existingTitles.has("Create Statement of Work (SOW)")) {
      actionItems.push({
        project_id: projectId,
        title: "Create Statement of Work (SOW)",
        description: "Define the work to be done, materials needed, and estimated costs.",
        priority: "high",
        icon_name: "file-plus",
        action_type: "sow",
        action_data: { route: `/project-sow/${projectId}` },
        for_role: "coach", // Only for coaches
        completed: false
      });
    }
    
    // Add action item for uploading blueprint if not already done
    const hasBlueprint = projectData?.design_preferences?.blueprintUrl || 
                        (projectData?.design_preferences?.designAssets || []).some(asset => 
                          asset.tags?.includes("Blueprint"));
    
    if (!hasBlueprint && !existingTitles.has("Upload Room Blueprints")) {
      actionItems.push({
        project_id: projectId,
        title: "Upload Room Blueprints",
        description: "Upload your floor plans to help designers visualize the space.",
        priority: "medium",
        icon_name: "file-text",
        action_type: "navigate",
        action_data: { route: `/project-design/${projectId}` },
        completed: false
      });
    }
    
    // Add action item for adding photos if not already done
    const hasBeforePhotos = projectData?.design_preferences?.beforePhotos && 
                          Object.keys(projectData.design_preferences.beforePhotos).length > 0;
    
    if (!hasBeforePhotos && !existingTitles.has("Add Room Photos")) {
      actionItems.push({
        project_id: projectId,
        title: "Add Room Photos",
        description: "Upload photos of your current space to show designers what you're working with.",
        priority: "high",
        icon_name: "camera",
        action_type: "navigate",
        action_data: { route: `/project-design/${projectId}` },
        completed: false
      });
    }
    
    // Add action item for room measurements if not already done
    const hasRoomMeasurements = projectData?.design_preferences?.roomMeasurements && 
                              Object.keys(projectData.design_preferences.roomMeasurements).length > 0;
    
    if (!hasRoomMeasurements && !existingTitles.has("Add Room Measurements")) {
      actionItems.push({
        project_id: projectId,
        title: "Add Room Measurements",
        description: "Provide accurate measurements of your space for proper design planning.",
        priority: "medium",
        icon_name: "ruler",
        action_type: "navigate",
        action_data: { route: `/project-design/${projectId}` },
        completed: false
      });
    }
    
    // Add action item for design preferences if not already done
    const hasInspirationImages = projectData?.design_preferences?.inspirationImages && 
                               projectData.design_preferences.inspirationImages.length > 0;
    
    if (!hasInspirationImages && !existingTitles.has("Add Design Inspirations")) {
      actionItems.push({
        project_id: projectId,
        title: "Add Design Inspirations",
        description: "Share design ideas or Pinterest boards that inspire your vision.",
        priority: "low",
        icon_name: "pen-box",
        action_type: "navigate",
        action_data: { route: `/project-design/${projectId}` },
        completed: false
      });
    }
    
    // Filter out any action items that already exist to prevent duplicates
    const newActionItems = actionItems.filter(item => !existingTitles.has(item.title));
    
    if (newActionItems.length === 0) {
      console.log("No new action items to create");
      return new Response(JSON.stringify({ message: "No new action items to create" }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Insert new action items
    const { data: insertedItems, error: insertError } = await supabase
      .from('project_action_items')
      .insert(newActionItems)
      .select();
    
    if (insertError) {
      console.error("Error inserting action items:", insertError);
      return new Response(JSON.stringify({ error: `Error inserting action items: ${insertError.message}` }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    console.log(`Successfully created ${insertedItems?.length} action items`);
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: `Created ${insertedItems?.length} action items`,
      items: insertedItems 
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(JSON.stringify({ error: `Unexpected error: ${error.message}` }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
