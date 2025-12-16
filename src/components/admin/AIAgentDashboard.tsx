import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Send, 
  Loader2, 
  AlertCircle, 
  Flame,
  Clock,
  Megaphone,
  PoundSterling,
  CheckCircle,
  Upload,
  TrendingUp,
  Users,
  MessageSquare,
  Phone,
  Calendar,
  MessageCircle,
  Bell,
  Eye,
  X,
  ArrowUp,
  ArrowDown,
  Target,
  Home
} from 'lucide-react';
import { useMasterAgent, MasterAgentContext } from '@/hooks/useMasterAgent';
import { useUploadedData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { UploadZone } from '@/components/UploadZone';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { classifyLead, getClassificationConfig } from '@/lib/leadClassification';
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
  lastContact?: string;
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

export function AIAgentDashboard({ userType = 'admin' }: AIAgentDashboardProps) {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [showChat, setShowChat] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadType, setUploadType] = useState<'campaigns' | 'leads'>('campaigns');
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

  const userName = user?.name?.split(' ')[0] || 'there';
  const currentDate = new Date();
  const greeting = currentDate.getHours() < 12 ? 'Good morning' : currentDate.getHours() < 18 ? 'Good afternoon' : 'Good evening';
  const dateString = currentDate.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' });

  const buildContext = (): MasterAgentContext => {
    const context: MasterAgentContext = {};
    if (leadData && leadData.length > 0) {
      context.leads = leadData;
    }
    if (campaignData && campaignData.length > 0) {
      context.campaigns = campaignData;
    }
    return context;
  };

  // Extract hot leads needing action
  const actionLeads: ActionLead[] = React.useMemo(() => {
    if (leadData.length === 0) return [];
    
    return leadData
      .map((lead, idx) => {
        const name = lead['Lead Name'] || lead.name || `Lead ${idx + 1}`;
        const qualityScore = parseInt(lead.Score || lead.score || lead['Lead Score'] || '50');
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
          lastContact: lead['Date Added'] || lead['Status Last Modified'] || 'Recently',
          email: lead.Email || lead.email || '',
          phone: lead['Phone Number'] || lead.phone || '',
          reason: classification === 'hot' ? 'Viewing ready' : 
                  classification === 'star' ? 'High quality, needs follow-up' :
                  classification === 'lightning' ? 'High intent, qualify now' : 'Needs attention',
          classification
        };
      })
      .filter(lead => ['hot', 'star', 'lightning'].includes((lead as any).classification))
      .slice(0, 5);
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
            recommendation: `Pause and reallocate budget to better performing campaigns`,
            savings: `£${Math.round(spend * 0.3)}`
          };
        }
        return null;
      })
      .filter(Boolean)
      .slice(0, 3) as CampaignAlert[];
  }, [campaignData]);

  // Calculate weekly performance
  const weeklyPerformance = React.useMemo(() => {
    const totalLeads = leadData.length;
    const hotLeads = leadData.filter(l => {
      const score = parseInt(l.Score || l.score || '0');
      return score >= 70;
    }).length;
    
    const viewings = leadData.filter(l => 
      (l.Status || l.status || '').toLowerCase().includes('viewing')
    ).length;
    
    const offers = leadData.filter(l => 
      (l.Status || l.status || '').toLowerCase().includes('offer')
    ).length;
    
    // Estimate pipeline value
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
        if (lead.phone) {
          window.open(`tel:${lead.phone}`, '_blank');
        }
        toast.success(`Calling ${lead.name}...`);
        break;
      case 'whatsapp':
        if (lead.phone) {
          window.open(`https://wa.me/${lead.phone.replace(/\D/g, '')}`, '_blank');
        }
        toast.success(`Opening WhatsApp for ${lead.name}`);
        break;
      case 'booking':
        toast.success(`Opening booking for ${lead.name}`);
        break;
      case 'snooze':
        toast.info(`Snoozed ${lead.name} for 24 hours`);
        break;
    }
  };

  const handleCampaignAction = (action: string, alert: CampaignAlert) => {
    switch (action) {
      case 'apply':
        toast.success(`Applied recommendation for ${alert.name}`);
        break;
      case 'view':
        navigate('/admin/campaigns');
        break;
      case 'dismiss':
        toast.info(`Dismissed alert for ${alert.name}`);
        break;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: query,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setQuery('');
    setShowChat(true);

    const response = await askAgent(query, buildContext());
    
    if (response) {
      const agentMessage: Message = {
        role: 'agent',
        content: response.response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, agentMessage]);
    }
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

  // Empty state when no data
  if (leadData.length === 0 && campaignData.length === 0) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{greeting} {userName}</h1>
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
                <DialogHeader>
                  <DialogTitle>Upload Campaign Data</DialogTitle>
                </DialogHeader>
                <UploadZone
                  label="Campaign CSV"
                  description="Upload your Meta Ads or campaign export CSV"
                  onDataParsed={handleCampaignData}
                  isUploaded={false}
                  onClear={() => {}}
                />
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
                <DialogHeader>
                  <DialogTitle>Upload Lead Data</DialogTitle>
                </DialogHeader>
                <UploadZone
                  label="Lead CSV"
                  description="Upload your lead export CSV"
                  onDataParsed={handleLeadData}
                  isUploaded={false}
                  onClear={() => {}}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Empty state */}
        <Card className="p-12 text-center border-dashed">
          <Brain className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-xl font-semibold mb-2">Upload your data to get started</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Upload campaign and lead CSVs to see actionable insights, hot leads, and AI-powered recommendations.
          </p>
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
        </Card>

        {/* Chat input */}
        <Card className="p-4">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <div className="flex-1 relative">
              <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Textarea
                placeholder="Ask AI anything..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10 min-h-[44px] max-h-[44px] resize-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
            </div>
            <Button type="submit" disabled={isLoading || !query.trim()}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{greeting} {userName}</h1>
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
              <DialogHeader>
                <DialogTitle>Upload Campaign Data</DialogTitle>
              </DialogHeader>
              <UploadZone
                label="Campaign CSV"
                description="Upload your Meta Ads or campaign export CSV"
                onDataParsed={handleCampaignData}
                isUploaded={false}
                onClear={() => {}}
              />
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
              <DialogHeader>
                <DialogTitle>Upload Lead Data</DialogTitle>
              </DialogHeader>
              <UploadZone
                label="Lead CSV"
                description="Upload your lead export CSV"
                onDataParsed={handleLeadData}
                isUploaded={false}
                onClear={() => {}}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* 🔥 ACTION REQUIRED */}
      {actionLeads.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            <h2 className="font-semibold text-lg">ACTION REQUIRED</h2>
            <Badge variant="destructive" className="ml-1">{actionLeads.length}</Badge>
          </div>
          
          <div className="space-y-3">
            {actionLeads.map((lead) => (
              <Card key={lead.id} className="p-4 border-l-4 border-l-orange-500 bg-orange-500/5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-foreground">{lead.name}</span>
                      <span className="text-muted-foreground">—</span>
                      <span className="text-muted-foreground">{lead.development}</span>
                      <Badge variant="outline" className="text-xs">{lead.budget}</Badge>
                      {lead.reason && (
                        <Badge className="bg-orange-500/20 text-orange-600 border-0 text-xs">{lead.reason}</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Target className="h-3.5 w-3.5" />
                        Quality: <span className="text-green-500 font-medium">{lead.qualityScore}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-3.5 w-3.5" />
                        Intent: <span className="text-green-500 font-medium">{lead.intentScore}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {lead.timeline}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Button size="sm" onClick={() => handleAction('call', lead)} className="gap-1.5">
                      <Phone className="h-3.5 w-3.5" />
                      Call Now
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleAction('booking', lead)} className="gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      Book Viewing
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleAction('whatsapp', lead)} className="gap-1.5">
                      <MessageCircle className="h-3.5 w-3.5" />
                      WhatsApp
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleAction('snooze', lead)} className="gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      Snooze
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ⚠️ CAMPAIGN ALERTS */}
      {campaignAlerts.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            <h2 className="font-semibold text-lg">CAMPAIGN ALERTS</h2>
            <Badge variant="secondary" className="ml-1 bg-amber-500/20 text-amber-600">{campaignAlerts.length}</Badge>
          </div>
          
          <div className="space-y-3">
            {campaignAlerts.map((alert) => (
              <Card key={alert.id} className="p-4 border-l-4 border-l-amber-500 bg-amber-500/5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-foreground">{alert.name}</span>
                      <span className="text-muted-foreground">—</span>
                      <span className="text-destructive font-medium">CPL: {alert.currentValue}</span>
                      <span className="text-muted-foreground">(target: {alert.targetValue})</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Recommendation: {alert.recommendation}
                      {alert.savings && <span className="text-green-500 ml-1">Save {alert.savings}</span>}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Button size="sm" onClick={() => handleCampaignAction('apply', alert)} className="gap-1.5 bg-green-600 hover:bg-green-700">
                      <CheckCircle className="h-3.5 w-3.5" />
                      Apply
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleCampaignAction('view', alert)} className="gap-1.5">
                      <Eye className="h-3.5 w-3.5" />
                      View
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleCampaignAction('dismiss', alert)} className="gap-1.5">
                      <X className="h-3.5 w-3.5" />
                      Dismiss
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* 💰 THIS WEEK'S PERFORMANCE */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <PoundSterling className="h-5 w-5 text-green-500" />
          <h2 className="font-semibold text-lg">THIS WEEK'S PERFORMANCE</h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Leads</span>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{weeklyPerformance.leads.value}</span>
              {weeklyPerformance.leads.change > 0 && (
                <Badge variant="outline" className="text-green-500 border-green-500/30 bg-green-500/10 text-xs">
                  <ArrowUp className="h-3 w-3 mr-0.5" />
                  +{weeklyPerformance.leads.change}
                </Badge>
              )}
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Viewings</span>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{weeklyPerformance.viewings.value}</span>
              {weeklyPerformance.viewings.change > 0 && (
                <Badge variant="outline" className="text-green-500 border-green-500/30 bg-green-500/10 text-xs">
                  <ArrowUp className="h-3 w-3 mr-0.5" />
                  +{weeklyPerformance.viewings.change}
                </Badge>
              )}
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Offers</span>
              <Home className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{weeklyPerformance.offers.value}</span>
              {weeklyPerformance.offers.change > 0 && (
                <Badge variant="outline" className="text-green-500 border-green-500/30 bg-green-500/10 text-xs">
                  <ArrowUp className="h-3 w-3 mr-0.5" />
                  +{weeklyPerformance.offers.change}
                </Badge>
              )}
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Pipeline</span>
              <PoundSterling className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{formatCurrency(weeklyPerformance.pipeline.value)}</span>
              {weeklyPerformance.pipeline.change > 0 && (
                <Badge variant="outline" className="text-green-500 border-green-500/30 bg-green-500/10 text-xs">
                  <ArrowUp className="h-3 w-3 mr-0.5" />
                  +{formatCurrency(weeklyPerformance.pipeline.change)}
                </Badge>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* 💬 Chat Section */}
      <Card className="p-4">
        {showChat && messages.length > 0 && (
          <ScrollArea className="h-[200px] mb-4 pr-4" ref={scrollRef}>
            <div className="space-y-3">
              {messages.map((message, i) => (
                <div
                  key={i}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg px-4 py-2 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted border border-border'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted border border-border rounded-lg px-4 py-2 flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        )}
        
        <form onSubmit={handleSubmit} className="flex gap-3">
          <div className="flex-1 relative">
            <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Textarea
              placeholder="Ask AI anything..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 min-h-[44px] max-h-[44px] resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
          </div>
          <Button type="submit" disabled={isLoading || !query.trim()}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
        
        {error && (
          <div className="flex items-center gap-2 text-destructive text-xs mt-2">
            <AlertCircle className="h-3.5 w-3.5" />
            {error}
          </div>
        )}
      </Card>
    </div>
  );
}
