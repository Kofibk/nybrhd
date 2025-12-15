import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Phone, Mail, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Lead {
  name: string;
  email?: string;
  phone?: string;
  score?: number;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  leads?: Lead[];
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
          chatHistory: messages.map(m => ({ role: m.role, content: m.content })),
          analysisContext
        }
      });

      if (error) throw error;

      const assistantMessage = data.chatResponse || data.summary || "I apologise, I couldn't generate a response. Please try again.";
      const extractedLeads = data.leads || [];
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: assistantMessage,
        leads: extractedLeads.length > 0 ? extractedLeads : undefined
      }]);
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

  const handleCall = (lead: Lead) => {
    if (lead.phone) {
      window.open(`tel:${lead.phone}`, '_self');
      toast.success(`Calling ${lead.name}...`);
    } else {
      toast.error('No phone number available');
    }
  };

  const handleEmail = (lead: Lead) => {
    if (lead.email) {
      window.open(`mailto:${lead.email}`, '_blank');
      toast.success(`Opening email to ${lead.name}...`);
    } else {
      toast.error('No email address available');
    }
  };

  const handleWhatsApp = (lead: Lead) => {
    if (lead.phone) {
      const cleanPhone = lead.phone.replace(/[^0-9+]/g, '');
      window.open(`https://wa.me/${cleanPhone}`, '_blank');
      toast.success(`Opening WhatsApp to ${lead.name}...`);
    } else {
      toast.error('No phone number available');
    }
  };

  const hasData = campaignData.length > 0 || leadData.length > 0;

  const suggestedQuestions = hasData ? [
    campaignData.length > 0 ? "What's causing high CPL?" : null,
    leadData.length > 0 ? "Top 5 hottest leads?" : null,
    leadData.length > 0 ? "Leads above 80 score?" : null,
    campaignData.length > 0 ? "Reduce wasted spend?" : null,
  ].filter(Boolean) : [
    "Upload data to start",
  ];

  return (
    <div className="flex flex-col h-[350px] sm:h-[400px]">
      <ScrollArea className="flex-1 p-3 sm:p-4" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground text-center">
              {hasData 
                ? "Ask questions about your data"
                : "Upload data to start"
              }
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {suggestedQuestions.slice(0, 4).map((q, i) => (
                <Button
                  key={i}
                  variant="outline"
                  size="sm"
                  className="text-[11px] h-auto py-1.5 px-2 whitespace-normal text-left justify-start"
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
              <div key={i} className="space-y-2">
                <div
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
                
                {/* Lead Action Buttons */}
                {msg.leads && msg.leads.length > 0 && (
                  <div className="ml-11 space-y-2">
                    {msg.leads.map((lead, j) => (
                      <div 
                        key={j} 
                        className="flex items-center justify-between gap-2 p-2 rounded-lg bg-background border text-sm"
                      >
                        <div className="flex-1 min-w-0">
                          <span className="font-medium truncate">{lead.name}</span>
                          {lead.score !== undefined && (
                            <span className="ml-2 text-xs text-muted-foreground">
                              Score: {lead.score}
                            </span>
                          )}
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleCall(lead)}
                            disabled={!lead.phone}
                            title={lead.phone ? `Call ${lead.phone}` : 'No phone'}
                          >
                            <Phone className="h-4 w-4 text-green-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleEmail(lead)}
                            disabled={!lead.email}
                            title={lead.email ? `Email ${lead.email}` : 'No email'}
                          >
                            <Mail className="h-4 w-4 text-blue-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleWhatsApp(lead)}
                            disabled={!lead.phone}
                            title={lead.phone ? `WhatsApp ${lead.phone}` : 'No phone'}
                          >
                            <MessageCircle className="h-4 w-4 text-green-600" />
                          </Button>
                        </div>
                      </div>
                    ))}
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
      
      <div className="p-3 sm:p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={hasData ? "Ask about your data..." : "Upload data first..."}
            disabled={isLoading}
            className="flex-1 text-sm"
          />
          <Button 
            onClick={sendMessage} 
            disabled={!input.trim() || isLoading || !hasData}
            size="icon"
            className="shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
