import { useState } from "react";
import AdminLeadsTable from "@/components/admin/AdminLeadsTable";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AIInsightsPanel } from "@/components/AIInsightsPanel";
import { useUploadedData } from "@/contexts/DataContext";
import { useAirtableLeadsForTable } from "@/hooks/useAirtableLeads";
import { RefreshCw } from "lucide-react";

const AdminLeadsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { leadData, campaignData } = useUploadedData('admin');
  
  // Fetch Airtable leads with auto-refresh enabled
  const { leads: airtableLeads, isLoading: airtableLoading, isFetching, refetch: refetchAirtable } = useAirtableLeadsForTable({ autoRefresh: true });

  return (
    <section aria-label="Admin leads" className="h-full flex flex-col min-h-0">
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-shrink-0">
        <div className="min-w-0 flex flex-wrap items-center gap-2 sm:gap-3">
          <h1 className="sr-only">Admin leads</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchAirtable()}
            disabled={airtableLoading || isFetching}
            className="gap-1.5 sm:gap-2 text-xs sm:text-sm h-8 sm:h-9"
          >
            <RefreshCw className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${(airtableLoading || isFetching) ? 'animate-spin' : ''}`} />
            <span className="hidden xs:inline">{isFetching ? 'Syncing...' : 'Sync Airtable'}</span>
            <span className="xs:hidden">{isFetching ? '...' : 'Sync'}</span>
          </Button>
          {airtableLeads.length > 0 && (
            <span className="text-xs sm:text-sm text-muted-foreground">
              <span className="font-medium">{airtableLeads.length}</span> leads
              <span className="hidden sm:inline"> from Airtable</span>
              <span className="text-[10px] sm:text-xs ml-1 sm:ml-2 text-primary hidden md:inline">(auto-refresh)</span>
            </span>
          )}
        </div>
        <div className="w-full sm:w-auto sm:max-w-sm">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search leads…"
            aria-label="Search leads"
            className="h-8 sm:h-9 text-sm"
          />
        </div>
      </div>

      {/* AI Insights Panel */}
      <AIInsightsPanel 
        context="leads" 
        data={{ leads: leadData, campaigns: campaignData }}
        className="flex-shrink-0 -mx-4 sm:-mx-6"
      />

      <div className="flex-1 min-h-0">
        <AdminLeadsTable 
          searchQuery={searchQuery} 
          airtableLeads={airtableLeads}
          airtableLoading={airtableLoading || isFetching}
        />
      </div>
    </section>
  );
};

export default AdminLeadsPage;
