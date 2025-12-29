import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useAirtableBuyersForTable } from '@/hooks/useAirtableData';
import { useMyContactHistory } from '@/hooks/useBuyerAssignments';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Users, 
  MessageSquare, 
  Calendar, 
  TrendingUp, 
  Megaphone,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtext: string;
  icon: React.ElementType;
  iconColor?: string;
  trend?: string;
  isLoading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtext,
  icon: Icon,
  iconColor = 'text-primary',
  trend,
  isLoading,
}) => (
  <Card>
    <CardContent className="p-4">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground font-medium">{title}</p>
          {isLoading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <p className="text-2xl font-bold">{value}</p>
          )}
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
  const { currentTier } = useSubscription();
  
  // Fetch real buyer count from Airtable
  const { buyers, isLoading: loadingBuyers } = useAirtableBuyersForTable({ enabled: true });
  
  // Fetch real contact history
  const { data: contactHistory, isLoading: loadingContacts } = useMyContactHistory();
  
  const isLoading = loadingBuyers || loadingContacts;
  
  // Calculate real stats
  const availableBuyers = buyers.length;
  const buyersContacted = contactHistory?.length || 0;
  const responses = contactHistory?.filter(c => c.response_received).length || 0;
  const responseRate = buyersContacted > 0 ? Math.round((responses / buyersContacted) * 100) : 0;
  const viewingsBooked = contactHistory?.filter(c => c.outcome === 'viewing_booked').length || 0;
  const conversionRate = buyersContacted > 0 ? Math.round((viewingsBooked / buyersContacted) * 100) : 0;
  const firstRefusalCount = buyers.filter(b => b.score >= 80).length;

  const getTierStats = () => {
    const baseStats: StatCardProps[] = [
      {
        title: 'Available Buyers',
        value: availableBuyers,
        subtext: currentTier === 'access' ? 'Score 50-69' : 
                 currentTier === 'growth' ? 'All Score 50+' : 
                 'Full database access',
        icon: Users,
        iconColor: 'text-blue-500',
        isLoading,
      },
      {
        title: 'Buyers Contacted',
        value: buyersContacted,
        subtext: 'This month',
        icon: MessageSquare,
        iconColor: 'text-green-500',
        isLoading,
      },
      {
        title: 'Responses',
        value: responses,
        subtext: `${responseRate}% response rate`,
        icon: TrendingUp,
        iconColor: 'text-amber-500',
        isLoading,
      },
      {
        title: 'Viewings Booked',
        value: viewingsBooked,
        subtext: `${conversionRate}% conversion`,
        icon: Calendar,
        iconColor: 'text-purple-500',
        isLoading,
      },
    ];

    // Add campaign leads for Tier 2 and 3
    if (currentTier !== 'access') {
      baseStats.push({
        title: 'Campaign Leads',
        value: 0,
        subtext: '0 active campaigns',
        icon: Megaphone,
        iconColor: 'text-pink-500',
        isLoading: false,
      });
    }

    // Replace first stat with "All Buyers" for Tier 3
    if (currentTier === 'enterprise') {
      baseStats[0] = {
        title: 'All Buyers',
        value: availableBuyers,
        subtext: 'Full database access',
        icon: Users,
        iconColor: 'text-blue-500',
        isLoading,
      };

      // Add First Refusal stat for Tier 3
      baseStats.splice(1, 0, {
        title: 'First Refusal',
        value: firstRefusalCount,
        subtext: 'Score 80+',
        icon: Zap,
        iconColor: 'text-amber-500',
        isLoading,
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
