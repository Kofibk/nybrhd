import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface PerformanceOverviewProps {
  userType: "developer" | "agent" | "broker";
}

const PerformanceOverview = ({ userType }: PerformanceOverviewProps) => {
  // Simple performance data with plain language explanations
  const performanceData = {
    developer: {
      summary: "Your campaigns are performing well this week",
      metrics: [
        {
          label: "What's Working",
          value: "Meta Ads",
          description: "Getting you the most leads at the lowest cost",
          trend: "up"
        },
        {
          label: "Best Audience",
          value: "UK Investors",
          description: "Highest quality leads from this group",
          trend: "up"
        },
        {
          label: "Top Development",
          value: "Marina Heights",
          description: "45% of all viewings booked this week",
          trend: "up"
        },
        {
          label: "Needs Attention",
          value: "LinkedIn Ads",
          description: "Higher cost per lead than other channels",
          trend: "down"
        }
      ]
    },
    agent: {
      summary: "Your listings are getting good traction",
      metrics: [
        {
          label: "What's Working",
          value: "City Centre Apartments",
          description: "Best performing campaign this month",
          trend: "up"
        },
        {
          label: "Hot Property",
          value: "Garden Square",
          description: "Most enquiries received this week",
          trend: "up"
        },
        {
          label: "Best Day",
          value: "Tuesday",
          description: "You get the most leads on this day",
          trend: "neutral"
        },
        {
          label: "Needs Attention",
          value: "Suburban Homes",
          description: "Lower engagement than expected",
          trend: "down"
        }
      ]
    },
    broker: {
      summary: "Your mortgage campaigns are on track",
      metrics: [
        {
          label: "What's Working",
          value: "Residential Mortgages",
          description: "Highest conversion rate this month",
          trend: "up"
        },
        {
          label: "Best Region",
          value: "Middle East",
          description: "Strong interest in international mortgages",
          trend: "up"
        },
        {
          label: "Top Product",
          value: "Buy-to-Let",
          description: "Most applications submitted this week",
          trend: "up"
        },
        {
          label: "Needs Attention",
          value: "Life Insurance",
          description: "Fewer enquiries than last month",
          trend: "down"
        }
      ]
    }
  };

  const data = performanceData[userType];
  const analyticsPath = `/${userType}/analytics`;

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-success" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-destructive" />;
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTrendBg = (trend: string) => {
    switch (trend) {
      case "up":
        return "bg-success/10 border-success/20";
      case "down":
        return "bg-destructive/10 border-destructive/20";
      default:
        return "bg-muted border-border";
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base md:text-lg font-semibold text-foreground">Performance Overview</h3>
          <p className="text-xs md:text-sm text-muted-foreground">{data.summary}</p>
        </div>
        <Link to={analyticsPath}>
          <Button variant="outline" size="sm" className="w-full sm:w-auto">
            View Full Analytics
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {data.metrics.map((metric, index) => (
          <Card 
            key={index} 
            className={`p-4 border ${getTrendBg(metric.trend)} transition-all hover:shadow-md`}
          >
            <div className="flex items-start justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {metric.label}
              </span>
              {getTrendIcon(metric.trend)}
            </div>
            <div className="text-base md:text-lg font-semibold text-foreground mb-1">
              {metric.value}
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {metric.description}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PerformanceOverview;
