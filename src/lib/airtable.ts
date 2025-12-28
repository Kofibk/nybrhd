import { supabase } from "@/integrations/supabase/client";

// Airtable table names matching the schema
export const AirtableTables = {
  USERS: 'Users',
  COMPANIES: 'Companies',
  USER_ROLES: 'User_Roles',
  DEVELOPMENTS: 'Developments',
  CAMPAIGNS: 'Campaigns',
  CAMPAIGN_DATA: 'Campaign_Data',
  CREATIVE_ASSETS: 'Creative_Assets',
  AD_COPIES: 'Ad_Copies',
  CAMPAIGN_METRICS: 'Campaign_Metrics',
  LEADS: 'Leads',
  LEAD_INTERACTIONS: 'Lead_Interactions',
  LEAD_SOURCES: 'Lead_Sources',
  AUTOMATION_SEQUENCES: 'Automation_Sequences',
  AUTOMATION_MESSAGES: 'Automation_Messages',
  SUBSCRIPTIONS: 'Subscriptions',
  INVOICES: 'Invoices',
  SETTINGS: 'Settings',
  AUDIT_LOGS: 'Audit_Logs',
  BUYERS: 'Buyers',
} as const;

export type AirtableTable = typeof AirtableTables[keyof typeof AirtableTables];

interface AirtableRecord<T = Record<string, unknown>> {
  id: string;
  fields: T;
  createdTime: string;
}

interface AirtableListResponse<T = Record<string, unknown>> {
  records: AirtableRecord<T>[];
  offset?: string;
}

interface AirtableOptions {
  filterByFormula?: string;
  sort?: Array<{ field: string; direction: 'asc' | 'desc' }>;
  maxRecords?: number;
  pageSize?: number;
  offset?: string;
  view?: string;
}

// Generic Airtable API client
async function callAirtableAPI<T = Record<string, unknown>>(
  action: 'list' | 'get' | 'create' | 'update' | 'delete',
  table: AirtableTable,
  options?: {
    recordId?: string | string[];
    data?: Record<string, unknown> | Record<string, unknown>[];
  } & AirtableOptions
): Promise<T> {
  const { data, error } = await supabase.functions.invoke('airtable-api', {
    body: {
      action,
      table,
      recordId: options?.recordId,
      data: options?.data,
      filterByFormula: options?.filterByFormula,
      sort: options?.sort,
      maxRecords: options?.maxRecords,
      pageSize: options?.pageSize,
      offset: options?.offset,
      view: options?.view,
    },
  });

  if (error) {
    console.error('Airtable API error:', error);
    throw new Error(error.message || 'Airtable API error');
  }

  return data as T;
}

// ============ USERS ============
export interface AirtableUser {
  user_id: string;
  email: string;
  full_name?: string;
  phone?: string;
  avatar_url?: string;
  user_type: 'developer' | 'agent' | 'mortgage_broker' | 'admin';
  status: 'active' | 'inactive' | 'pending';
  created_at?: string;
  updated_at?: string;
  last_login?: string;
}

export const usersAPI = {
  list: (options?: AirtableOptions) => 
    callAirtableAPI<AirtableListResponse<AirtableUser>>('list', AirtableTables.USERS, options),
  get: (recordId: string) => 
    callAirtableAPI<AirtableRecord<AirtableUser>>('get', AirtableTables.USERS, { recordId }),
  create: (data: Partial<AirtableUser>) => 
    callAirtableAPI<{ records: AirtableRecord<AirtableUser>[] }>('create', AirtableTables.USERS, { data }),
  update: (recordId: string, data: Partial<AirtableUser>) => 
    callAirtableAPI<AirtableRecord<AirtableUser>>('update', AirtableTables.USERS, { recordId, data }),
  delete: (recordId: string | string[]) => 
    callAirtableAPI('delete', AirtableTables.USERS, { recordId }),
};

// ============ COMPANIES ============
export interface AirtableCompany {
  name: string;
  website?: string;
  industry?: 'property_development' | 'estate_agency' | 'mortgage_brokerage' | 'marketing_agency';
  logo_url?: string;
  address?: string;
  phone?: string;
  subscription_tier?: 'free' | 'starter' | 'professional' | 'enterprise';
  created_at?: string;
  updated_at?: string;
}

export const companiesAPI = {
  list: (options?: AirtableOptions) => 
    callAirtableAPI<AirtableListResponse<AirtableCompany>>('list', AirtableTables.COMPANIES, options),
  get: (recordId: string) => 
    callAirtableAPI<AirtableRecord<AirtableCompany>>('get', AirtableTables.COMPANIES, { recordId }),
  create: (data: Partial<AirtableCompany>) => 
    callAirtableAPI<{ records: AirtableRecord<AirtableCompany>[] }>('create', AirtableTables.COMPANIES, { data }),
  update: (recordId: string, data: Partial<AirtableCompany>) => 
    callAirtableAPI<AirtableRecord<AirtableCompany>>('update', AirtableTables.COMPANIES, { recordId, data }),
  delete: (recordId: string | string[]) => 
    callAirtableAPI('delete', AirtableTables.COMPANIES, { recordId }),
};

// ============ DEVELOPMENTS ============
export interface AirtableDevelopment {
  name: string;
  description?: string;
  address?: string;
  city?: string;
  region?: string;
  country?: string;
  postcode?: string;
  total_units?: number;
  available_units?: number;
  price_from?: number;
  price_to?: number;
  bedrooms_min?: number;
  bedrooms_max?: number;
  status?: 'pre_launch' | 'launching' | 'live' | 'selling_fast' | 'last_units' | 'sold_out';
  property_type?: 'apartment' | 'house' | 'townhouse' | 'penthouse' | 'villa' | 'mixed';
  features?: string;
  images?: Array<{ url: string; filename: string }>;
  brochure_url?: string;
  completion_date?: string;
  created_at?: string;
  updated_at?: string;
}

export const developmentsAPI = {
  list: (options?: AirtableOptions) => 
    callAirtableAPI<AirtableListResponse<AirtableDevelopment>>('list', AirtableTables.DEVELOPMENTS, options),
  get: (recordId: string) => 
    callAirtableAPI<AirtableRecord<AirtableDevelopment>>('get', AirtableTables.DEVELOPMENTS, { recordId }),
  create: (data: Partial<AirtableDevelopment>) => 
    callAirtableAPI<{ records: AirtableRecord<AirtableDevelopment>[] }>('create', AirtableTables.DEVELOPMENTS, { data }),
  update: (recordId: string, data: Partial<AirtableDevelopment>) => 
    callAirtableAPI<AirtableRecord<AirtableDevelopment>>('update', AirtableTables.DEVELOPMENTS, { recordId, data }),
  delete: (recordId: string | string[]) => 
    callAirtableAPI('delete', AirtableTables.DEVELOPMENTS, { recordId }),
};

// ============ CAMPAIGNS ============
export interface AirtableCampaign {
  name: string;
  objective?: 'leads' | 'awareness';
  status?: 'draft' | 'pending_review' | 'active' | 'paused' | 'completed' | 'archived';
  audience_maturity?: 'cold_start' | 'warm_data' | 'verified_lookalikes';
  audience_clusters?: string;
  anti_tire_kicker_enabled?: boolean;
  target_regions?: string;
  target_countries?: string;
  target_cities?: string;
  total_budget?: number;
  daily_cap?: number;
  start_date?: string;
  end_date?: string;
  whatsapp_enabled?: boolean;
  landing_page_url?: string;
  cta_type?: string;
  lead_form_fields?: string;
  meta_pixel_id?: string;
  conversion_events?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  meta_campaign_id?: string;
  meta_adset_id?: string;
  meta_ad_ids?: string;
  created_at?: string;
  updated_at?: string;
  published_at?: string;
}

export const campaignsAPI = {
  list: (options?: AirtableOptions) => 
    callAirtableAPI<AirtableListResponse<AirtableCampaign>>('list', AirtableTables.CAMPAIGNS, options),
  get: (recordId: string) => 
    callAirtableAPI<AirtableRecord<AirtableCampaign>>('get', AirtableTables.CAMPAIGNS, { recordId }),
  create: (data: Partial<AirtableCampaign>) => 
    callAirtableAPI<{ records: AirtableRecord<AirtableCampaign>[] }>('create', AirtableTables.CAMPAIGNS, { data }),
  update: (recordId: string, data: Partial<AirtableCampaign>) => 
    callAirtableAPI<AirtableRecord<AirtableCampaign>>('update', AirtableTables.CAMPAIGNS, { recordId, data }),
  delete: (recordId: string | string[]) => 
    callAirtableAPI('delete', AirtableTables.CAMPAIGNS, { recordId }),
};

// ============ LEADS ============
export interface AirtableLead {
  full_name: string;
  email: string;
  phone?: string;
  country?: string;
  city?: string;
  budget_min?: number;
  budget_max?: number;
  bedrooms_preferred?: string;
  property_purpose?: 'investment' | 'primary_residence' | 'holiday_home' | 'buy_to_let' | 'for_children';
  purchase_timeline?: 'within_28_days' | '0_3_months' | '3_6_months' | '6_9_months' | '9_12_months' | '12_plus_months';
  payment_method?: 'cash' | 'mortgage' | 'mixed' | 'undecided';
  mortgage_approved?: boolean;
  viewing_availability?: string;
  quality_score?: number;
  quality_breakdown?: string;
  intent_score?: number;
  intent_breakdown?: string;
  combined_score?: number;
  classification?: 'hot_lead' | 'quality_lead' | 'intent_lead' | 'valid_lead' | 'cold_lead' | 'at_risk' | 'disqualified';
  lead_source?: 'meta_campaign' | 'portal' | 'direct_website' | 'email_forward' | 'introducer' | 'crm_import' | 'manual_upload';
  source_detail?: string;
  utm_data?: string;
  status?: 'new' | 'contacted' | 'engaged' | 'viewing_booked' | 'viewing_completed' | 'offer_made' | 'won' | 'lost';
  assigned_agent?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  last_interaction_at?: string;
}

export const leadsAPI = {
  list: (options?: AirtableOptions) => 
    callAirtableAPI<AirtableListResponse<AirtableLead>>('list', AirtableTables.LEADS, options),
  get: (recordId: string) => 
    callAirtableAPI<AirtableRecord<AirtableLead>>('get', AirtableTables.LEADS, { recordId }),
  create: (data: Partial<AirtableLead>) => 
    callAirtableAPI<{ records: AirtableRecord<AirtableLead>[] }>('create', AirtableTables.LEADS, { data }),
  update: (recordId: string, data: Partial<AirtableLead>) => 
    callAirtableAPI<AirtableRecord<AirtableLead>>('update', AirtableTables.LEADS, { recordId, data }),
  delete: (recordId: string | string[]) => 
    callAirtableAPI('delete', AirtableTables.LEADS, { recordId }),
};

// ============ CAMPAIGN METRICS ============
export interface AirtableCampaignMetric {
  date: string;
  impressions?: number;
  clicks?: number;
  ctr?: number;
  cpc?: number;
  cpm?: number;
  spend?: number;
  leads?: number;
  cpl?: number;
  high_intent_leads?: number;
  viewings_booked?: number;
  offers_made?: number;
  conversions?: number;
  device_breakdown?: string;
  placement_breakdown?: string;
  created_at?: string;
}

export const campaignMetricsAPI = {
  list: (options?: AirtableOptions) => 
    callAirtableAPI<AirtableListResponse<AirtableCampaignMetric>>('list', AirtableTables.CAMPAIGN_METRICS, options),
  get: (recordId: string) => 
    callAirtableAPI<AirtableRecord<AirtableCampaignMetric>>('get', AirtableTables.CAMPAIGN_METRICS, { recordId }),
  create: (data: Partial<AirtableCampaignMetric>) => 
    callAirtableAPI<{ records: AirtableRecord<AirtableCampaignMetric>[] }>('create', AirtableTables.CAMPAIGN_METRICS, { data }),
  update: (recordId: string, data: Partial<AirtableCampaignMetric>) => 
    callAirtableAPI<AirtableRecord<AirtableCampaignMetric>>('update', AirtableTables.CAMPAIGN_METRICS, { recordId, data }),
  delete: (recordId: string | string[]) => 
    callAirtableAPI('delete', AirtableTables.CAMPAIGN_METRICS, { recordId }),
};

// ============ CREATIVE ASSETS ============
export interface AirtableCreativeAsset {
  name: string;
  asset_type?: 'static_image' | 'carousel' | 'video' | 'ugc_video';
  file?: Array<{ url: string; filename: string }>;
  file_url?: string;
  thumbnail_url?: string;
  dimensions?: string;
  file_size_kb?: number;
  duration_seconds?: number;
  status?: 'uploaded' | 'processing' | 'approved' | 'rejected';
  created_at?: string;
}

export const creativeAssetsAPI = {
  list: (options?: AirtableOptions) => 
    callAirtableAPI<AirtableListResponse<AirtableCreativeAsset>>('list', AirtableTables.CREATIVE_ASSETS, options),
  get: (recordId: string) => 
    callAirtableAPI<AirtableRecord<AirtableCreativeAsset>>('get', AirtableTables.CREATIVE_ASSETS, { recordId }),
  create: (data: Partial<AirtableCreativeAsset>) => 
    callAirtableAPI<{ records: AirtableRecord<AirtableCreativeAsset>[] }>('create', AirtableTables.CREATIVE_ASSETS, { data }),
  update: (recordId: string, data: Partial<AirtableCreativeAsset>) => 
    callAirtableAPI<AirtableRecord<AirtableCreativeAsset>>('update', AirtableTables.CREATIVE_ASSETS, { recordId, data }),
  delete: (recordId: string | string[]) => 
    callAirtableAPI('delete', AirtableTables.CREATIVE_ASSETS, { recordId }),
};

// ============ AD COPIES ============
export interface AirtableAdCopy {
  headline: string;
  body_text?: string;
  cta_text?: string;
  message_angle?: 'investment' | 'lifestyle' | 'family' | 'luxury' | 'value' | 'urgency';
  variation_number?: number;
  ai_generated?: boolean;
  performance_score?: number;
  created_at?: string;
}

export const adCopiesAPI = {
  list: (options?: AirtableOptions) => 
    callAirtableAPI<AirtableListResponse<AirtableAdCopy>>('list', AirtableTables.AD_COPIES, options),
  get: (recordId: string) => 
    callAirtableAPI<AirtableRecord<AirtableAdCopy>>('get', AirtableTables.AD_COPIES, { recordId }),
  create: (data: Partial<AirtableAdCopy>) => 
    callAirtableAPI<{ records: AirtableRecord<AirtableAdCopy>[] }>('create', AirtableTables.AD_COPIES, { data }),
  update: (recordId: string, data: Partial<AirtableAdCopy>) => 
    callAirtableAPI<AirtableRecord<AirtableAdCopy>>('update', AirtableTables.AD_COPIES, { recordId, data }),
  delete: (recordId: string | string[]) => 
    callAirtableAPI('delete', AirtableTables.AD_COPIES, { recordId }),
};

// ============ LEAD INTERACTIONS ============
export interface AirtableLeadInteraction {
  interaction_type: string;
  channel?: string;
  details?: string;
  metadata?: string;
  created_at?: string;
}

export const leadInteractionsAPI = {
  list: (options?: AirtableOptions) => 
    callAirtableAPI<AirtableListResponse<AirtableLeadInteraction>>('list', AirtableTables.LEAD_INTERACTIONS, options),
  get: (recordId: string) => 
    callAirtableAPI<AirtableRecord<AirtableLeadInteraction>>('get', AirtableTables.LEAD_INTERACTIONS, { recordId }),
  create: (data: Partial<AirtableLeadInteraction>) => 
    callAirtableAPI<{ records: AirtableRecord<AirtableLeadInteraction>[] }>('create', AirtableTables.LEAD_INTERACTIONS, { data }),
  update: (recordId: string, data: Partial<AirtableLeadInteraction>) => 
    callAirtableAPI<AirtableRecord<AirtableLeadInteraction>>('update', AirtableTables.LEAD_INTERACTIONS, { recordId, data }),
  delete: (recordId: string | string[]) => 
    callAirtableAPI('delete', AirtableTables.LEAD_INTERACTIONS, { recordId }),
};

// ============ AUTOMATION SEQUENCES ============
export interface AirtableAutomationSequence {
  name: string;
  description?: string;
  trigger_type?: 'new_lead' | 'status_change' | 'score_threshold' | 'time_based' | 'manual';
  trigger_conditions?: string;
  channel?: 'email' | 'whatsapp' | 'sms';
  is_active?: boolean;
  total_enrolled?: number;
  total_completed?: number;
  created_at?: string;
  updated_at?: string;
}

export const automationSequencesAPI = {
  list: (options?: AirtableOptions) => 
    callAirtableAPI<AirtableListResponse<AirtableAutomationSequence>>('list', AirtableTables.AUTOMATION_SEQUENCES, options),
  get: (recordId: string) => 
    callAirtableAPI<AirtableRecord<AirtableAutomationSequence>>('get', AirtableTables.AUTOMATION_SEQUENCES, { recordId }),
  create: (data: Partial<AirtableAutomationSequence>) => 
    callAirtableAPI<{ records: AirtableRecord<AirtableAutomationSequence>[] }>('create', AirtableTables.AUTOMATION_SEQUENCES, { data }),
  update: (recordId: string, data: Partial<AirtableAutomationSequence>) => 
    callAirtableAPI<AirtableRecord<AirtableAutomationSequence>>('update', AirtableTables.AUTOMATION_SEQUENCES, { recordId, data }),
  delete: (recordId: string | string[]) => 
    callAirtableAPI('delete', AirtableTables.AUTOMATION_SEQUENCES, { recordId }),
};

// ============ SUBSCRIPTIONS ============
export interface AirtableSubscription {
  plan_name: 'free' | 'starter' | 'professional' | 'enterprise';
  status?: 'active' | 'cancelled' | 'past_due' | 'trialing';
  monthly_price?: number;
  billing_cycle?: 'monthly' | 'annual';
  current_period_start?: string;
  current_period_end?: string;
  trial_end?: string;
  stripe_subscription_id?: string;
  stripe_customer_id?: string;
  created_at?: string;
  updated_at?: string;
}

export const subscriptionsAPI = {
  list: (options?: AirtableOptions) => 
    callAirtableAPI<AirtableListResponse<AirtableSubscription>>('list', AirtableTables.SUBSCRIPTIONS, options),
  get: (recordId: string) => 
    callAirtableAPI<AirtableRecord<AirtableSubscription>>('get', AirtableTables.SUBSCRIPTIONS, { recordId }),
  create: (data: Partial<AirtableSubscription>) => 
    callAirtableAPI<{ records: AirtableRecord<AirtableSubscription>[] }>('create', AirtableTables.SUBSCRIPTIONS, { data }),
  update: (recordId: string, data: Partial<AirtableSubscription>) => 
    callAirtableAPI<AirtableRecord<AirtableSubscription>>('update', AirtableTables.SUBSCRIPTIONS, { recordId, data }),
  delete: (recordId: string | string[]) => 
    callAirtableAPI('delete', AirtableTables.SUBSCRIPTIONS, { recordId }),
};

// ============ INVOICES ============
export interface AirtableInvoice {
  invoice_number: string;
  amount?: number;
  tax_amount?: number;
  total_amount?: number;
  status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  due_date?: string;
  paid_at?: string;
  stripe_invoice_id?: string;
  pdf_url?: string;
  created_at?: string;
}

export const invoicesAPI = {
  list: (options?: AirtableOptions) => 
    callAirtableAPI<AirtableListResponse<AirtableInvoice>>('list', AirtableTables.INVOICES, options),
  get: (recordId: string) => 
    callAirtableAPI<AirtableRecord<AirtableInvoice>>('get', AirtableTables.INVOICES, { recordId }),
  create: (data: Partial<AirtableInvoice>) => 
    callAirtableAPI<{ records: AirtableRecord<AirtableInvoice>[] }>('create', AirtableTables.INVOICES, { data }),
  update: (recordId: string, data: Partial<AirtableInvoice>) => 
    callAirtableAPI<AirtableRecord<AirtableInvoice>>('update', AirtableTables.INVOICES, { recordId, data }),
  delete: (recordId: string | string[]) => 
    callAirtableAPI('delete', AirtableTables.INVOICES, { recordId }),
};

// ============ SETTINGS ============
export interface AirtableSetting {
  setting_key: string;
  setting_value?: string;
  setting_type?: 'general' | 'notification' | 'integration' | 'preference';
  is_encrypted?: boolean;
  updated_at?: string;
}

export const settingsAPI = {
  list: (options?: AirtableOptions) => 
    callAirtableAPI<AirtableListResponse<AirtableSetting>>('list', AirtableTables.SETTINGS, options),
  get: (recordId: string) => 
    callAirtableAPI<AirtableRecord<AirtableSetting>>('get', AirtableTables.SETTINGS, { recordId }),
  create: (data: Partial<AirtableSetting>) => 
    callAirtableAPI<{ records: AirtableRecord<AirtableSetting>[] }>('create', AirtableTables.SETTINGS, { data }),
  update: (recordId: string, data: Partial<AirtableSetting>) => 
    callAirtableAPI<AirtableRecord<AirtableSetting>>('update', AirtableTables.SETTINGS, { recordId, data }),
  delete: (recordId: string | string[]) => 
    callAirtableAPI('delete', AirtableTables.SETTINGS, { recordId }),
};

// ============ AUDIT LOGS ============
export interface AirtableAuditLog {
  action: string;
  entity_type?: string;
  entity_id?: string;
  old_values?: string;
  new_values?: string;
  ip_address?: string;
  user_agent?: string;
  created_at?: string;
}

export const auditLogsAPI = {
  list: (options?: AirtableOptions) => 
    callAirtableAPI<AirtableListResponse<AirtableAuditLog>>('list', AirtableTables.AUDIT_LOGS, options),
  create: (data: Partial<AirtableAuditLog>) => 
    callAirtableAPI<{ records: AirtableRecord<AirtableAuditLog>[] }>('create', AirtableTables.AUDIT_LOGS, { data }),
};

// ============ BUYERS ============
export interface AirtableBuyer {
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
}

export const buyersAPI = {
  list: (options?: AirtableOptions) => 
    callAirtableAPI<AirtableListResponse<AirtableBuyer>>('list', AirtableTables.BUYERS, options),
  get: (recordId: string) => 
    callAirtableAPI<AirtableRecord<AirtableBuyer>>('get', AirtableTables.BUYERS, { recordId }),
  create: (data: Partial<AirtableBuyer>) => 
    callAirtableAPI<{ records: AirtableRecord<AirtableBuyer>[] }>('create', AirtableTables.BUYERS, { data }),
  update: (recordId: string, data: Partial<AirtableBuyer>) => 
    callAirtableAPI<AirtableRecord<AirtableBuyer>>('update', AirtableTables.BUYERS, { recordId, data }),
  delete: (recordId: string | string[]) => 
    callAirtableAPI('delete', AirtableTables.BUYERS, { recordId }),
};

// Generic list function for testing any table
export async function listTable(tableName: string, options?: AirtableOptions) {
  return callAirtableAPI<AirtableListResponse>('list', tableName as AirtableTable, options);
}

// Export all APIs
export const airtable = {
  users: usersAPI,
  companies: companiesAPI,
  developments: developmentsAPI,
  campaigns: campaignsAPI,
  leads: leadsAPI,
  campaignMetrics: campaignMetricsAPI,
  creativeAssets: creativeAssetsAPI,
  adCopies: adCopiesAPI,
  leadInteractions: leadInteractionsAPI,
  automationSequences: automationSequencesAPI,
  subscriptions: subscriptionsAPI,
  invoices: invoicesAPI,
  settings: settingsAPI,
  auditLogs: auditLogsAPI,
  buyers: buyersAPI,
  listTable,
};
