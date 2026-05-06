export type BuyerStatus = 'ftb' | 'homemover' | 'downsizer' | 'investor' | 'browsing';
export type SellingStatus = 'not_selling' | 'on_market' | 'under_offer' | 'sold_stc' | 'na';
export type Timeline = 'now' | '0_3' | '3_6' | '6_12' | 'unknown';
export type PurchasePurpose = 'home' | 'investment' | 'holiday' | 'dependent';
export type PaymentMethod = 'cash' | 'mortgage' | 'mixed';
export type IdentityConfidence = 'high' | 'medium' | 'low';
export type ResponseSpeed = 'fast' | 'normal' | 'slow' | 'none';
export type ScoreBand = 'Hot Lead' | 'Qualified' | 'Warm' | 'More Info Needed';

export interface TimelineEvent {
  id: string;
  at: string; // ISO
  type:
    | 'enquiry'
    | 'whatsapp_sent'
    | 'whatsapp_replied'
    | 'qualification_complete'
    | 'call'
    | 'aip_confirmed'
    | 'funds_confirmed'
    | 'viewing_booked'
    | 'note'
    | 'score_change';
  label: string;
  detail?: string;
  scoreAfter?: number;
  scoreDelta?: number;
}

export interface Lead {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  postcode: string;
  address: string;
  country: string;

  property_name: string;
  asking_price: number;
  budget: number;

  buyer_status: BuyerStatus;
  selling_status: SellingStatus;
  purchase_purpose: PurchasePurpose;
  timeline_to_buy: Timeline;
  payment_method: PaymentMethod;

  aip_confirmed: boolean;
  funds_available: boolean;
  deposit_ready: boolean;
  broker_engaged: boolean;
  chain_status: 'no_chain' | 'in_chain' | 'needs_to_sell' | 'unknown';

  viewing_booked: boolean;
  whatsapp_replied: boolean;
  qualification_complete: boolean;
  call_logged: boolean;
  response_speed: ResponseSpeed;
  last_contact_at: string;

  source: string;
  campaign: string;
  assigned_agent: string;

  email_valid: boolean;
  phone_valid: boolean;
  identity_confidence: IdentityConfidence;
  linkedin_url?: string;
  employer?: string;
  companies_house_match?: string;

  initial_score: number;
  timeline: TimelineEvent[];
}

export interface ModuleResult {
  score: number;
  max: number;
  status: 'Strong' | 'Moderate' | 'Weak';
  reasons: string[];
}

export interface ScoredLead extends Lead {
  data_confidence_score: number;
  buyer_readiness_score: number;
  financial_readiness_score: number;
  engagement_momentum_score: number;
  live_score: number;
  score_band: ScoreBand;
  modules: {
    dataConfidence: ModuleResult;
    buyerReadiness: ModuleResult;
    financialReadiness: ModuleResult;
    engagementMomentum: ModuleResult;
  };
  risk_flags: string[];
  ai_summary: string;
  recommended_actions: { text: string; type: 'automated' | 'team' }[];
}
