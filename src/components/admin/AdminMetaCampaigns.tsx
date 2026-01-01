import { useState, useMemo, Fragment } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  MoreHorizontal,
  Play,
  Pause,
  Copy,
  AlertTriangle,
  CheckCircle,
  Eye,
  BarChart3,
  DollarSign,
  Users,
  MousePointer,
  Target,
  ChevronDown,
  ChevronUp,
  Globe,
  Sparkles,
  Brain,
  Zap,
  Database,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import HybridSignalCampaignBuilder from "./HybridSignalCampaignBuilder";
import CreativeBreakdownReport from "./CreativeBreakdownReport";
import { useCloudCampaignSummary, useCloudCampaignsGrouped } from "@/hooks/useCloudCampaignData";
import { Skeleton } from "@/components/ui/skeleton";

import {
  MOCK_META_CAMPAIGNS,
  COUNTRIES,
  REGIONS,
  MetaCampaign,
} from "@/lib/metaCampaignData";

interface AdminMetaCampaignsProps {
  searchQuery: string;
}

const AdminMetaCampaigns = ({ searchQuery }: AdminMetaCampaignsProps) => {
  const [campaigns, setCampaigns] = useState<MetaCampaign[]>(MOCK_META_CAMPAIGNS);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [phaseFilter, setPhaseFilter] = useState<string>("all");
  const [regionFilter, setRegionFilter] = useState<string>("all");
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [expandedCampaign, setExpandedCampaign] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<"campaigns" | "breakdown" | "cloud">("cloud");

  // Fetch real data from Lovable Cloud
  const { data: cloudSummary, isLoading: summaryLoading, refetch: refetchSummary } = useCloudCampaignSummary();
  const { data: cloudCampaigns, isLoading: campaignsLoading, refetch: refetchCampaigns } = useCloudCampaignsGrouped();

  const handleRefreshData = () => {
    refetchSummary();
    refetchCampaigns();
    toast.success("Refreshing campaign data from Cloud...");
  };

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter(c => {
      const matchesSearch = 
        c.developmentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.region.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || c.status === statusFilter;
      const matchesPhase = phaseFilter === "all" || c.phase === phaseFilter;
      const matchesRegion = regionFilter === "all" || c.region.toLowerCase() === regionFilter;
      return matchesSearch && matchesStatus && matchesPhase && matchesRegion;
    });
  }, [campaigns, searchQuery, statusFilter, phaseFilter, regionFilter]);

  // Filter cloud campaigns by search
  const filteredCloudCampaigns = useMemo(() => {
    if (!cloudCampaigns) return [];
    if (!searchQuery) return cloudCampaigns;
    return cloudCampaigns.filter(c => 
      c.campaign_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [cloudCampaigns, searchQuery]);

  const stats = useMemo(() => {
    const active = campaigns.filter(c => c.status === "active");
    return {
      totalCampaigns: campaigns.length,
      activeCampaigns: active.length,
      totalSpend: campaigns.reduce((sum, c) => sum + c.metrics.spend, 0),
      totalLeads: campaigns.reduce((sum, c) => sum + c.metrics.leads, 0),
      avgCPL: campaigns.length > 0 ? campaigns.reduce((sum, c) => sum + c.metrics.cpl, 0) / campaigns.length : 0,
      avgCTR: campaigns.length > 0 ? campaigns.reduce((sum, c) => sum + c.metrics.ctr, 0) / campaigns.length : 0,
    };
  }, [campaigns]);

  const getMetricHealth = (metricKey: string, value: number): "good" | "bad" | "neutral" => {
    const thresholds: Record<string, { threshold: number; comparison: string }> = {
      cpc: { threshold: 1.5, comparison: "less_than" },
      ctr: { threshold: 2, comparison: "greater_than" },
      cpm: { threshold: 10, comparison: "less_than" },
      highIntent: { threshold: 60, comparison: "greater_than" },
    };
    
    const config = thresholds[metricKey];
    if (!config) return "neutral";
    
    if (config.comparison === "less_than") {
      return value <= config.threshold ? "good" : "bad";
    }
    return value >= config.threshold ? "good" : "bad";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500/10 text-green-600 border-green-500/20";
      case "paused": return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
      case "completed": return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "draft": return "bg-gray-500/10 text-gray-600 border-gray-500/20";
      default: return "bg-gray-500/10 text-gray-600 border-gray-500/20";
    }
  };

  const handleToggleStatus = (campaignId: string) => {
    setCampaigns(prev => prev.map(c => {
      if (c.id === campaignId) {
        const newStatus = c.status === "active" ? "paused" : "active";
        toast.success(`Campaign ${newStatus === "active" ? "resumed" : "paused"}`);
        return { ...c, status: newStatus };
      }
      return c;
    }));
  };

  const handleDuplicate = (campaign: MetaCampaign) => {
    const newCampaign: MetaCampaign = {
      ...campaign,
      id: `mc-${Date.now()}`,
      status: "draft",
      createdAt: new Date().toISOString(),
      developmentName: `${campaign.developmentName} (Copy)`,
    };
    setCampaigns(prev => [newCampaign, ...prev]);
    toast.success("Campaign duplicated", { description: newCampaign.developmentName });
  };

  const handleToggleAdset = (campaignId: string, adsetId: string) => {
    setCampaigns(prev => prev.map(c => {
      if (c.id === campaignId) {
        return {
          ...c,
          adsets: c.adsets.map(a => {
            if (a.id === adsetId) {
              const newStatus = a.status === "active" ? "paused" : "active";
              toast.success(`Adset ${newStatus === "active" ? "resumed" : "paused"}`);
              return { ...a, status: newStatus };
            }
            return a;
          })
        };
      }
      return c;
    }));
  };

  const MetricDisplay = ({ value, unit, metricKey }: { value: number; unit: string; metricKey: string }) => {
    const status = getMetricHealth(metricKey, value);
    return (
      <div className="flex items-center gap-1">
        <span className={`text-xs sm:text-sm font-medium ${
          status === "good" ? "text-green-600" : status === "bad" ? "text-red-500" : ""
        }`}>
          {unit === "£" ? `${unit}${Math.round(value).toLocaleString()}` : `${value.toFixed(1)}${unit}`}
        </span>
        {status === "good" && <CheckCircle className="h-3 w-3 text-green-500" />}
        {status === "bad" && <AlertTriangle className="h-3 w-3 text-red-500" />}
      </div>
    );
  };

  const handleCampaignCreated = (campaign: any) => {
    const newCampaign: MetaCampaign = {
      id: campaign.id,
      developmentName: campaign.developmentName,
      region: campaign.regions?.[0] ? 
        REGIONS.find(r => r.id === campaign.regions[0])?.name || "UK" : "UK",
      objective: campaign.objective,
      phase: campaign.phase,
      status: "draft",
      budget: campaign.budget,
      budgetType: "lifetime",
      startDate: campaign.startDate,
      endDate: campaign.endDate,
      createdAt: campaign.createdAt,
      targetCountries: campaign.countries || [],
      targetCities: campaign.cities || [],
      whatsappEnabled: campaign.whatsappEnabled,
      metrics: {
        spend: 0,
        leads: 0,
        cpl: 0,
        cpc: 0,
        ctr: 0,
        cpm: 0,
        impressions: 0,
        clicks: 0,
        landingPageViews: 0,
        highIntentLeads: 0,
      },
      adsets: []
    };
    setCampaigns(prev => [newCampaign, ...prev]);
    setIsBuilderOpen(false);
  };

  return (
    <div className="space-y-4 sm:space-y-6">

      {/* Header with New Campaign Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
        <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Campaigns
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {cloudSummary?.uniqueCampaigns || 0} campaigns • {cloudSummary?.totalRecords?.toLocaleString() || 0} records • Synced from Airtable
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleRefreshData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={isBuilderOpen} onOpenChange={setIsBuilderOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                New Campaign
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] sm:max-w-2xl md:max-w-4xl max-h-[90vh] overflow-hidden">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Campaign Builder
                </DialogTitle>
              </DialogHeader>
              <HybridSignalCampaignBuilder 
                onCampaignCreated={handleCampaignCreated}
                onClose={() => setIsBuilderOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Cloud Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Database className="h-4 w-4 text-primary" />
              <span className="text-xs">Campaigns</span>
            </div>
            {summaryLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <p className="text-xl sm:text-2xl font-bold">{cloudSummary?.uniqueCampaigns || 0}</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <DollarSign className="h-4 w-4" />
              <span className="text-xs">Total Spend</span>
            </div>
            {summaryLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <p className="text-xl sm:text-2xl font-bold">£{Math.round(cloudSummary?.totalSpent || 0).toLocaleString()}</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Eye className="h-4 w-4" />
              <span className="text-xs">Impressions</span>
            </div>
            {summaryLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <p className="text-xl sm:text-2xl font-bold">{((cloudSummary?.totalImpressions || 0) / 1000000).toFixed(1)}M</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <MousePointer className="h-4 w-4" />
              <span className="text-xs">Clicks</span>
            </div>
            {summaryLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <p className="text-xl sm:text-2xl font-bold">{(cloudSummary?.totalClicks || 0).toLocaleString()}</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs">LPVs</span>
            </div>
            {summaryLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <p className="text-xl sm:text-2xl font-bold">{(cloudSummary?.totalLpv || 0).toLocaleString()}</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <BarChart3 className="h-4 w-4" />
              <span className="text-xs">Avg CPC</span>
            </div>
            {summaryLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <p className="text-xl sm:text-2xl font-bold">£{(cloudSummary?.avgCpc || 0).toFixed(2)}</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* View Toggle Tabs */}
      <Tabs value={activeView} onValueChange={(v) => setActiveView(v as "campaigns" | "breakdown" | "cloud")}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <TabsList>
            <TabsTrigger value="cloud" className="gap-1 text-xs">
              <Database className="h-3 w-3" />
              Cloud Data
            </TabsTrigger>
            <TabsTrigger value="campaigns" className="gap-1 text-xs">
              <Target className="h-3 w-3" />
              Campaigns
            </TabsTrigger>
            <TabsTrigger value="breakdown" className="gap-1 text-xs">
              <BarChart3 className="h-3 w-3" />
              Creative Breakdown
            </TabsTrigger>
          </TabsList>

          {/* Filters Row - Only show for campaigns view */}
          {activeView === "campaigns" && (
            <div className="flex flex-wrap items-center gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[120px] h-9 text-sm">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={phaseFilter} onValueChange={setPhaseFilter}>
                <SelectTrigger className="w-[120px] h-9 text-sm">
                  <SelectValue placeholder="Phase" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Phases</SelectItem>
                  <SelectItem value="testing">Testing</SelectItem>
                  <SelectItem value="scaling">Scaling</SelectItem>
                </SelectContent>
              </Select>
              <Select value={regionFilter} onValueChange={setRegionFilter}>
                <SelectTrigger className="w-[130px] h-9 text-sm">
                  <SelectValue placeholder="Region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  <SelectItem value="uk">UK</SelectItem>
                  <SelectItem value="middle east">Middle East</SelectItem>
                  <SelectItem value="africa">Africa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Cloud Data Tab Content */}
        <TabsContent value="cloud" className="mt-4 space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Database className="h-4 w-4 text-primary" />
                  Campaign Data from Lovable Cloud
                </h3>
                <Badge variant="outline" className="text-xs">
                  Auto-syncing every minute
                </Badge>
              </div>
              
              {campaignsLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[300px]">Campaign Name</TableHead>
                        <TableHead className="text-right">Spend</TableHead>
                        <TableHead className="text-right">Impressions</TableHead>
                        <TableHead className="text-right">Clicks</TableHead>
                        <TableHead className="text-right">LPVs</TableHead>
                        <TableHead className="text-right">CPC</TableHead>
                        <TableHead className="text-right">CTR</TableHead>
                        <TableHead className="text-center">Platforms</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCloudCampaigns.map((campaign) => (
                        <TableRow key={campaign.campaign_name}>
                          <TableCell>
                            <div>
                              <p className="font-medium text-sm truncate max-w-[280px]">{campaign.campaign_name}</p>
                              <p className="text-xs text-muted-foreground">{campaign.record_count} ad records</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            £{Math.round(campaign.total_spent).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right">
                            {campaign.total_impressions >= 1000000 
                              ? `${(campaign.total_impressions / 1000000).toFixed(1)}M`
                              : campaign.total_impressions >= 1000
                                ? `${(campaign.total_impressions / 1000).toFixed(1)}K`
                                : campaign.total_impressions.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right">
                            {campaign.total_clicks.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right">
                            {campaign.total_lpv.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <span className={campaign.avg_cpc < 1.5 ? "text-green-600" : campaign.avg_cpc > 3 ? "text-red-500" : ""}>
                              £{campaign.avg_cpc.toFixed(2)}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <span className={campaign.avg_ctr > 2 ? "text-green-600" : campaign.avg_ctr < 1 ? "text-red-500" : ""}>
                              {campaign.avg_ctr.toFixed(2)}%
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex gap-1 justify-center">
                              {campaign.platforms.map(p => (
                                <Badge key={p} variant="outline" className="text-[10px] capitalize">
                                  {p}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
              
              {!campaignsLoading && filteredCloudCampaigns.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No campaigns found matching your search.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Campaigns Tab Content */}
        <TabsContent value="campaigns" className="mt-4 space-y-4">
          {/* KPI Thresholds */}
          <Card className="bg-muted/50">
            <CardContent className="p-2 sm:p-3">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                <span className="text-xs sm:text-sm font-medium">Evaluation Thresholds</span>
              </div>
              <div className="flex flex-wrap gap-2 sm:gap-4 text-[10px] sm:text-xs">
                <span>CPC &lt; £1.50</span>
                <span>CTR &gt; 2%</span>
                <span>CPM &lt; £10</span>
                <span>High-Intent &gt; 60%</span>
              </div>
            </CardContent>
          </Card>

      {/* Campaigns Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px] sm:w-[250px]">Campaign</TableHead>
                <TableHead className="hidden sm:table-cell">Status</TableHead>
                <TableHead className="text-right">Spend</TableHead>
                <TableHead className="text-right hidden md:table-cell">Leads</TableHead>
                <TableHead className="text-right hidden lg:table-cell">CPL</TableHead>
                <TableHead className="text-right hidden lg:table-cell">CPC</TableHead>
                <TableHead className="text-right hidden xl:table-cell">CTR</TableHead>
                <TableHead className="w-[40px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCampaigns.map((campaign) => (
                <Fragment key={campaign.id}>
                  <TableRow 
                    className="cursor-pointer hover:bg-accent/50"
                    onClick={() => setExpandedCampaign(expandedCampaign === campaign.id ? null : campaign.id)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-1 sm:gap-2">
                        <Button variant="ghost" size="sm" className="p-0 h-5 w-5 sm:h-6 sm:w-6 shrink-0">
                          {expandedCampaign === campaign.id ? (
                            <ChevronUp className="h-3 w-3 sm:h-4 sm:w-4" />
                          ) : (
                            <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
                          )}
                        </Button>
                        <div className="min-w-0">
                          <p className="font-medium text-xs sm:text-sm truncate">{campaign.developmentName}</p>
                          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                            <Globe className="h-2 w-2 sm:h-3 sm:w-3" />
                            <span className="truncate">{campaign.region}</span>
                            <Badge variant="outline" className="text-[8px] sm:text-[10px] hidden sm:inline-flex">
                              {campaign.phase}
                            </Badge>
                          </div>
                          {/* Mobile-only status */}
                          <div className="sm:hidden mt-1">
                            <Badge className={`${getStatusColor(campaign.status)} text-[10px]`}>
                              {campaign.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge className={getStatusColor(campaign.status)}>
                        {campaign.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div>
                        <p className="font-medium text-xs sm:text-sm">£{campaign.metrics.spend.toLocaleString()}</p>
                        <p className="text-[10px] text-muted-foreground hidden sm:block">/ £{campaign.budget.toLocaleString()}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium text-xs sm:text-sm hidden md:table-cell">
                      {campaign.metrics.leads}
                    </TableCell>
                    <TableCell className="text-right hidden lg:table-cell">
                      <MetricDisplay value={campaign.metrics.cpl} unit="£" metricKey="cpc" />
                    </TableCell>
                    <TableCell className="text-right hidden lg:table-cell">
                      <MetricDisplay value={campaign.metrics.cpc} unit="£" metricKey="cpc" />
                    </TableCell>
                    <TableCell className="text-right hidden xl:table-cell">
                      <MetricDisplay value={campaign.metrics.ctr} unit="%" metricKey="ctr" />
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-background">
                          <DropdownMenuItem onClick={() => handleToggleStatus(campaign.id)}>
                            {campaign.status === "active" ? (
                              <>
                                <Pause className="h-4 w-4 mr-2" />
                                Pause
                              </>
                            ) : (
                              <>
                                <Play className="h-4 w-4 mr-2" />
                                Resume
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicate(campaign)}>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                  
                  {/* Expanded Adsets Row */}
                  {expandedCampaign === campaign.id && campaign.adsets.length > 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="bg-muted/30 p-2 sm:p-4">
                        <div className="space-y-2">
                          <p className="text-xs sm:text-sm font-medium mb-2">Adsets ({campaign.adsets.length})</p>
                          <div className="grid gap-2">
                            {campaign.adsets.map(adset => (
                              <div 
                                key={adset.id}
                                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 sm:p-3 bg-background rounded-lg border"
                              >
                                <div className="flex items-center gap-2">
                                  <Badge 
                                    variant="outline" 
                                    className={adset.status === "active" ? "border-green-500 text-green-600" : "border-yellow-500 text-yellow-600"}
                                  >
                                    {adset.status}
                                  </Badge>
                                  <span className="text-xs sm:text-sm truncate">{adset.name}</span>
                                </div>
                                <div className="flex items-center gap-2 sm:gap-4 text-[10px] sm:text-xs flex-wrap">
                                  <span>£{Math.round(adset.metrics.spend).toLocaleString()} spent</span>
                                  <span>{adset.metrics.leads} leads</span>
                                  <span>£{Math.round(adset.metrics.cpl).toLocaleString()} CPL</span>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    className="h-6 px-2"
                                    onClick={() => handleToggleAdset(campaign.id, adset.id)}
                                  >
                                    {adset.status === "active" ? (
                                      <Pause className="h-3 w-3" />
                                    ) : (
                                      <Play className="h-3 w-3" />
                                    )}
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
        </TabsContent>

        {/* Creative Breakdown Tab Content */}
        <TabsContent value="breakdown" className="mt-4">
          <CreativeBreakdownReport />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminMetaCampaigns;
