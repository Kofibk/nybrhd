import DashboardLayout from '@/components/DashboardLayout';
import { AIAgentDashboard } from '@/components/admin/AIAgentDashboard';
import { useAuth } from '@/contexts/AuthContext';
import { developerCompany } from '@/lib/developerDemoData';

const DeveloperDashboard = () => {
  const { user } = useAuth();
  // Use demo company name for developer dashboard
  const userName = user?.name || developerCompany.name;

  return (
    <DashboardLayout 
      title={`Welcome back, ${userName}`}
      userType="developer"
      userName={userName}
    >
      <AIAgentDashboard userType="developer" />
    </DashboardLayout>
  );
};

export default DeveloperDashboard;
