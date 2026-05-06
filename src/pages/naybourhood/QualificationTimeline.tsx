import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { TimelineList } from '@/components/naybourhood/TimelineList';
import { ScoreBadge } from '@/components/naybourhood/ScoreBadge';
import { demoLeads } from '@/lib/naybourhood/data';
import { scoreLead } from '@/lib/naybourhood/scoring';
import { ArrowLeft } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, ReferenceLine, Tooltip, CartesianGrid } from 'recharts';

export default function QualificationTimeline() {
  const { id } = useParams();
  const lead = useMemo(() => {
    const raw = demoLeads.find((l) => l.id === id);
    return raw ? scoreLead(raw) : null;
  }, [id]);

  if (!lead) return <p>Buyer not found.</p>;

  const chartData = lead.timeline
    .filter((e) => typeof e.scoreAfter === 'number')
    .map((e) => ({
      date: new Date(e.at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
      score: e.scoreAfter!,
      label: e.label,
    }));

  const gaps: string[] = [];
  if (!lead.aip_confirmed && lead.payment_method !== 'cash') gaps.push('AIP not yet confirmed');
  if (!lead.funds_available) gaps.push('Funds not yet confirmed');
  if (!lead.deposit_ready) gaps.push('Deposit readiness unknown');
  if (!lead.qualification_complete) gaps.push('Qualification flow incomplete');
  if (!lead.viewing_booked) gaps.push('No viewing booked');
  if (lead.chain_status === 'unknown') gaps.push('Chain status unknown');

  return (
    <div className="space-y-6">
      <Link to={`/naybourhood/buyer/${lead.id}`} className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
        <ArrowLeft className="h-4 w-4" /> Buyer profile
      </Link>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Qualification timeline</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {lead.full_name} · <ScoreBadge band={lead.score_band} className="ml-1" />
        </p>
      </div>

      <Card className="p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">Score over time</h2>
        <div className="h-64 w-full">
          <ResponsiveContainer>
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis domain={[0, 100]} stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <Tooltip
                contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', fontSize: 12 }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <ReferenceLine y={86} stroke="hsl(var(--nb-teal))" strokeDasharray="3 3" label={{ value: 'Hot', fill: 'hsl(var(--nb-teal))', fontSize: 10 }} />
              <ReferenceLine y={71} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" label={{ value: 'Qualified', fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
              <ReferenceLine y={51} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" label={{ value: 'Warm', fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
              <Line type="monotone" dataKey="score" stroke="hsl(var(--nb-teal))" strokeWidth={2} dot={{ r: 4, fill: 'hsl(var(--nb-teal))' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">Milestones</h2>
          <TimelineList events={lead.timeline} />
        </Card>

        <Card className="p-6 h-fit">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">Information gaps</h2>
          {gaps.length === 0 ? (
            <p className="text-sm text-muted-foreground">No outstanding gaps — buyer is fully qualified.</p>
          ) : (
            <ul className="space-y-2">
              {gaps.map((g) => (
                <li key={g} className="text-sm flex gap-2">
                  <span className="text-warning mt-0.5">•</span>
                  {g}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
