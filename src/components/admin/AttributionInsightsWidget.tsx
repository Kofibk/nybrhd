import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Brain,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  TrendingUp,
  AlertTriangle,
  Target,
  Image,
  Type,
  Monitor,
  Smartphone,
  BarChart3,
  ArrowRight,
  Sparkles,
  X,
} from "lucide-react";
import {
  MOCK_ATTRIBUTION_INSIGHTS,
  type AttributionInsight,
} from "@/lib/hybridSignalData";

interface AttributionInsightsWidgetProps {
  onApplyRecommendation?: (insight: AttributionInsight) => void;
  onDismiss?: () => void;
  compact?: boolean;
}

// Extended mock data for the widget
const EXTENDED_INSIGHTS: AttributionInsight[] = [
  ...MOCK_ATTRIBUTION_INSIGHTS,
  {
    type: "audience",
    title: "Audience Quality Gap",
    finding: "First-Time Buyer cluster has highest volume (58%) but lowest deal rate (4.2%). Investor cluster converts at 18.5%.",
    recommendation: "Shift 15% budget from First-Time Buyer to Investor cluster for higher ROI.",
    impact: "medium",
    budgetShiftSuggestion: { from: "First-Time Buyer", to: "UK Property Investor", percentage: 15 }
  },
  {
    type: "creative",
    title: "Video Outperforms Static",
    finding: "UGC videos drive 2.3x higher engagement but 0.8x lower deal rate than static floorplan images.",
    recommendation: "Use video for awareness, static for retargeting qualified leads.",
    impact: "medium"
  }
];

const AttributionInsightsWidget = ({ 
  onApplyRecommendation, 
  onDismiss,
  compact = false 
}: AttributionInsightsWidgetProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dismissedInsights, setDismissedInsights] = useState<string[]>([]);
  const [appliedInsights, setAppliedInsights] = useState<string[]>([]);

  const activeInsights = EXTENDED_INSIGHTS.filter(
    (_, i) => !dismissedInsights.includes(i.toString()) && !appliedInsights.includes(i.toString())
  );

  const currentInsight = activeInsights[currentIndex % activeInsights.length];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "creative": return Image;
      case "headline": return Type;
      case "device": return Monitor;
      case "audience": return Target;
      default: return Brain;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high": return "bg-red-500/10 text-red-500 border-red-500/20";
      case "medium": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "low": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const handleApply = () => {
    if (currentInsight) {
      const insightIndex = EXTENDED_INSIGHTS.findIndex(i => i.title === currentInsight.title);
      setAppliedInsights(prev => [...prev, insightIndex.toString()]);
      onApplyRecommendation?.(currentInsight);
    }
  };

  const handleDismiss = () => {
    if (currentInsight) {
      const insightIndex = EXTENDED_INSIGHTS.findIndex(i => i.title === currentInsight.title);
      setDismissedInsights(prev => [...prev, insightIndex.toString()]);
    }
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev + 1) % activeInsights.length);
  };

  const handlePrev = () => {
    setCurrentIndex(prev => (prev - 1 + activeInsights.length) % activeInsights.length);
  };

  if (activeInsights.length === 0) {
    return (
      <Card className="p-4 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/20">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/20 rounded-lg">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          </div>
          <div>
            <p className="font-medium text-sm">All Caught Up!</p>
            <p className="text-xs text-muted-foreground">
              You've reviewed all attribution insights. New insights will appear as data comes in.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  if (!currentInsight) return null;

  const TypeIcon = getTypeIcon(currentInsight.type);

  if (compact) {
    return (
      <Card className="p-3 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-primary/20 rounded-lg flex-shrink-0">
            <Brain className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate">{currentInsight.title}</p>
            <p className="text-[10px] text-muted-foreground truncate">{currentInsight.recommendation}</p>
          </div>
          <div className="flex items-center gap-1">
            <Button size="sm" variant="default" className="h-6 text-[10px] px-2">
              Apply
            </Button>
            <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={handleDismiss}>
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="p-3 bg-gradient-to-r from-primary/10 to-primary/5 border-b border-primary/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary/20 rounded-lg">
              <Brain className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-primary flex items-center gap-1">
                🧐 Attribution Reality Check
              </p>
              <p className="text-[10px] text-muted-foreground">
                Meta reports ≠ Naybourhood tracking
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Badge variant="secondary" className="text-[10px]">
              {currentIndex + 1}/{activeInsights.length}
            </Badge>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={handlePrev}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={handleNext}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            {onDismiss && (
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={onDismiss}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <CardContent className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <div className="p-2 bg-muted rounded-lg flex-shrink-0">
            <TypeIcon className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-semibold text-sm">{currentInsight.title}</p>
              <Badge className={`text-[10px] ${getImpactColor(currentInsight.impact)}`}>
                {currentInsight.impact} impact
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground italic mb-2">
              "{currentInsight.finding}"
            </p>
          </div>
        </div>

        {/* Recommendation Box */}
        <div className="p-3 bg-muted/50 rounded-lg mb-3">
          <div className="flex items-start gap-2">
            <Lightbulb className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium mb-1">Recommendation</p>
              <p className="text-xs text-muted-foreground">{currentInsight.recommendation}</p>
            </div>
          </div>
        </div>

        {/* Budget Shift Visualization */}
        {currentInsight.budgetShiftSuggestion && (
          <div className="p-3 bg-primary/5 rounded-lg border border-primary/20 mb-3">
            <p className="text-[10px] text-muted-foreground uppercase mb-2">Suggested Budget Shift</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 text-center">
                <p className="text-xs font-medium truncate">{currentInsight.budgetShiftSuggestion.from}</p>
                <Progress value={100 - currentInsight.budgetShiftSuggestion.percentage} className="h-2 mt-1" />
              </div>
              <div className="flex flex-col items-center px-2">
                <ArrowRight className="h-4 w-4 text-primary" />
                <Badge variant="default" className="text-[10px] mt-1">
                  {currentInsight.budgetShiftSuggestion.percentage}%
                </Badge>
              </div>
              <div className="flex-1 text-center">
                <p className="text-xs font-medium truncate">{currentInsight.budgetShiftSuggestion.to}</p>
                <Progress value={currentInsight.budgetShiftSuggestion.percentage} className="h-2 mt-1" />
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <Sparkles className="h-3 w-3" />
            Based on last 14 days data
          </div>
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="h-7 text-xs"
              onClick={handleDismiss}
            >
              <XCircle className="h-3 w-3 mr-1" /> 
              Not Now
            </Button>
            <Button 
              size="sm" 
              variant="default" 
              className="h-7 text-xs"
              onClick={handleApply}
            >
              <CheckCircle2 className="h-3 w-3 mr-1" /> 
              Apply Change
            </Button>
          </div>
        </div>
      </CardContent>

      {/* Impact Indicator */}
      <div className="h-1 bg-gradient-to-r from-primary/50 to-primary" style={{ 
        width: `${(currentIndex + 1) / activeInsights.length * 100}%` 
      }} />
    </Card>
  );
};

export default AttributionInsightsWidget;
