import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Check, 
  X, 
  Crown, 
  Users, 
  Brain, 
  Zap, 
  Shield, 
  Star,
  Sparkles,
  ArrowRight,
  Menu,
  X as CloseIcon
} from "lucide-react";
import { useState } from "react";
import { SUBSCRIPTION_TIERS, SubscriptionTier } from "@/lib/subscriptionTiers";
import { cn } from "@/lib/utils";
import whiteLogo from "@/assets/naybourhood-logo-white.svg";

const Pricing = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "How It Works", href: "/how-it-works" },
    { label: "Solutions", href: "/solutions" },
    { label: "Case Studies", href: "/case-studies" },
    { label: "Pricing", href: "/pricing" },
    { label: "About", href: "/about" },
    { label: "Resources", href: "/resources" },
  ];

  const tiers: SubscriptionTier[] = ['access', 'growth', 'enterprise'];

  const getFeaturesList = (tier: SubscriptionTier) => {
    const config = SUBSCRIPTION_TIERS[tier];
    return [
      {
        label: `${config.monthlyContactsDisplay} monthly contacts`,
        icon: Users,
        included: true,
      },
      {
        label: config.buyerDatabaseAccess,
        icon: Star,
        included: true,
        description: config.buyerDatabaseDescription,
      },
      {
        label: `AI Insights: ${config.aiInsightsCount}`,
        icon: Brain,
        included: true,
        description: config.aiInsightsDescription,
      },
      {
        label: config.campaigns === 'locked' ? 'Campaigns (not included)' : config.campaignsDescription,
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
      {
        label: 'Weekly Email Digest',
        icon: Zap,
        included: config.weeklyEmailDigest,
      },
      {
        label: 'Predictive Analytics',
        icon: Brain,
        included: config.predictiveAnalytics,
      },
      {
        label: 'Automated Follow-ups',
        icon: Sparkles,
        included: config.automatedFollowUps,
      },
      {
        label: 'Custom Insight Requests',
        icon: Star,
        included: config.customInsightRequests,
      },
      {
        label: 'Daily Insight Refresh',
        icon: Zap,
        included: config.dailyInsightRefresh,
      },
    ];
  };

  // Comparison table features
  const comparisonFeatures = [
    { name: 'Monthly Contacts', key: 'monthlyContactsDisplay' },
    { name: 'Buyer Database Access', key: 'buyerDatabaseAccess' },
    { name: 'AI Insights', key: 'aiInsightsCount' },
    { name: 'Campaigns', key: 'campaignsDescription' },
    { name: 'Score Breakdown', key: 'scoreBreakdownDescription' },
    { name: 'Support', key: 'supportDescription' },
    { name: 'First Refusal Buyers', key: 'firstRefusalBuyers', isBoolean: true },
    { name: 'Quality + Intent Scoring', key: 'qualityIntentScoring', isBoolean: true },
    { name: 'Weekly Email Digest', key: 'weeklyEmailDigest', isBoolean: true },
    { name: 'Predictive Analytics', key: 'predictiveAnalytics', isBoolean: true },
    { name: 'Automated Follow-ups', key: 'automatedFollowUps', isBoolean: true },
    { name: 'Custom Insight Requests', key: 'customInsightRequests', isBoolean: true },
    { name: 'Daily Insight Refresh', key: 'dailyInsightRefresh', isBoolean: true },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
        <nav className="container mx-auto px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div 
              className="flex items-center gap-2 cursor-pointer" 
              onClick={() => navigate('/')}
            >
              <img 
                src={whiteLogo} 
                alt="Naybourhood" 
                className="h-8 w-auto"
              />
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => navigate(link.href)}
                  className={cn(
                    "text-sm font-medium text-muted-foreground hover:text-foreground transition-colors",
                    link.href === '/pricing' && "text-foreground"
                  )}
                >
                  {link.label}
                </button>
              ))}
            </div>

            <div className="hidden lg:flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate('/login')}>
                Log In
              </Button>
              <Button onClick={() => navigate('/onboarding')}>
                Get Started
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <CloseIcon className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden mt-4 pb-4 border-t border-border pt-4">
              <div className="flex flex-col gap-4">
                {navLinks.map((link) => (
                  <button
                    key={link.label}
                    onClick={() => {
                      navigate(link.href);
                      setMobileMenuOpen(false);
                    }}
                    className="text-left text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </button>
                ))}
                <div className="flex flex-col gap-2 mt-4">
                  <Button variant="ghost" onClick={() => navigate('/login')}>
                    Log In
                  </Button>
                  <Button onClick={() => navigate('/onboarding')}>
                    Get Started
                  </Button>
                </div>
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-16 lg:pt-40 lg:pb-24">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <Badge variant="outline" className="mb-4 px-4 py-1.5">
            Simple, Transparent Pricing
          </Badge>
          <h1 className="text-4xl lg:text-6xl font-display font-bold mb-6 tracking-tight">
            Choose Your <span className="text-primary">Growth Plan</span>
          </h1>
          <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto">
            Scale your buyer acquisition with AI-powered intelligence. All plans include our core platform features.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-16 lg:pb-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
            {tiers.map((tier) => {
              const config = SUBSCRIPTION_TIERS[tier];
              const features = getFeaturesList(tier);
              
              return (
                <Card 
                  key={tier}
                  className={cn(
                    "relative transition-all duration-200 flex flex-col",
                    config.isPopular && "border-amber-500 shadow-lg shadow-amber-500/10 scale-105 z-10"
                  )}
                >
                  {config.isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-amber-500 text-black font-medium px-3">
                        Most Popular
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="text-center pb-4">
                    <CardTitle className="text-xl font-semibold">{config.name}</CardTitle>
                    <div className="mt-3">
                      <span className="text-4xl font-bold">{config.priceDisplay}</span>
                      <span className="text-muted-foreground">/month</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-3">
                      {config.description}
                    </p>
                  </CardHeader>

                  <CardContent className="flex-1 flex flex-col">
                    <ul className="space-y-3 flex-1">
                      {features.slice(0, 8).map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          {feature.included ? (
                            <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                          ) : (
                            <X className="h-4 w-4 text-muted-foreground/50 shrink-0 mt-0.5" />
                          )}
                          <span className={cn(
                            feature.included ? 'text-foreground' : 'text-muted-foreground/50'
                          )}>
                            {feature.label}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <Button 
                      className={cn(
                        "w-full mt-6",
                        config.isPopular && "bg-amber-500 hover:bg-amber-600 text-black"
                      )}
                      onClick={() => navigate('/onboarding')}
                    >
                      Get Started
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-display font-bold mb-4">
              Compare Plans
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              See exactly what's included in each tier to find the perfect fit for your business.
            </p>
          </div>

          <div className="max-w-5xl mx-auto overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-4 px-4 font-semibold">Feature</th>
                  {tiers.map((tier) => (
                    <th key={tier} className="text-center py-4 px-4">
                      <div className="font-semibold">{SUBSCRIPTION_TIERS[tier].name}</div>
                      <div className="text-sm text-muted-foreground">{SUBSCRIPTION_TIERS[tier].priceDisplay}/mo</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((feature, index) => (
                  <tr key={feature.key} className={cn("border-b border-border/50", index % 2 === 0 && "bg-muted/20")}>
                    <td className="py-3 px-4 text-sm font-medium">{feature.name}</td>
                    {tiers.map((tier) => {
                      const config = SUBSCRIPTION_TIERS[tier];
                      const value = config[feature.key as keyof typeof config];
                      
                      return (
                        <td key={tier} className="text-center py-3 px-4 text-sm">
                          {feature.isBoolean ? (
                            value ? (
                              <Check className="h-5 w-5 text-green-500 mx-auto" />
                            ) : (
                              <X className="h-5 w-5 text-muted-foreground/30 mx-auto" />
                            )
                          ) : (
                            <span className="text-muted-foreground">{String(value)}</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-display font-bold mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-card rounded-lg p-6 border border-border">
              <h3 className="font-semibold mb-2">What do buyer scores mean?</h3>
              <p className="text-sm text-muted-foreground">
                Our AI scores buyers from 0-100 based on budget, timeline, and engagement. Higher scores indicate stronger purchase intent and readiness to buy. Access tier gets buyers scoring 50-69, Growth gets 50+, and Enterprise gets first refusal on the hottest leads (80+).
              </p>
            </div>
            <div className="bg-card rounded-lg p-6 border border-border">
              <h3 className="font-semibold mb-2">Can I upgrade or downgrade at any time?</h3>
              <p className="text-sm text-muted-foreground">
                Yes! You can change your plan at any time. When upgrading, you'll get immediate access to new features. When downgrading, the change takes effect at your next billing cycle.
              </p>
            </div>
            <div className="bg-card rounded-lg p-6 border border-border">
              <h3 className="font-semibold mb-2">What's included in "Done-for-you" campaigns?</h3>
              <p className="text-sm text-muted-foreground">
                Our team handles campaign setup, optimization, and management for you. We create targeted campaigns, monitor performance, and make adjustments to maximize your buyer acquisition results.
              </p>
            </div>
            <div className="bg-card rounded-lg p-6 border border-border">
              <h3 className="font-semibold mb-2">Is there a money-back guarantee?</h3>
              <p className="text-sm text-muted-foreground">
                Yes, all plans include a 14-day money-back guarantee. If you're not satisfied, contact our support team for a full refund.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-display font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-base lg:text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join leading developers, agents, and brokers who are already growing with Naybourhood.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="px-8"
              onClick={() => navigate('/onboarding')}
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate('/developer')}
            >
              Tour Platform
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <img 
                src={whiteLogo} 
                alt="Naybourhood" 
                className="h-6 w-auto"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Naybourhood.ai. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Pricing;
