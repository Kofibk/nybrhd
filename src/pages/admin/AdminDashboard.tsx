import DashboardLayout from '@/components/DashboardLayout';
import { CampaignIntelligence } from '@/components/CampaignIntelligence';
import { useAuth } from '@/contexts/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();
  const userName = user?.name || 'Admin';

  return (
    <DashboardLayout 
      title={`Welcome back, ${userName}`}
      userType="admin"
      userName={userName}
    >
      <CampaignIntelligence />
    </DashboardLayout>
  );
};

export default AdminDashboard;
