import DashboardLayout from '@/components/DashboardLayout';
import { AIAgentDashboard } from '@/components/admin/AIAgentDashboard';
import { AIInsightsDashboard } from '@/components/AIInsightsDashboard';
import { SubscriptionBanner } from '@/components/dashboard/SubscriptionBanner';
import WhatsAppLeadNurturing from '@/components/WhatsAppLeadNurturing';
import EmailAutomation from '@/components/EmailAutomation';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutDashboard, MessageCircle, Mail } from 'lucide-react';

const BrokerDashboard = () => {
  const { profile } = useAuth();
  const firstName = profile?.full_name?.split(' ')[0] || 'there';

  return (
    <DashboardLayout 
      title={`Welcome back, ${firstName}`}
      userType="broker"
      userName={firstName}
    >
      <div className="space-y-6">
        {/* Subscription Status Banner */}
        <SubscriptionBanner userType="broker" />

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
