import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { 
  ArrowRight, 
  Menu
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import whiteLogo from "@/assets/naybourhood-logo-white.svg";

const CaseStudies = () => {
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

  const caseStudies = [
    {
      property: "Chelsea Island",
      result: "£5M reserved in 7 days",
      buyer: "Egyptian investor",
      campaign: "Meta + Google campaign with pre-qualified handover",
      image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop"
    },
    {
      property: "The Lucan",
      result: "£1.7M agreed in 30 days",
      buyer: "Nigerian investor",
      campaign: "Campaign included UK/Ghana events + follow-up flows",
      image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop"
    },
    {
      property: "Parkwood",
      result: "£5M home in 3 days",
      buyer: "UK family",
      campaign: "High-impact content and discreet outreach",
      image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop"
    },
    {
      property: "One Clapham",
      result: "£550K reservation",
      buyer: "UAE investor",
      campaign: "Google Ads + nurture + CRM sync",
      image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
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
            
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link 
                  key={link.label} 
                  to={link.href} 
                  className="text-sm font-body font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </Link>
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
              
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild className="lg:hidden">
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[280px] bg-background border-l border-border">
                  <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                  <nav className="flex flex-col gap-4 mt-8">
                    {navLinks.map((link) => (
                      <Link 
                        key={link.label} 
                        to={link.href} 
                        className="text-base font-body font-medium text-foreground hover:text-muted-foreground transition-colors py-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {link.label}
                      </Link>
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
      <section className="pt-32 pb-16 lg:pt-40 lg:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-body text-muted-foreground tracking-[0.15em] uppercase mb-4">
              Case Studies
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display text-foreground leading-[1.1] mb-6">
              Proven Campaigns. Verified Buyers.
            </h1>
            <p className="text-lg font-body text-muted-foreground leading-relaxed">
              Real results from real campaigns. See how we have helped property professionals close deals faster.
            </p>
          </div>
        </div>
      </section>

      {/* Case Studies Grid */}
      <section className="py-16 lg:py-24 border-t border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12 lg:space-y-16">
            {caseStudies.map((study, index) => (
              <div 
                key={study.property}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center ${
                  index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                }`}
              >
                <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
                  <div className="aspect-[4/3] overflow-hidden border border-border/50">
                    <img 
                      src={study.image} 
                      alt={study.property}
                      className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
                    />
                  </div>
                </div>
                <div className={index % 2 === 1 ? 'lg:order-1' : ''}>
                  <h3 className="text-3xl lg:text-4xl font-display text-foreground mb-4">
                    {study.property}
                  </h3>
                  <p className="text-2xl lg:text-3xl font-display text-foreground/80 mb-6">
                    {study.result}
                  </p>
                  <div className="space-y-3 mb-6">
                    <p className="text-base font-body text-muted-foreground">
                      <span className="text-foreground font-medium">Buyer:</span> {study.buyer}
                    </p>
                    <p className="text-base font-body text-muted-foreground">
                      <span className="text-foreground font-medium">Campaign:</span> {study.campaign}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 border-t border-border/50 bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display text-foreground mb-6">
            Ready to Become Our Next Success Story?
          </h2>
          <p className="text-base lg:text-lg font-body text-muted-foreground mb-8 max-w-2xl mx-auto">
            Start generating your own success story.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="font-body text-base h-14 px-8 bg-foreground text-background hover:bg-foreground/90 group"
              onClick={() => navigate('/onboarding')}
            >
              Get Started
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="font-body text-base h-14 px-8 border-border hover:bg-muted"
              onClick={() => navigate('/developer')}
            >
              Tour Platform
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <img src={whiteLogo} alt="Naybourhood" className="h-8 w-auto" />
            <p className="text-sm font-body text-muted-foreground">
              © {new Date().getFullYear()} Naybourhood. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CaseStudies;
