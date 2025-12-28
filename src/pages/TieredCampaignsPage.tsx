import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import { useAirtableCampaigns } from '@/hooks/useAirtable';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { 
  Megaphone, 
  Plus, 
  Play, 
  Pause, 
  CheckCircle,
  TrendingUp,
  Lock,
  Crown,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface TieredCampaignsPageProps {
  userType: 'developer' | 'agent' | 'broker';
}

const TieredCampaignsPage: React.FC<TieredCampaignsPageProps> = ({ userType }) => {
  const navigate = useNavigate();
  const { currentTier, initiateCheckout } = useSubscription();
  const basePath = `/${userType}`;

  // Fetch campaigns from Airtable
  const { data: campaignsData, isLoading } = useAirtableCampaigns();

  const campaigns = campaignsData?.records || [];

  // Tier 1 users see locked state
  if (currentTier === 'access') {
    return (
      <DashboardLayout title="Campaigns" userType={userType}>
        <Card className="p-8 text-center max-w-lg mx-auto">
          <div className="p-4 rounded-full bg-muted/50 w-fit mx-auto mb-4">
            <Lock className="h-12 w-12 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Campaigns are a Tier 2+ Feature</h2>
          <p className="text-muted-foreground mb-6">
            Upgrade to Growth to unlock done-for-you campaign management. 
            We'll create and optimize campaigns on your behalf to generate 
            qualified buyer leads.
          </p>
          
          <div className="space-y-3 text-left mb-6 p-4 bg-muted/30 rounded-lg">
            <h4 className="font-medium text-sm">What you get with Growth:</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Done-for-you campaign creation
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Meta & Google Ads management
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Lead generation optimization
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Performance reporting
              </li>
            </ul>
          </div>
          
          <Button 
            className="bg-amber-500 hover:bg-amber-600"
            onClick={() => initiateCheckout('growth')}
          >
            <Crown className="h-4 w-4 mr-2" />
            Upgrade to Growth — £2,249/mo
          </Button>
        </Card>
      </DashboardLayout>
    );
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform?.toLowerCase()) {
      case 'meta ads':
      case 'facebook': return '📘';
      case 'google ads':
      case 'google': return '🔵';
      case 'linkedin': return '💼';
      default: return '📢';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return <Play className="h-3 w-3" />;
      case 'paused': return <Pause className="h-3 w-3" />;
      case 'completed': return <CheckCircle className="h-3 w-3" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-green-500/10 text-green-600 border-green-500/30';
      case 'paused': return 'bg-amber-500/10 text-amber-600 border-amber-500/30';
      case 'completed': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout title="My Campaigns" userType={userType}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-9 w-32" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="My Campaigns" userType={userType}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {currentTier === 'growth' ? 'Done-for-you campaigns' : 'Full-service campaign management'}
          </p>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            {currentTier === 'growth' ? 'Request New Campaign' : 'New Campaign'}
          </Button>
        </div>

        {/* Campaign Grid */}
        {campaigns.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {campaigns.map((campaign) => (
              <Card 
                key={campaign.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`${basePath}/campaigns/${campaign.id}`)}
              >
                <CardContent className="p-4">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{getPlatformIcon(String(campaign.fields['platform'] || ''))}</span>
                      <div>
                        <h3 className="font-semibold text-sm">{campaign.fields.name || 'Unnamed Campaign'}</h3>
                        <p className="text-xs text-muted-foreground">
                          {campaign.fields.target_regions || campaign.fields.target_cities || 'No location'}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className={cn("text-[10px]", getStatusColor(campaign.fields.status || ''))}>
                      {getStatusIcon(campaign.fields.status || '')}
                      <span className="ml-1 capitalize">{campaign.fields.status || 'Unknown'}</span>
                    </Badge>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 text-center py-3 border-y">
                    <div>
                      <p className="text-lg font-semibold">{campaign.fields['leads_count'] || 0}</p>
                      <p className="text-[10px] text-muted-foreground">Leads</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold">
                        £{(campaign.fields.total_budget || 0).toLocaleString()}
                      </p>
                      <p className="text-[10px] text-muted-foreground">Budget</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold">-</p>
                      <p className="text-[10px] text-muted-foreground">CPL</p>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                    <span>
                      {campaign.fields.start_date 
                        ? `Started ${format(new Date(campaign.fields.start_date), 'MMM d, yyyy')}`
                        : 'Not started'
                      }
                    </span>
                    <Button variant="ghost" size="sm" className="h-7 text-xs">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          /* Empty State */
          <Card className="p-8 text-center">
            <Megaphone className="h-12 w-12 mx-auto text-muted-foreground/50" />
            <h3 className="mt-4 font-semibold">No campaigns yet</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
              {currentTier === 'growth' 
                ? "Request your first done-for-you campaign and we'll handle the rest."
                : "Create your first campaign to start generating qualified leads."
              }
            </p>
            <Button className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              {currentTier === 'growth' ? 'Request Your First Campaign' : 'Create Campaign'}
            </Button>
          </Card>
        )}

        {/* AI Recommendations (Tier 3) */}
        {currentTier === 'enterprise' && campaigns.length > 0 && (
          <Card className="bg-gradient-to-r from-purple-500/5 to-purple-600/10 border-purple-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Zap className="h-4 w-4 text-purple-500" />
                AI Campaign Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="p-3 bg-background/50 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm">
                      Optimize targeting based on high-performing buyer segments
                    </span>
                  </div>
                  <Button size="sm" variant="outline" className="h-7 text-xs">
                    Apply
                  </Button>
                </div>
                <div className="p-3 bg-background/50 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Pause className="h-4 w-4 text-amber-500" />
                    <span className="text-sm">
                      Review underperforming ad sets to optimize spend
                    </span>
                  </div>
                  <Button size="sm" variant="outline" className="h-7 text-xs">
                    Review
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TieredCampaignsPage;
