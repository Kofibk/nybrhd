import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Brain,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Lightbulb,
  Target,
  Users,
  DollarSign,
  RefreshCw,
  ChevronRight,
} from "lucide-react";

interface AIInsight {
  id: string;
  type: "summary" | "recommendation" | "alert";
  title: string;
  description: string;
  metric?: string;
  trend?: "up" | "down" | "neutral";
  priority: "high" | "medium" | "low";
  action?: string;
}

const AdminAIOverview = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Mock AI insights - in production this would call an AI edge function
  const generateInsights = () => {
    setIsLoading(true);
    
    // Simulate AI processing delay
    setTimeout(() => {
      const mockInsights: AIInsight[] = [
        {
          id: "1",
          type: "summary",
          title: "Platform Performance",
          description: "Overall lead generation is up 23% this month. Meta campaigns are outperforming with an average CPL of £32.50, which is 15% below target.",
          metric: "+23%",
          trend: "up",
          priority: "high",
        },
        {
          id: "2",
          type: "alert",
          title: "Budget Alert",
          description: "3 campaigns are approaching their budget limits within the next 48 hours. Consider increasing budgets or pausing to avoid interruptions.",
          priority: "high",
          action: "Review Campaigns",
        },
        {
          id: "3",
          type: "recommendation",
          title: "Optimize UK Targeting",
          description: "London campaigns show 40% higher intent scores. Consider reallocating budget from underperforming regions to maximize ROI.",
          priority: "medium",
          action: "View Analysis",
        },
        {
          id: "4",
          type: "summary",
          title: "Lead Quality Trend",
          description: "High-intent leads (score 7+) have increased by 18% week-over-week. Current conversion rate from lead to viewing is 12.4%.",
          metric: "+18%",
          trend: "up",
          priority: "medium",
        },
        {
          id: "5",
          type: "recommendation",
          title: "Creative Refresh Needed",
          description: "Video creatives are showing fatigue with CTR dropping 0.5% daily. Recommend rotating in fresh UGC content for top 5 campaigns.",
          priority: "medium",
          action: "View Creatives",
        },
        {
          id: "6",
          type: "alert",
          title: "Inactive Users",
          description: "8 company users haven't logged in for 30+ days. Consider sending re-engagement emails or deactivating unused accounts.",
          priority: "low",
          action: "View Users",
        },
        {
          id: "7",
          type: "recommendation",
          title: "Expand to Middle East",
          description: "Based on lead quality data, UAE and Saudi Arabia show strong buyer intent. Consider launching dedicated regional campaigns.",
          priority: "low",
          action: "Create Campaign",
        },
      ];
      
      setInsights(mockInsights);
      setLastUpdated(new Date());
      setIsLoading(false);
    }, 1500);
  };

  useEffect(() => {
    generateInsights();
  }, []);

  const getTypeIcon = (type: AIInsight["type"]) => {
    switch (type) {
      case "summary":
        return <TrendingUp className="h-4 w-4" />;
      case "recommendation":
        return <Lightbulb className="h-4 w-4" />;
      case "alert":
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getTypeBadgeVariant = (type: AIInsight["type"]) => {
    switch (type) {
      case "summary":
        return "secondary";
      case "recommendation":
        return "default";
      case "alert":
        return "destructive";
    }
  };

  const getPriorityColor = (priority: AIInsight["priority"]) => {
    switch (priority) {
      case "high":
        return "border-l-destructive";
      case "medium":
        return "border-l-warning";
      case "low":
        return "border-l-muted-foreground";
    }
  };

  const summaryInsights = insights.filter((i) => i.type === "summary");
  const alertInsights = insights.filter((i) => i.type === "alert");
  const recommendationInsights = insights.filter((i) => i.type === "recommendation");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Brain className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">AI Overview</h2>
            <p className="text-sm text-muted-foreground">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={generateInsights}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Refresh Insights
        </Button>
      </div>

      {/* Quick Stats from AI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Target className="h-4 w-4" />
              <span className="text-xs">Campaign Health</span>
            </div>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-success">85%</span>
                <Badge variant="secondary" className="text-success">Good</Badge>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Users className="h-4 w-4" />
              <span className="text-xs">Lead Quality</span>
            </div>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">7.2</span>
                <TrendingUp className="h-4 w-4 text-success" />
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <DollarSign className="h-4 w-4" />
              <span className="text-xs">Budget Efficiency</span>
            </div>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">92%</span>
                <TrendingUp className="h-4 w-4 text-success" />
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-xs">Active Alerts</span>
            </div>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-destructive">{alertInsights.length}</span>
                <Badge variant="destructive">Attention</Badge>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Insights Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Alerts Section */}
        <Card className="md:col-span-2 lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <>
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </>
            ) : alertInsights.length > 0 ? (
              alertInsights.map((insight) => (
                <div
                  key={insight.id}
                  className={`p-3 rounded-lg border border-l-4 ${getPriorityColor(insight.priority)} bg-card`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-sm">{insight.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {insight.description}
                      </p>
                    </div>
                  </div>
                  {insight.action && (
                    <Button variant="ghost" size="sm" className="mt-2 h-7 text-xs">
                      {insight.action}
                      <ChevronRight className="h-3 w-3 ml-1" />
                    </Button>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No active alerts
              </p>
            )}
          </CardContent>
        </Card>

        {/* Summaries Section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Performance Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <>
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </>
            ) : (
              summaryInsights.map((insight) => (
                <div
                  key={insight.id}
                  className="p-3 rounded-lg border bg-card"
                >
                  <div className="flex items-start justify-between">
                    <p className="font-medium text-sm">{insight.title}</p>
                    {insight.metric && (
                      <Badge
                        variant={insight.trend === "up" ? "default" : "secondary"}
                        className={insight.trend === "up" ? "bg-success" : ""}
                      >
                        {insight.trend === "up" ? (
                          <TrendingUp className="h-3 w-3 mr-1" />
                        ) : (
                          <TrendingDown className="h-3 w-3 mr-1" />
                        )}
                        {insight.metric}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {insight.description}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recommendations Section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-warning" />
              AI Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <>
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </>
            ) : (
              recommendationInsights.map((insight) => (
                <div
                  key={insight.id}
                  className={`p-3 rounded-lg border border-l-4 ${getPriorityColor(insight.priority)} bg-card`}
                >
                  <p className="font-medium text-sm">{insight.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {insight.description}
                  </p>
                  {insight.action && (
                    <Button variant="ghost" size="sm" className="mt-2 h-7 text-xs">
                      {insight.action}
                      <ChevronRight className="h-3 w-3 ml-1" />
                    </Button>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAIOverview;