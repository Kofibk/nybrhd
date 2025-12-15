import { CheckCircle, Lightbulb } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface InsightsSummaryProps {
  recommendations: string[];
  whatsWorking: string[];
}

export function InsightsSummary({ recommendations, whatsWorking }: InsightsSummaryProps) {
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
