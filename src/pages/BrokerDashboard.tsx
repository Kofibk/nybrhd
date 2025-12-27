import DashboardLayout from '@/components/DashboardLayout';
import { AIAgentDashboard } from '@/components/admin/AIAgentDashboard';
import { AIInsightsDashboard } from '@/components/AIInsightsDashboard';
import { TierSwitcher } from '@/components/TierSwitcher';
import WhatsAppLeadNurturing from '@/components/WhatsAppLeadNurturing';
import EmailAutomation from '@/components/EmailAutomation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutDashboard, MessageCircle, Mail, Users, Crown, Sparkles } from 'lucide-react';

const BrokerDashboard = () => {
  const { profile } = useAuth();
  const { tierConfig, contactsUsed } = useSubscription();
  const userName = profile?.full_name || 'User';

  return (
    <DashboardLayout 
      title={`Welcome back, ${userName}`}
      userType="broker"
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

        {/* Tabs for different views */}
        <Tabs defaultValue="overview" className="w-full space-y-6">
          <TabsList className="grid w-full max-w-lg grid-cols-3">
            <TabsTrigger value="overview" className="gap-2">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="whatsapp" className="gap-2">
              <MessageCircle className="h-4 w-4" />
              <span className="hidden sm:inline">WhatsApp</span>
            </TabsTrigger>
            <TabsTrigger value="email" className="gap-2">
              <Mail className="h-4 w-4" />
              <span className="hidden sm:inline">Email</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            {/* Main Dashboard Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="xl:col-span-2">
                <AIAgentDashboard userType="broker" />
              </div>
              
              {/* AI Insights Sidebar */}
              <div className="xl:col-span-1">
                <AIInsightsDashboard variant="panel" userType="broker" />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="whatsapp">
            <WhatsAppLeadNurturing />
          </TabsContent>
          
          <TabsContent value="email">
            <EmailAutomation />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default BrokerDashboard;
