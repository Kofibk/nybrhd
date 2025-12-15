import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { campaigns, leads, chatMessage, chatHistory, analysisContext, analysisType } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // If this is a chat request, handle it differently
    if (chatMessage) {
      // Check if this is a lead-related query
      const isLeadQuery = /lead|hottest|top\s*\d+|priorit|score|contact|call|email|whatsapp/i.test(chatMessage);
      
      const chatSystemPrompt = `You are an expert marketing data analyst and assistant for property marketing campaigns.
You have access to the user's campaign and lead data. You can answer questions, provide insights, and help with actions.

Data context:
- ${campaigns?.length || 0} campaigns loaded
- ${leads?.length || 0} leads loaded
${analysisContext ? `\nPrevious analysis summary: ${analysisContext}` : ''}

${campaigns?.length > 0 ? `FULL Campaign data:\n${JSON.stringify(campaigns, null, 2)}` : ''}

${leads?.length > 0 ? `FULL Lead data:\n${JSON.stringify(leads, null, 2)}` : ''}

You can help with:
- Finding specific leads (e.g., "top 5 hottest leads", "leads above 80 score", "leads from London")
- Campaign analysis (e.g., "which campaign has highest CPL", "what's working")
- Actionable recommendations (e.g., "who should I call first", "prioritise leads for today")
- Data queries (e.g., "show all leads with budget over £500k", "count leads by status")

IMPORTANT: When the user asks about leads (top leads, hottest leads, leads to contact, etc.), you MUST respond with a JSON object in this exact format:
{
  "message": "Your natural language response explaining the leads",
  "leads": [
    {"name": "Lead Name", "email": "email@example.com", "phone": "+44123456789", "score": 85}
  ]
}

The leads array should contain the actual lead data from the CSV including name, email, phone, and score (if available).
Look for fields like: name, full_name, first_name+last_name, email, phone, mobile, telephone, score, lead_score, quality_score, intent_score.

For non-lead queries, just respond with plain text - no JSON needed.`;

      const messages = [
        { role: 'system', content: chatSystemPrompt },
        ...(chatHistory || []).map((msg: { role: string; content: string }) => ({
          role: msg.role,
          content: msg.content
        })),
        { role: 'user', content: chatMessage }
      ];

      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('AI gateway error:', response.status, errorText);
        throw new Error(`AI gateway error: ${response.status}`);
      }

      const aiResponse = await response.json();
      const rawContent = aiResponse.choices?.[0]?.message?.content || 'I apologise, I could not generate a response.';

      // Try to parse as JSON if it's a lead query
      let chatResponse = rawContent;
      let extractedLeads: any[] = [];

      try {
        const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.message && Array.isArray(parsed.leads)) {
            chatResponse = parsed.message;
            extractedLeads = parsed.leads.map((lead: any) => ({
              name: lead.name || lead.full_name || `${lead.first_name || ''} ${lead.last_name || ''}`.trim() || 'Unknown',
              email: lead.email || null,
              phone: lead.phone || lead.mobile || lead.telephone || null,
              score: lead.score || lead.lead_score || lead.quality_score || lead.intent_score || null
            }));
          }
        }
      } catch (e) {
        // Not JSON, use raw content as response
        console.log('Response is plain text, not JSON');
      }

      return new Response(JSON.stringify({ chatResponse, leads: extractedLeads }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Original analysis logic
    const systemPrompt = `You are a marketing data analyst specializing in property marketing campaigns. 
Analyze the provided campaign and lead data to identify issues, opportunities, and actionable insights.

You MUST respond with valid JSON matching this exact structure:
{
  "issues": [
    {"title": "string", "description": "string", "impact": "string (e.g., 'High Impact', 'Medium Impact')"}
  ],
  "opportunities": [
    {"title": "string", "description": "string", "potential": "string (e.g., '+20% leads', '£500 savings')"}
  ],
  "leadDistribution": {
    "hot": number,
    "quality": number,
    "valid": number,
    "disqualified": number
  },
  "savingsIdentified": number,
  "nextActions": [
    {"action": "string", "priority": "high" | "medium" | "low"}
  ],
  "summary": "string (2-3 sentence overview)"
}

Analyze campaigns for: high CPL, low CTR, budget issues, targeting problems.
Analyze leads for: quality distribution, spam detection, conversion potential.
Be specific with numbers and actionable recommendations.`;

    const userPrompt = `Analyze this marketing data:

CAMPAIGNS (${campaigns.length} total):
${JSON.stringify(campaigns.slice(0, 50), null, 2)}

LEADS (${leads.length} total):
${JSON.stringify(leads.slice(0, 100), null, 2)}

Provide detailed analysis with specific issues, opportunities, lead distribution, and next actions.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No response from AI');
    }

    // Extract JSON from response - improved parsing
    let analysis;
    try {
      // Try to find and parse JSON from the response
      let jsonContent = content;
      
      // Remove markdown code blocks if present
      const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (codeBlockMatch) {
        jsonContent = codeBlockMatch[1].trim();
      }
      
      // Find JSON object
      const jsonMatch = jsonContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        // Clean up common JSON issues
        let cleanJson = jsonMatch[0]
          .replace(/[\u0000-\u001F\u007F-\u009F]/g, ' ') // Remove control characters
          .replace(/\n\s*\n/g, '\n') // Remove double newlines
          .replace(/,\s*([}\]])/g, '$1'); // Remove trailing commas
        
        analysis = JSON.parse(cleanJson);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Parse error:', parseError, 'Content:', content.substring(0, 500));
      // Return fallback analysis
      analysis = {
        issues: [{ title: 'Analysis Completed', description: 'Data was processed but structured response had formatting issues', impact: 'Low Impact' }],
        opportunities: [{ title: 'Data Insights Available', description: 'Your data has been reviewed. Try asking questions in the chat for specific insights.', potential: 'High' }],
        leadDistribution: { hot: Math.floor(leads.length * 0.1), quality: Math.floor(leads.length * 0.2), valid: Math.floor(leads.length * 0.5), disqualified: Math.floor(leads.length * 0.2) },
        savingsIdentified: 0,
        nextActions: [{ action: 'Use the AI chat to ask specific questions about your data', priority: 'medium' }],
        summary: `Processed ${campaigns.length} campaigns and ${leads.length} leads. Use the chat below to explore insights.`
      };
    }

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Analysis error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
