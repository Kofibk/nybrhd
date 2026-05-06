import { Badge } from '@/components/ui/badge';
import type { ScoreBand } from '@/lib/naybourhood/types';
import { cn } from '@/lib/utils';

const styles: Record<ScoreBand, string> = {
  'Hot Lead': 'bg-[hsl(var(--nb-teal)/0.15)] text-[hsl(var(--nb-teal))] border-[hsl(var(--nb-teal)/0.4)]',
  Qualified: 'bg-foreground/10 text-foreground border-foreground/30',
  Warm: 'bg-warning/15 text-warning border-warning/40',
  'More Info Needed': 'bg-muted text-muted-foreground border-border',
};

export function ScoreBadge({ band, className }: { band: ScoreBand; className?: string }) {
  return (
    <Badge variant="outline" className={cn('font-medium', styles[band], className)}>
      {band}
    </Badge>
  );
}
