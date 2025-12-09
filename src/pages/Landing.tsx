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
  Globe,
  Zap,
  BarChart3,
  Clock,
  Eye
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import whiteLogo from "@/assets/naybourhood-logo-white.svg";
import berkeleyLogo from "@/assets/logos/berkeley-group.jpeg";
import mountAnvilLogo from "@/assets/logos/mount-anvil.jpeg";
import londonSquareLogo from "@/assets/logos/london-square.jpeg";
import hadleyLogo from "@/assets/logos/hadley-property-group.jpeg";
import regalLondonLogo from "@/assets/logos/regal-london.jpeg";

const Landing = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "How It Works", href: "/how-it-works" },
    { label: "Solutions", href: "/solutions" },
    { label: "Case Studies", href: "/case-studies" },
    { label: "About", href: "/about" },
    { label: "Resources", href: "/resources" },
    { label: "Admin", onClick: () => navigate('/admin') },
  ];

  const pillars = [
    {
      icon: Target,
      step: "1",
      title: "Attract",
      description: "Smart campaigns across Meta, Google, TikTok and more, targeting qualified buyers based on budget, location, and real-time market demand."
    },
    {
      icon: Users,
      step: "2",
      title: "Qualify",
      description: "Every enquiry is scored by intent and buying power — so your team sees the right buyers, not a spreadsheet full of browsers."
    },
    {
      icon: MessageSquare,
      step: "3",
      title: "Nurture",
      description: "Automated follow-up across WhatsApp, email and SMS, triggered by buyer behaviour. Engage intelligently, and only when it counts."
    },
    {
      icon: TrendingUp,
      step: "4",
      title: "Convert",
      description: "Buyers are delivered to your CRM or inbox with full profile insight — verified, nurtured, and ready to act."
    }
  ];

  const trustedLogos = [
    { name: "Berkeley Group", logo: berkeleyLogo },
    { name: "Mount Anvil", logo: mountAnvilLogo },
    { name: "London Square", logo: londonSquareLogo },
    { name: "Hadley Property Group", logo: hadleyLogo },
    { name: "Regal London", logo: regalLondonLogo },
  ];

  const whoItsFor = [
    {
      icon: Building2,
      title: "Developers",
      description: "Launching or scaling new developments"
    },
    {
      icon: Briefcase,
      title: "Estate Agents",
      description: "Seeking serious buyers for key listings"
    },
    {
      icon: PiggyBank,
      title: "Marketing & PR Agencies",
      description: "Adding performance property services"
    },
    {
      icon: Landmark,
      title: "Financial Advisors & Banks",
      description: "With international property portfolios"
    }
  ];

  const caseStudies = [
    {
      property: "Chelsea Island",
      result: "£5M reserved in 7 days",
      buyer: "Egyptian investor",
      campaign: "Meta + Google ads + nurture",
      flag: "🇪🇬",
      image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop"
    },
    {
      property: "The Lucan",
      result: "£1.7M sale agreed in 30 days",
      buyer: "Nigerian investor",
      campaign: "UK & Ghana events + digital + lead scoring",
      flag: "🇳🇬",
      image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=300&fit=crop"
    },
    {
      property: "Parkwood",
      result: "£5M home sold in 3 days",
      buyer: "UK residential family",
      campaign: "Bespoke video + private outreach",
      flag: "🇬🇧",
      image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop"
    },
    {
      property: "One Clapham",
      result: "£550K reservation secured",
      buyer: "UAE investor",
      campaign: "Targeted Google ads + CRM sync",
      flag: "🇦🇪",
      image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=300&fit=crop"
    }
  ];

  const whyItWorks = [
    {
      icon: Zap,
      title: "Built by performance marketers",
      description: "With £50M+ in property sold"
    },
    {
      icon: Target,
      title: "Reduces wasted viewings",
      description: "And eliminates dead leads"
    },
    {
      icon: Clock,
      title: "Intelligent automation",
      description: "That saves time and improves ROI"
    },
    {
      icon: Eye,
      title: "Real-time visibility",
      description: "On buyer behaviour and conversion"
    }
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
            <Link to="/landing" className="flex-shrink-0 flex items-center">
              <img 
                src={whiteLogo} 
                alt="Naybourhood" 
                className="h-8 lg:h-10 w-auto"
              />
            </Link>
            
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

      {/* Hero Section with Video Background */}
      <section className="relative pt-24 pb-16 lg:pt-32 lg:pb-24 min-h-[90vh] flex items-center">
        {/* Video Background */}
        <div className="absolute inset-0 overflow-hidden">
          <video 
            autoPlay 
            muted 
            loop 
            playsInline
            className="absolute w-full h-full object-cover opacity-30"
          >
            <source src="https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-city-traffic-at-night-11-large.mp4" type="video/mp4" />
          </video>
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-background/70" />
          
          {/* Subtle grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-display text-foreground leading-[1.1] mb-6 lg:mb-8">
              The AI Property Sales
              <br className="hidden sm:block" />
              <span className="sm:hidden"> </span>
              & Marketing Platform
            </h1>
            <p className="text-base sm:text-lg lg:text-xl font-body text-muted-foreground mb-8 lg:mb-10 max-w-2xl leading-relaxed">
              Attract high-intent buyers, qualify them intelligently, and manage conversion — all from one powerful platform.
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

      {/* What We Do Section */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xs font-body text-muted-foreground tracking-[0.15em] uppercase mb-4">
              What We Do
            </p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display text-foreground mb-6 leading-tight">
              More Than Just Leads
            </h2>
            <p className="text-base sm:text-lg font-body text-muted-foreground leading-relaxed mb-6">
              Naybourhood is the end-to-end platform built for property professionals who want more than just leads.
            </p>
            <p className="text-base font-body text-muted-foreground leading-relaxed mb-6">
              We help developers, agents and advisors attract, qualify, and convert real buyers — combining campaign delivery, automation, and buyer intelligence into one seamless solution.
            </p>
            <p className="text-sm font-body text-muted-foreground/80 leading-relaxed">
              Backed by the team behind Million Pound Homes, we have sold over £50M+ in property and now bring that same performance engine into your hands.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 lg:py-24 border-t border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 lg:mb-16">
            <p className="text-xs font-body text-muted-foreground tracking-[0.15em] uppercase mb-4">
              How It Works
            </p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display text-foreground">
              Four Steps to Conversion
            </h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {pillars.map((pillar) => (
              <div 
                key={pillar.title} 
                className="group relative p-6 lg:p-8 border border-border/50 hover:border-border bg-card/30 hover:bg-card/50 transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl font-display text-muted-foreground/50">{pillar.step}</span>
                  <div className="h-10 w-10 rounded-lg bg-muted/50 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <pillar.icon className="h-5 w-5 text-foreground" />
                  </div>
                </div>
                <h3 className="text-lg lg:text-xl font-display text-foreground mb-3">
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

      {/* Who It's For */}
      <section id="solutions" className="py-16 lg:py-24 bg-card/30 border-t border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-body text-muted-foreground tracking-[0.15em] uppercase mb-4">
            Solutions
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

      {/* Case Studies */}
      <section id="case-studies" className="py-16 lg:py-24 border-t border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-10 lg:mb-12">
            <div>
              <p className="text-xs font-body text-muted-foreground tracking-[0.15em] uppercase mb-4">
                Proven Results
              </p>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display text-foreground">
                Case Studies
              </h2>
            </div>
            <div className="flex items-center gap-2 mt-4 lg:mt-0">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-body text-muted-foreground">Global Reach, Local Results</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {caseStudies.map((study) => (
              <div 
                key={study.property} 
                className="group bg-card border border-border/50 hover:border-border transition-all duration-300 overflow-hidden"
              >
                {/* Property Image */}
                <div className="aspect-[4/3] overflow-hidden">
                  <img 
                    src={study.image}
                    alt={study.property}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg">{study.flag}</span>
                  </div>
                  <h3 className="text-lg font-display text-foreground mb-2">
                    {study.property}
                  </h3>
                  <p className="text-xl font-display text-foreground mb-2">
                    {study.result}
                  </p>
                  <p className="text-xs font-body text-muted-foreground mb-2">
                    Buyer: {study.buyer}
                  </p>
                  <p className="text-xs font-body text-muted-foreground/70">
                    {study.campaign}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why It Works */}
      <section className="py-16 lg:py-24 bg-card/30 border-t border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-body text-muted-foreground tracking-[0.15em] uppercase mb-4 text-center">
            Why It Works
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display text-foreground mb-10 lg:mb-12 text-center">
            The Naybourhood Advantage
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {whyItWorks.map((item) => (
              <div 
                key={item.title} 
                className="text-center p-6"
              >
                <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="h-6 w-6 text-foreground" />
                </div>
                <h3 className="text-base font-display text-foreground mb-2">
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

      {/* Trusted By - Carousel */}
      <section className="py-12 lg:py-16 border-t border-border/50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <p className="text-xs font-body text-muted-foreground tracking-[0.15em] uppercase text-center">
            Trusted By
          </p>
        </div>
        
        {/* Infinite scroll carousel */}
        <div className="relative">
          <div className="flex animate-scroll-left">
            {/* First set of logos */}
            {trustedLogos.map((brand, index) => (
              <div 
                key={`first-${index}`} 
                className="flex-shrink-0 mx-12 lg:mx-20 flex items-center justify-center bg-white rounded-lg p-1"
              >
                <img 
                  src={brand.logo} 
                  alt={brand.name}
                  className="h-16 sm:h-20 lg:h-24 w-auto max-w-[180px] sm:max-w-[220px] lg:max-w-[280px] object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.parentElement!.innerHTML = `<span class="text-lg font-body font-medium text-muted-foreground whitespace-nowrap">${brand.name}</span>`;
                  }}
                />
              </div>
            ))}
            {/* Duplicate set for seamless loop */}
            {trustedLogos.map((brand, index) => (
              <div 
                key={`second-${index}`} 
                className="flex-shrink-0 mx-12 lg:mx-20 flex items-center justify-center bg-white rounded-lg p-1"
              >
                <img 
                  src={brand.logo} 
                  alt={brand.name}
                  className="h-16 sm:h-20 lg:h-24 w-auto max-w-[180px] sm:max-w-[220px] lg:max-w-[280px] object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.parentElement!.innerHTML = `<span class="text-lg font-body font-medium text-muted-foreground whitespace-nowrap">${brand.name}</span>`;
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-16 lg:py-24 border-t border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-display text-foreground mb-6 lg:mb-8 leading-tight">
              Generate sales-ready buyers intelligently today
            </h2>
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
              <Link to="/landing">
                <img 
                  src={whiteLogo} 
                  alt="Naybourhood" 
                  className="h-6 w-auto"
                />
              </Link>
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
