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
      <div className="space-y-6">
        {/* Master Agent - Full Width */}
        <MasterAgent />
        
        {/* Campaign Intelligence Below */}
        <CampaignIntelligence />
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;