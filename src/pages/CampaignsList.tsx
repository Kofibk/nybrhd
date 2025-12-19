import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { UserRole } from "@/lib/types";
import { useUploadedData } from "@/contexts/DataContext";
import { useMasterAgent } from "@/hooks/useMasterAgent";
import { useAirtableCampaignsForDashboard } from "@/hooks/useAirtableCampaigns";
import { AIInsightsPanel } from "@/components/AIInsightsPanel";
import {
  Plus,
  Upload,
  Download,
  Calendar,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Pause,
  Play,
  Eye,
  Lightbulb,
  Sparkles,
  Target,
  PoundSterling,
  Users,
  BarChart3,
  Loader2,
  RefreshCw,
} from "lucide-react";
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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
  rating: 'excellent' | 'good' | 'acceptable' | 'poor';
  aiRecommendation?: string;
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

// Generate AI recommendation based on performance
const generateAIRecommendation = (group: DevelopmentGroup, campaigns: Campaign[]): string | undefined => {
  if (group.rating === 'excellent' || group.rating === 'good') return undefined;
  
  // Find worst performing campaign
  const sortedByCpl = [...campaigns].sort((a, b) => b.cpl - a.cpl);
  const worstCampaign = sortedByCpl[0];
  const bestCampaign = sortedByCpl[sortedByCpl.length - 1];
  
  if (worstCampaign && worstCampaign.cpl > 50) {
    const savingsEstimate = Math.round(worstCampaign.spent * 0.3);
    return `Pause "${worstCampaign.name.slice(0, 30)}..." (£${Math.round(worstCampaign.cpl)} CPL), shift £${savingsEstimate} budget to ${bestCampaign ? `"${bestCampaign.name.slice(0, 20)}..." which is performing at £${Math.round(bestCampaign.cpl)} CPL` : 'better performing campaigns'}`;
  }
  
  return `Review targeting for underperforming campaigns. Consider pausing ads with CPL above £50 and reallocating budget.`;
};

// Role-specific configuration
const getRoleConfig = (userType: string) => {
  switch (userType) {
    case 'developer':
      return { assetLabel: 'Development', assetLabelPlural: 'Developments' };
    case 'agent':
      return { assetLabel: 'Property', assetLabelPlural: 'Properties' };
    case 'broker':
      return { assetLabel: 'Product', assetLabelPlural: 'Products' };
    default:
      return { assetLabel: 'Development', assetLabelPlural: 'Developments' };
  }
};

const CampaignsList = ({ userType }: CampaignsListProps) => {
  const navigate = useNavigate();
  const { campaignData: uploadedCampaignData, leadData } = useUploadedData(userType);
  const { getCampaignRecommendations, isLoading: aiLoading } = useMasterAgent();

  const {
    campaignData: airtableCampaignData,
    isLoading: airtableLoading,
    refetch: refetchAirtable,
  } = useAirtableCampaignsForDashboard({ enabled: userType === 'admin' });

  const campaignData = useMemo(() => {
    if (userType !== 'admin') return uploadedCampaignData;
    if (!airtableCampaignData || airtableCampaignData.length === 0) return uploadedCampaignData;

    const combined = [...airtableCampaignData, ...uploadedCampaignData];
    return combined.filter(
      (c, i, arr) => arr.findIndex((x) => x['Campaign Name'] === c['Campaign Name']) === i
    );
  }, [airtableCampaignData, uploadedCampaignData, userType]);
  const [performingExpanded, setPerformingExpanded] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });
  const [aiRecommendations, setAiRecommendations] = useState<Record<string, string>>({});
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiAnalysisRun, setAiAnalysisRun] = useState(false);

  const roleConfig = getRoleConfig(userType);
  const TARGET_CPL = 35;

  // Process uploaded campaign data
  const allCampaigns = useMemo(() => {
    if (campaignData.length === 0) return [];
    
    return campaignData
      .filter((row) => {
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

        return { id: `campaign_${index}`, name, status, spent, leads, cpl, startDate, platform };
      });
  }, [campaignData]);

  // Filter campaigns
  const filteredCampaigns = useMemo(() => {
    return allCampaigns.filter((campaign) => {
      const matchesStatus = statusFilter === "all" || campaign.status === statusFilter;
      let matchesDate = true;
      if (dateRange.from || dateRange.to) {
        const campaignDate = new Date(campaign.startDate);
        if (dateRange.from && campaignDate < dateRange.from) matchesDate = false;
        if (dateRange.to && campaignDate > dateRange.to) matchesDate = false;
      }
      return matchesStatus && matchesDate;
    });
  }, [allCampaigns, statusFilter, dateRange]);

  // Group and categorise campaigns
  const { needsAttention, performingWell, overallStats } = useMemo(() => {
    const groups: Record<string, Campaign[]> = {};
    
    filteredCampaigns.forEach((campaign) => {
      const devName = getDevelopmentName(campaign.name);
      if (devName === 'Thornton Road') return;
      if (!groups[devName]) groups[devName] = [];
      groups[devName].push(campaign);
    });
    
    const allGroups: DevelopmentGroup[] = Object.entries(groups).map(([name, campaigns]) => {
      const totalSpend = campaigns.reduce((sum, c) => sum + c.spent, 0);
      const totalLeads = campaigns.reduce((sum, c) => sum + c.leads, 0);
      const avgCpl = totalLeads > 0 ? totalSpend / totalLeads : 0;
      const rating = getCplRating(avgCpl);
      
      const group: DevelopmentGroup = { name, campaigns, totalSpend, totalLeads, avgCpl, rating };
      group.aiRecommendation = generateAIRecommendation(group, campaigns);
      
      return group;
    });

    const needsAttention = allGroups.filter(g => g.rating === 'poor' || g.rating === 'acceptable').sort((a, b) => b.avgCpl - a.avgCpl);
    const performingWell = allGroups.filter(g => g.rating === 'excellent' || g.rating === 'good').sort((a, b) => a.avgCpl - b.avgCpl);
    
    const totalSpend = allGroups.reduce((sum, g) => sum + g.totalSpend, 0);
    const totalLeads = allGroups.reduce((sum, g) => sum + g.totalLeads, 0);
    const avgCpl = totalLeads > 0 ? totalSpend / totalLeads : 0;
    const efficiency = Math.min(100, Math.round((TARGET_CPL / Math.max(avgCpl, 1)) * 100));
    
    return {
      needsAttention,
      performingWell,
      overallStats: {
        totalSpend,
        totalLeads,
        avgCpl,
        efficiency,
        onTrack: performingWell.length,
        attention: needsAttention.filter(g => g.rating === 'acceptable').length,
        paused: needsAttention.filter(g => g.rating === 'poor').length,
      }
    };
  }, [filteredCampaigns]);

  // Fetch AI recommendations
  const fetchAIRecommendations = async () => {
    if (campaignData.length === 0 || isLoadingAI) return;
    
    setIsLoadingAI(true);
    try {
      const response = await getCampaignRecommendations({ campaigns: campaignData });
      
      if (response?.response) {
        // Try to parse JSON from the response
        try {
          // Find JSON array in the response
          const jsonMatch = response.response.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            const recommendations = JSON.parse(jsonMatch[0]);
            const recsMap: Record<string, string> = {};
            recommendations.forEach((rec: any) => {
              if (rec.development && rec.recommendation) {
                recsMap[rec.development] = rec.recommendation + (rec.savings ? ` (Save ${rec.savings})` : '');
              }
            });
            setAiRecommendations(recsMap);
          } else {
            // Fallback: use the full response for all groups
            needsAttention.forEach(group => {
              setAiRecommendations(prev => ({
                ...prev,
                [group.name]: response.response.slice(0, 300)
              }));
            });
          }
        } catch {
          // If JSON parsing fails, use full response
          console.log('AI response was not JSON, using as text');
        }
        setAiAnalysisRun(true);
        toast.success('AI analysis complete');
      }
    } catch (error) {
      console.error('Failed to get AI recommendations:', error);
      toast.error('Failed to get AI recommendations');
    } finally {
      setIsLoadingAI(false);
    }
  };

  // Auto-fetch AI recommendations when campaigns load (only once)
  useEffect(() => {
    if (campaignData.length > 0 && needsAttention.length > 0 && !aiAnalysisRun && !isLoadingAI) {
      // Delay slightly to avoid immediate API call on mount
      const timer = setTimeout(() => {
        fetchAIRecommendations();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [campaignData.length, needsAttention.length, aiAnalysisRun]);

  const handleApplyRecommendation = (group: DevelopmentGroup) => {
    toast.success(`Applied AI recommendation for ${group.name}`);
  };

  const handlePauseAll = (group: DevelopmentGroup) => {
    toast.success(`Paused all campaigns for ${group.name}`);
  };

  const handleViewDetails = (group: DevelopmentGroup) => {
    toast.info(`Viewing details for ${group.name}`);
  };

  const exportToCSV = () => {
    const headers = ["Development", "Campaign", "Platform", "Spend", "Leads", "CPL", "Status"];
    const rows: string[][] = [];
    
    [...needsAttention, ...performingWell].forEach(group => {
      group.campaigns.forEach(c => {
        rows.push([group.name, c.name, c.platform, c.spent.toString(), c.leads.toString(), c.cpl.toFixed(2), c.status]);
      });
    });
    
    const csvContent = [headers.join(","), ...rows.map(row => row.map(cell => `"${cell}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `campaigns_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    toast.success(`${rows.length} campaigns exported`);
  };

  // Get recommendation for a group (AI or fallback)
  const getRecommendationForGroup = (group: DevelopmentGroup): string | undefined => {
    return aiRecommendations[group.name] || group.aiRecommendation;
  };

  // Loading state for admin (Airtable fetching)
  if (userType === 'admin' && airtableLoading) {
    return (
      <DashboardLayout title="Campaigns" userType={userType}>
        <div className="h-full flex flex-col min-h-0 space-y-6 overflow-auto">
          <div className="flex items-center justify-between flex-shrink-0">
            <div>
              <h2 className="text-xl font-semibold">Campaigns</h2>
              <p className="text-muted-foreground text-sm">Loading campaign data from Airtable...</p>
            </div>
          </div>
          <Card className="p-12 text-center">
            <Loader2 className="h-12 w-12 mx-auto text-primary mb-4 animate-spin" />
            <h3 className="text-lg font-semibold mb-2">Loading Campaigns</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Fetching campaign data from Airtable...
            </p>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  // Empty state
  if (allCampaigns.length === 0) {
    return (
      <DashboardLayout title="Campaigns" userType={userType}>
        <div className="h-full flex flex-col min-h-0 space-y-6 overflow-auto">
          <div className="flex items-center justify-between flex-shrink-0">
            <div>
              <h2 className="text-xl font-semibold">Campaigns</h2>
              <p className="text-muted-foreground text-sm">Manage your marketing campaigns</p>
            </div>
            <div className="flex gap-2">
              {userType === 'admin' ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetchAirtable()}
                  disabled={airtableLoading}
                >
                  <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${airtableLoading ? 'animate-spin' : ''}`} />
                  Sync Airtable
                </Button>
              ) : (
                <Button variant="outline" size="sm">
                  <Upload className="h-3.5 w-3.5 mr-1.5" />
                  Upload
                </Button>
              )}
              <Button size="sm" onClick={() => navigate(`/${userType}/campaigns/new`)}>
                <Plus className="h-4 w-4 mr-1.5" />
                Launch New
              </Button>
            </div>
          </div>
          <Card className="p-12 text-center">
            <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No Campaign Data</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {userType === 'admin' 
                ? 'Click "Sync Airtable" to fetch campaign data from your Campaign_Date table.'
                : 'Upload your campaign data CSV from the main dashboard to view performance and get AI recommendations.'}
            </p>
            {userType === 'admin' && (
              <Button onClick={() => refetchAirtable()} disabled={airtableLoading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${airtableLoading ? 'animate-spin' : ''}`} />
                Sync from Airtable
              </Button>
            )}
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Campaigns" userType={userType}>
      <div className="h-full flex flex-col min-h-0 space-y-6 overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Campaigns</h2>
            <p className="text-muted-foreground text-sm">
              {needsAttention.length + performingWell.length} {roleConfig.assetLabelPlural.toLowerCase()}, {filteredCampaigns.length} campaigns
            </p>
          </div>
          <div className="flex gap-2">
            {userType === 'admin' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetchAirtable()}
                disabled={airtableLoading}
              >
                {airtableLoading ? (
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                ) : (
                  <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                )}
                Sync Airtable
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchAIRecommendations}
              disabled={isLoadingAI}
            >
              {isLoadingAI ? (
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
              ) : (
                <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              )}
              {isLoadingAI ? 'Analysing...' : 'AI Analysis'}
            </Button>
            <Button variant="outline" size="sm" onClick={exportToCSV}>
              <Download className="h-3.5 w-3.5 mr-1.5" />
              Export
            </Button>
            <Button size="sm" onClick={() => navigate(`/${userType}/campaigns/new`)}>
              <Plus className="h-4 w-4 mr-1.5" />
              Launch New
            </Button>
          </div>
        </div>

        {/* AI Insights Panel */}
        <AIInsightsPanel 
          context="campaigns" 
          data={{ campaigns: campaignData, leads: leadData }}
        />

        {/* Overall Health */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-sm">OVERALL HEALTH</span>
          </div>
          
          <div className="space-y-4">
            {/* Stats row */}
            <div className="flex flex-wrap items-center gap-6 text-sm">
              <div>
                <span className="text-muted-foreground">Total Spend:</span>
                <span className="font-semibold ml-1">£{overallStats.totalSpend.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Leads:</span>
                <span className="font-semibold ml-1">{overallStats.totalLeads.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-muted-foreground">CPL:</span>
                <span className={cn(
                  "font-semibold ml-1",
                  overallStats.avgCpl <= TARGET_CPL ? "text-green-500" : overallStats.avgCpl <= 50 ? "text-amber-500" : "text-red-500"
                )}>
                  £{overallStats.avgCpl.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Efficiency bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {overallStats.efficiency}% efficient (target: £{TARGET_CPL})
                </span>
              </div>
              <Progress 
                value={overallStats.efficiency} 
                className={cn(
                  "h-2",
                  overallStats.efficiency >= 80 ? "[&>div]:bg-green-500" : 
                  overallStats.efficiency >= 60 ? "[&>div]:bg-amber-500" : "[&>div]:bg-red-500"
                )}
              />
            </div>

            {/* Status summary */}
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                <span>{overallStats.onTrack} {roleConfig.assetLabelPlural.toLowerCase()} on track</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span>{overallStats.attention} need attention</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                <span>{overallStats.paused} poor performance</span>
              </div>
            </div>
          </div>
        </Card>

        {/* 🔴 NEEDS ATTENTION */}
        {needsAttention.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <h3 className="font-semibold">NEEDS ATTENTION</h3>
              <Badge variant="destructive" className="ml-1">{needsAttention.length}</Badge>
            </div>
            
            <div className="space-y-3">
              {needsAttention.map((group) => (
                <Card key={group.name} className="border-l-4 border-l-red-500 overflow-hidden">
                  <div className="p-4">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold">{group.name}</span>
                        <Badge variant="outline" className={cn(
                          "text-xs",
                          group.rating === 'poor' ? "bg-red-500/10 text-red-500 border-red-500/30" : 
                          "bg-amber-500/10 text-amber-500 border-amber-500/30"
                        )}>
                          {group.rating === 'poor' ? '🔴' : '🟡'} £{Math.round(group.avgCpl)} CPL
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>£{group.totalSpend.toLocaleString()} spent</span>
                        <span>→</span>
                        <span>{group.totalLeads} leads</span>
                        <span className="text-red-500">
                          {Math.round(((group.avgCpl - TARGET_CPL) / TARGET_CPL) * 100)}% over target
                        </span>
                      </div>
                    </div>

                    {/* AI Recommendation */}
                    {(getRecommendationForGroup(group) || isLoadingAI) && (
                      <div className="bg-muted/50 rounded-lg p-3 mb-3">
                        <div className="flex items-start gap-2">
                          {isLoadingAI && !aiRecommendations[group.name] ? (
                            <>
                              <Loader2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0 animate-spin" />
                              <div>
                                <span className="text-xs font-medium text-amber-600">AI Analysis:</span>
                                <p className="text-sm mt-0.5 text-muted-foreground">Analysing campaign performance...</p>
                              </div>
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                              <div>
                                <span className="text-xs font-medium text-amber-600 flex items-center gap-1">
                                  AI Recommendation
                                  {aiRecommendations[group.name] && (
                                    <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 bg-green-500/10 text-green-600 border-green-500/30">
                                      Live
                                    </Badge>
                                  )}
                                </span>
                                <p className="text-sm mt-0.5">{getRecommendationForGroup(group)}</p>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 flex-wrap">
                      <Button size="sm" className="gap-1.5 bg-green-600 hover:bg-green-700" onClick={() => handleApplyRecommendation(group)}>
                        <CheckCircle className="h-3.5 w-3.5" />
                        Apply Changes
                      </Button>
                      <Button size="sm" variant="outline" className="gap-1.5" onClick={() => handleViewDetails(group)}>
                        <Eye className="h-3.5 w-3.5" />
                        View Details
                      </Button>
                      <Button size="sm" variant="outline" className="gap-1.5 text-red-500 hover:text-red-600" onClick={() => handlePauseAll(group)}>
                        <Pause className="h-3.5 w-3.5" />
                        Pause All
                      </Button>
                    </div>
                  </div>

                  {/* Campaign breakdown */}
                  <div className="border-t bg-muted/20 px-4 py-2">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="hover:bg-transparent">
                            <TableHead className="text-xs h-8">Campaign</TableHead>
                            <TableHead className="text-xs h-8">Platform</TableHead>
                            <TableHead className="text-xs h-8 text-right">Spend</TableHead>
                            <TableHead className="text-xs h-8 text-center">Leads</TableHead>
                            <TableHead className="text-xs h-8 text-right">CPL</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {group.campaigns.slice(0, 5).map((campaign) => (
                            <TableRow key={campaign.id} className="hover:bg-muted/30">
                              <TableCell className="text-xs py-2 max-w-[200px] truncate">{campaign.name}</TableCell>
                              <TableCell className="text-xs py-2">{campaign.platform}</TableCell>
                              <TableCell className="text-xs py-2 text-right">£{campaign.spent.toLocaleString()}</TableCell>
                              <TableCell className="text-xs py-2 text-center">{campaign.leads}</TableCell>
                              <TableCell className={cn(
                                "text-xs py-2 text-right font-medium",
                                campaign.cpl > 50 ? "text-red-500" : campaign.cpl > 35 ? "text-amber-500" : "text-green-500"
                              )}>
                                £{campaign.cpl.toFixed(0)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* 🟢 PERFORMING WELL - Collapsible */}
        {performingWell.length > 0 && (
          <Collapsible open={performingExpanded} onOpenChange={setPerformingExpanded}>
            <div className="space-y-3">
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between cursor-pointer group">
                  <div className="flex items-center gap-2">
                    {performingExpanded ? (
                      <ChevronDown className="h-5 w-5 text-green-500" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-green-500" />
                    )}
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <h3 className="font-semibold">PERFORMING WELL</h3>
                    <Badge variant="secondary" className="ml-1 bg-green-500/20 text-green-600">{performingWell.length}</Badge>
                  </div>
                  <Button variant="ghost" size="sm" className="text-xs">
                    {performingExpanded ? 'Collapse' : 'View all'}
                  </Button>
                </div>
              </CollapsibleTrigger>

              {!performingExpanded && (
                <Card className="border-l-4 border-l-green-500">
                  <div className="divide-y divide-border">
                    {performingWell.map((group) => (
                      <div key={group.name} className="flex items-center justify-between p-3 hover:bg-muted/30 transition-colors">
                        <div className="flex items-center gap-3">
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{group.name}</span>
                          <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30 text-xs">
                            🟢 £{Math.round(group.avgCpl)} CPL
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>£{group.totalSpend.toLocaleString()}</span>
                          <span>→</span>
                          <span>{group.totalLeads} leads</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              <CollapsibleContent className="space-y-3">
                {performingWell.map((group) => (
                  <Card key={group.name} className="border-l-4 border-l-green-500">
                    <div className="p-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <span className="font-semibold">{group.name}</span>
                          <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30 text-xs">
                            🟢 £{Math.round(group.avgCpl)} CPL
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>£{group.totalSpend.toLocaleString()} spent</span>
                          <span>→</span>
                          <span>{group.totalLeads} leads</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="gap-1.5" onClick={() => handleViewDetails(group)}>
                          <Eye className="h-3.5 w-3.5" />
                          View Details
                        </Button>
                        <Button size="sm" variant="outline" className="gap-1.5">
                          <TrendingUp className="h-3.5 w-3.5" />
                          Scale Up
                        </Button>
                      </div>
                    </div>

                    <div className="border-t bg-muted/20 px-4 py-2">
                      <Table>
                        <TableHeader>
                          <TableRow className="hover:bg-transparent">
                            <TableHead className="text-xs h-8">Campaign</TableHead>
                            <TableHead className="text-xs h-8">Platform</TableHead>
                            <TableHead className="text-xs h-8 text-right">Spend</TableHead>
                            <TableHead className="text-xs h-8 text-center">Leads</TableHead>
                            <TableHead className="text-xs h-8 text-right">CPL</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {group.campaigns.map((campaign) => (
                            <TableRow key={campaign.id} className="hover:bg-muted/30">
                              <TableCell className="text-xs py-2 max-w-[200px] truncate">{campaign.name}</TableCell>
                              <TableCell className="text-xs py-2">{campaign.platform}</TableCell>
                              <TableCell className="text-xs py-2 text-right">£{campaign.spent.toLocaleString()}</TableCell>
                              <TableCell className="text-xs py-2 text-center">{campaign.leads}</TableCell>
                              <TableCell className="text-xs py-2 text-right font-medium text-green-500">
                                £{campaign.cpl.toFixed(0)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </Card>
                ))}
              </CollapsibleContent>
            </div>
          </Collapsible>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CampaignsList;
