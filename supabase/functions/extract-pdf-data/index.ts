import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const { pdfBase64, pdfName, userType } = await req.json();

    if (!pdfBase64) {
      return new Response(
        JSON.stringify({ success: false, error: 'PDF data is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Determine extraction type based on user type
    let extractionPrompt = '';
    let schemaDescription = '';

    if (userType === 'developer') {
      schemaDescription = 'development/property brochure, price list, or fact sheet';
      extractionPrompt = `You are an expert data extractor specializing in property development brochures. 
Extract the following information from this PDF document:

1. **Development Name**: The name of the development/project
2. **Developer Name**: The company/developer behind the project
3. **Location**: Country, City, Area/Neighbourhood
4. **Property Type**: Type of properties (Apartments, Houses, Townhouses, Penthouses, Mixed)
5. **Price Range**: Minimum and maximum prices (extract currency and amounts)
6. **Unit Types**: Bedroom configurations available (Studio, 1 Bed, 2 Bed, 3 Bed, 4+ Bed)
7. **Total Units**: How many units in the development
8. **Amenities**: List of amenities/facilities
9. **Key Features**: Main selling points
10. **Completion Date**: Expected completion or handover date
11. **Summary**: A 2-3 sentence marketing summary of the development

Return a JSON object with these fields:
{
  "developmentName": "string",
  "developerName": "string",
  "country": "string",
  "city": "string",
  "area": "string",
  "propertyType": "string",
  "minPrice": number,
  "maxPrice": number,
  "currency": "string",
  "bedrooms": ["Studio", "1 Bed", etc],
  "totalUnits": number,
  "availableUnits": number or null,
  "amenities": ["string"],
  "keyFeatures": ["string"],
  "completionDate": "string or null",
  "summary": "string"
}`;
    } else if (userType === 'agent') {
      schemaDescription = 'property listing or portfolio document';
      extractionPrompt = `You are an expert data extractor specializing in property listings.
Extract the following information from this PDF document:

1. **Property Name/Address**: The property address or listing name
2. **Property Type**: Type (Apartment, House, Townhouse, Penthouse, Commercial)
3. **Location**: Country, City, Area/Postcode
4. **Price**: Asking price or rental price
5. **Bedrooms**: Number of bedrooms
6. **Bathrooms**: Number of bathrooms
7. **Square Footage**: Size in sq ft or sq m
8. **Features**: Key features of the property
9. **Description**: Property description summary
10. **Status**: Available, Under Offer, Sold, Let

Return a JSON object with these fields:
{
  "propertyName": "string",
  "propertyType": "string",
  "country": "string",
  "city": "string",
  "area": "string",
  "postcode": "string or null",
  "price": number,
  "currency": "string",
  "priceType": "sale" or "rent",
  "bedrooms": number,
  "bathrooms": number,
  "squareFootage": number or null,
  "features": ["string"],
  "description": "string",
  "status": "string"
}`;
    } else if (userType === 'broker') {
      schemaDescription = 'mortgage or financial product document';
      extractionPrompt = `You are an expert data extractor specializing in mortgage and financial product documents.
Extract the following information from this PDF document:

1. **Product Name**: The name of the mortgage/financial product
2. **Product Type**: Type (Residential Mortgage, Buy-to-Let, Bridging, Commercial, Insurance)
3. **Lender**: The lender or provider name
4. **Interest Rate**: Rate or rate range
5. **LTV**: Loan-to-value ratio
6. **Term**: Loan term options
7. **Minimum Loan**: Minimum borrowing amount
8. **Maximum Loan**: Maximum borrowing amount
9. **Eligibility**: Key eligibility criteria
10. **Features**: Key product features
11. **Fees**: Any associated fees

Return a JSON object with these fields:
{
  "productName": "string",
  "productType": "string",
  "lender": "string",
  "interestRate": "string",
  "ltv": "string",
  "termOptions": ["string"],
  "minLoan": number,
  "maxLoan": number,
  "currency": "string",
  "eligibility": ["string"],
  "features": ["string"],
  "fees": ["string"],
  "description": "string"
}`;
    }

    console.log(`Extracting ${schemaDescription} data from: ${pdfName}`);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `${extractionPrompt}\n\nIMPORTANT: Return ONLY valid JSON. No markdown, no explanations, just the JSON object.`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Please extract the data from this ${schemaDescription}. The file is named: ${pdfName}`
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:application/pdf;base64,${pdfBase64}`
                }
              }
            ]
          }
        ],
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ success: false, error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    console.log('Raw AI response:', content);

    // Parse the JSON response
    let extractedData;
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        extractedData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to parse extracted data',
          rawContent: content 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Successfully extracted data:', extractedData);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: extractedData,
        fileName: pdfName,
        userType 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error extracting PDF data:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to extract data from PDF' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
