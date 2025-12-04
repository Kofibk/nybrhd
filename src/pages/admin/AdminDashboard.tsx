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
      
      <main className="container mx-auto px-3 md:px-4 py-4 md:py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-4 mb-4 md:mb-8">
          <Card>
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center gap-1.5 md:gap-2 text-muted-foreground mb-1">
                <Users className="h-3 w-3 md:h-4 md:w-4" />
                <span className="text-[10px] md:text-xs">Total Clients</span>
              </div>
              <p className="text-lg md:text-2xl font-bold">{stats.totalClients}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center gap-1.5 md:gap-2 text-muted-foreground mb-1">
                <Megaphone className="h-3 w-3 md:h-4 md:w-4" />
                <span className="text-[10px] md:text-xs">Active Campaigns</span>
              </div>
              <p className="text-lg md:text-2xl font-bold">{stats.activeCampaigns}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center gap-1.5 md:gap-2 text-muted-foreground mb-1">
                <TrendingUp className="h-3 w-3 md:h-4 md:w-4" />
                <span className="text-[10px] md:text-xs">Total Leads</span>
              </div>
              <p className="text-lg md:text-2xl font-bold">{stats.totalLeads.toLocaleString()}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center gap-1.5 md:gap-2 text-muted-foreground mb-1">
                <DollarSign className="h-3 w-3 md:h-4 md:w-4" />
                <span className="text-[10px] md:text-xs">Ad Spend</span>
              </div>
              <p className="text-lg md:text-2xl font-bold">£{stats.totalSpend.toLocaleString()}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center gap-1.5 md:gap-2 text-muted-foreground mb-1">
                <BarChart3 className="h-3 w-3 md:h-4 md:w-4" />
                <span className="text-[10px] md:text-xs">Avg CPL</span>
              </div>
              <p className="text-lg md:text-2xl font-bold">£{stats.avgCPL.toFixed(2)}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center gap-1.5 md:gap-2 text-muted-foreground mb-1">
                <CreditCard className="h-3 w-3 md:h-4 md:w-4" />
                <span className="text-[10px] md:text-xs">Monthly Revenue</span>
              </div>
              <p className="text-lg md:text-2xl font-bold text-green-600">£{stats.monthlyRevenue.toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 md:space-y-6">
          <div className="flex flex-col gap-3 md:gap-4">
            <TabsList className="w-full md:w-auto overflow-x-auto">
              <TabsTrigger value="clients" className="gap-1 md:gap-2 text-xs md:text-sm">
                <Users className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden sm:inline">Clients</span>
              </TabsTrigger>
              <TabsTrigger value="campaigns" className="gap-1 md:gap-2 text-xs md:text-sm">
                <Megaphone className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden sm:inline">Campaigns</span>
              </TabsTrigger>
              <TabsTrigger value="billing" className="gap-1 md:gap-2 text-xs md:text-sm">
                <CreditCard className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden sm:inline">Billing</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="gap-1 md:gap-2 text-xs md:text-sm">
                <BarChart3 className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden sm:inline">Analytics</span>
              </TabsTrigger>
            </TabsList>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-full sm:w-64"
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
