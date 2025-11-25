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
      { name: "Nigerian HNWIs", audience: "35-55, Income £100k+", size: "2.4M" },
      { name: "UK Investors", audience: "40-60, Property investors", size: "1.8M" },
      { name: "Dubai Expats", audience: "30-50, British expats", size: "850K" }
    ],
    channels: [
      { 
        name: "Meta Ads", 
        budget: "£2,500", 
        roi: "4.2x",
        reach: "150k-200k",
        description: "Facebook & Instagram targeting high-net-worth individuals",
        recommended: true
      },
      { 
        name: "Google Ads", 
        budget: "£1,800", 
        roi: "3.8x",
        reach: "80k-120k",
        description: "Search ads targeting property investment keywords",
        recommended: true
      },
      { 
        name: "LinkedIn Ads", 
        budget: "£1,200", 
        roi: "3.5x",
        reach: "40k-60k",
        description: "Professional network targeting business owners & executives",
        recommended: false
      },
      { 
        name: "TikTok Ads", 
        budget: "£500", 
        roi: "2.9x",
        reach: "200k-300k",
        description: "Short-form video content for younger investors",
        recommended: false
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
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">AI-Powered Campaign Builder</h2>
          <Badge variant="secondary" className="ml-auto">Step 1 of 3</Badge>
        </div>

        <div className="space-y-6 mb-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="development">Development Name *</Label>
              <Input id="development" placeholder="e.g., Marina Heights" />
            </div>
            <div>
              <Label htmlFor="campaign-type">Campaign Type *</Label>
              <Select value={campaignType} onValueChange={setCampaignType}>
                <SelectTrigger id="campaign-type">
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

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="location">Location *</Label>
              <Input id="location" placeholder="e.g., Dubai Marina, London" />
            </div>
            <div>
              <Label htmlFor="price">Price Range *</Label>
              <Input id="price" placeholder="e.g., £500k - £2M" />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="units">Available Units</Label>
              <Input id="units" type="number" placeholder="e.g., 45" />
            </div>
            <div>
              <Label htmlFor="completion">Completion Date</Label>
              <Input id="completion" placeholder="e.g., Q4 2025" />
            </div>
          </div>

          <div>
            <Label htmlFor="target">Target Buyer Profile *</Label>
            <Textarea 
              id="target" 
              placeholder="e.g., International investors, 35-55 years old, high net worth, looking for UK property investment with rental yield"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="usp">Unique Selling Points</Label>
            <Textarea 
              id="usp" 
              placeholder="e.g., Waterfront location, 5-star amenities, 7% guaranteed rental yield, prime city center location"
              rows={3}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="budget">Monthly Budget</Label>
              <Input id="budget" placeholder="e.g., £5,000" />
            </div>
            <div>
              <Label htmlFor="duration">Campaign Duration</Label>
              <Select>
                <SelectTrigger id="duration">
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
          <Sparkles className="mr-2 h-5 w-5" />
          Generate AI Campaign Strategy
        </Button>
      </Card>

      {showSuggestions && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <Card className="p-6 border-primary/50 border-2">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
              <h3 className="text-xl font-bold">AI Campaign Strategy Generated</h3>
            </div>
            <p className="text-muted-foreground">
              Based on your inputs, we've created a comprehensive campaign strategy optimized for your target audience.
            </p>
          </Card>

          {/* Target Markets */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-bold">Target Market Segments</h3>
              </div>
              <Badge>AI Recommended</Badge>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {aiSuggestions.targetMarkets.map((market, index) => (
                <Card key={index} className="p-4 border-2 hover:border-primary/50 transition-all">
                  <div className="flex items-start gap-2 mb-2">
                    <Globe className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <h4 className="font-bold">{market.name}</h4>
                      <p className="text-sm text-muted-foreground">{market.audience}</p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-border">
                    <div className="text-xs text-muted-foreground">Potential Reach</div>
                    <div className="text-lg font-bold text-primary">{market.size}</div>
                  </div>
                </Card>
              ))}
            </div>
          </Card>

          {/* Channel Strategy */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-bold">Recommended Channel Mix</h3>
            </div>
            <div className="space-y-4 mb-6">
              {aiSuggestions.channels.map((channel, index) => (
                <Card 
                  key={index} 
                  className={`p-5 border-2 transition-all cursor-pointer ${
                    selectedChannels.includes(channel.name)
                      ? "border-primary bg-primary/5"
                      : "hover:border-primary/50"
                  }`}
                  onClick={() => toggleChannel(channel.name)}
                >
                  <div className="flex items-start gap-4">
                    <Checkbox 
                      checked={selectedChannels.includes(channel.name)}
                      onCheckedChange={() => toggleChannel(channel.name)}
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-lg">{channel.name}</h4>
                            {channel.recommended && (
                              <Badge variant="secondary" className="text-xs">Recommended</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{channel.description}</p>
                        </div>
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          {channel.roi} ROI
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 mt-4">
                        <div>
                          <div className="text-xs text-muted-foreground">Budget</div>
                          <div className="font-bold text-primary">{channel.budget}/mo</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Est. Reach</div>
                          <div className="font-bold">{channel.reach}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Expected ROI</div>
                          <div className="font-bold text-green-600">{channel.roi}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            <div className="p-4 bg-primary/5 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Selected Channels Total</span>
                <span className="text-2xl font-bold text-primary">
                  £{selectedChannels.reduce((sum, channel) => {
                    const ch = aiSuggestions.channels.find(c => c.name === channel);
                    return sum + (ch ? parseInt(ch.budget.replace(/[£,]/g, '')) : 0);
                  }, 0).toLocaleString()}/month
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                {selectedChannels.length} channel{selectedChannels.length !== 1 ? 's' : ''} selected
              </div>
            </div>
          </Card>

          {/* Creative Strategy */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-bold">Creative Strategy & Themes</h3>
            </div>
            <div className="space-y-4 mb-6">
              {aiSuggestions.creativeThemes.map((theme, index) => (
                <Card key={index} className="p-5 border-2 border-border">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 text-primary rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-lg mb-2">{theme.title}</h4>
                      <p className="text-sm text-muted-foreground mb-3">{theme.description}</p>
                      <div>
                        <div className="text-xs font-medium text-muted-foreground mb-2">Recommended Formats:</div>
                        <div className="flex flex-wrap gap-2">
                          {theme.formats.map((format, i) => (
                            <Badge key={i} variant="outline">{format}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Card>

          {/* Ad Creatives */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Image className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-bold">AI-Generated Ad Creatives</h3>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {aiSuggestions.adCreatives.map((creative, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    {creative.type === "Video" && <Video className="h-5 w-5 text-primary" />}
                    {creative.type === "Carousel" && <Image className="h-5 w-5 text-primary" />}
                    {creative.type === "Static Image" && <FileText className="h-5 w-5 text-primary" />}
                    <div>
                      <h4 className="font-bold">{creative.type}</h4>
                      <div className="text-sm text-muted-foreground">{creative.count} variants</div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{creative.description}</p>
                </Card>
              ))}
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="grid md:grid-cols-3 gap-4">
            <Button size="lg" variant="outline" className="w-full">
              <FileText className="mr-2 h-4 w-4" />
              Save as Draft
            </Button>
            <Button size="lg" variant="outline" className="w-full">
              Export Strategy
            </Button>
            <Button size="lg" className="w-full">
              <Sparkles className="mr-2 h-4 w-4" />
              Launch Campaign
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignBuilder;
