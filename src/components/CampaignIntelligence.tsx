import { useState } from 'react';
import { UploadZone } from '@/components/UploadZone';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Users, RefreshCw, AlertTriangle, CheckCircle, Lightbulb, PoundSterling, Target, Flame, Star, AlertCircle, XCircle, Clock, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { useUploadedData } from '@/contexts/DataContext';
import { ScrollArea } from '@/components/ui/scroll-area';

interface DeepInsight {
  category: string;
  insight: string;
  severity: 'critical' | 'warning' | 'info';
}

interface NextAction {
  action: string;
  priority: 'high' | 'medium' | 'low';
  expectedOutcome?: string;
}

interface Issue {
  title: string;
  description: string;
  impact: string;
  recommendation?: string;
}

interface Opportunity {
  title: string;
  description: string;
  potential: string;
  action?: string;
}

interface AnalysisResult {
  issues?: Issue[];
  opportunities?: Opportunity[];
  leadDistribution?: {
    hot: number;
    quality: number;
    valid: number;
    atRisk?: number;
    disqualified: number;
  };
  savingsIdentified?: number;
  nextActions?: NextAction[];
  summary?: string;
  keyMetrics?: {
    totalSpend?: number;
    totalLeads?: number;
    avgCPL?: number;
    bestPerformer?: string;
    worstPerformer?: string;
  };
  deepInsights?: DeepInsight[];
}

export function CampaignIntelligence() {
  const {
    campaignData,
    setCampaignData,
    campaignFileName,
    setCampaignFileName,
    leadData,
    setLeadData,
    leadFileName,
    setLeadFileName,
    clearCampaignData,
    clearLeadData,
  } = useUploadedData();

  const [isAnalyzingCampaigns, setIsAnalyzingCampaigns] = useState(false);
  const [isAnalyzingLeads, setIsAnalyzingLeads] = useState(false);
  const [campaignAnalysis, setCampaignAnalysis] = useState<AnalysisResult | null>(null);
  const [leadAnalysis, setLeadAnalysis] = useState<AnalysisResult | null>(null);

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
      setCampaignAnalysis(result);
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
      setLeadAnalysis(result);
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

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-destructive bg-destructive/10 border-destructive/30';
      case 'warning': return 'text-amber-500 bg-amber-500/10 border-amber-500/30';
      default: return 'text-blue-500 bg-blue-500/10 border-blue-500/30';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-destructive text-destructive-foreground';
      case 'medium': return 'bg-amber-500 text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const renderAnalysisResults = (analysis: AnalysisResult | null, isLoading: boolean, type: 'campaign' | 'lead') => {
    if (isLoading) {
      return (
        <div className="flex items-center gap-3 py-6">
          <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <div>
            <p className="text-sm text-foreground">Analysing your {type} data...</p>
            <p className="text-xs text-muted-foreground">This may take a moment</p>
          </div>
        </div>
      );
    }

    if (!analysis) return null;

    return (
      <ScrollArea className="h-[600px] pr-4">
        <div className="space-y-4">
          {/* Executive Summary */}
          {analysis.summary && (
            <div className="p-4 rounded-lg bg-muted/30 border border-border">
              <p className="text-sm text-foreground leading-relaxed">{analysis.summary}</p>
            </div>
          )}

          {/* Key Metrics */}
          {analysis.keyMetrics && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {analysis.keyMetrics.totalSpend !== undefined && (
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
                  <div className="flex items-center gap-1 mb-1">
                    <PoundSterling className="h-3 w-3 text-primary" />
                    <span className="text-[10px] text-primary uppercase font-medium">Total Spend</span>
                  </div>
                  <p className="text-lg font-bold text-foreground">£{analysis.keyMetrics.totalSpend.toLocaleString()}</p>
                </div>
              )}
              {analysis.keyMetrics.totalLeads !== undefined && (
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                  <div className="flex items-center gap-1 mb-1">
                    <Users className="h-3 w-3 text-green-500" />
                    <span className="text-[10px] text-green-500 uppercase font-medium">Total Leads</span>
                  </div>
                  <p className="text-lg font-bold text-foreground">{analysis.keyMetrics.totalLeads}</p>
                </div>
              )}
              {analysis.keyMetrics.avgCPL !== undefined && (
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                  <div className="flex items-center gap-1 mb-1">
                    <Target className="h-3 w-3 text-amber-500" />
                    <span className="text-[10px] text-amber-500 uppercase font-medium">Avg CPL</span>
                  </div>
                  <p className="text-lg font-bold text-foreground">£{analysis.keyMetrics.avgCPL}</p>
                </div>
              )}
            </div>
          )}

          {/* Best/Worst Performers */}
          {analysis.keyMetrics && (analysis.keyMetrics.bestPerformer || analysis.keyMetrics.worstPerformer) && (
            <div className="grid grid-cols-2 gap-2">
              {analysis.keyMetrics.bestPerformer && (
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                  <span className="text-[10px] text-green-500 uppercase font-medium">Best Performer</span>
                  <p className="text-sm font-medium text-foreground mt-1">{analysis.keyMetrics.bestPerformer}</p>
                </div>
              )}
              {analysis.keyMetrics.worstPerformer && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30">
                  <span className="text-[10px] text-destructive uppercase font-medium">Needs Attention</span>
                  <p className="text-sm font-medium text-foreground mt-1">{analysis.keyMetrics.worstPerformer}</p>
                </div>
              )}
            </div>
          )}

          {/* Lead Distribution */}
          {analysis.leadDistribution && (
            <div className="p-4 rounded-lg border border-border">
              <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Lead Quality Distribution
              </h4>
              <div className="grid grid-cols-5 gap-2">
                <div className="text-center p-2 rounded bg-orange-500/10">
                  <Flame className="h-4 w-4 text-orange-500 mx-auto mb-1" />
                  <p className="text-lg font-bold text-foreground">{analysis.leadDistribution.hot}</p>
                  <p className="text-[10px] text-muted-foreground">Hot</p>
                </div>
                <div className="text-center p-2 rounded bg-yellow-500/10">
                  <Star className="h-4 w-4 text-yellow-500 mx-auto mb-1" />
                  <p className="text-lg font-bold text-foreground">{analysis.leadDistribution.quality}</p>
                  <p className="text-[10px] text-muted-foreground">Quality</p>
                </div>
                <div className="text-center p-2 rounded bg-blue-500/10">
                  <CheckCircle className="h-4 w-4 text-blue-500 mx-auto mb-1" />
                  <p className="text-lg font-bold text-foreground">{analysis.leadDistribution.valid}</p>
                  <p className="text-[10px] text-muted-foreground">Valid</p>
                </div>
                <div className="text-center p-2 rounded bg-amber-500/10">
                  <AlertCircle className="h-4 w-4 text-amber-500 mx-auto mb-1" />
                  <p className="text-lg font-bold text-foreground">{analysis.leadDistribution.atRisk || 0}</p>
                  <p className="text-[10px] text-muted-foreground">At Risk</p>
                </div>
                <div className="text-center p-2 rounded bg-muted">
                  <XCircle className="h-4 w-4 text-muted-foreground mx-auto mb-1" />
                  <p className="text-lg font-bold text-foreground">{analysis.leadDistribution.disqualified}</p>
                  <p className="text-[10px] text-muted-foreground">Disqualified</p>
                </div>
              </div>
            </div>
          )}

          {/* Deep Insights */}
          {analysis.deepInsights && analysis.deepInsights.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Deep Insights
              </h4>
              {analysis.deepInsights.map((insight, i) => (
                <div key={i} className={`p-3 rounded-lg border ${getSeverityColor(insight.severity)}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">{insight.category}</Badge>
                    {insight.severity === 'critical' && <AlertTriangle className="h-3 w-3" />}
                  </div>
                  <p className="text-sm text-foreground">{insight.insight}</p>
                </div>
              ))}
            </div>
          )}

          {/* Issues */}
          {analysis.issues && analysis.issues.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                Issues to Address ({analysis.issues.length})
              </h4>
              {analysis.issues.map((issue, i) => (
                <div key={i} className="p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h5 className="text-sm font-medium text-foreground">{issue.title}</h5>
                    <Badge variant="destructive" className="text-[10px] shrink-0">{issue.impact}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{issue.description}</p>
                  {issue.recommendation && (
                    <p className="text-xs text-primary border-l-2 border-primary/50 pl-2 mt-2">
                      <strong>Fix:</strong> {issue.recommendation}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Opportunities */}
          {analysis.opportunities && analysis.opportunities.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                Opportunities ({analysis.opportunities.length})
              </h4>
              {analysis.opportunities.map((opp, i) => (
                <div key={i} className="p-3 rounded-lg bg-green-500/5 border border-green-500/20">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h5 className="text-sm font-medium text-foreground">{opp.title}</h5>
                    <Badge className="text-[10px] bg-green-500/20 text-green-500 shrink-0">{opp.potential}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{opp.description}</p>
                  {opp.action && (
                    <p className="text-xs text-green-600 border-l-2 border-green-500/50 pl-2 mt-2">
                      <strong>Action:</strong> {opp.action}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Next Actions */}
          {analysis.nextActions && analysis.nextActions.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Recommended Actions
              </h4>
              {analysis.nextActions.map((action, i) => (
                <div key={i} className="p-3 rounded-lg bg-muted/50 border border-border">
                  <div className="flex items-start gap-2">
                    <ArrowRight className={`h-4 w-4 mt-0.5 ${
                      action.priority === 'high' ? 'text-destructive' :
                      action.priority === 'medium' ? 'text-amber-500' : 'text-muted-foreground'
                    }`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm text-foreground">{action.action}</p>
                        <Badge className={`${getPriorityColor(action.priority)} text-[10px]`}>
                          {action.priority}
                        </Badge>
                      </div>
                      {action.expectedOutcome && (
                        <p className="text-xs text-muted-foreground">→ {action.expectedOutcome}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Savings */}
          {analysis.savingsIdentified !== undefined && analysis.savingsIdentified > 0 && (
            <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
              <div className="flex items-center gap-2">
                <PoundSterling className="h-5 w-5 text-amber-500" />
                <div>
                  <p className="text-sm font-medium text-foreground">Potential Savings Identified</p>
                  <p className="text-2xl font-bold text-amber-500">£{analysis.savingsIdentified.toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    );
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Campaign Data */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Campaign Analysis
            </CardTitle>
            {campaignAnalysis && !isAnalyzingCampaigns && (
              <Button 
                variant="ghost" 
                size="sm"
                className="h-8"
                onClick={() => analyzeCampaigns(campaignData)}
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Refresh
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <UploadZone
            label="Campaign Data"
            description="Upload your Meta Ads, Google Ads, or campaign export CSV"
            onDataParsed={handleCampaignData}
            isUploaded={campaignData.length > 0}
            fileName={campaignFileName}
            onClear={() => { clearCampaignData(); setCampaignAnalysis(null); }}
          />
          
          {renderAnalysisResults(campaignAnalysis, isAnalyzingCampaigns, 'campaign')}
        </CardContent>
      </Card>

      {/* Lead Data */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Lead Analysis
            </CardTitle>
            {leadAnalysis && !isAnalyzingLeads && (
              <Button 
                variant="ghost" 
                size="sm"
                className="h-8"
                onClick={() => analyzeLeads(leadData)}
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Refresh
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <UploadZone
            label="Lead Data"
            description="Upload your CRM export, lead list, or enquiry data CSV"
            onDataParsed={handleLeadData}
            isUploaded={leadData.length > 0}
            fileName={leadFileName}
            onClear={() => { clearLeadData(); setLeadAnalysis(null); }}
          />
          
          {renderAnalysisResults(leadAnalysis, isAnalyzingLeads, 'lead')}
        </CardContent>
      </Card>
    </div>
  );
}
