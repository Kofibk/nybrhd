import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { KpiCard } from '@/components/naybourhood/KpiCard';
import { ScoreBadge } from '@/components/naybourhood/ScoreBadge';
import { demoLeads } from '@/lib/naybourhood/data';
import { scoreAll } from '@/lib/naybourhood/scoring';
import { ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const ALL = '__all__';

export default function LeadInbox() {
  const all = useMemo(() => scoreAll(demoLeads), []);
  const [search, setSearch] = useState('');
  const [band, setBand] = useState(ALL);
  const [buyerStatus, setBuyerStatus] = useState(ALL);
  const [payment, setPayment] = useState(ALL);
  const [timeline, setTimeline] = useState(ALL);
  const [viewing, setViewing] = useState(ALL);
  const [aip, setAip] = useState(ALL);
  const [chain, setChain] = useState(ALL);

  const filtered = all.filter((l) => {
    if (search && !`${l.full_name} ${l.property_name} ${l.email}`.toLowerCase().includes(search.toLowerCase())) return false;
    if (band !== ALL && l.score_band !== band) return false;
    if (buyerStatus !== ALL && l.buyer_status !== buyerStatus) return false;
    if (payment !== ALL && l.payment_method !== payment) return false;
    if (timeline !== ALL && l.timeline_to_buy !== timeline) return false;
    if (viewing !== ALL && String(l.viewing_booked) !== viewing) return false;
    if (aip !== ALL && String(l.aip_confirmed) !== aip) return false;
    if (chain !== ALL) {
      const isChainRisk = l.chain_status === 'in_chain' || l.chain_status === 'needs_to_sell';
      if (chain === 'true' && !isChainRisk) return false;
      if (chain === 'false' && isChainRisk) return false;
    }
    return true;
  });

  const kpis = {
    total: all.length,
    hot: all.filter((l) => l.score_band === 'Hot Lead').length,
    qualified: all.filter((l) => l.score_band === 'Qualified').length,
    avg: Math.round(all.reduce((s, l) => s + l.live_score, 0) / all.length),
    viewingPct: Math.round((all.filter((l) => l.viewing_booked).length / all.length) * 100),
    aipPct: Math.round((all.filter((l) => l.aip_confirmed).length / all.length) * 100),
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Lead Inbox</h1>
        <p className="text-sm text-muted-foreground mt-1">Ranked buyer intelligence — proceedability at a glance.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <KpiCard label="Total leads" value={kpis.total} />
        <KpiCard label="Hot leads" value={kpis.hot} />
        <KpiCard label="Qualified" value={kpis.qualified} />
        <KpiCard label="Avg score" value={kpis.avg} />
        <KpiCard label="Viewing booked" value={`${kpis.viewingPct}%`} />
        <KpiCard label="AIP confirmed" value={`${kpis.aipPct}%`} />
      </div>

      <Card className="p-4">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <Input placeholder="Search name, property, email…" value={search} onChange={(e) => setSearch(e.target.value)} />
          <FilterSelect value={band} onChange={setBand} placeholder="Score band" options={['Hot Lead','Qualified','Warm','More Info Needed']} />
          <FilterSelect value={buyerStatus} onChange={setBuyerStatus} placeholder="Buyer status" options={['ftb','homemover','downsizer','investor','browsing']} />
          <FilterSelect value={payment} onChange={setPayment} placeholder="Payment method" options={['cash','mortgage','mixed']} />
          <FilterSelect value={timeline} onChange={setTimeline} placeholder="Timeline" options={['now','0_3','3_6','6_12','unknown']} />
          <FilterSelect value={viewing} onChange={setViewing} placeholder="Viewing booked" options={[['true','Yes'],['false','No']]} />
          <FilterSelect value={aip} onChange={setAip} placeholder="AIP confirmed" options={[['true','Yes'],['false','No']]} />
          <FilterSelect value={chain} onChange={setChain} placeholder="Chain risk" options={[['true','Yes'],['false','No']]} />
        </div>
      </Card>

      <div className="space-y-2">
        {filtered.map((l) => {
          const delta = l.live_score - l.initial_score;
          const lastEvent = [...l.timeline].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())[0];
          const nextAction = l.recommended_actions[0];
          return (
            <Link key={l.id} to={`/naybourhood/buyer/${l.id}`} className="block">
              <Card className="p-4 hover:border-[hsl(var(--nb-teal)/0.5)] transition-colors">
                <div className="grid gap-4 lg:grid-cols-12 items-start">
                  <div className="lg:col-span-3">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{l.full_name}</h3>
                      <ScoreBadge band={l.score_band} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{l.property_name}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {l.buyer_status} · {l.payment_method} · {l.timeline_to_buy.replace('_','–')}
                    </p>
                  </div>
                  <div className="lg:col-span-2 flex items-center gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Live score</p>
                      <p className="text-2xl font-semibold">{l.live_score}</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      {delta >= 0 ? <TrendingUp className="h-3 w-3 text-[hsl(var(--nb-teal))]" /> : <TrendingDown className="h-3 w-3 text-destructive" />}
                      <span className={delta >= 0 ? 'text-[hsl(var(--nb-teal))]' : 'text-destructive'}>
                        {delta >= 0 ? '+' : ''}{delta} from {l.initial_score}
                      </span>
                    </div>
                  </div>
                  <div className="lg:col-span-4">
                    <p className="text-sm text-foreground/90 leading-snug line-clamp-2">{l.ai_summary}</p>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {l.risk_flags.slice(0, 3).map((f) => (
                        <Badge key={f} variant="outline" className="text-[10px] py-0 h-5 border-warning/40 text-warning bg-warning/10">{f}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="lg:col-span-3">
                    <p className="text-xs text-muted-foreground">{lastEvent?.label ?? '—'}</p>
                    {nextAction && (
                      <div className="mt-1 flex items-center gap-1.5 text-xs text-[hsl(var(--nb-teal))]">
                        <ArrowRight className="h-3 w-3" />
                        <span className="line-clamp-1">{nextAction.text}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
        {filtered.length === 0 && (
          <Card className="p-8 text-center text-sm text-muted-foreground">No leads match these filters.</Card>
        )}
      </div>
    </div>
  );
}

function FilterSelect({
  value,
  onChange,
  placeholder,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: (string | [string, string])[];
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>All — {placeholder}</SelectItem>
        {options.map((o) => {
          const [v, label] = Array.isArray(o) ? o : [o, o];
          return (
            <SelectItem key={v} value={v}>{label}</SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
