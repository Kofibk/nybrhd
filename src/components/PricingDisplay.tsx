import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useAuth } from '@/contexts/AuthContext';
import { SUBSCRIPTION_TIERS, SubscriptionTier } from '@/lib/subscriptionTiers';
import { cn } from '@/lib/utils';
import {
  Check,
  X,
  Crown,
  Zap,
  Users,
  Brain,
  Shield,
  Star,
  ArrowRight,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

interface PricingCardProps {
  tier: SubscriptionTier;
  isCurrentPlan?: boolean;
  onSelect?: (tier: SubscriptionTier) => void;
  compact?: boolean;
  isLoading?: boolean;
}

const PricingCard: React.FC<PricingCardProps> = ({ 
  tier, 
  isCurrentPlan = false, 
  onSelect,
  compact = false,
  isLoading = false 
}) => {
  const config = SUBSCRIPTION_TIERS[tier];
  
  const features = [
    {
      label: `${config.monthlyContactsDisplay} monthly contacts`,
      icon: Users,
      included: true,
    },
    {
      label: config.buyerDatabaseAccess,
      icon: Star,
      included: true,
    },
    {
      label: `AI Insights: ${config.aiInsightsCount}`,
      icon: Brain,
      included: true,
    },
    {
      label: config.campaignsDescription,
      icon: Zap,
      included: config.campaigns !== 'locked',
    },
    {
      label: config.scoreBreakdownDescription,
      icon: Sparkles,
      included: true,
    },
    {
      label: config.supportDescription,
      icon: Shield,
      included: true,
    },
    {
      label: 'First Refusal Buyers (80+)',
      icon: Crown,
      included: config.firstRefusalBuyers,
    },
    {
      label: 'Quality + Intent Scoring',
      icon: Star,
      included: config.qualityIntentScoring,
    },
  ];

  return (
    <Card className={cn(
      "relative transition-all duration-200",
      config.isPopular && "border-amber-500 shadow-lg shadow-amber-500/10",
      isCurrentPlan && "ring-2 ring-primary"
    )}>
      {config.isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="bg-amber-500 text-black font-medium px-3">
            Most Popular
          </Badge>
        </div>
      )}
      
      {isCurrentPlan && (
        <div className="absolute -top-3 right-4">
          <Badge variant="outline" className="bg-primary text-primary-foreground">
            Current Plan
          </Badge>
        </div>
      )}

      <CardHeader className={cn("text-center", compact ? "pb-2" : "pb-4")}>
        <CardTitle className="text-lg font-semibold">{config.name}</CardTitle>
        <div className="mt-2">
          <span className="text-3xl font-bold">{config.priceDisplay}</span>
          <span className="text-muted-foreground">/month</span>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          {config.description}
        </p>
      </CardHeader>

      <CardContent className={cn(compact ? "pt-0" : "pt-2")}>
        <ul className={cn("space-y-2", compact && "space-y-1.5")}>
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2 text-sm">
              {feature.included ? (
                <Check className="h-4 w-4 text-green-500 shrink-0" />
              ) : (
                <X className="h-4 w-4 text-muted-foreground/50 shrink-0" />
              )}
              <span className={cn(
                feature.included ? 'text-foreground' : 'text-muted-foreground/50'
              )}>
                {feature.label}
              </span>
            </li>
          ))}
        </ul>

        {onSelect && !isCurrentPlan && (
          <Button 
            className={cn(
              "w-full mt-6",
              config.isPopular && "bg-amber-500 hover:bg-amber-600 text-black"
            )}
            onClick={() => onSelect(tier)}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                {`Upgrade to ${config.name}`}
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        )}
        
        {isCurrentPlan && (
          <Button variant="outline" className="w-full mt-6" disabled>
            Current Plan
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

interface PricingDisplayProps {
  variant?: 'cards' | 'table' | 'compact';
  showUpgrade?: boolean;
  onUpgrade?: (tier: SubscriptionTier) => void;
}

export const PricingDisplay: React.FC<PricingDisplayProps> = ({
  variant = 'cards',
  showUpgrade = true,
  onUpgrade,
}) => {
  const { currentTier, setTier, initiateCheckout, isLoading: subscriptionLoading } = useSubscription();
  const { isAuthenticated } = useAuth();
  const [loadingTier, setLoadingTier] = useState<SubscriptionTier | null>(null);

  const handleSelect = async (tier: SubscriptionTier) => {
    if (onUpgrade) {
      onUpgrade(tier);
      return;
    }

    if (!isAuthenticated) {
      // If not logged in, just switch tier for demo
      setTier(tier);
      toast.success(`Switched to ${SUBSCRIPTION_TIERS[tier].name} plan (demo mode)`);
      return;
    }

    // Initiate real Stripe checkout
    setLoadingTier(tier);
    try {
      await initiateCheckout(tier);
      toast.success('Redirecting to checkout...');
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to start checkout. Please try again.');
    } finally {
      setLoadingTier(null);
    }
  };

  if (variant === 'compact') {
    return (
      <div className="flex flex-col sm:flex-row gap-3">
        {(['access', 'growth', 'enterprise'] as SubscriptionTier[]).map((tier) => {
          const config = SUBSCRIPTION_TIERS[tier];
          const isCurrent = currentTier === tier;
          return (
            <Card 
              key={tier}
              className={cn(
                "flex-1 p-4 cursor-pointer transition-all hover:border-primary/50",
                config.isPopular && "border-amber-500/50",
                isCurrent && "ring-2 ring-primary"
              )}
              onClick={() => !isCurrent && handleSelect(tier)}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{config.name}</span>
                {config.isPopular && (
                  <Badge variant="secondary" className="text-[10px]">Popular</Badge>
                )}
              </div>
              <div className="text-xl font-bold">{config.priceDisplay}</div>
              <p className="text-xs text-muted-foreground">/month</p>
            </Card>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
      {(['access', 'growth', 'enterprise'] as SubscriptionTier[]).map((tier) => (
        <PricingCard
          key={tier}
          tier={tier}
          isCurrentPlan={currentTier === tier}
          onSelect={showUpgrade ? handleSelect : undefined}
          compact={variant === 'table'}
          isLoading={loadingTier === tier}
        />
      ))}
    </div>
  );
};

interface UpgradeModalProps {
  trigger?: React.ReactNode;
  defaultOpen?: boolean;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ trigger, defaultOpen }) => {
  const [open, setOpen] = useState(defaultOpen || false);
  const { initiateCheckout } = useSubscription();
  const { isAuthenticated } = useAuth();

  const handleUpgrade = async (tier: SubscriptionTier) => {
    if (isAuthenticated) {
      try {
        await initiateCheckout(tier);
        setOpen(false);
      } catch (error) {
        toast.error('Failed to start checkout');
      }
    } else {
      toast.info('Please log in to upgrade your plan');
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <Crown className="h-5 w-5 text-amber-500" />
            Upgrade Your Plan
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <PricingDisplay onUpgrade={handleUpgrade} />
        </div>
        <p className="text-xs text-muted-foreground text-center mt-4">
          All plans include a 14-day money-back guarantee. No long-term contracts.
        </p>
      </DialogContent>
    </Dialog>
  );
};

export const FeatureGate: React.FC<{
  requiredTier: SubscriptionTier;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ requiredTier, children, fallback }) => {
  const { canAccess } = useSubscription();

  if (canAccess(requiredTier)) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className="relative">
      <div className="opacity-50 pointer-events-none blur-[1px]">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg">
        <div className="text-center p-4">
          <Crown className="h-8 w-8 text-amber-500 mx-auto mb-2" />
          <p className="text-sm font-medium">
            Upgrade to {SUBSCRIPTION_TIERS[requiredTier].name}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {SUBSCRIPTION_TIERS[requiredTier].priceDisplay}/month
          </p>
          <UpgradeModal 
            trigger={
              <Button size="sm" className="mt-3">
                Unlock Feature
              </Button>
            } 
          />
        </div>
      </div>
    </div>
  );
};

export default PricingDisplay;
