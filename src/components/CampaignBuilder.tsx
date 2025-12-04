import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Sparkles, Target, TrendingUp, DollarSign, Globe, Zap, Image, Video, FileText, CheckCircle2 } from "lucide-react";
import { useState } from "react";

const CampaignBuilder = () => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [campaignType, setCampaignType] = useState("");
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);

  const aiSuggestions = {
    targetMarkets: [
      { 
        name: "Nigerian HNWIs", 
        audience: "35-55, Income £100k+", 
        size: "2.4M",
        reasoning: "Nigeria has the largest economy in Africa with growing wealth. UK property is viewed as stable investment for capital preservation and education planning. This segment actively seeks premium developments with rental yield potential."
      },
      { 
        name: "UK Investors", 
        audience: "40-60, Property investors", 
        size: "1.8M",
        reasoning: "Established domestic investors seeking portfolio diversification and rental income. Price point aligns with their investment criteria. Location offers strong capital appreciation potential and tenant demand."
      },
      { 
        name: "Dubai Expats", 
        audience: "30-50, British expats", 
        size: "850K",
        reasoning: "British professionals in Dubai maintain strong UK ties and seek property for retirement planning or family use. Tax-advantaged income makes them ideal buyers. They value quality developments in familiar UK locations."
      }
    ],
    channels: [
      { 
        name: "Meta Ads", 
        budget: "£2,500", 
        roi: "4.2x",
        reach: "150k-200k",
        description: "Facebook & Instagram targeting high-net-worth individuals",
        recommended: true,
        reasoning: "Highest budget allocation justified by superior targeting capabilities for international HNWIs. Meta's audience segmentation allows precise location, income, and interest-based targeting across Nigeria, UK, and Dubai. Visual format ideal for showcasing premium property features. Expected 4.2x ROI based on engagement rates and lead quality from similar developments.",
        budgetJustification: "£2,500 supports comprehensive creative testing (3 ad sets × 5 variants) across target markets. Ensures sufficient daily budget (£83/day) to optimize algorithm learning and reach qualified prospects at scale."
      },
      { 
        name: "Google Ads", 
        budget: "£1,800", 
        roi: "3.8x",
        reach: "80k-120k",
        description: "Search ads targeting property investment keywords",
        recommended: true,
        reasoning: "Captures high-intent buyers actively searching for 'UK property investment', 'buy property [location]', and mortgage-related terms. Search ads convert better than display for consideration-stage buyers. £1,800 budget targets 50+ high-value keywords with avg CPC of £3-5, generating 360-600 qualified clicks monthly.",
        budgetJustification: "Budget sized to dominate search results for primary keywords while testing long-tail variations. Cost-per-acquisition analysis shows this investment generates 15-20 quality leads per month at acceptable CAC."
      },
      { 
        name: "LinkedIn Ads", 
        budget: "£1,200", 
        roi: "3.5x",
        reach: "40k-60k",
        description: "Professional network targeting business owners & executives",
        recommended: false,
        reasoning: "Targets verified professionals in finance, real estate, and business ownership roles. While reach is lower, audience quality is premium—matched to your target profile. Sponsored content and InMail allow direct engagement with decision-makers in key markets.",
        budgetJustification: "Higher CPM (£15-25) but justified by audience quality. Budget supports 2 campaigns: thought leadership content (£800) and direct InMail outreach (£400), generating 25-30 qualified leads monthly."
      },
      { 
        name: "TikTok Ads", 
        budget: "£500", 
        roi: "2.9x",
        reach: "200k-300k",
        description: "Short-form video content for younger investors",
        recommended: false,
        reasoning: "Emerging channel for reaching younger HNWIs (28-40) and first-time investors. Lowest CPC but requires different creative approach. Strong reach potential but less proven for property price point above £500k. Consider as experimental budget for brand awareness and long-term audience building.",
        budgetJustification: "Modest budget appropriate for testing creative formats and audience response. £500 generates significant reach (200k+) due to low CPM (£2-4), useful for top-of-funnel awareness before scaling investment."
      }
    ],
    creativeThemes: [
      {
        title: "Luxury Lifestyle & Investment Returns",
        description: "Showcase premium amenities, location benefits, and ROI potential",
        formats: ["Video tour", "Lifestyle photography", "ROI calculator"]
      },
      {
        title: "Community & Lifestyle Benefits",
        description: "Highlight neighborhood, schools, and community features",
        formats: ["Neighborhood guide", "Testimonials", "Amenity showcase"]
      },
      {
        title: "Financial Security & Growth",
        description: "Focus on investment value, appreciation potential, payment plans",
        formats: ["Market analysis", "Payment plan graphics", "Value projections"]
      }
    ],
    adCreatives: [
      { type: "Video", count: 3, description: "30-60s property tours with professional voiceover" },
      { type: "Carousel", count: 5, description: "Multi-image sets showcasing key features" },
      { type: "Static Image", count: 8, description: "High-quality lifestyle and property images" }
    ]
  };

  const toggleChannel = (channel: string) => {
    setSelectedChannels(prev =>
      prev.includes(channel)
        ? prev.filter(c => c !== channel)
        : [...prev, channel]
    );
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <Card className="p-4 md:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-4 md:mb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 md:h-6 md:w-6 text-primary" />
            <h2 className="text-lg md:text-2xl font-bold">AI-Powered Campaign Builder</h2>
          </div>
          <Badge variant="secondary" className="sm:ml-auto text-xs">Step 1 of 3</Badge>
        </div>

        <div className="space-y-4 md:space-y-6 mb-4 md:mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <div>
              <Label htmlFor="development" className="text-sm">Development Name *</Label>
              <Input id="development" placeholder="e.g., Marina Heights" className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="campaign-type" className="text-sm">Campaign Type *</Label>
              <Select value={campaignType} onValueChange={setCampaignType}>
                <SelectTrigger id="campaign-type" className="mt-1.5">
                  <SelectValue placeholder="Select campaign type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="launch">New Launch</SelectItem>
                  <SelectItem value="ongoing">Ongoing Sales</SelectItem>
                  <SelectItem value="final">Final Units</SelectItem>
                  <SelectItem value="resale">Resale Market</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <div>
              <Label htmlFor="location" className="text-sm">Location *</Label>
              <Input id="location" placeholder="e.g., Dubai Marina, London" className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="price" className="text-sm">Price Range *</Label>
              <Input id="price" placeholder="e.g., £500k - £2M" className="mt-1.5" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <div>
              <Label htmlFor="units" className="text-sm">Available Units</Label>
              <Input id="units" type="number" placeholder="e.g., 45" className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="completion" className="text-sm">Completion Date</Label>
              <Input id="completion" placeholder="e.g., Q4 2025" className="mt-1.5" />
            </div>
          </div>

          <div>
            <Label htmlFor="target" className="text-sm">Target Buyer Profile *</Label>
            <Textarea 
              id="target" 
              placeholder="e.g., International investors, 35-55 years old, high net worth, looking for UK property investment with rental yield"
              rows={3}
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="usp" className="text-sm">Unique Selling Points</Label>
            <Textarea 
              id="usp" 
              placeholder="e.g., Waterfront location, 5-star amenities, 7% guaranteed rental yield, prime city center location"
              rows={3}
              className="mt-1.5"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <div>
              <Label htmlFor="budget" className="text-sm">Monthly Budget</Label>
              <Input id="budget" placeholder="e.g., £5,000" className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="duration" className="text-sm">Campaign Duration</Label>
              <Select>
                <SelectTrigger id="duration" className="mt-1.5">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 month</SelectItem>
                  <SelectItem value="3">3 months</SelectItem>
                  <SelectItem value="6">6 months</SelectItem>
                  <SelectItem value="12">12 months</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Button 
          onClick={() => setShowSuggestions(true)} 
          className="w-full"
          size="lg"
        >
          <Sparkles className="mr-2 h-4 w-4 md:h-5 md:w-5" />
          Generate AI Campaign Strategy
        </Button>
      </Card>

      {showSuggestions && (
        <div className="space-y-4 md:space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <Card className="p-4 md:p-6 border-primary/50 border-2">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="h-5 w-5 md:h-6 md:w-6 text-green-600" />
              <h3 className="text-lg md:text-xl font-bold">AI Campaign Strategy Generated</h3>
            </div>
            <p className="text-muted-foreground text-sm">
              Based on your inputs, we've created a comprehensive campaign strategy optimized for your target audience.
            </p>
          </Card>

          {/* Target Markets */}
          <Card className="p-4 md:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                <h3 className="text-base md:text-xl font-bold">Target Market Segments</h3>
              </div>
              <Badge className="text-xs">AI Recommended</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
              {aiSuggestions.targetMarkets.map((market, index) => (
                <Card key={index} className="p-3 md:p-4 border-2 hover:border-primary/50 transition-all">
                  <div className="flex items-start gap-2 mb-2">
                    <Globe className="h-4 w-4 md:h-5 md:w-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-bold text-sm md:text-base">{market.name}</h4>
                      <p className="text-xs md:text-sm text-muted-foreground">{market.audience}</p>
                    </div>
                  </div>
                  <div className="mt-2 md:mt-3 pt-2 md:pt-3 border-t border-border">
                    <div className="text-[10px] md:text-xs text-muted-foreground mb-1">Potential Reach</div>
                    <div className="text-base md:text-lg font-bold text-primary mb-2 md:mb-3">{market.size}</div>
                    <div className="text-[10px] md:text-xs text-muted-foreground mb-1 font-medium">Why This Segment?</div>
                    <p className="text-[10px] md:text-xs text-muted-foreground leading-relaxed">{market.reasoning}</p>
                  </div>
                </Card>
              ))}
            </div>
          </Card>

          {/* Channel Strategy */}
          <Card className="p-4 md:p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-primary" />
              <h3 className="text-base md:text-xl font-bold">Recommended Channel Mix</h3>
            </div>
            <div className="space-y-3 md:space-y-4 mb-4 md:mb-6">
              {aiSuggestions.channels.map((channel, index) => (
                <Card 
                  key={index} 
                  className={`p-3 md:p-5 border-2 transition-all cursor-pointer ${
                    selectedChannels.includes(channel.name)
                      ? "border-primary bg-primary/5"
                      : "hover:border-primary/50"
                  }`}
                  onClick={() => toggleChannel(channel.name)}
                >
                  <div className="flex items-start gap-3 md:gap-4">
                    <Checkbox 
                      checked={selectedChannels.includes(channel.name)}
                      onCheckedChange={() => toggleChannel(channel.name)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-2 mb-2">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-bold text-sm md:text-lg">{channel.name}</h4>
                            {channel.recommended && (
                              <Badge variant="secondary" className="text-[10px] md:text-xs">Recommended</Badge>
                            )}
                          </div>
                          <p className="text-xs md:text-sm text-muted-foreground mt-0.5 md:mt-1">{channel.description}</p>
                        </div>
                        <Badge variant="outline" className="text-green-600 border-green-600 text-xs self-start">
                          {channel.roi} ROI
                        </Badge>
                      </div>
                      
                      <div className="mt-3 md:mt-4 p-2 md:p-3 bg-muted/30 rounded-lg border border-border">
                        <div className="text-[10px] md:text-xs font-medium text-foreground mb-1 md:mb-2">Why This Channel?</div>
                        <p className="text-[10px] md:text-xs text-muted-foreground leading-relaxed mb-2 md:mb-3">{channel.reasoning}</p>
                        <div className="text-[10px] md:text-xs font-medium text-foreground mb-1 md:mb-2">Budget Justification</div>
                        <p className="text-[10px] md:text-xs text-muted-foreground leading-relaxed">{channel.budgetJustification}</p>
                      </div>

                      <div className="grid grid-cols-3 gap-2 md:gap-4 mt-3 md:mt-4">
                        <div>
                          <div className="text-[10px] md:text-xs text-muted-foreground">Budget</div>
                          <div className="font-bold text-primary text-sm md:text-base">{channel.budget}/mo</div>
                        </div>
                        <div>
                          <div className="text-[10px] md:text-xs text-muted-foreground">Est. Reach</div>
                          <div className="font-bold text-sm md:text-base">{channel.reach}</div>
                        </div>
                        <div>
                          <div className="text-[10px] md:text-xs text-muted-foreground">Expected ROI</div>
                          <div className="font-bold text-green-600 text-sm md:text-base">{channel.roi}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            <div className="p-3 md:p-4 bg-primary/5 rounded-lg">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 sm:gap-2 mb-1 md:mb-2">
                <span className="font-medium text-sm md:text-base">Selected Channels Total</span>
                <span className="text-xl md:text-2xl font-bold text-primary">
                  £{selectedChannels.reduce((sum, channel) => {
                    const ch = aiSuggestions.channels.find(c => c.name === channel);
                    return sum + (ch ? parseInt(ch.budget.replace(/[£,]/g, '')) : 0);
                  }, 0).toLocaleString()}/month
                </span>
              </div>
              <div className="text-xs md:text-sm text-muted-foreground">
                {selectedChannels.length} channel{selectedChannels.length !== 1 ? 's' : ''} selected
              </div>
            </div>
          </Card>

          {/* Creative Strategy */}
          <Card className="p-4 md:p-6">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="h-4 w-4 md:h-5 md:w-5 text-primary" />
              <h3 className="text-base md:text-xl font-bold">Creative Strategy & Themes</h3>
            </div>
            <div className="space-y-3 md:space-y-4 mb-4 md:mb-6">
              {aiSuggestions.creativeThemes.map((theme, index) => (
                <Card key={index} className="p-3 md:p-5 border-2 border-border">
                  <div className="flex items-start gap-3 md:gap-4">
                    <div className="bg-primary/10 text-primary rounded-full w-8 h-8 md:w-10 md:h-10 flex items-center justify-center flex-shrink-0 font-bold text-sm md:text-base">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm md:text-lg mb-1 md:mb-2">{theme.title}</h4>
                      <p className="text-xs md:text-sm text-muted-foreground mb-2 md:mb-3">{theme.description}</p>
                      <div>
                        <div className="text-[10px] md:text-xs font-medium text-muted-foreground mb-1.5 md:mb-2">Recommended Formats:</div>
                        <div className="flex flex-wrap gap-1.5 md:gap-2">
                          {theme.formats.map((format, i) => (
                            <Badge key={i} variant="outline" className="text-[10px] md:text-xs">{format}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Card>

          {/* Recommended Ad Creatives */}
          <Card className="p-4 md:p-6">
            <div className="flex items-center gap-2 mb-4">
              <Image className="h-4 w-4 md:h-5 md:w-5 text-primary" />
              <h3 className="text-base md:text-xl font-bold">Recommended Ad Creatives</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
              {aiSuggestions.adCreatives.map((creative, index) => (
                <Card key={index} className="p-3 md:p-4 border-2 border-border text-center">
                  <div className="bg-primary/10 rounded-full w-10 h-10 md:w-12 md:h-12 flex items-center justify-center mx-auto mb-2 md:mb-3">
                    {creative.type === "Video" && <Video className="h-5 w-5 md:h-6 md:w-6 text-primary" />}
                    {creative.type === "Carousel" && <Image className="h-5 w-5 md:h-6 md:w-6 text-primary" />}
                    {creative.type === "Static Image" && <FileText className="h-5 w-5 md:h-6 md:w-6 text-primary" />}
                  </div>
                  <h4 className="font-bold text-sm md:text-base">{creative.type}</h4>
                  <div className="text-xl md:text-2xl font-bold text-primary my-1">{creative.count}</div>
                  <p className="text-[10px] md:text-xs text-muted-foreground">{creative.description}</p>
                </Card>
              ))}
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
            <Button variant="outline" className="flex-1 order-2 sm:order-1">
              Modify Strategy
            </Button>
            <Button className="flex-1 order-1 sm:order-2" size="lg">
              <Sparkles className="mr-2 h-4 w-4" />
              Continue to Campaign Setup
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignBuilder;