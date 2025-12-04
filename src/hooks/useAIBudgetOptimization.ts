import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface BudgetOptimization {
  recommendedBudget: number;
  recommendedDailyCap: number;
  budgetReasoning: string;
  expectedCPLMin: number;
  expectedCPLMax: number;
  regionAllocations?: {
    region: string;
    percentage: number;
    reason: string;
  }[];
  optimizationTips: string[];
  confidence: number;
}

interface UseAIBudgetOptimizationProps {
  userType: string;
  objective: string;
  currentBudget?: number;
  targetCountries: string[];
  targetCities?: string[];
  product?: string;
  propertyDetails?: string;
  focusSegment?: string;
  developmentName?: string;
}

export const useAIBudgetOptimization = () => {
  const [optimization, setOptimization] = useState<BudgetOptimization | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOptimization = async (params: UseAIBudgetOptimizationProps) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error: fnError } = await supabase.functions.invoke("optimize-budget", {
        body: params,
      });

      if (fnError) {
        throw fnError;
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      setOptimization(data);
      return data;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to get budget recommendations";
      setError(errorMsg);
      console.error("Budget optimization error:", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const clearOptimization = () => {
    setOptimization(null);
    setError(null);
  };

  return {
    optimization,
    isLoading,
    error,
    fetchOptimization,
    clearOptimization,
  };
};
