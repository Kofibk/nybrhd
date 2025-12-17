import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface BehaviouralData {
  brochureViews: number;
  whatsappClicks: number;
  emailOpens: number;
  timeOnSite: number;
}

interface EngagementThresholds {
  brochureViews: number;
  whatsappClicks: number;
  emailOpens: number;
  timeOnSite: number;
  totalEngagementScore: number;
}

interface AutoAnalysisResult {
  insights: string;
  analyzedAt: string;
  triggeredBy: string;
  thresholdsMet: string[];
}

const DEFAULT_THRESHOLDS: EngagementThresholds = {
  brochureViews: 3,
  whatsappClicks: 2,
  emailOpens: 3,
  timeOnSite: 5,
  totalEngagementScore: 15,
};

export function useAutoLeadAnalysis() {
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<AutoAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const calculateEngagementScore = useCallback((data: BehaviouralData): number => {
    return (
      data.brochureViews * 2 +
      data.whatsappClicks * 3 +
      data.emailOpens * 2 +
      Math.floor(data.timeOnSite / 2)
    );
  }, []);

  const checkThresholds = useCallback((
    data: BehaviouralData,
    thresholds: EngagementThresholds = DEFAULT_THRESHOLDS
  ): { shouldTrigger: boolean; thresholdsMet: string[] } => {
    const thresholdsMet: string[] = [];

    if (data.brochureViews >= thresholds.brochureViews) {
      thresholdsMet.push(`Brochure views (${data.brochureViews}/${thresholds.brochureViews})`);
    }
    if (data.whatsappClicks >= thresholds.whatsappClicks) {
      thresholdsMet.push(`WhatsApp clicks (${data.whatsappClicks}/${thresholds.whatsappClicks})`);
    }
    if (data.emailOpens >= thresholds.emailOpens) {
      thresholdsMet.push(`Email opens (${data.emailOpens}/${thresholds.emailOpens})`);
    }
    if (data.timeOnSite >= thresholds.timeOnSite) {
      thresholdsMet.push(`Time on site (${data.timeOnSite}/${thresholds.timeOnSite} mins)`);
    }

    const engagementScore = calculateEngagementScore(data);
    if (engagementScore >= thresholds.totalEngagementScore) {
      thresholdsMet.push(`Total engagement score (${engagementScore}/${thresholds.totalEngagementScore})`);
    }

    // Trigger if any 2+ thresholds met OR total engagement score threshold met
    const shouldTrigger = thresholdsMet.length >= 2 || engagementScore >= thresholds.totalEngagementScore;

    return { shouldTrigger, thresholdsMet };
  }, [calculateEngagementScore]);

  const triggerAnalysis = useCallback(async (
    lead: Record<string, any>,
    behaviouralData: BehaviouralData,
    triggeredBy: string,
    thresholdsMet: string[]
  ): Promise<AutoAnalysisResult | null> => {
    setIsAnalysing(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('analyze-lead', {
        body: {
          lead: {
            ...lead,
            brochureViews: behaviouralData.brochureViews,
            whatsappClicks: behaviouralData.whatsappClicks,
            emailOpens: behaviouralData.emailOpens,
            timeOnSite: behaviouralData.timeOnSite,
          },
        },
      });

      if (fnError) throw fnError;

      const result: AutoAnalysisResult = {
        insights: data.insights,
        analyzedAt: data.analyzedAt,
        triggeredBy,
        thresholdsMet,
      };

      setLastAnalysis(result);

      // Store analysis in localStorage
      const analysisKey = `lead_auto_analysis_${lead.id || lead.email}`;
      localStorage.setItem(analysisKey, JSON.stringify(result));

      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Analysis failed';
      setError(message);
      console.error('Auto-analysis error:', err);
      return null;
    } finally {
      setIsAnalysing(false);
    }
  }, []);

  const checkAndTriggerAnalysis = useCallback(async (
    lead: Record<string, any>,
    behaviouralData: BehaviouralData,
    eventType: string,
    thresholds?: EngagementThresholds
  ): Promise<AutoAnalysisResult | null> => {
    const { shouldTrigger, thresholdsMet } = checkThresholds(behaviouralData, thresholds);

    if (shouldTrigger) {
      // Check if already analysed recently (within 1 hour)
      const analysisKey = `lead_auto_analysis_${lead.id || lead.email}`;
      const existingAnalysis = localStorage.getItem(analysisKey);
      
      if (existingAnalysis) {
        const parsed = JSON.parse(existingAnalysis) as AutoAnalysisResult;
        const analysedAt = new Date(parsed.analyzedAt);
        const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
        
        if (analysedAt > hourAgo) {
          setLastAnalysis(parsed);
          return parsed;
        }
      }

      return triggerAnalysis(lead, behaviouralData, eventType, thresholdsMet);
    }

    return null;
  }, [checkThresholds, triggerAnalysis]);

  const loadExistingAnalysis = useCallback((leadId: string) => {
    const analysisKey = `lead_auto_analysis_${leadId}`;
    const existing = localStorage.getItem(analysisKey);
    if (existing) {
      setLastAnalysis(JSON.parse(existing));
    }
  }, []);

  return {
    isAnalysing,
    lastAnalysis,
    error,
    checkThresholds,
    checkAndTriggerAnalysis,
    triggerAnalysis,
    loadExistingAnalysis,
    calculateEngagementScore,
    DEFAULT_THRESHOLDS,
  };
}
