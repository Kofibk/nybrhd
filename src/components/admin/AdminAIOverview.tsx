import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Brain,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Lightbulb,
  Target,
  Users,
  PoundSterling,
  RefreshCw,
  ChevronRight,
  CheckCircle,
  Megaphone,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

interface AIInsight {
  id: string;
  type: "working" | "attention";
  title: string;
  description: string;
  metric?: string;
  action?: string;
}

interface CampaignData {
  id: string;
  name: string;
  totalLeads: number;
  avgCPL: number;
  avgLeadScore: number;
  bestAudience: string;
  region: string;
}

type SortField = "name" | "totalLeads" | "avgCPL" | "avgLeadScore";
type SortOrder = "asc" | "desc";

const AdminAIOverview = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignData[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  // Filter and sort state
  const [searchQuery, setSearchQuery] = useState("");
  const [regionFilter, setRegionFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("totalLeads");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  // Mock stats
  const stats = {
    totalActiveCampaigns: 12,
    avgCPL: 34.50,
    totalLeads: 1847,
    avgLeadScore: 7.4,
  };

  // Mock campaign data
  const mockCampaigns: CampaignData[] = [
    {
      id: "1",
      name: "Damac Riverside - UK",
      totalLeads: 342,
      avgCPL: 28.50,
      avgLeadScore: 8.2,
      bestAudience: "London + Property Investing",
      region: "UK",
    },
    {
      id: "2",
      name: "Palm Tower - UAE",
      totalLeads: 256,
      avgCPL: 42.00,
      avgLeadScore: 7.8,
      bestAudience: "Dubai + Luxury Travel",
      region: "Middle East",
    },
    {
      id: "3",
      name: "Greenwich Residences - UK",
      totalLeads: 189,
      avgCPL: 31.25,
      avgLeadScore: 7.5,
      bestAudience: "Manchester + Finance",
      region: "UK",
    },
    {
      id: "4",
      name: "Marina Heights - Qatar",
      totalLeads: 145,
      avgCPL: 55.00,
      avgLeadScore: 6.9,
      bestAudience: "Doha + Home Interest",
      region: "Middle East",
    },
    {
      id: "5",
      name: "Victoria Gardens - Nigeria",
      totalLeads: 298,
      avgCPL: 18.75,
      avgLeadScore: 6.4,
      bestAudience: "Lagos + Property Investing",
      region: "Africa",
    },
    {
      id: "6",
      name: "Kensington Square - UK",
      totalLeads: 412,
      avgCPL: 35.00,
      avgLeadScore: 8.5,
      bestAudience: "London + Luxury Travel",
      region: "UK",
    },
    {
      id: "7",
      name: "Dubai Creek Harbour",
      totalLeads: 178,
      avgCPL: 48.00,
      avgLeadScore: 7.2,
      bestAudience: "UAE + Property Investing",
      region: "Middle East",
    },
  ];

  // Get unique regions for filter
  const regions = useMemo(() => {
    const uniqueRegions = [...new Set(mockCampaigns.map(c => c.region))];
    return uniqueRegions.sort();
  }, []);

  // Filtered and sorted campaigns
  const filteredCampaigns = useMemo(() => {
    let result = [...campaigns];
    
    // Apply search filter
    if (searchQuery) {
      result = result.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.bestAudience.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply region filter
    if (regionFilter !== "all") {
      result = result.filter(c => c.region === regionFilter);
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "totalLeads":
          comparison = a.totalLeads - b.totalLeads;
          break;
        case "avgCPL":
          comparison = a.avgCPL - b.avgCPL;
          break;
        case "avgLeadScore":
          comparison = a.avgLeadScore - b.avgLeadScore;
          break;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });
    
    return result;
  }, [campaigns, searchQuery, regionFilter, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3 ml-1" />;
    return sortOrder === "asc" 
      ? <ArrowUp className="h-3 w-3 ml-1" /> 
      : <ArrowDown className="h-3 w-3 ml-1" />;
  };

  // Generate AI insights
  const generateInsights = () => {
    setIsLoading(true);
    
    setTimeout(() => {
      const mockInsights: AIInsight[] = [
        {
          id: "w1",
          type: "working",
          title: "UK Lead Quality Outperforming",
          description: "London campaigns show 40% higher intent scores with avg lead score of 8.2. Property Investing interest segment delivers best ROI.",
          metric: "+40%",
        },
        {
          id: "w2",
          type: "working",
          title: "Video Creatives Driving Engagement",
          description: "UGC video content achieving 3.2% CTR vs 1.8% for static images. Consider scaling video-first strategy.",
          metric: "3.2% CTR",
        },
        {
          id: "w3",
          type: "working",
          title: "Weekend Performance Peak",
          description: "Lead submissions 35% higher on Sat-Sun. Current budget distribution optimised for weekend delivery.",
          metric: "+35%",
        },
        {
          id: "a1",
          type: "attention",
          title: "Qatar CPL Above Target",
          description: "Marina Heights campaign at £55 CPL vs £40 target. Recommend narrowing audience or testing new creatives.",
          action: "Review Campaign",
        },
        {
          id: "a2",
          type: "attention",
          title: "Nigeria Lead Score Dropping",
          description: "Victoria Gardens avg score declined from 7.1 to 6.4 this week. Quality filters may need adjustment.",
          action: "Check Targeting",
        },
        {
          id: "a3",
          type: "attention",
          title: "3 Budgets Near Limit",
          description: "Damac Riverside, Palm Tower, and Greenwich campaigns at 85%+ budget. Review for extension or pause.",
          action: "Manage Budgets",
        },
      ];
      
      setInsights(mockInsights);
      setCampaigns(mockCampaigns);
      setLastUpdated(new Date());
      setIsLoading(false);
    }, 1200);
  };

  useEffect(() => {
    generateInsights();
  }, []);

  const workingInsights = insights.filter((i) => i.type === "working");
  const attentionInsights = insights.filter((i) => i.type === "attention");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">
            Welcome Back, {user?.name || user?.email?.split('@')[0] || 'Admin'}
          </h2>
          <p className="text-sm text-muted-foreground">
            Here's the latest updates: • Last refreshed: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={generateInsights}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Refresh Insights
        </Button>
      </div>

      {/* KPI Widgets */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Megaphone className="h-4 w-4" />
              <span className="text-xs">Total Active Campaigns</span>
            </div>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">{stats.totalActiveCampaigns}</span>
                <Badge variant="secondary" className="bg-success/10 text-success">Live</Badge>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <PoundSterling className="h-4 w-4" />
              <span className="text-xs">Avg. CPL</span>
            </div>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">£{stats.avgCPL.toFixed(2)}</span>
                <TrendingDown className="h-4 w-4 text-success" />
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Users className="h-4 w-4" />
              <span className="text-xs">Total Leads</span>
            </div>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">{stats.totalLeads.toLocaleString()}</span>
                <TrendingUp className="h-4 w-4 text-success" />
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Target className="h-4 w-4" />
              <span className="text-xs">Avg. Lead Score</span>
            </div>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">{stats.avgLeadScore}</span>
                <span className="text-xs text-muted-foreground">/ 10</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* AI Overview & Recommendations */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* What's Working */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-success" />
              What's Working
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <>
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </>
            ) : (
              workingInsights.map((insight) => (
                <div
                  key={insight.id}
                  className="p-3 rounded-lg border border-l-4 border-l-success bg-card"
                >
                  <div className="flex items-start justify-between">
                    <p className="font-medium text-sm">{insight.title}</p>
                    {insight.metric && (
                      <Badge variant="secondary" className="bg-success/10 text-success text-xs">
                        {insight.metric}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {insight.description}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* What Needs Attention */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              Needs Attention
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <>
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </>
            ) : (
              attentionInsights.map((insight) => (
                <div
                  key={insight.id}
                  className="p-3 rounded-lg border border-l-4 border-l-warning bg-card"
                >
                  <p className="font-medium text-sm">{insight.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {insight.description}
                  </p>
                  {insight.action && (
                    <Button variant="ghost" size="sm" className="mt-2 h-7 text-xs">
                      {insight.action}
                      <ChevronRight className="h-3 w-3 ml-1" />
                    </Button>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Campaigns Performance Table with Filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Megaphone className="h-4 w-4 text-primary" />
              Campaign Performance
            </CardTitle>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search campaigns..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-full sm:w-48 h-9"
                />
              </div>
              <Select value={regionFilter} onValueChange={setRegionFilter}>
                <SelectTrigger className="w-full sm:w-36 h-9">
                  <SelectValue placeholder="All Regions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  {regions.map((region) => (
                    <SelectItem key={region} value={region}>
                      {region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort("name")}
                    >
                      <div className="flex items-center">
                        Campaign
                        {getSortIcon("name")}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="text-right cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort("totalLeads")}
                    >
                      <div className="flex items-center justify-end">
                        Total Leads
                        {getSortIcon("totalLeads")}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="text-right cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort("avgCPL")}
                    >
                      <div className="flex items-center justify-end">
                        Avg. CPL
                        {getSortIcon("avgCPL")}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="text-right cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort("avgLeadScore")}
                    >
                      <div className="flex items-center justify-end">
                        Avg. Lead Score
                        {getSortIcon("avgLeadScore")}
                      </div>
                    </TableHead>
                    <TableHead>Best Performing Audience</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCampaigns.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No campaigns found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCampaigns.map((campaign) => (
                      <TableRow key={campaign.id}>
                        <TableCell className="font-medium">
                          <div>
                            {campaign.name}
                            <Badge variant="outline" className="ml-2 text-xs">
                              {campaign.region}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{campaign.totalLeads}</TableCell>
                        <TableCell className="text-right">£{campaign.avgCPL.toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                          <Badge 
                            variant="secondary" 
                            className={
                              campaign.avgLeadScore >= 7.5 
                                ? "bg-success/10 text-success" 
                                : campaign.avgLeadScore >= 6.5 
                                  ? "bg-warning/10 text-warning" 
                                  : "bg-muted"
                            }
                          >
                            {campaign.avgLeadScore}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {campaign.bestAudience}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAIOverview;
