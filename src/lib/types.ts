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
  metaCampaignId?: string;
  metaAdsetId?: string;
  metaFormId?: string;
  metaAdIds?: string[];
}

export interface CampaignCreative {
  images: string[];
  selectedHeadline: string;
  selectedPrimaryText: string;
  selectedCta: string;
  generatedHeadlines: string[];
  generatedPrimaryTexts: string[];
  generatedCtas: string[];
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  countryCode: string;
  country: string;
  budget: string;
  bedrooms: string;
  intentScore: number;
  qualityScore: number;
  status: "new" | "contacted" | "booked_viewing" | "offer" | "won" | "lost";
  campaignId: string;
  campaignName: string;
  createdAt: string;
  notes: string;
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
