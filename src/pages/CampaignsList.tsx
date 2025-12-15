import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getCampaigns, saveCampaigns } from "@/lib/api";
import { UserRole, Campaign } from "@/lib/types";
import { toast } from "sonner";
import { useUploadedData } from "@/contexts/DataContext";
import {
  Plus,
  MoreHorizontal,
  Pause,
  Play,
  Copy,
  Eye,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CampaignsListProps {
  userType: UserRole;
}

const CampaignsList = ({ userType }: CampaignsListProps) => {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<Campaign[]>(getCampaigns());
  const { campaignData } = useUploadedData();

  // Merge uploaded campaign data with existing campaigns
  const allCampaigns = useMemo(() => {
    if (campaignData.length === 0) return campaigns;
    
    // Convert uploaded CSV data to Campaign format
    const uploadedCampaigns: Campaign[] = campaignData.map((row, index) => ({
      id: `uploaded_${index}`,
      name: row.name || row.campaign_name || row.Name || row['Campaign Name'] || `Campaign ${index + 1}`,
      developmentId: row.development_id || '',
      developmentName: row.development || row.Development || row.development_name || '',
      objective: (row.objective || row.Objective || 'leads') as 'leads' | 'awareness',
      status: (row.status || row.Status || 'live').toLowerCase() as Campaign['status'],
      budget: Number(row.budget || row.Budget || 0),
      startDate: row.start_date || row.startDate || row['Start Date'] || new Date().toISOString(),
      endDate: row.end_date || row.endDate || row['End Date'] || '',
      createdAt: row.created_at || row.createdAt || new Date().toISOString(),
      isOngoing: true,
      roleType: userType,
      channel: 'meta' as const,
      targetCountries: [],
      targetCities: [],
    }));

    return [...campaigns, ...uploadedCampaigns];
  }, [campaigns, campaignData, userType]);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "live": return "default";
      case "draft": return "secondary";
      case "paused": return "outline";
      case "completed": return "secondary";
      default: return "default";
    }
  };

  const handlePauseResume = (campaign: Campaign) => {
    const updated = campaigns.map((c) => {
      if (c.id === campaign.id) {
        const newStatus = c.status === "live" ? "paused" : "live";
        return { ...c, status: newStatus as Campaign["status"] };
      }
      return c;
    });
    setCampaigns(updated);
    saveCampaigns(updated);
    toast.success(campaign.status === "live" ? "Campaign paused" : "Campaign resumed");
  };

  const handleDuplicate = (campaign: Campaign) => {
    const newCampaign: Campaign = {
      ...campaign,
      id: `camp_${Date.now()}`,
      name: `${campaign.name} (Copy)`,
      status: "draft",
      createdAt: new Date().toISOString(),
      metaCampaignId: undefined,
      metaAdsetId: undefined,
      metaFormId: undefined,
      metaAdIds: undefined,
    };
    const updated = [...campaigns, newCampaign];
    setCampaigns(updated);
    saveCampaigns(updated);
    toast.success("Campaign duplicated as draft");
  };

  // Calculate leads per campaign (mock)
  const getLeadsCount = (campaignId: string) => {
    const leadsPerCampaign: Record<string, number> = {
      camp_1: 124,
      camp_2: 0,
      camp_3: 0,
    };
    return leadsPerCampaign[campaignId] || Math.floor(Math.random() * 50);
  };

  const getCPL = (campaignId: string) => {
    const cplPerCampaign: Record<string, string> = {
      camp_1: "£20.16",
      camp_2: "-",
      camp_3: "-",
    };
    return cplPerCampaign[campaignId] || "£0.00";
  };

  return (
    <DashboardLayout title="Campaigns" userType={userType}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 md:mb-4">
        <div>
          <h2 className="text-base md:text-lg font-semibold">All Campaigns</h2>
          <p className="text-xs text-muted-foreground">Manage your Meta advertising campaigns</p>
        </div>
        <Button onClick={() => navigate(`/${userType}/campaigns/new`)} size="sm" className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-1.5" />
          New Campaign
        </Button>
      </div>

      {/* Campaigns Table */}
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
                <th className="px-2.5 md:px-3 py-2 font-medium hidden md:table-cell">Created</th>
                <th className="px-2.5 md:px-3 py-2 font-medium w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {allCampaigns.map((campaign) => (
                <tr
                  key={campaign.id}
                  className="hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => navigate(`/${userType}/campaigns/${campaign.id}`)}
                >
                  <td className="px-2.5 md:px-3 py-2">
                    <div className="font-medium text-foreground text-xs md:text-sm">{campaign.name}</div>
                    <div className="text-[10px] text-muted-foreground capitalize">{campaign.objective}</div>
                  </td>
                  <td className="px-2.5 md:px-3 py-2 text-muted-foreground text-xs md:text-sm hidden sm:table-cell truncate max-w-[120px]">{campaign.developmentName}</td>
                  <td className="px-2.5 md:px-3 py-2">
                    <Badge variant={getStatusVariant(campaign.status)} className="capitalize text-[10px]">
                      {campaign.status}
                    </Badge>
                  </td>
                  <td className="px-2.5 md:px-3 py-2 text-muted-foreground text-xs md:text-sm">{getLeadsCount(campaign.id)}</td>
                  <td className="px-2.5 md:px-3 py-2 text-muted-foreground text-xs md:text-sm hidden sm:table-cell">{getCPL(campaign.id)}</td>
                  <td className="px-2.5 md:px-3 py-2 text-muted-foreground text-xs md:text-sm hidden md:table-cell">
                    {new Date(campaign.createdAt).toLocaleDateString("en-GB")}
                  </td>
                  <td className="px-2.5 md:px-3 py-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/${userType}/campaigns/${campaign.id}`);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </DropdownMenuItem>
                        {(campaign.status === "live" || campaign.status === "paused") && (
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePauseResume(campaign);
                            }}
                          >
                            {campaign.status === "live" ? (
                              <>
                                <Pause className="h-4 w-4 mr-2" />
                                Pause
                              </>
                            ) : (
                              <>
                                <Play className="h-4 w-4 mr-2" />
                                Resume
                              </>
                            )}
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDuplicate(campaign);
                          }}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {allCampaigns.length === 0 && (
        <div className="text-center py-8 md:py-12">
          <p className="text-muted-foreground mb-4 text-sm">No campaigns yet</p>
          <Button onClick={() => navigate(`/${userType}/campaigns/new`)}>
            <Plus className="h-4 w-4 mr-2" />
            Create your first campaign
          </Button>
        </div>
      )}
    </DashboardLayout>
  );
};

export default CampaignsList;
