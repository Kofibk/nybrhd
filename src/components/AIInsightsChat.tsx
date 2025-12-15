import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AIInsightsChatProps {
  campaignData: any[];
  leadData: any[];
  analysisContext?: string;
}

export function AIInsightsChat({ campaignData, leadData, analysisContext }: AIInsightsChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-data', {
        body: {
          campaigns: campaignData,
          leads: leadData,
          chatMessage: userMessage,
          chatHistory: messages,
          analysisContext
        }
      });

      if (error) throw error;

      const assistantMessage = data.chatResponse || data.summary || 'I apologise, I couldn\'t generate a response. Please try again.';
      setMessages(prev => [...prev, { role: 'assistant', content: assistantMessage }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const hasData = campaignData.length > 0 || leadData.length > 0;

  const suggestedQuestions = hasData ? [
    campaignData.length > 0 ? "What's causing the highest CPL?" : null,
    leadData.length > 0 ? "Who are the top 5 hottest leads?" : null,
    leadData.length > 0 ? "Show all leads above 80/100 score" : null,
    campaignData.length > 0 ? "How can I reduce wasted spend?" : null,
    leadData.length > 0 ? "Which leads should I prioritise today?" : null,
    "What's working best right now?"
  ].filter(Boolean) : [
    "Upload campaign or lead data to get started",
  ];

  return (
    <div className="flex flex-col h-[400px]">
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              {hasData 
                ? "Ask questions about your data, get insights, or request actions"
                : "Upload data above to start asking questions"
              }
            </p>
            <div className="grid grid-cols-2 gap-2">
              {suggestedQuestions.slice(0, 4).map((q, i) => (
                <Button
                  key={i}
                  variant="outline"
                  size="sm"
                  className="text-xs h-auto py-2 px-3 whitespace-normal text-left justify-start"
                  onClick={() => {
                    if (hasData && q) setInput(q);
                  }}
                  disabled={!hasData}
                >
                  {q}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-lg p-3 text-sm whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  {msg.content}
                </div>
                {msg.role === 'user' && (
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>
      
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={hasData ? "Ask about your data, e.g. 'Who are my top 10 leads?'" : "Upload data to start chatting..."}
            disabled={isLoading}
            className="flex-1"
          />
          <Button 
            onClick={sendMessage} 
            disabled={!input.trim() || isLoading || !hasData}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
