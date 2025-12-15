import DashboardLayout from '@/components/DashboardLayout';
import { CampaignIntelligence } from '@/components/CampaignIntelligence';
import { useAuth } from '@/contexts/AuthContext';

const AgentDashboard = () => {
  const { user } = useAuth();
  const userName = user?.name || 'User';

  return (
    <DashboardLayout 
      title={`Welcome back, ${userName}`}
      userType="agent"
      userName={userName}
    >
      <CampaignIntelligence />
    </DashboardLayout>
  );
};

export default AgentDashboard;
