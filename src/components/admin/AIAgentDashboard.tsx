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
  Clock,
  PoundSterling,
  CheckCircle,
  Upload,
  TrendingUp,
  Users,
  MessageSquare,
  Phone,
  Calendar,
  MessageCircle,
  Eye,
  X,
  ArrowUp,
  Target,
  Database,
  Lightbulb,
  BarChart3,
  Bot
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
  switch (userType) {
    case 'developer':
      return {
        assetLabel: 'Development',
        primaryAction: 'Book Viewing',
        primaryActionIcon: Calendar,
        leadsPath: '/developer/leads',
        campaignsPath: '/developer/campaigns',
        performanceMetrics: {
          col1: { label: 'Buyers', icon: Users },
          col2: { label: 'Viewings', icon: Calendar },
          col3: { label: 'Reservations', icon: CheckCircle },
          col4: { label: 'Pipeline', icon: PoundSterling },
        }
      };
    case 'agent':
      return {
        assetLabel: 'Property',
        primaryAction: 'Book Viewing',
        primaryActionIcon: Calendar,
        leadsPath: '/agent/leads',
        campaignsPath: '/agent/campaigns',
        performanceMetrics: {
          col1: { label: 'Leads', icon: Users },
          col2: { label: 'Viewings', icon: Calendar },
          col3: { label: 'Offers', icon: Target },
          col4: { label: 'Pipeline', icon: PoundSterling },
        }
      };
    case 'broker':
      return {
        assetLabel: 'Product',
        primaryAction: 'Book Consultation',
        primaryActionIcon: Calendar,
        leadsPath: '/broker/leads',
        campaignsPath: '/broker/campaigns',
        performanceMetrics: {
          col1: { label: 'Clients', icon: Users },
          col2: { label: 'Consultations', icon: Calendar },
          col3: { label: 'Applications', icon: CheckCircle },
          col4: { label: 'Loan Value', icon: PoundSterling },
        }
      };
    default:
      return {
        assetLabel: 'Development',
        primaryAction: 'Book Viewing',
        primaryActionIcon: Calendar,
        leadsPath: '/admin/leads',
        campaignsPath: '/admin/campaigns',
        performanceMetrics: {
          col1: { label: 'Leads', icon: Users },
          col2: { label: 'Viewings', icon: Calendar },
          col3: { label: 'Offers', icon: Target },
          col4: { label: 'Pipeline', icon: PoundSterling },
        }
      };
  }
};

export function AIAgentDashboard({ userType = 'admin' }: AIAgentDashboardProps) {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadType, setUploadType] = useState<'campaigns' | 'leads'>('campaigns');
  const [aiRecommendations, setAiRecommendations] = useState<string[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
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

  // Auto-scroll chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Fetch AI recommendations when data changes
  useEffect(() => {
    if (leadData.length > 0 || campaignData.length > 0) {
      fetchRecommendations();
    }
  }, [leadData.length, campaignData.length]);

  const fetchRecommendations = async () => {
    setLoadingRecommendations(true);
    try {
      const response = await askAgent(
        "Give me 3 brief, actionable recommendations based on the current data. Format as short bullet points.",
        buildContext()
      );
      if (response?.response) {
        const recs = response.response
          .split('\n')
          .filter(line => line.trim().startsWith('-') || line.trim().startsWith('•') || line.trim().match(/^\d+\./))
          .map(line => line.replace(/^[-•\d.]+\s*/, '').trim())
          .filter(line => line.length > 0)
          .slice(0, 3);
        setAiRecommendations(recs.length > 0 ? recs : [response.response.slice(0, 150)]);
      }
    } catch (err) {
      console.error('Failed to fetch recommendations:', err);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const buildContext = (): MasterAgentContext => {
    const context: MasterAgentContext = {};
    if (leadData?.length > 0) context.leads = leadData;
    if (campaignData?.length > 0) context.campaigns = campaignData;
    return context;
  };

  // Extract hot leads
  const actionLeads: ActionLead[] = React.useMemo(() => {
    if (leadData.length === 0) return [];
    return leadData
      .map((lead, idx) => {
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
          development: lead['Source Campaign'] || lead['Development'] || 'General Enquiry',
          budget: lead['Budget Range'] || lead.budget || 'Not specified',
          qualityScore,
          intentScore,
          timeline: lead['Timeline to Purchase'] || lead.timeline || 'Not specified',
          email: lead.Email || lead.email || '',
          phone: lead['Phone Number'] || lead.phone || '',
          reason: classification === 'hot' ? 'Viewing ready' : 
                  classification === 'star' ? 'High quality' :
                  classification === 'lightning' ? 'High intent' : 'Needs attention',
          classification
        };
      })
      .filter(lead => ['hot', 'star', 'lightning'].includes((lead as any).classification))
      .slice(0, 4);
  }, [leadData]);

  // Extract campaign alerts
  const campaignAlerts: CampaignAlert[] = React.useMemo(() => {
    if (campaignData.length === 0) return [];
    return campaignData
      .map((campaign, idx) => {
        const spend = parseFloat(campaign['Amount spent (GBP)'] || campaign.spend || 0);
        const results = parseFloat(campaign.Results || campaign.results || 1);
        const cpl = spend / Math.max(results, 1);
        const name = campaign['Campaign name'] || campaign.name || `Campaign ${idx + 1}`;
        if (cpl > 50) {
          return {
            id: `alert_${idx}`,
            name,
            issue: 'CPL above target',
            currentValue: `£${Math.round(cpl)}`,
            targetValue: '£35',
            recommendation: `Pause and reallocate budget`,
            savings: `£${Math.round(spend * 0.3)}`
          };
        }
        return null;
      })
      .filter(Boolean)
      .slice(0, 2) as CampaignAlert[];
  }, [campaignData]);

  // Weekly performance
  const weeklyPerformance = React.useMemo(() => {
    const totalLeads = leadData.length;
    const hotLeads = leadData.filter(l => parseInt(l.Score || l.score || '0') >= 70).length;
    const viewings = leadData.filter(l => (l.Status || l.status || '').toLowerCase().includes('viewing')).length;
    const offers = leadData.filter(l => (l.Status || l.status || '').toLowerCase().includes('offer')).length;
    const pipelineValue = leadData.reduce((acc, lead) => {
      const budget = lead['Budget Range'] || lead.budget || '';
      const match = budget.match(/[\d,]+/g);
      if (match) {
        const value = parseInt(match[0].replace(/,/g, ''));
        return acc + (isNaN(value) ? 0 : value);
      }
      return acc;
    }, 0);
    return {
      leads: { value: totalLeads, change: Math.floor(totalLeads * 0.25) },
      viewings: { value: viewings, change: Math.floor(viewings * 0.4) },
      offers: { value: offers, change: Math.floor(offers * 0.5) },
      pipeline: { value: pipelineValue, change: Math.floor(pipelineValue * 0.15) }
    };
  }, [leadData]);

  const handleAction = (action: string, lead: ActionLead) => {
    switch (action) {
      case 'call':
        if (lead.phone) window.open(`tel:${lead.phone}`, '_blank');
        toast.success(`Calling ${lead.name}...`);
        break;
      case 'whatsapp':
        if (lead.phone) window.open(`https://wa.me/${lead.phone.replace(/\D/g, '')}`, '_blank');
        toast.success(`Opening WhatsApp for ${lead.name}`);
        break;
      case 'booking':
        toast.success(`${roleConfig.primaryAction} for ${lead.name}`);
        break;
    }
  };

  const handleCampaignAction = (action: string, alert: CampaignAlert) => {
    if (action === 'apply') toast.success(`Applied recommendation for ${alert.name}`);
    else if (action === 'view') navigate(roleConfig.campaignsPath);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;
    const userMessage: Message = { role: 'user', content: query, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setQuery('');
    const response = await askAgent(query, buildContext());
    if (response) {
      setMessages(prev => [...prev, { role: 'agent', content: response.response, timestamp: new Date() }]);
    }
  };

  const handleQuickQuestion = (question: string) => {
    setQuery(question);
  };

  const handleUpload = (type: 'campaigns' | 'leads') => {
    setUploadType(type);
    setUploadDialogOpen(true);
  };

  const handleCampaignData = async (data: any[], fileName: string) => {
    setCampaignData(data);
    setCampaignFileName(fileName);
    setUploadDialogOpen(false);
    toast.success(`Loaded ${data.length} campaigns`);
  };

  const handleLeadData = async (data: any[], fileName: string) => {
    setLeadData(data);
    setLeadFileName(fileName);
    setUploadDialogOpen(false);
    toast.success(`Loaded ${data.length} leads`);
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `£${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `£${(value / 1000).toFixed(0)}K`;
    return `£${value}`;
  };

  const [loadingDemo, setLoadingDemo] = useState(false);

  const loadDemoData = async () => {
    setLoadingDemo(true);
    try {
      const campaignResponse = await fetch('/sample-data/sample-campaigns.csv');
      const campaignText = await campaignResponse.text();
      const campaignResult = Papa.parse(campaignText, { header: true, skipEmptyLines: true });
      const leadsResponse = await fetch('/sample-data/sample-leads.csv');
      const leadsText = await leadsResponse.text();
      const leadsResult = Papa.parse(leadsText, { header: true, skipEmptyLines: true });
      if (campaignResult.data.length > 0) {
        setCampaignData(campaignResult.data);
        setCampaignFileName('sample-campaigns.csv');
      }
      if (leadsResult.data.length > 0) {
        setLeadData(leadsResult.data);
        setLeadFileName('sample-leads.csv');
      }
      toast.success(`Loaded ${campaignResult.data.length} campaigns and ${leadsResult.data.length} leads`);
    } catch (error) {
      toast.error('Failed to load demo data');
    } finally {
      setLoadingDemo(false);
    }
  };

  const hasData = leadData.length > 0 || campaignData.length > 0;

  return (
    <div className="flex gap-6 h-full">
      {/* Main Dashboard Content */}
      <div className="flex-1 space-y-6 overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{greeting}, {userName}</h1>
            <p className="text-muted-foreground">{dateString}</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={uploadDialogOpen && uploadType === 'campaigns'} onOpenChange={(open) => { if (!open) setUploadDialogOpen(false); }}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" onClick={() => handleUpload('campaigns')}>
                  <Upload className="h-3.5 w-3.5 mr-1.5" />
                  Campaigns
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Upload Campaign Data</DialogTitle></DialogHeader>
                <UploadZone label="Campaign CSV" description="Upload your Meta Ads or campaign export CSV" onDataParsed={handleCampaignData} isUploaded={false} onClear={() => {}} />
              </DialogContent>
            </Dialog>
            <Dialog open={uploadDialogOpen && uploadType === 'leads'} onOpenChange={(open) => { if (!open) setUploadDialogOpen(false); }}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" onClick={() => handleUpload('leads')}>
                  <Upload className="h-3.5 w-3.5 mr-1.5" />
                  Leads
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Upload Lead Data</DialogTitle></DialogHeader>
                <UploadZone label="Lead CSV" description="Upload your lead export CSV" onDataParsed={handleLeadData} isUploaded={false} onClear={() => {}} />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {!hasData ? (
          /* Empty State */
          <Card className="p-12 text-center border-dashed">
            <Brain className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">Upload your data to get started</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Upload campaign and lead CSVs to see actionable insights and AI-powered recommendations.
            </p>
            <div className="flex flex-col gap-4 items-center">
              <div className="flex gap-3 justify-center">
                <Button onClick={() => handleUpload('campaigns')}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Campaigns
                </Button>
                <Button variant="outline" onClick={() => handleUpload('leads')}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Leads
                </Button>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="h-px w-12 bg-border" />
                <span className="text-sm">or</span>
                <div className="h-px w-12 bg-border" />
              </div>
              <Button variant="secondary" onClick={loadDemoData} disabled={loadingDemo}>
                {loadingDemo ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Database className="h-4 w-4 mr-2" />}
                Load Demo Data
              </Button>
            </div>
          </Card>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">{roleConfig.performanceMetrics.col1.label}</span>
                  <roleConfig.performanceMetrics.col1.icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">{weeklyPerformance.leads.value}</span>
                  {weeklyPerformance.leads.change > 0 && (
                    <Badge variant="outline" className="text-green-500 border-green-500/30 bg-green-500/10 text-xs">
                      <ArrowUp className="h-3 w-3 mr-0.5" />+{weeklyPerformance.leads.change}
                    </Badge>
                  )}
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">{roleConfig.performanceMetrics.col2.label}</span>
                  <roleConfig.performanceMetrics.col2.icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">{weeklyPerformance.viewings.value}</span>
                  {weeklyPerformance.viewings.change > 0 && (
                    <Badge variant="outline" className="text-green-500 border-green-500/30 bg-green-500/10 text-xs">
                      <ArrowUp className="h-3 w-3 mr-0.5" />+{weeklyPerformance.viewings.change}
                    </Badge>
                  )}
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">{roleConfig.performanceMetrics.col3.label}</span>
                  <roleConfig.performanceMetrics.col3.icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">{weeklyPerformance.offers.value}</span>
                  {weeklyPerformance.offers.change > 0 && (
                    <Badge variant="outline" className="text-green-500 border-green-500/30 bg-green-500/10 text-xs">
                      <ArrowUp className="h-3 w-3 mr-0.5" />+{weeklyPerformance.offers.change}
                    </Badge>
                  )}
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">{roleConfig.performanceMetrics.col4.label}</span>
                  <roleConfig.performanceMetrics.col4.icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">{formatCurrency(weeklyPerformance.pipeline.value)}</span>
                </div>
              </Card>
            </div>

            {/* AI Recommendations */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-yellow-500" />
                  AI Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingRecommendations ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Analysing your data...</span>
                  </div>
                ) : aiRecommendations.length > 0 ? (
                  <ul className="space-y-2">
                    {aiRecommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No recommendations yet. Upload more data for insights.</p>
                )}
              </CardContent>
            </Card>

            {/* Action Required - Hot Leads */}
            {actionLeads.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Flame className="h-4 w-4 text-orange-500" />
                    Action Required
                    <Badge variant="destructive" className="ml-1">{actionLeads.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {actionLeads.map((lead) => (
                    <div key={lead.id} className="flex items-center justify-between p-3 rounded-lg bg-orange-500/5 border border-orange-500/20">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{lead.name}</span>
                          <Badge variant="outline" className="text-xs">{lead.budget}</Badge>
                          <Badge className="bg-orange-500/20 text-orange-600 border-0 text-xs">{lead.reason}</Badge>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>Quality: {lead.qualityScore}</span>
                          <span>Intent: {lead.intentScore}</span>
                        </div>
                      </div>
                      <div className="flex gap-1.5">
                        <Button size="sm" variant="default" onClick={() => handleAction('call', lead)}>
                          <Phone className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleAction('whatsapp', lead)}>
                          <MessageCircle className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleAction('booking', lead)}>
                          <Calendar className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Campaign Alerts */}
            {campaignAlerts.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    Campaign Alerts
                    <Badge variant="secondary" className="ml-1 bg-amber-500/20 text-amber-600">{campaignAlerts.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {campaignAlerts.map((alert) => (
                    <div key={alert.id} className="flex items-center justify-between p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{alert.name}</span>
                          <span className="text-destructive font-medium text-sm">CPL: {alert.currentValue}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {alert.recommendation} {alert.savings && <span className="text-green-500">Save {alert.savings}</span>}
                        </p>
                      </div>
                      <div className="flex gap-1.5">
                        <Button size="sm" onClick={() => handleCampaignAction('apply', alert)} className="bg-green-600 hover:bg-green-700">
                          <CheckCircle className="h-3.5 w-3.5 mr-1" />
                          Apply
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleCampaignAction('view', alert)}>
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>

      {/* AI Chatbot Sidebar */}
      <div className="w-80 shrink-0 hidden lg:block">
        <Card className="h-full flex flex-col sticky top-0">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-base flex items-center gap-2">
              <Bot className="h-4 w-4 text-primary" />
              AI Assistant
            </CardTitle>
          </CardHeader>
          
          {/* Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            {messages.length === 0 ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground text-center mb-4">
                  Ask me anything about your campaigns and leads
                </p>
                <div className="space-y-2">
                  {[
                    "What's my best performing campaign?",
                    "Show hot leads to contact",
                    "How can I reduce CPL?",
                    "Give me a daily summary"
                  ].map((q, i) => (
                    <Button
                      key={i}
                      variant="outline"
                      size="sm"
                      className="w-full text-xs h-auto py-2 px-3 justify-start text-left"
                      onClick={() => handleQuickQuestion(q)}
                      disabled={!hasData}
                    >
                      {q}
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((message, i) => (
                  <div
                    key={i}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[90%] rounded-lg px-3 py-2 text-sm ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg px-3 py-2 flex items-center gap-2">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span className="text-sm">Thinking...</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Textarea
                placeholder={hasData ? "Ask anything..." : "Upload data first..."}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="min-h-[40px] max-h-[80px] resize-none text-sm"
                disabled={!hasData}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
              <Button type="submit" size="icon" disabled={isLoading || !query.trim() || !hasData}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </form>
            {error && (
              <p className="text-xs text-destructive mt-2 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {error}
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
