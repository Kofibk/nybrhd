import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useMyAssignments } from '@/hooks/useBuyerAssignments';
import { useAirtableBuyersForTable } from '@/hooks/useAirtableData';
import { 
  Heart, 
  MessageSquare, 
  Users, 
  Crown, 
  Zap,
  Search,
  MapPin,
  Wallet,
  BedDouble,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface MyMatchesPageProps {
  userType: 'developer' | 'agent' | 'broker';
}

const MyMatchesPage: React.FC<MyMatchesPageProps> = ({ userType }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentTier } = useSubscription();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const basePath = `/${userType}`;

  // Fetch user's assignments (contacted buyers)
  const { data: assignments, isLoading: loadingAssignments } = useMyAssignments();
  
  // Fetch conversations to see which buyers have been contacted
  const { data: conversations, isLoading: loadingConversations } = useQuery({
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

  // Fetch Airtable buyers to get buyer details
  const { buyers, isLoading: loadingBuyers } = useAirtableBuyersForTable({ enabled: true });

  const isLoading = loadingAssignments || loadingConversations || loadingBuyers;

  // Get first refusal buyers (score >= 80) for enterprise tier
  const firstRefusalBuyers = currentTier === 'enterprise' 
    ? buyers.filter(b => b.score >= 80)
    : [];

  // Filter based on search
  const filteredFirstRefusal = firstRefusalBuyers.filter(buyer => {
    if (searchQuery && !buyer.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  // Map assignments to buyer details
  const matchedBuyers = (assignments || []).map(assignment => {
    const buyer = buyers.find(b => b.id === assignment.airtable_record_id);
    return {
      assignment,
      buyer,
      conversation: conversations?.find(c => c.buyer_id === assignment.airtable_record_id),
    };
  }).filter(m => m.buyer);

  const filteredMatches = matchedBuyers.filter(m => {
    if (searchQuery && m.buyer && !m.buyer.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleContactBuyer = (buyerId: string) => {
    navigate(`${basePath}/buyers`);
  };

  if (isLoading) {
    return (
      <DashboardLayout title="My Matches" userType={userType}>
        <div className="space-y-4">
          <Skeleton className="h-10 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const totalCount = filteredMatches.length + (activeTab === 'all' || activeTab === 'first-refusal' ? filteredFirstRefusal.length : 0);

  return (
    <DashboardLayout title="My Matches" userType={userType}>
      <div className="space-y-6">
        {/* Tabs for filtering */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <TabsList>
              <TabsTrigger value="all">
                All Matches
                <Badge variant="secondary" className="ml-2 text-xs">
                  {filteredMatches.length + filteredFirstRefusal.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="contacted">
                Contacted
                <Badge variant="secondary" className="ml-2 text-xs">
                  {filteredMatches.length}
                </Badge>
              </TabsTrigger>
              {currentTier === 'enterprise' && (
                <TabsTrigger value="first-refusal" className="gap-2">
                  <Crown className="h-3.5 w-3.5 text-amber-500" />
                  Priority
                  <Badge className="ml-1 bg-amber-500 text-white text-xs">
                    {filteredFirstRefusal.length}
                  </Badge>
                </TabsTrigger>
              )}
            </TabsList>
          </div>

          {/* Search */}
          <div className="flex flex-wrap items-center gap-3 mt-4">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search matches..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* All Matches Tab */}
          <TabsContent value="all" className="mt-6">
            <div className="space-y-6">
              {/* First Refusal Section (if Tier 3) */}
              {currentTier === 'enterprise' && filteredFirstRefusal.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-amber-500" />
                    <h3 className="font-semibold">Priority Buyers</h3>
                    <Badge className="bg-amber-500 text-white text-xs">Score 80+</Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredFirstRefusal.slice(0, 3).map((buyer) => (
                      <FirstRefusalCard 
                        key={buyer.id} 
                        buyer={buyer} 
                        onContact={handleContactBuyer}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Regular Matches Section */}
              {filteredMatches.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">Contacted Buyers</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredMatches.map((match) => (
                      <MatchCard 
                        key={match.assignment.id}
                        buyer={match.buyer!}
                        assignment={match.assignment}
                        conversation={match.conversation}
                        basePath={basePath}
                        navigate={navigate}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Contacted Tab */}
          <TabsContent value="contacted" className="mt-6">
            {filteredMatches.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredMatches.map((match) => (
                  <MatchCard 
                    key={match.assignment.id}
                    buyer={match.buyer!}
                    assignment={match.assignment}
                    conversation={match.conversation}
                    basePath={basePath}
                    navigate={navigate}
                  />
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/50" />
                <h3 className="mt-4 font-semibold">No contacted buyers yet</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Contact buyers from the Buyers page to see them here
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
          </TabsContent>

          {/* First Refusal Tab (Tier 3 only) */}
          {currentTier === 'enterprise' && (
            <TabsContent value="first-refusal" className="mt-6">
              <Card className="bg-gradient-to-r from-amber-500/10 to-amber-600/5 border-amber-500/20 mb-6">
                <CardContent className="py-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-amber-500/20">
                      <Zap className="h-5 w-5 text-amber-500" />
                    </div>
                    <div>
                      <h2 className="font-semibold flex items-center gap-2">
                        Priority Buyers
                        <Badge className="bg-amber-500 text-white">Score 80+</Badge>
                      </h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        You get first contact with these premium buyers before they're available to other users.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {filteredFirstRefusal.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredFirstRefusal.map((buyer) => (
                    <FirstRefusalCard 
                      key={buyer.id} 
                      buyer={buyer} 
                      onContact={handleContactBuyer}
                    />
                  ))}
                </div>
              ) : (
                <Card className="p-8 text-center">
                  <Crown className="h-12 w-12 mx-auto text-amber-500/50" />
                  <h3 className="mt-4 font-semibold">No priority buyers available</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    New high-score buyers will appear here when they're added
                  </p>
                </Card>
              )}
            </TabsContent>
          )}
        </Tabs>

        {/* Empty State */}
        {totalCount === 0 && activeTab === 'all' && (
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

// Match Card Component
interface MatchCardProps {
  buyer: {
    id: string;
    name: string;
    location: string;
    budgetRange: string;
    bedrooms: string;
    score: number;
  };
  assignment: {
    id: string;
    status: string;
    assigned_at: string | null;
  };
  conversation?: {
    id: string;
    status: string;
    last_message_at: string | null;
  };
  basePath: string;
  navigate: (path: string) => void;
}

const MatchCard: React.FC<MatchCardProps> = ({ buyer, assignment, conversation, basePath, navigate }) => (
  <Card className="hover:shadow-md transition-shadow">
    <CardContent className="p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold">{buyer.name}</h3>
          <p className="text-xs text-muted-foreground">{buyer.location || 'Location not specified'}</p>
        </div>
        <Badge 
          className={cn(
            "text-sm font-bold",
            buyer.score >= 80 ? "bg-amber-500 text-white" :
            buyer.score >= 70 ? "bg-green-500 text-white" :
            "bg-blue-500 text-white"
          )}
        >
          {buyer.score}
        </Badge>
      </div>

      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
        <span>{buyer.budgetRange || 'Budget N/A'}</span>
        <span>•</span>
        <span>{buyer.bedrooms || 'Beds N/A'}</span>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        <Badge variant="outline" className={cn(
          "text-[10px]",
          assignment.status === 'contacted' ? "border-green-500/30 text-green-600" :
          "border-blue-500/30 text-blue-600"
        )}>
          {assignment.status}
        </Badge>
        {conversation && (
          <Badge variant="outline" className="text-[10px]">
            <MessageSquare className="h-2.5 w-2.5 mr-1" />
            In conversation
          </Badge>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
        <span>
          {assignment.assigned_at 
            ? `Assigned ${formatDistanceToNow(new Date(assignment.assigned_at), { addSuffix: true })}`
            : 'Recently assigned'
          }
        </span>
      </div>

      {conversation ? (
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => navigate(`${basePath}/conversations/${conversation.id}`)}
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          View Chat
        </Button>
      ) : (
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => navigate(`${basePath}/buyers`)}
        >
          Contact Buyer
        </Button>
      )}
    </CardContent>
  </Card>
);

// First Refusal Card Component
interface FirstRefusalCardProps {
  buyer: {
    id: string;
    name: string;
    location: string;
    budgetRange: string;
    bedrooms: string;
    timeline: string;
    paymentMethod: string;
    score: number;
  };
  onContact: (buyerId: string) => void;
}

const FirstRefusalCard: React.FC<FirstRefusalCardProps> = ({ buyer, onContact }) => (
  <Card className="border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-transparent hover:shadow-lg transition-shadow">
    <CardContent className="p-4">
      <Badge className="bg-amber-500 text-white text-[10px] mb-3">
        <Crown className="h-2.5 w-2.5 mr-1" />
        Priority
      </Badge>

      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-lg">{buyer.name}</h3>
          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
            <MapPin className="h-3.5 w-3.5" />
            {buyer.location || 'Location not specified'}
          </div>
        </div>
        <Badge className="bg-amber-500 text-white text-lg font-bold px-3">
          {buyer.score}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm mb-4">
        <div className="flex items-center gap-2">
          <Wallet className="h-4 w-4 text-amber-500" />
          <span>{buyer.budgetRange || 'N/A'}</span>
        </div>
        <div className="flex items-center gap-2">
          <BedDouble className="h-4 w-4 text-amber-500" />
          <span>{buyer.bedrooms || 'N/A'}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-amber-500/20">
        <span className="text-xs text-amber-600 font-medium">
          Only you can contact first
        </span>
        <Button 
          size="sm" 
          className="bg-amber-500 hover:bg-amber-600"
          onClick={() => onContact(buyer.id)}
        >
          Contact Now
        </Button>
      </div>
    </CardContent>
  </Card>
);

export default MyMatchesPage;
