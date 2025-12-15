import DashboardLayout from '@/components/DashboardLayout';
import { AIAgentDashboard } from '@/components/admin/AIAgentDashboard';
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
      <AIAgentDashboard userType="developer" />
    </DashboardLayout>
  );
};

export default DeveloperDashboard;
