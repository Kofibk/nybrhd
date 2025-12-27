import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Brain, 
  Send, 
  Loader2, 
  AlertCircle, 
  Flame,
  PoundSterling,
  CheckCircle,
  Upload,
  TrendingUp,
  TrendingDown,
  Users,
  MessageSquare,
  Phone,
  Calendar,
  MessageCircle,
  Eye,
  ArrowUp,
  ArrowDown,
  Target,
  Database,
  Lightbulb,
  Bot,
  Zap,
  Star,
  ThermometerSun,
  Snowflake,
  X,
  Minimize2,
  Maximize2,
  RefreshCw
} from 'lucide-react';
import { useMasterAgent, MasterAgentContext } from '@/hooks/useMasterAgent';
import { useUploadedData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { UploadZone } from '@/components/UploadZone';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { classifyLead } from '@/lib/leadClassification';
import Papa from 'papaparse';
import { AnimatedNumber } from '@/hooks/useAnimatedCounter';
import { useAirtableCampaignsForDashboard } from '@/hooks/useAirtableCampaigns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  Legend
} from 'recharts';

interface Message {
  role: 'user' | 'agent';
  content: string;
  timestamp: Date;
}

interface ActionLead {
  id: string;
  name: string;
  development: string;
  budget: string;
  qualityScore: number;
  intentScore: number;
  timeline: string;
  email?: string;
  phone?: string;
  reason: string;
  classification: string;
}

interface CampaignAlert {
  id: string;
  name: string;
  issue: string;
  currentValue: string;
  targetValue: string;
  recommendation: string;
  savings?: string;
}

interface AIAgentDashboardProps {
  userType?: 'developer' | 'agent' | 'broker' | 'admin';
}

const getRoleConfig = (userType: string) => {
  const configs: Record<string, any> = {
    developer: {
      primaryAction: 'Book Viewing',
      primaryActionIcon: Calendar,
      leadsPath: '/developer/leads',
      campaignsPath: '/developer/campaigns',
      metrics: { col1: 'Buyers', col2: 'Viewings', col3: 'Reservations', col4: 'Pipeline' }
    },
    agent: {
      primaryAction: 'Book Viewing',
      primaryActionIcon: Calendar,
      leadsPath: '/agent/leads',
      campaignsPath: '/agent/campaigns',
      metrics: { col1: 'Leads', col2: 'Viewings', col3: 'Offers', col4: 'Pipeline' }
    },
    broker: {
      primaryAction: 'Book Consultation',
      primaryActionIcon: Calendar,
      leadsPath: '/broker/leads',
      campaignsPath: '/broker/campaigns',
      metrics: { col1: 'Clients', col2: 'Consultations', col3: 'Applications', col4: 'Loan Value' }
    },
    admin: {
      primaryAction: 'Book Viewing',
      primaryActionIcon: Calendar,
      leadsPath: '/admin/leads',
      campaignsPath: '/admin/campaigns',
      metrics: { col1: 'Leads', col2: 'Viewings', col3: 'Offers', col4: 'Pipeline' }
    }
  };
  return configs[userType] || configs.admin;
};

const CHART_COLORS = ['hsl(var(--primary))', 'hsl(142, 76%, 36%)', 'hsl(38, 92%, 50%)', 'hsl(0, 84%, 60%)', 'hsl(262, 83%, 58%)'];
const CLASSIFICATION_COLORS = {
  hot: '#ef4444',
  star: '#eab308',
  lightning: '#3b82f6',
  valid: '#22c55e',
  cold: '#94a3b8',
  warning: '#f97316',
  disqualified: '#6b7280'
};

export function AIAgentDashboard({ userType = 'admin' }: AIAgentDashboardProps) {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadType, setUploadType] = useState<'campaigns' | 'leads'>('campaigns');
  const [aiRecommendations, setAiRecommendations] = useState<string[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMinimized, setChatMinimized] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  const { askAgent, isLoading, error } = useMasterAgent();
  const { user } = useAuth();
  const { 
    campaignData: uploadedCampaignData, 
    campaignFileName,
    setCampaignData, 
    setCampaignFileName,
    leadData, 
    leadFileName,
    setLeadData,
    setLeadFileName 
  } = useUploadedData(userType);
  
  // Fetch campaigns from Airtable Campaign_Date table
  const { campaignData: airtableCampaignData, isLoading: airtableLoading, refetch: refetchAirtable } = useAirtableCampaignsForDashboard();
  
  // Merge Airtable data with uploaded data (Airtable takes priority)
  const campaignData = React.useMemo(() => {
    if (airtableCampaignData && airtableCampaignData.length > 0) {
      // Combine Airtable + uploaded data, removing duplicates
      const combined = [...airtableCampaignData, ...uploadedCampaignData];
      const unique = combined.filter((c, i, arr) => 
        arr.findIndex(x => x['Campaign Name'] === c['Campaign Name']) === i
      );
      return unique;
    }
    return uploadedCampaignData;
  }, [airtableCampaignData, uploadedCampaignData]);

  const roleConfig = getRoleConfig(userType);
  const userName = profile?.full_name?.split(' ')[0] || 'there';
  const currentDate = new Date();
  const greeting = currentDate.getHours() < 12 ? 'Good morning' : currentDate.getHours() < 18 ? 'Good afternoon' : 'Good evening';
  const dateString = currentDate.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' });

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    if (leadData.length > 0 || campaignData.length > 0) fetchRecommendations();
  }, [leadData.length, campaignData.length]);

  const fetchRecommendations = async () => {
    setLoadingRecommendations(true);
    try {
      const response = await askAgent("Give me 3 brief, actionable recommendations. Format as short bullet points.", buildContext());
      if (response?.response) {
        const recs = response.response.split('\n')
          .filter(line => line.trim().match(/^[-•\d.]/))
          .map(line => line.replace(/^[-•\d.]+\s*/, '').trim())
          .filter(line => line.length > 0).slice(0, 3);
        setAiRecommendations(recs.length > 0 ? recs : [response.response.slice(0, 150)]);
      }
    } catch (err) { console.error(err); }
    finally { setLoadingRecommendations(false); }
  };

  const buildContext = (): MasterAgentContext => ({
    ...(leadData?.length > 0 && { leads: leadData }),
    ...(campaignData?.length > 0 && { campaigns: campaignData })
  });

  const hasUploadedData = leadData.length > 0 || campaignData.length > 0 || airtableLoading;

  const toNumber = (value: unknown): number => {
    if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
    if (value === null || value === undefined) return 0;
    const cleaned = String(value).replace(/[^0-9.-]+/g, '');
    const n = parseFloat(cleaned);
    return Number.isFinite(n) ? n : 0;
  };

  // Calculate real metrics from uploaded data
  const calculatedMetrics = React.useMemo(() => {
    const totalLeads = leadData.length;
    let totalSpend = 0;
    let totalResults = 0;
    campaignData.forEach(c => {
      const spend = toNumber(c.Spend ?? c['Amount spent (GBP)'] ?? c.spend);
      const results = toNumber(c.Results ?? c.results);
      totalSpend += spend;
      totalResults += results;
    });
    const avgCPL = totalLeads > 0 ? Math.round(totalSpend / totalLeads) : 0;

    // Use actual Lead Score if available, otherwise classify by status
    let hotLeadsCount = 0;
    let totalScore = 0;
    const classifications = { hot: 0, star: 0, lightning: 0, valid: 0, cold: 0, warning: 0, disqualified: 0 };
    
    leadData.forEach(lead => {
      const leadScore = toNumber(lead['Lead Score'] || lead.leadScore || 0);
      const status = (lead.Status || lead.status || '').toLowerCase();
      const timeline = (lead.Timeline || lead['Timeline to Purchase'] || '').toLowerCase();
      
      // Use actual lead score if available
      if (leadScore > 0) {
        totalScore += leadScore;
        if (leadScore >= 80) {
          classifications.hot++;
          hotLeadsCount++;
        } else if (leadScore >= 70) {
          classifications.star++;
        } else if (leadScore >= 55) {
          classifications.lightning++;
        } else if (leadScore >= 40) {
          classifications.valid++;
        } else {
          classifications.cold++;
        }
      } else {
        // Fallback to status-based classification
        if (status.includes('offer') || (status.includes('viewing') && timeline.includes('28'))) {
          classifications.hot++;
          hotLeadsCount++;
        } else if (status.includes('viewing')) {
          classifications.star++;
        } else if (timeline.includes('28') || timeline.includes('0-3')) {
          classifications.lightning++;
        } else if (status.includes('engaged') || status.includes('new')) {
          classifications.valid++;
        } else if (status.includes('cold')) {
          classifications.cold++;
        } else {
          classifications.valid++;
        }
      }
    });

    const hotLeads = hotLeadsCount;
    const qualifiedRate = totalLeads > 0 ? Math.round(((classifications.hot + classifications.star + classifications.lightning) / totalLeads) * 100) : 0;
    // Use actual average score if we have lead scores, otherwise estimate
    const avgScore = totalLeads > 0 && totalScore > 0 
      ? Math.round(totalScore / totalLeads)
      : totalLeads > 0 
        ? Math.round((classifications.hot * 90 + classifications.star * 75 + classifications.lightning * 65 + classifications.valid * 50 + classifications.cold * 25) / totalLeads) 
        : 0;

    return {
      totalLeads,
      hotLeads,
      avgScore,
      totalSpend,
      avgCPL,
      qualifiedRate,
      totalResults,
      classifications
    };
  }, [leadData, campaignData]);

  // Process lead classifications
  const leadClassifications = React.useMemo(() => {
    return calculatedMetrics.classifications;
  }, [calculatedMetrics]);

  // Lead classification chart data
  const classificationChartData = React.useMemo(() => {
    const data = calculatedMetrics.classifications;
    return [
      { name: 'Hot', value: data.hot, icon: Flame, color: CLASSIFICATION_COLORS.hot },
      { name: 'Quality', value: data.star, icon: Star, color: CLASSIFICATION_COLORS.star },
      { name: 'High Intent', value: data.lightning, icon: Zap, color: CLASSIFICATION_COLORS.lightning },
      { name: 'Valid', value: data.valid, icon: CheckCircle, color: CLASSIFICATION_COLORS.valid },
      { name: 'Cold', value: data.cold, icon: Snowflake, color: CLASSIFICATION_COLORS.cold },
    ].filter(d => d.value > 0);
  }, [calculatedMetrics]);

  // Lead score distribution - calculate from actual lead data
  const scoreDistribution = React.useMemo(() => {
    if (!hasUploadedData) return [
      { range: '0-20', count: 0 },
      { range: '21-40', count: 0 },
      { range: '41-60', count: 0 },
      { range: '61-80', count: 0 },
      { range: '81-100', count: 0 },
    ];
    const { classifications } = calculatedMetrics;
    // Distribute based on classifications
    return [
      { range: '0-20', count: classifications.cold },
      { range: '21-40', count: Math.round(classifications.valid * 0.4) },
      { range: '41-60', count: Math.round(classifications.valid * 0.6) + classifications.lightning },
      { range: '61-80', count: classifications.star },
      { range: '81-100', count: classifications.hot },
    ];
  }, [hasUploadedData, calculatedMetrics]);

  // Campaign performance data - from actual campaign data
  const campaignPerformance = React.useMemo(() => {
    if (campaignData.length === 0) return [];

    // Group by campaign name (fallback to index) and aggregate
    const grouped: Record<string, { spend: number; leads: number }> = {};
    campaignData.forEach((c, idx) => {
      const rawName = c['Campaign Name'] || c['Campaign name'] || c.name;
      const name = (rawName && String(rawName).trim()) ? String(rawName).trim() : `Campaign ${idx + 1}`;
      if (!grouped[name]) grouped[name] = { spend: 0, leads: 0 };
      grouped[name].spend += toNumber(c.Spend ?? c['Amount spent (GBP)'] ?? c.spend);
      grouped[name].leads += toNumber(c.Results ?? c.results);
    });

    return Object.entries(grouped)
      .map(([name, data]) => ({
        name: name.slice(0, 22),
        spend: Math.round(data.spend),
        leads: Math.round(data.leads),
        cpl: data.leads > 0 ? Math.round(data.spend / data.leads) : 0
      }))
      .sort((a, b) => b.spend - a.spend)
      .slice(0, 10);
  }, [campaignData]);

  // Lead source breakdown - from actual lead data
  const leadSources = React.useMemo(() => {
    if (leadData.length === 0) return [];
    const sources: Record<string, number> = {};
    leadData.forEach(lead => {
      const source = lead['Source Platform'] || lead.source || 'Direct';
      sources[source] = (sources[source] || 0) + 1;
    });
    return Object.entries(sources)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [leadData]);

  // Timeline distribution - from actual lead data
  const timelineDistribution = React.useMemo(() => {
    if (leadData.length === 0) return [];
    const timelines: Record<string, number> = {
      'Within 28d': 0,
      '0-3 months': 0,
      '3-6 months': 0,
      '6-9 months': 0,
      '9-12 months': 0,
    };
    leadData.forEach(lead => {
      const timeline = (lead.Timeline || lead['Timeline to Purchase'] || '').toLowerCase();
      if (timeline.includes('28')) timelines['Within 28d']++;
      else if (timeline.includes('0-3')) timelines['0-3 months']++;
      else if (timeline.includes('3-6')) timelines['3-6 months']++;
      else if (timeline.includes('6-9')) timelines['6-9 months']++;
      else if (timeline.includes('9-12')) timelines['9-12 months']++;
      else timelines['0-3 months']++;
    });
    return Object.entries(timelines).map(([name, value]) => ({ name, value }));
  }, [leadData]);

  // Conversion funnel data - from actual lead statuses
  const funnelData = React.useMemo(() => {
    if (leadData.length === 0) return [
      { name: 'New', value: 0, fill: 'hsl(var(--primary))' },
      { name: 'Contacted', value: 0, fill: 'hsl(262, 83%, 58%)' },
      { name: 'Viewing', value: 0, fill: 'hsl(38, 92%, 50%)' },
      { name: 'Offer', value: 0, fill: 'hsl(142, 76%, 36%)' },
      { name: 'Won', value: 0, fill: 'hsl(142, 76%, 26%)' },
    ];
    const statuses = { New: 0, Engaged: 0, Viewing: 0, Offer: 0, Won: 0 };
    leadData.forEach(lead => {
      const status = (lead.Status || lead.status || 'New').toLowerCase();
      if (status.includes('new')) statuses.New++;
      else if (status.includes('engaged')) statuses.Engaged++;
      else if (status.includes('viewing')) statuses.Viewing++;
      else if (status.includes('offer')) statuses.Offer++;
      else if (status.includes('won') || status.includes('closed')) statuses.Won++;
      else statuses.New++;
    });
    return [
      { name: 'New', value: statuses.New, fill: 'hsl(var(--primary))' },
      { name: 'Engaged', value: statuses.Engaged, fill: 'hsl(262, 83%, 58%)' },
      { name: 'Viewing', value: statuses.Viewing, fill: 'hsl(38, 92%, 50%)' },
      { name: 'Offer', value: statuses.Offer, fill: 'hsl(142, 76%, 36%)' },
      { name: 'Won', value: statuses.Won, fill: 'hsl(142, 76%, 26%)' },
    ];
  }, [leadData]);

  // Lead acquisition timeline - from actual lead dates
  const leadTimeline = React.useMemo(() => {
    if (leadData.length === 0) return [];
    const weeks: Record<string, number> = {};
    leadData.forEach(lead => {
      const dateStr = lead['Created Date'] || lead.date || '';
      if (dateStr) {
        const date = new Date(dateStr);
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        const weekKey = weekStart.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
        weeks[weekKey] = (weeks[weekKey] || 0) + 1;
      }
    });
    return Object.entries(weeks)
      .map(([date, leads]) => ({ date, leads }))
      .slice(-4);
  }, [leadData]);

  // Action leads
  const actionLeads: ActionLead[] = React.useMemo(() => {
    if (leadData.length === 0) return [];
    return leadData.map((lead, idx) => {
      const name = lead.Name || lead['Lead Name'] || lead.name || `Lead ${idx + 1}`;
      const status = (lead.Status || lead.status || '').toLowerCase();
      const timeline = (lead.Timeline || lead['Timeline to Purchase'] || '').toLowerCase();
      let qualityScore = 50;
      let intentScore = 50;
      
      if (status.includes('offer')) { qualityScore = 90; intentScore = 95; }
      else if (status.includes('viewing')) { qualityScore = 75; intentScore = 80; }
      else if (status.includes('engaged')) { qualityScore = 60; intentScore = 65; }
      
      if (timeline.includes('28')) intentScore = Math.max(intentScore, 85);
      else if (timeline.includes('0-3')) intentScore = Math.max(intentScore, 70);

      const classification = classifyLead(intentScore, qualityScore);
      return {
        id: lead['Lead ID'] || `lead_${idx}`,
        name,
        development: lead.Campaign || lead['Source Campaign'] || lead['Development'] || 'General',
        budget: lead.Budget || lead['Budget Range'] || 'N/A',
        qualityScore, intentScore,
        timeline: lead.Timeline || lead['Timeline to Purchase'] || 'N/A',
        email: lead.Email || lead.email || '',
        phone: lead.Phone || lead['Phone Number'] || '',
        reason: classification === 'hot' ? 'Viewing ready' : classification === 'star' ? 'High quality' : 'High intent',
        classification
      };
    }).filter(l => ['hot', 'star', 'lightning'].includes(l.classification)).slice(0, 5);
  }, [leadData]);

  // Campaign alerts
  const campaignAlerts: CampaignAlert[] = React.useMemo(() => {
    if (campaignData.length === 0) return [];
    return campaignData.map((c, idx) => {
      const spend = toNumber(c.Spend ?? c['Amount spent (GBP)'] ?? c.spend);
      const results = toNumber(c.Results ?? c.results) || 1;
      const cpl = spend / Math.max(results, 1);
      if (cpl > 50) {
        return {
          id: `alert_${idx}`,
          name: c['Campaign Name'] || c['Campaign name'] || c.name || `Campaign ${idx + 1}`,
          issue: 'CPL above target',
          currentValue: `£${Math.round(cpl)}`,
          targetValue: '£35',
          recommendation: 'Pause and reallocate budget',
          savings: `£${Math.round(spend * 0.3)}`
        };
      }
      return null;
    }).filter(Boolean).slice(0, 3) as CampaignAlert[];
  }, [campaignData]);

  // KPIs - Use calculated metrics from real data
  const kpis = React.useMemo(() => {
    return calculatedMetrics;
  }, [calculatedMetrics]);

  const handleAction = (action: string, lead: ActionLead) => {
    if (action === 'call' && lead.phone) window.open(`tel:${lead.phone}`, '_blank');
    else if (action === 'whatsapp' && lead.phone) window.open(`https://wa.me/${lead.phone.replace(/\D/g, '')}`, '_blank');
    else if (action === 'booking') toast.success(`${roleConfig.primaryAction} for ${lead.name}`);
    toast.success(`Action: ${action} for ${lead.name}`);
  };

  const handleCampaignAction = (action: string, alert: CampaignAlert) => {
    if (action === 'apply') toast.success(`Applied recommendation for ${alert.name}`);
    else if (action === 'view') navigate(roleConfig.campaignsPath);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;
    setMessages(prev => [...prev, { role: 'user', content: query, timestamp: new Date() }]);
    const q = query; setQuery('');
    const response = await askAgent(q, buildContext());
    if (response) setMessages(prev => [...prev, { role: 'agent', content: response.response, timestamp: new Date() }]);
  };

  const handleUpload = (type: 'campaigns' | 'leads') => { setUploadType(type); setUploadDialogOpen(true); };
  const handleCampaignData = (data: any[], fileName: string) => { setCampaignData(data); setCampaignFileName(fileName); setUploadDialogOpen(false); toast.success(`Loaded ${data.length} campaigns`); };
  const handleLeadData = (data: any[], fileName: string) => { setLeadData(data); setLeadFileName(fileName); setUploadDialogOpen(false); toast.success(`Loaded ${data.length} leads`); };
  const formatCurrency = (v: number) => v >= 1000000 ? `£${(v/1000000).toFixed(1)}M` : v >= 1000 ? `£${(v/1000).toFixed(0)}K` : `£${v}`;

  const [loadingDemo, setLoadingDemo] = useState(false);
  const loadDemoData = async () => {
    setLoadingDemo(true);
    try {
      const [campRes, leadRes] = await Promise.all([fetch('/sample-data/sample-campaigns.csv'), fetch('/sample-data/sample-leads.csv')]);
      const [campText, leadText] = await Promise.all([campRes.text(), leadRes.text()]);
      const campResult = Papa.parse(campText, { header: true, skipEmptyLines: true });
      const leadResult = Papa.parse(leadText, { header: true, skipEmptyLines: true });
      if (campResult.data.length > 0) { setCampaignData(campResult.data); setCampaignFileName('sample-campaigns.csv'); }
      if (leadResult.data.length > 0) { setLeadData(leadResult.data); setLeadFileName('sample-leads.csv'); }
      toast.success(`Loaded ${campResult.data.length} campaigns and ${leadResult.data.length} leads`);
    } catch { toast.error('Failed to load demo data'); }
    finally { setLoadingDemo(false); }
  };

  const hasData = leadData.length > 0 || campaignData.length > 0;

  return (
    <div className="h-full">
      {/* Main Dashboard */}
      <div className="space-y-4 md:space-y-6 overflow-auto pb-6 px-1">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold">{greeting}, {userName}</h1>
            <p className="text-sm text-muted-foreground">{dateString}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Campaigns: {campaignData.length}{airtableCampaignData && airtableCampaignData.length > 0 ? ' (Airtable)' : campaignFileName ? ` (${campaignFileName})` : ''} · Leads: {leadData.length}{leadFileName ? ` (${leadFileName})` : ''}
              {airtableLoading && <span className="ml-2 text-primary">Loading from Airtable...</span>}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {userType === 'admin' && (
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => refetchAirtable()}
                disabled={airtableLoading}
              >
                <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${airtableLoading ? 'animate-spin' : ''}`} />
                <span className="hidden xs:inline">Sync Airtable</span>
                <span className="xs:hidden">Sync</span>
              </Button>
            )}
            <Dialog open={uploadDialogOpen && uploadType === 'campaigns'} onOpenChange={(o) => !o && setUploadDialogOpen(false)}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-xs" onClick={() => handleUpload('campaigns')}><Upload className="h-3.5 w-3.5 mr-1.5" /><span className="hidden xs:inline">Campaigns</span><span className="xs:hidden">Camp.</span></Button>
              </DialogTrigger>
              <DialogContent className="max-w-[90vw] sm:max-w-lg"><DialogHeader><DialogTitle>Upload Campaign Data</DialogTitle></DialogHeader>
                <UploadZone label="Campaign CSV" description="Upload Meta Ads export CSV" onDataParsed={handleCampaignData} isUploaded={false} onClear={() => {}} />
              </DialogContent>
            </Dialog>
            <Dialog open={uploadDialogOpen && uploadType === 'leads'} onOpenChange={(o) => !o && setUploadDialogOpen(false)}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-xs" onClick={() => handleUpload('leads')}><Upload className="h-3.5 w-3.5 mr-1.5" />Leads</Button>
              </DialogTrigger>
              <DialogContent className="max-w-[90vw] sm:max-w-lg"><DialogHeader><DialogTitle>Upload Lead Data</DialogTitle></DialogHeader>
                <UploadZone label="Lead CSV" description="Upload lead export CSV" onDataParsed={handleLeadData} isUploaded={false} onClear={() => {}} />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {!hasData ? (
          <Card className="p-6 md:p-12 text-center border-dashed">
            <Brain className="h-12 w-12 md:h-16 md:w-16 mx-auto text-muted-foreground mb-3 md:mb-4 opacity-50" />
            <h3 className="text-lg md:text-xl font-semibold mb-2">Upload your data to get started</h3>
            <p className="text-sm text-muted-foreground mb-4 md:mb-6 max-w-md mx-auto">Upload campaign and lead CSVs to see actionable insights and analytics.</p>
            <div className="flex flex-col gap-3 md:gap-4 items-center">
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                <Button onClick={() => handleUpload('campaigns')} className="w-full sm:w-auto"><Upload className="h-4 w-4 mr-2" />Upload Campaigns</Button>
                <Button variant="outline" onClick={() => handleUpload('leads')} className="w-full sm:w-auto"><Upload className="h-4 w-4 mr-2" />Upload Leads</Button>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground"><div className="h-px w-12 bg-border" /><span className="text-sm">or</span><div className="h-px w-12 bg-border" /></div>
              <Button variant="secondary" onClick={loadDemoData} disabled={loadingDemo} className="w-full sm:w-auto">
                {loadingDemo ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Database className="h-4 w-4 mr-2" />}Load Demo Data
              </Button>
            </div>
          </Card>
        ) : (
          <>
            {/* KPI Cards with Animated Counters */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-4">
              <Card className="p-3 md:p-4 animate-fade-in" style={{ animationDelay: '0ms' }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] md:text-xs text-muted-foreground">Total Leads</span>
                  <Users className="h-3.5 w-3.5 md:h-4 md:w-4 text-muted-foreground" />
                </div>
                <AnimatedNumber value={kpis.totalLeads} duration={2000} delay={100} className="text-xl md:text-2xl font-bold" />
              </Card>
              <Card className="p-3 md:p-4 animate-fade-in" style={{ animationDelay: '100ms' }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] md:text-xs text-muted-foreground">Hot Leads</span>
                  <Flame className="h-3.5 w-3.5 md:h-4 md:w-4 text-orange-500" />
                </div>
                <AnimatedNumber value={kpis.hotLeads} duration={2000} delay={200} className="text-xl md:text-2xl font-bold text-orange-500" />
              </Card>
              <Card className="p-3 md:p-4 animate-fade-in" style={{ animationDelay: '200ms' }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] md:text-xs text-muted-foreground">Avg Score</span>
                  <Target className="h-3.5 w-3.5 md:h-4 md:w-4 text-muted-foreground" />
                </div>
                <AnimatedNumber value={kpis.avgScore} duration={2000} delay={300} className="text-xl md:text-2xl font-bold" />
              </Card>
              <Card className="p-3 md:p-4 animate-fade-in" style={{ animationDelay: '300ms' }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] md:text-xs text-muted-foreground">Total Spend</span>
                  <PoundSterling className="h-3.5 w-3.5 md:h-4 md:w-4 text-muted-foreground" />
                </div>
                <AnimatedNumber 
                  value={kpis.totalSpend} 
                  duration={2000} 
                  delay={400} 
                  prefix="£" 
                  formatFn={(n) => n >= 1000 ? `${(n/1000).toFixed(0)}K` : n.toString()}
                  className="text-xl md:text-2xl font-bold" 
                />
              </Card>
              <Card className="p-3 md:p-4 animate-fade-in" style={{ animationDelay: '400ms' }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] md:text-xs text-muted-foreground">Avg CPL</span>
                  {kpis.avgCPL > 35 ? <TrendingUp className="h-3.5 w-3.5 md:h-4 md:w-4 text-destructive" /> : <TrendingDown className="h-3.5 w-3.5 md:h-4 md:w-4 text-green-500" />}
                </div>
                <AnimatedNumber 
                  value={Math.round(kpis.avgCPL)} 
                  duration={2000} 
                  delay={500} 
                  prefix="£" 
                  className={`text-xl md:text-2xl font-bold ${kpis.avgCPL > 35 ? 'text-destructive' : 'text-green-500'}`} 
                />
              </Card>
              <Card className="p-3 md:p-4 animate-fade-in" style={{ animationDelay: '500ms' }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] md:text-xs text-muted-foreground">Qualified Rate</span>
                  <CheckCircle className="h-3.5 w-3.5 md:h-4 md:w-4 text-green-500" />
                </div>
                <AnimatedNumber value={kpis.qualifiedRate} duration={2000} delay={600} suffix="%" className="text-xl md:text-2xl font-bold text-green-500" />
              </Card>
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              {/* Lead Classification */}
              <Card>
                <CardHeader className="pb-2 px-3 md:px-6">
                  <CardTitle className="text-xs md:text-sm font-medium">Lead Classification</CardTitle>
                </CardHeader>
                <CardContent className="px-3 md:px-6">
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="w-24 h-24 md:w-32 md:h-32 shrink-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={classificationChartData} cx="50%" cy="50%" innerRadius={20} outerRadius={40} paddingAngle={2} dataKey="value">
                            {classificationChartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex-1 space-y-1.5 md:space-y-2 min-w-0">
                      {classificationChartData.map((item, i) => (
                        <div key={i} className="flex items-center justify-between text-xs md:text-sm">
                          <div className="flex items-center gap-1.5 md:gap-2 min-w-0">
                            <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                            <span className="truncate">{item.name}</span>
                          </div>
                          <AnimatedNumber value={item.value} duration={1500} delay={800 + i * 100} className="font-medium shrink-0 ml-2" />
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Score Distribution */}
              <Card>
                <CardHeader className="pb-2 px-3 md:px-6">
                  <CardTitle className="text-xs md:text-sm font-medium">Lead Score Distribution</CardTitle>
                </CardHeader>
                <CardContent className="px-3 md:px-6">
                  <ResponsiveContainer width="100%" height={100}>
                    <BarChart data={scoreDistribution}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="range" tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" width={25} />
                      <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', fontSize: 11 }} />
                      <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4">
              {/* Campaign Performance */}
              <Card className="lg:col-span-2">
                <CardHeader className="pb-2 px-3 md:px-6">
                  <CardTitle className="text-xs md:text-sm font-medium">Campaign Performance</CardTitle>
                </CardHeader>
                <CardContent className="px-3 md:px-6">
                  <ResponsiveContainer width="100%" height={150}>
                    <BarChart data={campaignPerformance} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis type="number" tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis dataKey="name" type="category" tick={{ fontSize: 9 }} width={70} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', fontSize: 11 }} />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                      <Bar dataKey="leads" name="Leads" fill="hsl(142, 76%, 36%)" radius={[0, 4, 4, 0]} />
                      <Bar dataKey="cpl" name="CPL (£)" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Lead Sources */}
              <Card>
                <CardHeader className="pb-2 px-3 md:px-6">
                  <CardTitle className="text-xs md:text-sm font-medium">Lead Sources</CardTitle>
                </CardHeader>
                <CardContent className="px-3 md:px-6">
                  <ResponsiveContainer width="100%" height={150}>
                    <PieChart>
                      <Pie data={leadSources} cx="50%" cy="50%" outerRadius={50} dataKey="value" label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`} labelLine={false}>
                        {leadSources.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row 3 - Funnel & Timeline */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              {/* Conversion Funnel */}
              <Card>
                <CardHeader className="pb-2 px-3 md:px-6">
                  <CardTitle className="text-xs md:text-sm font-medium">Conversion Funnel</CardTitle>
                </CardHeader>
                <CardContent className="px-3 md:px-6">
                  <div className="space-y-2 md:space-y-3">
                    {funnelData.map((stage, i) => {
                      const maxValue = funnelData[0]?.value || 1;
                      const widthPercent = Math.max((stage.value / maxValue) * 100, 15);
                      const conversionRate = i > 0 && funnelData[i - 1].value > 0 
                        ? Math.round((stage.value / funnelData[i - 1].value) * 100) 
                        : 100;
                      return (
                        <div key={stage.name} className="flex items-center gap-2 md:gap-3">
                          <span className="text-[10px] md:text-xs w-12 md:w-16 text-muted-foreground">{stage.name}</span>
                          <div className="flex-1 relative">
                            <div 
                              className="h-6 md:h-8 rounded flex items-center justify-end pr-2 md:pr-3 transition-all"
                              style={{ width: `${widthPercent}%`, backgroundColor: stage.fill }}
                            >
                              <span className="text-[10px] md:text-xs font-medium text-white">{stage.value}</span>
                            </div>
                          </div>
                          {i > 0 && (
                            <span className={`text-[10px] md:text-xs w-10 md:w-12 text-right ${conversionRate >= 50 ? 'text-green-500' : conversionRate >= 30 ? 'text-amber-500' : 'text-destructive'}`}>
                              {conversionRate}%
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Lead Acquisition Timeline */}
              <Card>
                <CardHeader className="pb-2 px-3 md:px-6">
                  <CardTitle className="text-xs md:text-sm font-medium">Lead Acquisition Over Time</CardTitle>
                </CardHeader>
                <CardContent className="px-3 md:px-6">
                  <ResponsiveContainer width="100%" height={130}>
                    <AreaChart data={leadTimeline}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" width={25} />
                      <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', fontSize: 11 }} />
                      <Area type="monotone" dataKey="leads" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.2)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* AI Recommendations */}
            <Card>
              <CardHeader className="pb-2 px-3 md:px-6">
                <CardTitle className="text-xs md:text-sm font-medium flex items-center gap-2">
                  <Lightbulb className="h-3.5 w-3.5 md:h-4 md:w-4 text-yellow-500" />AI Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 md:px-6">
                {loadingRecommendations ? (
                  <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-3.5 w-3.5 animate-spin" /><span className="text-xs md:text-sm">Analysing...</span></div>
                ) : aiRecommendations.length > 0 ? (
                  <ul className="space-y-1.5 md:space-y-2">
                    {aiRecommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs md:text-sm"><CheckCircle className="h-3.5 w-3.5 md:h-4 md:w-4 text-green-500 mt-0.5 shrink-0" /><span>{rec}</span></li>
                    ))}
                  </ul>
                ) : <p className="text-xs md:text-sm text-muted-foreground">No recommendations yet.</p>}
              </CardContent>
            </Card>

            {/* Action Required */}
            {actionLeads.length > 0 && (
              <Card>
                <CardHeader className="pb-2 px-3 md:px-6">
                  <CardTitle className="text-xs md:text-sm font-medium flex items-center gap-2">
                    <Flame className="h-3.5 w-3.5 md:h-4 md:w-4 text-orange-500" />Action Required
                    <Badge variant="destructive" className="ml-1 text-[10px] md:text-xs">{actionLeads.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 px-3 md:px-6">
                  {actionLeads.map((lead) => (
                    <div key={lead.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 md:p-3 rounded-lg bg-orange-500/5 border border-orange-500/20">
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
                          <span className="font-medium text-xs md:text-sm truncate">{lead.name}</span>
                          <Badge variant="outline" className="text-[10px] md:text-xs shrink-0">{lead.budget}</Badge>
                          <Badge className="bg-orange-500/20 text-orange-600 border-0 text-[10px] md:text-xs shrink-0">{lead.reason}</Badge>
                        </div>
                        <div className="flex items-center gap-2 md:gap-3 text-[10px] md:text-xs text-muted-foreground">
                          <span>Q: {lead.qualityScore}</span><span>I: {lead.intentScore}</span><span className="truncate">{lead.timeline}</span>
                        </div>
                      </div>
                      <div className="flex gap-1.5 shrink-0">
                        <Button size="sm" variant="default" onClick={() => handleAction('call', lead)} className="h-7 w-7 md:h-8 md:w-8 p-0"><Phone className="h-3 w-3 md:h-3.5 md:w-3.5" /></Button>
                        <Button size="sm" variant="outline" onClick={() => handleAction('whatsapp', lead)} className="h-7 w-7 md:h-8 md:w-8 p-0"><MessageCircle className="h-3 w-3 md:h-3.5 md:w-3.5" /></Button>
                        <Button size="sm" variant="outline" onClick={() => handleAction('booking', lead)} className="h-7 w-7 md:h-8 md:w-8 p-0"><Calendar className="h-3 w-3 md:h-3.5 md:w-3.5" /></Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Campaign Alerts */}
            {campaignAlerts.length > 0 && (
              <Card>
                <CardHeader className="pb-2 px-3 md:px-6">
                  <CardTitle className="text-xs md:text-sm font-medium flex items-center gap-2">
                    <AlertCircle className="h-3.5 w-3.5 md:h-4 md:w-4 text-amber-500" />Campaign Alerts
                    <Badge variant="secondary" className="ml-1 bg-amber-500/20 text-amber-600 text-[10px] md:text-xs">{campaignAlerts.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 px-3 md:px-6">
                  {campaignAlerts.map((alert) => (
                    <div key={alert.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 md:p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-xs md:text-sm truncate">{alert.name}</span>
                          <span className="text-destructive font-medium text-xs md:text-sm shrink-0">CPL: {alert.currentValue}</span>
                        </div>
                        <p className="text-[10px] md:text-xs text-muted-foreground">{alert.recommendation} {alert.savings && <span className="text-green-500">Save {alert.savings}</span>}</p>
                      </div>
                      <div className="flex gap-1.5 shrink-0">
                        <Button size="sm" onClick={() => handleCampaignAction('apply', alert)} className="bg-green-600 hover:bg-green-700 h-7 md:h-8 text-xs"><CheckCircle className="h-3 w-3 md:h-3.5 md:w-3.5 mr-1" />Apply</Button>
                        <Button size="sm" variant="outline" onClick={() => handleCampaignAction('view', alert)} className="h-7 w-7 md:h-8 md:w-8 p-0"><Eye className="h-3 w-3 md:h-3.5 md:w-3.5" /></Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>

      {/* Floating AI Chatbot */}
      {!chatOpen ? (
        <Button 
          onClick={() => setChatOpen(true)} 
          className="fixed bottom-4 right-4 md:bottom-6 md:right-6 h-12 w-12 md:h-14 md:w-14 rounded-full shadow-lg z-50"
          size="icon"
        >
          <Bot className="h-5 w-5 md:h-6 md:w-6" />
        </Button>
      ) : (
        <Card className={`fixed z-50 shadow-2xl transition-all ${chatMinimized ? 'bottom-4 right-4 md:bottom-6 md:right-6 w-64 md:w-72 h-12 md:h-14' : 'bottom-0 right-0 md:bottom-6 md:right-6 w-full md:w-96 h-[85vh] md:h-[500px] md:rounded-lg rounded-t-lg'}`}>
          <CardHeader className="pb-2 border-b flex flex-row items-center justify-between py-2.5 md:py-3 px-3 md:px-4">
            <CardTitle className="text-xs md:text-sm font-medium flex items-center gap-2">
              <Bot className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />AI Assistant
            </CardTitle>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-6 w-6 md:h-7 md:w-7" onClick={() => setChatMinimized(!chatMinimized)}>
                {chatMinimized ? <Maximize2 className="h-3.5 w-3.5 md:h-4 md:w-4" /> : <Minimize2 className="h-3.5 w-3.5 md:h-4 md:w-4" />}
              </Button>
              <Button variant="ghost" size="icon" className="h-6 w-6 md:h-7 md:w-7" onClick={() => setChatOpen(false)}>
                <X className="h-3.5 w-3.5 md:h-4 md:w-4" />
              </Button>
            </div>
          </CardHeader>
          {!chatMinimized && (
            <>
              <ScrollArea className="flex-1 p-3 md:p-4 h-[calc(85vh-120px)] md:h-[360px]" ref={scrollRef}>
                {messages.length === 0 ? (
                  <div className="space-y-3">
                    <p className="text-[10px] md:text-xs text-muted-foreground text-center mb-3 md:mb-4">Ask me anything about your data</p>
                    <div className="space-y-2">
                      {["Best performing campaign?", "Show hot leads", "How to reduce CPL?", "Daily summary"].map((q, i) => (
                        <Button key={i} variant="outline" size="sm" className="w-full text-[10px] md:text-xs h-auto py-2 justify-start" onClick={() => setQuery(q)} disabled={!hasData}>{q}</Button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2.5 md:space-y-3">
                    {messages.map((m, i) => (
                      <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-lg px-2.5 md:px-3 py-1.5 md:py-2 text-xs md:text-sm ${m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                          <p className="whitespace-pre-wrap">{m.content}</p>
                        </div>
                      </div>
                    ))}
                    {isLoading && <div className="flex justify-start"><div className="bg-muted rounded-lg px-2.5 md:px-3 py-1.5 md:py-2 flex items-center gap-2"><Loader2 className="h-3 w-3 md:h-3.5 md:w-3.5 animate-spin" /><span className="text-xs md:text-sm">Thinking...</span></div></div>}
                  </div>
                )}
              </ScrollArea>
              <div className="p-2.5 md:p-3 border-t">
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <Textarea placeholder={hasData ? "Ask anything..." : "Upload data first..."} value={query} onChange={(e) => setQuery(e.target.value)} className="min-h-[36px] md:min-h-[40px] max-h-[50px] md:max-h-[60px] resize-none text-xs md:text-sm" disabled={!hasData} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e); }}} />
                  <Button type="submit" size="icon" disabled={isLoading || !query.trim() || !hasData} className="h-9 w-9 md:h-10 md:w-10">{isLoading ? <Loader2 className="h-3.5 w-3.5 md:h-4 md:w-4 animate-spin" /> : <Send className="h-3.5 w-3.5 md:h-4 md:w-4" />}</Button>
                </form>
                {error && <p className="text-[10px] md:text-xs text-destructive mt-2 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{error}</p>}
              </div>
            </>
          )}
        </Card>
      )}
    </div>
  );
}
