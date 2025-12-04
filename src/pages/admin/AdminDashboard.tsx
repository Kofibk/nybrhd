import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Users,
  Megaphone,
  BarChart3,
  TrendingUp,
  DollarSign,
  Eye,
  Plus,
  Search,
  CreditCard,
  Settings,
} from "lucide-react";
import AdminClientsTable from "@/components/admin/AdminClientsTable";
import AdminCampaignsTable from "@/components/admin/AdminCampaignsTable";
import AdminAnalyticsOverview from "@/components/admin/AdminAnalyticsOverview";
import AdminBillingTable from "@/components/admin/AdminBillingTable";
import AdminHeader from "@/components/admin/AdminHeader";
import InviteClientDialog from "@/components/admin/InviteClientDialog";
import CreateClientCampaignDialog from "@/components/admin/CreateClientCampaignDialog";
import { toast } from "@/hooks/use-toast";

const AdminDashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("clients");

  // Mock stats - in production these would come from the database
  const stats = {
    totalClients: 24,
    activeCampaigns: 18,
    totalLeads: 1247,
    totalSpend: 45600,
    avgCPL: 36.57,
    monthlyRevenue: 12500,
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      
      <main className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Users className="h-4 w-4" />
                <span className="text-xs">Total Clients</span>
              </div>
              <p className="text-2xl font-bold">{stats.totalClients}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Megaphone className="h-4 w-4" />
                <span className="text-xs">Active Campaigns</span>
              </div>
              <p className="text-2xl font-bold">{stats.activeCampaigns}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <TrendingUp className="h-4 w-4" />
                <span className="text-xs">Total Leads</span>
              </div>
              <p className="text-2xl font-bold">{stats.totalLeads.toLocaleString()}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <DollarSign className="h-4 w-4" />
                <span className="text-xs">Ad Spend</span>
              </div>
              <p className="text-2xl font-bold">£{stats.totalSpend.toLocaleString()}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <BarChart3 className="h-4 w-4" />
                <span className="text-xs">Avg CPL</span>
              </div>
              <p className="text-2xl font-bold">£{stats.avgCPL.toFixed(2)}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <CreditCard className="h-4 w-4" />
                <span className="text-xs">Monthly Revenue</span>
              </div>
              <p className="text-2xl font-bold text-green-600">£{stats.monthlyRevenue.toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <TabsList>
              <TabsTrigger value="clients" className="gap-2">
                <Users className="h-4 w-4" />
                Clients
              </TabsTrigger>
              <TabsTrigger value="campaigns" className="gap-2">
                <Megaphone className="h-4 w-4" />
                Campaigns
              </TabsTrigger>
              <TabsTrigger value="billing" className="gap-2">
                <CreditCard className="h-4 w-4" />
                Billing
              </TabsTrigger>
              <TabsTrigger value="analytics" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                Analytics
              </TabsTrigger>
            </TabsList>

            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
              {activeTab === "clients" && (
                <InviteClientDialog 
                  onClientInvited={(client) => {
                    toast({
                      title: "Client invited",
                      description: `${client.company} has been added to the pending invitations.`,
                    });
                  }}
                />
              )}
              {activeTab === "campaigns" && (
                <CreateClientCampaignDialog
                  onCampaignCreated={(campaign) => {
                    toast({
                      title: "Campaign created",
                      description: `${campaign.name} has been created for ${campaign.clientName}.`,
                    });
                  }}
                />
              )}
            </div>
          </div>

          <TabsContent value="clients">
            <AdminClientsTable searchQuery={searchQuery} />
          </TabsContent>

          <TabsContent value="campaigns">
            <AdminCampaignsTable searchQuery={searchQuery} />
          </TabsContent>

          <TabsContent value="billing">
            <AdminBillingTable searchQuery={searchQuery} />
          </TabsContent>

          <TabsContent value="analytics">
            <AdminAnalyticsOverview />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
