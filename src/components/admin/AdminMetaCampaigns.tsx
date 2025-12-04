import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
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
  DropdownMenuSeparator,
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Plus,
  Search,
  MoreHorizontal,
  Play,
  Pause,
  Copy,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  BarChart3,
  DollarSign,
  Users,
  MousePointer,
  Target,
  Percent,
  ChevronDown,
  ChevronUp,
  Calendar,
  Globe,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import MetaCampaignBuilder from "./MetaCampaignBuilder";
import {
  MOCK_META_CAMPAIGNS,
  EVALUATION_METRICS,
  COUNTRIES,
  MetaCampaign,
  MetaAdset,
} from "@/lib/metaCampaignData";

interface AdminMetaCampaignsProps {
  searchQuery: string;
}

const AdminMetaCampaigns = ({ searchQuery }: AdminMetaCampaignsProps) => {
  const [campaigns, setCampaigns] = useState<MetaCampaign[]>(MOCK_META_CAMPAIGNS);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [phaseFilter, setPhaseFilter] = useState<string>("all");
  const [regionFilter, setRegionFilter] = useState<string>("all");
  const [selectedCampaign, setSelectedCampaign] = useState<MetaCampaign | null>(null);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [expandedCampaign, setExpandedCampaign] = useState<string | null>(null);

  // Filter campaigns
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

  // Aggregate stats
  const stats = useMemo(() => {
    const active = campaigns.filter(c => c.status === "active");
    return {
      totalCampaigns: campaigns.length,
      activeCampaigns: active.length,
      totalSpend: campaigns.reduce((sum, c) => sum + c.metrics.spend, 0),
      totalLeads: campaigns.reduce((sum, c) => sum + c.metrics.leads, 0),
      avgCPL: campaigns.reduce((sum, c) => sum + c.metrics.cpl, 0) / campaigns.length,
      avgCTR: campaigns.reduce((sum, c) => sum + c.metrics.ctr, 0) / campaigns.length,
    };
  }, [campaigns]);

  // Check metric health
  const getMetricStatus = (metric: keyof typeof EVALUATION_METRICS, value: number) => {
    const threshold = EVALUATION_METRICS[metric];
    if (!threshold) return "neutral";
    
    if (threshold.comparison === "less_than") {
      return value <= threshold.threshold ? "good" : "bad";
    } else {
      return value >= threshold.threshold ? "good" : "bad";
    }
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
    const newCampaign = {
      ...campaign,
      id: `mc-${Date.now()}`,
      status: "draft" as const,
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

  const renderMetricBadge = (metric: keyof typeof EVALUATION_METRICS, value: number, unit: string) => {
    const status = getMetricStatus(metric, value);
    const threshold = EVALUATION_METRICS[metric];
    
    return (
      <div className="flex items-center gap-1">
        <span className={`text-sm font-medium ${
          status === "good" ? "text-green-600" : status === "bad" ? "text-red-500" : ""
        }`}>
          {unit === "£" ? `${unit}${value.toFixed(2)}` : `${value.toFixed(1)}${unit}`}
        </span>
        {status === "good" && <CheckCircle className="h-3 w-3 text-green-500" />}
        {status === "bad" && <AlertTriangle className="h-3 w-3 text-red-500" />}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Target className="h-3 w-3" />
              <span className="text-[10px]">Campaigns</span>
            </div>
            <p className="text-lg font-bold">{stats.totalCampaigns}</p>
            <p className="text-[10px] text-muted-foreground">{stats.activeCampaigns} active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <DollarSign className="h-3 w-3" />
              <span className="text-[10px]">Total Spend</span>
            </div>
            <p className="text-lg font-bold">£{stats.totalSpend.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Users className="h-3 w-3" />
              <span className="text-[10px]">Total Leads</span>
            </div>
            <p className="text-lg font-bold">{stats.totalLeads}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <BarChart3 className="h-3 w-3" />
              <span className="text-[10px]">Avg CPL</span>
            </div>
            <p className="text-lg font-bold">£{stats.avgCPL.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <MousePointer className="h-3 w-3" />
              <span className="text-[10px]">Avg CTR</span>
            </div>
            <p className="text-lg font-bold">{stats.avgCTR.toFixed(1)}%</p>
          </CardContent>
        </Card>
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-3">
            <Dialog open={isBuilderOpen} onOpenChange={setIsBuilderOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="w-full h-full">
                  <Plus className="h-4 w-4 mr-1" />
                  New Campaign
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh]">
                <DialogHeader>
                  <DialogTitle>Create Meta Campaign</DialogTitle>
                </DialogHeader>
                <MetaCampaignBuilder
                  onCampaignCreated={(campaign) => {
                    setCampaigns(prev => [{ ...campaign, ...MOCK_META_CAMPAIGNS[0], id: campaign.id }, ...prev]);
                    setIsBuilderOpen(false);
                  }}
                  onClose={() => setIsBuilderOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[130px]">
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
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Phase" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Phases</SelectItem>
            <SelectItem value="testing">Testing</SelectItem>
            <SelectItem value="scaling">Scaling</SelectItem>
          </SelectContent>
        </Select>
        <Select value={regionFilter} onValueChange={setRegionFilter}>
          <SelectTrigger className="w-[130px]">
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

      {/* KPI Thresholds Reference */}
      <Card className="bg-muted/50">
        <CardContent className="p-3">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Evaluation Thresholds</span>
          </div>
          <div className="flex flex-wrap gap-4 text-xs">
            <span>CPC &lt; £1.50</span>
            <span>CTR &gt; 2%</span>
            <span>CPM &lt; £10</span>
            <span>LP View Rate &gt; 75%</span>
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
                <TableHead className="w-[250px]">Campaign</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Spend</TableHead>
                <TableHead className="text-right">Leads</TableHead>
                <TableHead className="text-right">CPL</TableHead>
                <TableHead className="text-right">CPC</TableHead>
                <TableHead className="text-right">CTR</TableHead>
                <TableHead className="text-right">CPM</TableHead>
                <TableHead className="text-right">Hi-Intent</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCampaigns.map((campaign) => (
                <>
                  <TableRow 
                    key={campaign.id}
                    className="cursor-pointer hover:bg-accent/50"
                    onClick={() => setExpandedCampaign(expandedCampaign === campaign.id ? null : campaign.id)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="p-0 h-6 w-6">
                          {expandedCampaign === campaign.id ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                        <div>
                          <p className="font-medium text-sm">{campaign.developmentName}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Globe className="h-3 w-3" />
                            <span>{campaign.region}</span>
                            <Badge variant="outline" className="text-[10px]">
                              {campaign.phase}
                            </Badge>
                            <Badge variant="outline" className="text-[10px]">
                              {campaign.objective}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(campaign.status)}>
                        {campaign.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div>
                        <p className="font-medium">£{campaign.metrics.spend.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">/ £{campaign.budget.toLocaleString()}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">{campaign.metrics.leads}</TableCell>
                    <TableCell className="text-right">
                      {renderMetricBadge("cpc", campaign.metrics.cpl, "£")}
                    </TableCell>
                    <TableCell className="text-right">
                      {renderMetricBadge("cpc", campaign.metrics.cpc, "£")}
                    </TableCell>
                    <TableCell className="text-right">
                      {renderMetricBadge("ctr", campaign.metrics.ctr, "%")}
                    </TableCell>
                    <TableCell className="text-right">
                      {renderMetricBadge("cpm", campaign.metrics.cpm, "£")}
                    </TableCell>
                    <TableCell className="text-right">
                      {renderMetricBadge("highIntentLeadRatio", 
                        (campaign.metrics.highIntentLeads / campaign.metrics.leads) * 100, "%")}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelectedCampaign(campaign)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleStatus(campaign.id)}>
                            {campaign.status === "active" ? (
                              <>
                                <Pause className="h-4 w-4 mr-2" />
                                Pause Campaign
                              </>
                            ) : (
                              <>
                                <Play className="h-4 w-4 mr-2" />
                                Resume Campaign
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDuplicate(campaign)}>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                  
                  {/* Expanded Adsets */}
                  {expandedCampaign === campaign.id && (
                    <TableRow>
                      <TableCell colSpan={10} className="bg-muted/30 p-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-sm">Adsets ({campaign.adsets.length})</h4>
                            <p className="text-xs text-muted-foreground">
                              Pause underperforming adsets after 3-5 consecutive days
                            </p>
                          </div>
                          <div className="grid gap-2">
                            {campaign.adsets.map((adset) => (
                              <div
                                key={adset.id}
                                className={`flex items-center justify-between p-3 rounded-lg border ${
                                  adset.status === "paused" ? "opacity-60" : ""
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <Badge 
                                    variant={adset.status === "active" ? "default" : "secondary"}
                                    className="text-[10px]"
                                  >
                                    {adset.status}
                                  </Badge>
                                  <span className="font-mono text-sm">{adset.name}</span>
                                </div>
                                <div className="flex items-center gap-6 text-sm">
                                  <div>
                                    <span className="text-muted-foreground text-xs">Spend</span>
                                    <p className="font-medium">£{adset.metrics.spend}</p>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground text-xs">Leads</span>
                                    <p className="font-medium">{adset.metrics.leads}</p>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground text-xs">CPL</span>
                                    {renderMetricBadge("cpc", adset.metrics.cpl, "£")}
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground text-xs">CPC</span>
                                    {renderMetricBadge("cpc", adset.metrics.cpc, "£")}
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground text-xs">CTR</span>
                                    {renderMetricBadge("ctr", adset.metrics.ctr, "%")}
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleToggleAdset(campaign.id, adset.id)}
                                  >
                                    {adset.status === "active" ? (
                                      <Pause className="h-4 w-4" />
                                    ) : (
                                      <Play className="h-4 w-4" />
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
                </>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Campaign Detail Sheet */}
      <Sheet open={!!selectedCampaign} onOpenChange={() => setSelectedCampaign(null)}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          {selectedCampaign && (
            <>
              <SheetHeader>
                <SheetTitle>{selectedCampaign.developmentName}</SheetTitle>
              </SheetHeader>
              <div className="space-y-6 mt-6">
                <div className="flex gap-2">
                  <Badge className={getStatusColor(selectedCampaign.status)}>
                    {selectedCampaign.status}
                  </Badge>
                  <Badge variant="outline">{selectedCampaign.phase}</Badge>
                  <Badge variant="outline">{selectedCampaign.objective}</Badge>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-3">
                      <p className="text-xs text-muted-foreground">Budget</p>
                      <p className="text-xl font-bold">£{selectedCampaign.budget.toLocaleString()}</p>
                      <Progress 
                        value={(selectedCampaign.metrics.spend / selectedCampaign.budget) * 100} 
                        className="mt-2 h-2"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        £{selectedCampaign.metrics.spend.toLocaleString()} spent
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-3">
                      <p className="text-xs text-muted-foreground">Performance</p>
                      <p className="text-xl font-bold">{selectedCampaign.metrics.leads} Leads</p>
                      <p className="text-sm text-green-600">
                        £{selectedCampaign.metrics.cpl.toFixed(2)} CPL
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Targeting</h4>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Countries</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedCampaign.targetCountries.map(code => (
                          <Badge key={code} variant="secondary" className="text-[10px]">
                            {COUNTRIES.find(c => c.code === code)?.name || code}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Cities</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedCampaign.targetCities.map(city => (
                          <Badge key={city} variant="outline" className="text-[10px]">
                            {city}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Metrics</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-2 bg-muted rounded">
                      <p className="text-xs text-muted-foreground">Impressions</p>
                      <p className="font-medium">{selectedCampaign.metrics.impressions.toLocaleString()}</p>
                    </div>
                    <div className="p-2 bg-muted rounded">
                      <p className="text-xs text-muted-foreground">Clicks</p>
                      <p className="font-medium">{selectedCampaign.metrics.clicks.toLocaleString()}</p>
                    </div>
                    <div className="p-2 bg-muted rounded">
                      <p className="text-xs text-muted-foreground">Landing Page Views</p>
                      <p className="font-medium">{selectedCampaign.metrics.landingPageViews.toLocaleString()}</p>
                    </div>
                    <div className="p-2 bg-muted rounded">
                      <p className="text-xs text-muted-foreground">High-Intent Leads</p>
                      <p className="font-medium">{selectedCampaign.metrics.highIntentLeads}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    className="flex-1"
                    onClick={() => handleToggleStatus(selectedCampaign.id)}
                  >
                    {selectedCampaign.status === "active" ? (
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
                  </Button>
                  <Button variant="outline" onClick={() => handleDuplicate(selectedCampaign)}>
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicate
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default AdminMetaCampaigns;
