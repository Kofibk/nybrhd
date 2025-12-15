import DashboardLayout from '@/components/DashboardLayout';
import { AIAgentDashboard } from '@/components/admin/AIAgentDashboard';
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
      <AIAgentDashboard userType="agent" />
    </DashboardLayout>
  );
};

export default AgentDashboard;
