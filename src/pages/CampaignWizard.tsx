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
  const selectedDevelopment = developments.find((d) => d.id === data.developmentId);
  
  // AI City Recommendations hook
  const { 
    recommendations: aiCityRecommendations, 
    isLoading: isLoadingCityRecs, 
    fetchRecommendations: fetchCityRecommendations 
  } = useAICityRecommendations();
  
  const [data, setData] = useState<WizardData>({
    roleType: userType,
    developmentId: "",
    campaignName: "",
    objective: userType === "broker" ? "leads" : userType === "agent" ? "valuations" : "leads",
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

  // Get objectives based on user type
  const getObjectives = () => {
    if (userType === "agent") {
      return [
        { value: "valuations", label: "Valuations", desc: "Get property valuations" },
        { value: "offers", label: "Offers", desc: "Receive property offers" },
        { value: "awareness", label: "Awareness", desc: "Build brand visibility" },
      ];
    } else if (userType === "broker") {
      return [
        { value: "leads", label: "Leads", desc: "Generate enquiries" },
        { value: "awareness", label: "Awareness", desc: "Build brand visibility" },
      ];
    }
    return [
      { value: "leads", label: "Leads", desc: "Generate enquiries" },
      { value: "viewings", label: "Viewings", desc: "Book property viewings" },
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
      <div className="mb-6 md:mb-8 overflow-x-auto pb-2">
        <div className="flex items-center justify-between min-w-[500px] max-w-4xl mx-auto px-2">
          {steps.map((s, index) => (
            <div key={s.num} className="flex items-center">
              <div
                className={`flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full border-2 transition-colors ${
                  step === s.num
                    ? "bg-primary border-primary text-primary-foreground"
                    : step > s.num
                    ? "bg-success border-success text-success-foreground"
                    : "border-border text-muted-foreground"
                }`}
              >
                {step > s.num ? <Check className="h-4 w-4 md:h-5 md:w-5" /> : <s.icon className="h-4 w-4 md:h-5 md:w-5" />}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-8 md:w-16 lg:w-20 h-0.5 mx-1 md:mx-2 ${
                    step > s.num ? "bg-success" : "bg-border"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between min-w-[500px] max-w-4xl mx-auto mt-2 px-2">
          {steps.map((s) => (
            <span
              key={s.num}
              className={`text-[10px] md:text-xs text-center w-12 md:w-16 ${step === s.num ? "text-primary font-medium" : "text-muted-foreground"}`}
            >
              {s.label}
            </span>
          ))}
        </div>
      </div>

      <Card className="max-w-4xl mx-auto p-4 md:p-6 shadow-card">
        {/* Step 1: Overview */}
        {step === 1 && (
          <div className="space-y-5 md:space-y-6">
            <div>
              <h2 className="text-lg md:text-xl font-semibold mb-1">Campaign Overview</h2>
              <p className="text-sm text-muted-foreground">Define your campaign basics</p>
            </div>

            <div>
              <Label>Role Type</Label>
              <div className="mt-2 p-3 bg-muted/50 rounded-lg">
                <Badge variant="secondary">{getRoleLabel(data.roleType)}</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Based on your account type</p>
            </div>

            {/* Developer: Development selection */}
            {userType === "developer" && (
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
            )}

            {/* Agent: Property Details & Focus Segment */}
            {userType === "agent" && (
              <>
                <div>
                  <Label htmlFor="propertyDetails">Property Details *</Label>
                  <Input
                    id="propertyDetails"
                    value={data.propertyDetails}
                    onChange={(e) => setData({ ...data, propertyDetails: e.target.value })}
                    placeholder="e.g., 3 Bed Semi-Detached, Kensington"
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Brief description of the property</p>
                </div>

                <div>
                  <Label>Focus Segment *</Label>
                  <Select
                    value={data.focusSegment}
                    onValueChange={(v) => setData({ ...data, focusSegment: v as AgentFocusSegment })}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select focus segment" />
                    </SelectTrigger>
                    <SelectContent>
                      {AGENT_FOCUS_SEGMENTS.map((segment) => (
                        <SelectItem key={segment.value} value={segment.value}>
                          {segment.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">The type of property listing</p>
                </div>
              </>
            )}

            {/* Broker: Product selection */}
            {userType === "broker" && (
              <div>
                <Label htmlFor="product">Product *</Label>
                <Select
                  value={data.product}
                  onValueChange={(v) => setData({ ...data, product: v as BrokerProduct })}
                >
                  <SelectTrigger id="product" className="mt-2">
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {BROKER_PRODUCTS.map((product) => (
                      <SelectItem key={product.value} value={product.value}>
                        {product.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">The financial product to promote</p>
              </div>
            )}

            <div>
              <Label htmlFor="campaignName">Campaign Name *</Label>
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
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">A descriptive name for this campaign</p>
            </div>

            <div>
              <Label>Objective *</Label>
              <RadioGroup
                value={data.objective}
                onValueChange={(v) => setData({ ...data, objective: v as CampaignObjective })}
                className={`mt-2 grid grid-cols-1 gap-3 md:gap-4 ${getObjectives().length === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-3'}`}
              >
                {getObjectives().map((obj) => (
                  <label
                    key={obj.value}
                    className={`flex flex-col items-center p-3 md:p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      data.objective === obj.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <RadioGroupItem value={obj.value} className="sr-only" />
                    <span className="font-medium text-sm md:text-base">{obj.label}</span>
                    <span className="text-xs text-muted-foreground">{obj.desc}</span>
                  </label>
                ))}
              </RadioGroup>
            </div>
          </div>
        )}

        {/* Step 2: Audience Targeting */}
        {step === 2 && (
          <div className="space-y-5 md:space-y-6">
            <div>
              <h2 className="text-lg md:text-xl font-semibold mb-1">Audience Targeting</h2>
              <p className="text-sm text-muted-foreground">Select target countries and cities for your campaign</p>
            </div>

            {/* AI City Recommendations */}
            <div className="bg-accent/10 border border-accent/30 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Wand2 className="h-5 w-5 text-accent" />
                  <h3 className="font-medium">AI-Powered City Recommendations</h3>
                </div>
                {isLoadingCityRecs && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing...
                  </div>
                )}
              </div>
              
              {aiCityRecommendations.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground">
                    Based on your {userType === "broker" ? "product" : userType === "agent" ? "property" : "development"}, 
                    we recommend targeting these cities:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {aiCityRecommendations.map((rec, idx) => (
                      <div 
                        key={idx} 
                        className={`flex items-start gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                          data.targetCities.includes(rec.cityCode)
                            ? "border-primary bg-primary/10"
                            : "border-border/50 hover:border-primary/50"
                        }`}
                        onClick={() => toggleCity(rec.cityCode)}
                      >
                        <Checkbox
                          checked={data.targetCities.includes(rec.cityCode)}
                          onCheckedChange={() => toggleCity(rec.cityCode)}
                          className="mt-0.5"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{rec.cityName}</span>
                            <Badge 
                              variant={rec.priority === "high" ? "default" : "secondary"} 
                              className="text-xs"
                            >
                              {rec.priority}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{rec.reason}</p>
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
                    className="w-full"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Add All Recommended Cities
                  </Button>
                </div>
              ) : !isLoadingCityRecs ? (
                <div className="space-y-2">
                  {aiRecommendations.filter(r => r.type === "targeting").map(rec => (
                    <div key={rec.id} className="flex items-start gap-2 text-sm">
                      <Sparkles className="h-4 w-4 text-accent mt-0.5" />
                      <div>
                        <span className="font-medium">{rec.title}:</span>{" "}
                        <span className="text-muted-foreground">{rec.description}</span>
                      </div>
                    </div>
                  ))}
                  <div className="flex items-start gap-2 text-sm">
                    <Sparkles className="h-4 w-4 text-accent mt-0.5" />
                    <div>
                      <span className="font-medium">Popular cities pre-selected:</span>{" "}
                      <span className="text-muted-foreground">London, Lagos, and Dubai show strong engagement.</span>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            <div>
              <Label>Target Countries *</Label>
              <p className="text-xs text-muted-foreground mb-3">Select one or more countries to target</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {TARGET_COUNTRIES.map((country) => (
                  <label
                    key={country.code}
                    className={`flex items-center gap-2 p-2 md:p-3 border rounded-lg cursor-pointer transition-colors text-sm ${
                      data.targetCountries.includes(country.code)
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <Checkbox
                      checked={data.targetCountries.includes(country.code)}
                      onCheckedChange={() => toggleCountry(country.code)}
                    />
                    <span className="truncate">{country.name}</span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {data.targetCountries.length} countries selected
              </p>
            </div>

            <div>
              <Label>Target Cities (Optional)</Label>
              <p className="text-xs text-muted-foreground mb-3">Narrow your targeting to specific cities</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {TARGET_CITIES.filter(city => data.targetCountries.includes(city.country)).map((city) => (
                  <label
                    key={city.code}
                    className={`flex items-center gap-2 p-2 md:p-3 border rounded-lg cursor-pointer transition-colors text-sm ${
                      data.targetCities.includes(city.code)
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <Checkbox
                      checked={data.targetCities.includes(city.code)}
                      onCheckedChange={() => toggleCity(city.code)}
                    />
                    <span className="truncate">{city.name}</span>
                  </label>
                ))}
              </div>
              {data.targetCities.length > 0 && (
                <p className="text-xs text-muted-foreground mt-2">
                  {data.targetCities.length} cities selected
                </p>
              )}
              {TARGET_CITIES.filter(city => data.targetCountries.includes(city.country)).length === 0 && (
                <p className="text-xs text-muted-foreground mt-2">
                  Select countries above to see available cities
                </p>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Budget & Dates */}
        {step === 3 && (
          <div className="space-y-5 md:space-y-6">
            <div>
              <h2 className="text-lg md:text-xl font-semibold mb-1">Budget & Schedule</h2>
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

            <div className="flex items-center justify-between p-3 md:p-4 border border-border rounded-lg">
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

        {/* Step 4: Creatives */}
        {step === 4 && (
          <div className="space-y-5 md:space-y-6">
            <div>
              <h2 className="text-lg md:text-xl font-semibold mb-1">Creative Assets</h2>
              <p className="text-sm text-muted-foreground">Upload images, carousels, or videos and generate ad copy</p>
            </div>

            {/* Creative Type Selection */}
            <div>
              <Label>Asset Type</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {[
                  { type: "static" as CreativeType, label: "Static Image", icon: Image },
                  { type: "carousel" as CreativeType, label: "Carousel", icon: Images },
                  { type: "video" as CreativeType, label: "Video", icon: Video },
                ].map((item) => (
                  <Button
                    key={item.type}
                    variant={uploadType === item.type ? "default" : "outline"}
                    size="sm"
                    onClick={() => setUploadType(item.type)}
                    className="flex items-center gap-2"
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Asset Upload */}
            <div>
              <Label>
                {uploadType === "carousel" ? "Carousel Images (up to 10)" : 
                 uploadType === "video" ? "Videos (up to 3)" : "Images (up to 3)"}
              </Label>
              <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {data.assets.map((asset) => (
                  <div key={asset.id} className="relative aspect-video bg-muted rounded-lg overflow-hidden group">
                    {asset.type === "video" ? (
                      <div className="w-full h-full flex items-center justify-center bg-muted">
                        <Video className="h-8 w-8 text-muted-foreground" />
                      </div>
                    ) : (
                      <img src={asset.url} alt="Creative" className="w-full h-full object-cover" />
                    )}
                    <Badge className="absolute top-1 left-1 text-xs" variant="secondary">
                      {asset.type}
                    </Badge>
                    <button
                      onClick={() => removeAsset(asset.id)}
                      className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={handleAssetUpload}
                  className="aspect-video border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center hover:border-primary/50 transition-colors"
                >
                  {getCreativeTypeIcon(uploadType)}
                  <span className="text-xs text-muted-foreground mt-1">Upload {uploadType}</span>
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {data.assets.length} assets uploaded
              </p>
            </div>

            {data.assets.length > 0 && (
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
                    Generate Copy with AI
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
                  <Label>Call to Action *</Label>
                  <RadioGroup
                    value={data.selectedCta}
                    onValueChange={(v) => setData({ ...data, selectedCta: v })}
                    className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2"
                  >
                    {data.generatedCtas.map((cta, i) => (
                      <label
                        key={i}
                        className={`flex items-center justify-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors ${
                          data.selectedCta === cta
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <RadioGroupItem value={cta} className="sr-only" />
                        <span className="text-sm font-medium">{cta}</span>
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
          <div className="space-y-5 md:space-y-6">
            <div>
              <h2 className="text-lg md:text-xl font-semibold mb-1">Tracking & Lead Form</h2>
              <p className="text-sm text-muted-foreground">Configure UTM tracking and lead form fields</p>
            </div>

            <div>
              <Label>UTM Template (Auto-generated)</Label>
              <div className="mt-2 p-3 md:p-4 bg-muted/50 rounded-lg font-mono text-xs md:text-sm overflow-x-auto">
                <code className="whitespace-pre-wrap break-all">
                  utm_source=meta&utm_medium=paid_social&utm_campaign={"{campaign_id}"}&utm_content={"{ad_id}"}
                </code>
              </div>
            </div>

            <div>
              <Label>Lead Form Fields</Label>
              <p className="text-xs text-muted-foreground mb-3">Questions collected from leads via Meta Instant Form</p>
              <div className="space-y-2">
                {userType === "broker" ? (
                  // Broker-specific lead form fields
                  [
                    { field: "Full Name", required: true },
                    { field: "Email Address", required: true },
                    { field: "Phone Number", required: true },
                    { field: "Property Value", required: true },
                    { field: "How much are you looking to borrow?", required: true },
                    { field: "Current Status (Browsing / Actively Looking)", required: true },
                    { field: "Timeline to Borrow", required: true },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-2 md:p-3 border rounded-lg">
                      <span className="text-sm">{item.field}</span>
                      <Badge variant={item.required ? "default" : "secondary"}>
                        {item.required ? "Required" : "Optional"}
                      </Badge>
                    </div>
                  ))
                ) : (
                  // Developer/Agent lead form fields
                  [
                    { field: "Full Name", required: true },
                    { field: "Email Address", required: true },
                    { field: "Phone Number", required: true },
                    { field: "Budget Range", required: true },
                    { field: "Payment Method (Cash / Mortgage)", required: true },
                    { field: "Current Status (Browsing / Actively Looking)", required: true },
                    { field: "Timeline to Purchase", required: true },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-2 md:p-3 border rounded-lg">
                      <span className="text-sm">{item.field}</span>
                      <Badge variant={item.required ? "default" : "secondary"}>
                        {item.required ? "Required" : "Optional"}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div>
              <Label>Timeline Options</Label>
              <p className="text-xs text-muted-foreground mb-2">
                Options shown to leads for {userType === "broker" ? "borrowing" : "purchase"} timeline
              </p>
              <div className="flex flex-wrap gap-2">
                {["Within 28 days", "0-3 months", "3-6 months", "6-9 months", "9-12 months", "12+ months"].map((opt) => (
                  <Badge key={opt} variant="outline">{opt}</Badge>
                ))}
              </div>
            </div>

            <div>
              <Label>Conversion Events (Meta Pixel)</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge variant="secondary">Lead</Badge>
                <Badge variant="secondary">ViewContent</Badge>
                <Badge variant="secondary">SubmitForm</Badge>
              </div>
            </div>
          </div>
        )}

        {/* Step 6: Review & Publish */}
        {step === 6 && (
          <div className="space-y-5 md:space-y-6">
            <div>
              <h2 className="text-lg md:text-xl font-semibold mb-1">Review & Publish</h2>
              <p className="text-sm text-muted-foreground">Review your campaign before publishing to Meta</p>
            </div>

            <div className="grid gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 md:p-4 bg-muted/50 rounded-lg">
                  <div className="text-sm text-muted-foreground">Campaign Name</div>
                  <div className="font-medium">{data.campaignName}</div>
                </div>
                <div className="p-3 md:p-4 bg-muted/50 rounded-lg">
                  <div className="text-sm text-muted-foreground">Objective</div>
                  <div className="font-medium capitalize">{data.objective}</div>
                </div>
                <div className="p-3 md:p-4 bg-muted/50 rounded-lg">
                  <div className="text-sm text-muted-foreground">
                    {userType === "developer" ? "Development" : userType === "agent" ? "Property Details" : "Product"}
                  </div>
                  <div className="font-medium">
                    {userType === "developer" 
                      ? selectedDevelopment?.name 
                      : userType === "agent" 
                      ? data.propertyDetails 
                      : BROKER_PRODUCTS.find(p => p.value === data.product)?.label}
                  </div>
                </div>
                {userType === "agent" && (
                  <div className="p-3 md:p-4 bg-muted/50 rounded-lg">
                    <div className="text-sm text-muted-foreground">Focus Segment</div>
                    <div className="font-medium">
                      {AGENT_FOCUS_SEGMENTS.find(s => s.value === data.focusSegment)?.label}
                    </div>
                  </div>
                )}
                <div className="p-3 md:p-4 bg-muted/50 rounded-lg">
                  <div className="text-sm text-muted-foreground">Budget</div>
                  <div className="font-medium">£{data.budget.toLocaleString()}</div>
                </div>
                <div className="p-3 md:p-4 bg-muted/50 rounded-lg">
                  <div className="text-sm text-muted-foreground">Target Countries</div>
                  <div className="font-medium">{data.targetCountries.length} countries{data.targetCities.length > 0 && `, ${data.targetCities.length} cities`}</div>
                </div>
                <div className="p-3 md:p-4 bg-muted/50 rounded-lg">
                  <div className="text-sm text-muted-foreground">Schedule</div>
                  <div className="font-medium">
                    {data.startDate} {data.isOngoing ? "(Ongoing)" : `- ${data.endDate}`}
                  </div>
                </div>
              </div>

              <div className="p-3 md:p-4 bg-muted/50 rounded-lg">
                <div className="text-sm text-muted-foreground mb-2">Creative Assets</div>
                <div className="flex flex-wrap gap-2">
                  {data.assets.map((asset) => (
                    <Badge key={asset.id} variant="outline">
                      {asset.type}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="p-3 md:p-4 bg-muted/50 rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Selected Headline</div>
                <div className="font-medium text-sm">{data.selectedHeadline}</div>
              </div>

              <div className="p-3 md:p-4 bg-accent/10 border border-accent/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="h-4 w-4 text-accent" />
                  <span className="text-sm font-medium">Predicted CPL</span>
                </div>
                <div className="text-xl md:text-2xl font-bold">£12 - £18</div>
                <p className="text-xs text-muted-foreground mt-1">Based on similar campaigns</p>
              </div>

              <div className="flex items-center gap-2 p-3 border rounded-lg">
                <Badge>Meta</Badge>
                <span className="text-sm text-muted-foreground">Publishing to Meta Ads Manager</span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row justify-between gap-3 mt-6 md:mt-8 pt-6 border-t">
          <Button
            variant="outline"
            onClick={() => step === 1 ? navigate(`/${userType}/campaigns`) : handleBack()}
            className="order-2 sm:order-1"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            {step === 1 ? "Cancel" : "Back"}
          </Button>
          
          {step < 6 ? (
            <Button onClick={handleNext} className="order-1 sm:order-2">
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handlePublish} disabled={isPublishing} className="order-1 sm:order-2">
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
