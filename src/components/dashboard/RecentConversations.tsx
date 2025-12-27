import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';
import { demoConversations } from '@/lib/buyerData';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { MessageSquare, ChevronRight, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface RecentConversationsProps {
  className?: string;
  userType: 'developer' | 'agent' | 'broker';
}

export const RecentConversations: React.FC<RecentConversationsProps> = ({ className, userType }) => {
  const navigate = useNavigate();
  const { currentTier } = useSubscription();
  const basePath = `/${userType}`;

  // Filter conversations based on tier
  const conversations = demoConversations
    .filter(conv => {
      if (currentTier === 'access') return conv.buyer.score >= 50 && conv.buyer.score < 70;
      if (currentTier === 'growth') return conv.buyer.score >= 50;
      return true;
    })
    .slice(0, 3);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleViewConversation = (convId: string) => {
    navigate(`${basePath}/chat/${convId}`);
  };

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
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              className={cn(
                "flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors",
                conversation.unread 
                  ? "bg-primary/5 hover:bg-primary/10" 
                  : "bg-muted/30 hover:bg-muted/50"
              )}
              onClick={() => handleViewConversation(conversation.id)}
            >
              <Avatar className="h-10 w-10">
                <AvatarFallback className={cn(
                  "text-xs font-medium",
                  conversation.buyer.score >= 80 
                    ? "bg-amber-500/20 text-amber-600" 
                    : "bg-primary/10 text-primary"
                )}>
                  {getInitials(conversation.buyer.name)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={cn(
                      "text-sm font-medium truncate",
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
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    {formatDistanceToNow(conversation.lastMessageTime, { addSuffix: true })}
                  </span>
                </div>
                
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {conversation.lastMessage}
                </p>
                
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[10px] text-muted-foreground">
                    {conversation.buyer.location}
                  </span>
                  <span className="text-[10px] text-muted-foreground">•</span>
                  <span className="text-[10px] text-muted-foreground">
                    {conversation.buyer.budget}
                  </span>
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "text-[9px] h-4 px-1",
                      conversation.buyer.score >= 80 ? "border-amber-500/30 text-amber-600" :
                      conversation.buyer.score >= 70 ? "border-green-500/30 text-green-600" :
                      "border-blue-500/30 text-blue-600"
                    )}
                  >
                    {conversation.buyer.score}
                  </Badge>
                </div>
              </div>
            </div>
          ))}

          {conversations.length === 0 && (
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
