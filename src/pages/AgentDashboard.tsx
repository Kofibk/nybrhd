import DashboardLayout from '@/components/DashboardLayout';
import { SubscriptionBanner } from '@/components/dashboard/SubscriptionBanner';
import { StatsGrid } from '@/components/dashboard/StatsGrid';
import { AccountManagerCard } from '@/components/dashboard/AccountManagerCard';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { RecentConversations } from '@/components/dashboard/RecentConversations';
import { ActiveCampaigns } from '@/components/dashboard/ActiveCampaigns';
import { UpgradePrompt } from '@/components/dashboard/UpgradePrompt';
import { AIInsightsDashboard } from '@/components/AIInsightsDashboard';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';

const AgentDashboard = () => {
  const { profile } = useAuth();
  const { currentTier } = useSubscription();
  const firstName = profile?.full_name?.split(' ')[0] || 'there';

  return (
    <DashboardLayout 
      title={`Welcome back, ${firstName}`}
      userType="agent"
      userName={firstName}
    >
      <div className="space-y-6">
        {/* Subscription Status Banner */}
        <SubscriptionBanner userType="agent" />

        {/* Account Manager Card - Tier 3 Only */}
        {currentTier === 'enterprise' && (
          <AccountManagerCard />
        )}

        {/* Stats Grid */}
        <StatsGrid />

        {/* Quick Actions - Tier 3 Only */}
        {currentTier === 'enterprise' && (
          <QuickActions userType="agent" />
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Column - Conversations & Campaigns */}
          <div className="xl:col-span-2 space-y-6">
            <RecentConversations userType="agent" />
            
            {/* Active Campaigns - Tier 2+ */}
            {currentTier !== 'access' && (
              <ActiveCampaigns userType="agent" />
            )}
          </div>
          
          {/* Right Column - AI Insights & Upgrade */}
          <div className="space-y-6">
            <AIInsightsDashboard variant="panel" userType="agent" />
            
            {/* Upgrade Prompt - Tier 1 & 2 */}
            {currentTier !== 'enterprise' && (
              <UpgradePrompt />
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AgentDashboard;
