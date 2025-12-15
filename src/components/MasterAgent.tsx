import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Brain, 
  Send, 
  Loader2, 
  AlertCircle, 
  TrendingUp, 
  Calendar,
  Target,
  PieChart
} from 'lucide-react';
import { useMasterAgent, MasterAgentContext } from '@/hooks/useMasterAgent';
import { useUploadedData } from '@/contexts/DataContext';

interface Message {
  role: 'user' | 'agent';
  content: string;
  timestamp: Date;
}

export function MasterAgent() {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const { askAgent, getDailyBriefing, getPipelineForecast, getMarketInsights, getBudgetRecommendations, isLoading, error } = useMasterAgent();
  const { campaignData, leadData } = useUploadedData();

  const buildContext = (): MasterAgentContext => {
    const context: MasterAgentContext = {};
    
    if (leadData && leadData.length > 0) {
      context.leads = leadData;
    }
    
    if (campaignData && campaignData.length > 0) {
      context.campaigns = campaignData;
    }
    
    return context;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: query,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setQuery('');

    const response = await askAgent(query, buildContext());
    
    if (response) {
      const agentMessage: Message = {
        role: 'agent',
        content: response.response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, agentMessage]);
    }
  };

  const handleQuickAction = async (action: string) => {
    const context = buildContext();
    let response;
    let queryText = '';

    switch (action) {
      case 'briefing':
        queryText = "Give me today's daily briefing";
        response = await getDailyBriefing(context);
        break;
      case 'pipeline':
        queryText = "Pipeline forecast";
        response = await getPipelineForecast(context);
        break;
      case 'insights':
        queryText = "Market insights";
        response = await getMarketInsights(context);
        break;
      case 'budget':
        queryText = "Budget recommendations";
        response = await getBudgetRecommendations(context);
        break;
      default:
        return;
    }

    setMessages(prev => [...prev, { role: 'user', content: queryText, timestamp: new Date() }]);
    
    if (response) {
      setMessages(prev => [...prev, { role: 'agent', content: response.response, timestamp: new Date() }]);
    }
  };

  const suggestedQueries = [
    "Who are my hottest leads right now?",
    "Which campaigns need attention?",
    "What's my pipeline looking like?",
    "Who should I contact first today?",
    "Show me underperforming ads",
    "What are buyers looking for?"
  ];

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Master Agent</CardTitle>
          </div>
          <Badge variant="secondary" className="text-[10px] font-normal">
            Claude Opus
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Quick Actions Row */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          <Button
            variant="outline"
            size="sm"
            className="shrink-0 text-xs h-8"
            onClick={() => handleQuickAction('briefing')}
            disabled={isLoading}
          >
            <Calendar className="h-3.5 w-3.5 mr-1.5" />
            Briefing
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="shrink-0 text-xs h-8"
            onClick={() => handleQuickAction('pipeline')}
            disabled={isLoading}
          >
            <TrendingUp className="h-3.5 w-3.5 mr-1.5" />
            Pipeline
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="shrink-0 text-xs h-8"
            onClick={() => handleQuickAction('insights')}
            disabled={isLoading}
          >
            <Target className="h-3.5 w-3.5 mr-1.5" />
            Insights
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="shrink-0 text-xs h-8"
            onClick={() => handleQuickAction('budget')}
            disabled={isLoading}
          >
            <PieChart className="h-3.5 w-3.5 mr-1.5" />
            Budget
          </Button>
        </div>

        {/* Chat Area */}
        <ScrollArea className="h-[200px] mb-3">
          {messages.length === 0 ? (
            <div className="grid grid-cols-2 gap-1.5">
              {suggestedQueries.slice(0, 4).map((suggestion, i) => (
                <Button
                  key={i}
                  variant="ghost"
                  size="sm"
                  className="text-[11px] justify-start h-auto py-1.5 px-2 text-muted-foreground hover:text-foreground"
                  onClick={() => setQuery(suggestion)}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((message, i) => (
                <div
                  key={i}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[90%] rounded-lg px-3 py-2 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-xs whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg px-3 py-2 flex items-center gap-2">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span className="text-xs">Thinking...</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {error && (
          <div className="flex items-center gap-2 text-destructive text-xs mb-2">
            <AlertCircle className="h-3 w-3" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex gap-2">
          <Textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask anything..."
            className="min-h-[36px] max-h-[80px] resize-none text-sm"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <Button type="submit" size="icon" className="h-9 w-9 shrink-0" disabled={isLoading || !query.trim()}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
