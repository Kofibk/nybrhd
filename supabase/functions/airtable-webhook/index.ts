import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Table mapping: Airtable table name → Supabase table name
const TABLE_MAPPING: Record<string, string> = {
  'Users': 'profiles',
  'Companies': 'companies',
  'Subscriptions': 'subscriptions',
  'Invoices': 'invoices',
};

// Field mapping: Airtable field → Supabase column (per table)
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
    'plan_name': 'plan',
    'status': 'status',
    'monthly_price': 'monthly_fee',
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

interface AirtableWebhookPayload {
  action: 'create' | 'update' | 'delete';
  table: string;
  recordId: string;
  fields?: Record<string, unknown>;
  previousFields?: Record<string, unknown>;
}

function mapAirtableToSupabase(
  airtableTable: string,
  airtableFields: Record<string, unknown>
): { supabaseTable: string; data: Record<string, unknown> } | null {
  const supabaseTable = TABLE_MAPPING[airtableTable];
  if (!supabaseTable) {
    console.log(`No mapping found for Airtable table: ${airtableTable}`);
    return null;
  }

  const fieldMap = FIELD_MAPPING[supabaseTable];
  if (!fieldMap) {
    console.log(`No field mapping found for Supabase table: ${supabaseTable}`);
    return null;
  }

  const data: Record<string, unknown> = {};
  for (const [airtableField, supabaseColumn] of Object.entries(fieldMap)) {
    if (airtableField in airtableFields) {
      data[supabaseColumn] = airtableFields[airtableField];
    }
  }

  return { supabaseTable, data };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const payload: AirtableWebhookPayload = await req.json();
    const { action, table, recordId, fields } = payload;

    console.log(`Airtable webhook received: ${action} on ${table}, record: ${recordId}`);

    if (!table || !recordId) {
      return new Response(
        JSON.stringify({ error: 'Missing table or recordId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if we need to look up by airtable_record_id
    // First, let's see if we have a sync_metadata table
    const { data: syncRecord } = await supabase
      .from('airtable_sync')
      .select('*')
      .eq('airtable_table', table)
      .eq('airtable_record_id', recordId)
      .single();

    const mapping = fields ? mapAirtableToSupabase(table, fields) : null;

    if (action === 'delete') {
      if (syncRecord) {
        // Delete from Supabase table
        const { error } = await supabase
          .from(syncRecord.supabase_table)
          .delete()
          .eq('id', syncRecord.supabase_record_id);

        if (error) {
          console.error('Delete error:', error);
          return new Response(
            JSON.stringify({ error: 'Failed to delete record', details: error }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Remove sync record
        await supabase
          .from('airtable_sync')
          .delete()
          .eq('id', syncRecord.id);
      }

      return new Response(
        JSON.stringify({ success: true, action: 'deleted' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!mapping) {
      return new Response(
        JSON.stringify({ error: 'No mapping for this table', table }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'create' || (action === 'update' && !syncRecord)) {
      // Insert new record
      const { data: newRecord, error } = await supabase
        .from(mapping.supabaseTable)
        .insert(mapping.data)
        .select()
        .single();

      if (error) {
        console.error('Insert error:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to create record', details: error }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Create sync record
      await supabase.from('airtable_sync').insert({
        airtable_table: table,
        airtable_record_id: recordId,
        supabase_table: mapping.supabaseTable,
        supabase_record_id: newRecord.id,
      });

      return new Response(
        JSON.stringify({ success: true, action: 'created', record: newRecord }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'update' && syncRecord) {
      // Update existing record
      const { data: updatedRecord, error } = await supabase
        .from(mapping.supabaseTable)
        .update(mapping.data)
        .eq('id', syncRecord.supabase_record_id)
        .select()
        .single();

      if (error) {
        console.error('Update error:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to update record', details: error }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Update sync timestamp
      await supabase
        .from('airtable_sync')
        .update({ last_synced_at: new Date().toISOString() })
        .eq('id', syncRecord.id);

      return new Response(
        JSON.stringify({ success: true, action: 'updated', record: updatedRecord }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: 'No action taken' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Webhook error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
