import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Crown, 
  Zap, 
  Infinity, 
  ArrowUpRight, 
  Calendar,
  Users,
  Loader2 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

interface SubscriptionBannerProps {
  className?: string;
  userType?: 'developer' | 'agent' | 'broker';
}

export const SubscriptionBanner: React.FC<SubscriptionBannerProps> = ({ 
  className,
  userType = 'developer' 
}) => {
  const { 
    currentTier, 
    tierConfig, 
    contactsUsed, 
    contactsRemaining,
    subscriptionEnd,
    subscriptionStatus,
    isLoading 
  } = useSubscription();
  const { isAuthenticated } = useAuth();

  const isUnlimited = tierConfig.monthlyContacts === 'unlimited';
  const limit = isUnlimited ? 0 : (tierConfig.monthlyContacts as number);
  const percentage = isUnlimited ? 0 : Math.min((contactsUsed / limit) * 100, 100);
  const isNearLimit = !isUnlimited && contactsUsed >= limit * 0.8;
  const isAtLimit = !isUnlimited && contactsUsed >= limit;

  const getPlanColor = () => {
    switch (currentTier) {
      case 'enterprise':
        return 'from-purple-500/10 via-purple-600/5 to-transparent border-purple-500/20';
      case 'growth':
        return 'from-amber-500/10 via-amber-600/5 to-transparent border-amber-500/20';
      default:
        return 'from-primary/10 via-primary/5 to-transparent border-primary/20';
    }
  };

  const getPlanIcon = () => {
    switch (currentTier) {
      case 'enterprise':
        return <Crown className="h-5 w-5 text-purple-500" />;
      case 'growth':
        return <Zap className="h-5 w-5 text-amber-500" />;
      default:
        return <Users className="h-5 w-5 text-primary" />;
    }
  };

  const getPlanBadgeStyle = () => {
    switch (currentTier) {
      case 'enterprise':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/30';
      case 'growth':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/30';
      default:
        return 'bg-primary/10 text-primary border-primary/30';
    }
  };

  if (isLoading) {
    return (
      <Card className={cn("bg-muted/30", className)}>
        <CardContent className="py-4">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Loading subscription...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(
      "bg-gradient-to-r overflow-hidden",
      getPlanColor(),
      className
    )}>
      <CardContent className="py-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Plan Info */}
          <div className="flex items-center gap-4">
            <div className={cn(
              "p-2.5 rounded-xl",
              currentTier === 'enterprise' ? 'bg-purple-500/10' :
              currentTier === 'growth' ? 'bg-amber-500/10' : 'bg-primary/10'
            )}>
              {getPlanIcon()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{tierConfig.name} Plan</h3>
                <Badge variant="outline" className={cn("text-xs", getPlanBadgeStyle())}>
                  {subscriptionStatus === 'active' ? 'Active' : 
                   subscriptionStatus === 'trial' ? 'Trial' : 
                   !isAuthenticated ? 'Demo' : 'Active'}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {tierConfig.description}
              </p>
            </div>
          </div>

          {/* Usage Stats */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:gap-6">
            {/* Contacts Usage */}
            <div className="flex-1 min-w-[180px]">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-muted-foreground">Monthly Contacts</span>
                {isUnlimited ? (
                  <div className="flex items-center gap-1 text-xs font-medium text-purple-500">
                    <Infinity className="h-3 w-3" />
                    Unlimited
                  </div>
                ) : (
                  <span className={cn(
                    "text-xs font-medium",
                    isAtLimit ? "text-destructive" :
                    isNearLimit ? "text-amber-500" : "text-foreground"
                  )}>
                    {contactsUsed} / {limit}
                  </span>
                )}
              </div>
              {!isUnlimited && (
                <Progress 
                  value={percentage} 
                  className={cn(
                    "h-2",
                    isAtLimit && "[&>div]:bg-destructive",
                    isNearLimit && !isAtLimit && "[&>div]:bg-amber-500"
                  )}
                />
              )}
              {!isUnlimited && (
                <p className={cn(
                  "text-xs mt-1",
                  isAtLimit ? "text-destructive" :
                  isNearLimit ? "text-amber-500" : "text-muted-foreground"
                )}>
                  {typeof contactsRemaining === 'number' 
                    ? `${contactsRemaining} remaining`
                    : 'Unlimited'
                  }
                </p>
              )}
            </div>

            {/* Billing Cycle */}
            {subscriptionEnd && isAuthenticated && (
              <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                <span>Renews {format(new Date(subscriptionEnd), 'MMM d, yyyy')}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2">
              {currentTier !== 'enterprise' && (
                <Link to={`/${userType}/settings`}>
                  <Button size="sm" variant="outline" className="text-xs h-8">
                    Upgrade
                    <ArrowUpRight className="h-3 w-3 ml-1" />
                  </Button>
                </Link>
              )}
              <Link to={`/${userType}/settings`}>
                <Button size="sm" variant="ghost" className="text-xs h-8">
                  Manage
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SubscriptionBanner;
