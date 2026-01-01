-- Fix: create server-side aggregates without relying on client-side row limits

CREATE OR REPLACE FUNCTION public.get_dashboard_metrics()
RETURNS TABLE (
  total_leads bigint,
  hot_leads bigint,
  total_spend numeric,
  qualified_rate integer,
  status_breakdown jsonb
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO public
AS $$
  WITH buyers_base AS (
    SELECT coalesce(nullif(status, ''), 'Unknown') AS status_key
    FROM public.buyers
  ),
  buyers_counts AS (
    SELECT
      COUNT(*)::bigint AS total_leads,
      COUNT(*) FILTER (
        WHERE lower(status_key) LIKE ANY (ARRAY[
          '%interested%',
          '%viewing booked%',
          '%offer made%',
          '%follow up%',
          '%completed%',
          '%contacted - in progress%'
        ])
      )::bigint AS hot_leads
    FROM buyers_base
  ),
  status_breakdown AS (
    SELECT COALESCE(jsonb_object_agg(status_key, status_count), '{}'::jsonb) AS status_breakdown
    FROM (
      SELECT status_key, COUNT(*)::bigint AS status_count
      FROM buyers_base
      GROUP BY 1
    ) s
  ),
  spend_agg AS (
    SELECT COALESCE(SUM(total_spent), 0)::numeric AS total_spend
    FROM public.campaign_data
  )
  SELECT
    b.total_leads,
    b.hot_leads,
    s.total_spend,
    CASE WHEN b.total_leads > 0 THEN round((b.hot_leads::numeric / b.total_leads::numeric) * 100)::int ELSE 0 END AS qualified_rate,
    sb.status_breakdown
  FROM buyers_counts b
  CROSS JOIN spend_agg s
  CROSS JOIN status_breakdown sb;
$$;

CREATE OR REPLACE FUNCTION public.get_campaign_totals()
RETURNS TABLE (
  campaign_name text,
  total_spent numeric,
  impressions bigint,
  clicks bigint,
  link_clicks bigint,
  lpv bigint,
  reach bigint,
  record_count bigint,
  date_min date,
  date_max date,
  platforms text[],
  statuses text[]
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO public
AS $$
  SELECT
    COALESCE(campaign_name, 'Unknown') AS campaign_name,
    COALESCE(SUM(total_spent), 0)::numeric AS total_spent,
    COALESCE(SUM(impressions), 0)::bigint AS impressions,
    COALESCE(SUM(clicks), 0)::bigint AS clicks,
    COALESCE(SUM(link_clicks), 0)::bigint AS link_clicks,
    COALESCE(SUM(lpv), 0)::bigint AS lpv,
    COALESCE(SUM(reach), 0)::bigint AS reach,
    COUNT(*)::bigint AS record_count,
    MIN(date) AS date_min,
    MAX(date) AS date_max,
    ARRAY_REMOVE(ARRAY_AGG(DISTINCT platform), NULL) AS platforms,
    ARRAY_REMOVE(ARRAY_AGG(DISTINCT delivery_status), NULL) AS statuses
  FROM public.campaign_data
  GROUP BY 1
  ORDER BY total_spent DESC;
$$;