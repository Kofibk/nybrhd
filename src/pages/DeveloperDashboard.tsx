import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CampaignBuilder from "@/components/CampaignBuilder";
import LeadsManagement from "@/components/LeadsManagement";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";
import WhatsAppLeadNurturing from "@/components/WhatsAppLeadNurturing";
import EmailAutomation from "@/components/EmailAutomation";
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
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
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

        <TabsContent value="leads">
          <LeadsManagement />
        </TabsContent>

        <TabsContent value="whatsapp">
          <WhatsAppLeadNurturing />
        </TabsContent>

        <TabsContent value="email">
          <EmailAutomation />
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
          <AnalyticsDashboard />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default DeveloperDashboard;
