import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Building2, Users, TrendingUp, Sparkles, Target, BarChart3, MessageSquare, CheckCircle2, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();

  const pillars = [
    {
      icon: Target,
      title: "Attract",
      description: "AI-powered campaign builder targets buyers globally across all channels with intelligent budget allocation and creative optimization"
    },
    {
      icon: Sparkles,
      title: "Qualify",
      description: "Automated lead scoring and enrichment identifies high-intent buyers with profile and engagement scoring"
    },
    {
      icon: MessageSquare,
      title: "Nurture",
      description: "AI concierge handles buyer queries 24/7 via WhatsApp, email, and chat, guiding them through their journey"
    },
    {
      icon: TrendingUp,
      title: "Convert",
      description: "AI-driven recommendations, smart booking systems, and journey tracking turn prospects into buyers"
    }
  ];

  const userTypes = [
    {
      icon: Building2,
      title: "Property Developers",
      description: "Launch multi-property campaigns, track buyer journeys, and convert leads at scale",
      features: ["Multi-development management", "White-label buyer portals", "Campaign analytics", "Lead scoring"]
    },
    {
      icon: Users,
      title: "Estate Agents",
      description: "List properties, run targeted campaigns, and manage buyer relationships efficiently",
      features: ["Property listings", "AI buyer matching", "Viewing scheduling", "Agent assignment"]
    },
    {
      icon: BarChart3,
      title: "Mortgage Brokers",
      description: "Connect products to buyers, automate prequalification, and track applications",
      features: ["Product recommendations", "Document management", "Application tracking", "CRM integration"]
    }
  ];

  const pricing = [
    { name: "Free", price: "£0", features: ["Up to 5 buyers", "Basic campaigns", "Email support"], limit: "Perfect for testing" },
    { name: "Starter", price: "£599", features: ["Up to 50 buyers", "AI campaign builder", "Lead scoring", "WhatsApp support"], popular: false },
    { name: "Growth", price: "£999", features: ["Up to 200 buyers", "Advanced analytics", "AI concierge", "Priority support"], popular: true },
    { name: "Pro", price: "£1,499", features: ["Up to 500 buyers", "White-label portal", "API access", "Dedicated success manager"], popular: false },
    { name: "Enterprise", price: "Custom", features: ["Unlimited buyers", "Custom integrations", "SLA guarantee", "Enterprise support"], limit: "Contact sales" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-accent/5 to-background">
        <div className="container mx-auto px-4 py-24 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Sparkles className="h-4 w-4" />
              AI-Powered Property Sales Platform
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              Close More Deals with
              <span className="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                AI-Powered Sales
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Naybourhood.ai helps property developers, estate agents, and mortgage brokers attract, qualify, nurture, and convert buyers globally—all on autopilot.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="text-lg h-14 px-8"
                onClick={() => navigate('/onboarding')}
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg h-14 px-8"
              >
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Four Pillars */}
      <section className="py-24 bg-secondary/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">The Complete Sales Solution</h2>
            <p className="text-xl text-muted-foreground">Four pillars working together to maximize conversions</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {pillars.map((pillar) => (
              <Card key={pillar.title} className="p-6 hover:shadow-lg transition-all">
                <pillar.icon className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-bold mb-3">{pillar.title}</h3>
                <p className="text-muted-foreground">{pillar.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* User Types */}
      <section className="py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Built for Property Professionals</h2>
            <p className="text-xl text-muted-foreground">Tailored solutions for every role in the property ecosystem</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {userTypes.map((type) => (
              <Card key={type.title} className="p-8 hover:shadow-xl transition-all border-2 hover:border-primary/50">
                <type.icon className="h-16 w-16 text-primary mb-6" />
                <h3 className="text-2xl font-bold mb-3">{type.title}</h3>
                <p className="text-muted-foreground mb-6">{type.description}</p>
                <ul className="space-y-3">
                  {type.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 bg-secondary/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-muted-foreground">Choose the plan that fits your business</p>
          </div>
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6 max-w-7xl mx-auto">
            {pricing.map((plan) => (
              <Card 
                key={plan.name} 
                className={`p-6 relative ${plan.popular ? 'border-2 border-primary shadow-xl scale-105' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                  <div className="mb-2">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    {plan.price !== "Custom" && <span className="text-muted-foreground">/mo</span>}
                  </div>
                  {plan.limit && <p className="text-sm text-muted-foreground">{plan.limit}</p>}
                </div>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className="w-full"
                  variant={plan.popular ? "default" : "outline"}
                  onClick={() => navigate('/onboarding')}
                >
                  {plan.name === "Enterprise" ? "Contact Sales" : "Get Started"}
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-primary to-accent text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Property Sales?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join leading property professionals using AI to close more deals, faster.
          </p>
          <Button 
            size="lg" 
            variant="secondary" 
            className="text-lg h-14 px-8"
            onClick={() => navigate('/onboarding')}
          >
            Start Free Trial
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Landing;
