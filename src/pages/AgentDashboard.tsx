import DashboardLayout from '@/components/DashboardLayout';
import { AIAgentDashboard } from '@/components/admin/AIAgentDashboard';
import { AIInsightsDashboard } from '@/components/AIInsightsDashboard';
import { TierSwitcher } from '@/components/TierSwitcher';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { Users, Crown, Sparkles } from 'lucide-react';

const AgentDashboard = () => {
  const { user } = useAuth();
  const { tierConfig, contactsUsed } = useSubscription();
  const userName = user?.name || 'User';

  return (
    <DashboardLayout 
      title={`Welcome back, ${userName}`}
      userType="agent"
      userName={userName}
    >
      <div className="space-y-6">
        {/* Demo Tier Switcher */}
        <TierSwitcher className="w-fit" />

        {/* Tier Status Banner */}
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="py-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Crown className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{tierConfig.name} Plan</span>
                    {tierConfig.isPopular && (
                      <Badge className="bg-amber-500 text-black text-[10px]">Popular</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{tierConfig.priceDisplay}/month</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <span className="font-medium">{contactsUsed}</span>
                    <span className="text-muted-foreground"> / {tierConfig.monthlyContactsDisplay} contacts</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{tierConfig.aiInsightsCount} insights</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="xl:col-span-2">
            <AIAgentDashboard userType="agent" />
          </div>
          
          {/* AI Insights Sidebar */}
          <div className="xl:col-span-1">
            <AIInsightsDashboard variant="panel" userType="agent" />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AgentDashboard;
