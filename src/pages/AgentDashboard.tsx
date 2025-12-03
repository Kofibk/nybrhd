import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import CampaignBuilder from "@/components/CampaignBuilder";
import LeadsManagement from "@/components/LeadsManagement";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";
import { Home, Users, Calendar, TrendingUp, Plus, Sparkles, ArrowUpRight, Eye } from "lucide-react";

const AgentDashboard = () => {
  const stats = [
    { label: "Active Listings", value: "24", icon: Home, change: "+3 this week" },
    { label: "Leads This Week", value: "156", icon: Users, change: "+12%" },
    { label: "Viewings Booked", value: "43", icon: Calendar, change: "+8 pending" },
    { label: "Conversion Rate", value: "18%", icon: TrendingUp, change: "+2.3%" },
  ];

  const activeCampaigns = [
    { id: 1, name: "City Centre Apartments", budget: "£2,500", ctr: "3.2%", cpl: "£45", status: "Active" },
    { id: 2, name: "Riverside Properties", budget: "£1,800", ctr: "2.8%", cpl: "£52", status: "Active" },
    { id: 3, name: "Suburban Family Homes", budget: "£3,200", ctr: "4.1%", cpl: "£38", status: "Paused" },
  ];

  const properties = [
    { id: 1, name: "The Waterfront", units: 24, available: 8, status: "Live" },
    { id: 2, name: "Garden Square", units: 16, available: 16, status: "Pre-Launch" },
    { id: 3, name: "Riverside Lofts", units: 32, available: 0, status: "Sold Out" },
    { id: 4, name: "City Heights", units: 48, available: 12, status: "Live" },
  ];

  const aiRecommendations = [
    {
      title: "Target First-Time Buyers",
      description: "Your City Centre listings match first-time buyer profiles. Consider a targeted Meta campaign.",
      action: "Create Campaign"
    },
    {
      title: "Optimize Google Ads",
      description: "Switch budget from Meta to Google for Riverside Properties - 23% better CPL projected.",
      action: "Review"
    },
    {
      title: "Schedule Viewings",
      description: "7 high-intent leads matched to your Garden Square properties are ready for viewings.",
      action: "Book Now"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Live":
      case "Active":
        return <Badge className="bg-success/10 text-success border-success/20">● {status}</Badge>;
      case "Pre-Launch":
        return <Badge className="bg-warning/10 text-warning border-warning/20">● {status}</Badge>;
      case "Sold Out":
      case "Paused":
        return <Badge variant="secondary">● {status}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <DashboardLayout title="Agent Dashboard" userType="agent" userName="Agent">
      {/* Welcome Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground">Welcome Back, Agent</h2>
        <p className="text-muted-foreground">Here's your property sales overview</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
              <span className="text-xs text-success font-medium">{stat.change}</span>
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">{stat.value}</div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="overview" className="data-[state=active]:bg-background">Overview</TabsTrigger>
          <TabsTrigger value="campaigns" className="data-[state=active]:bg-background">Campaigns</TabsTrigger>
          <TabsTrigger value="leads" className="data-[state=active]:bg-background">Leads</TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-background">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Active Campaigns Table */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-foreground">Active Campaigns</h3>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Launch New Campaign
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign Name</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>CTR</TableHead>
                  <TableHead>CPL</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeCampaigns.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell className="font-medium">{campaign.name}</TableCell>
                    <TableCell>{campaign.budget}</TableCell>
                    <TableCell>{campaign.ctr}</TableCell>
                    <TableCell>{campaign.cpl}</TableCell>
                    <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          {/* Property Overview */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-6">Property Overview</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {properties.map((property) => (
                <div key={property.id} className="p-4 rounded-lg border border-border bg-card hover:shadow-md transition-shadow">
                  <div className="aspect-video bg-muted rounded-md mb-3 flex items-center justify-center">
                    <Home className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                  <h4 className="font-medium text-foreground mb-1">{property.name}</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    {property.available} of {property.units} units available
                  </p>
                  {getStatusBadge(property.status)}
                </div>
              ))}
            </div>
          </Card>

          {/* AI Recommendations */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="h-5 w-5 text-accent" />
              <h3 className="text-lg font-semibold text-foreground">AI Recommendations</h3>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {aiRecommendations.map((rec, index) => (
                <div key={index} className="p-4 rounded-lg border border-border bg-secondary/30 hover:bg-secondary/50 transition-colors">
                  <h4 className="font-medium text-foreground mb-2">{rec.title}</h4>
                  <p className="text-sm text-muted-foreground mb-4">{rec.description}</p>
                  <Button variant="outline" size="sm" className="w-full">
                    {rec.action}
                    <ArrowUpRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-foreground">AI Campaign Builder</h2>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Campaign
            </Button>
          </div>
          <CampaignBuilder />
        </TabsContent>

        <TabsContent value="leads">
          <LeadsManagement />
        </TabsContent>

        <TabsContent value="analytics">
          <AnalyticsDashboard />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default AgentDashboard;
