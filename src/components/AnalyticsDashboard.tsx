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
      <Card className="p-4 shadow-card">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filters:</span>
          </div>
          
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[140px]">
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
            <SelectTrigger className="w-[180px]">
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
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Regions</SelectItem>
              <SelectItem value="uk">United Kingdom</SelectItem>
              <SelectItem value="nigeria">Nigeria</SelectItem>
              <SelectItem value="uae">UAE</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2 min-w-[200px]">
            <span className="text-sm text-muted-foreground">Score:</span>
            <Slider
              value={scoreThreshold}
              onValueChange={setScoreThreshold}
              max={10}
              step={1}
              className="flex-1"
            />
            <span className="text-sm font-medium w-6">{scoreThreshold[0]}</span>
          </div>

          <Button variant="outline" size="sm" className="ml-auto">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryStats.map((stat) => (
          <Card key={stat.label} className="p-5 shadow-card">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-muted">
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
              <div className={`flex items-center text-sm ${stat.trend === "up" ? "text-success" : "text-destructive"}`}>
                {stat.trend === "up" ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
              </div>
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">{stat.value}</div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
            <div className="text-xs text-success mt-1">{stat.change}</div>
          </Card>
        ))}
      </div>

      {/* Section 1: Campaign Performance Overview */}
      <Card className="p-6 shadow-card">
        <h3 className="text-lg font-semibold mb-4">Campaign Performance Overview</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr className="text-left text-sm text-muted-foreground">
                <th className="px-4 py-3 font-medium">Campaign Name</th>
                <th className="px-4 py-3 font-medium">Total Leads</th>
                <th className="px-4 py-3 font-medium">Avg. CPL</th>
                <th className="px-4 py-3 font-medium">Avg. Intent</th>
                <th className="px-4 py-3 font-medium">Avg. Quality</th>
                <th className="px-4 py-3 font-medium">% High-Intent</th>
                <th className="px-4 py-3 font-medium">Viewings</th>
                <th className="px-4 py-3 font-medium">Offers</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {campaignPerformance.map((campaign, index) => (
                <tr key={index} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">{campaign.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{campaign.leads}</td>
                  <td className="px-4 py-3 text-muted-foreground">{campaign.avgCPL}</td>
                  <td className="px-4 py-3">
                    <span className={getScoreColor(campaign.avgIntent)}>{campaign.avgIntent}%</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={getScoreColor(campaign.avgQuality)}>{campaign.avgQuality}%</span>
                  </td>
                  <td className="px-4 py-3 text-success font-medium">{campaign.highIntent}</td>
                  <td className="px-4 py-3 text-muted-foreground">{campaign.viewings}</td>
                  <td className="px-4 py-3 text-muted-foreground">{campaign.offers}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Section 2: Lead Quality by Channel & Region */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6 shadow-card">
          <h3 className="text-lg font-semibold mb-4">Lead Quality by Region</h3>
          <div className="space-y-4">
            {regionData.map((item, index) => (
              <div key={index} className="p-4 border border-border rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-foreground">{item.region}</h4>
                  <Badge variant="outline">{item.campaigns} campaigns</Badge>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Leads</div>
                    <div className="font-semibold">{item.leads}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Avg Quality</div>
                    <div className={`font-semibold ${getScoreColor(item.avgQuality)}`}>{item.avgQuality}%</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Avg Intent</div>
                    <div className={`font-semibold ${getScoreColor(item.avgIntent)}`}>{item.avgIntent}%</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 shadow-card">
          <h3 className="text-lg font-semibold mb-4">Lead Source Performance</h3>
          <div className="space-y-4">
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
      <Card className="p-6 shadow-card">
        <h3 className="text-lg font-semibold mb-4">Lead Scoring Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr className="text-left text-sm text-muted-foreground">
                <th className="px-4 py-3 font-medium">Lead Name</th>
                <th className="px-4 py-3 font-medium">Campaign Source</th>
                <th className="px-4 py-3 font-medium">Intent Score</th>
                <th className="px-4 py-3 font-medium">Quality Score</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Development</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {leadScoreData.map((lead, index) => (
                <tr key={index} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">{lead.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{lead.campaign}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Progress value={lead.intent} className="w-16 h-2" />
                      <span className={`text-sm ${getScoreColor(lead.intent)}`}>{lead.intent}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Progress value={lead.quality} className="w-16 h-2" />
                      <span className={`text-sm ${getScoreColor(lead.quality)}`}>{lead.quality}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={lead.status === "Closed" ? "default" : "secondary"}>
                      {lead.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{lead.development}</td>
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