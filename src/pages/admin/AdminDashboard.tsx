import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
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
  Building2,
  User,
  Briefcase,
} from "lucide-react";
import AdminClientsTable from "@/components/admin/AdminClientsTable";
import AdminCampaignsTable from "@/components/admin/AdminCampaignsTable";
import AdminAnalyticsOverview from "@/components/admin/AdminAnalyticsOverview";
import AdminHeader from "@/components/admin/AdminHeader";

const AdminDashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");

  // Mock stats - in production these would come from the database
  const stats = {
    totalClients: 24,
    activeCampaigns: 18,
    totalLeads: 1247,
    totalSpend: 45600,
    avgCPL: 36.57,
    conversionRate: 4.2,
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
                <span className="text-xs">Clients</span>
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
                <span className="text-xs">Total Spend</span>
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
                <Eye className="h-4 w-4" />
                <span className="text-xs">Conversion</span>
              </div>
              <p className="text-2xl font-bold">{stats.conversionRate}%</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="clients" className="space-y-6">
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
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Campaign
              </Button>
            </div>
          </div>

          <TabsContent value="clients">
            <AdminClientsTable searchQuery={searchQuery} />
          </TabsContent>

          <TabsContent value="campaigns">
            <AdminCampaignsTable searchQuery={searchQuery} />
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
