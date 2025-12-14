import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useAILeadAnalysis } from "@/hooks/useAILeadAnalysis";
import { useAICampaignIntelligence } from "@/hooks/useAICampaignIntelligence";
import { useAIContentGeneration } from "@/hooks/useAIContentGeneration";
import { useAIImageAnalysis } from "@/hooks/useAIImageAnalysis";
import { Loader2, CheckCircle, XCircle, Brain, Target, FileText, Image } from "lucide-react";
import { Link } from "react-router-dom";

const AITestPage = () => {
  const [leadResult, setLeadResult] = useState<any>(null);
  const [campaignResult, setCampaignResult] = useState<any>(null);
  const [contentResult, setContentResult] = useState<any>(null);
  const [imageResult, setImageResult] = useState<any>(null);
  const [imageUrl, setImageUrl] = useState("https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800");

  const leadAnalysis = useAILeadAnalysis();
  const campaignIntel = useAICampaignIntelligence();
  const contentGen = useAIContentGeneration();
  const imageAnalysis = useAIImageAnalysis();

  const sampleLead = {
    name: "John Smith",
    email: "john.smith@example.com",
    phone: "+44 7700 900123",
    budget: "£500,000 - £750,000",
    timeline: "Within 3 months",
    bedrooms: 3,
    location: "London",
    source: "Meta Campaign",
    formCompletionRate: 95,
    pageViews: 12,
    lastInteraction: "2024-01-15",
  };

  const sampleCampaign = {
    name: "Riverside Apartments Launch",
    development: "Thames Riverside",
    objective: "Leads",
    budget: 5000,
    region: "UK",
    targetCountries: ["GB", "AE", "SA"],
    startDate: "2024-01-01",
    status: "active",
  };

  const sampleMetrics = {
    leads: 45,
    spend: 3200,
    cpl: 71.11,
    ctr: 2.4,
    impressions: 125000,
    clicks: 3000,
  };

  const testLeadScoring = async () => {
    toast.info("Testing lead scoring...");
    const result = await leadAnalysis.scoreLead(sampleLead);
    if (result) {
      setLeadResult(result);
      toast.success("Lead scoring completed!");
    } else {
      toast.error("Lead scoring failed: " + leadAnalysis.error);
    }
  };

  const testSpamDetection = async () => {
    toast.info("Testing spam detection...");
    const result = await leadAnalysis.detectSpam(sampleLead);
    if (result) {
      setLeadResult(result);
      toast.success("Spam detection completed!");
    } else {
      toast.error("Spam detection failed: " + leadAnalysis.error);
    }
  };

  const testCampaignRecommendations = async () => {
    toast.info("Testing campaign recommendations...");
    const result = await campaignIntel.getRecommendations(sampleCampaign, sampleMetrics);
    if (result) {
      setCampaignResult(result);
      toast.success("Campaign recommendations generated!");
    } else {
      toast.error("Campaign recommendations failed: " + campaignIntel.error);
    }
  };

  const testPerformanceSummary = async () => {
    toast.info("Testing performance summary...");
    const result = await campaignIntel.getPerformanceSummary(sampleCampaign, sampleMetrics);
    if (result) {
      setCampaignResult(result);
      toast.success("Performance summary generated!");
    } else {
      toast.error("Performance summary failed: " + campaignIntel.error);
    }
  };

  const testAdCopyGeneration = async () => {
    toast.info("Testing ad copy generation...");
    const result = await contentGen.generateAdCopy({
      development: "Thames Riverside Apartments",
      propertyType: "Luxury apartments",
      targetAudience: "Young professionals and investors",
      usp: ["River views", "Zone 2 location", "Concierge service"],
      priceRange: "£450,000 - £1,200,000",
    });
    if (result) {
      setContentResult(result);
      toast.success("Ad copy generated!");
    } else {
      toast.error("Ad copy generation failed: " + contentGen.error);
    }
  };

  const testWhatsAppTemplates = async () => {
    toast.info("Testing WhatsApp templates...");
    const result = await contentGen.generateWhatsAppTemplates({
      development: "Thames Riverside Apartments",
      scenarios: ["welcome", "viewing_reminder", "follow_up"],
    });
    if (result) {
      setContentResult(result);
      toast.success("WhatsApp templates generated!");
    } else {
      toast.error("WhatsApp template generation failed: " + contentGen.error);
    }
  };

  const testImageAnalysis = async () => {
    toast.info("Testing image analysis...");
    const result = await imageAnalysis.analyzeCreative(imageUrl);
    if (result) {
      setImageResult(result);
      toast.success("Image analysis completed!");
    } else {
      toast.error("Image analysis failed: " + imageAnalysis.error);
    }
  };

  const testPropertyExtraction = async () => {
    toast.info("Testing property extraction...");
    const result = await imageAnalysis.extractPropertyDetails(imageUrl);
    if (result) {
      setImageResult(result);
      toast.success("Property details extracted!");
    } else {
      toast.error("Property extraction failed: " + imageAnalysis.error);
    }
  };

  const ResultDisplay = ({ data, title }: { data: any; title: string }) => (
    <div className="mt-4 p-4 bg-muted rounded-lg">
      <h4 className="font-medium mb-2">{title}</h4>
      <pre className="text-xs overflow-auto max-h-96 whitespace-pre-wrap">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">AI Integration Test Suite</h1>
            <p className="text-muted-foreground mt-1">
              Verify all AI integrations are working correctly
            </p>
          </div>
          <Link to="/admin">
            <Button variant="outline">Back to Admin</Button>
          </Link>
        </div>

        <Tabs defaultValue="leads" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="leads" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Lead Analysis
            </TabsTrigger>
            <TabsTrigger value="campaigns" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Campaign Intel
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Content Gen
            </TabsTrigger>
            <TabsTrigger value="images" className="flex items-center gap-2">
              <Image className="h-4 w-4" />
              Image Analysis
            </TabsTrigger>
          </TabsList>

          <TabsContent value="leads">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    Lead Scoring (GPT-5)
                  </CardTitle>
                  <CardDescription>
                    Test AI-powered lead quality and intent scoring
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 bg-muted rounded-lg text-sm">
                    <strong>Sample Lead:</strong> {sampleLead.name}
                    <br />
                    Budget: {sampleLead.budget} | Timeline: {sampleLead.timeline}
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={testLeadScoring} disabled={leadAnalysis.isLoading}>
                      {leadAnalysis.isLoading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : null}
                      Test Lead Scoring
                    </Button>
                    <Button variant="secondary" onClick={testSpamDetection} disabled={leadAnalysis.isLoading}>
                      Test Spam Detection
                    </Button>
                  </div>
                  {leadResult && <ResultDisplay data={leadResult} title="Result" />}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Model Info</CardTitle>
                  <CardDescription>Lead analysis uses GPT-5 for structured reasoning</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">GPT-5</Badge>
                      <span className="text-sm">Lead Quality Analysis</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">GPT-5</Badge>
                      <span className="text-sm">Intent Scoring</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">GPT-5</Badge>
                      <span className="text-sm">Spam Detection</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Gemini Flash</Badge>
                      <span className="text-sm">Bulk Processing</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="campaigns">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Campaign Intelligence (GPT-5)
                  </CardTitle>
                  <CardDescription>
                    Test AI-powered campaign recommendations and analysis
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 bg-muted rounded-lg text-sm">
                    <strong>Sample Campaign:</strong> {sampleCampaign.name}
                    <br />
                    Budget: £{sampleCampaign.budget} | Leads: {sampleMetrics.leads} | CPL: £{sampleMetrics.cpl}
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Button onClick={testCampaignRecommendations} disabled={campaignIntel.isLoading}>
                      {campaignIntel.isLoading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : null}
                      Get Recommendations
                    </Button>
                    <Button variant="secondary" onClick={testPerformanceSummary} disabled={campaignIntel.isLoading}>
                      Performance Summary
                    </Button>
                  </div>
                  {campaignResult && <ResultDisplay data={campaignResult} title="Result" />}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Available Actions</CardTitle>
                  <CardDescription>Campaign intelligence capabilities</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Campaign Recommendations
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Performance Summaries
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Attribution Analysis
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Budget Optimisation
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="content">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Content Generation (GPT-5)
                  </CardTitle>
                  <CardDescription>
                    Test AI-powered ad copy and messaging generation
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 bg-muted rounded-lg text-sm">
                    <strong>Context:</strong> Thames Riverside Apartments
                    <br />
                    Target: Young professionals | Price: £450K - £1.2M
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Button onClick={testAdCopyGeneration} disabled={contentGen.isLoading}>
                      {contentGen.isLoading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : null}
                      Generate Ad Copy
                    </Button>
                    <Button variant="secondary" onClick={testWhatsAppTemplates} disabled={contentGen.isLoading}>
                      WhatsApp Templates
                    </Button>
                  </div>
                  {contentResult && <ResultDisplay data={contentResult} title="Result" />}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Content Types</CardTitle>
                  <CardDescription>Available content generation</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Meta Ad Copy (3 variations)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Email Nurture Sequences
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      WhatsApp Templates
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Conversational Chat
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="images">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Image className="h-5 w-5" />
                    Image Analysis (Gemini 2.5 Flash)
                  </CardTitle>
                  <CardDescription>
                    Test AI-powered creative and property image analysis
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Image URL</label>
                    <Input
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="Enter image URL..."
                      className="mt-1"
                    />
                  </div>
                  {imageUrl && (
                    <img
                      src={imageUrl}
                      alt="Test image"
                      className="w-full h-48 object-cover rounded-lg"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  )}
                  <div className="flex gap-2 flex-wrap">
                    <Button onClick={testImageAnalysis} disabled={imageAnalysis.isLoading}>
                      {imageAnalysis.isLoading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : null}
                      Analyse Creative
                    </Button>
                    <Button variant="secondary" onClick={testPropertyExtraction} disabled={imageAnalysis.isLoading}>
                      Extract Property Details
                    </Button>
                  </div>
                  {imageResult && <ResultDisplay data={imageResult} title="Result" />}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Vision Capabilities</CardTitle>
                  <CardDescription>Gemini Flash for cost-effective vision</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Creative Asset Analysis
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Property Detail Extraction
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Bulk Image Ranking
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Ad Suitability Check
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>AI Model Distribution</CardTitle>
            <CardDescription>Based on your requirements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-blue-500">GPT-5</Badge>
                  <span className="text-sm font-medium">70% Usage</span>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Lead quality analysis</li>
                  <li>• Campaign recommendations</li>
                  <li>• Lead scoring</li>
                  <li>• Budget optimisation</li>
                  <li>• Ad copy generation</li>
                </ul>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-green-500">GPT-5</Badge>
                  <span className="text-sm font-medium">20% Usage</span>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Conversational chat</li>
                  <li>• Real-time streaming</li>
                  <li>• Creative content</li>
                </ul>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-purple-500">Gemini Flash</Badge>
                  <span className="text-sm font-medium">10% Usage</span>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Image analysis</li>
                  <li>• Bulk processing</li>
                  <li>• Long context reports</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AITestPage;
