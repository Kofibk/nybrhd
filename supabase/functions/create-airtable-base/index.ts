import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Complete Airtable schema for Naybourhood.ai
const airtableSchema = {
  "name": "Naybourhood.ai Production Database",
  "tables": [
    {
      "name": "Users",
      "fields": [
        { "name": "user_id", "type": "singleLineText" },
        { "name": "email", "type": "email" },
        { "name": "full_name", "type": "singleLineText" },
        { "name": "phone", "type": "phoneNumber" },
        { "name": "avatar_url", "type": "url" },
        { "name": "user_type", "type": "singleSelect", "options": { "choices": [{ "name": "developer" }, { "name": "agent" }, { "name": "mortgage_broker" }, { "name": "admin" }] } },
        { "name": "status", "type": "singleSelect", "options": { "choices": [{ "name": "active" }, { "name": "inactive" }, { "name": "pending" }] } },
        { "name": "created_at", "type": "dateTime" },
        { "name": "updated_at", "type": "dateTime" },
        { "name": "last_login", "type": "dateTime" }
      ]
    },
    {
      "name": "Companies",
      "fields": [
        { "name": "name", "type": "singleLineText" },
        { "name": "website", "type": "url" },
        { "name": "industry", "type": "singleSelect", "options": { "choices": [{ "name": "property_development" }, { "name": "estate_agency" }, { "name": "mortgage_brokerage" }, { "name": "marketing_agency" }] } },
        { "name": "logo_url", "type": "url" },
        { "name": "address", "type": "multilineText" },
        { "name": "phone", "type": "phoneNumber" },
        { "name": "subscription_tier", "type": "singleSelect", "options": { "choices": [{ "name": "free" }, { "name": "starter" }, { "name": "professional" }, { "name": "enterprise" }] } },
        { "name": "created_at", "type": "dateTime" },
        { "name": "updated_at", "type": "dateTime" }
      ]
    },
    {
      "name": "User_Roles",
      "fields": [
        { "name": "role_name", "type": "singleSelect", "options": { "choices": [{ "name": "owner" }, { "name": "admin" }, { "name": "manager" }, { "name": "agent" }, { "name": "viewer" }] } },
        { "name": "permissions", "type": "multilineText" },
        { "name": "created_at", "type": "dateTime" }
      ]
    },
    {
      "name": "Developments",
      "fields": [
        { "name": "name", "type": "singleLineText" },
        { "name": "description", "type": "multilineText" },
        { "name": "address", "type": "singleLineText" },
        { "name": "city", "type": "singleLineText" },
        { "name": "region", "type": "singleLineText" },
        { "name": "country", "type": "singleLineText" },
        { "name": "postcode", "type": "singleLineText" },
        { "name": "total_units", "type": "number" },
        { "name": "available_units", "type": "number" },
        { "name": "price_from", "type": "currency", "options": { "precision": 0, "symbol": "£" } },
        { "name": "price_to", "type": "currency", "options": { "precision": 0, "symbol": "£" } },
        { "name": "bedrooms_min", "type": "number" },
        { "name": "bedrooms_max", "type": "number" },
        { "name": "status", "type": "singleSelect", "options": { "choices": [{ "name": "pre_launch" }, { "name": "launching" }, { "name": "live" }, { "name": "selling_fast" }, { "name": "last_units" }, { "name": "sold_out" }] } },
        { "name": "property_type", "type": "singleSelect", "options": { "choices": [{ "name": "apartment" }, { "name": "house" }, { "name": "townhouse" }, { "name": "penthouse" }, { "name": "villa" }, { "name": "mixed" }] } },
        { "name": "features", "type": "multilineText" },
        { "name": "images", "type": "multipleAttachments" },
        { "name": "brochure_url", "type": "url" },
        { "name": "completion_date", "type": "date" },
        { "name": "created_at", "type": "dateTime" },
        { "name": "updated_at", "type": "dateTime" }
      ]
    },
    {
      "name": "Campaigns",
      "fields": [
        { "name": "name", "type": "singleLineText" },
        { "name": "objective", "type": "singleSelect", "options": { "choices": [{ "name": "leads" }, { "name": "awareness" }] } },
        { "name": "status", "type": "singleSelect", "options": { "choices": [{ "name": "draft" }, { "name": "pending_review" }, { "name": "active" }, { "name": "paused" }, { "name": "completed" }, { "name": "archived" }] } },
        { "name": "audience_maturity", "type": "singleSelect", "options": { "choices": [{ "name": "cold_start" }, { "name": "warm_data" }, { "name": "verified_lookalikes" }] } },
        { "name": "audience_clusters", "type": "multilineText" },
        { "name": "anti_tire_kicker_enabled", "type": "checkbox" },
        { "name": "target_regions", "type": "multilineText" },
        { "name": "target_countries", "type": "multilineText" },
        { "name": "target_cities", "type": "multilineText" },
        { "name": "total_budget", "type": "currency", "options": { "precision": 2, "symbol": "£" } },
        { "name": "daily_cap", "type": "currency", "options": { "precision": 2, "symbol": "£" } },
        { "name": "start_date", "type": "date" },
        { "name": "end_date", "type": "date" },
        { "name": "whatsapp_enabled", "type": "checkbox" },
        { "name": "landing_page_url", "type": "url" },
        { "name": "cta_type", "type": "singleSelect", "options": { "choices": [{ "name": "learn_more" }, { "name": "book_viewing" }, { "name": "submit_offer" }, { "name": "book_consultation" }, { "name": "request_callback" }, { "name": "download_brochure" }] } },
        { "name": "lead_form_fields", "type": "multilineText" },
        { "name": "meta_pixel_id", "type": "singleLineText" },
        { "name": "conversion_events", "type": "multilineText" },
        { "name": "utm_source", "type": "singleLineText" },
        { "name": "utm_medium", "type": "singleLineText" },
        { "name": "utm_campaign", "type": "singleLineText" },
        { "name": "utm_content", "type": "singleLineText" },
        { "name": "utm_term", "type": "singleLineText" },
        { "name": "meta_campaign_id", "type": "singleLineText" },
        { "name": "meta_adset_id", "type": "singleLineText" },
        { "name": "meta_ad_ids", "type": "multilineText" },
        { "name": "created_at", "type": "dateTime" },
        { "name": "updated_at", "type": "dateTime" },
        { "name": "published_at", "type": "dateTime" }
      ]
    },
    {
      "name": "Creative_Assets",
      "fields": [
        { "name": "name", "type": "singleLineText" },
        { "name": "asset_type", "type": "singleSelect", "options": { "choices": [{ "name": "static_image" }, { "name": "carousel" }, { "name": "video" }, { "name": "ugc_video" }] } },
        { "name": "file", "type": "multipleAttachments" },
        { "name": "file_url", "type": "url" },
        { "name": "thumbnail_url", "type": "url" },
        { "name": "dimensions", "type": "singleLineText" },
        { "name": "file_size_kb", "type": "number" },
        { "name": "duration_seconds", "type": "number" },
        { "name": "status", "type": "singleSelect", "options": { "choices": [{ "name": "uploaded" }, { "name": "processing" }, { "name": "approved" }, { "name": "rejected" }] } },
        { "name": "created_at", "type": "dateTime" }
      ]
    },
    {
      "name": "Ad_Copies",
      "fields": [
        { "name": "headline", "type": "singleLineText" },
        { "name": "body_text", "type": "multilineText" },
        { "name": "cta_text", "type": "singleLineText" },
        { "name": "message_angle", "type": "singleSelect", "options": { "choices": [{ "name": "investment" }, { "name": "lifestyle" }, { "name": "family" }, { "name": "luxury" }, { "name": "value" }, { "name": "urgency" }] } },
        { "name": "variation_number", "type": "number" },
        { "name": "ai_generated", "type": "checkbox" },
        { "name": "performance_score", "type": "number" },
        { "name": "created_at", "type": "dateTime" }
      ]
    },
    {
      "name": "Campaign_Metrics",
      "fields": [
        { "name": "date", "type": "date" },
        { "name": "impressions", "type": "number" },
        { "name": "clicks", "type": "number" },
        { "name": "ctr", "type": "percent" },
        { "name": "cpc", "type": "currency", "options": { "precision": 2, "symbol": "£" } },
        { "name": "cpm", "type": "currency", "options": { "precision": 2, "symbol": "£" } },
        { "name": "spend", "type": "currency", "options": { "precision": 2, "symbol": "£" } },
        { "name": "leads", "type": "number" },
        { "name": "cpl", "type": "currency", "options": { "precision": 2, "symbol": "£" } },
        { "name": "high_intent_leads", "type": "number" },
        { "name": "viewings_booked", "type": "number" },
        { "name": "offers_made", "type": "number" },
        { "name": "conversions", "type": "number" },
        { "name": "device_breakdown", "type": "multilineText" },
        { "name": "placement_breakdown", "type": "multilineText" },
        { "name": "created_at", "type": "dateTime" }
      ]
    },
    {
      "name": "Leads",
      "fields": [
        { "name": "full_name", "type": "singleLineText" },
        { "name": "email", "type": "email" },
        { "name": "phone", "type": "phoneNumber" },
        { "name": "country", "type": "singleLineText" },
        { "name": "city", "type": "singleLineText" },
        { "name": "budget_min", "type": "currency", "options": { "precision": 0, "symbol": "£" } },
        { "name": "budget_max", "type": "currency", "options": { "precision": 0, "symbol": "£" } },
        { "name": "bedrooms_preferred", "type": "singleLineText" },
        { "name": "property_purpose", "type": "singleSelect", "options": { "choices": [{ "name": "investment" }, { "name": "primary_residence" }, { "name": "holiday_home" }, { "name": "buy_to_let" }, { "name": "for_children" }] } },
        { "name": "purchase_timeline", "type": "singleSelect", "options": { "choices": [{ "name": "within_28_days" }, { "name": "0_3_months" }, { "name": "3_6_months" }, { "name": "6_9_months" }, { "name": "9_12_months" }, { "name": "12_plus_months" }] } },
        { "name": "payment_method", "type": "singleSelect", "options": { "choices": [{ "name": "cash" }, { "name": "mortgage" }, { "name": "mixed" }, { "name": "undecided" }] } },
        { "name": "mortgage_approved", "type": "checkbox" },
        { "name": "viewing_availability", "type": "multilineText" },
        { "name": "quality_score", "type": "number" },
        { "name": "quality_breakdown", "type": "multilineText" },
        { "name": "intent_score", "type": "number" },
        { "name": "intent_breakdown", "type": "multilineText" },
        { "name": "combined_score", "type": "number" },
        { "name": "classification", "type": "singleSelect", "options": { "choices": [{ "name": "hot_lead" }, { "name": "quality_lead" }, { "name": "intent_lead" }, { "name": "valid_lead" }, { "name": "cold_lead" }, { "name": "at_risk" }, { "name": "disqualified" }] } },
        { "name": "lead_source", "type": "singleSelect", "options": { "choices": [{ "name": "meta_campaign" }, { "name": "portal" }, { "name": "direct_website" }, { "name": "email_forward" }, { "name": "introducer" }, { "name": "crm_import" }, { "name": "manual_upload" }] } },
        { "name": "source_detail", "type": "singleLineText" },
        { "name": "utm_data", "type": "multilineText" },
        { "name": "status", "type": "singleSelect", "options": { "choices": [{ "name": "new" }, { "name": "contacted" }, { "name": "engaged" }, { "name": "viewing_booked" }, { "name": "viewing_completed" }, { "name": "offer_made" }, { "name": "won" }, { "name": "lost" }] } },
        { "name": "assigned_agent", "type": "singleLineText" },
        { "name": "notes", "type": "multilineText" },
        { "name": "created_at", "type": "dateTime" },
        { "name": "updated_at", "type": "dateTime" },
        { "name": "last_interaction_at", "type": "dateTime" }
      ]
    },
    {
      "name": "Lead_Interactions",
      "fields": [
        { "name": "interaction_type", "type": "singleSelect", "options": { "choices": [{ "name": "form_submission" }, { "name": "email_sent" }, { "name": "email_opened" }, { "name": "email_clicked" }, { "name": "whatsapp_sent" }, { "name": "whatsapp_replied" }, { "name": "call_made" }, { "name": "call_answered" }, { "name": "viewing_scheduled" }, { "name": "viewing_completed" }, { "name": "brochure_downloaded" }, { "name": "page_visited" }, { "name": "video_watched" }] } },
        { "name": "channel", "type": "singleSelect", "options": { "choices": [{ "name": "meta_ad" }, { "name": "email" }, { "name": "whatsapp" }, { "name": "phone" }, { "name": "website" }, { "name": "in_person" }] } },
        { "name": "details", "type": "multilineText" },
        { "name": "metadata", "type": "multilineText" },
        { "name": "created_at", "type": "dateTime" }
      ]
    },
    {
      "name": "Lead_Sources",
      "fields": [
        { "name": "source_type", "type": "singleSelect", "options": { "choices": [{ "name": "portal" }, { "name": "website" }, { "name": "email" }, { "name": "introducer" }, { "name": "crm" }] } },
        { "name": "source_name", "type": "singleLineText" },
        { "name": "webhook_url", "type": "url" },
        { "name": "api_key", "type": "singleLineText" },
        { "name": "configuration", "type": "multilineText" },
        { "name": "is_active", "type": "checkbox" },
        { "name": "leads_imported", "type": "number" },
        { "name": "last_sync_at", "type": "dateTime" },
        { "name": "created_at", "type": "dateTime" }
      ]
    },
    {
      "name": "Automation_Sequences",
      "fields": [
        { "name": "name", "type": "singleLineText" },
        { "name": "description", "type": "multilineText" },
        { "name": "trigger_type", "type": "singleSelect", "options": { "choices": [{ "name": "new_lead" }, { "name": "status_change" }, { "name": "score_threshold" }, { "name": "time_based" }, { "name": "manual" }] } },
        { "name": "trigger_conditions", "type": "multilineText" },
        { "name": "channel", "type": "singleSelect", "options": { "choices": [{ "name": "email" }, { "name": "whatsapp" }, { "name": "sms" }] } },
        { "name": "is_active", "type": "checkbox" },
        { "name": "total_enrolled", "type": "number" },
        { "name": "total_completed", "type": "number" },
        { "name": "created_at", "type": "dateTime" },
        { "name": "updated_at", "type": "dateTime" }
      ]
    },
    {
      "name": "Automation_Messages",
      "fields": [
        { "name": "step_number", "type": "number" },
        { "name": "delay_hours", "type": "number" },
        { "name": "subject", "type": "singleLineText" },
        { "name": "content", "type": "multilineText" },
        { "name": "template_variables", "type": "multilineText" },
        { "name": "is_ai_generated", "type": "checkbox" },
        { "name": "sent_count", "type": "number" },
        { "name": "open_rate", "type": "percent" },
        { "name": "click_rate", "type": "percent" },
        { "name": "reply_rate", "type": "percent" },
        { "name": "created_at", "type": "dateTime" }
      ]
    },
    {
      "name": "Subscriptions",
      "fields": [
        { "name": "plan_name", "type": "singleSelect", "options": { "choices": [{ "name": "free" }, { "name": "starter" }, { "name": "professional" }, { "name": "enterprise" }] } },
        { "name": "status", "type": "singleSelect", "options": { "choices": [{ "name": "active" }, { "name": "cancelled" }, { "name": "past_due" }, { "name": "trialing" }] } },
        { "name": "monthly_price", "type": "currency", "options": { "precision": 2, "symbol": "£" } },
        { "name": "billing_cycle", "type": "singleSelect", "options": { "choices": [{ "name": "monthly" }, { "name": "annual" }] } },
        { "name": "current_period_start", "type": "date" },
        { "name": "current_period_end", "type": "date" },
        { "name": "trial_end", "type": "date" },
        { "name": "stripe_subscription_id", "type": "singleLineText" },
        { "name": "stripe_customer_id", "type": "singleLineText" },
        { "name": "created_at", "type": "dateTime" },
        { "name": "updated_at", "type": "dateTime" }
      ]
    },
    {
      "name": "Invoices",
      "fields": [
        { "name": "invoice_number", "type": "singleLineText" },
        { "name": "amount", "type": "currency", "options": { "precision": 2, "symbol": "£" } },
        { "name": "tax_amount", "type": "currency", "options": { "precision": 2, "symbol": "£" } },
        { "name": "total_amount", "type": "currency", "options": { "precision": 2, "symbol": "£" } },
        { "name": "status", "type": "singleSelect", "options": { "choices": [{ "name": "draft" }, { "name": "sent" }, { "name": "paid" }, { "name": "overdue" }, { "name": "cancelled" }] } },
        { "name": "due_date", "type": "date" },
        { "name": "paid_at", "type": "dateTime" },
        { "name": "stripe_invoice_id", "type": "singleLineText" },
        { "name": "pdf_url", "type": "url" },
        { "name": "created_at", "type": "dateTime" }
      ]
    },
    {
      "name": "Settings",
      "fields": [
        { "name": "setting_key", "type": "singleLineText" },
        { "name": "setting_value", "type": "multilineText" },
        { "name": "setting_type", "type": "singleSelect", "options": { "choices": [{ "name": "general" }, { "name": "notification" }, { "name": "integration" }, { "name": "preference" }] } },
        { "name": "is_encrypted", "type": "checkbox" },
        { "name": "updated_at", "type": "dateTime" }
      ]
    },
    {
      "name": "Audit_Logs",
      "fields": [
        { "name": "action", "type": "singleLineText" },
        { "name": "entity_type", "type": "singleLineText" },
        { "name": "entity_id", "type": "singleLineText" },
        { "name": "old_values", "type": "multilineText" },
        { "name": "new_values", "type": "multilineText" },
        { "name": "ip_address", "type": "singleLineText" },
        { "name": "user_agent", "type": "singleLineText" },
        { "name": "created_at", "type": "dateTime" }
      ]
    }
  ]
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { apiKey, workspaceId } = await req.json();

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'Airtable API key is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Creating Airtable base with schema...');

    // Step 1: Create the base
    const createBaseResponse = await fetch('https://api.airtable.com/v0/meta/bases', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: airtableSchema.name,
        workspaceId: workspaceId || undefined,
        tables: airtableSchema.tables.map(table => ({
          name: table.name,
          fields: table.fields.map(field => {
            const fieldConfig: any = {
              name: field.name,
              type: field.type,
            };
            if (field.options) {
              fieldConfig.options = field.options;
            }
            return fieldConfig;
          }),
        })),
      }),
    });

    if (!createBaseResponse.ok) {
      const errorText = await createBaseResponse.text();
      console.error('Airtable API error:', errorText);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to create Airtable base', 
          details: errorText 
        }),
        { status: createBaseResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const baseData = await createBaseResponse.json();
    console.log('Base created successfully:', baseData.id);

    return new Response(
      JSON.stringify({
        success: true,
        baseId: baseData.id,
        baseUrl: `https://airtable.com/${baseData.id}`,
        message: `Successfully created Airtable base "${airtableSchema.name}" with ${airtableSchema.tables.length} tables`,
        tables: airtableSchema.tables.map(t => t.name),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error creating Airtable base:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
