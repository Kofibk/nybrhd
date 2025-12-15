import { useState } from 'react';
import { UploadZone } from '@/components/UploadZone';
import { InsightsSummary } from '@/components/InsightsSummary';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Users, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useUploadedData } from '@/contexts/DataContext';

export function CampaignIntelligence() {
  const {
    campaignData,
    setCampaignData,
    campaignFileName,
    setCampaignFileName,
    campaignInsights,
    setCampaignInsights,
    leadData,
    setLeadData,
    leadFileName,
    setLeadFileName,
    leadInsights,
    setLeadInsights,
    clearCampaignData,
    clearLeadData,
  } = useUploadedData();

  const [isAnalyzingCampaigns, setIsAnalyzingCampaigns] = useState(false);
  const [isAnalyzingLeads, setIsAnalyzingLeads] = useState(false);

  const analyzeCampaigns = async (data: any[]) => {
    setIsAnalyzingCampaigns(true);
    try {
      const { data: result, error } = await supabase.functions.invoke('analyze-data', {
        body: {
          campaigns: data,
          leads: [],
          analysisType: 'campaigns'
        }
      });

      if (error) throw error;

      setCampaignInsights({
        recommendations: result.nextActions?.slice(0, 3).map((a: any) => a.action) || [],
        whatsWorking: result.opportunities?.slice(0, 3).map((o: any) => `${o.title}: ${o.description}`) || [],
        summary: result.summary || ''
      });
    } catch (error) {
      console.error('Campaign analysis error:', error);
      toast.error('Campaign analysis failed');
    } finally {
      setIsAnalyzingCampaigns(false);
    }
  };

  const analyzeLeads = async (data: any[]) => {
    setIsAnalyzingLeads(true);
    try {
      const { data: result, error } = await supabase.functions.invoke('analyze-data', {
        body: {
          campaigns: [],
          leads: data,
          analysisType: 'leads'
        }
      });

      if (error) throw error;

      setLeadInsights({
        recommendations: result.nextActions?.slice(0, 3).map((a: any) => a.action) || [],
        whatsWorking: result.opportunities?.slice(0, 3).map((o: any) => `${o.title}: ${o.description}`) || [],
        summary: result.summary || ''
      });
    } catch (error) {
      console.error('Lead analysis error:', error);
      toast.error('Lead analysis failed');
    } finally {
      setIsAnalyzingLeads(false);
    }
  };

  const handleCampaignData = (data: any[], fileName: string) => {
    setCampaignData(data);
    setCampaignFileName(fileName);
    toast.success(`Loaded ${data.length} campaigns`);
    analyzeCampaigns(data);
  };

  const handleLeadData = (data: any[], fileName: string) => {
    setLeadData(data);
    setLeadFileName(fileName);
    toast.success(`Loaded ${data.length} leads`);
    analyzeLeads(data);
  };

  const hasAnyData = campaignData.length > 0 || leadData.length > 0;

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {/* Campaign Data */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Campaign Data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <UploadZone
            label="Campaign Data"
            description="Meta, Google Ads export"
            onDataParsed={handleCampaignData}
            isUploaded={campaignData.length > 0}
            fileName={campaignFileName}
            onClear={clearCampaignData}
          />
          
          {isAnalyzingCampaigns && (
            <div className="flex items-center gap-2 py-2">
              <div className="h-3 w-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-muted-foreground">Analysing...</span>
            </div>
          )}

          {campaignInsights && !isAnalyzingCampaigns && (
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs text-muted-foreground line-clamp-2">{campaignInsights.summary}</p>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-6 w-6 shrink-0"
                  onClick={() => analyzeCampaigns(campaignData)}
                >
                  <RefreshCw className="h-3 w-3" />
                </Button>
              </div>
              <InsightsSummary
                recommendations={campaignInsights.recommendations}
                whatsWorking={campaignInsights.whatsWorking}
                compact
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lead Data */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            Lead Data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <UploadZone
            label="Lead Data"
            description="CRM export or lead list"
            onDataParsed={handleLeadData}
            isUploaded={leadData.length > 0}
            fileName={leadFileName}
            onClear={clearLeadData}
          />
          
          {isAnalyzingLeads && (
            <div className="flex items-center gap-2 py-2">
              <div className="h-3 w-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-muted-foreground">Analysing...</span>
            </div>
          )}

          {leadInsights && !isAnalyzingLeads && (
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs text-muted-foreground line-clamp-2">{leadInsights.summary}</p>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-6 w-6 shrink-0"
                  onClick={() => analyzeLeads(leadData)}
                >
                  <RefreshCw className="h-3 w-3" />
                </Button>
              </div>
              <InsightsSummary
                recommendations={leadInsights.recommendations}
                whatsWorking={leadInsights.whatsWorking}
                compact
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
