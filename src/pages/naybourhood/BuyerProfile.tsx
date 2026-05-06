import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScoreBadge } from '@/components/naybourhood/ScoreBadge';
import { ScoreModuleCard } from '@/components/naybourhood/ScoreModuleCard';
import { RiskFlags } from '@/components/naybourhood/RiskFlags';
import { TimelineList } from '@/components/naybourhood/TimelineList';
import { demoLeads } from '@/lib/naybourhood/data';
import { scoreLead } from '@/lib/naybourhood/scoring';
import { ArrowLeft, ArrowRight, Bot, User, TrendingUp, TrendingDown } from 'lucide-react';

export default function BuyerProfile() {
  const { id } = useParams();
  const lead = useMemo(() => {
    const raw = demoLeads.find((l) => l.id === id);
    return raw ? scoreLead(raw) : null;
  }, [id]);

  if (!lead) {
    return (
      <div>
        <Link to="/naybourhood" className="text-sm text-muted-foreground">← Back to inbox</Link>
        <p className="mt-4">Buyer not found.</p>
      </div>
    );
  }

  const delta = lead.live_score - lead.initial_score;
  const fmt = (n: number) => `£${n.toLocaleString('en-GB')}`;

  return (
    <div className="space-y-6">
      <Link to="/naybourhood" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
        <ArrowLeft className="h-4 w-4" /> Lead inbox
      </Link>

      {/* Header */}
      <Card className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-semibold tracking-tight">{lead.full_name}</h1>
              <ScoreBadge band={lead.score_band} />
            </div>
            <p className="text-sm text-muted-foreground mt-1">{lead.property_name}</p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-xs text-muted-foreground">
              <span>Agent: <span className="text-foreground">{lead.assigned_agent}</span></span>
              <span>Source: <span className="text-foreground">{lead.source}</span></span>
              <span>Campaign: <span className="text-foreground">{lead.campaign}</span></span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Live score</p>
            <p className="text-5xl font-semibold leading-none mt-1">{lead.live_score}</p>
            <div className="flex items-center justify-end gap-1 text-xs mt-2">
              {delta >= 0 ? <TrendingUp className="h-3 w-3 text-[hsl(var(--nb-teal))]" /> : <TrendingDown className="h-3 w-3 text-destructive" />}
              <span className={delta >= 0 ? 'text-[hsl(var(--nb-teal))]' : 'text-destructive'}>
                Initial {lead.initial_score} → {lead.live_score} ({delta >= 0 ? '+' : ''}{delta})
              </span>
            </div>
            <Link to={`/naybourhood/buyer/${lead.id}/timeline`}>
              <Button variant="outline" size="sm" className="mt-3">View qualification timeline <ArrowRight className="ml-1 h-3 w-3" /></Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* Score modules */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <ScoreModuleCard title="Data Confidence" weightLabel="20% · trustworthiness" module={lead.modules.dataConfidence} />
        <ScoreModuleCard title="Buyer Readiness" weightLabel="35% · declared intent" module={lead.modules.buyerReadiness} />
        <ScoreModuleCard title="Financial Readiness" weightLabel="25% · ability to proceed" module={lead.modules.financialReadiness} />
        <ScoreModuleCard title="Engagement Momentum" weightLabel="20% · behaviour" module={lead.modules.engagementMomentum} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile + Enrichment */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">Profile & enquiry</h2>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <Field label="Email" value={lead.email} />
              <Field label="Phone" value={lead.phone} />
              <Field label="Address" value={lead.address || '—'} />
              <Field label="Country" value={lead.country} />
              <Field label="Buyer status" value={lead.buyer_status} />
              <Field label="Selling status" value={lead.selling_status.replace('_',' ')} />
              <Field label="Purpose" value={lead.purchase_purpose} />
              <Field label="Timeline to buy" value={lead.timeline_to_buy.replace('_','–')} />
              <Field label="Payment method" value={lead.payment_method} />
              <Field label="Asking price" value={fmt(lead.asking_price)} />
              <Field label="Budget" value={fmt(lead.budget)} />
              <Field label="Chain status" value={lead.chain_status.replace('_',' ')} />
            </dl>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Enrichment</h2>
              <Badge variant="outline" className="text-[10px]">Context only · not scored</Badge>
            </div>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <Field label="Email validation" value={lead.email_valid ? 'Deliverable' : 'Failed'} />
              <Field label="Phone validation" value={lead.phone_valid ? 'Valid' : 'Failed'} />
              <Field label="Identity confidence" value={lead.identity_confidence} />
              <Field label="Employer" value={lead.employer || '—'} />
              <Field label="LinkedIn" value={lead.linkedin_url || '—'} />
              <Field label="Companies House" value={lead.companies_house_match || '—'} />
            </dl>
          </Card>

          <Card className="p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">Risks & blockers</h2>
            <RiskFlags flags={lead.risk_flags} />
          </Card>
        </div>

        {/* AI panel */}
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">AI overview</h2>
            <p className="text-sm leading-relaxed">{lead.ai_summary}</p>
          </Card>

          <Card className="p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">Recommended next actions</h2>
            <div className="space-y-3">
              {lead.recommended_actions.map((a, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className={`h-7 w-7 rounded-md flex items-center justify-center flex-shrink-0 ${a.type === 'automated' ? 'bg-[hsl(var(--nb-teal)/0.15)] text-[hsl(var(--nb-teal))]' : 'bg-secondary text-foreground'}`}>
                    {a.type === 'automated' ? <Bot className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
                  </div>
                  <div>
                    <p className="text-sm">{a.text}</p>
                    <p className="text-xs text-muted-foreground">{a.type === 'automated' ? 'Naybourhood automates' : 'For your team'}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">Recent activity</h2>
            <TimelineList events={lead.timeline.slice(-5)} />
          </Card>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="capitalize">{value}</dd>
    </div>
  );
}
