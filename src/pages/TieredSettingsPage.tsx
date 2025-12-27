import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { SUBSCRIPTION_TIERS, SubscriptionTier } from '@/lib/subscriptionTiers';
import { accountManager } from '@/lib/buyerData';
import { 
  Crown, 
  Check, 
  Phone, 
  Mail, 
  MessageCircle,
  Building,
  Bell,
  CreditCard,
  Users,
  Sparkles,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface TieredSettingsPageProps {
  userType: 'developer' | 'agent' | 'broker';
}

const TieredSettingsPage: React.FC<TieredSettingsPageProps> = ({ userType }) => {
  const { currentTier, tierConfig, setTier, contactsUsed } = useSubscription();

  const handleSave = () => {
    toast.success('Settings saved', {
      description: 'Your preferences have been updated.',
    });
  };

  const handleUpgrade = (tier: SubscriptionTier) => {
    setTier(tier);
    toast.success(`Upgraded to ${SUBSCRIPTION_TIERS[tier].name}`, {
      description: 'Your plan has been updated.',
    });
  };

  return (
    <DashboardLayout title="Settings" userType={userType}>
      <Tabs defaultValue="subscription" className="space-y-6">
        <TabsList>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
          <TabsTrigger value="company">Company Profile</TabsTrigger>
          <TabsTrigger value="preferences">Matching Preferences</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          {currentTier === 'enterprise' && (
            <TabsTrigger value="account-manager">Account Manager</TabsTrigger>
          )}
        </TabsList>

        {/* Subscription Tab */}
        <TabsContent value="subscription" className="space-y-6">
          {/* Current Plan */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5" />
                Current Plan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold">{tierConfig.name}</span>
                    {tierConfig.isPopular && (
                      <Badge className="bg-amber-500 text-white">Most Popular</Badge>
                    )}
                  </div>
                  <p className="text-2xl font-bold mt-1">{tierConfig.priceDisplay}<span className="text-sm font-normal text-muted-foreground">/month</span></p>
                </div>
                <Badge variant="outline" className="text-green-600 border-green-500/30">
                  Active
                </Badge>
              </div>

              <Separator />

              {/* Key Features */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{tierConfig.monthlyContactsDisplay} contacts/month</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Sparkles className="h-4 w-4 text-muted-foreground" />
                  <span>{tierConfig.aiInsightsCount} AI insights</span>
                </div>
              </div>

              {/* Usage */}
              <div className="p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span>Contacts used this month</span>
                  <span className="font-medium">
                    {contactsUsed} / {tierConfig.monthlyContactsDisplay}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Plan Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>Compare Plans</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.values(SUBSCRIPTION_TIERS).map((tier) => (
                  <Card 
                    key={tier.tier}
                    className={cn(
                      "relative",
                      tier.tier === currentTier && "border-primary",
                      tier.isPopular && "border-amber-500"
                    )}
                  >
                    {tier.isPopular && (
                      <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-amber-500 text-white">
                        Most Popular
                      </Badge>
                    )}
                    <CardContent className="pt-6">
                      <h3 className="font-semibold text-lg">{tier.name}</h3>
                      <p className="text-2xl font-bold mt-1">
                        {tier.priceDisplay}
                        <span className="text-sm font-normal text-muted-foreground">/mo</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{tier.description}</p>

                      <ul className="mt-4 space-y-2">
                        <li className="flex items-center gap-2 text-xs">
                          <Check className="h-3 w-3 text-green-500" />
                          {tier.monthlyContactsDisplay} contacts
                        </li>
                        <li className="flex items-center gap-2 text-xs">
                          <Check className="h-3 w-3 text-green-500" />
                          {tier.buyerDatabaseAccess}
                        </li>
                        <li className="flex items-center gap-2 text-xs">
                          <Check className="h-3 w-3 text-green-500" />
                          {tier.aiInsightsDescription}
                        </li>
                        <li className="flex items-center gap-2 text-xs">
                          <Check className="h-3 w-3 text-green-500" />
                          {tier.supportDescription}
                        </li>
                        {tier.firstRefusalBuyers && (
                          <li className="flex items-center gap-2 text-xs">
                            <Zap className="h-3 w-3 text-amber-500" />
                            First Refusal (80+ buyers)
                          </li>
                        )}
                      </ul>

                      <Button 
                        className={cn(
                          "w-full mt-4",
                          tier.tier === currentTier && "bg-muted text-muted-foreground"
                        )}
                        variant={tier.tier === currentTier ? "outline" : "default"}
                        disabled={tier.tier === currentTier}
                        onClick={() => handleUpgrade(tier.tier)}
                      >
                        {tier.tier === currentTier ? 'Current Plan' : 
                         tier.tier === 'access' ? 'Downgrade' : 'Upgrade'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Company Profile Tab */}
        <TabsContent value="company" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Company Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input id="companyName" defaultValue="Acme Properties Ltd" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Contact Email</Label>
                  <Input id="email" type="email" defaultValue="contact@acmeproperties.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" type="tel" defaultValue="+44 20 7946 0958" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input id="website" defaultValue="https://acmeproperties.com" />
                </div>
              </div>
              <Button onClick={handleSave}>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Matching Preferences Tab */}
        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Matching Preferences</CardTitle>
              <p className="text-sm text-muted-foreground">
                These preferences help us match you with the right buyers
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Development Locations</Label>
                  <Input placeholder="e.g., London, Manchester, Birmingham" />
                </div>
                <div className="space-y-2">
                  <Label>Price Range</Label>
                  <Input placeholder="e.g., £400K - £1.5M" />
                </div>
                <div className="space-y-2">
                  <Label>Property Types</Label>
                  <Input placeholder="e.g., Apartments, Houses, Penthouses" />
                </div>
                <div className="space-y-2">
                  <Label>Target Buyer Regions</Label>
                  <Input placeholder="e.g., UK, UAE, Nigeria, Singapore" />
                </div>
              </div>
              <Button onClick={handleSave}>Save Preferences</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">New Buyer Matches</p>
                    <p className="text-sm text-muted-foreground">Get notified when new buyers match your criteria</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Buyer Responses</p>
                    <p className="text-sm text-muted-foreground">Get notified when a buyer responds to your message</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Weekly Digest</p>
                    <p className="text-sm text-muted-foreground">Receive a weekly summary of your activity</p>
                  </div>
                  <Switch defaultChecked={currentTier !== 'access'} disabled={currentTier === 'access'} />
                </div>
                {currentTier === 'access' && (
                  <p className="text-xs text-muted-foreground">
                    Weekly digest is available on Growth and Enterprise plans
                  </p>
                )}
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Campaign Updates</p>
                    <p className="text-sm text-muted-foreground">Get updates on campaign performance</p>
                  </div>
                  <Switch defaultChecked={currentTier !== 'access'} disabled={currentTier === 'access'} />
                </div>
              </div>
              <Button onClick={handleSave}>Save Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Account Manager Tab (Tier 3 only) */}
        {currentTier === 'enterprise' && (
          <TabsContent value="account-manager" className="space-y-6">
            <Card className="bg-gradient-to-r from-primary/5 to-purple-500/5 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-amber-500" />
                  Your Dedicated Account Manager
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xl font-bold text-primary">{accountManager.avatar}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{accountManager.name}</h3>
                    <p className="text-sm text-muted-foreground">{accountManager.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{accountManager.availability}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => window.location.href = `tel:${accountManager.phone}`}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Call
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => window.location.href = `mailto:${accountManager.email}`}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </Button>
                  <Button 
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => window.open(`https://wa.me/${accountManager.whatsapp.replace(/\D/g, '')}`, '_blank')}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    WhatsApp
                  </Button>
                </div>

                <div className="p-4 bg-background/50 rounded-lg">
                  <h4 className="font-medium mb-2">Premium Support Includes:</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Priority response within 2 hours</li>
                    <li>• Monthly strategy calls</li>
                    <li>• Custom reporting and insights</li>
                    <li>• Dedicated campaign optimization</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </DashboardLayout>
  );
};

export default TieredSettingsPage;
