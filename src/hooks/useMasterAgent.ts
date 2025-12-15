import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface MasterAgentContext {
  leads?: Record<string, any>[];
  campaigns?: Record<string, any>[];
  metrics?: Record<string, any>;
}

export interface MasterAgentResponse {
  response: string;
  model: string;
}

export function useMasterAgent() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const askAgent = async (
    query: string, 
    context?: MasterAgentContext
  ): Promise<MasterAgentResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('master-agent', {
        body: { query, context }
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      return data as MasterAgentResponse;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get agent response';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Convenience methods for common queries
  const getDailyBriefing = async (context?: MasterAgentContext) => {
    return askAgent(
      "Give me today's daily briefing: urgent leads to contact, campaign alerts, pipeline summary, and top 3 priorities.",
      context
    );
  };

  const scoreLead = async (lead: Record<string, any>) => {
    return askAgent(
      "Score this lead and provide classification, SLA, recommended action, and any risk flags.",
      { leads: [lead] }
    );
  };

  const analyseCampaign = async (campaign: Record<string, any>, metrics?: Record<string, any>) => {
    return askAgent(
      "Analyse this campaign's performance against benchmarks. What's working, what's not, and what are the top 3 actions to take?",
      { campaigns: [campaign], metrics }
    );
  };

  const getPipelineForecast = async (context?: MasterAgentContext) => {
    return askAgent(
      "Provide a pipeline forecast: predicted conversions, estimated revenue by timeframe, pipeline gaps, and recommended lead generation targets.",
      context
    );
  };

  const getMarketInsights = async (context?: MasterAgentContext) => {
    return askAgent(
      "What are the key market insights? Identify trends in buyer behaviour, geographic demand patterns, and development performance comparisons.",
      context
    );
  };

  const getBudgetRecommendations = async (context?: MasterAgentContext) => {
    return askAgent(
      "Analyse spend efficiency and recommend specific budget shifts between campaigns with exact amounts and reasoning.",
      context
    );
  };

  return { 
    askAgent, 
    getDailyBriefing,
    scoreLead,
    analyseCampaign,
    getPipelineForecast,
    getMarketInsights,
    getBudgetRecommendations,
    isLoading, 
    error 
  };
}
