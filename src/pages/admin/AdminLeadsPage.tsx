import { useState } from "react";
import AdminLeadsTable from "@/components/admin/AdminLeadsTable";
import { Input } from "@/components/ui/input";
import { AIInsightsPanel } from "@/components/AIInsightsPanel";
import { useUploadedData } from "@/contexts/DataContext";

const AdminLeadsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { leadData, campaignData } = useUploadedData('admin');

  return (
    <section aria-label="Admin leads" className="h-full flex flex-col min-h-0">
      <div className="mb-4 flex items-center justify-between gap-3 flex-shrink-0">
        <div className="min-w-0">
          <h1 className="sr-only">Admin leads</h1>
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
        className="mb-4 flex-shrink-0"
      />

      <div className="flex-1 min-h-0">
        <AdminLeadsTable searchQuery={searchQuery} />
      </div>
    </section>
  );
};

export default AdminLeadsPage;
