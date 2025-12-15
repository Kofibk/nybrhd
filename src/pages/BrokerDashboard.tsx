import DashboardLayout from '@/components/DashboardLayout';
import { CampaignIntelligence } from '@/components/CampaignIntelligence';
import { useAuth } from '@/contexts/AuthContext';

const BrokerDashboard = () => {
  const { user } = useAuth();
  const userName = user?.name || 'User';

  return (
    <DashboardLayout 
      title={`Welcome back, ${userName}`}
      userType="broker"
      userName={userName}
    >
      <CampaignIntelligence />
    </DashboardLayout>
  );
};

export default BrokerDashboard;
