import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { MessageSquare, Users, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface ConversationsPageProps {
  userType: 'developer' | 'agent' | 'broker';
}

const ConversationsPage: React.FC<ConversationsPageProps> = ({ userType }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentTier } = useSubscription();
  const [statusFilter, setStatusFilter] = useState('all');
  const basePath = `/${userType}`;

  // Fetch real conversations from Supabase
  const { data: conversations, isLoading } = useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', user?.id)
        .order('last_message_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Filter conversations based on status
  const filteredConversations = (conversations || []).filter(conv => {
    if (statusFilter === 'all') return true;
    return conv.status === statusFilter;
  });

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'awaiting_response': return 'Awaiting Response';
      case 'buyer_responded': return 'Buyer Responded';
      case 'active': return 'Active';
      case 'closed': return 'Closed';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'buyer_responded': return 'bg-green-500/10 text-green-600 border-green-500/30';
      case 'awaiting_response': return 'bg-amber-500/10 text-amber-600 border-amber-500/30';
      case 'active': return 'bg-blue-500/10 text-blue-600 border-blue-500/30';
      case 'closed': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const handleOpenChat = (convId: string) => {
    navigate(`${basePath}/conversations/${convId}`);
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Conversations" userType={userType}>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-64" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Conversations" userType={userType}>
      <div className="space-y-6">
        {/* Filters */}
        <div className="flex items-center gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Conversations</SelectItem>
              <SelectItem value="awaiting_response">Awaiting Response</SelectItem>
              <SelectItem value="buyer_responded">Buyer Responded</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
          
          <span className="text-sm text-muted-foreground">
            {filteredConversations.length} conversation{filteredConversations.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Conversations List */}
        <div className="space-y-2">
          {filteredConversations.map((conversation) => (
            <Card 
              key={conversation.id}
              className={cn(
                "cursor-pointer hover:bg-muted/50 transition-colors",
                (conversation.unread_count || 0) > 0 && "border-primary/30 bg-primary/5"
              )}
              onClick={() => handleOpenChat(conversation.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {conversation.buyer_id.slice(-2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={cn(
                          "font-medium truncate",
                          (conversation.unread_count || 0) > 0 && "font-semibold"
                        )}>
                          Buyer {conversation.buyer_id.slice(-4)}
                        </span>
                        {(conversation.unread_count || 0) > 0 && (
                          <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="outline" className={cn("text-[10px]", getStatusColor(conversation.status))}>
                          {getStatusLabel(conversation.status)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {conversation.last_message_at 
                            ? formatDistanceToNow(new Date(conversation.last_message_at), { addSuffix: true })
                            : 'Just now'
                          }
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground truncate mb-2">
                      {conversation.last_message_preview || 'No messages yet'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredConversations.length === 0 && (
          <Card className="p-8 text-center">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/50" />
            <h3 className="mt-4 font-semibold">No conversations yet</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Start a conversation by contacting a buyer from the Buyers page
            </p>
            <Button 
              className="mt-4"
              onClick={() => navigate(`${basePath}/buyers`)}
            >
              <Users className="h-4 w-4 mr-2" />
              Browse Buyers
            </Button>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ConversationsPage;
