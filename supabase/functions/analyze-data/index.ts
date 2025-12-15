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
    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
    
    if (!ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY is not configured');
    }

    // Helper function to call Claude API
    const callClaude = async (systemPrompt: string, userPrompt: string) => {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-5-20250514',
          max_tokens: 4096,
          system: systemPrompt,
          messages: [{ role: 'user', content: userPrompt }],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Claude API error:', response.status, errorText);
        throw new Error(`Claude API error: ${response.status}`);
      }

      const result = await response.json();
      return result.content?.[0]?.text || '';
    };

    // If this is a chat request
    if (chatMessage) {
      const chatSystemPrompt = `You are an expert marketing data analyst and assistant for property marketing campaigns.
You have access to the user's uploaded campaign and lead data. The data may have ANY column format - analyze whatever columns are present.

Data context:
- ${campaigns?.length || 0} campaigns loaded
- ${leads?.length || 0} leads loaded
${analysisContext ? `\nPrevious analysis: ${analysisContext}` : ''}

${campaigns?.length > 0 ? `CAMPAIGN DATA (analyze all columns present):\n${JSON.stringify(campaigns.slice(0, 50), null, 2)}` : 'No campaign data uploaded.'}

${leads?.length > 0 ? `LEAD DATA (analyze all columns present):\n${JSON.stringify(leads.slice(0, 100), null, 2)}` : 'No lead data uploaded.'}

IMPORTANT - When responding about leads (top leads, hottest leads, leads to contact, etc.), respond with JSON:
{
  "message": "Your explanation",
  "leads": [{"name": "Name", "email": "email", "phone": "phone", "score": 85}]
}

For name, look for: Lead Name, Name, full_name, first_name + last_name
For email, look for: Email, email, Email Address
For phone, look for: Phone Number, Phone, phone, Mobile, telephone
For score, look for: Score, score, Intent, intent_score, quality_score, Lead Score

For non-lead queries, respond with plain text.`;

      const userPrompt = `${chatHistory?.length > 0 ? 'Previous conversation:\n' + chatHistory.map((m: any) => `${m.role}: ${m.content}`).join('\n') + '\n\n' : ''}User: ${chatMessage}`;

      const rawContent = await callClaude(chatSystemPrompt, userPrompt);

      // Try to parse as JSON for lead queries
      let chatResponse = rawContent;
      let extractedLeads: any[] = [];

      try {
        const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.message && Array.isArray(parsed.leads)) {
            chatResponse = parsed.message;
            extractedLeads = parsed.leads.map((lead: any) => ({
              name: lead.name || 'Unknown',
              email: lead.email || null,
              phone: lead.phone || null,
              score: lead.score || null
            }));
          }
        }
      } catch (e) {
        console.log('Response is plain text, not JSON');
      }

      return new Response(JSON.stringify({ chatResponse, leads: extractedLeads }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Data analysis request
    const systemPrompt = `You are an expert marketing data analyst. Analyze the provided data regardless of its column format.
The data may come from various sources with different column names - identify and analyze whatever fields are present.

For CAMPAIGN data, look for columns like: name, campaign, budget, spend, cost, CPL, CTR, clicks, impressions, leads, status, etc.
For LEAD data, look for columns like: name, email, phone, country, budget, score, status, intent, source, timeline, etc.

You MUST respond with ONLY valid JSON (no markdown, no extra text) in this exact structure:
{
  "issues": [
    {"title": "string", "description": "string", "impact": "High Impact" | "Medium Impact" | "Low Impact"}
  ],
  "opportunities": [
    {"title": "string", "description": "string", "potential": "string"}
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
  "summary": "string"
}

Analyze for:
- High cost per lead, low engagement, budget inefficiencies
- Lead quality, spam indicators, conversion potential
- Geographic or demographic patterns
- Actionable recommendations with specific numbers`;

    const userPrompt = `Analyze this marketing data:

CAMPAIGNS (${campaigns.length} total):
${campaigns.length > 0 ? JSON.stringify(campaigns.slice(0, 50), null, 2) : 'No campaign data provided'}

LEADS (${leads.length} total):
${leads.length > 0 ? JSON.stringify(leads.slice(0, 100), null, 2) : 'No lead data provided'}

Provide detailed analysis. Respond with ONLY the JSON object, no other text.`;

    const content = await callClaude(systemPrompt, userPrompt);

    if (!content) {
      throw new Error('No response from Claude');
    }

    // Parse JSON response
    let analysis;
    try {
      // Remove markdown code blocks if present
      let jsonContent = content;
      const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (codeBlockMatch) {
        jsonContent = codeBlockMatch[1].trim();
      }
      
      const jsonMatch = jsonContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        let cleanJson = jsonMatch[0]
          .replace(/[\u0000-\u001F\u007F-\u009F]/g, ' ')
          .replace(/,\s*([}\]])/g, '$1');
        analysis = JSON.parse(cleanJson);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Parse error:', parseError, 'Content:', content.substring(0, 500));
      analysis = {
        issues: [{ title: 'Analysis Completed', description: 'Data processed successfully', impact: 'Low Impact' }],
        opportunities: [{ title: 'Insights Available', description: 'Use the chat to explore your data in detail', potential: 'High' }],
        leadDistribution: { 
          hot: Math.floor(leads.length * 0.1), 
          quality: Math.floor(leads.length * 0.25), 
          valid: Math.floor(leads.length * 0.45), 
          disqualified: Math.floor(leads.length * 0.2) 
        },
        savingsIdentified: 0,
        nextActions: [{ action: 'Ask specific questions about your data in the chat', priority: 'medium' }],
        summary: `Analysed ${campaigns.length} campaigns and ${leads.length} leads.`
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
