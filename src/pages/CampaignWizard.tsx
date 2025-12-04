import { useState, useEffect } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import { campaignsCreate, campaignsPublishMeta, saveCampaign, getDevelopments } from "@/lib/api";
import { 
  Campaign, UserRole, CreativeAsset, CreativeType, TARGET_COUNTRIES, TARGET_CITIES, 
  AIRecommendation, CampaignObjective, AgentFocusSegment, BrokerProduct,
  BROKER_PRODUCTS, AGENT_FOCUS_SEGMENTS 
} from "@/lib/types";
import { useAICityRecommendations } from "@/hooks/useAICityRecommendations";
import { useAIBudgetOptimization } from "@/hooks/useAIBudgetOptimization";
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
  Globe,
  Video,
  Images,
  X,
  Lightbulb,
  Wand2,
} from "lucide-react";

interface CampaignWizardProps {
  userType: UserRole;
}

interface WizardData {
  roleType: UserRole;
  developmentId: string;
  campaignName: string;
  objective: CampaignObjective;
  budget: number;
  startDate: string;
  endDate: string;
  isOngoing: boolean;
  dailyCap: number | null;
  assets: CreativeAsset[];
  selectedHeadline: string;
  selectedPrimaryText: string;
  selectedCta: string;
  generatedHeadlines: string[];
  generatedPrimaryTexts: string[];
  generatedCtas: string[];
  targetCountries: string[];
  targetCities: string[];
  // Agent-specific
  propertyDetails: string;
  focusSegment: AgentFocusSegment | "";
  // Broker-specific
  product: BrokerProduct | "";
  // Broker lead form fields
  propertyValue: string;
  borrowAmount: string;
}

const CampaignWizard = ({ userType }: CampaignWizardProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [uploadType, setUploadType] = useState<CreativeType>("static");
  
  const developments = getDevelopments();
  
  // AI City Recommendations hook
  const { 
    recommendations: aiCityRecommendations, 
    isLoading: isLoadingCityRecs, 
    fetchRecommendations: fetchCityRecommendations 
  } = useAICityRecommendations();

  // AI Budget Optimization hook
  const {
    optimization: budgetOptimization,
    isLoading: isLoadingBudget,
    fetchOptimization: fetchBudgetOptimization,
  } = useAIBudgetOptimization();
  
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
    assets: [],
    selectedHeadline: "",
    selectedPrimaryText: "",
    selectedCta: "",
    generatedHeadlines: [],
    generatedPrimaryTexts: [],
    generatedCtas: [],
    targetCountries: ["GB", "NG", "AE"],
    targetCities: ["london", "lagos", "dubai"],
    // Agent-specific
    propertyDetails: "",
    focusSegment: "",
    // Broker-specific
    product: "",
    propertyValue: "",
    borrowAmount: "",
  });

  const selectedDevelopment = developments.find((d) => d.id === data.developmentId);

  // Fetch AI city recommendations when entering Step 2
  useEffect(() => {
    if (step === 2 && data.targetCountries.length > 0) {
      fetchCityRecommendations({
        userType,
        product: data.product,
        propertyDetails: data.propertyDetails,
        focusSegment: data.focusSegment,
        developmentName: selectedDevelopment?.name,
        targetCountries: data.targetCountries,
      });
    }
  }, [step, data.targetCountries.join(",")]);

  // AI Recommendations for campaigns
  const [aiRecommendations] = useState<AIRecommendation[]>([
    {
      id: "rec_1",
      type: "targeting",
      title: "Add Middle East markets",
      description: "Based on similar campaigns, UAE and Saudi Arabia show strong conversion rates for luxury properties.",
      confidence: 85,
      priority: "high",
    },
    {
      id: "rec_2",
      type: "budget",
      title: "Increase daily cap",
      description: "Your CPL suggests room for scale. Consider increasing daily cap by 20% to capture more leads.",
      confidence: 72,
      priority: "medium",
    },
    {
      id: "rec_3",
      type: "creative",
      title: "Test video content",
      description: "Video ads typically see 30% higher engagement for property campaigns.",
      confidence: 78,
      priority: "medium",
    },
  ]);

  const steps = [
    { num: 1, label: "Overview", icon: Target },
    { num: 2, label: "Targeting", icon: Globe },
    { num: 3, label: "Budget", icon: Calendar },
    { num: 4, label: "Creatives", icon: Image },
    { num: 5, label: "Tracking", icon: Settings },
    { num: 6, label: "Review", icon: Send },
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
        if (userType === "developer") {
          return !!data.developmentId && !!data.campaignName && !!data.objective;
        } else if (userType === "agent") {
          return !!data.propertyDetails && !!data.campaignName && !!data.objective && !!data.focusSegment;
        } else if (userType === "broker") {
          return !!data.product && !!data.campaignName && !!data.objective;
        }
        return false;
      case 2:
        return data.targetCountries.length > 0;
      case 3:
        return data.budget > 0 && !!data.startDate;
      case 4:
        return data.assets.length > 0 && !!data.selectedHeadline && !!data.selectedPrimaryText && !!data.selectedCta;
      case 5:
        return true;
      case 6:
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

  const handleAssetUpload = () => {
    const newAsset: CreativeAsset = {
      id: `asset_${Date.now()}`,
      type: uploadType,
      url: uploadType === "video" 
        ? "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4"
        : `https://picsum.photos/seed/${Date.now()}/400/300`,
      thumbnail: uploadType === "video" ? `https://picsum.photos/seed/${Date.now()}/400/300` : undefined,
    };
    
    const maxAssets = uploadType === "carousel" ? 10 : 3;
    if (data.assets.filter(a => a.type === uploadType).length < maxAssets) {
      setData({ ...data, assets: [...data.assets, newAsset] });
      toast.success(`${uploadType.charAt(0).toUpperCase() + uploadType.slice(1)} uploaded`);
    } else {
      toast.error(`Maximum ${maxAssets} ${uploadType} assets allowed`);
    }
  };

  const removeAsset = (assetId: string) => {
    setData({ ...data, assets: data.assets.filter(a => a.id !== assetId) });
  };

  const toggleCountry = (countryCode: string) => {
    if (data.targetCountries.includes(countryCode)) {
      setData({ ...data, targetCountries: data.targetCountries.filter(c => c !== countryCode) });
    } else {
      setData({ ...data, targetCountries: [...data.targetCountries, countryCode] });
    }
  };

  const toggleCity = (cityCode: string) => {
    if (data.targetCities.includes(cityCode)) {
      setData({ ...data, targetCities: data.targetCities.filter(c => c !== cityCode) });
    } else {
      setData({ ...data, targetCities: [...data.targetCities, cityCode] });
    }
  };

  // Get objectives - simplified to Leads or Awareness for all user types
  const getObjectives = () => {
    return [
      { value: "leads", label: "Leads", desc: "Generate enquiries" },
      { value: "awareness", label: "Awareness", desc: "Build brand visibility" },
    ];
  };

  // Get CTAs based on user type
  const getDefaultCtas = () => {
    if (userType === "agent") {
      return ["Learn More", "Book a Viewing", "Submit an Offer"];
    } else if (userType === "broker") {
      return ["Learn More", "Book a Free Consultation", "Request a Call Back"];
    }
    return ["Learn More", "Book a Viewing", "Get Details"];
  };

  const handleGenerateCopy = async () => {
    setIsLoading(true);
    try {
      const result = await campaignsCreate({
        roleType: data.roleType,
        developmentId: data.developmentId,
        objective: data.objective,
        assets: data.assets.map(a => a.url),
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
      
      // Get the display name based on user type
      const getDisplayName = () => {
        if (userType === "developer") return development?.name || "";
        if (userType === "agent") return data.propertyDetails;
        if (userType === "broker") return BROKER_PRODUCTS.find(p => p.value === data.product)?.label || "";
        return "";
      };
      
      const campaign: Campaign = {
        id: `camp_${Date.now()}`,
        name: data.campaignName,
        developmentId: userType === "developer" ? data.developmentId : "",
        developmentName: getDisplayName(),
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
        targeting: {
          countries: data.targetCountries,
          cities: data.targetCities,
        },
        formFields: {
          fullName: true,
          email: true,
          phone: true,
          budgetRange: true,
          paymentMethod: true,
          buyerStatus: true,
          purchaseTimeline: true,
        },
        creatives: {
          assets: data.assets,
          selectedHeadline: data.selectedHeadline,
          selectedPrimaryText: data.selectedPrimaryText,
          selectedCta: data.selectedCta,
          generatedHeadlines: data.generatedHeadlines,
          generatedPrimaryTexts: data.generatedPrimaryTexts,
          generatedCtas: data.generatedCtas,
        },
        aiRecommendations: aiRecommendations,
        // Agent-specific fields
        ...(userType === "agent" && {
          focusSegment: data.focusSegment as AgentFocusSegment,
          propertyDetails: data.propertyDetails,
        }),
        // Broker-specific fields
        ...(userType === "broker" && {
          product: data.product as BrokerProduct,
        }),
      };

      saveCampaign(campaign);
      await campaignsPublishMeta(campaign.id);
      
      toast.success("Campaign published to Meta");
      navigate(`/${userType}/campaigns/${campaign.id}`);
    } catch (error) {
      toast.error("Failed to publish campaign");
    } finally {
      setIsPublishing(false);
    }
  };

  const getCreativeTypeIcon = (type: CreativeType) => {
    switch (type) {
      case "static": return <Image className="h-4 w-4" />;
      case "carousel": return <Images className="h-4 w-4" />;
      case "video": return <Video className="h-4 w-4" />;
    }
  };

  return (
    <DashboardLayout title="New Campaign" userType={userType}>
      {/* Progress Steps */}
      <div className="mb-4 md:mb-5 overflow-x-auto pb-1">
        <div className="flex items-center justify-between min-w-[420px] max-w-3xl mx-auto px-1">
          {steps.map((s, index) => (
            <div key={s.num} className="flex items-center">
              <div
                className={`flex items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded-full border-2 transition-colors ${
                  step === s.num
                    ? "bg-primary border-primary text-primary-foreground"
                    : step > s.num
                    ? "bg-success border-success text-success-foreground"
                    : "border-border text-muted-foreground"
                }`}
              >
                {step > s.num ? <Check className="h-3.5 w-3.5 md:h-4 md:w-4" /> : <s.icon className="h-3.5 w-3.5 md:h-4 md:w-4" />}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-6 md:w-12 lg:w-16 h-0.5 mx-0.5 md:mx-1 ${
                    step > s.num ? "bg-success" : "bg-border"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between min-w-[420px] max-w-3xl mx-auto mt-1 px-1">
          {steps.map((s) => (
            <span
              key={s.num}
              className={`text-[9px] md:text-[10px] text-center w-10 md:w-14 ${step === s.num ? "text-primary font-medium" : "text-muted-foreground"}`}
            >
              {s.label}
            </span>
          ))}
        </div>
      </div>

      <Card className="max-w-3xl mx-auto p-3 md:p-5 shadow-card">
        {/* Step 1: Overview */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-base md:text-lg font-semibold mb-0.5">Campaign Overview</h2>
              <p className="text-xs text-muted-foreground">Define your campaign basics</p>
            </div>

            <div>
              <Label className="text-xs">Role Type</Label>
              <div className="mt-1 p-2 bg-muted/50 rounded-lg">
                <Badge variant="secondary" className="text-[10px]">{getRoleLabel(data.roleType)}</Badge>
              </div>
            </div>

            {/* Developer: Development selection */}
            {userType === "developer" && (
              <div>
                <Label htmlFor="development" className="text-xs">Development *</Label>
                <Select
                  value={data.developmentId}
                  onValueChange={(v) => setData({ ...data, developmentId: v })}
                >
                  <SelectTrigger id="development" className="mt-1 h-9 text-sm">
                    <SelectValue placeholder="Select development" />
                  </SelectTrigger>
                  <SelectContent>
                    {developments.map((dev) => (
                      <SelectItem key={dev.id} value={dev.id} className="text-sm">
                        {dev.name} - {dev.location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Agent: Property Details & Focus Segment */}
            {userType === "agent" && (
              <>
                <div>
                  <Label htmlFor="propertyDetails" className="text-xs">Property Details *</Label>
                  <Input
                    id="propertyDetails"
                    value={data.propertyDetails}
                    onChange={(e) => setData({ ...data, propertyDetails: e.target.value })}
                    placeholder="e.g., 3 Bed Semi-Detached, Kensington"
                    className="mt-1 h-9 text-sm"
                  />
                </div>

                <div>
                  <Label className="text-xs">Focus Segment *</Label>
                  <Select
                    value={data.focusSegment}
                    onValueChange={(v) => setData({ ...data, focusSegment: v as AgentFocusSegment })}
                  >
                    <SelectTrigger className="mt-1 h-9 text-sm">
                      <SelectValue placeholder="Select focus segment" />
                    </SelectTrigger>
                    <SelectContent>
                      {AGENT_FOCUS_SEGMENTS.map((segment) => (
                        <SelectItem key={segment.value} value={segment.value} className="text-sm">
                          {segment.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {/* Broker: Product selection */}
            {userType === "broker" && (
              <div>
                <Label htmlFor="product" className="text-xs">Product *</Label>
                <Select
                  value={data.product}
                  onValueChange={(v) => setData({ ...data, product: v as BrokerProduct })}
                >
                  <SelectTrigger id="product" className="mt-1 h-9 text-sm">
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {BROKER_PRODUCTS.map((product) => (
                      <SelectItem key={product.value} value={product.value} className="text-sm">
                        {product.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label htmlFor="campaignName" className="text-xs">Campaign Name *</Label>
              <Input
                id="campaignName"
                value={data.campaignName}
                onChange={(e) => setData({ ...data, campaignName: e.target.value })}
                placeholder={
                  userType === "agent" 
                    ? "e.g., Kensington Properties - Valuations" 
                    : userType === "broker"
                    ? "e.g., BTL Mortgages - Q1 Campaign"
                    : "e.g., Marina Heights - Lagos HNWI"
                }
                className="mt-1 h-9 text-sm"
              />
            </div>

            <div>
              <Label className="text-xs">Objective *</Label>
              <RadioGroup
                value={data.objective}
                onValueChange={(v) => setData({ ...data, objective: v as CampaignObjective })}
                className={`mt-1.5 grid grid-cols-2 gap-2`}
              >
                {getObjectives().map((obj) => (
                  <label
                    key={obj.value}
                    className={`flex flex-col items-center p-2.5 md:p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                      data.objective === obj.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <RadioGroupItem value={obj.value} className="sr-only" />
                    <span className="font-medium text-xs md:text-sm">{obj.label}</span>
                    <span className="text-[10px] text-muted-foreground">{obj.desc}</span>
                  </label>
                ))}
              </RadioGroup>
            </div>
          </div>
        )}

        {/* Step 2: Audience Targeting */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-base md:text-lg font-semibold mb-0.5">Audience Targeting</h2>
              <p className="text-xs text-muted-foreground">Select target countries and cities</p>
            </div>

            {/* AI City Recommendations */}
            <div className="bg-accent/10 border border-accent/30 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Wand2 className="h-4 w-4 text-accent" />
                  <h3 className="font-medium text-xs md:text-sm">AI City Recommendations</h3>
                </div>
                {isLoadingCityRecs && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Analyzing...
                  </div>
                )}
              </div>
              
              {aiCityRecommendations.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-[10px] text-muted-foreground">
                    Based on your {userType === "broker" ? "product" : userType === "agent" ? "property" : "development"}, we recommend:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {aiCityRecommendations.map((rec, idx) => (
                      <div 
                        key={idx} 
                        className={`flex items-start gap-1.5 p-1.5 rounded-lg border cursor-pointer transition-colors ${
                          data.targetCities.includes(rec.cityCode)
                            ? "border-primary bg-primary/10"
                            : "border-border/50 hover:border-primary/50"
                        }`}
                        onClick={() => toggleCity(rec.cityCode)}
                      >
                        <Checkbox
                          checked={data.targetCities.includes(rec.cityCode)}
                          onCheckedChange={() => toggleCity(rec.cityCode)}
                          className="mt-0.5 h-3.5 w-3.5"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <span className="font-medium text-xs">{rec.cityName}</span>
                            <Badge 
                              variant={rec.priority === "high" ? "default" : "secondary"} 
                              className="text-[9px] px-1 py-0"
                            >
                              {rec.priority}
                            </Badge>
                          </div>
                          <p className="text-[10px] text-muted-foreground line-clamp-1">{rec.reason}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const recCities = aiCityRecommendations.map(r => r.cityCode);
                      setData({ ...data, targetCities: [...new Set([...data.targetCities, ...recCities])] });
                      toast.success("Added all AI-recommended cities");
                    }}
                    className="w-full h-7 text-xs"
                  >
                    <Sparkles className="h-3 w-3 mr-1" />
                    Add All Recommended
                  </Button>
                </div>
              ) : !isLoadingCityRecs ? (
                <div className="space-y-1">
                  {aiRecommendations.filter(r => r.type === "targeting").map(rec => (
                    <div key={rec.id} className="flex items-start gap-1.5 text-xs">
                      <Sparkles className="h-3 w-3 text-accent mt-0.5" />
                      <div>
                        <span className="font-medium">{rec.title}:</span>{" "}
                        <span className="text-muted-foreground">{rec.description}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            <div>
              <Label className="text-xs">Target Countries *</Label>
              <div className="mt-1.5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5">
                {TARGET_COUNTRIES.map((country) => (
                  <label
                    key={country.code}
                    className={`flex items-center gap-1.5 p-1.5 md:p-2 border rounded-lg cursor-pointer transition-colors text-xs ${
                      data.targetCountries.includes(country.code)
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <Checkbox
                      checked={data.targetCountries.includes(country.code)}
                      onCheckedChange={() => toggleCountry(country.code)}
                      className="h-3.5 w-3.5"
                    />
                    <span className="truncate">{country.name}</span>
                  </label>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">{data.targetCountries.length} countries selected</p>
            </div>

            <div>
              <Label className="text-xs">Target Cities (Optional)</Label>
              <div className="mt-1.5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5">
                {TARGET_CITIES.filter(city => data.targetCountries.includes(city.country)).map((city) => (
                  <label
                    key={city.code}
                    className={`flex items-center gap-1.5 p-1.5 md:p-2 border rounded-lg cursor-pointer transition-colors text-xs ${
                      data.targetCities.includes(city.code)
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <Checkbox
                      checked={data.targetCities.includes(city.code)}
                      onCheckedChange={() => toggleCity(city.code)}
                      className="h-3.5 w-3.5"
                    />
                    <span className="truncate">{city.name}</span>
                  </label>
                ))}
              </div>
              {data.targetCities.length > 0 && (
                <p className="text-[10px] text-muted-foreground mt-1">{data.targetCities.length} cities selected</p>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Budget & Dates */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-base md:text-lg font-semibold mb-0.5">Budget & Schedule</h2>
              <p className="text-xs text-muted-foreground">Set your campaign budget and timeline</p>
            </div>

            {/* AI Budget Optimization */}
            <div className="bg-accent/10 border border-accent/30 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Wand2 className="h-4 w-4 text-accent" />
                  <h3 className="font-medium text-xs md:text-sm">AI Budget Optimizer</h3>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => fetchBudgetOptimization({
                    userType,
                    objective: data.objective,
                    currentBudget: data.budget,
                    targetCountries: data.targetCountries,
                    targetCities: data.targetCities,
                    product: data.product,
                    propertyDetails: data.propertyDetails,
                    focusSegment: data.focusSegment,
                    developmentName: selectedDevelopment?.name,
                  })}
                  disabled={isLoadingBudget}
                >
                  {isLoadingBudget ? (
                    <>
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3 w-3 mr-1" />
                      Get AI Recommendations
                    </>
                  )}
                </Button>
              </div>

              {budgetOptimization ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 bg-background rounded-lg border">
                      <p className="text-[10px] text-muted-foreground">Recommended Budget</p>
                      <p className="text-sm font-bold text-primary">£{budgetOptimization.recommendedBudget.toLocaleString()}</p>
                    </div>
                    <div className="p-2 bg-background rounded-lg border">
                      <p className="text-[10px] text-muted-foreground">Daily Cap</p>
                      <p className="text-sm font-bold text-primary">£{budgetOptimization.recommendedDailyCap.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="p-2 bg-background rounded-lg border">
                    <p className="text-[10px] text-muted-foreground">Expected CPL</p>
                    <p className="text-xs font-medium">£{budgetOptimization.expectedCPLMin} - £{budgetOptimization.expectedCPLMax}</p>
                  </div>

                  <div className="flex gap-2 items-center">
                    <Button
                      variant="default"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => {
                        setData({
                          ...data,
                          budget: budgetOptimization.recommendedBudget,
                          dailyCap: budgetOptimization.recommendedDailyCap,
                        });
                        toast.success("Applied AI-recommended budget");
                      }}
                    >
                      Apply
                    </Button>
                    <Badge variant="secondary" className="text-[10px]">
                      {budgetOptimization.confidence}% confidence
                    </Badge>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Click to get personalized budget suggestions.
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="budget" className="text-xs">Total Budget (£) *</Label>
                <Input
                  id="budget"
                  type="number"
                  value={data.budget || ""}
                  onChange={(e) => setData({ ...data, budget: parseInt(e.target.value) || 0 })}
                  placeholder="e.g., 2500"
                  className="mt-1 h-9 text-sm"
                />
              </div>

              <div>
                <Label htmlFor="dailyCap" className="text-xs">Daily Cap (£)</Label>
                <Input
                  id="dailyCap"
                  type="number"
                  value={data.dailyCap || ""}
                  onChange={(e) => setData({ ...data, dailyCap: parseInt(e.target.value) || null })}
                  placeholder="e.g., 100"
                  className="mt-1 h-9 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="startDate" className="text-xs">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={data.startDate}
                  onChange={(e) => setData({ ...data, startDate: e.target.value })}
                  className="mt-1 h-9 text-sm"
                />
              </div>

              {!data.isOngoing && (
                <div>
                  <Label htmlFor="endDate" className="text-xs">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={data.endDate}
                    onChange={(e) => setData({ ...data, endDate: e.target.value })}
                    className="mt-1 h-9 text-sm"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-between p-2 border border-border rounded-lg">
              <div>
                <Label htmlFor="ongoing" className="text-xs">Ongoing Campaign</Label>
                <p className="text-[10px] text-muted-foreground">Run until manually paused</p>
              </div>
              <Switch
                id="ongoing"
                checked={data.isOngoing}
                onCheckedChange={(v) => setData({ ...data, isOngoing: v })}
              />
            </div>
          </div>
        )}

        {/* Step 4: Creatives */}
        {step === 4 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-base md:text-lg font-semibold mb-0.5">Creative Assets</h2>
              <p className="text-xs text-muted-foreground">Upload images/videos and generate ad copy</p>
            </div>

            {/* Creative Type Selection */}
            <div>
              <Label className="text-xs">Asset Type</Label>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {[
                  { type: "static" as CreativeType, label: "Static", icon: Image },
                  { type: "carousel" as CreativeType, label: "Carousel", icon: Images },
                  { type: "video" as CreativeType, label: "Video", icon: Video },
                ].map((item) => (
                  <Button
                    key={item.type}
                    variant={uploadType === item.type ? "default" : "outline"}
                    size="sm"
                    onClick={() => setUploadType(item.type)}
                    className="h-7 text-xs px-2"
                  >
                    <item.icon className="h-3 w-3 mr-1" />
                    {item.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Asset Upload */}
            <div>
              <Label className="text-xs">
                {uploadType === "carousel" ? "Carousel (up to 10)" : 
                 uploadType === "video" ? "Videos (up to 3)" : "Images (up to 3)"}
              </Label>
              <div className="mt-1.5 grid grid-cols-3 sm:grid-cols-4 gap-2">
                {data.assets.map((asset) => (
                  <div key={asset.id} className="relative aspect-video bg-muted rounded-lg overflow-hidden group">
                    {asset.type === "video" ? (
                      <div className="w-full h-full flex items-center justify-center bg-muted">
                        <Video className="h-6 w-6 text-muted-foreground" />
                      </div>
                    ) : (
                      <img src={asset.url} alt="Creative" className="w-full h-full object-cover" />
                    )}
                    <Badge className="absolute top-0.5 left-0.5 text-[9px] px-1" variant="secondary">
                      {asset.type}
                    </Badge>
                    <button
                      onClick={() => removeAsset(asset.id)}
                      className="absolute top-0.5 right-0.5 p-0.5 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={handleAssetUpload}
                  className="aspect-video border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center hover:border-primary/50 transition-colors"
                >
                  {getCreativeTypeIcon(uploadType)}
                  <span className="text-[10px] text-muted-foreground mt-0.5">Upload</span>
                </button>
              </div>
            </div>

            {data.assets.length > 0 && (
              <Button
                onClick={handleGenerateCopy}
                disabled={isLoading}
                variant="outline"
                size="sm"
                className="w-full h-8 text-xs"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-1.5 h-3 w-3" />
                    Generate Copy with AI
                  </>
                )}
              </Button>
            )}

            {data.generatedHeadlines.length > 0 && (
              <>
                <div>
                  <Label className="text-xs">Headline *</Label>
                  <RadioGroup
                    value={data.selectedHeadline}
                    onValueChange={(v) => setData({ ...data, selectedHeadline: v })}
                    className="mt-1.5 space-y-1.5"
                  >
                    {data.generatedHeadlines.map((h, i) => (
                      <label
                        key={i}
                        className={`flex items-start gap-2 p-2 border rounded-lg cursor-pointer transition-colors ${
                          data.selectedHeadline === h
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <RadioGroupItem value={h} className="mt-0.5" />
                        <span className="text-xs">{h}</span>
                      </label>
                    ))}
                  </RadioGroup>
                </div>

                <div>
                  <Label className="text-xs">Primary Text *</Label>
                  <RadioGroup
                    value={data.selectedPrimaryText}
                    onValueChange={(v) => setData({ ...data, selectedPrimaryText: v })}
                    className="mt-1.5 space-y-1.5"
                  >
                    {data.generatedPrimaryTexts.map((t, i) => (
                      <label
                        key={i}
                        className={`flex items-start gap-2 p-2 border rounded-lg cursor-pointer transition-colors ${
                          data.selectedPrimaryText === t
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <RadioGroupItem value={t} className="mt-0.5" />
                        <span className="text-xs">{t}</span>
                      </label>
                    ))}
                  </RadioGroup>
                </div>

                <div>
                  <Label className="text-xs">Call to Action *</Label>
                  <RadioGroup
                    value={data.selectedCta}
                    onValueChange={(v) => setData({ ...data, selectedCta: v })}
                    className="mt-1.5 grid grid-cols-3 gap-1.5"
                  >
                    {data.generatedCtas.map((cta, i) => (
                      <label
                        key={i}
                        className={`flex items-center justify-center p-2 border rounded-lg cursor-pointer transition-colors ${
                          data.selectedCta === cta
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <RadioGroupItem value={cta} className="sr-only" />
                        <span className="text-xs font-medium">{cta}</span>
                      </label>
                    ))}
                  </RadioGroup>
                </div>
              </>
            )}
          </div>
        )}

        {/* Step 5: Tracking & Form Fields */}
        {step === 5 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-base md:text-lg font-semibold mb-0.5">Tracking & Lead Form</h2>
              <p className="text-xs text-muted-foreground">UTM tracking and lead form configuration</p>
            </div>

            <div>
              <Label className="text-xs">UTM Template (Auto-generated)</Label>
              <div className="mt-1 p-2 bg-muted/50 rounded-lg font-mono text-[10px] overflow-x-auto">
                <code className="whitespace-pre-wrap break-all">
                  utm_source=meta&utm_medium=paid_social&utm_campaign={"{campaign_id}"}&utm_content={"{ad_id}"}
                </code>
              </div>
            </div>

            <div>
              <Label className="text-xs">Lead Form Fields</Label>
              <div className="mt-1.5 space-y-1">
                {userType === "broker" ? (
                  [
                    { field: "Full Name", required: true },
                    { field: "Email", required: true },
                    { field: "Phone", required: true },
                    { field: "Property Value", required: true },
                    { field: "Borrowing Amount", required: true },
                    { field: "Status", required: true },
                    { field: "Timeline", required: true },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-1.5 border rounded-lg">
                      <span className="text-xs">{item.field}</span>
                      <Badge variant={item.required ? "default" : "secondary"} className="text-[9px] px-1">
                        {item.required ? "Required" : "Optional"}
                      </Badge>
                    </div>
                  ))
                ) : (
                  [
                    { field: "Full Name", required: true },
                    { field: "Email", required: true },
                    { field: "Phone", required: true },
                    { field: "Budget Range", required: true },
                    { field: "Payment Method", required: true },
                    { field: "Status", required: true },
                    { field: "Timeline", required: true },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-1.5 border rounded-lg">
                      <span className="text-xs">{item.field}</span>
                      <Badge variant={item.required ? "default" : "secondary"} className="text-[9px] px-1">
                        {item.required ? "Required" : "Optional"}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div>
              <Label className="text-xs">Timeline Options</Label>
              <div className="mt-1 flex flex-wrap gap-1">
                {["Within 28 days", "0-3 mo", "3-6 mo", "6-9 mo", "9-12 mo", "12+ mo"].map((opt) => (
                  <Badge key={opt} variant="outline" className="text-[10px]">{opt}</Badge>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-xs">Conversion Events (Meta Pixel)</Label>
              <div className="mt-1 flex flex-wrap gap-1">
                <Badge variant="secondary" className="text-[10px]">Lead</Badge>
                <Badge variant="secondary" className="text-[10px]">ViewContent</Badge>
                <Badge variant="secondary" className="text-[10px]">SubmitForm</Badge>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row justify-between gap-2 mt-4 pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => step === 1 ? navigate(`/${userType}/campaigns`) : handleBack()}
            className="order-2 sm:order-1 h-8"
          >
            <ChevronLeft className="mr-1 h-3.5 w-3.5" />
            {step === 1 ? "Cancel" : "Back"}
          </Button>
          
          {step < 6 ? (
            <Button size="sm" onClick={handleNext} className="order-1 sm:order-2 h-8">
              Next
              <ChevronRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          ) : (
            <Button size="sm" onClick={handlePublish} disabled={isPublishing} className="order-1 sm:order-2 h-8">
              {isPublishing ? (
                <>
                  <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <Send className="mr-1 h-3.5 w-3.5" />
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
