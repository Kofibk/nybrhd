import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ArrowRight, Menu, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
      title: "Attract",
      description: "Run smart digital campaigns to reach real buyers"
    },
    {
      title: "Qualify",
      description: "Instantly score and prioritise high-intent leads"
    },
    {
      title: "Nurture",
      description: "Automate email and WhatsApp follow-up"
    },
    {
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
      result: "£5M in reservations in 7 days",
      buyer: "Egyptian investor"
    },
    {
      property: "The Lucan",
      result: "£1.7M apartment sale agreed",
      buyer: "Nigerian investor"
    },
    {
      property: "Parkwood",
      result: "£5M home sold in 3 days",
      buyer: "UK residential family"
    },
    {
      property: "One Clapham",
      result: "£550K reservation secured",
      buyer: "UAE investor"
    }
  ];

  const workflowSteps = [
    "Campaign",
    "Lead Capture",
    "Qualification",
    "Nurture",
    "Reporting",
    "Handover"
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center">
              <img 
                src="/lovable-uploads/d25e1cc7-31c1-40f2-bd7a-1780a29e9f44.png" 
                alt="Naybourhood" 
                className="h-8 w-auto invert"
              />
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-10">
              {navLinks.map((link) => (
                link.href ? (
                  <a 
                    key={link.label} 
                    href={link.href} 
                    className="text-sm font-body font-medium text-muted-foreground hover:text-foreground transition-colors tracking-wide"
                  >
                    {link.label}
                  </a>
                ) : (
                  <button 
                    key={link.label} 
                    onClick={link.onClick} 
                    className="text-sm font-body font-medium text-muted-foreground hover:text-foreground transition-colors tracking-wide"
                  >
                    {link.label}
                  </button>
                )
              ))}
            </div>
            
            <div className="flex items-center gap-4">
              {/* Mobile Hamburger Menu */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild className="md:hidden">
                  <Button variant="ghost" size="icon" className="h-10 w-10">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] bg-background border-l border-border">
                  <nav className="flex flex-col gap-6 mt-12">
                    {navLinks.map((link) => (
                      link.href ? (
                        <a 
                          key={link.label} 
                          href={link.href} 
                          className="text-lg font-body font-medium text-foreground hover:text-muted-foreground transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {link.label}
                        </a>
                      ) : (
                        <button 
                          key={link.label} 
                          onClick={() => { link.onClick?.(); setMobileMenuOpen(false); }} 
                          className="text-lg font-body font-medium text-foreground hover:text-muted-foreground transition-colors text-left"
                        >
                          {link.label}
                        </button>
                      )
                    ))}
                    <hr className="my-4 border-border" />
                    <Button 
                      variant="ghost" 
                      onClick={() => { navigate('/login'); setMobileMenuOpen(false); }} 
                      className="justify-start font-body"
                    >
                      Log In
                    </Button>
                    <Button 
                      onClick={() => { navigate('/onboarding'); setMobileMenuOpen(false); }}
                      className="font-body"
                    >
                      Get Started
                    </Button>
                  </nav>
                </SheetContent>
              </Sheet>

              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/login')} 
                className="hidden sm:inline-flex font-body text-sm tracking-wide"
              >
                Log In
              </Button>
              <Button 
                size="sm" 
                onClick={() => navigate('/onboarding')} 
                className="font-body text-sm tracking-wide"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 lg:pt-40 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-muted/30 to-transparent" />
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-display tracking-tight text-foreground mb-8 leading-[1.1]">
              The AI Property Sales
              <br />
              & Marketing Platform
            </h1>
            <p className="text-lg lg:text-xl font-body text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
              Attract high-intent buyers, qualify leads instantly, and convert faster — all from one platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="font-body text-base h-14 px-10 tracking-wide"
                onClick={() => navigate('/onboarding')}
              >
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="font-body text-base h-14 px-10 tracking-wide border-foreground/20 hover:bg-muted"
              >
                <Play className="mr-2 h-4 w-4" />
                Tour Platform
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By */}
      <section className="py-16 border-y border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <p className="text-center text-sm font-body text-muted-foreground mb-10 tracking-widest uppercase">
            Trusted by leading developers
          </p>
          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-6">
            {trustedLogos.map((logo) => (
              <span 
                key={logo} 
                className="text-lg font-body font-medium text-muted-foreground/60"
              >
                {logo}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Pillars Section */}
      <section id="features" className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-px bg-border">
            {pillars.map((pillar, index) => (
              <div 
                key={pillar.title} 
                className="bg-background p-10 lg:p-12 group hover:bg-muted/50 transition-colors"
              >
                <span className="text-sm font-body text-muted-foreground mb-4 block tracking-widest">
                  0{index + 1}
                </span>
                <h3 className="text-2xl font-display text-foreground mb-4">
                  {pillar.title}
                </h3>
                <p className="text-base font-body text-muted-foreground leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Overview */}
      <section className="py-24 lg:py-32 bg-muted/30">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-display text-foreground mb-8">
            Built for Modern Property Sales
          </h2>
          <p className="text-lg font-body text-muted-foreground leading-relaxed">
            Naybourhood combines AI, automation and first-party data to help housebuilders, agents and developers sell homes faster. Launch better campaigns. Capture better leads. Close with confidence.
          </p>
        </div>
      </section>

      {/* Who It's For */}
      <section className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-display text-foreground mb-16 text-center">
            Who It's For
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {whoItsFor.map((item) => (
              <div 
                key={item.title} 
                className="p-8 border border-border hover:border-foreground/20 transition-colors"
              >
                <h3 className="text-xl font-display text-foreground mb-2">
                  {item.title}
                </h3>
                <p className="text-base font-body text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Case Studies */}
      <section id="case-studies" className="py-24 lg:py-32 bg-foreground text-background">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-display mb-16 text-center">
            Case Studies
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {caseStudies.map((study) => (
              <div 
                key={study.property} 
                className="p-8 border border-background/20 hover:border-background/40 transition-colors"
              >
                <h3 className="text-xl font-display mb-4">
                  {study.property}
                </h3>
                <p className="text-lg font-body font-medium mb-2">
                  {study.result}
                </p>
                <p className="text-sm font-body text-background/60">
                  Buyer: {study.buyer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Visual Workflow */}
      <section className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-display text-foreground mb-16 text-center">
            How It Works
          </h2>
          <div className="flex flex-wrap justify-center items-center gap-4">
            {workflowSteps.map((step, index) => (
              <div key={step} className="flex items-center gap-4">
                <div className="px-6 py-3 border border-border text-sm font-body font-medium text-foreground">
                  {step}
                </div>
                {index < workflowSteps.length - 1 && (
                  <ArrowRight className="h-4 w-4 text-muted-foreground hidden sm:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-24 lg:py-32 bg-muted/30">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-5xl font-display text-foreground mb-8">
            Ready to convert more buyers?
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="font-body text-base h-14 px-10 tracking-wide"
              onClick={() => navigate('/onboarding')}
            >
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="font-body text-base h-14 px-10 tracking-wide border-foreground/20 hover:bg-muted"
            >
              <Play className="mr-2 h-4 w-4" />
              Tour Platform
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <img 
                src="/lovable-uploads/d25e1cc7-31c1-40f2-bd7a-1780a29e9f44.png" 
                alt="Naybourhood" 
                className="h-6 w-auto invert"
              />
              <span className="text-sm font-body text-muted-foreground">
                © 2024 Naybourhood.ai. All rights reserved.
              </span>
            </div>
            <div className="flex items-center gap-8">
              <a href="#" className="text-sm font-body text-muted-foreground hover:text-foreground transition-colors">
                Privacy
              </a>
              <a href="#" className="text-sm font-body text-muted-foreground hover:text-foreground transition-colors">
                Terms
              </a>
              <a href="#" className="text-sm font-body text-muted-foreground hover:text-foreground transition-colors">
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