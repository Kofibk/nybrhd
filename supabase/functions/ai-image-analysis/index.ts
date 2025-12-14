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

    const { action, imageUrl, images } = await req.json();

    let systemPrompt = '';
    let userContent: any[] = [];
    const model = 'google/gemini-2.5-flash'; // Best for vision tasks

    switch (action) {
      case 'analyze_creative':
        systemPrompt = `You are a creative asset analyst for property marketing. Analyze the image for Meta Ads effectiveness.

Respond with valid JSON only:
{
  "quality": "excellent" | "good" | "average" | "poor",
  "suitability": {
    "facebook": boolean,
    "instagram": boolean,
    "stories": boolean
  },
  "strengths": string[],
  "improvements": string[],
  "suggestedCopy": {
    "headline": "string",
    "primaryText": "string"
  },
  "targetAudience": string[],
  "emotionalAppeal": string
}`;
        userContent = [
          { type: 'text', text: 'Analyze this property marketing creative:' },
          { type: 'image_url', image_url: { url: imageUrl } }
        ];
        break;

      case 'bulk_analysis':
        systemPrompt = `You are a creative asset analyst. Analyze multiple images and rank them for Meta Ads performance.

Respond with valid JSON only:
{
  "rankings": [
    {
      "imageIndex": number,
      "score": number,
      "strengths": string[],
      "weaknesses": string[]
    }
  ],
  "bestPerformer": number,
  "recommendations": string[]
}`;
        userContent = [
          { type: 'text', text: `Analyze and rank these ${images.length} creative assets:` },
          ...images.map((url: string) => ({ type: 'image_url', image_url: { url } }))
        ];
        break;

      case 'extract_property_details':
        systemPrompt = `You are a property details extractor. Analyze property images and extract key details.

Respond with valid JSON only:
{
  "propertyType": "apartment" | "house" | "penthouse" | "villa" | "commercial",
  "estimatedBedrooms": number,
  "features": string[],
  "style": "modern" | "traditional" | "luxury" | "minimalist" | "contemporary",
  "condition": "new_build" | "renovated" | "good" | "needs_work",
  "highlights": string[],
  "suggestedTargetBuyer": string
}`;
        userContent = [
          { type: 'text', text: 'Extract property details from this image:' },
          { type: 'image_url', image_url: { url: imageUrl } }
        ];
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
          { role: 'user', content: userContent }
        ],
        temperature: 0.3,
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
    console.error('Error in ai-image-analysis:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
