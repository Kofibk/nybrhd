// Hybrid Signal Campaign Engine Data
// Audience Maturity Model, UTM Schema, Interest Clusters, and Retargeting Logic

// =============================================================================
// PART 1: THE RIGID UTM SCHEMA
// Force-injected into every ad for granular attribution
// =============================================================================

export interface UTMSchema {
  utm_source: "fb_ig";
  utm_medium: "paidsocial";
  utm_campaign: string;    // [Campaign_ID]
  utm_content: string;     // [Creative_ID]_[Headline_ID]
  utm_term: string;        // [Audience_ID]
  naybourhood_device: "mobile" | "desktop" | "tablet";
  naybourhood_placement: string;
  naybourhood_creative_type: string;
  naybourhood_headline_id: string;
  naybourhood_audience_id: string;
}

export const generateHybridUTMs = (
  campaignId: string,
  creativeId: string,
  headlineId: string,
  audienceId: string,
  device: "mobile" | "desktop" | "tablet" = "mobile",
  placement: string = "feed",
  creativeType: string = "static"
): UTMSchema => ({
  utm_source: "fb_ig",
  utm_medium: "paidsocial",
  utm_campaign: campaignId,
  utm_content: `${creativeId}_${headlineId}`,
  utm_term: audienceId,
  naybourhood_device: device,
  naybourhood_placement: placement,
  naybourhood_creative_type: creativeType,
  naybourhood_headline_id: headlineId,
  naybourhood_audience_id: audienceId,
});

export const buildUTMString = (utms: UTMSchema): string => {
  return Object.entries(utms)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join("&");
};

// =============================================================================
// PART 2: AUDIENCE MATURITY MODEL
// Cold -> Warm -> Verified lifecycle stages
// =============================================================================

export type AudienceMaturity = "cold" | "warm" | "verified";

export interface AudienceMaturityState {
  stage: AudienceMaturity;
  verifiedLeadCount: number;
  warmLeadCount: number;
  threshold: {
    warmToVerified: number;
    coldToWarm: number;
  };
  recommendations: string[];
}

export const getAudienceMaturity = (
  verifiedLeadCount: number,
  areaLeadCount: number
): AudienceMaturityState => {
  // Verified: >300 verified leads - use Value-Based Lookalikes
  if (verifiedLeadCount >= 300) {
    return {
      stage: "verified",
      verifiedLeadCount,
      warmLeadCount: areaLeadCount,
      threshold: { warmToVerified: 300, coldToWarm: 100 },
      recommendations: [
        "Switch budget from Interest targeting to Value-Based Lookalikes",
        "Create 1%, 3%, and 5% lookalike audiences from verified buyers",
        "Focus on credit-passed leads for highest-quality lookalikes",
        "Expected CPL reduction: 25-40%"
      ]
    };
  }
  
  // Warm: 100-299 leads - use Inventory-Aware Retargeting
  if (areaLeadCount >= 100) {
    return {
      stage: "warm",
      verifiedLeadCount,
      warmLeadCount: areaLeadCount,
      threshold: { warmToVerified: 300, coldToWarm: 100 },
      recommendations: [
        "Enable Dynamic Product Ads for property retargeting",
        "Retarget viewers with specific plot/unit they viewed",
        "Set up sold-plot replacement logic",
        `${300 - verifiedLeadCount} more verified leads needed for Lookalike stage`
      ]
    };
  }
  
  // Cold: <100 leads - use Smart Interest Targeting
  return {
    stage: "cold",
    verifiedLeadCount,
    warmLeadCount: areaLeadCount,
    threshold: { warmToVerified: 300, coldToWarm: 100 },
    recommendations: [
      "Using Smart Cold-Start with proven interest clusters",
      "Auto-applying Anti-Tire-Kicker exclusion list",
      "Leveraging global Naybourhood data for interest selection",
      `${100 - areaLeadCount} more leads needed to enable Retargeting`
    ]
  };
};

// =============================================================================
// PART 3: SMART COLD-START INTEREST CLUSTERS
// Top 10 preset clusters based on global Naybourhood data
// =============================================================================

export interface InterestCluster {
  id: string;
  name: string;
  description: string;
  icon: string;
  suggestedInterests: string[];
  excludedInterests: string[];
  avgCPL: number;
  conversionRate: number;
  bestFor: string[];
}

export const INTEREST_CLUSTERS: InterestCluster[] = [
  {
    id: "first_time_buyer",
    name: "First-Time Buyer",
    description: "Young professionals entering the property market",
    icon: "🏠",
    suggestedInterests: [
      "Monzo", "Starling Bank", "Help to Buy", "Shared Ownership",
      "Rightmove", "Zoopla", "OnTheMarket", "First Homes",
      "Mortgage Calculator", "Property Investment UK"
    ],
    excludedInterests: ["Landlord", "Buy to Let", "Commercial Property"],
    avgCPL: 28.50,
    conversionRate: 3.2,
    bestFor: ["1-2 bed apartments", "Starter homes", "Urban developments"]
  },
  {
    id: "investor_uk",
    name: "UK Property Investor",
    description: "Experienced investors seeking rental yield and capital growth",
    icon: "💷",
    suggestedInterests: [
      "Property Investor", "Buy to Let", "Rental Yield",
      "Capital Appreciation", "REIT", "Property Portfolio",
      "Landlord", "HMO Investment", "Property118"
    ],
    excludedInterests: ["First Time Buyer", "Help to Buy", "Shared Ownership"],
    avgCPL: 42.00,
    conversionRate: 4.8,
    bestFor: ["Buy-to-let", "Multi-unit developments", "High-yield areas"]
  },
  {
    id: "investor_international",
    name: "International Investor",
    description: "HNWIs and expats seeking UK property exposure",
    icon: "🌍",
    suggestedInterests: [
      "International Property", "Currency Exchange", "UK Visa",
      "Private Banking", "Wealth Management", "HSBC Expat",
      "British Schools Overseas", "Dubai Property", "Singapore Property"
    ],
    excludedInterests: ["Council Housing", "Social Housing", "Affordable Homes"],
    avgCPL: 65.00,
    conversionRate: 6.2,
    bestFor: ["Prime Central London", "Branded residences", "£1M+ properties"]
  },
  {
    id: "downsizer",
    name: "Downsizer",
    description: "Empty nesters and retirees seeking quality over space",
    icon: "🏡",
    suggestedInterests: [
      "Retirement Planning", "Over 55", "Country Living",
      "National Trust", "Garden Design", "Saga",
      "Waitrose", "Classic FM", "Antiques"
    ],
    excludedInterests: ["Student Accommodation", "HMO", "Party Lifestyle"],
    avgCPL: 35.00,
    conversionRate: 5.1,
    bestFor: ["Retirement villages", "Boutique developments", "Gated communities"]
  },
  {
    id: "young_professional",
    name: "Young Professional",
    description: "Career-focused individuals aged 25-35",
    icon: "💼",
    suggestedInterests: [
      "Gymshark", "Peloton", "Remote Work", "WeWork",
      "The Economist", "LinkedIn", "Tech Startups",
      "Uber", "Deliveroo", "City Living"
    ],
    excludedInterests: ["Retirement", "Over 55", "Rural Living"],
    avgCPL: 32.00,
    conversionRate: 2.9,
    bestFor: ["City centre apartments", "Transport-linked developments", "Co-living"]
  },
  {
    id: "family_upsizer",
    name: "Growing Family",
    description: "Parents needing more space and family-friendly amenities",
    icon: "👨‍👩‍👧‍👦",
    suggestedInterests: [
      "Mumsnet", "NCT", "John Lewis", "Boden",
      "Private Schools", "Grammar Schools", "Family Days Out",
      "Cotswolds", "Suburb Living", "Family Car"
    ],
    excludedInterests: ["Single Living", "City Nightlife", "Student"],
    avgCPL: 38.00,
    conversionRate: 4.5,
    bestFor: ["Family homes", "Houses with gardens", "School catchment areas"]
  },
  {
    id: "luxury_buyer",
    name: "Luxury Buyer",
    description: "Ultra-high-net-worth individuals seeking prime property",
    icon: "💎",
    suggestedInterests: [
      "Harrods", "Net-A-Porter", "Rolls Royce", "Yacht",
      "Private Jet", "Mayfair", "Knightsbridge",
      "Country Estate", "Wine Investment", "Art Collection"
    ],
    excludedInterests: ["Budget", "Affordable", "Help to Buy", "Shared Ownership"],
    avgCPL: 120.00,
    conversionRate: 8.5,
    bestFor: ["Prime property", "Penthouses", "£5M+ developments"]
  },
  {
    id: "expat_returning",
    name: "Returning Expat",
    description: "British expats planning to return to the UK",
    icon: "✈️",
    suggestedInterests: [
      "British Expat", "Returning to UK", "UK Relocation",
      "International Schools", "HSBC Expat", "Currency Transfer",
      "Emirates", "Qatar Airways", "Middle East Expat"
    ],
    excludedInterests: [],
    avgCPL: 55.00,
    conversionRate: 5.8,
    bestFor: ["New builds", "Managed properties", "London catchment"]
  },
  {
    id: "second_home",
    name: "Second Home Buyer",
    description: "Buyers seeking holiday homes or weekend retreats",
    icon: "🏖️",
    suggestedInterests: [
      "Cornwall", "Lake District", "Cotswolds", "Devon",
      "Airbnb Host", "Holiday Let", "Coastal Living",
      "Sailing", "Golf", "Walking Holidays"
    ],
    excludedInterests: ["Primary Residence Only", "First Time Buyer"],
    avgCPL: 48.00,
    conversionRate: 4.2,
    bestFor: ["Coastal developments", "Rural retreats", "Lifestyle locations"]
  },
  {
    id: "mortgage_ready",
    name: "Mortgage-Ready Buyer",
    description: "Buyers actively seeking mortgage products",
    icon: "📋",
    suggestedInterests: [
      "Mortgage Broker", "MoneySupermarket", "Compare the Market",
      "Habito", "Trussle", "L&C Mortgages",
      "Fixed Rate Mortgage", "Mortgage Calculator", "Agreement in Principle"
    ],
    excludedInterests: ["Cash Buyer Only", "No Mortgage Required"],
    avgCPL: 25.00,
    conversionRate: 3.8,
    bestFor: ["Mortgage broker campaigns", "New build with incentives"]
  }
];

// =============================================================================
// PART 4: ANTI-TIRE-KICKER EXCLUSION LIST
// Always-on exclusions to improve lead quality
// =============================================================================

export const EXCLUSION_LIST = {
  interests: [
    "Free giveaway", "Competition entry", "Win a house",
    "Dream home lottery", "Council housing applications",
    "Social housing waiting list", "Universal Credit",
    "Real estate agent jobs", "Property recruiter",
    "Estate agency franchise"
  ],
  behaviours: [
    "Engaged shoppers (negative)", "Deal seekers",
    "Coupon users", "Heavy coupon users",
    "Free trial seekers", "MLM interested"
  ],
  demographics: [
    "Under 18", "Student (currently)",
    "Household income: bottom 10%"
  ]
};

// =============================================================================
// PART 5: RETARGETING LOGIC
// Plot-specific dynamic retargeting with sold-plot replacement
// =============================================================================

export interface PropertyUnit {
  id: string;
  plotNumber: string;
  type: string;
  bedrooms: number;
  price: number;
  status: "available" | "reserved" | "sold" | "off_market";
  specs: {
    sqft: number;
    floor?: number;
    aspect?: string;
    parking?: boolean;
  };
}

export interface RetargetingRule {
  id: string;
  name: string;
  trigger: string;
  action: string;
  fallbackPlotCriteria: {
    matchBedrooms: boolean;
    priceVariance: number; // percentage
    matchFloor: boolean;
    matchAspect: boolean;
  };
}

export const RETARGETING_RULES: RetargetingRule[] = [
  {
    id: "viewed_specific_plot",
    name: "Viewed Specific Plot",
    trigger: "User viewed Plot X details page",
    action: "Retarget with Plot X creative for 7 days",
    fallbackPlotCriteria: {
      matchBedrooms: true,
      priceVariance: 10,
      matchFloor: true,
      matchAspect: false
    }
  },
  {
    id: "plot_sold_replacement",
    name: "Plot Sold Replacement",
    trigger: "Plot X status changes to 'sold'",
    action: "Automatically switch retargeting to similar Plot Y",
    fallbackPlotCriteria: {
      matchBedrooms: true,
      priceVariance: 15,
      matchFloor: false,
      matchAspect: true
    }
  },
  {
    id: "abandoned_enquiry",
    name: "Abandoned Enquiry",
    trigger: "User started enquiry form but didn't submit",
    action: "Retarget with incentive messaging",
    fallbackPlotCriteria: {
      matchBedrooms: true,
      priceVariance: 20,
      matchFloor: false,
      matchAspect: false
    }
  }
];

export const findReplacementPlot = (
  soldPlot: PropertyUnit,
  availableUnits: PropertyUnit[],
  rule: RetargetingRule
): PropertyUnit | null => {
  const { fallbackPlotCriteria } = rule;
  
  const matches = availableUnits.filter(unit => {
    if (unit.status !== "available") return false;
    
    if (fallbackPlotCriteria.matchBedrooms && unit.bedrooms !== soldPlot.bedrooms) {
      return false;
    }
    
    const priceMin = soldPlot.price * (1 - fallbackPlotCriteria.priceVariance / 100);
    const priceMax = soldPlot.price * (1 + fallbackPlotCriteria.priceVariance / 100);
    if (unit.price < priceMin || unit.price > priceMax) {
      return false;
    }
    
    if (fallbackPlotCriteria.matchFloor && unit.specs.floor !== soldPlot.specs.floor) {
      return false;
    }
    
    if (fallbackPlotCriteria.matchAspect && unit.specs.aspect !== soldPlot.specs.aspect) {
      return false;
    }
    
    return true;
  });
  
  // Return closest price match
  if (matches.length === 0) return null;
  
  return matches.sort((a, b) => 
    Math.abs(a.price - soldPlot.price) - Math.abs(b.price - soldPlot.price)
  )[0];
};

// =============================================================================
// PART 6: CREATIVE BREAKDOWN TRACKING
// Track performance by creative element for attribution
// =============================================================================

export interface CreativePerformance {
  creativeId: string;
  creativeType: "image" | "video" | "carousel";
  creativeName: string;
  thumbnailUrl?: string;
  metrics: {
    clicks: number;
    leads: number;
    deals: number;
    spend: number;
    ctr: number;
    cpl: number;
    dealRate: number; // leads that became deals
  };
}

export interface HeadlinePerformance {
  headlineId: string;
  headlineText: string;
  metrics: {
    impressions: number;
    clicks: number;
    leads: number;
    deals: number;
    ctr: number;
    dealRate: number;
  };
}

export interface AttributionInsight {
  type: "creative" | "headline" | "device" | "audience";
  title: string;
  finding: string;
  recommendation: string;
  impact: "high" | "medium" | "low";
  budgetShiftSuggestion?: {
    from: string;
    to: string;
    percentage: number;
  };
}

// =============================================================================
// PART 7: DEVICE-SPECIFIC EXPERIENCE CONFIG
// Landing page optimisations based on device
// =============================================================================

export interface DeviceConfig {
  device: "mobile" | "desktop" | "tablet";
  priorityElements: string[];
  hideElements: string[];
  ctaOrder: string[];
  mediaFormat: "vertical_video" | "horizontal_video" | "static" | "carousel";
}

export const DEVICE_CONFIGS: DeviceConfig[] = [
  {
    device: "mobile",
    priorityElements: ["whatsapp_button", "phone_cta", "vertical_video", "quick_enquiry"],
    hideElements: ["detailed_floor_plans", "full_gallery", "complex_forms"],
    ctaOrder: ["whatsapp", "call", "enquire"],
    mediaFormat: "vertical_video"
  },
  {
    device: "desktop",
    priorityElements: ["high_res_floorplan", "virtual_tour", "detailed_specs", "full_form"],
    hideElements: [],
    ctaOrder: ["schedule_viewing", "download_brochure", "enquire"],
    mediaFormat: "horizontal_video"
  },
  {
    device: "tablet",
    priorityElements: ["carousel", "virtual_tour", "quick_form"],
    hideElements: ["complex_forms"],
    ctaOrder: ["enquire", "schedule_viewing", "call"],
    mediaFormat: "carousel"
  }
];

// =============================================================================
// PART 8: MOCK DATA FOR DEMO
// =============================================================================

export const MOCK_CREATIVE_PERFORMANCE: CreativePerformance[] = [
  {
    creativeId: "cr_001",
    creativeType: "image",
    creativeName: "Garden View Hero",
    thumbnailUrl: "https://picsum.photos/seed/garden/400/300",
    metrics: { clicks: 1250, leads: 42, deals: 3, spend: 850, ctr: 3.2, cpl: 20.24, dealRate: 7.1 }
  },
  {
    creativeId: "cr_002",
    creativeType: "image",
    creativeName: "Floorplan Detail",
    thumbnailUrl: "https://picsum.photos/seed/floorplan/400/300",
    metrics: { clicks: 890, leads: 38, deals: 8, spend: 720, ctr: 2.1, cpl: 18.95, dealRate: 21.1 }
  },
  {
    creativeId: "cr_003",
    creativeType: "video",
    creativeName: "Kitchen Walkthrough",
    thumbnailUrl: "https://picsum.photos/seed/kitchen/400/300",
    metrics: { clicks: 2100, leads: 65, deals: 5, spend: 1200, ctr: 4.5, cpl: 18.46, dealRate: 7.7 }
  },
  {
    creativeId: "cr_004",
    creativeType: "carousel",
    creativeName: "Lifestyle Carousel",
    thumbnailUrl: "https://picsum.photos/seed/lifestyle/400/300",
    metrics: { clicks: 1680, leads: 52, deals: 4, spend: 950, ctr: 3.8, cpl: 18.27, dealRate: 7.7 }
  }
];

export const MOCK_HEADLINE_PERFORMANCE: HeadlinePerformance[] = [
  {
    headlineId: "hl_001",
    headlineText: "Stop Renting, Start Owning",
    metrics: { impressions: 45000, clicks: 1800, leads: 58, deals: 4, ctr: 4.0, dealRate: 6.9 }
  },
  {
    headlineId: "hl_002",
    headlineText: "8% Guaranteed Yield",
    metrics: { impressions: 42000, clicks: 1260, leads: 45, deals: 9, ctr: 3.0, dealRate: 20.0 }
  },
  {
    headlineId: "hl_003",
    headlineText: "From £299k – Limited Units",
    metrics: { impressions: 38000, clicks: 1520, leads: 62, deals: 6, ctr: 4.0, dealRate: 9.7 }
  }
];

export const MOCK_ATTRIBUTION_INSIGHTS: AttributionInsight[] = [
  {
    type: "creative",
    title: "The Attribution Reality Check",
    finding: "The 'Garden' image drives clicks (CTR 3.2%), but the 'Floorplan' image drives Sales (Deal Rate 21.1%).",
    recommendation: "Shift 20% of budget from Garden creative to Floorplan creative for higher deal conversion.",
    impact: "high",
    budgetShiftSuggestion: { from: "Garden View Hero", to: "Floorplan Detail", percentage: 20 }
  },
  {
    type: "device",
    title: "Device Performance Gap",
    finding: "Desktop users viewing 'Finance Offer' headline are 4x more likely to pass credit check than Mobile users viewing 'Lifestyle' images.",
    recommendation: "Increase Desktop/Finance budget allocation for credit-verified leads.",
    impact: "high",
    budgetShiftSuggestion: { from: "Mobile/Lifestyle", to: "Desktop/Finance", percentage: 25 }
  },
  {
    type: "headline",
    title: "Headline Conversion Analysis",
    finding: "'8% Guaranteed Yield' has lowest CTR (3.0%) but highest Deal Rate (20.0%).",
    recommendation: "Prioritise yield-focused messaging for serious investor audiences.",
    impact: "medium"
  }
];

export const MOCK_PROPERTY_UNITS: PropertyUnit[] = [
  { id: "u1", plotNumber: "Plot 5", type: "2 Bed Apartment", bedrooms: 2, price: 450000, status: "sold", specs: { sqft: 850, floor: 3, aspect: "south", parking: true } },
  { id: "u2", plotNumber: "Plot 6", type: "2 Bed Apartment", bedrooms: 2, price: 465000, status: "available", specs: { sqft: 875, floor: 3, aspect: "south", parking: true } },
  { id: "u3", plotNumber: "Plot 7", type: "2 Bed Apartment", bedrooms: 2, price: 440000, status: "available", specs: { sqft: 825, floor: 2, aspect: "east", parking: false } },
  { id: "u4", plotNumber: "Plot 12", type: "3 Bed Apartment", bedrooms: 3, price: 625000, status: "available", specs: { sqft: 1200, floor: 5, aspect: "south", parking: true } },
  { id: "u5", plotNumber: "Plot 15", type: "1 Bed Apartment", bedrooms: 1, price: 325000, status: "reserved", specs: { sqft: 550, floor: 1, aspect: "north", parking: false } },
];
