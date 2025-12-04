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
      <div className="mb-3 md:mb-4">
        <Link
          to={`/${userType}/campaigns`}
          className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground mb-2"
        >
          <ArrowLeft className="h-3 w-3 mr-1" />
          Back to Campaigns
        </Link>
        
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-lg md:text-xl font-bold">{campaign.name}</h1>
              <Badge variant={getStatusVariant(campaign.status)} className="capitalize text-[10px]">
                {campaign.status}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-2 md:gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Target className="h-3 w-3" />
                {campaign.objective}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {campaign.startDate} {campaign.isOngoing ? "(Ongoing)" : `- ${campaign.endDate}`}
              </span>
              <span className="flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                £{campaign.budget.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-2 md:gap-3 mb-3 md:mb-4">
        <Card className="p-2.5 md:p-4 shadow-card">
          <div className="flex items-center gap-1 text-muted-foreground mb-0.5">
            <Users className="h-3 w-3" />
            <span className="text-[10px] md:text-xs">Leads</span>
          </div>
          <div className="text-base md:text-xl font-bold">{totalLeads}</div>
        </Card>
        <Card className="p-2.5 md:p-4 shadow-card">
          <div className="flex items-center gap-1 text-muted-foreground mb-0.5">
            <DollarSign className="h-3 w-3" />
            <span className="text-[10px] md:text-xs">Spend</span>
          </div>
          <div className="text-base md:text-xl font-bold">£{totalSpend.toLocaleString()}</div>
        </Card>
        <Card className="p-2.5 md:p-4 shadow-card">
          <div className="flex items-center gap-1 text-muted-foreground mb-0.5">
            <TrendingUp className="h-3 w-3" />
            <span className="text-[10px] md:text-xs">CPL</span>
          </div>
          <div className="text-base md:text-xl font-bold">£{avgCPL}</div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-3 md:space-y-4">
        <div className="overflow-x-auto -mx-3 px-3 md:mx-0 md:px-0">
          <TabsList className="w-auto min-w-full md:min-w-0 h-8">
            <TabsTrigger value="overview" className="text-xs h-7">Overview</TabsTrigger>
            <TabsTrigger value="creatives" className="text-xs h-7">Creatives</TabsTrigger>
            <TabsTrigger value="tracking" className="text-xs h-7">Tracking</TabsTrigger>
            <TabsTrigger value="platform" className="text-xs h-7">Platform IDs</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-3 md:space-y-4">
          <div className="grid lg:grid-cols-2 gap-3 md:gap-4">
            <Card className="p-3 md:p-4 shadow-card">
              <h3 className="font-semibold mb-2 md:mb-3 flex items-center gap-1.5 text-xs md:text-sm">
                <Users className="h-3.5 w-3.5" />
                Leads over Time
              </h3>
              <div className="h-40 md:h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={leadsChartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="date" tick={{ fontSize: 9 }} />
                    <YAxis tick={{ fontSize: 9 }} width={30} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="leads"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--primary))", r: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-3 md:p-4 shadow-card">
              <h3 className="font-semibold mb-2 md:mb-3 flex items-center gap-1.5 text-xs md:text-sm">
                <DollarSign className="h-3.5 w-3.5" />
                Spend vs Leads
              </h3>
              <div className="h-40 md:h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={spendVsLeadsData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="date" tick={{ fontSize: 9 }} />
                    <YAxis tick={{ fontSize: 9 }} width={30} />
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
          <Card className="p-3 md:p-4 shadow-card">
            {campaign.creatives ? (
              <div className="space-y-3 md:space-y-4">
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-1.5 text-xs md:text-sm">
                    <Image className="h-3.5 w-3.5" />
                    Images
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {campaign.creatives.images.length > 0 ? (
                      campaign.creatives.images.map((img, i) => (
                        <div key={i} className="aspect-video bg-muted rounded-lg overflow-hidden">
                          <img src={img} alt={`Creative ${i + 1}`} className="w-full h-full object-cover" />
                        </div>
                      ))
                    ) : (
                      <div className="col-span-2 md:col-span-3 text-center py-4 text-muted-foreground text-xs">
                        No images uploaded
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-0.5 text-xs md:text-sm">Headline</h3>
                  <p className="text-sm md:text-base">{campaign.creatives.selectedHeadline}</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-0.5 text-xs md:text-sm">Primary Text</h3>
                  <p className="text-muted-foreground text-xs md:text-sm">{campaign.creatives.selectedPrimaryText}</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-0.5 text-xs md:text-sm">Call-to-Action</h3>
                  <Badge variant="outline" className="text-[10px] md:text-xs">{campaign.creatives.selectedCta}</Badge>
                </div>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4 text-xs">No creatives configured</p>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="tracking">
          <Card className="p-3 md:p-4 shadow-card space-y-3 md:space-y-4">
            <div>
              <h3 className="font-semibold mb-1.5 flex items-center gap-1.5 text-xs md:text-sm">
                <Settings className="h-3.5 w-3.5" />
                UTM Template
              </h3>
              <div className="p-2 bg-muted/50 rounded-lg font-mono text-[10px] md:text-xs break-all">
                utm_source=meta&utm_medium=paid_social&utm_campaign={campaign.id}&utm_content={"{ad_id}"}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-1.5 text-xs md:text-sm">Form Fields</h3>
              <div className="flex flex-wrap gap-1.5">
                {["full_name", "email", "phone"].map((field) => (
                  <Badge key={field} variant="secondary" className="text-[10px]">
                    {field}
                  </Badge>
                ))}
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="platform">
          <Card className="p-3 md:p-4 shadow-card">
            <h3 className="font-semibold mb-2 md:mb-3 flex items-center gap-1.5 text-xs md:text-sm">
              <Link2 className="h-3.5 w-3.5" />
              Meta Platform IDs
            </h3>
            <div className="space-y-1.5 md:space-y-2">
              {[
                { label: "Campaign ID", value: campaign.metaCampaignId },
                { label: "Ad Set ID", value: campaign.metaAdsetId },
                { label: "Form ID", value: campaign.metaFormId },
                { label: "Ad IDs", value: campaign.metaAdIds?.join(", ") },
              ].map((item) => (
                <div key={item.label} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-0.5 p-2 border border-border rounded-lg">
                  <span className="text-muted-foreground text-[10px] md:text-xs">{item.label}</span>
                  <code className="text-[10px] md:text-xs bg-muted px-1.5 py-0.5 rounded truncate max-w-full sm:max-w-xs">
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
