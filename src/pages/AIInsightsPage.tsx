import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { AIInsightsDashboard } from '@/components/AIInsightsDashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  Brain,
  TrendingUp,
  Users,
  Clock,
  Target,
  Zap,
  Crown,
  CheckCircle,
  Lock,
  Sparkles,
  BarChart3,
  MessageSquare,
  Calendar,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AIInsightsPageProps {
  userType: 'developer' | 'agent' | 'broker';
}

const AIInsightsPage: React.FC<AIInsightsPageProps> = ({ userType }) => {
  const { user } = useAuth();
  const { currentTier, tierConfig, contactsUsed, contactsRemaining } = useSubscription();

  const userName = user?.name || 'User';

  // Stats based on tier
  const stats = [
    {
      label: 'Insights This Week',
      value: currentTier === 'access' ? '3' : currentTier === 'growth' ? '7' : '24',
      icon: Sparkles,
      change: '+2 from last week',
    },
    {
      label: 'Actions Taken',
      value: '12',
      icon: CheckCircle,
      change: '85% completion rate',
    },
    {
      label: 'Response Time',
      value: '2.4h',
      icon: Clock,
      change: '-40% improvement',
    },
    {
      label: 'Conversion Rate',
      value: '18%',
      icon: Target,
      change: '+3% this month',
    },
  ];

  const tierFeatures = {
    access: [
      { label: '2-3 insights per week', available: true },
      { label: 'Basic buyer recommendations', available: true },
      { label: 'Actionable next steps', available: true },
      { label: 'Campaign recommendations', available: false },
      { label: 'Score explanations', available: false },
      { label: 'Predictive analytics', available: false },
    ],
    growth: [
      { label: '5-7 insights visible', available: true },
      { label: 'Campaign performance recommendations', available: true },
      { label: 'Buyer scoring explanations', available: true },
      { label: 'Weekly email digest', available: true },
      { label: 'Predictive analytics', available: false },
      { label: 'AI-drafted follow-ups', available: false },
    ],
    enterprise: [
      { label: 'Unlimited insights, daily refresh', available: true },
      { label: 'Predictive buyer forecasts', available: true },
      { label: 'Market trend analysis', available: true },
      { label: 'AI-drafted messages for approval', available: true },
      { label: 'Response time impact analysis', available: true },
      { label: 'Custom insight requests via AM', available: true },
    ],
  };

  return (
    <DashboardLayout title="AI Insights" userType={userType} userName={userName}>
      <div className="space-y-6">
        {/* Header with tier info */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Brain className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-semibold">AI Insights Centre</h2>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Personalised recommendations powered by AI analysis of your pipeline
            </p>
          </div>
          <Badge 
            variant="outline" 
            className={cn(
              "text-sm px-3 py-1",
              tierConfig.isPopular && "border-amber-500 text-amber-500 bg-amber-500/10"
            )}
          >
            {tierConfig.name} Plan — {tierConfig.aiInsightsCount}
          </Badge>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {stats.map((stat, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">{stat.label}</span>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
            </Card>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Insights Panel */}
          <div className="lg:col-span-2">
            <AIInsightsDashboard variant="full" userType={userType} />
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Current Plan Features */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Crown className="h-4 w-4 text-amber-500" />
                  Your {tierConfig.name} Features
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-2">
                  {tierFeatures[currentTier].map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      {feature.available ? (
                        <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                      ) : (
                        <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
                      )}
                      <span className={cn(
                        feature.available ? 'text-foreground' : 'text-muted-foreground'
                      )}>
                        {feature.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Contact Usage */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Monthly Contacts
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold">{contactsUsed}</span>
                  <span className="text-muted-foreground">
                    / {tierConfig.monthlyContactsDisplay}
                  </span>
                </div>
                {contactsRemaining !== 'unlimited' && (
                  <div className="mt-2">
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all" 
                        style={{ 
                          width: `${(contactsUsed / (tierConfig.monthlyContacts as number)) * 100}%` 
                        }} 
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {contactsRemaining} contacts remaining this month
                    </p>
                  </div>
                )}
                {contactsRemaining === 'unlimited' && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Unlimited contacts on Enterprise plan
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                <Button variant="outline" className="w-full justify-start text-sm h-9">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contact Hot Leads
                </Button>
                <Button variant="outline" className="w-full justify-start text-sm h-9">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Viewings
                </Button>
                <Button variant="outline" className="w-full justify-start text-sm h-9">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Campaign Performance
                </Button>
              </CardContent>
            </Card>

            {/* Upgrade CTA */}
            {currentTier !== 'enterprise' && (
              <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <TrendingUp className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">
                        Upgrade to {currentTier === 'access' ? 'Growth' : 'Enterprise'}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {currentTier === 'access' 
                          ? 'Get campaign recommendations, score explanations, and weekly digests.'
                          : 'Unlock predictive analytics, AI-drafted messages, and dedicated support.'
                        }
                      </p>
                      <Button size="sm" className="mt-3 h-8 text-xs">
                        View Upgrade Options
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AIInsightsPage;
