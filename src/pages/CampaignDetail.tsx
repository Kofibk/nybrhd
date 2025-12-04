import { useParams, useNavigate, Link } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getCampaigns, getMetrics } from "@/lib/api";
import { UserRole } from "@/lib/types";
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Users,
  Target,
  TrendingUp,
  Image,
  Settings,
  Link2,
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

interface CampaignDetailProps {
  userType: UserRole;
}

const CampaignDetail = ({ userType }: CampaignDetailProps) => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const campaigns = getCampaigns();
  const campaign = campaigns.find((c) => c.id === id);
  const metrics = getMetrics().filter((m) => m.campaignId === id || m.campaignId === "camp_1");

  if (!campaign) {
    return (
      <DashboardLayout title="Campaign Not Found" userType={userType}>
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Campaign not found</p>
          <Button onClick={() => navigate(`/${userType}/campaigns`)}>
            Back to Campaigns
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "live": return "default";
      case "draft": return "secondary";
      case "paused": return "outline";
      case "completed": return "secondary";
      default: return "default";
    }
  };

  // Calculate KPIs from metrics
  const totalLeads = metrics.reduce((sum, m) => sum + m.leads, 0);
  const totalSpend = metrics.reduce((sum, m) => sum + m.spend, 0);
  const avgCPL = totalLeads > 0 ? (totalSpend / totalLeads).toFixed(2) : "0.00";

  // Chart data
  const leadsChartData = metrics.map((m) => ({
    date: m.date.slice(5), // MM-DD
    leads: m.leads,
  }));

  const spendVsLeadsData = metrics.map((m) => ({
    date: m.date.slice(5),
    spend: m.spend,
    leads: m.leads * 10, // Scale for visibility
  }));

  return (
    <DashboardLayout title={campaign.name} userType={userType}>
      {/* Header */}
      <div className="mb-6">
        <Link
          to={`/${userType}/campaigns`}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Campaigns
        </Link>
        
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold">{campaign.name}</h1>
              <Badge variant={getStatusVariant(campaign.status)} className="capitalize">
                {campaign.status}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Target className="h-4 w-4" />
                {campaign.objective}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {campaign.startDate} {campaign.isOngoing ? "(Ongoing)" : `- ${campaign.endDate}`}
              </span>
              <span className="flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                £{campaign.budget.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="p-5 shadow-card">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Users className="h-4 w-4" />
            <span className="text-sm">Leads</span>
          </div>
          <div className="text-2xl font-bold">{totalLeads}</div>
        </Card>
        <Card className="p-5 shadow-card">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <DollarSign className="h-4 w-4" />
            <span className="text-sm">Spend</span>
          </div>
          <div className="text-2xl font-bold">£{totalSpend.toLocaleString()}</div>
        </Card>
        <Card className="p-5 shadow-card">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm">CPL</span>
          </div>
          <div className="text-2xl font-bold">£{avgCPL}</div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="creatives">Creatives</TabsTrigger>
          <TabsTrigger value="tracking">Tracking</TabsTrigger>
          <TabsTrigger value="platform">Platform IDs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="p-5 shadow-card">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Leads over Time
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={leadsChartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="leads"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--primary))" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-5 shadow-card">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Spend vs Leads
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={spendVsLeadsData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip />
                    <Bar dataKey="spend" fill="hsl(var(--primary))" name="Spend (£)" />
                    <Bar dataKey="leads" fill="hsl(var(--accent))" name="Leads (×10)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="creatives">
          <Card className="p-6 shadow-card">
            {campaign.creatives ? (
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Image className="h-4 w-4" />
                    Images
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    {campaign.creatives.images.length > 0 ? (
                      campaign.creatives.images.map((img, i) => (
                        <div key={i} className="aspect-video bg-muted rounded-lg overflow-hidden">
                          <img src={img} alt={`Creative ${i + 1}`} className="w-full h-full object-cover" />
                        </div>
                      ))
                    ) : (
                      <div className="col-span-3 text-center py-8 text-muted-foreground">
                        No images uploaded
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Headline</h3>
                  <p className="text-lg">{campaign.creatives.selectedHeadline}</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Primary Text</h3>
                  <p className="text-muted-foreground">{campaign.creatives.selectedPrimaryText}</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Call-to-Action</h3>
                  <Badge variant="outline">{campaign.creatives.selectedCta}</Badge>
                </div>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No creatives configured</p>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="tracking">
          <Card className="p-6 shadow-card space-y-6">
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Settings className="h-4 w-4" />
                UTM Template
              </h3>
              <div className="p-3 bg-muted/50 rounded-lg font-mono text-sm break-all">
                utm_source=meta&utm_medium=paid_social&utm_campaign={campaign.id}&utm_content={"{ad_id}"}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Form Fields</h3>
              <div className="space-y-2">
                {["full_name", "email", "phone"].map((field) => (
                  <Badge key={field} variant="secondary" className="mr-2">
                    {field}
                  </Badge>
                ))}
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="platform">
          <Card className="p-6 shadow-card">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Link2 className="h-4 w-4" />
              Meta Platform IDs
            </h3>
            <div className="space-y-4">
              {[
                { label: "Campaign ID", value: campaign.metaCampaignId },
                { label: "Ad Set ID", value: campaign.metaAdsetId },
                { label: "Form ID", value: campaign.metaFormId },
                { label: "Ad IDs", value: campaign.metaAdIds?.join(", ") },
              ].map((item) => (
                <div key={item.label} className="flex justify-between items-center p-3 border border-border rounded-lg">
                  <span className="text-muted-foreground">{item.label}</span>
                  <code className="text-sm bg-muted px-2 py-1 rounded">
                    {item.value || "Not assigned"}
                  </code>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default CampaignDetail;
