import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
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
  AlertCircle
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
  AFRICA_RULES,
  generateCampaignName,
} from "@/lib/metaCampaignData";

interface MetaCampaignBuilderProps {
  onCampaignCreated?: (campaign: any) => void;
  onClose?: () => void;
}

const STEPS = [
  { id: 1, title: "Overview", icon: Sparkles },
  { id: 2, title: "Targeting", icon: Globe },
  { id: 3, title: "Budget", icon: DollarSign },
  { id: 4, title: "Content", icon: Image },
  { id: 5, title: "Review", icon: Eye },
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
  
  // Step 4: Content
  const [selectedContentTypes, setSelectedContentTypes] = useState<string[]>(["static", "carousel"]);
  const [selectedMessagingAngles, setSelectedMessagingAngles] = useState<string[]>(["investment"]);

  const isAfricaSelected = selectedRegions.includes("africa");

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
      // Auto-select popular cities
      const popularCities = CITIES.filter(
        c => region.countries.includes(c.countryCode) && c.popular
      ).map(c => c.name);
      setSelectedCities(prev => [...new Set([...prev, ...popularCities])]);
    }

    // Handle Africa-specific rules
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

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return developmentName.trim() !== "";
      case 2:
        return selectedRegions.length > 0 && selectedCountries.length > 0 && selectedInterests.length > 0;
      case 3:
        return budget !== "" && parseFloat(budget) > 0 && startDate !== "";
      case 4:
        return selectedContentTypes.length > 0 && selectedMessagingAngles.length > 0;
      case 5:
        return true;
      default:
        return false;
    }
  };

  const handleSubmit = () => {
    const regionNames = selectedRegions.map(r => REGIONS.find(reg => reg.id === r)?.name || r).join(", ");
    const campaignName = generateCampaignName(developmentName, regionNames, objective, phase);
    
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
      contentTypes: selectedContentTypes,
      messagingAngles: selectedMessagingAngles,
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

  return (
    <div className="flex flex-col h-full max-h-[80vh]">
      {/* Step Indicator */}
      <div className="flex-shrink-0 border-b border-border pb-4 mb-4">
        <div className="flex items-center justify-between overflow-x-auto gap-1 sm:gap-2">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center flex-shrink-0">
              <button
                onClick={() => step.id < currentStep && setCurrentStep(step.id)}
                className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 rounded-lg transition-colors ${
                  currentStep === step.id
                    ? "bg-primary text-primary-foreground"
                    : currentStep > step.id
                    ? "bg-primary/20 text-primary cursor-pointer hover:bg-primary/30"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <step.icon className="h-4 w-4" />
                <span className="text-xs sm:text-sm font-medium hidden sm:inline">{step.title}</span>
                <span className="text-xs font-medium sm:hidden">{step.id}</span>
              </button>
              {index < STEPS.length - 1 && (
                <ChevronRight className="h-4 w-4 text-muted-foreground mx-1 flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 overflow-y-auto px-1">
        {/* Step 1: Overview */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Campaign Overview</h3>
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
                  <Label className="mb-3 block">Campaign Objective *</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {CAMPAIGN_OBJECTIVES.map((obj) => (
                      <Card
                        key={obj.id}
                        className={`p-4 cursor-pointer transition-all ${
                          objective === obj.id
                            ? "border-primary bg-primary/5 ring-2 ring-primary"
                            : "hover:border-primary/50"
                        }`}
                        onClick={() => setObjective(obj.id)}
                      >
                        <div className="flex items-center gap-2">
                          {objective === obj.id && <Check className="h-4 w-4 text-primary" />}
                          <span className="font-medium">{obj.name}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{obj.description}</p>
                      </Card>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="mb-3 block">Campaign Phase *</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {CAMPAIGN_PHASES.map((p) => (
                      <Card
                        key={p.id}
                        className={`p-4 cursor-pointer transition-all ${
                          phase === p.id
                            ? "border-primary bg-primary/5 ring-2 ring-primary"
                            : "hover:border-primary/50"
                        }`}
                        onClick={() => setPhase(p.id)}
                      >
                        <div className="flex items-center gap-2">
                          {phase === p.id && <Check className="h-4 w-4 text-primary" />}
                          <span className="font-medium">{p.name}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{p.description}</p>
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
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Geographic Targeting</h3>
              
              {/* Regions */}
              <div className="mb-6">
                <Label className="mb-3 block">Select Regions *</Label>
                <div className="flex flex-wrap gap-2">
                  {REGIONS.map((region) => (
                    <Badge
                      key={region.id}
                      variant={selectedRegions.includes(region.id) ? "default" : "outline"}
                      className={`cursor-pointer px-3 py-1.5 text-sm ${
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

              {/* Countries */}
              {selectedRegions.length > 0 && (
                <div className="mb-6">
                  <Label className="mb-3 block">Select Countries</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-2 border rounded-lg">
                    {COUNTRIES.filter(c => selectedRegions.includes(c.region)).map((country) => (
                      <div key={country.code} className="flex items-center gap-2">
                        <Checkbox
                          id={country.code}
                          checked={selectedCountries.includes(country.code)}
                          onCheckedChange={() => toggleCountry(country.code)}
                        />
                        <Label htmlFor={country.code} className="text-sm cursor-pointer">
                          {country.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cities */}
              {availableCities.length > 0 && (
                <div className="mb-6">
                  <Label className="mb-3 block">Select Cities</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-2 border rounded-lg">
                    {availableCities.map((city) => (
                      <div key={city.name} className="flex items-center gap-2">
                        <Checkbox
                          id={city.name}
                          checked={selectedCities.includes(city.name)}
                          onCheckedChange={() => toggleCity(city.name)}
                        />
                        <Label htmlFor={city.name} className="text-sm cursor-pointer flex items-center gap-1">
                          {city.name}
                          {city.popular && <MapPin className="h-3 w-3 text-primary" />}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Interest Categories */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Interest Targeting</h3>
              {isAfricaSelected && (
                <div className="flex items-center gap-2 p-3 bg-warning/10 border border-warning/30 rounded-lg mb-4">
                  <AlertCircle className="h-4 w-4 text-warning" />
                  <span className="text-sm">Africa rules: Instagram only, iOS devices, no Advantage+ Audience</span>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {CORE_INTEREST_CATEGORIES.map((interest) => {
                  const isDisabled = interest.id === "advantage_plus" && isAfricaSelected;
                  return (
                    <Card
                      key={interest.id}
                      className={`p-3 cursor-pointer transition-all ${
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
                        />
                        <span className="font-medium text-sm">{interest.name}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 ml-6">{interest.description}</p>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Budget */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold mb-4">Budget & Schedule</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <p className="text-xs text-muted-foreground mt-1">Total budget for campaign duration</p>
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
                <p className="text-xs text-muted-foreground mt-1">Leave empty for ongoing campaign</p>
              </div>
            </div>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">WhatsApp Add-On</Label>
                  <p className="text-sm text-muted-foreground">Enable WhatsApp messaging for leads</p>
                </div>
                <Switch
                  checked={whatsappEnabled}
                  onCheckedChange={setWhatsappEnabled}
                />
              </div>
            </Card>

            {phase === "testing" && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">Testing Phase Guidelines</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• 10-day evaluation window</li>
                  <li>• CPC target: &lt; £1.50</li>
                  <li>• CTR target: &gt; 2%</li>
                  <li>• 60-70% leads should be high-intent</li>
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Content */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Content Types</h3>
              <p className="text-sm text-muted-foreground mb-4">Minimum 4 content types recommended per development</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {CONTENT_TYPES.map((type) => (
                  <Card
                    key={type.id}
                    className={`p-3 cursor-pointer transition-all ${
                      selectedContentTypes.includes(type.id)
                        ? "border-primary bg-primary/5"
                        : "hover:border-primary/50"
                    }`}
                    onClick={() => toggleContentType(type.id)}
                  >
                    <div className="flex items-center gap-2">
                      <Checkbox checked={selectedContentTypes.includes(type.id)} />
                      <span className="font-medium text-sm">{type.name}</span>
                      {type.required && (
                        <Badge variant="secondary" className="text-xs">Required</Badge>
                      )}
                    </div>
                    {type.description && (
                      <p className="text-xs text-muted-foreground mt-1 ml-6">{type.description}</p>
                    )}
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Messaging Angles</h3>
              <p className="text-sm text-muted-foreground mb-4">Test across 3 angle groups for optimal performance</p>
              <div className="space-y-4">
                {MESSAGING_ANGLES.map((angle) => (
                  <Card
                    key={angle.id}
                    className={`p-4 cursor-pointer transition-all ${
                      selectedMessagingAngles.includes(angle.id)
                        ? "border-primary bg-primary/5"
                        : "hover:border-primary/50"
                    }`}
                    onClick={() => toggleMessagingAngle(angle.id)}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Checkbox checked={selectedMessagingAngles.includes(angle.id)} />
                      <span className="font-medium">{angle.group}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 ml-6">
                      {angle.themes.map((theme) => (
                        <Badge key={theme} variant="outline" className="text-xs">
                          {theme}
                        </Badge>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Review */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold mb-4">Review Campaign</h3>
            
            <Card className="p-4">
              <h4 className="font-medium mb-3">Campaign Name</h4>
              <p className="text-sm bg-muted p-2 rounded font-mono">
                {generateCampaignName(
                  developmentName || "Development",
                  selectedRegions.map(r => REGIONS.find(reg => reg.id === r)?.name || r).join(", "),
                  objective,
                  phase
                )}
              </p>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card className="p-4">
                <h4 className="font-medium mb-2">Overview</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="text-muted-foreground">Development:</span> {developmentName}</p>
                  <p><span className="text-muted-foreground">Objective:</span> {CAMPAIGN_OBJECTIVES.find(o => o.id === objective)?.name}</p>
                  <p><span className="text-muted-foreground">Phase:</span> {CAMPAIGN_PHASES.find(p => p.id === phase)?.name}</p>
                </div>
              </Card>

              <Card className="p-4">
                <h4 className="font-medium mb-2">Budget & Schedule</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="text-muted-foreground">Budget:</span> £{parseFloat(budget || "0").toLocaleString()}</p>
                  <p><span className="text-muted-foreground">Start:</span> {startDate}</p>
                  <p><span className="text-muted-foreground">End:</span> {endDate || "Ongoing"}</p>
                  <p><span className="text-muted-foreground">WhatsApp:</span> {whatsappEnabled ? "Enabled" : "Disabled"}</p>
                </div>
              </Card>

              <Card className="p-4">
                <h4 className="font-medium mb-2">Targeting</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Regions:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedRegions.map(r => (
                        <Badge key={r} variant="secondary" className="text-xs">
                          {REGIONS.find(reg => reg.id === r)?.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Countries:</span> {selectedCountries.length} selected
                  </div>
                  <div>
                    <span className="text-muted-foreground">Cities:</span> {selectedCities.length} selected
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <h4 className="font-medium mb-2">Content & Messaging</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Content Types:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedContentTypes.map(t => (
                        <Badge key={t} variant="secondary" className="text-xs">
                          {CONTENT_TYPES.find(ct => ct.id === t)?.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Angles:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedMessagingAngles.map(a => (
                        <Badge key={a} variant="secondary" className="text-xs">
                          {MESSAGING_ANGLES.find(ma => ma.id === a)?.group}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {isAfricaSelected && (
              <div className="flex items-center gap-2 p-3 bg-warning/10 border border-warning/30 rounded-lg">
                <AlertCircle className="h-4 w-4 text-warning" />
                <span className="text-sm">Africa targeting: Instagram only, iOS devices</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-shrink-0 flex items-center justify-between pt-4 mt-4 border-t border-border">
        <Button
          variant="outline"
          onClick={() => currentStep === 1 ? onClose?.() : setCurrentStep(prev => prev - 1)}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          {currentStep === 1 ? "Cancel" : "Back"}
        </Button>

        {currentStep < 5 ? (
          <Button onClick={() => setCurrentStep(prev => prev + 1)} disabled={!canProceed()}>
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={!canProceed()}>
            <Check className="h-4 w-4 mr-1" />
            Create Campaign
          </Button>
        )}
      </div>
    </div>
  );
};

export default MetaCampaignBuilder;
