import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth } from "@/contexts/AuthContext";
import { campaignsCreate, campaignsPublishMeta, saveCampaign, getDevelopments } from "@/lib/api";
import { Campaign, UserRole } from "@/lib/types";
import { toast } from "sonner";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Upload,
  Sparkles,
  Eye,
  Check,
  Target,
  Calendar,
  Image,
  Settings,
  Send,
} from "lucide-react";

interface CampaignWizardProps {
  userType: UserRole;
}

interface WizardData {
  roleType: UserRole;
  developmentId: string;
  campaignName: string;
  objective: "leads" | "viewings" | "awareness";
  budget: number;
  startDate: string;
  endDate: string;
  isOngoing: boolean;
  dailyCap: number | null;
  images: string[];
  selectedHeadline: string;
  selectedPrimaryText: string;
  selectedCta: string;
  generatedHeadlines: string[];
  generatedPrimaryTexts: string[];
  generatedCtas: string[];
}

const CampaignWizard = ({ userType }: CampaignWizardProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  
  const developments = getDevelopments();
  
  const [data, setData] = useState<WizardData>({
    roleType: userType,
    developmentId: "",
    campaignName: "",
    objective: "leads",
    budget: 0,
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    isOngoing: true,
    dailyCap: null,
    images: [],
    selectedHeadline: "",
    selectedPrimaryText: "",
    selectedCta: "",
    generatedHeadlines: [],
    generatedPrimaryTexts: [],
    generatedCtas: [],
  });

  const steps = [
    { num: 1, label: "Overview", icon: Target },
    { num: 2, label: "Budget & Dates", icon: Calendar },
    { num: 3, label: "Creatives", icon: Image },
    { num: 4, label: "Tracking", icon: Settings },
    { num: 5, label: "Review", icon: Send },
  ];

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case "developer": return "Developer";
      case "agent": return "Estate Agent";
      case "broker": return "Mortgage Broker";
    }
  };

  const validateStep = (stepNum: number): boolean => {
    switch (stepNum) {
      case 1:
        return !!data.developmentId && !!data.campaignName && !!data.objective;
      case 2:
        return data.budget > 0 && !!data.startDate;
      case 3:
        return data.images.length > 0 && !!data.selectedHeadline && !!data.selectedPrimaryText && !!data.selectedCta;
      case 4:
        return true; // Read-only step
      case 5:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (!validateStep(step)) {
      toast.error("Please complete all required fields");
      return;
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleImageUpload = () => {
    // Simulate image upload with placeholder
    const newImage = `https://picsum.photos/seed/${Date.now()}/400/300`;
    if (data.images.length < 3) {
      setData({ ...data, images: [...data.images, newImage] });
      toast.success("Image uploaded");
    }
  };

  const handleGenerateCopy = async () => {
    setIsLoading(true);
    try {
      const result = await campaignsCreate({
        roleType: data.roleType,
        developmentId: data.developmentId,
        objective: data.objective,
        assets: data.images,
      });
      
      setData({
        ...data,
        generatedHeadlines: result.headlines,
        generatedPrimaryTexts: result.primaryTexts,
        generatedCtas: result.ctas,
        selectedHeadline: result.headlines[0],
        selectedPrimaryText: result.primaryTexts[0],
        selectedCta: result.ctas[0],
      });
      toast.success("AI copy generated successfully");
    } catch (error) {
      toast.error("Failed to generate copy");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      const development = developments.find((d) => d.id === data.developmentId);
      
      const campaign: Campaign = {
        id: `camp_${Date.now()}`,
        name: data.campaignName,
        developmentId: data.developmentId,
        developmentName: development?.name || "",
        objective: data.objective,
        status: "draft",
        budget: data.budget,
        dailyCap: data.dailyCap || undefined,
        startDate: data.startDate,
        endDate: data.isOngoing ? undefined : data.endDate,
        isOngoing: data.isOngoing,
        roleType: data.roleType,
        channel: "meta",
        createdAt: new Date().toISOString(),
        creatives: {
          images: data.images,
          selectedHeadline: data.selectedHeadline,
          selectedPrimaryText: data.selectedPrimaryText,
          selectedCta: data.selectedCta,
          generatedHeadlines: data.generatedHeadlines,
          generatedPrimaryTexts: data.generatedPrimaryTexts,
          generatedCtas: data.generatedCtas,
        },
      };

      saveCampaign(campaign);
      
      // Publish to Meta
      await campaignsPublishMeta(campaign.id);
      
      toast.success("Campaign published to Meta");
      navigate(`/${userType}/campaigns/${campaign.id}`);
    } catch (error) {
      toast.error("Failed to publish campaign");
    } finally {
      setIsPublishing(false);
    }
  };

  const selectedDevelopment = developments.find((d) => d.id === data.developmentId);

  return (
    <DashboardLayout title="New Campaign" userType={userType}>
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          {steps.map((s, index) => (
            <div key={s.num} className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                  step === s.num
                    ? "bg-primary border-primary text-primary-foreground"
                    : step > s.num
                    ? "bg-success border-success text-success-foreground"
                    : "border-border text-muted-foreground"
                }`}
              >
                {step > s.num ? <Check className="h-5 w-5" /> : <s.icon className="h-5 w-5" />}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-16 md:w-24 h-0.5 mx-2 ${
                    step > s.num ? "bg-success" : "bg-border"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between max-w-3xl mx-auto mt-2 px-2">
          {steps.map((s) => (
            <span
              key={s.num}
              className={`text-xs ${step === s.num ? "text-primary font-medium" : "text-muted-foreground"}`}
            >
              {s.label}
            </span>
          ))}
        </div>
      </div>

      <Card className="max-w-3xl mx-auto p-6 shadow-card">
        {/* Step 1: Overview */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-1">Campaign Overview</h2>
              <p className="text-sm text-muted-foreground">Define your campaign basics</p>
            </div>

            <div>
              <Label>Role Type</Label>
              <div className="mt-2 p-3 bg-muted/50 rounded-lg">
                <Badge variant="secondary">{getRoleLabel(data.roleType)}</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Based on your account type</p>
            </div>

            <div>
              <Label htmlFor="development">Development *</Label>
              <Select
                value={data.developmentId}
                onValueChange={(v) => setData({ ...data, developmentId: v })}
              >
                <SelectTrigger id="development" className="mt-2">
                  <SelectValue placeholder="Select development" />
                </SelectTrigger>
                <SelectContent>
                  {developments.map((dev) => (
                    <SelectItem key={dev.id} value={dev.id}>
                      {dev.name} - {dev.location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">The property development to promote</p>
            </div>

            <div>
              <Label htmlFor="campaignName">Campaign Name *</Label>
              <Input
                id="campaignName"
                value={data.campaignName}
                onChange={(e) => setData({ ...data, campaignName: e.target.value })}
                placeholder="e.g., Marina Heights - Lagos HNWI"
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">A descriptive name for this campaign</p>
            </div>

            <div>
              <Label>Objective *</Label>
              <RadioGroup
                value={data.objective}
                onValueChange={(v) => setData({ ...data, objective: v as typeof data.objective })}
                className="mt-2 grid grid-cols-3 gap-4"
              >
                {[
                  { value: "leads", label: "Leads", desc: "Generate enquiries" },
                  { value: "viewings", label: "Viewings", desc: "Book property viewings" },
                  { value: "awareness", label: "Awareness", desc: "Build brand visibility" },
                ].map((obj) => (
                  <label
                    key={obj.value}
                    className={`flex flex-col items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      data.objective === obj.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <RadioGroupItem value={obj.value} className="sr-only" />
                    <span className="font-medium">{obj.label}</span>
                    <span className="text-xs text-muted-foreground">{obj.desc}</span>
                  </label>
                ))}
              </RadioGroup>
            </div>
          </div>
        )}

        {/* Step 2: Budget & Dates */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-1">Budget & Schedule</h2>
              <p className="text-sm text-muted-foreground">Set your campaign budget and timeline</p>
            </div>

            <div>
              <Label htmlFor="budget">Total Budget (£) *</Label>
              <Input
                id="budget"
                type="number"
                value={data.budget || ""}
                onChange={(e) => setData({ ...data, budget: parseInt(e.target.value) || 0 })}
                placeholder="e.g., 2500"
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">Total amount to spend on this campaign</p>
            </div>

            <div>
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                value={data.startDate}
                onChange={(e) => setData({ ...data, startDate: e.target.value })}
                className="mt-2"
              />
            </div>

            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div>
                <Label htmlFor="ongoing">Ongoing Campaign</Label>
                <p className="text-xs text-muted-foreground">Run until manually paused</p>
              </div>
              <Switch
                id="ongoing"
                checked={data.isOngoing}
                onCheckedChange={(v) => setData({ ...data, isOngoing: v })}
              />
            </div>

            {!data.isOngoing && (
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={data.endDate}
                  onChange={(e) => setData({ ...data, endDate: e.target.value })}
                  className="mt-2"
                />
              </div>
            )}

            <div>
              <Label htmlFor="dailyCap">Daily Cap (£) - Optional</Label>
              <Input
                id="dailyCap"
                type="number"
                value={data.dailyCap || ""}
                onChange={(e) => setData({ ...data, dailyCap: parseInt(e.target.value) || null })}
                placeholder="e.g., 100"
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">Maximum daily spend limit</p>
            </div>
          </div>
        )}

        {/* Step 3: Creatives */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-1">Creative Assets</h2>
              <p className="text-sm text-muted-foreground">Upload images and generate ad copy</p>
            </div>

            <div>
              <Label>Images (1-3 required)</Label>
              <div className="mt-2 grid grid-cols-3 gap-4">
                {data.images.map((img, i) => (
                  <div key={i} className="aspect-video bg-muted rounded-lg overflow-hidden">
                    <img src={img} alt={`Creative ${i + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
                {data.images.length < 3 && (
                  <button
                    onClick={handleImageUpload}
                    className="aspect-video border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center hover:border-primary/50 transition-colors"
                  >
                    <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                    <span className="text-xs text-muted-foreground">Upload</span>
                  </button>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {data.images.length}/3 images uploaded
              </p>
            </div>

            {data.images.length > 0 && (
              <Button
                onClick={handleGenerateCopy}
                disabled={isLoading}
                variant="outline"
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Copy
                  </>
                )}
              </Button>
            )}

            {data.generatedHeadlines.length > 0 && (
              <>
                <div>
                  <Label>Headline *</Label>
                  <RadioGroup
                    value={data.selectedHeadline}
                    onValueChange={(v) => setData({ ...data, selectedHeadline: v })}
                    className="mt-2 space-y-2"
                  >
                    {data.generatedHeadlines.map((h, i) => (
                      <label
                        key={i}
                        className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                          data.selectedHeadline === h
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <RadioGroupItem value={h} className="mt-0.5" />
                        <span className="text-sm">{h}</span>
                      </label>
                    ))}
                  </RadioGroup>
                </div>

                <div>
                  <Label>Primary Text *</Label>
                  <RadioGroup
                    value={data.selectedPrimaryText}
                    onValueChange={(v) => setData({ ...data, selectedPrimaryText: v })}
                    className="mt-2 space-y-2"
                  >
                    {data.generatedPrimaryTexts.map((t, i) => (
                      <label
                        key={i}
                        className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                          data.selectedPrimaryText === t
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <RadioGroupItem value={t} className="mt-0.5" />
                        <span className="text-sm">{t}</span>
                      </label>
                    ))}
                  </RadioGroup>
                </div>

                <div>
                  <Label>Call-to-Action *</Label>
                  <RadioGroup
                    value={data.selectedCta}
                    onValueChange={(v) => setData({ ...data, selectedCta: v })}
                    className="mt-2 grid grid-cols-3 gap-4"
                  >
                    {data.generatedCtas.map((c, i) => (
                      <label
                        key={i}
                        className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-colors ${
                          data.selectedCta === c
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <RadioGroupItem value={c} className="sr-only" />
                        <span className="text-sm font-medium">{c}</span>
                      </label>
                    ))}
                  </RadioGroup>
                </div>
              </>
            )}
          </div>
        )}

        {/* Step 4: Tracking & Conversions */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-1">Tracking & Conversions</h2>
              <p className="text-sm text-muted-foreground">Meta tracking configuration (read-only)</p>
            </div>

            <div>
              <Label>UTM Template</Label>
              <div className="mt-2 p-3 bg-muted/50 rounded-lg font-mono text-xs break-all">
                utm_source=meta&utm_medium=paid_social&utm_campaign={"{campaign_id}"}&utm_content={"{ad_id}"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Auto-generated for tracking</p>
            </div>

            <div>
              <Label>Meta Instant Form Fields</Label>
              <div className="mt-2 space-y-2">
                {["full_name", "email", "phone"].map((field) => (
                  <div key={field} className="flex items-center gap-2 p-2 bg-muted/30 rounded">
                    <Check className="h-4 w-4 text-success" />
                    <span className="text-sm">{field}</span>
                  </div>
                ))}
                <p className="text-xs text-muted-foreground">Hidden: UTM parameters</p>
              </div>
            </div>

            <div>
              <Label>Conversion Events</Label>
              <div className="mt-2 space-y-2">
                {["Lead", "ViewContent", "SubmitForm"].map((event) => (
                  <div key={event} className="flex items-center gap-2 p-2 bg-muted/30 rounded">
                    <Check className="h-4 w-4 text-success" />
                    <span className="text-sm">{event}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label>Meta Pixel ID</Label>
              <div className="mt-2 p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
                Configure in Settings → Meta Credentials
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Review & Publish */}
        {step === 5 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-1">Review & Publish</h2>
              <p className="text-sm text-muted-foreground">Confirm your campaign details</p>
            </div>

            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border border-border rounded-lg">
                  <Label className="text-muted-foreground">Objective</Label>
                  <p className="font-medium capitalize">{data.objective}</p>
                </div>
                <div className="p-4 border border-border rounded-lg">
                  <Label className="text-muted-foreground">Channel</Label>
                  <p className="font-medium">Meta</p>
                </div>
              </div>

              <div className="p-4 border border-border rounded-lg">
                <Label className="text-muted-foreground">Development</Label>
                <p className="font-medium">{selectedDevelopment?.name}</p>
                <p className="text-sm text-muted-foreground">{selectedDevelopment?.location}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border border-border rounded-lg">
                  <Label className="text-muted-foreground">Budget</Label>
                  <p className="font-medium">£{data.budget.toLocaleString()}</p>
                </div>
                <div className="p-4 border border-border rounded-lg">
                  <Label className="text-muted-foreground">Schedule</Label>
                  <p className="font-medium">
                    {data.isOngoing ? "Ongoing" : `${data.startDate} - ${data.endDate}`}
                  </p>
                </div>
              </div>

              <div className="p-4 border border-border rounded-lg">
                <Label className="text-muted-foreground">Selected Creative</Label>
                <div className="mt-2 space-y-2">
                  <p className="font-medium">{data.selectedHeadline}</p>
                  <p className="text-sm text-muted-foreground">{data.selectedPrimaryText}</p>
                  <Badge variant="outline">{data.selectedCta}</Badge>
                </div>
              </div>

              <div className="p-4 border border-border rounded-lg bg-muted/30">
                <Label className="text-muted-foreground">Predicted CPL</Label>
                <p className="text-2xl font-bold text-primary">£18 - £25</p>
                <p className="text-xs text-muted-foreground">Based on similar campaigns</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8 pt-6 border-t border-border">
          <Button
            variant="outline"
            onClick={step === 1 ? () => navigate(`/${userType}/campaigns`) : handleBack}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            {step === 1 ? "Cancel" : "Back"}
          </Button>

          {step < 5 ? (
            <Button onClick={handleNext} disabled={!validateStep(step)}>
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handlePublish} disabled={isPublishing}>
              {isPublishing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Publish to Meta
                </>
              )}
            </Button>
          )}
        </div>
      </Card>
    </DashboardLayout>
  );
};

export default CampaignWizard;
