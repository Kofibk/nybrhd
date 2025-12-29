import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Phone, 
  TrendingUp, 
  Users, 
  Target,
  Award,
  Clock,
} from "lucide-react";
import { TransformedBuyer } from "@/hooks/useAirtableData";
import { cn } from "@/lib/utils";

interface CallerPerformanceWidgetProps {
  buyers: TransformedBuyer[];
  isLoading?: boolean;
}

interface CallerStats {
  name: string;
  totalAssigned: number;
  contactPending: number;
  inProgress: number;
  converted: number;
  coldNoResponse: number;
  conversionRate: number;
  hotLeads: number;
}

export function CallerPerformanceWidget({ buyers, isLoading }: CallerPerformanceWidgetProps) {
  // Calculate caller statistics
  const callerStats = useMemo(() => {
    const statsMap = new Map<string, CallerStats>();
    
    buyers.forEach(buyer => {
      if (!buyer.assignedCaller) return;
      
      const caller = buyer.assignedCaller;
      const existing = statsMap.get(caller) || {
        name: caller,
        totalAssigned: 0,
        contactPending: 0,
        inProgress: 0,
        converted: 0,
        coldNoResponse: 0,
        conversionRate: 0,
        hotLeads: 0,
      };
      
      existing.totalAssigned++;
      
      const status = buyer.status.toLowerCase();
      if (status.includes('pending')) existing.contactPending++;
      else if (status.includes('progress') || status.includes('contacted')) existing.inProgress++;
      else if (status.includes('converted') || status.includes('won') || status.includes('sold')) existing.converted++;
      else if (status.includes('cold') || status.includes('no response')) existing.coldNoResponse++;
      
      if (buyer.intent.toLowerCase() === 'hot') existing.hotLeads++;
      
      // Calculate conversion rate
      const totalWorked = existing.converted + existing.coldNoResponse;
      existing.conversionRate = totalWorked > 0 ? (existing.converted / totalWorked) * 100 : 0;
      
      statsMap.set(caller, existing);
    });
    
    return Array.from(statsMap.values()).sort((a, b) => b.totalAssigned - a.totalAssigned);
  }, [buyers]);

  // Overall stats
  const overallStats = useMemo(() => {
    const total = buyers.length;
    const assigned = buyers.filter(b => b.assignedCaller).length;
    const unassigned = total - assigned;
    const hotLeads = buyers.filter(b => b.intent.toLowerCase() === 'hot').length;
    const inProgress = buyers.filter(b => 
      b.status.toLowerCase().includes('progress') || 
      b.status.toLowerCase().includes('contacted')
    ).length;
    const converted = buyers.filter(b => 
      b.status.toLowerCase().includes('converted') || 
      b.status.toLowerCase().includes('won') ||
      b.status.toLowerCase().includes('sold')
    ).length;
    
    return { total, assigned, unassigned, hotLeads, inProgress, converted };
  }, [buyers]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5" />
            Caller Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="h-5 w-5 text-primary" />
          Caller Performance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <Users className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
            <div className="text-2xl font-bold">{overallStats.total}</div>
            <div className="text-xs text-muted-foreground">Total Leads</div>
          </div>
          <div className="text-center p-3 bg-amber-500/10 rounded-lg">
            <Target className="h-5 w-5 mx-auto mb-1 text-amber-600" />
            <div className="text-2xl font-bold text-amber-600">{overallStats.hotLeads}</div>
            <div className="text-xs text-muted-foreground">Hot Leads</div>
          </div>
          <div className="text-center p-3 bg-blue-500/10 rounded-lg">
            <Phone className="h-5 w-5 mx-auto mb-1 text-blue-600" />
            <div className="text-2xl font-bold text-blue-600">{overallStats.inProgress}</div>
            <div className="text-xs text-muted-foreground">In Progress</div>
          </div>
          <div className="text-center p-3 bg-green-500/10 rounded-lg">
            <Award className="h-5 w-5 mx-auto mb-1 text-green-600" />
            <div className="text-2xl font-bold text-green-600">{overallStats.converted}</div>
            <div className="text-xs text-muted-foreground">Converted</div>
          </div>
        </div>

        {/* Unassigned Alert */}
        {overallStats.unassigned > 0 && (
          <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <Clock className="h-4 w-4 text-amber-600" />
            <span className="text-sm">
              <strong>{overallStats.unassigned}</strong> leads awaiting assignment
            </span>
          </div>
        )}

        {/* Caller Leaderboard */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">Caller Leaderboard</h4>
          
          {callerStats.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No callers have been assigned yet
            </p>
          ) : (
            <div className="space-y-3">
              {callerStats.slice(0, 5).map((caller, index) => (
                <div key={caller.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {index === 0 && <Badge className="bg-amber-500 text-white text-[10px]">Top</Badge>}
                      <span className="font-medium text-sm">{caller.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Badge variant="outline" className="text-[10px]">
                        {caller.totalAssigned} assigned
                      </Badge>
                      {caller.hotLeads > 0 && (
                        <Badge className="bg-red-500 text-white text-[10px]">
                          {caller.hotLeads} hot
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Progress 
                      value={caller.conversionRate} 
                      className="h-2 flex-1"
                    />
                    <span className={cn(
                      "text-xs font-medium min-w-[40px] text-right",
                      caller.conversionRate >= 50 ? "text-green-600" : 
                      caller.conversionRate >= 25 ? "text-amber-600" : "text-muted-foreground"
                    )}>
                      {caller.conversionRate.toFixed(0)}%
                    </span>
                  </div>
                  
                  <div className="flex gap-3 text-[10px] text-muted-foreground">
                    <span className="text-amber-600">{caller.contactPending} pending</span>
                    <span className="text-blue-600">{caller.inProgress} in progress</span>
                    <span className="text-green-600">{caller.converted} converted</span>
                    <span className="text-slate-500">{caller.coldNoResponse} cold</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
