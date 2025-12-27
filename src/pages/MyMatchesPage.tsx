import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { demoConversations, getFirstRefusalBuyers, Buyer } from '@/lib/buyerData';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { 
  Heart, 
  MessageSquare, 
  Users, 
  Eye, 
  Crown, 
  Zap,
  Search,
  MapPin,
  Wallet,
  BedDouble,
  Clock,
  CreditCard
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface MyMatchesPageProps {
  userType: 'developer' | 'agent' | 'broker';
}

const MyMatchesPage: React.FC<MyMatchesPageProps> = ({ userType }) => {
  const navigate = useNavigate();
  const { currentTier } = useSubscription();
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [budgetFilter, setBudgetFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('all');
  const basePath = `/${userType}`;

  // Get first refusal buyers (only for Tier 3)
  const firstRefusalBuyers = currentTier === 'enterprise' ? getFirstRefusalBuyers() : [];

  // Use conversations as matches (buyers the user has contacted)
  const regularMatches = demoConversations
    .filter(conv => {
      if (currentTier === 'access') return conv.buyer.score >= 50 && conv.buyer.score < 70;
      if (currentTier === 'growth') return conv.buyer.score >= 50;
      return true;
    })
    .filter(conv => {
      if (statusFilter === 'all') return true;
      if (statusFilter === 'contacted') return true;
      if (statusFilter === 'responded') return conv.status === 'buyer_responded';
      if (statusFilter === 'viewing') return false;
      return true;
    })
    .filter(conv => {
      if (!searchQuery) return true;
      return conv.buyer.name.toLowerCase().includes(searchQuery.toLowerCase());
    });

  // Filter first refusal buyers
  const filteredFirstRefusal = firstRefusalBuyers.filter(buyer => {
    if (searchQuery && !buyer.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (budgetFilter !== 'all' && !buyer.budget.includes(budgetFilter)) return false;
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

  const handleContactFirstRefusal = (buyer: Buyer) => {
    toast.success(`Contacting ${buyer.name}`, {
      description: 'Opening exclusive conversation...',
    });
  };

  const totalCount = regularMatches.length + (activeTab === 'all' || activeTab === 'first-refusal' ? filteredFirstRefusal.length : 0);

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
                  {regularMatches.length + filteredFirstRefusal.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="contacted">
                Contacted
                <Badge variant="secondary" className="ml-2 text-xs">
                  {regularMatches.length}
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

          {/* Filters */}
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
            
            {activeTab !== 'first-refusal' && (
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="responded">Responded</SelectItem>
                  <SelectItem value="viewing">Viewing Booked</SelectItem>
                </SelectContent>
              </Select>
            )}

            {(activeTab === 'all' || activeTab === 'first-refusal') && currentTier === 'enterprise' && (
              <Select value={budgetFilter} onValueChange={setBudgetFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Budget" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Budgets</SelectItem>
                  <SelectItem value="600K-800K">£600K-800K</SelectItem>
                  <SelectItem value="800K-1M">£800K-1M</SelectItem>
                  <SelectItem value="1M">£1M+</SelectItem>
                </SelectContent>
              </Select>
            )}
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
                        onContact={handleContactFirstRefusal}
                      />
                    ))}
                  </div>
                  {filteredFirstRefusal.length > 3 && (
                    <Button 
                      variant="outline" 
                      className="w-full border-amber-500/30 text-amber-600 hover:bg-amber-500/5"
                      onClick={() => setActiveTab('first-refusal')}
                    >
                      View all {filteredFirstRefusal.length} Priority buyers
                    </Button>
                  )}
                </div>
              )}

              {/* Regular Matches Section */}
              {regularMatches.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">Contacted Buyers</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {regularMatches.map((match) => (
                      <MatchCard 
                        key={match.id}
                        match={match}
                        basePath={basePath}
                        getStatusBadge={getStatusBadge}
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
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {regularMatches.map((match) => (
                <MatchCard 
                  key={match.id}
                  match={match}
                  basePath={basePath}
                  getStatusBadge={getStatusBadge}
                  navigate={navigate}
                />
              ))}
            </div>
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

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredFirstRefusal.map((buyer) => (
                  <FirstRefusalCard 
                    key={buyer.id} 
                    buyer={buyer} 
                    onContact={handleContactFirstRefusal}
                  />
                ))}
              </div>
            </TabsContent>
          )}
        </Tabs>

        {/* Empty State */}
        {totalCount === 0 && (
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
  match: typeof demoConversations[0];
  basePath: string;
  getStatusBadge: (conv: typeof demoConversations[0]) => React.ReactNode;
  navigate: (path: string) => void;
}

const MatchCard: React.FC<MatchCardProps> = ({ match, basePath, getStatusBadge, navigate }) => (
  <Card className="hover:shadow-md transition-shadow">
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
);

// First Refusal Card Component
interface FirstRefusalCardProps {
  buyer: Buyer;
  onContact: (buyer: Buyer) => void;
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
            {buyer.location}
          </div>
        </div>
        <Badge className="bg-amber-500 text-white text-lg font-bold px-3">
          {buyer.score}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm mb-4">
        <div className="flex items-center gap-2">
          <Wallet className="h-4 w-4 text-amber-500" />
          <span>{buyer.budget}</span>
        </div>
        <div className="flex items-center gap-2">
          <BedDouble className="h-4 w-4 text-amber-500" />
          <span>{buyer.bedrooms}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-amber-500" />
          <span>{buyer.timeline}</span>
        </div>
        <div className="flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-amber-500" />
          <span className="capitalize">{buyer.paymentMethod}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-4">
        <Badge 
          variant="outline" 
          className={cn(
            "text-[10px]",
            buyer.timeline === 'Within 28 days' 
              ? "border-red-500/30 text-red-600 bg-red-500/5" 
              : "border-amber-500/30 text-amber-600 bg-amber-500/5"
          )}
        >
          {buyer.timeline === 'Within 28 days' ? 'P1-Urgent' : 'P1-High Intent'}
        </Badge>
        <Badge variant="outline" className="text-[10px]">
          {buyer.purpose}
        </Badge>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-amber-500/20">
        <span className="text-xs text-amber-600 font-medium">
          Only you can contact first
        </span>
        <Button 
          size="sm" 
          className="bg-amber-500 hover:bg-amber-600"
          onClick={() => onContact(buyer)}
        >
          Contact Now
        </Button>
      </div>
    </CardContent>
  </Card>
);

export default MyMatchesPage;
