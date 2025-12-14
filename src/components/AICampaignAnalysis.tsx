import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Loader2,
  RefreshCw,
  Target,
  DollarSign,
  Users,
  Palette,
  Clock,
  ChevronRight,
  Check,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Campaign {
  id?: string;
  name: string;
  budget?: number;
  spent?: number;
  leads?: number;
  cpl?: number;
  status?: string;
  startDate?: string;
}

interface Recommendation {
  priority: "high" | "medium" | "low";
  category: string;
  title: string;
  description: string;
  expectedImpact: string;
  action: string;
  applied?: boolean;
}

interface AnalysisResult {
  overallHealth: "excellent" | "good" | "needs_attention" | "critical";
  recommendations: Recommendation[];
  budgetSuggestion?: {
    current: number;
    recommended: number;
    reasoning: string;
  };
  audienceInsights?: string[];
  creativeInsights?: string[];
}

interface AICampaignAnalysisProps {
  campaigns?: Campaign[];
  userType: "developer" | "agent" | "broker" | "admin";
  compact?: boolean;
  onApplyRecommendation?: (recommendation: Recommendation, campaignId?: string) => void;
}

const AICampaignAnalysis = ({ campaigns = [], userType, compact = false, onApplyRecommendation }: AICampaignAnalysisProps) => {
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [applyingIndex, setApplyingIndex] = useState<number | null>(null);
  const [appliedRecommendations, setAppliedRecommendations] = useState<Set<number>>(new Set());

  // Sample campaigns if none provided
  const sampleCampaigns: Campaign[] = campaigns.length > 0 ? campaigns : [
    { name: "Meta Ads - Lagos HNW", budget: 2500, spent: 1800, leads: 87, cpl: 20.69, status: "active" },
    { name: "Google Ads - UK Investors", budget: 1800, spent: 1200, leads: 45, cpl: 26.67, status: "active" },
    { name: "LinkedIn - Dubai Expats", budget: 1200, spent: 800, leads: 25, cpl: 32.00, status: "paused" },
  ];

  const runAnalysis = async () => {
    setIsAnalysing(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('ai-campaign-intelligence', {
        body: {
          action: 'recommendations',
          campaign: sampleCampaigns[0],
          campaigns: sampleCampaigns,
          metrics: {
            totalLeads: sampleCampaigns.reduce((sum, c) => sum + (c.leads || 0), 0),
            totalSpent: sampleCampaigns.reduce((sum, c) => sum + (c.spent || 0), 0),
            avgCPL: sampleCampaigns.reduce((sum, c) => sum + (c.cpl || 0), 0) / sampleCampaigns.length,
          },
        },
      });

      if (fnError) throw fnError;
      if (data.error) throw new Error(data.error);

      setAnalysisResult(data);
      toast({
        title: "Analysis complete",
        description: "AI has generated optimisation recommendations.",
      });
    } catch (err: any) {
      console.error("Analysis error:", err);
      setError(err.message || "Failed to analyse campaigns");
      toast({
        title: "Analysis failed",
        description: err.message || "Could not complete AI analysis.",
        variant: "destructive",
      });
    } finally {
      setIsAnalysing(false);
      setAppliedRecommendations(new Set());
    }
  };

  const applyRecommendation = async (recommendation: Recommendation, index: number) => {
    setApplyingIndex(index);
    
    try {
      // Simulate applying the recommendation
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Call the callback if provided
      if (onApplyRecommendation) {
        onApplyRecommendation(recommendation, sampleCampaigns[0]?.id);
      }
      
      // Mark as applied
      setAppliedRecommendations(prev => new Set([...prev, index]));
      
      toast({
        title: "Recommendation Applied",
        description: `${recommendation.title} has been applied to your campaign.`,
      });
    } catch (err: any) {
      toast({
        title: "Failed to Apply",
        description: err.message || "Could not apply recommendation.",
        variant: "destructive",
      });
    } finally {
      setApplyingIndex(null);
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case "excellent": return "text-green-500";
      case "good": return "text-blue-500";
      case "needs_attention": return "text-yellow-500";
      case "critical": return "text-red-500";
      default: return "text-muted-foreground";
    }
  };

  const getHealthBg = (health: string) => {
    switch (health) {
      case "excellent": return "bg-green-500/10";
      case "good": return "bg-blue-500/10";
      case "needs_attention": return "bg-yellow-500/10";
      case "critical": return "bg-red-500/10";
      default: return "bg-muted";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "destructive";
      case "medium": return "default";
      case "low": return "secondary";
      default: return "outline";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "budget": return <DollarSign className="h-4 w-4" />;
      case "targeting": return <Target className="h-4 w-4" />;
      case "creative": return <Palette className="h-4 w-4" />;
      case "audience": return <Users className="h-4 w-4" />;
      case "timing": return <Clock className="h-4 w-4" />;
      default: return <Sparkles className="h-4 w-4" />;
    }
  };

  if (compact) {
    return (
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              AI Campaign Analysis
            </CardTitle>
            <Button
              size="sm"
              variant="outline"
              onClick={runAnalysis}
              disabled={isAnalysing}
              className="h-8"
            >
              {isAnalysing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Analyse
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!analysisResult && !isAnalysing && !error && (
            <p className="text-sm text-muted-foreground">
              Click Analyse to get AI-powered optimisation recommendations for your campaigns.
            </p>
          )}
          
          {isAnalysing && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Analysing campaign performance...
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          {analysisResult && (
            <div className="space-y-3">
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${getHealthBg(analysisResult.overallHealth)}`}>
                {analysisResult.overallHealth === "excellent" || analysisResult.overallHealth === "good" ? (
                  <CheckCircle className={`h-4 w-4 ${getHealthColor(analysisResult.overallHealth)}`} />
                ) : (
                  <AlertCircle className={`h-4 w-4 ${getHealthColor(analysisResult.overallHealth)}`} />
                )}
                <span className={`text-sm font-medium capitalize ${getHealthColor(analysisResult.overallHealth)}`}>
                  {analysisResult.overallHealth.replace("_", " ")}
                </span>
              </div>

              {analysisResult.recommendations.slice(0, 2).map((rec, i) => (
                <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-muted/30">
                  {getCategoryIcon(rec.category)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{rec.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{rec.description}</p>
                  </div>
                  {appliedRecommendations.has(i) ? (
                    <Badge variant="outline" className="text-xs bg-green-500/10 text-green-500 border-green-500/30">
                      <Check className="h-3 w-3 mr-1" />
                      Applied
                    </Badge>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 text-xs px-2"
                      onClick={() => applyRecommendation(rec, i)}
                      disabled={applyingIndex === i}
                    >
                      {applyingIndex === i ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        "Apply"
                      )}
                    </Button>
                  )}
                </div>
              ))}

              {analysisResult.recommendations.length > 2 && (
                <p className="text-xs text-muted-foreground">
                  +{analysisResult.recommendations.length - 2} more recommendations
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Campaign Performance Analysis
          </CardTitle>
          <Button
            onClick={runAnalysis}
            disabled={isAnalysing}
            className="gap-2"
          >
            {isAnalysing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analysing...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Run AI Analysis
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!analysisResult && !isAnalysing && !error && (
          <div className="text-center py-8">
            <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Get AI-Powered Insights</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
              Our AI will analyse your campaign performance and provide actionable optimisation recommendations to improve CPL, targeting, and creative effectiveness.
            </p>
            <Button onClick={runAnalysis} className="gap-2">
              <Sparkles className="h-4 w-4" />
              Analyse My Campaigns
            </Button>
          </div>
        )}

        {isAnalysing && (
          <div className="text-center py-8">
            <Loader2 className="h-12 w-12 mx-auto text-primary animate-spin mb-4" />
            <h3 className="text-lg font-medium mb-2">Analysing Campaign Data</h3>
            <p className="text-sm text-muted-foreground">
              AI is reviewing performance metrics, audience signals, and creative effectiveness...
            </p>
            <Progress value={66} className="max-w-xs mx-auto mt-4" />
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
            <h3 className="text-lg font-medium mb-2">Analysis Failed</h3>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button variant="outline" onClick={runAnalysis}>
              Try Again
            </Button>
          </div>
        )}

        {analysisResult && (
          <div className="space-y-6">
            {/* Health Score */}
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${getHealthBg(analysisResult.overallHealth)}`}>
                {analysisResult.overallHealth === "excellent" || analysisResult.overallHealth === "good" ? (
                  <CheckCircle className={`h-5 w-5 ${getHealthColor(analysisResult.overallHealth)}`} />
                ) : (
                  <AlertCircle className={`h-5 w-5 ${getHealthColor(analysisResult.overallHealth)}`} />
                )}
                <span className={`font-semibold capitalize ${getHealthColor(analysisResult.overallHealth)}`}>
                  Campaign Health: {analysisResult.overallHealth.replace("_", " ")}
                </span>
              </div>
              <Button variant="ghost" size="sm" onClick={runAnalysis} className="gap-1">
                <RefreshCw className="h-3 w-3" />
                Refresh
              </Button>
            </div>

            {/* Budget Suggestion */}
            {analysisResult.budgetSuggestion && (
              <Card className="bg-muted/30 border-primary/20">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <DollarSign className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-medium mb-1">Budget Recommendation</h4>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm text-muted-foreground">
                          Current: £{analysisResult.budgetSuggestion.current.toLocaleString()}
                        </span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-primary">
                          Recommended: £{analysisResult.budgetSuggestion.recommended.toLocaleString()}
                        </span>
                        {analysisResult.budgetSuggestion.recommended > analysisResult.budgetSuggestion.current ? (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-orange-500" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{analysisResult.budgetSuggestion.reasoning}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recommendations */}
            <div>
              <h4 className="font-medium mb-3">Optimisation Recommendations</h4>
              <ScrollArea className="h-[280px]">
                <div className="space-y-3 pr-4">
                  {analysisResult.recommendations.map((rec, i) => (
                    <Card key={i} className="bg-muted/20">
                      <CardContent className="pt-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            {getCategoryIcon(rec.category)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h5 className="font-medium">{rec.title}</h5>
                              <Badge variant={getPriorityColor(rec.priority)} className="text-xs">
                                {rec.priority}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{rec.description}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">
                                Expected impact: {rec.expectedImpact}
                              </span>
                              {appliedRecommendations.has(i) ? (
                                <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30 text-xs">
                                  <Check className="h-3 w-3 mr-1" />
                                  Applied
                                </Badge>
                              ) : (
                                <Button 
                                  variant="default" 
                                  size="sm" 
                                  className="h-7 text-xs gap-1"
                                  onClick={() => applyRecommendation(rec, i)}
                                  disabled={applyingIndex === i}
                                >
                                  {applyingIndex === i ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <>
                                      <Check className="h-3 w-3" />
                                      Apply Now
                                    </>
                                  )}
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Insights */}
            <div className="grid md:grid-cols-2 gap-4">
              {analysisResult.audienceInsights && analysisResult.audienceInsights.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Audience Insights
                  </h4>
                  <ul className="space-y-1">
                    {analysisResult.audienceInsights.map((insight, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-primary">•</span>
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {analysisResult.creativeInsights && analysisResult.creativeInsights.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    Creative Insights
                  </h4>
                  <ul className="space-y-1">
                    {analysisResult.creativeInsights.map((insight, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-primary">•</span>
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AICampaignAnalysis;
