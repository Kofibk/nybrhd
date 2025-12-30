/**
 * Unified Airtable Data Layer
 * Single source of truth for all Airtable data fetching with shared caching
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AIRTABLE_TABLES } from '@/lib/airtableConstants';
import {
  BUYER_AIRTABLE_FIELDS,
  CAMPAIGN_AIRTABLE_FIELDS,
  extractBuyerName,
  extractAssignedCaller,
  parseBooleanField,
  BUYER_DEFAULTS,
} from '@/lib/airtableFieldMappings';

// ============= Unified Cache Configuration =============
const CACHE_CONFIG = {
  staleTime: 2 * 60 * 1000,      // 2 minutes
  refetchInterval: 5 * 60 * 1000, // 5 minutes
  refetchOnWindowFocus: true,
} as const;

// ============= Airtable Record Types =============
export interface AirtableBuyerRecord {
  id: string;
  fields: Record<string, unknown>;
  createdTime: string;
}

export interface AirtableCampaignRecord {
  id: string;
  fields: Record<string, unknown>;
  createdTime: string;
}

interface AirtableResponse<T> {
  records: T[];
  offset?: string;
}

// ============= Shared Fetch Functions =============
async function fetchAllRecords<T>(
  table: string,
  options?: {
    sort?: Array<{ field: string; direction: 'asc' | 'desc' }>;
    filterByFormula?: string;
    pageSize?: number;
  }
): Promise<T[]> {
  const allRecords: T[] = [];
  let offset: string | undefined;

  do {
    const { data, error } = await supabase.functions.invoke('airtable-api', {
      body: {
        action: 'list',
        table,
        pageSize: options?.pageSize || 100,
        offset,
        sort: options?.sort,
        filterByFormula: options?.filterByFormula,
      },
    });

    if (error) {
      console.error(`Airtable ${table} fetch error:`, error);
      throw new Error(error.message || `Failed to fetch ${table} from Airtable`);
    }

    const response = data as AirtableResponse<T>;
    allRecords.push(...(response?.records || []));
    offset = response?.offset;
  } while (offset);

  console.log(`Total Airtable ${table} fetched:`, allRecords.length);
  return allRecords;
}

// ============= Buyer Transformation =============
export function transformBuyerRecord(record: AirtableBuyerRecord) {
  const fields = record.fields;
  const F = BUYER_AIRTABLE_FIELDS;

  return {
    id: record.id,
    leadId: (fields[F.LEAD_ID] as number) || 0,
    name: extractBuyerName(fields),
    firstName: String(fields[F.FIRST_NAME] || ''),
    lastName: String(fields[F.LAST_NAME] || ''),
    email: String(fields[F.EMAIL] || ''),
    phone: String(fields[F.PHONE] || ''),
    budgetRange: String(fields[F.BUDGET_RANGE] || ''),
    bedrooms: String(fields[F.PREFERRED_BEDROOMS] || ''),
    location: String(fields[F.PREFERRED_LOCATION] || ''),
    country: String(fields[F.COUNTRY] || ''),
    timeline: String(fields[F.TIMELINE] || ''),
    paymentMethod: String(fields[F.PAYMENT_METHOD] || BUYER_DEFAULTS.paymentMethod),
    purpose: String(fields[F.PURPOSE] || ''),
    score: (fields[F.SCORE] as number) || BUYER_DEFAULTS.score,
    intent: String(fields[F.INTENT] || BUYER_DEFAULTS.intent),
    status: String(fields[F.STATUS] || BUYER_DEFAULTS.status),
    assignedCaller: extractAssignedCaller(fields[F.ASSIGNED_CALLER]),
    preferredComm: String(fields[F.PREFERRED_COMM] || ''),
    summary: String(fields[F.BUYER_SUMMARY] || ''),
    development: String(fields[F.DEVELOPMENT_NAME] || ''),
    createdTime: record.createdTime,
    // Extended fields
    agentTranscription: String(fields[F.AGENT_TRANSCRIPTION] || ''),
    linkedinProfile: String(fields[F.LINKEDIN_PROFILE] || ''),
    purchaseIn28Days: parseBooleanField(fields[F.PURCHASE_IN_28_DAYS]),
    brokerNeeded: parseBooleanField(fields[F.BROKER_NEEDED]),
    campaignName: String(fields[F.CAMPAIGN_NAME] || ''),
    source: String(fields[F.SOURCE] || ''),
    notes: String(fields[F.NOTES] || ''),
    rawFields: fields,
  };
}

export type TransformedBuyer = ReturnType<typeof transformBuyerRecord>;

// ============= Campaign Transformation =============
export function transformCampaignRecord(record: AirtableCampaignRecord) {
  const fields = record.fields;

  // Try multiple field name variations (Airtable Campaign_Data uses different names)
  const name = String(
    fields['Campaign Name'] || 
    fields['Campaign name'] || 
    fields['Ad Set Name'] ||
    'Unknown Campaign'
  );
  
  const rawStatus = String(
    fields['Delivery Status'] || 
    fields['Status'] || 
    fields['Campaign delivery'] || 
    'ACTIVE'
  ).toLowerCase();
  
  let status = 'live';
  if (rawStatus.includes('paused') || rawStatus.includes('inactive') || rawStatus.includes('archived') || rawStatus.includes('not_delivering')) {
    status = 'paused';
  } else if (rawStatus.includes('draft') || rawStatus.includes('pending')) {
    status = 'draft';
  }

  // Spend field variations
  const spend = Number(
    fields['Total Spent'] || 
    fields['Spend'] || 
    fields['Amount spent (GBP)'] || 
    0
  );
  
  // Budget - default to 1.5x of spend if not available
  const budget = Number(fields['Budget'] || spend * 1.5 || 1000);
  
  // Leads/Results field variations
  const leads = Number(
    fields['Results'] || 
    fields['Leads'] || 
    fields['LPV'] || // Landing Page Views as proxy
    0
  );
  
  // CPL calculation
  const cpl = Number(
    fields['CPL'] || 
    fields['Cost per result'] || 
    fields['Cost per LPV'] ||
    (leads > 0 ? spend / leads : 0)
  );
  
  // Date field variations
  const startDate = String(
    fields['Date'] || 
    fields['Start Date'] || 
    fields['Reporting starts'] || 
    new Date().toISOString().split('T')[0]
  );

  return {
    id: record.id,
    name,
    client: String(fields['Client'] || 'Campaign'),
    clientType: 'developer' as const,
    status,
    budget: Math.round(budget),
    spent: Math.round(spend),
    leads: Math.round(leads),
    cpl: Math.round(cpl),
    startDate,
    impressions: Number(fields['Impressions'] || 0),
    reach: Number(fields['Reach'] || 0),
    clicks: Number(fields['Clicks'] || fields['Link Clicks'] || fields['Link clicks'] || 0),
    ctr: Number(fields['CTR'] || 0),
    cpc: Number(fields['CPC'] || 0),
    platform: String(fields['Platform'] || 'Facebook'),
    adSetName: String(fields['Ad Set Name'] || fields['Ad set name'] || ''),
    frequency: Number(fields['Frequency'] || 0),
    endDate: String(fields['End Date'] || fields['Reporting ends'] || ''),
  };
}

export type TransformedCampaign = ReturnType<typeof transformCampaignRecord>;

// Transform to raw format for dashboard context
export function transformCampaignToRaw(record: AirtableCampaignRecord) {
  const fields = record.fields;
  
  // Use actual Airtable field names from Campaign_Data table
  const spend = Number(fields['Total Spent'] || fields['Spend'] || fields['Amount spent (GBP)'] || 0);
  const results = Number(fields['Results'] || fields['Leads'] || fields['LPV'] || 0);
  const calculatedCpl = results > 0 ? spend / results : 0;

  return {
    'Campaign Name': fields['Campaign Name'] || fields['Campaign name'] || 'Unknown Campaign',
    'Campaign name': fields['Campaign Name'] || fields['Campaign name'] || 'Unknown Campaign',
    'Ad set name': fields['Ad Set Name'] || fields['Ad set name'] || '',
    'Platform': fields['Platform'] || 'Facebook',
    'Status': fields['Delivery Status'] || fields['Status'] || fields['Campaign delivery'] || 'Active',
    'Campaign delivery': fields['Delivery Status'] || fields['Campaign delivery'] || fields['Status'] || 'Active',
    'Budget': Number(fields['Budget'] || spend * 1.5 || 0),
    'Spend': spend,
    'Amount spent (GBP)': spend,
    'Results': results,
    'Leads': results,
    'CPL': Math.round(Number(fields['CPL'] || fields['Cost per result'] || fields['Cost per LPV'] || calculatedCpl)),
    'Cost per result': Number(fields['Cost per result'] || fields['CPL'] || fields['Cost per LPV'] || calculatedCpl),
    'Start Date': fields['Date'] || fields['Start Date'] || fields['Reporting starts'] || '',
    'Reporting starts': fields['Date'] || fields['Reporting starts'] || fields['Start Date'] || '',
    'End Date': fields['End Date'] || fields['Reporting ends'] || '',
    'Reporting ends': fields['Reporting ends'] || fields['End Date'] || '',
    'Impressions': Number(fields['Impressions'] || 0),
    'Reach': Number(fields['Reach'] || 0),
    'Frequency': Number(fields['Frequency'] || 0),
    'Cost per 1,000 people reached': Number(fields['Cost per 1,000 people reached'] || fields['CPM'] || 0),
    'Clicks': Number(fields['Clicks'] || fields['Link Clicks'] || fields['Link clicks'] || 0),
    'Link clicks': Number(fields['Link Clicks'] || fields['Link clicks'] || fields['Clicks'] || 0),
    'CTR': Number(fields['CTR'] || 0),
    'CPC': Number(fields['CPC'] || 0),
    'Client': fields['Client'] || '',
  };
}

// ============= Hook Options =============
interface AirtableHookOptions {
  enabled?: boolean;
  autoRefresh?: boolean;
}

// ============= Buyers Hooks =============
export function useAirtableBuyersData(options: AirtableHookOptions = {}) {
  const autoRefresh = options.autoRefresh ?? true;

  return useQuery({
    queryKey: ['airtable', 'buyers'],
    queryFn: () => fetchAllRecords<AirtableBuyerRecord>(
      AIRTABLE_TABLES.BUYERS,
      { sort: [{ field: 'Score', direction: 'desc' }] }
    ),
    staleTime: autoRefresh ? CACHE_CONFIG.staleTime : CACHE_CONFIG.staleTime * 2,
    refetchOnWindowFocus: autoRefresh && CACHE_CONFIG.refetchOnWindowFocus,
    refetchInterval: autoRefresh ? CACHE_CONFIG.refetchInterval : false,
    enabled: options.enabled ?? true,
  });
}

export function useAirtableBuyersForTable(options: AirtableHookOptions = {}) {
  const query = useAirtableBuyersData(options);

  return {
    ...query,
    buyers: query.data?.map(transformBuyerRecord) || [],
  };
}

// ============= Campaigns Hooks =============
export function useAirtableCampaignsData(options: AirtableHookOptions = {}) {
  return useQuery({
    queryKey: ['airtable', 'campaigns'],
    queryFn: () => fetchAllRecords<AirtableCampaignRecord>(AIRTABLE_TABLES.CAMPAIGN_DATA),
    staleTime: CACHE_CONFIG.staleTime * 2, // 4 minutes for campaigns
    refetchOnWindowFocus: CACHE_CONFIG.refetchOnWindowFocus,
    enabled: options.enabled ?? true,
  });
}

export function useAirtableCampaignsForTable(options: AirtableHookOptions = {}) {
  const query = useAirtableCampaignsData(options);

  return {
    ...query,
    campaigns: query.data?.map(transformCampaignRecord) || [],
  };
}

export function useAirtableCampaignsForDashboard(options: AirtableHookOptions = {}) {
  const query = useAirtableCampaignsData(options);

  return {
    ...query,
    campaignData: query.data?.map(transformCampaignToRaw) || [],
  };
}

// ============= Mutation Hooks =============
export function useUpdateAirtableBuyer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ recordId, data }: { recordId: string; data: Record<string, unknown> }) => {
      const { data: result, error } = await supabase.functions.invoke('airtable-api', {
        body: {
          action: 'update',
          table: AIRTABLE_TABLES.BUYERS,
          recordId,
          data,
        },
      });

      if (error) {
        throw new Error(error.message || 'Failed to update buyer');
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['airtable', 'buyers'] });
    },
  });
}

// ============= Utility Functions =============
export function getUniqueBuyerStatuses(buyers: TransformedBuyer[]): string[] {
  const statuses = new Set<string>();
  buyers.forEach(buyer => {
    if (buyer.status) statuses.add(buyer.status);
  });
  return Array.from(statuses).sort();
}

export function getUniqueCallers(buyers: TransformedBuyer[]): string[] {
  const callers = new Set<string>();
  buyers.forEach(buyer => {
    if (buyer.assignedCaller) callers.add(buyer.assignedCaller);
  });
  return Array.from(callers).sort();
}

export function getAirtableColumns(records: AirtableBuyerRecord[] | AirtableCampaignRecord[]): string[] {
  const columns = new Set<string>();
  records.forEach(record => {
    Object.keys(record.fields).forEach(key => columns.add(key));
  });
  return Array.from(columns).sort();
}
