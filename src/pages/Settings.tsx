import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { LeadSourceManager } from "@/components/LeadSourceManager";
import { PricingDisplay, UpgradeModal } from "@/components/PricingDisplay";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Building2, 
  Users, 
  Link2, 
  Bell,
  Upload,
  Download,
  Plus,
  Trash2,
  Crown,
  CreditCard,
  CheckCircle,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface SettingsProps {
  userType: "developer" | "agent" | "broker" | "admin";
}

const Settings = ({ userType }: SettingsProps) => {
  const [logo, setLogo] = useState<string | null>(null);
  const [isManageLoading, setIsManageLoading] = useState(false);
  const { currentTier, tierConfig, contactsUsed, contactsRemaining, openCustomerPortal } = useSubscription();
  const { isAuthenticated } = useAuth();

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
      <Tabs defaultValue="subscription" className="h-full flex flex-col min-h-0">
        <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
          <TabsList className="inline-flex w-auto min-w-full md:grid md:w-full md:grid-cols-6 md:max-w-4xl">
            <TabsTrigger value="subscription" className="text-xs md:text-sm whitespace-nowrap gap-1.5">
              <Crown className="h-3.5 w-3.5" />
              Subscription
            </TabsTrigger>
            <TabsTrigger value="company" className="text-xs md:text-sm whitespace-nowrap">Company</TabsTrigger>
            <TabsTrigger value="team" className="text-xs md:text-sm whitespace-nowrap">Team</TabsTrigger>
            <TabsTrigger value="lead-sources" className="text-xs md:text-sm whitespace-nowrap">Lead Sources</TabsTrigger>
            <TabsTrigger value="integrations" className="text-xs md:text-sm whitespace-nowrap">Integrations</TabsTrigger>
            <TabsTrigger value="preferences" className="text-xs md:text-sm whitespace-nowrap">Preferences</TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 min-h-0 overflow-auto mt-4 md:mt-6">
          {/* Subscription Tab */}
          <TabsContent value="subscription" className="mt-0 space-y-6">
            {/* Current Plan Summary */}
            <Card className="p-4 md:p-6 shadow-card">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2 rounded-lg",
                    tierConfig.isPopular ? "bg-amber-500/10" : "bg-primary/10"
                  )}>
                    <Crown className={cn(
                      "h-6 w-6",
                      tierConfig.isPopular ? "text-amber-500" : "text-primary"
                    )} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-semibold">{tierConfig.name} Plan</h3>
                      {tierConfig.isPopular && (
                        <Badge className="bg-amber-500 text-black text-xs">Popular</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{tierConfig.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{tierConfig.priceDisplay}</div>
                  <p className="text-sm text-muted-foreground">per month</p>
                </div>
              </div>

              {/* Usage Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="p-4 rounded-lg bg-muted/30">
                  <div className="text-xs text-muted-foreground mb-1">Monthly Contacts</div>
                  <div className="text-xl font-bold">{contactsUsed} / {tierConfig.monthlyContactsDisplay}</div>
                  {contactsRemaining !== 'unlimited' && (
                    <div className="h-1.5 bg-muted rounded-full mt-2 overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all" 
                        style={{ width: `${(contactsUsed / (tierConfig.monthlyContacts as number)) * 100}%` }}
                      />
                    </div>
                  )}
                </div>
                <div className="p-4 rounded-lg bg-muted/30">
                  <div className="text-xs text-muted-foreground mb-1">Buyer Access</div>
                  <div className="text-sm font-medium">{tierConfig.buyerDatabaseAccess}</div>
                </div>
                <div className="p-4 rounded-lg bg-muted/30">
                  <div className="text-xs text-muted-foreground mb-1">AI Insights</div>
                  <div className="text-sm font-medium">{tierConfig.aiInsightsCount}</div>
                </div>
                <div className="p-4 rounded-lg bg-muted/30">
                  <div className="text-xs text-muted-foreground mb-1">Support</div>
                  <div className="text-sm font-medium capitalize">{tierConfig.support}</div>
                </div>
              </div>

              {/* Current Features */}
              <div className="border-t border-border pt-4">
                <h4 className="text-sm font-medium mb-3">Your Plan Includes</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {[
                    tierConfig.campaignsDescription,
                    tierConfig.scoreBreakdownDescription,
                    tierConfig.supportDescription,
                    tierConfig.aiInsightsDescription,
                    tierConfig.firstRefusalBuyers && 'First Refusal on 80+ Buyers',
                    tierConfig.qualityIntentScoring && 'Quality + Intent Scoring',
                    tierConfig.weeklyEmailDigest && 'Weekly Email Digest',
                    tierConfig.predictiveAnalytics && 'Predictive Analytics',
                  ].filter(Boolean).map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Pricing Comparison */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Compare Plans</h3>
              <PricingDisplay variant="cards" />
            </div>

            {/* Billing Info */}
            <Card className="p-4 md:p-6 shadow-card">
              <div className="flex items-center gap-3 mb-4">
                <CreditCard className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Billing Information</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-6 max-w-2xl">
                <div>
                  <Label className="text-sm text-muted-foreground">Next billing date</Label>
                  <p className="font-medium">1st February 2025</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Payment method</Label>
                  <p className="font-medium">•••• •••• •••• 4242</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 mt-4">
                {isAuthenticated ? (
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={async () => {
                      setIsManageLoading(true);
                      try {
                        await openCustomerPortal();
                      } catch (error) {
                        toast.error('Failed to open billing portal');
                      } finally {
                        setIsManageLoading(false);
                      }
                    }}
                    disabled={isManageLoading}
                  >
                    {isManageLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Opening...
                      </>
                    ) : (
                      <>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Manage Subscription
                      </>
                    )}
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" disabled>
                    Sign in to manage subscription
                  </Button>
                )}
                <Button variant="outline" size="sm">Download Invoices</Button>
              </div>
            </Card>
          </TabsContent>

          {/* Company Info Tab */}
          <TabsContent value="company" className="mt-0">
            <Card className="p-4 md:p-6 shadow-card">
              <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
                <Building2 className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                <h3 className="text-lg md:text-xl font-semibold">Company Information</h3>
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
            <Card className="p-4 md:p-6 shadow-card">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 md:mb-6">
                <div className="flex items-center gap-2 md:gap-3">
                  <Users className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                  <h3 className="text-lg md:text-xl font-semibold">Team Access</h3>
                </div>
                <Button size="sm" className="w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Invite User
                </Button>
              </div>
              
              <div className="space-y-3 md:space-y-4">
                {teamMembers.map((member, index) => (
                  <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 md:p-4 border border-border rounded-lg">
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-primary font-medium text-sm md:text-base">{member.name.charAt(0)}</span>
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-foreground text-sm md:text-base">{member.name}</div>
                        <div className="text-xs md:text-sm text-muted-foreground truncate">{member.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 md:gap-3 ml-11 sm:ml-0">
                      <Badge variant={member.status === "active" ? "default" : "secondary"} className="text-xs">
                        {member.role}
                      </Badge>
                      {member.status === "pending" && (
                        <Badge variant="outline" className="text-xs">Pending</Badge>
                      )}
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Lead Sources Tab */}
          <TabsContent value="lead-sources">
            <LeadSourceManager />
          </TabsContent>

          {/* Integrations Tab */}
          <TabsContent value="integrations">
            <Card className="p-4 md:p-6 shadow-card">
              <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
                <Link2 className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                <h3 className="text-lg md:text-xl font-semibold">Integrations</h3>
              </div>
              
              <div className="space-y-3 md:space-y-4">
                {integrations.map((integration, index) => (
                  <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 md:p-4 border border-border rounded-lg">
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="text-xl md:text-2xl">{integration.icon}</div>
                      <div className="min-w-0">
                        <div className="font-medium text-foreground text-sm md:text-base">{integration.name}</div>
                        <div className="text-xs md:text-sm text-muted-foreground">{integration.description}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 md:gap-3 ml-9 sm:ml-0">
                      {integration.connected ? (
                        <>
                          <Badge variant="default" className="bg-green-500/20 text-green-500 text-xs">Connected</Badge>
                          <Button variant="outline" size="sm" className="text-xs md:text-sm">Manage</Button>
                        </>
                      ) : (
                        <Button size="sm" className="text-xs md:text-sm">Connect</Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences">
            <div className="space-y-4 md:space-y-6">
              <Card className="p-4 md:p-6 shadow-card">
                <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
                  <Bell className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                  <h3 className="text-lg md:text-xl font-semibold">Notification Preferences</h3>
                </div>
                
                <div className="space-y-4 md:space-y-6 max-w-2xl">
                  {[
                    { label: "New Lead Notifications", description: "Get notified when new leads arrive", enabled: true },
                    { label: "Campaign Alerts", description: "Receive alerts about campaign performance", enabled: true },
                    { label: "Weekly Summary", description: "Receive weekly performance reports", enabled: true },
                    { label: "AI Recommendations", description: "Get AI-powered optimisation tips", enabled: tierConfig.weeklyEmailDigest },
                  ].map((pref, index) => (
                    <div key={index} className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <div className="font-medium text-foreground text-sm md:text-base">{pref.label}</div>
                        <p className="text-xs md:text-sm text-muted-foreground">{pref.description}</p>
                      </div>
                      <Switch defaultChecked={pref.enabled} />
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-4 md:p-6 shadow-card">
                <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
                  <Download className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                  <h3 className="text-lg md:text-xl font-semibold">Data Export</h3>
                </div>
                
                <div className="space-y-4 max-w-2xl">
                  <p className="text-muted-foreground text-sm md:text-base">Download your leads and campaign data in CSV format.</p>
                  <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
                    <Button variant="outline" className="w-full sm:w-auto text-xs md:text-sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export All Leads
                    </Button>
                    <Button variant="outline" className="w-full sm:w-auto text-xs md:text-sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export Campaigns
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </DashboardLayout>
  );
};

export default Settings;
