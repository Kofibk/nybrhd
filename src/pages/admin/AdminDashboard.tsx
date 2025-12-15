import DashboardLayout from '@/components/DashboardLayout';
import { CampaignIntelligence } from '@/components/CampaignIntelligence';
import { MasterAgent } from '@/components/MasterAgent';
import { AIInsightsChat } from '@/components/AIInsightsChat';
import { useAuth } from '@/contexts/AuthContext';
import { useUploadedData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const userName = user?.name || 'Admin';
  const { campaignData, leadData } = useUploadedData();

  return (
    <DashboardLayout 
      title={`Welcome back, ${userName}`}
      userType="admin"
      userName={userName}
    >
      <div className="space-y-6">
        {/* Master Agent - Full Width */}
        <MasterAgent />
        
        {/* Campaign Intelligence Below */}
        <CampaignIntelligence />

        {/* AI Chat for Follow-up Questions */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageSquare className="h-5 w-5 text-primary" />
              Ask AI About Your Data
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Ask follow-up questions about your campaigns and leads. Get actionable insights and contact leads directly.
            </p>
          </CardHeader>
          <CardContent className="p-0">
            <AIInsightsChat 
              campaignData={campaignData} 
              leadData={leadData}
              analysisContext="Admin dashboard analysis context - user is an admin reviewing all platform data"
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;