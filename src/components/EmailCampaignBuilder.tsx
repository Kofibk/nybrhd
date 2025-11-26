import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Send, Clock, Users, Target, RefreshCw } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const mockAIGeneratedContent = {
  subject: "Discover Your Dream Home in Victoria Gardens",
  body: `Hi {{firstName}},

I hope this email finds you well! I wanted to reach out personally because I noticed you've been exploring luxury properties in Lagos.

We have something truly special at Victoria Gardens that I believe would be perfect for you:

🏡 **Premium 3-Bedroom Residences**
• 180-200 sqm of modern living space
• Breathtaking ocean views from every room
• World-class finishes and smart home technology
• Starting from ₦85M with flexible payment plans

What makes Victoria Gardens unique is the lifestyle it offers - a perfect blend of luxury, security, and convenience. You're just 10 minutes from Lekki Phase 1, surrounded by top schools, shopping, and entertainment.

I'd love to arrange a private viewing for you this week. We have a few exclusive units that haven't been released to the public yet.

When would work best for you?

Best regards,
{{agentName}}
{{agentTitle}}`,
  variations: [
    {
      tone: "Professional",
      subject: "Exclusive Property Opportunity in Victoria Gardens",
    },
    {
      tone: "Friendly",
      subject: "Your Perfect Home Awaits at Victoria Gardens 🏡",
    },
    {
      tone: "Urgent",
      subject: "Last Chance: Premium Units at Victoria Gardens",
    },
  ],
};

const EmailCampaignBuilder = () => {
  const { toast } = useToast();
  const [campaignName, setCampaignName] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateContent = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setEmailSubject(mockAIGeneratedContent.subject);
      setEmailBody(mockAIGeneratedContent.body);
      setIsGenerating(false);
      toast({
        title: "AI Content Generated",
        description: "Email content has been generated successfully!",
      });
    }, 1500);
  };

  const handleSendTest = () => {
    toast({
      title: "Test Email Sent",
      description: "A test email has been sent to your inbox.",
    });
  };

  const handleSaveCampaign = () => {
    toast({
      title: "Campaign Saved",
      description: `"${campaignName}" has been saved as a draft.`,
    });
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-bold">AI Email Campaign Builder</h3>
            <p className="text-sm text-muted-foreground">
              Generate personalized email campaigns with AI
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Campaign Settings */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="campaignName">Campaign Name</Label>
              <Input
                id="campaignName"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                placeholder="Victoria Gardens Launch Campaign"
              />
            </div>

            <div>
              <Label htmlFor="targetAudience">Target Audience</Label>
              <Select value={targetAudience} onValueChange={setTargetAudience}>
                <SelectTrigger>
                  <SelectValue placeholder="Select audience segment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Leads</SelectItem>
                  <SelectItem value="qualified">Qualified Leads (Score 70+)</SelectItem>
                  <SelectItem value="viewing">Leads with Viewing Scheduled</SelectItem>
                  <SelectItem value="international">International Buyers</SelectItem>
                  <SelectItem value="hnwi">High Net Worth Individuals</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="property">Property/Development</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select property" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="victoria">Victoria Gardens, Lagos</SelectItem>
                  <SelectItem value="canary">Canary Wharf, London</SelectItem>
                  <SelectItem value="palm">Palm Jumeirah, Dubai</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="tone">Email Tone</Label>
              <Select defaultValue="professional">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="friendly">Friendly</SelectItem>
                  <SelectItem value="luxury">Luxury & Exclusive</SelectItem>
                  <SelectItem value="urgent">Urgent & Time-Sensitive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="language">Language</Label>
              <Select defaultValue="english">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="arabic">Arabic</SelectItem>
                  <SelectItem value="chinese">Chinese</SelectItem>
                  <SelectItem value="french">French</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleGenerateContent}
              disabled={isGenerating}
              className="w-full"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate AI Content
                </>
              )}
            </Button>
          </div>

          {/* Email Preview */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="subject">Email Subject</Label>
              <Input
                id="subject"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="Click 'Generate AI Content' to create subject line"
              />
            </div>

            <div>
              <Label htmlFor="body">Email Body</Label>
              <Textarea
                id="body"
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                placeholder="Click 'Generate AI Content' to create email body"
                rows={15}
                className="font-mono text-sm"
              />
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleSendTest} className="flex-1">
                <Send className="mr-2 h-4 w-4" />
                Send Test
              </Button>
              <Button onClick={handleSaveCampaign} className="flex-1">
                Save Campaign
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* AI Variations */}
      {emailSubject && (
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">AI-Generated Variations</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {mockAIGeneratedContent.variations.map((variation, index) => (
              <Card key={index} className="p-4 cursor-pointer hover:border-primary transition-colors">
                <Badge variant="outline" className="mb-2">
                  {variation.tone}
                </Badge>
                <p className="text-sm font-medium">{variation.subject}</p>
              </Card>
            ))}
          </div>
        </Card>
      )}

      {/* Personalization Tokens */}
      <Card className="p-6 bg-muted/30">
        <h3 className="font-semibold mb-3">Personalization Tokens</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Use these tokens in your email to personalize content for each recipient:
        </p>
        <div className="flex flex-wrap gap-2">
          {[
            "{{firstName}}",
            "{{lastName}}",
            "{{email}}",
            "{{phone}}",
            "{{location}}",
            "{{propertyInterest}}",
            "{{budget}}",
            "{{agentName}}",
            "{{agentTitle}}",
            "{{companyName}}",
          ].map((token) => (
            <Badge key={token} variant="secondary" className="font-mono">
              {token}
            </Badge>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default EmailCampaignBuilder;
