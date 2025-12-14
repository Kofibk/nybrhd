import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
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
  ArrowRight
} from "lucide-react";
import { LEAD_SOURCES } from "@/lib/types";
import { toast } from "sonner";

interface LeadSourceManagerProps {
  onImportComplete?: (count: number) => void;
}

export const LeadSourceManager = ({ onImportComplete }: LeadSourceManagerProps) => {
  const [emailForwardAddress, setEmailForwardAddress] = useState("leads@naybourhood.ai");
  const [zapierWebhook, setZapierWebhook] = useState("");
  const [makeWebhook, setMakeWebhook] = useState("");
  const [portalConnections, setPortalConnections] = useState({
    rightmove: false,
    zoopla: false,
    onthemarket: false,
  });

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Mock CSV parsing
      toast.success(`Uploaded ${file.name} - 12 leads imported`);
      onImportComplete?.(12);
    }
  };

  const handleConnectPortal = (portal: keyof typeof portalConnections) => {
    setPortalConnections(prev => ({ ...prev, [portal]: !prev[portal] }));
    toast.success(`${portal.charAt(0).toUpperCase() + portal.slice(1)} ${portalConnections[portal] ? 'disconnected' : 'connected'}`);
  };

  const copyEmailAddress = () => {
    navigator.clipboard.writeText(emailForwardAddress);
    toast.success("Email address copied to clipboard");
  };

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
                            {source.value === "crm_import" && "Zapier/Make"}
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
            <div className="grid gap-4">
              <Card className="border-border/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Building2 className="h-8 w-8 text-primary" />
                      <div>
                        <p className="font-medium">Rightmove</p>
                        <p className="text-xs text-muted-foreground">Connect your Rightmove account</p>
                      </div>
                    </div>
                    <Button 
                      variant={portalConnections.rightmove ? "outline" : "default"}
                      size="sm"
                      onClick={() => handleConnectPortal("rightmove")}
                    >
                      {portalConnections.rightmove ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Connected
                        </>
                      ) : "Connect"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Building2 className="h-8 w-8 text-purple-500" />
                      <div>
                        <p className="font-medium">Zoopla</p>
                        <p className="text-xs text-muted-foreground">Connect your Zoopla account</p>
                      </div>
                    </div>
                    <Button 
                      variant={portalConnections.zoopla ? "outline" : "default"}
                      size="sm"
                      onClick={() => handleConnectPortal("zoopla")}
                    >
                      {portalConnections.zoopla ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Connected
                        </>
                      ) : "Connect"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Building2 className="h-8 w-8 text-green-500" />
                      <div>
                        <p className="font-medium">OnTheMarket</p>
                        <p className="text-xs text-muted-foreground">Connect your OnTheMarket account</p>
                      </div>
                    </div>
                    <Button 
                      variant={portalConnections.onthemarket ? "outline" : "default"}
                      size="sm"
                      onClick={() => handleConnectPortal("onthemarket")}
                    >
                      {portalConnections.onthemarket ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Connected
                        </>
                      ) : "Connect"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
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

                <div className="space-y-3">
                  <div>
                    <Label className="text-xs">Embed Code</Label>
                    <div className="mt-1 p-3 bg-muted/50 rounded-lg font-mono text-xs overflow-x-auto">
                      {`<script src="https://naybourhood.ai/embed.js" data-key="YOUR_KEY"></script>`}
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs">Webhook URL</Label>
                    <Input 
                      value="https://api.naybourhood.ai/leads/webhook/abc123" 
                      readOnly 
                      className="font-mono text-xs"
                    />
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

                <div className="space-y-3">
                  <div>
                    <Label className="text-xs">Forward emails to:</Label>
                    <div className="flex gap-2 mt-1">
                      <Input 
                        value={emailForwardAddress} 
                        readOnly 
                        className="font-mono text-xs"
                      />
                      <Button size="sm" variant="outline" onClick={copyEmailAddress}>
                        Copy
                      </Button>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Our AI will parse incoming emails and extract lead information automatically.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Introducers Tab */}
          <TabsContent value="introducers" className="space-y-4">
            <Card className="border-border/30">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <Users className="h-8 w-8 text-primary" />
                  <div>
                    <p className="font-medium">Introducers & Agents</p>
                    <p className="text-xs text-muted-foreground">Manage partner referrals and agent leads</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    Add Introducer
                  </Button>

                  <div className="p-3 bg-muted/30 rounded-lg text-xs text-muted-foreground">
                    No introducers configured yet. Add partners who refer leads to you.
                  </div>
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
                    <p className="text-xs text-muted-foreground">Connect via Zapier or Make (Integromat)</p>
                  </div>
                </div>

                <div className="grid gap-4">
                  <div>
                    <Label className="text-xs">Zapier Webhook URL</Label>
                    <Input 
                      placeholder="Paste your Zapier webhook URL..."
                      value={zapierWebhook}
                      onChange={(e) => setZapierWebhook(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-xs">Make Webhook URL</Label>
                    <Input 
                      placeholder="Paste your Make webhook URL..."
                      value={makeWebhook}
                      onChange={(e) => setMakeWebhook(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <Button variant="outline" className="w-full">
                    <Settings className="h-4 w-4 mr-2" />
                    Test Connection
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Manual Upload Tab */}
          <TabsContent value="upload" className="space-y-4">
            <Card className="border-border/30">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <FileSpreadsheet className="h-8 w-8 text-primary" />
                  <div>
                    <p className="font-medium">Manual Upload</p>
                    <p className="text-xs text-muted-foreground">Import leads from CSV or Excel files</p>
                  </div>
                </div>

                <div className="border-2 border-dashed border-border/50 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm font-medium mb-1">Drop your file here</p>
                  <p className="text-xs text-muted-foreground mb-3">CSV or Excel file (max 5MB)</p>
                  <Label htmlFor="csv-upload" className="cursor-pointer">
                    <Button variant="outline" size="sm" asChild>
                      <span>Browse Files</span>
                    </Button>
                  </Label>
                  <Input
                    id="csv-upload"
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    className="hidden"
                    onChange={handleCsvUpload}
                  />
                </div>

                <div className="text-xs text-muted-foreground">
                  <p className="font-medium mb-1">Required columns:</p>
                  <p>Name, Email, Phone, Country, Budget, Bedrooms</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
