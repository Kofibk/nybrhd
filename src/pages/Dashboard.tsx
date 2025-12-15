import { useState } from 'react';
import { UploadZone } from '@/components/UploadZone';
import { DataAnalysis, AnalysisResult } from '@/components/DataAnalysis';
import { analyzeWithClaude } from '@/lib/analyzeWithClaude';
import { Button } from '@/components/ui/button';
import { Sparkles, RefreshCw, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import naybourhoodLogo from '@/assets/naybourhood-logo-white.svg';

export default function Dashboard() {
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/landing">
            <img src={naybourhoodLogo} alt="Naybourhood" className="h-8" />
          </Link>
          {analysis && (
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RefreshCw className="h-4 w-4 mr-2" />
              New Analysis
            </Button>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {!analysis ? (
          <div className="space-y-8">
            {/* Title */}
            <div className="text-center">
              <h1 className="text-3xl font-bold text-foreground">Campaign Intelligence</h1>
              <p className="text-muted-foreground mt-2">
                Upload your data for AI-powered analysis and recommendations
              </p>
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

            {/* Data Summary */}
            {hasData && (
              <div className="text-center text-sm text-muted-foreground">
                {campaignData.length > 0 && <span>{campaignData.length} campaigns</span>}
                {campaignData.length > 0 && leadData.length > 0 && <span> • </span>}
                {leadData.length > 0 && <span>{leadData.length} leads</span>}
              </div>
            )}

            {/* Analyze Button */}
            <div className="flex justify-center">
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
          </div>
        ) : (
          <div className="space-y-6">
            {/* Back Link */}
            <button
              onClick={handleReset}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Upload different data
            </button>

            {/* Analysis Results */}
            <DataAnalysis analysis={analysis} />
          </div>
        )}
      </main>
    </div>
  );
}
