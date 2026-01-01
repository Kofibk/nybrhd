import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Positive statuses that indicate "hot" leads
const POSITIVE_STATUSES = [
  'Interested',
  'Viewing Booked',
  'Offer Made',
  'Follow Up',
  'Completed',
  'Contacted - In Progress'
];

export interface DashboardMetrics {
  totalLeads: number;
  hotLeads: number;
  totalSpend: number;
  avgCPL: number;
  qualifiedRate: number;
  statusBreakdown: Record<string, number>;
}

export function useDashboardMetrics() {
  return useQuery({
    queryKey: ["dashboard-metrics"],
    queryFn: async (): Promise<DashboardMetrics> => {
      // Fetch buyers count and status breakdown
      const { data: buyers, error: buyersError } = await supabase
        .from("buyers")
        .select("status");

      if (buyersError) {
        console.error("Error fetching buyers:", buyersError);
        throw buyersError;
      }

      // Fetch campaign spend totals
      const { data: campaigns, error: campaignsError } = await supabase
        .from("campaign_data")
        .select("total_spent");

      if (campaignsError) {
        console.error("Error fetching campaigns:", campaignsError);
        throw campaignsError;
      }

      const totalLeads = buyers?.length || 0;
      
      // Count hot leads (positive statuses)
      const hotLeads = buyers?.filter(b => 
        POSITIVE_STATUSES.some(status => 
          b.status?.toLowerCase().includes(status.toLowerCase())
        )
      ).length || 0;

      // Calculate total spend from campaign_data
      const totalSpend = campaigns?.reduce((sum, c) => sum + (c.total_spent || 0), 0) || 0;

      // Calculate average CPL
      const avgCPL = totalLeads > 0 ? totalSpend / totalLeads : 0;

      // Calculate qualified rate (hot leads / total leads)
      const qualifiedRate = totalLeads > 0 ? Math.round((hotLeads / totalLeads) * 100) : 0;

      // Status breakdown
      const statusBreakdown: Record<string, number> = {};
      buyers?.forEach(b => {
        const status = b.status || 'Unknown';
        statusBreakdown[status] = (statusBreakdown[status] || 0) + 1;
      });

      return {
        totalLeads,
        hotLeads,
        totalSpend,
        avgCPL,
        qualifiedRate,
        statusBreakdown
      };
    },
    staleTime: 60000, // 1 minute
    refetchInterval: 60000,
  });
}

export function useCampaignTotals() {
  return useQuery({
    queryKey: ["campaign-totals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("campaign_data")
        .select("campaign_name, total_spent, impressions, clicks, link_clicks, lpv");

      if (error) throw error;

      // Group by campaign name
      const grouped = new Map<string, {
        total_spent: number;
        impressions: number;
        clicks: number;
        link_clicks: number;
        lpv: number;
        record_count: number;
      }>();

      (data || []).forEach(record => {
        const name = record.campaign_name || "Unknown";
        if (!grouped.has(name)) {
          grouped.set(name, {
            total_spent: 0,
            impressions: 0,
            clicks: 0,
            link_clicks: 0,
            lpv: 0,
            record_count: 0
          });
        }
        const g = grouped.get(name)!;
        g.total_spent += record.total_spent || 0;
        g.impressions += record.impressions || 0;
        g.clicks += record.clicks || 0;
        g.link_clicks += record.link_clicks || 0;
        g.lpv += record.lpv || 0;
        g.record_count += 1;
      });

      const campaigns = Array.from(grouped.entries()).map(([name, stats]) => ({
        name,
        ...stats,
        cpl: stats.lpv > 0 ? stats.total_spent / stats.lpv : 0
      }));

      const totalSpent = campaigns.reduce((sum, c) => sum + c.total_spent, 0);
      const totalLeads = campaigns.reduce((sum, c) => sum + c.lpv, 0);
      const avgCPL = totalLeads > 0 ? totalSpent / totalLeads : 0;

      return {
        campaigns: campaigns.sort((a, b) => b.total_spent - a.total_spent),
        totalSpent,
        totalLeads,
        avgCPL,
        totalCampaigns: campaigns.length
      };
    },
    staleTime: 60000,
    refetchInterval: 60000,
  });
}
