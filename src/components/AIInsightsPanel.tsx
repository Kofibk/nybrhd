import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, RefreshCw, Loader2, ChevronDown, ChevronUp, Lightbulb, AlertTriangle, TrendingUp, CheckCircle } from 'lucide-react';
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
  const [isExpanded, setIsExpanded] = useState(true);
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

      // Parse the response into structured insights
      const parsedInsights = parseInsights(response?.response || '');
      setInsights(parsedInsights);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch AI insights:', error);
      toast.error('Failed to load AI insights');
    } finally {
      setIsLoading(false);
    }
  };

  const parseInsights = (text: string): Insight[] => {
    // Split by common patterns (numbered lists, bullets, or double newlines)
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

      // Extract title (first sentence) and description (rest)
      const sentences = section.split(/(?<=[.!?])\s+/);
      const title = sentences[0]?.trim() || section.substring(0, 50);
      const description = sentences.slice(1).join(' ').trim() || '';

      return { type, title, description };
    });
  };

  // Auto-fetch on mount if we have data
  useEffect(() => {
    if (hasData && insights.length === 0 && !isLoading) {
      fetchInsights();
    }
  }, [hasData]);

  const getInsightIcon = (type: Insight['type']) => {
    switch (type) {
      case 'action': return <Lightbulb className="h-4 w-4 text-primary" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'opportunity': return <TrendingUp className="h-4 w-4 text-blue-500" />;
      case 'success': return <CheckCircle className="h-4 w-4 text-success" />;
    }
  };

  const getInsightBadge = (type: Insight['type']) => {
    switch (type) {
      case 'action': return <Badge variant="default" className="text-xs">Action</Badge>;
      case 'warning': return <Badge variant="destructive" className="text-xs">Attention</Badge>;
      case 'opportunity': return <Badge variant="secondary" className="text-xs">Opportunity</Badge>;
      case 'success': return <Badge className="bg-success/10 text-success text-xs">Win</Badge>;
    }
  };

  if (!hasData) {
    return null;
  }

  return (
    <Card className={cn("shadow-card", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-sm font-semibold">AI Insights</CardTitle>
            {lastUpdated && (
              <span className="text-xs text-muted-foreground">
                Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={fetchInsights}
              disabled={isLoading}
              className="h-8 w-8 p-0"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 w-8 p-0"
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="pt-2">
          {isLoading && insights.length === 0 ? (
            <div className="flex items-center justify-center py-6 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              <span className="text-sm">Analysing your data...</span>
            </div>
          ) : insights.length > 0 ? (
            <div className="grid gap-3">
              {insights.map((insight, index) => (
                <div 
                  key={index} 
                  className="flex gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors"
                >
                  <div className="mt-0.5">{getInsightIcon(insight.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {getInsightBadge(insight.type)}
                    </div>
                    <p className="text-sm font-medium text-foreground">{insight.title}</p>
                    {insight.description && (
                      <p className="text-xs text-muted-foreground mt-1">{insight.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-sm text-muted-foreground mb-3">Click refresh to generate AI insights</p>
              <Button variant="outline" size="sm" onClick={fetchInsights}>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Insights
              </Button>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
