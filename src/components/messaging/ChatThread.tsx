// DEPRECATED: This component is being replaced by RequestIntroductionModal.
// The new system uses a simpler "Request Introduction" flow instead of full chat.
// Will be removed once the new system is fully tested.

import { useState, useEffect, useRef, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ArrowLeft, Send, Mail, MessageCircle, Check, CheckCheck, 
  Calendar, Loader2
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Message, useMessaging } from '@/hooks/useMessaging';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { supabase } from '@/integrations/supabase/client';
import { format, isToday, isYesterday, isSameDay } from 'date-fns';
import { toast } from 'sonner';

interface ChatThreadProps {
  userType: 'developer' | 'agent' | 'broker';
}

const ChatThread = ({ userType }: ChatThreadProps) => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [conversation, setConversation] = useState<any>(null);
  const [showScoreBreakdown, setShowScoreBreakdown] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  
  const { fetchMessages, sendMessage, markConversationRead, closeConversation } = useMessaging();
  const { currentTier } = useSubscription();

  // Get buyer display info from conversation
  const getBuyerDisplayInfo = (buyerId: string | undefined) => {
    if (!buyerId) return null;
    return {
      name: `Buyer ${buyerId.slice(-4)}`,
      initials: buyerId.slice(0, 2).toUpperCase(),
      location: 'Unknown',
      budget: 'Not specified',
      bedrooms: 'Not specified',
      timeline: 'Not specified',
      paymentMethod: 'Not specified',
      purpose: 'Not specified',
      preferredAreas: [] as string[],
      score: 0,
    };
  };

  const buyer = conversation ? getBuyerDisplayInfo(conversation.buyer_id) : null;

  const loadMessages = useCallback(async () => {
    if (!conversationId) return;
    
    setLoading(true);
    const msgs = await fetchMessages(conversationId);
    setMessages(msgs);
    setLoading(false);
    
    // Mark as read
    markConversationRead(conversationId);
  }, [conversationId, fetchMessages, markConversationRead]);

  const loadConversation = useCallback(async () => {
    if (!conversationId) return;
    
    const { data } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .single();
    
    if (data) {
      setConversation(data);
    }
  }, [conversationId]);

  useEffect(() => {
    loadConversation();
    loadMessages();
  }, [loadConversation, loadMessages]);

  // Real-time message subscription
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages(prev => [...prev, newMessage]);
          
          if (newMessage.sender_type === 'buyer') {
            markConversationRead(conversationId);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, markConversationRead]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!inputMessage.trim() || !conversationId || sending) return;

    const messageContent = inputMessage;
    setInputMessage('');
    setSending(true);

    const result = await sendMessage(conversationId, messageContent);
    
    setSending(false);

    if (!result.success) {
      setInputMessage(messageContent);
      toast.error(result.error || 'Failed to send message');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatMessageTime = (date: Date) => {
    return format(date, 'HH:mm');
  };

  const formatDateSeparator = (date: Date) => {
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMMM d, yyyy');
  };

  const getDeliveryStatus = (message: Message) => {
    if (message.read) {
      return <CheckCheck className="h-3 w-3 text-blue-500" />;
    }
    if (message.delivered) {
      return <CheckCheck className="h-3 w-3 text-muted-foreground" />;
    }
    return <Check className="h-3 w-3 text-muted-foreground" />;
  };

  const getChannelIcon = (channel: Message['sent_via']) => {
    switch (channel) {
      case 'email':
        return <Mail className="h-3 w-3" />;
      case 'whatsapp':
        return <MessageCircle className="h-3 w-3 text-green-500" />;
      default:
        return null;
    }
  };

  if (!conversationId) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Select a conversation</p>
      </div>
    );
  }

  if (loading && !conversation) {
    return (
      <div className="flex flex-col h-full">
        <Skeleton className="h-16 mb-4" />
        <Skeleton className="flex-1" />
        <Skeleton className="h-16 mt-4" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-160px)] gap-4">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <Card className="p-4 mb-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(`/${userType}/conversations`)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            {buyer && (
              <>
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-semibold text-primary">
                  {buyer?.initials}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{buyer?.name}</span>
                    <Badge variant="outline">{buyer?.score}</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">{buyer?.location}</div>
                </div>
              </>
            )}
          </div>
        </Card>

        {/* Messages */}
        <Card className="flex-1 flex flex-col overflow-hidden">
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4">
              {/* System message for conversation start */}
              <div className="text-center">
                <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                  Conversation started
                </span>
              </div>

              {messages.map((message, index) => {
                const messageDate = new Date(message.created_at);
                const prevMessage = messages[index - 1];
                const showDateSeparator = !prevMessage || 
                  !isSameDay(messageDate, new Date(prevMessage.created_at));

                return (
                  <div key={message.id}>
                    {showDateSeparator && (
                      <div className="text-center my-4">
                        <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                          {formatDateSeparator(messageDate)}
                        </span>
                      </div>
                    )}

                    <div className={`flex ${message.sender_type === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          message.sender_type === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        <div className="flex items-center justify-end gap-1 mt-1">
                          {message.sender_type === 'buyer' && (
                            <span className="flex items-center gap-1 text-xs opacity-70">
                              {getChannelIcon(message.sent_via)}
                              <span>via {message.sent_via === 'whatsapp' ? 'WhatsApp' : 'Email'}</span>
                            </span>
                          )}
                          <span className="text-xs opacity-70">
                            {formatMessageTime(messageDate)}
                          </span>
                          {message.sender_type === 'user' && getDeliveryStatus(message)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {sending && (
                <div className="flex justify-end">
                  <div className="max-w-[70%] rounded-lg p-3 bg-primary/50 text-primary-foreground">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Sending...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                disabled={sending}
                className="flex-1"
              />
              <Button onClick={handleSend} disabled={!inputMessage.trim() || sending}>
                <Send className="h-5 w-5" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Press Enter to send • Shift+Enter for new line
            </p>
          </div>
        </Card>
      </div>

      {/* Buyer Profile Sidebar */}
      {buyer && (
        <Card className="w-80 p-4 hidden lg:block overflow-y-auto">
          <h3 className="font-semibold mb-4">Buyer Profile</h3>
          
          {/* Details */}
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Budget</span>
              <span className="font-medium">{buyer.budget}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Bedrooms</span>
              <span className="font-medium">{buyer.bedrooms}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Timeline</span>
              <span className="font-medium">{buyer.timeline}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Payment</span>
              <span className="font-medium">{buyer.paymentMethod}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Purpose</span>
              <span className="font-medium">{buyer.purpose}</span>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Preferred Areas</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {buyer.preferredAreas.map(area => (
                  <Badge key={area} variant="secondary" className="text-xs">{area}</Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Score Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold">Score</span>
              <Badge className="text-lg px-3 py-1">{buyer?.score}</Badge>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <Button className="w-full" variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Book Viewing
            </Button>
            <Button 
              className="w-full" 
              variant="ghost"
              onClick={() => closeConversation(conversationId!)}
            >
              Close Conversation
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ChatThread;
