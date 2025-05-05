
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get project data from request
    const { 
      renovationAreas,
      projectPreferences,
      constructionPreferences,
      designPreferences,
      managementPreferences,
      priorExperience,
      designFiles
    } = await req.json();

    // Format project data for AI input
    const areasText = renovationAreas && renovationAreas.length > 0 
      ? renovationAreas.map((area: any) => `${area.area} (${area.location})`).join(', ')
      : 'No specific areas selected';

    // Create description of design files if they exist
    let designFilesText = 'No design files uploaded';
    if (designPreferences?.designFiles && designPreferences.designFiles.length > 0) {
      designFilesText = `Design files uploaded (${designPreferences.designFiles.length} files): ${
        designPreferences.designFiles.map((file: any) => file.name).join(', ')
      }`;
    }

    // Format prior experience
    let experienceText = 'No prior renovation experience';
    if (priorExperience?.hasPriorExperience === 'yes') {
      experienceText = 'Has prior renovation experience';
      if (priorExperience.likes) {
        experienceText += `\nLiked aspects: ${priorExperience.likes}`;
      }
      if (priorExperience.dislikes) {
        experienceText += `\nDisliked aspects: ${priorExperience.dislikes}`;
      }
    }

    // Format project timeline and budget
    let timelineText = '';
    if (projectPreferences?.completionDate) {
      const completionMap: Record<string, string> = {
        '2weeks': 'within 2 weeks',
        '1month': 'within 1 month',
        '3months': 'within 3 months',
        '6months': 'within 6 months',
        '1year': 'within 1 year',
        'over1year': 'more than 1 year from now'
      };
      timelineText = `Plans to complete ${completionMap[projectPreferences.completionDate] || projectPreferences.completionDate}`;
    }

    let budgetText = '';
    if (projectPreferences?.budget) {
      budgetText = `Budget: $${projectPreferences.budget}`;
      if (projectPreferences.useFinancing) {
        budgetText += ' (plans to use financing)';
      }
    }

    let eventText = '';
    if (projectPreferences?.isLifeEventDependent && projectPreferences.eventName) {
      eventText = `Renovation timing is dependent on life event: ${projectPreferences.eventName}`;
      if (projectPreferences.eventDate) {
        eventText += ` (${projectPreferences.eventDate})`;
      }
    }

    // Format data about professionals involved
    let prosText = 'No specific professionals identified';
    if (constructionPreferences?.hasSpecificPros && constructionPreferences.pros?.length > 0) {
      prosText = `Working with ${constructionPreferences.pros.length} professional(s): ${
        constructionPreferences.pros.map((pro: any) => 
          `${pro.businessName || pro.contactName} (${pro.speciality})`
        ).join(', ')
      }`;
    }

    // Format help level needed
    let helpLevelText = '';
    if (constructionPreferences?.helpLevel) {
      const helpLevelMap: Record<string, string> = {
        'low': 'minimal assistance',
        'medium': 'moderate assistance',
        'high': 'significant assistance'
      };
      helpLevelText = `Needs ${helpLevelMap[constructionPreferences.helpLevel] || constructionPreferences.helpLevel} with the project`;
    }

    // Format coaching preference
    let coachingText = '';
    if (managementPreferences?.wantProjectCoach) {
      coachingText = managementPreferences.wantProjectCoach === 'yes' 
        ? 'Wants to work with a project coach' 
        : 'Does not want to work with a project coach';
    }

    // Format designers info
    let designersText = 'No specific designers identified';
    if (designPreferences?.designerContactInfo && designPreferences.designerContactInfo.length > 0) {
      designersText = `Working with ${designPreferences.designerContactInfo.length} designer(s): ${
        designPreferences.designerContactInfo.map((designer: any) => 
          `${designer.businessName || designer.contactName} (${designer.assignedArea === 'all_rooms' ? 'all areas' : designer.assignedArea})`
        ).join(', ')
      }`;
    }

    // Prepare prompt with formatted project information
    const prompt = `
You are an AI assistant that helps create project titles and descriptions for home renovation projects. Based on the information below, create a concise but descriptive project title and a detailed project description.

Here's what we know about the project:

- Renovation Areas: ${areasText}
- Timeline: ${timelineText}
- Budget: ${budgetText}
- Event Dependency: ${eventText}
- Professional Assistance: ${prosText}
- Assistance Level Needed: ${helpLevelText}
- Designers: ${designersText}
- Design Files: ${designFilesText}
- Project Coach: ${coachingText}
- Prior Experience: ${experienceText}

Provide a response in the following JSON format:
{
  "title": "A concise, descriptive project title (max 5-7 words)",
  "description": "A detailed, 2-4 sentence description of the renovation project that captures the essence of what the owner wants to accomplish"
}

The title should be concise but descriptive. The description should sound professional and capture all key aspects of the project in 2-4 sentences.
`;

    console.log("Sending prompt to OpenAI:", prompt);

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Using the more efficient mini model
        messages: [
          { role: 'system', content: 'You are a professional home renovation project planner.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", errorText);
      throw new Error(`OpenAI API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const aiContent = data.choices[0].message.content;
    
    // Parse the JSON response from OpenAI
    let parsedContent;
    try {
      // The response might be a JSON string or might already include markdown code blocks
      // Try to parse it directly first
      parsedContent = JSON.parse(aiContent.replace(/```json|```/g, '').trim());
    } catch (error) {
      console.error("Error parsing OpenAI response:", error);
      console.log("Raw response:", aiContent);
      throw new Error("Could not parse OpenAI response");
    }

    console.log("Generated content:", parsedContent);

    return new Response(JSON.stringify(parsedContent), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-project-summary function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
