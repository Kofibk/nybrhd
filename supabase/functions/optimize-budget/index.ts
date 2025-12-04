import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation
function validateInput(body: unknown): { valid: true; data: ValidatedInput } | { valid: false; error: string } {
  if (!body || typeof body !== "object") {
    return { valid: false, error: "Invalid request body" };
  }

  const input = body as Record<string, unknown>;

  // Validate userType
  const validUserTypes = ["developer", "agent", "broker"];
  if (!input.userType || typeof input.userType !== "string" || !validUserTypes.includes(input.userType)) {
    return { valid: false, error: "Invalid userType. Must be 'developer', 'agent', or 'broker'" };
  }

  // Validate objective
  const validObjectives = ["leads", "awareness", "viewings"];
  if (!input.objective || typeof input.objective !== "string" || !validObjectives.includes(input.objective.toLowerCase())) {
    return { valid: false, error: "Invalid objective" };
  }

  // Validate currentBudget (optional)
  if (input.currentBudget !== undefined && input.currentBudget !== null) {
    const budget = Number(input.currentBudget);
    if (isNaN(budget) || budget < 0 || budget > 10000000) {
      return { valid: false, error: "Invalid currentBudget. Must be between 0 and 10,000,000" };
    }
  }

  // Validate targetCountries (optional array)
  if (input.targetCountries !== undefined && input.targetCountries !== null) {
    if (!Array.isArray(input.targetCountries) || input.targetCountries.length > 50) {
      return { valid: false, error: "Invalid targetCountries. Must be an array with max 50 items" };
    }
    for (const country of input.targetCountries) {
      if (typeof country !== "string" || country.length > 100) {
        return { valid: false, error: "Invalid country in targetCountries" };
      }
    }
  }

  // Validate targetCities (optional array)
  if (input.targetCities !== undefined && input.targetCities !== null) {
    if (!Array.isArray(input.targetCities) || input.targetCities.length > 100) {
      return { valid: false, error: "Invalid targetCities. Must be an array with max 100 items" };
    }
    for (const city of input.targetCities) {
      if (typeof city !== "string" || city.length > 100) {
        return { valid: false, error: "Invalid city in targetCities" };
      }
    }
  }

  // Validate string fields with length limits
  const stringFields = ["product", "propertyDetails", "focusSegment", "developmentName"];
  for (const field of stringFields) {
    if (input[field] !== undefined && input[field] !== null) {
      if (typeof input[field] !== "string" || (input[field] as string).length > 500) {
        return { valid: false, error: `Invalid ${field}. Must be a string with max 500 characters` };
      }
    }
  }

  return {
    valid: true,
    data: {
      userType: input.userType as string,
      objective: input.objective as string,
      currentBudget: input.currentBudget !== undefined && input.currentBudget !== null ? Number(input.currentBudget) : undefined,
      targetCountries: input.targetCountries as string[] | undefined,
      targetCities: input.targetCities as string[] | undefined,
      product: input.product as string | undefined,
      propertyDetails: input.propertyDetails as string | undefined,
      focusSegment: input.focusSegment as string | undefined,
      developmentName: input.developmentName as string | undefined,
    },
  };
}

interface ValidatedInput {
  userType: string;
  objective: string;
  currentBudget?: number;
  targetCountries?: string[];
  targetCities?: string[];
  product?: string;
  propertyDetails?: string;
  focusSegment?: string;
  developmentName?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentication check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("No authorization header provided");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("Authentication failed:", authError?.message);
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Authenticated user: ${user.id}`);

    // Parse and validate input
    const rawBody = await req.json();
    const validation = validateInput(rawBody);
    
    if (!validation.valid) {
      console.error("Input validation failed:", validation.error);
      return new Response(JSON.stringify({ error: validation.error }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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
    } = validation.data;
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build context based on user type (sanitized inputs)
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
                      required: ["region", "percentage", "reason"],
                      additionalProperties: false
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
      console.log(`Budget optimization completed for user ${user.id}`);
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
