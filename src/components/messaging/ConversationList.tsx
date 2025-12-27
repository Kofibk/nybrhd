import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageCircle, Mail, Zap, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Conversation, useMessaging } from '@/hooks/useMessaging';
import { demoBuyers } from '@/lib/buyerData';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { formatDistanceToNow } from 'date-fns';

interface ConversationListProps {
  userType: 'developer' | 'agent' | 'broker';
}

const ConversationList = ({ userType }: ConversationListProps) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { conversations, loading } = useMessaging();
  const { currentTier } = useSubscription();
  const navigate = useNavigate();

  const getBuyer = (buyerId: string) => {
    return demoBuyers.find(b => b.id === buyerId);
  };

  const filteredConversations = useMemo(() => {
    if (statusFilter === 'all') return conversations;
    if (statusFilter === 'unread') return conversations.filter(c => c.unread_count > 0);
    return conversations.filter(c => c.status === statusFilter);
  }, [conversations, statusFilter]);

  const getStatusLabel = (status: Conversation['status']) => {
    switch (status) {
      case 'active': return 'Active';
      case 'buyer_responded': return 'Buyer Responded';
      case 'awaiting_response': return 'Awaiting Response';
      case 'closed': return 'Closed';
      default: return status;
    }
  };

  const getStatusColor = (status: Conversation['status']) => {
    switch (status) {
      case 'buyer_responded': return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'awaiting_response': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'closed': return 'bg-muted text-muted-foreground';
      default: return 'bg-primary/10 text-primary border-primary/20';
    }
  };

  const handleOpenConversation = (convId: string) => {
    navigate(`/${userType}/chat/${convId}`);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
          </span>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Conversations</SelectItem>
            <SelectItem value="unread">Unread</SelectItem>
            <SelectItem value="awaiting_response">Awaiting Response</SelectItem>
            <SelectItem value="buyer_responded">Buyer Responded</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Conversation List */}
      {filteredConversations.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold mb-2">No conversations yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Start a conversation by contacting a buyer from the Buyers page
          </p>
          <Button onClick={() => navigate(`/${userType}/buyers`)}>
            <Users className="h-4 w-4 mr-2" />
            Browse Buyers
          </Button>
        </Card>
      ) : (
        <ScrollArea className="h-[calc(100vh-280px)]">
          <div className="space-y-3 pr-4">
            {filteredConversations.map(conversation => {
              const buyer = getBuyer(conversation.buyer_id);
              if (!buyer) return null;

              return (
                <Card
                  key={conversation.id}
                  className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                    conversation.unread_count > 0 ? 'border-primary/50 bg-primary/5' : ''
                  }`}
                  onClick={() => handleOpenConversation(conversation.id)}
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-lg font-semibold text-primary">
                        {buyer.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      {conversation.unread_count > 0 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                          {conversation.unread_count}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className={`font-medium truncate ${conversation.unread_count > 0 ? 'font-semibold' : ''}`}>
                          {buyer.name}
                        </span>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {formatDistanceToNow(new Date(conversation.last_message_at), { addSuffix: true })}
                        </span>
                      </div>

                      <p className="text-sm text-muted-foreground truncate mb-2">
                        {conversation.last_message_preview || 'No messages yet'}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{buyer.location}</span>
                          <span>•</span>
                          <span>{buyer.budget}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          {currentTier === 'enterprise' && buyer.score >= 80 && (
                            <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-xs">
                              <Zap className="h-3 w-3 mr-1" />
                              First Refusal
                            </Badge>
                          )}
                          <Badge variant="outline" className={`text-xs ${getStatusColor(conversation.status)}`}>
                            {getStatusLabel(conversation.status)}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {buyer.score}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};

export default ConversationList;
