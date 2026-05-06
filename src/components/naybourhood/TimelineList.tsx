import type { TimelineEvent } from '@/lib/naybourhood/types';
import { cn } from '@/lib/utils';
import {
  MessageCircle,
  Phone,
  CheckCircle2,
  Calendar,
  FileText,
  Wallet,
  Sparkles,
  TrendingUp,
} from 'lucide-react';

const icon = (t: TimelineEvent['type']) => {
  switch (t) {
    case 'whatsapp_sent':
    case 'whatsapp_replied':
      return MessageCircle;
    case 'call':
      return Phone;
    case 'qualification_complete':
      return CheckCircle2;
    case 'viewing_booked':
      return Calendar;
    case 'aip_confirmed':
      return FileText;
    case 'funds_confirmed':
      return Wallet;
    case 'enquiry':
      return Sparkles;
    case 'score_change':
      return TrendingUp;
    default:
      return CheckCircle2;
  }
};

export function TimelineList({ events }: { events: TimelineEvent[] }) {
  const sorted = [...events].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
  return (
    <ol className="relative border-l border-border ml-2">
      {sorted.map((e) => {
        const Icon = icon(e.type);
        const date = new Date(e.at);
        return (
          <li key={e.id} className="ml-6 pb-6 last:pb-0">
            <span className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-card border border-border">
              <Icon className="h-3 w-3 text-[hsl(var(--nb-teal))]" />
            </span>
            <div className="flex items-baseline justify-between gap-2 flex-wrap">
              <p className="text-sm font-medium">{e.label}</p>
              <time className="text-xs text-muted-foreground">{date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</time>
            </div>
            {e.detail && <p className="text-xs text-muted-foreground mt-0.5">{e.detail}</p>}
            {typeof e.scoreDelta === 'number' && e.scoreDelta !== 0 && (
              <p className={cn('text-xs mt-1 font-medium', e.scoreDelta > 0 ? 'text-[hsl(var(--nb-teal))]' : 'text-destructive')}>
                Score {e.scoreDelta > 0 ? '+' : ''}
                {e.scoreDelta}
                {e.scoreAfter ? ` → ${e.scoreAfter}` : ''}
              </p>
            )}
          </li>
        );
      })}
    </ol>
  );
}
