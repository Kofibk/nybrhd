import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Users, BarChart3, ArrowRight, ArrowLeft, Check, Plus, X, Sparkles, Calendar, MapPin, Upload, Image, FileText, Link2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { LogoWithTransparency } from "@/components/LogoWithTransparency";
import { toast } from "sonner";
import { LeadUploadModal } from "@/components/LeadUploadModal";

type UserType = "developer" | "agent" | "broker" | null;

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "admin" | "manager" | "agent";
}

const Onboarding = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [userType, setUserType] = useState<UserType>(null);
  
  // Step 1: Account Setup
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [subscriptionTier, setSubscriptionTier] = useState("professional");
  
  // Step 2: Team Setup
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState<"admin" | "manager" | "agent">("agent");
  
  // Step 3: First Development/Property/Product (varies by user type)
  // Developer fields
  const [developmentName, setDevelopmentName] = useState("");
  const [devCountry, setDevCountry] = useState("");
  const [devCity, setDevCity] = useState("");
  const [devArea, setDevArea] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [totalUnits, setTotalUnits] = useState("");
  const [availableUnits, setAvailableUnits] = useState("");
  const [bedrooms, setBedrooms] = useState<string[]>([]);
  const [devLogo, setDevLogo] = useState<File | null>(null);
  const [devHeroImage, setDevHeroImage] = useState<File | null>(null);
  const [devBrochure, setDevBrochure] = useState<File | null>(null);
  
  const logoInputRef = useRef<HTMLInputElement>(null);
  const heroInputRef = useRef<HTMLInputElement>(null);
  const brochureInputRef = useRef<HTMLInputElement>(null);
  
  // Agent fields
  const [agentFocusSegment, setAgentFocusSegment] = useState("");
  const [agentCoverageAreas, setAgentCoverageAreas] = useState("");
  const [agentPropertyTypes, setAgentPropertyTypes] = useState<string[]>([]);
  
  // Broker fields
  const [brokerProducts, setBrokerProducts] = useState<string[]>([]);
  const [brokerMinLoanValue, setBrokerMinLoanValue] = useState("");
  const [brokerTargetClients, setBrokerTargetClients] = useState("");
  
  // Step 4: Meta Pixel
  const [hasPixel, setHasPixel] = useState<boolean | null>(null);
  const [pixelId, setPixelId] = useState("");
  const [landingPageUrl, setLandingPageUrl] = useState("");
  
  // Step 5: Campaign Preferences
  const [campaignGoal, setCampaignGoal] = useState("leads");
  const [monthlyBudget, setMonthlyBudget] = useState("");
  const [targetRegions, setTargetRegions] = useState<string[]>(["uk"]);
  
  // Lead Upload Modal
  const [leadUploadModalOpen, setLeadUploadModalOpen] = useState(false);
  const [importedLeadsCount, setImportedLeadsCount] = useState(0);

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

  const subscriptionTiers = [
    { id: "starter", name: "Starter", price: "£1,500/mo", description: "For small teams getting started" },
    { id: "professional", name: "Professional", price: "£2,500/mo", description: "Most popular choice", recommended: true },
    { id: "enterprise", name: "Enterprise", price: "Custom", description: "For large organisations" }
  ];

  const regions = [
    { id: "uk", label: "UK" },
    { id: "europe", label: "Europe" },
    { id: "middle-east", label: "Middle East" },
    { id: "africa", label: "Africa" },
    { id: "americas", label: "Americas" },
    { id: "asia", label: "Asia" },
    { id: "other", label: "Other" }
  ];

  const addTeamMember = () => {
    if (newMemberName && newMemberEmail) {
      setTeamMembers([...teamMembers, {
        id: Date.now().toString(),
        name: newMemberName,
        email: newMemberEmail,
        role: newMemberRole
      }]);
      setNewMemberName("");
      setNewMemberEmail("");
      setNewMemberRole("agent");
    }
  };

  const removeTeamMember = (id: string) => {
    setTeamMembers(teamMembers.filter(m => m.id !== id));
  };

  const toggleRegion = (regionId: string) => {
    setTargetRegions(prev => 
      prev.includes(regionId) 
        ? prev.filter(r => r !== regionId)
        : [...prev, regionId]
    );
  };

  const toggleBedroom = (bed: string) => {
    setBedrooms(prev => 
      prev.includes(bed) 
        ? prev.filter(b => b !== bed)
        : [...prev, bed]
    );
  };

  const canProceed = () => {
    // All fields optional during build phase
    return true;
  };

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    toast.success("Onboarding complete! Welcome to Naybourhood.");
    const selected = userTypes.find(type => type.id === userType);
    if (selected) {
      navigate(selected.route);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-8">
      {[1, 2, 3, 4, 5].map((step) => (
        <div key={step} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
            step < currentStep 
              ? "bg-primary text-primary-foreground" 
              : step === currentStep 
                ? "bg-primary text-primary-foreground" 
                : "bg-muted text-muted-foreground"
          }`}>
            {step < currentStep ? <Check className="h-4 w-4" /> : step}
          </div>
          {step < 5 && (
            <div className={`w-8 md:w-12 h-0.5 ${step < currentStep ? "bg-primary" : "bg-muted"}`} />
          )}
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Welcome to Naybourhood</h2>
        <p className="text-muted-foreground">Let's set up your account</p>
      </div>

      {/* User Type Selection */}
      <div className="space-y-3">
        <Label className="text-base font-medium">What best describes you?</Label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {userTypes.map((type) => (
            <Card
              key={type.id}
              className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                userType === type.id
                  ? "border-2 border-primary shadow-lg"
                  : "border border-border"
              }`}
              onClick={() => setUserType(type.id as UserType)}
            >
              <type.icon className={`h-8 w-8 mb-2 ${
                userType === type.id ? "text-primary" : "text-muted-foreground"
              }`} />
              <h3 className="font-semibold text-sm">{type.title}</h3>
              <p className="text-xs text-muted-foreground">{type.description}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Company Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="companyName">Company Name *</Label>
          <Input 
            id="companyName" 
            value={companyName} 
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Your company name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contactName">Primary Contact Name *</Label>
          <Input 
            id="contactName" 
            value={contactName} 
            onChange={(e) => setContactName(e.target.value)}
            placeholder="Your full name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input 
            id="email" 
            type="email"
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone *</Label>
          <Input 
            id="phone" 
            value={phone} 
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+44 7XXX XXXXXX"
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="website">Company Website (optional)</Label>
          <Input 
            id="website" 
            value={website} 
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://yourcompany.com"
          />
        </div>
      </div>

      {/* Subscription Tier */}
      <div className="space-y-3">
        <Label className="text-base font-medium">Select your plan</Label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {subscriptionTiers.map((tier) => (
            <Card
              key={tier.id}
              className={`p-4 cursor-pointer transition-all relative ${
                subscriptionTier === tier.id
                  ? "border-2 border-primary shadow-lg"
                  : "border border-border"
              }`}
              onClick={() => setSubscriptionTier(tier.id)}
            >
              {tier.recommended && (
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                  Recommended
                </span>
              )}
              <h3 className="font-semibold">{tier.name}</h3>
              <p className="text-lg font-bold text-primary">{tier.price}</p>
              <p className="text-xs text-muted-foreground">{tier.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Team Setup</h2>
        <p className="text-muted-foreground">Add team members who'll use the platform (optional)</p>
      </div>

      {/* Add Team Member Form */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input 
              value={newMemberName}
              onChange={(e) => setNewMemberName(e.target.value)}
              placeholder="Team member name"
            />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input 
              type="email"
              value={newMemberEmail}
              onChange={(e) => setNewMemberEmail(e.target.value)}
              placeholder="their@email.com"
            />
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Select value={newMemberRole} onValueChange={(v: "admin" | "manager" | "agent") => setNewMemberRole(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="agent">Agent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={addTeamMember} disabled={!newMemberName || !newMemberEmail}>
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        </div>
      </Card>

      {/* Team Members List */}
      {teamMembers.length > 0 && (
        <div className="space-y-2">
          <Label className="text-base font-medium">Team Members ({teamMembers.length})</Label>
          <div className="space-y-2">
            {teamMembers.map((member) => (
              <Card key={member.id} className="p-3 flex items-center justify-between">
                <div>
                  <p className="font-medium">{member.name}</p>
                  <p className="text-sm text-muted-foreground">{member.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-muted px-2 py-1 rounded capitalize">{member.role}</span>
                  <Button variant="ghost" size="sm" onClick={() => removeTeamMember(member.id)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {teamMembers.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No team members added yet</p>
          <p className="text-sm">You can always add team members later from Settings</p>
        </div>
      )}
    </div>
  );

  const renderStep3Developer = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Your First Development</h2>
        <p className="text-muted-foreground">Tell us about the property you want to market</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2 md:col-span-2">
          <Label>Development Name *</Label>
          <Input 
            value={developmentName}
            onChange={(e) => setDevelopmentName(e.target.value)}
            placeholder="e.g., Kensington Square"
          />
        </div>

        <div className="space-y-2">
          <Label>Country *</Label>
          <Select value={devCountry} onValueChange={setDevCountry}>
            <SelectTrigger>
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="uk">United Kingdom</SelectItem>
              <SelectItem value="uae">UAE</SelectItem>
              <SelectItem value="spain">Spain</SelectItem>
              <SelectItem value="portugal">Portugal</SelectItem>
              <SelectItem value="turkey">Turkey</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>City *</Label>
          <Input 
            value={devCity}
            onChange={(e) => setDevCity(e.target.value)}
            placeholder="e.g., London"
          />
        </div>

        <div className="space-y-2">
          <Label>Specific Area</Label>
          <Input 
            value={devArea}
            onChange={(e) => setDevArea(e.target.value)}
            placeholder="e.g., Kensington"
          />
        </div>

        <div className="space-y-2">
          <Label>Property Type *</Label>
          <Select value={propertyType} onValueChange={setPropertyType}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="apartments">Apartments</SelectItem>
              <SelectItem value="houses">Houses</SelectItem>
              <SelectItem value="townhouses">Townhouses</SelectItem>
              <SelectItem value="penthouses">Penthouses</SelectItem>
              <SelectItem value="mixed">Mixed Use</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Minimum Price (£) *</Label>
          <Input 
            type="number"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="e.g., 500000"
          />
        </div>

        <div className="space-y-2">
          <Label>Maximum Price (£) *</Label>
          <Input 
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="e.g., 2000000"
          />
        </div>

        <div className="space-y-2">
          <Label>Total Units</Label>
          <Input 
            type="number"
            value={totalUnits}
            onChange={(e) => setTotalUnits(e.target.value)}
            placeholder="e.g., 50"
          />
        </div>

        <div className="space-y-2">
          <Label>Available Units</Label>
          <Input 
            type="number"
            value={availableUnits}
            onChange={(e) => setAvailableUnits(e.target.value)}
            placeholder="e.g., 35"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label>Bedrooms Available *</Label>
          <div className="flex flex-wrap gap-2">
            {["Studio", "1 Bed", "2 Bed", "3 Bed", "4+ Bed"].map((bed) => (
              <Button
                key={bed}
                variant={bedrooms.includes(bed) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleBedroom(bed)}
              >
                {bed}
              </Button>
            ))}
          </div>
        </div>

        {/* File Uploads */}
        <div className="md:col-span-2 pt-4 border-t">
          <Label className="text-base font-medium mb-3 block">Development Assets (optional)</Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Logo Upload */}
            <div 
              className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors"
              onClick={() => logoInputRef.current?.click()}
            >
              <input 
                ref={logoInputRef}
                type="file" 
                accept="image/*"
                className="hidden"
                onChange={(e) => setDevLogo(e.target.files?.[0] || null)}
              />
              {devLogo ? (
                <div className="space-y-2">
                  <div className="w-12 h-12 mx-auto bg-primary/10 rounded-lg flex items-center justify-center">
                    <Image className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-sm font-medium truncate">{devLogo.name}</p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={(e) => { e.stopPropagation(); setDevLogo(null); }}
                  >
                    <X className="h-3 w-3 mr-1" /> Remove
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                  <p className="text-sm font-medium">Development Logo</p>
                  <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
                </div>
              )}
            </div>

            {/* Hero Image Upload */}
            <div 
              className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors"
              onClick={() => heroInputRef.current?.click()}
            >
              <input 
                ref={heroInputRef}
                type="file" 
                accept="image/*"
                className="hidden"
                onChange={(e) => setDevHeroImage(e.target.files?.[0] || null)}
              />
              {devHeroImage ? (
                <div className="space-y-2">
                  <div className="w-12 h-12 mx-auto bg-primary/10 rounded-lg flex items-center justify-center">
                    <Image className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-sm font-medium truncate">{devHeroImage.name}</p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={(e) => { e.stopPropagation(); setDevHeroImage(null); }}
                  >
                    <X className="h-3 w-3 mr-1" /> Remove
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                  <p className="text-sm font-medium">Hero Image</p>
                  <p className="text-xs text-muted-foreground">PNG, JPG up to 10MB</p>
                </div>
              )}
            </div>

            {/* Brochure Upload */}
            <div 
              className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors"
              onClick={() => brochureInputRef.current?.click()}
            >
              <input 
                ref={brochureInputRef}
                type="file" 
                accept=".pdf"
                className="hidden"
                onChange={(e) => setDevBrochure(e.target.files?.[0] || null)}
              />
              {devBrochure ? (
                <div className="space-y-2">
                  <div className="w-12 h-12 mx-auto bg-primary/10 rounded-lg flex items-center justify-center">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-sm font-medium truncate">{devBrochure.name}</p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={(e) => { e.stopPropagation(); setDevBrochure(null); }}
                  >
                    <X className="h-3 w-3 mr-1" /> Remove
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                  <p className="text-sm font-medium">Brochure PDF</p>
                  <p className="text-xs text-muted-foreground">PDF up to 20MB</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3Agent = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Your Agency Details</h2>
        <p className="text-muted-foreground">Tell us about your focus and coverage</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2 md:col-span-2">
          <Label>Primary Focus Segment *</Label>
          <Select value={agentFocusSegment} onValueChange={setAgentFocusSegment}>
            <SelectTrigger>
              <SelectValue placeholder="Select your main focus" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new-builds">New Builds</SelectItem>
              <SelectItem value="resales">Resales</SelectItem>
              <SelectItem value="lettings">Lettings</SelectItem>
              <SelectItem value="luxury">Luxury Properties</SelectItem>
              <SelectItem value="commercial">Commercial</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label>Coverage Areas *</Label>
          <Input 
            value={agentCoverageAreas}
            onChange={(e) => setAgentCoverageAreas(e.target.value)}
            placeholder="e.g., Central London, Canary Wharf, Greenwich"
          />
          <p className="text-xs text-muted-foreground">Separate multiple areas with commas</p>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label>Property Types You Handle</Label>
          <div className="flex flex-wrap gap-2">
            {["Apartments", "Houses", "Townhouses", "Penthouses", "Commercial"].map((type) => (
              <Button
                key={type}
                variant={agentPropertyTypes.includes(type) ? "default" : "outline"}
                size="sm"
                onClick={() => setAgentPropertyTypes(prev => 
                  prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
                )}
              >
                {type}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3Broker = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Your Products & Services</h2>
        <p className="text-muted-foreground">Tell us what mortgage products you offer</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <Label>Products You Offer *</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {["Residential Mortgages", "Buy-to-Let", "Bridging Loans", "Commercial Mortgages", "Life Insurance", "Home Insurance"].map((product) => (
              <Button
                key={product}
                variant={brokerProducts.includes(product) ? "default" : "outline"}
                size="sm"
                className="justify-start"
                onClick={() => setBrokerProducts(prev => 
                  prev.includes(product) ? prev.filter(p => p !== product) : [...prev, product]
                )}
              >
                {product}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Minimum Loan Value (£)</Label>
          <Input 
            type="number"
            value={brokerMinLoanValue}
            onChange={(e) => setBrokerMinLoanValue(e.target.value)}
            placeholder="e.g., 100000"
          />
        </div>

        <div className="space-y-2">
          <Label>Target Client Profile</Label>
          <Select value={brokerTargetClients} onValueChange={setBrokerTargetClients}>
            <SelectTrigger>
              <SelectValue placeholder="Select your target clients" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="first-time">First-Time Buyers</SelectItem>
              <SelectItem value="investors">Property Investors</SelectItem>
              <SelectItem value="hnwi">High Net Worth Individuals</SelectItem>
              <SelectItem value="expats">Expats & International</SelectItem>
              <SelectItem value="all">All Clients</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => {
    if (userType === "developer") return renderStep3Developer();
    if (userType === "agent") return renderStep3Agent();
    if (userType === "broker") return renderStep3Broker();
    
    // Fallback if no user type selected
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <Building2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
          <h2 className="text-2xl font-bold mb-2">Select Your Role First</h2>
          <p className="text-muted-foreground mb-6">
            Please go back to Step 1 and select whether you're a Developer, Estate Agent, or Mortgage Broker.
          </p>
          <Button variant="outline" onClick={() => setCurrentStep(1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go to Step 1
          </Button>
        </div>
      </div>
    );
  };

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Meta Pixel Setup</h2>
        <p className="text-muted-foreground">Connect your tracking for better campaign performance</p>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <Label className="text-base font-medium">Do you have a Meta Pixel ID?</Label>
          <RadioGroup 
            value={hasPixel === null ? "" : hasPixel ? "yes" : "no"} 
            onValueChange={(v) => setHasPixel(v === "yes")}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="pixel-yes" />
              <Label htmlFor="pixel-yes">Yes, I have a Pixel ID</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="pixel-no" />
              <Label htmlFor="pixel-no">No, I need help setting one up</Label>
            </div>
          </RadioGroup>
        </div>

        {hasPixel === true && (
          <div className="mt-4 space-y-2">
            <Label>Enter your Pixel ID</Label>
            <Input 
              value={pixelId}
              onChange={(e) => setPixelId(e.target.value)}
              placeholder="e.g., 1234567890123456"
            />
          </div>
        )}

        {hasPixel === false && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              No worries! We'll help you create a Meta Pixel during your onboarding call, or you can set it up later in Settings.
            </p>
          </div>
        )}
      </Card>

      <div className="space-y-2">
        <Label>Landing Page URL (optional)</Label>
        <Input 
          value={landingPageUrl}
          onChange={(e) => setLandingPageUrl(e.target.value)}
          placeholder="https://yourdevelopment.com/enquiry"
        />
        <p className="text-xs text-muted-foreground">Where should your ads send traffic? You can change this per campaign later.</p>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Campaign Preferences</h2>
        <p className="text-muted-foreground">Help us understand your marketing goals</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
          <Label className="text-base font-medium">What's your primary campaign goal?</Label>
          <RadioGroup value={campaignGoal} onValueChange={setCampaignGoal}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="leads" id="goal-leads" />
              <Label htmlFor="goal-leads" className="flex items-center gap-2">
                Generate qualified buyer leads
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">Recommended</span>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="awareness" id="goal-awareness" />
              <Label htmlFor="goal-awareness">Build brand awareness</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="both" id="goal-both" />
              <Label htmlFor="goal-both">Both leads and awareness</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-3">
          <Label className="text-base font-medium">What's your typical monthly ad budget?</Label>
          <RadioGroup value={monthlyBudget} onValueChange={setMonthlyBudget}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="5k-10k" id="budget-1" />
              <Label htmlFor="budget-1">£5,000 - £10,000</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="10k-20k" id="budget-2" />
              <Label htmlFor="budget-2">£10,000 - £20,000</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="20k-50k" id="budget-3" />
              <Label htmlFor="budget-3">£20,000 - £50,000</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="50k+" id="budget-4" />
              <Label htmlFor="budget-4">£50,000+</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-3">
          <Label className="text-base font-medium">Which regions do you primarily sell to?</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {regions.map((region) => (
              <div key={region.id} className="flex items-center space-x-2">
                <Checkbox 
                  id={region.id}
                  checked={targetRegions.includes(region.id)}
                  onCheckedChange={() => toggleRegion(region.id)}
                />
                <Label htmlFor={region.id} className="text-sm">{region.label}</Label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderComplete = () => (
    <div className="text-center space-y-8 py-8">
      <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
        <Sparkles className="h-10 w-10 text-primary" />
      </div>
      
      <div>
        <h2 className="text-3xl font-bold mb-3">Almost There!</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          To get started with lead scoring and identify your priority leads, upload your existing leads or connect a lead source.
        </p>
      </div>

      {/* Lead Upload/Connect Section */}
      <Card className="p-6 text-left max-w-xl mx-auto border-2 border-dashed border-primary/30 bg-primary/5">
        <div className="text-center space-y-4">
          <div className="flex justify-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Users className="h-6 w-6 text-primary" />
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-1">Import Your Leads</h3>
            <p className="text-sm text-muted-foreground">
              Upload a CSV file or connect your lead sources to get instant lead scoring and know who to prioritise
            </p>
          </div>

          {importedLeadsCount > 0 ? (
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-sm font-medium text-green-600 flex items-center justify-center gap-2">
                <Check className="h-4 w-4" />
                {importedLeadsCount} leads imported and scored
              </p>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                variant="default"
                onClick={() => setLeadUploadModalOpen(true)}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Leads CSV
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  toast.success("Navigating to lead sources...");
                  const selected = userTypes.find(type => type.id === userType);
                  if (selected) {
                    navigate(`${selected.route}?tab=settings&section=lead-sources`);
                  }
                }}
              >
                <Link2 className="h-4 w-4 mr-2" />
                Connect Lead Sources
              </Button>
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            You can also do this later from Settings → Lead Sources
          </p>
        </div>
      </Card>

      {/* Lead Upload Modal */}
      <LeadUploadModal 
        open={leadUploadModalOpen} 
        onOpenChange={setLeadUploadModalOpen}
        onImportComplete={(count) => {
          setImportedLeadsCount(count);
          toast.success(`${count} leads imported and scored!`);
        }}
      />

      {/* Divider */}
      <div className="flex items-center gap-4 max-w-md mx-auto">
        <div className="flex-1 h-px bg-border" />
        <span className="text-sm text-muted-foreground">or get started with</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Action Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
        <Card 
          className="p-4 text-left hover:shadow-md hover:border-primary/50 transition-all cursor-pointer group" 
          onClick={() => {
            toast.success("Let's create your first campaign!");
            const selected = userTypes.find(type => type.id === userType);
            if (selected) {
              navigate(`${selected.route}?action=new-campaign`);
            }
          }}
        >
          <Building2 className="h-8 w-8 text-primary mb-2 group-hover:scale-110 transition-transform" />
          <h3 className="font-semibold">Create Your First Campaign</h3>
          <p className="text-xs text-muted-foreground">Launch ads and start generating leads</p>
        </Card>
        
        <Card 
          className="p-4 text-left hover:shadow-md hover:border-primary/50 transition-all cursor-pointer group"
          onClick={() => {
            window.open("https://calendly.com/naybourhood/onboarding", "_blank");
            toast.success("Opening booking page...");
          }}
        >
          <Calendar className="h-8 w-8 text-primary mb-2 group-hover:scale-110 transition-transform" />
          <h3 className="font-semibold">Book Onboarding Call</h3>
          <p className="text-xs text-muted-foreground">Get a walkthrough with our team</p>
        </Card>
        
        <Card 
          className="p-4 text-left hover:shadow-md hover:border-primary/50 transition-all cursor-pointer group" 
          onClick={handleComplete}
        >
          <MapPin className="h-8 w-8 text-primary mb-2 group-hover:scale-110 transition-transform" />
          <h3 className="font-semibold">Explore Dashboard</h3>
          <p className="text-xs text-muted-foreground">See your analytics and leads</p>
        </Card>
      </div>

      <Button variant="ghost" onClick={handleComplete} className="text-muted-foreground">
        Skip for now → Go to Dashboard
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-3xl w-full">
        <div className="text-center mb-6">
          <LogoWithTransparency className="h-10 w-auto mx-auto mb-4" variant="white" />
        </div>

        {currentStep <= 5 && renderStepIndicator()}

        <Card className="p-6 md:p-8">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
          {currentStep === 5 && renderStep5()}
          {currentStep === 6 && renderComplete()}

          {currentStep <= 5 && (
            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button 
                variant="outline" 
                onClick={handleBack}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              
              <div className="flex gap-2">
                {currentStep === 2 && (
                  <Button variant="ghost" onClick={handleNext}>
                    Skip for now
                  </Button>
                )}
                {currentStep === 4 && (
                  <Button variant="ghost" onClick={handleNext}>
                    Skip for now
                  </Button>
                )}
                {currentStep < 5 ? (
                  <Button onClick={handleNext} disabled={!canProceed()}>
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button onClick={() => setCurrentStep(6)} disabled={!canProceed()}>
                    Complete Onboarding
                    <Check className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          )}
        </Card>

        {currentStep <= 5 && (
          <p className="text-center text-xs text-muted-foreground mt-4">
            Step {currentStep} of 5
          </p>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
