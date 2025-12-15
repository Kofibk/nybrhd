import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are Naybourhood's property marketing analyst. Analyse Meta ad campaigns for property buyer lead generation.

CPL BENCHMARKS:
- Excellent: Under £20
- Good: £20-35
- Acceptable: £35-50
- Poor: Above £50

PLATFORM BENCHMARKS:
- Facebook target CPL: Under £30
- Instagram target CPL: Under £40
- Messenger: Low volume, retargeting only
- Audience Network: ALWAYS EXCLUDE - all leads are spam/fake

ENGAGEMENT BENCHMARKS:
- CTR target: Above 1% (below 0.5% = creative/targeting problem)
- Click-to-Lead Rate target: Above 2%
- Landing Page View Rate: Above 50% of clicks

TOP PERFORMING CAMPAIGN REFERENCES:
- Lucan Leads: £13.73 CPL (excellent)
- Haydon Leads: £17.29 CPL (excellent)
- One Clapham UK & Intl: £20.54 CPL at scale (good)
- North Kensington Gate UK: £28.02 CPL (good)

RETURN JSON ONLY (no markdown, no explanation):
{
  "summary": "2-3 sentence executive summary",
  "campaign_health": "excellent" | "good" | "needs_attention" | "poor",
  "metrics": {
    "total_spend": number,
    "total_leads": number,
    "cpl": number,
    "cpl_rating": "excellent" | "good" | "acceptable" | "poor",
    "ctr": number,
    "ctr_rating": "good" | "needs_improvement",
    "click_to_lead_rate": number,
    "cost_per_qualified_lead": number
  },
  "platform_breakdown": [
    {
      "platform": string,
      "spend": number,
      "leads": number,
      "cpl": number,
      "performance": "above_benchmark" | "at_benchmark" | "below_benchmark"
    }
  ],
  "lead_quality_summary": {
    "total_leads": number,
    "qualified_leads": number,
    "qualified_rate": number,
    "hot_leads": number,
    "warm_leads": number,
    "cold_leads": number
  },
  "top_performing_elements": [
    {
      "element": "ad_set" | "creative" | "audience" | "placement",
      "name": string,
      "cpl": number,
      "why_working": string
    }
  ],
  "underperforming_elements": [
    {
      "element": string,
      "name": string,
      "cpl": number,
      "issue": string,
      "recommendation": string
    }
  ],
  "recommendations": [
    {
      "priority": number,
      "type": "targeting" | "creative" | "budget" | "landing_page" | "placement",
      "action": string,
      "rationale": string,
      "expected_impact": string
    }
  ],
  "budget_recommendation": {
    "current_daily": number,
    "recommended_daily": number,
    "reasoning": string
  },
  "warnings": [
    {
      "severity": "high" | "medium",
      "issue": string,
      "action": string
    }
  ],
  "excluded_data": {
    "audience_network_leads": number,
    "audience_network_spend": number,
    "reason": "Historically spam/fake leads - excluded from all calculations"
  }
}

IMPORTANT RULES:
- Always exclude Audience Network from all calculations
- Compare every CPL against benchmarks
- Flag CTR below 0.5% as a creative/targeting problem
- Recommend budget shifts from poor performers to excellent performers
- Be specific with recommendations - name exact actions to take`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { campaign } = await req.json();
    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');

    if (!ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY is not configured');
    }

    const userPrompt = `Analyse this campaign data and return JSON only:\n\n${JSON.stringify(campaign, null, 2)}`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userPrompt }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Claude API error:', response.status, errorText);
      throw new Error(`Claude API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.content[0]?.text || '';

    let result;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('JSON parse error:', parseError, 'Content:', content);
      throw new Error('Failed to parse analysis response');
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Campaign analysis error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
