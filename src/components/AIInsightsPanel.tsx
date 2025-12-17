import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, RefreshCw, Loader2, ChevronRight, Lightbulb, AlertTriangle, TrendingUp, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface AIInsightsPanelProps {
  context: 'leads' | 'campaigns' | 'analytics';
  data: {
    campaigns?: any[];
    leads?: any[];
  };
  className?: string;
}

interface Insight {
  type: 'action' | 'warning' | 'opportunity' | 'success';
  title: string;
  description: string;
}

const contextPrompts: Record<string, string> = {
  leads: 'Analyse the lead data and provide 3-4 actionable insights: identify hot leads to contact immediately, leads at risk of going cold, and any patterns in lead quality. Keep each insight to 1-2 sentences.',
  campaigns: 'Analyse the campaign data and provide 3-4 actionable insights: identify underperforming campaigns to pause, budget reallocation opportunities, and which campaigns are performing well. Keep each insight to 1-2 sentences.',
  analytics: 'Provide a strategic overview with 3-4 key insights: overall performance trends, areas needing attention, opportunities for improvement, and wins to celebrate. Keep each insight to 1-2 sentences.',
};

export function AIInsightsPanel({ context, data, className }: AIInsightsPanelProps) {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const hasData = (data.campaigns?.length || 0) > 0 || (data.leads?.length || 0) > 0;

  const fetchInsights = async () => {
    if (!hasData) return;
    
    setIsLoading(true);
    try {
      const { data: response, error } = await supabase.functions.invoke('master-agent', {
        body: {
          query: contextPrompts[context],
          context: {
            leads: data.leads?.slice(0, 15),
            campaigns: data.campaigns?.slice(0, 10),
          }
        }
      });

      if (error) throw error;
      
      if (response?.rateLimited) {
        toast.info('AI is temporarily busy. Please try again shortly.');
        return;
      }

      const parsedInsights = parseInsights(response?.response || '');
      setInsights(parsedInsights);
      setLastUpdated(new Date());
      setIsExpanded(true);
    } catch (error) {
      console.error('Failed to fetch AI insights:', error);
      toast.error('Failed to load AI insights');
    } finally {
      setIsLoading(false);
    }
  };

  const parseInsights = (text: string): Insight[] => {
    const sections = text.split(/(?:\d+\.\s|\n-\s|\n\n)/).filter(s => s.trim());
    
    return sections.slice(0, 4).map(section => {
      const lowerSection = section.toLowerCase();
      let type: Insight['type'] = 'opportunity';
      
      if (lowerSection.includes('urgent') || lowerSection.includes('immediately') || lowerSection.includes('contact')) {
        type = 'action';
      } else if (lowerSection.includes('warning') || lowerSection.includes('risk') || lowerSection.includes('underperform') || lowerSection.includes('pause')) {
        type = 'warning';
      } else if (lowerSection.includes('excellent') || lowerSection.includes('well') || lowerSection.includes('success') || lowerSection.includes('strong')) {
        type = 'success';
      }

      const sentences = section.split(/(?<=[.!?])\s+/);
      const title = sentences[0]?.trim() || section.substring(0, 50);
      const description = sentences.slice(1).join(' ').trim() || '';

      return { type, title, description };
    });
  };

  useEffect(() => {
    if (hasData && insights.length === 0 && !isLoading) {
      fetchInsights();
    }
  }, [hasData]);

  const getInsightStyles = (type: Insight['type']) => {
    switch (type) {
      case 'action': return { icon: Lightbulb, bg: 'bg-primary/5 border-primary/20', text: 'text-primary' };
      case 'warning': return { icon: AlertTriangle, bg: 'bg-destructive/5 border-destructive/20', text: 'text-destructive' };
      case 'opportunity': return { icon: TrendingUp, bg: 'bg-blue-500/5 border-blue-500/20', text: 'text-blue-600' };
      case 'success': return { icon: CheckCircle, bg: 'bg-emerald-500/5 border-emerald-500/20', text: 'text-emerald-600' };
    }
  };

  if (!hasData) return null;

  return (
    <div className={cn("border-b border-border/50 bg-muted/30", className)}>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <div className="flex items-center justify-between px-4 py-2">
          <CollapsibleTrigger asChild>
            <button className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              <ChevronRight className={cn("h-4 w-4 transition-transform", isExpanded && "rotate-90")} />
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span>AI Insights</span>
              {insights.length > 0 && !isExpanded && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                  {insights.length}
                </Badge>
              )}
              {lastUpdated && (
                <span className="text-xs text-muted-foreground/70 ml-2">
                  {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </button>
          </CollapsibleTrigger>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={(e) => { e.stopPropagation(); fetchInsights(); }}
            disabled={isLoading}
            className="h-7 px-2 text-xs"
          >
            {isLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <>
                <RefreshCw className="h-3.5 w-3.5 mr-1" />
                Refresh
              </>
            )}
          </Button>
        </div>
        
        <CollapsibleContent>
          <div className="px-4 pb-3">
            {isLoading && insights.length === 0 ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Analysing your data...</span>
              </div>
            ) : insights.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {insights.map((insight, index) => {
                  const styles = getInsightStyles(insight.type);
                  const Icon = styles.icon;
                  return (
                    <div 
                      key={index} 
                      className={cn(
                        "group relative flex items-start gap-2 px-3 py-2 rounded-lg border text-sm max-w-sm",
                        styles.bg
                      )}
                    >
                      <Icon className={cn("h-4 w-4 mt-0.5 shrink-0", styles.text)} />
                      <div className="min-w-0">
                        <p className="font-medium text-foreground leading-tight line-clamp-2">
                          {insight.title}
                        </p>
                        {insight.description && (
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                            {insight.description}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <Button variant="ghost" size="sm" onClick={fetchInsights} className="h-8 text-xs">
                <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                Generate Insights
              </Button>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
