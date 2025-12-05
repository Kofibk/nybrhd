import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
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
  RefreshCw
} from "lucide-react";
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
  generateUTMs,
} from "@/lib/metaCampaignData";

interface MetaCampaignBuilderProps {
  onCampaignCreated?: (campaign: any) => void;
  onClose?: () => void;
}

const STEPS = [
  { id: 1, title: "Overview", icon: Sparkles },
  { id: 2, title: "Targeting", icon: Globe },
  { id: 3, title: "Budget", icon: DollarSign },
  { id: 4, title: "Landing", icon: Link2 },
  { id: 5, title: "Content", icon: Image },
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

const MetaCampaignBuilder = ({ onCampaignCreated, onClose }: MetaCampaignBuilderProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  
  // Step 1: Overview
  const [developmentName, setDevelopmentName] = useState("");
  const [objective, setObjective] = useState<string>("leads");
  const [phase, setPhase] = useState<string>("testing");
  
  // Step 2: Targeting
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(["finance", "property_investing"]);
  
  // Step 3: Budget
  const [budget, setBudget] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState("");
  const [whatsappEnabled, setWhatsappEnabled] = useState(true);
  
  // Step 4: Landing Page
  const [landingPageUrl, setLandingPageUrl] = useState("");
  const [selectedCTAs, setSelectedCTAs] = useState<string[]>(["learn_more"]);
  const [leadFormFields, setLeadFormFields] = useState<string[]>(["name", "email", "phone"]);
  
  // Step 5: Content
  const [selectedContentTypes, setSelectedContentTypes] = useState<string[]>(["static", "carousel"]);
  const [selectedMessagingAngles, setSelectedMessagingAngles] = useState<string[]>(["investment"]);
  const [adCopies, setAdCopies] = useState<string[]>(["", "", ""]);
  const [isGeneratingCopy, setIsGeneratingCopy] = useState(false);
  
  // Step 6: Tracking
  const [pixelId, setPixelId] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<string[]>(["Lead", "ViewContent", "SubmitForm"]);
  const [customUtmSource, setCustomUtmSource] = useState("facebook");
  const [customUtmMedium, setCustomUtmMedium] = useState("paid_social");

  const isAfricaSelected = selectedRegions.includes("africa");

  // AI Recommendations state
  const [aiRecommendations, setAiRecommendations] = useState<{[key: number]: string[]}>({
    1: ["For property developments, Lead Generation typically outperforms Engagement by 40%", "Testing phase recommended for new developments to optimize before scaling"],
    2: ["UK and Middle East show highest property investment intent", "Consider targeting Finance and Property Investing interests together for HNWI audiences"],
    3: ["£5,000-£8,000 lifetime budget recommended for testing phase", "WhatsApp Add-On increases lead response rates by 35%"],
    4: ["Include 5-7 form fields max for optimal conversion", "Mobile-first landing pages convert 25% higher"],
    5: ["Carousel ads perform 30% better for property showcases", "Mix Investment and Family messaging angles for broader appeal"],
    6: ["ViewContent + Lead events provide complete funnel tracking", "Consistent UTM naming enables better attribution"],
  });

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
    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const angles = selectedMessagingAngles.map(a => 
      MESSAGING_ANGLES.find(ma => ma.id === a)?.group
    ).filter(Boolean);
    
    const generatedCopies = [
      `Discover ${developmentName || "luxury living"} – Premium investment opportunities with exceptional returns. ${angles.includes("Investment Focus") ? "Projected yields of 8-12% annually." : "Perfect for discerning buyers."}`,
      `Your dream property awaits at ${developmentName || "our exclusive development"}. ${angles.includes("Downsizers & Family") ? "Secure, gated community with world-class amenities." : "Limited units available – register interest today."}`,
      `Invest in ${developmentName || "London's finest"} real estate. ${angles.includes("Holiday Home & Parents") ? "Ideal as a holiday retreat or savvy investment." : "Speak to our team for exclusive pricing."}`,
    ];
    
    setAdCopies(generatedCopies);
    setIsGeneratingCopy(false);
    toast.success("AI-generated copy ready!");
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return developmentName.trim() !== "";
      case 2:
        return selectedRegions.length > 0 && selectedCountries.length > 0 && selectedInterests.length > 0;
      case 3:
        return budget !== "" && parseFloat(budget) > 0 && startDate !== "";
      case 4:
        return selectedCTAs.length > 0;
      case 5:
        return selectedContentTypes.length > 0 && selectedMessagingAngles.length > 0;
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

  const utmParams = generateUTMs(campaignName, "Adset_Name", "Ad_Name");

  const handleSubmit = () => {
    const campaign = {
      id: `mc-${Date.now()}`,
      developmentName,
      name: campaignName,
      objective,
      phase,
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
      contentTypes: selectedContentTypes,
      messagingAngles: selectedMessagingAngles,
      adCopies: adCopies.filter(c => c.trim() !== ""),
      pixelId,
      conversionEvents: selectedEvents,
      utmSource: customUtmSource,
      utmMedium: customUtmMedium,
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
    toast.success("Campaign created successfully!");
    onClose?.();
  };

  const availableCities = CITIES.filter(city => selectedCountries.includes(city.countryCode));

  // AI Recommendation Component
  const AIRecommendation = ({ step }: { step: number }) => {
    const recs = aiRecommendations[step];
    if (!recs || recs.length === 0) return null;
    
    return (
      <Card className="p-3 bg-primary/5 border-primary/20 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-primary">AI Recommendations</span>
        </div>
        <ul className="space-y-1">
          {recs.map((rec, i) => (
            <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
              <Sparkles className="h-3 w-3 mt-0.5 text-primary/60 flex-shrink-0" />
              {rec}
            </li>
          ))}
        </ul>
      </Card>
    );
  };

  return (
    <div className="flex flex-col h-full max-h-[85vh]">
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
        {/* Step 1: Overview */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <AIRecommendation step={1} />
            <div>
              <h3 className="text-base sm:text-lg font-semibold mb-3">Campaign Overview</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="development">Development Name *</Label>
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

                <div>
                  <Label className="mb-2 block">Campaign Phase *</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {CAMPAIGN_PHASES.map((p) => (
                      <Card
                        key={p.id}
                        className={`p-3 cursor-pointer transition-all ${
                          phase === p.id
                            ? "border-primary bg-primary/5 ring-2 ring-primary"
                            : "hover:border-primary/50"
                        }`}
                        onClick={() => setPhase(p.id)}
                      >
                        <div className="flex items-center gap-2">
                          {phase === p.id && <Check className="h-4 w-4 text-primary" />}
                          <span className="font-medium text-sm">{p.name}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{p.description}</p>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Targeting */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <AIRecommendation step={2} />
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

            <div>
              <h3 className="text-base sm:text-lg font-semibold mb-3">Interest Targeting</h3>
              {isAfricaSelected && (
                <div className="flex items-center gap-2 p-2 bg-warning/10 border border-warning/30 rounded-lg mb-3">
                  <AlertCircle className="h-3.5 w-3.5 text-warning" />
                  <span className="text-xs">Africa: Instagram only, iOS devices, no Advantage+</span>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {CORE_INTEREST_CATEGORIES.map((interest) => {
                  const isDisabled = interest.id === "advantage_plus" && isAfricaSelected;
                  return (
                    <Card
                      key={interest.id}
                      className={`p-2.5 cursor-pointer transition-all ${
                        isDisabled ? "opacity-50 cursor-not-allowed" : ""
                      } ${
                        selectedInterests.includes(interest.id)
                          ? "border-primary bg-primary/5"
                          : "hover:border-primary/50"
                      }`}
                      onClick={() => !isDisabled && toggleInterest(interest.id)}
                    >
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={selectedInterests.includes(interest.id)}
                          disabled={isDisabled}
                          className="h-3.5 w-3.5"
                        />
                        <span className="font-medium text-xs">{interest.name}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5 ml-5">{interest.description}</p>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Budget */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <AIRecommendation step={3} />
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
                <p className="text-[10px] text-muted-foreground mt-1">Total budget for campaign</p>
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
                <p className="text-[10px] text-muted-foreground mt-1">Leave empty for ongoing</p>
              </div>
            </div>

            <Card className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium text-sm">WhatsApp Add-On</Label>
                  <p className="text-xs text-muted-foreground">Enable WhatsApp messaging</p>
                </div>
                <Switch
                  checked={whatsappEnabled}
                  onCheckedChange={setWhatsappEnabled}
                />
              </div>
            </Card>

            {phase === "testing" && (
              <div className="p-3 bg-muted/50 rounded-lg">
                <h4 className="font-medium text-sm mb-2">Testing Phase Guidelines</h4>
                <ul className="text-xs text-muted-foreground space-y-0.5">
                  <li>• 10-day evaluation window</li>
                  <li>• CPC target: &lt; £1.50</li>
                  <li>• CTR target: &gt; 2%</li>
                  <li>• 60-70% leads should be high-intent</li>
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Landing Page & CTAs */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <AIRecommendation step={4} />
            <h3 className="text-base sm:text-lg font-semibold mb-3">Landing Page & CTAs</h3>
            
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
              <p className="text-[10px] text-muted-foreground mt-1">Link to your lead capture page</p>
            </div>

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
                    <p className="text-[10px] text-muted-foreground">{cta.description}</p>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <Label className="mb-2 block">Lead Form Fields</Label>
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
              <p className="text-[10px] text-muted-foreground mt-1">Select fields for Meta Instant Form</p>
            </div>
          </div>
        )}

        {/* Step 5: Content */}
        {currentStep === 5 && (
          <div className="space-y-4">
            <AIRecommendation step={5} />
            <div>
              <h3 className="text-base sm:text-lg font-semibold mb-3">Content Types</h3>
              <p className="text-xs text-muted-foreground mb-3">Minimum 4 content types recommended</p>
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
                    {type.description && (
                      <p className="text-[10px] text-muted-foreground mt-0.5 ml-5">{type.description}</p>
                    )}
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-semibold mb-3">Messaging Angles</h3>
              <div className="space-y-2">
                {MESSAGING_ANGLES.map((angle) => (
                  <Card
                    key={angle.id}
                    className={`p-3 cursor-pointer transition-all ${
                      selectedMessagingAngles.includes(angle.id)
                        ? "border-primary bg-primary/5"
                        : "hover:border-primary/50"
                    }`}
                    onClick={() => toggleMessagingAngle(angle.id)}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <Checkbox checked={selectedMessagingAngles.includes(angle.id)} className="h-3.5 w-3.5" />
                      <span className="font-medium text-sm">{angle.group}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 ml-5">
                      {angle.themes.map((theme) => (
                        <Badge key={theme} variant="outline" className="text-[10px] px-1.5 py-0">
                          {theme}
                        </Badge>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base sm:text-lg font-semibold">Ad Copy (Captions)</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={generateAICopy}
                  disabled={isGeneratingCopy}
                  className="gap-1 text-xs"
                >
                  {isGeneratingCopy ? (
                    <RefreshCw className="h-3 w-3 animate-spin" />
                  ) : (
                    <Wand2 className="h-3 w-3" />
                  )}
                  AI Generate
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mb-2">Write up to 3 ad copy variations</p>
              <div className="space-y-2">
                {adCopies.map((copy, index) => (
                  <div key={index} className="relative">
                    <Label className="text-xs mb-1 block">Copy {index + 1}</Label>
                    <Textarea
                      placeholder={`Enter ad copy variation ${index + 1}...`}
                      value={copy}
                      onChange={(e) => updateCopy(index, e.target.value)}
                      className="text-sm min-h-[60px]"
                      maxLength={500}
                    />
                    <span className="absolute bottom-2 right-2 text-[10px] text-muted-foreground">
                      {copy.length}/500
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 6: Tracking */}
        {currentStep === 6 && (
          <div className="space-y-4">
            <AIRecommendation step={6} />
            <h3 className="text-base sm:text-lg font-semibold mb-3">Tracking & Pixels</h3>
            
            <div>
              <Label htmlFor="pixelId">Meta Pixel ID</Label>
              <Input
                id="pixelId"
                placeholder="123456789012345"
                value={pixelId}
                onChange={(e) => setPixelId(e.target.value)}
                className="mt-1"
              />
              <p className="text-[10px] text-muted-foreground mt-1">Your Facebook Pixel ID</p>
            </div>

            <div>
              <Label className="mb-2 block">Conversion Events</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {CONVERSION_EVENTS.map((event) => (
                  <Card
                    key={event.id}
                    className={`p-2 cursor-pointer transition-all ${
                      selectedEvents.includes(event.id)
                        ? "border-primary bg-primary/5"
                        : "hover:border-primary/50"
                    }`}
                    onClick={() => toggleEvent(event.id)}
                  >
                    <div className="flex items-center gap-1.5">
                      <Checkbox checked={selectedEvents.includes(event.id)} className="h-3.5 w-3.5" />
                      <span className="font-medium text-xs">{event.label}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5 ml-5">{event.description}</p>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-sm mb-2">UTM Parameters</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="utmSource" className="text-xs">utm_source</Label>
                  <Input
                    id="utmSource"
                    value={customUtmSource}
                    onChange={(e) => setCustomUtmSource(e.target.value)}
                    className="mt-1 text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="utmMedium" className="text-xs">utm_medium</Label>
                  <Input
                    id="utmMedium"
                    value={customUtmMedium}
                    onChange={(e) => setCustomUtmMedium(e.target.value)}
                    className="mt-1 text-sm"
                  />
                </div>
              </div>
            </div>

            <Card className="p-3 bg-muted/50">
              <h4 className="font-medium text-sm mb-2 flex items-center gap-1.5">
                <FileText className="h-4 w-4" />
                Generated UTM Template
              </h4>
              <div className="bg-background p-2 rounded text-xs font-mono break-all">
                <p className="text-muted-foreground">utm_campaign=<span className="text-foreground">{encodeURIComponent(campaignName)}</span></p>
                <p className="text-muted-foreground">utm_source=<span className="text-foreground">{customUtmSource}</span></p>
                <p className="text-muted-foreground">utm_medium=<span className="text-foreground">{customUtmMedium}</span></p>
                <p className="text-muted-foreground">utm_content=<span className="text-foreground">[ad_name]</span></p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 text-xs gap-1"
                onClick={() => {
                  const utm = `utm_campaign=${encodeURIComponent(campaignName)}&utm_source=${customUtmSource}&utm_medium=${customUtmMedium}&utm_content=[ad_name]`;
                  navigator.clipboard.writeText(utm);
                  toast.success("UTM copied to clipboard!");
                }}
              >
                <Copy className="h-3 w-3" />
                Copy UTM String
              </Button>
            </Card>

            <Card className="p-3 bg-muted/50">
              <h4 className="font-medium text-sm mb-2">Naming Convention</h4>
              <div className="space-y-1 text-xs">
                <p><span className="text-muted-foreground">Campaign:</span> <span className="font-mono">{campaignName}</span></p>
                <p><span className="text-muted-foreground">Adset:</span> <span className="font-mono">[Region] – [Interest] – [Placement]</span></p>
                <p><span className="text-muted-foreground">Ad:</span> <span className="font-mono">[Creative Type] – [Hook] – V[#]</span></p>
              </div>
            </Card>
          </div>
        )}

        {/* Step 7: Review */}
        {currentStep === 7 && (
          <div className="space-y-4">
            <h3 className="text-base sm:text-lg font-semibold mb-3">Review Campaign</h3>
            
            <Card className="p-3">
              <h4 className="font-medium text-sm mb-2">Campaign Name</h4>
              <p className="text-xs bg-muted p-2 rounded font-mono break-all">{campaignName}</p>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Card className="p-3">
                <h4 className="font-medium text-sm mb-2">Overview</h4>
                <div className="space-y-1 text-xs">
                  <p><span className="text-muted-foreground">Development:</span> {developmentName}</p>
                  <p><span className="text-muted-foreground">Objective:</span> {CAMPAIGN_OBJECTIVES.find(o => o.id === objective)?.name}</p>
                  <p><span className="text-muted-foreground">Phase:</span> {CAMPAIGN_PHASES.find(p => p.id === phase)?.name}</p>
                </div>
              </Card>

              <Card className="p-3">
                <h4 className="font-medium text-sm mb-2">Budget & Schedule</h4>
                <div className="space-y-1 text-xs">
                  <p><span className="text-muted-foreground">Budget:</span> £{parseFloat(budget || "0").toLocaleString()}</p>
                  <p><span className="text-muted-foreground">Start:</span> {startDate}</p>
                  <p><span className="text-muted-foreground">End:</span> {endDate || "Ongoing"}</p>
                  <p><span className="text-muted-foreground">WhatsApp:</span> {whatsappEnabled ? "Enabled" : "Disabled"}</p>
                </div>
              </Card>

              <Card className="p-3">
                <h4 className="font-medium text-sm mb-2">Targeting</h4>
                <div className="space-y-1 text-xs">
                  <div>
                    <span className="text-muted-foreground">Regions:</span>
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {selectedRegions.map(r => (
                        <Badge key={r} variant="secondary" className="text-[10px] px-1.5 py-0">
                          {REGIONS.find(reg => reg.id === r)?.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <p><span className="text-muted-foreground">Countries:</span> {selectedCountries.length}</p>
                  <p><span className="text-muted-foreground">Cities:</span> {selectedCities.length}</p>
                </div>
              </Card>

              <Card className="p-3">
                <h4 className="font-medium text-sm mb-2">Landing & CTAs</h4>
                <div className="space-y-1 text-xs">
                  <p className="truncate"><span className="text-muted-foreground">URL:</span> {landingPageUrl || "Not set"}</p>
                  <div>
                    <span className="text-muted-foreground">CTAs:</span>
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {selectedCTAs.map(c => (
                        <Badge key={c} variant="secondary" className="text-[10px] px-1.5 py-0">
                          {CTA_OPTIONS.find(cta => cta.id === c)?.label}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-3">
                <h4 className="font-medium text-sm mb-2">Content</h4>
                <div className="space-y-1 text-xs">
                  <div>
                    <span className="text-muted-foreground">Types:</span>
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {selectedContentTypes.map(t => (
                        <Badge key={t} variant="secondary" className="text-[10px] px-1.5 py-0">
                          {CONTENT_TYPES.find(ct => ct.id === t)?.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <p><span className="text-muted-foreground">Ad Copies:</span> {adCopies.filter(c => c.trim()).length}</p>
                </div>
              </Card>

              <Card className="p-3">
                <h4 className="font-medium text-sm mb-2">Tracking</h4>
                <div className="space-y-1 text-xs">
                  <p><span className="text-muted-foreground">Pixel:</span> {pixelId || "Not set"}</p>
                  <p><span className="text-muted-foreground">Events:</span> {selectedEvents.join(", ")}</p>
                </div>
              </Card>
            </div>

            {isAfricaSelected && (
              <div className="flex items-center gap-2 p-2 bg-warning/10 border border-warning/30 rounded-lg">
                <AlertCircle className="h-3.5 w-3.5 text-warning" />
                <span className="text-xs">Africa targeting: Instagram only, iOS devices</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-shrink-0 flex items-center justify-between pt-3 mt-3 border-t border-border">
        <Button
          variant="outline"
          size="sm"
          onClick={() => currentStep === 1 ? onClose?.() : setCurrentStep(prev => prev - 1)}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          <span className="hidden sm:inline">{currentStep === 1 ? "Cancel" : "Back"}</span>
        </Button>

        {currentStep < 7 ? (
          <Button size="sm" onClick={() => setCurrentStep(prev => prev + 1)} disabled={!canProceed()}>
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="h-4 w-4 sm:ml-1" />
          </Button>
        ) : (
          <Button size="sm" onClick={handleSubmit} disabled={!canProceed()}>
            <Check className="h-4 w-4 mr-1" />
            Create
          </Button>
        )}
      </div>
    </div>
  );
};

export default MetaCampaignBuilder;
