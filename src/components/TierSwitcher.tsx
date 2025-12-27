import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { SUBSCRIPTION_TIERS, SubscriptionTier } from '@/lib/subscriptionTiers';
import { cn } from '@/lib/utils';
import { Crown, Check } from 'lucide-react';
import { toast } from 'sonner';

interface TierSwitcherProps {
  className?: string;
  variant?: 'compact' | 'full';
}

export const TierSwitcher: React.FC<TierSwitcherProps> = ({ 
  className,
  variant = 'compact' 
}) => {
  const { currentTier, setTier, tierConfig } = useSubscription();

  const handleTierChange = (tier: SubscriptionTier) => {
    setTier(tier);
    toast.success(`Switched to ${SUBSCRIPTION_TIERS[tier].name} plan (demo mode)`);
  };

  if (variant === 'compact') {
    return (
      <div className={cn("flex items-center gap-2 p-2 bg-muted/50 rounded-lg", className)}>
        <span className="text-xs text-muted-foreground mr-1">Demo:</span>
        {(['access', 'growth', 'enterprise'] as SubscriptionTier[]).map((tier) => {
          const config = SUBSCRIPTION_TIERS[tier];
          const isActive = currentTier === tier;
          return (
            <Button
              key={tier}
              variant={isActive ? "default" : "ghost"}
              size="sm"
              className={cn(
                "h-7 text-xs px-2",
                isActive && config.isPopular && "bg-amber-500 hover:bg-amber-600 text-black"
              )}
              onClick={() => handleTierChange(tier)}
            >
              {config.name}
            </Button>
          );
        })}
      </div>
    );
  }

  return (
    <Card className={cn("p-4", className)}>
      <div className="flex items-center gap-2 mb-3">
        <Crown className="h-4 w-4 text-amber-500" />
        <span className="text-sm font-medium">Switch Plan (Demo)</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {(['access', 'growth', 'enterprise'] as SubscriptionTier[]).map((tier) => {
          const config = SUBSCRIPTION_TIERS[tier];
          const isActive = currentTier === tier;
          return (
            <button
              key={tier}
              onClick={() => handleTierChange(tier)}
              className={cn(
                "relative p-3 rounded-lg border text-center transition-all",
                isActive 
                  ? "border-primary bg-primary/5 ring-2 ring-primary" 
                  : "border-border hover:border-primary/50",
                config.isPopular && !isActive && "border-amber-500/30"
              )}
            >
              {isActive && (
                <div className="absolute -top-1.5 -right-1.5">
                  <div className="bg-primary rounded-full p-0.5">
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </div>
                </div>
              )}
              <div className="text-xs font-medium">{config.name}</div>
              <div className="text-[10px] text-muted-foreground">{config.priceDisplay}</div>
            </button>
          );
        })}
      </div>
      <p className="text-[10px] text-muted-foreground text-center mt-2">
        Switch tiers to preview different feature sets
      </p>
    </Card>
  );
};

export default TierSwitcher;
