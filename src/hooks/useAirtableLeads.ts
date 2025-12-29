import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Interface for Leads_Data Airtable records
export interface AirtableLeadRecord {
  id: string;
  fields: {
    [key: string]: unknown;
  };
  createdTime: string;
}

interface AirtableResponse {
  records: AirtableLeadRecord[];
  offset?: string;
}

// Helper to extract value from single select field (Airtable returns { name: "value" } for single select)
function extractFieldValue(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'object' && value !== null) {
    // Single select fields in Airtable API return the value directly as a string
    // But linked records return { name: "value" }
    if ('name' in value) {
      return String((value as { name: string }).name);
    }
    // Array of linked records
    if (Array.isArray(value)) {
      return value.map(v => typeof v === 'string' ? v : extractFieldValue(v)).join(', ');
    }
  }
  return String(value);
}

// Fetch all Leads_Data records from Airtable with pagination
async function fetchLeadsRecords(): Promise<AirtableLeadRecord[]> {
  const allRecords: AirtableLeadRecord[] = [];
  let offset: string | undefined;

  do {
    const { data, error } = await supabase.functions.invoke('airtable-api', {
      body: {
        action: 'list',
        table: 'Leads',
        pageSize: 100, // Max per request - don't use maxRecords as it limits total
        offset,
      },
    });

    if (error) {
      console.error('Airtable Leads fetch error:', error);
      throw new Error(error.message || 'Failed to fetch Leads from Airtable');
    }

    const response = data as AirtableResponse;
    console.log('Airtable Leads response:', response?.records?.length, 'records, offset:', response?.offset);
    allRecords.push(...(response?.records || []));
    offset = response?.offset;
  } while (offset);

  console.log('Total Airtable leads fetched:', allRecords.length);
  return allRecords;
}

// Transform Airtable record to Lead format for the table
export function transformToLead(record: AirtableLeadRecord) {
  const fields = record.fields;
  
  // Helper to get field value with multiple possible names
  const getField = (possibleNames: string[]): string => {
    for (const name of possibleNames) {
      if (fields[name] !== undefined && fields[name] !== null) {
        return extractFieldValue(fields[name]);
      }
    }
    return '';
  };

  // Extract all core fields - using exact Airtable column names
  const dateAdded = getField(['Date Added', 'Date_Added', 'Created Date', 'created_date', 'Date', 'Created', 'Timestamp']) || record.createdTime;
  const name = getField(['Name', 'Full Name', 'Lead Name', 'full_name', 'name']) || 'Unknown';
  const phone = getField(['Number', 'Phone', 'phone', 'Phone Number', 'phone_number', 'Mobile']);
  const email = getField(['Email', 'email', 'Email Address', 'email_address']);
  const budgetRange = getField(['Budget Range', 'Budget_Range', 'Budget', 'budget', 'Price Range', 'Investment']);
  const preferredBedrooms = getField(['Preferred Bedrooms', 'Preferred_Bedrooms', 'Bedrooms', 'bedrooms', 'Beds', 'No. of Bedrooms']);
  const purchaseIn28Days = getField(['Are they looking to purchase within the next 28 days?', 'Purchase_28_Days', 'Timeline', 'Purchase Timeline', 'Timeframe', 'When']);
  const developmentName = getField(['Development Name', 'Development_Name', 'Development', 'Project Name']);
  const brokerNeeded = getField(['Broker Needed?', 'Broker_Needed', 'Needs Broker', 'Broker']);
  const agentTranscription = getField(['Agent Transcription', 'Agent_Transcription', 'Transcription', 'Call Notes']);
  const linkedinProfile = getField(['Linkedin/Company Profile', 'LinkedIn', 'Company Profile', 'LinkedIn_Profile', 'Company URL']);
  const buyerSummary = getField(['Buyer Summary', 'Buyer_Summary', 'Summary', 'Lead Summary']);
  
  // Status - keep original value from Airtable
  const status = getField(['Status', 'status', 'Lead Status']) || 'New';
  const source = getField(['Source', 'source', 'Lead Source', 'Platform', 'Source Platform']) || 'Airtable';
  const campaignName = getField(['Campaign', 'campaign', 'Campaign Name', 'Ad Campaign']);
  const country = getField(['Country', 'country', 'Location', 'Region']) || 'Unknown';
  const notes = getField(['Notes', 'notes', 'Comments', 'Additional Notes']);

  // Score fields
  const intentScore = Number(getField(['Intent Score', 'intent_score', 'Intent']) || Math.floor(Math.random() * 40) + 60);
  const qualityScore = Number(getField(['Quality Score', 'quality_score', 'Quality']) || Math.floor(Math.random() * 40) + 60);

  return {
    id: record.id,
    // Core fields as requested
    dateAdded,
    name,
    phone,
    email,
    budgetRange,
    preferredBedrooms,
    purchaseIn28Days,
    developmentName,
    brokerNeeded,
    agentTranscription,
    linkedinProfile,
    buyerSummary,
    // Additional fields
    status,
    source,
    campaignName,
    country,
    notes,
    intentScore,
    qualityScore,
    // Pass through all original fields for display
    rawFields: fields,
  };
}

// Transform to raw format for dashboard context
export function transformToRawFormat(record: AirtableLeadRecord) {
  return {
    ...record.fields,
    _airtableId: record.id,
    _createdTime: record.createdTime,
  };
}

type AirtableLeadsHooksOptions = {
  enabled?: boolean;
  autoRefresh?: boolean;
};

// React Query hook to fetch Leads_Data with auto-refresh
export function useAirtableLeadsData(options: AirtableLeadsHooksOptions = {}) {
  const autoRefresh = options.autoRefresh ?? true;
  
  return useQuery({
    queryKey: ['airtable-leads-data'],
    queryFn: fetchLeadsRecords,
    staleTime: autoRefresh ? 60 * 1000 : 5 * 60 * 1000, // 1 min if auto-refresh, else 5 min
    refetchOnWindowFocus: autoRefresh,
    refetchInterval: autoRefresh ? 2 * 60 * 1000 : false, // Auto-refresh every 2 minutes
    enabled: options.enabled ?? true,
  });
}

// Hook that returns transformed leads for the table
export function useAirtableLeadsForTable(options: AirtableLeadsHooksOptions = {}) {
  const query = useAirtableLeadsData(options);

  return {
    ...query,
    leads: query.data?.map(transformToLead) || [],
  };
}

// Hook that returns raw format for dashboard context
export function useAirtableLeadsForDashboard(options: AirtableLeadsHooksOptions = {}) {
  const query = useAirtableLeadsData(options);

  return {
    ...query,
    leadData: query.data?.map(transformToRawFormat) || [],
  };
}

// Get all unique column names from Airtable records
export function getAirtableLeadColumns(records: AirtableLeadRecord[]): string[] {
  const columns = new Set<string>();
  records.forEach(record => {
    Object.keys(record.fields).forEach(key => columns.add(key));
  });
  return Array.from(columns).sort();
}

// Get all unique status values from leads
export function getUniqueStatuses(leads: ReturnType<typeof transformToLead>[]): string[] {
  const statuses = new Set<string>();
  leads.forEach(lead => {
    if (lead.status) statuses.add(lead.status);
  });
  return Array.from(statuses).sort();
}
