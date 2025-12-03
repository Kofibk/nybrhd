import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { 
  Target, 
  Users, 
  CalendarCheck, 
  TrendingUp, 
  Plus,
  Building2,
  Lightbulb,
  ArrowRight,
  MoreHorizontal
} from "lucide-react";
import { Link } from "react-router-dom";

const DeveloperDashboard = () => {
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

  const aiRecommendations = [
    {
      title: "Target Dubai-based buyers for Chelsea Island",
      description: "High-intent signals detected from UAE region. Consider launching a targeted LinkedIn campaign.",
      action: "Create Campaign"
    },
    {
      title: "Switch from Meta to Google for better CPL",
      description: "Google Ads showing 15% lower cost per lead for UK investor segment.",
      action: "View Analysis"
    },
    {
      title: "Book viewings with 7 matched leads",
      description: "These leads have high intent scores (85+) and haven't been contacted in 48hrs.",
      action: "View Leads"
    },
    {
      title: "Optimize ad creative for Marina Heights",
      description: "A/B test suggests lifestyle imagery outperforms architectural shots by 23%.",
      action: "Update Creative"
    },
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
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-foreground">Welcome Back, {userName}</h2>
        <p className="text-muted-foreground">Here's what's happening with your campaigns today.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-5 shadow-card hover:shadow-card-hover transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2 rounded-lg bg-muted`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">{stat.value}</div>
            <div className="text-sm text-muted-foreground mb-1">{stat.label}</div>
            <div className="text-xs text-success">{stat.change}</div>
          </Card>
        ))}
      </div>

      {/* Active Campaigns Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Active Campaigns</h3>
          <Link to="/developer/campaigns">
            <Button variant="default" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Launch New Campaign
            </Button>
          </Link>
        </div>
        <Card className="shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr className="text-left text-sm text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Campaign Name</th>
                  <th className="px-4 py-3 font-medium">Budget</th>
                  <th className="px-4 py-3 font-medium">CTR</th>
                  <th className="px-4 py-3 font-medium">CPL</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {activeCampaigns.map((campaign, index) => (
                  <tr key={index} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">{campaign.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{campaign.budget}</td>
                    <td className="px-4 py-3 text-muted-foreground">{campaign.ctr}</td>
                    <td className="px-4 py-3 text-muted-foreground">{campaign.cpl}</td>
                    <td className="px-4 py-3">
                      <Badge variant={getStatusBadgeVariant(campaign.status)} className="capitalize">
                        {campaign.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
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
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Development Overview</h3>
          <Button variant="outline" size="sm">
            <Building2 className="h-4 w-4 mr-2" />
            Add Development
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {developments.map((dev, index) => (
            <Card key={index} className="p-5 shadow-card hover:shadow-card-hover transition-all cursor-pointer">
              <div className="text-3xl mb-3">{dev.image}</div>
              <h4 className="font-semibold text-foreground mb-1">{dev.name}</h4>
              <p className="text-sm text-muted-foreground mb-3">
                {dev.sold}/{dev.units} units sold
              </p>
              <Badge variant={getStatusBadgeVariant(dev.status)}>{dev.status}</Badge>
            </Card>
          ))}
        </div>
      </div>

      {/* AI Recommendations */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="h-5 w-5 text-accent" />
          <h3 className="text-lg font-semibold text-foreground">AI Recommendations</h3>
        </div>
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-4 pb-4">
            {aiRecommendations.map((rec, index) => (
              <Card key={index} className="p-5 min-w-[300px] max-w-[320px] shadow-card hover:shadow-card-hover transition-shadow flex-shrink-0">
                <h4 className="font-semibold text-foreground mb-2 whitespace-normal">{rec.title}</h4>
                <p className="text-sm text-muted-foreground mb-4 whitespace-normal">{rec.description}</p>
                <Button variant="outline" size="sm" className="w-full">
                  {rec.action}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Card>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </DashboardLayout>
  );
};

export default DeveloperDashboard;