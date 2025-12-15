import { useState } from 'react';
import { UploadZone } from '@/components/UploadZone';
import { AIInsightsChat } from '@/components/AIInsightsChat';
import { InsightsSummary } from '@/components/InsightsSummary';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, TrendingUp, Users, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface DataInsights {
  recommendations: string[];
  whatsWorking: string[];
  summary: string;
}

export function CampaignIntelligence() {
  const [campaignData, setCampaignData] = useState<any[]>([]);
  const [campaignFileName, setCampaignFileName] = useState<string>('');
  const [campaignInsights, setCampaignInsights] = useState<DataInsights | null>(null);
  const [isAnalyzingCampaigns, setIsAnalyzingCampaigns] = useState(false);

  const [leadData, setLeadData] = useState<any[]>([]);
  const [leadFileName, setLeadFileName] = useState<string>('');
  const [leadInsights, setLeadInsights] = useState<DataInsights | null>(null);
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

  const handleClearCampaigns = () => {
    setCampaignData([]);
    setCampaignFileName('');
    setCampaignInsights(null);
  };

  const handleClearLeads = () => {
    setLeadData([]);
    setLeadFileName('');
    setLeadInsights(null);
  };

  const hasAnyData = campaignData.length > 0 || leadData.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-foreground">Campaign Intelligence</h2>
        <p className="text-sm text-muted-foreground">
          Upload your data for AI-powered analysis and insights
        </p>
      </div>

      {/* Campaign Data Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Campaign Data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <UploadZone
            label="Campaign Data"
            description="Export from Meta, Google Ads, etc."
            onDataParsed={handleCampaignData}
            isUploaded={campaignData.length > 0}
            fileName={campaignFileName}
            onClear={handleClearCampaigns}
          />
          
          {isAnalyzingCampaigns && (
            <div className="flex items-center justify-center gap-2 py-4">
              <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-muted-foreground">Analysing campaigns...</span>
            </div>
          )}

          {campaignInsights && !isAnalyzingCampaigns && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{campaignInsights.summary}</p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => analyzeCampaigns(campaignData)}
                  className="shrink-0"
                >
                  <RefreshCw className="h-4 w-4" />
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

      {/* Lead Data Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Lead Data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <UploadZone
            label="Lead Data"
            description="Your CRM export or lead list"
            onDataParsed={handleLeadData}
            isUploaded={leadData.length > 0}
            fileName={leadFileName}
            onClear={handleClearLeads}
          />
          
          {isAnalyzingLeads && (
            <div className="flex items-center justify-center gap-2 py-4">
              <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-muted-foreground">Analysing leads...</span>
            </div>
          )}

          {leadInsights && !isAnalyzingLeads && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{leadInsights.summary}</p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => analyzeLeads(leadData)}
                  className="shrink-0"
                >
                  <RefreshCw className="h-4 w-4" />
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

      {/* Persistent AI Chat */}
      <Card>
        <CardHeader className="pb-3 border-b">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Assistant
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Ask questions, get insights, or take actions on your data
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <AIInsightsChat
            campaignData={campaignData}
            leadData={leadData}
            analysisContext={[campaignInsights?.summary, leadInsights?.summary].filter(Boolean).join(' ')}
          />
        </CardContent>
      </Card>
    </div>
  );
}
