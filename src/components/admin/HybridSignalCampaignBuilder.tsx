import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  MapPin, 
  Globe, 
  DollarSign, 
  Image, 
  Eye,
  Sparkles,
  AlertCircle,
  Link2,
  MousePointerClick,
  FileText,
  BarChart3,
  Wand2,
  Lightbulb,
  Copy,
  RefreshCw,
  Upload,
  X,
  Play,
  ImageIcon,
  Film,
  Users,
  Target,
  Zap,
  TrendingUp,
  Shield,
  Brain,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Info,
  Facebook,
  Instagram
} from "lucide-react";
import CampaignAdPreview from "./CampaignAdPreview";
import {
  REGIONS,
  COUNTRIES,
  CITIES,
  CAMPAIGN_OBJECTIVES,
  CAMPAIGN_PHASES,
  CORE_INTEREST_CATEGORIES,
  CONTENT_TYPES,
  MESSAGING_ANGLES,
  generateCampaignName,
} from "@/lib/metaCampaignData";
import {
  INTEREST_CLUSTERS,
  EXCLUSION_LIST,
  RETARGETING_RULES,
  DEVICE_CONFIGS,
  MOCK_ATTRIBUTION_INSIGHTS,
  MOCK_CREATIVE_PERFORMANCE,
  MOCK_HEADLINE_PERFORMANCE,
  MOCK_PROPERTY_UNITS,
  getAudienceMaturity,
  generateHybridUTMs,
  buildUTMString,
  findReplacementPlot,
  type AudienceMaturity,
  type InterestCluster,
  type AttributionInsight,
  type UTMSchema,
} from "@/lib/hybridSignalData";

interface HybridSignalCampaignBuilderProps {
  onCampaignCreated?: (campaign: any) => void;
  onClose?: () => void;
  userType?: "developer" | "agent" | "broker";
}

interface CreativeAsset {
  id: string;
  file: File;
  preview: string;
  type: "image" | "video";
  name: string;
}

const STEPS = [
  { id: 1, title: "Audience Strategy", icon: Users },
  { id: 2, title: "Targeting", icon: Target },
  { id: 3, title: "Budget", icon: DollarSign },
  { id: 4, title: "Content", icon: Image },
  { id: 5, title: "Landing & UTM", icon: Link2 },
  { id: 6, title: "Tracking", icon: BarChart3 },
  { id: 7, title: "Review", icon: Eye },
];

const CTA_OPTIONS = [
  { id: "learn_more", label: "Learn More", description: "General interest" },
  { id: "book_viewing", label: "Book Viewing", description: "Property viewings" },
  { id: "get_quote", label: "Get Quote", description: "Pricing enquiries" },
  { id: "download_brochure", label: "Download Brochure", description: "Lead capture" },
  { id: "contact_us", label: "Contact Us", description: "Direct enquiries" },
  { id: "register_interest", label: "Register Interest", description: "Waiting lists" },
  { id: "whatsapp", label: "WhatsApp", description: "Direct messaging" },
  { id: "call_now", label: "Call Now", description: "Phone enquiries" },
];

const CONVERSION_EVENTS = [
  { id: "Lead", label: "Lead", description: "Primary conversion event" },
  { id: "ViewContent", label: "ViewContent", description: "Page view tracking" },
  { id: "SubmitForm", label: "SubmitForm", description: "Form submissions" },
  { id: "InitiateCheckout", label: "InitiateCheckout", description: "High intent action" },
  { id: "CompleteRegistration", label: "CompleteRegistration", description: "Sign up complete" },
];

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ACCEPTED_VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/webm"];
const MAX_FILE_SIZE = 50 * 1024 * 1024;

const HybridSignalCampaignBuilder = ({ onCampaignCreated, onClose, userType = "developer" }: HybridSignalCampaignBuilderProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Step 1: Audience Strategy (NEW)
  const [developmentName, setDevelopmentName] = useState("");
  const [objective, setObjective] = useState<string>("leads");
  const [phase, setPhase] = useState<string>("testing");
  const [selectedInterestClusters, setSelectedInterestClusters] = useState<string[]>([]);
  const [audienceMaturityData, setAudienceMaturityData] = useState(getAudienceMaturity(45, 78));
  const [enableDPA, setEnableDPA] = useState(false);
  const [enableLookalikes, setEnableLookalikes] = useState(false);
  
  // Step 2: Targeting
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(["finance", "property_investing"]);
  const [applyExclusionList, setApplyExclusionList] = useState(true);
  
  // Step 3: Budget
  const [budget, setBudget] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState("");
  const [whatsappEnabled, setWhatsappEnabled] = useState(true);
  
  // Step 4: Landing Page & UTM (ENHANCED)
  const [landingPageUrl, setLandingPageUrl] = useState("");
  const [selectedCTAs, setSelectedCTAs] = useState<string[]>(["learn_more"]);
  const [leadFormFields, setLeadFormFields] = useState<string[]>(["name", "email", "phone"]);
  const [deviceOptimisation, setDeviceOptimisation] = useState(true);
  const [utmPreview, setUtmPreview] = useState<UTMSchema | null>(null);
  
  // Step 5: Content
  const [selectedContentTypes, setSelectedContentTypes] = useState<string[]>(["static", "carousel"]);
  const [selectedMessagingAngles, setSelectedMessagingAngles] = useState<string[]>(["investment"]);
  const [adCopies, setAdCopies] = useState<string[]>(["", "", ""]);
  const [isGeneratingCopy, setIsGeneratingCopy] = useState(false);
  const [creativeAssets, setCreativeAssets] = useState<CreativeAsset[]>([]);
  
  // Step 6: Tracking
  const [pixelId, setPixelId] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<string[]>(["Lead", "ViewContent", "SubmitForm"]);
  
  // Attribution Insights (NEW)
  const [showInsightCard, setShowInsightCard] = useState(true);
  const [activeInsight, setActiveInsight] = useState<AttributionInsight>(MOCK_ATTRIBUTION_INSIGHTS[0]);
  
  // Preview
  const [previewPlatform, setPreviewPlatform] = useState<"facebook" | "instagram">("facebook");

  const isAfricaSelected = selectedRegions.includes("africa");

  // Generate UTM preview when landing page changes
  useEffect(() => {
    if (landingPageUrl && developmentName) {
      const utms = generateHybridUTMs(
        `camp_${developmentName.replace(/\s+/g, "_").toLowerCase()}`,
        "creative_001",
        "headline_001",
        selectedInterestClusters[0] || "interest_default",
        "mobile",
        "feed",
        selectedContentTypes[0] || "static"
      );
      setUtmPreview(utms);
    }
  }, [landingPageUrl, developmentName, selectedInterestClusters, selectedContentTypes]);

  // Update audience maturity recommendations based on data
  useEffect(() => {
    // Simulate different maturity states for demo
    const verifiedLeads = Math.floor(Math.random() * 400);
    const areaLeads = Math.floor(Math.random() * 200);
    setAudienceMaturityData(getAudienceMaturity(verifiedLeads, areaLeads));
  }, [developmentName]);

  // File upload handlers
  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    
    const newAssets: CreativeAsset[] = [];
    
    Array.from(files).forEach(file => {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} exceeds 50MB limit`);
        return;
      }
      
      const isImage = ACCEPTED_IMAGE_TYPES.includes(file.type);
      const isVideo = ACCEPTED_VIDEO_TYPES.includes(file.type);
      
      if (!isImage && !isVideo) {
        toast.error(`${file.name} is not a supported format`);
        return;
      }
      
      const preview = URL.createObjectURL(file);
      newAssets.push({
        id: `asset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        preview,
        type: isImage ? "image" : "video",
        name: file.name
      });
    });
    
    if (newAssets.length > 0) {
      setCreativeAssets(prev => [...prev, ...newAssets]);
      toast.success(`${newAssets.length} file(s) added`);
    }
  };

  const removeAsset = (assetId: string) => {
    setCreativeAssets(prev => {
      const asset = prev.find(a => a.id === assetId);
      if (asset) {
        URL.revokeObjectURL(asset.preview);
      }
      return prev.filter(a => a.id !== assetId);
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const toggleRegion = (regionId: string) => {
    const region = REGIONS.find(r => r.id === regionId);
    if (!region) return;

    if (selectedRegions.includes(regionId)) {
      setSelectedRegions(prev => prev.filter(r => r !== regionId));
      setSelectedCountries(prev => prev.filter(c => !region.countries.includes(c)));
      setSelectedCities(prev => {
        const countryCodes = region.countries;
        return prev.filter(city => {
          const cityData = CITIES.find(c => c.name === city);
          return cityData && !countryCodes.includes(cityData.countryCode);
        });
      });
    } else {
      setSelectedRegions(prev => [...prev, regionId]);
      setSelectedCountries(prev => [...prev, ...region.countries]);
      const popularCities = CITIES.filter(
        c => region.countries.includes(c.countryCode) && c.popular
      ).map(c => c.name);
      setSelectedCities(prev => [...new Set([...prev, ...popularCities])]);
    }

    if (regionId === "africa" && !selectedRegions.includes("africa")) {
      setSelectedInterests(prev => prev.filter(i => i !== "advantage_plus"));
    }
  };

  const toggleCountry = (countryCode: string) => {
    if (selectedCountries.includes(countryCode)) {
      setSelectedCountries(prev => prev.filter(c => c !== countryCode));
      setSelectedCities(prev => {
        return prev.filter(city => {
          const cityData = CITIES.find(c => c.name === city);
          return cityData && cityData.countryCode !== countryCode;
        });
      });
    } else {
      setSelectedCountries(prev => [...prev, countryCode]);
      const popularCities = CITIES.filter(
        c => c.countryCode === countryCode && c.popular
      ).map(c => c.name);
      setSelectedCities(prev => [...new Set([...prev, ...popularCities])]);
    }
  };

  const toggleCity = (cityName: string) => {
    setSelectedCities(prev =>
      prev.includes(cityName) ? prev.filter(c => c !== cityName) : [...prev, cityName]
    );
  };

  const toggleInterest = (interestId: string) => {
    if (interestId === "advantage_plus" && isAfricaSelected) {
      toast.error("Advantage+ Audience is not available for Africa campaigns");
      return;
    }
    setSelectedInterests(prev =>
      prev.includes(interestId) ? prev.filter(i => i !== interestId) : [...prev, interestId]
    );
  };

  const toggleInterestCluster = (clusterId: string) => {
    setSelectedInterestClusters(prev =>
      prev.includes(clusterId) ? prev.filter(c => c !== clusterId) : [...prev, clusterId]
    );
  };

  const toggleContentType = (typeId: string) => {
    setSelectedContentTypes(prev =>
      prev.includes(typeId) ? prev.filter(t => t !== typeId) : [...prev, typeId]
    );
  };

  const toggleMessagingAngle = (angleId: string) => {
    setSelectedMessagingAngles(prev =>
      prev.includes(angleId) ? prev.filter(a => a !== angleId) : [...prev, angleId]
    );
  };

  const toggleCTA = (ctaId: string) => {
    setSelectedCTAs(prev =>
      prev.includes(ctaId) ? prev.filter(c => c !== ctaId) : [...prev, ctaId]
    );
  };

  const toggleEvent = (eventId: string) => {
    setSelectedEvents(prev =>
      prev.includes(eventId) ? prev.filter(e => e !== eventId) : [...prev, eventId]
    );
  };

  const updateCopy = (index: number, value: string) => {
    const newCopies = [...adCopies];
    newCopies[index] = value;
    setAdCopies(newCopies);
  };

  const generateAICopy = async () => {
    setIsGeneratingCopy(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const angles = selectedMessagingAngles.map(a => 
      MESSAGING_ANGLES.find(ma => ma.id === a)?.group
    ).filter(Boolean);
    
    const cluster = INTEREST_CLUSTERS.find(c => selectedInterestClusters.includes(c.id));
    const clusterName = cluster?.name || "property buyers";
    
    const generatedCopies = [
      `Discover ${developmentName || "luxury living"} – Perfect for ${clusterName}. ${angles.includes("Investment Focus") ? "Projected yields of 8-12% annually." : "Register today for exclusive pricing."}`,
      `Your dream property awaits at ${developmentName || "our exclusive development"}. ${angles.includes("Downsizers & Family") ? "Secure, gated community with world-class amenities." : "Limited units available – enquire now."}`,
      `Invest in ${developmentName || "London's finest"} real estate. ${angles.includes("Holiday Home & Parents") ? "Ideal as a holiday retreat or savvy investment." : "Speak to our team for exclusive pricing."}`,
    ];
    
    setAdCopies(generatedCopies);
    setIsGeneratingCopy(false);
    toast.success("AI-generated copy ready!");
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return developmentName.trim() !== "" && selectedInterestClusters.length > 0;
      case 2:
        return selectedRegions.length > 0 && selectedCountries.length > 0;
      case 3:
        return budget !== "" && parseFloat(budget) > 0 && startDate !== "";
      case 4:
        return selectedContentTypes.length > 0 && selectedMessagingAngles.length > 0;
      case 5:
        return selectedCTAs.length > 0;
      case 6:
        return selectedEvents.length > 0;
      case 7:
        return true;
      default:
        return false;
    }
  };

  const campaignName = generateCampaignName(
    developmentName || "Development",
    selectedRegions.map(r => REGIONS.find(reg => reg.id === r)?.name || r).join(", "),
    objective,
    phase
  );

  const handleSubmit = () => {
    const utms = utmPreview || generateHybridUTMs(
      `camp_${developmentName.replace(/\s+/g, "_").toLowerCase()}`,
      "creative_001",
      "headline_001",
      selectedInterestClusters[0] || "interest_default"
    );

    const campaign = {
      id: `mc-${Date.now()}`,
      developmentName,
      name: campaignName,
      objective,
      phase,
      audienceStrategy: {
        maturity: audienceMaturityData.stage,
        clusters: selectedInterestClusters,
        enableDPA,
        enableLookalikes,
        exclusionListApplied: applyExclusionList,
      },
      regions: selectedRegions,
      countries: selectedCountries,
      cities: selectedCities,
      interests: selectedInterests,
      budget: parseFloat(budget),
      budgetType: "lifetime",
      startDate,
      endDate: endDate || undefined,
      whatsappEnabled,
      landingPageUrl,
      ctas: selectedCTAs,
      leadFormFields,
      deviceOptimisation,
      contentTypes: selectedContentTypes,
      messagingAngles: selectedMessagingAngles,
      adCopies: adCopies.filter(c => c.trim() !== ""),
      creativeAssets: creativeAssets.map(a => ({
        name: a.name,
        type: a.type,
        preview: a.preview
      })),
      pixelId,
      conversionEvents: selectedEvents,
      utmSchema: utms,
      status: "draft",
      createdAt: new Date().toISOString(),
      metrics: {
        spend: 0,
        leads: 0,
        cpl: 0,
        cpc: 0,
        ctr: 0,
        cpm: 0,
        impressions: 0,
        clicks: 0,
        landingPageViews: 0,
        highIntentLeads: 0,
      },
      adsets: [],
    };

    onCampaignCreated?.(campaign);
    toast.success("Campaign created with Hybrid Signal Engine!");
    onClose?.();
  };

  const availableCities = CITIES.filter(city => selectedCountries.includes(city.countryCode));

  // Maturity Badge Component
  const MaturityBadge = ({ stage }: { stage: AudienceMaturity }) => {
    const config = {
      cold: { color: "bg-blue-500/20 text-blue-400 border-blue-500/30", icon: Target, label: "Smart Cold-Start" },
      warm: { color: "bg-amber-500/20 text-amber-400 border-amber-500/30", icon: Zap, label: "Inventory-Aware Retargeting" },
      verified: { color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", icon: TrendingUp, label: "Verified Lookalikes" },
    };
    const { color, icon: Icon, label } = config[stage];
    
    return (
      <Badge className={`${color} border px-3 py-1 flex items-center gap-1.5`}>
        <Icon className="h-3.5 w-3.5" />
        {label}
      </Badge>
    );
  };

  // Attribution Insight Card Component
  const InsightCard = ({ insight }: { insight: AttributionInsight }) => (
    <Card className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-primary/20 rounded-lg">
          <Brain className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-primary">🧐 {insight.title}</span>
            <Badge variant={insight.impact === "high" ? "destructive" : "secondary"} className="text-[10px]">
              {insight.impact} impact
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mb-2 italic">"{insight.finding}"</p>
          <p className="text-xs font-medium mb-3">
            <strong>Recommendation:</strong> {insight.recommendation}
          </p>
          {insight.budgetShiftSuggestion && (
            <div className="flex items-center gap-2">
              <Button size="sm" variant="default" className="h-7 text-xs">
                <CheckCircle2 className="h-3 w-3 mr-1" /> Yes, Apply
              </Button>
              <Button size="sm" variant="outline" className="h-7 text-xs">
                <XCircle className="h-3 w-3 mr-1" /> No
              </Button>
            </div>
          )}
        </div>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setShowInsightCard(false)}>
          <X className="h-3 w-3" />
        </Button>
      </div>
    </Card>
  );

  return (
    <div className="flex flex-col h-full max-h-[85vh]">
      {/* Header with Attribution Insight */}
      {showInsightCard && currentStep === 7 && (
        <div className="mb-3">
          <InsightCard insight={activeInsight} />
        </div>
      )}

      {/* Step Indicator */}
      <div className="flex-shrink-0 border-b border-border pb-3 mb-3">
        <div className="flex items-center justify-between overflow-x-auto gap-0.5 sm:gap-1 pb-1">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center flex-shrink-0">
              <button
                onClick={() => step.id < currentStep && setCurrentStep(step.id)}
                className={`flex items-center gap-1 px-1.5 sm:px-2 py-1.5 rounded-md transition-colors ${
                  currentStep === step.id
                    ? "bg-primary text-primary-foreground"
                    : currentStep > step.id
                    ? "bg-primary/20 text-primary cursor-pointer hover:bg-primary/30"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <step.icon className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-[10px] sm:text-xs font-medium hidden md:inline">{step.title}</span>
              </button>
              {index < STEPS.length - 1 && (
                <ChevronRight className="h-3 w-3 text-muted-foreground mx-0.5 flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 overflow-y-auto px-1">
        {/* Step 1: Audience Strategy (NEW HYBRID SIGNAL STEP) */}
        {currentStep === 1 && (
          <div className="space-y-4">
            {/* Audience Maturity Status */}
            <Card className="p-4 bg-gradient-to-br from-background to-muted/30 border-2">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-sm flex items-center gap-2">
                    <Brain className="h-4 w-4 text-primary" />
                    Audience Maturity Engine
                  </h4>
                  <p className="text-xs text-muted-foreground">Automatically selects best strategy based on your data</p>
                </div>
                <MaturityBadge stage={audienceMaturityData.stage} />
              </div>
              
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="p-2 bg-muted/50 rounded-lg">
                  <p className="text-[10px] text-muted-foreground uppercase">Verified Leads</p>
                  <p className="text-lg font-bold">{audienceMaturityData.verifiedLeadCount}</p>
                  <Progress value={(audienceMaturityData.verifiedLeadCount / 300) * 100} className="h-1 mt-1" />
                  <p className="text-[10px] text-muted-foreground">Target: 300 for Lookalikes</p>
                </div>
                <div className="p-2 bg-muted/50 rounded-lg">
                  <p className="text-[10px] text-muted-foreground uppercase">Area Leads</p>
                  <p className="text-lg font-bold">{audienceMaturityData.warmLeadCount}</p>
                  <Progress value={(audienceMaturityData.warmLeadCount / 100) * 100} className="h-1 mt-1" />
                  <p className="text-[10px] text-muted-foreground">Target: 100 for Retargeting</p>
                </div>
              </div>

              <div className="space-y-1.5">
                {audienceMaturityData.recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    <Sparkles className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{rec}</span>
                  </div>
                ))}
              </div>
            </Card>

            <div>
              <Label htmlFor="development">Development / Property Name *</Label>
              <Input
                id="development"
                placeholder="e.g., Riverside Towers"
                value={developmentName}
                onChange={(e) => setDevelopmentName(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label className="mb-2 block">Campaign Objective *</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {CAMPAIGN_OBJECTIVES.map((obj) => (
                  <Card
                    key={obj.id}
                    className={`p-3 cursor-pointer transition-all ${
                      objective === obj.id
                        ? "border-primary bg-primary/5 ring-2 ring-primary"
                        : "hover:border-primary/50"
                    }`}
                    onClick={() => setObjective(obj.id)}
                  >
                    <div className="flex items-center gap-2">
                      {objective === obj.id && <Check className="h-4 w-4 text-primary" />}
                      <span className="font-medium text-sm">{obj.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{obj.description}</p>
                  </Card>
                ))}
              </div>
            </div>

            {/* Interest Clusters Selection */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="block">Smart Audience Clusters *</Label>
                <Badge variant="outline" className="text-[10px]">
                  <Lightbulb className="h-3 w-3 mr-1" />
                  Based on Global Naybourhood Data
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Select buyer personas – we'll auto-select proven interests for each
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                {INTEREST_CLUSTERS.map((cluster) => (
                  <Card
                    key={cluster.id}
                    className={`p-3 cursor-pointer transition-all ${
                      selectedInterestClusters.includes(cluster.id)
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "hover:border-primary/50"
                    }`}
                    onClick={() => toggleInterestCluster(cluster.id)}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{cluster.icon}</span>
                      <span className="font-medium text-xs">{cluster.name}</span>
                      {selectedInterestClusters.includes(cluster.id) && (
                        <Check className="h-3 w-3 text-primary ml-auto" />
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground mb-2">{cluster.description}</p>
                    <div className="flex items-center gap-2 text-[10px]">
                      <Badge variant="secondary" className="px-1.5 py-0">
                        Avg CPL: £{cluster.avgCPL}
                      </Badge>
                      <Badge variant="secondary" className="px-1.5 py-0">
                        Conv: {cluster.conversionRate}%
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Anti-Tire-Kicker Guard */}
            <Card className="p-3 bg-destructive/5 border-destructive/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-destructive" />
                  <div>
                    <Label className="text-sm font-medium">Anti-Tire-Kicker Guard</Label>
                    <p className="text-[10px] text-muted-foreground">
                      Auto-excludes {EXCLUSION_LIST.interests.length + EXCLUSION_LIST.behaviours.length} low-quality signals
                    </p>
                  </div>
                </div>
                <Switch
                  checked={applyExclusionList}
                  onCheckedChange={setApplyExclusionList}
                />
              </div>
            </Card>

            {/* Stage-specific options */}
            {audienceMaturityData.stage === "warm" && (
              <Card className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium text-sm">Enable Dynamic Product Ads</Label>
                    <p className="text-xs text-muted-foreground">Retarget viewers with specific plots they viewed</p>
                  </div>
                  <Switch checked={enableDPA} onCheckedChange={setEnableDPA} />
                </div>
              </Card>
            )}

            {audienceMaturityData.stage === "verified" && (
              <Card className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium text-sm">Enable Value-Based Lookalikes</Label>
                    <p className="text-xs text-muted-foreground">Create lookalikes from your verified buyers</p>
                  </div>
                  <Switch checked={enableLookalikes} onCheckedChange={setEnableLookalikes} />
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Step 2: Geographic & Interest Targeting */}
        {currentStep === 2 && (
          <div className="space-y-4">
            {/* Selected Cluster Interests Preview */}
            {selectedInterestClusters.length > 0 && (
              <Card className="p-3 bg-primary/5 border-primary/20">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-primary">Auto-Selected Interests</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {selectedInterestClusters.flatMap(clusterId => {
                    const cluster = INTEREST_CLUSTERS.find(c => c.id === clusterId);
                    return cluster?.suggestedInterests.slice(0, 5) || [];
                  }).slice(0, 12).map((interest, i) => (
                    <Badge key={i} variant="secondary" className="text-[10px]">
                      {interest}
                    </Badge>
                  ))}
                  <Badge variant="outline" className="text-[10px]">+more</Badge>
                </div>
              </Card>
            )}

            <div>
              <h3 className="text-base sm:text-lg font-semibold mb-3">Geographic Targeting</h3>
              
              <div className="mb-4">
                <Label className="mb-2 block">Select Regions *</Label>
                <div className="flex flex-wrap gap-1.5">
                  {REGIONS.map((region) => (
                    <Badge
                      key={region.id}
                      variant={selectedRegions.includes(region.id) ? "default" : "outline"}
                      className={`cursor-pointer px-2 py-1 text-xs ${
                        selectedRegions.includes(region.id) ? "" : "hover:bg-primary/10"
                      }`}
                      onClick={() => toggleRegion(region.id)}
                    >
                      {region.name}
                      {selectedRegions.includes(region.id) && <Check className="h-3 w-3 ml-1" />}
                    </Badge>
                  ))}
                </div>
              </div>

              {selectedRegions.length > 0 && (
                <div className="mb-4">
                  <Label className="mb-2 block">Select Countries</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-36 overflow-y-auto p-2 border rounded-lg">
                    {COUNTRIES.filter(c => selectedRegions.includes(c.region)).map((country) => (
                      <div key={country.code} className="flex items-center gap-1.5">
                        <Checkbox
                          id={country.code}
                          checked={selectedCountries.includes(country.code)}
                          onCheckedChange={() => toggleCountry(country.code)}
                          className="h-3.5 w-3.5"
                        />
                        <Label htmlFor={country.code} className="text-xs cursor-pointer">
                          {country.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {availableCities.length > 0 && (
                <div className="mb-4">
                  <Label className="mb-2 block">Select Cities</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-36 overflow-y-auto p-2 border rounded-lg">
                    {availableCities.map((city) => (
                      <div key={city.name} className="flex items-center gap-1.5">
                        <Checkbox
                          id={city.name}
                          checked={selectedCities.includes(city.name)}
                          onCheckedChange={() => toggleCity(city.name)}
                          className="h-3.5 w-3.5"
                        />
                        <Label htmlFor={city.name} className="text-xs cursor-pointer flex items-center gap-1">
                          {city.name}
                          {city.popular && <MapPin className="h-2.5 w-2.5 text-primary" />}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {isAfricaSelected && (
              <Card className="p-2 bg-warning/10 border-warning/30">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-warning" />
                  <span className="text-xs">Africa: Instagram only, iOS devices, no Advantage+</span>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Step 3: Budget */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <h3 className="text-base sm:text-lg font-semibold mb-3">Budget & Schedule</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="budget">Lifetime Budget (£) *</Label>
                <Input
                  id="budget"
                  type="number"
                  placeholder="5000"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="endDate">End Date (Optional)</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            <Card className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium text-sm">WhatsApp Add-On</Label>
                  <p className="text-xs text-muted-foreground">Enable WhatsApp messaging</p>
                </div>
                <Switch checked={whatsappEnabled} onCheckedChange={setWhatsappEnabled} />
              </div>
            </Card>

            {phase === "testing" && (
              <Card className="p-3 bg-muted/50">
                <h4 className="font-medium text-sm mb-2">Testing Phase Guidelines</h4>
                <ul className="text-xs text-muted-foreground space-y-0.5">
                  <li>• 10-day evaluation window</li>
                  <li>• CPC target: &lt; £1.50</li>
                  <li>• CTR target: &gt; 2%</li>
                  <li>• 60-70% leads should be high-intent</li>
                </ul>
              </Card>
            )}
          </div>
        )}

        {/* Step 4: Content */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-base sm:text-lg font-semibold mb-3">Content Types</h3>
              <div className="grid grid-cols-2 gap-2">
                {CONTENT_TYPES.map((type) => (
                  <Card
                    key={type.id}
                    className={`p-2.5 cursor-pointer transition-all ${
                      selectedContentTypes.includes(type.id)
                        ? "border-primary bg-primary/5"
                        : "hover:border-primary/50"
                    }`}
                    onClick={() => toggleContentType(type.id)}
                  >
                    <div className="flex items-center gap-1.5">
                      <Checkbox checked={selectedContentTypes.includes(type.id)} className="h-3.5 w-3.5" />
                      <span className="font-medium text-xs">{type.name}</span>
                      {type.required && (
                        <Badge variant="secondary" className="text-[10px] px-1 py-0">Req</Badge>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Creative Upload */}
            <div>
              <Label className="mb-2 block">Creative Assets</Label>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                  isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                }`}
              >
                <Upload className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                <p className="text-xs text-muted-foreground mb-2">
                  Drag & drop or click to upload
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs h-7"
                >
                  Select Files
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept={[...ACCEPTED_IMAGE_TYPES, ...ACCEPTED_VIDEO_TYPES].join(",")}
                  className="hidden"
                  onChange={(e) => handleFileSelect(e.target.files)}
                />
              </div>
              
              {creativeAssets.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {creativeAssets.map((asset) => (
                    <div key={asset.id} className="relative group">
                      <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                        {asset.type === "image" ? (
                          <img src={asset.preview} alt={asset.name} className="w-full h-full object-cover" />
                        ) : (
                          <video src={asset.preview} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <Badge className="absolute top-1 left-1 text-[10px] px-1">
                        {asset.type === "image" ? <ImageIcon className="h-2.5 w-2.5" /> : <Film className="h-2.5 w-2.5" />}
                      </Badge>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="absolute top-1 right-1 h-5 w-5 p-0 opacity-0 group-hover:opacity-100"
                        onClick={() => removeAsset(asset.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Messaging Angles */}
            <div>
              <Label className="mb-2 block">Messaging Angles</Label>
              <div className="space-y-2">
                {MESSAGING_ANGLES.map((angle) => (
                  <Card
                    key={angle.id}
                    className={`p-2.5 cursor-pointer transition-all ${
                      selectedMessagingAngles.includes(angle.id)
                        ? "border-primary bg-primary/5"
                        : "hover:border-primary/50"
                    }`}
                    onClick={() => toggleMessagingAngle(angle.id)}
                  >
                    <div className="flex items-center gap-2">
                      <Checkbox checked={selectedMessagingAngles.includes(angle.id)} className="h-3.5 w-3.5" />
                      <span className="font-medium text-xs">{angle.group}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1.5 ml-5">
                      {angle.themes.slice(0, 4).map((theme, i) => (
                        <Badge key={i} variant="secondary" className="text-[10px] px-1.5 py-0">
                          {theme}
                        </Badge>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* AI Copy Generation */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Ad Copy Variations</Label>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={generateAICopy}
                  disabled={isGeneratingCopy}
                  className="text-xs h-7"
                >
                  {isGeneratingCopy ? (
                    <>
                      <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-3 w-3 mr-1" />
                      Generate with AI
                    </>
                  )}
                </Button>
              </div>
              <div className="space-y-2">
                {adCopies.map((copy, i) => (
                  <Textarea
                    key={i}
                    placeholder={`Ad copy variation ${i + 1}...`}
                    value={copy}
                    onChange={(e) => updateCopy(i, e.target.value)}
                    className="text-xs min-h-[60px]"
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Landing & UTM */}
        {currentStep === 5 && (
          <div className="space-y-4">
            <h3 className="text-base sm:text-lg font-semibold mb-3">Landing Page & Universal Tracker</h3>
            
            <div>
              <Label htmlFor="landingPage">Landing Page URL</Label>
              <Input
                id="landingPage"
                type="url"
                placeholder="https://yourdomain.com/property"
                value={landingPageUrl}
                onChange={(e) => setLandingPageUrl(e.target.value)}
                className="mt-1"
              />
            </div>

            {/* UTM Schema Preview */}
            <Card className="p-3 bg-muted/30">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                <Label className="font-medium text-sm">Universal Tracker UTM Schema</Label>
                <Badge variant="secondary" className="text-[10px]">Auto-Injected</Badge>
              </div>
              <p className="text-[10px] text-muted-foreground mb-2">
                Force-appended to every ad for granular attribution
              </p>
              {utmPreview && (
                <div className="bg-background p-2 rounded border text-[10px] font-mono overflow-x-auto">
                  <div className="space-y-0.5">
                    <p><span className="text-primary">utm_source</span>=fb_ig</p>
                    <p><span className="text-primary">utm_medium</span>=paidsocial</p>
                    <p><span className="text-primary">utm_campaign</span>={utmPreview.utm_campaign}</p>
                    <p><span className="text-primary">utm_content</span>={utmPreview.utm_content} <span className="text-muted-foreground">← Creative_ID + Headline_ID</span></p>
                    <p><span className="text-primary">utm_term</span>={utmPreview.utm_term} <span className="text-muted-foreground">← Audience_ID</span></p>
                    <p><span className="text-primary">naybourhood_device</span>={utmPreview.naybourhood_device}</p>
                  </div>
                </div>
              )}
              <p className="text-[10px] text-muted-foreground mt-2">
                ✓ Enables Creative Breakdown reports: "Garden image drives clicks, Floorplan drives deals"
              </p>
            </Card>

            {/* Device-Specific Experience */}
            <Card className="p-3">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <Label className="font-medium text-sm">Device-Specific Landing Pages</Label>
                  <p className="text-xs text-muted-foreground">Optimise experience by device type</p>
                </div>
                <Switch checked={deviceOptimisation} onCheckedChange={setDeviceOptimisation} />
              </div>
              {deviceOptimisation && (
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {DEVICE_CONFIGS.map((config) => (
                    <div key={config.device} className="p-2 bg-muted/50 rounded text-center">
                      <p className="text-xs font-medium capitalize">{config.device}</p>
                      <p className="text-[10px] text-muted-foreground">{config.priorityElements[0]}</p>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <div>
              <Label className="mb-2 block">Call-to-Action Buttons *</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {CTA_OPTIONS.map((cta) => (
                  <Card
                    key={cta.id}
                    className={`p-2 cursor-pointer transition-all text-center ${
                      selectedCTAs.includes(cta.id)
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "hover:border-primary/50"
                    }`}
                    onClick={() => toggleCTA(cta.id)}
                  >
                    <div className="flex items-center justify-center gap-1 mb-0.5">
                      <MousePointerClick className="h-3 w-3" />
                      {selectedCTAs.includes(cta.id) && <Check className="h-3 w-3 text-primary" />}
                    </div>
                    <span className="font-medium text-xs block">{cta.label}</span>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <Label className="mb-2 block">Lead Form Fields (Hidden UTM Passthrough)</Label>
              <div className="flex flex-wrap gap-1.5">
                {["name", "email", "phone", "country", "budget", "timeline", "bedrooms", "message"].map((field) => (
                  <Badge
                    key={field}
                    variant={leadFormFields.includes(field) ? "default" : "outline"}
                    className={`cursor-pointer px-2 py-1 text-xs capitalize ${
                      leadFormFields.includes(field) ? "" : "hover:bg-primary/10"
                    }`}
                    onClick={() => {
                      setLeadFormFields(prev =>
                        prev.includes(field) ? prev.filter(f => f !== field) : [...prev, field]
                      );
                    }}
                  >
                    {field}
                    {leadFormFields.includes(field) && <Check className="h-3 w-3 ml-1" />}
                  </Badge>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                + All UTM parameters captured in hidden fields for CRM attribution
              </p>
            </div>
          </div>
        )}

        {/* Step 6: Tracking */}
        {currentStep === 6 && (
          <div className="space-y-4">
            <h3 className="text-base sm:text-lg font-semibold mb-3">Tracking & Attribution</h3>
            
            <div>
              <Label htmlFor="pixelId">Meta Pixel ID</Label>
              <Input
                id="pixelId"
                placeholder="Enter your Meta Pixel ID"
                value={pixelId}
                onChange={(e) => setPixelId(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label className="mb-2 block">Conversion Events</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {CONVERSION_EVENTS.map((event) => (
                  <Card
                    key={event.id}
                    className={`p-2.5 cursor-pointer transition-all ${
                      selectedEvents.includes(event.id)
                        ? "border-primary bg-primary/5"
                        : "hover:border-primary/50"
                    }`}
                    onClick={() => toggleEvent(event.id)}
                  >
                    <div className="flex items-center gap-2">
                      <Checkbox checked={selectedEvents.includes(event.id)} className="h-3.5 w-3.5" />
                      <span className="font-medium text-xs">{event.label}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground ml-5">{event.description}</p>
                  </Card>
                ))}
              </div>
            </div>

            {/* Creative Breakdown Preview */}
            <Card className="p-3 bg-gradient-to-br from-muted/30 to-background">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                <Label className="font-medium text-sm">Creative Breakdown Report (Preview)</Label>
              </div>
              <p className="text-[10px] text-muted-foreground mb-3">
                Because we capture Creative_ID and Headline_ID in UTMs, you'll see:
              </p>
              <div className="space-y-2">
                {MOCK_CREATIVE_PERFORMANCE.slice(0, 3).map((creative) => (
                  <div key={creative.creativeId} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-muted rounded overflow-hidden">
                        <img src={creative.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                      </div>
                      <span className="text-xs font-medium">{creative.creativeName}</span>
                    </div>
                    <div className="flex gap-3 text-[10px]">
                      <span>CTR: {creative.metrics.ctr}%</span>
                      <span className="text-primary font-medium">Deal Rate: {creative.metrics.dealRate}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Step 7: Review */}
        {currentStep === 7 && (
          <div className="space-y-4">
            <h3 className="text-base sm:text-lg font-semibold mb-3">Campaign Review & Ad Preview</h3>
            
            {/* Ad Preview Section */}
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Eye className="h-4 w-4 text-primary" />
                <h4 className="font-medium text-sm">Ad Preview</h4>
              </div>
              
              {/* Platform Toggle */}
              <div className="flex items-center gap-2 mb-4">
                <Button
                  variant={previewPlatform === "facebook" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPreviewPlatform("facebook")}
                  className="gap-1.5"
                >
                  <Facebook className="h-3.5 w-3.5" />
                  Facebook
                </Button>
                <Button
                  variant={previewPlatform === "instagram" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPreviewPlatform("instagram")}
                  className="gap-1.5"
                >
                  <Instagram className="h-3.5 w-3.5" />
                  Instagram
                </Button>
              </div>

              {/* Preview */}
              <div className="flex justify-center bg-muted/30 rounded-lg p-4">
                <CampaignAdPreview
                  developmentName={developmentName}
                  adCopy={adCopies[0] || ""}
                  ctaLabel={selectedCTAs[0] || "learn_more"}
                  landingPageUrl={landingPageUrl}
                  creativeAsset={creativeAssets[0] ? {
                    preview: creativeAssets[0].preview,
                    type: creativeAssets[0].type,
                    name: creativeAssets[0].name
                  } : undefined}
                  platform={previewPlatform}
                />
              </div>

              {adCopies.filter(c => c.trim()).length > 1 && (
                <p className="text-[10px] text-muted-foreground mt-2 text-center">
                  Showing first ad variation. {adCopies.filter(c => c.trim()).length} variations will be tested.
                </p>
              )}
            </Card>

            {/* Attribution Insights */}
            <InsightCard insight={activeInsight} />

            <Card className="p-3">
              <h4 className="font-medium text-sm mb-2">Campaign Summary</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><span className="text-muted-foreground">Name:</span> {campaignName}</div>
                <div><span className="text-muted-foreground">Objective:</span> {objective}</div>
                <div><span className="text-muted-foreground">Budget:</span> £{budget}</div>
                <div><span className="text-muted-foreground">Start:</span> {startDate}</div>
                <div><span className="text-muted-foreground">Regions:</span> {selectedRegions.length}</div>
                <div><span className="text-muted-foreground">Countries:</span> {selectedCountries.length}</div>
              </div>
            </Card>

            <Card className="p-3">
              <h4 className="font-medium text-sm mb-2">Audience Strategy</h4>
              <div className="flex items-center gap-2 mb-2">
                <MaturityBadge stage={audienceMaturityData.stage} />
              </div>
              <div className="flex flex-wrap gap-1">
                {selectedInterestClusters.map(id => {
                  const cluster = INTEREST_CLUSTERS.find(c => c.id === id);
                  return cluster ? (
                    <Badge key={id} variant="secondary" className="text-[10px]">
                      {cluster.icon} {cluster.name}
                    </Badge>
                  ) : null;
                })}
              </div>
              {applyExclusionList && (
                <p className="text-[10px] text-muted-foreground mt-2">
                  ✓ Anti-Tire-Kicker exclusions applied
                </p>
              )}
            </Card>

            <Card className="p-3">
              <h4 className="font-medium text-sm mb-2">Universal Tracker</h4>
              <div className="text-[10px] font-mono bg-muted/50 p-2 rounded overflow-x-auto">
                {utmPreview && buildUTMString(utmPreview).slice(0, 100)}...
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                ✓ Full attribution chain: Creative → Headline → Audience → Device
              </p>
            </Card>

            {creativeAssets.length > 0 && (
              <Card className="p-3">
                <h4 className="font-medium text-sm mb-2">Creative Assets ({creativeAssets.length})</h4>
                <div className="flex gap-2 overflow-x-auto">
                  {creativeAssets.map((asset) => (
                    <div key={asset.id} className="w-16 h-12 flex-shrink-0 rounded overflow-hidden bg-muted">
                      <img src={asset.preview} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-shrink-0 border-t border-border pt-3 mt-3 flex justify-between">
        <div>
          {currentStep > 1 && (
            <Button variant="outline" onClick={() => setCurrentStep(currentStep - 1)} size="sm">
              <ChevronLeft className="h-4 w-4 mr-1" /> Back
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          {onClose && (
            <Button variant="ghost" onClick={onClose} size="sm">
              Cancel
            </Button>
          )}
          {currentStep < 7 ? (
            <Button onClick={() => setCurrentStep(currentStep + 1)} disabled={!canProceed()} size="sm">
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} size="sm">
              <Sparkles className="h-4 w-4 mr-1" /> Create Campaign
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default HybridSignalCampaignBuilder;
