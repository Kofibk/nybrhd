import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');

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

    console.log('Analyzing lead:', lead.name);

    const systemPrompt = `You are an expert property sales analyst for a luxury real estate platform. Your task is to analyze buyer leads and provide actionable insights.

Based on the lead data provided, generate a concise 2-3 sentence analysis that includes:
1. Key buyer profile observations (profession hints from email, location significance, buying capacity)
2. Interest level assessment based on engagement metrics and timeline
3. Specific property recommendations or approach strategy

Be specific and actionable. Reference actual data points from the lead. Use British English spelling (optimise, analyse, behaviour).

Format: Write as a cohesive paragraph, not bullet points. Be professional but conversational.`;

    const userPrompt = `Analyze this property buyer lead:

Name: ${lead.name}
Email: ${lead.email}
Phone: ${lead.phone || 'Not provided'}
Country: ${lead.country || 'United Kingdom'}
Budget: ${lead.budget || 'Not specified'}
Bedrooms: ${lead.bedrooms || 'Not specified'}
Payment Method: ${lead.paymentMethod || 'Undecided'}
Purchase Timeline: ${lead.purchaseTimeline || 'Not specified'}
Purchase Purpose: ${lead.purpose || 'Not specified'}
Buyer Status: ${lead.buyerStatus || 'Not specified'}

Quality Score: ${lead.qualityScore}/100
Intent Score: ${lead.intentScore}/100

Behavioural Data:
- Brochure Views: ${lead.brochureViews || 0}
- WhatsApp Clicks: ${lead.whatsappClicks || 0}
- Email Opens: ${lead.emailOpens || 0}
- Time on Site: ${lead.timeOnSite || 0} minutes

Verification Status:
- Mortgage AIP: ${lead.mortgageAIP ? 'Yes' : 'No'}
- Has Lawyer: ${lead.hasLawyer ? 'Yes' : 'No'}
- UK Resident: ${lead.ukResident ? 'Yes' : 'No'}
- KYC/AML Completed: ${lead.kycAmlCompleted ? 'Yes' : 'No'}
- Proof of Funds: ${lead.proofOfFunds ? 'Yes' : 'No'}

Campaign/Property Interest: ${lead.campaignName || lead.propertyInterest || 'Not specified'}
Source: ${lead.source || 'Direct'}
Notes: ${lead.notes || 'None'}

Generate a brief, insightful analysis focusing on this buyer's profile, readiness to purchase, and recommended engagement approach.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5-20250514',
        max_tokens: 500,
        messages: [
          {
            role: 'user',
            content: userPrompt,
          },
        ],
        system: systemPrompt,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Claude API error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: 'AI analysis failed', details: errorText }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const insights = data.content?.[0]?.text || 'Unable to generate insights.';

    console.log('Analysis generated successfully for:', lead.name);

    return new Response(
      JSON.stringify({ 
        insights,
        analyzedAt: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in analyze-lead function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
