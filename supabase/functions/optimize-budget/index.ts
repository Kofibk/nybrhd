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
    const { 
      userType, 
      objective, 
      currentBudget, 
      targetCountries, 
      targetCities,
      product,
      propertyDetails,
      focusSegment,
      developmentName 
    } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build context based on user type
    let campaignContext = "";
    if (userType === "broker") {
      campaignContext = `Mortgage product: ${product || "General"}`;
    } else if (userType === "agent") {
      campaignContext = `Property: ${propertyDetails || "General"}, Focus: ${focusSegment || "General"}`;
    } else {
      campaignContext = `Development: ${developmentName || "General"}`;
    }

    const systemPrompt = `You are a Meta Ads budget optimization expert specializing in real estate and financial services marketing.
Analyze the campaign parameters and provide data-driven budget recommendations to maximize ROI.
Consider market dynamics, competition levels, and typical CPL/CPA for the target regions.
All budgets should be in British Pounds (£).`;

    const userPrompt = `Optimize budget for this campaign:
- User Type: ${userType === "broker" ? "Mortgage Broker" : userType === "agent" ? "Estate Agent" : "Property Developer"}
- ${campaignContext}
- Objective: ${objective}
- Current Budget: £${currentBudget || "Not set"}
- Target Countries: ${targetCountries?.join(", ") || "Not set"}
- Target Cities: ${targetCities?.join(", ") || "All cities"}

Provide:
1. Recommended total budget with reasoning
2. Recommended daily cap
3. Budget allocation suggestions by region/market
4. Expected CPL range
5. Optimization tips specific to this campaign type`;

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
              name: "optimize_budget",
              description: "Return budget optimization recommendations",
              parameters: {
                type: "object",
                properties: {
                  recommendedBudget: { 
                    type: "number", 
                    description: "Recommended total budget in GBP" 
                  },
                  recommendedDailyCap: { 
                    type: "number", 
                    description: "Recommended daily spending cap in GBP" 
                  },
                  budgetReasoning: { 
                    type: "string", 
                    description: "Explanation for the budget recommendation (2-3 sentences)" 
                  },
                  expectedCPLMin: { 
                    type: "number", 
                    description: "Expected minimum cost per lead in GBP" 
                  },
                  expectedCPLMax: { 
                    type: "number", 
                    description: "Expected maximum cost per lead in GBP" 
                  },
                  regionAllocations: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        region: { type: "string" },
                        percentage: { type: "number" },
                        reason: { type: "string" }
                      },
                      required: ["region", "percentage", "reason"]
                    }
                  },
                  optimizationTips: {
                    type: "array",
                    items: { type: "string" },
                    description: "3-5 actionable optimization tips"
                  },
                  confidence: {
                    type: "number",
                    description: "Confidence score 0-100"
                  }
                },
                required: ["recommendedBudget", "recommendedDailyCap", "budgetReasoning", "expectedCPLMin", "expectedCPLMax", "optimizationTips", "confidence"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "optimize_budget" } }
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
      console.log("Budget optimization generated:", recommendations);
      return new Response(JSON.stringify(recommendations), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error("No recommendations generated");
  } catch (error) {
    console.error("Error in optimize-budget:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
