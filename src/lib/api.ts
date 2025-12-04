import { Campaign, Lead, Settings, User, DailyMetrics, CampaignCreative } from "./types";
import { demoUsers, demoDevelopments, STORAGE_KEYS, initializeDemoData } from "./demoData";

// Initialize demo data on first load
initializeDemoData();

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// AUTH ENDPOINTS

export const authRequestCode = async (email: string): Promise<{ success: boolean }> => {
  await delay(500);
  // Always succeeds in demo mode
  console.log(`[STUB] POST /auth.requestCode - Code sent to ${email}`);
  return { success: true };
};

export const authVerifyCode = async (
  email: string,
  code: string
): Promise<{ token: string; userId: string; user: User }> => {
  await delay(500);
  console.log(`[STUB] POST /auth.verifyCode - Verifying code ${code} for ${email}`);
  
  // Find matching demo user or default to developer
  let user = demoUsers.find((u) => u.email === email);
  if (!user) {
    // Create a user based on email pattern
    const role = email.includes("agent") ? "agent" : email.includes("broker") ? "broker" : "developer";
    user = {
      id: `user_${Date.now()}`,
      email,
      name: email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      role,
      createdAt: new Date().toISOString(),
    };
  }

  const token = `demo_token_${Date.now()}`;
  
  // Store in localStorage
  localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));

  return { token, userId: user.id, user };
};

export const logout = (): void => {
  localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER);
};

export const getSession = (): { token: string; user: User } | null => {
  const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  const userStr = localStorage.getItem(STORAGE_KEYS.USER);
  
  if (token && userStr) {
    try {
      const user = JSON.parse(userStr) as User;
      return { token, user };
    } catch {
      return null;
    }
  }
  return null;
};

// CAMPAIGNS ENDPOINTS

export const campaignsCreate = async (params: {
  roleType: string;
  developmentId: string;
  objective: string;
  assets: string[];
}): Promise<{ headlines: string[]; primaryTexts: string[]; ctas: string[] }> => {
  await delay(1000);
  console.log(`[STUB] POST /campaigns.create`, params);
  
  const development = demoDevelopments.find((d) => d.id === params.developmentId);
  const devName = development?.name || "Your Development";
  
  // Generate AI copy options based on objective
  const headlines = [
    `Invest in ${devName} - Premium UK Property`,
    `Secure Your Future with ${devName}`,
    `Discover Luxury Living at ${devName}`,
  ];
  
  const primaryTexts = [
    `${devName} offers exceptional investment opportunities with guaranteed rental yields. Located in a prime UK location, these properties are perfect for international investors seeking stable returns.`,
    `Experience the pinnacle of modern living at ${devName}. Premium finishes, world-class amenities, and a location that demands attention. Book your private viewing today.`,
    `Join savvy investors who have already secured their stake in ${devName}. Limited units available with flexible payment plans and dedicated buyer support.`,
  ];
  
  const ctas = ["Learn More", "Book Viewing", "Get Details"];
  
  return { headlines, primaryTexts, ctas };
};

export const campaignsPublishMeta = async (
  campaignId: string
): Promise<{
  metaCampaignId: string;
  metaAdsetId: string;
  metaFormId: string;
  metaAdIds: string[];
}> => {
  await delay(1500);
  console.log(`[STUB] POST /campaigns.publish.meta`, { campaignId });
  
  // Update campaign status to live
  const campaigns = getCampaigns();
  const campaignIndex = campaigns.findIndex((c) => c.id === campaignId);
  if (campaignIndex !== -1) {
    campaigns[campaignIndex].status = "live";
    campaigns[campaignIndex].metaCampaignId = `meta_camp_${Date.now()}`;
    campaigns[campaignIndex].metaAdsetId = `meta_adset_${Date.now()}`;
    campaigns[campaignIndex].metaFormId = `meta_form_${Date.now()}`;
    campaigns[campaignIndex].metaAdIds = [`meta_ad_${Date.now()}_1`, `meta_ad_${Date.now()}_2`];
    saveCampaigns(campaigns);
  }
  
  return {
    metaCampaignId: campaigns[campaignIndex]?.metaCampaignId || "",
    metaAdsetId: campaigns[campaignIndex]?.metaAdsetId || "",
    metaFormId: campaigns[campaignIndex]?.metaFormId || "",
    metaAdIds: campaigns[campaignIndex]?.metaAdIds || [],
  };
};

export const metricsSyncMetaDaily = async (): Promise<{ synced: number }> => {
  await delay(1000);
  console.log(`[STUB] POST /metrics.sync.meta.daily`);
  
  // Add some new metrics
  const metrics = getMetrics();
  const today = new Date().toISOString().split("T")[0];
  
  // Check if today's metrics exist
  const todayMetrics = metrics.filter((m) => m.date === today);
  if (todayMetrics.length === 0) {
    metrics.push({
      date: today,
      campaignId: "camp_1",
      leads: Math.floor(Math.random() * 8) + 3,
      spend: Math.floor(Math.random() * 50) + 60,
      impressions: Math.floor(Math.random() * 5000) + 8000,
      clicks: Math.floor(Math.random() * 200) + 150,
    });
    saveMetrics(metrics);
  }
  
  return { synced: 1 };
};

export const settingsUpsert = async (settings: Settings): Promise<{ success: boolean }> => {
  await delay(500);
  console.log(`[STUB] POST /settings.upsert`, settings);
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  return { success: true };
};

// LOCAL DATA HELPERS

export const getCampaigns = (): Campaign[] => {
  const str = localStorage.getItem(STORAGE_KEYS.CAMPAIGNS);
  return str ? JSON.parse(str) : [];
};

export const saveCampaigns = (campaigns: Campaign[]): void => {
  localStorage.setItem(STORAGE_KEYS.CAMPAIGNS, JSON.stringify(campaigns));
};

export const saveCampaign = (campaign: Campaign): void => {
  const campaigns = getCampaigns();
  const index = campaigns.findIndex((c) => c.id === campaign.id);
  if (index !== -1) {
    campaigns[index] = campaign;
  } else {
    campaigns.push(campaign);
  }
  saveCampaigns(campaigns);
};

export const getLeads = (): Lead[] => {
  const str = localStorage.getItem(STORAGE_KEYS.LEADS);
  return str ? JSON.parse(str) : [];
};

export const saveLeads = (leads: Lead[]): void => {
  localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(leads));
};

export const saveLead = (lead: Lead): void => {
  const leads = getLeads();
  const index = leads.findIndex((l) => l.id === lead.id);
  if (index !== -1) {
    leads[index] = lead;
  } else {
    leads.push(lead);
  }
  saveLeads(leads);
};

export const getMetrics = (): DailyMetrics[] => {
  const str = localStorage.getItem(STORAGE_KEYS.METRICS);
  return str ? JSON.parse(str) : [];
};

export const saveMetrics = (metrics: DailyMetrics[]): void => {
  localStorage.setItem(STORAGE_KEYS.METRICS, JSON.stringify(metrics));
};

export const getSettings = (): Settings => {
  const str = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  if (str) {
    try {
      return JSON.parse(str) as Settings;
    } catch {
      return { orgName: "", contactEmail: "" };
    }
  }
  return { orgName: "", contactEmail: "" };
};

export const getDevelopments = () => demoDevelopments;
