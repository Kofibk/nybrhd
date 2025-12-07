import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Building2, Users, BarChart3, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { LogoWithTransparency } from "@/components/LogoWithTransparency";

const Onboarding = () => {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const userTypes = [
    {
      id: "developer",
      icon: Building2,
      title: "Property Developer",
      description: "I develop and sell properties",
      route: "/developer"
    },
    {
      id: "agent",
      icon: Users,
      title: "Estate Agent",
      description: "I sell properties for clients",
      route: "/agent"
    },
    {
      id: "broker",
      icon: BarChart3,
      title: "Mortgage Broker",
      description: "I provide mortgage and financial products",
      route: "/broker"
    }
  ];

  const handleContinue = () => {
    const selected = userTypes.find(type => type.id === selectedType);
    if (selected) {
      navigate(selected.route);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8 md:mb-12">
          <LogoWithTransparency className="h-10 md:h-12 w-auto mx-auto mb-4 md:mb-6" variant="white" />
          <h1 className="text-2xl md:text-4xl font-bold mb-3 md:mb-4">Welcome</h1>
          <p className="text-base md:text-xl text-muted-foreground">
            Let's get you set up. What best describes you?
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          {userTypes.map((type) => (
            <Card
              key={type.id}
              className={`p-5 md:p-8 cursor-pointer transition-all hover:shadow-lg ${
                selectedType === type.id
                  ? "border-2 border-primary shadow-xl scale-[1.02] md:scale-105"
                  : "border-2 border-transparent"
              }`}
              onClick={() => setSelectedType(type.id)}
            >
              <type.icon className={`h-10 w-10 md:h-16 md:w-16 mb-3 md:mb-6 ${
                selectedType === type.id ? "text-primary" : "text-muted-foreground"
              }`} />
              <h3 className="text-lg md:text-xl font-bold mb-1 md:mb-2">{type.title}</h3>
              <p className="text-sm md:text-base text-muted-foreground">{type.description}</p>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button
            size="lg"
            disabled={!selectedType}
            onClick={handleContinue}
            className="w-full sm:w-auto px-12"
          >
            Continue
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <p className="text-xs md:text-sm text-muted-foreground mt-3 md:mt-4">
            You can change this later in your account settings
          </p>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
