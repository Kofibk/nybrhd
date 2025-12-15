import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { 
  Download,
  ChevronDown,
  Calendar
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import ReportUploadDialog from "./ReportUploadDialog";
import { useUploadedData } from "@/contexts/DataContext";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface AdminCampaignsTableProps {
  searchQuery: string;
}

interface Campaign {
  id: string;
  name: string;
  client: string;
  clientType: string;
  status: string;
  budget: number;
  spent: number;
  leads: number;
  cpl: number;
  startDate: string;
  platform?: string;
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

const AdminCampaignsTable = ({ searchQuery }: AdminCampaignsTableProps) => {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [platformFilter, setPlatformFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });
  
  const { campaignData } = useUploadedData();
  const [localCampaigns, setLocalCampaigns] = useState<Campaign[]>([]);

  // Process uploaded campaign data
  useEffect(() => {
    if (campaignData && campaignData.length > 0) {
      const mappedCampaigns: Campaign[] = campaignData
        .filter((c) => {
          // Exclude Audience Network platform
          const platform = (c.Platform || c.platform || '').toLowerCase();
          return !platform.includes('audience network');
        })
        .map((c, index) => ({
          id: `uploaded-${index}`,
          name: c['Campaign name'] || c.name || 'Unknown Campaign',
          client: c.client || 'Uploaded',
          clientType: c.clientType || 'developer',
          status: c['Campaign delivery'] === 'archived' ? 'paused' : 
                  c['Campaign delivery'] === 'inactive' ? 'paused' : 'live',
          budget: parseFloat(c['Amount spent (GBP)'] || c.budget || '0') * 1.5 || 1000,
          spent: parseFloat(c['Amount spent (GBP)'] || c.spent || '0'),
          leads: parseInt(c.Results || c.leads || '0', 10),
          cpl: parseFloat(c['Amount spent (GBP)'] || '0') / Math.max(parseInt(c.Results || '1', 10), 1),
          startDate: c['Reporting starts'] || c.startDate || new Date().toISOString().split('T')[0],
          platform: c.Platform || c.platform || 'Facebook',
        }));
      
      setLocalCampaigns(mappedCampaigns);
    }
  }, [campaignData]);

  // Filter campaigns
  const filteredCampaigns = useMemo(() => {
    return localCampaigns.filter((campaign) => {
      // Search filter
      const matchesSearch = searchQuery === '' || 
        campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        campaign.client.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Status filter
      const matchesStatus = statusFilter === "all" || campaign.status === statusFilter;
      
      // Platform filter
      const matchesPlatform = platformFilter === "all" || 
        (campaign.platform?.toLowerCase() || '').includes(platformFilter.toLowerCase());
      
      // Date range filter
      let matchesDate = true;
      if (dateRange.from || dateRange.to) {
        const campaignDate = new Date(campaign.startDate);
        if (dateRange.from && campaignDate < dateRange.from) matchesDate = false;
        if (dateRange.to && campaignDate > dateRange.to) matchesDate = false;
      }
      
      return matchesSearch && matchesStatus && matchesPlatform && matchesDate;
    });
  }, [localCampaigns, searchQuery, statusFilter, platformFilter, dateRange]);

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
    
    // Calculate totals and create DevelopmentGroup objects
    const groupedData: DevelopmentGroup[] = Object.entries(groups).map(([name, campaigns]) => {
      const totalSpend = campaigns.reduce((sum, c) => sum + c.spent, 0);
      const totalLeads = campaigns.reduce((sum, c) => sum + c.leads, 0);
      const avgCpl = totalLeads > 0 ? totalSpend / totalLeads : 0;
      const avgCtr = campaigns.length > 0 ? 1.5 : 0; // Placeholder CTR
      
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
    
    // Filter by rating if selected
    const filteredByRating = ratingFilter === 'all' 
      ? groupedData 
      : groupedData.filter(g => g.rating === ratingFilter);
    
    // Sort by spend (highest first)
    return filteredByRating.sort((a, b) => b.totalSpend - a.totalSpend);
  }, [filteredCampaigns, ratingFilter]);

  // Get unique platforms for filter
  const uniquePlatforms = useMemo(() => {
    const platforms = new Set<string>();
    localCampaigns.forEach(c => {
      if (c.platform) platforms.add(c.platform);
    });
    return Array.from(platforms);
  }, [localCampaigns]);

  const handleCampaignsImport = (importedCampaigns: Campaign[]) => {
    setLocalCampaigns(prev => [...importedCampaigns, ...prev]);
  };

  const exportToCSV = () => {
    const headers = ["Development", "Campaign", "Platform", "Spend", "Leads", "CPL", "Status", "Start Date"];
    const rows: string[][] = [];
    
    developmentGroups.forEach(group => {
      group.campaigns.forEach(c => {
        rows.push([
          group.name,
          c.name,
          c.platform || 'Unknown',
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
    <Card>
      <CardHeader className="flex flex-col gap-4 p-4 md:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <CardTitle className="text-base md:text-lg">
            Campaigns by Development ({developmentGroups.length} developments, {filteredCampaigns.length} campaigns)
          </CardTitle>
          <div className="flex gap-2">
            <ReportUploadDialog 
              type="campaigns" 
              onUploadComplete={(data) => {
                console.log("Campaign report processed:", data);
              }}
              onCampaignsImport={handleCampaignsImport}
            />
            <Button onClick={exportToCSV} variant="outline" size="sm" className="gap-2 h-8">
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export</span>
            </Button>
          </div>
        </div>
        
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
      
      <CardContent className="p-4 md:p-6 pt-0">
        {developmentGroups.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="mb-2">No campaign data available</p>
            <p className="text-sm">Upload campaign data using the button above</p>
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
                          <TableRow key={campaign.id}>
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
                                {campaign.platform || 'Unknown'}
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
  );
};

export default AdminCampaignsTable;
