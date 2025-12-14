import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CampaignBuilder from "@/components/CampaignBuilder";
import LeadsManagement from "@/components/LeadsManagement";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";
import PerformanceOverview from "@/components/PerformanceOverview";
import { FileText, Users, CheckCircle, Clock, Plus } from "lucide-react";

const BrokerDashboard = () => {
  const stats = [
    { label: "Active Applications", value: "67", icon: FileText },
    { label: "Total Clients", value: "234", icon: Users },
    { label: "Approved This Month", value: "18", icon: CheckCircle },
    { label: "Pending Review", value: "23", icon: Clock },
  ];

  const products = [
    { name: "Residential Mortgage", clients: 145, avgValue: "£350k" },
    { name: "Buy-to-Let", clients: 67, avgValue: "£425k" },
    { name: "International Mortgage", clients: 34, avgValue: "£1.2m" },
    { name: "Life Insurance", clients: 156, avgValue: "£280/mo" },
  ];

  const pipeline = [
    { stage: "New Enquiries", count: 34, color: "default" },
    { stage: "Prequalified", count: 23, color: "secondary" },
    { stage: "Application Submitted", count: 18, color: "default" },
    { stage: "Offer Issued", count: 12, color: "default" },
  ];

  return (
    <DashboardLayout title="Mortgage Dashboard" userType="broker">
      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-4 md:p-6">
            <stat.icon className="h-6 w-6 md:h-8 md:w-8 text-primary mb-3 md:mb-4" />
            <div className="text-xl md:text-3xl font-bold mb-0.5 md:mb-1">{stat.value}</div>
            <div className="text-xs md:text-sm text-muted-foreground">{stat.label}</div>
          </Card>
        ))}
      </div>

      {/* Product Performance & Pipeline */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
        <Card className="p-4 md:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 md:mb-6">
            <h3 className="text-lg md:text-xl font-bold">Product Performance</h3>
            <Button size="sm" className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </div>
          <div className="space-y-3 md:space-y-4">
            {products.map((product) => (
              <div key={product.name} className="p-3 md:p-4 bg-secondary/50 rounded-lg">
                <div className="flex justify-between items-start mb-1 md:mb-2">
                  <div className="font-medium text-sm md:text-base">{product.name}</div>
                  <Badge variant="outline" className="text-[10px] md:text-xs">{product.clients} clients</Badge>
                </div>
                <div className="text-xs md:text-sm text-muted-foreground">
                  Avg. Value: {product.avgValue}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4 md:p-6">
          <h3 className="text-lg md:text-xl font-bold mb-4 md:mb-6">Application Pipeline</h3>
          <div className="space-y-3 md:space-y-4">
            {pipeline.map((stage) => (
              <div key={stage.stage} className="flex justify-between items-center p-3 md:p-4 bg-secondary/50 rounded-lg">
                <div>
                  <div className="font-medium text-sm md:text-base">{stage.stage}</div>
                  <div className="text-xs md:text-sm text-muted-foreground">
                    {stage.count} applications
                  </div>
                </div>
                <div className="text-xl md:text-2xl font-bold text-primary">{stage.count}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4 md:space-y-6">
        <TabsList className="w-full overflow-x-auto flex justify-start">
          <TabsTrigger value="overview" className="text-xs md:text-sm">Overview</TabsTrigger>
          <TabsTrigger value="campaigns" className="text-xs md:text-sm">Campaigns</TabsTrigger>
          <TabsTrigger value="leads" className="text-xs md:text-sm">Leads</TabsTrigger>
          <TabsTrigger value="analytics" className="text-xs md:text-sm">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <PerformanceOverview userType="broker" />
        </TabsContent>

        <TabsContent value="campaigns">
          <PerformanceOverview userType="broker" />
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
          <PerformanceOverview userType="broker" />
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

export default BrokerDashboard;