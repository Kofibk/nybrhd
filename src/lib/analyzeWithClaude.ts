import { supabase } from '@/integrations/supabase/client';
import type { AnalysisResult } from '@/components/DataAnalysis';

export async function analyzeWithClaude(
  campaignData: any[],
  leadData: any[]
): Promise<AnalysisResult> {
  const { data, error } = await supabase.functions.invoke('analyze-data', {
    body: {
      campaigns: campaignData,
      leads: leadData
    }
  });

  if (error) {
    throw new Error(error.message || 'Analysis failed');
  }

  return data as AnalysisResult;
}
