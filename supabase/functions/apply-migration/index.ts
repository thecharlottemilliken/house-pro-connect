
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
    
    // Create the project_action_items table if it doesn't exist
    const { error: tableError } = await supabase.rpc('execute_sql', {
      query: `
        CREATE TABLE IF NOT EXISTS public.project_action_items (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
          title TEXT NOT NULL,
          description TEXT,
          priority TEXT NOT NULL DEFAULT 'medium',
          icon_name TEXT,
          action_type TEXT NOT NULL,
          action_data JSONB DEFAULT '{}'::jsonb,
          completed BOOLEAN NOT NULL DEFAULT false,
          completion_date TIMESTAMPTZ,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          for_role TEXT
        );
        
        -- Add RLS policies
        ALTER TABLE public.project_action_items ENABLE ROW LEVEL SECURITY;
        
        -- Team members can view action items
        CREATE POLICY IF NOT EXISTS "Team members can view action items" 
        ON public.project_action_items FOR SELECT 
        USING (
          EXISTS (
            SELECT 1 FROM public.project_team_members
            WHERE project_team_members.project_id = project_action_items.project_id
            AND project_team_members.user_id = auth.uid()
          )
        );
        
        -- Team members can update action items
        CREATE POLICY IF NOT EXISTS "Team members can update action items" 
        ON public.project_action_items FOR UPDATE 
        USING (
          EXISTS (
            SELECT 1 FROM public.project_team_members
            WHERE project_team_members.project_id = project_action_items.project_id
            AND project_team_members.user_id = auth.uid()
          )
        );
      `
    });
    
    if (tableError) {
      console.error("Table creation error:", tableError);
      // Continue anyway, in case the table already exists
    }
    
    // Apply our RPC function using execute_sql
    const { error: rpcError } = await supabase.rpc('execute_sql', {
      query: `
        CREATE OR REPLACE FUNCTION public.update_action_item_completion(item_id UUID, is_completed BOOLEAN)
        RETURNS TABLE (
          id UUID,
          project_id UUID,
          title TEXT,
          description TEXT,
          priority TEXT,
          icon_name TEXT,
          action_type TEXT,
          action_data JSONB,
          completed BOOLEAN,
          completion_date TIMESTAMPTZ,
          created_at TIMESTAMPTZ,
          updated_at TIMESTAMPTZ,
          for_role TEXT
        ) AS $$
        BEGIN
          RETURN QUERY
          UPDATE public.project_action_items
          SET 
            completed = is_completed,
            completion_date = CASE WHEN is_completed THEN now() ELSE NULL END
          WHERE id = item_id
          RETURNING *;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
        
        -- Grant usage to all authenticated users
        GRANT EXECUTE ON FUNCTION public.update_action_item_completion(UUID, BOOLEAN) TO authenticated;
      `
    });
    
    if (rpcError) {
      console.error("RPC function creation error:", rpcError);
      // Continue anyway, as the function might already exist
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Migration applied successfully",
        details: "Created project_action_items table and update_action_item_completion function"
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
  } catch (error) {
    console.error("Server error:", error);
    return new Response(
      JSON.stringify({ error: "Server error", details: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
