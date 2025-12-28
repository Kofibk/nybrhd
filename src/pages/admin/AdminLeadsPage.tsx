import { useState } from "react";
import AdminLeadsTable from "@/components/admin/AdminLeadsTable";
import AdminBuyersTable from "@/components/admin/AdminBuyersTable";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AIInsightsPanel } from "@/components/AIInsightsPanel";
import { useUploadedData } from "@/contexts/DataContext";
import { useAirtableLeadsForTable } from "@/hooks/useAirtableLeads";
import { useAirtableBuyersForTable } from "@/hooks/useAirtableBuyers";
import { RefreshCw, Users, UserCheck } from "lucide-react";

const AdminLeadsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("buyers");
  const { leadData, campaignData } = useUploadedData('admin');
  
  // Fetch Airtable leads with auto-refresh enabled
  const { leads: airtableLeads, isLoading: leadsLoading, isFetching: leadsFetching, refetch: refetchLeads } = useAirtableLeadsForTable({ autoRefresh: true });
  
  // Fetch Airtable buyers with auto-refresh enabled
  const { buyers: airtableBuyers, isLoading: buyersLoading, isFetching: buyersFetching, refetch: refetchBuyers } = useAirtableBuyersForTable({ autoRefresh: true });

  const handleRefresh = () => {
    if (activeTab === "buyers") {
      refetchBuyers();
    } else {
      refetchLeads();
    }
  };

  const isRefreshing = activeTab === "buyers" ? (buyersLoading || buyersFetching) : (leadsLoading || leadsFetching);
  const currentCount = activeTab === "buyers" ? airtableBuyers.length : airtableLeads.length;

  return (
    <section aria-label="Admin leads" className="h-full flex flex-col min-h-0">
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-shrink-0">
        <div className="min-w-0 flex flex-wrap items-center gap-2 sm:gap-3">
          <h1 className="sr-only">Admin leads</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="gap-1.5 sm:gap-2 text-xs sm:text-sm h-8 sm:h-9"
          >
            <RefreshCw className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden xs:inline">{isRefreshing ? 'Syncing...' : 'Sync Airtable'}</span>
            <span className="xs:hidden">{isRefreshing ? '...' : 'Sync'}</span>
          </Button>
          {currentCount > 0 && (
            <span className="text-xs sm:text-sm text-muted-foreground">
              <span className="font-medium">{currentCount}</span> {activeTab}
              <span className="hidden sm:inline"> from Airtable</span>
              <span className="text-[10px] sm:text-xs ml-1 sm:ml-2 text-primary hidden md:inline">(auto-refresh)</span>
            </span>
          )}
        </div>
        <div className="w-full sm:w-auto sm:max-w-sm">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${activeTab}…`}
            aria-label={`Search ${activeTab}`}
            className="h-8 sm:h-9 text-sm"
          />
        </div>
      </div>

      {/* Tabs for switching between Buyers and Leads */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
        <TabsList className="w-fit mb-4">
          <TabsTrigger value="buyers" className="gap-2">
            <Users className="h-4 w-4" />
            Buyers
            {airtableBuyers.length > 0 && (
              <span className="bg-primary/10 text-primary text-xs px-1.5 py-0.5 rounded-full">
                {airtableBuyers.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="leads" className="gap-2">
            <UserCheck className="h-4 w-4" />
            Leads Data
            {airtableLeads.length > 0 && (
              <span className="bg-primary/10 text-primary text-xs px-1.5 py-0.5 rounded-full">
                {airtableLeads.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="buyers" className="flex-1 min-h-0 mt-0">
          <AdminBuyersTable 
            searchQuery={searchQuery} 
            buyers={airtableBuyers}
            isLoading={buyersLoading || buyersFetching}
          />
        </TabsContent>

        <TabsContent value="leads" className="flex-1 min-h-0 mt-0">
          {/* AI Insights Panel */}
          <AIInsightsPanel 
            context="leads" 
            data={{ leads: leadData, campaigns: campaignData }}
            className="flex-shrink-0 -mx-4 sm:-mx-6 mb-4"
          />

          <AdminLeadsTable 
            searchQuery={searchQuery} 
            airtableLeads={airtableLeads}
            airtableLoading={leadsLoading || leadsFetching}
          />
        </TabsContent>
      </Tabs>
    </section>
  );
};

export default AdminLeadsPage;