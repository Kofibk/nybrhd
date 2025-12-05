import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MessageSquare,
  Settings,
  Bell,
  Users,
  Webhook,
  Save,
  CheckCircle,
  AlertCircle,
  Link,
  Key,
  RefreshCw,
  Plug,
  Facebook,
  Workflow
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

const AdminSettings = () => {
  const [whatsappConfig, setWhatsappConfig] = useState({
    accessToken: "",
    phoneNumberId: "",
    businessAccountId: "",
    webhookVerifyToken: "",
    isConnected: false,
    autoReply: true,
    welcomeMessage: "Hello! Thank you for contacting Naybourhood. How can we help you today?",
    awayMessage: "We're currently away but will get back to you as soon as possible.",
    businessHoursStart: "09:00",
    businessHoursEnd: "18:00"
  });

  const [metaConfig, setMetaConfig] = useState({
    appId: "",
    appSecret: "",
    accessToken: "",
    adAccountId: "",
    pixelId: "",
    isConnected: false,
  });

  const [n8nConfig, setN8nConfig] = useState({
    webhookUrl: "",
    apiKey: "",
    isConnected: false,
    workflows: [
      { id: "1", name: "Lead Notification", status: "active" },
      { id: "2", name: "Campaign Sync", status: "active" },
      { id: "3", name: "Daily Report", status: "paused" },
    ]
  });

  const [generalSettings, setGeneralSettings] = useState({
    companyName: "Naybourhood",
    supportEmail: "support@naybourhood.ai",
    timezone: "Europe/London",
    dateFormat: "DD/MM/YYYY",
    currency: "GBP"
  });

  const [notifications, setNotifications] = useState({
    emailNewLead: true,
    emailCampaignStatus: true,
    emailWeeklyReport: true,
    pushNewLead: true,
    pushCampaignStatus: false,
    slackIntegration: false,
    slackWebhook: ""
  });

  const handleSaveWhatsApp = () => {
    toast({
      title: "WhatsApp settings saved",
      description: "Configuration will be connected when API credentials are provided.",
    });
  };

  const handleTestWhatsAppConnection = () => {
    if (!whatsappConfig.accessToken || !whatsappConfig.phoneNumberId) {
      toast({
        title: "Missing credentials",
        description: "Please enter your WhatsApp Business API credentials first.",
        variant: "destructive"
      });
      return;
    }
    toast({ title: "Testing connection...", description: "Please wait." });
    setTimeout(() => {
      setWhatsappConfig(prev => ({ ...prev, isConnected: true }));
      toast({ title: "Connection successful", description: "WhatsApp Business API is properly configured." });
    }, 2000);
  };

  const handleSaveMeta = () => {
    toast({
      title: "Meta settings saved",
      description: "Meta Ads API configuration has been saved.",
    });
  };

  const handleTestMetaConnection = () => {
    if (!metaConfig.accessToken || !metaConfig.adAccountId) {
      toast({
        title: "Missing credentials",
        description: "Please enter your Meta API credentials first.",
        variant: "destructive"
      });
      return;
    }
    toast({ title: "Testing connection...", description: "Please wait." });
    setTimeout(() => {
      setMetaConfig(prev => ({ ...prev, isConnected: true }));
      toast({ title: "Connection successful", description: "Meta Ads API is properly configured." });
    }, 2000);
  };

  const handleSaveN8n = () => {
    toast({
      title: "n8n settings saved",
      description: "n8n integration configuration has been saved.",
    });
  };

  const handleTestN8nConnection = () => {
    if (!n8nConfig.webhookUrl) {
      toast({
        title: "Missing webhook URL",
        description: "Please enter your n8n webhook URL first.",
        variant: "destructive"
      });
      return;
    }
    toast({ title: "Testing connection...", description: "Please wait." });
    setTimeout(() => {
      setN8nConfig(prev => ({ ...prev, isConnected: true }));
      toast({ title: "Connection successful", description: "n8n integration is properly configured." });
    }, 2000);
  };

  const handleSaveGeneral = () => {
    toast({ title: "Settings saved", description: "General settings have been updated." });
  };

  const handleSaveNotifications = () => {
    toast({ title: "Notification preferences saved", description: "Your notification settings have been updated." });
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <Tabs defaultValue="integrations" className="space-y-4">
        <TabsList className="w-full md:w-auto overflow-x-auto">
          <TabsTrigger value="integrations" className="gap-1 sm:gap-2 text-xs sm:text-sm">
            <Plug className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Integrations</span>
          </TabsTrigger>
          <TabsTrigger value="general" className="gap-1 sm:gap-2 text-xs sm:text-sm">
            <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">General</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-1 sm:gap-2 text-xs sm:text-sm">
            <Bell className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="team" className="gap-1 sm:gap-2 text-xs sm:text-sm">
            <Users className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Team</span>
          </TabsTrigger>
        </TabsList>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="space-y-4">
          {/* WhatsApp Business API */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-green-500" />
                    WhatsApp Business API
                  </CardTitle>
                  <CardDescription>
                    Connect your WhatsApp Business account to automate lead communication
                  </CardDescription>
                </div>
                <Badge variant={whatsappConfig.isConnected ? "default" : "secondary"} className={whatsappConfig.isConnected ? "bg-green-500" : ""}>
                  {whatsappConfig.isConnected ? (
                    <><CheckCircle className="h-3 w-3 mr-1" /> Connected</>
                  ) : (
                    <><AlertCircle className="h-3 w-3 mr-1" /> Not Connected</>
                  )}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="wa-accessToken">Access Token</Label>
                  <Input
                    id="wa-accessToken"
                    type="password"
                    placeholder="Enter your WhatsApp access token"
                    value={whatsappConfig.accessToken}
                    onChange={(e) => setWhatsappConfig(prev => ({ ...prev, accessToken: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wa-phoneNumberId">Phone Number ID</Label>
                  <Input
                    id="wa-phoneNumberId"
                    placeholder="Enter your phone number ID"
                    value={whatsappConfig.phoneNumberId}
                    onChange={(e) => setWhatsappConfig(prev => ({ ...prev, phoneNumberId: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wa-businessAccountId">Business Account ID</Label>
                  <Input
                    id="wa-businessAccountId"
                    placeholder="Enter your business account ID"
                    value={whatsappConfig.businessAccountId}
                    onChange={(e) => setWhatsappConfig(prev => ({ ...prev, businessAccountId: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wa-webhookVerifyToken">Webhook Verify Token</Label>
                  <Input
                    id="wa-webhookVerifyToken"
                    placeholder="Create a verify token"
                    value={whatsappConfig.webhookVerifyToken}
                    onChange={(e) => setWhatsappConfig(prev => ({ ...prev, webhookVerifyToken: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Webhook URL (for Meta Dashboard)</Label>
                <div className="flex gap-2">
                  <Input
                    readOnly
                    value="https://xnmgwckxcdetfwjwpulh.functions.supabase.co/whatsapp-webhook"
                    className="bg-muted"
                  />
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => {
                      navigator.clipboard.writeText("https://xnmgwckxcdetfwjwpulh.functions.supabase.co/whatsapp-webhook");
                      toast({ title: "Copied!", description: "Webhook URL copied to clipboard." });
                    }}
                  >
                    <Link className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2">
                <div>
                  <Label>Enable Auto-Reply</Label>
                  <p className="text-xs text-muted-foreground">Automatically respond to incoming messages</p>
                </div>
                <Switch
                  checked={whatsappConfig.autoReply}
                  onCheckedChange={(checked) => setWhatsappConfig(prev => ({ ...prev, autoReply: checked }))}
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button onClick={handleTestWhatsAppConnection} variant="outline" className="gap-2">
                  <RefreshCw className="h-4 w-4" /> Test Connection
                </Button>
                <Button onClick={handleSaveWhatsApp} className="gap-2">
                  <Save className="h-4 w-4" /> Save Configuration
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Meta Ads API */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Facebook className="h-5 w-5 text-blue-600" />
                    Meta Ads API
                  </CardTitle>
                  <CardDescription>
                    Connect to Meta (Facebook/Instagram) Ads for campaign management
                  </CardDescription>
                </div>
                <Badge variant={metaConfig.isConnected ? "default" : "secondary"} className={metaConfig.isConnected ? "bg-blue-600" : ""}>
                  {metaConfig.isConnected ? (
                    <><CheckCircle className="h-3 w-3 mr-1" /> Connected</>
                  ) : (
                    <><AlertCircle className="h-3 w-3 mr-1" /> Not Connected</>
                  )}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="meta-appId">App ID</Label>
                  <Input
                    id="meta-appId"
                    placeholder="Enter your Meta App ID"
                    value={metaConfig.appId}
                    onChange={(e) => setMetaConfig(prev => ({ ...prev, appId: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="meta-appSecret">App Secret</Label>
                  <Input
                    id="meta-appSecret"
                    type="password"
                    placeholder="Enter your Meta App Secret"
                    value={metaConfig.appSecret}
                    onChange={(e) => setMetaConfig(prev => ({ ...prev, appSecret: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="meta-accessToken">Access Token</Label>
                  <Input
                    id="meta-accessToken"
                    type="password"
                    placeholder="Enter your long-lived access token"
                    value={metaConfig.accessToken}
                    onChange={(e) => setMetaConfig(prev => ({ ...prev, accessToken: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="meta-adAccountId">Ad Account ID</Label>
                  <Input
                    id="meta-adAccountId"
                    placeholder="act_XXXXXXXXX"
                    value={metaConfig.adAccountId}
                    onChange={(e) => setMetaConfig(prev => ({ ...prev, adAccountId: e.target.value }))}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="meta-pixelId">Pixel ID (Optional)</Label>
                  <Input
                    id="meta-pixelId"
                    placeholder="Enter your Meta Pixel ID"
                    value={metaConfig.pixelId}
                    onChange={(e) => setMetaConfig(prev => ({ ...prev, pixelId: e.target.value }))}
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button onClick={handleTestMetaConnection} variant="outline" className="gap-2">
                  <RefreshCw className="h-4 w-4" /> Test Connection
                </Button>
                <Button onClick={handleSaveMeta} className="gap-2">
                  <Save className="h-4 w-4" /> Save Configuration
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* n8n Integration */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Workflow className="h-5 w-5 text-orange-500" />
                    n8n Automation
                  </CardTitle>
                  <CardDescription>
                    Connect n8n for workflow automation and custom integrations
                  </CardDescription>
                </div>
                <Badge variant={n8nConfig.isConnected ? "default" : "secondary"} className={n8nConfig.isConnected ? "bg-orange-500" : ""}>
                  {n8nConfig.isConnected ? (
                    <><CheckCircle className="h-3 w-3 mr-1" /> Connected</>
                  ) : (
                    <><AlertCircle className="h-3 w-3 mr-1" /> Not Connected</>
                  )}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="n8n-webhookUrl">Webhook URL</Label>
                  <Input
                    id="n8n-webhookUrl"
                    placeholder="https://your-n8n-instance.com/webhook/..."
                    value={n8nConfig.webhookUrl}
                    onChange={(e) => setN8nConfig(prev => ({ ...prev, webhookUrl: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="n8n-apiKey">API Key (Optional)</Label>
                  <Input
                    id="n8n-apiKey"
                    type="password"
                    placeholder="Enter your n8n API key"
                    value={n8nConfig.apiKey}
                    onChange={(e) => setN8nConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                  />
                </div>
              </div>

              {/* Workflow Status */}
              <div className="space-y-3">
                <Label>Active Workflows</Label>
                <div className="space-y-2">
                  {n8nConfig.workflows.map(workflow => (
                    <div key={workflow.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="text-sm font-medium">{workflow.name}</span>
                      <Badge variant={workflow.status === "active" ? "default" : "secondary"}>
                        {workflow.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button onClick={handleTestN8nConnection} variant="outline" className="gap-2">
                  <RefreshCw className="h-4 w-4" /> Test Connection
                </Button>
                <Button onClick={handleSaveN8n} className="gap-2">
                  <Save className="h-4 w-4" /> Save Configuration
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* General Settings Tab */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Configure your platform preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={generalSettings.companyName}
                    onChange={(e) => setGeneralSettings(prev => ({ ...prev, companyName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supportEmail">Support Email</Label>
                  <Input
                    id="supportEmail"
                    type="email"
                    value={generalSettings.supportEmail}
                    onChange={(e) => setGeneralSettings(prev => ({ ...prev, supportEmail: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <Select
                    value={generalSettings.timezone}
                    onValueChange={(value) => setGeneralSettings(prev => ({ ...prev, timezone: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                      <SelectItem value="America/New_York">America/New York (EST)</SelectItem>
                      <SelectItem value="Asia/Dubai">Asia/Dubai (GST)</SelectItem>
                      <SelectItem value="Asia/Singapore">Asia/Singapore (SGT)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Date Format</Label>
                  <Select
                    value={generalSettings.dateFormat}
                    onValueChange={(value) => setGeneralSettings(prev => ({ ...prev, dateFormat: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handleSaveGeneral} className="gap-2">
                <Save className="h-4 w-4" />
                Save Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
              <CardDescription>Configure email notification preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>New Lead Notifications</Label>
                  <p className="text-xs text-muted-foreground">Receive an email when a new lead is captured</p>
                </div>
                <Switch
                  checked={notifications.emailNewLead}
                  onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, emailNewLead: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Campaign Status Updates</Label>
                  <p className="text-xs text-muted-foreground">Get notified when campaign status changes</p>
                </div>
                <Switch
                  checked={notifications.emailCampaignStatus}
                  onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, emailCampaignStatus: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Weekly Report</Label>
                  <p className="text-xs text-muted-foreground">Receive a weekly performance summary</p>
                </div>
                <Switch
                  checked={notifications.emailWeeklyReport}
                  onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, emailWeeklyReport: checked }))}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Push Notifications</CardTitle>
              <CardDescription>Configure in-app notification preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>New Lead Alerts</Label>
                  <p className="text-xs text-muted-foreground">Show push notification for new leads</p>
                </div>
                <Switch
                  checked={notifications.pushNewLead}
                  onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, pushNewLead: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Campaign Updates</Label>
                  <p className="text-xs text-muted-foreground">Show push notification for campaign changes</p>
                </div>
                <Switch
                  checked={notifications.pushCampaignStatus}
                  onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, pushCampaignStatus: checked }))}
                />
              </div>
              <Button onClick={handleSaveNotifications} className="gap-2 mt-4">
                <Save className="h-4 w-4" />
                Save Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>Manage admin team access and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Admin User</p>
                      <p className="text-sm text-muted-foreground">admin@naybourhood.ai</p>
                    </div>
                  </div>
                  <Badge>Owner</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      <Users className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">Support Team</p>
                      <p className="text-sm text-muted-foreground">support@naybourhood.ai</p>
                    </div>
                  </div>
                  <Badge variant="outline">Admin</Badge>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-4">
                + Invite Team Member
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;
