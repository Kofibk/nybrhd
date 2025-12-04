// Core types for the Naybourhood.ai platform

export type UserRole = "developer" | "agent" | "broker";

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

export interface Campaign {
  id: string;
  name: string;
  developmentId: string;
  developmentName: string;
  objective: "leads" | "viewings" | "awareness";
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
