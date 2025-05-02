
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get authentication details
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract the token from Bearer token
    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized", details: userError }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if the authenticated user is a coach
    const { data: profileData, error: profileError } = await supabaseClient
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || !profileData || profileData.role !== "coach") {
      return new Response(
        JSON.stringify({ error: "Only coaches can send meeting confirmations" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get request body
    const { 
      projectId, 
      projectTitle, 
      ownerEmail, 
      ownerName, 
      meetingDate, 
      meetingTime 
    } = await req.json();

    // Get coach information
    const { data: coachData, error: coachError } = await supabaseClient
      .from("profiles")
      .select("name, email")
      .eq("id", user.id)
      .single();

    if (coachError || !coachData) {
      return new Response(
        JSON.stringify({ error: "Could not retrieve coach details" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Format email content
    const emailSubject = `Meeting Scheduled: ${projectTitle} Project Discussion`;
    const emailContent = `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2b6cb0;">Project Meeting Confirmation</h2>
            <p>Hello ${ownerName},</p>
            
            <p>Your project coach <strong>${coachData.name}</strong> has scheduled a meeting to discuss your project: <strong>${projectTitle}</strong>.</p>
            
            <div style="background-color: #ebf5ff; border-left: 4px solid #3182ce; padding: 15px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #2b6cb0;">Meeting Details</h3>
              <p><strong>Date:</strong> ${meetingDate}</p>
              <p><strong>Time:</strong> ${meetingTime} EST</p>
              <p><strong>Project:</strong> ${projectTitle}</p>
            </div>
            
            <p>Please ensure you're available at this time. Your coach will provide meeting access details prior to the scheduled time.</p>
            
            <p>If you need to reschedule, please respond to this email or contact your coach directly.</p>
            
            <p style="margin-top: 30px;">Regards,<br>The Project Management Team</p>
          </div>
        </body>
      </html>
    `;

    // Call Supabase Edge Function to send email
    // Note: In a real implementation, you would use an email service like SendGrid, Resend, etc.
    console.log(`Sending meeting confirmation email to ${ownerEmail} for project ${projectId}`);
    
    // For demonstration, we're just logging the email we would send
    // In a real implementation, you would uncomment and use this code to send the email
    /*
    const { data: emailData, error: emailError } = await supabaseClient.functions.invoke(
      "send-email", 
      {
        body: {
          to: ownerEmail,
          subject: emailSubject,
          html: emailContent,
          from: "noreply@yourcompany.com"
        }
      }
    );
    
    if (emailError) {
      console.error("Error sending email:", emailError);
      return new Response(
        JSON.stringify({ error: "Failed to send email", details: emailError }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    */

    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Meeting confirmation email would be sent in production" 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Error in send-meeting-confirmation function:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
