import { useState } from 'react';
import { UploadZone } from '@/components/UploadZone';
import { DataAnalysis, AnalysisResult } from '@/components/DataAnalysis';
import { AIInsightsChat } from '@/components/AIInsightsChat';
import { InsightsSummary } from '@/components/InsightsSummary';
import { analyzeWithClaude } from '@/lib/analyzeWithClaude';
import { Button } from '@/components/ui/button';
import { Sparkles, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export function CampaignIntelligence() {
  const [campaignData, setCampaignData] = useState<any[]>([]);
  const [campaignFileName, setCampaignFileName] = useState<string>('');
  const [leadData, setLeadData] = useState<any[]>([]);
  const [leadFileName, setLeadFileName] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  const handleCampaignData = (data: any[], fileName: string) => {
    setCampaignData(data);
    setCampaignFileName(fileName);
    toast.success(`Loaded ${data.length} campaigns`);
  };

  const handleLeadData = (data: any[], fileName: string) => {
    setLeadData(data);
    setLeadFileName(fileName);
    toast.success(`Loaded ${data.length} leads`);
  };

  const handleAnalyze = async () => {
    if (campaignData.length === 0 && leadData.length === 0) {
      toast.error('Please upload at least one CSV file');
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await analyzeWithClaude(campaignData, leadData);
      setAnalysis(result);
      toast.success('Analysis complete');
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setCampaignData([]);
    setCampaignFileName('');
    setLeadData([]);
    setLeadFileName('');
    setAnalysis(null);
  };

  const hasData = campaignData.length > 0 || leadData.length > 0;

  // Extract recommendations and what's working from analysis
  const recommendations = analysis?.nextActions?.map(a => a.action) || [];
  const whatsWorking = analysis?.opportunities?.map(o => o.title + ': ' + o.description) || [];

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Campaign Intelligence</h2>
            <p className="text-sm text-muted-foreground">
              Upload your data for AI-powered analysis
            </p>
          </div>
          {analysis && (
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RefreshCw className="h-4 w-4 mr-2" />
              New Analysis
            </Button>
          )}
        </div>

        {/* Upload Zones */}
        <div className="grid md:grid-cols-2 gap-4">
          <UploadZone
            label="Campaign Data"
            description="Export from Meta, Google Ads, etc."
            onDataParsed={handleCampaignData}
            isUploaded={campaignData.length > 0}
            fileName={campaignFileName}
            onClear={() => { setCampaignData([]); setCampaignFileName(''); }}
          />
          <UploadZone
            label="Lead Data"
            description="Your CRM export or lead list"
            onDataParsed={handleLeadData}
            isUploaded={leadData.length > 0}
            fileName={leadFileName}
            onClear={() => { setLeadData([]); setLeadFileName(''); }}
          />
        </div>

        {/* Data Summary & Analyze Button */}
        {hasData && !analysis && (
          <div className="flex flex-col items-center gap-3">
            <div className="text-sm text-muted-foreground">
              {campaignData.length > 0 && <span>{campaignData.length} campaigns</span>}
              {campaignData.length > 0 && leadData.length > 0 && <span> • </span>}
              {leadData.length > 0 && <span>{leadData.length} leads</span>}
            </div>
            <Button
              size="lg"
              onClick={handleAnalyze}
              disabled={!hasData || isAnalyzing}
              className="min-w-[200px]"
            >
              {isAnalyzing ? (
                <>
                  <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                  Analysing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Analyse Data
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Analysis Results */}
      {analysis && (
        <>
          <DataAnalysis analysis={analysis} />
          
          {/* Insights Summary - What's Working & Recommendations */}
          <InsightsSummary 
            recommendations={recommendations}
            whatsWorking={whatsWorking}
          />

          {/* AI Chat */}
          <AIInsightsChat
            campaignData={campaignData}
            leadData={leadData}
            analysisContext={analysis.summary}
          />
        </>
      )}

      {/* Show chat even without analysis if data is uploaded */}
      {hasData && !analysis && (
        <AIInsightsChat
          campaignData={campaignData}
          leadData={leadData}
        />
      )}
    </div>
  );
}
