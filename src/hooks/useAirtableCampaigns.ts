import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Interface for Campaign_Date Airtable records
export interface AirtableCampaignDate {
  id: string;
  fields: {
    'Campaign Name'?: string;
    'Campaign name'?: string;
    'Client'?: string;
    'Status'?: string;
    'Campaign delivery'?: string;
    'Budget'?: number;
    'Spend'?: number;
    'Amount spent (GBP)'?: number;
    'Results'?: number;
    'Leads'?: number;
    'CPL'?: number;
    'Cost per result'?: number;
    'Start Date'?: string;
    'Reporting starts'?: string;
    'End Date'?: string;
    'Reporting ends'?: string;
    'Platform'?: string;
    'Impressions'?: number;
    'Reach'?: number;
    'Clicks'?: number;
    'CTR'?: number;
    'CPC'?: number;
    'Link clicks'?: number;
    'Cost per 1,000 people reached'?: number;
    'Ad set name'?: string;
    'Frequency'?: number;
    [key: string]: unknown;
  };
  createdTime: string;
}

interface AirtableResponse {
  records: AirtableCampaignDate[];
  offset?: string;
}

// Fetch all Campaign_Date records from Airtable
async function fetchCampaignDateRecords(): Promise<AirtableCampaignDate[]> {
  const { data, error } = await supabase.functions.invoke('airtable-api', {
    body: {
      action: 'list',
      table: 'Campaign_Date',
      maxRecords: 1000,
    },
  });

  if (error) {
    console.error('Airtable Campaign_Date fetch error:', error);
    throw new Error(error.message || 'Failed to fetch Campaign_Date from Airtable');
  }

  return (data as AirtableResponse)?.records || [];
}

// Transform Airtable records to campaign format for the table
export function transformToCampaign(record: AirtableCampaignDate) {
  const fields = record.fields;
  
  const name = fields['Campaign Name'] || fields['Campaign name'] || 'Unknown Campaign';
  const client = fields['Client'] || 'Airtable';
  const rawStatus = (fields['Status'] || fields['Campaign delivery'] || 'active').toLowerCase();
  
  let status = 'live';
  if (rawStatus.includes('paused') || rawStatus.includes('inactive') || rawStatus.includes('archived')) {
    status = 'paused';
  } else if (rawStatus.includes('draft')) {
    status = 'draft';
  }

  const spend = Number(fields['Spend'] || fields['Amount spent (GBP)'] || 0);
  const budget = Number(fields['Budget'] || spend * 1.5 || 1000);
  const leads = Number(fields['Results'] || fields['Leads'] || 0);
  const cpl = fields['CPL'] || fields['Cost per result'] || (leads > 0 ? spend / leads : 0);
  const startDate = fields['Start Date'] || fields['Reporting starts'] || new Date().toISOString().split('T')[0];

  return {
    id: record.id,
    name,
    client,
    clientType: 'developer' as const,
    status,
    budget: Math.round(budget),
    spent: Math.round(spend),
    leads: Math.round(leads),
    cpl: Number(cpl),
    startDate,
    // Additional fields for dashboard
    impressions: Number(fields['Impressions'] || 0),
    reach: Number(fields['Reach'] || 0),
    clicks: Number(fields['Clicks'] || fields['Link clicks'] || 0),
    ctr: Number(fields['CTR'] || 0),
    cpc: Number(fields['CPC'] || 0),
    platform: fields['Platform'] || 'Facebook',
    adSetName: fields['Ad set name'] || '',
    frequency: Number(fields['Frequency'] || 0),
    endDate: fields['End Date'] || fields['Reporting ends'] || '',
  };
}

// Transform to raw format for dashboard context
export function transformToRawFormat(record: AirtableCampaignDate) {
  const fields = record.fields;
  return {
    'Campaign Name': fields['Campaign Name'] || fields['Campaign name'] || 'Unknown Campaign',
    'Platform': fields['Platform'] || 'Facebook',
    'Spend': Number(fields['Spend'] || fields['Amount spent (GBP)'] || 0),
    'Results': Number(fields['Results'] || fields['Leads'] || 0),
    'CPL': Number(fields['CPL'] || fields['Cost per result'] || 0),
    'Status': fields['Status'] || fields['Campaign delivery'] || 'Active',
    'Start Date': fields['Start Date'] || fields['Reporting starts'] || '',
    'Impressions': Number(fields['Impressions'] || 0),
    'Reach': Number(fields['Reach'] || 0),
    'Clicks': Number(fields['Clicks'] || fields['Link clicks'] || 0),
    'CTR': Number(fields['CTR'] || 0),
    'CPC': Number(fields['CPC'] || 0),
    'Ad set name': fields['Ad set name'] || '',
    'Frequency': Number(fields['Frequency'] || 0),
  };
}

type AirtableCampaignHooksOptions = {
  enabled?: boolean;
};

// React Query hook to fetch Campaign_Date data
export function useAirtableCampaignDate(options: AirtableCampaignHooksOptions = {}) {
  return useQuery({
    queryKey: ['airtable-campaign-date'],
    queryFn: fetchCampaignDateRecords,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    enabled: options.enabled ?? true,
  });
}

// Hook that returns transformed campaigns for the table
export function useAirtableCampaignsForTable(options: AirtableCampaignHooksOptions = {}) {
  const query = useAirtableCampaignDate(options);

  return {
    ...query,
    campaigns: query.data?.map(transformToCampaign) || [],
  };
}

// Hook that returns raw format for dashboard context
export function useAirtableCampaignsForDashboard(options: AirtableCampaignHooksOptions = {}) {
  const query = useAirtableCampaignDate(options);

  return {
    ...query,
    campaignData: query.data?.map(transformToRawFormat) || [],
  };
}
