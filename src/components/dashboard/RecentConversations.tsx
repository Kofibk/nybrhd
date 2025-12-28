import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { MessageSquare, ChevronRight, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

interface RecentConversationsProps {
  className?: string;
  userType: 'developer' | 'agent' | 'broker';
}

export const RecentConversations: React.FC<RecentConversationsProps> = ({ className, userType }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentTier } = useSubscription();
  const basePath = `/${userType}`;

  // Fetch real conversations from Supabase
  const { data: conversations, isLoading } = useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', user?.id)
        .order('last_message_at', { ascending: false })
        .limit(3);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleViewConversation = (convId: string) => {
    navigate(`${basePath}/chat/${convId}`);
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Recent Conversations
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Recent Conversations
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs"
            onClick={() => navigate(`${basePath}/conversations`)}
          >
            View All
            <ChevronRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {conversations?.map((conversation) => (
            <div
              key={conversation.id}
              className={cn(
                "flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors",
                (conversation.unread_count || 0) > 0
                  ? "bg-primary/5 hover:bg-primary/10" 
                  : "bg-muted/30 hover:bg-muted/50"
              )}
              onClick={() => handleViewConversation(conversation.id)}
            >
              <Avatar className="h-10 w-10">
                <AvatarFallback className="text-xs font-medium bg-primary/10 text-primary">
                  {getInitials(conversation.buyer_id.slice(0, 4))}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={cn(
                      "text-sm font-medium truncate",
                      (conversation.unread_count || 0) > 0 && "font-semibold"
                    )}>
                      Buyer {conversation.buyer_id.slice(-4)}
                    </span>
                    {(conversation.unread_count || 0) > 0 && (
                      <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
                    )}
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    {conversation.last_message_at 
                      ? formatDistanceToNow(new Date(conversation.last_message_at), { addSuffix: true })
                      : 'Just now'
                    }
                  </span>
                </div>
                
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {conversation.last_message_preview || 'No messages yet'}
                </p>
                
                <div className="flex items-center gap-2 mt-1.5">
                  <Badge 
                    variant="outline" 
                    className="text-[9px] h-4 px-1"
                  >
                    {conversation.status}
                  </Badge>
                </div>
              </div>
            </div>
          ))}

          {(!conversations || conversations.length === 0) && (
            <div className="text-center py-8">
              <MessageSquare className="h-8 w-8 mx-auto text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground mt-2">No conversations yet</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-3"
                onClick={() => navigate(`${basePath}/buyers`)}
              >
                Browse Buyers
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentConversations;
