import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  ArrowRight, 
  Menu, 
  Lightbulb,
  Rocket,
  Users,
  MessageSquare,
  Send
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import whiteLogo from "@/assets/naybourhood-logo-white.svg";

const HowItWorks = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "How It Works", href: "/how-it-works" },
    { label: "Solutions", href: "/solutions" },
    { label: "Case Studies", href: "/case-studies" },
    { label: "About", href: "/about" },
    { label: "Resources", href: "/resources" },
  ];

  const steps = [
    {
      icon: Lightbulb,
      step: "1",
      title: "Strategy & Planning",
      description: "We understand your development, buyer profile, and brand. Then we build a campaign plan grounded in data, not guesswork."
    },
    {
      icon: Rocket,
      step: "2",
      title: "Launch & Target",
      description: "Ads go live across Meta, Google, TikTok, and partner platforms — driven by dynamic buyer data."
    },
    {
      icon: Users,
      step: "3",
      title: "Buyer Qualification",
      description: "Our platform captures and scores every buyer. You only see those who match your brief and budget."
    },
    {
      icon: MessageSquare,
      step: "4",
      title: "Follow-Up & Nurture",
      description: "Automated WhatsApp and email flows keep buyers engaged without overloading your sales team."
    },
    {
      icon: Send,
      step: "5",
      title: "Buyer Handover",
      description: "CRM integration, custom dashboards, and real-time notifications ensure a seamless route from enquiry to sale."
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
              How It Works
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display text-foreground leading-[1.1] mb-6">
              From Campaign Brief to Buyer Conversion
            </h1>
            <p className="text-lg font-body text-muted-foreground leading-relaxed">
              A streamlined process designed to deliver qualified buyers, not just leads.
            </p>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-16 lg:py-24 border-t border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8 lg:space-y-12">
            {steps.map((step, index) => (
              <div 
                key={step.title}
                className="group relative grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 p-6 lg:p-10 border border-border/50 hover:border-border bg-card/30 hover:bg-card/50 transition-all duration-300"
              >
                <div className="lg:col-span-1 flex items-start">
                  <span className="text-5xl lg:text-6xl font-display text-muted-foreground/30">{step.step}</span>
                </div>
                <div className="lg:col-span-3 flex items-center gap-4">
                  <div className="h-14 w-14 rounded-xl bg-muted/50 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <step.icon className="h-7 w-7 text-foreground" />
                  </div>
                  <h3 className="text-xl lg:text-2xl font-display text-foreground">
                    {step.title}
                  </h3>
                </div>
                <div className="lg:col-span-8 flex items-center">
                  <p className="text-base lg:text-lg font-body text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
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
            Ready to Transform Your Sales Pipeline?
          </h2>
          <p className="text-base lg:text-lg font-body text-muted-foreground mb-8 max-w-2xl mx-auto">
            Generate sales-ready buyers intelligently today.
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
              onClick={() => navigate('/landing')}
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

export default HowItWorks;
