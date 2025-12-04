// Comprehensive country and city data for Meta campaign targeting

export interface Country {
  code: string;
  name: string;
  region: string;
}

export interface City {
  name: string;
  countryCode: string;
  popular?: boolean;
}

export const REGIONS = [
  { id: "uk", name: "UK", countries: ["GB"] },
  { id: "middle_east", name: "Middle East", countries: ["JO", "SA", "KW", "QA", "BH", "AE", "OM", "TR"] },
  { id: "africa", name: "Africa", countries: ["GH", "NG", "KE", "ZA", "EG"] },
  { id: "europe", name: "Europe", countries: ["FR", "DE", "IT", "ES", "NL", "BE", "CH", "AT", "PT", "IE", "SE", "NO", "DK", "FI", "PL", "CZ", "GR"] },
  { id: "asia", name: "Asia", countries: ["CN", "JP", "KR", "SG", "HK", "MY", "TH", "ID", "PH", "VN", "IN", "PK", "BD"] },
  { id: "americas", name: "Americas", countries: ["US", "CA", "MX", "BR", "AR", "CL", "CO", "PE"] },
  { id: "oceania", name: "Oceania", countries: ["AU", "NZ"] },
];

export const COUNTRIES: Country[] = [
  // UK
  { code: "GB", name: "United Kingdom", region: "uk" },
  
  // Middle East
  { code: "JO", name: "Jordan", region: "middle_east" },
  { code: "SA", name: "Saudi Arabia", region: "middle_east" },
  { code: "KW", name: "Kuwait", region: "middle_east" },
  { code: "QA", name: "Qatar", region: "middle_east" },
  { code: "BH", name: "Bahrain", region: "middle_east" },
  { code: "AE", name: "United Arab Emirates", region: "middle_east" },
  { code: "OM", name: "Oman", region: "middle_east" },
  { code: "TR", name: "Turkey", region: "middle_east" },
  
  // Africa
  { code: "GH", name: "Ghana", region: "africa" },
  { code: "NG", name: "Nigeria", region: "africa" },
  { code: "KE", name: "Kenya", region: "africa" },
  { code: "ZA", name: "South Africa", region: "africa" },
  { code: "EG", name: "Egypt", region: "africa" },
  
  // Europe
  { code: "FR", name: "France", region: "europe" },
  { code: "DE", name: "Germany", region: "europe" },
  { code: "IT", name: "Italy", region: "europe" },
  { code: "ES", name: "Spain", region: "europe" },
  { code: "NL", name: "Netherlands", region: "europe" },
  { code: "BE", name: "Belgium", region: "europe" },
  { code: "CH", name: "Switzerland", region: "europe" },
  { code: "AT", name: "Austria", region: "europe" },
  { code: "PT", name: "Portugal", region: "europe" },
  { code: "IE", name: "Ireland", region: "europe" },
  { code: "SE", name: "Sweden", region: "europe" },
  { code: "NO", name: "Norway", region: "europe" },
  { code: "DK", name: "Denmark", region: "europe" },
  { code: "FI", name: "Finland", region: "europe" },
  { code: "PL", name: "Poland", region: "europe" },
  { code: "CZ", name: "Czech Republic", region: "europe" },
  { code: "GR", name: "Greece", region: "europe" },
  
  // Asia
  { code: "CN", name: "China", region: "asia" },
  { code: "JP", name: "Japan", region: "asia" },
  { code: "KR", name: "South Korea", region: "asia" },
  { code: "SG", name: "Singapore", region: "asia" },
  { code: "HK", name: "Hong Kong", region: "asia" },
  { code: "MY", name: "Malaysia", region: "asia" },
  { code: "TH", name: "Thailand", region: "asia" },
  { code: "ID", name: "Indonesia", region: "asia" },
  { code: "PH", name: "Philippines", region: "asia" },
  { code: "VN", name: "Vietnam", region: "asia" },
  { code: "IN", name: "India", region: "asia" },
  { code: "PK", name: "Pakistan", region: "asia" },
  { code: "BD", name: "Bangladesh", region: "asia" },
  
  // Americas
  { code: "US", name: "United States", region: "americas" },
  { code: "CA", name: "Canada", region: "americas" },
  { code: "MX", name: "Mexico", region: "americas" },
  { code: "BR", name: "Brazil", region: "americas" },
  { code: "AR", name: "Argentina", region: "americas" },
  { code: "CL", name: "Chile", region: "americas" },
  { code: "CO", name: "Colombia", region: "americas" },
  { code: "PE", name: "Peru", region: "americas" },
  
  // Oceania
  { code: "AU", name: "Australia", region: "oceania" },
  { code: "NZ", name: "New Zealand", region: "oceania" },
];

export const CITIES: City[] = [
  // UK
  { name: "London", countryCode: "GB", popular: true },
  { name: "Manchester", countryCode: "GB", popular: true },
  { name: "Birmingham", countryCode: "GB" },
  { name: "Leeds", countryCode: "GB" },
  { name: "Liverpool", countryCode: "GB" },
  { name: "Edinburgh", countryCode: "GB" },
  { name: "Glasgow", countryCode: "GB" },
  { name: "Bristol", countryCode: "GB" },
  { name: "Cardiff", countryCode: "GB" },
  { name: "Newcastle", countryCode: "GB" },
  
  // UAE
  { name: "Dubai", countryCode: "AE", popular: true },
  { name: "Abu Dhabi", countryCode: "AE", popular: true },
  { name: "Sharjah", countryCode: "AE" },
  { name: "Ajman", countryCode: "AE" },
  
  // Saudi Arabia
  { name: "Riyadh", countryCode: "SA", popular: true },
  { name: "Jeddah", countryCode: "SA", popular: true },
  { name: "Dammam", countryCode: "SA" },
  { name: "Mecca", countryCode: "SA" },
  
  // Qatar
  { name: "Doha", countryCode: "QA", popular: true },
  
  // Kuwait
  { name: "Kuwait City", countryCode: "KW", popular: true },
  
  // Bahrain
  { name: "Manama", countryCode: "BH", popular: true },
  
  // Oman
  { name: "Muscat", countryCode: "OM", popular: true },
  
  // Jordan
  { name: "Amman", countryCode: "JO", popular: true },
  
  // Turkey
  { name: "Istanbul", countryCode: "TR", popular: true },
  { name: "Ankara", countryCode: "TR" },
  { name: "Izmir", countryCode: "TR" },
  { name: "Antalya", countryCode: "TR" },
  
  // Nigeria
  { name: "Lagos", countryCode: "NG", popular: true },
  { name: "Abuja", countryCode: "NG" },
  { name: "Port Harcourt", countryCode: "NG" },
  
  // Ghana
  { name: "Accra", countryCode: "GH", popular: true },
  { name: "Kumasi", countryCode: "GH" },
  
  // Kenya
  { name: "Nairobi", countryCode: "KE", popular: true },
  { name: "Mombasa", countryCode: "KE" },
  
  // South Africa
  { name: "Johannesburg", countryCode: "ZA", popular: true },
  { name: "Cape Town", countryCode: "ZA", popular: true },
  { name: "Durban", countryCode: "ZA" },
  { name: "Pretoria", countryCode: "ZA" },
  
  // Egypt
  { name: "Cairo", countryCode: "EG", popular: true },
  { name: "Alexandria", countryCode: "EG" },
  
  // Europe
  { name: "Paris", countryCode: "FR", popular: true },
  { name: "Berlin", countryCode: "DE", popular: true },
  { name: "Munich", countryCode: "DE" },
  { name: "Frankfurt", countryCode: "DE" },
  { name: "Milan", countryCode: "IT", popular: true },
  { name: "Rome", countryCode: "IT" },
  { name: "Madrid", countryCode: "ES", popular: true },
  { name: "Barcelona", countryCode: "ES" },
  { name: "Amsterdam", countryCode: "NL", popular: true },
  { name: "Brussels", countryCode: "BE" },
  { name: "Zurich", countryCode: "CH", popular: true },
  { name: "Geneva", countryCode: "CH" },
  { name: "Vienna", countryCode: "AT" },
  { name: "Lisbon", countryCode: "PT" },
  { name: "Dublin", countryCode: "IE", popular: true },
  { name: "Stockholm", countryCode: "SE" },
  { name: "Oslo", countryCode: "NO" },
  { name: "Copenhagen", countryCode: "DK" },
  { name: "Helsinki", countryCode: "FI" },
  { name: "Warsaw", countryCode: "PL" },
  { name: "Prague", countryCode: "CZ" },
  { name: "Athens", countryCode: "GR" },
  
  // Asia
  { name: "Shanghai", countryCode: "CN", popular: true },
  { name: "Beijing", countryCode: "CN" },
  { name: "Hong Kong", countryCode: "HK", popular: true },
  { name: "Singapore", countryCode: "SG", popular: true },
  { name: "Tokyo", countryCode: "JP", popular: true },
  { name: "Osaka", countryCode: "JP" },
  { name: "Seoul", countryCode: "KR", popular: true },
  { name: "Kuala Lumpur", countryCode: "MY", popular: true },
  { name: "Bangkok", countryCode: "TH", popular: true },
  { name: "Jakarta", countryCode: "ID" },
  { name: "Manila", countryCode: "PH" },
  { name: "Ho Chi Minh City", countryCode: "VN" },
  { name: "Mumbai", countryCode: "IN", popular: true },
  { name: "Delhi", countryCode: "IN" },
  { name: "Bangalore", countryCode: "IN" },
  { name: "Karachi", countryCode: "PK" },
  { name: "Lahore", countryCode: "PK" },
  { name: "Dhaka", countryCode: "BD" },
  
  // Americas
  { name: "New York", countryCode: "US", popular: true },
  { name: "Los Angeles", countryCode: "US", popular: true },
  { name: "Miami", countryCode: "US", popular: true },
  { name: "San Francisco", countryCode: "US" },
  { name: "Chicago", countryCode: "US" },
  { name: "Houston", countryCode: "US" },
  { name: "Toronto", countryCode: "CA", popular: true },
  { name: "Vancouver", countryCode: "CA" },
  { name: "Montreal", countryCode: "CA" },
  { name: "Mexico City", countryCode: "MX" },
  { name: "São Paulo", countryCode: "BR", popular: true },
  { name: "Rio de Janeiro", countryCode: "BR" },
  { name: "Buenos Aires", countryCode: "AR" },
  { name: "Santiago", countryCode: "CL" },
  { name: "Bogotá", countryCode: "CO" },
  { name: "Lima", countryCode: "PE" },
  
  // Oceania
  { name: "Sydney", countryCode: "AU", popular: true },
  { name: "Melbourne", countryCode: "AU", popular: true },
  { name: "Brisbane", countryCode: "AU" },
  { name: "Perth", countryCode: "AU" },
  { name: "Auckland", countryCode: "NZ", popular: true },
  { name: "Wellington", countryCode: "NZ" },
];

// Campaign configuration constants from SOP
export const CAMPAIGN_OBJECTIVES = [
  { id: "leads", name: "Lead Generation", description: "Generate high-intent leads" },
  { id: "engagement", name: "Engagement", description: "Increase engagement and reach" },
];

export const CAMPAIGN_PHASES = [
  { id: "testing", name: "Testing", description: "10-day evaluation window" },
  { id: "scaling", name: "Scaling", description: "Scale winning campaigns" },
];

export const CORE_INTEREST_CATEGORIES = [
  { id: "finance", name: "Finance", description: "Business and finance interest" },
  { id: "luxury_travel", name: "Luxury Travel", description: "Travel and tourism interest" },
  { id: "property_investing", name: "Property Investing", description: "Investing interest" },
  { id: "home", name: "Home", description: "Home and garden interest" },
  { id: "advantage_plus", name: "Advantage+ Audience", description: "Meta's broad targeting (not for Africa)" },
  { id: "lookalike", name: "Lookalikes & Retargeting", description: "Warm audiences" },
];

export const CONTENT_TYPES = [
  { id: "static", name: "Static Image", required: true },
  { id: "carousel", name: "Carousel", required: true },
  { id: "ugc_video", name: "UGC Video", description: "Authentic, testimonial-style" },
  { id: "polished_video", name: "Polished Video", description: "Cinematic, high-end edit" },
];

export const MESSAGING_ANGLES = [
  { 
    id: "investment", 
    group: "Investment Focus",
    themes: ["ROI", "Rental Yields", "Capital Appreciation", "Occupancy Rates", "Discount Opportunities", "Payment Plans"]
  },
  { 
    id: "family", 
    group: "Downsizers & Family",
    themes: ["Security & Gated Community", "Exclusivity", "Location Benefits", "Greenery & Landscaping", "Lifestyle Amenities"]
  },
  { 
    id: "holiday", 
    group: "Holiday Home & Parents",
    themes: ["Investment + Convenience", "Transport Links", "Proximity to Shops/Schools", "Flexible Living", "Comfort + ROI"]
  },
];

export const EVALUATION_METRICS = {
  cpc: { threshold: 1.5, unit: "£", comparison: "less_than", label: "CPC" },
  ctr: { threshold: 2, unit: "%", comparison: "greater_than", label: "CTR" },
  cpm: { threshold: 10, unit: "£", comparison: "less_than", label: "CPM" },
  landingPageViewRatio: { threshold: 75, unit: "%", comparison: "greater_than", label: "Click → LP View" },
  highIntentLeadRatio: { threshold: 60, unit: "%", comparison: "greater_than", label: "High-Intent Leads" },
};

export const AFRICA_RULES = {
  platforms: ["instagram"],
  devices: ["ios"],
  disableAdvantagePlus: true,
};

// Mock campaign data
export interface MetaCampaign {
  id: string;
  developmentName: string;
  region: string;
  objective: "leads" | "engagement";
  phase: "testing" | "scaling";
  status: "active" | "paused" | "completed" | "draft";
  budget: number;
  budgetType: "lifetime";
  startDate: string;
  endDate?: string;
  createdAt: string;
  metrics: {
    spend: number;
    leads: number;
    cpl: number;
    cpc: number;
    ctr: number;
    cpm: number;
    impressions: number;
    clicks: number;
    landingPageViews: number;
    highIntentLeads: number;
  };
  adsets: MetaAdset[];
  targetCountries: string[];
  targetCities: string[];
  whatsappEnabled: boolean;
}

export interface MetaAdset {
  id: string;
  name: string;
  interest: string;
  status: "active" | "paused";
  metrics: {
    spend: number;
    leads: number;
    cpl: number;
    cpc: number;
    ctr: number;
  };
}

export const generateCampaignName = (
  development: string,
  region: string,
  objective: string,
  phase: string,
  date: Date = new Date()
): string => {
  const monthYear = date.toLocaleDateString("en-GB", { month: "short", year: "2-digit" }).replace(" ", "");
  return `${development} – ${region} – ${objective === "leads" ? "Leads" : "Engagement"} – ${phase === "testing" ? "Testing" : "Scaling"} – ${monthYear}`;
};

export const generateAdsetName = (
  region: string,
  interest: string,
  placementRule?: string
): string => {
  const parts = [region, interest];
  if (placementRule) parts.push(placementRule);
  return parts.join(" – ");
};

export const generateAdName = (
  creativeType: string,
  hook: string,
  version: number
): string => {
  return `${creativeType} – ${hook} – V${version}`;
};

export const generateUTMs = (campaignName: string, adsetName: string, adName: string) => ({
  utm_campaign: campaignName,
  utm_adset: adsetName,
  utm_content: adName,
  utm_source: "facebook",
  utm_medium: "paid_social",
});

// Mock campaigns for demo
export const MOCK_META_CAMPAIGNS: MetaCampaign[] = [
  {
    id: "mc-1",
    developmentName: "Riverside Towers",
    region: "UK",
    objective: "leads",
    phase: "testing",
    status: "active",
    budget: 5000,
    budgetType: "lifetime",
    startDate: "2025-11-25",
    createdAt: "2025-11-24",
    targetCountries: ["GB"],
    targetCities: ["London", "Manchester"],
    whatsappEnabled: true,
    metrics: {
      spend: 1250,
      leads: 42,
      cpl: 29.76,
      cpc: 1.12,
      ctr: 2.8,
      cpm: 8.50,
      impressions: 147000,
      clicks: 4116,
      landingPageViews: 3292,
      highIntentLeads: 28,
    },
    adsets: [
      { id: "as-1", name: "UK – Finance Interests – Advantage+", interest: "finance", status: "active", metrics: { spend: 350, leads: 12, cpl: 29.17, cpc: 1.05, ctr: 3.1 } },
      { id: "as-2", name: "UK – Luxury Travel – Advantage+", interest: "luxury_travel", status: "active", metrics: { spend: 300, leads: 11, cpl: 27.27, cpc: 1.15, ctr: 2.9 } },
      { id: "as-3", name: "UK – Property Investing – Advantage+", interest: "property_investing", status: "active", metrics: { spend: 320, leads: 10, cpl: 32.00, cpc: 1.20, ctr: 2.5 } },
      { id: "as-4", name: "UK – Home Interest – Advantage+", interest: "home", status: "paused", metrics: { spend: 280, leads: 9, cpl: 31.11, cpc: 1.45, ctr: 1.8 } },
    ],
  },
  {
    id: "mc-2",
    developmentName: "Riverside Towers",
    region: "Middle East",
    objective: "leads",
    phase: "testing",
    status: "active",
    budget: 8000,
    budgetType: "lifetime",
    startDate: "2025-11-25",
    createdAt: "2025-11-24",
    targetCountries: ["AE", "SA", "QA", "KW"],
    targetCities: ["Dubai", "Riyadh", "Doha", "Kuwait City"],
    whatsappEnabled: true,
    metrics: {
      spend: 2100,
      leads: 58,
      cpl: 36.21,
      cpc: 0.95,
      ctr: 3.2,
      cpm: 7.80,
      impressions: 269230,
      clicks: 8615,
      landingPageViews: 6892,
      highIntentLeads: 38,
    },
    adsets: [
      { id: "as-5", name: "Middle East – Property Investors – Manual", interest: "property_investing", status: "active", metrics: { spend: 600, leads: 18, cpl: 33.33, cpc: 0.88, ctr: 3.5 } },
      { id: "as-6", name: "Middle East – HNWIs – Advantage+", interest: "finance", status: "active", metrics: { spend: 550, leads: 15, cpl: 36.67, cpc: 0.92, ctr: 3.2 } },
      { id: "as-7", name: "Middle East – Luxury Travel – Manual", interest: "luxury_travel", status: "active", metrics: { spend: 500, leads: 14, cpl: 35.71, cpc: 1.02, ctr: 3.0 } },
      { id: "as-8", name: "Middle East – Lookalikes", interest: "lookalike", status: "active", metrics: { spend: 450, leads: 11, cpl: 40.91, cpc: 1.05, ctr: 2.8 } },
    ],
  },
  {
    id: "mc-3",
    developmentName: "Riverside Towers",
    region: "Africa",
    objective: "engagement",
    phase: "testing",
    status: "active",
    budget: 3000,
    budgetType: "lifetime",
    startDate: "2025-11-25",
    createdAt: "2025-11-24",
    targetCountries: ["NG", "GH", "KE", "ZA"],
    targetCities: ["Lagos", "Accra", "Nairobi", "Johannesburg"],
    whatsappEnabled: true,
    metrics: {
      spend: 850,
      leads: 31,
      cpl: 27.42,
      cpc: 0.65,
      ctr: 4.1,
      cpm: 5.20,
      impressions: 163461,
      clicks: 6702,
      landingPageViews: 5362,
      highIntentLeads: 19,
    },
    adsets: [
      { id: "as-9", name: "Africa – HNWIs – IG/iOS", interest: "finance", status: "active", metrics: { spend: 250, leads: 10, cpl: 25.00, cpc: 0.60, ctr: 4.5 } },
      { id: "as-10", name: "Africa – GCC Expats – IG/iOS", interest: "property_investing", status: "active", metrics: { spend: 220, leads: 8, cpl: 27.50, cpc: 0.68, ctr: 4.0 } },
      { id: "as-11", name: "Africa – Luxury Travel – IG/iOS", interest: "luxury_travel", status: "active", metrics: { spend: 200, leads: 7, cpl: 28.57, cpc: 0.70, ctr: 3.8 } },
      { id: "as-12", name: "Africa – Retargeting – IG/iOS", interest: "lookalike", status: "active", metrics: { spend: 180, leads: 6, cpl: 30.00, cpc: 0.62, ctr: 4.2 } },
    ],
  },
  {
    id: "mc-4",
    developmentName: "Marina Bay",
    region: "UK",
    objective: "leads",
    phase: "scaling",
    status: "active",
    budget: 15000,
    budgetType: "lifetime",
    startDate: "2025-11-01",
    createdAt: "2025-10-25",
    targetCountries: ["GB"],
    targetCities: ["London", "Manchester", "Birmingham"],
    whatsappEnabled: true,
    metrics: {
      spend: 8500,
      leads: 285,
      cpl: 29.82,
      cpc: 1.08,
      ctr: 2.9,
      cpm: 8.20,
      impressions: 1036585,
      clicks: 30061,
      landingPageViews: 24048,
      highIntentLeads: 185,
    },
    adsets: [
      { id: "as-13", name: "UK – Winning Interests Pool", interest: "finance", status: "active", metrics: { spend: 4500, leads: 155, cpl: 29.03, cpc: 1.05, ctr: 3.0 } },
      { id: "as-14", name: "UK – Lookalikes & Retargeting", interest: "lookalike", status: "active", metrics: { spend: 4000, leads: 130, cpl: 30.77, cpc: 1.12, ctr: 2.8 } },
    ],
  },
];
