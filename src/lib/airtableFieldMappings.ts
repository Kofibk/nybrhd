/**
 * Centralized Airtable field mappings
 * Single source of truth for all Airtable field names and their transformations
 */

// ============= Buyer/Lead Field Mappings =============

export const BUYER_AIRTABLE_FIELDS = {
  // Core identification
  LEAD_ID: 'Lead ID',
  LEAD_NAME: 'Lead Name',
  FIRST_NAME: 'first_name',
  LAST_NAME: 'last_name',
  EMAIL: 'Email',
  PHONE: 'Phone Number',
  
  // Preferences
  BUDGET_RANGE: 'Budget Range',
  PREFERRED_BEDROOMS: 'Preferred Bedrooms',
  PREFERRED_LOCATION: 'Preferred Location',
  COUNTRY: 'Country',
  TIMELINE: 'Timeline to Purchase',
  PAYMENT_METHOD: 'Cash/Mortgage',
  PURPOSE: 'Purpose for Purchase',
  PREFERRED_COMM: 'Preferred Communication',
  
  // Scoring & Status
  SCORE: 'Score',
  INTENT: 'Intent',
  STATUS: 'Status',
  ASSIGNED_CALLER: 'Assigned Caller',
  
  // Extended fields
  BUYER_SUMMARY: 'Buyer Summary',
  DEVELOPMENT_NAME: 'Development Name',
  AGENT_TRANSCRIPTION: 'Agent Transcription',
  LINKEDIN_PROFILE: 'LinkedIn Profile',
  PURCHASE_IN_28_DAYS: 'Purchase in 28 Days',
  BROKER_NEEDED: 'Broker Needed',
  CAMPAIGN_NAME: 'Campaign Name',
  SOURCE: 'Source',
  NOTES: 'Notes',
} as const;

export const CAMPAIGN_AIRTABLE_FIELDS = {
  // Core identification
  CAMPAIGN_NAME: 'Campaign Name',
  CAMPAIGN_ID: 'Campaign ID',
  AD_SET_NAME: 'Ad Set Name',
  AD_NAME: 'Ad Name',
  
  // Financials - using actual Airtable field names
  BUDGET: 'Budget',
  TOTAL_SPENT: 'Total Spent',  // Actual field name in Campaign_Data
  SPEND: 'Spend',
  LEADS: 'Leads',
  LPV: 'LPV',  // Landing Page Views
  CPL: 'CPL',
  COST_PER_RESULT: 'Cost per result',
  COST_PER_LPV: 'Cost per LPV',
  
  // Status
  STATUS: 'Status',
  DELIVERY_STATUS: 'Delivery Status',  // Actual field name in Campaign_Data
  
  // Dates
  DATE: 'Date',  // Actual field name in Campaign_Data
  START_DATE: 'Start Date',
  END_DATE: 'End Date',
  
  // Performance metrics
  PLATFORM: 'Platform',
  IMPRESSIONS: 'Impressions',
  REACH: 'Reach',
  CLICKS: 'Clicks',
  LINK_CLICKS: 'Link Clicks',
  CTR: 'CTR',
  CPC: 'CPC',
  CPM: 'CPM',
  FREQUENCY: 'Frequency',
  
  // Linked
  DEVELOPMENT: 'Development',
  CLIENT: 'Client',
} as const;

// ============= Default Values =============

export const BUYER_DEFAULTS = {
  status: 'Contact Pending',
  score: 0,
  intent: '',
  paymentMethod: 'undecided',
} as const;

// ============= Status Options =============

export const BUYER_STATUS_OPTIONS = [
  'Contact Pending',
  'Contacted',
  'Qualified',
  'Viewing Scheduled',
  'Offer Made',
  'Closed Won',
  'Closed Lost',
  'Not Interested',
] as const;

export const INTENT_OPTIONS = [
  'Low',
  'Medium',
  'Warm',
  'Hot',
  'High',
] as const;

// ============= Boolean Field Helpers =============

export function parseBooleanField(value: unknown): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const lower = value.toLowerCase().trim();
    return lower === 'yes' || lower === 'true' || lower === '1';
  }
  return false;
}

// ============= Score Helpers =============

export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-500';
  if (score >= 60) return 'text-amber-500';
  if (score >= 40) return 'text-orange-500';
  return 'text-red-500';
}

export function getScoreBgColor(score: number): string {
  if (score >= 80) return 'bg-green-500/10';
  if (score >= 60) return 'bg-amber-500/10';
  if (score >= 40) return 'bg-orange-500/10';
  return 'bg-red-500/10';
}

// ============= Name Extraction =============

export function extractBuyerName(fields: Record<string, unknown>): string {
  if (fields[BUYER_AIRTABLE_FIELDS.LEAD_NAME]) {
    return String(fields[BUYER_AIRTABLE_FIELDS.LEAD_NAME]);
  }
  
  const firstName = fields[BUYER_AIRTABLE_FIELDS.FIRST_NAME] || '';
  const lastName = fields[BUYER_AIRTABLE_FIELDS.LAST_NAME] || '';
  const fullName = `${firstName} ${lastName}`.trim();
  
  return fullName || 'Unknown';
}

// ============= Assigned Caller Extraction =============

export function extractAssignedCaller(rawCaller: unknown): string {
  if (!rawCaller) return '';
  
  if (typeof rawCaller === 'string') {
    return rawCaller;
  }
  
  if (Array.isArray(rawCaller)) {
    return rawCaller
      .map((c) => {
        if (typeof c === 'string') return c;
        if (typeof c === 'object' && c !== null) {
          const obj = c as Record<string, unknown>;
          return String(obj?.name || obj?.email || obj?.id || '');
        }
        return '';
      })
      .filter(Boolean)
      .join(', ');
  }
  
  if (typeof rawCaller === 'object' && rawCaller !== null) {
    const obj = rawCaller as Record<string, unknown>;
    return String(obj?.name || obj?.email || obj?.id || '');
  }
  
  return '';
}

// ============= Type Definitions =============

export type BuyerAirtableField = typeof BUYER_AIRTABLE_FIELDS[keyof typeof BUYER_AIRTABLE_FIELDS];
export type CampaignAirtableField = typeof CAMPAIGN_AIRTABLE_FIELDS[keyof typeof CAMPAIGN_AIRTABLE_FIELDS];
export type BuyerStatus = typeof BUYER_STATUS_OPTIONS[number];
export type IntentLevel = typeof INTENT_OPTIONS[number];
