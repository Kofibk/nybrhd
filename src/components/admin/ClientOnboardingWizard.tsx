import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  UserPlus, 
  Building2, 
  User, 
  Briefcase, 
  Send, 
  Loader2,
  Check,
  ChevronRight,
  ChevronLeft,
  Megaphone
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface ClientOnboardingWizardProps {
  onComplete?: (data: OnboardingData) => void;
}

export interface OnboardingData {
  // Step 1: Client Details
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientType: "developer" | "agent" | "broker";
  
  // Step 2: Company Setup
  companyName: string;
  companyWebsite: string;
  companyIndustry: string;
  companyAddress: string;
  
  // Step 3: Campaign Assignment
  assignedCampaigns: string[];
  monthlyBudget: string;
  
  // Meta
  notes: string;
  sendInvite: boolean;
}

const STEPS = [
  { id: 1, name: "Client Details", icon: User },
  { id: 2, name: "Company Setup", icon: Building2 },
  { id: 3, name: "Campaigns", icon: Megaphone },
  { id: 4, name: "Review & Send", icon: Send },
];

const MOCK_CAMPAIGNS = [
  { id: "1", name: "Chelsea Island - UK Leads", status: "active" },
  { id: "2", name: "The Lucan - International", status: "active" },
  { id: "3", name: "North Kensington Gate - Awareness", status: "paused" },
  { id: "4", name: "One Clapham - UK Regional", status: "active" },
  { id: "5", name: "River Park Tower - Dubai", status: "draft" },
];

const ClientOnboardingWizard = ({ onComplete }: ClientOnboardingWizardProps) => {
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<OnboardingData>({
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    clientType: "developer",
    companyName: "",
    companyWebsite: "",
    companyIndustry: "",
    companyAddress: "",
    assignedCampaigns: [],
    monthlyBudget: "",
    notes: "",
    sendInvite: true,
  });

  const updateFormData = (field: keyof OnboardingData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.clientName || !formData.clientEmail) {
          toast({ title: "Missing fields", description: "Name and email are required.", variant: "destructive" });
          return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.clientEmail)) {
          toast({ title: "Invalid email", description: "Please enter a valid email address.", variant: "destructive" });
          return false;
        }
        return true;
      case 2:
        if (!formData.companyName) {
          toast({ title: "Missing fields", description: "Company name is required.", variant: "destructive" });
          return false;
        }
        return true;
      case 3:
        return true;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    onComplete?.(formData);
    
    toast({
      title: "Client onboarded successfully",
      description: formData.sendInvite 
        ? `Invitation sent to ${formData.clientEmail}` 
        : `${formData.clientName} has been added without invitation.`,
    });
    
    // Reset form
    setFormData({
      clientName: "",
      clientEmail: "",
      clientPhone: "",
      clientType: "developer",
      companyName: "",
      companyWebsite: "",
      companyIndustry: "",
      companyAddress: "",
      assignedCampaigns: [],
      monthlyBudget: "",
      notes: "",
      sendInvite: true,
    });
    setCurrentStep(1);
    setIsSubmitting(false);
    setOpen(false);
  };

  const toggleCampaign = (campaignId: string) => {
    setFormData(prev => ({
      ...prev,
      assignedCampaigns: prev.assignedCampaigns.includes(campaignId)
        ? prev.assignedCampaigns.filter(id => id !== campaignId)
        : [...prev.assignedCampaigns, campaignId]
    }));
  };

  const getClientTypeIcon = (type: string) => {
    switch (type) {
      case "developer": return <Building2 className="h-4 w-4" />;
      case "agent": return <User className="h-4 w-4" />;
      case "broker": return <Briefcase className="h-4 w-4" />;
      default: return null;
    }
  };

  const getClientTypeLabel = (type: string) => {
    switch (type) {
      case "developer": return "Property Developer";
      case "agent": return "Estate Agent";
      case "broker": return "Mortgage Broker";
      default: return type;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <UserPlus className="h-4 w-4" />
          Onboard Client
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Client Onboarding</DialogTitle>
          <DialogDescription>
            Set up a new client with company details and campaign assignments.
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-6 px-2">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors",
                    currentStep > step.id
                      ? "bg-primary border-primary text-primary-foreground"
                      : currentStep === step.id
                      ? "border-primary text-primary"
                      : "border-muted text-muted-foreground"
                  )}
                >
                  {currentStep > step.id ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <step.icon className="h-5 w-5" />
                  )}
                </div>
                <span className={cn(
                  "text-xs mt-1 text-center",
                  currentStep >= step.id ? "text-foreground" : "text-muted-foreground"
                )}>
                  {step.name}
                </span>
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={cn(
                    "w-12 h-0.5 mx-2 mt-[-16px]",
                    currentStep > step.id ? "bg-primary" : "bg-muted"
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="min-h-[300px]">
          {/* Step 1: Client Details */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="clientName">Contact Name *</Label>
                <Input
                  id="clientName"
                  placeholder="John Smith"
                  value={formData.clientName}
                  onChange={(e) => updateFormData("clientName", e.target.value)}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="clientEmail">Email Address *</Label>
                <Input
                  id="clientEmail"
                  type="email"
                  placeholder="john@company.com"
                  value={formData.clientEmail}
                  onChange={(e) => updateFormData("clientEmail", e.target.value)}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="clientPhone">Phone Number</Label>
                <Input
                  id="clientPhone"
                  type="tel"
                  placeholder="+44 7700 900000"
                  value={formData.clientPhone}
                  onChange={(e) => updateFormData("clientPhone", e.target.value)}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="clientType">Client Type *</Label>
                <Select
                  value={formData.clientType}
                  onValueChange={(value) => updateFormData("clientType", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select client type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="developer">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        Property Developer
                      </div>
                    </SelectItem>
                    <SelectItem value="agent">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Estate Agent
                      </div>
                    </SelectItem>
                    <SelectItem value="broker">
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4" />
                        Mortgage Broker
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Step 2: Company Setup */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="companyName">Company Name *</Label>
                <Input
                  id="companyName"
                  placeholder="Berkeley Homes"
                  value={formData.companyName}
                  onChange={(e) => updateFormData("companyName", e.target.value)}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="companyWebsite">Website</Label>
                <Input
                  id="companyWebsite"
                  type="url"
                  placeholder="https://www.company.com"
                  value={formData.companyWebsite}
                  onChange={(e) => updateFormData("companyWebsite", e.target.value)}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="companyIndustry">Industry</Label>
                <Select
                  value={formData.companyIndustry}
                  onValueChange={(value) => updateFormData("companyIndustry", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="residential">Residential Property</SelectItem>
                    <SelectItem value="commercial">Commercial Property</SelectItem>
                    <SelectItem value="mixed">Mixed Use</SelectItem>
                    <SelectItem value="lettings">Lettings</SelectItem>
                    <SelectItem value="financial">Financial Services</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="companyAddress">Address</Label>
                <Textarea
                  id="companyAddress"
                  placeholder="123 Business Street, London, EC1A 1AA"
                  value={formData.companyAddress}
                  onChange={(e) => updateFormData("companyAddress", e.target.value)}
                  rows={2}
                />
              </div>
            </div>
          )}

          {/* Step 3: Campaign Assignment */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label>Assign to Campaigns</Label>
                <p className="text-sm text-muted-foreground">
                  Select campaigns this client will have access to manage.
                </p>
                <div className="border rounded-md divide-y max-h-[200px] overflow-y-auto">
                  {MOCK_CAMPAIGNS.map((campaign) => (
                    <label
                      key={campaign.id}
                      className="flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer"
                    >
                      <Checkbox
                        checked={formData.assignedCampaigns.includes(campaign.id)}
                        onCheckedChange={() => toggleCampaign(campaign.id)}
                      />
                      <div className="flex-1">
                        <span className="font-medium">{campaign.name}</span>
                      </div>
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded-full",
                        campaign.status === "active" && "bg-green-100 text-green-700",
                        campaign.status === "paused" && "bg-amber-100 text-amber-700",
                        campaign.status === "draft" && "bg-muted text-muted-foreground"
                      )}>
                        {campaign.status}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="monthlyBudget">Monthly Budget Allocation</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">£</span>
                  <Input
                    id="monthlyBudget"
                    type="number"
                    placeholder="10,000"
                    className="pl-7"
                    value={formData.monthlyBudget}
                    onChange={(e) => updateFormData("monthlyBudget", e.target.value)}
                  />
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="notes">Internal Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Any internal notes about this client..."
                  value={formData.notes}
                  onChange={(e) => updateFormData("notes", e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Step 4: Review & Send */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <h4 className="font-semibold">Client Details</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-muted-foreground">Name:</span>
                  <span>{formData.clientName}</span>
                  <span className="text-muted-foreground">Email:</span>
                  <span>{formData.clientEmail}</span>
                  <span className="text-muted-foreground">Phone:</span>
                  <span>{formData.clientPhone || "—"}</span>
                  <span className="text-muted-foreground">Type:</span>
                  <span className="flex items-center gap-1">
                    {getClientTypeIcon(formData.clientType)}
                    {getClientTypeLabel(formData.clientType)}
                  </span>
                </div>
              </div>
              
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <h4 className="font-semibold">Company</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-muted-foreground">Company:</span>
                  <span>{formData.companyName}</span>
                  <span className="text-muted-foreground">Website:</span>
                  <span>{formData.companyWebsite || "—"}</span>
                  <span className="text-muted-foreground">Industry:</span>
                  <span className="capitalize">{formData.companyIndustry || "—"}</span>
                </div>
              </div>
              
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <h4 className="font-semibold">Campaign Access</h4>
                <div className="text-sm">
                  {formData.assignedCampaigns.length > 0 ? (
                    <ul className="list-disc list-inside space-y-1">
                      {formData.assignedCampaigns.map(id => {
                        const campaign = MOCK_CAMPAIGNS.find(c => c.id === id);
                        return campaign ? <li key={id}>{campaign.name}</li> : null;
                      })}
                    </ul>
                  ) : (
                    <span className="text-muted-foreground">No campaigns assigned</span>
                  )}
                </div>
                {formData.monthlyBudget && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Monthly Budget: </span>
                    <span>£{Number(formData.monthlyBudget).toLocaleString()}</span>
                  </div>
                )}
              </div>
              
              <label className="flex items-center gap-3 p-3 border rounded-md cursor-pointer hover:bg-muted/50">
                <Checkbox
                  checked={formData.sendInvite}
                  onCheckedChange={(checked) => updateFormData("sendInvite", checked)}
                />
                <div>
                  <span className="font-medium">Send invitation email</span>
                  <p className="text-sm text-muted-foreground">
                    Client will receive an email to set up their account
                  </p>
                </div>
              </label>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
          
          {currentStep < 4 ? (
            <Button onClick={nextStep} className="gap-2">
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSubmitting} className="gap-2">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Complete Onboarding
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ClientOnboardingWizard;
