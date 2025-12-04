import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userType, product, propertyDetails, focusSegment, developmentName, targetCountries } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build context based on user type
    let context = "";
    if (userType === "broker") {
      context = `Mortgage product: ${product}`;
    } else if (userType === "agent") {
      context = `Property: ${propertyDetails}, Focus: ${focusSegment}`;
    } else {
      context = `Development: ${developmentName}`;
    }

    const systemPrompt = `You are a marketing expert specializing in real estate and financial services targeting. 
Based on the campaign details, recommend the best cities to target for maximum lead quality and conversion rates.
Consider wealth demographics, buyer intent signals, and market dynamics for each city.
Always provide reasoning for each recommendation.`;

    const userPrompt = `For a ${userType === "broker" ? "mortgage broker" : userType === "agent" ? "estate agent" : "property developer"} campaign:
${context}
Target countries: ${targetCountries.join(", ")}

Recommend 5-7 cities with the highest potential for quality leads. For each city, explain WHY it's a good target in 1 sentence.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "recommend_cities",
              description: "Return city recommendations with reasoning",
              parameters: {
                type: "object",
                properties: {
                  recommendations: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        cityCode: { type: "string", description: "City code in snake_case (e.g., london, dubai, lagos)" },
                        cityName: { type: "string", description: "Display name of the city" },
                        countryCode: { type: "string", description: "ISO country code (e.g., GB, AE, NG)" },
                        reason: { type: "string", description: "Why this city is recommended (1 sentence)" },
                        priority: { type: "string", enum: ["high", "medium", "low"] }
                      },
                      required: ["cityCode", "cityName", "countryCode", "reason", "priority"],
                      additionalProperties: false
                    }
                  }
                },
                required: ["recommendations"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "recommend_cities" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (toolCall?.function?.arguments) {
      const recommendations = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify(recommendations), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error("No recommendations generated");
  } catch (error) {
    console.error("Error in recommend-cities:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
