import DashboardLayout from '@/components/DashboardLayout';
import { TierSwitcher } from '@/components/TierSwitcher';
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
import { developerCompany } from '@/lib/developerDemoData';

const DeveloperDashboard = () => {
  const { profile } = useAuth();
  const { currentTier } = useSubscription();
  const userName = profile?.full_name || developerCompany.name;

  return (
    <DashboardLayout 
      title={`Welcome back, ${userName}`}
      userType="developer"
      userName={userName}
    >
      <div className="space-y-6">
        {/* Demo Tier Switcher */}
        <TierSwitcher className="w-fit" />

        {/* Subscription Status Banner */}
        <SubscriptionBanner userType="developer" />

        {/* Account Manager Card - Tier 3 Only */}
        {currentTier === 'enterprise' && (
          <AccountManagerCard />
        )}

        {/* Stats Grid */}
        <StatsGrid />

        {/* Quick Actions - Tier 3 Only */}
        {currentTier === 'enterprise' && (
          <QuickActions userType="developer" />
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Column - Conversations & Campaigns */}
          <div className="xl:col-span-2 space-y-6">
            <RecentConversations userType="developer" />
            
            {/* Active Campaigns - Tier 2+ */}
            {currentTier !== 'access' && (
              <ActiveCampaigns userType="developer" />
            )}
          </div>
          
          {/* Right Column - AI Insights & Upgrade */}
          <div className="space-y-6">
            <AIInsightsDashboard variant="panel" userType="developer" />
            
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

export default DeveloperDashboard;
