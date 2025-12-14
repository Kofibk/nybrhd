import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface LeadScore {
  qualityScore: number;
  intentScore: number;
  qualityBreakdown: {
    financialFit: number;
    propertyMatch: number;
    credentials: number;
    readiness: number;
  };
  intentBreakdown: {
    timeline: number;
    formCompletion: number;
    engagement: number;
  };
  classification: "hot" | "star" | "lightning" | "verified" | "warning" | "dormant" | "cold";
  reasoning: string;
}

export interface SpamDetection {
  isSpam: boolean;
  confidence: number;
  indicators: string[];
  recommendation: "approve" | "review" | "reject";
}

export interface QualityAnalysis {
  overallQuality: "excellent" | "good" | "average" | "poor";
  buyerReadiness: "ready_to_buy" | "actively_looking" | "just_browsing" | "not_ready";
  financialCapability: "verified" | "likely" | "uncertain" | "unlikely";
  matchScore: number;
  concerns: string[];
  strengths: string[];
  recommendedActions: string[];
}

export const useAILeadAnalysis = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scoreLead = async (lead: any): Promise<LeadScore | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("ai-lead-analysis", {
        body: { action: "score", lead },
      });
      if (fnError) throw fnError;
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to score lead");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const detectSpam = async (lead: any): Promise<SpamDetection | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("ai-lead-analysis", {
        body: { action: "spam_detection", lead },
      });
      if (fnError) throw fnError;
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to detect spam");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeQuality = async (lead: any): Promise<QualityAnalysis | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("ai-lead-analysis", {
        body: { action: "quality_analysis", lead },
      });
      if (fnError) throw fnError;
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to analyze quality");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const bulkScoreLeads = async (leads: any[]): Promise<any[] | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("ai-lead-analysis", {
        body: { action: "bulk_scoring", leads },
      });
      if (fnError) throw fnError;
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to bulk score leads");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    scoreLead,
    detectSpam,
    analyzeQuality,
    bulkScoreLeads,
    isLoading,
    error,
  };
};
