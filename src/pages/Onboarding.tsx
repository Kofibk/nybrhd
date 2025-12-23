import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  addDemoOnboardingSubmission,
  getDemoOnboardingStep,
  isDemoOnboardingComplete,
  isUuid,
  markDemoOnboardingComplete,
  setDemoOnboardingStep,
} from "@/lib/demoOnboardingStore";
import {
  Building2,
  Home,
  Landmark,
  User,
  Building,
  Users,
  Target,
  Rocket,
  Megaphone,
  UserSearch,
  Scale,
  TrendingDown,
  BarChart3,
  BadgeCheck,
  Plus,
  X,
  ArrowLeft,
  ArrowRight,
  Upload,
  Check,
  Sparkles,
} from "lucide-react";


// Step definitions
const STEPS = [
  { id: 1, label: "Type", icon: User },
  { id: 2, label: "You", icon: User },
  { id: 3, label: "Company", icon: Building },
  { id: 4, label: "Team", icon: Users },
  { id: 5, label: "Goals", icon: Target },
  { id: 6, label: "Launch", icon: Rocket },
];

// User type options
const USER_TYPES = [
  { 
    id: "developer", 
    title: "Property Developer", 
    description: "I develop and sell properties",
    icon: Building2 
  },
  { 
    id: "agent", 
    title: "Estate Agent", 
    description: "I sell properties for clients",
    icon: Home 
  },
  { 
    id: "broker", 
    title: "Mortgage Broker", 
    description: "I provide mortgages and financial products",
    icon: Landmark 
  },
];

// Goal options
const GOALS = [
  { 
    id: "brand_awareness", 
    title: "Brand Awareness", 
    description: "Increase visibility for my developments",
    icon: Megaphone 
  },
  { 
    id: "find_buyers", 
    title: "Find Buyers", 
    description: "Generate qualified buyer leads",
    icon: UserSearch 
  },
  { 
    id: "qualify_leads", 
    title: "Qualify Leads", 
    description: "Score and prioritise my pipeline",
    icon: Scale 
  },
  { 
    id: "reduce_fall_throughs", 
    title: "Reduce Fall-Throughs", 
    description: "Close more deals, faster",
    icon: TrendingDown 
  },
  { 
    id: "campaign_analytics", 
    title: "Campaign Analytics", 
    description: "Track marketing ROI",
    icon: BarChart3 
  },
  { 
    id: "verified_buyers", 
    title: "Access Verified Buyers", 
    description: "Connect with pre-qualified buyers",
    icon: BadgeCheck 
  },
];

// UK Regions
const REGIONS = [
  "London", "South East", "South West", "East of England", 
  "East Midlands", "West Midlands", "Yorkshire", "North West", 
  "North East", "Wales", "Scotland", "Northern Ireland"
];

interface OnboardingData {
  userType: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  jobTitle: string;
  companyLogo: string | null;
  companyName: string;
  website: string;
  linkedin: string;
  instagram: string;
  address: string;
  regions: string[];
  teamEmails: string[];
  goals: string[];
  upsellInterest: boolean;
}

const Onboarding = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<OnboardingData>({
    userType: "",
    firstName: "",
    lastName: "",
    email: user?.email || "",
    phone: "",
    jobTitle: "",
    companyLogo: null,
    companyName: "",
    website: "",
    linkedin: "",
    instagram: "",
    address: "",
    regions: [],
    teamEmails: [""],
    goals: [],
    upsellInterest: false,
  });

  // Update email when user loads
  useEffect(() => {
    if (user?.email) {
      setFormData(prev => ({ ...prev, email: user.email || "" }));
    }
  }, [user]);

  // Check if user has already completed onboarding
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user?.id) return;

      // Demo auth users are not UUIDs; use local storage progress so onboarding works.
      if (!isUuid(user.id)) {
        if (isDemoOnboardingComplete(user.id)) {
          navigate('/developer');
          return;
        }
        const step = getDemoOnboardingStep(user.id);
        if (step > 1) setCurrentStep(step);
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed, onboarding_step')
        .eq('user_id', user.id)
        .single();

      if (profile?.onboarding_completed) {
        // Redirect to appropriate dashboard
        navigate('/developer');
      } else if (profile?.onboarding_step && profile.onboarding_step > 0) {
        setCurrentStep(profile.onboarding_step);
      }
    };

    checkOnboardingStatus();
  }, [user, navigate]);

  const updateFormData = (field: keyof OnboardingData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setLogoPreview(result);
        updateFormData('companyLogo', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const addTeamEmail = () => {
    updateFormData('teamEmails', [...formData.teamEmails, ""]);
  };

  const removeTeamEmail = (index: number) => {
    const newEmails = formData.teamEmails.filter((_, i) => i !== index);
    updateFormData('teamEmails', newEmails.length ? newEmails : [""]);
  };

  const updateTeamEmail = (index: number, value: string) => {
    const newEmails = [...formData.teamEmails];
    newEmails[index] = value;
    updateFormData('teamEmails', newEmails);
  };

  const toggleRegion = (region: string) => {
    const newRegions = formData.regions.includes(region)
      ? formData.regions.filter(r => r !== region)
      : [...formData.regions, region];
    updateFormData('regions', newRegions);
  };

  const toggleGoal = (goalId: string) => {
    const newGoals = formData.goals.includes(goalId)
      ? formData.goals.filter(g => g !== goalId)
      : [...formData.goals, goalId];
    updateFormData('goals', newGoals);
  };

  const validateStep = (): boolean => {
    // All fields optional during build phase
    return true;
  };

  const saveProgress = async (step: number) => {
    if (!user?.id) return;

    if (!isUuid(user.id)) {
      setDemoOnboardingStep(user.id, step);
      return;
    }

    try {
      await supabase
        .from('profiles')
        .update({ onboarding_step: step })
        .eq('user_id', user.id);
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  const handleNext = async () => {
    if (!validateStep()) {
      toast({
        title: "Please complete all required fields",
        variant: "destructive"
      });
      return;
    }
    
    if (currentStep < 6) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      await saveProgress(nextStep);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async (withUpsell: boolean) => {
    setIsSubmitting(true);
    updateFormData('upsellInterest', withUpsell);

    try {
      if (!user?.id) throw new Error("User not authenticated");

      // Demo auth path: persist locally so users can progress and admins can review in the demo admin tables.
      if (!isUuid(user.id)) {
        const companyId = crypto.randomUUID();

        addDemoOnboardingSubmission({
          submitted_at: new Date().toISOString(),
          company: {
            id: companyId,
            name: formData.companyName || "(No company name)",
            website: formData.website || null,
            industry: formData.userType || null,
            address: formData.address || null,
            logo_url: formData.companyLogo,
          },
          user: {
            id: user.id,
            email: formData.email || user.email || "",
            full_name: `${formData.firstName} ${formData.lastName}`.trim() || null,
            phone: formData.phone || null,
            job_title: formData.jobTitle || null,
            user_type: formData.userType || "developer",
            goals: formData.goals,
            regions_covered: formData.regions,
            upsell_interest: withUpsell,
          },
          invited_team_emails: formData.teamEmails.filter((e) => e.trim()),
        });

        markDemoOnboardingComplete(user.id);
        setIsComplete(true);
        return;
      }

      // Create or update company
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .insert({
          name: formData.companyName,
          website: formData.website || null,
          logo_url: formData.companyLogo,
          address: formData.address || null,
          industry: formData.userType,
        })
        .select()
        .single();

      if (companyError) throw companyError;

      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: `${formData.firstName} ${formData.lastName}`,
          phone: formData.phone,
          job_title: formData.jobTitle,
          company_id: company.id,
          company_logo_url: formData.companyLogo,
          company_website: formData.website,
          company_linkedin: formData.linkedin,
          company_instagram: formData.instagram,
          company_address: formData.address,
          regions_covered: formData.regions,
          goals: formData.goals,
          user_type: formData.userType,
          onboarding_completed: true,
          onboarding_step: 6,
          upsell_interest: withUpsell,
        })
        .eq('user_id', user.id);

      if (profileError) throw profileError;

      // Save team invitations
      const validEmails = formData.teamEmails.filter((email) => email.trim());
      if (validEmails.length > 0) {
        const invitations = validEmails.map((email) => ({
          inviter_id: user.id,
          email: email.trim(),
          company_id: company.id,
          status: 'pending',
        }));

        await supabase.from('team_invitations').insert(invitations);
      }

      setIsComplete(true);
    } catch (error: any) {
      console.error('Onboarding error:', error);
      toast({
        title: "Error completing onboarding",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoToDashboard = () => {
    const dashboardRoute = formData.userType === 'developer' ? '/developer' 
      : formData.userType === 'agent' ? '/agent' 
      : '/broker';
    navigate(dashboardRoute);
  };

  // Progress bar component
  const ProgressBar = () => (
    <div className="w-full max-w-2xl mx-auto mb-12">
      <div className="flex items-center justify-between relative">
        {/* Connecting line */}
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-border" />
        <div 
          className="absolute top-4 left-0 h-0.5 bg-gold transition-all duration-500"
          style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
        />
        
        {STEPS.map((step) => {
          const Icon = step.icon;
          const isCompleted = currentStep > step.id;
          const isActive = currentStep === step.id;
          
          return (
            <div key={step.id} className="flex flex-col items-center z-10">
              <div 
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300
                  ${isCompleted ? 'bg-gold text-gold-foreground' : ''}
                  ${isActive ? 'bg-background border-2 border-gold text-gold' : ''}
                  ${!isCompleted && !isActive ? 'bg-muted text-muted-foreground' : ''}
                `}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
              </div>
              <span className={`text-xs mt-2 ${isActive ? 'text-gold font-medium' : 'text-muted-foreground'}`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );

  // Step 1: Welcome / User Type
  const renderStep1 = () => (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-display mb-3">Welcome to Naybourhood</h1>
        <p className="text-muted-foreground text-lg">What best describes you?</p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto">
        {USER_TYPES.map((type) => {
          const Icon = type.icon;
          const isSelected = formData.userType === type.id;
          
          return (
            <Card
              key={type.id}
              onClick={() => updateFormData('userType', type.id)}
              className={`
                p-6 cursor-pointer transition-all duration-200 hover:scale-[1.02]
                ${isSelected 
                  ? 'border-2 border-gold bg-gold/5' 
                  : 'border-border hover:border-muted-foreground/50'
                }
              `}
            >
              <div className="text-center space-y-3">
                <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center ${isSelected ? 'bg-gold/20 text-gold' : 'bg-muted text-muted-foreground'}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold">{type.title}</h3>
                <p className="text-sm text-muted-foreground">{type.description}</p>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );

  // Step 2: Your Details
  const renderStep2 = () => (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-display mb-3">Tell us about you</h1>
        <p className="text-muted-foreground text-lg">We'll use this to personalise your experience</p>
      </div>
      
      <div className="max-w-md mx-auto space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name *</Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => updateFormData('firstName', e.target.value)}
              placeholder="John"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name *</Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => updateFormData('lastName', e.target.value)}
              placeholder="Smith"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            disabled
            className="bg-muted"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => updateFormData('phone', e.target.value)}
            placeholder="+44 7700 900000"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="jobTitle">Job Title / Role *</Label>
          <Input
            id="jobTitle"
            value={formData.jobTitle}
            onChange={(e) => updateFormData('jobTitle', e.target.value)}
            placeholder="e.g. Sales Director, Founder, Agent"
          />
        </div>
      </div>
    </div>
  );

  // Step 3: Company Info
  const renderStep3 = () => (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-display mb-3">Company Information</h1>
        <p className="text-muted-foreground text-lg">Tell us about your business</p>
      </div>
      
      <div className="max-w-lg mx-auto space-y-6">
        {/* Logo Upload */}
        <div className="space-y-2">
          <Label>Company Logo (optional)</Label>
          <div className="flex items-center gap-4">
            {logoPreview ? (
              <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted">
                <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                <button 
                  onClick={() => { setLogoPreview(null); updateFormData('companyLogo', null); }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-destructive rounded-full flex items-center justify-center"
                >
                  <X className="w-3 h-3 text-destructive-foreground" />
                </button>
              </div>
            ) : (
              <label className="w-16 h-16 rounded-lg border-2 border-dashed border-border hover:border-muted-foreground/50 flex items-center justify-center cursor-pointer transition-colors">
                <Upload className="w-5 h-5 text-muted-foreground" />
                <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
              </label>
            )}
            <p className="text-sm text-muted-foreground">Upload your company logo</p>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="companyName">Company Name *</Label>
          <Input
            id="companyName"
            value={formData.companyName}
            onChange={(e) => updateFormData('companyName', e.target.value)}
            placeholder="Acme Properties Ltd"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              value={formData.website}
              onChange={(e) => updateFormData('website', e.target.value)}
              placeholder="https://example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="linkedin">LinkedIn</Label>
            <Input
              id="linkedin"
              value={formData.linkedin}
              onChange={(e) => updateFormData('linkedin', e.target.value)}
              placeholder="linkedin.com/company/..."
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="instagram">Instagram</Label>
            <Input
              id="instagram"
              value={formData.instagram}
              onChange={(e) => updateFormData('instagram', e.target.value)}
              placeholder="@yourcompany"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Business Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => updateFormData('address', e.target.value)}
              placeholder="London, UK"
            />
          </div>
        </div>
        
        {/* Regions */}
        <div className="space-y-3">
          <Label>Regions Covered *</Label>
          <div className="flex flex-wrap gap-2">
            {REGIONS.map((region) => {
              const isSelected = formData.regions.includes(region);
              return (
                <button
                  key={region}
                  onClick={() => toggleRegion(region)}
                  className={`
                    px-3 py-1.5 rounded-full text-sm transition-all
                    ${isSelected 
                      ? 'bg-gold text-gold-foreground' 
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }
                  `}
                >
                  {region}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  // Step 4: Invite Team
  const renderStep4 = () => (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-display mb-3">Invite Your Team</h1>
        <p className="text-muted-foreground text-lg">Add team members who need access</p>
      </div>
      
      <div className="max-w-md mx-auto space-y-4">
        {formData.teamEmails.map((email, index) => (
          <div key={index} className="flex gap-2">
            <Input
              type="email"
              value={email}
              onChange={(e) => updateTeamEmail(index, e.target.value)}
              placeholder="colleague@company.com"
            />
            {formData.teamEmails.length > 1 && (
              <Button variant="ghost" size="icon" onClick={() => removeTeamEmail(index)}>
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        ))}
        
        <Button variant="outline" onClick={addTeamEmail} className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Add another team member
        </Button>
        
        <p className="text-center text-sm text-muted-foreground pt-4">
          Team members will receive an invitation email to join your workspace.
        </p>
      </div>
    </div>
  );

  // Step 5: Goals
  const renderStep5 = () => (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-display mb-3">What are your goals?</h1>
        <p className="text-muted-foreground text-lg">Select all that apply</p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
        {GOALS.map((goal) => {
          const Icon = goal.icon;
          const isSelected = formData.goals.includes(goal.id);
          
          return (
            <Card
              key={goal.id}
              onClick={() => toggleGoal(goal.id)}
              className={`
                p-4 cursor-pointer transition-all duration-200 hover:scale-[1.02]
                ${isSelected 
                  ? 'border-2 border-gold bg-gold/5' 
                  : 'border-border hover:border-muted-foreground/50'
                }
              `}
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-gold/20 text-gold' : 'bg-muted text-muted-foreground'}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold">{goal.title}</h3>
                  <p className="text-sm text-muted-foreground">{goal.description}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );

  // Step 6: Upsell
  const renderStep6 = () => (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center">
        <Badge className="bg-gold text-gold-foreground mb-4">RECOMMENDED</Badge>
        <h1 className="text-3xl md:text-4xl font-display mb-3">
          Launch a bespoke campaign for {formData.companyName || "your company"}
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          Let our team create and manage a done-for-you lead generation campaign tailored to you.
        </p>
      </div>
      
      <Card className="max-w-lg mx-auto p-6 border-gold/50 bg-gold/5">
        <div className="flex flex-wrap gap-2 justify-center mb-6">
          <Badge variant="secondary">Custom ad creative</Badge>
          <Badge variant="secondary">AI lead scoring</Badge>
          <Badge variant="secondary">Automated nurturing</Badge>
          <Badge variant="secondary">Dedicated strategist</Badge>
        </div>
        
        <div className="space-y-3">
          <Button 
            className="w-full bg-gold hover:bg-gold/90 text-gold-foreground"
            size="lg"
            onClick={() => handleComplete(true)}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Setting up..." : "Book a Call"}
          </Button>
          <Button 
            variant="ghost" 
            className="w-full"
            onClick={() => handleComplete(false)}
            disabled={isSubmitting}
          >
            Maybe Later
          </Button>
        </div>
      </Card>
    </div>
  );

  // Completion screen
  const renderComplete = () => (
    <div className="text-center space-y-6 animate-fade-in">
      <div className="w-20 h-20 mx-auto rounded-full bg-gold/20 flex items-center justify-center">
        <Sparkles className="w-10 h-10 text-gold" />
      </div>
      <h1 className="text-3xl md:text-4xl font-display">
        You're all set, {formData.firstName}!
      </h1>
      <p className="text-muted-foreground text-lg">
        Your workspace is ready. Let's start generating leads.
      </p>
      <Button size="lg" onClick={handleGoToDashboard} className="mt-4">
        Go to Dashboard
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );

  const renderCurrentStep = () => {
    if (isComplete) return renderComplete();
    
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      case 5: return renderStep5();
      case 6: return renderStep6();
      default: return renderStep1();
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="p-6 border-b border-border">
        <div className="max-w-4xl mx-auto">
          <img 
            src="/naybourhood-logo-white.svg" 
            alt="Naybourhood" 
            className="h-8"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col justify-center p-6 md:p-12">
        <div className="max-w-4xl mx-auto w-full">
          {!isComplete && <ProgressBar />}
          
          {renderCurrentStep()}
          
          {/* Navigation buttons */}
          {!isComplete && currentStep < 6 && (
            <div className="flex justify-between max-w-2xl mx-auto mt-12">
              <Button 
                variant="ghost" 
                onClick={handleBack}
                disabled={currentStep === 1}
                className={currentStep === 1 ? 'invisible' : ''}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              
              {currentStep === 4 ? (
                <div className="flex gap-3">
                  <Button variant="ghost" onClick={handleNext}>
                    Skip this step
                  </Button>
                  <Button onClick={handleNext}>
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              ) : (
                <Button onClick={handleNext} disabled={!validateStep()}>
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Onboarding;
