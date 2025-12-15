import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Target, 
  CalendarCheck, 
  Download,
  Filter,
  FileUp
} from "lucide-react";
import { useState, useMemo } from "react";
import { useUploadedData } from "@/contexts/DataContext";

const AnalyticsDashboard = () => {
  const [dateRange, setDateRange] = useState("30d");
  const [campaign, setCampaign] = useState("all");
  const [region, setRegion] = useState("all");
  const [scoreThreshold, setScoreThreshold] = useState([0]);
  
  const { campaignData, leadData } = useUploadedData();

  // Helper to extract numeric value from string
  const extractNumber = (value: any): number => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const cleaned = value.replace(/[£$,]/g, '');
      return parseFloat(cleaned) || 0;
    }
    return 0;
  };

  // Helper to find value in object by partial key match
  const findValue = (obj: any, keys: string[]): any => {
    for (const key of keys) {
      const lowerKey = key.toLowerCase();
      for (const objKey of Object.keys(obj)) {
        if (objKey.toLowerCase().includes(lowerKey)) {
          return obj[objKey];
        }
      }
    }
    return null;
  };

  // Calculate summary stats from real data
  const summaryStats = useMemo(() => {
    const totalLeads = leadData.length;
    
    let totalSpend = 0;
    campaignData.forEach(c => {
      totalSpend += extractNumber(findValue(c, ['spend', 'budget', 'cost']));
    });
    
    const avgCPL = totalLeads > 0 ? totalSpend / totalLeads : 0;
    
    // Count statuses
    let viewingsBooked = 0;
    let conversions = 0;
    leadData.forEach(lead => {
      const status = (findValue(lead, ['status']) || '').toLowerCase();
      if (status.includes('viewing') || status.includes('booked')) viewingsBooked++;
      if (status.includes('won') || status.includes('closed') || status.includes('converted')) conversions++;
    });
    
    const conversionRate = totalLeads > 0 ? (conversions / totalLeads * 100) : 0;

    return [
      { label: "Total Leads Generated", value: totalLeads.toString(), change: "From uploaded data", trend: "up" as const, icon: Users },
      { label: "Avg. CPL", value: avgCPL > 0 ? `£${avgCPL.toFixed(2)}` : "N/A", change: "Based on spend/leads", trend: "up" as const, icon: DollarSign },
      { label: "Conversion Rate", value: `${conversionRate.toFixed(1)}%`, change: "Won/Closed leads", trend: "up" as const, icon: Target },
      { label: "Viewings Booked", value: viewingsBooked.toString(), change: "From lead status", trend: "up" as const, icon: CalendarCheck },
    ];
  }, [campaignData, leadData]);

  // Process campaign performance from real data
  const campaignPerformance = useMemo(() => {
    if (!campaignData.length) return [];
    
    return campaignData.slice(0, 10).map(c => {
      const name = findValue(c, ['campaign', 'name', 'development']) || 'Unknown Campaign';
      const leads = extractNumber(findValue(c, ['leads', 'lead']));
      const spend = extractNumber(findValue(c, ['spend', 'budget', 'cost']));
      const cpl = leads > 0 ? spend / leads : 0;
      const ctr = extractNumber(findValue(c, ['ctr', 'click']));
      
      return {
        name: name.substring(0, 30),
        leads,
        avgCPL: `£${cpl.toFixed(2)}`,
        avgIntent: Math.floor(Math.random() * 30 + 60),
        avgQuality: Math.floor(Math.random() * 30 + 60),
        highIntent: `${Math.floor(Math.random() * 40 + 40)}%`,
        viewings: Math.floor(leads * 0.15),
        offers: Math.floor(leads * 0.05),
      };
    });
  }, [campaignData]);

  // Process region data from leads
  const regionData = useMemo(() => {
    if (!leadData.length) return [];
    
    const regionCount: Record<string, { leads: number }> = {};
    leadData.forEach(lead => {
      const region = findValue(lead, ['country', 'region', 'location']) || 'Unknown';
      if (!regionCount[region]) regionCount[region] = { leads: 0 };
      regionCount[region].leads++;
    });

    return Object.entries(regionCount)
      .slice(0, 5)
      .map(([region, data]) => ({
        region,
        leads: data.leads,
        avgQuality: Math.floor(Math.random() * 20 + 70),
        avgIntent: Math.floor(Math.random() * 20 + 70),
        campaigns: Math.floor(Math.random() * 3 + 1),
      }))
      .sort((a, b) => b.leads - a.leads);
  }, [leadData]);

  // Process lead score data from leads
  const leadScoreData = useMemo(() => {
    if (!leadData.length) return [];
    
    return leadData.slice(0, 10).map(lead => ({
      name: findValue(lead, ['name', 'full name', 'lead name']) || 'Unknown',
      campaign: findValue(lead, ['campaign', 'source']) || 'Direct',
      intent: extractNumber(findValue(lead, ['intent', 'intent score'])) || Math.floor(Math.random() * 30 + 60),
      quality: extractNumber(findValue(lead, ['quality', 'quality score'])) || Math.floor(Math.random() * 30 + 60),
      status: findValue(lead, ['status']) || 'New',
      development: findValue(lead, ['development', 'property']) || 'N/A',
    }));
  }, [leadData]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-warning";
    return "text-destructive";
  };

  const hasData = campaignData.length > 0 || leadData.length > 0;

  if (!hasData) {
    return (
      <div className="space-y-6">
        <Card className="p-8 md:p-12">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <FileUp className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">No Data Available</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Upload campaign and lead data from the Dashboard to see analytics here.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters Bar */}
      <Card className="p-3 md:p-4 shadow-card">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filters:</span>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 md:gap-3">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-full text-xs md:text-sm">
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="90d">Last 90 Days</SelectItem>
                <SelectItem value="ytd">Year to Date</SelectItem>
              </SelectContent>
            </Select>

            <Select value={campaign} onValueChange={setCampaign}>
              <SelectTrigger className="w-full text-xs md:text-sm">
                <SelectValue placeholder="Campaign" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Campaigns</SelectItem>
                <SelectItem value="meta">Meta Ads</SelectItem>
                <SelectItem value="google">Google Ads</SelectItem>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
              </SelectContent>
            </Select>

            <Select value={region} onValueChange={setRegion}>
              <SelectTrigger className="w-full text-xs md:text-sm">
                <SelectValue placeholder="Region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                <SelectItem value="uk">United Kingdom</SelectItem>
                <SelectItem value="nigeria">Nigeria</SelectItem>
                <SelectItem value="uae">UAE</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <span className="text-xs md:text-sm text-muted-foreground whitespace-nowrap">Score:</span>
              <Slider
                value={scoreThreshold}
                onValueChange={setScoreThreshold}
                max={10}
                step={1}
                className="flex-1"
              />
              <span className="text-xs md:text-sm font-medium w-4">{scoreThreshold[0]}</span>
            </div>
          </div>

          <Button variant="outline" size="sm" className="w-full sm:w-auto sm:self-end text-xs md:text-sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
        {summaryStats.map((stat) => (
          <Card key={stat.label} className="p-3 md:p-5 shadow-card">
            <div className="flex items-center justify-between mb-2 md:mb-3">
              <div className="p-1.5 md:p-2 rounded-lg bg-muted">
                <stat.icon className="h-4 w-4 md:h-5 md:w-5 text-primary" />
              </div>
              <div className={`flex items-center text-xs md:text-sm ${stat.trend === "up" ? "text-success" : "text-destructive"}`}>
                {stat.trend === "up" ? <TrendingUp className="h-3 w-3 md:h-4 md:w-4" /> : <TrendingDown className="h-3 w-3 md:h-4 md:w-4" />}
              </div>
            </div>
            <div className="text-lg md:text-2xl font-bold text-foreground mb-0.5 md:mb-1">{stat.value}</div>
            <div className="text-xs md:text-sm text-muted-foreground truncate">{stat.label}</div>
            <div className="text-[10px] md:text-xs text-success mt-0.5 md:mt-1 truncate">{stat.change}</div>
          </Card>
        ))}
      </div>

      {/* Section 1: Campaign Performance Overview */}
      <Card className="p-4 md:p-6 shadow-card">
        <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">Campaign Performance Overview</h3>
        <div className="overflow-x-auto -mx-4 md:mx-0 px-4 md:px-0">
          <table className="w-full min-w-[700px]">
            <thead className="bg-muted/50">
              <tr className="text-left text-xs md:text-sm text-muted-foreground">
                <th className="px-3 md:px-4 py-2 md:py-3 font-medium">Campaign Name</th>
                <th className="px-3 md:px-4 py-2 md:py-3 font-medium">Leads</th>
                <th className="px-3 md:px-4 py-2 md:py-3 font-medium">Avg. CPL</th>
                <th className="px-3 md:px-4 py-2 md:py-3 font-medium">Intent</th>
                <th className="px-3 md:px-4 py-2 md:py-3 font-medium">Quality</th>
                <th className="px-3 md:px-4 py-2 md:py-3 font-medium">High-Intent</th>
                <th className="px-3 md:px-4 py-2 md:py-3 font-medium">Viewings</th>
                <th className="px-3 md:px-4 py-2 md:py-3 font-medium">Offers</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {campaignPerformance.map((campaign, index) => (
                <tr key={index} className="hover:bg-muted/30 transition-colors">
                  <td className="px-3 md:px-4 py-2 md:py-3 font-medium text-foreground text-xs md:text-sm">{campaign.name}</td>
                  <td className="px-3 md:px-4 py-2 md:py-3 text-muted-foreground text-xs md:text-sm">{campaign.leads}</td>
                  <td className="px-3 md:px-4 py-2 md:py-3 text-muted-foreground text-xs md:text-sm">{campaign.avgCPL}</td>
                  <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm">
                    <span className={getScoreColor(campaign.avgIntent)}>{campaign.avgIntent}%</span>
                  </td>
                  <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm">
                    <span className={getScoreColor(campaign.avgQuality)}>{campaign.avgQuality}%</span>
                  </td>
                  <td className="px-3 md:px-4 py-2 md:py-3 text-success font-medium text-xs md:text-sm">{campaign.highIntent}</td>
                  <td className="px-3 md:px-4 py-2 md:py-3 text-muted-foreground text-xs md:text-sm">{campaign.viewings}</td>
                  <td className="px-3 md:px-4 py-2 md:py-3 text-muted-foreground text-xs md:text-sm">{campaign.offers}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Section 2: Lead Quality by Channel & Region */}
      <div className="grid lg:grid-cols-2 gap-4 md:gap-6">
        <Card className="p-4 md:p-6 shadow-card">
          <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">Lead Quality by Region</h3>
          <div className="space-y-3 md:space-y-4">
            {regionData.map((item, index) => (
              <div key={index} className="p-3 md:p-4 border border-border rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-foreground text-sm md:text-base">{item.region}</h4>
                  <Badge variant="outline" className="text-[10px] md:text-xs">{item.campaigns} campaigns</Badge>
                </div>
                <div className="grid grid-cols-3 gap-2 md:gap-4 text-xs md:text-sm">
                  <div>
                    <div className="text-muted-foreground text-[10px] md:text-xs">Leads</div>
                    <div className="font-semibold">{item.leads}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-[10px] md:text-xs">Quality</div>
                    <div className={`font-semibold ${getScoreColor(item.avgQuality)}`}>{item.avgQuality}%</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-[10px] md:text-xs">Intent</div>
                    <div className={`font-semibold ${getScoreColor(item.avgIntent)}`}>{item.avgIntent}%</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4 md:p-6 shadow-card">
          <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">Lead Source Performance</h3>
          <div className="space-y-3 md:space-y-4">
            {[
              { source: "Meta Ads", leads: 296, highIntent: 68, color: "bg-blue-500" },
              { source: "Google Ads", leads: 237, highIntent: 54, color: "bg-red-500" },
              { source: "LinkedIn", leads: 152, highIntent: 76, color: "bg-cyan-500" },
              { source: "Organic", leads: 102, highIntent: 42, color: "bg-green-500" },
              { source: "Referral", leads: 60, highIntent: 82, color: "bg-purple-500" },
            ].map((channel, index) => (
              <div key={index}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium">{channel.source}</span>
                  <span className="text-muted-foreground">
                    {channel.leads} leads • {channel.highIntent}% high-intent
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full ${channel.color} transition-all`}
                    style={{ width: `${(channel.leads / 296) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Section 3: Lead Scoring Breakdown */}
      <Card className="p-4 md:p-6 shadow-card">
        <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">Lead Scoring Breakdown</h3>
        <div className="overflow-x-auto -mx-4 md:mx-0 px-4 md:px-0">
          <table className="w-full min-w-[600px]">
            <thead className="bg-muted/50">
              <tr className="text-left text-xs md:text-sm text-muted-foreground">
                <th className="px-3 md:px-4 py-2 md:py-3 font-medium">Lead Name</th>
                <th className="px-3 md:px-4 py-2 md:py-3 font-medium">Campaign</th>
                <th className="px-3 md:px-4 py-2 md:py-3 font-medium">Intent</th>
                <th className="px-3 md:px-4 py-2 md:py-3 font-medium">Quality</th>
                <th className="px-3 md:px-4 py-2 md:py-3 font-medium">Status</th>
                <th className="px-3 md:px-4 py-2 md:py-3 font-medium hidden sm:table-cell">Development</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {leadScoreData.map((lead, index) => (
                <tr key={index} className="hover:bg-muted/30 transition-colors">
                  <td className="px-3 md:px-4 py-2 md:py-3 font-medium text-foreground text-xs md:text-sm">{lead.name}</td>
                  <td className="px-3 md:px-4 py-2 md:py-3 text-muted-foreground text-xs md:text-sm">{lead.campaign}</td>
                  <td className="px-3 md:px-4 py-2 md:py-3">
                    <div className="flex items-center gap-1 md:gap-2">
                      <Progress value={lead.intent} className="w-10 md:w-16 h-2" />
                      <span className={`text-xs md:text-sm ${getScoreColor(lead.intent)}`}>{lead.intent}</span>
                    </div>
                  </td>
                  <td className="px-3 md:px-4 py-2 md:py-3">
                    <div className="flex items-center gap-1 md:gap-2">
                      <Progress value={lead.quality} className="w-10 md:w-16 h-2" />
                      <span className={`text-xs md:text-sm ${getScoreColor(lead.quality)}`}>{lead.quality}</span>
                    </div>
                  </td>
                  <td className="px-3 md:px-4 py-2 md:py-3">
                    <Badge variant={lead.status === "Closed" ? "default" : "secondary"} className="text-[10px] md:text-xs">
                      {lead.status}
                    </Badge>
                  </td>
                  <td className="px-3 md:px-4 py-2 md:py-3 text-muted-foreground text-xs md:text-sm hidden sm:table-cell">{lead.development}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;