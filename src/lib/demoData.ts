import { User, Development, Campaign, Lead, DailyMetrics, Settings } from "./types";

// Generate dates for the last 14 days
const generateDates = (days: number): string[] => {
  const dates: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString().split("T")[0]);
  }
  return dates;
};

// Demo Users
export const demoUsers: User[] = [
  {
    id: "user_dev_1",
    email: "developer@naybourhood.ai",
    name: "James Developer",
    role: "developer",
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "user_agent_1",
    email: "agent@naybourhood.ai",
    name: "Sarah Agent",
    role: "agent",
    createdAt: "2024-02-10T10:00:00Z",
  },
  {
    id: "user_broker_1",
    email: "broker@naybourhood.ai",
    name: "Mike Broker",
    role: "broker",
    createdAt: "2024-03-05T10:00:00Z",
  },
];

// Demo Developments
export const demoDevelopments: Development[] = [
  {
    id: "dev_1",
    name: "Marina Heights",
    location: "London, Canary Wharf",
    region: "London",
    priceRange: "£450,000 - £1,200,000",
    units: 120,
    unitsSold: 45,
    status: "live",
    image: "🏢",
  },
  {
    id: "dev_2",
    name: "Skyline Tower",
    location: "Manchester, City Centre",
    region: "Manchester",
    priceRange: "£280,000 - £650,000",
    units: 85,
    unitsSold: 12,
    status: "pre-launch",
    image: "🏗️",
  },
  {
    id: "dev_3",
    name: "Riverside Plaza",
    location: "Birmingham, Jewellery Quarter",
    region: "Birmingham",
    priceRange: "£220,000 - £480,000",
    units: 200,
    unitsSold: 200,
    status: "sold-out",
    image: "✅",
  },
  {
    id: "dev_4",
    name: "Garden Residences",
    location: "Leeds, Headingley",
    region: "Leeds",
    priceRange: "£180,000 - £350,000",
    units: 64,
    unitsSold: 28,
    status: "live",
    image: "🌳",
  },
];

// Demo Campaigns
export const demoCampaigns: Campaign[] = [
  {
    id: "camp_1",
    name: "Marina Heights - Lagos HNWI",
    developmentId: "dev_1",
    developmentName: "Marina Heights",
    objective: "leads",
    status: "live",
    budget: 2500,
    dailyCap: 100,
    startDate: "2024-10-01",
    isOngoing: true,
    roleType: "developer",
    channel: "meta",
    createdAt: "2024-09-28T10:00:00Z",
    creatives: {
      assets: [
        { id: "asset_1", type: "static", url: "https://picsum.photos/seed/marina1/400/300" },
        { id: "asset_2", type: "static", url: "https://picsum.photos/seed/marina2/400/300" },
      ],
      images: [],
      selectedHeadline: "Invest in London's Premier Waterfront Living",
      selectedPrimaryText: "Discover Marina Heights - Luxury apartments with guaranteed rental yields. Perfect for international investors seeking stable UK property returns.",
      selectedCta: "Learn More",
      generatedHeadlines: [
        "Invest in London's Premier Waterfront Living",
        "Secure Your Future with UK Property",
        "Luxury Living Meets Smart Investment",
      ],
      generatedPrimaryTexts: [
        "Discover Marina Heights - Luxury apartments with guaranteed rental yields.",
        "Premium Canary Wharf location with world-class amenities.",
        "Join savvy investors securing UK property portfolios.",
      ],
      generatedCtas: ["Learn More", "Get Details", "Book Consultation"],
    },
    metaCampaignId: "meta_camp_12345",
    metaAdsetId: "meta_adset_67890",
    metaFormId: "meta_form_11111",
    metaAdIds: ["meta_ad_001", "meta_ad_002"],
  },
  {
    id: "camp_2",
    name: "Skyline Tower - UK Investors",
    developmentId: "dev_2",
    developmentName: "Skyline Tower",
    objective: "leads",
    status: "draft",
    budget: 1800,
    startDate: "2024-11-15",
    endDate: "2025-02-15",
    isOngoing: false,
    roleType: "developer",
    channel: "meta",
    createdAt: "2024-11-01T10:00:00Z",
  },
  {
    id: "camp_3",
    name: "Garden Residences - First Time Buyers",
    developmentId: "dev_4",
    developmentName: "Garden Residences",
    objective: "leads",
    status: "draft",
    budget: 1200,
    startDate: "2024-11-20",
    isOngoing: true,
    roleType: "agent",
    channel: "meta",
    createdAt: "2024-11-05T10:00:00Z",
  },
];

// Demo Leads
export const demoLeads: Lead[] = [
  {
    id: "lead_1",
    name: "James Okonkwo",
    email: "james.o@example.com",
    phone: "+234 801 234 5678",
    countryCode: "NG",
    country: "Nigeria",
    budget: "£800,000 - £1,200,000",
    bedrooms: "3-4 bed",
    intentScore: 78,
    qualityScore: 85,
    status: "contacted",
    campaignId: "camp_1",
    campaignName: "Marina Heights - Lagos HNWI",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    notes: "Interested in waterfront properties. Looking to relocate from Lagos.",
  },
  {
    id: "lead_2",
    name: "Sarah Mitchell",
    email: "sarah.m@example.com",
    phone: "+44 7700 900123",
    countryCode: "GB",
    country: "United Kingdom",
    budget: "£500,000 - £750,000",
    bedrooms: "2 bed",
    intentScore: 91,
    qualityScore: 72,
    status: "booked_viewing",
    campaignId: "camp_1",
    campaignName: "Marina Heights - Lagos HNWI",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    notes: "First-time buyer, very engaged.",
  },
  {
    id: "lead_3",
    name: "Ahmed Al-Rashid",
    email: "ahmed.r@example.com",
    phone: "+971 50 123 4567",
    countryCode: "AE",
    country: "UAE",
    budget: "£1,500,000 - £2,000,000",
    bedrooms: "Penthouse",
    intentScore: 85,
    qualityScore: 90,
    status: "offer",
    campaignId: "camp_1",
    campaignName: "Marina Heights - Lagos HNWI",
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    notes: "Made offer on Skyline Tower penthouse. Awaiting developer response.",
  },
  {
    id: "lead_4",
    name: "Jennifer Wong",
    email: "jenny.w@example.com",
    phone: "+65 9123 4567",
    countryCode: "SG",
    country: "Singapore",
    budget: "£600,000 - £900,000",
    bedrooms: "2-3 bed",
    intentScore: 82,
    qualityScore: 68,
    status: "new",
    campaignId: "camp_1",
    campaignName: "Marina Heights - Lagos HNWI",
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    notes: "Exploring investment opportunities in UK property market.",
  },
  {
    id: "lead_5",
    name: "Marcus Thompson",
    email: "marcus.t@example.com",
    phone: "+1 555 0123",
    countryCode: "US",
    country: "USA",
    budget: "£700,000 - £1,000,000",
    bedrooms: "3 bed house",
    intentScore: 76,
    qualityScore: 79,
    status: "contacted",
    campaignId: "camp_1",
    campaignName: "Marina Heights - Lagos HNWI",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    notes: "Interested in areas with good schools. Family of 4.",
  },
  {
    id: "lead_6",
    name: "Emma Richardson",
    email: "emma.r@example.com",
    phone: "+44 7890 123456",
    countryCode: "GB",
    country: "United Kingdom",
    budget: "£350,000 - £450,000",
    bedrooms: "2 bed",
    intentScore: 65,
    qualityScore: 72,
    status: "new",
    campaignId: "camp_1",
    campaignName: "Marina Heights - Lagos HNWI",
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    notes: "Young professional looking for first property.",
  },
  {
    id: "lead_7",
    name: "David Chen",
    email: "david.c@example.com",
    phone: "+852 9876 5432",
    countryCode: "HK",
    country: "Hong Kong",
    budget: "£900,000 - £1,300,000",
    bedrooms: "3 bed",
    intentScore: 88,
    qualityScore: 84,
    status: "won",
    campaignId: "camp_1",
    campaignName: "Marina Heights - Lagos HNWI",
    createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    notes: "Completed purchase of Unit 405.",
  },
  {
    id: "lead_8",
    name: "Priya Sharma",
    email: "priya.s@example.com",
    phone: "+91 98765 43210",
    countryCode: "IN",
    country: "India",
    budget: "£400,000 - £600,000",
    bedrooms: "2 bed",
    intentScore: 58,
    qualityScore: 62,
    status: "lost",
    campaignId: "camp_1",
    campaignName: "Marina Heights - Lagos HNWI",
    createdAt: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString(),
    notes: "Budget constraints - decided to wait.",
  },
];

// Generate daily metrics for last 14 days
const dates = generateDates(14);
export const demoDailyMetrics: DailyMetrics[] = dates.flatMap((date, index) => [
  {
    date,
    campaignId: "camp_1",
    leads: Math.floor(Math.random() * 8) + 3,
    spend: Math.floor(Math.random() * 50) + 60,
    impressions: Math.floor(Math.random() * 5000) + 8000,
    clicks: Math.floor(Math.random() * 200) + 150,
  },
]);

// Default Settings
export const defaultSettings: Settings = {
  orgName: "Naybourhood Demo",
  contactEmail: "demo@naybourhood.ai",
  metaPixelId: "",
  metaBusinessId: "",
  metaAdAccountId: "",
  metaPageId: "",
  metaAppId: "",
  metaAppSecret: "",
  metaAccessToken: "",
  crmWebhookUrl: "",
  csvFallbackEmail: "",
};

// Local storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: "naybourhood_auth_token",
  USER: "naybourhood_user",
  CAMPAIGNS: "naybourhood_campaigns",
  LEADS: "naybourhood_leads",
  METRICS: "naybourhood_metrics",
  SETTINGS: "naybourhood_settings",
};

// Initialize demo data in localStorage if not present
export const initializeDemoData = () => {
  if (!localStorage.getItem(STORAGE_KEYS.CAMPAIGNS)) {
    localStorage.setItem(STORAGE_KEYS.CAMPAIGNS, JSON.stringify(demoCampaigns));
  }
  if (!localStorage.getItem(STORAGE_KEYS.LEADS)) {
    localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(demoLeads));
  }
  if (!localStorage.getItem(STORAGE_KEYS.METRICS)) {
    localStorage.setItem(STORAGE_KEYS.METRICS, JSON.stringify(demoDailyMetrics));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(defaultSettings));
  }
};
