import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface CampaignAnalysisResult {
  summary: string;
  campaign_health: 'excellent' | 'good' | 'needs_attention' | 'poor';
  metrics: {
    total_spend: number;
    total_leads: number;
    cpl: number;
    cpl_rating: 'excellent' | 'good' | 'acceptable' | 'poor';
    ctr: number;
    ctr_rating: 'good' | 'needs_improvement';
    click_to_lead_rate: number;
    cost_per_qualified_lead: number;
  };
  platform_breakdown: Array<{
    platform: string;
    spend: number;
    leads: number;
    cpl: number;
    performance: 'above_benchmark' | 'at_benchmark' | 'below_benchmark';
  }>;
  lead_quality_summary: {
    total_leads: number;
    qualified_leads: number;
    qualified_rate: number;
    hot_leads: number;
    warm_leads: number;
    cold_leads: number;
  };
  top_performing_elements: Array<{
    element: 'ad_set' | 'creative' | 'audience' | 'placement';
    name: string;
    cpl: number;
    why_working: string;
  }>;
  underperforming_elements: Array<{
    element: string;
    name: string;
    cpl: number;
    issue: string;
    recommendation: string;
  }>;
  recommendations: Array<{
    priority: number;
    type: 'targeting' | 'creative' | 'budget' | 'landing_page' | 'placement';
    action: string;
    rationale: string;
    expected_impact: string;
  }>;
  budget_recommendation: {
    current_daily: number;
    recommended_daily: number;
    reasoning: string;
  };
  warnings: Array<{
    severity: 'high' | 'medium';
    issue: string;
    action: string;
  }>;
  excluded_data: {
    audience_network_leads: number;
    audience_network_spend: number;
    reason: string;
  };
}

export function useCampaignAnalysis() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeCampaign = async (campaign: Record<string, any>): Promise<CampaignAnalysisResult | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('campaign-analysis', {
        body: { campaign }
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      return data as CampaignAnalysisResult;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to analyze campaign';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { analyzeCampaign, isLoading, error };
}
