import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { SUBSCRIPTION_TIERS, SubscriptionTier } from '@/lib/subscriptionTiers';
import {
  getDemoOnboardingSubmissions, 
  isUuid,
  type DemoOnboardingSubmission 
} from '@/lib/demoOnboardingStore';
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
  Zap,
  User,
  Camera,
  Download,
  FileText,
  Upload,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface TieredSettingsPageProps {
  userType: 'developer' | 'agent' | 'broker';
}

// UK Regions for selection
const REGIONS = [
  "London", "South East", "South West", "East of England", 
  "East Midlands", "West Midlands", "Yorkshire", "North West", 
  "North East", "Wales", "Scotland", "Northern Ireland"
];

const TieredSettingsPage: React.FC<TieredSettingsPageProps> = ({ userType }) => {
  const { currentTier, tierConfig, setTier, contactsUsed } = useSubscription();
  const { user } = useAuth();
  
  // Get guest ID for unauthenticated users
  const guestId = localStorage.getItem('guest_onboarding_id') || '';
  const effectiveUserId = user?.id || guestId;
  
  const [isLoading, setIsLoading] = useState(true);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: user?.email || '',
    phone: '',
    jobTitle: '',
    avatarUrl: '',
  });

  const [companyData, setCompanyData] = useState({
    companyName: '',
    website: '',
    linkedin: '',
    instagram: '',
    address: '',
    logoUrl: '',
    regions: [] as string[],
  });

  // Load profile and company data on mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      // For demo/guest users, load from localStorage
      if (!user?.id || !isUuid(effectiveUserId)) {
        const submissions = getDemoOnboardingSubmissions();
        const userSubmission = submissions.find(s => s.user.id === effectiveUserId);
        
        if (userSubmission) {
          setProfileData({
            fullName: userSubmission.user.full_name || '',
            email: userSubmission.user.email || '',
            phone: userSubmission.user.phone || '',
            jobTitle: userSubmission.user.job_title || '',
            avatarUrl: '',
          });
          setCompanyData({
            companyName: userSubmission.company.name || '',
            website: userSubmission.company.website || '',
            linkedin: '',
            instagram: '',
            address: userSubmission.company.address || '',
            logoUrl: userSubmission.company.logo_url || '',
            regions: userSubmission.user.regions_covered || [],
          });
          if (userSubmission.company.logo_url) {
            setLogoPreview(userSubmission.company.logo_url);
          }
        }
        setIsLoading(false);
        return;
      }

      // For authenticated users, load from Supabase
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (profile) {
          setProfileData({
            fullName: profile.full_name || '',
            email: profile.email || '',
            phone: profile.phone || '',
            jobTitle: profile.job_title || '',
            avatarUrl: profile.avatar_url || '',
          });
          setCompanyData({
            companyName: '',
            website: profile.company_website || '',
            linkedin: profile.company_linkedin || '',
            instagram: profile.company_instagram || '',
            address: profile.company_address || '',
            logoUrl: profile.company_logo_url || '',
            regions: profile.regions_covered || [],
          });
          if (profile.company_logo_url) {
            setLogoPreview(profile.company_logo_url);
          }

          // Load company name if company_id exists
          if (profile.company_id) {
            const { data: company } = await supabase
              .from('companies')
              .select('name, website, address, logo_url')
              .eq('id', profile.company_id)
              .single();
            
            if (company) {
              setCompanyData(prev => ({
                ...prev,
                companyName: company.name || '',
                website: company.website || prev.website,
                address: company.address || prev.address,
                logoUrl: company.logo_url || prev.logoUrl,
              }));
              if (company.logo_url) {
                setLogoPreview(company.logo_url);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      }
      setIsLoading(false);
    };

    loadData();
  }, [user?.id, effectiveUserId]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setLogoPreview(result);
        setCompanyData(prev => ({ ...prev, logoUrl: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleRegion = (region: string) => {
    setCompanyData(prev => ({
      ...prev,
      regions: prev.regions.includes(region)
        ? prev.regions.filter(r => r !== region)
        : [...prev.regions, region]
    }));
  };

  const handleProfileSave = async () => {
    // For demo/guest users, update localStorage
    if (!user?.id || !isUuid(effectiveUserId)) {
      const STORAGE_KEY = "demo_onboarding_submissions_v1";
      const submissions = getDemoOnboardingSubmissions();
      const updatedSubmissions = submissions.map(s => {
        if (s.user.id === effectiveUserId) {
          return {
            ...s,
            user: {
              ...s.user,
              full_name: profileData.fullName,
              email: profileData.email,
              phone: profileData.phone,
              job_title: profileData.jobTitle,
            }
          };
        }
        return s;
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSubmissions));
      toast.success('Profile updated');
      return;
    }

    // For authenticated users, update Supabase
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profileData.fullName,
          phone: profileData.phone,
          job_title: profileData.jobTitle,
        })
        .eq('user_id', user.id);

      if (error) throw error;
      toast.success('Profile updated');
    } catch (error: any) {
      toast.error('Failed to save profile', { description: error.message });
    }
  };

  const handleCompanySave = async () => {
    // For demo/guest users, update localStorage
    if (!user?.id || !isUuid(effectiveUserId)) {
      const STORAGE_KEY = "demo_onboarding_submissions_v1";
      const submissions = getDemoOnboardingSubmissions();
      const updatedSubmissions = submissions.map(s => {
        if (s.user.id === effectiveUserId) {
          return {
            ...s,
            company: {
              ...s.company,
              name: companyData.companyName,
              website: companyData.website,
              address: companyData.address,
              logo_url: companyData.logoUrl,
            },
            user: {
              ...s.user,
              regions_covered: companyData.regions,
            }
          };
        }
        return s;
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSubmissions));
      toast.success('Company information updated');
      return;
    }

    // For authenticated users, update Supabase
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          company_website: companyData.website,
          company_linkedin: companyData.linkedin,
          company_instagram: companyData.instagram,
          company_address: companyData.address,
          company_logo_url: companyData.logoUrl,
          regions_covered: companyData.regions,
        })
        .eq('user_id', user.id);

      if (error) throw error;
      toast.success('Company information updated');
    } catch (error: any) {
      toast.error('Failed to save company info', { description: error.message });
    }
  };

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

  // Demo billing data
  const billingHistory = [
    { id: '1', date: 'Dec 1, 2024', amount: tierConfig.price, status: 'paid', invoice: 'INV-2024-012' },
    { id: '2', date: 'Nov 1, 2024', amount: tierConfig.price, status: 'paid', invoice: 'INV-2024-011' },
    { id: '3', date: 'Oct 1, 2024', amount: tierConfig.price, status: 'paid', invoice: 'INV-2024-010' },
  ];

  return (
    <DashboardLayout title="Settings" userType={userType}>
      <Tabs defaultValue="profile" className="space-y-6">
        <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
          <TabsList className="inline-flex w-auto min-w-full md:grid md:w-full md:grid-cols-6 md:max-w-4xl">
            <TabsTrigger value="profile" className="gap-1.5">
              <User className="h-3.5 w-3.5" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="subscription" className="gap-1.5">
              <Crown className="h-3.5 w-3.5" />
              Subscription
            </TabsTrigger>
            <TabsTrigger value="billing" className="gap-1.5">
              <CreditCard className="h-3.5 w-3.5" />
              Billing
            </TabsTrigger>
            <TabsTrigger value="company">Company</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="h-3.5 w-3.5 md:hidden" />
              <span className="hidden md:inline">Notifications</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Your Profile
              </CardTitle>
              <CardDescription>Manage your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={profileData.avatarUrl} />
                    <AvatarFallback className="text-xl bg-primary/10 text-primary">
                      {profileData.fullName?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <Button 
                    size="icon" 
                    variant="outline" 
                    className="absolute bottom-0 right-0 h-7 w-7 rounded-full"
                  >
                    <Camera className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <div>
                  <p className="font-medium">{profileData.fullName || 'User'}</p>
                  <p className="text-sm text-muted-foreground capitalize">{userType}</p>
                  <Badge variant="outline" className="mt-1">
                    {tierConfig.name} Plan
                  </Badge>
                </div>
              </div>

              <Separator />

              {/* Profile Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input 
                    id="fullName" 
                    value={profileData.fullName}
                    onChange={(e) => setProfileData(prev => ({ ...prev, fullName: e.target.value }))}
                    placeholder="John Smith"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profileEmail">Email</Label>
                  <Input 
                    id="profileEmail" 
                    type="email" 
                    value={profileData.email}
                    onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="john@company.com"
                    disabled={!!user?.email}
                    className={user?.email ? "bg-muted" : ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profilePhone">Phone</Label>
                  <Input 
                    id="profilePhone" 
                    type="tel" 
                    value={profileData.phone}
                    onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+44 7700 900000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jobTitle">Job Title</Label>
                  <Input 
                    id="jobTitle" 
                    value={profileData.jobTitle}
                    onChange={(e) => setProfileData(prev => ({ ...prev, jobTitle: e.target.value }))}
                    placeholder="e.g. Sales Director"
                  />
                </div>
              </div>

              <Button onClick={handleProfileSave} disabled={isLoading}>Save Profile</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-14 bg-gradient-to-r from-blue-600 to-blue-800 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">VISA</span>
                  </div>
                  <div>
                    <p className="font-medium">•••• •••• •••• 4242</p>
                    <p className="text-sm text-muted-foreground">Expires 12/26</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Update</Button>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Next billing date</p>
                  <p className="font-medium">January 1, 2025</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Amount</p>
                  <p className="font-medium">{tierConfig.priceDisplay}/month</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Billing History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {billingHistory.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{item.invoice}</p>
                        <p className="text-sm text-muted-foreground">{item.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-medium">£{item.amount}</p>
                        <Badge variant="outline" className="text-green-600 border-green-500/30 text-xs">
                          {item.status}
                        </Badge>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

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
                            Priority (80+ buyers)
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
              <CardDescription>Manage your company information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Logo Upload */}
              <div className="space-y-2">
                <Label>Company Logo</Label>
                <div className="flex items-center gap-4">
                  {logoPreview ? (
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted">
                      <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                      <button 
                        onClick={() => { setLogoPreview(null); setCompanyData(prev => ({ ...prev, logoUrl: '' })); }}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-destructive rounded-full flex items-center justify-center"
                      >
                        <X className="w-3 h-3 text-destructive-foreground" />
                      </button>
                    </div>
                  ) : (
                    <label className="w-16 h-16 rounded-lg border-2 border-dashed border-border hover:border-muted-foreground/50 flex items-center justify-center cursor-pointer transition-colors">
                      <Upload className="w-5 h-5 text-muted-foreground" />
                      <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                    </label>
                  )}
                  <p className="text-sm text-muted-foreground">Upload your company logo</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input 
                    id="companyName" 
                    value={companyData.companyName}
                    onChange={(e) => setCompanyData(prev => ({ ...prev, companyName: e.target.value }))}
                    placeholder="Acme Properties Ltd"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyWebsite">Website</Label>
                  <Input 
                    id="companyWebsite" 
                    value={companyData.website}
                    onChange={(e) => setCompanyData(prev => ({ ...prev, website: e.target.value }))}
                    placeholder="https://example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyLinkedin">LinkedIn</Label>
                  <Input 
                    id="companyLinkedin" 
                    value={companyData.linkedin}
                    onChange={(e) => setCompanyData(prev => ({ ...prev, linkedin: e.target.value }))}
                    placeholder="linkedin.com/company/..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyInstagram">Instagram</Label>
                  <Input 
                    id="companyInstagram" 
                    value={companyData.instagram}
                    onChange={(e) => setCompanyData(prev => ({ ...prev, instagram: e.target.value }))}
                    placeholder="@yourcompany"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="companyAddress">Business Address</Label>
                  <Input 
                    id="companyAddress" 
                    value={companyData.address}
                    onChange={(e) => setCompanyData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="London, UK"
                  />
                </div>
              </div>

              {/* Regions */}
              <div className="space-y-3">
                <Label>Regions Covered</Label>
                <div className="flex flex-wrap gap-2">
                  {REGIONS.map((region) => {
                    const isSelected = companyData.regions.includes(region);
                    return (
                      <button
                        key={region}
                        type="button"
                        onClick={() => toggleRegion(region)}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-sm transition-all",
                          isSelected 
                            ? "bg-primary text-primary-foreground" 
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        )}
                      >
                        {region}
                      </button>
                    );
                  })}
                </div>
              </div>

              <Button onClick={handleCompanySave} disabled={isLoading}>Save Changes</Button>
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
                    <span className="text-xl font-bold text-primary">NS</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Naybourhood Support</h3>
                    <p className="text-sm text-muted-foreground">Customer Success</p>
                    <p className="text-xs text-muted-foreground mt-1">Mon-Fri, 9am-6pm</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => window.location.href = `tel:+442079460958`}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Call
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => window.location.href = `mailto:support@naybourhood.com`}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </Button>
                  <Button 
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => window.open(`https://wa.me/442079460958`, '_blank')}
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
