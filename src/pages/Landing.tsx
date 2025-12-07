import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ArrowRight, Menu, Play, Target, Users, MessageSquare, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import whiteLogo from "@/assets/naybourhood-logo-white.svg";

const Landing = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "Case Studies", href: "#case-studies" },
    { label: "Pricing", href: "#pricing" },
    { label: "Admin", onClick: () => navigate('/admin') },
  ];

  const pillars = [
    {
      icon: Target,
      title: "Attract",
      description: "Run smart digital campaigns to reach real buyers"
    },
    {
      icon: Users,
      title: "Qualify",
      description: "Instantly score and prioritise high-intent leads"
    },
    {
      icon: MessageSquare,
      title: "Nurture",
      description: "Automate email and WhatsApp follow-up"
    },
    {
      icon: TrendingUp,
      title: "Convert",
      description: "Track and close sales with full visibility"
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
      title: "Housebuilders",
      description: "Launching or scaling new developments"
    },
    {
      title: "Estate Agents",
      description: "Needing better buyer reach or listing support"
    },
    {
      title: "Financial Services",
      description: "Mortgage brokers, wealth managers"
    },
    {
      title: "Banks & Funds",
      description: "Needing direct enquiries"
    }
  ];

  const caseStudies = [
    {
      property: "Chelsea Island",
      result: "£5M in reservations",
      timeline: "7 days",
      buyer: "Egyptian investor"
    },
    {
      property: "The Lucan",
      result: "£1.7M sale agreed",
      timeline: "Direct enquiry",
      buyer: "Nigerian investor"
    },
    {
      property: "Parkwood",
      result: "£5M home sold",
      timeline: "3 days",
      buyer: "UK residential family"
    },
    {
      property: "One Clapham",
      result: "£550K reservation",
      timeline: "Secured",
      buyer: "UAE investor"
    }
  ];

  const workflowSteps = [
    { label: "Campaign", step: "01" },
    { label: "Lead Capture", step: "02" },
    { label: "Qualification", step: "03" },
    { label: "Nurture", step: "04" },
    { label: "Reporting", step: "05" },
    { label: "Handover", step: "06" }
  ];

  return (
    <div className="min-h-screen bg-background">
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
      <section className="relative pt-24 pb-16 lg:pt-32 lg:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <p className="text-xs sm:text-sm font-body text-muted-foreground tracking-[0.2em] uppercase mb-4 lg:mb-6">
              AI-Powered Property Sales
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-6xl xl:text-7xl font-display text-foreground leading-[1.1] mb-6 lg:mb-8">
              The AI Property Sales
              <br className="hidden sm:block" />
              <span className="sm:hidden"> </span>
              & Marketing Platform
            </h1>
            <p className="text-base sm:text-lg lg:text-xl font-body text-muted-foreground mb-8 lg:mb-10 max-w-2xl leading-relaxed">
              Attract high-intent buyers, qualify leads instantly, and convert faster — all from one platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button 
                size="lg" 
                className="font-body text-sm sm:text-base h-12 sm:h-14 px-6 sm:px-8 bg-foreground text-background hover:bg-foreground/90"
                onClick={() => navigate('/onboarding')}
              >
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="font-body text-sm sm:text-base h-12 sm:h-14 px-6 sm:px-8 border-border hover:bg-muted"
              >
                <Play className="mr-2 h-4 w-4" />
                Tour Platform
              </Button>
            </div>
          </div>
        </div>
        
        {/* Subtle gradient overlay */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-muted/20 to-transparent pointer-events-none hidden lg:block" />
      </section>

      {/* Trusted By */}
      <section className="py-12 lg:py-16 border-y border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-body text-muted-foreground tracking-[0.15em] uppercase mb-6 lg:mb-8 text-center lg:text-left">
            Trusted by leading developers
          </p>
          <div className="flex flex-wrap justify-center lg:justify-start items-center gap-x-6 sm:gap-x-10 lg:gap-x-12 gap-y-4">
            {trustedLogos.map((logo) => (
              <span 
                key={logo} 
                className="text-sm sm:text-base font-body font-medium text-muted-foreground/50"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {pillars.map((pillar, index) => (
              <div 
                key={pillar.title} 
                className="group p-6 lg:p-8 border border-border/50 hover:border-border hover:bg-card/50 transition-all duration-300"
              >
                <pillar.icon className="h-5 w-5 text-muted-foreground mb-4" />
                <h3 className="text-lg lg:text-xl font-display text-foreground mb-2">
                  {pillar.title}
                </h3>
                <p className="text-sm font-body text-muted-foreground leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Overview */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-body text-muted-foreground tracking-[0.15em] uppercase mb-4">
              Platform Overview
            </p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display text-foreground mb-6 leading-tight">
              Built for Modern Property Sales
            </h2>
            <p className="text-base sm:text-lg font-body text-muted-foreground leading-relaxed">
              Naybourhood combines AI, automation and first-party data to help housebuilders, agents and developers sell homes faster. Launch better campaigns. Capture better leads. Close with confidence.
            </p>
          </div>
        </div>
      </section>

      {/* Who It's For */}
      <section className="py-16 lg:py-24 border-t border-border/50">
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
                className="p-6 lg:p-8 border border-border/50 hover:border-border transition-colors"
              >
                <h3 className="text-lg font-display text-foreground mb-2">
                  {item.title}
                </h3>
                <p className="text-sm font-body text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Case Studies */}
      <section id="case-studies" className="py-16 lg:py-24 bg-card border-y border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-body text-muted-foreground tracking-[0.15em] uppercase mb-4">
            Results
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display text-foreground mb-10 lg:mb-12">
            Case Studies
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {caseStudies.map((study) => (
              <div 
                key={study.property} 
                className="p-6 lg:p-8 bg-background border border-border/50 hover:border-border transition-colors"
              >
                <p className="text-xs font-body text-muted-foreground mb-2">{study.timeline}</p>
                <h3 className="text-lg font-display text-foreground mb-3">
                  {study.property}
                </h3>
                <p className="text-xl lg:text-2xl font-display text-foreground mb-3">
                  {study.result}
                </p>
                <p className="text-xs font-body text-muted-foreground">
                  {study.buyer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Visual Workflow */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-body text-muted-foreground tracking-[0.15em] uppercase mb-4">
            Process
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display text-foreground mb-10 lg:mb-12">
            How It Works
          </h2>
          
          {/* Desktop: Horizontal flow */}
          <div className="hidden lg:flex items-center justify-between">
            {workflowSteps.map((step, index) => (
              <div key={step.label} className="flex items-center">
                <div className="text-center">
                  <p className="text-xs font-body text-muted-foreground mb-2">{step.step}</p>
                  <p className="text-sm font-body font-medium text-foreground">{step.label}</p>
                </div>
                {index < workflowSteps.length - 1 && (
                  <div className="w-12 xl:w-16 h-px bg-border mx-4" />
                )}
              </div>
            ))}
          </div>
          
          {/* Mobile: Vertical flow */}
          <div className="lg:hidden grid grid-cols-2 sm:grid-cols-3 gap-4">
            {workflowSteps.map((step) => (
              <div key={step.label} className="p-4 border border-border/50 text-center">
                <p className="text-xs font-body text-muted-foreground mb-1">{step.step}</p>
                <p className="text-sm font-body font-medium text-foreground">{step.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-16 lg:py-24 border-t border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-display text-foreground mb-6 lg:mb-8 leading-tight">
              Ready to convert more buyers?
            </h2>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button 
                size="lg" 
                className="font-body text-sm sm:text-base h-12 sm:h-14 px-6 sm:px-8 bg-foreground text-background hover:bg-foreground/90"
                onClick={() => navigate('/onboarding')}
              >
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="font-body text-sm sm:text-base h-12 sm:h-14 px-6 sm:px-8 border-border hover:bg-muted"
              >
                <Play className="mr-2 h-4 w-4" />
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
