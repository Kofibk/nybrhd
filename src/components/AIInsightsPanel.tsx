import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, RefreshCw, Loader2, ChevronRight, Lightbulb, AlertTriangle, TrendingUp, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

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
  text: string;
}

const contextPrompts: Record<string, string> = {
  leads: 'Analyse the lead data and provide exactly 3 brief insights (max 15 words each): 1) Most urgent action needed, 2) A key pattern or risk, 3) Quick win opportunity.',
  campaigns: 'Analyse the campaign data and provide exactly 3 brief insights (max 15 words each): 1) Biggest budget issue, 2) Best performing element, 3) Quick optimisation.',
  analytics: 'Provide exactly 3 brief strategic insights (max 15 words each): 1) Key trend, 2) Area needing attention, 3) Top opportunity.',
};

export function AIInsightsPanel({ context, data, className }: AIInsightsPanelProps) {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const hasData = (data.campaigns?.length || 0) > 0 || (data.leads?.length || 0) > 0;

  const fetchInsights = async () => {
    if (!hasData) return;
    
    setIsLoading(true);
    try {
      const { data: response, error } = await supabase.functions.invoke('master-agent', {
        body: {
          query: contextPrompts[context],
          context: {
            leads: data.leads?.slice(0, 10),
            campaigns: data.campaigns?.slice(0, 8),
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
    } catch (error) {
      console.error('Failed to fetch AI insights:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const parseInsights = (text: string): Insight[] => {
    const lines = text.split(/(?:\d+[\.\)]\s*|\n[-•]\s*|\n\n)/).filter(s => s.trim());
    
    return lines.slice(0, 3).map(line => {
      const lower = line.toLowerCase();
      let type: Insight['type'] = 'opportunity';
      
      if (lower.includes('urgent') || lower.includes('contact') || lower.includes('call')) {
        type = 'action';
      } else if (lower.includes('risk') || lower.includes('pause') || lower.includes('underperform')) {
        type = 'warning';
      } else if (lower.includes('excellent') || lower.includes('strong') || lower.includes('performing well')) {
        type = 'success';
      }

      return { type, text: line.trim().slice(0, 80) };
    });
  };

  useEffect(() => {
    if (hasData && insights.length === 0 && !isLoading) {
      fetchInsights();
    }
  }, [hasData]);

  const getIcon = (type: Insight['type']) => {
    const iconClass = "h-3 w-3";
    switch (type) {
      case 'action': return <Lightbulb className={cn(iconClass, "text-primary")} />;
      case 'warning': return <AlertTriangle className={cn(iconClass, "text-amber-500")} />;
      case 'opportunity': return <TrendingUp className={cn(iconClass, "text-blue-500")} />;
      case 'success': return <CheckCircle className={cn(iconClass, "text-green-500")} />;
    }
  };

  if (!hasData) return null;

  return (
    <div className={cn("flex items-center gap-2 py-2 px-3 bg-muted/30 rounded-lg border border-border/50", className)}>
      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Sparkles className="h-3.5 w-3.5 text-primary" />
        <span>AI</span>
      </div>
      
      <div className="h-4 w-px bg-border" />
      
      {isLoading ? (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>Analysing...</span>
        </div>
      ) : insights.length > 0 ? (
        <div className="flex-1 flex items-center gap-3 overflow-x-auto">
          {insights.map((insight, i) => (
            <div key={i} className="flex items-center gap-1.5 text-xs whitespace-nowrap">
              {getIcon(insight.type)}
              <span className="text-foreground/80">{insight.text}</span>
            </div>
          ))}
        </div>
      ) : (
        <span className="text-xs text-muted-foreground">Click refresh for insights</span>
      )}
      
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={fetchInsights}
        disabled={isLoading}
        className="h-6 w-6 p-0 ml-auto"
      >
        <RefreshCw className={cn("h-3 w-3", isLoading && "animate-spin")} />
      </Button>
    </div>
  );
}
