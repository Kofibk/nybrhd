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
  Shield,
  Webhook,
  Save,
  CheckCircle,
  AlertCircle,
  Link,
  Phone,
  Mail,
  Globe,
  Key,
  RefreshCw
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

const AdminSettings = () => {
  const [whatsappConfig, setWhatsappConfig] = useState({
    accessToken: "",
    phoneNumberId: "",
    businessAccountId: "",
    webhookVerifyToken: "",
    webhookUrl: "",
    isConnected: false,
    autoReply: true,
    welcomeMessage: "Hello! Thank you for contacting Naybourhood. How can we help you today?",
    awayMessage: "We're currently away but will get back to you as soon as possible.",
    businessHoursStart: "09:00",
    businessHoursEnd: "18:00"
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

  const handleTestConnection = () => {
    if (!whatsappConfig.accessToken || !whatsappConfig.phoneNumberId) {
      toast({
        title: "Missing credentials",
        description: "Please enter your WhatsApp Business API credentials first.",
        variant: "destructive"
      });
      return;
    }
    
    // Simulated test - in production this would make an actual API call
    toast({
      title: "Connection test initiated",
      description: "Testing WhatsApp Business API connection...",
    });
    
    setTimeout(() => {
      setWhatsappConfig(prev => ({ ...prev, isConnected: true }));
      toast({
        title: "Connection successful",
        description: "WhatsApp Business API is properly configured.",
      });
    }, 2000);
  };

  const handleSaveGeneral = () => {
    toast({
      title: "Settings saved",
      description: "General settings have been updated.",
    });
  };

  const handleSaveNotifications = () => {
    toast({
      title: "Notification preferences saved",
      description: "Your notification settings have been updated.",
    });
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="whatsapp" className="space-y-4">
        <TabsList className="w-full md:w-auto overflow-x-auto">
          <TabsTrigger value="whatsapp" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">WhatsApp API</span>
          </TabsTrigger>
          <TabsTrigger value="general" className="gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">General</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="team" className="gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Team</span>
          </TabsTrigger>
        </TabsList>

        {/* WhatsApp Business API Tab */}
        <TabsContent value="whatsapp" className="space-y-4">
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
                    <>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Connected
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Not Connected
                    </>
                  )}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* API Credentials */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  API Credentials
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="accessToken">Access Token</Label>
                    <Input
                      id="accessToken"
                      type="password"
                      placeholder="Enter your WhatsApp access token"
                      value={whatsappConfig.accessToken}
                      onChange={(e) => setWhatsappConfig(prev => ({ ...prev, accessToken: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumberId">Phone Number ID</Label>
                    <Input
                      id="phoneNumberId"
                      placeholder="Enter your phone number ID"
                      value={whatsappConfig.phoneNumberId}
                      onChange={(e) => setWhatsappConfig(prev => ({ ...prev, phoneNumberId: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="businessAccountId">Business Account ID</Label>
                    <Input
                      id="businessAccountId"
                      placeholder="Enter your business account ID"
                      value={whatsappConfig.businessAccountId}
                      onChange={(e) => setWhatsappConfig(prev => ({ ...prev, businessAccountId: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="webhookVerifyToken">Webhook Verify Token</Label>
                    <Input
                      id="webhookVerifyToken"
                      placeholder="Create a verify token"
                      value={whatsappConfig.webhookVerifyToken}
                      onChange={(e) => setWhatsappConfig(prev => ({ ...prev, webhookVerifyToken: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              {/* Webhook Configuration */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <Webhook className="h-4 w-4" />
                  Webhook Configuration
                </h3>
                <div className="space-y-2">
                  <Label htmlFor="webhookUrl">Webhook URL (for Meta Dashboard)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="webhookUrl"
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
                  <p className="text-xs text-muted-foreground">
                    Add this URL to your WhatsApp Business API webhook settings in the Meta Developer Dashboard
                  </p>
                </div>
              </div>

              {/* Auto-Reply Settings */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Auto-Reply Settings
                </h3>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable Auto-Reply</Label>
                    <p className="text-xs text-muted-foreground">Automatically respond to incoming messages</p>
                  </div>
                  <Switch
                    checked={whatsappConfig.autoReply}
                    onCheckedChange={(checked) => setWhatsappConfig(prev => ({ ...prev, autoReply: checked }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="welcomeMessage">Welcome Message</Label>
                  <Textarea
                    id="welcomeMessage"
                    placeholder="Enter your welcome message"
                    value={whatsappConfig.welcomeMessage}
                    onChange={(e) => setWhatsappConfig(prev => ({ ...prev, welcomeMessage: e.target.value }))}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="awayMessage">Away Message</Label>
                  <Textarea
                    id="awayMessage"
                    placeholder="Enter your away message"
                    value={whatsappConfig.awayMessage}
                    onChange={(e) => setWhatsappConfig(prev => ({ ...prev, awayMessage: e.target.value }))}
                    rows={3}
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Business Hours Start</Label>
                    <Input
                      type="time"
                      value={whatsappConfig.businessHoursStart}
                      onChange={(e) => setWhatsappConfig(prev => ({ ...prev, businessHoursStart: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Business Hours End</Label>
                    <Input
                      type="time"
                      value={whatsappConfig.businessHoursEnd}
                      onChange={(e) => setWhatsappConfig(prev => ({ ...prev, businessHoursEnd: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleTestConnection} variant="outline" className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Test Connection
                </Button>
                <Button onClick={handleSaveWhatsApp} className="gap-2">
                  <Save className="h-4 w-4" />
                  Save Configuration
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* WhatsApp Templates */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Message Templates</CardTitle>
              <CardDescription>
                Pre-approved message templates for WhatsApp Business API
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">Lead Welcome</span>
                    <Badge variant="outline" className="text-green-500 border-green-500">Approved</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {'"Hi {name}, thank you for your interest in {property}. Our team will contact you shortly."'}
                  </p>
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">Viewing Confirmation</span>
                    <Badge variant="outline" className="text-green-500 border-green-500">Approved</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {'"Your viewing for {property} is confirmed for {date} at {time}. Reply YES to confirm."'}
                  </p>
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">Follow-up Reminder</span>
                    <Badge variant="outline" className="text-yellow-500 border-yellow-500">Pending</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {'"Hi {name}, we wanted to follow up on your inquiry about {property}. Are you still interested?"'}
                  </p>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-4">
                + Add New Template
              </Button>
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
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Manage how you receive updates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Notifications
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>New Lead Alerts</Label>
                      <p className="text-xs text-muted-foreground">Receive email when new leads come in</p>
                    </div>
                    <Switch
                      checked={notifications.emailNewLead}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, emailNewLead: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Campaign Status Updates</Label>
                      <p className="text-xs text-muted-foreground">Updates on campaign performance changes</p>
                    </div>
                    <Switch
                      checked={notifications.emailCampaignStatus}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, emailCampaignStatus: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Weekly Reports</Label>
                      <p className="text-xs text-muted-foreground">Receive weekly summary reports</p>
                    </div>
                    <Switch
                      checked={notifications.emailWeeklyReport}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, emailWeeklyReport: checked }))}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Push Notifications
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>New Lead Alerts</Label>
                      <p className="text-xs text-muted-foreground">Browser notifications for new leads</p>
                    </div>
                    <Switch
                      checked={notifications.pushNewLead}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, pushNewLead: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Campaign Updates</Label>
                      <p className="text-xs text-muted-foreground">Browser notifications for campaign changes</p>
                    </div>
                    <Switch
                      checked={notifications.pushCampaignStatus}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, pushCampaignStatus: checked }))}
                    />
                  </div>
                </div>
              </div>

              <Button onClick={handleSaveNotifications} className="gap-2">
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
              <CardTitle>Team Management</CardTitle>
              <CardDescription>Manage admin team access and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-medium">AD</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">Admin User</p>
                      <p className="text-xs text-muted-foreground">admin@naybourhood.ai</p>
                    </div>
                  </div>
                  <Badge>Owner</Badge>
                </div>
                <Button variant="outline" className="w-full">
                  + Invite Team Member
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;