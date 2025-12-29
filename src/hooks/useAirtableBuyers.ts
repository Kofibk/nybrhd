import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Interface for Buyers Airtable records
export interface AirtableBuyerRecord {
  id: string;
  fields: {
    'Lead ID'?: number;
    'Lead Name'?: string;
    'first_name'?: string;
    'last_name'?: string;
    'Email'?: string;
    'Phone Number'?: string;
    'Budget Range'?: string;
    'Preferred Bedrooms'?: string;
    'Preferred Location'?: string;
    'Country'?: string;
    'Timeline to Purchase'?: string;
    'Cash/Mortgage'?: string;
    'Purpose for Purchase'?: string;
    'Score'?: number;
    'Intent'?: string;
    'Status'?: string;
    'Assigned Caller'?: string;
    'Preferred Communication'?: string;
    'Buyer Summary'?: string;
    'Development Name'?: string;
    [key: string]: unknown;
  };
  createdTime: string;
}

interface AirtableResponse {
  records: AirtableBuyerRecord[];
  offset?: string;
}

// Fetch all Buyers records from Airtable with pagination
async function fetchBuyersRecords(): Promise<AirtableBuyerRecord[]> {
  const allRecords: AirtableBuyerRecord[] = [];
  let offset: string | undefined;

  do {
    const { data, error } = await supabase.functions.invoke('airtable-api', {
      body: {
        action: 'list',
        table: 'Buyers',
        pageSize: 100,
        offset,
        sort: [{ field: 'Score', direction: 'desc' }],
      },
    });

    if (error) {
      console.error('Airtable Buyers fetch error:', error);
      throw new Error(error.message || 'Failed to fetch Buyers from Airtable');
    }

    const response = data as AirtableResponse;
    console.log('Airtable Buyers response:', response?.records?.length, 'records, offset:', response?.offset);
    allRecords.push(...(response?.records || []));
    offset = response?.offset;
  } while (offset);

  console.log('Total Airtable buyers fetched:', allRecords.length);
  return allRecords;
}

// Transform Airtable buyer record for the table
export function transformBuyerForTable(record: AirtableBuyerRecord) {
  const fields = record.fields;
  
  // Handle Assigned Caller - might be a string, object, or array (linked record)
  let assignedCaller = '';
  const rawCaller = fields['Assigned Caller'] as unknown;
  if (rawCaller) {
    if (typeof rawCaller === 'string') {
      assignedCaller = rawCaller;
    } else if (Array.isArray(rawCaller)) {
      // Linked records return an array of record IDs or objects
      assignedCaller = (rawCaller as unknown[]).map((c) => 
        typeof c === 'string' ? c : ((c as Record<string, unknown>)?.name || (c as Record<string, unknown>)?.email || (c as Record<string, unknown>)?.id || '')
      ).filter(Boolean).join(', ') as string;
    } else if (typeof rawCaller === 'object' && rawCaller !== null) {
      // Object with name/email/id
      const obj = rawCaller as Record<string, unknown>;
      assignedCaller = String(obj?.name || obj?.email || obj?.id || '');
    }
  }
  
  return {
    id: record.id,
    leadId: fields['Lead ID'] || 0,
    name: fields['Lead Name'] || `${fields['first_name'] || ''} ${fields['last_name'] || ''}`.trim() || 'Unknown',
    firstName: fields['first_name'] || '',
    lastName: fields['last_name'] || '',
    email: fields['Email'] || '',
    phone: fields['Phone Number'] || '',
    budgetRange: fields['Budget Range'] || '',
    bedrooms: fields['Preferred Bedrooms'] || '',
    location: fields['Preferred Location'] || '',
    country: fields['Country'] || '',
    timeline: fields['Timeline to Purchase'] || '',
    paymentMethod: fields['Cash/Mortgage'] || '',
    purpose: fields['Purpose for Purchase'] || '',
    score: fields['Score'] || 0,
    intent: fields['Intent'] || '',
    status: fields['Status'] || 'Contact Pending',
    assignedCaller,
    preferredComm: fields['Preferred Communication'] || '',
    summary: fields['Buyer Summary'] || '',
    development: fields['Development Name'] || '',
    createdTime: record.createdTime,
    rawFields: fields,
  };
}

export type TransformedBuyer = ReturnType<typeof transformBuyerForTable>;

type AirtableBuyersHooksOptions = {
  enabled?: boolean;
  autoRefresh?: boolean;
};

// React Query hook to fetch Buyers with auto-refresh
export function useAirtableBuyersData(options: AirtableBuyersHooksOptions = {}) {
  const autoRefresh = options.autoRefresh ?? true;
  
  return useQuery({
    queryKey: ['airtable-buyers-data'],
    queryFn: fetchBuyersRecords,
    staleTime: autoRefresh ? 60 * 1000 : 5 * 60 * 1000,
    refetchOnWindowFocus: autoRefresh,
    refetchInterval: autoRefresh ? 2 * 60 * 1000 : false,
    enabled: options.enabled ?? true,
  });
}

// Hook that returns transformed buyers for the table
export function useAirtableBuyersForTable(options: AirtableBuyersHooksOptions = {}) {
  const query = useAirtableBuyersData(options);

  return {
    ...query,
    buyers: query.data?.map(transformBuyerForTable) || [],
  };
}

// Hook for updating a buyer in Airtable
export function useUpdateAirtableBuyer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ recordId, data }: { recordId: string; data: Partial<AirtableBuyerRecord['fields']> }) => {
      const { data: result, error } = await supabase.functions.invoke('airtable-api', {
        body: {
          action: 'update',
          table: 'Buyers',
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
      queryClient.invalidateQueries({ queryKey: ['airtable-buyers-data'] });
      queryClient.invalidateQueries({ queryKey: ['airtable', 'buyers'] });
    },
  });
}

// Get all unique status values from buyers
export function getUniqueBuyerStatuses(buyers: TransformedBuyer[]): string[] {
  const statuses = new Set<string>();
  buyers.forEach(buyer => {
    if (buyer.status) statuses.add(buyer.status);
  });
  return Array.from(statuses).sort();
}

// Get all unique assigned callers
export function getUniqueCallers(buyers: TransformedBuyer[]): string[] {
  const callers = new Set<string>();
  buyers.forEach(buyer => {
    if (buyer.assignedCaller) callers.add(buyer.assignedCaller);
  });
  return Array.from(callers).sort();
}
