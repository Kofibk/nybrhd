import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface CampaignRecommendation {
  priority: "high" | "medium" | "low";
  category: "budget" | "targeting" | "creative" | "timing" | "audience";
  title: string;
  description: string;
  expectedImpact: string;
  action: string;
}

export interface CampaignIntelligence {
  overallHealth: "excellent" | "good" | "needs_attention" | "critical";
  recommendations: CampaignRecommendation[];
  budgetSuggestion: {
    current: number;
    recommended: number;
    reasoning: string;
  };
  audienceInsights: string[];
  creativeInsights: string[];
}

export interface PerformanceSummary {
  summary: string;
  whatsWorking: string[];
  needsAttention: string[];
  keyMetrics: {
    leadQuality: "excellent" | "good" | "average" | "poor";
    costEfficiency: "excellent" | "good" | "average" | "poor";
    engagement: "excellent" | "good" | "average" | "poor";
  };
  nextSteps: string[];
}

export interface AttributionInsight {
  finding: string;
  metaReported: string;
  actualPerformance: string;
  recommendation: string;
  budgetImpact: string;
}

export interface AttributionAnalysis {
  insights: AttributionInsight[];
  deviceBreakdown: {
    mobile: { leads: number; conversionRate: number };
    desktop: { leads: number; conversionRate: number };
  };
  creativePerformance: Array<{ creativeId: string; leads: number; dealRate: number }>;
  actionableRecommendations: string[];
}

export const useAICampaignIntelligence = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getRecommendations = async (campaign: any, metrics?: any): Promise<CampaignIntelligence | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("ai-campaign-intelligence", {
        body: { action: "recommendations", campaign, metrics },
      });
      if (fnError) throw fnError;
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get recommendations");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getPerformanceSummary = async (campaign: any, metrics?: any): Promise<PerformanceSummary | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("ai-campaign-intelligence", {
        body: { action: "performance_summary", campaign, metrics },
      });
      if (fnError) throw fnError;
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get performance summary");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getAttributionAnalysis = async (campaigns: any[], metrics?: any): Promise<AttributionAnalysis | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("ai-campaign-intelligence", {
        body: { action: "attribution_analysis", campaigns, metrics },
      });
      if (fnError) throw fnError;
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get attribution analysis");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const optimizeBudget = async (campaign: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("ai-campaign-intelligence", {
        body: { action: "budget_optimization", campaign },
      });
      if (fnError) throw fnError;
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to optimise budget");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    getRecommendations,
    getPerformanceSummary,
    getAttributionAnalysis,
    optimizeBudget,
    isLoading,
    error,
  };
};
