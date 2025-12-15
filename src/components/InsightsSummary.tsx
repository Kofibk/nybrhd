import { CheckCircle, Lightbulb } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface InsightsSummaryProps {
  recommendations: string[];
  whatsWorking: string[];
  compact?: boolean;
}

export function InsightsSummary({ recommendations, whatsWorking, compact = false }: InsightsSummaryProps) {
  if (compact) {
    return (
      <div className="grid md:grid-cols-2 gap-3">
        {/* What's Working - Compact */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-green-500">
            <CheckCircle className="h-4 w-4" />
            What's Working
          </div>
          <div className="space-y-1.5">
            {whatsWorking.length > 0 ? (
              whatsWorking.slice(0, 3).map((item, i) => (
                <div key={i} className="flex items-start gap-2 text-xs p-2 rounded bg-green-500/5 border border-green-500/20">
                  <span className="font-medium text-green-500 shrink-0">{i + 1}.</span>
                  <span className="text-foreground">{item}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground">No insights yet</p>
            )}
          </div>
        </div>

        {/* Recommendations - Compact */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-primary">
            <Lightbulb className="h-4 w-4" />
            Recommendations
          </div>
          <div className="space-y-1.5">
            {recommendations.length > 0 ? (
              recommendations.slice(0, 3).map((item, i) => (
                <div key={i} className="flex items-start gap-2 text-xs p-2 rounded bg-primary/5 border border-primary/20">
                  <span className="font-medium text-primary shrink-0">{i + 1}.</span>
                  <span className="text-foreground">{item}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground">No recommendations yet</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {/* What's Working */}
      <Card className="border-green-500/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            What's Working
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {whatsWorking.length > 0 ? (
            whatsWorking.slice(0, 3).map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-green-500/5 border border-green-500/20">
                <div className="h-6 w-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-medium text-green-500">{i + 1}</span>
                </div>
                <p className="text-sm text-foreground">{item}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              Upload data to see what's working
            </p>
          )}
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card className="border-primary/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recommendations.length > 0 ? (
            recommendations.slice(0, 3).map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-medium text-primary">{i + 1}</span>
                </div>
                <p className="text-sm text-foreground">{item}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              Upload data to get recommendations
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
