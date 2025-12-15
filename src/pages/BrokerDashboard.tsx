import DashboardLayout from '@/components/DashboardLayout';
import { CampaignIntelligence } from '@/components/CampaignIntelligence';
import WhatsAppLeadNurturing from '@/components/WhatsAppLeadNurturing';
import EmailAutomation from '@/components/EmailAutomation';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutDashboard, MessageCircle, Mail } from 'lucide-react';

const BrokerDashboard = () => {
  const { user } = useAuth();
  const userName = user?.name || 'User';

  return (
    <DashboardLayout 
      title={`Welcome back, ${userName}`}
      userType="broker"
      userName={userName}
    >
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
          <CampaignIntelligence />
        </TabsContent>
        
        <TabsContent value="whatsapp">
          <WhatsAppLeadNurturing />
        </TabsContent>
        
        <TabsContent value="email">
          <EmailAutomation />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default BrokerDashboard;
