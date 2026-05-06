import type { Lead, ModuleResult, ScoreBand, ScoredLead } from './types';

const status = (score: number, max: number): ModuleResult['status'] => {
  const pct = score / max;
  if (pct >= 0.75) return 'Strong';
  if (pct >= 0.5) return 'Moderate';
  return 'Weak';
};

function dataConfidence(l: Lead): ModuleResult {
  const max = 20;
  let s = 0;
  const reasons: string[] = [];
  if (l.email_valid) { s += 4; reasons.push('Deliverable email'); } else { reasons.push('Email failed validation'); }
  if (l.phone_valid) { s += 4; reasons.push('Valid phone number'); } else { reasons.push('Phone could not be validated'); }
  if (l.full_name && l.full_name.split(' ').length >= 2) { s += 4; reasons.push('Full name provided'); }
  if (l.address && l.postcode) { s += 4; reasons.push('Address and postcode present'); } else { reasons.push('Missing address or postcode'); }
  // form completeness — rough check
  const filled = [l.buyer_status, l.timeline_to_buy, l.payment_method, l.purchase_purpose].filter(Boolean).length;
  s += Math.round((filled / 4) * 4);
  if (filled === 4) reasons.push('Form fully completed');
  return { score: Math.min(s, max), max, status: status(s, max), reasons: reasons.slice(0, 3) };
}

function buyerReadiness(l: Lead): ModuleResult {
  const max = 35;
  let s = 0;
  const reasons: string[] = [];

  // buyer status (max 6)
  const bs = { ftb: 5, homemover: 6, downsizer: 6, investor: 5, browsing: 1 }[l.buyer_status];
  s += bs;
  if (l.buyer_status === 'browsing') reasons.push('Just browsing — low intent');
  else reasons.push(`Buyer status: ${l.buyer_status}`);

  // selling (max 6)
  const ss = { not_selling: 6, sold_stc: 6, under_offer: 5, on_market: 3, na: 4 }[l.selling_status];
  s += ss;
  if (l.selling_status === 'on_market') reasons.push('Property still on market — chain risk');
  if (l.selling_status === 'sold_stc' || l.selling_status === 'under_offer') reasons.push('Seller progressed — proceedable');

  // timeline (max 8)
  const t = { now: 8, '0_3': 7, '3_6': 4, '6_12': 2, unknown: 1 }[l.timeline_to_buy];
  s += t;
  if (l.timeline_to_buy === 'now' || l.timeline_to_buy === '0_3') reasons.push('Ready to buy now');
  if (l.timeline_to_buy === '6_12' || l.timeline_to_buy === 'unknown') reasons.push('Timeline distant or unknown');

  // purpose (max 4)
  s += { home: 4, investment: 4, dependent: 3, holiday: 3 }[l.purchase_purpose];

  // country match (max 3) — UK property assumed
  if (l.country.toLowerCase().includes('uk') || l.country.toLowerCase().includes('united kingdom')) {
    s += 3;
  } else {
    s += 1;
    reasons.push('Overseas buyer');
  }

  // budget vs asking (max 8)
  const ratio = l.budget / (l.asking_price || 1);
  if (ratio >= 1) { s += 8; reasons.push('Budget covers asking price'); }
  else if (ratio >= 0.9) { s += 5; reasons.push('Budget slightly below asking'); }
  else if (ratio >= 0.75) { s += 2; reasons.push('Budget well below asking'); }
  else { s += 0; reasons.push('Budget significantly below asking'); }

  return { score: Math.min(s, max), max, status: status(s, max), reasons: reasons.slice(0, 3) };
}

function financialReadiness(l: Lead): ModuleResult {
  const max = 25;
  let s = 0;
  const reasons: string[] = [];

  const pm = { cash: 8, mixed: 6, mortgage: 5 }[l.payment_method];
  s += pm;
  if (l.payment_method === 'cash') reasons.push('Cash buyer');
  else reasons.push(`Payment: ${l.payment_method}`);

  if (l.aip_confirmed) { s += 5; reasons.push('AIP confirmed'); } else if (l.payment_method !== 'cash') reasons.push('AIP not yet confirmed');
  if (l.funds_available) { s += 5; reasons.push('Funds confirmed'); }
  if (l.deposit_ready) s += 4;
  if (l.broker_engaged) s += 3;

  return { score: Math.min(s, max), max, status: status(s, max), reasons: reasons.slice(0, 3) };
}

function engagementMomentum(l: Lead): ModuleResult {
  const max = 20;
  let s = 0;
  const reasons: string[] = [];

  if (l.whatsapp_replied) { s += 4; reasons.push('Replied to WhatsApp'); }
  if (l.qualification_complete) { s += 4; reasons.push('Completed qualification'); }
  if (l.call_logged) { s += 3; reasons.push('Spoke to agent'); }
  if (l.viewing_booked) { s += 5; reasons.push('Viewing booked'); }

  const rs = { fast: 2, normal: 1, slow: 0, none: -1 }[l.response_speed];
  s += rs;
  if (l.response_speed === 'fast') reasons.push('Fast responder');
  if (l.response_speed === 'none') reasons.push('No response yet');

  // recency
  const days = (Date.now() - new Date(l.last_contact_at).getTime()) / 86400000;
  if (days <= 2) s += 2;
  else if (days <= 7) s += 1;
  else reasons.push('No recent activity');

  s = Math.max(0, Math.min(s, max));
  return { score: s, max, status: status(s, max), reasons: reasons.slice(0, 3) };
}

function bandFor(score: number): ScoreBand {
  if (score >= 86) return 'Hot Lead';
  if (score >= 71) return 'Qualified';
  if (score >= 51) return 'Warm';
  return 'More Info Needed';
}

function riskFlags(l: Lead): string[] {
  const flags: string[] = [];
  if (l.chain_status === 'in_chain') flags.push('In chain');
  if (l.chain_status === 'needs_to_sell') flags.push('Needs to sell first');
  if (l.budget < l.asking_price * 0.85) flags.push('Budget below asking');
  if (l.timeline_to_buy === '6_12' || l.timeline_to_buy === 'unknown') flags.push('Long / unknown timeline');
  if (l.response_speed === 'none' || l.response_speed === 'slow') flags.push('Low engagement');
  if (!l.email_valid || !l.phone_valid) flags.push('Invalid contact details');
  if (l.buyer_status === 'browsing') flags.push('Just browsing');
  if (l.payment_method === 'mortgage' && !l.aip_confirmed) flags.push('AIP missing');
  if (!l.qualification_complete) flags.push('More info needed');
  return flags;
}

function recommendedActions(l: Lead, band: ScoreBand): { text: string; type: 'automated' | 'team' }[] {
  const out: { text: string; type: 'automated' | 'team' }[] = [];
  if (!l.qualification_complete) out.push({ text: 'Send WhatsApp qualification flow', type: 'automated' });
  if (l.payment_method !== 'cash' && !l.aip_confirmed) out.push({ text: 'Request AIP document via secure upload', type: 'automated' });
  if (!l.viewing_booked && (band === 'Hot Lead' || band === 'Qualified')) out.push({ text: 'Book a viewing this week', type: 'team' });
  if (band === 'Hot Lead') out.push({ text: 'Call now — high-intent proceedable buyer', type: 'team' });
  if (l.chain_status === 'in_chain' || l.chain_status === 'needs_to_sell') out.push({ text: 'Confirm chain details with buyer', type: 'team' });
  if (l.response_speed === 'none') out.push({ text: 'Trigger automated re-engagement sequence', type: 'automated' });
  if (out.length < 3) out.push({ text: 'Add internal note after next contact', type: 'team' });
  return out.slice(0, 5);
}

function aiSummary(l: Lead, band: ScoreBand, score: number): string {
  const pieces: string[] = [];
  pieces.push(`${l.full_name.split(' ')[0]} is a ${l.buyer_status === 'ftb' ? 'first-time buyer' : l.buyer_status} `);
  pieces.push(`${l.payment_method === 'cash' ? 'cash buyer' : 'mortgage buyer'} `);
  pieces.push(`looking at ${l.property_name}.`);
  if (band === 'Hot Lead') pieces.push(' Highly proceedable — prioritise immediate contact.');
  else if (band === 'Qualified') pieces.push(' Strong fit; clear remaining blockers to convert.');
  else if (band === 'Warm') pieces.push(' Interest is present but needs further qualification.');
  else pieces.push(' Limited information — gather more details before prioritising.');
  return pieces.join('');
}

export function scoreLead(l: Lead): ScoredLead {
  const dc = dataConfidence(l);
  const br = buyerReadiness(l);
  const fr = financialReadiness(l);
  const em = engagementMomentum(l);
  const live = Math.max(0, Math.min(100, dc.score + br.score + fr.score + em.score));
  const band = bandFor(live);
  return {
    ...l,
    data_confidence_score: dc.score,
    buyer_readiness_score: br.score,
    financial_readiness_score: fr.score,
    engagement_momentum_score: em.score,
    live_score: live,
    score_band: band,
    modules: { dataConfidence: dc, buyerReadiness: br, financialReadiness: fr, engagementMomentum: em },
    risk_flags: riskFlags(l),
    ai_summary: aiSummary(l, band, live),
    recommended_actions: recommendedActions(l, band),
  };
}

export function scoreAll(leads: Lead[]): ScoredLead[] {
  return leads.map(scoreLead);
}
