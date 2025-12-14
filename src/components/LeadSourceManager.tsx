import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Upload, 
  Mail, 
  Users, 
  Globe, 
  Building2, 
  Link2, 
  FileSpreadsheet,
  CheckCircle,
  Settings,
  ArrowRight,
  Copy,
  Download,
  AlertCircle,
  FileText,
  Code,
  ExternalLink,
  Plus,
  Loader2
} from "lucide-react";
import { LEAD_SOURCES } from "@/lib/types";
import { toast } from "sonner";

interface LeadSourceManagerProps {
  onImportComplete?: (count: number) => void;
}

interface UploadPreview {
  headers: string[];
  rows: string[][];
  mapping: Record<string, string>;
}

interface IntroducerLead {
  introducerName: string;
  introducerEmail: string;
  introducerRole: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  budget: string;
  timeline: string;
  development: string;
  notes: string;
}

export const LeadSourceManager = ({ onImportComplete }: LeadSourceManagerProps) => {
  const [emailForwardAddress] = useState("leads@naybourhood.ai");
  const [zapierWebhook, setZapierWebhook] = useState("");
  const [makeWebhook, setMakeWebhook] = useState("");
  const [n8nWebhook, setN8nWebhook] = useState("");
  const [portalConnections, setPortalConnections] = useState({
    rightmove: false,
    zoopla: false,
    onthemarket: false,
  });
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadStep, setUploadStep] = useState<"upload" | "preview" | "mapping" | "processing" | "results">("upload");
  const [uploadPreview, setUploadPreview] = useState<UploadPreview | null>(null);
  const [uploadResults, setUploadResults] = useState<{ success: number; skipped: number; duplicates: number } | null>(null);
  const [introducerDialogOpen, setIntroducerDialogOpen] = useState(false);
  const [introducerForm, setIntroducerForm] = useState<IntroducerLead>({
    introducerName: "",
    introducerEmail: "",
    introducerRole: "agent",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    budget: "",
    timeline: "",
    development: "",
    notes: "",
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const fieldOptions = [
    { value: "first_name", label: "First Name" },
    { value: "last_name", label: "Last Name" },
    { value: "email", label: "Email" },
    { value: "phone", label: "Phone" },
    { value: "budget", label: "Budget" },
    { value: "timeline", label: "Timeline" },
    { value: "bedrooms", label: "Bedrooms" },
    { value: "country", label: "Country" },
    { value: "development", label: "Development" },
    { value: "source", label: "Source" },
    { value: "notes", label: "Notes" },
    { value: "skip", label: "Skip Column" },
  ];

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File too large. Maximum size is 10MB.");
      return;
    }

    if (!file.name.match(/\.(csv|xlsx|xls)$/i)) {
      toast.error("Invalid file format. Please upload CSV or Excel file.");
      return;
    }

    // Mock CSV parsing - in production, use a proper parser
    const mockHeaders = ["Full Name", "Email Address", "Phone", "Budget Range", "Property Interest"];
    const mockRows = [
      ["John Smith", "john@email.com", "+44 7700 900456", "£500k-£750k", "Marina Heights"],
      ["Sarah Jones", "sarah@email.com", "+44 7700 900789", "£750k-£1M", "Skyline Tower"],
      ["Mike Wilson", "mike@email.com", "+44 7700 900123", "£600k-£800k", "Garden Residences"],
    ];

    // Auto-map common field names
    const autoMapping: Record<string, string> = {};
    mockHeaders.forEach((header) => {
      const lowerHeader = header.toLowerCase();
      if (lowerHeader.includes("name")) autoMapping[header] = "first_name";
      else if (lowerHeader.includes("email")) autoMapping[header] = "email";
      else if (lowerHeader.includes("phone")) autoMapping[header] = "phone";
      else if (lowerHeader.includes("budget")) autoMapping[header] = "budget";
      else if (lowerHeader.includes("property") || lowerHeader.includes("development")) autoMapping[header] = "development";
      else autoMapping[header] = "skip";
    });

    setUploadPreview({
      headers: mockHeaders,
      rows: mockRows,
      mapping: autoMapping,
    });
    setUploadStep("preview");
  };

  const handleMappingChange = (header: string, value: string) => {
    if (uploadPreview) {
      setUploadPreview({
        ...uploadPreview,
        mapping: { ...uploadPreview.mapping, [header]: value },
      });
    }
  };

  const handleProcessUpload = async () => {
    setUploadStep("processing");
    setIsProcessing(true);

    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    setUploadResults({
      success: 847,
      skipped: 23,
      duplicates: 5,
    });
    setIsProcessing(false);
    setUploadStep("results");
    onImportComplete?.(847);
  };

  const resetUploadDialog = () => {
    setUploadStep("upload");
    setUploadPreview(null);
    setUploadResults(null);
    setUploadDialogOpen(false);
  };

  const handleConnectPortal = (portal: keyof typeof portalConnections) => {
    setPortalConnections(prev => ({ ...prev, [portal]: !prev[portal] }));
    toast.success(`${portal.charAt(0).toUpperCase() + portal.slice(1)} ${portalConnections[portal] ? 'disconnected' : 'connected'}`);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const handleSubmitIntroducerLead = () => {
    // Validate required fields
    if (!introducerForm.firstName || !introducerForm.lastName || (!introducerForm.email && !introducerForm.phone)) {
      toast.error("Please fill in required fields (name and email or phone)");
      return;
    }

    // Mock submission
    toast.success("Lead submitted successfully! Confirmation email sent to introducer.");
    setIntroducerDialogOpen(false);
    setIntroducerForm({
      introducerName: "",
      introducerEmail: "",
      introducerRole: "agent",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      budget: "",
      timeline: "",
      development: "",
      notes: "",
    });
    onImportComplete?.(1);
  };

  const downloadTemplate = () => {
    const template = "First Name,Last Name,Email,Phone,Budget,Timeline,Bedrooms,Country,Development,Notes\nJohn,Smith,john@email.com,+44 7700 900123,£500k-£750k,1-3 months,2,UK,Marina Heights,Interested in waterfront";
    const blob = new Blob([template], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "naybourhood_leads_template.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Template downloaded");
  };

  const webhookUrl = "https://api.naybourhood.ai/webhooks/portal-lead";
  const websiteWebhookUrl = "https://api.naybourhood.ai/webhooks/website-lead";

  const portalWebhookPayload = `{
  "source": "rightmove",
  "lead_id": "RM-789456",
  "property_id": "12345678",
  "first_name": "John",
  "last_name": "Smith",
  "email": "john@email.com",
  "phone": "+44 7700 900456",
  "message": "I'd like to arrange a viewing",
  "budget": "500000-750000",
  "timestamp": "2025-12-14T10:30:00Z"
}`;

  const embedCode = `<form id="naybourhood-lead-form" action="${websiteWebhookUrl}" method="POST">
  <input type="hidden" name="development_id" value="YOUR_DEVELOPMENT_ID">
  <input type="text" name="first_name" placeholder="First Name" required>
  <input type="text" name="last_name" placeholder="Last Name" required>
  <input type="email" name="email" placeholder="Email" required>
  <input type="tel" name="phone" placeholder="Phone" required>
  <select name="budget">
    <option>£300k-£500k</option>
    <option>£500k-£750k</option>
    <option>£750k-£1M</option>
    <option>£1M+</option>
  </select>
  <button type="submit">Submit</button>
</form>`;

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowRight className="h-5 w-5" />
          Lead Sources
        </CardTitle>
        <CardDescription>
          Configure how leads flow into your dashboard from multiple channels
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid grid-cols-4 lg:grid-cols-7 gap-1">
            <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
            <TabsTrigger value="portals" className="text-xs">Portals</TabsTrigger>
            <TabsTrigger value="website" className="text-xs">Website</TabsTrigger>
            <TabsTrigger value="email" className="text-xs">Email</TabsTrigger>
            <TabsTrigger value="introducers" className="text-xs">Introducers</TabsTrigger>
            <TabsTrigger value="crm" className="text-xs">CRM</TabsTrigger>
            <TabsTrigger value="upload" className="text-xs">Upload</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {LEAD_SOURCES.map((source) => (
                <Card key={source.value} className="border-border/30 bg-card/50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{source.icon}</span>
                        <div>
                          <p className="font-medium text-sm">{source.label}</p>
                          <p className="text-xs text-muted-foreground">
                            {source.value === "meta_campaign" && "Active campaigns"}
                            {source.value === "portal" && "Connect portals"}
                            {source.value === "direct_web" && "Website forms"}
                            {source.value === "email_forward" && "Auto-forward"}
                            {source.value === "introducer" && "Partner leads"}
                            {source.value === "crm_import" && "Zapier/Make/n8n"}
                            {source.value === "manual_upload" && "CSV/Excel"}
                          </p>
                        </div>
                      </div>
                      <Badge 
                        variant={source.value === "meta_campaign" ? "default" : "outline"}
                        className="text-xs"
                      >
                        {source.value === "meta_campaign" ? "Active" : "Setup"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Lead Flow Diagram */}
            <Card className="border-border/30 bg-muted/20">
              <CardContent className="p-6">
                <h4 className="font-medium mb-4 text-sm">Lead Flow Pipeline</h4>
                <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
                  <div className="flex flex-col items-center gap-1 p-3 bg-card rounded-lg border border-border/30">
                    <span className="text-lg">📥</span>
                    <span className="text-xs">Sources</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <div className="flex flex-col items-center gap-1 p-3 bg-card rounded-lg border border-border/30">
                    <span className="text-lg">📋</span>
                    <span className="text-xs">Lead Record</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <div className="flex flex-col items-center gap-1 p-3 bg-card rounded-lg border border-border/30">
                    <span className="text-lg">🎯</span>
                    <span className="text-xs">Dual Scoring</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <div className="flex flex-col items-center gap-1 p-3 bg-card rounded-lg border border-border/30">
                    <span className="text-lg">🔥⭐⚡✓💤⚠️❌</span>
                    <span className="text-xs">Classification</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <div className="flex flex-col items-center gap-1 p-3 bg-card rounded-lg border border-border/30">
                    <span className="text-lg">📊</span>
                    <span className="text-xs">Dashboard</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Portals Tab */}
          <TabsContent value="portals" className="space-y-4">
            <Card className="border-border/30 bg-muted/10">
              <CardContent className="p-4">
                <h4 className="font-medium text-sm mb-2">Webhook Endpoint</h4>
                <div className="flex gap-2">
                  <Input value={webhookUrl} readOnly className="font-mono text-xs" />
                  <Button size="sm" variant="outline" onClick={() => copyToClipboard(webhookUrl, "Webhook URL")}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Configure this URL in your portal dashboard</p>
              </CardContent>
            </Card>

            <div className="grid gap-4">
              {[
                { key: "rightmove", name: "Rightmove", color: "text-primary" },
                { key: "zoopla", name: "Zoopla", color: "text-purple-500" },
                { key: "onthemarket", name: "OnTheMarket", color: "text-green-500" },
              ].map((portal) => (
                <Card key={portal.key} className="border-border/30">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Building2 className={`h-8 w-8 ${portal.color}`} />
                        <div>
                          <p className="font-medium">{portal.name}</p>
                          <p className="text-xs text-muted-foreground">Connect your {portal.name} account</p>
                        </div>
                      </div>
                      <Button 
                        variant={portalConnections[portal.key as keyof typeof portalConnections] ? "outline" : "default"}
                        size="sm"
                        onClick={() => handleConnectPortal(portal.key as keyof typeof portalConnections)}
                      >
                        {portalConnections[portal.key as keyof typeof portalConnections] ? (
                          <>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Connected
                          </>
                        ) : "Connect"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Sample Payload */}
            <Card className="border-border/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm">Example Webhook Payload</h4>
                  <Button size="sm" variant="ghost" onClick={() => copyToClipboard(portalWebhookPayload, "Payload")}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <pre className="bg-muted/50 p-3 rounded-lg text-xs overflow-x-auto font-mono">
                  {portalWebhookPayload}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Website Tab */}
          <TabsContent value="website" className="space-y-4">
            <Card className="border-border/30">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <Globe className="h-8 w-8 text-primary" />
                  <div>
                    <p className="font-medium">Direct Website Leads</p>
                    <p className="text-xs text-muted-foreground">Capture leads from your property website</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-xs flex items-center gap-1">
                        <Code className="h-3 w-3" /> Embed Code
                      </Label>
                      <Button size="sm" variant="ghost" onClick={() => copyToClipboard(embedCode, "Embed code")}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <pre className="bg-muted/50 p-3 rounded-lg font-mono text-xs overflow-x-auto max-h-60">
                      {embedCode}
                    </pre>
                  </div>

                  <div>
                    <Label className="text-xs">Webhook URL</Label>
                    <div className="flex gap-2 mt-1">
                      <Input 
                        value={websiteWebhookUrl} 
                        readOnly 
                        className="font-mono text-xs"
                      />
                      <Button size="sm" variant="outline" onClick={() => copyToClipboard(websiteWebhookUrl, "Webhook URL")}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Email Tab */}
          <TabsContent value="email" className="space-y-4">
            <Card className="border-border/30">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <Mail className="h-8 w-8 text-primary" />
                  <div>
                    <p className="font-medium">Email Forwarding</p>
                    <p className="text-xs text-muted-foreground">Forward portal/inquiry emails to automatically capture leads</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-xs">Forward emails to:</Label>
                    <div className="flex gap-2 mt-1">
                      <Input 
                        value={emailForwardAddress} 
                        readOnly 
                        className="font-mono text-xs"
                      />
                      <Button size="sm" variant="outline" onClick={() => copyToClipboard(emailForwardAddress, "Email address")}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <Card className="border-border/30 bg-muted/10">
                    <CardContent className="p-3">
                      <h4 className="font-medium text-xs mb-2">Sample Email Format</h4>
                      <pre className="text-xs text-muted-foreground">
{`From: enquiry@rightmove.co.uk
Subject: New enquiry - Kensington Square

Name: Sarah Thompson
Email: sarah@email.com
Phone: +44 7700 900789
Property: Kensington Square, London
Message: Looking for 2-bed, budget £600k`}
                      </pre>
                    </CardContent>
                  </Card>

                  <p className="text-xs text-muted-foreground">
                    Our AI will parse incoming emails and extract lead information automatically using n8n workflows.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Introducers Tab */}
          <TabsContent value="introducers" className="space-y-4">
            <Card className="border-border/30">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Users className="h-8 w-8 text-primary" />
                    <div>
                      <p className="font-medium">Introducers & Agents</p>
                      <p className="text-xs text-muted-foreground">Submit leads from partners and agents</p>
                    </div>
                  </div>
                  <Dialog open={introducerDialogOpen} onOpenChange={setIntroducerDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-1" />
                        Submit Lead
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Submit a Lead</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="border-b pb-4">
                          <h4 className="font-medium text-sm mb-3">Your Details</h4>
                          <div className="grid gap-3">
                            <div>
                              <Label className="text-xs">Name</Label>
                              <Input 
                                value={introducerForm.introducerName}
                                onChange={(e) => setIntroducerForm(prev => ({ ...prev, introducerName: e.target.value }))}
                                placeholder="Your name"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Email</Label>
                              <Input 
                                type="email"
                                value={introducerForm.introducerEmail}
                                onChange={(e) => setIntroducerForm(prev => ({ ...prev, introducerEmail: e.target.value }))}
                                placeholder="your@email.com"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Role</Label>
                              <Select 
                                value={introducerForm.introducerRole}
                                onValueChange={(value) => setIntroducerForm(prev => ({ ...prev, introducerRole: value }))}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="agent">Agent</SelectItem>
                                  <SelectItem value="introducer">Introducer</SelectItem>
                                  <SelectItem value="broker">Broker</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium text-sm mb-3">Buyer Details</h4>
                          <div className="grid gap-3">
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <Label className="text-xs">First Name *</Label>
                                <Input 
                                  value={introducerForm.firstName}
                                  onChange={(e) => setIntroducerForm(prev => ({ ...prev, firstName: e.target.value }))}
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Last Name *</Label>
                                <Input 
                                  value={introducerForm.lastName}
                                  onChange={(e) => setIntroducerForm(prev => ({ ...prev, lastName: e.target.value }))}
                                />
                              </div>
                            </div>
                            <div>
                              <Label className="text-xs">Email *</Label>
                              <Input 
                                type="email"
                                value={introducerForm.email}
                                onChange={(e) => setIntroducerForm(prev => ({ ...prev, email: e.target.value }))}
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Phone *</Label>
                              <Input 
                                value={introducerForm.phone}
                                onChange={(e) => setIntroducerForm(prev => ({ ...prev, phone: e.target.value }))}
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Budget</Label>
                              <Select 
                                value={introducerForm.budget}
                                onValueChange={(value) => setIntroducerForm(prev => ({ ...prev, budget: value }))}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select budget range" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="300k-500k">£300k - £500k</SelectItem>
                                  <SelectItem value="500k-750k">£500k - £750k</SelectItem>
                                  <SelectItem value="750k-1m">£750k - £1M</SelectItem>
                                  <SelectItem value="1m-1.5m">£1M - £1.5M</SelectItem>
                                  <SelectItem value="1.5m+">£1.5M+</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label className="text-xs">Timeline</Label>
                              <Select 
                                value={introducerForm.timeline}
                                onValueChange={(value) => setIntroducerForm(prev => ({ ...prev, timeline: value }))}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select timeline" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="within_28_days">Within 28 days</SelectItem>
                                  <SelectItem value="1-3_months">1-3 months</SelectItem>
                                  <SelectItem value="3-6_months">3-6 months</SelectItem>
                                  <SelectItem value="6-12_months">6-12 months</SelectItem>
                                  <SelectItem value="12+_months">12+ months</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label className="text-xs">Development Interest</Label>
                              <Select 
                                value={introducerForm.development}
                                onValueChange={(value) => setIntroducerForm(prev => ({ ...prev, development: value }))}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select development" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="marina_heights">Marina Heights</SelectItem>
                                  <SelectItem value="skyline_tower">Skyline Tower</SelectItem>
                                  <SelectItem value="garden_residences">Garden Residences</SelectItem>
                                  <SelectItem value="kensington_square">Kensington Square</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label className="text-xs">Notes</Label>
                              <Textarea 
                                value={introducerForm.notes}
                                onChange={(e) => setIntroducerForm(prev => ({ ...prev, notes: e.target.value }))}
                                placeholder="Additional information about the buyer..."
                                rows={3}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIntroducerDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSubmitIntroducerLead}>Submit Lead</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="p-4 bg-muted/30 rounded-lg text-sm text-muted-foreground">
                  <p className="font-medium text-foreground mb-1">How it works:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Submit leads on behalf of buyers</li>
                    <li>Lead Source = "Introducer" or "Agent"</li>
                    <li>Confirmation email sent to you</li>
                    <li>Notification sent to assigned sales agent</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* CRM Import Tab */}
          <TabsContent value="crm" className="space-y-4">
            <Card className="border-border/30">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <Link2 className="h-8 w-8 text-primary" />
                  <div>
                    <p className="font-medium">CRM Integration</p>
                    <p className="text-xs text-muted-foreground">Connect via Zapier, Make, or n8n</p>
                  </div>
                </div>

                <div className="grid gap-4">
                  <div>
                    <Label className="text-xs flex items-center gap-1">
                      <ExternalLink className="h-3 w-3" /> Zapier Webhook URL
                    </Label>
                    <Input 
                      placeholder="Paste your Zapier webhook URL..."
                      value={zapierWebhook}
                      onChange={(e) => setZapierWebhook(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-xs flex items-center gap-1">
                      <ExternalLink className="h-3 w-3" /> Make Webhook URL
                    </Label>
                    <Input 
                      placeholder="Paste your Make webhook URL..."
                      value={makeWebhook}
                      onChange={(e) => setMakeWebhook(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-xs flex items-center gap-1">
                      <ExternalLink className="h-3 w-3" /> n8n Webhook URL
                    </Label>
                    <Input 
                      placeholder="Paste your n8n webhook URL..."
                      value={n8nWebhook}
                      onChange={(e) => setN8nWebhook(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <Button variant="outline" className="w-full">
                    <Settings className="h-4 w-4 mr-2" />
                    Test Connection
                  </Button>
                </div>

                <Card className="border-border/30 bg-muted/10">
                  <CardContent className="p-3">
                    <h4 className="font-medium text-xs mb-2">Supported CRMs</h4>
                    <div className="flex flex-wrap gap-2">
                      {["Salesforce", "HubSpot", "Pipedrive", "Zoho CRM", "Microsoft Dynamics"].map((crm) => (
                        <Badge key={crm} variant="outline" className="text-xs">{crm}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Manual Upload Tab */}
          <TabsContent value="upload" className="space-y-4">
            <Card className="border-border/30">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet className="h-8 w-8 text-primary" />
                    <div>
                      <p className="font-medium">Manual Upload</p>
                      <p className="text-xs text-muted-foreground">Import leads from CSV or Excel files</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={downloadTemplate}>
                    <Download className="h-4 w-4 mr-1" />
                    Template
                  </Button>
                </div>

                <Dialog open={uploadDialogOpen} onOpenChange={(open) => {
                  if (!open) resetUploadDialog();
                  else setUploadDialogOpen(true);
                }}>
                  <DialogTrigger asChild>
                    <div className="border-2 border-dashed border-border/50 rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm font-medium mb-1">Drop your file here or click to upload</p>
                      <p className="text-xs text-muted-foreground">CSV or Excel file (max 10MB, up to 1,000 leads)</p>
                    </div>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Import Leads</DialogTitle>
                    </DialogHeader>

                    {uploadStep === "upload" && (
                      <div className="py-6">
                        <div className="border-2 border-dashed border-border/50 rounded-lg p-8 text-center">
                          <Upload className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                          <p className="font-medium mb-1">Choose File or Drag & Drop</p>
                          <p className="text-xs text-muted-foreground mb-4">Supported formats: CSV, XLSX, XLS<br />Max file size: 10MB (up to 1,000 leads)</p>
                          <Label htmlFor="csv-upload-dialog" className="cursor-pointer">
                            <Button variant="outline" asChild>
                              <span>Browse Files</span>
                            </Button>
                          </Label>
                          <Input
                            id="csv-upload-dialog"
                            type="file"
                            accept=".csv,.xlsx,.xls"
                            className="hidden"
                            onChange={handleCsvUpload}
                          />
                        </div>

                        <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                          <p className="font-medium text-sm mb-2">⚠️ Required columns:</p>
                          <p className="text-xs text-muted-foreground">First Name, Last Name, Email OR Phone (at least one)</p>
                          <p className="font-medium text-sm mt-3 mb-2">✓ Optional columns:</p>
                          <p className="text-xs text-muted-foreground">Budget, Timeline, Bedrooms, Country, Development, Source, Notes</p>
                        </div>
                      </div>
                    )}

                    {uploadStep === "preview" && uploadPreview && (
                      <div className="py-4 space-y-4">
                        <p className="text-sm text-muted-foreground">Preview (first 3 rows)</p>
                        <div className="border rounded-lg overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                {uploadPreview.headers.map((header, i) => (
                                  <TableHead key={i} className="text-xs">{header}</TableHead>
                                ))}
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {uploadPreview.rows.map((row, i) => (
                                <TableRow key={i}>
                                  {row.map((cell, j) => (
                                    <TableCell key={j} className="text-xs">{cell}</TableCell>
                                  ))}
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                        <Button onClick={() => setUploadStep("mapping")} className="w-full">
                          Continue to Column Mapping
                        </Button>
                      </div>
                    )}

                    {uploadStep === "mapping" && uploadPreview && (
                      <div className="py-4 space-y-4">
                        <p className="text-sm text-muted-foreground">Map your columns to Naybourhood fields</p>
                        <div className="space-y-3">
                          {uploadPreview.headers.map((header) => (
                            <div key={header} className="flex items-center gap-3">
                              <div className="w-1/3">
                                <Badge variant="outline" className="font-mono text-xs">{header}</Badge>
                              </div>
                              <ArrowRight className="h-4 w-4 text-muted-foreground" />
                              <div className="w-1/2">
                                <Select 
                                  value={uploadPreview.mapping[header]}
                                  onValueChange={(value) => handleMappingChange(header, value)}
                                >
                                  <SelectTrigger className="text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {fieldOptions.map((option) => (
                                      <SelectItem key={option.value} value={option.value} className="text-xs">
                                        {option.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          ))}
                        </div>
                        <Button onClick={handleProcessUpload} className="w-full">
                          Upload & Process
                        </Button>
                      </div>
                    )}

                    {uploadStep === "processing" && (
                      <div className="py-12 text-center">
                        <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-primary" />
                        <p className="font-medium">Processing leads...</p>
                        <p className="text-xs text-muted-foreground mt-1">This may take a moment</p>
                      </div>
                    )}

                    {uploadStep === "results" && uploadResults && (
                      <div className="py-6 space-y-4">
                        <div className="text-center">
                          <CheckCircle className="h-12 w-12 mx-auto mb-3 text-success" />
                          <h3 className="font-medium text-lg">Import Complete</h3>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <Card className="p-3 text-center bg-success/10 border-success/20">
                            <p className="text-2xl font-bold text-success">{uploadResults.success}</p>
                            <p className="text-xs text-muted-foreground">Imported</p>
                          </Card>
                          <Card className="p-3 text-center bg-warning/10 border-warning/20">
                            <p className="text-2xl font-bold text-warning">{uploadResults.skipped}</p>
                            <p className="text-xs text-muted-foreground">Skipped</p>
                          </Card>
                          <Card className="p-3 text-center bg-muted">
                            <p className="text-2xl font-bold">{uploadResults.duplicates}</p>
                            <p className="text-xs text-muted-foreground">Duplicates</p>
                          </Card>
                        </div>
                        {uploadResults.skipped > 0 && (
                          <div className="flex items-start gap-2 p-3 bg-warning/10 rounded-lg">
                            <AlertCircle className="h-4 w-4 text-warning mt-0.5" />
                            <p className="text-xs text-warning">{uploadResults.skipped} leads skipped due to invalid email format</p>
                          </div>
                        )}
                        <Button onClick={resetUploadDialog} className="w-full">
                          Done
                        </Button>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
