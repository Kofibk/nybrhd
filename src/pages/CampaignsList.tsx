import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserRole } from "@/lib/types";
import { useUploadedData } from "@/contexts/DataContext";
import { Plus, Upload, Download, Calendar, ChevronDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface CampaignsListProps {
  userType: UserRole;
}

interface Campaign {
  id: string;
  name: string;
  status: string;
  spent: number;
  leads: number;
  cpl: number;
  startDate: string;
  platform: string;
}

interface DevelopmentGroup {
  name: string;
  campaigns: Campaign[];
  totalSpend: number;
  totalLeads: number;
  avgCpl: number;
  avgCtr: number;
  rating: 'excellent' | 'good' | 'acceptable' | 'poor';
}

// Development name mapping
const getDevelopmentName = (campaignName: string): string => {
  const name = campaignName.toLowerCase();
  
  if (name.includes('chelsea island')) return 'Chelsea Island';
  if (name.includes('lucan')) return 'The Lucan';
  if (name.includes('haydon')) return 'The Haydon';
  if (name.includes('north kensington')) return 'North Kensington Gate';
  if (name.includes('one clapham')) return 'One Clapham';
  if (name.includes('river park')) return 'River Park Tower';
  if (name.includes('edit')) return 'The Edit';
  if (name.includes('lsq') && name.includes('croydon')) return 'LSQ Croydon';
  if (name.includes('lsq') && (name.includes('nine elms') || name.includes('ascenta'))) return 'LSQ Nine Elms';
  if (name.includes('lsq') && name.includes('wandsworth')) return 'LSQ Wandsworth Common';
  if (name.includes('million pound') || name.includes('mph b2c')) return 'MPH Property Buyers';
  if (name.includes('b2b mph')) return 'MPH B2B';
  if (name.includes('dubai')) return 'Dubai';
  if (name.includes('thornton')) return 'Thornton Road';
  if (name.includes('tudor') || name.includes('finance')) return 'Tudor Financial';
  
  return 'Other';
};

// CPL rating calculation
const getCplRating = (cpl: number): 'excellent' | 'good' | 'acceptable' | 'poor' => {
  if (cpl < 20) return 'excellent';
  if (cpl <= 35) return 'good';
  if (cpl <= 50) return 'acceptable';
  return 'poor';
};

// CPL color classes
const getCplColorClass = (cpl: number): string => {
  if (cpl < 20) return 'text-green-600 dark:text-green-400';
  if (cpl <= 35) return 'text-green-500 dark:text-green-300';
  if (cpl <= 50) return 'text-amber-500 dark:text-amber-400';
  return 'text-red-500 dark:text-red-400';
};

// Rating badge component
const RatingBadge = ({ rating }: { rating: 'excellent' | 'good' | 'acceptable' | 'poor' }) => {
  const config = {
    excellent: { emoji: '🟢', label: 'Excellent', class: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
    good: { emoji: '🟢', label: 'Good', class: 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300' },
    acceptable: { emoji: '🟡', label: 'Acceptable', class: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' },
    poor: { emoji: '🔴', label: 'Poor', class: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
  };
  
  const { emoji, label, class: className } = config[rating];
  
  return (
    <Badge variant="outline" className={cn("text-xs font-medium", className)}>
      {emoji} {label}
    </Badge>
  );
};

const CampaignsList = ({ userType }: CampaignsListProps) => {
  const navigate = useNavigate();
  const { campaignData } = useUploadedData(userType);
  
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [platformFilter, setPlatformFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });

  // Process uploaded campaign data - exclude Audience Network
  const allCampaigns = useMemo(() => {
    if (campaignData.length === 0) return [];
    
    return campaignData
      .filter((row) => {
        // Exclude Audience Network platform
        const platform = (row.Platform || row.platform || '').toLowerCase();
        return !platform.includes('audience network');
      })
      .map((row, index) => {
        const name = row['Campaign name'] || row.name || row.campaign_name || row.Name || 
          row['Campaign Name'] || row.campaign || row.Campaign || `Campaign ${index + 1}`;
        
        const rawStatus = (row.status || row.Status || row['Campaign delivery'] || 'live').toString().toLowerCase();
        let status = 'live';
        if (rawStatus.includes('draft')) status = 'draft';
        else if (rawStatus.includes('pause') || rawStatus.includes('inactive') || rawStatus.includes('archived')) status = 'paused';
        else if (rawStatus.includes('complete') || rawStatus.includes('ended')) status = 'completed';
        
        const spent = parseFloat(String(row['Amount spent (GBP)'] || row.spend || row.Spend || row.spent || '0').replace(/[£$,]/g, '')) || 0;
        const leads = parseInt(row.Results || row.leads || row.Leads || row['Lead Count'] || row.conversions || '0') || 0;
        const cpl = leads > 0 ? spent / leads : 0;
        
        const startDate = row['Reporting starts'] || row.start_date || row.startDate || 
          row['Start Date'] || row.date || row.Date || new Date().toISOString();
        
        const platform = row.Platform || row.platform || 'Facebook';

        return {
          id: row.id || row.campaign_id || row['Campaign ID'] || `campaign_${index}`,
          name,
          status,
          spent,
          leads,
          cpl,
          startDate,
          platform,
        };
      });
  }, [campaignData]);

  // Filter campaigns
  const filteredCampaigns = useMemo(() => {
    return allCampaigns.filter((campaign) => {
      const matchesStatus = statusFilter === "all" || campaign.status === statusFilter;
      const matchesPlatform = platformFilter === "all" || 
        campaign.platform.toLowerCase().includes(platformFilter.toLowerCase());
      
      let matchesDate = true;
      if (dateRange.from || dateRange.to) {
        const campaignDate = new Date(campaign.startDate);
        if (dateRange.from && campaignDate < dateRange.from) matchesDate = false;
        if (dateRange.to && campaignDate > dateRange.to) matchesDate = false;
      }
      
      return matchesStatus && matchesPlatform && matchesDate;
    });
  }, [allCampaigns, statusFilter, platformFilter, dateRange]);

  // Group campaigns by development
  const developmentGroups = useMemo(() => {
    const groups: Record<string, Campaign[]> = {};
    
    filteredCampaigns.forEach((campaign) => {
      const devName = getDevelopmentName(campaign.name);
      if (devName === 'Thornton Road') return; // Exclude Thornton Road
      
      if (!groups[devName]) {
        groups[devName] = [];
      }
      groups[devName].push(campaign);
    });
    
    const groupedData: DevelopmentGroup[] = Object.entries(groups).map(([name, campaigns]) => {
      const totalSpend = campaigns.reduce((sum, c) => sum + c.spent, 0);
      const totalLeads = campaigns.reduce((sum, c) => sum + c.leads, 0);
      const avgCpl = totalLeads > 0 ? totalSpend / totalLeads : 0;
      const avgCtr = 1.5; // Placeholder CTR
      
      return {
        name,
        campaigns,
        totalSpend,
        totalLeads,
        avgCpl,
        avgCtr,
        rating: getCplRating(avgCpl),
      };
    });
    
    // Filter by rating
    const filteredByRating = ratingFilter === 'all' 
      ? groupedData 
      : groupedData.filter(g => g.rating === ratingFilter);
    
    // Sort by spend (highest first)
    return filteredByRating.sort((a, b) => b.totalSpend - a.totalSpend);
  }, [filteredCampaigns, ratingFilter]);

  // Get unique platforms for filter
  const uniquePlatforms = useMemo(() => {
    const platforms = new Set<string>();
    allCampaigns.forEach(c => {
      if (c.platform) platforms.add(c.platform);
    });
    return Array.from(platforms);
  }, [allCampaigns]);

  const exportToCSV = () => {
    const headers = ["Development", "Campaign", "Platform", "Spend", "Leads", "CPL", "Status", "Start Date"];
    const rows: string[][] = [];
    
    developmentGroups.forEach(group => {
      group.campaigns.forEach(c => {
        rows.push([
          group.name,
          c.name,
          c.platform,
          c.spent.toString(),
          c.leads.toString(),
          c.cpl.toFixed(2),
          c.status,
          c.startDate
        ]);
      });
    });
    
    const csvContent = [headers.join(","), ...rows.map(row => row.map(cell => `"${cell}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `campaigns_by_development_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    toast({ title: "Export successful", description: `${rows.length} campaigns exported.` });
  };

  const clearDateRange = () => {
    setDateRange({ from: undefined, to: undefined });
  };

  return (
    <DashboardLayout title="Campaigns" userType={userType}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 md:mb-4">
        <div>
          <h2 className="text-base md:text-lg font-semibold">Campaigns by Development</h2>
          <p className="text-xs text-muted-foreground">
            {allCampaigns.length > 0 
              ? `${developmentGroups.length} developments, ${filteredCampaigns.length} campaigns`
              : 'Upload campaign data from the dashboard to view campaigns'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportToCSV} variant="outline" size="sm" className="gap-2" disabled={allCampaigns.length === 0}>
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          <Button onClick={() => navigate(`/${userType}/campaigns/new`)} size="sm" className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-1.5" />
            New Campaign
          </Button>
        </div>
      </div>

      {allCampaigns.length > 0 ? (
        <Card className="shadow-card">
          <CardHeader className="p-4 pb-2">
            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              <Select value={ratingFilter} onValueChange={setRatingFilter}>
                <SelectTrigger className="w-32 text-xs h-8">
                  <SelectValue placeholder="Rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ratings</SelectItem>
                  <SelectItem value="excellent">🟢 Excellent</SelectItem>
                  <SelectItem value="good">🟢 Good</SelectItem>
                  <SelectItem value="acceptable">🟡 Acceptable</SelectItem>
                  <SelectItem value="poor">🔴 Poor</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={platformFilter} onValueChange={setPlatformFilter}>
                <SelectTrigger className="w-32 text-xs h-8">
                  <SelectValue placeholder="Platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Platforms</SelectItem>
                  {uniquePlatforms.map(platform => (
                    <SelectItem key={platform} value={platform}>{platform}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 gap-2 text-xs">
                    <Calendar className="h-3.5 w-3.5" />
                    {dateRange.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "dd/MM/yy")} - {format(dateRange.to, "dd/MM/yy")}
                        </>
                      ) : (
                        format(dateRange.from, "dd/MM/yy")
                      )
                    ) : (
                      "Date Range"
                    )}
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange.from}
                    selected={{ from: dateRange.from, to: dateRange.to }}
                    onSelect={(range) => setDateRange({ from: range?.from, to: range?.to })}
                    numberOfMonths={2}
                  />
                  {(dateRange.from || dateRange.to) && (
                    <div className="p-2 border-t">
                      <Button variant="ghost" size="sm" onClick={clearDateRange} className="w-full text-xs">
                        Clear dates
                      </Button>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-28 text-xs h-8">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="live">Live</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          
          <CardContent className="p-4 pt-2">
            {developmentGroups.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No campaigns match the selected filters</p>
              </div>
            ) : (
              <Accordion type="multiple" className="space-y-3">
                {developmentGroups.map((group) => (
                  <AccordionItem 
                    key={group.name} 
                    value={group.name}
                    className="border rounded-lg px-4 bg-card"
                  >
                    <AccordionTrigger className="hover:no-underline py-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-2 sm:gap-4 pr-4">
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-sm md:text-base">{group.name}</span>
                          <RatingBadge rating={group.rating} />
                        </div>
                        <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs sm:text-sm text-muted-foreground">
                          <span>
                            <span className="font-medium text-foreground">£{group.totalSpend.toLocaleString()}</span> spent
                          </span>
                          <span>
                            <span className="font-medium text-foreground">{group.totalLeads.toLocaleString()}</span> leads
                          </span>
                          <span>
                            CPL: <span className={cn("font-medium", getCplColorClass(group.avgCpl))}>
                              £{group.avgCpl.toFixed(2)}
                            </span>
                          </span>
                          <span className="text-muted-foreground/60">
                            {group.campaigns.length} campaign{group.campaigns.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="overflow-x-auto -mx-4 px-4 pb-4">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="text-xs">Campaign Name</TableHead>
                              <TableHead className="text-xs">Platform</TableHead>
                              <TableHead className="text-xs text-right">Spend</TableHead>
                              <TableHead className="text-xs text-center">Leads</TableHead>
                              <TableHead className="text-xs text-right">CPL</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {group.campaigns.map((campaign) => (
                              <TableRow 
                                key={campaign.id}
                                className="cursor-pointer hover:bg-muted/50"
                                onClick={() => navigate(`/${userType}/campaigns/${campaign.id}`)}
                              >
                                <TableCell className="text-xs md:text-sm">
                                  <div>
                                    <p className="font-medium truncate max-w-[200px] sm:max-w-none">{campaign.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {new Date(campaign.startDate).toLocaleDateString('en-GB')}
                                    </p>
                                  </div>
                                </TableCell>
                                <TableCell className="text-xs md:text-sm">
                                  <Badge variant="outline" className="text-xs">
                                    {campaign.platform}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-xs md:text-sm text-right">
                                  £{campaign.spent.toLocaleString()}
                                </TableCell>
                                <TableCell className="text-xs md:text-sm text-center">
                                  {campaign.leads}
                                </TableCell>
                                <TableCell className={cn("text-xs md:text-sm text-right font-medium", getCplColorClass(campaign.cpl))}>
                                  {campaign.cpl > 0 ? `£${campaign.cpl.toFixed(2)}` : '-'}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="p-8 md:p-12 text-center">
          <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Campaign Data</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Upload your campaign data CSV from the main dashboard to view and analyse your campaigns here.
          </p>
          <Button onClick={() => navigate(`/${userType}`)}>
            Go to Dashboard
          </Button>
        </Card>
      )}
    </DashboardLayout>
  );
};

export default CampaignsList;
