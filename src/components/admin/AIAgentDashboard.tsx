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
  Maximize2
} from 'lucide-react';
import { useMasterAgent, MasterAgentContext } from '@/hooks/useMasterAgent';
import { useUploadedData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { UploadZone } from '@/components/UploadZone';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { classifyLead } from '@/lib/leadClassification';
import Papa from 'papaparse';
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
    campaignData, 
    setCampaignData, 
    setCampaignFileName,
    leadData, 
    setLeadData,
    setLeadFileName 
  } = useUploadedData(userType);

  const roleConfig = getRoleConfig(userType);
  const userName = user?.name?.split(' ')[0] || 'there';
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

  // Process lead classifications
  const leadClassifications = React.useMemo(() => {
    const counts = { hot: 0, star: 0, lightning: 0, valid: 0, cold: 0, warning: 0, disqualified: 0 };
    leadData.forEach(lead => {
      const qualityScore = parseInt(lead.Score || lead.score || '50');
      const intentText = (lead.Intent || lead.intent || '').toString().toLowerCase();
      let intentScore = qualityScore;
      if (intentText === 'high' || intentText === 'hot') intentScore = Math.max(qualityScore, 80);
      else if (intentText === 'warm') intentScore = Math.max(qualityScore, 60);
      const classification = classifyLead(intentScore, qualityScore);
      if (counts[classification as keyof typeof counts] !== undefined) {
        counts[classification as keyof typeof counts]++;
      }
    });
    return counts;
  }, [leadData]);

  // Lead classification chart data
  const classificationChartData = React.useMemo(() => [
    { name: 'Hot', value: leadClassifications.hot, icon: Flame, color: CLASSIFICATION_COLORS.hot },
    { name: 'Quality', value: leadClassifications.star, icon: Star, color: CLASSIFICATION_COLORS.star },
    { name: 'High Intent', value: leadClassifications.lightning, icon: Zap, color: CLASSIFICATION_COLORS.lightning },
    { name: 'Valid', value: leadClassifications.valid, icon: CheckCircle, color: CLASSIFICATION_COLORS.valid },
    { name: 'Cold', value: leadClassifications.cold, icon: Snowflake, color: CLASSIFICATION_COLORS.cold },
  ].filter(d => d.value > 0), [leadClassifications]);

  // Lead score distribution
  const scoreDistribution = React.useMemo(() => {
    const ranges = [
      { range: '0-20', min: 0, max: 20, count: 0 },
      { range: '21-40', min: 21, max: 40, count: 0 },
      { range: '41-60', min: 41, max: 60, count: 0 },
      { range: '61-80', min: 61, max: 80, count: 0 },
      { range: '81-100', min: 81, max: 100, count: 0 },
    ];
    leadData.forEach(lead => {
      const score = parseInt(lead.Score || lead.score || '50');
      const range = ranges.find(r => score >= r.min && score <= r.max);
      if (range) range.count++;
    });
    return ranges;
  }, [leadData]);

  // Campaign performance data
  const campaignPerformance = React.useMemo(() => {
    return campaignData.slice(0, 8).map((c, i) => {
      const spend = parseFloat(c['Amount spent (GBP)'] || c.spend || 0);
      const results = parseFloat(c.Results || c.results || 0);
      const cpl = results > 0 ? spend / results : 0;
      return {
        name: (c['Campaign name'] || c.name || `Campaign ${i + 1}`).slice(0, 15),
        spend: Math.round(spend),
        leads: results,
        cpl: Math.round(cpl)
      };
    });
  }, [campaignData]);

  // Lead source breakdown
  const leadSources = React.useMemo(() => {
    const sources: Record<string, number> = {};
    leadData.forEach(lead => {
      const source = lead['Source'] || lead['Source Campaign'] || lead.source || 'Direct';
      const key = source.toLowerCase().includes('meta') ? 'Meta' :
                  source.toLowerCase().includes('google') ? 'Google' :
                  source.toLowerCase().includes('rightmove') ? 'Rightmove' :
                  source.toLowerCase().includes('zoopla') ? 'Zoopla' : 'Other';
      sources[key] = (sources[key] || 0) + 1;
    });
    return Object.entries(sources).map(([name, value]) => ({ name, value }));
  }, [leadData]);

  // Timeline distribution
  const timelineDistribution = React.useMemo(() => {
    const timelines: Record<string, number> = {};
    leadData.forEach(lead => {
      const timeline = lead['Timeline to Purchase'] || lead.timeline || 'Unknown';
      timelines[timeline] = (timelines[timeline] || 0) + 1;
    });
    return Object.entries(timelines).slice(0, 5).map(([name, value]) => ({ name: name.slice(0, 12), value }));
  }, [leadData]);

  // Conversion funnel data
  const funnelData = React.useMemo(() => {
    const statuses: Record<string, number> = { 'New': 0, 'Contacted': 0, 'Viewing': 0, 'Offer': 0, 'Won': 0 };
    leadData.forEach(lead => {
      const status = (lead.Status || lead.status || 'new').toLowerCase();
      if (status.includes('won') || status.includes('closed')) statuses['Won']++;
      else if (status.includes('offer')) statuses['Offer']++;
      else if (status.includes('view')) statuses['Viewing']++;
      else if (status.includes('contact')) statuses['Contacted']++;
      else statuses['New']++;
    });
    // If no status variations, simulate a funnel based on classifications
    if (leadData.length > 0 && statuses['New'] === leadData.length) {
      const total = leadData.length;
      statuses['New'] = total;
      statuses['Contacted'] = Math.round(total * 0.65);
      statuses['Viewing'] = Math.round(total * 0.35);
      statuses['Offer'] = Math.round(total * 0.15);
      statuses['Won'] = Math.round(total * 0.08);
    }
    return [
      { name: 'New', value: statuses['New'], fill: 'hsl(var(--primary))' },
      { name: 'Contacted', value: statuses['Contacted'], fill: 'hsl(262, 83%, 58%)' },
      { name: 'Viewing', value: statuses['Viewing'], fill: 'hsl(38, 92%, 50%)' },
      { name: 'Offer', value: statuses['Offer'], fill: 'hsl(142, 76%, 36%)' },
      { name: 'Won', value: statuses['Won'], fill: 'hsl(142, 76%, 26%)' },
    ];
  }, [leadData]);

  // Lead acquisition timeline (by date)
  const leadTimeline = React.useMemo(() => {
    const dateMap: Record<string, number> = {};
    leadData.forEach(lead => {
      const dateStr = lead['Created Date'] || lead['Date Added'] || lead.date || lead.createdAt;
      if (dateStr) {
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
          const key = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
          dateMap[key] = (dateMap[key] || 0) + 1;
        }
      }
    });
    // If no dates, generate sample weekly data
    if (Object.keys(dateMap).length === 0 && leadData.length > 0) {
      const total = leadData.length;
      const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
      const distribution = [0.15, 0.25, 0.35, 0.25];
      return weeks.map((week, i) => ({ date: week, leads: Math.round(total * distribution[i]) }));
    }
    return Object.entries(dateMap).slice(-7).map(([date, leads]) => ({ date, leads }));
  }, [leadData]);

  // Action leads
  const actionLeads: ActionLead[] = React.useMemo(() => {
    if (leadData.length === 0) return [];
    return leadData.map((lead, idx) => {
      const name = lead['Lead Name'] || lead.name || `Lead ${idx + 1}`;
      const qualityScore = parseInt(lead.Score || lead.score || '50');
      const intentText = (lead.Intent || lead.intent || '').toString().toLowerCase();
      let intentScore = qualityScore;
      if (intentText === 'high' || intentText === 'hot') intentScore = Math.max(qualityScore, 80);
      else if (intentText === 'warm') intentScore = Math.max(qualityScore, 60);
      const classification = classifyLead(intentScore, qualityScore);
      return {
        id: lead['Lead ID'] || `lead_${idx}`,
        name,
        development: lead['Source Campaign'] || lead['Development'] || 'General',
        budget: lead['Budget Range'] || lead.budget || 'N/A',
        qualityScore, intentScore,
        timeline: lead['Timeline to Purchase'] || lead.timeline || 'N/A',
        email: lead.Email || lead.email || '',
        phone: lead['Phone Number'] || lead.phone || '',
        reason: classification === 'hot' ? 'Viewing ready' : classification === 'star' ? 'High quality' : 'High intent',
        classification
      };
    }).filter(l => ['hot', 'star', 'lightning'].includes(l.classification)).slice(0, 5);
  }, [leadData]);

  // Campaign alerts
  const campaignAlerts: CampaignAlert[] = React.useMemo(() => {
    if (campaignData.length === 0) return [];
    return campaignData.map((c, idx) => {
      const spend = parseFloat(c['Amount spent (GBP)'] || c.spend || 0);
      const results = parseFloat(c.Results || c.results || 1);
      const cpl = spend / Math.max(results, 1);
      if (cpl > 50) {
        return {
          id: `alert_${idx}`,
          name: c['Campaign name'] || c.name || `Campaign ${idx + 1}`,
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

  // KPIs
  const kpis = React.useMemo(() => {
    const totalLeads = leadData.length;
    const hotLeads = leadClassifications.hot + leadClassifications.star + leadClassifications.lightning;
    const avgScore = leadData.length > 0 ? Math.round(leadData.reduce((acc, l) => acc + parseInt(l.Score || l.score || '50'), 0) / leadData.length) : 0;
    const totalSpend = campaignData.reduce((acc, c) => acc + parseFloat(c['Amount spent (GBP)'] || c.spend || 0), 0);
    const totalResults = campaignData.reduce((acc, c) => acc + parseFloat(c.Results || c.results || 0), 0);
    const avgCPL = totalResults > 0 ? totalSpend / totalResults : 0;
    const qualifiedRate = totalLeads > 0 ? Math.round((hotLeads / totalLeads) * 100) : 0;
    return { totalLeads, hotLeads, avgScore, totalSpend, avgCPL, qualifiedRate, totalResults };
  }, [leadData, campaignData, leadClassifications]);

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
      <div className="space-y-6 overflow-auto pb-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{greeting}, {userName}</h1>
            <p className="text-muted-foreground">{dateString}</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={uploadDialogOpen && uploadType === 'campaigns'} onOpenChange={(o) => !o && setUploadDialogOpen(false)}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" onClick={() => handleUpload('campaigns')}><Upload className="h-3.5 w-3.5 mr-1.5" />Campaigns</Button>
              </DialogTrigger>
              <DialogContent><DialogHeader><DialogTitle>Upload Campaign Data</DialogTitle></DialogHeader>
                <UploadZone label="Campaign CSV" description="Upload Meta Ads export CSV" onDataParsed={handleCampaignData} isUploaded={false} onClear={() => {}} />
              </DialogContent>
            </Dialog>
            <Dialog open={uploadDialogOpen && uploadType === 'leads'} onOpenChange={(o) => !o && setUploadDialogOpen(false)}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" onClick={() => handleUpload('leads')}><Upload className="h-3.5 w-3.5 mr-1.5" />Leads</Button>
              </DialogTrigger>
              <DialogContent><DialogHeader><DialogTitle>Upload Lead Data</DialogTitle></DialogHeader>
                <UploadZone label="Lead CSV" description="Upload lead export CSV" onDataParsed={handleLeadData} isUploaded={false} onClear={() => {}} />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {!hasData ? (
          <Card className="p-12 text-center border-dashed">
            <Brain className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">Upload your data to get started</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">Upload campaign and lead CSVs to see actionable insights and analytics.</p>
            <div className="flex flex-col gap-4 items-center">
              <div className="flex gap-3">
                <Button onClick={() => handleUpload('campaigns')}><Upload className="h-4 w-4 mr-2" />Upload Campaigns</Button>
                <Button variant="outline" onClick={() => handleUpload('leads')}><Upload className="h-4 w-4 mr-2" />Upload Leads</Button>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground"><div className="h-px w-12 bg-border" /><span className="text-sm">or</span><div className="h-px w-12 bg-border" /></div>
              <Button variant="secondary" onClick={loadDemoData} disabled={loadingDemo}>
                {loadingDemo ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Database className="h-4 w-4 mr-2" />}Load Demo Data
              </Button>
            </div>
          </Card>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
              <Card className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">Total Leads</span>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </div>
                <span className="text-2xl font-bold">{kpis.totalLeads}</span>
              </Card>
              <Card className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">Hot Leads</span>
                  <Flame className="h-4 w-4 text-orange-500" />
                </div>
                <span className="text-2xl font-bold text-orange-500">{kpis.hotLeads}</span>
              </Card>
              <Card className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">Avg Score</span>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </div>
                <span className="text-2xl font-bold">{kpis.avgScore}</span>
              </Card>
              <Card className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">Total Spend</span>
                  <PoundSterling className="h-4 w-4 text-muted-foreground" />
                </div>
                <span className="text-2xl font-bold">{formatCurrency(kpis.totalSpend)}</span>
              </Card>
              <Card className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">Avg CPL</span>
                  {kpis.avgCPL > 35 ? <TrendingUp className="h-4 w-4 text-destructive" /> : <TrendingDown className="h-4 w-4 text-green-500" />}
                </div>
                <span className={`text-2xl font-bold ${kpis.avgCPL > 35 ? 'text-destructive' : 'text-green-500'}`}>£{Math.round(kpis.avgCPL)}</span>
              </Card>
              <Card className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">Qualified Rate</span>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
                <span className="text-2xl font-bold text-green-500">{kpis.qualifiedRate}%</span>
              </Card>
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Lead Classification */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Lead Classification</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="w-32 h-32">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={classificationChartData} cx="50%" cy="50%" innerRadius={25} outerRadius={50} paddingAngle={2} dataKey="value">
                            {classificationChartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex-1 space-y-2">
                      {classificationChartData.map((item, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                            <span>{item.name}</span>
                          </div>
                          <span className="font-medium">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Score Distribution */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Lead Score Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={120}>
                    <BarChart data={scoreDistribution}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="range" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                      <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Campaign Performance */}
              <Card className="lg:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Campaign Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={campaignPerformance} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis type="number" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={80} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', fontSize: 12 }} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Bar dataKey="leads" name="Leads" fill="hsl(142, 76%, 36%)" radius={[0, 4, 4, 0]} />
                      <Bar dataKey="cpl" name="CPL (£)" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Lead Sources */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Lead Sources</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie data={leadSources} cx="50%" cy="50%" outerRadius={60} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                        {leadSources.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row 3 - Funnel & Timeline */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Conversion Funnel */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Conversion Funnel</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {funnelData.map((stage, i) => {
                      const maxValue = funnelData[0]?.value || 1;
                      const widthPercent = Math.max((stage.value / maxValue) * 100, 15);
                      const conversionRate = i > 0 && funnelData[i - 1].value > 0 
                        ? Math.round((stage.value / funnelData[i - 1].value) * 100) 
                        : 100;
                      return (
                        <div key={stage.name} className="flex items-center gap-3">
                          <span className="text-xs w-16 text-muted-foreground">{stage.name}</span>
                          <div className="flex-1 relative">
                            <div 
                              className="h-8 rounded flex items-center justify-end pr-3 transition-all"
                              style={{ width: `${widthPercent}%`, backgroundColor: stage.fill }}
                            >
                              <span className="text-xs font-medium text-white">{stage.value}</span>
                            </div>
                          </div>
                          {i > 0 && (
                            <span className={`text-xs w-12 text-right ${conversionRate >= 50 ? 'text-green-500' : conversionRate >= 30 ? 'text-amber-500' : 'text-destructive'}`}>
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
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Lead Acquisition Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={160}>
                    <AreaChart data={leadTimeline}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', fontSize: 12 }} />
                      <Area type="monotone" dataKey="leads" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.2)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* AI Recommendations */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-yellow-500" />AI Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingRecommendations ? (
                  <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /><span className="text-sm">Analysing...</span></div>
                ) : aiRecommendations.length > 0 ? (
                  <ul className="space-y-2">
                    {aiRecommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm"><CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /><span>{rec}</span></li>
                    ))}
                  </ul>
                ) : <p className="text-sm text-muted-foreground">No recommendations yet.</p>}
              </CardContent>
            </Card>

            {/* Action Required */}
            {actionLeads.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Flame className="h-4 w-4 text-orange-500" />Action Required
                    <Badge variant="destructive" className="ml-1">{actionLeads.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {actionLeads.map((lead) => (
                    <div key={lead.id} className="flex items-center justify-between p-3 rounded-lg bg-orange-500/5 border border-orange-500/20">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm">{lead.name}</span>
                          <Badge variant="outline" className="text-xs">{lead.budget}</Badge>
                          <Badge className="bg-orange-500/20 text-orange-600 border-0 text-xs">{lead.reason}</Badge>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>Q: {lead.qualityScore}</span><span>I: {lead.intentScore}</span><span>{lead.timeline}</span>
                        </div>
                      </div>
                      <div className="flex gap-1.5">
                        <Button size="sm" variant="default" onClick={() => handleAction('call', lead)}><Phone className="h-3.5 w-3.5" /></Button>
                        <Button size="sm" variant="outline" onClick={() => handleAction('whatsapp', lead)}><MessageCircle className="h-3.5 w-3.5" /></Button>
                        <Button size="sm" variant="outline" onClick={() => handleAction('booking', lead)}><Calendar className="h-3.5 w-3.5" /></Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Campaign Alerts */}
            {campaignAlerts.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-500" />Campaign Alerts
                    <Badge variant="secondary" className="ml-1 bg-amber-500/20 text-amber-600">{campaignAlerts.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {campaignAlerts.map((alert) => (
                    <div key={alert.id} className="flex items-center justify-between p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{alert.name}</span>
                          <span className="text-destructive font-medium text-sm">CPL: {alert.currentValue}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{alert.recommendation} {alert.savings && <span className="text-green-500">Save {alert.savings}</span>}</p>
                      </div>
                      <div className="flex gap-1.5">
                        <Button size="sm" onClick={() => handleCampaignAction('apply', alert)} className="bg-green-600 hover:bg-green-700"><CheckCircle className="h-3.5 w-3.5 mr-1" />Apply</Button>
                        <Button size="sm" variant="outline" onClick={() => handleCampaignAction('view', alert)}><Eye className="h-3.5 w-3.5" /></Button>
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
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
          size="icon"
        >
          <Bot className="h-6 w-6" />
        </Button>
      ) : (
        <Card className={`fixed bottom-6 right-6 z-50 shadow-2xl transition-all ${chatMinimized ? 'w-72 h-14' : 'w-96 h-[500px]'}`}>
          <CardHeader className="pb-2 border-b flex flex-row items-center justify-between py-3 px-4">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Bot className="h-4 w-4 text-primary" />AI Assistant
            </CardTitle>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setChatMinimized(!chatMinimized)}>
                {chatMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setChatOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          {!chatMinimized && (
            <>
              <ScrollArea className="flex-1 p-4 h-[360px]" ref={scrollRef}>
                {messages.length === 0 ? (
                  <div className="space-y-3">
                    <p className="text-xs text-muted-foreground text-center mb-4">Ask me anything about your data</p>
                    <div className="space-y-2">
                      {["Best performing campaign?", "Show hot leads", "How to reduce CPL?", "Daily summary"].map((q, i) => (
                        <Button key={i} variant="outline" size="sm" className="w-full text-xs h-auto py-2 justify-start" onClick={() => setQuery(q)} disabled={!hasData}>{q}</Button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {messages.map((m, i) => (
                      <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                          <p className="whitespace-pre-wrap">{m.content}</p>
                        </div>
                      </div>
                    ))}
                    {isLoading && <div className="flex justify-start"><div className="bg-muted rounded-lg px-3 py-2 flex items-center gap-2"><Loader2 className="h-3.5 w-3.5 animate-spin" /><span className="text-sm">Thinking...</span></div></div>}
                  </div>
                )}
              </ScrollArea>
              <div className="p-3 border-t">
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <Textarea placeholder={hasData ? "Ask anything..." : "Upload data first..."} value={query} onChange={(e) => setQuery(e.target.value)} className="min-h-[40px] max-h-[60px] resize-none text-sm" disabled={!hasData} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e); }}} />
                  <Button type="submit" size="icon" disabled={isLoading || !query.trim() || !hasData}>{isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}</Button>
                </form>
                {error && <p className="text-xs text-destructive mt-2 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{error}</p>}
              </div>
            </>
          )}
        </Card>
      )}
    </div>
  );
}
