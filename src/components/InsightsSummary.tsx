import { CheckCircle, Lightbulb } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface InsightsSummaryProps {
  recommendations: string[];
  whatsWorking: string[];
  compact?: boolean;
}

// Helper to truncate text to ~50 chars
const truncate = (text: string, maxLength = 60) => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
};

export function InsightsSummary({ recommendations, whatsWorking, compact = false }: InsightsSummaryProps) {
  if (compact) {
    return (
      <div className="space-y-2">
        {/* What's Working */}
        {whatsWorking.length > 0 && (
          <div className="space-y-1">
            <span className="text-[10px] font-medium text-green-500 uppercase tracking-wide">Working</span>
            {whatsWorking.slice(0, 2).map((item, i) => (
              <p key={i} className="text-[11px] text-muted-foreground pl-2 border-l-2 border-green-500/30">
                {truncate(item)}
              </p>
            ))}
          </div>
        )}

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="space-y-1">
            <span className="text-[10px] font-medium text-primary uppercase tracking-wide">Actions</span>
            {recommendations.slice(0, 2).map((item, i) => (
              <p key={i} className="text-[11px] text-muted-foreground pl-2 border-l-2 border-primary/30">
                {truncate(item)}
              </p>
            ))}
          </div>
        )}

        {whatsWorking.length === 0 && recommendations.length === 0 && (
          <p className="text-[11px] text-muted-foreground">No insights yet</p>
        )}
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {/* What's Working */}
      <Card className="border-green-500/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            Working
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {whatsWorking.length > 0 ? (
            whatsWorking.slice(0, 3).map((item, i) => (
              <p key={i} className="text-xs text-muted-foreground pl-2 border-l-2 border-green-500/30">
                {truncate(item, 80)}
              </p>
            ))
          ) : (
            <p className="text-xs text-muted-foreground">Upload data to see insights</p>
          )}
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card className="border-primary/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-primary" />
            Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {recommendations.length > 0 ? (
            recommendations.slice(0, 3).map((item, i) => (
              <p key={i} className="text-xs text-muted-foreground pl-2 border-l-2 border-primary/30">
                {truncate(item, 80)}
              </p>
            ))
          ) : (
            <p className="text-xs text-muted-foreground">Upload data to get recommendations</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
