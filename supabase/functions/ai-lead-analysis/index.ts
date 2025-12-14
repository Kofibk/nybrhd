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
    const { action, type, lead, leads, fileContent, fileName, fileType } = body;

    // Handle bulk file analysis for lead imports
    if (type === 'bulk_analysis' || action === 'parse_file') {
      console.log('Processing file upload:', fileName, fileType);
      
      const systemPrompt = `You are a lead data extraction expert. Parse the provided file content and extract lead information.

For CSV/Excel content, parse the rows and identify columns for: name, email, phone, country, budget, bedrooms, notes, status.
For PDF content (base64), analyze the text and extract any lead information found.

IMPORTANT: Return ONLY valid JSON in exactly this format:
{
  "success": true,
  "leads": [
    {
      "name": "Full Name",
      "email": "email@example.com",
      "phone": "+44...",
      "country": "United Kingdom",
      "countryCode": "GB",
      "budget": "£500,000 - £750,000",
      "bedrooms": "2",
      "notes": "",
      "status": "new",
      "qualityScore": 65,
      "intentScore": 55,
      "source": "manual_upload"
    }
  ],
  "summary": "Extracted X leads from the file",
  "insights": ["Key insight 1", "Key insight 2"],
  "recordsFound": 5
}

Scoring guidelines:
- qualityScore (0-100): Based on data completeness, valid email/phone, budget specified
- intentScore (0-100): Default to 50-60 for imported leads, adjust based on any timeline or urgency info

Country codes: GB, US, AE, NG, SG, HK, etc.
Status should default to "new" unless specified.
If budget is not specified, use "Not specified".
If any field is missing, use reasonable defaults.`;

      const userPrompt = `Parse this ${fileType?.toUpperCase() || 'file'} content and extract all leads:

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

      // Parse JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('Failed to find JSON in response:', content);
        throw new Error('Failed to parse AI response - no JSON found');
      }

      const result = JSON.parse(jsonMatch[0]);
      
      // Ensure leads have required fields
      if (result.leads && Array.isArray(result.leads)) {
        result.leads = result.leads.map((lead: any, index: number) => ({
          id: `imported_${Date.now()}_${index}`,
          name: lead.name || 'Unknown',
          email: lead.email || '',
          phone: lead.phone || '',
          country: lead.country || 'United Kingdom',
          countryCode: lead.countryCode || 'GB',
          budget: lead.budget || 'Not specified',
          bedrooms: lead.bedrooms || '',
          notes: lead.notes || '',
          status: lead.status || 'new',
          qualityScore: lead.qualityScore || 50,
          intentScore: lead.intentScore || 50,
          source: 'manual_upload',
          sourceDetail: fileName,
          campaignId: '',
          campaignName: 'Imported',
          createdAt: new Date().toISOString(),
        }));
      }

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Original lead analysis actions
    let systemPrompt = '';
    let userPrompt = '';
    let model = 'openai/gpt-5';

    switch (action) {
      case 'score':
        systemPrompt = `You are a lead scoring expert. Analyze the lead and provide Quality Score (0-100) and Intent Score (0-100).
        
Quality Score factors: financial fit, property match, credentials verification, operational readiness.
Intent Score factors: purchase timeline urgency, form completion depth, engagement frequency.

Respond with valid JSON only:
{
  "qualityScore": number,
  "intentScore": number,
  "qualityBreakdown": { "financialFit": number, "propertyMatch": number, "credentials": number, "readiness": number },
  "intentBreakdown": { "timeline": number, "formCompletion": number, "engagement": number },
  "classification": "hot" | "star" | "lightning" | "verified" | "warning" | "dormant" | "cold",
  "reasoning": "string"
}`;
        userPrompt = `Score this lead: ${JSON.stringify(lead)}`;
        break;

      case 'spam_detection':
        systemPrompt = `You are a spam detection expert. Analyze the lead for spam indicators.
        
Check for: fake emails, disposable domains, bot patterns, suspicious phone numbers, generic names, inconsistent data.

Respond with valid JSON only:
{
  "isSpam": boolean,
  "confidence": number,
  "indicators": string[],
  "recommendation": "approve" | "review" | "reject"
}`;
        userPrompt = `Check this lead for spam: ${JSON.stringify(lead)}`;
        break;

      case 'quality_analysis':
        systemPrompt = `You are a lead quality analyst. Provide detailed analysis of lead quality and buyer readiness.

Respond with valid JSON only:
{
  "overallQuality": "excellent" | "good" | "average" | "poor",
  "buyerReadiness": "ready_to_buy" | "actively_looking" | "just_browsing" | "not_ready",
  "financialCapability": "verified" | "likely" | "uncertain" | "unlikely",
  "matchScore": number,
  "concerns": string[],
  "strengths": string[],
  "recommendedActions": string[]
}`;
        userPrompt = `Analyze this lead: ${JSON.stringify(lead)}`;
        break;

      case 'bulk_scoring':
        model = 'google/gemini-2.5-flash';
        systemPrompt = `You are a lead scoring expert. Score multiple leads efficiently.

Respond with valid JSON array:
[{ "leadId": string, "qualityScore": number, "intentScore": number, "classification": string }]`;
        userPrompt = `Score these leads: ${JSON.stringify(leads)}`;
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

    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Failed to parse AI response');
    }

    const result = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ai-lead-analysis:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
