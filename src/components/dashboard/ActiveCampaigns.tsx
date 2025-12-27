import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { demoCampaigns } from '@/lib/buyerData';
import { Megaphone, ChevronRight, Pause, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActiveCampaignsProps {
  className?: string;
  userType: 'developer' | 'agent' | 'broker';
}

export const ActiveCampaigns: React.FC<ActiveCampaignsProps> = ({ className, userType }) => {
  const navigate = useNavigate();
  const basePath = `/${userType}`;

  const activeCampaigns = demoCampaigns.filter(c => c.status === 'active').slice(0, 2);

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'Meta Ads': return '📘';
      case 'Google Ads': return '🔵';
      case 'LinkedIn': return '💼';
      default: return '📢';
    }
  };

  const handleViewCampaign = (campaignId: string) => {
    navigate(`${basePath}/campaigns/${campaignId}`);
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Megaphone className="h-4 w-4" />
            Active Campaigns
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs"
            onClick={() => navigate(`${basePath}/campaigns`)}
          >
            View All
            <ChevronRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {activeCampaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors"
              onClick={() => handleViewCampaign(campaign.id)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getPlatformIcon(campaign.platform)}</span>
                    <span className="text-sm font-medium truncate">{campaign.name}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-[9px]",
                        campaign.status === 'active' 
                          ? "border-green-500/30 text-green-600" 
                          : "border-amber-500/30 text-amber-600"
                      )}
                    >
                      {campaign.status === 'active' ? (
                        <><Play className="h-2 w-2 mr-0.5" /> Active</>
                      ) : (
                        <><Pause className="h-2 w-2 mr-0.5" /> Paused</>
                      )}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">
                      {campaign.targetLocation}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2 mt-3 pt-2 border-t border-border/50">
                <div className="text-center">
                  <p className="text-lg font-semibold">{campaign.leads}</p>
                  <p className="text-[10px] text-muted-foreground">Leads</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold">£{campaign.spend.toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground">Spend</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold">£{campaign.costPerLead.toFixed(0)}</p>
                  <p className="text-[10px] text-muted-foreground">CPL</p>
                </div>
              </div>
            </div>
          ))}

          {activeCampaigns.length === 0 && (
            <div className="text-center py-8">
              <Megaphone className="h-8 w-8 mx-auto text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground mt-2">No active campaigns</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-3"
                onClick={() => navigate(`${basePath}/campaigns`)}
              >
                Request Campaign
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ActiveCampaigns;
