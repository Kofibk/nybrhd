import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useLeadScoring, LeadScoreResult } from '@/hooks/useLeadScoring';
import { Loader2, AlertTriangle, Clock, TrendingUp, Target, User, Zap } from 'lucide-react';

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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'immediate': return 'bg-red-500';
      case 'today': return 'bg-orange-500';
      case 'this_week': return 'bg-yellow-500';
      case 'nurture': return 'bg-muted';
      default: return 'bg-muted';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
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

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <span className="text-2xl">{result.classification_icon}</span>
            {result.classification}
          </CardTitle>
          <Badge className={getPriorityColor(result.follow_up_priority)}>
            {result.follow_up_priority.replace('_', ' ')}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Scores */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Quality Score</span>
              <span className={`text-xl font-bold ${getScoreColor(result.quality_score)}`}>
                {result.quality_score}
              </span>
            </div>
            <Progress value={result.quality_score} className="h-2" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Intent Score</span>
              <span className={`text-xl font-bold ${getScoreColor(result.intent_score)}`}>
                {result.intent_score}
              </span>
            </div>
            <Progress value={result.intent_score} className="h-2" />
          </div>
        </div>

        {/* Quality Breakdown */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <User className="h-4 w-4" />
            Quality Breakdown
          </h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Financial</span>
              <span>{result.quality_breakdown.financial}/35</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Property Match</span>
              <span>{result.quality_breakdown.property_match}/25</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Credentials</span>
              <span>{result.quality_breakdown.credentials}/25</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Operational Fit</span>
              <span>{result.quality_breakdown.operational_fit}/15</span>
            </div>
            {result.quality_breakdown.penalties !== 0 && (
              <div className="flex justify-between col-span-2 text-destructive">
                <span>Penalties</span>
                <span>{result.quality_breakdown.penalties}</span>
              </div>
            )}
          </div>
        </div>

        {/* Intent Breakdown */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Intent Breakdown
          </h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Timeline</span>
              <span>{result.intent_breakdown.timeline_commitment}/40</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Form Completion</span>
              <span>{result.intent_breakdown.form_completion}/20</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Responsiveness</span>
              <span>{result.intent_breakdown.responsiveness}/40</span>
            </div>
          </div>
        </div>

        {/* SLA */}
        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            <span className="font-medium">Response SLA:</span> {result.sla}
          </span>
        </div>

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
                  <span className="font-medium capitalize">{flag.type.replace('_', ' ')}:</span> {flag.detail}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Missing Fields */}
        {result.missing_fields.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Missing Information</h4>
            <div className="flex flex-wrap gap-1">
              {result.missing_fields.map((field, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  {field}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        <div className="space-y-3 pt-3 border-t border-border">
          <div className="space-y-1">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Improvement Potential
            </h4>
            <p className="text-sm text-muted-foreground">{result.score_improvement_potential}</p>
          </div>
          <div className="p-3 bg-primary/10 rounded-lg">
            <p className="text-sm font-medium">Recommended Action</p>
            <p className="text-sm text-muted-foreground">{result.recommended_next_action}</p>
          </div>
        </div>

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
