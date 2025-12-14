import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface CreativeAnalysis {
  quality: "excellent" | "good" | "average" | "poor";
  suitability: {
    facebook: boolean;
    instagram: boolean;
    stories: boolean;
  };
  strengths: string[];
  improvements: string[];
  suggestedCopy: {
    headline: string;
    primaryText: string;
  };
  targetAudience: string[];
  emotionalAppeal: string;
}

export interface BulkAnalysisResult {
  rankings: Array<{
    imageIndex: number;
    score: number;
    strengths: string[];
    weaknesses: string[];
  }>;
  bestPerformer: number;
  recommendations: string[];
}

export interface PropertyDetails {
  propertyType: "apartment" | "house" | "penthouse" | "villa" | "commercial";
  estimatedBedrooms: number;
  features: string[];
  style: "modern" | "traditional" | "luxury" | "minimalist" | "contemporary";
  condition: "new_build" | "renovated" | "good" | "needs_work";
  highlights: string[];
  suggestedTargetBuyer: string;
}

export const useAIImageAnalysis = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeCreative = async (imageUrl: string): Promise<CreativeAnalysis | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("ai-image-analysis", {
        body: { action: "analyze_creative", imageUrl },
      });
      if (fnError) throw fnError;
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to analyze creative");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const bulkAnalyze = async (images: string[]): Promise<BulkAnalysisResult | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("ai-image-analysis", {
        body: { action: "bulk_analysis", images },
      });
      if (fnError) throw fnError;
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to bulk analyze images");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const extractPropertyDetails = async (imageUrl: string): Promise<PropertyDetails | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("ai-image-analysis", {
        body: { action: "extract_property_details", imageUrl },
      });
      if (fnError) throw fnError;
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to extract property details");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    analyzeCreative,
    bulkAnalyze,
    extractPropertyDetails,
    isLoading,
    error,
  };
};
