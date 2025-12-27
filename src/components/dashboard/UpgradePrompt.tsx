import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { Crown, Zap, Users, Megaphone, Sparkles, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UpgradePromptProps {
  className?: string;
}

export const UpgradePrompt: React.FC<UpgradePromptProps> = ({ className }) => {
  const { currentTier, setTier } = useSubscription();

  if (currentTier === 'enterprise') return null;

  const handleUpgrade = () => {
    const nextTier = currentTier === 'access' ? 'growth' : 'enterprise';
    setTier(nextTier);
  };

  const tier2Features = [
    { icon: Users, text: '100 contacts/month (vs 30)' },
    { icon: Megaphone, text: 'Done-for-you campaigns' },
    { icon: Sparkles, text: 'Enhanced AI insights' },
  ];

  const tier3Features = [
    { icon: Users, text: 'Unlimited contacts' },
    { icon: Zap, text: 'First refusal on 80+ buyers' },
    { icon: Crown, text: 'Dedicated Account Manager' },
    { icon: Sparkles, text: 'Full predictive analytics' },
  ];

  const features = currentTier === 'access' ? tier2Features : tier3Features;
  const targetTier = currentTier === 'access' ? 'Growth' : 'Enterprise';
  const price = currentTier === 'access' ? '£2,249' : '£3,999';

  return (
    <Card className={cn(
      "bg-gradient-to-br",
      currentTier === 'access' 
        ? "from-amber-500/5 to-amber-600/10 border-amber-500/20" 
        : "from-purple-500/5 to-purple-600/10 border-purple-500/20",
      className
    )}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={cn(
            "p-2 rounded-lg",
            currentTier === 'access' ? "bg-amber-500/10" : "bg-purple-500/10"
          )}>
            {currentTier === 'access' ? (
              <Crown className="h-5 w-5 text-amber-500" />
            ) : (
              <Zap className="h-5 w-5 text-purple-500" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm">Upgrade to {targetTier}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Unlock more features to grow faster
            </p>
            
            <ul className="space-y-1.5 mt-3">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-xs">
                  <Check className={cn(
                    "h-3 w-3",
                    currentTier === 'access' ? "text-amber-500" : "text-purple-500"
                  )} />
                  {feature.text}
                </li>
              ))}
            </ul>
            
            <Button 
              size="sm" 
              className={cn(
                "mt-4 h-8 text-xs w-full",
                currentTier === 'access' 
                  ? "bg-amber-500 hover:bg-amber-600" 
                  : "bg-purple-500 hover:bg-purple-600"
              )}
              onClick={handleUpgrade}
            >
              Upgrade to {targetTier} — {price}/mo
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UpgradePrompt;
