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

    const { action, context, stream } = await req.json();

    let systemPrompt = '';
    let userPrompt = '';
    const model = 'openai/gpt-5'; // Best for creative content

    switch (action) {
      case 'ad_copy':
        systemPrompt = `You are an expert Meta Ads copywriter for luxury property marketing. Create compelling ad copy that converts.

Guidelines:
- Use UK English spelling
- Focus on buyer benefits, not features
- Create urgency without being pushy
- Include clear CTAs
- Keep headlines under 40 characters
- Keep primary text under 125 characters for best performance

Respond with valid JSON only:
{
  "variations": [
    {
      "headline": "string",
      "primaryText": "string",
      "description": "string",
      "cta": "Learn More" | "Book Viewing" | "Get Quote" | "Contact Us",
      "angle": "investment" | "lifestyle" | "family" | "luxury" | "value"
    }
  ],
  "recommendations": string[]
}`;
        userPrompt = `Create 3 ad copy variations for: ${JSON.stringify(context)}`;
        break;

      case 'email_sequence':
        systemPrompt = `You are an email marketing expert for property sales. Create nurturing email sequences.

Respond with valid JSON only:
{
  "sequence": [
    {
      "day": number,
      "subject": "string",
      "preview": "string",
      "body": "string",
      "cta": "string",
      "ctaUrl": "string"
    }
  ],
  "tips": string[]
}`;
        userPrompt = `Create a 5-email nurturing sequence for: ${JSON.stringify(context)}`;
        break;

      case 'whatsapp_templates':
        systemPrompt = `You are a WhatsApp Business messaging expert for property sales. Create professional, engaging templates.

Respond with valid JSON only:
{
  "templates": [
    {
      "name": "string",
      "category": "welcome" | "follow_up" | "viewing_reminder" | "offer" | "closing",
      "message": "string",
      "variables": string[]
    }
  ]
}`;
        userPrompt = `Create WhatsApp templates for: ${JSON.stringify(context)}`;
        break;

      case 'chat_response':
        systemPrompt = `You are a helpful property sales assistant for Naybourhood.ai. Help users with their property marketing questions.

Be conversational, professional, and helpful. Use UK English. If you don't know something, say so.`;
        userPrompt = context.message;

        if (stream) {
          // Handle streaming response
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
                ...context.history || [],
                { role: 'user', content: userPrompt }
              ],
              stream: true,
            }),
          });

          return new Response(response.body, {
            headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
          });
        }
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
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    // For chat responses, return as-is
    if (action === 'chat_response') {
      return new Response(JSON.stringify({ response: content }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const jsonMatch = content.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Failed to parse AI response');
    }

    const result = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ai-content-generation:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
