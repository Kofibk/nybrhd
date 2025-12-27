import DashboardLayout from '@/components/DashboardLayout';
import { AIAgentDashboard } from '@/components/admin/AIAgentDashboard';
import { useAuth } from '@/contexts/AuthContext';

const AdminDashboard = () => {
  const { profile } = useAuth();
  const userName = profile?.full_name || 'Admin';

  return (
    <DashboardLayout 
      title={`Welcome back, ${userName}`}
      userType="admin"
      userName={userName}
    >
      <AIAgentDashboard />
    </DashboardLayout>
  );
};

export default AdminDashboard;
