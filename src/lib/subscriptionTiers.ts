// Subscription Tier Configuration
// Naybourhood.ai Pricing Structure

export type SubscriptionTier = 'access' | 'growth' | 'enterprise';

export interface TierPricing {
  tier: SubscriptionTier;
  name: string;
  price: number;
  priceDisplay: string;
  isPopular: boolean;
  description: string;
}

export interface TierFeatures {
  monthlyContacts: number | 'unlimited';
  monthlyContactsDisplay: string;
  buyerDatabaseAccess: string;
  buyerDatabaseDescription: string;
  aiInsightsLevel: 'basic' | 'enhanced' | 'full';
  aiInsightsCount: string;
  aiInsightsDescription: string;
  campaigns: 'locked' | 'done-for-you' | 'full-service';
  campaignsDescription: string;
  scoreBreakdown: 'basic' | 'full' | 'full-ai';
  scoreBreakdownDescription: string;
  support: 'email' | 'priority' | 'dedicated';
  supportDescription: string;
  firstRefusalBuyers: boolean;
  qualityIntentScoring: boolean;
  weeklyEmailDigest: boolean;
  predictiveAnalytics: boolean;
  automatedFollowUps: boolean;
  customInsightRequests: boolean;
  dailyInsightRefresh: boolean;
}

export interface SubscriptionTierConfig extends TierPricing, TierFeatures {}

export const SUBSCRIPTION_TIERS: Record<SubscriptionTier, SubscriptionTierConfig> = {
  access: {
    tier: 'access',
    name: 'Access',
    price: 999,
    priceDisplay: '£999',
    isPopular: false,
    description: 'Get started with essential buyer access and insights',
    monthlyContacts: 30,
    monthlyContactsDisplay: '30',
    buyerDatabaseAccess: 'Score 50-69',
    buyerDatabaseDescription: 'Access to qualified buyers with scores 50-69',
    aiInsightsLevel: 'basic',
    aiInsightsCount: '2-3 per week',
    aiInsightsDescription: 'Basic actionable insights delivered weekly',
    campaigns: 'locked',
    campaignsDescription: 'Campaign features not included',
    scoreBreakdown: 'basic',
    scoreBreakdownDescription: 'Basic lead score overview',
    support: 'email',
    supportDescription: 'Email support within 24 hours',
    firstRefusalBuyers: false,
    qualityIntentScoring: false,
    weeklyEmailDigest: false,
    predictiveAnalytics: false,
    automatedFollowUps: false,
    customInsightRequests: false,
    dailyInsightRefresh: false,
  },
  growth: {
    tier: 'growth',
    name: 'Growth',
    price: 2249,
    priceDisplay: '£2,249',
    isPopular: true,
    description: 'Scale your pipeline with enhanced AI and done-for-you campaigns',
    monthlyContacts: 100,
    monthlyContactsDisplay: '100',
    buyerDatabaseAccess: 'Score 50+',
    buyerDatabaseDescription: 'Access to all qualified buyers scoring 50+',
    aiInsightsLevel: 'enhanced',
    aiInsightsCount: '5-7 visible',
    aiInsightsDescription: 'Enhanced insights with campaign recommendations',
    campaigns: 'done-for-you',
    campaignsDescription: 'Done-for-you campaign management',
    scoreBreakdown: 'full',
    scoreBreakdownDescription: 'Full lead score breakdown',
    support: 'priority',
    supportDescription: 'Priority support with faster response times',
    firstRefusalBuyers: false,
    qualityIntentScoring: false,
    weeklyEmailDigest: true,
    predictiveAnalytics: false,
    automatedFollowUps: false,
    customInsightRequests: false,
    dailyInsightRefresh: false,
  },
  enterprise: {
    tier: 'enterprise',
    name: 'Enterprise',
    price: 3999,
    priceDisplay: '£3,999',
    isPopular: false,
    description: 'Full-service platform with predictive AI and exclusive buyer access',
    monthlyContacts: 'unlimited',
    monthlyContactsDisplay: 'Unlimited',
    buyerDatabaseAccess: 'All + First Refusal (80+)',
    buyerDatabaseDescription: 'Exclusive first refusal on high-intent buyers (80+)',
    aiInsightsLevel: 'full',
    aiInsightsCount: 'Unlimited, daily',
    aiInsightsDescription: 'Full predictive analytics with AI-drafted follow-ups',
    campaigns: 'full-service',
    campaignsDescription: 'Full-service campaign management',
    scoreBreakdown: 'full-ai',
    scoreBreakdownDescription: 'Full breakdown with AI explanations',
    support: 'dedicated',
    supportDescription: 'Dedicated Account Manager',
    firstRefusalBuyers: true,
    qualityIntentScoring: true,
    weeklyEmailDigest: true,
    predictiveAnalytics: true,
    automatedFollowUps: true,
    customInsightRequests: true,
    dailyInsightRefresh: true,
  },
};

export const getTierConfig = (tier: SubscriptionTier): SubscriptionTierConfig => {
  return SUBSCRIPTION_TIERS[tier];
};

export const canAccessFeature = (
  currentTier: SubscriptionTier,
  requiredTier: SubscriptionTier
): boolean => {
  const tierOrder: SubscriptionTier[] = ['access', 'growth', 'enterprise'];
  return tierOrder.indexOf(currentTier) >= tierOrder.indexOf(requiredTier);
};

export const getUpgradePath = (currentTier: SubscriptionTier): SubscriptionTier | null => {
  if (currentTier === 'access') return 'growth';
  if (currentTier === 'growth') return 'enterprise';
  return null;
};
