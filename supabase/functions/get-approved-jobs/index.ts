
import { serve } from 'https://deno.land/std@0.131.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

serve(async (req) => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const client = createClient(supabaseUrl, supabaseKey);

  // Pull all SOWs with status "approved"
  const { data: sows, error } = await client
    .from('statement_of_work')
    .select(`
      id,
      status,
      work_areas,
      labor_items,
      material_items,
      bid_configuration,
      project_id,
      approved_at:updated_at
    `)
    .eq('status', 'approved');

  if (error) {
    return new Response(JSON.stringify({ error: 'Could not fetch SOWs', detail: error.message }), { status: 500 });
  }

  // Fetch projects and properties for each SOW
  const jobs = [];
  for (const sow of sows ?? []) {
    // Get project
    const { data: project, error: projError } = await client
      .from('projects')
      .select('id, title, property_id')
      .eq('id', sow.project_id)
      .maybeSingle();

    if (!project) continue;

    // Get property
    const { data: property, error: propError } = await client
      .from('properties')
      .select('id, home_photos, image_url')
      .eq('id', project.property_id)
      .maybeSingle();

    jobs.push({
      id: sow.id,
      status: sow.status,
      work_areas: typeof sow.work_areas === 'string' ? JSON.parse(sow.work_areas) : sow.work_areas,
      labor_items: typeof sow.labor_items === 'string' ? JSON.parse(sow.labor_items) : sow.labor_items,
      material_items: typeof sow.material_items === 'string' ? JSON.parse(sow.material_items) : sow.material_items,
      bid_configuration: typeof sow.bid_configuration === 'string'
        ? JSON.parse(sow.bid_configuration)
        : sow.bid_configuration,
      approved_at: sow.approved_at,
      project: {
        id: project.id,
        title: project.title,
      },
      property: {
        id: property?.id,
        image: property?.home_photos?.[0] ?? property?.image_url ?? null,
      }
    });
  }

  return new Response(JSON.stringify({ jobs }), { headers: { 'Content-Type': 'application/json' }});
});
