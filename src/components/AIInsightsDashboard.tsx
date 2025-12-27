import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Brain,
  Lightbulb,
  TrendingUp,
  Users,
  Clock,
  Zap,
  MessageSquare,
  Target,
  AlertTriangle,
  ChevronRight,
  RefreshCw,
  Crown,
  Lock,
  Sparkles,
  Mail,
  Calendar,
  DollarSign,
} from 'lucide-react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { SubscriptionTier } from '@/lib/subscriptionTiers';
import { cn } from '@/lib/utils';

interface AIInsight {
  id: string;
  type: 'action' | 'recommendation' | 'prediction' | 'trend' | 'urgent';
  title: string;
  description: string;
  impact?: string;
  cta?: string;
  ctaAction?: () => void;
  timestamp: Date;
  tier: SubscriptionTier;
}

interface AIInsightsDashboardProps {
  className?: string;
  variant?: 'panel' | 'full';
  userType?: 'developer' | 'agent' | 'broker';
}

const getInsightIcon = (type: AIInsight['type']) => {
  switch (type) {
    case 'action': return Users;
    case 'recommendation': return Lightbulb;
    case 'prediction': return TrendingUp;
    case 'trend': return Target;
    case 'urgent': return AlertTriangle;
    default: return Brain;
  }
};

const getInsightStyles = (type: AIInsight['type']) => {
  switch (type) {
    case 'action':
      return 'border-l-4 border-l-blue-500 bg-blue-500/5';
    case 'recommendation':
      return 'border-l-4 border-l-amber-500 bg-amber-500/5';
    case 'prediction':
      return 'border-l-4 border-l-purple-500 bg-purple-500/5';
    case 'trend':
      return 'border-l-4 border-l-green-500 bg-green-500/5';
    case 'urgent':
      return 'border-l-4 border-l-red-500 bg-red-500/5';
    default:
      return 'border-l-4 border-l-muted';
  }
};

// Demo insights for each tier level
const generateDemoInsights = (tier: SubscriptionTier, userType: string): AIInsight[] => {
  const baseInsights: AIInsight[] = [
    {
      id: '1',
      type: 'action',
      title: `5 buyers matching your price range haven't been contacted`,
      description: 'These leads have been waiting over 48 hours. Quick follow-up typically increases conversion by 35%.',
      cta: 'View Buyers',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      tier: 'access',
    },
    {
      id: '2',
      type: 'trend',
      title: 'Nigerian buyers are 23% more likely to respond to evening messages',
      description: 'Based on your last 30 days of engagement data, consider scheduling outreach after 6pm GMT.',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
      tier: 'access',
    },
    {
      id: '3',
      type: 'action',
      title: 'Weekend viewing slots have 2x higher conversion',
      description: 'Your Saturday viewings convert at 18% vs 9% on weekdays. Prioritise weekend availability.',
      cta: 'Review Schedule',
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
      tier: 'access',
    },
  ];

  const enhancedInsights: AIInsight[] = [
    {
      id: '4',
      type: 'recommendation',
      title: 'Increase budget on Campaign X by £200 to capture 8 more leads',
      description: 'This campaign is performing 40% above average CPL. Additional budget would yield estimated 8 leads at £25 CPL.',
      impact: '+8 leads, £200 spend',
      cta: 'Apply Recommendation',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
      tier: 'growth',
    },
    {
      id: '5',
      type: 'action',
      title: 'James scored 78: Timeline 0-3 months (+24), Cash buyer (+20), Investment purpose (+18)',
      description: 'High-intent buyer ready to proceed. Recommended action: Schedule viewing within 24 hours.',
      cta: 'Contact James',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
      tier: 'growth',
    },
    {
      id: '6',
      type: 'trend',
      title: 'Your response time improved 40% this week',
      description: 'Average first response now 2.5 hours vs 4.2 hours last week. Keep it up!',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      tier: 'growth',
    },
    {
      id: '7',
      type: 'recommendation',
      title: 'Pause underperforming ad set "UK Investors"',
      description: 'CPL of £85 is 3x your target. Reallocating £500/week could save £1,200/month.',
      impact: 'Save £1,200/month',
      cta: 'Review Campaign',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      tier: 'growth',
    },
  ];

  const fullInsights: AIInsight[] = [
    {
      id: '8',
      type: 'prediction',
      title: 'Expect 12 new high-intent buyers next week',
      description: 'Based on current pipeline patterns and seasonal trends, prepare capacity for increased demand.',
      impact: '+12 leads predicted',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      tier: 'enterprise',
    },
    {
      id: '9',
      type: 'trend',
      title: 'Dubai buyer interest up 34% month-over-month',
      description: 'Consider creating targeted content for UAE audience. Currency exchange rate favouring GBP purchases.',
      cta: 'View Market Report',
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
      tier: 'enterprise',
    },
    {
      id: '10',
      type: 'urgent',
      title: 'Buyers contacted within 4 hours convert 3x better — 5 waiting now',
      description: 'These leads have been waiting 3.5 hours. Immediate contact recommended to maximise conversion.',
      cta: 'Contact Now',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      tier: 'enterprise',
    },
    {
      id: '11',
      type: 'recommendation',
      title: 'AI-drafted follow-up ready for approval',
      description: '"Hi Sarah, following up on your interest in Canary Wharf. I noticed you mentioned a 3-month timeline..."',
      cta: 'Review & Send',
      timestamp: new Date(Date.now() - 20 * 60 * 1000),
      tier: 'enterprise',
    },
    {
      id: '12',
      type: 'prediction',
      title: 'Q1 2025: London Zone 2 demand projected to rise 18%',
      description: 'New transport links and regeneration driving interest. Position inventory accordingly.',
      timestamp: new Date(Date.now() - 60 * 60 * 1000),
      tier: 'enterprise',
    },
  ];

  const allInsights = [...baseInsights, ...enhancedInsights, ...fullInsights];
  
  // Filter by tier access
  const tierOrder: SubscriptionTier[] = ['access', 'growth', 'enterprise'];
  const tierIndex = tierOrder.indexOf(tier);
  
  return allInsights.filter(insight => {
    const insightTierIndex = tierOrder.indexOf(insight.tier);
    return insightTierIndex <= tierIndex;
  });
};

const formatTimestamp = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
};

export const AIInsightsDashboard: React.FC<AIInsightsDashboardProps> = ({
  className,
  variant = 'panel',
  userType = 'developer',
}) => {
  const { currentTier, tierConfig } = useSubscription();
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    // Simulate loading insights
    setIsLoading(true);
    const timer = setTimeout(() => {
      setInsights(generateDemoInsights(currentTier, userType));
      setLastUpdated(new Date());
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [currentTier, userType]);

  const refreshInsights = () => {
    setIsLoading(true);
    setTimeout(() => {
      setInsights(generateDemoInsights(currentTier, userType));
      setLastUpdated(new Date());
      setIsLoading(false);
    }, 600);
  };

  const visibleInsights = variant === 'panel' 
    ? insights.slice(0, currentTier === 'access' ? 3 : currentTier === 'growth' ? 5 : insights.length)
    : insights;

  const isPanelVariant = variant === 'panel';

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                AI Insights
                <Badge 
                  variant="outline" 
                  className={cn(
                    "text-[10px] font-medium",
                    tierConfig.isPopular && "border-amber-500/50 text-amber-500"
                  )}
                >
                  {tierConfig.name}
                </Badge>
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                {tierConfig.aiInsightsDescription}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground">
              Updated {formatTimestamp(lastUpdated)}
            </span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7"
              onClick={refreshInsights}
              disabled={isLoading}
            >
              <RefreshCw className={cn("h-3.5 w-3.5", isLoading && "animate-spin")} />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3 p-3 rounded-lg bg-muted/30">
                <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <ScrollArea className={isPanelVariant ? "h-[320px]" : "h-[500px]"}>
            <div className="space-y-2.5 pr-3">
              {visibleInsights.map((insight) => {
                const Icon = getInsightIcon(insight.type);
                return (
                  <div
                    key={insight.id}
                    className={cn(
                      "p-3 rounded-lg transition-all hover:bg-muted/50",
                      getInsightStyles(insight.type)
                    )}
                  >
                    <div className="flex gap-3">
                      <div className={cn(
                        "p-1.5 rounded-lg shrink-0 h-fit",
                        insight.type === 'urgent' ? 'bg-red-500/20' :
                        insight.type === 'prediction' ? 'bg-purple-500/20' :
                        insight.type === 'recommendation' ? 'bg-amber-500/20' :
                        insight.type === 'trend' ? 'bg-green-500/20' :
                        'bg-blue-500/20'
                      )}>
                        <Icon className={cn(
                          "h-4 w-4",
                          insight.type === 'urgent' ? 'text-red-500' :
                          insight.type === 'prediction' ? 'text-purple-500' :
                          insight.type === 'recommendation' ? 'text-amber-500' :
                          insight.type === 'trend' ? 'text-green-500' :
                          'text-blue-500'
                        )} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-sm font-medium leading-tight">
                            {insight.title}
                          </h4>
                          <span className="text-[10px] text-muted-foreground shrink-0">
                            {formatTimestamp(insight.timestamp)}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                          {insight.description}
                        </p>
                        {(insight.impact || insight.cta) && (
                          <div className="flex items-center justify-between mt-2 gap-2">
                            {insight.impact && (
                              <Badge variant="secondary" className="text-[10px]">
                                {insight.impact}
                              </Badge>
                            )}
                            {insight.cta && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-6 text-xs px-2 ml-auto"
                              >
                                {insight.cta}
                                <ChevronRight className="h-3 w-3 ml-1" />
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Tier upgrade prompts */}
              {currentTier === 'access' && (
                <div className="p-4 rounded-lg bg-gradient-to-r from-amber-500/10 to-amber-600/5 border border-amber-500/20">
                  <div className="flex items-start gap-3">
                    <Crown className="h-5 w-5 text-amber-500 shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium">Unlock Enhanced Insights</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Upgrade to Growth for campaign recommendations, buyer scoring explanations, 
                        and weekly email digests.
                      </p>
                      <Button size="sm" className="mt-3 h-7 text-xs">
                        Upgrade to Growth — £2,249/mo
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {currentTier === 'growth' && (
                <div className="p-4 rounded-lg bg-gradient-to-r from-purple-500/10 to-purple-600/5 border border-purple-500/20">
                  <div className="flex items-start gap-3">
                    <Zap className="h-5 w-5 text-purple-500 shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium">Unlock Predictive Analytics</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Upgrade to Enterprise for predictive forecasts, AI-drafted messages, 
                        and first refusal on high-intent buyers.
                      </p>
                      <Button size="sm" className="mt-3 h-7 text-xs">
                        Upgrade to Enterprise — £3,999/mo
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {currentTier === 'enterprise' && tierConfig.weeklyEmailDigest && (
                <div className="p-3 rounded-lg bg-muted/30 border border-border">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Mail className="h-3.5 w-3.5" />
                    <span>Weekly insight digest enabled — Next: Monday 9am</span>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default AIInsightsDashboard;
