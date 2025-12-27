import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { getBuyersByTier, getScoreBreakdown, Buyer } from '@/lib/buyerData';
import { 
  Search, 
  MapPin, 
  Wallet, 
  BedDouble, 
  Clock, 
  CreditCard,
  Users,
  ChevronUp,
  Info,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface BuyersPageProps {
  userType: 'developer' | 'agent' | 'broker';
}

const BuyersPage: React.FC<BuyersPageProps> = ({ userType }) => {
  const { currentTier } = useSubscription();
  const [searchQuery, setSearchQuery] = useState('');
  const [budgetFilter, setBudgetFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [bedroomsFilter, setBedroomsFilter] = useState('all');
  const [timelineFilter, setTimelineFilter] = useState('all');
  const [scoreFilter, setScoreFilter] = useState('all');
  const [selectedBuyer, setSelectedBuyer] = useState<Buyer | null>(null);

  const allBuyers = getBuyersByTier(currentTier);

  // Apply filters
  const filteredBuyers = allBuyers.filter(buyer => {
    if (searchQuery && !buyer.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (budgetFilter !== 'all' && !buyer.budget.includes(budgetFilter)) return false;
    if (locationFilter !== 'all' && !buyer.location.toLowerCase().includes(locationFilter.toLowerCase())) return false;
    if (bedroomsFilter !== 'all' && !buyer.bedrooms.includes(bedroomsFilter)) return false;
    if (timelineFilter !== 'all' && buyer.timeline !== timelineFilter) return false;
    if (scoreFilter !== 'all') {
      if (scoreFilter === '80+' && buyer.score < 80) return false;
      if (scoreFilter === '70-79' && (buyer.score < 70 || buyer.score >= 80)) return false;
      if (scoreFilter === '50-69' && (buyer.score < 50 || buyer.score >= 70)) return false;
    }
    return true;
  });

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-amber-500 text-white';
    if (score >= 70) return 'bg-green-500 text-white';
    if (score >= 50) return 'bg-blue-500 text-white';
    return 'bg-muted text-muted-foreground';
  };

  const getPriorityColor = (priority: string) => {
    if (priority.includes('Urgent')) return 'border-red-500/30 text-red-600 bg-red-500/5';
    if (priority.includes('High Intent')) return 'border-amber-500/30 text-amber-600 bg-amber-500/5';
    if (priority.includes('Qualified')) return 'border-blue-500/30 text-blue-600 bg-blue-500/5';
    return 'border-muted-foreground/30 text-muted-foreground';
  };

  const handleContact = (buyer: Buyer) => {
    toast.success(`Contacting ${buyer.name}`, {
      description: 'Opening conversation...',
    });
  };

  const scoreSubtext = currentTier === 'access' 
    ? 'Score 50-69' 
    : currentTier === 'growth' 
      ? 'All Score 50+' 
      : 'Full database access';

  const lockedBuyerCount = currentTier === 'access' ? getBuyersByTier('growth').length - allBuyers.length : 0;

  return (
    <DashboardLayout title="Buyers" userType={userType}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <p className="text-sm text-muted-foreground">
            {scoreSubtext} • {allBuyers.length} buyers available
          </p>
        </div>

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
              <SelectItem value="400K-600K">£400K-600K</SelectItem>
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
              <SelectItem value="manchester">Manchester</SelectItem>
              <SelectItem value="dubai">Dubai</SelectItem>
              <SelectItem value="singapore">Singapore</SelectItem>
            </SelectContent>
          </Select>

          <Select value={bedroomsFilter} onValueChange={setBedroomsFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Bedrooms" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="1 Bed">1 Bed</SelectItem>
              <SelectItem value="2 Bed">2 Bed</SelectItem>
              <SelectItem value="3 Bed">3 Bed</SelectItem>
              <SelectItem value="4+">4+ Bed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={timelineFilter} onValueChange={setTimelineFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Timeline" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="Within 28 days">Within 28 days</SelectItem>
              <SelectItem value="0-3 months">0-3 months</SelectItem>
              <SelectItem value="3-6 months">3-6 months</SelectItem>
              <SelectItem value="6-12 months">6-12 months</SelectItem>
            </SelectContent>
          </Select>

          {currentTier !== 'access' && (
            <Select value={scoreFilter} onValueChange={setScoreFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Score" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Scores</SelectItem>
                <SelectItem value="80+">80+ (High Intent)</SelectItem>
                <SelectItem value="70-79">70-79</SelectItem>
                <SelectItem value="50-69">50-69</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Buyer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredBuyers.map((buyer) => (
            <Card 
              key={buyer.id} 
              className={cn(
                "hover:shadow-md transition-shadow",
                buyer.score >= 80 && "border-amber-500/30 bg-amber-500/5"
              )}
            >
              <CardContent className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{buyer.name}</h3>
                      {buyer.score >= 80 && currentTier === 'enterprise' && (
                        <Badge className="bg-amber-500 text-white text-[9px]">
                          <Zap className="h-2 w-2 mr-0.5" />
                          First Refusal
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                      <MapPin className="h-3 w-3" />
                      {buyer.location}
                    </div>
                  </div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge 
                        className={cn(
                          "text-sm font-bold cursor-pointer",
                          getScoreColor(buyer.score)
                        )}
                        onClick={() => currentTier !== 'access' && setSelectedBuyer(buyer)}
                      >
                        {buyer.score}
                        {currentTier !== 'access' && <Info className="h-3 w-3 ml-1" />}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      {currentTier === 'access' 
                        ? 'Upgrade to see score breakdown' 
                        : 'Click to see score breakdown'
                      }
                    </TooltipContent>
                  </Tooltip>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                  <div className="flex items-center gap-1.5">
                    <Wallet className="h-3 w-3 text-muted-foreground" />
                    <span>{buyer.budget}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <BedDouble className="h-3 w-3 text-muted-foreground" />
                    <span>{buyer.bedrooms}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span>{buyer.timeline}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CreditCard className="h-3 w-3 text-muted-foreground" />
                    <span className="capitalize">{buyer.paymentMethod}</span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  <Badge variant="outline" className={cn("text-[10px]", getPriorityColor(buyer.priority))}>
                    {buyer.priority}
                  </Badge>
                  <Badge variant="outline" className="text-[10px]">
                    {buyer.purpose}
                  </Badge>
                  {buyer.preferredAreas.slice(0, 1).map((area, i) => (
                    <Badge key={i} variant="secondary" className="text-[10px]">
                      {area}
                    </Badge>
                  ))}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-2 border-t">
                  {buyer.score >= 80 && currentTier === 'enterprise' ? (
                    <span className="text-xs text-amber-600 font-medium">
                      Only you can contact first
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      <Users className="h-3 w-3 inline mr-1" />
                      {buyer.contactsRemaining} of 4 contacts left
                    </span>
                  )}
                  <Button size="sm" className="h-7 text-xs" onClick={() => handleContact(buyer)}>
                    Contact
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredBuyers.length === 0 && (
          <Card className="p-8 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground/50" />
            <h3 className="mt-4 font-semibold">No buyers match your filters</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Try adjusting your filters to see more results
            </p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => {
                setSearchQuery('');
                setBudgetFilter('all');
                setLocationFilter('all');
                setBedroomsFilter('all');
                setTimelineFilter('all');
                setScoreFilter('all');
              }}
            >
              Reset Filters
            </Button>
          </Card>
        )}

        {/* Locked Buyers Banner (Tier 1) */}
        {currentTier === 'access' && lockedBuyerCount > 0 && (
          <Card className="bg-gradient-to-r from-amber-500/5 to-amber-600/10 border-amber-500/20">
            <CardContent className="py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ChevronUp className="h-5 w-5 text-amber-500" />
                <div>
                  <p className="text-sm font-medium">
                    {lockedBuyerCount} more high-intent buyers available in Growth
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Access buyers with scores 70+ and campaign features
                  </p>
                </div>
              </div>
              <Button size="sm" className="bg-amber-500 hover:bg-amber-600">
                Upgrade to Growth
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Score Breakdown Modal (Tier 2+) */}
      <Dialog open={!!selectedBuyer} onOpenChange={() => setSelectedBuyer(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Score Breakdown: {selectedBuyer?.name}</DialogTitle>
          </DialogHeader>
          {selectedBuyer && (
            <div className="space-y-4">
              <div className="text-center">
                <Badge className={cn("text-2xl px-4 py-2", getScoreColor(selectedBuyer.score))}>
                  {selectedBuyer.score}
                </Badge>
                <p className="text-sm text-muted-foreground mt-2">Overall Intent Score</p>
              </div>
              
              {(() => {
                const breakdown = getScoreBreakdown(selectedBuyer);
                return (
                  <div className="space-y-3">
                    {Object.entries(breakdown).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${(value / 30) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium w-8 text-right">+{value}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}

              <div className="pt-4 border-t">
                <Button className="w-full" onClick={() => {
                  handleContact(selectedBuyer);
                  setSelectedBuyer(null);
                }}>
                  Contact {selectedBuyer.name}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default BuyersPage;
