import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Plus,
  Search,
  Globe,
  MapPin,
  Target,
  DollarSign,
  Calendar,
  FileText,
  Sparkles,
  ChevronRight,
  Info,
  MessageSquare,
  Check,
  X,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import {
  COUNTRIES,
  CITIES,
  REGIONS,
  CAMPAIGN_OBJECTIVES,
  CAMPAIGN_PHASES,
  CORE_INTEREST_CATEGORIES,
  CONTENT_TYPES,
  MESSAGING_ANGLES,
  AFRICA_RULES,
  generateCampaignName,
  generateAdsetName,
} from "@/lib/metaCampaignData";

interface MetaCampaignBuilderProps {
  onCampaignCreated?: (campaign: any) => void;
  onClose?: () => void;
}

const MetaCampaignBuilder = ({ onCampaignCreated, onClose }: MetaCampaignBuilderProps) => {
  const [step, setStep] = useState(1);
  const [countrySearch, setCountrySearch] = useState("");
  const [citySearch, setCitySearch] = useState("");
  
  // Form state
  const [developmentName, setDevelopmentName] = useState("");
  const [objective, setObjective] = useState<"leads" | "engagement">("leads");
  const [phase, setPhase] = useState<"testing" | "scaling">("testing");
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [budget, setBudget] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    "finance", "luxury_travel", "property_investing", "home"
  ]);
  const [selectedContentTypes, setSelectedContentTypes] = useState<string[]>([]);
  const [selectedAngles, setSelectedAngles] = useState<string[]>([]);
  const [whatsappEnabled, setWhatsappEnabled] = useState(true);
  const [notes, setNotes] = useState("");

  // Filtered countries based on search
  const filteredCountries = useMemo(() => {
    return COUNTRIES.filter(c => 
      c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
      c.code.toLowerCase().includes(countrySearch.toLowerCase())
    );
  }, [countrySearch]);

  // Filtered cities based on selected countries and search
  const filteredCities = useMemo(() => {
    const citiesInCountries = selectedCountries.length > 0
      ? CITIES.filter(c => selectedCountries.includes(c.countryCode))
      : CITIES;
    return citiesInCountries.filter(c =>
      c.name.toLowerCase().includes(citySearch.toLowerCase())
    );
  }, [selectedCountries, citySearch]);

  // Check if Africa is selected (for special rules)
  const hasAfricaSelected = useMemo(() => {
    const africaCountries = REGIONS.find(r => r.id === "africa")?.countries || [];
    return selectedCountries.some(c => africaCountries.includes(c));
  }, [selectedCountries]);

  // Generate campaign name preview
  const campaignNamePreview = useMemo(() => {
    if (!developmentName) return "Select development first";
    const primaryRegion = selectedRegions.length > 0 
      ? REGIONS.find(r => r.id === selectedRegions[0])?.name || "Region"
      : "Region";
    return generateCampaignName(developmentName, primaryRegion, objective, phase);
  }, [developmentName, selectedRegions, objective, phase]);

  // Handle region selection (auto-selects countries)
  const handleRegionToggle = (regionId: string) => {
    const region = REGIONS.find(r => r.id === regionId);
    if (!region) return;

    if (selectedRegions.includes(regionId)) {
      setSelectedRegions(prev => prev.filter(r => r !== regionId));
      setSelectedCountries(prev => prev.filter(c => !region.countries.includes(c)));
    } else {
      setSelectedRegions(prev => [...prev, regionId]);
      setSelectedCountries(prev => [...new Set([...prev, ...region.countries])]);
    }
  };

  const handleCountryToggle = (countryCode: string) => {
    setSelectedCountries(prev => 
      prev.includes(countryCode)
        ? prev.filter(c => c !== countryCode)
        : [...prev, countryCode]
    );
  };

  const handleCityToggle = (cityName: string) => {
    setSelectedCities(prev =>
      prev.includes(cityName)
        ? prev.filter(c => c !== cityName)
        : [...prev, cityName]
    );
  };

  const handleInterestToggle = (interestId: string) => {
    // Don't allow Advantage+ for Africa
    if (interestId === "advantage_plus" && hasAfricaSelected) {
      toast.error("Advantage+ Audience is not recommended for Africa targeting");
      return;
    }
    setSelectedInterests(prev =>
      prev.includes(interestId)
        ? prev.filter(i => i !== interestId)
        : [...prev, interestId]
    );
  };

  const handleSubmit = () => {
    if (!developmentName || selectedCountries.length === 0 || !budget || !startDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    const campaign = {
      id: `mc-${Date.now()}`,
      developmentName,
      objective,
      phase,
      regions: selectedRegions,
      countries: selectedCountries,
      cities: selectedCities,
      budget: parseFloat(budget),
      startDate,
      endDate,
      interests: selectedInterests,
      contentTypes: selectedContentTypes,
      angles: selectedAngles,
      whatsappEnabled,
      notes,
      status: "draft",
      createdAt: new Date().toISOString(),
    };

    onCampaignCreated?.(campaign);
    toast.success("Campaign created successfully!", {
      description: campaignNamePreview
    });
    onClose?.();
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="development">Development / Property Name *</Label>
          <Input
            id="development"
            placeholder="e.g., Riverside Towers, Marina Bay"
            value={developmentName}
            onChange={(e) => setDevelopmentName(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Objective *</Label>
            <Select value={objective} onValueChange={(v) => setObjective(v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CAMPAIGN_OBJECTIVES.map(obj => (
                  <SelectItem key={obj.id} value={obj.id}>
                    <div className="flex flex-col">
                      <span>{obj.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Both objectives tested for 10 days, then best performer scales
            </p>
          </div>

          <div className="space-y-2">
            <Label>Phase *</Label>
            <Select value={phase} onValueChange={(v) => setPhase(v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CAMPAIGN_PHASES.map(p => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="p-3 bg-muted rounded-lg">
          <Label className="text-xs text-muted-foreground">Campaign Name Preview</Label>
          <p className="font-mono text-sm mt-1">{campaignNamePreview}</p>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      {/* Quick Region Selection */}
      <div className="space-y-3">
        <Label>Quick Select by Region</Label>
        <div className="flex flex-wrap gap-2">
          {REGIONS.map(region => (
            <Badge
              key={region.id}
              variant={selectedRegions.includes(region.id) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => handleRegionToggle(region.id)}
            >
              {region.name}
              {selectedRegions.includes(region.id) && <Check className="ml-1 h-3 w-3" />}
            </Badge>
          ))}
        </div>
      </div>

      <Separator />

      {/* Country Selection with Search */}
      <div className="space-y-3">
        <Label>Countries *</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search countries..."
            value={countrySearch}
            onChange={(e) => setCountrySearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <ScrollArea className="h-48 border rounded-md p-3">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {filteredCountries.map(country => (
              <div
                key={country.code}
                className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-accent ${
                  selectedCountries.includes(country.code) ? "bg-accent" : ""
                }`}
                onClick={() => handleCountryToggle(country.code)}
              >
                <Checkbox checked={selectedCountries.includes(country.code)} />
                <span className="text-sm">{country.name}</span>
              </div>
            ))}
          </div>
        </ScrollArea>
        <p className="text-xs text-muted-foreground">
          {selectedCountries.length} countries selected
        </p>
      </div>

      <Separator />

      {/* City Selection with Search */}
      <div className="space-y-3">
        <Label>Cities (Optional - leave empty for country-wide)</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search cities..."
            value={citySearch}
            onChange={(e) => setCitySearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <ScrollArea className="h-48 border rounded-md p-3">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {filteredCities.map(city => (
              <div
                key={`${city.countryCode}-${city.name}`}
                className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-accent ${
                  selectedCities.includes(city.name) ? "bg-accent" : ""
                }`}
                onClick={() => handleCityToggle(city.name)}
              >
                <Checkbox checked={selectedCities.includes(city.name)} />
                <div className="flex flex-col">
                  <span className="text-sm">{city.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {COUNTRIES.find(c => c.code === city.countryCode)?.name}
                  </span>
                </div>
                {city.popular && (
                  <Badge variant="secondary" className="ml-auto text-[10px]">Popular</Badge>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
        <p className="text-xs text-muted-foreground">
          {selectedCities.length} cities selected
        </p>
      </div>

      {/* Africa Warning */}
      {hasAfricaSelected && (
        <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex gap-2">
          <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-yellow-500">Africa Region Rules</p>
            <ul className="text-muted-foreground text-xs mt-1 space-y-0.5">
              <li>• Instagram only</li>
              <li>• iOS devices only</li>
              <li>• Advantage+ Audience disabled</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="budget">Lifetime Budget (£) *</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="budget"
              type="number"
              placeholder="5000"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="pl-9"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Lifetime budgets recommended for optimal delivery
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date *</Label>
          <Input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="endDate">End Date (Optional for testing)</Label>
        <Input
          id="endDate"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Testing phase: 10-day evaluation window recommended
        </p>
      </div>

      <Separator />

      {/* Interest/Adset Selection */}
      <div className="space-y-3">
        <Label>Adset Interest Categories *</Label>
        <p className="text-xs text-muted-foreground">
          Each selected interest creates a separate adset with the same creatives
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {CORE_INTEREST_CATEGORIES.map(interest => {
            const isDisabled = interest.id === "advantage_plus" && hasAfricaSelected;
            return (
              <div
                key={interest.id}
                className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedInterests.includes(interest.id) ? "border-primary bg-primary/5" : ""
                } ${isDisabled ? "opacity-50 cursor-not-allowed" : "hover:bg-accent"}`}
                onClick={() => !isDisabled && handleInterestToggle(interest.id)}
              >
                <Checkbox 
                  checked={selectedInterests.includes(interest.id)} 
                  disabled={isDisabled}
                />
                <div>
                  <p className="font-medium text-sm">{interest.name}</p>
                  <p className="text-xs text-muted-foreground">{interest.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Separator />

      {/* WhatsApp Add-on */}
      <div className="flex items-center justify-between p-3 border rounded-lg">
        <div className="flex items-center gap-3">
          <MessageSquare className="h-5 w-5 text-green-500" />
          <div>
            <p className="font-medium text-sm">WhatsApp Add-On</p>
            <p className="text-xs text-muted-foreground">Click-to-WhatsApp overlay on ads</p>
          </div>
        </div>
        <Checkbox
          checked={whatsappEnabled}
          onCheckedChange={(checked) => setWhatsappEnabled(checked as boolean)}
        />
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      {/* Content Types */}
      <div className="space-y-3">
        <Label>Content Types (Per Development)</Label>
        <p className="text-xs text-muted-foreground">
          Each development should include at least 4 content types for dynamic creative testing
        </p>
        <div className="grid grid-cols-2 gap-3">
          {CONTENT_TYPES.map(type => (
            <div
              key={type.id}
              className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                selectedContentTypes.includes(type.id) ? "border-primary bg-primary/5" : "hover:bg-accent"
              }`}
              onClick={() => setSelectedContentTypes(prev =>
                prev.includes(type.id) ? prev.filter(t => t !== type.id) : [...prev, type.id]
              )}
            >
              <div className="flex items-center gap-2">
                <Checkbox checked={selectedContentTypes.includes(type.id)} />
                <span className="font-medium text-sm">{type.name}</span>
                {type.required && <Badge variant="secondary" className="text-[10px]">Required</Badge>}
              </div>
              {type.description && (
                <p className="text-xs text-muted-foreground mt-1 ml-6">{type.description}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Messaging Angles */}
      <div className="space-y-3">
        <Label>Messaging Angles</Label>
        <p className="text-xs text-muted-foreground">
          Select angles to test in ad copy variations
        </p>
        {MESSAGING_ANGLES.map(angle => (
          <div
            key={angle.id}
            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
              selectedAngles.includes(angle.id) ? "border-primary bg-primary/5" : "hover:bg-accent"
            }`}
            onClick={() => setSelectedAngles(prev =>
              prev.includes(angle.id) ? prev.filter(a => a !== angle.id) : [...prev, angle.id]
            )}
          >
            <div className="flex items-center gap-2 mb-2">
              <Checkbox checked={selectedAngles.includes(angle.id)} />
              <span className="font-medium text-sm">{angle.group}</span>
            </div>
            <div className="flex flex-wrap gap-1 ml-6">
              {angle.themes.map(theme => (
                <Badge key={theme} variant="outline" className="text-[10px]">{theme}</Badge>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Separator />

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Campaign Notes</Label>
        <Textarea
          id="notes"
          placeholder="Any specific instructions or notes for this campaign..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <h3 className="font-semibold">Review Campaign Setup</h3>
        <p className="text-sm text-muted-foreground">Verify all settings before creating</p>
      </div>

      <div className="space-y-4">
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground text-sm">Campaign Name</span>
              <span className="font-mono text-sm">{campaignNamePreview}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground text-sm">Objective</span>
              <Badge>{objective === "leads" ? "Lead Generation" : "Engagement"}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground text-sm">Phase</span>
              <Badge variant="outline">{phase === "testing" ? "Testing" : "Scaling"}</Badge>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground text-sm">Budget</span>
              <span className="font-semibold">£{parseFloat(budget || "0").toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground text-sm">Start Date</span>
              <span>{startDate || "Not set"}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-3">
            <p className="font-medium text-sm">Targeting</p>
            <div>
              <span className="text-xs text-muted-foreground">Countries ({selectedCountries.length})</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {selectedCountries.slice(0, 8).map(code => (
                  <Badge key={code} variant="secondary" className="text-[10px]">
                    {COUNTRIES.find(c => c.code === code)?.name}
                  </Badge>
                ))}
                {selectedCountries.length > 8 && (
                  <Badge variant="outline" className="text-[10px]">+{selectedCountries.length - 8} more</Badge>
                )}
              </div>
            </div>
            {selectedCities.length > 0 && (
              <div>
                <span className="text-xs text-muted-foreground">Cities ({selectedCities.length})</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedCities.slice(0, 6).map(city => (
                    <Badge key={city} variant="outline" className="text-[10px]">{city}</Badge>
                  ))}
                  {selectedCities.length > 6 && (
                    <Badge variant="outline" className="text-[10px]">+{selectedCities.length - 6} more</Badge>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-3">
            <p className="font-medium text-sm">Adsets ({selectedInterests.length})</p>
            <div className="flex flex-wrap gap-1">
              {selectedInterests.map(id => (
                <Badge key={id} variant="secondary" className="text-[10px]">
                  {CORE_INTEREST_CATEGORIES.find(c => c.id === id)?.name}
                </Badge>
              ))}
            </div>
            {whatsappEnabled && (
              <div className="flex items-center gap-2 text-green-600">
                <MessageSquare className="h-4 w-4" />
                <span className="text-sm">WhatsApp Add-On enabled</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* UTM Preview */}
        <Card>
          <CardContent className="p-4">
            <p className="font-medium text-sm mb-2">UTM Parameters (Auto-generated)</p>
            <div className="bg-muted rounded p-2 font-mono text-xs space-y-1">
              <p>utm_campaign={campaignNamePreview}</p>
              <p>utm_source=facebook</p>
              <p>utm_medium=paid_social</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Step Indicator */}
      <div className="flex items-center justify-between px-2">
        {[1, 2, 3, 4, 5].map((s) => (
          <div key={s} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                s === step
                  ? "bg-primary text-primary-foreground"
                  : s < step
                  ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {s < step ? <Check className="h-4 w-4" /> : s}
            </div>
            {s < 5 && (
              <div
                className={`w-8 md:w-16 h-0.5 mx-1 ${
                  s < step ? "bg-primary" : "bg-muted"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Labels */}
      <div className="flex justify-between text-[10px] md:text-xs text-muted-foreground px-2">
        <span>Overview</span>
        <span>Targeting</span>
        <span>Budget</span>
        <span>Creative</span>
        <span>Review</span>
      </div>

      {/* Step Content */}
      <ScrollArea className="h-[400px] pr-4">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
        {step === 5 && renderStep5()}
      </ScrollArea>

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t">
        <Button
          variant="outline"
          onClick={() => step > 1 ? setStep(step - 1) : onClose?.()}
        >
          {step === 1 ? "Cancel" : "Back"}
        </Button>
        <Button
          onClick={() => step < 5 ? setStep(step + 1) : handleSubmit()}
        >
          {step === 5 ? "Create Campaign" : "Continue"}
          {step < 5 && <ChevronRight className="ml-1 h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
};

export default MetaCampaignBuilder;
