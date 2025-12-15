import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCampaignAnalysis, CampaignAnalysisResult } from '@/hooks/useCampaignAnalysis';
import { Loader2, AlertTriangle, TrendingUp, TrendingDown, Target, PoundSterling, BarChart3, Lightbulb, Ban } from 'lucide-react';

interface CampaignAnalysisCardProps {
  campaign: Record<string, any>;
  onAnalysisComplete?: (result: CampaignAnalysisResult) => void;
}

export function CampaignAnalysisCard({ campaign, onAnalysisComplete }: CampaignAnalysisCardProps) {
  const { analyzeCampaign, isLoading, error } = useCampaignAnalysis();
  const [result, setResult] = useState<CampaignAnalysisResult | null>(null);

  const handleAnalyze = async () => {
    const analysisResult = await analyzeCampaign(campaign);
    if (analysisResult) {
      setResult(analysisResult);
      onAnalysisComplete?.(analysisResult);
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return 'bg-green-500';
      case 'good': return 'bg-blue-500';
      case 'needs_attention': return 'bg-yellow-500';
      case 'poor': return 'bg-red-500';
      default: return 'bg-muted';
    }
  };

  const getCPLColor = (rating: string) => {
    switch (rating) {
      case 'excellent': return 'text-green-500';
      case 'good': return 'text-blue-500';
      case 'acceptable': return 'text-yellow-500';
      case 'poor': return 'text-red-500';
      default: return 'text-muted-foreground';
    }
  };

  const getPerformanceIcon = (performance: string) => {
    switch (performance) {
      case 'above_benchmark': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'below_benchmark': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Target className="h-4 w-4 text-yellow-500" />;
    }
  };

  if (!result) {
    return (
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Campaign Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Analyse this campaign using AI-powered performance benchmarking
            </p>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <Button onClick={handleAnalyze} disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analysing...
                </>
              ) : (
                'Analyse Campaign'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Campaign Analysis
          </CardTitle>
          <Badge className={getHealthColor(result.campaign_health)}>
            {result.campaign_health.replace('_', ' ')}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary */}
        <p className="text-sm text-muted-foreground">{result.summary}</p>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground">Total Spend</p>
            <p className="text-lg font-bold">£{result.metrics.total_spend.toLocaleString()}</p>
          </div>
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground">Total Leads</p>
            <p className="text-lg font-bold">{result.metrics.total_leads}</p>
          </div>
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground">CPL</p>
            <p className={`text-lg font-bold ${getCPLColor(result.metrics.cpl_rating)}`}>
              £{result.metrics.cpl.toFixed(2)}
            </p>
          </div>
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground">CTR</p>
            <p className={`text-lg font-bold ${result.metrics.ctr_rating === 'good' ? 'text-green-500' : 'text-yellow-500'}`}>
              {result.metrics.ctr.toFixed(2)}%
            </p>
          </div>
        </div>

        {/* Platform Breakdown */}
        {result.platform_breakdown.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Platform Performance</h4>
            <div className="space-y-2">
              {result.platform_breakdown.map((platform, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                  <div className="flex items-center gap-2">
                    {getPerformanceIcon(platform.performance)}
                    <span className="text-sm font-medium">{platform.platform}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span>£{platform.spend.toLocaleString()} spend</span>
                    <span>{platform.leads} leads</span>
                    <span className="font-medium">£{platform.cpl.toFixed(2)} CPL</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lead Quality Summary */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Lead Quality</h4>
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2 bg-green-500/10 rounded text-center">
              <p className="text-lg font-bold text-green-500">{result.lead_quality_summary.hot_leads}</p>
              <p className="text-xs text-muted-foreground">Hot</p>
            </div>
            <div className="p-2 bg-yellow-500/10 rounded text-center">
              <p className="text-lg font-bold text-yellow-500">{result.lead_quality_summary.warm_leads}</p>
              <p className="text-xs text-muted-foreground">Warm</p>
            </div>
            <div className="p-2 bg-muted rounded text-center">
              <p className="text-lg font-bold">{result.lead_quality_summary.cold_leads}</p>
              <p className="text-xs text-muted-foreground">Cold</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            {result.lead_quality_summary.qualified_rate}% qualified rate ({result.lead_quality_summary.qualified_leads}/{result.lead_quality_summary.total_leads})
          </p>
        </div>

        {/* Top Performers */}
        {result.top_performing_elements.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              Top Performers
            </h4>
            <div className="space-y-2">
              {result.top_performing_elements.map((elem, i) => (
                <div key={i} className="p-2 bg-green-500/10 rounded">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{elem.name}</span>
                    <Badge variant="outline" className="text-green-500">£{elem.cpl.toFixed(2)} CPL</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{elem.why_working}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Underperformers */}
        {result.underperforming_elements.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-500" />
              Underperformers
            </h4>
            <div className="space-y-2">
              {result.underperforming_elements.map((elem, i) => (
                <div key={i} className="p-2 bg-red-500/10 rounded">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{elem.name}</span>
                    <Badge variant="outline" className="text-red-500">£{elem.cpl.toFixed(2)} CPL</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{elem.issue}</p>
                  <p className="text-xs text-primary mt-1">→ {elem.recommendation}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Warnings */}
        {result.warnings.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-4 w-4" />
              Warnings
            </h4>
            {result.warnings.map((warning, i) => (
              <div key={i} className={`p-2 rounded ${warning.severity === 'high' ? 'bg-destructive/10' : 'bg-yellow-500/10'}`}>
                <p className="text-sm font-medium">{warning.issue}</p>
                <p className="text-xs text-muted-foreground">→ {warning.action}</p>
              </div>
            ))}
          </div>
        )}

        {/* Recommendations */}
        {result.recommendations.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-yellow-500" />
              Recommendations
            </h4>
            <div className="space-y-2">
              {result.recommendations.sort((a, b) => a.priority - b.priority).map((rec, i) => (
                <div key={i} className="p-3 bg-muted rounded">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs">P{rec.priority}</Badge>
                    <Badge variant="secondary" className="text-xs capitalize">{rec.type}</Badge>
                  </div>
                  <p className="text-sm font-medium">{rec.action}</p>
                  <p className="text-xs text-muted-foreground mt-1">{rec.rationale}</p>
                  <p className="text-xs text-green-500 mt-1">Expected: {rec.expected_impact}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Budget Recommendation */}
        <div className="p-3 bg-primary/10 rounded-lg">
          <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
            <PoundSterling className="h-4 w-4" />
            Budget Recommendation
          </h4>
          <div className="flex items-center gap-4 mb-2">
            <div>
              <p className="text-xs text-muted-foreground">Current Daily</p>
              <p className="font-medium">£{result.budget_recommendation.current_daily}</p>
            </div>
            <span className="text-muted-foreground">→</span>
            <div>
              <p className="text-xs text-muted-foreground">Recommended</p>
              <p className="font-medium text-primary">£{result.budget_recommendation.recommended_daily}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">{result.budget_recommendation.reasoning}</p>
        </div>

        {/* Excluded Data */}
        {(result.excluded_data.audience_network_leads > 0 || result.excluded_data.audience_network_spend > 0) && (
          <div className="p-2 bg-muted rounded flex items-start gap-2">
            <Ban className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-xs font-medium">Excluded: Audience Network</p>
              <p className="text-xs text-muted-foreground">
                {result.excluded_data.audience_network_leads} leads, £{result.excluded_data.audience_network_spend} spend excluded
              </p>
            </div>
          </div>
        )}

        <Button variant="outline" onClick={handleAnalyze} disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Re-analysing...
            </>
          ) : (
            'Re-analyse Campaign'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
