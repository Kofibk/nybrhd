import { useState } from "react";
import AdminBuyersTable from "@/components/admin/AdminBuyersTable";
import { CallerPerformanceWidget } from "@/components/admin/CallerPerformanceWidget";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AIInsightsPanel } from "@/components/AIInsightsPanel";
import { useUploadedData } from "@/contexts/DataContext";
import { Users, BarChart3, Database } from "lucide-react";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { demoBuyers } from "@/lib/demoBuyersData";

const AdminLeadsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showPerformance, setShowPerformance] = useState(false);
  const { leadData, campaignData } = useUploadedData('admin');
  
  // Use demo data directly for demo purposes
  const displayBuyers = demoBuyers;
  const isUsingDemoData = true;

  return (
    <section aria-label="Buyers" className="h-full flex flex-col min-h-0">
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-shrink-0">
        <div className="min-w-0 flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-semibold">Buyers</h1>
          </div>
          <Badge variant="secondary" className="gap-1.5 text-xs">
            <Database className="h-3 w-3" />
            Demo Data
          </Badge>
          <span className="text-xs sm:text-sm text-muted-foreground">
            <span className="font-medium">{displayBuyers.length}</span> buyers
          </span>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant={showPerformance ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setShowPerformance(!showPerformance)}
            className="gap-1.5 text-xs sm:text-sm h-8 sm:h-9"
          >
            <BarChart3 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Performance</span>
          </Button>
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search buyers…"
            aria-label="Search buyers"
            className="h-8 sm:h-9 text-sm flex-1 sm:w-64"
          />
        </div>
      </div>

      {/* AI Insights Panel */}
      <AIInsightsPanel 
        context="leads" 
        data={{ leads: leadData, campaigns: campaignData }}
        className="flex-shrink-0 -mx-4 sm:-mx-6 mb-4"
      />

      {/* Collapsible Performance Widget */}
      <Collapsible open={showPerformance} onOpenChange={setShowPerformance}>
        <CollapsibleContent className="mb-4">
          <div className="grid gap-6 lg:grid-cols-2">
            <CallerPerformanceWidget 
              buyers={displayBuyers}
              isLoading={false}
            />
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Buyers Table */}
      <div className="flex-1 min-h-0">
        <AdminBuyersTable 
          searchQuery={searchQuery} 
          buyers={displayBuyers}
          isLoading={false}
        />
      </div>
    </section>
  );
};

export default AdminLeadsPage;