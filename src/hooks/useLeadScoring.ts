import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ScoreBreakdown {
  timeline: number;
  cash_or_mortgage: number;
  reason_for_purchase: number;
  budget: number;
  contact_preference: number;
  linkedin_or_website: number;
}

export interface LeadScoreResult {
  status: 'scored' | 'flagged';
  score: number;
  priority: number | null;
  priority_label: string;
  reason?: string; // For flagged leads
  score_breakdown?: ScoreBreakdown;
  modifiers_applied: string[];
  recommended_action: string;
  next_steps: string[];
  risk_flags: string[];
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
