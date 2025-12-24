import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useLeadScoring, LeadScoreResult } from '@/hooks/useLeadScoring';
import { Loader2, AlertTriangle, TrendingUp, Target, CheckCircle, ListChecks, ArrowRight } from 'lucide-react';

interface LeadScoringCardProps {
  lead: Record<string, any>;
  onScoreComplete?: (result: LeadScoreResult) => void;
}

export function LeadScoringCard({ lead, onScoreComplete }: LeadScoringCardProps) {
  const { scoreLead, isLoading, error } = useLeadScoring();
  const [result, setResult] = useState<LeadScoreResult | null>(null);

  const handleScore = async () => {
    const scoreResult = await scoreLead(lead);
    if (scoreResult) {
      setResult(scoreResult);
      onScoreComplete?.(scoreResult);
    }
  };

  const getPriorityColor = (priority: number | null) => {
    switch (priority) {
      case 1: return 'bg-red-500 text-white';
      case 2: return 'bg-orange-500 text-white';
      case 3: return 'bg-yellow-500 text-black';
      case 4: return 'bg-muted text-muted-foreground';
      default: return 'bg-destructive text-destructive-foreground';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-500';
    if (score >= 50) return 'text-yellow-500';
    if (score >= 30) return 'text-orange-500';
    return 'text-red-500';
  };

  const getScoreProgressColor = (score: number) => {
    if (score >= 70) return 'bg-green-500';
    if (score >= 50) return 'bg-yellow-500';
    if (score >= 30) return 'bg-orange-500';
    return 'bg-red-500';
  };

  if (!result) {
    return (
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5" />
            Lead Scoring
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Score this lead using AI-powered qualification analysis
            </p>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <Button onClick={handleScore} disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Scoring...
                </>
              ) : (
                'Score Lead'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Handle flagged leads
  if (result.status === 'flagged') {
    return (
      <Card className="border-destructive">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Review Required
            </CardTitle>
            <Badge variant="destructive">Flagged</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 bg-destructive/10 rounded-lg">
            <p className="text-sm font-medium text-destructive">Reason for Flag:</p>
            <p className="text-sm text-destructive/80">{result.reason}</p>
          </div>

          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm font-medium">Recommended Action</p>
            <p className="text-sm text-muted-foreground">{result.recommended_action}</p>
          </div>

          {result.risk_flags.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-4 w-4" />
                Risk Flags
              </h4>
              <div className="space-y-1">
                {result.risk_flags.map((flag, i) => (
                  <div key={i} className="text-sm p-2 bg-destructive/10 rounded text-destructive">
                    {flag}
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button variant="outline" onClick={handleScore} disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Re-scoring...
              </>
            ) : (
              'Re-score Lead'
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5" />
            Lead Score
          </CardTitle>
          <Badge className={getPriorityColor(result.priority)}>
            {result.priority_label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Score */}
        <div className="text-center p-4 bg-muted/50 rounded-lg">
          <div className={`text-5xl font-bold ${getScoreColor(result.score)}`}>
            {result.score}
          </div>
          <p className="text-sm text-muted-foreground mt-1">out of 100</p>
          <div className="mt-3">
            <Progress 
              value={result.score} 
              className="h-2"
              style={{ 
                // @ts-ignore
                '--progress-background': getScoreProgressColor(result.score).replace('bg-', '')
              }}
            />
          </div>
        </div>

        {/* Score Breakdown */}
        {result.score_breakdown && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <ListChecks className="h-4 w-4" />
              Score Breakdown
            </h4>
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between items-center p-2 bg-muted/30 rounded">
                <span className="text-muted-foreground">Timeline</span>
                <span className="font-medium">{result.score_breakdown.timeline}/30</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-muted/30 rounded">
                <span className="text-muted-foreground">Cash/Mortgage</span>
                <span className="font-medium">{result.score_breakdown.cash_or_mortgage}/20</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-muted/30 rounded">
                <span className="text-muted-foreground">Reason for Purchase</span>
                <span className="font-medium">{result.score_breakdown.reason_for_purchase}/20</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-muted/30 rounded">
                <span className="text-muted-foreground">Budget</span>
                <span className="font-medium">{result.score_breakdown.budget}/15</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-muted/30 rounded">
                <span className="text-muted-foreground">Contact Preference</span>
                <span className="font-medium">{result.score_breakdown.contact_preference}/10</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-muted/30 rounded">
                <span className="text-muted-foreground">LinkedIn/Website</span>
                <span className="font-medium">{result.score_breakdown.linkedin_or_website}/5</span>
              </div>
            </div>
          </div>
        )}

        {/* Modifiers Applied */}
        {result.modifiers_applied.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Modifiers Applied
            </h4>
            <div className="flex flex-wrap gap-2">
              {result.modifiers_applied.map((modifier, i) => (
                <Badge 
                  key={i} 
                  variant={modifier.includes('+') ? 'default' : 'destructive'}
                  className="text-xs"
                >
                  {modifier}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Recommended Action */}
        <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
          <p className="text-sm font-medium text-primary">Recommended Action</p>
          <p className="text-sm text-muted-foreground mt-1">{result.recommended_action}</p>
        </div>

        {/* Next Steps */}
        {result.next_steps.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Next Steps
            </h4>
            <div className="space-y-2">
              {result.next_steps.map((step, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <ArrowRight className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                  <span className="text-muted-foreground">{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Risk Flags */}
        {result.risk_flags.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-4 w-4" />
              Risk Flags
            </h4>
            <div className="space-y-1">
              {result.risk_flags.map((flag, i) => (
                <div key={i} className="text-sm p-2 bg-destructive/10 rounded text-destructive">
                  {flag}
                </div>
              ))}
            </div>
          </div>
        )}

        <Button variant="outline" onClick={handleScore} disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Re-scoring...
            </>
          ) : (
            'Re-score Lead'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
