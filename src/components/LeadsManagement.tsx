import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  User, Mail, Phone, MapPin, TrendingUp, Target, Calendar, 
  DollarSign, Home, MessageSquare, Search, Download, X, Upload,
  Building2, Clock, Sparkles, Lightbulb, CreditCard, Timer, Filter,
  Flame, Star, Zap, CheckCircle, AlertCircle, Snowflake, ChevronDown,
  ChevronRight, ArrowRight, Eye, MessageCircle
} from "lucide-react";
import { useState, useMemo } from "react";
import { AIRecommendation, PaymentMethod, BuyerStatus, PurchaseTimeline, LeadSource, LEAD_SOURCES, LEAD_CLASSIFICATIONS } from "@/lib/types";
import { LeadClassificationBadge, LeadSourceBadge } from "@/components/LeadClassificationBadge";
import { classifyLead, getClassificationConfig } from "@/lib/leadClassification";
import { useUploadedData } from "@/contexts/DataContext";
import { formatBudget } from "@/lib/utils";
import { toast } from "sonner";

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  budget: string;
  bedrooms: string;
  paymentMethod: PaymentMethod;
  buyerStatus: BuyerStatus;
  purchaseTimeline: PurchaseTimeline;
  intentScore: number;
  qualityScore: number;
  status: "new" | "engaged" | "viewing" | "offer" | "closed";
  source: LeadSource;
  sourceDetail?: string;
  lastActivity: string;
  assignedAgent: string | null;
  matchedUnits: string[];
  timeline: {
    date: string;
    action: string;
    detail: string;
  }[];
  notes: string;
  aiRecommendations: AIRecommendation[];
}

interface LeadsManagementProps {
  userType?: 'developer' | 'agent' | 'broker' | 'admin';
}

// Role-specific configuration
const getRoleConfig = (userType: string) => {
  switch (userType) {
    case 'developer':
      return {
        leadLabel: 'Buyer',
        leadLabelPlural: 'Buyers',
        primaryAction: 'Book Viewing',
        primaryActionIcon: Calendar,
        assetLabel: 'Development',
      };
    case 'agent':
      return {
        leadLabel: 'Buyer',
        leadLabelPlural: 'Buyers',
        primaryAction: 'Book Viewing',
        primaryActionIcon: Calendar,
        assetLabel: 'Property',
      };
    case 'broker':
      return {
        leadLabel: 'Client',
        leadLabelPlural: 'Clients',
        primaryAction: 'Book Consultation',
        primaryActionIcon: Calendar,
        assetLabel: 'Product',
      };
    default:
      return {
        leadLabel: 'Lead',
        leadLabelPlural: 'Leads',
        primaryAction: 'Book Viewing',
        primaryActionIcon: Calendar,
        assetLabel: 'Development',
      };
  }
};

const LeadsManagement = ({ userType = 'admin' }: LeadsManagementProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [warmExpanded, setWarmExpanded] = useState(false);
  const [coldExpanded, setColdExpanded] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { leadData } = useUploadedData(userType);

  const roleConfig = getRoleConfig(userType);

  // Convert uploaded lead data to Lead format
  const allLeads = useMemo(() => {
    if (leadData.length === 0) return [];
    
    return leadData.map((row, index) => {
      const name = row['Lead Name'] || row.name || row.Name || row.full_name || 
        `${row.first_name || row['First Name'] || ''} ${row.last_name || row['Last Name'] || ''}`.trim() || 
        `Lead ${index + 1}`;
      
      const email = row.Email || row.email || row['Email Address'] || '';
      const phone = row['Phone Number'] || row.phone || row.Phone || row.Mobile || row.telephone || '';
      const country = row.Country || row.country || row.Location || row.location || row.Region || '';
      const budget = row['Budget Range'] || row.budget || row.Budget || row['Budget'] || '';
      const bedrooms = row['Preferred Bedrooms'] || row.bedrooms || row.Bedrooms || '';
      
      const rawScore = row.Score || row.score || row['Lead Score'] || row.intent_score || '50';
      const scoreNum = parseInt(String(rawScore).replace(/[^0-9]/g, ''), 10) || 50;
      const intentText = (row.Intent || row.intent || '').toString().toLowerCase().trim();
      let intentScore = scoreNum;
      if (intentText === 'low') intentScore = Math.min(scoreNum, 35);
      else if (intentText === 'warm') intentScore = Math.max(scoreNum, 40);
      else if (intentText === 'high' || intentText === 'hot') intentScore = Math.max(scoreNum, 70);

      const rawStatus = (row.Status || row.status || 'new').toString().toLowerCase();
      let mappedStatus: Lead['status'] = 'new';
      if (rawStatus.includes('pending')) mappedStatus = 'new';
      else if (rawStatus.includes('progress') || rawStatus.includes('contacted')) mappedStatus = 'engaged';
      else if (rawStatus.includes('viewing')) mappedStatus = 'viewing';
      else if (rawStatus.includes('offer')) mappedStatus = 'offer';
      else if (rawStatus.includes('closed') || rawStatus.includes('won')) mappedStatus = 'closed';

      const paymentRaw = (row['Cash/Mortgage'] || row.payment_method || row.paymentMethod || 'undecided').toString().toLowerCase();
      let paymentMethod: PaymentMethod = 'undecided';
      if (paymentRaw.includes('cash')) paymentMethod = 'cash';
      else if (paymentRaw.includes('mortgage')) paymentMethod = 'mortgage';

      const channel = row.Channel || row.channel || '';
      const platform = (row['Source Platform'] || row.source_platform || row.Source || '').toString().toLowerCase();
      const emailLower = email.toLowerCase();
      
      // Auto-detect source from CSV data
      let source: LeadSource = 'direct_web';
      if (platform.includes('meta') || platform.includes('facebook') || platform.includes('fb') || platform.includes('instagram') || platform === 'ig') {
        source = 'meta_campaign';
      } else if (platform.includes('google') || platform.includes('gads')) {
        source = 'google_ads';
      } else if (platform.includes('rightmove') || emailLower.includes('rightmove')) {
        source = 'rightmove';
      } else if (platform.includes('zoopla') || emailLower.includes('zoopla')) {
        source = 'zoopla';
      } else if (platform.includes('onthemarket') || platform.includes('otm') || emailLower.includes('onthemarket')) {
        source = 'onthemarket';
      } else if (channel.toLowerCase().includes('agent') || channel.toLowerCase().includes('referral')) {
        source = 'agent_referral';
      }

      return {
        id: row['Lead ID'] || row.lead_id || row.id || `lead_${index}`,
        name,
        email,
        phone,
        country,
        budget,
        bedrooms,
        paymentMethod,
        buyerStatus: (row['Are you ready to purchase within 28 days?'] === 'Yes' ? 'actively_looking' : 'browsing') as BuyerStatus,
        purchaseTimeline: (row['Timeline to Purchase'] || row.timeline || '3_6_months') as PurchaseTimeline,
        intentScore,
        qualityScore: row['Budget Match'] === 'Yes' ? 70 : scoreNum,
        status: mappedStatus,
        source,
        sourceDetail: row['Source Campaign'] || row['Source Creative'] || row.source_detail || '',
        lastActivity: row['Date Added'] || row['Status Last Modified'] || row.last_activity || 'Recently',
        assignedAgent: row['Assigned Caller'] || row.assigned_agent || null,
        matchedUnits: row['Recommended Properties'] ? [row['Recommended Properties']] : [],
        timeline: [],
        notes: row['Buyer Summary'] || row.notes || row['Agent Full Transcript'] || '',
        aiRecommendations: [],
      };
    });
  }, [leadData]);

  // Group leads by classification
  const groupedLeads = useMemo(() => {
    const hot: Lead[] = [];
    const quality: Lead[] = [];
    const warm: Lead[] = [];
    const cold: Lead[] = [];

    allLeads.forEach(lead => {
      const classification = classifyLead(lead.intentScore, lead.qualityScore);
      if (classification === 'hot') hot.push(lead);
      else if (classification === 'star' || classification === 'lightning') quality.push(lead);
      else if (classification === 'verified' || classification === 'warning') warm.push(lead);
      else cold.push(lead);
    });

    return { hot, quality, warm, cold };
  }, [allLeads]);

  // Pipeline stats
  const pipelineStats = useMemo(() => ({
    hot: groupedLeads.hot.length,
    contacted: allLeads.filter(l => l.status === 'engaged').length,
    viewing: allLeads.filter(l => l.status === 'viewing').length,
    offer: allLeads.filter(l => l.status === 'offer').length,
    won: allLeads.filter(l => l.status === 'closed').length,
  }), [allLeads, groupedLeads]);

  // Calculate average scores
  const getAverageScores = (leads: Lead[]) => {
    if (leads.length === 0) return { quality: 0, intent: 0 };
    const totalQuality = leads.reduce((acc, l) => acc + l.qualityScore, 0);
    const totalIntent = leads.reduce((acc, l) => acc + l.intentScore, 0);
    return {
      quality: Math.round(totalQuality / leads.length),
      intent: Math.round(totalIntent / leads.length),
    };
  };

  const handleAction = (action: string, lead: Lead, e: React.MouseEvent) => {
    e.stopPropagation();
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
        toast.success(`${roleConfig.primaryAction} for ${lead.name}`);
        break;
    }
  };

  const handleLeadClick = (lead: Lead) => {
    setSelectedLead(lead);
    setDrawerOpen(true);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-amber-500";
    return "text-red-500";
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "new": return { label: "New", color: "border-blue-500 text-blue-600" };
      case "engaged": return { label: "Engaged", color: "bg-secondary" };
      case "viewing": return { label: "Viewing", color: "bg-accent text-accent-foreground" };
      case "offer": return { label: "Offer", color: "bg-green-500/20 text-green-600" };
      case "closed": return { label: "Won", color: "bg-primary" };
      default: return { label: status, color: "" };
    }
  };

  // Empty state
  if (allLeads.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">{roleConfig.leadLabelPlural}</h2>
            <p className="text-muted-foreground text-sm">Track and manage your pipeline</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Upload className="h-3.5 w-3.5 mr-1.5" />
              Upload
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-3.5 w-3.5 mr-1.5" />
              Export
            </Button>
          </div>
        </div>
        <Card className="p-12 text-center">
          <User className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No {roleConfig.leadLabel} Data</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Upload your {roleConfig.leadLabel.toLowerCase()} data CSV from the main dashboard to view and manage your pipeline here.
          </p>
        </Card>
      </div>
    );
  }

  // Lead row component with inline actions
  const LeadRow = ({ lead, showActions = true }: { lead: Lead; showActions?: boolean }) => {
    const classification = classifyLead(lead.intentScore, lead.qualityScore);
    const config = getClassificationConfig(classification);
    
    return (
      <div 
        className="flex items-center justify-between p-3 hover:bg-muted/30 rounded-lg cursor-pointer transition-colors"
        onClick={() => handleLeadClick(lead)}
      >
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium truncate">{lead.name}</span>
              <LeadSourceBadge source={lead.source} size="sm" />
              {lead.sourceDetail && (
                <span className="text-muted-foreground text-xs truncate hidden sm:inline">— {lead.sourceDetail}</span>
              )}
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span>{formatBudget(lead.budget)}</span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline">{lead.country}</span>
            </div>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <div className="text-right hidden md:block">
              <div className="flex items-center gap-2 text-sm">
                <span className={getScoreColor(lead.qualityScore)}>{lead.qualityScore}</span>
                <span className="text-muted-foreground">/</span>
                <span className={getScoreColor(lead.intentScore)}>{lead.intentScore}</span>
              </div>
              <span className="text-xs text-muted-foreground">Q / I</span>
            </div>
            {showActions && (
              <div className="flex gap-1">
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-8 w-8 p-0"
                  onClick={(e) => handleAction('call', lead, e)}
                >
                  <Phone className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-8 w-8 p-0"
                  onClick={(e) => handleAction('booking', lead, e)}
                >
                  <Calendar className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-8 w-8 p-0"
                  onClick={(e) => handleAction('whatsapp', lead, e)}
                >
                  <MessageCircle className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Filter leads by source
  const filteredLeads = useMemo(() => {
    if (sourceFilter === 'all') return groupedLeads;
    
    const filterBySource = (leads: Lead[]) => leads.filter(l => l.source === sourceFilter);
    
    return {
      hot: filterBySource(groupedLeads.hot),
      quality: filterBySource(groupedLeads.quality),
      warm: filterBySource(groupedLeads.warm),
      cold: filterBySource(groupedLeads.cold),
    };
  }, [groupedLeads, sourceFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">{roleConfig.leadLabelPlural}</h2>
          <p className="text-muted-foreground text-sm">{allLeads.length} {roleConfig.leadLabelPlural.toLowerCase()} in pipeline</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Upload className="h-3.5 w-3.5 mr-1.5" />
            Upload
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-3.5 w-3.5 mr-1.5" />
            Export
          </Button>
          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger className="w-[140px] h-8">
              <Filter className="h-3.5 w-3.5 mr-1.5" />
              <SelectValue placeholder="Source" />
            </SelectTrigger>
            <SelectContent className="bg-background border shadow-lg z-50">
              <SelectItem value="all">All Sources</SelectItem>
              {LEAD_SOURCES.map((source) => (
                <SelectItem key={source.value} value={source.value}>
                  <span className="flex items-center gap-2">
                    <span>{source.icon}</span>
                    <span>{source.label}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Pipeline Funnel */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium text-sm">PIPELINE SUMMARY</span>
        </div>
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {/* Hot */}
            <div className="flex flex-col items-center p-3 bg-orange-500/10 rounded-lg min-w-[80px]">
              <div className="flex items-center gap-1">
                <Flame className="h-4 w-4 text-orange-500" />
                <span className="text-2xl font-bold">{pipelineStats.hot}</span>
              </div>
              <span className="text-xs text-muted-foreground">Hot</span>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
            
            {/* Contacted */}
            <div className="flex flex-col items-center p-3 bg-blue-500/10 rounded-lg min-w-[80px]">
              <div className="flex items-center gap-1">
                <Phone className="h-4 w-4 text-blue-500" />
                <span className="text-2xl font-bold">{pipelineStats.contacted}</span>
              </div>
              <span className="text-xs text-muted-foreground">Contacted</span>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
            
            {/* Viewing */}
            <div className="flex flex-col items-center p-3 bg-purple-500/10 rounded-lg min-w-[80px]">
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4 text-purple-500" />
                <span className="text-2xl font-bold">{pipelineStats.viewing}</span>
              </div>
              <span className="text-xs text-muted-foreground">Viewing</span>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
            
            {/* Offer */}
            <div className="flex flex-col items-center p-3 bg-amber-500/10 rounded-lg min-w-[80px]">
              <div className="flex items-center gap-1">
                <DollarSign className="h-4 w-4 text-amber-500" />
                <span className="text-2xl font-bold">{pipelineStats.offer}</span>
              </div>
              <span className="text-xs text-muted-foreground">Offer</span>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
            
            {/* Won */}
            <div className="flex flex-col items-center p-3 bg-green-500/10 rounded-lg min-w-[80px]">
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-2xl font-bold">{pipelineStats.won}</span>
              </div>
              <span className="text-xs text-muted-foreground">Won</span>
            </div>
          </div>
        </div>
      </Card>

      {/* 🔥 PRIORITY - Hot Leads */}
      {filteredLeads.hot.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-500" />
              <h3 className="font-semibold">PRIORITY</h3>
              <Badge variant="destructive" className="ml-1">{filteredLeads.hot.length}</Badge>
              <span className="text-xs text-muted-foreground ml-2">Contact within 1 hour</span>
            </div>
            <Badge variant="outline" className="text-orange-500 border-orange-500/30 bg-orange-500/10">
              <Clock className="h-3 w-3 mr-1" />
              SLA Active
            </Badge>
          </div>
          <Card className="border-l-4 border-l-orange-500 divide-y divide-border">
            {filteredLeads.hot.map(lead => (
              <LeadRow key={lead.id} lead={lead} />
            ))}
          </Card>
        </div>
      )}

      {/* ⭐ HIGH QUALITY */}
      {filteredLeads.quality.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-amber-500" />
            <h3 className="font-semibold">HIGH QUALITY</h3>
            <Badge variant="secondary" className="ml-1 bg-amber-500/20 text-amber-600">{filteredLeads.quality.length}</Badge>
            <span className="text-xs text-muted-foreground ml-2">Contact within 4 hours</span>
          </div>
          <Card className="border-l-4 border-l-amber-500 divide-y divide-border">
            {filteredLeads.quality.map(lead => (
              <LeadRow key={lead.id} lead={lead} />
            ))}
          </Card>
        </div>
      )}

      {/* ✓ WARM - Collapsible */}
      {filteredLeads.warm.length > 0 && (
        <Collapsible open={warmExpanded} onOpenChange={setWarmExpanded}>
          <div className="space-y-3">
            <CollapsibleTrigger asChild>
              <div className="flex items-center justify-between cursor-pointer group">
                <div className="flex items-center gap-2">
                  {warmExpanded ? (
                    <ChevronDown className="h-5 w-5 text-blue-500" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-blue-500" />
                  )}
                  <CheckCircle className="h-5 w-5 text-blue-500" />
                  <h3 className="font-semibold">WARM</h3>
                  <Badge variant="secondary" className="ml-1 bg-blue-500/20 text-blue-600">{filteredLeads.warm.length}</Badge>
                  <span className="text-xs text-muted-foreground ml-2">Contact within 24 hours</span>
                </div>
                <Button variant="ghost" size="sm" className="text-xs">
                  {warmExpanded ? 'Collapse' : 'View all'}
                </Button>
              </div>
            </CollapsibleTrigger>
            
            {!warmExpanded && (
              <Card className="p-4 border-l-4 border-l-blue-500 bg-blue-500/5">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    {filteredLeads.warm.length} {roleConfig.leadLabelPlural.toLowerCase()} — Average quality: {getAverageScores(filteredLeads.warm).quality}, Average intent: {getAverageScores(filteredLeads.warm).intent}
                  </span>
                </div>
              </Card>
            )}
            
            <CollapsibleContent>
              <Card className="border-l-4 border-l-blue-500 divide-y divide-border">
                {filteredLeads.warm.map(lead => (
                  <LeadRow key={lead.id} lead={lead} />
                ))}
              </Card>
            </CollapsibleContent>
          </div>
        </Collapsible>
      )}

      {/* ❌ COLD - Collapsible */}
      {filteredLeads.cold.length > 0 && (
        <Collapsible open={coldExpanded} onOpenChange={setColdExpanded}>
          <div className="space-y-3">
            <CollapsibleTrigger asChild>
              <div className="flex items-center justify-between cursor-pointer group">
                <div className="flex items-center gap-2">
                  {coldExpanded ? (
                    <ChevronDown className="h-5 w-5 text-slate-400" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-slate-400" />
                  )}
                  <Snowflake className="h-5 w-5 text-slate-400" />
                  <h3 className="font-semibold text-muted-foreground">COLD</h3>
                  <Badge variant="outline" className="ml-1">{filteredLeads.cold.length}</Badge>
                  <span className="text-xs text-muted-foreground ml-2">Automated nurture only</span>
                </div>
                <Button variant="ghost" size="sm" className="text-xs">
                  {coldExpanded ? 'Collapse' : 'View all'}
                </Button>
              </div>
            </CollapsibleTrigger>
            
            {!coldExpanded && (
              <Card className="p-4 border-l-4 border-l-slate-300 bg-muted/30">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    {filteredLeads.cold.length} {roleConfig.leadLabelPlural.toLowerCase()} — Receiving automated WhatsApp sequence
                  </span>
                </div>
              </Card>
            )}
            
            <CollapsibleContent>
              <Card className="border-l-4 border-l-slate-300 divide-y divide-border">
                {filteredLeads.cold.map(lead => (
                  <LeadRow key={lead.id} lead={lead} showActions={false} />
                ))}
              </Card>
            </CollapsibleContent>
          </div>
        </Collapsible>
      )}

      {/* Lead Detail Drawer - Keep existing functionality */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {selectedLead && (
            <>
              <SheetHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <SheetTitle className="text-lg">{selectedLead.name}</SheetTitle>
                    <Badge className={`mt-1 ${getStatusConfig(selectedLead.status).color}`}>
                      {getStatusConfig(selectedLead.status).label}
                    </Badge>
                  </div>
                </div>
              </SheetHeader>

              <Tabs defaultValue="profile" className="space-y-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="profile" className="text-xs">Profile</TabsTrigger>
                  <TabsTrigger value="scoring" className="text-xs">Scoring</TabsTrigger>
                  <TabsTrigger value="activity" className="text-xs">Activity</TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="truncate">{selectedLead.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span>{selectedLead.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span>{selectedLead.country}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t">
                    <h4 className="font-medium mb-3 text-sm">Preferences</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground text-xs">Budget</span>
                        <div className="font-medium">{formatBudget(selectedLead.budget)}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-xs">Bedrooms</span>
                        <div className="font-medium">{selectedLead.bedrooms || 'Not specified'}</div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t">
                    <h4 className="font-medium mb-2 text-sm">Notes</h4>
                    <Textarea 
                      defaultValue={selectedLead.notes} 
                      className="text-sm"
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button size="sm" className="flex-1 gap-1.5" onClick={() => handleAction('call', selectedLead, { stopPropagation: () => {} } as any)}>
                      <Phone className="h-3.5 w-3.5" />
                      Call
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 gap-1.5" onClick={() => handleAction('booking', selectedLead, { stopPropagation: () => {} } as any)}>
                      <Calendar className="h-3.5 w-3.5" />
                      {roleConfig.primaryAction}
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 gap-1.5" onClick={() => handleAction('whatsapp', selectedLead, { stopPropagation: () => {} } as any)}>
                      <MessageCircle className="h-3.5 w-3.5" />
                      WhatsApp
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="scoring" className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Quality Score</span>
                      <span className={`font-bold ${getScoreColor(selectedLead.qualityScore)}`}>
                        {selectedLead.qualityScore}
                      </span>
                    </div>
                    <Progress value={selectedLead.qualityScore} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">Financial fit & property match</p>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Intent Score</span>
                      <span className={`font-bold ${getScoreColor(selectedLead.intentScore)}`}>
                        {selectedLead.intentScore}
                      </span>
                    </div>
                    <Progress value={selectedLead.intentScore} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">Timeline & engagement level</p>
                  </div>
                </TabsContent>

                <TabsContent value="activity" className="space-y-3">
                  <div className="text-center text-muted-foreground text-sm py-8">
                    <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Activity timeline coming soon</p>
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default LeadsManagement;
