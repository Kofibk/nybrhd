import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import CampaignBuilder from "@/components/CampaignBuilder";
import LeadsManagement from "@/components/LeadsManagement";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";
import PerformanceOverview from "@/components/PerformanceOverview";
import { Home, Users, Calendar, TrendingUp, Plus, Eye } from "lucide-react";

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


  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Live":
      case "Active":
        return <Badge className="bg-success/10 text-success border-success/20 text-[10px] md:text-xs">● {status}</Badge>;
      case "Pre-Launch":
        return <Badge className="bg-warning/10 text-warning border-warning/20 text-[10px] md:text-xs">● {status}</Badge>;
      case "Sold Out":
      case "Paused":
        return <Badge variant="secondary" className="text-[10px] md:text-xs">● {status}</Badge>;
      default:
        return <Badge variant="outline" className="text-[10px] md:text-xs">{status}</Badge>;
    }
  };

  return (
    <DashboardLayout title="Agent Dashboard" userType="agent" userName="Agent">
      {/* Welcome Header */}
      <div className="mb-6 md:mb-8">
        <h2 className="text-xl md:text-2xl font-bold text-foreground">Welcome Back, Agent</h2>
        <p className="text-sm md:text-base text-muted-foreground">Here's your property sales overview</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-3 md:p-5">
            <div className="flex items-start justify-between mb-2 md:mb-3">
              <div className="p-1.5 md:p-2 rounded-lg bg-primary/10">
                <stat.icon className="h-4 w-4 md:h-5 md:w-5 text-primary" />
              </div>
              <span className="text-[10px] md:text-xs text-success font-medium">{stat.change}</span>
            </div>
            <div className="text-lg md:text-2xl font-bold text-foreground mb-0.5 md:mb-1">{stat.value}</div>
            <div className="text-xs md:text-sm text-muted-foreground">{stat.label}</div>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="overview" className="space-y-4 md:space-y-6">
        <TabsList className="bg-muted/50 p-1 w-full overflow-x-auto flex justify-start">
          <TabsTrigger value="overview" className="data-[state=active]:bg-background text-xs md:text-sm">Overview</TabsTrigger>
          <TabsTrigger value="campaigns" className="data-[state=active]:bg-background text-xs md:text-sm">Campaigns</TabsTrigger>
          <TabsTrigger value="leads" className="data-[state=active]:bg-background text-xs md:text-sm">Leads</TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-background text-xs md:text-sm">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 md:space-y-6">
          {/* Active Campaigns Table */}
          <Card className="p-4 md:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 md:mb-6">
              <h3 className="text-base md:text-lg font-semibold text-foreground">Active Campaigns</h3>
              <Button size="sm" className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Launch Campaign
              </Button>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs md:text-sm">Campaign</TableHead>
                    <TableHead className="text-xs md:text-sm">Budget</TableHead>
                    <TableHead className="text-xs md:text-sm hidden sm:table-cell">CTR</TableHead>
                    <TableHead className="text-xs md:text-sm">CPL</TableHead>
                    <TableHead className="text-xs md:text-sm">Status</TableHead>
                    <TableHead className="text-xs md:text-sm"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeCampaigns.map((campaign) => (
                    <TableRow key={campaign.id}>
                      <TableCell className="font-medium text-xs md:text-sm">{campaign.name}</TableCell>
                      <TableCell className="text-xs md:text-sm">{campaign.budget}</TableCell>
                      <TableCell className="text-xs md:text-sm hidden sm:table-cell">{campaign.ctr}</TableCell>
                      <TableCell className="text-xs md:text-sm">{campaign.cpl}</TableCell>
                      <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" className="h-7 w-7 md:h-8 md:w-8 p-0">
                          <Eye className="h-3 w-3 md:h-4 md:w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>

          {/* Property Overview */}
          <Card className="p-4 md:p-6">
            <h3 className="text-base md:text-lg font-semibold text-foreground mb-4 md:mb-6">Property Overview</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              {properties.map((property) => (
                <div key={property.id} className="p-3 md:p-4 rounded-lg border border-border bg-card hover:shadow-md transition-shadow">
                  <div className="aspect-video bg-muted rounded-md mb-2 md:mb-3 flex items-center justify-center">
                    <Home className="h-6 w-6 md:h-8 md:w-8 text-muted-foreground/50" />
                  </div>
                  <h4 className="font-medium text-foreground mb-0.5 md:mb-1 text-sm md:text-base">{property.name}</h4>
                  <p className="text-xs md:text-sm text-muted-foreground mb-2">
                    {property.available} of {property.units} available
                  </p>
                  {getStatusBadge(property.status)}
                </div>
              ))}
            </div>
          </Card>

          {/* Performance Overview */}
          <PerformanceOverview userType="agent" />
        </TabsContent>

        <TabsContent value="campaigns">
          <PerformanceOverview userType="agent" context="campaigns" />
          <div className="mt-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 md:mb-6">
              <h2 className="text-lg md:text-xl font-semibold text-foreground">AI Campaign Builder</h2>
              <Button className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                New Campaign
              </Button>
            </div>
            <CampaignBuilder />
          </div>
        </TabsContent>

        <TabsContent value="leads">
          <PerformanceOverview userType="agent" context="leads" />
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

export default AgentDashboard;