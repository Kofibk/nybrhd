import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { calculateStats } from '@/lib/buyerData';
import { 
  Users, 
  MessageSquare, 
  Calendar, 
  TrendingUp, 
  Megaphone,
  Zap,
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtext: string;
  icon: React.ElementType;
  iconColor?: string;
  trend?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtext,
  icon: Icon,
  iconColor = 'text-primary',
  trend,
}) => (
  <Card>
    <CardContent className="p-4">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground font-medium">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{subtext}</p>
        </div>
        <div className={cn("p-2 rounded-lg bg-muted/50", iconColor)}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      {trend && (
        <div className="mt-2 flex items-center gap-1 text-xs text-green-500">
          <TrendingUp className="h-3 w-3" />
          {trend}
        </div>
      )}
    </CardContent>
  </Card>
);

interface StatsGridProps {
  className?: string;
}

export const StatsGrid: React.FC<StatsGridProps> = ({ className }) => {
  const { currentTier, tierConfig } = useSubscription();
  const stats = calculateStats(currentTier);

  const getTierStats = () => {
    const baseStats: StatCardProps[] = [
      {
        title: 'Available Buyers',
        value: stats.availableBuyers,
        subtext: currentTier === 'access' ? 'Score 50-69' : 
                 currentTier === 'growth' ? 'All Score 50+' : 
                 'Full database access',
        icon: Users,
        iconColor: 'text-blue-500',
      },
      {
        title: 'Buyers Contacted',
        value: stats.buyersContacted,
        subtext: 'This month',
        icon: MessageSquare,
        iconColor: 'text-green-500',
      },
      {
        title: 'Responses',
        value: stats.responses,
        subtext: `${stats.responseRate}% response rate`,
        icon: TrendingUp,
        iconColor: 'text-amber-500',
      },
      {
        title: 'Viewings Booked',
        value: stats.viewingsBooked,
        subtext: `${stats.conversionRate}% conversion`,
        icon: Calendar,
        iconColor: 'text-purple-500',
      },
    ];

    // Add campaign leads for Tier 2 and 3
    if (currentTier !== 'access') {
      baseStats.push({
        title: 'Campaign Leads',
        value: stats.campaignLeads,
        subtext: `${stats.activeCampaigns} active campaigns`,
        icon: Megaphone,
        iconColor: 'text-pink-500',
      });
    }

    // Replace first stat with "All Buyers" for Tier 3
    if (currentTier === 'enterprise') {
      baseStats[0] = {
        title: 'All Buyers',
        value: stats.availableBuyers,
        subtext: 'Full database access',
        icon: Users,
        iconColor: 'text-blue-500',
      };

      // Add First Refusal stat for Tier 3
      baseStats.splice(1, 0, {
        title: 'First Refusal',
        value: stats.firstRefusalCount,
        subtext: 'New this week',
        icon: Zap,
        iconColor: 'text-amber-500',
        trend: '+3 this week',
      });
    }

    return baseStats;
  };

  const statsToShow = getTierStats();

  return (
    <div className={cn(
      "grid gap-4",
      currentTier === 'access' ? "grid-cols-2 lg:grid-cols-4" : "grid-cols-2 lg:grid-cols-5",
      className
    )}>
      {statsToShow.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
};

export default StatsGrid;
