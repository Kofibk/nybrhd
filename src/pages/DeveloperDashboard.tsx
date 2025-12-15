import DashboardLayout from '@/components/DashboardLayout';
import { CampaignIntelligence } from '@/components/CampaignIntelligence';
import { useAuth } from '@/contexts/AuthContext';

const DeveloperDashboard = () => {
  const { user } = useAuth();
  const userName = user?.name || 'User';

  return (
    <DashboardLayout 
      title={`Welcome back, ${userName}`}
      userType="developer"
      userName={userName}
    >
      <CampaignIntelligence />
    </DashboardLayout>
  );
};

export default DeveloperDashboard;
