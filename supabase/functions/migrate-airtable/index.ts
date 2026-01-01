import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AirtableRecord {
  id: string;
  fields: Record<string, unknown>;
  createdTime: string;
}

interface AirtableResponse {
  records: AirtableRecord[];
  offset?: string;
}

// Fetch all records from an Airtable table with pagination
async function fetchAllAirtableRecords(
  baseId: string,
  tableName: string,
  apiKey: string
): Promise<AirtableRecord[]> {
  const allRecords: AirtableRecord[] = [];
  let offset: string | undefined;

  do {
    const url = new URL(`https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`);
    url.searchParams.set('pageSize', '100');
    if (offset) {
      url.searchParams.set('offset', offset);
    }

    console.log(`Fetching from ${tableName}, offset: ${offset || 'none'}`);

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Airtable API error: ${response.status} - ${error}`);
    }

    const data: AirtableResponse = await response.json();
    allRecords.push(...data.records);
    offset = data.offset;

    console.log(`Fetched ${data.records.length} records, total: ${allRecords.length}`);
  } while (offset);

  return allRecords;
}

// Transform Airtable buyer record to Supabase format
function transformBuyer(record: AirtableRecord) {
  const f = record.fields;
  
  // Extract assigned caller name
  let assignedCaller = '';
  if (Array.isArray(f['Assigned Caller']) && f['Assigned Caller'].length > 0) {
    const caller = f['Assigned Caller'][0] as Record<string, unknown>;
    assignedCaller = String(caller?.name || caller?.email || '');
  } else if (typeof f['Assigned Caller'] === 'string') {
    assignedCaller = f['Assigned Caller'];
  }

  // Parse budget range to min/max
  let budgetMin: number | null = null;
  let budgetMax: number | null = null;
  const budgetRange = f['Budget Range'] as string;
  if (budgetRange) {
    const match = budgetRange.match(/£?([\d.]+)\s*-\s*£?([\d.]+)\s*(Million|K)?/i);
    if (match) {
      const multiplier = match[3]?.toLowerCase() === 'million' ? 1000000 : 
                         match[3]?.toLowerCase() === 'k' ? 1000 : 1;
      budgetMin = parseFloat(match[1]) * multiplier;
      budgetMax = parseFloat(match[2]) * multiplier;
    }
  }

  // Extract bedrooms
  let bedrooms: number | null = null;
  if (Array.isArray(f['Preferred Bedrooms']) && f['Preferred Bedrooms'].length > 0) {
    bedrooms = parseInt(String(f['Preferred Bedrooms'][0]), 10) || null;
  }

  return {
    airtable_record_id: record.id,
    lead_id: f['Lead ID'] as number || null,
    name: f['Lead Name'] as string || null,
    first_name: f['first_name'] as string || null,
    last_name: f['last_name'] as string || null,
    email: f['Email'] as string || null,
    phone: f['Phone Number'] as string || null,
    country: f['Country'] as string || null,
    budget_range: budgetRange || null,
    budget_min: budgetMin,
    budget_max: budgetMax,
    bedrooms: bedrooms,
    quality_score: f['Score'] as number || 50,
    intent_score: f['Score'] as number || 50,
    intent: f['Intent'] as string || null,
    status: f['Status'] as string || 'Contact Pending',
    assigned_caller: assignedCaller || null,
    development_name: f['Development Name'] as string || null,
    payment_method: f['Cash/Mortgage'] as string || null,
    source: f['Source'] as string || 'Airtable',
    date_added: f['Date Added'] ? new Date(f['Date Added'] as string).toISOString() : null,
    notes: f['Notes'] as string || null,
  };
}

// Transform Airtable campaign record to Supabase format
function transformCampaign(record: AirtableRecord) {
  const f = record.fields;
  
  // Get thumbnail URL if available
  let thumbnailUrl: string | null = null;
  if (Array.isArray(f['Thumbnail']) && f['Thumbnail'].length > 0) {
    const thumb = f['Thumbnail'][0] as Record<string, unknown>;
    thumbnailUrl = thumb?.url as string || null;
  }

  return {
    airtable_record_id: record.id,
    campaign_id: f['Campaign ID'] as string || null,
    campaign_name: f['Campaign Name'] as string || null,
    ad_set_id: f['Ad Set ID'] as string || null,
    ad_set_name: f['Ad Set Name'] as string || null,
    ad_id: f['Ad ID'] as string || null,
    ad_name: f['Ad Name'] as string || null,
    impressions: f['Impressions'] as number || 0,
    reach: f['Reach'] as number || 0,
    clicks: f['Clicks'] as number || 0,
    link_clicks: f['Link Clicks'] as number || 0,
    lpv: f['LPV'] as number || 0,
    video_plays: f['Video Plays'] as number || 0,
    page_likes: f['Page Likes'] as number || 0,
    post_engagement: f['Post Engagement'] as number || 0,
    total_spent: f['Total Spent'] as number || 0,
    cpc: f['CPC'] as number || null,
    cpm: f['CPM'] as number || null,
    ctr: f['CTR'] as number || null,
    cost_per_lpv: f['Cost per LPV'] as number || null,
    frequency: f['Frequency'] as number || null,
    platform: f['Platform'] as string || null,
    format: f['Format'] as string || null,
    delivery_status: f['Delivery Status'] as string || null,
    headline: f['Headline'] as string || null,
    primary_text: f['Primary Text'] as string || null,
    destination_url: f['Destination URL'] as string || null,
    thumbnail_url: thumbnailUrl,
    date: f['Date'] as string || null,
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const AIRTABLE_API_KEY = Deno.env.get('AIRTABLE_API_KEY');
    const AIRTABLE_BASE_ID = Deno.env.get('AIRTABLE_BASE_ID');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
      throw new Error('Missing Airtable credentials');
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing Supabase credentials');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { tables = ['buyers', 'campaigns'] } = await req.json().catch(() => ({}));

    const results: Record<string, { migrated: number; errors: number; details?: string }> = {};

    // Migrate Buyers
    if (tables.includes('buyers')) {
      console.log('Starting Buyers migration...');
      try {
        const buyerRecords = await fetchAllAirtableRecords(AIRTABLE_BASE_ID, 'Buyers', AIRTABLE_API_KEY);
        console.log(`Fetched ${buyerRecords.length} buyer records from Airtable`);

        let migrated = 0;
        let errors = 0;

        // Process in batches of 50
        const batchSize = 50;
        for (let i = 0; i < buyerRecords.length; i += batchSize) {
          const batch = buyerRecords.slice(i, i + batchSize);
          const transformedBatch = batch.map(transformBuyer);

          const { error } = await supabase
            .from('buyers')
            .upsert(transformedBatch, { 
              onConflict: 'airtable_record_id',
              ignoreDuplicates: false 
            });

          if (error) {
            console.error(`Batch error at ${i}:`, error);
            errors += batch.length;
          } else {
            migrated += batch.length;
          }
        }

        results.buyers = { migrated, errors };
        console.log(`Buyers migration complete: ${migrated} migrated, ${errors} errors`);
      } catch (err) {
        console.error('Buyers migration failed:', err);
        results.buyers = { migrated: 0, errors: 1, details: String(err) };
      }
    }

    // Migrate Campaign Data
    if (tables.includes('campaigns')) {
      console.log('Starting Campaign Data migration...');
      try {
        const campaignRecords = await fetchAllAirtableRecords(AIRTABLE_BASE_ID, 'Previous Campaign Data', AIRTABLE_API_KEY);
        console.log(`Fetched ${campaignRecords.length} campaign records from Airtable`);

        let migrated = 0;
        let errors = 0;

        // Process in batches of 50
        const batchSize = 50;
        for (let i = 0; i < campaignRecords.length; i += batchSize) {
          const batch = campaignRecords.slice(i, i + batchSize);
          const transformedBatch = batch.map(transformCampaign);

          const { error } = await supabase
            .from('campaign_data')
            .upsert(transformedBatch, { 
              onConflict: 'airtable_record_id',
              ignoreDuplicates: false 
            });

          if (error) {
            console.error(`Batch error at ${i}:`, error);
            errors += batch.length;
          } else {
            migrated += batch.length;
          }
        }

        results.campaigns = { migrated, errors };
        console.log(`Campaign Data migration complete: ${migrated} migrated, ${errors} errors`);
      } catch (err) {
        console.error('Campaign Data migration failed:', err);
        results.campaigns = { migrated: 0, errors: 1, details: String(err) };
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        results,
        message: `Migration complete. Buyers: ${results.buyers?.migrated || 0}, Campaigns: ${results.campaigns?.migrated || 0}`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Migration error:', error);
    return new Response(
      JSON.stringify({ success: false, error: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
