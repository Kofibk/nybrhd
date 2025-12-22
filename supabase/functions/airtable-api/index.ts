import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const AIRTABLE_API_KEY = Deno.env.get('AIRTABLE_API_KEY');
const AIRTABLE_BASE_ID = Deno.env.get('AIRTABLE_BASE_ID');

interface AirtableRequest {
  action: 'list' | 'get' | 'create' | 'update' | 'delete';
  table: string;
  recordId?: string;
  data?: Record<string, unknown>;
  filterByFormula?: string;
  sort?: Array<{ field: string; direction: 'asc' | 'desc' }>;
  maxRecords?: number;
  pageSize?: number;
  offset?: string;
  view?: string;
}

async function airtableRequest(
  method: string,
  endpoint: string,
  body?: unknown
): Promise<Response> {
  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${endpoint}`;
  
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
    'Content-Type': 'application/json',
  };

  const options: RequestInit = {
    method,
    headers,
  };

  if (body && (method === 'POST' || method === 'PATCH' || method === 'PUT')) {
    options.body = JSON.stringify(body);
  }

  console.log(`Airtable ${method} request to: ${endpoint}`);
  return await fetch(url, options);
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
      return new Response(
        JSON.stringify({ error: 'Airtable credentials not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const request: AirtableRequest = await req.json();
    const { action, table, recordId, data, filterByFormula, sort, maxRecords, pageSize, offset, view } = request;

    if (!table) {
      return new Response(
        JSON.stringify({ error: 'Table name is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let response: Response;

    // Backwards-compatible table name aliases (prevents hard failures if UI uses an older table name)
    const tableAliases: Record<string, string> = {
      // Legacy campaigns table name used in earlier UI versions
      Campaign_Date: 'Campaign_Data',
    };

    const resolvedTable = tableAliases[table] ?? table;
    const encodedTable = encodeURIComponent(resolvedTable);

    switch (action) {
      case 'list': {
        // Build query parameters
        const params = new URLSearchParams();
        if (filterByFormula) params.append('filterByFormula', filterByFormula);
        if (maxRecords) params.append('maxRecords', maxRecords.toString());
        if (pageSize) params.append('pageSize', pageSize.toString());
        if (offset) params.append('offset', offset);
        if (view) params.append('view', view);
        if (sort) {
          sort.forEach((s, i) => {
            params.append(`sort[${i}][field]`, s.field);
            params.append(`sort[${i}][direction]`, s.direction);
          });
        }
        
        const queryString = params.toString();
        const endpoint = queryString ? `${encodedTable}?${queryString}` : encodedTable;
        response = await airtableRequest('GET', endpoint);
        break;
      }

      case 'get': {
        if (!recordId) {
          return new Response(
            JSON.stringify({ error: 'Record ID is required for get action' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        response = await airtableRequest('GET', `${encodedTable}/${recordId}`);
        break;
      }

      case 'create': {
        if (!data) {
          return new Response(
            JSON.stringify({ error: 'Data is required for create action' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        // Support batch create (up to 10 records)
        const records = Array.isArray(data) 
          ? data.map(fields => ({ fields }))
          : [{ fields: data }];
        
        response = await airtableRequest('POST', encodedTable, { records });
        break;
      }

      case 'update': {
        if (!recordId || !data) {
          return new Response(
            JSON.stringify({ error: 'Record ID and data are required for update action' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        response = await airtableRequest('PATCH', `${encodedTable}/${recordId}`, { fields: data });
        break;
      }

      case 'delete': {
        if (!recordId) {
          return new Response(
            JSON.stringify({ error: 'Record ID is required for delete action' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        // Support batch delete (up to 10 records)
        if (Array.isArray(recordId)) {
          const params = recordId.map(id => `records[]=${id}`).join('&');
          response = await airtableRequest('DELETE', `${encodedTable}?${params}`);
        } else {
          response = await airtableRequest('DELETE', `${encodedTable}/${recordId}`);
        }
        break;
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action. Use: list, get, create, update, delete' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    const responseData = await response.json();

    if (!response.ok) {
      console.error('Airtable API error:', responseData);
      return new Response(
        JSON.stringify({ error: 'Airtable API error', details: responseData }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify(responseData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in airtable-api function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
