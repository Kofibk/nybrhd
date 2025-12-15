import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are Naybourhood's lead qualification analyst. Score and classify property buyer leads.

LEAD QUALITY SCORE (0-100):
Financial Qualification (0-35 points):
- Budget within 10% of property price: +20
- Budget 20%+ under property price: -10
- Cash buyer: +15
- Mortgage: +10
- Proof of funds provided: +10

Property Match (0-25 points):
- Bedroom requirement matches availability: +15
- Has preferred development: +5
- Preferred area matches development location: +5

Buyer Credentials (0-25 points):
- LinkedIn or company website verified: +10
- Has UK mortgage broker: +5
- Has UK solicitor: +5
- Previous UK property buyer: +5

Operational Fit (0-15 points):
- Source of funds is UK: +5
- Country is UK or EMEA: +5
- Reason for purchase is investment: +5

Penalties (up to -30 points):
- Missing budget: -10
- No property/development interest: -15
- No LinkedIn or company website: -5
- 2+ no-shows: -10

INTENT SCORE (0-100):
Timeline & Commitment (0-40 points):
- Timeline 0-3 months: +25
- Timeline 3-6 months: +15
- Timeline 6-9 months: +5
- Timeline not sure: -10
- Viewing booked: +15
- Actively buying: +10

Form Completion (0-20 points):
- 90-100% complete: +20
- 70-89% complete: +10
- 50-69% complete: +5

Responsiveness (0-40 points):
- WhatsApp response under 24 hours: +15
- WhatsApp response 24-48 hours: +10
- WhatsApp response 48+ hours: +5
- No response 7+ days: -10
- Opened links/materials: +10
- Last contact under 7 days: +10
- Last contact 14-21 days: -10
- Last contact 21+ days: -15

CLASSIFICATIONS:
🔥 Hot Lead: Quality 80+ AND Intent 80+ → SLA: 1 hour
⭐ High Quality, Medium Intent: Quality 80+ AND Intent 60-79 → SLA: 4 hours
⚡ Medium Quality, High Intent: Quality 60-79 AND Intent 80+ → SLA: 2 hours
✓ Warm Lead: Quality 60-79 AND Intent 60-79 → SLA: 24 hours
💤 High Quality, Low Intent: Quality 80+ AND Intent <60 → SLA: 1 week
⚠️ Low Quality, High Intent: Quality <60 AND Intent 80+ → SLA: 24 hours (potential timewaster)
❌ Cold Lead: Quality <60 AND Intent <60 → Automated nurture only

SOURCE EXPECTATIONS:
- Meta Campaign: Initial Quality 45-60, Intent 40-60
- Rightmove/Zoopla: Initial Quality 20-35, Intent 10-25
- Agent Referral: Initial Quality 30-50, Intent 20-50
- JLL/Knight Frank: Initial Quality 30-60, Intent 15-40
- CRM Import: Initial Quality 15-40, Intent 5-30

RETURN JSON ONLY (no markdown, no explanation):
{
  "lead_id": string,
  "quality_score": number,
  "quality_breakdown": {
    "financial": number,
    "property_match": number,
    "credentials": number,
    "operational_fit": number,
    "penalties": number
  },
  "intent_score": number,
  "intent_breakdown": {
    "timeline_commitment": number,
    "form_completion": number,
    "responsiveness": number
  },
  "classification": string,
  "classification_icon": string,
  "sla": string,
  "missing_fields": [string],
  "score_improvement_potential": string,
  "recommended_next_action": string,
  "follow_up_priority": "immediate" | "today" | "this_week" | "nurture",
  "risk_flags": [
    {
      "type": "timewaster" | "budget_mismatch" | "unresponsive" | "incomplete_profile",
      "detail": string
    }
  ]
}`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { lead } = await req.json();
    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');

    if (!ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY is not configured');
    }

    const userPrompt = `Score this lead and return JSON only:\n\n${JSON.stringify(lead, null, 2)}`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2048,
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

    // Parse JSON from response
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
      throw new Error('Failed to parse scoring response');
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Lead scoring error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
