import { AlertTriangle, TrendingUp, Users, PoundSterling, ArrowRight, Flame, Star, Check, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Issue {
  title: string;
  description: string;
  impact: string;
}

interface Opportunity {
  title: string;
  description: string;
  potential: string;
}

interface LeadDistribution {
  hot: number;
  quality: number;
  valid: number;
  disqualified: number;
}

interface NextAction {
  action: string;
  priority: 'high' | 'medium' | 'low';
}

export interface AnalysisResult {
  issues: Issue[];
  opportunities: Opportunity[];
  leadDistribution: LeadDistribution;
  savingsIdentified: number;
  nextActions: NextAction[];
  summary: string;
}

interface DataAnalysisProps {
  analysis: AnalysisResult;
}

export function DataAnalysis({ analysis }: DataAnalysisProps) {
  const totalLeads = analysis.leadDistribution.hot + 
    analysis.leadDistribution.quality + 
    analysis.leadDistribution.valid + 
    analysis.leadDistribution.disqualified;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card className="bg-muted/30 border-muted">
        <CardContent className="pt-6">
          <p className="text-muted-foreground leading-relaxed">{analysis.summary}</p>
        </CardContent>
      </Card>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-destructive/10 border-destructive/30">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <span className="text-sm font-medium text-destructive">Issues</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{analysis.issues.length}</p>
          </CardContent>
        </Card>

        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium text-green-500">Opportunities</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{analysis.opportunities.length}</p>
          </CardContent>
        </Card>

        <Card className="bg-primary/10 border-primary/30">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Leads</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{totalLeads}</p>
          </CardContent>
        </Card>

        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 mb-2">
              <PoundSterling className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-medium text-amber-500">Savings</span>
            </div>
            <p className="text-2xl font-bold text-foreground">£{analysis.savingsIdentified.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Lead Distribution */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Lead Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-3">
            <div className="text-center p-3 rounded-lg bg-orange-500/10">
              <Flame className="h-6 w-6 text-orange-500 mx-auto mb-1" />
              <p className="text-2xl font-bold text-foreground">{analysis.leadDistribution.hot}</p>
              <p className="text-xs text-muted-foreground">Hot</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-yellow-500/10">
              <Star className="h-6 w-6 text-yellow-500 mx-auto mb-1" />
              <p className="text-2xl font-bold text-foreground">{analysis.leadDistribution.quality}</p>
              <p className="text-xs text-muted-foreground">Quality</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-blue-500/10">
              <Check className="h-6 w-6 text-blue-500 mx-auto mb-1" />
              <p className="text-2xl font-bold text-foreground">{analysis.leadDistribution.valid}</p>
              <p className="text-xs text-muted-foreground">Valid</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted">
              <X className="h-6 w-6 text-muted-foreground mx-auto mb-1" />
              <p className="text-2xl font-bold text-foreground">{analysis.leadDistribution.disqualified}</p>
              <p className="text-xs text-muted-foreground">Disqualified</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Issues */}
      {analysis.issues.length > 0 && (
        <Card className="border-destructive/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Campaign Issues
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {analysis.issues.map((issue, i) => (
              <div key={i} className="p-4 rounded-lg bg-destructive/5 border border-destructive/20">
                <h4 className="font-medium text-foreground">{issue.title}</h4>
                <p className="text-sm text-muted-foreground mt-1">{issue.description}</p>
                <Badge variant="destructive" className="mt-2">{issue.impact}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Opportunities */}
      {analysis.opportunities.length > 0 && (
        <Card className="border-green-500/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {analysis.opportunities.map((opp, i) => (
              <div key={i} className="p-4 rounded-lg bg-green-500/5 border border-green-500/20">
                <h4 className="font-medium text-foreground">{opp.title}</h4>
                <p className="text-sm text-muted-foreground mt-1">{opp.description}</p>
                <Badge className="mt-2 bg-green-500/20 text-green-500 hover:bg-green-500/30">{opp.potential}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Next Actions */}
      {analysis.nextActions.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Next Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analysis.nextActions.map((action, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <ArrowRight className={`h-4 w-4 ${
                    action.priority === 'high' ? 'text-destructive' :
                    action.priority === 'medium' ? 'text-amber-500' : 'text-muted-foreground'
                  }`} />
                  <span className="text-foreground">{action.action}</span>
                  <Badge variant="outline" className="ml-auto text-xs">
                    {action.priority}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
