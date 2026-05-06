## Naybourhood — Buyer Intelligence & Proceedability Platform

A focused build: a premium B2B SaaS dashboard for estate agents/developers that turns enquiries into proceedable buyer intelligence with a live 0–100 score.

### Scope

Build a self-contained app section under new routes (won't disturb existing admin/dashboard pages):

- `/naybourhood` → **Lead Inbox** (default)
- `/naybourhood/buyer/:id` → **Buyer Profile**
- `/naybourhood/buyer/:id/timeline` → **Qualification Timeline**

A new top-level `NaybourhoodLayout` with sidebar navigation (Inbox, Buyers, Timeline view link from a buyer). Calm fintech aesthetic — neutral/light background, subtle teal accent, generous spacing, card-based.

### 1. Data model & scoring engine (frontend, demo)

For speed and to keep scoring rules easily tweakable, the first iteration uses a **typed in-memory dataset** (`src/lib/naybourhood/data.ts`) with ~15 realistic UK buyers and a pure-function scoring engine (`src/lib/naybourhood/scoring.ts`). This makes rule tuning trivial and avoids waiting on migrations. We'll persist to Supabase in a follow-up once rules are validated.

`Lead` type contains every field listed in the prompt (contact, declared readiness, financial readiness flags, engagement flags, enrichment, scores, AI summary, recommended action, timeline events).

Scoring engine:
- `dataConfidence` (max 20): email valid, phone valid, full name, address/postcode, form completeness
- `buyerReadiness` (max 35): buyer_status, selling_status, timeline, purpose, country match, budget vs asking
- `financialReadiness` (max 25): payment_method, aip, funds, deposit, broker
- `engagementMomentum` (max 20): whatsapp_replied, qualification_complete, call_logged, viewing_booked, response_speed, recency
- `liveScore` = sum, clamped 0–100
- `band`: 86+ Hot Lead, 71–85 Qualified, 51–70 Warm, ≤50 More Info Needed
- `riskFlags[]`: chain, budget gap, long/unknown timeline, unresponsive, invalid contact, incomplete, just browsing, needs to sell first
- `recommendedActions[]`: mix of automatable (WhatsApp, request AIP) and human (call, book viewing)
- Companies House / employer surfaced as enrichment context only — does NOT add to score

Each demo lead has a hand-built `timeline[]` of events (enquiry, whatsapp, qualification, call, aip, viewing, score changes) so the timeline page feels real.

### 2. Lead Inbox page

- KPI cards row: Total leads, Hot leads, Qualified leads, Avg score, % viewing booked, % AIP confirmed
- Filters bar: score band, buyer status, payment method, timeline, viewing booked, AIP, chain risk, source/campaign, assigned agent + search
- Table rows show: name, property, initial→live score with delta, band badge, buyer status, selling status, payment, timeline, last event, risk flag chips, 1-line AI summary, next action chip
- Click row → buyer profile

### 3. Buyer Profile page

- Header: name, large live score, band badge, initial→live delta, property, agent, source/campaign
- 4 score module cards (Data Confidence, Buyer Readiness, Financial Readiness, Engagement Momentum) — each shows X/weight, status (Strong/Moderate/Weak), 2–3 reason bullets
- Sections: Profile & Enquiry, Enrichment (email/phone validation, identity confidence, employer/LinkedIn, Companies House — labeled "context only, not scored"), Risks & Blockers, AI Overview + Recommended Actions (split: "Naybourhood can automate" vs "For your team"), condensed Activity Timeline preview with link to full timeline page

### 4. Qualification Timeline page

- Recharts line chart of score over time using timeline events
- Vertical step list of milestones with score deltas (+/-) and reasons
- Outstanding info gaps panel (missing AIP, missing funds, etc.)

### Design system

- Add teal accent token (`--accent-teal`) in `index.css` alongside existing tokens (keep current monochrome luxury palette intact for the rest of the app)
- Reuse shadcn primitives (Card, Badge, Progress, Table, Tabs)
- Band badge variants: hot (teal), qualified (slate), warm (amber-muted), more-info (neutral)

### Files to create

- `src/lib/naybourhood/types.ts`
- `src/lib/naybourhood/scoring.ts`
- `src/lib/naybourhood/data.ts` (~15 buyers + timelines)
- `src/pages/naybourhood/NaybourhoodLayout.tsx`
- `src/pages/naybourhood/LeadInbox.tsx`
- `src/pages/naybourhood/BuyerProfile.tsx`
- `src/pages/naybourhood/QualificationTimeline.tsx`
- `src/components/naybourhood/ScoreBadge.tsx`
- `src/components/naybourhood/ScoreModuleCard.tsx`
- `src/components/naybourhood/RiskFlags.tsx`
- `src/components/naybourhood/KpiCard.tsx`
- `src/components/naybourhood/TimelineList.tsx`

### Files to edit

- `src/App.tsx` — add 3 new routes
- `src/index.css` — add subtle teal accent token

### Out of scope (this iteration)

- Supabase persistence for these leads (using typed demo data so rules can be tuned fast)
- Real WhatsApp/call/enrichment integrations
- Editing leads from the UI

Once you approve, I'll ship it end-to-end.