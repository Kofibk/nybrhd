import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface LeadScoreResult {
  lead_id: string;
  quality_score: number;
  quality_breakdown: {
    financial: number;
    property_match: number;
    credentials: number;
    operational_fit: number;
    penalties: number;
  };
  intent_score: number;
  intent_breakdown: {
    timeline_commitment: number;
    form_completion: number;
    responsiveness: number;
  };
  classification: string;
  classification_icon: string;
  sla: string;
  missing_fields: string[];
  score_improvement_potential: string;
  recommended_next_action: string;
  follow_up_priority: 'immediate' | 'today' | 'this_week' | 'nurture';
  risk_flags: Array<{
    type: 'timewaster' | 'budget_mismatch' | 'unresponsive' | 'incomplete_profile';
    detail: string;
  }>;
}

export function useLeadScoring() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scoreLead = async (lead: Record<string, any>): Promise<LeadScoreResult | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('lead-scoring', {
        body: { lead }
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      return data as LeadScoreResult;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to score lead';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const scoreMultipleLeads = async (leads: Record<string, any>[]): Promise<LeadScoreResult[]> => {
    setIsLoading(true);
    setError(null);
    const results: LeadScoreResult[] = [];

    try {
      for (const lead of leads) {
        const result = await scoreLead(lead);
        if (result) {
          results.push(result);
        }
      }
      return results;
    } finally {
      setIsLoading(false);
    }
  };

  return { scoreLead, scoreMultipleLeads, isLoading, error };
}
