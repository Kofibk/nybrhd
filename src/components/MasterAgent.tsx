import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  Send, 
  Loader2, 
  AlertCircle, 
  Zap, 
  TrendingUp, 
  Users, 
  Calendar,
  Target,
  PieChart,
  MessageSquare
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
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Brain className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Master Agent</CardTitle>
              <CardDescription>Powered by Claude Opus 4.5</CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            AI Intelligence
          </Badge>
        </div>
      </CardHeader>

      <Tabs defaultValue="chat" className="flex-1 flex flex-col">
        <TabsList className="mx-6">
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Chat
          </TabsTrigger>
          <TabsTrigger value="actions" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Quick Actions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="flex-1 flex flex-col px-6 pb-6 mt-4">
          <ScrollArea className="flex-1 pr-4 min-h-[300px]">
            {messages.length === 0 ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Ask me anything about your leads, campaigns, or pipeline. I can score leads, analyse performance, and recommend specific actions.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {suggestedQueries.map((suggestion, i) => (
                    <Button
                      key={i}
                      variant="outline"
                      size="sm"
                      className="text-xs justify-start h-auto py-2 px-3"
                      onClick={() => setQuery(suggestion)}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message, i) => (
                  <div
                    key={i}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg px-4 py-3 ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <p className="text-[10px] opacity-60 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg px-4 py-3 flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Thinking...</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          {error && (
            <div className="flex items-center gap-2 text-destructive text-sm mt-2">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
            <Textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask about leads, campaigns, performance..."
              className="min-h-[44px] max-h-[120px] resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <Button type="submit" size="icon" disabled={isLoading || !query.trim()}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="actions" className="flex-1 px-6 pb-6 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2"
              onClick={() => handleQuickAction('briefing')}
              disabled={isLoading}
            >
              <Calendar className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Daily Briefing</span>
              <span className="text-xs text-muted-foreground">Urgent leads & alerts</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2"
              onClick={() => handleQuickAction('pipeline')}
              disabled={isLoading}
            >
              <TrendingUp className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Pipeline Forecast</span>
              <span className="text-xs text-muted-foreground">Conversions & revenue</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2"
              onClick={() => handleQuickAction('insights')}
              disabled={isLoading}
            >
              <Target className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Market Insights</span>
              <span className="text-xs text-muted-foreground">Trends & patterns</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2"
              onClick={() => handleQuickAction('budget')}
              disabled={isLoading}
            >
              <PieChart className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Budget Optimisation</span>
              <span className="text-xs text-muted-foreground">Spend recommendations</span>
            </Button>
          </div>

          {isLoading && (
            <div className="mt-4 flex items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Processing...</span>
            </div>
          )}

          {messages.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Latest Response</h4>
              <ScrollArea className="h-[200px] border rounded-lg p-3">
                <p className="text-sm whitespace-pre-wrap">
                  {messages[messages.length - 1]?.content}
                </p>
              </ScrollArea>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </Card>
  );
}
