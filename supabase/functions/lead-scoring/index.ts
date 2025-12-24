import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');

const SYSTEM_PROMPT = `You are the lead scoring engine for Naybourhood, a property buyer intelligence platform.

## YOUR TASK
Analyse the lead data and return a score out of 100.

## STEP 1: SPAM/FRAUD CHECK
Flag lead for review if ANY of these are true:
- Name contains 4+ consecutive consonants with no vowels (gibberish pattern like "bdfgh", "xzqwrt")
- Name has repeated words (e.g., "Khan Khan", "Test Test")
- Name contains numbers or special characters (@, #, $, %)
- Name contains keywords: "test", "fake", "asdf", "qwerty"
- Budget ≥ £2,000,000 AND cash_or_mortgage = "Cash" AND country IN [Nigeria, Kenya, Ghana, India]
- Budget ≥ £10,000,000 AND country IN [Nigeria, Kenya, Ghana, India, Unknown]
- Country = "Unknown" or blank or missing

If flagged: Return:
{
  "status": "flagged",
  "reason": "[specific reason]",
  "score": 0,
  "priority": null,
  "priority_label": "Review Required",
  "recommended_action": "Manual review required before contact"
}

## STEP 2: INITIAL SCORE (max 100)
Calculate points from form data:

Timeline to purchase (max 30):
- Within 28 days = 30
- 1-3 months = 24
- 3-6 months = 18
- 6-12 months = 10
- 12+ months = 5

Cash or Mortgage (max 20):
- Cash = 20
- Mortgage = 15

Reason for purchase (max 20):
- Primary residence = 20
- Investment = 18
- For child = 15
- Holiday home = 8

Budget range (max 15):
- £500K - £1M = 15
- £400K - £500K = 12
- £1M - £2M = 12
- £2M - £3M = 10
- £3M - £5M = 8
- £5M+ = 5

Preferred contact method (max 10):
- WhatsApp = 10
- Call = 10
- Email = 5

LinkedIn or Company website (max 5):
- Provided = 5
- Not provided = 0

Initial Score = Sum of all points

## STEP 3: ENGAGEMENT MODIFIERS
If engagement data exists, apply these modifiers to the initial score:

Positive modifiers (add points):
- WhatsApp reply (substantive, detailed response) = +10
- WhatsApp reply (brief, short response) = +5
- Email opened (3+ times) = +10
- Email opened (1-2 times) = +5
- Brochure downloaded = +5
- Viewing requested = +15
- Return visit to site = +5
- Named specific unit or plot = +10
- Verified AIP (Agreement in Principle) = +15
- Proof of funds submitted = +15
- No chain (FTB/Investor/Renter) = +10
- Chain but SSTC (Sold Subject to Contract) = +5
- UK resident confirmed = +10
- Senior professional confirmed (via LinkedIn) = +10

Negative modifiers (subtract points):
- No response after 7 days = -5
- No response after 14 days = -10
- No response after 30 days = -15
- Said "not interested" = -30
- Said "just browsing" = -10
- Chain not sold = -5
- Budget mismatch confirmed on call = -10

Final Score = Initial Score + Modifiers (capped at 0 minimum, 100 maximum)

## STEP 4: DETERMINE PRIORITY
Based on final score:
- 70-100 = Priority 1 (P1)
- 50-69 = Priority 2 (P2)
- 30-49 = Priority 3 (P3)
- 0-29 = Priority 4 (P4)

## STEP 5: GENERATE RECOMMENDED ACTION
Based on score and data:
- P1: Immediate call focus, book viewing
- P2: Call within 24 hours, qualify further
- P3: Email nurture, build relationship
- P4: Long-term nurture, low priority

## OUTPUT FORMAT
Return a JSON object with this exact structure:

{
  "status": "scored",
  "score": [0-100],
  "priority": [1-4],
  "priority_label": "[P1/P2/P3/P4] - [Action timeframe]",
  "score_breakdown": {
    "timeline": [points],
    "cash_or_mortgage": [points],
    "reason_for_purchase": [points],
    "budget": [points],
    "contact_preference": [points],
    "linkedin_or_website": [points]
  },
  "modifiers_applied": [
    "[modifier name]: [+/- points]"
  ],
  "recommended_action": "[Specific action based on lead profile]",
  "next_steps": [
    "[Step 1]",
    "[Step 2]",
    "[Step 3]"
  ],
  "risk_flags": [
    "[Any concerns identified]"
  ]
}

IMPORTANT: Return ONLY the JSON object, no additional text or markdown formatting.`;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { lead } = await req.json();

    if (!lead) {
      return new Response(
        JSON.stringify({ error: 'Lead data is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!ANTHROPIC_API_KEY) {
      console.error('ANTHROPIC_API_KEY is not set');
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Scoring lead:', lead.name || lead.email);

    const userPrompt = `Score this lead:

${JSON.stringify(lead, null, 2)}`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2048,
        system: SYSTEM_PROMPT,
        messages: [
          { role: 'user', content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limits exceeded, please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required, please add funds to your workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'AI scoring failed', details: errorText }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const content = data.content?.[0]?.text || '';
    
    console.log('Raw AI response:', content);

    // Parse the JSON response
    let scoreResult;
    try {
      // Remove any markdown code blocks if present
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      scoreResult = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to parse scoring result',
          raw_response: content 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Lead scored successfully:', lead.name || lead.email, 'Score:', scoreResult.score);

    return new Response(
      JSON.stringify(scoreResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in lead-scoring function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
