import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserRole, Campaign } from "@/lib/types";
import { useUploadedData } from "@/contexts/DataContext";
import { Plus, Eye, Upload } from "lucide-react";

interface CampaignsListProps {
  userType: UserRole;
}

const CampaignsList = ({ userType }: CampaignsListProps) => {
  const navigate = useNavigate();
  const { campaignData } = useUploadedData();

  // Convert uploaded campaign data - handle ANY column format dynamically
  const allCampaigns = useMemo(() => {
    if (campaignData.length === 0) return [];
    
    return campaignData.map((row, index) => {
      // Find campaign name from various possible columns
      const name = row.name || row.campaign_name || row.Name || row['Campaign Name'] || 
        row.campaign || row.Campaign || `Campaign ${index + 1}`;
      
      // Find development/property info
      const developmentName = row.development || row.Development || row.development_name || 
        row['Development Name'] || row.property || row.Property || '';
      
      // Parse status
      const rawStatus = (row.status || row.Status || 'live').toString().toLowerCase();
      let status: Campaign['status'] = 'live';
      if (rawStatus.includes('draft')) status = 'draft';
      else if (rawStatus.includes('pause')) status = 'paused';
      else if (rawStatus.includes('complete') || rawStatus.includes('ended')) status = 'completed';
      
      // Parse budget - handle various formats
      const budgetRaw = row.budget || row.Budget || row.spend || row.Spend || row['Total Budget'] || '0';
      const budget = parseFloat(String(budgetRaw).replace(/[£$,]/g, '')) || 0;
      
      // Find dates
      const startDate = row.start_date || row.startDate || row['Start Date'] || 
        row.date || row.Date || new Date().toISOString();
      const endDate = row.end_date || row.endDate || row['End Date'] || '';
      
      // Parse leads count
      const leads = parseInt(row.leads || row.Leads || row['Lead Count'] || row.conversions || '0') || 0;
      
      // Parse CPL
      const cplRaw = row.CPL || row.cpl || row['Cost Per Lead'] || '';
      const cpl = cplRaw ? `£${parseFloat(String(cplRaw).replace(/[£$,]/g, '')).toFixed(2)}` : '-';

      return {
        id: row.id || row.campaign_id || row['Campaign ID'] || `campaign_${index}`,
        name,
        developmentId: row.development_id || '',
        developmentName,
        objective: (row.objective || row.Objective || 'leads').toLowerCase() as 'leads' | 'awareness',
        status,
        budget,
        dailyCap: row.daily_cap || row.dailyCap || undefined,
        startDate,
        endDate,
        isOngoing: !endDate,
        roleType: userType,
        channel: 'meta' as const,
        createdAt: row.created_at || row.createdAt || startDate,
        targetCountries: [],
        targetCities: [],
        // Extra fields for display
        _leads: leads,
        _cpl: cpl,
      };
    });
  }, [campaignData, userType]);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "live": return "default";
      case "draft": return "secondary";
      case "paused": return "outline";
      case "completed": return "secondary";
      default: return "default";
    }
  };

  return (
    <DashboardLayout title="Campaigns" userType={userType}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 md:mb-4">
        <div>
          <h2 className="text-base md:text-lg font-semibold">All Campaigns</h2>
          <p className="text-xs text-muted-foreground">
            {allCampaigns.length > 0 
              ? `${allCampaigns.length} campaigns loaded from your data`
              : 'Upload campaign data from the dashboard to view campaigns'}
          </p>
        </div>
        <Button onClick={() => navigate(`/${userType}/campaigns/new`)} size="sm" className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-1.5" />
          New Campaign
        </Button>
      </div>

      {allCampaigns.length > 0 ? (
        <Card className="shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[550px]">
              <thead className="bg-muted/50">
                <tr className="text-left text-xs text-muted-foreground">
                  <th className="px-2.5 md:px-3 py-2 font-medium">Name</th>
                  <th className="px-2.5 md:px-3 py-2 font-medium hidden sm:table-cell">Development</th>
                  <th className="px-2.5 md:px-3 py-2 font-medium">Status</th>
                  <th className="px-2.5 md:px-3 py-2 font-medium">Leads</th>
                  <th className="px-2.5 md:px-3 py-2 font-medium hidden sm:table-cell">CPL</th>
                  <th className="px-2.5 md:px-3 py-2 font-medium hidden md:table-cell">Budget</th>
                  <th className="px-2.5 md:px-3 py-2 font-medium w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {allCampaigns.map((campaign: any) => (
                  <tr
                    key={campaign.id}
                    className="hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => navigate(`/${userType}/campaigns/${campaign.id}`)}
                  >
                    <td className="px-2.5 md:px-3 py-2">
                      <div className="font-medium text-foreground text-xs md:text-sm">{campaign.name}</div>
                      <div className="text-[10px] text-muted-foreground capitalize">{campaign.objective}</div>
                    </td>
                    <td className="px-2.5 md:px-3 py-2 text-muted-foreground text-xs md:text-sm hidden sm:table-cell truncate max-w-[120px]">
                      {campaign.developmentName || '-'}
                    </td>
                    <td className="px-2.5 md:px-3 py-2">
                      <Badge variant={getStatusVariant(campaign.status)} className="capitalize text-[10px]">
                        {campaign.status}
                      </Badge>
                    </td>
                    <td className="px-2.5 md:px-3 py-2 text-muted-foreground text-xs md:text-sm">
                      {campaign._leads || '-'}
                    </td>
                    <td className="px-2.5 md:px-3 py-2 text-muted-foreground text-xs md:text-sm hidden sm:table-cell">
                      {campaign._cpl}
                    </td>
                    <td className="px-2.5 md:px-3 py-2 text-muted-foreground text-xs md:text-sm hidden md:table-cell">
                      {campaign.budget > 0 ? `£${campaign.budget.toLocaleString()}` : '-'}
                    </td>
                    <td className="px-2.5 md:px-3 py-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card className="p-8 md:p-12 text-center">
          <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Campaign Data</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Upload your campaign data CSV from the main dashboard to view and analyse your campaigns here.
          </p>
          <Button onClick={() => navigate(`/${userType}`)}>
            Go to Dashboard
          </Button>
        </Card>
      )}
    </DashboardLayout>
  );
};

export default CampaignsList;
