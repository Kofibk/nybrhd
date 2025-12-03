import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  Users, 
  Link2, 
  Bell,
  Upload,
  Download,
  Plus,
  Trash2
} from "lucide-react";
import { useState } from "react";

interface SettingsProps {
  userType: "developer" | "agent" | "broker";
}

const Settings = ({ userType }: SettingsProps) => {
  const [logo, setLogo] = useState<string | null>(null);

  const teamMembers = [
    { name: "John Smith", email: "john@example.com", role: "Admin", status: "active" },
    { name: "Sarah Johnson", email: "sarah@example.com", role: "Manager", status: "active" },
    { name: "Mike Chen", email: "mike@example.com", role: "Agent", status: "pending" },
  ];

  const integrations = [
    { name: "Meta Ads", description: "Connect your Meta Business account", connected: true, icon: "📘" },
    { name: "Google Ads", description: "Connect your Google Ads account", connected: true, icon: "🔍" },
    { name: "WhatsApp Business", description: "Enable WhatsApp messaging", connected: false, icon: "💬" },
    { name: "Zapier", description: "Automate workflows with 5000+ apps", connected: false, icon: "⚡" },
  ];

  return (
    <DashboardLayout title="Settings" userType={userType}>
      <Tabs defaultValue="company" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 max-w-2xl">
          <TabsTrigger value="company">Company Info</TabsTrigger>
          <TabsTrigger value="team">Team Access</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        {/* Company Info Tab */}
        <TabsContent value="company">
          <Card className="p-6 shadow-card">
            <div className="flex items-center gap-3 mb-6">
              <Building2 className="h-6 w-6 text-primary" />
              <h3 className="text-xl font-semibold">Company Information</h3>
            </div>
            
            <div className="space-y-6 max-w-2xl">
              {/* Logo Upload */}
              <div>
                <Label className="mb-2 block">Company Logo</Label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center border-2 border-dashed border-border">
                    {logo ? (
                      <img src={logo} alt="Logo" className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <Upload className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <Button variant="outline" size="sm">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Logo
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 2MB</p>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input id="companyName" defaultValue="Premier Developments Ltd" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="companyWebsite">Website</Label>
                  <Input id="companyWebsite" defaultValue="https://premierdevelopments.com" className="mt-1" />
                </div>
              </div>

              <div>
                <Label htmlFor="companyRegion">Primary Region</Label>
                <Input id="companyRegion" defaultValue="United Kingdom" className="mt-1" />
              </div>

              <div>
                <Label htmlFor="budgetThreshold">Monthly Budget Threshold (£)</Label>
                <Input id="budgetThreshold" type="number" defaultValue="10000" className="mt-1" />
                <p className="text-xs text-muted-foreground mt-1">Alert when monthly spend exceeds this amount</p>
              </div>

              <Button>Save Changes</Button>
            </div>
          </Card>
        </TabsContent>

        {/* Team Access Tab */}
        <TabsContent value="team">
          <Card className="p-6 shadow-card">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Users className="h-6 w-6 text-primary" />
                <h3 className="text-xl font-semibold">Team Access</h3>
              </div>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Invite User
              </Button>
            </div>
            
            <div className="space-y-4">
              {teamMembers.map((member, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-medium">{member.name.charAt(0)}</span>
                    </div>
                    <div>
                      <div className="font-medium text-foreground">{member.name}</div>
                      <div className="text-sm text-muted-foreground">{member.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={member.status === "active" ? "default" : "secondary"}>
                      {member.role}
                    </Badge>
                    {member.status === "pending" && (
                      <Badge variant="outline">Pending</Badge>
                    )}
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations">
          <Card className="p-6 shadow-card">
            <div className="flex items-center gap-3 mb-6">
              <Link2 className="h-6 w-6 text-primary" />
              <h3 className="text-xl font-semibold">Integrations</h3>
            </div>
            
            <div className="space-y-4">
              {integrations.map((integration, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">{integration.icon}</div>
                    <div>
                      <div className="font-medium text-foreground">{integration.name}</div>
                      <div className="text-sm text-muted-foreground">{integration.description}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {integration.connected ? (
                      <>
                        <Badge variant="default" className="bg-success">Connected</Badge>
                        <Button variant="outline" size="sm">Manage</Button>
                      </>
                    ) : (
                      <Button size="sm">Connect</Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences">
          <div className="space-y-6">
            <Card className="p-6 shadow-card">
              <div className="flex items-center gap-3 mb-6">
                <Bell className="h-6 w-6 text-primary" />
                <h3 className="text-xl font-semibold">Notification Preferences</h3>
              </div>
              
              <div className="space-y-6 max-w-2xl">
                {[
                  { label: "New Lead Notifications", description: "Get notified when new leads arrive", enabled: true },
                  { label: "Campaign Alerts", description: "Receive alerts about campaign performance", enabled: true },
                  { label: "Weekly Summary", description: "Receive weekly performance reports", enabled: true },
                  { label: "AI Recommendations", description: "Get AI-powered optimization tips", enabled: false },
                ].map((pref, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-foreground">{pref.label}</div>
                      <p className="text-sm text-muted-foreground">{pref.description}</p>
                    </div>
                    <Switch defaultChecked={pref.enabled} />
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6 shadow-card">
              <div className="flex items-center gap-3 mb-6">
                <Download className="h-6 w-6 text-primary" />
                <h3 className="text-xl font-semibold">Data Export</h3>
              </div>
              
              <div className="space-y-4 max-w-2xl">
                <p className="text-muted-foreground">Download your leads and campaign data in CSV format.</p>
                <div className="flex gap-3">
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export All Leads
                  </Button>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export Campaigns
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default Settings;