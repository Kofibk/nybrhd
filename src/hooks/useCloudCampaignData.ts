import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CloudCampaignSummary {
  totalRecords: number;
  uniqueCampaigns: number;
  totalImpressions: number;
  totalClicks: number;
  totalSpent: number;
  totalLinkClicks: number;
  totalLpv: number;
  avgCpc: number;
  avgCtr: number;
  avgCpm: number;
}

export interface CloudCampaignRecord {
  id: string;
  airtable_record_id: string | null;
  campaign_id: string | null;
  campaign_name: string | null;
  ad_set_id: string | null;
  ad_set_name: string | null;
  ad_id: string | null;
  ad_name: string | null;
  impressions: number;
  reach: number;
  clicks: number;
  link_clicks: number;
  lpv: number;
  video_plays: number;
  page_likes: number;
  post_engagement: number;
  total_spent: number;
  cpc: number | null;
  cpm: number | null;
  ctr: number | null;
  cost_per_lpv: number | null;
  frequency: number | null;
  platform: string | null;
  format: string | null;
  delivery_status: string | null;
  headline: string | null;
  primary_text: string | null;
  destination_url: string | null;
  thumbnail_url: string | null;
  date: string | null;
  created_at: string;
  updated_at: string;
}

export interface CampaignGrouped {
  campaign_name: string;
  total_spent: number;
  total_impressions: number;
  total_clicks: number;
  total_link_clicks: number;
  total_lpv: number;
  total_reach: number;
  record_count: number;
  avg_cpc: number;
  avg_ctr: number;
  avg_cpm: number;
  platforms: string[];
  statuses: string[];
  date_range: { min: string | null; max: string | null };
}

// Fetch summary statistics
export function useCloudCampaignSummary() {
  return useQuery({
    queryKey: ["cloud-campaign-summary"],
    queryFn: async (): Promise<CloudCampaignSummary> => {
      const { data, error } = await supabase
        .from("campaign_data")
        .select("impressions, clicks, total_spent, link_clicks, lpv, cpc, ctr, cpm, campaign_name");

      if (error) throw error;

      const records = data || [];
      const uniqueCampaigns = new Set(records.map(r => r.campaign_name)).size;
      const totalImpressions = records.reduce((sum, r) => sum + (r.impressions || 0), 0);
      const totalClicks = records.reduce((sum, r) => sum + (r.clicks || 0), 0);
      const totalSpent = records.reduce((sum, r) => sum + (r.total_spent || 0), 0);
      const totalLinkClicks = records.reduce((sum, r) => sum + (r.link_clicks || 0), 0);
      const totalLpv = records.reduce((sum, r) => sum + (r.lpv || 0), 0);

      // Calculate averages
      const validCpc = records.filter(r => r.cpc != null);
      const validCtr = records.filter(r => r.ctr != null);
      const validCpm = records.filter(r => r.cpm != null);

      return {
        totalRecords: records.length,
        uniqueCampaigns,
        totalImpressions,
        totalClicks,
        totalSpent,
        totalLinkClicks,
        totalLpv,
        avgCpc: validCpc.length > 0 
          ? validCpc.reduce((sum, r) => sum + (r.cpc || 0), 0) / validCpc.length 
          : 0,
        avgCtr: validCtr.length > 0 
          ? validCtr.reduce((sum, r) => sum + (r.ctr || 0), 0) / validCtr.length 
          : 0,
        avgCpm: validCpm.length > 0 
          ? validCpm.reduce((sum, r) => sum + (r.cpm || 0), 0) / validCpm.length 
          : 0,
      };
    },
    staleTime: 60000, // 1 minute
    refetchInterval: 60000, // Refetch every minute to match sync
  });
}

// Fetch campaigns grouped by campaign_name
export function useCloudCampaignsGrouped() {
  return useQuery({
    queryKey: ["cloud-campaigns-grouped"],
    queryFn: async (): Promise<CampaignGrouped[]> => {
      const { data, error } = await supabase
        .from("campaign_data")
        .select("*")
        .order("date", { ascending: false });

      if (error) throw error;

      // Group by campaign_name
      const grouped = new Map<string, CloudCampaignRecord[]>();
      (data || []).forEach(record => {
        const name = record.campaign_name || "Unknown";
        if (!grouped.has(name)) {
          grouped.set(name, []);
        }
        grouped.get(name)!.push(record);
      });

      // Aggregate each group
      const result: CampaignGrouped[] = [];
      grouped.forEach((records, campaign_name) => {
        const total_spent = records.reduce((sum, r) => sum + (r.total_spent || 0), 0);
        const total_impressions = records.reduce((sum, r) => sum + (r.impressions || 0), 0);
        const total_clicks = records.reduce((sum, r) => sum + (r.clicks || 0), 0);
        const total_link_clicks = records.reduce((sum, r) => sum + (r.link_clicks || 0), 0);
        const total_lpv = records.reduce((sum, r) => sum + (r.lpv || 0), 0);
        const total_reach = records.reduce((sum, r) => sum + (r.reach || 0), 0);

        const platforms = [...new Set(records.map(r => r.platform).filter(Boolean))] as string[];
        const statuses = [...new Set(records.map(r => r.delivery_status).filter(Boolean))] as string[];
        
        const dates = records.map(r => r.date).filter(Boolean).sort();

        result.push({
          campaign_name,
          total_spent,
          total_impressions,
          total_clicks,
          total_link_clicks,
          total_lpv,
          total_reach,
          record_count: records.length,
          avg_cpc: total_clicks > 0 ? total_spent / total_clicks : 0,
          avg_ctr: total_impressions > 0 ? (total_clicks / total_impressions) * 100 : 0,
          avg_cpm: total_impressions > 0 ? (total_spent / total_impressions) * 1000 : 0,
          platforms,
          statuses,
          date_range: {
            min: dates[0] || null,
            max: dates[dates.length - 1] || null,
          },
        });
      });

      // Sort by total spent descending
      return result.sort((a, b) => b.total_spent - a.total_spent);
    },
    staleTime: 60000,
    refetchInterval: 60000,
  });
}

// Fetch raw campaign records with pagination
export function useCloudCampaignRecords(limit = 100, offset = 0) {
  return useQuery({
    queryKey: ["cloud-campaign-records", limit, offset],
    queryFn: async () => {
      const { data, error, count } = await supabase
        .from("campaign_data")
        .select("*", { count: "exact" })
        .order("date", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return {
        records: data as CloudCampaignRecord[],
        total: count || 0,
      };
    },
    staleTime: 60000,
  });
}
