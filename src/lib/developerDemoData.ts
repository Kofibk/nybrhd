import { Campaign, Lead } from './types';

// ============================================
// MASTER STATS - These drive all data generation
// ============================================
const TOTAL_LEADS = 15658;
const HOT_LEADS = 457;
const AVG_SCORE = 67;
const TOTAL_SPEND = 86678;
// CPL = 86,678 / 15,658 = ~5.53

// Developer company info
export const developerCompany = {
  id: 'dev-001',
  name: 'Horizon Homes',
  logo: '/placeholder.svg',
  industry: 'Property Development',
  totalDevelopments: 12,
  totalUnits: 2847,
  activeCampaigns: 8,
};

// Developments for the developer
export const developerDevelopments = [
  {
    id: "dev_1",
    name: "Thames Gateway Village",
    location: "Woolwich, South East London",
    region: "London",
    priceRange: "£385,000 - £1,200,000",
    units: 680,
    unitsSold: 423,
    status: "live",
    image: "🏙️",
    launchDate: "2024-03-15",
  },
  {
    id: "dev_2",
    name: "Meridian Heights",
    location: "Stratford, East London",
    region: "London",
    priceRange: "£365,000 - £850,000",
    units: 420,
    unitsSold: 312,
    status: "live",
    image: "🌆",
    launchDate: "2024-06-01",
  },
  {
    id: "dev_3",
    name: "Parkside Quarter",
    location: "Croydon, South London",
    region: "London",
    priceRange: "£295,000 - £620,000",
    units: 280,
    unitsSold: 178,
    status: "live",
    image: "🏡",
    launchDate: "2024-04-20",
  },
  {
    id: "dev_4",
    name: "Victoria Gardens",
    location: "Manchester City Centre",
    region: "North West",
    priceRange: "£220,000 - £485,000",
    units: 520,
    unitsSold: 398,
    status: "live",
    image: "🌺",
    launchDate: "2024-01-10",
  },
  {
    id: "dev_5",
    name: "Waterside Crescent",
    location: "Birmingham, Jewellery Quarter",
    region: "Midlands",
    priceRange: "£195,000 - £420,000",
    units: 350,
    unitsSold: 287,
    status: "live",
    image: "💧",
    launchDate: "2023-06-15",
  },
  {
    id: "dev_6",
    name: "Kensington Place",
    location: "Kensington, London",
    region: "London",
    priceRange: "£1,500,000 - £4,500,000",
    units: 45,
    unitsSold: 12,
    status: "pre-launch",
    image: "💎",
    launchDate: "2025-03-01",
  },
  {
    id: "dev_7",
    name: "Northern Quarter Lofts",
    location: "Manchester, Northern Quarter",
    region: "North West",
    priceRange: "£185,000 - £395,000",
    units: 180,
    unitsSold: 156,
    status: "live",
    image: "🏢",
    launchDate: "2023-11-01",
  },
  {
    id: "dev_8",
    name: "Bristol Harbourside",
    location: "Bristol, Harbourside",
    region: "South West",
    priceRange: "£275,000 - £650,000",
    units: 240,
    unitsSold: 189,
    status: "live",
    image: "⚓",
    launchDate: "2024-02-15",
  },
];

// Demo campaigns - spend totals to £86,678
export const developerCampaigns = [
  // Thames Gateway Village campaigns
  {
    "Campaign Name": "Thames Gateway - Nigeria HNWI Q4",
    "Campaign name": "Thames Gateway - Nigeria HNWI Q4",
    "Amount spent (GBP)": 12500,
    Spend: 12500,
    Results: 2180,
    Impressions: 2850000,
    Reach: 1800000,
    Clicks: 48000,
    CTR: 1.68,
    CPC: 0.26,
    Platform: "Facebook",
    Status: "Active",
    "Reporting starts": "2024-10-01",
  },
  {
    "Campaign Name": "Thames Gateway - UAE Investors",
    "Campaign name": "Thames Gateway - UAE Investors",
    "Amount spent (GBP)": 9800,
    Spend: 9800,
    Results: 1650,
    Impressions: 1950000,
    Reach: 1250000,
    Clicks: 32000,
    CTR: 1.64,
    CPC: 0.31,
    Platform: "Instagram",
    Status: "Active",
    "Reporting starts": "2024-10-15",
  },
  {
    "Campaign Name": "Thames Gateway - UK First Time Buyers",
    "Campaign name": "Thames Gateway - UK First Time Buyers",
    "Amount spent (GBP)": 7200,
    Spend: 7200,
    Results: 1420,
    Impressions: 4200000,
    Reach: 2800000,
    Clicks: 68000,
    CTR: 1.62,
    CPC: 0.11,
    Platform: "Facebook",
    Status: "Active",
    "Reporting starts": "2024-09-01",
  },
  // Meridian Heights campaigns
  {
    "Campaign Name": "Meridian Heights - Hong Kong Investors",
    "Campaign name": "Meridian Heights - Hong Kong Investors",
    "Amount spent (GBP)": 11200,
    Spend: 11200,
    Results: 1890,
    Impressions: 3400000,
    Reach: 2200000,
    Clicks: 56000,
    CTR: 1.65,
    CPC: 0.20,
    Platform: "Facebook",
    Status: "Active",
    "Reporting starts": "2024-09-15",
  },
  {
    "Campaign Name": "Meridian Heights - Singapore BTL",
    "Campaign name": "Meridian Heights - Singapore BTL",
    "Amount spent (GBP)": 8500,
    Spend: 8500,
    Results: 1480,
    Impressions: 1450000,
    Reach: 950000,
    Clicks: 24000,
    CTR: 1.66,
    CPC: 0.35,
    Platform: "Instagram",
    Status: "Active",
    "Reporting starts": "2024-10-01",
  },
  // Parkside Quarter campaigns
  {
    "Campaign Name": "Parkside Quarter - Local Families",
    "Campaign name": "Parkside Quarter - Local Families",
    "Amount spent (GBP)": 5800,
    Spend: 5800,
    Results: 1120,
    Impressions: 2800000,
    Reach: 1850000,
    Clicks: 42000,
    CTR: 1.50,
    CPC: 0.14,
    Platform: "Facebook",
    Status: "Active",
    "Reporting starts": "2024-10-10",
  },
  {
    "Campaign Name": "Parkside Quarter - London Commuters",
    "Campaign name": "Parkside Quarter - London Commuters",
    "Amount spent (GBP)": 4500,
    Spend: 4500,
    Results: 890,
    Impressions: 1950000,
    Reach: 1300000,
    Clicks: 31000,
    CTR: 1.59,
    CPC: 0.15,
    Platform: "Facebook",
    Status: "Active",
    "Reporting starts": "2024-10-20",
  },
  // Victoria Gardens campaigns
  {
    "Campaign Name": "Victoria Gardens - Manchester Professionals",
    "Campaign name": "Victoria Gardens - Manchester Professionals",
    "Amount spent (GBP)": 6200,
    Spend: 6200,
    Results: 1280,
    Impressions: 3800000,
    Reach: 2500000,
    Clicks: 58000,
    CTR: 1.53,
    CPC: 0.11,
    Platform: "Facebook",
    Status: "Active",
    "Reporting starts": "2024-09-01",
  },
  {
    "Campaign Name": "Victoria Gardens - BTL Investors UK",
    "Campaign name": "Victoria Gardens - BTL Investors UK",
    "Amount spent (GBP)": 5200,
    Spend: 5200,
    Results: 980,
    Impressions: 1650000,
    Reach: 1100000,
    Clicks: 28000,
    CTR: 1.70,
    CPC: 0.19,
    Platform: "Instagram",
    Status: "Active",
    "Reporting starts": "2024-10-05",
  },
  // Kensington Place campaigns (luxury = fewer leads, higher CPL)
  {
    "Campaign Name": "Kensington Place - UHNWI Global",
    "Campaign name": "Kensington Place - UHNWI Global",
    "Amount spent (GBP)": 8500,
    Spend: 8500,
    Results: 1450,
    Impressions: 850000,
    Reach: 550000,
    Clicks: 12000,
    CTR: 1.41,
    CPC: 0.71,
    Platform: "Facebook",
    Status: "Active",
    "Reporting starts": "2024-11-01",
  },
  {
    "Campaign Name": "Kensington Place - Middle East VIP",
    "Campaign name": "Kensington Place - Middle East VIP",
    "Amount spent (GBP)": 7278,
    Spend: 7278,
    Results: 1318,
    Impressions: 620000,
    Reach: 400000,
    Clicks: 8900,
    CTR: 1.44,
    CPC: 0.82,
    Platform: "Instagram",
    Status: "Active",
    "Reporting starts": "2024-11-10",
  },
];

// Development to lead distribution
const developmentDistribution = {
  "Thames Gateway Village": 5250,
  "Meridian Heights": 3370,
  "Parkside Quarter": 2010,
  "Victoria Gardens": 2260,
  "Kensington Place": 2768,
};

// Helper to generate realistic leads
const generateLeads = () => {
  const leads: any[] = [];
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  
  const developments = [
    { name: "Thames Gateway Village", campaigns: ["Thames Gateway - Nigeria HNWI Q4", "Thames Gateway - UAE Investors", "Thames Gateway - UK First Time Buyers"], count: 5250 },
    { name: "Meridian Heights", campaigns: ["Meridian Heights - Hong Kong Investors", "Meridian Heights - Singapore BTL"], count: 3370 },
    { name: "Parkside Quarter", campaigns: ["Parkside Quarter - Local Families", "Parkside Quarter - London Commuters"], count: 2010 },
    { name: "Victoria Gardens", campaigns: ["Victoria Gardens - Manchester Professionals", "Victoria Gardens - BTL Investors UK"], count: 2260 },
    { name: "Kensington Place", campaigns: ["Kensington Place - UHNWI Global", "Kensington Place - Middle East VIP"], count: 2768 },
  ];

  // Status distribution to get exactly 457 hot leads (Viewing Booked + Offer Made)
  // Hot = ~3% of total (457/15658)
  const statuses = ["New", "Contacted", "Engaged", "Viewing Booked", "Offer Made"];
  const statusWeights = [40, 30, 27, 2.2, 0.7]; // ~3% hot leads
  
  const countries = ["United Kingdom", "Nigeria", "UAE", "Hong Kong", "Singapore", "India", "Switzerland", "Ireland", "China", "USA", "Germany", "France", "Saudi Arabia", "Qatar", "Malaysia"];
  const platforms = ["Facebook", "Instagram"];
  const timelines = ["Within 28 days", "0-3 months", "3-6 months", "6-9 months", "9-12 months"];
  const timelineWeights = [10, 25, 35, 20, 10];
  
  const firstNames = ["James", "Emma", "Oliver", "Sophia", "William", "Ava", "Benjamin", "Isabella", "Lucas", "Mia", "Henry", "Charlotte", "Alexander", "Amelia", "Daniel", "Harper", "Matthew", "Evelyn", "Joseph", "Abigail", "David", "Emily", "Andrew", "Elizabeth", "Michael", "Sofia", "Christopher", "Victoria", "John", "Grace", "Ryan", "Chloe", "Nathan", "Ella", "Samuel", "Scarlett", "Tyler", "Madison", "Brandon", "Luna", "Chukwuemeka", "Adaeze", "Mohammed", "Fatima", "Wei", "Mei", "Raj", "Priya", "Abdullah", "Aisha", "Chen", "Li", "Zhang", "Wang", "Hassan", "Ali", "Omar", "Yusuf", "Sarah", "Jessica", "Jennifer", "Amanda", "Ashley", "Nicole", "Stephanie", "Michelle", "Laura", "Rebecca", "Rachel", "Katherine", "Patrick", "Brian", "Kevin", "Eric", "Stephen", "George", "Edward", "Thomas", "Charles", "Robert"];
  const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Wilson", "Anderson", "Taylor", "Thomas", "Moore", "Jackson", "Martin", "Lee", "Thompson", "White", "Harris", "Clark", "Lewis", "Robinson", "Walker", "Hall", "Young", "King", "Wright", "Hill", "Chen", "Wang", "Liu", "Zhang", "Obi", "Okonkwo", "Adeyemi", "Al-Rashid", "Khan", "Patel", "Sharma", "Singh", "Rothschild", "Cohen", "O'Connor", "Murphy", "Kelly", "Sullivan", "McCarthy", "Ahmed", "Hussein", "Ibrahim", "Yamamoto", "Tanaka", "Nguyen", "Kim", "Park", "Choi"];
  
  const budgetRanges = {
    "Thames Gateway Village": ["£400,000 - £600,000", "£600,000 - £800,000", "£800,000 - £1,200,000"],
    "Meridian Heights": ["£380,000 - £500,000", "£500,000 - £700,000", "£700,000 - £850,000"],
    "Parkside Quarter": ["£295,000 - £400,000", "£400,000 - £500,000", "£500,000 - £620,000"],
    "Victoria Gardens": ["£220,000 - £300,000", "£300,000 - £400,000", "£400,000 - £485,000"],
    "Kensington Place": ["£1,500,000 - £2,500,000", "£2,500,000 - £3,500,000", "£3,000,000+"],
  };
  
  const bedrooms = ["1 bed", "2 bed", "2-3 bed", "3 bed", "3-4 bed", "Penthouse"];
  
  const weightedRandom = (weights: number[]) => {
    const total = weights.reduce((a, b) => a + b, 0);
    let random = Math.random() * total;
    for (let i = 0; i < weights.length; i++) {
      random -= weights[i];
      if (random <= 0) return i;
    }
    return weights.length - 1;
  };

  // Generate score with target average of 67
  const generateScore = (status: string) => {
    // Higher scores for hot leads
    if (status === "Offer Made") return Math.floor(Math.random() * 15) + 85; // 85-100
    if (status === "Viewing Booked") return Math.floor(Math.random() * 15) + 75; // 75-90
    if (status === "Engaged") return Math.floor(Math.random() * 20) + 60; // 60-80
    if (status === "Contacted") return Math.floor(Math.random() * 25) + 50; // 50-75
    return Math.floor(Math.random() * 40) + 35; // New: 35-75
  };

  let leadId = 1;
  
  developments.forEach(dev => {
    for (let i = 0; i < dev.count; i++) {
      const statusIdx = weightedRandom(statusWeights);
      const status = statuses[statusIdx];
      const timelineIdx = weightedRandom(timelineWeights);
      const timeline = timelines[timelineIdx];
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const country = countries[Math.floor(Math.random() * countries.length)];
      const platform = platforms[Math.floor(Math.random() * platforms.length)];
      const campaign = dev.campaigns[Math.floor(Math.random() * dev.campaigns.length)];
      const budgets = budgetRanges[dev.name as keyof typeof budgetRanges];
      const budget = budgets[Math.floor(Math.random() * budgets.length)];
      const bedroom = bedrooms[Math.floor(Math.random() * bedrooms.length)];
      const daysAgo = Math.floor(Math.random() * 180) + 1; // Spread over 6 months
      const cashBuyer = Math.random() > 0.6 ? "Cash" : "Mortgage";
      const ready28 = timeline === "Within 28 days" || (timeline === "0-3 months" && Math.random() > 0.7) ? "Yes" : "No";
      const score = generateScore(status);
      
      const summaries = [
        `Interested in ${bedroom} property. ${cashBuyer} buyer.`,
        `Looking for investment opportunity. ${timeline} timeline.`,
        `Relocating to area. Motivated buyer.`,
        `Portfolio investor seeking BTL opportunity.`,
        `First-time buyer with mortgage pre-approval.`,
        `Downsizer looking for modern apartment.`,
        `Family expanding, needs more space.`,
        `Professional relocating for work.`,
        `International investor, strong cash position.`,
        `Repeat buyer, sold previous property.`,
      ];
      
      leads.push({
        "Lead ID": `DEV${String(leadId).padStart(5, '0')}`,
        "Name": `${firstName} ${lastName}`,
        "Email": `${firstName.toLowerCase()}.${lastName.toLowerCase()}${leadId}@email.com`,
        "Phone Number": country === "United Kingdom" ? `+44 7${Math.floor(Math.random() * 900 + 100)} ${Math.floor(Math.random() * 900000 + 100000)}` : `+${Math.floor(Math.random() * 900 + 100)} ${Math.floor(Math.random() * 9000000 + 1000000)}`,
        "Country": country,
        "Budget Range": budget,
        "Preferred Bedrooms": bedroom,
        "Timeline to Purchase": timeline,
        "Status": status,
        "Source Platform": platform,
        "Campaign": campaign,
        "Development": dev.name,
        "Date Added": new Date(now - daysAgo * day).toISOString(),
        "Buyer Summary": summaries[Math.floor(Math.random() * summaries.length)],
        "Cash/Mortgage": cashBuyer,
        "Are you ready to purchase within 28 days?": ready28,
        "Score": score,
      });
      
      leadId++;
    }
  });
  
  return leads;
};

// Generate all leads
export const developerLeads = generateLeads();

// Calculate summary stats - these should match our master stats
export const getDeveloperStats = () => {
  const totalLeads = developerLeads.length;
  const hotLeads = developerLeads.filter(l => 
    l.Status === 'Viewing Booked' || l.Status === 'Offer Made'
  ).length;
  
  const totalSpend = developerCampaigns.reduce((sum, c) => sum + (c.Spend || 0), 0);
  const totalResults = developerCampaigns.reduce((sum, c) => sum + (c.Results || 0), 0);
  const avgCPL = totalResults > 0 ? totalSpend / totalResults : 0;
  
  // Calculate average score
  const avgScore = Math.round(developerLeads.reduce((sum, l) => sum + (l.Score || 0), 0) / totalLeads);
  
  const viewingsBooked = developerLeads.filter(l => l.Status === 'Viewing Booked').length;
  const offersReceived = developerLeads.filter(l => l.Status === 'Offer Made').length;
  
  return {
    totalLeads,        // Should be 15,658
    hotLeads,          // Should be ~457
    avgScore,          // Should be ~67
    totalSpend,        // Should be 86,678
    avgCPL,            // Should be ~5.53
    viewingsBooked,
    offersReceived,
    totalDevelopments: developerDevelopments.filter(d => d.status === 'live').length,
    totalUnits: developerDevelopments.reduce((sum, d) => sum + d.units, 0),
    unitsSold: developerDevelopments.reduce((sum, d) => sum + d.unitsSold, 0),
  };
};
