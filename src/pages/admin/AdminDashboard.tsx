import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { CampaignIntelligence } from '@/components/CampaignIntelligence';
import { MasterAgent } from '@/components/MasterAgent';
import AdminCampaignsTable from '@/components/admin/AdminCampaignsTable';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutDashboard, Megaphone } from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const userName = user?.name || 'Admin';
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <DashboardLayout 
      title={`Welcome back, ${userName}`}
      userType="admin"
      userName={userName}
    >
      <div className="space-y-6">
        {/* Master Agent - Full Width */}
        <MasterAgent />
        
        {/* Tabs for Overview and Campaigns */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="overview" className="gap-2">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="campaigns" className="gap-2">
              <Megaphone className="h-4 w-4" />
              <span className="hidden sm:inline">Campaigns</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-6">
            <CampaignIntelligence />
          </TabsContent>
          
          <TabsContent value="campaigns" className="mt-6">
            <AdminCampaignsTable searchQuery={searchQuery} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;