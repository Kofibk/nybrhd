import DashboardLayout from '@/components/DashboardLayout';
import { CampaignIntelligence } from '@/components/CampaignIntelligence';
import { MasterAgent } from '@/components/MasterAgent';
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MasterAgent />
        <CampaignIntelligence />
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
