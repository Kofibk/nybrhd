import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { AlertTriangle, Infinity, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UsageTrackerProps {
  className?: string;
}

export const UsageTracker: React.FC<UsageTrackerProps> = ({ className }) => {
  const { currentTier, tierConfig, contactsUsed, contactsRemaining } = useSubscription();

  const isUnlimited = tierConfig.monthlyContacts === 'unlimited';
  const limit = isUnlimited ? 0 : (tierConfig.monthlyContacts as number);
  const percentage = isUnlimited ? 0 : Math.min((contactsUsed / limit) * 100, 100);
  const isNearLimit = !isUnlimited && contactsUsed >= limit * 0.8;
  const isAtLimit = !isUnlimited && contactsUsed >= limit;

  if (currentTier === 'enterprise') {
    return (
      <Card className={cn("bg-gradient-to-r from-purple-500/5 to-purple-600/10 border-purple-500/20", className)}>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Infinity className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm font-medium">Unlimited contacts</p>
                <p className="text-xs text-muted-foreground">
                  {contactsUsed} contacts made this month
                </p>
              </div>
            </div>
            <Badge variant="outline" className="border-purple-500/30 text-purple-500">
              Enterprise
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(
      isAtLimit ? "border-destructive/50 bg-destructive/5" :
      isNearLimit ? "border-amber-500/50 bg-amber-500/5" :
      "",
      className
    )}>
      <CardContent className="py-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isNearLimit && !isAtLimit && (
                <AlertTriangle className="h-4 w-4 text-amber-500" />
              )}
              {isAtLimit && (
                <AlertTriangle className="h-4 w-4 text-destructive" />
              )}
              <span className="text-sm font-medium">
                {contactsUsed} / {limit} contacts used this month
              </span>
            </div>
            {isAtLimit && (
              <Button size="sm" className="h-7 text-xs">
                Upgrade Now
              </Button>
            )}
          </div>
          
          <Progress 
            value={percentage} 
            className={cn(
              "h-2",
              isAtLimit && "[&>div]:bg-destructive",
              isNearLimit && !isAtLimit && "[&>div]:bg-amber-500"
            )}
          />
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {typeof contactsRemaining === 'number' 
                ? `${contactsRemaining} contacts remaining`
                : 'Unlimited'
              }
            </span>
            {isNearLimit && !isAtLimit && (
              <span className="text-amber-500">Approaching limit</span>
            )}
            {isAtLimit && (
              <span className="text-destructive">Limit reached</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UsageTracker;
