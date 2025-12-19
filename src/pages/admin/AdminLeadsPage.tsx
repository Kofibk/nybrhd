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
      <div className="mb-4 flex items-center justify-between gap-3 flex-shrink-0">
        <div className="min-w-0 flex items-center gap-3">
          <h1 className="sr-only">Admin leads</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchAirtable()}
            disabled={airtableLoading || isFetching}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${(airtableLoading || isFetching) ? 'animate-spin' : ''}`} />
            {isFetching ? 'Syncing...' : 'Sync Airtable'}
          </Button>
          {airtableLeads.length > 0 && (
            <span className="text-sm text-muted-foreground">
              {airtableLeads.length} leads from Airtable
              <span className="text-xs ml-2 text-primary">(auto-refresh enabled)</span>
            </span>
          )}
        </div>
        <div className="w-full max-w-sm">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search leads…"
            aria-label="Search leads"
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
