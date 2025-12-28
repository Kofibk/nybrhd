import { useState } from "react";
import DeveloperLeadsTable from "@/components/developer/DeveloperLeadsTable";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AIInsightsPanel } from "@/components/AIInsightsPanel";
import { useUploadedData } from "@/contexts/DataContext";
import { useAirtableBuyersForTable } from "@/hooks/useAirtableBuyers";
import { RefreshCw } from "lucide-react";

const DeveloperLeadsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { leadData, campaignData } = useUploadedData('developer');
  const { buyers, isLoading, refetch } = useAirtableBuyersForTable({ enabled: true });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  return (
    <section aria-label="Developer leads" className="h-full flex flex-col min-h-0">
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-shrink-0">
        <div className="min-w-0 flex flex-wrap items-center gap-2 sm:gap-3">
          <h1 className="sr-only">Developer leads</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
            className="gap-1.5 sm:gap-2 text-xs sm:text-sm h-8 sm:h-9"
          >
            <RefreshCw className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden xs:inline">{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
            <span className="xs:hidden">{isRefreshing ? '...' : 'Refresh'}</span>
          </Button>
          <span className="text-xs sm:text-sm text-muted-foreground">
            <span className="font-medium">{buyers.length}</span> leads
          </span>
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
        <DeveloperLeadsTable searchQuery={searchQuery} />
      </div>
    </section>
  );
};

export default DeveloperLeadsPage;
