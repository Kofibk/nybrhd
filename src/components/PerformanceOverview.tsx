import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus, ArrowRight, Lightbulb, Target, Users, ExternalLink } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface MetricAction {
  label: string;
  tab?: string;
  filter?: string;
}

interface Metric {
  label: string;
  value: string;
  description: string;
  trend: string;
  action?: MetricAction;
}

interface PerformanceOverviewProps {
  userType: "developer" | "agent" | "broker";
  context?: "dashboard" | "campaigns" | "leads";
  onTabChange?: (tab: string) => void;
}

const PerformanceOverview = ({ userType, context = "dashboard", onTabChange }: PerformanceOverviewProps) => {
  const navigate = useNavigate();
  
  // Context-specific data based on tab
  const getContextData = (): Record<string, { summary: string; metrics: Metric[] }> => {
    if (context === "campaigns") {
      return {
        developer: {
          summary: "Your campaign performance insights",
          metrics: [
            {
              label: "Best Performing",
              value: "Meta Ads - Lagos HNW",
              description: "Lowest CPL at £20.16 with 3.2% CTR",
              trend: "up",
              action: { label: "View Campaign", tab: "campaigns", filter: "lagos-hnw" }
            },
            {
              label: "Optimise Budget",
              value: "Shift to Meta",
              description: "Meta outperforming other channels by 35%",
              trend: "up",
              action: { label: "Adjust Budget", tab: "campaigns" }
            },
            {
              label: "Creative Tip",
              value: "Video Content",
              description: "Video ads getting 2x more engagement",
              trend: "up"
            },
            {
              label: "Needs Attention",
              value: "LinkedIn Campaign",
              description: "CPL 40% higher than target - consider pausing",
              trend: "down",
              action: { label: "Review Campaign", tab: "campaigns", filter: "linkedin" }
            }
          ]
        },
        agent: {
          summary: "Campaign optimisation recommendations",
          metrics: [
            {
              label: "Top Campaign",
              value: "City Centre Apartments",
              description: "Best ROI this month at 4.1% CTR",
              trend: "up",
              action: { label: "View Campaign", tab: "campaigns", filter: "city-centre" }
            },
            {
              label: "Budget Advice",
              value: "Increase Spend",
              description: "High-performing campaigns have room to scale",
              trend: "up",
              action: { label: "Adjust Budget", tab: "campaigns" }
            },
            {
              label: "Audience Insight",
              value: "First-Time Buyers",
              description: "This segment converting 3x better",
              trend: "up"
            },
            {
              label: "Review Required",
              value: "Suburban Homes",
              description: "CTR dropped 15% - refresh creatives",
              trend: "down",
              action: { label: "Review Campaign", tab: "campaigns", filter: "suburban" }
            }
          ]
        },
        broker: {
          summary: "Campaign performance recommendations",
          metrics: [
            {
              label: "Star Campaign",
              value: "Residential Mortgages",
              description: "Highest quality leads with 8% conversion",
              trend: "up",
              action: { label: "View Campaign", tab: "campaigns", filter: "residential" }
            },
            {
              label: "Scale Opportunity",
              value: "Middle East Targeting",
              description: "Strong intent signals - increase budget 20%",
              trend: "up",
              action: { label: "Adjust Budget", tab: "campaigns" }
            },
            {
              label: "Creative Insight",
              value: "Rate Comparison Ads",
              description: "Outperforming lifestyle messaging 2:1",
              trend: "up"
            },
            {
              label: "Action Needed",
              value: "Life Insurance Ads",
              description: "Low engagement - test new angles",
              trend: "down",
              action: { label: "Review Campaign", tab: "campaigns", filter: "insurance" }
            }
          ]
        }
      };
    }
    
    if (context === "leads") {
      return {
        developer: {
          summary: "Lead quality and prioritisation insights",
          metrics: [
            {
              label: "Hot Leads",
              value: "12 Ready to Book",
              description: "High intent score leads awaiting contact",
              trend: "up",
              action: { label: "View Hot Leads", tab: "leads", filter: "hot" }
            },
            {
              label: "Best Source",
              value: "Meta Campaigns",
              description: "Generating highest quality leads this week",
              trend: "up",
              action: { label: "View Meta Leads", tab: "leads", filter: "meta" }
            },
            {
              label: "Follow-Up Alert",
              value: "8 Leads Cooling",
              description: "Haven't been contacted in 48+ hours",
              trend: "down",
              action: { label: "Contact Now", tab: "leads", filter: "cooling" }
            },
            {
              label: "Conversion Tip",
              value: "Call Within 5 Mins",
              description: "Leads contacted quickly convert 4x better",
              trend: "up"
            }
          ]
        },
        agent: {
          summary: "Lead management recommendations",
          metrics: [
            {
              label: "Priority Leads",
              value: "15 Hot Prospects",
              description: "High intent buyers ready for viewings",
              trend: "up",
              action: { label: "View Priority", tab: "leads", filter: "hot" }
            },
            {
              label: "Best Performing",
              value: "City Centre Leads",
              description: "Highest quality score average: 85/100",
              trend: "up",
              action: { label: "View Quality Leads", tab: "leads", filter: "quality" }
            },
            {
              label: "Needs Attention",
              value: "6 Stale Leads",
              description: "No activity in 7+ days - re-engage now",
              trend: "down",
              action: { label: "Re-engage", tab: "leads", filter: "stale" }
            },
            {
              label: "Booking Tip",
              value: "Weekend Viewings",
              description: "Saturday viewings have 60% show rate",
              trend: "up"
            }
          ]
        },
        broker: {
          summary: "Lead scoring and prioritisation insights",
          metrics: [
            {
              label: "Ready to Close",
              value: "9 Qualified Leads",
              description: "Pre-approved and ready for application",
              trend: "up",
              action: { label: "View Qualified", tab: "leads", filter: "qualified" }
            },
            {
              label: "Best Segment",
              value: "International Buyers",
              description: "Highest average loan value at £1.2m",
              trend: "up",
              action: { label: "View Segment", tab: "leads", filter: "international" }
            },
            {
              label: "Re-engage Now",
              value: "5 Cold Leads",
              description: "Previously interested - worth a follow-up",
              trend: "down",
              action: { label: "Follow Up", tab: "leads", filter: "cold" }
            },
            {
              label: "Nurture Tip",
              value: "Rate Updates",
              description: "Sending rate alerts increases response 40%",
              trend: "up"
            }
          ]
        }
      };
    }
    
    // Default dashboard context
    return {
      developer: {
        summary: "Your campaigns are performing well this week",
        metrics: [
          {
            label: "What's Working",
            value: "Meta Ads",
            description: "Getting you the most leads at the lowest cost",
            trend: "up",
            action: { label: "View Campaigns", tab: "campaigns" }
          },
          {
            label: "Best Audience",
            value: "UK Investors",
            description: "Highest quality leads from this group",
            trend: "up",
            action: { label: "View Leads", tab: "leads", filter: "uk-investors" }
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
            trend: "down",
            action: { label: "Review", tab: "campaigns", filter: "linkedin" }
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
            trend: "up",
            action: { label: "View Campaign", tab: "campaigns" }
          },
          {
            label: "Hot Property",
            value: "Garden Square",
            description: "Most enquiries received this week",
            trend: "up",
            action: { label: "View Leads", tab: "leads" }
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
            trend: "down",
            action: { label: "Review", tab: "campaigns", filter: "suburban" }
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
            trend: "up",
            action: { label: "View Campaign", tab: "campaigns" }
          },
          {
            label: "Best Region",
            value: "Middle East",
            description: "Strong interest in international mortgages",
            trend: "up",
            action: { label: "View Leads", tab: "leads", filter: "middle-east" }
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
            trend: "down",
            action: { label: "Review", tab: "campaigns", filter: "insurance" }
          }
        ]
      }
    };
  };

  const handleActionClick = (action: MetricAction) => {
    if (onTabChange && action.tab) {
      onTabChange(action.tab);
    }
  };

  const contextData = getContextData();
  const data = contextData[userType];
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

  const getContextIcon = () => {
    switch (context) {
      case "campaigns":
        return <Target className="h-4 w-4 text-primary" />;
      case "leads":
        return <Users className="h-4 w-4 text-primary" />;
      default:
        return <Lightbulb className="h-4 w-4 text-primary" />;
    }
  };

  const getContextTitle = () => {
    switch (context) {
      case "campaigns":
        return "Campaign Insights";
      case "leads":
        return "Lead Insights";
      default:
        return "Performance Overview";
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          {getContextIcon()}
          <div>
            <h3 className="text-base md:text-lg font-semibold text-foreground">{getContextTitle()}</h3>
            <p className="text-xs md:text-sm text-muted-foreground">{data.summary}</p>
          </div>
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
            className={`p-4 border ${getTrendBg(metric.trend)} transition-all hover:shadow-md ${metric.action ? 'cursor-pointer' : ''}`}
            onClick={() => metric.action && handleActionClick(metric.action)}
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
            <p className="text-xs text-muted-foreground leading-relaxed mb-2">
              {metric.description}
            </p>
            {metric.action && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full mt-1 text-xs h-7 text-primary hover:text-primary"
                onClick={(e) => {
                  e.stopPropagation();
                  handleActionClick(metric.action!);
                }}
              >
                {metric.action.label}
                <ExternalLink className="h-3 w-3 ml-1" />
              </Button>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PerformanceOverview;