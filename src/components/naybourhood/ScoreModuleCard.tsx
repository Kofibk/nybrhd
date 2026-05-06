import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { ModuleResult } from '@/lib/naybourhood/types';
import { cn } from '@/lib/utils';

const statusColor: Record<ModuleResult['status'], string> = {
  Strong: 'text-[hsl(var(--nb-teal))]',
  Moderate: 'text-warning',
  Weak: 'text-muted-foreground',
};

export function ScoreModuleCard({
  title,
  weightLabel,
  module,
}: {
  title: string;
  weightLabel: string;
  module: ModuleResult;
}) {
  const pct = (module.score / module.max) * 100;
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
          <p className="text-xs text-muted-foreground/70">{weightLabel}</p>
        </div>
        <span className={cn('text-xs font-medium', statusColor[module.status])}>{module.status}</span>
      </div>
      <div className="flex items-baseline gap-1 mb-3">
        <span className="text-3xl font-semibold">{module.score}</span>
        <span className="text-sm text-muted-foreground">/ {module.max}</span>
      </div>
      <Progress value={pct} className="h-1.5 mb-4" />
      <ul className="space-y-1.5">
        {module.reasons.map((r, i) => (
          <li key={i} className="text-xs text-muted-foreground flex gap-2">
            <span className="text-[hsl(var(--nb-teal))] mt-0.5">•</span>
            {r}
          </li>
        ))}
      </ul>
    </Card>
  );
}
