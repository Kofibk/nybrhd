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
  Filter
} from "lucide-react";
import { useState } from "react";

const AnalyticsDashboard = () => {
  const [dateRange, setDateRange] = useState("30d");
  const [campaign, setCampaign] = useState("all");
  const [region, setRegion] = useState("all");
  const [scoreThreshold, setScoreThreshold] = useState([0]);

  const summaryStats = [
    { label: "Total Leads Generated", value: "847", change: "+124 this period", trend: "up", icon: Users },
    { label: "Avg. CPL", value: "£19.85", change: "-8% vs last period", trend: "up", icon: DollarSign },
    { label: "Conversion Rate", value: "4.2%", change: "+0.8% improvement", trend: "up", icon: Target },
    { label: "Viewings Booked", value: "89", change: "+12 this week", trend: "up", icon: CalendarCheck },
  ];

  const campaignPerformance = [
    { 
      name: "Meta Ads - Lagos HNW", 
      leads: 124, 
      avgCPL: "£20.16", 
      avgIntent: 78, 
      avgQuality: 82,
      highIntent: "68%",
      viewings: 18,
      offers: 5
    },
    { 
      name: "Google Ads - UK Investors", 
      leads: 89, 
      avgCPL: "£20.22", 
      avgIntent: 72,
      avgQuality: 75,
      highIntent: "54%",
      viewings: 12,
      offers: 3
    },
    { 
      name: "LinkedIn - Dubai Expats", 
      leads: 56, 
      avgCPL: "£21.43", 
      avgIntent: 85,
      avgQuality: 88,
      highIntent: "76%",
      viewings: 9,
      offers: 4
    },
    { 
      name: "TikTok - Young Professionals", 
      leads: 45, 
      avgCPL: "£17.78", 
      avgIntent: 62,
      avgQuality: 58,
      highIntent: "38%",
      viewings: 6,
      offers: 1
    },
  ];

  const regionData = [
    { region: "United Kingdom", leads: 285, avgQuality: 76, avgIntent: 74, campaigns: 4 },
    { region: "Nigeria", leads: 198, avgQuality: 82, avgIntent: 78, campaigns: 3 },
    { region: "UAE", leads: 156, avgQuality: 88, avgIntent: 85, campaigns: 2 },
    { region: "Singapore", leads: 89, avgQuality: 72, avgIntent: 68, campaigns: 2 },
    { region: "USA", leads: 67, avgQuality: 70, avgIntent: 72, campaigns: 1 },
  ];

  const leadScoreData = [
    { name: "James Okonkwo", campaign: "Meta - Lagos HNW", intent: 78, quality: 85, status: "Viewing Booked", development: "Marina Heights" },
    { name: "Sarah Mitchell", campaign: "Google - UK", intent: 91, quality: 72, status: "Offer Made", development: "Skyline Tower" },
    { name: "Ahmed Al-Rashid", campaign: "LinkedIn - Dubai", intent: 85, quality: 90, status: "Closed", development: "Marina Heights" },
    { name: "Jennifer Wong", campaign: "Organic", intent: 82, quality: 68, status: "New", development: "Garden Residences" },
    { name: "Marcus Thompson", campaign: "Instagram", intent: 76, quality: 79, status: "Qualified", development: "Riverside Plaza" },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-warning";
    return "text-destructive";
  };

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