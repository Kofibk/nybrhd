import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface TourStep {
  target: string;
  title: string;
  description: string;
  position: "top" | "bottom" | "left" | "right";
}

interface ProductTourProps {
  userType: "developer" | "agent" | "broker";
  onComplete?: () => void;
}

const tourSteps: Record<string, TourStep[]> = {
  developer: [
    {
      target: "[data-tour='dashboard']",
      title: "Welcome to Your Dashboard",
      description: "This is your command centre. View key metrics, active campaigns, and AI-powered insights at a glance.",
      position: "bottom",
    },
    {
      target: "[data-tour='campaigns']",
      title: "Campaign Management",
      description: "Create, manage, and optimise your Meta campaigns. Our AI helps you target the right buyers.",
      position: "right",
    },
    {
      target: "[data-tour='leads']",
      title: "Lead Intelligence",
      description: "View all your leads with automatic scoring. Quality and intent scores help you prioritise follow-ups.",
      position: "right",
    },
    {
      target: "[data-tour='analytics']",
      title: "Performance Analytics",
      description: "Deep dive into campaign performance, lead quality trends, and ROI metrics.",
      position: "right",
    },
    {
      target: "[data-tour='ai-insights']",
      title: "AI-Powered Insights",
      description: "Get actionable recommendations based on your campaign and lead data. Click insights to take action.",
      position: "top",
    },
  ],
  agent: [
    {
      target: "[data-tour='dashboard']",
      title: "Welcome to Your Dashboard",
      description: "Your central hub for managing property campaigns and buyer leads.",
      position: "bottom",
    },
    {
      target: "[data-tour='campaigns']",
      title: "Property Campaigns",
      description: "Create targeted campaigns for lettings, new builds, or resales. AI helps optimise your spend.",
      position: "right",
    },
    {
      target: "[data-tour='leads']",
      title: "Buyer Leads",
      description: "All your leads in one place with automatic quality scoring and classification.",
      position: "right",
    },
    {
      target: "[data-tour='analytics']",
      title: "Performance Tracking",
      description: "Monitor campaign performance, conversion rates, and lead quality trends.",
      position: "right",
    },
  ],
  broker: [
    {
      target: "[data-tour='dashboard']",
      title: "Welcome to Your Dashboard",
      description: "Manage mortgage product campaigns and track qualified leads from one place.",
      position: "bottom",
    },
    {
      target: "[data-tour='campaigns']",
      title: "Product Campaigns",
      description: "Create campaigns for residential, BTL, or insurance products targeting qualified borrowers.",
      position: "right",
    },
    {
      target: "[data-tour='leads']",
      title: "Borrower Leads",
      description: "View leads with borrowing details, timeline, and qualification scores.",
      position: "right",
    },
    {
      target: "[data-tour='analytics']",
      title: "Analytics & Insights",
      description: "Track CPL, conversion rates, and lead quality across your campaigns.",
      position: "right",
    },
  ],
};

export function ProductTour({ userType, onComplete }: ProductTourProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const storageKey = `naybourhood_tour_completed_${userType}`;
  const steps = tourSteps[userType] || tourSteps.developer;

  useEffect(() => {
    const hasCompleted = localStorage.getItem(storageKey);
    if (!hasCompleted) {
      // Small delay to let the page render
      const timer = setTimeout(() => setIsVisible(true), 500);
      return () => clearTimeout(timer);
    }
  }, [storageKey]);

  useEffect(() => {
    if (!isVisible) return;

    const updateTargetPosition = () => {
      const target = document.querySelector(steps[currentStep].target);
      if (target) {
        setTargetRect(target.getBoundingClientRect());
      }
    };

    updateTargetPosition();
    window.addEventListener("resize", updateTargetPosition);
    window.addEventListener("scroll", updateTargetPosition);

    return () => {
      window.removeEventListener("resize", updateTargetPosition);
      window.removeEventListener("scroll", updateTargetPosition);
    };
  }, [isVisible, currentStep, steps]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem(storageKey, "true");
    setIsVisible(false);
    onComplete?.();
  };

  const handleSkip = () => {
    handleComplete();
  };

  if (!isVisible) return null;

  const step = steps[currentStep];
  const getTooltipPosition = () => {
    if (!targetRect) return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };

    const padding = 16;
    const tooltipWidth = 320;
    const tooltipHeight = 180;

    switch (step.position) {
      case "bottom":
        return {
          top: `${targetRect.bottom + padding}px`,
          left: `${targetRect.left + targetRect.width / 2}px`,
          transform: "translateX(-50%)",
        };
      case "top":
        return {
          top: `${targetRect.top - tooltipHeight - padding}px`,
          left: `${targetRect.left + targetRect.width / 2}px`,
          transform: "translateX(-50%)",
        };
      case "right":
        return {
          top: `${targetRect.top + targetRect.height / 2}px`,
          left: `${targetRect.right + padding}px`,
          transform: "translateY(-50%)",
        };
      case "left":
        return {
          top: `${targetRect.top + targetRect.height / 2}px`,
          left: `${targetRect.left - tooltipWidth - padding}px`,
          transform: "translateY(-50%)",
        };
      default:
        return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
    }
  };

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70" onClick={handleSkip} />

      {/* Spotlight on target */}
      {targetRect && (
        <div
          className="absolute bg-transparent rounded-lg ring-4 ring-primary/50 shadow-[0_0_0_9999px_rgba(0,0,0,0.7)]"
          style={{
            top: targetRect.top - 8,
            left: targetRect.left - 8,
            width: targetRect.width + 16,
            height: targetRect.height + 16,
          }}
        />
      )}

      {/* Tooltip */}
      <Card
        className="fixed w-80 bg-card border-border shadow-2xl animate-scale-in"
        style={getTooltipPosition()}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-foreground">{step.title}</h3>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 -mr-2 -mt-1"
              onClick={handleSkip}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <p className="text-sm text-muted-foreground mb-4">{step.description}</p>

          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    "h-1.5 w-1.5 rounded-full transition-colors",
                    index === currentStep ? "bg-primary" : "bg-muted"
                  )}
                />
              ))}
            </div>

            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button variant="outline" size="sm" onClick={handlePrevious}>
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
              )}
              <Button size="sm" onClick={handleNext}>
                {currentStep === steps.length - 1 ? "Get Started" : "Next"}
                {currentStep < steps.length - 1 && <ChevronRight className="h-4 w-4 ml-1" />}
              </Button>
            </div>
          </div>

          <p className="text-xs text-muted-foreground mt-3 text-center">
            Step {currentStep + 1} of {steps.length} • Press Esc to skip
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
