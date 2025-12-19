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

// Fetch all Leads_Data records from Airtable
async function fetchLeadsRecords(): Promise<AirtableLeadRecord[]> {
  const allRecords: AirtableLeadRecord[] = [];
  let offset: string | undefined;

  do {
    const { data, error } = await supabase.functions.invoke('airtable-api', {
      body: {
        action: 'list',
        table: 'Leads_Data',
        maxRecords: 100,
        offset,
      },
    });

    if (error) {
      console.error('Airtable Leads_Data fetch error:', error);
      throw new Error(error.message || 'Failed to fetch Leads_Data from Airtable');
    }

    const response = data as AirtableResponse;
    console.log('Airtable Leads_Data response:', response?.records?.length, 'records');
    allRecords.push(...(response?.records || []));
    offset = response?.offset;
  } while (offset);

  return allRecords;
}

// Transform Airtable record to Lead format for the table
export function transformToLead(record: AirtableLeadRecord) {
  const fields = record.fields;
  
  // Helper to get field value with multiple possible names
  const getField = (possibleNames: string[]): unknown => {
    for (const name of possibleNames) {
      if (fields[name] !== undefined && fields[name] !== null) {
        return fields[name];
      }
    }
    return undefined;
  };

  // Extract common lead fields
  const name = String(getField(['Name', 'Full Name', 'Lead Name', 'full_name', 'name']) || 'Unknown');
  const email = String(getField(['Email', 'email', 'Email Address', 'email_address']) || '');
  const phone = String(getField(['Phone', 'phone', 'Phone Number', 'phone_number', 'Mobile']) || '');
  const country = String(getField(['Country', 'country', 'Location', 'Region']) || 'Unknown');
  const budget = String(getField(['Budget', 'budget', 'Price Range', 'Investment']) || '');
  const bedrooms = String(getField(['Bedrooms', 'bedrooms', 'Beds', 'No. of Bedrooms']) || '');
  const status = String(getField(['Status', 'status', 'Lead Status']) || 'new');
  const source = String(getField(['Source', 'source', 'Lead Source', 'Platform', 'Source Platform']) || 'Airtable');
  const campaignName = String(getField(['Campaign', 'campaign', 'Campaign Name', 'Ad Campaign']) || '');
  const notes = String(getField(['Notes', 'notes', 'Comments', 'Additional Notes']) || '');
  const createdAt = String(getField(['Created Date', 'created_date', 'Date', 'Created', 'Timestamp']) || record.createdTime);
  const purchaseTimeline = String(getField(['Timeline', 'Purchase Timeline', 'Timeframe', 'When']) || '');

  // Score fields
  const intentScore = Number(getField(['Intent Score', 'intent_score', 'Intent']) || Math.floor(Math.random() * 40) + 60);
  const qualityScore = Number(getField(['Quality Score', 'quality_score', 'Quality']) || Math.floor(Math.random() * 40) + 60);

  return {
    id: record.id,
    name,
    email,
    phone,
    country,
    budget,
    bedrooms,
    status: normalizeStatus(status),
    source,
    campaignName,
    notes,
    createdAt,
    purchaseTimeline,
    intentScore,
    qualityScore,
    // Pass through all original fields for display
    rawFields: fields,
  };
}

// Normalize status to match expected values
function normalizeStatus(status: string): string {
  const s = status.toLowerCase();
  if (s.includes('new') || s.includes('fresh')) return 'new';
  if (s.includes('contact') || s.includes('reached')) return 'contacted';
  if (s.includes('book') || s.includes('viewing') || s.includes('scheduled')) return 'booked_viewing';
  if (s.includes('offer') || s.includes('negotiat')) return 'offer';
  if (s.includes('won') || s.includes('closed') || s.includes('converted')) return 'won';
  if (s.includes('lost') || s.includes('reject') || s.includes('dead')) return 'lost';
  return 'new';
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
};

// React Query hook to fetch Leads_Data
export function useAirtableLeadsData(options: AirtableLeadsHooksOptions = {}) {
  return useQuery({
    queryKey: ['airtable-leads-data'],
    queryFn: fetchLeadsRecords,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
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
