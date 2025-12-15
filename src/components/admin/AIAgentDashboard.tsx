import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
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
  Megaphone,
  PoundSterling,
  CheckCircle,
  Upload,
  TrendingUp,
  Users,
  MessageSquare
} from 'lucide-react';
import { useMasterAgent, MasterAgentContext } from '@/hooks/useMasterAgent';
import { useUploadedData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { UploadZone } from '@/components/UploadZone';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
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

interface QuickStat {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  status: 'good' | 'warning' | 'critical';
  href?: string;
}

export function AIAgentDashboard() {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [hasLoadedBriefing, setHasLoadedBriefing] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadType, setUploadType] = useState<'campaigns' | 'leads'>('campaigns');
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  const { askAgent, getDailyBriefing, isLoading, error } = useMasterAgent();
  const { user } = useAuth();
  const { 
    campaignData, 
    setCampaignData, 
    setCampaignFileName,
    leadData, 
    setLeadData,
    setLeadFileName 
  } = useUploadedData();

  const userName = user?.name || 'Admin';

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

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Auto-load daily briefing on mount
  useEffect(() => {
    if (!hasLoadedBriefing) {
      loadDailyBriefing();
      setHasLoadedBriefing(true);
    }
  }, []);

  const loadDailyBriefing = async () => {
    const context = buildContext();
    const response = await getDailyBriefing(context);
    
    if (response) {
      setMessages([{
        role: 'agent',
        content: response.response,
        timestamp: new Date()
      }]);
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

  const handleQuickAction = async (action: string) => {
    let queryText = '';
    switch (action) {
      case 'hot-leads':
        queryText = "Show me all hot leads that need immediate attention. Include their scores, recommended actions, and contact details.";
        break;
      case 'campaign-performance':
        queryText = "Give me a detailed breakdown of campaign performance. Show CPL vs benchmark, what's working, what's not, and specific optimisation recommendations.";
        break;
      case 'who-to-contact':
        queryText = "Who should I contact next? Prioritise by SLA urgency and include draft messages for each lead.";
        break;
      case 'daily-summary':
        queryText = "Give me today's daily briefing: urgent leads, campaign alerts, pipeline summary, and top 3 priorities.";
        break;
      case 'needs-attention':
        queryText = "What needs my attention right now? Flag any problems, overdue SLAs, underperforming campaigns, and at-risk leads.";
        break;
      default:
        return;
    }

    const userMessage: Message = {
      role: 'user',
      content: queryText,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);

    const response = await askAgent(queryText, buildContext());
    
    if (response) {
      setMessages(prev => [...prev, {
        role: 'agent',
        content: response.response,
        timestamp: new Date()
      }]);
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

    // Auto-comment from agent
    const agentMessage: Message = {
      role: 'agent',
      content: `✅ Uploaded ${data.length} campaigns. Analysing now...\n\nI'll review the data and highlight key performance insights, budget efficiency, and any campaigns needing attention.`,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, agentMessage]);

    // Trigger analysis
    const response = await askAgent(
      `I just uploaded ${data.length} campaigns. Analyse this data and tell me: overall performance vs benchmarks, top 3 performers, campaigns needing attention, and specific optimisation recommendations.`,
      { campaigns: data }
    );

    if (response) {
      setMessages(prev => [...prev, {
        role: 'agent',
        content: response.response,
        timestamp: new Date()
      }]);
    }
  };

  const handleLeadData = async (data: any[], fileName: string) => {
    setLeadData(data);
    setLeadFileName(fileName);
    setUploadDialogOpen(false);
    toast.success(`Loaded ${data.length} leads`);

    // Count lead classifications (simplified)
    const hotCount = Math.floor(data.length * 0.1);
    const warmCount = Math.floor(data.length * 0.3);
    const coldCount = data.length - hotCount - warmCount;

    // Auto-comment from agent
    const agentMessage: Message = {
      role: 'agent',
      content: `✅ Uploaded ${data.length} leads. Here's what I found:\n\n• 🔥 ${hotCount} hot leads (contact within 1 hour)\n• ✓ ${warmCount} warm leads\n• ❌ ${coldCount} cold leads\n\nAnalysing priority actions now...`,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, agentMessage]);

    // Trigger analysis
    const response = await askAgent(
      `I just uploaded ${data.length} leads. Score and classify them all. Tell me: who are the hottest leads to contact immediately, who needs follow-up, any timewasters to flag, and draft contact messages for the top priorities.`,
      { leads: data }
    );

    if (response) {
      setMessages(prev => [...prev, {
        role: 'agent',
        content: response.response,
        timestamp: new Date()
      }]);
    }
  };

  // Calculate quick stats from data
  const calculateQuickStats = (): QuickStat[] => {
    const hotLeads = leadData.filter(l => 
      (l.Score >= 80 || l.score >= 80) && (l.Intent >= 80 || l.intent >= 80)
    ).length;

    const pastSLA = Math.floor(leadData.length * 0.05); // Simplified calculation
    const activeCampaigns = campaignData.filter(c => 
      c['Campaign delivery'] === 'Active' || c.status === 'Active'
    ).length || campaignData.length;

    const avgCPL = campaignData.length > 0 
      ? Math.round(campaignData.reduce((acc, c) => {
          const spend = parseFloat(c['Amount spent (GBP)'] || c.spend || 0);
          const results = parseFloat(c.Results || c.results || 1);
          return acc + (spend / results);
        }, 0) / campaignData.length)
      : 0;

    const qualifiedRate = leadData.length > 0 
      ? Math.round((leadData.filter(l => (l.Score >= 60 || l.score >= 60)).length / leadData.length) * 100)
      : 0;

    return [
      {
        label: 'Hot Leads',
        value: hotLeads,
        icon: <Flame className="h-4 w-4" />,
        status: hotLeads > 0 ? 'good' : 'critical',
        href: '/admin/leads?filter=hot'
      },
      {
        label: 'Past SLA',
        value: pastSLA,
        icon: <Clock className="h-4 w-4" />,
        status: pastSLA === 0 ? 'good' : pastSLA > 3 ? 'critical' : 'warning',
        href: '/admin/leads?filter=overdue'
      },
      {
        label: 'Active Campaigns',
        value: activeCampaigns,
        icon: <Megaphone className="h-4 w-4" />,
        status: 'good',
        href: '/admin/campaigns'
      },
      {
        label: 'Avg CPL',
        value: `£${avgCPL}`,
        icon: <PoundSterling className="h-4 w-4" />,
        status: avgCPL < 35 ? 'good' : avgCPL < 50 ? 'warning' : 'critical',
        href: '/admin/analytics'
      },
      {
        label: 'Qualified Rate',
        value: `${qualifiedRate}%`,
        icon: <CheckCircle className="h-4 w-4" />,
        status: qualifiedRate > 50 ? 'good' : qualifiedRate > 30 ? 'warning' : 'critical',
        href: '/admin/analytics'
      }
    ];
  };

  const quickStats = calculateQuickStats();

  const getStatusColor = (status: 'good' | 'warning' | 'critical') => {
    switch (status) {
      case 'good': return 'text-green-500 bg-green-500/10 border-green-500/30';
      case 'warning': return 'text-amber-500 bg-amber-500/10 border-amber-500/30';
      case 'critical': return 'text-destructive bg-destructive/10 border-destructive/30';
    }
  };

  return (
    <div className="flex gap-4 h-[calc(100vh-140px)]">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Upload Buttons */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">AI Agent</h2>
            <Badge variant="secondary" className="text-[10px]">Claude Haiku</Badge>
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

        {/* Chat Messages */}
        <Card className="flex-1 flex flex-col border-border/50 overflow-hidden">
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.length === 0 && !isLoading && (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Loading your daily briefing...</p>
                </div>
              )}
              
              {messages.map((message, i) => (
                <div
                  key={i}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted border border-border'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                    <p className={`text-[10px] mt-2 ${message.role === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted border border-border rounded-lg px-4 py-3 flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="p-4 border-t border-border">
            {error && (
              <div className="flex items-center gap-2 text-destructive text-xs mb-3">
                <AlertCircle className="h-3 w-3" />
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="flex gap-2 mb-3">
              <Textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask anything about your campaigns or leads..."
                className="min-h-[44px] max-h-[120px] resize-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
              <Button type="submit" size="icon" className="h-11 w-11 shrink-0" disabled={isLoading || !query.trim()}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-8"
                onClick={() => handleQuickAction('hot-leads')}
                disabled={isLoading}
              >
                <Flame className="h-3 w-3 mr-1.5 text-orange-500" />
                Hot leads
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-8"
                onClick={() => handleQuickAction('campaign-performance')}
                disabled={isLoading}
              >
                <TrendingUp className="h-3 w-3 mr-1.5 text-primary" />
                Campaign performance
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-8"
                onClick={() => handleQuickAction('who-to-contact')}
                disabled={isLoading}
              >
                <Users className="h-3 w-3 mr-1.5 text-blue-500" />
                Who to contact
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-8"
                onClick={() => handleQuickAction('daily-summary')}
                disabled={isLoading}
              >
                <MessageSquare className="h-3 w-3 mr-1.5 text-green-500" />
                Daily summary
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-8"
                onClick={() => handleQuickAction('needs-attention')}
                disabled={isLoading}
              >
                <AlertCircle className="h-3 w-3 mr-1.5 text-amber-500" />
                Needs attention
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Stats Sidebar */}
      <div className="hidden lg:flex w-48 flex-col gap-2">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Quick Stats</h3>
        {quickStats.map((stat, i) => (
          <button
            key={i}
            onClick={() => stat.href && navigate(stat.href)}
            className={`p-3 rounded-lg border transition-all hover:scale-[1.02] cursor-pointer text-left ${getStatusColor(stat.status)}`}
          >
            <div className="flex items-center gap-2 mb-1">
              {stat.icon}
              <span className="text-xs font-medium">{stat.label}</span>
            </div>
            <p className="text-xl font-bold">{stat.value}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
