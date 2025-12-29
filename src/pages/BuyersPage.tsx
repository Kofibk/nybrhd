import React, { useState, useMemo } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useContactedBuyers } from '@/hooks/useContactedBuyers';
import { useAirtableBuyersForTable, TransformedBuyer } from '@/hooks/useAirtableData';
import { 
  Search, 
  MapPin, 
  Wallet, 
  BedDouble, 
  Clock, 
  CreditCard,
  Users,
  Info,
  Zap,
  CheckCircle,
  Loader2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import RequestIntroductionModal from '@/components/RequestIntroductionModal';

interface BuyersPageProps {
  userType: 'developer' | 'agent' | 'broker';
}

// Score breakdown for display
const getScoreBreakdown = (buyer: TransformedBuyer) => {
  const breakdown = [];
  
  // Timeline scoring
  const timeline = buyer.timeline?.toLowerCase() || '';
  if (timeline.includes('28 days') || timeline.includes('immediately')) {
    breakdown.push({ label: 'Timeline', value: '+25', description: 'Within 28 days' });
  } else if (timeline.includes('3 month')) {
    breakdown.push({ label: 'Timeline', value: '+20', description: '0-3 months' });
  } else {
    breakdown.push({ label: 'Timeline', value: '+10', description: '3+ months' });
  }
  
  // Payment method scoring
  if (buyer.paymentMethod?.toLowerCase().includes('cash')) {
    breakdown.push({ label: 'Payment', value: '+25', description: 'Cash buyer' });
  } else {
    breakdown.push({ label: 'Payment', value: '+15', description: 'Mortgage' });
  }
  
  // Purpose scoring
  if (buyer.purpose?.toLowerCase().includes('investment')) {
    breakdown.push({ label: 'Purpose', value: '+20', description: 'Investment' });
  } else {
    breakdown.push({ label: 'Purpose', value: '+15', description: buyer.purpose || 'Primary home' });
  }
  
  return breakdown;
};

const BuyersPage: React.FC<BuyersPageProps> = ({ userType }) => {
  const { currentTier } = useSubscription();
  const { isContacted, getContactInfo } = useContactedBuyers();
  const [searchQuery, setSearchQuery] = useState('');
  const [budgetFilter, setBudgetFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [bedroomsFilter, setBedroomsFilter] = useState('all');
  const [timelineFilter, setTimelineFilter] = useState('all');
  const [scoreFilter, setScoreFilter] = useState('all');
  const [selectedBuyer, setSelectedBuyer] = useState<TransformedBuyer | null>(null);
  const [introductionBuyer, setIntroductionBuyer] = useState<TransformedBuyer | null>(null);

  // Fetch buyers from Airtable using the new hook
  const { 
    buyers: airtableBuyers, 
    isLoading, 
    error, 
    refetch 
  } = useAirtableBuyersForTable({ enabled: true });

  // Filter buyers based on subscription tier
  const tierFilteredBuyers = useMemo(() => {
    return airtableBuyers.filter(buyer => {
      // Only show "Contact Pending" status buyers
      if (buyer.status && buyer.status !== 'Contact Pending') return false;
      
      switch (currentTier) {
        case 'access':
          return buyer.score >= 50 && buyer.score < 70;
        case 'growth':
          return buyer.score >= 50;
        case 'enterprise':
          return true;
        default:
          return buyer.score >= 50 && buyer.score < 70;
      }
    });
  }, [airtableBuyers, currentTier]);

  // Apply user filters
  const filteredBuyers = tierFilteredBuyers.filter(buyer => {
    if (searchQuery && !buyer.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (budgetFilter !== 'all' && !buyer.budgetRange.toLowerCase().includes(budgetFilter.toLowerCase())) return false;
    if (locationFilter !== 'all' && !buyer.location.toLowerCase().includes(locationFilter.toLowerCase())) return false;
    if (bedroomsFilter !== 'all' && !buyer.bedrooms.includes(bedroomsFilter)) return false;
    if (timelineFilter !== 'all' && !buyer.timeline.toLowerCase().includes(timelineFilter.toLowerCase())) return false;
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

  const getPriorityFromScore = (score: number) => {
    if (score >= 80) return 'P1-Urgent';
    if (score >= 70) return 'P1-High Intent';
    if (score >= 50) return 'P2-Qualified';
    return 'P3-Nurture';
  };

  const getPriorityColor = (priority: string) => {
    if (priority.includes('Urgent')) return 'border-red-500/30 text-red-600 bg-red-500/5';
    if (priority.includes('High Intent')) return 'border-amber-500/30 text-amber-600 bg-amber-500/5';
    if (priority.includes('Qualified')) return 'border-blue-500/30 text-blue-600 bg-blue-500/5';
    return 'border-muted-foreground/30 text-muted-foreground';
  };

  const handleRequestIntroduction = (buyer: TransformedBuyer) => {
    setIntroductionBuyer(buyer);
  };

  const scoreSubtext = currentTier === 'access' 
    ? 'Score 50-69' 
    : currentTier === 'growth' 
      ? 'All Score 50+' 
      : 'Full database access';

  // Loading state
  if (isLoading) {
    return (
      <DashboardLayout title="Buyers" userType={userType}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="mt-2 text-muted-foreground">Loading buyers...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Buyers" userType={userType}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              {scoreSubtext} • {tierFilteredBuyers.length} buyers available
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetch()}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        {/* Error banner */}
        {error && (
          <Card className="border-amber-500/30 bg-amber-500/5">
            <CardContent className="py-3 flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              <div className="flex-1">
                <p className="text-sm font-medium">Could not load live data</p>
                <p className="text-xs text-muted-foreground">Click refresh to try again.</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                Retry
              </Button>
            </CardContent>
          </Card>
        )}

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
              <SelectItem value="400k">£400K-600K</SelectItem>
              <SelectItem value="600k">£600K-800K</SelectItem>
              <SelectItem value="750k">£750K-1M</SelectItem>
              <SelectItem value="1m">£1M+</SelectItem>
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
              <SelectItem value="uk">UK</SelectItem>
            </SelectContent>
          </Select>

          <Select value={bedroomsFilter} onValueChange={setBedroomsFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Bedrooms" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="1">1 Bed</SelectItem>
              <SelectItem value="2">2 Bed</SelectItem>
              <SelectItem value="3">3 Bed</SelectItem>
              <SelectItem value="4">4+ Bed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={timelineFilter} onValueChange={setTimelineFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Timeline" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="28 days">Within 28 days</SelectItem>
              <SelectItem value="3 month">0-3 months</SelectItem>
              <SelectItem value="6 month">3-6 months</SelectItem>
              <SelectItem value="12 month">6-12 months</SelectItem>
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

        {/* Empty state */}
        {filteredBuyers.length === 0 && !isLoading && (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">No buyers found</h3>
              <p className="text-muted-foreground mt-1">
                {airtableBuyers.length === 0 
                  ? 'No buyers available at the moment. Check back later.' 
                  : 'Try adjusting your filters to see more buyers.'}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Buyer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredBuyers.map((buyer) => {
            const priority = getPriorityFromScore(buyer.score);
            
            return (
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
                        {buyer.location || buyer.country || 'Not specified'}
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
                      <span>{buyer.budgetRange || 'Not specified'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <BedDouble className="h-3 w-3 text-muted-foreground" />
                      <span>{buyer.bedrooms || 'Any'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span>{buyer.timeline || 'Not specified'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CreditCard className="h-3 w-3 text-muted-foreground" />
                      <span className="capitalize">{buyer.paymentMethod || 'Not specified'}</span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    <Badge variant="outline" className={cn("text-[10px]", getPriorityColor(priority))}>
                      {priority}
                    </Badge>
                    <Badge variant="outline" className="text-[10px]">
                      {buyer.purpose || 'Not specified'}
                    </Badge>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    {isContacted(buyer.id) ? (
                      <>
                        <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Introduced via {getContactInfo(buyer.id)?.channel === 'whatsapp' ? 'WhatsApp' : 'Email'}
                        </Badge>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-7 text-xs"
                          onClick={() => handleRequestIntroduction(buyer)}
                        >
                          View Details
                        </Button>
                      </>
                    ) : (
                      <>
                        {buyer.score >= 80 && currentTier === 'enterprise' ? (
                          <span className="text-xs text-amber-600 font-medium">
                            Only you can contact first
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            Ready to contact
                          </span>
                        )}
                        <Button 
                          size="sm" 
                          className="h-7 text-xs"
                          onClick={() => handleRequestIntroduction(buyer)}
                        >
                          Request Introduction
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Score Breakdown Dialog */}
        <Dialog open={!!selectedBuyer} onOpenChange={() => setSelectedBuyer(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Score Breakdown for {selectedBuyer?.name}</DialogTitle>
            </DialogHeader>
            {selectedBuyer && (
              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  <div className={cn(
                    "text-4xl font-bold rounded-full w-20 h-20 flex items-center justify-center",
                    getScoreColor(selectedBuyer.score)
                  )}>
                    {selectedBuyer.score}
                  </div>
                </div>
                <div className="space-y-2">
                  {getScoreBreakdown(selectedBuyer).map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                      <div>
                        <span className="font-medium">{item.label}</span>
                        <span className="text-xs text-muted-foreground ml-2">{item.description}</span>
                      </div>
                      <span className="text-green-600 font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Request Introduction Modal */}
        {introductionBuyer && (
          <RequestIntroductionModal
            isOpen={!!introductionBuyer}
            onClose={() => setIntroductionBuyer(null)}
            buyer={{
              id: introductionBuyer.id,
              name: introductionBuyer.name,
              email: introductionBuyer.email,
              phone: introductionBuyer.phone,
              score: introductionBuyer.score,
              budget: introductionBuyer.budgetRange,
              location: introductionBuyer.location || introductionBuyer.country,
              bedrooms: introductionBuyer.bedrooms || 'Any',
              timeline: introductionBuyer.timeline,
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default BuyersPage;
