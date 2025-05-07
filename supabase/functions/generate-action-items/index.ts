
// This edge function will generate action items for a project
// It can be called manually or by a cron job

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  
  try {
    // Get project ID from request
    const { projectId } = await req.json();
    
    if (!projectId) {
      return new Response(
        JSON.stringify({ error: "Project ID is required" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400 
        }
      );
    }
    
    // Create Supabase client using Admin key to bypass RLS
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500 
        }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get project data
    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .select('*, design_preferences')
      .eq('id', projectId)
      .single();
      
    if (projectError || !projectData) {
      return new Response(
        JSON.stringify({ error: "Project not found", details: projectError }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 404 
        }
      );
    }
    
    // Get SOW data
    const { data: sowData, error: sowError } = await supabase
      .from('statement_of_work')
      .select('*')
      .eq('project_id', projectId)
      .maybeSingle();
      
    // Find coaches
    const { data: coaches } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'coach');
      
    const coachIds = coaches ? coaches.map(coach => coach.id) : [];
    
    // Delete existing action items
    await supabase
      .from('project_action_items')
      .delete()
      .eq('project_id', projectId)
      .eq('completed', false);
    
    const actionItems = [];
    
    // SOW actions for coaches
    if (coachIds.length > 0) {
      if (!sowData) {
        // No SOW exists, create action
        actionItems.push({
          project_id: projectId,
          title: "Create Statement of Work",
          description: "Draft a Statement of Work for this project",
          priority: "high",
          icon_name: "file-plus",
          action_type: "sow",
          action_data: { route: `/project-sow/${projectId}` },
          for_role: "coach"
        });
      } else if (sowData.status === "draft") {
        // SOW in draft, create action to finish it
        actionItems.push({
          project_id: projectId,
          title: "Finish completing the SOW",
          description: "Complete the Statement of Work for this project",
          priority: "high",
          icon_name: "file-pen",
          action_type: "sow",
          action_data: { route: `/project-sow/${projectId}` },
          for_role: "coach"
        });
      }
    }
    
    // Design-related action items for owner
    const designPrefs = projectData.design_preferences || {};
    
    if (!designPrefs.beforePhotos || 
        Object.keys(designPrefs.beforePhotos || {}).length === 0) {
      actionItems.push({
        project_id: projectId,
        title: "Upload Before Photos",
        description: "Add photos of your current space",
        priority: "medium",
        icon_name: "camera",
        action_type: "navigate",
        action_data: { route: `/project-design/${projectId}` },
        for_role: "owner"
      });
    }
    
    if (!designPrefs.roomMeasurements || 
        Object.keys(designPrefs.roomMeasurements || {}).length === 0) {
      actionItems.push({
        project_id: projectId,
        title: "Add Room Measurements",
        description: "Provide accurate measurements for design planning",
        priority: "medium",
        icon_name: "ruler",
        action_type: "navigate",
        action_data: { route: `/project-design/${projectId}` },
        for_role: "owner"
      });
    }
    
    // Insert new action items
    if (actionItems.length > 0) {
      const { data: insertedItems, error: insertError } = await supabase
        .from('project_action_items')
        .insert(actionItems)
        .select();
        
      if (insertError) {
        return new Response(
          JSON.stringify({ error: "Failed to insert action items", details: insertError }),
          { 
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500 
          }
        );
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Generated ${insertedItems.length} action items`,
          items: insertedItems
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200 
        }
      );
    } else {
      return new Response(
        JSON.stringify({ success: true, message: "No action items needed" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200 
        }
      );
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Server error", details: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
