import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { demoConversations, Conversation } from '@/lib/buyerData';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { MessageSquare, Clock, Zap, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface ConversationsPageProps {
  userType: 'developer' | 'agent' | 'broker';
}

const ConversationsPage: React.FC<ConversationsPageProps> = ({ userType }) => {
  const navigate = useNavigate();
  const { currentTier } = useSubscription();
  const [statusFilter, setStatusFilter] = useState('all');
  const basePath = `/${userType}`;

  // Filter conversations based on tier and status
  const filteredConversations = demoConversations
    .filter(conv => {
      if (currentTier === 'access') return conv.buyer.score >= 50 && conv.buyer.score < 70;
      if (currentTier === 'growth') return conv.buyer.score >= 50;
      return true;
    })
    .filter(conv => {
      if (statusFilter === 'all') return true;
      return conv.status === statusFilter;
    });

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getStatusLabel = (status: Conversation['status']) => {
    switch (status) {
      case 'awaiting_response': return 'Awaiting Response';
      case 'buyer_responded': return 'Buyer Responded';
      case 'no_response': return 'No Response';
      case 'closed': return 'Closed';
    }
  };

  const getStatusColor = (status: Conversation['status']) => {
    switch (status) {
      case 'buyer_responded': return 'bg-green-500/10 text-green-600 border-green-500/30';
      case 'awaiting_response': return 'bg-amber-500/10 text-amber-600 border-amber-500/30';
      case 'no_response': return 'bg-muted text-muted-foreground';
      case 'closed': return 'bg-muted text-muted-foreground';
    }
  };

  const handleOpenChat = (convId: string) => {
    navigate(`${basePath}/chat/${convId}`);
  };

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
              <SelectItem value="no_response">No Response</SelectItem>
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
                conversation.unread && "border-primary/30 bg-primary/5"
              )}
              onClick={() => handleOpenChat(conversation.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className={cn(
                      "text-sm font-medium",
                      conversation.buyer.score >= 80 
                        ? "bg-amber-500/20 text-amber-600" 
                        : "bg-primary/10 text-primary"
                    )}>
                      {getInitials(conversation.buyer.name)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={cn(
                          "font-medium truncate",
                          conversation.unread && "font-semibold"
                        )}>
                          {conversation.buyer.name}
                        </span>
                        {conversation.buyer.score >= 80 && currentTier === 'enterprise' && (
                          <Badge variant="outline" className="text-[9px] border-amber-500/30 text-amber-600 shrink-0">
                            <Zap className="h-2 w-2 mr-0.5" />
                            First Refusal
                          </Badge>
                        )}
                        {conversation.unread && (
                          <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="outline" className={cn("text-[10px]", getStatusColor(conversation.status))}>
                          {getStatusLabel(conversation.status)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(conversation.lastMessageTime, { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground truncate mb-2">
                      {conversation.lastMessage}
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{conversation.buyer.location}</span>
                      <span>•</span>
                      <span>{conversation.buyer.budget}</span>
                      <span>•</span>
                      <span>{conversation.buyer.bedrooms}</span>
                      {currentTier !== 'access' && (
                        <>
                          <span>•</span>
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "text-[9px] h-4",
                              conversation.buyer.score >= 80 ? "border-amber-500/30 text-amber-600" :
                              conversation.buyer.score >= 70 ? "border-green-500/30 text-green-600" :
                              "border-blue-500/30 text-blue-600"
                            )}
                          >
                            Score: {conversation.buyer.score}
                          </Badge>
                        </>
                      )}
                    </div>
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
              Start a conversation by contacting a buyer
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
