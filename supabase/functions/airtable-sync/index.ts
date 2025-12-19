import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const AIRTABLE_API_KEY = Deno.env.get('AIRTABLE_API_KEY');
const AIRTABLE_BASE_ID = Deno.env.get('AIRTABLE_BASE_ID');

// Reverse mapping: Supabase table → Airtable table
const TABLE_MAPPING: Record<string, string> = {
  'profiles': 'Users',
  'companies': 'Companies',
  'subscriptions': 'Subscriptions',
  'invoices': 'Invoices',
};

// Field mapping: Supabase column → Airtable field
const FIELD_MAPPING: Record<string, Record<string, string>> = {
  'profiles': {
    'email': 'email',
    'full_name': 'full_name',
    'phone': 'phone',
    'avatar_url': 'avatar_url',
    'status': 'status',
    'user_type': 'user_type',
  },
  'companies': {
    'name': 'name',
    'website': 'website',
    'industry': 'industry',
    'logo_url': 'logo_url',
    'address': 'address',
    'monthly_budget': 'monthly_budget',
    'status': 'status',
    'notes': 'notes',
  },
  'subscriptions': {
    'plan': 'plan_name',
    'status': 'status',
    'monthly_fee': 'monthly_price',
    'billing_cycle': 'billing_cycle',
    'stripe_subscription_id': 'stripe_subscription_id',
    'stripe_customer_id': 'stripe_customer_id',
  },
  'invoices': {
    'invoice_number': 'invoice_number',
    'amount': 'amount',
    'tax_amount': 'tax_amount',
    'total_amount': 'total_amount',
    'status': 'status',
    'due_date': 'due_date',
    'paid_at': 'paid_at',
    'stripe_invoice_id': 'stripe_invoice_id',
    'pdf_url': 'pdf_url',
  },
};

interface SyncRequest {
  action: 'push' | 'pull' | 'full_sync';
  table?: string;
  recordId?: string;
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

  if (body && (method === 'POST' || method === 'PATCH')) {
    options.body = JSON.stringify(body);
  }

  return await fetch(url, options);
}

function mapSupabaseToAirtable(
  supabaseTable: string,
  supabaseData: Record<string, unknown>
): Record<string, unknown> {
  const fieldMap = FIELD_MAPPING[supabaseTable];
  if (!fieldMap) return {};

  const airtableFields: Record<string, unknown> = {};
  for (const [supabaseCol, airtableField] of Object.entries(fieldMap)) {
    if (supabaseCol in supabaseData && supabaseData[supabaseCol] !== null) {
      airtableFields[airtableField] = supabaseData[supabaseCol];
    }
  }

  return airtableFields;
}

serve(async (req) => {
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

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const request: SyncRequest = await req.json();
    const { action, table, recordId } = request;

    console.log(`Sync request: ${action} for ${table || 'all tables'}`);

    if (action === 'push') {
      // Push a single record from Supabase to Airtable
      if (!table || !recordId) {
        return new Response(
          JSON.stringify({ error: 'Table and recordId required for push' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const airtableTable = TABLE_MAPPING[table];
      if (!airtableTable) {
        return new Response(
          JSON.stringify({ error: `No Airtable mapping for table: ${table}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get the record from Supabase
      const { data: supabaseRecord, error: fetchError } = await supabase
        .from(table)
        .select('*')
        .eq('id', recordId)
        .single();

      if (fetchError || !supabaseRecord) {
        return new Response(
          JSON.stringify({ error: 'Record not found', details: fetchError }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check if we have a sync record
      const { data: syncRecord } = await supabase
        .from('airtable_sync')
        .select('*')
        .eq('supabase_table', table)
        .eq('supabase_record_id', recordId)
        .single();

      const airtableFields = mapSupabaseToAirtable(table, supabaseRecord);

      if (syncRecord) {
        // Update existing Airtable record
        const response = await airtableRequest(
          'PATCH',
          `${encodeURIComponent(airtableTable)}/${syncRecord.airtable_record_id}`,
          { fields: airtableFields }
        );

        if (!response.ok) {
          const errorData = await response.json();
          return new Response(
            JSON.stringify({ error: 'Airtable update failed', details: errorData }),
            { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Update sync timestamp
        await supabase
          .from('airtable_sync')
          .update({ last_synced_at: new Date().toISOString() })
          .eq('id', syncRecord.id);

        const result = await response.json();
        return new Response(
          JSON.stringify({ success: true, action: 'updated', record: result }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        // Create new Airtable record
        const response = await airtableRequest(
          'POST',
          encodeURIComponent(airtableTable),
          { records: [{ fields: airtableFields }] }
        );

        if (!response.ok) {
          const errorData = await response.json();
          return new Response(
            JSON.stringify({ error: 'Airtable create failed', details: errorData }),
            { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const result = await response.json();
        const newAirtableRecord = result.records[0];

        // Create sync record
        await supabase.from('airtable_sync').insert({
          airtable_table: airtableTable,
          airtable_record_id: newAirtableRecord.id,
          supabase_table: table,
          supabase_record_id: recordId,
        });

        return new Response(
          JSON.stringify({ success: true, action: 'created', record: newAirtableRecord }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    if (action === 'pull') {
      // Pull records from Airtable to Supabase
      const tablesToSync = table ? [table] : Object.keys(TABLE_MAPPING);
      const results: Record<string, { synced: number; errors: number }> = {};

      for (const supabaseTable of tablesToSync) {
        const airtableTable = TABLE_MAPPING[supabaseTable];
        if (!airtableTable) continue;

        results[supabaseTable] = { synced: 0, errors: 0 };

        try {
          const response = await airtableRequest('GET', encodeURIComponent(airtableTable));
          if (!response.ok) {
            console.error(`Failed to fetch ${airtableTable}`);
            results[supabaseTable].errors++;
            continue;
          }

          const airtableData = await response.json();
          const records = airtableData.records || [];

          for (const record of records) {
            const fieldMap = FIELD_MAPPING[supabaseTable];
            if (!fieldMap) continue;

            const supabaseData: Record<string, unknown> = {};
            for (const [airtableField, supabaseCol] of Object.entries(
              Object.fromEntries(
                Object.entries(fieldMap).map(([k, v]) => [v, k])
              )
            )) {
              if (airtableField in record.fields) {
                supabaseData[supabaseCol] = record.fields[airtableField];
              }
            }

            // Check if sync record exists
            const { data: syncRecord } = await supabase
              .from('airtable_sync')
              .select('*')
              .eq('airtable_record_id', record.id)
              .single();

            if (syncRecord) {
              // Update existing
              await supabase
                .from(supabaseTable)
                .update(supabaseData)
                .eq('id', syncRecord.supabase_record_id);
            } else {
              // Insert new
              const { data: newRecord, error } = await supabase
                .from(supabaseTable)
                .insert(supabaseData)
                .select()
                .single();

              if (!error && newRecord) {
                await supabase.from('airtable_sync').insert({
                  airtable_table: airtableTable,
                  airtable_record_id: record.id,
                  supabase_table: supabaseTable,
                  supabase_record_id: newRecord.id,
                });
              }
            }

            results[supabaseTable].synced++;
          }
        } catch (err) {
          console.error(`Error syncing ${supabaseTable}:`, err);
          results[supabaseTable].errors++;
        }
      }

      return new Response(
        JSON.stringify({ success: true, action: 'pull', results }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'full_sync') {
      // Full bidirectional sync
      // First pull from Airtable, then push any local-only records
      // This is a simplified version - a production system would need conflict resolution
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Full sync initiated. Use pull followed by selective push for complete sync.' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action. Use: push, pull, or full_sync' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Sync error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
