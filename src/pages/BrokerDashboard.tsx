import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
    { name: "Foreign Exchange", clients: 89, avgValue: "£180k" },
    { name: "Life Insurance", clients: 156, avgValue: "£280/mo" },
  ];

  const pipeline = [
    { stage: "New Enquiries", count: 34, color: "default" },
    { stage: "Prequalified", count: 23, color: "secondary" },
    { stage: "Application Submitted", count: 18, color: "default" },
    { stage: "Offer Issued", count: 12, color: "default" },
  ];

  return (
    <DashboardLayout title="Broker Dashboard" userType="broker">
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
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold">Product Performance</h3>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </div>
          <div className="space-y-4">
            {products.map((product) => (
              <div key={product.name} className="p-4 bg-secondary/50 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-medium">{product.name}</div>
                  <Badge variant="outline">{product.clients} clients</Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  Avg. Value: {product.avgValue}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-bold mb-6">Application Pipeline</h3>
          <div className="space-y-4">
            {pipeline.map((stage) => (
              <div key={stage.stage} className="flex justify-between items-center p-4 bg-secondary/50 rounded-lg">
                <div>
                  <div className="font-medium">{stage.stage}</div>
                  <div className="text-sm text-muted-foreground">
                    {stage.count} applications
                  </div>
                </div>
                <div className="text-2xl font-bold text-primary">{stage.count}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-xl font-bold mb-6">AI Product Recommendations</h3>
        <div className="space-y-3">
          <div className="p-4 border border-border rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="font-medium">Sarah Mitchell</div>
                <div className="text-sm text-muted-foreground">London investor, £500k budget</div>
              </div>
              <Badge>High Match</Badge>
            </div>
            <div className="text-sm">
              <span className="font-medium">Recommended:</span> Buy-to-Let + FX Services
            </div>
          </div>
          <div className="p-4 border border-border rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="font-medium">James Okonkwo</div>
                <div className="text-sm text-muted-foreground">International buyer, £800k</div>
              </div>
              <Badge>High Match</Badge>
            </div>
            <div className="text-sm">
              <span className="font-medium">Recommended:</span> International Mortgage + FX
            </div>
          </div>
        </div>
      </Card>
    </DashboardLayout>
  );
};

export default BrokerDashboard;
