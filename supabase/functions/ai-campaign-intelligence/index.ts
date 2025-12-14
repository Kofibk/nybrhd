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
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const body = await req.json();
    const { action, type, campaign, campaigns, metrics, fileContent, fileName, fileType } = body;

    // Handle bulk file analysis for campaign imports
    if (type === 'bulk_analysis' || action === 'parse_campaigns') {
      console.log('Processing campaign file upload:', fileName, fileType);
      
      const systemPrompt = `You are a campaign data extraction expert. Parse the provided file content and extract campaign information.

For CSV/Excel content, parse the rows and identify columns for: campaign name, client, status, budget, spent, leads, CPL, start date, etc.
For PDF content, analyze the text and extract any campaign performance data found.

IMPORTANT: Return ONLY valid JSON in exactly this format:
{
  "success": true,
  "campaigns": [
    {
      "name": "Campaign Name",
      "client": "Client Company Name",
      "clientType": "developer" | "agent" | "broker",
      "status": "live" | "paused" | "draft" | "completed",
      "budget": 5000,
      "spent": 3200,
      "leads": 87,
      "cpl": 36.78,
      "startDate": "2024-01-15"
    }
  ],
  "summary": "Extracted X campaigns from the file",
  "insights": ["Key insight 1", "Key insight 2"],
  "recordsFound": 5
}

Guidelines:
- Budget and spent should be numbers (no currency symbols)
- CPL (Cost Per Lead) = spent / leads if not provided
- Status defaults to "live" if not specified
- ClientType should be inferred from client name or context
- Dates should be in YYYY-MM-DD format
- If any field is missing, use reasonable defaults`;

      const userPrompt = `Parse this ${fileType?.toUpperCase() || 'file'} content and extract all campaign data:

File name: ${fileName}
Content:
${fileContent}`;

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
        console.error('AI Gateway error:', response.status, errorText);
        throw new Error(`AI Gateway error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      console.log('AI Response:', content?.substring(0, 500));

      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('Failed to find JSON in response:', content);
        throw new Error('Failed to parse AI response - no JSON found');
      }

      const result = JSON.parse(jsonMatch[0]);
      
      // Ensure campaigns have required fields
      if (result.campaigns && Array.isArray(result.campaigns)) {
        result.campaigns = result.campaigns.map((campaign: any, index: number) => ({
          id: `imported_${Date.now()}_${index}`,
          name: campaign.name || 'Unnamed Campaign',
          client: campaign.client || 'Unknown Client',
          clientType: campaign.clientType || 'developer',
          status: campaign.status || 'live',
          budget: Number(campaign.budget) || 0,
          spent: Number(campaign.spent) || 0,
          leads: Number(campaign.leads) || 0,
          cpl: Number(campaign.cpl) || (campaign.leads > 0 ? campaign.spent / campaign.leads : 0),
          startDate: campaign.startDate || new Date().toISOString().split('T')[0],
        }));
      }

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Original campaign intelligence actions
    let systemPrompt = '';
    let userPrompt = '';
    let model = 'google/gemini-2.5-flash';

    switch (action) {
      case 'recommendations':
        systemPrompt = `You are a Meta advertising expert for property marketing. Analyze campaign data and provide actionable recommendations.

Respond with valid JSON only:
{
  "overallHealth": "excellent" | "good" | "needs_attention" | "critical",
  "recommendations": [
    {
      "priority": "high" | "medium" | "low",
      "category": "budget" | "targeting" | "creative" | "timing" | "audience",
      "title": "string",
      "description": "string",
      "expectedImpact": "string",
      "action": "string"
    }
  ],
  "budgetSuggestion": {
    "current": number,
    "recommended": number,
    "reasoning": "string"
  },
  "audienceInsights": string[],
  "creativeInsights": string[]
}`;
        userPrompt = `Analyze this campaign and provide recommendations: ${JSON.stringify({ campaign, metrics })}`;
        break;

      case 'performance_summary':
        systemPrompt = `You are a campaign analyst. Provide a plain-language performance summary.

Respond with valid JSON only:
{
  "summary": "string (2-3 sentences)",
  "whatsWorking": string[],
  "needsAttention": string[],
  "keyMetrics": {
    "leadQuality": "excellent" | "good" | "average" | "poor",
    "costEfficiency": "excellent" | "good" | "average" | "poor",
    "engagement": "excellent" | "good" | "average" | "poor"
  },
  "nextSteps": string[]
}`;
        userPrompt = `Summarize performance: ${JSON.stringify({ campaign, metrics })}`;
        break;

      case 'attribution_analysis':
        systemPrompt = `You are an attribution analyst. Compare Meta-reported metrics vs actual performance and identify discrepancies.

Respond with valid JSON only:
{
  "insights": [
    {
      "finding": "string",
      "metaReported": "string",
      "actualPerformance": "string",
      "recommendation": "string",
      "budgetImpact": "string"
    }
  ],
  "deviceBreakdown": {
    "mobile": { "leads": number, "conversionRate": number },
    "desktop": { "leads": number, "conversionRate": number }
  },
  "creativePerformance": [
    { "creativeId": "string", "leads": number, "dealRate": number }
  ],
  "actionableRecommendations": string[]
}`;
        userPrompt = `Analyze attribution: ${JSON.stringify({ campaigns, metrics })}`;
        break;

      case 'budget_optimization':
        systemPrompt = `You are a budget optimization expert for property marketing campaigns.

Respond with valid JSON only:
{
  "recommendedBudget": number,
  "recommendedDailyCap": number,
  "budgetReasoning": "string",
  "expectedCPLMin": number,
  "expectedCPLMax": number,
  "regionAllocations": [
    { "region": "string", "percentage": number, "reason": "string" }
  ],
  "optimizationTips": string[],
  "confidence": number
}`;
        userPrompt = `Optimize budget for: ${JSON.stringify(campaign)}`;
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    const jsonMatch = content.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Failed to parse AI response');
    }

    const result = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ai-campaign-intelligence:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
