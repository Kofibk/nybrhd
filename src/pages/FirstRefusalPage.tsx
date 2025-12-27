import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { getFirstRefusalBuyers, Buyer } from '@/lib/buyerData';
import { 
  Search, 
  MapPin, 
  Wallet, 
  BedDouble, 
  Clock, 
  CreditCard,
  Zap,
  Crown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Navigate } from 'react-router-dom';

interface FirstRefusalPageProps {
  userType: 'developer' | 'agent' | 'broker';
}

const FirstRefusalPage: React.FC<FirstRefusalPageProps> = ({ userType }) => {
  const { currentTier } = useSubscription();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [budgetFilter, setBudgetFilter] = React.useState('all');
  const [locationFilter, setLocationFilter] = React.useState('all');
  const [timelineFilter, setTimelineFilter] = React.useState('all');

  // Only accessible to Tier 3
  if (currentTier !== 'enterprise') {
    return <Navigate to={`/${userType}`} replace />;
  }

  const allBuyers = getFirstRefusalBuyers();

  // Apply filters
  const filteredBuyers = allBuyers.filter(buyer => {
    if (searchQuery && !buyer.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (budgetFilter !== 'all' && !buyer.budget.includes(budgetFilter)) return false;
    if (locationFilter !== 'all' && !buyer.location.toLowerCase().includes(locationFilter.toLowerCase())) return false;
    if (timelineFilter !== 'all' && buyer.timeline !== timelineFilter) return false;
    return true;
  });

  const handleContact = (buyer: Buyer) => {
    toast.success(`Contacting ${buyer.name}`, {
      description: 'Opening exclusive conversation...',
    });
  };

  return (
    <DashboardLayout title="First Refusal" userType={userType}>
      <div className="space-y-6">
        {/* Header */}
        <Card className="bg-gradient-to-r from-amber-500/10 to-amber-600/5 border-amber-500/20">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-500/20">
                <Zap className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <h2 className="font-semibold flex items-center gap-2">
                  First Refusal Buyers
                  <Badge className="bg-amber-500 text-white">Score 80+</Badge>
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  You get first contact with these premium buyers before they're available to other users. 
                  {allBuyers.length} exclusive buyers available.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search buyers..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          
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

          <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              <SelectItem value="london">London</SelectItem>
              <SelectItem value="dubai">Dubai</SelectItem>
              <SelectItem value="singapore">Singapore</SelectItem>
            </SelectContent>
          </Select>

          <Select value={timelineFilter} onValueChange={setTimelineFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Timeline" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Timelines</SelectItem>
              <SelectItem value="Within 28 days">Within 28 days (Urgent)</SelectItem>
              <SelectItem value="0-3 months">0-3 months</SelectItem>
              <SelectItem value="3-6 months">3-6 months</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Buyer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredBuyers.map((buyer) => (
            <Card 
              key={buyer.id} 
              className="border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-transparent hover:shadow-lg transition-shadow"
            >
              <CardContent className="p-4">
                {/* Premium Badge */}
                <Badge className="bg-amber-500 text-white text-[10px] mb-3">
                  <Crown className="h-2.5 w-2.5 mr-1" />
                  First Refusal
                </Badge>

                {/* Header */}
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

                {/* Details Grid */}
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

                {/* Tags */}
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

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-amber-500/20">
                  <span className="text-xs text-amber-600 font-medium">
                    Only you can contact first
                  </span>
                  <Button 
                    size="sm" 
                    className="bg-amber-500 hover:bg-amber-600"
                    onClick={() => handleContact(buyer)}
                  >
                    Contact Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredBuyers.length === 0 && (
          <Card className="p-8 text-center border-amber-500/20">
            <Zap className="h-12 w-12 mx-auto text-amber-500/50" />
            <h3 className="mt-4 font-semibold">No premium buyers match your filters</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Try adjusting your filters to see more results
            </p>
            <Button 
              variant="outline" 
              className="mt-4 border-amber-500/30 text-amber-600"
              onClick={() => {
                setSearchQuery('');
                setBudgetFilter('all');
                setLocationFilter('all');
                setTimelineFilter('all');
              }}
            >
              Reset Filters
            </Button>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default FirstRefusalPage;
