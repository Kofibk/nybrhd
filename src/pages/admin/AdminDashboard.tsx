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
  Contact,
  Target,
  Brain,
  Building2,
  UserCircle,
} from "lucide-react";
import AdminClientsTable from "@/components/admin/AdminClientsTable";
import AdminAnalyticsOverview from "@/components/admin/AdminAnalyticsOverview";
import AdminBillingTable from "@/components/admin/AdminBillingTable";
import AdminLeadsTable from "@/components/admin/AdminLeadsTable";
import AdminSettings from "@/components/admin/AdminSettings";
import AdminHeader from "@/components/admin/AdminHeader";
import InviteClientDialog from "@/components/admin/InviteClientDialog";
import AdminMetaCampaigns from "@/components/admin/AdminMetaCampaigns";
import AdminAIOverview from "@/components/admin/AdminAIOverview";
import AdminUsersTable from "@/components/admin/AdminUsersTable";
import AdminCompaniesTable from "@/components/admin/AdminCompaniesTable";
import { toast } from "@/hooks/use-toast";

const AdminDashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  // Mock stats - in production these would come from the database
  const stats = {
    totalClients: 24,
    activeCampaigns: 18,
    totalLeads: 1247,
    totalSpend: 45600,
    avgCPL: 36.57,
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      
      <main className="container mx-auto px-3 md:px-4 py-4 md:py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 md:gap-4 mb-4 md:mb-8">
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
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 md:space-y-6">
          <div className="flex flex-col gap-3 md:gap-4">
            <TabsList className="w-full md:w-auto overflow-x-auto">
              <TabsTrigger value="overview" className="gap-1 md:gap-2 text-xs md:text-sm">
                <Brain className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden sm:inline">AI Overview</span>
              </TabsTrigger>
              <TabsTrigger value="users" className="gap-1 md:gap-2 text-xs md:text-sm">
                <UserCircle className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden sm:inline">Users</span>
              </TabsTrigger>
              <TabsTrigger value="companies" className="gap-1 md:gap-2 text-xs md:text-sm">
                <Building2 className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden sm:inline">Companies</span>
              </TabsTrigger>
              <TabsTrigger value="campaigns" className="gap-1 md:gap-2 text-xs md:text-sm">
                <Target className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden sm:inline">Campaigns</span>
              </TabsTrigger>
              <TabsTrigger value="leads" className="gap-1 md:gap-2 text-xs md:text-sm">
                <Contact className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden sm:inline">Leads</span>
              </TabsTrigger>
              <TabsTrigger value="billing" className="gap-1 md:gap-2 text-xs md:text-sm">
                <CreditCard className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden sm:inline">Billing</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="gap-1 md:gap-2 text-xs md:text-sm">
                <BarChart3 className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden sm:inline">Analytics</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-1 md:gap-2 text-xs md:text-sm">
                <Settings className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden sm:inline">Settings</span>
              </TabsTrigger>
            </TabsList>

            {activeTab !== "overview" && (
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
              </div>
            )}
          </div>

          <TabsContent value="overview">
            <AdminAIOverview />
          </TabsContent>

          <TabsContent value="users">
            <AdminUsersTable searchQuery={searchQuery} />
          </TabsContent>

          <TabsContent value="companies">
            <AdminCompaniesTable searchQuery={searchQuery} />
          </TabsContent>

          <TabsContent value="campaigns">
            <AdminMetaCampaigns searchQuery={searchQuery} />
          </TabsContent>

          <TabsContent value="leads">
            <AdminLeadsTable searchQuery={searchQuery} />
          </TabsContent>

          <TabsContent value="billing">
            <AdminBillingTable searchQuery={searchQuery} />
          </TabsContent>

          <TabsContent value="analytics">
            <AdminAnalyticsOverview />
          </TabsContent>

          <TabsContent value="settings">
            <AdminSettings />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
