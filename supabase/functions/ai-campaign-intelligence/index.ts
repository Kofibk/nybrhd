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

    const { action, campaign, campaigns, metrics } = await req.json();

    let systemPrompt = '';
    let userPrompt = '';
    let model = 'openai/gpt-5';

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
        temperature: 0.4,
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
