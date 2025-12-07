import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  ArrowRight, 
  Menu, 
  Play, 
  Target, 
  Users, 
  MessageSquare, 
  TrendingUp,
  Building2,
  Briefcase,
  Landmark,
  PiggyBank,
  CheckCircle2,
  Sparkles
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import whiteLogo from "@/assets/naybourhood-logo-white.svg";

const Landing = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "Admin", onClick: () => navigate('/admin') },
  ];

  const pillars = [
    {
      icon: Target,
      title: "Attract",
      description: "Run smart digital campaigns to reach real buyers",
      gradient: "from-emerald-500/20 to-transparent"
    },
    {
      icon: Users,
      title: "Qualify",
      description: "Instantly score and prioritise high-intent leads",
      gradient: "from-blue-500/20 to-transparent"
    },
    {
      icon: MessageSquare,
      title: "Nurture",
      description: "Automate email and WhatsApp follow-up",
      gradient: "from-violet-500/20 to-transparent"
    },
    {
      icon: TrendingUp,
      title: "Convert",
      description: "Track and close sales with full visibility",
      gradient: "from-amber-500/20 to-transparent"
    }
  ];

  const trustedLogos = [
    "Mount Anvil",
    "Berkeley Group", 
    "London Square",
    "Hadley",
    "Excel Winner",
    "Synergy Properties"
  ];

  const whoItsFor = [
    {
      icon: Building2,
      title: "Housebuilders",
      description: "Launching or scaling new developments"
    },
    {
      icon: Briefcase,
      title: "Estate Agents",
      description: "Needing better buyer reach or listing support"
    },
    {
      icon: PiggyBank,
      title: "Financial Services",
      description: "Mortgage brokers, wealth managers"
    },
    {
      icon: Landmark,
      title: "Banks & Funds",
      description: "Needing direct enquiries"
    }
  ];


  const workflowSteps = [
    { label: "Campaign", step: "01", icon: Target },
    { label: "Lead Capture", step: "02", icon: Users },
    { label: "Qualification", step: "03", icon: CheckCircle2 },
    { label: "Nurture", step: "04", icon: MessageSquare },
    { label: "Reporting", step: "05", icon: TrendingUp },
    { label: "Handover", step: "06", icon: Briefcase }
  ];

  const stats = [
    { value: "£50M+", label: "Property Value Sold" },
    { value: "2,500+", label: "Qualified Leads" },
    { value: "85%", label: "Lead Qualification Rate" },
    { value: "12", label: "Countries Reached" }
  ];

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <div className="flex-shrink-0">
              <img 
                src={whiteLogo} 
                alt="Naybourhood" 
                className="h-6 lg:h-8 w-auto"
              />
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                link.href ? (
                  <a 
                    key={link.label} 
                    href={link.href} 
                    className="text-sm font-body font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                ) : (
                  <button 
                    key={link.label} 
                    onClick={link.onClick} 
                    className="text-sm font-body font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </button>
                )
              ))}
            </div>
            
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/login')} 
                className="hidden sm:inline-flex font-body text-sm text-muted-foreground hover:text-foreground"
              >
                Log In
              </Button>
              <Button 
                size="sm" 
                onClick={() => navigate('/onboarding')} 
                className="font-body text-sm bg-foreground text-background hover:bg-foreground/90"
              >
                Get Started
              </Button>
              
              {/* Mobile Menu */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild className="lg:hidden">
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[280px] bg-background border-l border-border">
                  <nav className="flex flex-col gap-4 mt-8">
                    {navLinks.map((link) => (
                      link.href ? (
                        <a 
                          key={link.label} 
                          href={link.href} 
                          className="text-base font-body font-medium text-foreground hover:text-muted-foreground transition-colors py-2"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {link.label}
                        </a>
                      ) : (
                        <button 
                          key={link.label} 
                          onClick={() => { link.onClick?.(); setMobileMenuOpen(false); }} 
                          className="text-base font-body font-medium text-foreground hover:text-muted-foreground transition-colors text-left py-2"
                        >
                          {link.label}
                        </button>
                      )
                    ))}
                    <hr className="my-2 border-border" />
                    <Button 
                      variant="ghost" 
                      onClick={() => { navigate('/login'); setMobileMenuOpen(false); }} 
                      className="justify-start font-body"
                    >
                      Log In
                    </Button>
                    <Button 
                      onClick={() => { navigate('/onboarding'); setMobileMenuOpen(false); }}
                      className="font-body bg-foreground text-background"
                    >
                      Get Started
                    </Button>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 lg:pt-32 lg:pb-24 min-h-[90vh] flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border border-border/50 mb-6 lg:mb-8">
              <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-xs font-body text-muted-foreground">AI-Powered Property Sales</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-display text-foreground leading-[1.1] mb-6 lg:mb-8">
              The AI Property Sales
              <br className="hidden sm:block" />
              <span className="sm:hidden"> </span>
              <span className="bg-gradient-to-r from-emerald-400 via-blue-400 to-violet-400 bg-clip-text text-transparent">& Marketing Platform</span>
            </h1>
            <p className="text-base sm:text-lg lg:text-xl font-body text-muted-foreground mb-8 lg:mb-10 max-w-2xl leading-relaxed">
              Attract high-intent buyers, qualify leads instantly, and convert faster — all from one platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button 
                size="lg" 
                className="font-body text-sm sm:text-base h-12 sm:h-14 px-6 sm:px-8 bg-foreground text-background hover:bg-foreground/90 group"
                onClick={() => navigate('/onboarding')}
              >
                Get Started
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="font-body text-sm sm:text-base h-12 sm:h-14 px-6 sm:px-8 border-border hover:bg-muted group"
              >
                <Play className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                Tour Platform
              </Button>
            </div>
          </div>
        </div>
        
        {/* Floating elements for visual interest */}
        <div className="absolute right-10 top-1/3 hidden xl:block">
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-2xl blur-xl" />
            <div className="relative bg-card/80 backdrop-blur border border-border/50 rounded-xl p-4 shadow-2xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-emerald-400" />
                </div>
                <span className="text-sm font-body text-muted-foreground">Lead Score</span>
              </div>
              <p className="text-2xl font-display text-foreground">92/100</p>
              <p className="text-xs text-emerald-400 mt-1">High Intent Buyer</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 lg:py-16 border-y border-border/50 bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl sm:text-3xl lg:text-4xl font-display text-foreground mb-1">{stat.value}</p>
                <p className="text-xs sm:text-sm font-body text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trusted By */}
      <section className="py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-body text-muted-foreground tracking-[0.15em] uppercase mb-6 lg:mb-8 text-center lg:text-left">
            Trusted by leading developers
          </p>
          <div className="flex flex-wrap justify-center lg:justify-start items-center gap-x-6 sm:gap-x-10 lg:gap-x-12 gap-y-4">
            {trustedLogos.map((logo) => (
              <span 
                key={logo} 
                className="text-sm sm:text-base font-body font-medium text-muted-foreground/50 hover:text-muted-foreground transition-colors"
              >
                {logo}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Pillars Section */}
      <section id="features" className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 lg:mb-16">
            <p className="text-xs font-body text-muted-foreground tracking-[0.15em] uppercase mb-4">
              How It Works
            </p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display text-foreground">
              Four Pillars of Success
            </h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {pillars.map((pillar) => (
              <div 
                key={pillar.title} 
                className="group relative p-6 lg:p-8 border border-border/50 hover:border-border bg-card/30 hover:bg-card/50 transition-all duration-300 overflow-hidden"
              >
                {/* Gradient hover effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${pillar.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                
                <div className="relative z-10">
                  <div className="h-10 w-10 rounded-lg bg-muted/50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <pillar.icon className="h-5 w-5 text-foreground" />
                  </div>
                  <h3 className="text-lg lg:text-xl font-display text-foreground mb-2">
                    {pillar.title}
                  </h3>
                  <p className="text-sm font-body text-muted-foreground leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Overview */}
      <section className="py-16 lg:py-24 border-t border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <p className="text-xs font-body text-muted-foreground tracking-[0.15em] uppercase mb-4">
                Platform Overview
              </p>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display text-foreground mb-6 leading-tight">
                Built for Modern Property Sales
              </h2>
              <p className="text-base sm:text-lg font-body text-muted-foreground leading-relaxed mb-8">
                Naybourhood combines AI, automation and first-party data to help housebuilders, agents and developers sell homes faster. Launch better campaigns. Capture better leads. Close with confidence.
              </p>
              <ul className="space-y-4">
                {[
                  "AI-powered lead scoring and qualification",
                  "Multi-channel campaign management",
                  "Automated WhatsApp and email nurturing",
                  "Real-time analytics and reporting"
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                    <span className="text-sm font-body text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Visual mockup */}
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-violet-500/10 rounded-2xl blur-2xl" />
              <div className="relative bg-card border border-border/50 rounded-xl overflow-hidden shadow-2xl">
                <div className="h-8 bg-muted/50 border-b border-border/50 flex items-center gap-2 px-4">
                  <div className="h-2.5 w-2.5 rounded-full bg-destructive/50" />
                  <div className="h-2.5 w-2.5 rounded-full bg-warning/50" />
                  <div className="h-2.5 w-2.5 rounded-full bg-success/50" />
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="h-6 w-32 bg-muted rounded animate-pulse" />
                    <div className="h-6 w-20 bg-emerald-500/20 rounded" />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="h-20 bg-muted/50 rounded-lg flex flex-col items-center justify-center">
                      <span className="text-lg font-display text-foreground">248</span>
                      <span className="text-xs text-muted-foreground">Leads</span>
                    </div>
                    <div className="h-20 bg-muted/50 rounded-lg flex flex-col items-center justify-center">
                      <span className="text-lg font-display text-foreground">£42</span>
                      <span className="text-xs text-muted-foreground">Avg CPL</span>
                    </div>
                    <div className="h-20 bg-muted/50 rounded-lg flex flex-col items-center justify-center">
                      <span className="text-lg font-display text-foreground">12%</span>
                      <span className="text-xs text-muted-foreground">Conv Rate</span>
                    </div>
                  </div>
                  <div className="h-32 bg-muted/30 rounded-lg flex items-end justify-around p-4">
                    {[60, 80, 45, 90, 70, 85, 95].map((h, i) => (
                      <div key={i} className="w-6 bg-gradient-to-t from-emerald-500/50 to-emerald-400/50 rounded-t" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Who It's For */}
      <section className="py-16 lg:py-24 bg-card/30 border-t border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-body text-muted-foreground tracking-[0.15em] uppercase mb-4">
            Built For
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display text-foreground mb-10 lg:mb-12">
            Who It's For
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
            {whoItsFor.map((item) => (
              <div 
                key={item.title} 
                className="group p-6 lg:p-8 border border-border/50 hover:border-border bg-background transition-all duration-300 flex items-start gap-4"
              >
                <div className="h-12 w-12 rounded-xl bg-muted/50 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <item.icon className="h-6 w-6 text-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-display text-foreground mb-1">
                    {item.title}
                  </h3>
                  <p className="text-sm font-body text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Visual Workflow */}
      <section className="py-16 lg:py-24 bg-card/30 border-t border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-body text-muted-foreground tracking-[0.15em] uppercase mb-4">
            Process
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display text-foreground mb-10 lg:mb-12">
            Your Journey to More Sales
          </h2>
          
          {/* Desktop: Horizontal flow */}
          <div className="hidden lg:block relative">
            {/* Connecting line */}
            <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-border via-muted-foreground/30 to-border" />
            
            <div className="grid grid-cols-6 gap-4">
              {workflowSteps.map((step, index) => (
                <div key={step.label} className="relative text-center">
                  <div className="relative z-10 h-14 w-14 mx-auto rounded-full bg-background border border-border flex items-center justify-center mb-4 group hover:border-foreground/50 transition-colors">
                    <step.icon className="h-6 w-6 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                  <p className="text-xs font-body text-muted-foreground mb-1">{step.step}</p>
                  <p className="text-sm font-body font-medium text-foreground">{step.label}</p>
                </div>
              ))}
            </div>
          </div>
          
          {/* Mobile: Grid flow */}
          <div className="lg:hidden grid grid-cols-2 sm:grid-cols-3 gap-4">
            {workflowSteps.map((step) => (
              <div key={step.label} className="p-4 border border-border/50 bg-background text-center">
                <step.icon className="h-5 w-5 text-muted-foreground mx-auto mb-2" />
                <p className="text-xs font-body text-muted-foreground mb-1">{step.step}</p>
                <p className="text-sm font-body font-medium text-foreground">{step.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-16 lg:py-24 border-t border-border/50 relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0">
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-gradient-to-t from-emerald-500/10 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-t from-violet-500/10 to-transparent rounded-full blur-3xl" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-display text-foreground mb-6 lg:mb-8 leading-tight">
              Ready to convert more buyers?
            </h2>
            <p className="text-base font-body text-muted-foreground mb-8">
              Join leading developers and agents using Naybourhood to sell more properties, faster.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Button 
                size="lg" 
                className="font-body text-sm sm:text-base h-12 sm:h-14 px-6 sm:px-8 bg-foreground text-background hover:bg-foreground/90 group"
                onClick={() => navigate('/onboarding')}
              >
                Get Started
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="font-body text-sm sm:text-base h-12 sm:h-14 px-6 sm:px-8 border-border hover:bg-muted group"
              >
                <Play className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                Tour Platform
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 lg:py-12 border-t border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <img 
                src={whiteLogo} 
                alt="Naybourhood" 
                className="h-5 w-auto"
              />
              <span className="text-xs font-body text-muted-foreground">
                © 2024 Naybourhood.ai
              </span>
            </div>
            <div className="flex items-center gap-6">
              <a href="#" className="text-xs font-body text-muted-foreground hover:text-foreground transition-colors">
                Privacy
              </a>
              <a href="#" className="text-xs font-body text-muted-foreground hover:text-foreground transition-colors">
                Terms
              </a>
              <a href="#" className="text-xs font-body text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
