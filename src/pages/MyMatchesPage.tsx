import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { demoConversations } from '@/lib/buyerData';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { Heart, MessageSquare, Calendar, Users, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface MyMatchesPageProps {
  userType: 'developer' | 'agent' | 'broker';
}

const MyMatchesPage: React.FC<MyMatchesPageProps> = ({ userType }) => {
  const navigate = useNavigate();
  const { currentTier } = useSubscription();
  const [statusFilter, setStatusFilter] = useState('all');
  const basePath = `/${userType}`;

  // Use conversations as matches (buyers the user has contacted)
  const matches = demoConversations
    .filter(conv => {
      if (currentTier === 'access') return conv.buyer.score >= 50 && conv.buyer.score < 70;
      if (currentTier === 'growth') return conv.buyer.score >= 50;
      return true;
    })
    .filter(conv => {
      if (statusFilter === 'all') return true;
      if (statusFilter === 'contacted') return true;
      if (statusFilter === 'responded') return conv.status === 'buyer_responded';
      if (statusFilter === 'viewing') return false; // Demo: no viewings booked
      return true;
    });

  const getStatusBadge = (conversation: typeof demoConversations[0]) => {
    if (conversation.status === 'buyer_responded') {
      return <Badge className="bg-green-500/10 text-green-600 border-green-500/30">Responded</Badge>;
    }
    if (conversation.status === 'awaiting_response') {
      return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30">Awaiting Response</Badge>;
    }
    return <Badge variant="secondary">Contacted</Badge>;
  };

  return (
    <DashboardLayout title="My Matches" userType={userType}>
      <div className="space-y-6">
        {/* Filters */}
        <div className="flex items-center gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Matches</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="responded">Responded</SelectItem>
              <SelectItem value="viewing">Viewing Booked</SelectItem>
            </SelectContent>
          </Select>
          
          <span className="text-sm text-muted-foreground">
            {matches.length} match{matches.length !== 1 ? 'es' : ''}
          </span>
        </div>

        {/* Matches Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {matches.map((match) => (
            <Card 
              key={match.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold">{match.buyer.name}</h3>
                    <p className="text-xs text-muted-foreground">{match.buyer.location}</p>
                  </div>
                  <Badge 
                    className={cn(
                      "text-sm font-bold",
                      match.buyer.score >= 80 ? "bg-amber-500 text-white" :
                      match.buyer.score >= 70 ? "bg-green-500 text-white" :
                      "bg-blue-500 text-white"
                    )}
                  >
                    {match.buyer.score}
                  </Badge>
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                  <span>{match.buyer.budget}</span>
                  <span>•</span>
                  <span>{match.buyer.bedrooms}</span>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  {getStatusBadge(match)}
                  <Badge variant="outline" className="text-[10px]">
                    <MessageSquare className="h-2.5 w-2.5 mr-1" />
                    {match.messages.length} messages
                  </Badge>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                  <span>Last active {formatDistanceToNow(match.lastMessageTime, { addSuffix: true })}</span>
                </div>

                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate(`${basePath}/chat/${match.id}`)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Chat
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {matches.length === 0 && (
          <Card className="p-8 text-center">
            <Heart className="h-12 w-12 mx-auto text-muted-foreground/50" />
            <h3 className="mt-4 font-semibold">No matches yet</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Buyers you contact or save will appear here
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

export default MyMatchesPage;
