import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CampaignBuilder from "@/components/CampaignBuilder";
import LeadsManagement from "@/components/LeadsManagement";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";
import { Home, Users, Calendar, TrendingUp, Plus } from "lucide-react";
import LeadScoreCard from "@/components/LeadScoreCard";

const AgentDashboard = () => {
  const stats = [
    { label: "Active Listings", value: "24", icon: Home },
    { label: "Total Enquiries", value: "156", icon: Users },
    { label: "Viewings Booked", value: "43", icon: Calendar },
    { label: "Offers This Month", value: "8", icon: TrendingUp },
  ];

  const mockLeads = [
    {
      id: "1",
      name: "Emma Thompson",
      email: "emma.t@example.com",
      phone: "+44 7700 900456",
      location: "Manchester, UK",
      profileScore: 88,
      intentScore: 82,
      status: "viewing" as const,
      source: "Website - Apartment Search"
    },
    {
      id: "2",
      name: "Michael Chen",
      email: "michael.c@example.com",
      phone: "+44 7700 900789",
      location: "Birmingham, UK",
      profileScore: 75,
      intentScore: 90,
      status: "qualified" as const,
      source: "Rightmove Campaign"
    }
  ];

  return (
    <DashboardLayout title="Agent Dashboard" userType="agent">
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-6">
            <stat.icon className="h-8 w-8 text-primary mb-4" />
            <div className="text-3xl font-bold mb-1">{stat.value}</div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Button className="w-full justify-start" size="lg">
              <Plus className="mr-2 h-5 w-5" />
              Add New Listing
            </Button>
            <Button variant="outline" className="w-full justify-start" size="lg">
              <Calendar className="mr-2 h-5 w-5" />
              Schedule Viewing
            </Button>
            <Button variant="outline" className="w-full justify-start" size="lg">
              <Users className="mr-2 h-5 w-5" />
              Import Leads
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="p-3 bg-secondary/50 rounded-lg">
              <div className="font-medium">New viewing request</div>
              <div className="text-sm text-muted-foreground">3-bed apartment, City Centre</div>
            </div>
            <div className="p-3 bg-secondary/50 rounded-lg">
              <div className="font-medium">Offer submitted</div>
              <div className="text-sm text-muted-foreground">£425k on 2-bed flat</div>
            </div>
            <div className="p-3 bg-secondary/50 rounded-lg">
              <div className="font-medium">AI matched 5 new buyers</div>
              <div className="text-sm text-muted-foreground">For your riverside listings</div>
            </div>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div>
            <h2 className="text-2xl font-bold mb-6">High-Intent Leads</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockLeads.map((lead) => (
                <LeadScoreCard key={lead.id} lead={lead} />
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="campaigns">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">AI Campaign Builder</h2>
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
