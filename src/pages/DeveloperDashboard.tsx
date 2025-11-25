import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LeadScoreCard from "@/components/LeadScoreCard";
import CampaignBuilder from "@/components/CampaignBuilder";
import { Building2, Users, TrendingUp, Target, Plus } from "lucide-react";

const DeveloperDashboard = () => {
  const stats = [
    { label: "Active Campaigns", value: "12", change: "+3 this month", icon: Target },
    { label: "Total Leads", value: "847", change: "+124 this week", icon: Users },
    { label: "Qualified Buyers", value: "156", change: "18% conversion", icon: TrendingUp },
    { label: "Developments", value: "8", change: "3 active", icon: Building2 },
  ];

  const mockLeads = [
    {
      id: "1",
      name: "James Okonkwo",
      email: "james.o@example.com",
      phone: "+234 801 234 5678",
      location: "Lagos, Nigeria",
      profileScore: 85,
      intentScore: 78,
      status: "qualified" as const,
      source: "Meta Campaign - Lagos HNW"
    },
    {
      id: "2",
      name: "Sarah Mitchell",
      email: "sarah.m@example.com",
      phone: "+44 7700 900123",
      location: "London, UK",
      profileScore: 72,
      intentScore: 91,
      status: "viewing" as const,
      source: "Google Ads - UK Investors"
    },
    {
      id: "3",
      name: "Ahmed Al-Rashid",
      email: "ahmed.r@example.com",
      phone: "+971 50 123 4567",
      location: "Dubai, UAE",
      profileScore: 90,
      intentScore: 85,
      status: "offer" as const,
      source: "LinkedIn - Dubai Expats"
    }
  ];

  return (
    <DashboardLayout title="Developer Dashboard" userType="developer">
      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-6">
            <div className="flex justify-between items-start mb-2">
              <stat.icon className="h-8 w-8 text-primary" />
            </div>
            <div className="text-3xl font-bold mb-1">{stat.value}</div>
            <div className="text-sm text-muted-foreground mb-1">{stat.label}</div>
            <div className="text-xs text-success">{stat.change}</div>
          </Card>
        ))}
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="campaigns" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="developments">Developments</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">AI Campaign Builder</h2>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Development
            </Button>
          </div>
          <CampaignBuilder />
        </TabsContent>

        <TabsContent value="leads" className="space-y-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Lead Pipeline</h2>
            <div className="flex gap-2">
              <Button variant="outline">Filter</Button>
              <Button variant="outline">Sort</Button>
            </div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockLeads.map((lead) => (
              <LeadScoreCard key={lead.id} lead={lead} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="developments">
          <Card className="p-8 text-center">
            <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Manage Your Developments</h3>
            <p className="text-muted-foreground mb-4">
              Upload and manage multiple property developments with dedicated campaigns for each
            </p>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Development
            </Button>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">Campaign Performance</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-secondary/50 rounded-lg">
                  <div>
                    <div className="font-medium">Marina Heights - Meta</div>
                    <div className="text-sm text-muted-foreground">Last 30 days</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-success">4.2x</div>
                    <div className="text-sm text-muted-foreground">ROI</div>
                  </div>
                </div>
                <div className="flex justify-between items-center p-4 bg-secondary/50 rounded-lg">
                  <div>
                    <div className="font-medium">Skyline Tower - Google</div>
                    <div className="text-sm text-muted-foreground">Last 30 days</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-success">3.8x</div>
                    <div className="text-sm text-muted-foreground">ROI</div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">Conversion Funnel</h3>
              <div className="space-y-3">
                {[
                  { stage: "Leads", count: 847, percentage: 100 },
                  { stage: "Qualified", count: 156, percentage: 18 },
                  { stage: "Viewing Booked", count: 89, percentage: 10 },
                  { stage: "Offers Made", count: 34, percentage: 4 },
                  { stage: "Sold", count: 12, percentage: 1.4 }
                ].map((stage) => (
                  <div key={stage.stage} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{stage.stage}</span>
                      <span className="text-muted-foreground">
                        {stage.count} ({stage.percentage}%)
                      </span>
                    </div>
                    <div className="h-3 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${stage.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default DeveloperDashboard;
