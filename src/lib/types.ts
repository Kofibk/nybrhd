// Core types for the Naybourhood.ai platform

export type UserRole = "developer" | "agent" | "broker" | "admin";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
}

export interface Development {
  id: string;
  name: string;
  location: string;
  region: string;
  priceRange: string;
  units: number;
  unitsSold: number;
  status: "pre-launch" | "live" | "sold-out";
  image: string;
}

export type CreativeType = "static" | "carousel" | "video";

export interface CreativeAsset {
  id: string;
  type: CreativeType;
  url: string;
  thumbnail?: string;
}

export interface AudienceTargeting {
  countries: string[];
  cities?: string[];
}

export interface LeadFormFields {
  fullName: boolean;
  email: boolean;
  phone: boolean;
  budgetRange: boolean;
  paymentMethod: boolean; // cash or mortgage
  buyerStatus: boolean; // browsing vs actively looking
  purchaseTimeline: boolean;
}

// User-specific campaign types - simplified to Leads or Awareness
export type CampaignObjective = "leads" | "awareness";

export type AgentFocusSegment = "lettings" | "new_builds" | "resales";
export type BrokerProduct = "residential" | "buy_to_let" | "bridging" | "life_insurance" | "home_insurance";

export interface Campaign {
  id: string;
  name: string;
  developmentId: string;
  developmentName: string;
  objective: CampaignObjective;
  status: "draft" | "live" | "paused" | "completed";
  budget: number;
  dailyCap?: number;
  startDate: string;
  endDate?: string;
  isOngoing: boolean;
  roleType: UserRole;
  channel: "meta";
  createdAt: string;
  creatives?: CampaignCreative;
  targeting?: AudienceTargeting;
  formFields?: LeadFormFields;
  metaCampaignId?: string;
  metaAdsetId?: string;
  metaFormId?: string;
  metaAdIds?: string[];
  aiRecommendations?: AIRecommendation[];
  // Agent-specific
  focusSegment?: AgentFocusSegment;
  propertyDetails?: string;
  // Broker-specific
  product?: BrokerProduct;
}

export interface CampaignCreative {
  assets: CreativeAsset[];
  selectedHeadline: string;
  selectedPrimaryText: string;
  selectedCta: string;
  generatedHeadlines: string[];
  generatedPrimaryTexts: string[];
  generatedCtas: string[];
  // Legacy support
  images?: string[];
}

export type PaymentMethod = "cash" | "mortgage" | "undecided";
export type BuyerStatus = "browsing" | "actively_looking";
export type PurchaseTimeline = "within_28_days" | "0_3_months" | "3_6_months" | "6_9_months" | "9_12_months" | "12_months_plus";

// Lead sources
export type LeadSource = 
  | "meta_campaign" 
  | "google_ads"
  | "rightmove"
  | "zoopla"
  | "onthemarket"
  | "agent_referral"
  | "direct_web" 
  | "other";

// Lead classification based on dual scoring
export type LeadClassification = 
  | "hot"           // 🔥 High intent + High quality
  | "star"          // ⭐ High quality, moderate intent
  | "lightning"     // ⚡ High intent, moderate quality
  | "verified"      // ✓ Moderate both scores
  | "dormant"       // 💤 Low engagement
  | "warning"       // ⚠️ Potential issues
  | "cold";         // ❌ Low scores

export const LEAD_SOURCES = [
  { value: "meta_campaign", label: "Meta Campaign", icon: "📱" },
  { value: "google_ads", label: "Google Ads", icon: "🔍" },
  { value: "rightmove", label: "Rightmove", icon: "🏠" },
  { value: "zoopla", label: "Zoopla", icon: "🏠" },
  { value: "onthemarket", label: "OnTheMarket", icon: "🏠" },
  { value: "agent_referral", label: "Agent Referral", icon: "🏷" },
  { value: "direct_web", label: "Direct/Web", icon: "🌐" },
  { value: "other", label: "Other", icon: "➕" },
] as const;

export const LEAD_CLASSIFICATIONS = [
  { value: "hot", label: "Hot Lead", icon: "🔥", color: "text-red-500", bgColor: "bg-red-500/10", sla: "1 hour" },
  { value: "star", label: "Star Quality", icon: "⭐", color: "text-yellow-500", bgColor: "bg-yellow-500/10", sla: "4 hours" },
  { value: "lightning", label: "High Intent", icon: "⚡", color: "text-blue-500", bgColor: "bg-blue-500/10", sla: "2 hours" },
  { value: "verified", label: "Verified", icon: "✓", color: "text-green-500", bgColor: "bg-green-500/10", sla: "24 hours" },
  { value: "dormant", label: "Dormant", icon: "💤", color: "text-gray-500", bgColor: "bg-gray-500/10", sla: "1 week" },
  { value: "warning", label: "Warning", icon: "⚠️", color: "text-orange-500", bgColor: "bg-orange-500/10", sla: "24 hours" },
  { value: "cold", label: "Cold", icon: "❌", color: "text-slate-400", bgColor: "bg-slate-500/10", sla: "Auto" },
] as const;

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  countryCode: string;
  country: string;
  budget: string;
  bedrooms: string;
  paymentMethod?: PaymentMethod;
  buyerStatus?: BuyerStatus;
  purchaseTimeline?: PurchaseTimeline;
  intentScore: number;
  qualityScore: number;
  status: "new" | "contacted" | "booked_viewing" | "offer" | "won" | "lost";
  campaignId: string;
  campaignName: string;
  createdAt: string;
  notes: string;
  aiRecommendations?: AIRecommendation[];
  // New lead flow fields
  source: LeadSource;
  sourceDetail?: string; // e.g., portal name, introducer name
  classification?: LeadClassification;
  viewingScheduled?: string;
  purpose?: "investment" | "primary_residence" | "holiday_home";
}

export interface AIRecommendation {
  id: string;
  type: "targeting" | "budget" | "creative" | "timing" | "follow_up" | "next_action";
  title: string;
  description: string;
  confidence: number;
  priority: "high" | "medium" | "low";
}

export interface DailyMetrics {
  date: string;
  campaignId: string;
  leads: number;
  spend: number;
  impressions: number;
  clicks: number;
}

export interface Settings {
  orgName: string;
  contactEmail: string;
  metaBusinessId?: string;
  metaAdAccountId?: string;
  metaPageId?: string;
  metaPixelId?: string;
  metaAppId?: string;
  metaAppSecret?: string;
  metaAccessToken?: string;
  crmWebhookUrl?: string;
  csvFallbackEmail?: string;
}

export interface AuthSession {
  token: string;
  userId: string;
  user: User;
}

// Available countries for targeting
export const TARGET_COUNTRIES = [
  { code: "GB", name: "United Kingdom" },
  { code: "NG", name: "Nigeria" },
  { code: "AE", name: "UAE" },
  { code: "SG", name: "Singapore" },
  { code: "HK", name: "Hong Kong" },
  { code: "US", name: "United States" },
  { code: "IN", name: "India" },
  { code: "KE", name: "Kenya" },
  { code: "GH", name: "Ghana" },
  { code: "ZA", name: "South Africa" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "QA", name: "Qatar" },
  { code: "KW", name: "Kuwait" },
  { code: "MY", name: "Malaysia" },
  { code: "AU", name: "Australia" },
  { code: "CA", name: "Canada" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "CH", name: "Switzerland" },
  { code: "NL", name: "Netherlands" },
];

// Popular cities for targeting
export const TARGET_CITIES = [
  // UK
  { code: "london", name: "London", country: "GB" },
  { code: "manchester", name: "Manchester", country: "GB" },
  { code: "birmingham", name: "Birmingham", country: "GB" },
  { code: "leeds", name: "Leeds", country: "GB" },
  { code: "liverpool", name: "Liverpool", country: "GB" },
  { code: "edinburgh", name: "Edinburgh", country: "GB" },
  { code: "bristol", name: "Bristol", country: "GB" },
  // Nigeria
  { code: "lagos", name: "Lagos", country: "NG" },
  { code: "abuja", name: "Abuja", country: "NG" },
  { code: "port_harcourt", name: "Port Harcourt", country: "NG" },
  // UAE
  { code: "dubai", name: "Dubai", country: "AE" },
  { code: "abu_dhabi", name: "Abu Dhabi", country: "AE" },
  // US
  { code: "new_york", name: "New York", country: "US" },
  { code: "los_angeles", name: "Los Angeles", country: "US" },
  { code: "miami", name: "Miami", country: "US" },
  { code: "houston", name: "Houston", country: "US" },
  // Other
  { code: "singapore_city", name: "Singapore", country: "SG" },
  { code: "hong_kong_city", name: "Hong Kong", country: "HK" },
  { code: "johannesburg", name: "Johannesburg", country: "ZA" },
  { code: "nairobi", name: "Nairobi", country: "KE" },
  { code: "accra", name: "Accra", country: "GH" },
  { code: "sydney", name: "Sydney", country: "AU" },
  { code: "toronto", name: "Toronto", country: "CA" },
];

// Broker products
export const BROKER_PRODUCTS = [
  { value: "residential", label: "Residential Mortgage" },
  { value: "buy_to_let", label: "Buy To Let" },
  { value: "bridging", label: "Bridging Loan" },
  { value: "life_insurance", label: "Life Insurance" },
  { value: "home_insurance", label: "Home Insurance" },
];

// Agent focus segments
export const AGENT_FOCUS_SEGMENTS = [
  { value: "lettings", label: "Lettings" },
  { value: "new_builds", label: "New Builds" },
  { value: "resales", label: "Resales" },
];
