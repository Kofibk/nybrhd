import React, { useState, useRef, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { 
  ArrowLeft, 
  Send, 
  Check,
  CheckCheck,
  MessageSquare,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface ChatPageProps {
  userType: 'developer' | 'agent' | 'broker';
}

const ChatPage: React.FC<ChatPageProps> = ({ userType }) => {
  const navigate = useNavigate();
  const { id: conversationId } = useParams();
  const { user } = useAuth();
  const { currentTier } = useSubscription();
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const basePath = `/${userType}`;
  const queryClient = useQueryClient();

  // Fetch conversation
  const { data: conversation, isLoading: loadingConv } = useQuery({
    queryKey: ['conversation', conversationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!conversationId,
  });

  // Fetch messages
  const { data: messages, isLoading: loadingMessages } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!conversationId,
  });

  // Send message mutation
  const sendMessage = useMutation({
    mutationFn: async (content: string) => {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user?.id,
          sender_type: 'user',
          content,
          sent_via: 'platform',
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      setNewMessage('');
    },
    onError: () => {
      toast.error('Failed to send message');
    },
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!newMessage.trim()) return;
    sendMessage.mutate(newMessage.trim());
  };

  if (loadingConv || loadingMessages) {
    return (
      <DashboardLayout title="Conversation" userType={userType}>
        <Card className="h-[calc(100vh-180px)] flex flex-col">
          <CardHeader className="border-b py-3">
            <Skeleton className="h-10 w-48" />
          </CardHeader>
          <CardContent className="flex-1 p-4">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-3/4" />
              ))}
            </div>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  if (!conversation) {
    return (
      <DashboardLayout title="Conversation" userType={userType}>
        <Card className="p-8 text-center">
          <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/50" />
          <h3 className="mt-4 font-semibold">Conversation not found</h3>
          <p className="text-sm text-muted-foreground mt-1">
            This conversation may have been deleted or you don't have access to it.
          </p>
          <Button 
            className="mt-4"
            onClick={() => navigate(`${basePath}/conversations`)}
          >
            Back to Conversations
          </Button>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Conversation" userType={userType}>
      <Card className="h-[calc(100vh-180px)] flex flex-col">
        {/* Chat Header */}
        <CardHeader className="border-b py-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(`${basePath}/conversations`)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary/10 text-primary">
                {conversation.buyer_id.slice(-2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <span className="font-semibold">Buyer {conversation.buyer_id.slice(-4)}</span>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="outline" className="text-[10px]">
                  {conversation.status}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages?.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No messages yet. Start the conversation!</p>
              </div>
            )}
            {messages?.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex",
                  message.sender_type === 'user' ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[70%] rounded-lg px-4 py-2",
                    message.sender_type === 'user'
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  <p className="text-sm">{message.content}</p>
                  <div className={cn(
                    "flex items-center gap-1 mt-1",
                    message.sender_type === 'user' ? "justify-end" : "justify-start"
                  )}>
                    <span className="text-[10px] opacity-70">
                      {format(new Date(message.created_at), 'HH:mm')}
                    </span>
                    {message.sender_type === 'user' && (
                      message.read 
                        ? <CheckCheck className="h-3 w-3 text-blue-400" />
                        : <Check className="h-3 w-3 opacity-70" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1"
              disabled={sendMessage.isPending}
            />
            <Button 
              onClick={handleSend} 
              disabled={!newMessage.trim() || sendMessage.isPending}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </DashboardLayout>
  );
};

export default ChatPage;
