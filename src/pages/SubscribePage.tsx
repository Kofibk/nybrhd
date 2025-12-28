import { useSubscription } from '@/contexts/SubscriptionContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LogoWithTransparency } from '@/components/LogoWithTransparency';
import { Check, CreditCard, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const PLANS = [
  {
    id: 'access' as const,
    name: 'Access',
    price: '£999',
    period: '/month',
    description: 'Perfect for getting started',
    features: [
      'Access to buyers (Score 50-69)',
      'Basic lead information',
      'Email support',
      '10 buyer contacts/month',
    ],
  },
  {
    id: 'growth' as const,
    name: 'Growth',
    price: '£2,249',
    period: '/month',
    description: 'For scaling your business',
    recommended: true,
    features: [
      'Access to all buyers (Score 50+)',
      'Full lead profiles & scoring',
      'Campaign analytics',
      '25 buyer contacts/month',
      'Priority support',
    ],
  },
  {
    id: 'enterprise' as const,
    name: 'Enterprise',
    price: '£3,999',
    period: '/month',
    description: 'For high-volume teams',
    features: [
      'Full database access',
      'First refusal on high-intent buyers',
      'Dedicated account manager',
      'Unlimited buyer contacts',
      'Custom campaigns',
      'API access',
    ],
  },
];

const SubscribePage = () => {
  const { initiateCheckout } = useSubscription();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleSubscribe = async (planId: 'access' | 'growth' | 'enterprise') => {
    setLoadingPlan(planId);
    try {
      await initiateCheckout(planId);
    } catch (error: any) {
      toast.error('Failed to start checkout', {
        description: error.message || 'Please try again',
      });
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="p-6 border-b border-border">
        <div className="max-w-6xl mx-auto">
          <LogoWithTransparency className="h-8" variant="white" />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-12">
        <div className="max-w-5xl mx-auto w-full space-y-8">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <CreditCard className="h-4 w-4" />
              Subscription Required
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold">
              Choose Your Plan to Continue
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Select a subscription plan to access your dashboard and start connecting with verified buyers.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {PLANS.map((plan) => (
              <Card 
                key={plan.id}
                className={`relative ${plan.recommended ? 'border-primary shadow-lg' : ''}`}
              >
                {plan.recommended && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
                    RECOMMENDED
                  </Badge>
                )}
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <div className="pt-2">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full" 
                    variant={plan.recommended ? 'default' : 'outline'}
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={loadingPlan !== null}
                  >
                    {loadingPlan === plan.id ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      `Subscribe to ${plan.name}`
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <p className="text-center text-sm text-muted-foreground">
            All plans include a 14-day money-back guarantee. Cancel anytime.
          </p>
        </div>
      </main>
    </div>
  );
};

export default SubscribePage;
