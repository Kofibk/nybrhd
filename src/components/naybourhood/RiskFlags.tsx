import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';

export function RiskFlags({ flags }: { flags: string[] }) {
  if (!flags.length) return <span className="text-xs text-muted-foreground">No risks flagged</span>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {flags.map((f) => (
        <Badge key={f} variant="outline" className="text-xs gap-1 border-warning/40 text-warning bg-warning/10">
          <AlertTriangle className="h-3 w-3" />
          {f}
        </Badge>
      ))}
    </div>
  );
}
