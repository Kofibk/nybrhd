import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useAuth } from '@/contexts/AuthContext';
import { PricingDisplay } from '@/components/PricingDisplay';
import { SUBSCRIPTION_TIERS, SubscriptionTier } from '@/lib/subscriptionTiers';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import {
  Crown,
  CreditCard,
  CheckCircle,
  ExternalLink,
  Loader2,
  Calendar,
  TrendingUp,
  Users,
  Brain,
  Shield,
  Download,
  FileText,
  Clock,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

interface SubscriptionPageProps {
  userType?: 'developer' | 'agent' | 'broker';
}

const SubscriptionPage: React.FC<SubscriptionPageProps> = ({ userType = 'developer' }) => {
  const [isManageLoading, setIsManageLoading] = useState(false);
  const { 
    currentTier, 
    tierConfig, 
    contactsUsed, 
    contactsRemaining,
    isLoading,
    subscriptionStatus,
    subscriptionEnd,
    openCustomerPortal,
  } = useSubscription();
  const { isAuthenticated, profile } = useAuth();

  // Mock billing history - in production this would come from Stripe
  const billingHistory = [
    { 
      id: 'inv_001', 
      date: '2025-01-01', 
      amount: tierConfig.price, 
      status: 'paid',
      description: `${tierConfig.name} Plan - Monthly`,
    },
    { 
      id: 'inv_002', 
      date: '2024-12-01', 
      amount: tierConfig.price, 
      status: 'paid',
      description: `${tierConfig.name} Plan - Monthly`,
    },
    { 
      id: 'inv_003', 
      date: '2024-11-01', 
      amount: tierConfig.price, 
      status: 'paid',
      description: `${tierConfig.name} Plan - Monthly`,
    },
  ];

  const handleManageSubscription = async () => {
    setIsManageLoading(true);
    try {
      await openCustomerPortal();
    } catch (error) {
      toast.error('Failed to open billing portal');
    } finally {
      setIsManageLoading(false);
    }
  };

  const getStatusBadge = () => {
    if (!subscriptionStatus || subscriptionStatus === 'active') {
      return <Badge className="bg-green-500/20 text-green-600 border-green-500/30">Active</Badge>;
    }
    if (subscriptionStatus === 'trial') {
      return <Badge className="bg-blue-500/20 text-blue-600 border-blue-500/30">Trial</Badge>;
    }
    if (subscriptionStatus === 'past_due') {
      return <Badge className="bg-amber-500/20 text-amber-600 border-amber-500/30">Past Due</Badge>;
    }
    if (subscriptionStatus === 'cancelled') {
      return <Badge className="bg-red-500/20 text-red-600 border-red-500/30">Cancelled</Badge>;
    }
    return <Badge variant="secondary">{subscriptionStatus}</Badge>;
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Subscription" userType={userType}>
        <div className="space-y-6">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Subscription" userType={userType}>
      <div className="space-y-6 pb-8">
        {/* Current Plan Card */}
        <Card className="shadow-card overflow-hidden">
          <div className={cn(
            "h-2",
            currentTier === 'enterprise' ? "bg-gradient-to-r from-purple-500 to-pink-500" :
            currentTier === 'growth' ? "bg-gradient-to-r from-amber-500 to-orange-500" :
            "bg-gradient-to-r from-primary to-blue-500"
          )} />
          <CardHeader className="pb-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-3 rounded-xl",
                  currentTier === 'enterprise' ? "bg-purple-500/10" :
                  currentTier === 'growth' ? "bg-amber-500/10" :
                  "bg-primary/10"
                )}>
                  <Crown className={cn(
                    "h-7 w-7",
                    currentTier === 'enterprise' ? "text-purple-500" :
                    currentTier === 'growth' ? "text-amber-500" :
                    "text-primary"
                  )} />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <CardTitle className="text-2xl">{tierConfig.name} Plan</CardTitle>
                    {getStatusBadge()}
                    {tierConfig.isPopular && (
                      <Badge className="bg-amber-500 text-black">Most Popular</Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground mt-1">{tierConfig.description}</p>
                </div>
              </div>
              <div className="text-left md:text-right">
                <div className="text-3xl font-bold">{tierConfig.priceDisplay}</div>
                <p className="text-sm text-muted-foreground">per month</p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Usage Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Users className="h-4 w-4" />
                  <span className="text-xs font-medium">Monthly Contacts</span>
                </div>
                <div className="text-2xl font-bold">
                  {contactsUsed}
                  <span className="text-sm font-normal text-muted-foreground">
                    {' '}/ {tierConfig.monthlyContactsDisplay}
                  </span>
                </div>
                {contactsRemaining !== 'unlimited' && (
                  <div className="mt-2">
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          "h-full transition-all rounded-full",
                          (contactsUsed / (tierConfig.monthlyContacts as number)) > 0.9 
                            ? "bg-red-500" 
                            : (contactsUsed / (tierConfig.monthlyContacts as number)) > 0.7 
                            ? "bg-amber-500" 
                            : "bg-primary"
                        )}
                        style={{ 
                          width: `${Math.min(100, (contactsUsed / (tierConfig.monthlyContacts as number)) * 100)}%` 
                        }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {contactsRemaining} remaining
                    </p>
                  </div>
                )}
              </div>
              
              <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-xs font-medium">Buyer Access</span>
                </div>
                <div className="text-lg font-semibold">{tierConfig.buyerDatabaseAccess}</div>
                <p className="text-xs text-muted-foreground mt-1">Score threshold</p>
              </div>
              
              <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Brain className="h-4 w-4" />
                  <span className="text-xs font-medium">AI Insights</span>
                </div>
                <div className="text-lg font-semibold">{tierConfig.aiInsightsCount}</div>
                <p className="text-xs text-muted-foreground mt-1">{tierConfig.aiInsightsLevel} level</p>
              </div>
              
              <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Shield className="h-4 w-4" />
                  <span className="text-xs font-medium">Support</span>
                </div>
                <div className="text-lg font-semibold capitalize">{tierConfig.support}</div>
                <p className="text-xs text-muted-foreground mt-1">{tierConfig.supportDescription}</p>
              </div>
            </div>

            {/* Features List */}
            <div className="border-t border-border pt-4">
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Plan Features
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {[
                  tierConfig.campaignsDescription,
                  tierConfig.scoreBreakdownDescription,
                  tierConfig.buyerDatabaseDescription,
                  tierConfig.firstRefusalBuyers && 'First Refusal on 80+ Buyers',
                  tierConfig.qualityIntentScoring && 'Quality + Intent Scoring',
                  tierConfig.weeklyEmailDigest && 'Weekly Email Digest',
                  tierConfig.predictiveAnalytics && 'Predictive Analytics',
                  tierConfig.automatedFollowUps && 'Automated Follow-ups',
                  tierConfig.dailyInsightRefresh && 'Daily Insight Refresh',
                ].filter(Boolean).map((feature, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 pt-2">
              {isAuthenticated ? (
                <Button 
                  onClick={handleManageSubscription}
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
                <Button variant="outline" disabled>
                  Sign in to manage subscription
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upgrade Options */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">
              {currentTier === 'enterprise' ? 'All Plans' : 'Upgrade Your Plan'}
            </h2>
            {subscriptionEnd && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Next billing: {format(new Date(subscriptionEnd), 'MMM d, yyyy')}
              </div>
            )}
          </div>
          <PricingDisplay variant="cards" />
        </div>

        {/* Billing History */}
        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Billing History
              </CardTitle>
              {isAuthenticated && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleManageSubscription}
                  disabled={isManageLoading}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download All
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {billingHistory.map((invoice) => (
                <div 
                  key={invoice.id} 
                  className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-muted">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{invoice.description}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {format(new Date(invoice.date), 'MMMM d, yyyy')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge 
                      className={cn(
                        invoice.status === 'paid' 
                          ? "bg-green-500/20 text-green-600 border-green-500/30" 
                          : "bg-amber-500/20 text-amber-600 border-amber-500/30"
                      )}
                    >
                      {invoice.status === 'paid' ? 'Paid' : 'Pending'}
                    </Badge>
                    <span className="font-semibold min-w-[80px] text-right">
                      £{invoice.amount.toLocaleString()}
                    </span>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <ArrowUpRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            {billingHistory.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No billing history yet</p>
              </div>
            )}

            {isAuthenticated && (
              <div className="mt-4 pt-4 border-t border-border">
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-primary"
                  onClick={handleManageSubscription}
                  disabled={isManageLoading}
                >
                  View all invoices in billing portal
                  <ExternalLink className="h-3 w-3 ml-1" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default SubscriptionPage;
