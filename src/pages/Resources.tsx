import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  ArrowRight, 
  Menu, 
  BookOpen,
  Calculator,
  HelpCircle,
  ChevronDown
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import whiteLogo from "@/assets/naybourhood-logo-white.svg";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const Resources = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "How It Works", href: "/how-it-works" },
    { label: "Solutions", href: "/solutions" },
    { label: "Case Studies", href: "/case-studies" },
    { label: "About", href: "/about" },
    { label: "Resources", href: "/resources" },
    { label: "Admin", href: "/admin" },
  ];

  const faqs = [
    {
      question: "Do I need my own CRM?",
      answer: "No — we can deliver buyers into your email, WhatsApp or our internal dashboard."
    },
    {
      question: "What's the setup time?",
      answer: "Usually 5–7 working days from brief and content delivery."
    },
    {
      question: "Can I use my own branding?",
      answer: "Yes — we support white-label campaigns."
    },
    {
      question: "Do you support international campaigns?",
      answer: "Yes — UK, UAE, Europe, Africa and beyond."
    }
  ];

  const resources = [
    {
      icon: BookOpen,
      title: "The Blog",
      description: "Insights on buyer trends, international markets, and property marketing strategies that deliver.",
      link: "#"
    },
    {
      icon: Calculator,
      title: "ROI Calculator",
      description: "Forecast campaign ROI using your development data — see expected cost per buyer, conversions, and budget return.",
      link: "#"
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
              Resources
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display text-foreground leading-[1.1] mb-6">
              Tools, Insights and Support
            </h1>
            <p className="text-lg font-body text-muted-foreground leading-relaxed">
              Everything you need to make informed decisions about your property marketing.
            </p>
          </div>
        </div>
      </section>

      {/* Resources Grid */}
      <section className="py-16 lg:py-24 border-t border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {resources.map((resource) => (
              <div 
                key={resource.title}
                className="group p-8 lg:p-10 border border-border/50 hover:border-border bg-card/30 hover:bg-card/50 transition-all duration-300"
              >
                <div className="h-14 w-14 rounded-xl bg-muted/50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <resource.icon className="h-7 w-7 text-foreground" />
                </div>
                <h3 className="text-2xl font-display text-foreground mb-3">
                  {resource.title}
                </h3>
                <p className="text-base font-body text-muted-foreground leading-relaxed mb-6">
                  {resource.description}
                </p>
                <Button 
                  variant="outline" 
                  className="font-body border-border hover:bg-muted group/btn"
                >
                  Learn More
                  <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="py-16 lg:py-24 border-t border-border/50 bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-10">
            <HelpCircle className="h-6 w-6 text-foreground" />
            <h2 className="text-2xl sm:text-3xl font-display text-foreground">
              Frequently Asked Questions
            </h2>
          </div>
          <div className="max-w-3xl">
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`item-${index}`}
                  className="border border-border/50 bg-background px-6"
                >
                  <AccordionTrigger className="text-left font-display text-foreground hover:no-underline py-6">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="font-body text-muted-foreground pb-6">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 border-t border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display text-foreground mb-6">
            Still Have Questions?
          </h2>
          <p className="text-base lg:text-lg font-body text-muted-foreground mb-8 max-w-2xl mx-auto">
            Get in touch and we will help you find the right solution for your business.
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

export default Resources;
