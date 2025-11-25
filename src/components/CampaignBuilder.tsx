import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Target, TrendingUp, DollarSign, Globe, Zap } from "lucide-react";
import { useState } from "react";

const CampaignBuilder = () => {
  const [showSuggestions, setShowSuggestions] = useState(false);

  const aiSuggestions = {
    targetMarkets: ["Nigerian HNWIs", "UK Investors", "Dubai Expats"],
    channels: [
      { name: "Meta Ads", budget: "£2,500", roi: "4.2x" },
      { name: "Google Ads", budget: "£1,800", roi: "3.8x" },
      { name: "LinkedIn", budget: "£1,200", roi: "3.5x" },
      { name: "TikTok", budget: "£500", roi: "2.9x" }
    ],
    creativeThemes: [
      "Luxury Lifestyle & Investment Returns",
      "Community & Lifestyle Benefits",
      "Financial Security & Growth"
    ]
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">AI Campaign Builder</h2>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <Label htmlFor="development">Development Name</Label>
            <Input id="development" placeholder="e.g., Marina Heights" />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="location">Location</Label>
              <Input id="location" placeholder="e.g., Dubai Marina" />
            </div>
            <div>
              <Label htmlFor="price">Price Range</Label>
              <Input id="price" placeholder="e.g., £500k - £2M" />
            </div>
          </div>
          <div>
            <Label htmlFor="target">Target Buyer Profile</Label>
            <Input id="target" placeholder="e.g., International investors, 35-55, HNW" />
          </div>
        </div>

        <Button 
          onClick={() => setShowSuggestions(true)} 
          className="w-full"
          size="lg"
        >
          <Sparkles className="mr-2 h-5 w-5" />
          Generate AI Campaign Suggestions
        </Button>
      </Card>

      {showSuggestions && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          {/* Target Markets */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Target className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-bold">Recommended Target Markets</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {aiSuggestions.targetMarkets.map((market) => (
                <Badge key={market} variant="secondary" className="text-base py-2 px-4">
                  <Globe className="mr-2 h-4 w-4" />
                  {market}
                </Badge>
              ))}
            </div>
          </Card>

          {/* Channel Strategy */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-bold">Channel & Budget Allocation</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {aiSuggestions.channels.map((channel) => (
                <Card key={channel.name} className="p-4 border-2 hover:border-primary/50 transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold">{channel.name}</h4>
                    <Badge variant="outline">{channel.roi} ROI</Badge>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <DollarSign className="h-4 w-4" />
                    <span>{channel.budget}/month</span>
                  </div>
                </Card>
              ))}
            </div>
            <div className="mt-4 p-4 bg-primary/5 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Monthly Budget</span>
                <span className="text-2xl font-bold text-primary">£6,000</span>
              </div>
            </div>
          </Card>

          {/* Creative Themes */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-bold">AI-Generated Creative Themes</h3>
            </div>
            <div className="space-y-3">
              {aiSuggestions.creativeThemes.map((theme, index) => (
                <div key={index} className="p-4 border border-border rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 text-primary rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                      {index + 1}
                    </div>
                    <p className="font-medium">{theme}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div className="flex gap-4">
            <Button size="lg" className="flex-1">
              Launch Campaign
            </Button>
            <Button size="lg" variant="outline" className="flex-1">
              Save as Draft
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignBuilder;
