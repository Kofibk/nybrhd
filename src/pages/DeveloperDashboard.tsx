import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PerformanceOverview from "@/components/PerformanceOverview";
import CampaignBuilder from "@/components/CampaignBuilder";
import LeadsManagement from "@/components/LeadsManagement";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";
import AICampaignAnalysis from "@/components/AICampaignAnalysis";
import { 
  Target, 
  Users, 
  CalendarCheck, 
  TrendingUp, 
  Plus,
  Building2,
  MoreHorizontal
} from "lucide-react";
import { Link } from "react-router-dom";

const DeveloperDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const userName = "John";
  
  const stats = [
    { label: "Active Campaigns", value: "12", change: "+3 this month", icon: Target, color: "text-primary" },
    { label: "Leads This Week", value: "124", change: "+18% vs last week", icon: Users, color: "text-success" },
    { label: "Booked Viewings", value: "28", change: "7 pending confirmation", icon: CalendarCheck, color: "text-accent" },
    { label: "Conversion Rate", value: "4.2%", change: "+0.8% improvement", icon: TrendingUp, color: "text-info" },
  ];

  const activeCampaigns = [
    { 
      name: "Meta Ads - Lagos HNW", 
      budget: "£2,500", 
      ctr: "3.2%", 
      cpl: "£20.16", 
      status: "active" 
    },
    { 
      name: "Google Ads - UK Investors", 
      budget: "£1,800", 
      ctr: "2.8%", 
      cpl: "£20.22", 
      status: "active" 
    },
    { 
      name: "LinkedIn - Dubai Expats", 
      budget: "£1,200", 
      ctr: "4.1%", 
      cpl: "£21.43", 
      status: "paused" 
    },
    { 
      name: "TikTok - Young Professionals", 
      budget: "£800", 
      ctr: "2.1%", 
      cpl: "£17.78", 
      status: "active" 
    },
  ];

  const developments = [
    { name: "Marina Heights", units: 120, sold: 45, status: "Live", image: "🏢" },
    { name: "Skyline Tower", units: 85, sold: 12, status: "Pre-Launch", image: "🏗️" },
    { name: "Riverside Plaza", units: 200, sold: 200, status: "Sold Out", image: "✅" },
    { name: "Garden Residences", units: 64, sold: 28, status: "Live", image: "🌳" },
  ];


  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Live": return "default";
      case "Pre-Launch": return "secondary";
      case "Sold Out": return "outline";
      case "active": return "default";
      case "paused": return "secondary";
      default: return "default";
    }
  };

  return (
    <DashboardLayout title="Dashboard" userType="developer" userName={userName}>
      {/* Welcome Header */}
      <div className="mb-4 md:mb-6">
        <h2 className="text-xl md:text-2xl font-semibold text-foreground">Welcome Back, {userName}</h2>
        <p className="text-sm md:text-base text-muted-foreground">Here's what's happening with your campaigns today.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-3 md:p-5 shadow-card hover:shadow-card-hover transition-shadow">
            <div className="flex items-start justify-between mb-2 md:mb-3">
              <div className={`p-1.5 md:p-2 rounded-lg bg-muted`}>
                <stat.icon className={`h-4 w-4 md:h-5 md:w-5 ${stat.color}`} />
              </div>
            </div>
            <div className="text-lg md:text-2xl font-bold text-foreground mb-0.5 md:mb-1">{stat.value}</div>
            <div className="text-xs md:text-sm text-muted-foreground mb-0.5 md:mb-1">{stat.label}</div>
            <div className="text-[10px] md:text-xs text-success">{stat.change}</div>
          </Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 md:space-y-6">
        <TabsList className="w-full overflow-x-auto flex justify-start">
          <TabsTrigger value="overview" className="text-xs md:text-sm">Overview</TabsTrigger>
          <TabsTrigger value="campaigns" className="text-xs md:text-sm">Campaigns</TabsTrigger>
          <TabsTrigger value="leads" className="text-xs md:text-sm">Leads</TabsTrigger>
          <TabsTrigger value="analytics" className="text-xs md:text-sm">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 md:space-y-8">
          {/* Active Campaigns Section */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <h3 className="text-base md:text-lg font-semibold text-foreground">Active Campaigns</h3>
              <Link to="/developer/campaigns">
                <Button variant="default" size="sm" className="w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Launch Campaign
                </Button>
              </Link>
            </div>
            <Card className="shadow-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[500px]">
                  <thead className="bg-muted/50">
                    <tr className="text-left text-xs md:text-sm text-muted-foreground">
                      <th className="px-3 md:px-4 py-2 md:py-3 font-medium">Campaign</th>
                      <th className="px-3 md:px-4 py-2 md:py-3 font-medium">Budget</th>
                      <th className="px-3 md:px-4 py-2 md:py-3 font-medium hidden sm:table-cell">CTR</th>
                      <th className="px-3 md:px-4 py-2 md:py-3 font-medium">CPL</th>
                      <th className="px-3 md:px-4 py-2 md:py-3 font-medium">Status</th>
                      <th className="px-3 md:px-4 py-2 md:py-3 font-medium"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {activeCampaigns.map((campaign, index) => (
                      <tr key={index} className="hover:bg-muted/30 transition-colors">
                        <td className="px-3 md:px-4 py-2 md:py-3 font-medium text-foreground text-xs md:text-sm">{campaign.name}</td>
                        <td className="px-3 md:px-4 py-2 md:py-3 text-muted-foreground text-xs md:text-sm">{campaign.budget}</td>
                        <td className="px-3 md:px-4 py-2 md:py-3 text-muted-foreground text-xs md:text-sm hidden sm:table-cell">{campaign.ctr}</td>
                        <td className="px-3 md:px-4 py-2 md:py-3 text-muted-foreground text-xs md:text-sm">{campaign.cpl}</td>
                        <td className="px-3 md:px-4 py-2 md:py-3">
                          <Badge variant={getStatusBadgeVariant(campaign.status)} className="capitalize text-[10px] md:text-xs">
                            {campaign.status}
                          </Badge>
                        </td>
                        <td className="px-3 md:px-4 py-2 md:py-3">
                          <Button variant="ghost" size="icon" className="h-7 w-7 md:h-8 md:w-8">
                            <MoreHorizontal className="h-3 w-3 md:h-4 md:w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Development Overview */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <h3 className="text-base md:text-lg font-semibold text-foreground">Development Overview</h3>
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                <Building2 className="h-4 w-4 mr-2" />
                Add Development
              </Button>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              {developments.map((dev, index) => (
                <Card key={index} className="p-3 md:p-5 shadow-card hover:shadow-card-hover transition-all cursor-pointer">
                  <div className="text-2xl md:text-3xl mb-2 md:mb-3">{dev.image}</div>
                  <h4 className="font-semibold text-foreground mb-0.5 md:mb-1 text-sm md:text-base">{dev.name}</h4>
                  <p className="text-xs md:text-sm text-muted-foreground mb-2 md:mb-3">
                    {dev.sold}/{dev.units} units sold
                  </p>
                  <Badge variant={getStatusBadgeVariant(dev.status)} className="text-[10px] md:text-xs">{dev.status}</Badge>
                </Card>
              ))}
            </div>
          </div>

          {/* AI Campaign Analysis */}
          <AICampaignAnalysis userType="developer" compact />

          {/* Performance Overview */}
          <PerformanceOverview userType="developer" context="dashboard" onTabChange={setActiveTab} />
        </TabsContent>

        <TabsContent value="campaigns">
          <AICampaignAnalysis userType="developer" />
          <div className="mt-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 md:mb-6">
              <h2 className="text-xl md:text-2xl font-bold">AI Campaign Builder</h2>
              <Button className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                New Campaign
              </Button>
            </div>
            <CampaignBuilder />
          </div>
        </TabsContent>

        <TabsContent value="leads">
          <PerformanceOverview userType="developer" context="leads" onTabChange={setActiveTab} />
          <div className="mt-6">
            <LeadsManagement />
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <AnalyticsDashboard />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default DeveloperDashboard;