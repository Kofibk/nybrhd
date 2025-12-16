import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { 
  User, Mail, Phone, MapPin, TrendingUp, Target, Calendar, 
  DollarSign, Home, MessageSquare, Search, Download, X,
  Building2, Clock, Sparkles, Lightbulb, CreditCard, Timer, Filter
} from "lucide-react";
import { useState, useMemo } from "react";
import { AIRecommendation, PaymentMethod, BuyerStatus, PurchaseTimeline, LeadSource, LEAD_SOURCES, LEAD_CLASSIFICATIONS } from "@/lib/types";
import { LeadClassificationBadge, LeadSourceBadge } from "@/components/LeadClassificationBadge";
import { classifyLead, getClassificationConfig } from "@/lib/leadClassification";
import { useUploadedData } from "@/contexts/DataContext";
import { formatBudget } from "@/lib/utils";

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

const LeadsManagement = ({ userType = 'admin' }: LeadsManagementProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [classificationFilter, setClassificationFilter] = useState("all");
  const [developmentFilter, setDevelopmentFilter] = useState("all");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { leadData } = useUploadedData(userType);

  // Convert uploaded lead data to Lead format - handle ANY column format dynamically
  const allLeads = useMemo(() => {
    if (leadData.length === 0) return [];
    
    return leadData.map((row, index) => {
      // Find name from various possible columns
      const name = row['Lead Name'] || row.name || row.Name || row.full_name || 
        `${row.first_name || row['First Name'] || ''} ${row.last_name || row['Last Name'] || ''}`.trim() || 
        `Lead ${index + 1}`;
      
      // Find email
      const email = row.Email || row.email || row['Email Address'] || '';
      
      // Find phone
      const phone = row['Phone Number'] || row.phone || row.Phone || row.Mobile || row.telephone || '';
      
      // Find country
      const country = row.Country || row.country || row.Location || row.location || row.Region || '';
      
      // Find budget
      const budget = row['Budget Range'] || row.budget || row.Budget || row['Budget'] || '';
      
      // Find bedrooms
      const bedrooms = row['Preferred Bedrooms'] || row.bedrooms || row.Bedrooms || '';
      
      // Parse score/intent
      const rawScore = row.Score || row.score || row['Lead Score'] || row.intent_score || '50';
      const scoreNum = parseInt(String(rawScore).replace(/[^0-9]/g, ''), 10) || 50;
      const intentText = (row.Intent || row.intent || '').toString().toLowerCase().trim();
      let intentScore = scoreNum;
      if (intentText === 'low') intentScore = Math.min(scoreNum, 35);
      else if (intentText === 'warm') intentScore = Math.max(scoreNum, 40);
      else if (intentText === 'high' || intentText === 'hot') intentScore = Math.max(scoreNum, 70);

      // Parse status
      const rawStatus = (row.Status || row.status || 'new').toString().toLowerCase();
      let mappedStatus: Lead['status'] = 'new';
      if (rawStatus.includes('pending')) mappedStatus = 'new';
      else if (rawStatus.includes('progress') || rawStatus.includes('contacted')) mappedStatus = 'engaged';
      else if (rawStatus.includes('viewing')) mappedStatus = 'viewing';
      else if (rawStatus.includes('offer')) mappedStatus = 'offer';
      else if (rawStatus.includes('closed') || rawStatus.includes('won')) mappedStatus = 'closed';

      // Parse payment method
      const paymentRaw = (row['Cash/Mortgage'] || row.payment_method || row.paymentMethod || 'undecided').toString().toLowerCase();
      let paymentMethod: PaymentMethod = 'undecided';
      if (paymentRaw.includes('cash')) paymentMethod = 'cash';
      else if (paymentRaw.includes('mortgage')) paymentMethod = 'mortgage';

      // Determine source
      const channel = row.Channel || row.channel || '';
      const platform = row['Source Platform'] || row.source_platform || '';
      const enquiryType = row['Enquiry Type'] || row.enquiry_type || '';
      let source: LeadSource = 'manual_upload';
      if (channel.toLowerCase().includes('meta') || platform === 'meta' || platform === 'ig' || platform === 'fb') {
        source = 'meta_campaign';
      } else if (enquiryType === 'WA') {
        source = 'direct_web';
      } else if (platform) {
        source = 'portal';
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

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-warning";
    return "text-destructive";
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "new": return { label: "New", variant: "outline" as const, color: "border-blue-500 text-blue-600" };
      case "engaged": return { label: "Engaged", variant: "secondary" as const, color: "" };
      case "viewing": return { label: "Viewing Booked", variant: "default" as const, color: "bg-accent text-accent-foreground" };
      case "offer": return { label: "Offer Made", variant: "default" as const, color: "bg-success" };
      case "closed": return { label: "Closed", variant: "default" as const, color: "bg-primary" };
      default: return { label: status, variant: "default" as const, color: "" };
    }
  };

  const getPaymentMethodLabel = (method: PaymentMethod) => {
    switch (method) {
      case "cash": return "Cash";
      case "mortgage": return "Mortgage";
      case "undecided": return "Undecided";
    }
  };

  const getBuyerStatusLabel = (status: BuyerStatus) => {
    switch (status) {
      case "browsing": return "Just Browsing";
      case "actively_looking": return "Actively Looking";
    }
  };

  const getTimelineLabel = (timeline: PurchaseTimeline) => {
    switch (timeline) {
      case "within_28_days": return "Within 28 days";
      case "0_3_months": return "0-3 months";
      case "3_6_months": return "3-6 months";
      case "6_9_months": return "6-9 months";
      case "9_12_months": return "9-12 months";
      case "12_months_plus": return "12+ months";
    }
  };

  const getSlaColor = (sla: string) => {
    switch (sla) {
      case "1 hour": return "text-red-500 bg-red-500/10";
      case "2 hours": return "text-orange-500 bg-orange-500/10";
      case "4 hours": return "text-amber-500 bg-amber-500/10";
      case "24 hours": return "text-blue-500 bg-blue-500/10";
      case "1 week": return "text-gray-500 bg-gray-500/10";
      case "Auto": return "text-slate-400 bg-slate-500/10";
      default: return "text-muted-foreground";
    }
  };

  const filteredLeads = allLeads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.country.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
    const matchesSource = sourceFilter === "all" || lead.source === sourceFilter;
    const leadClassification = classifyLead(lead.intentScore, lead.qualityScore);
    const matchesClassification = classificationFilter === "all" || leadClassification === classificationFilter;
    return matchesSearch && matchesStatus && matchesSource && matchesClassification;
  });

  const stats = [
    { label: "Total", value: allLeads.length, color: "text-foreground" },
    { label: "New", value: allLeads.filter(l => l.status === "new").length, color: "text-blue-600" },
    { label: "Engaged", value: allLeads.filter(l => l.status === "engaged").length, color: "text-warning" },
    { label: "Viewing", value: allLeads.filter(l => l.status === "viewing").length, color: "text-accent" },
    { label: "Offer", value: allLeads.filter(l => l.status === "offer").length, color: "text-success" },
  ];

  const handleLeadClick = (lead: Lead) => {
    setSelectedLead(lead);
    setDrawerOpen(true);
  };

  // Empty state when no leads uploaded
  if (allLeads.length === 0) {
    return (
      <div className="space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 items-start sm:items-center justify-between">
          <div>
            <h2 className="text-lg md:text-xl font-semibold">Lead Management</h2>
            <p className="text-muted-foreground text-xs md:text-sm">Track and manage your buyer pipeline</p>
          </div>
        </div>
        <Card className="p-8 md:p-12 text-center">
          <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Lead Data</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Upload your lead data CSV from the main dashboard to view and manage your leads here.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 md:gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-lg md:text-xl font-semibold">Lead Management</h2>
          <p className="text-muted-foreground text-xs md:text-sm">
            {allLeads.length} leads loaded from your data
          </p>
        </div>
        <Button size="sm" className="w-full sm:w-auto">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or country..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="engaged">Engaged</SelectItem>
                <SelectItem value="viewing">Viewing</SelectItem>
                <SelectItem value="offer">Offer Made</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
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
            <Select value={classificationFilter} onValueChange={setClassificationFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Classification" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classifications</SelectItem>
                <SelectItem value="hot">🔥 Hot Lead</SelectItem>
                <SelectItem value="star">⭐ Quality Lead</SelectItem>
                <SelectItem value="lightning">⚡ Intent Lead</SelectItem>
                <SelectItem value="verified">✓ Valid Lead</SelectItem>
                <SelectItem value="dormant">💤 Cold Lead</SelectItem>
                <SelectItem value="warning">⚠️ At Risk</SelectItem>
                <SelectItem value="cold">❌ Disqualified</SelectItem>
              </SelectContent>
            </Select>
            <Select value={developmentFilter} onValueChange={setDevelopmentFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Development" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Developments</SelectItem>
                <SelectItem value="marina">Marina Heights</SelectItem>
                <SelectItem value="skyline">Skyline Tower</SelectItem>
                <SelectItem value="garden">Garden Residences</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Stats Overview - Responsive grid */}
      <div className="grid grid-cols-5 gap-2 md:gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-2 md:p-4 shadow-card">
            <div className={`text-lg md:text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-[10px] md:text-sm text-muted-foreground truncate">{stat.label}</div>
          </Card>
        ))}
      </div>

      {/* Leads Table - Mobile responsive */}
      <Card className="shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead className="bg-muted/50">
              <tr className="text-left text-xs md:text-sm text-muted-foreground">
                <th className="px-3 md:px-4 py-2 md:py-3 font-medium">Name</th>
                <th className="px-3 md:px-4 py-2 md:py-3 font-medium hidden sm:table-cell">Country</th>
                <th className="px-3 md:px-4 py-2 md:py-3 font-medium">Budget</th>
                <th className="px-3 md:px-4 py-2 md:py-3 font-medium hidden md:table-cell">Timeline</th>
                <th className="px-3 md:px-4 py-2 md:py-3 font-medium">Score</th>
                <th className="px-3 md:px-4 py-2 md:py-3 font-medium">Classification</th>
                <th className="px-3 md:px-4 py-2 md:py-3 font-medium">SLA</th>
                <th className="px-3 md:px-4 py-2 md:py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredLeads.map((lead) => {
                const classification = classifyLead(lead.intentScore, lead.qualityScore);
                const classConfig = getClassificationConfig(classification);
                return (
                <tr 
                  key={lead.id} 
                  className="hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => handleLeadClick(lead)}
                >
                  <td className="px-3 md:px-4 py-2 md:py-3">
                    <div className="font-medium text-foreground text-sm">{lead.name}</div>
                    <div className="text-[10px] md:text-xs text-muted-foreground truncate max-w-[150px]">{lead.email}</div>
                  </td>
                  <td className="px-3 md:px-4 py-2 md:py-3 text-muted-foreground text-sm hidden sm:table-cell">{lead.country}</td>
                  <td className="px-3 md:px-4 py-2 md:py-3 text-muted-foreground text-xs md:text-sm">{formatBudget(lead.budget)}</td>
                  <td className="px-3 md:px-4 py-2 md:py-3 text-muted-foreground text-xs hidden md:table-cell">{getTimelineLabel(lead.purchaseTimeline)}</td>
                  <td className="px-3 md:px-4 py-2 md:py-3">
                    <span className={`font-semibold text-sm ${getScoreColor((lead.intentScore + lead.qualityScore) / 2)}`}>
                      {Math.round((lead.intentScore + lead.qualityScore) / 2)}
                    </span>
                  </td>
                  <td className="px-3 md:px-4 py-2 md:py-3">
                    <Badge className={`${classConfig.bgColor} ${classConfig.color} text-[10px] md:text-xs border-0`}>
                      {classConfig.icon} {classConfig.label}
                    </Badge>
                  </td>
                  <td className="px-3 md:px-4 py-2 md:py-3">
                    <Badge className={`${getSlaColor(classConfig.sla)} text-[10px] md:text-xs border-0`}>
                      {classConfig.sla}
                    </Badge>
                  </td>
                  <td className="px-3 md:px-4 py-2 md:py-3">
                    <Badge className={`${getStatusConfig(lead.status).color} text-[10px] md:text-xs`}>
                      {getStatusConfig(lead.status).label}
                    </Badge>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Lead Detail Drawer */}
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
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="profile" className="text-xs">Profile</TabsTrigger>
                  <TabsTrigger value="scoring" className="text-xs">Scoring</TabsTrigger>
                  <TabsTrigger value="activity" className="text-xs">Activity</TabsTrigger>
                  <TabsTrigger value="ai" className="text-xs">AI</TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="space-y-4">
                  {/* Contact Info */}
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
                    <div className="flex items-center gap-2 text-sm">
                      <Target className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="truncate">{selectedLead.source}</span>
                    </div>
                  </div>

                  {/* Preferences */}
                  <div className="pt-3 border-t">
                    <h4 className="font-medium mb-3 text-sm">Preferences</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground text-xs">Budget</span>
                        <div className="font-medium">{formatBudget(selectedLead.budget)}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-xs">Bedrooms</span>
                        <div className="font-medium">{selectedLead.bedrooms}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-xs flex items-center gap-1">
                          <CreditCard className="h-3 w-3" /> Payment
                        </span>
                        <div className="font-medium">{getPaymentMethodLabel(selectedLead.paymentMethod)}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-xs flex items-center gap-1">
                          <Timer className="h-3 w-3" /> Timeline
                        </span>
                        <div className="font-medium">{getTimelineLabel(selectedLead.purchaseTimeline)}</div>
                      </div>
                    </div>
                    <div className="mt-3">
                      <span className="text-muted-foreground text-xs">Status</span>
                      <div className="font-medium">{getBuyerStatusLabel(selectedLead.buyerStatus)}</div>
                    </div>
                  </div>

                  {/* Matched Units */}
                  <div className="pt-3 border-t">
                    <h4 className="font-medium mb-2 text-sm">Matched Units</h4>
                    <div className="space-y-1">
                      {selectedLead.matchedUnits.map((unit, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <Building2 className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                          <span className="truncate">{unit}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="pt-3 border-t">
                    <h4 className="font-medium mb-2 text-sm">Notes</h4>
                    <Textarea 
                      defaultValue={selectedLead.notes} 
                      className="text-sm"
                      rows={3}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 pt-2">
                    <Button size="sm" className="flex-1">Mark Contacted</Button>
                    <Button size="sm" variant="outline" className="flex-1">Book Viewing</Button>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button size="sm" variant="secondary" className="flex-1">Mark Won</Button>
                    <Button size="sm" variant="destructive" className="flex-1">Mark Lost</Button>
                  </div>
                </TabsContent>

                <TabsContent value="scoring" className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Intent Score</span>
                      <span className={`font-bold ${getScoreColor(selectedLead.intentScore)}`}>
                        {selectedLead.intentScore}%
                      </span>
                    </div>
                    <Progress value={selectedLead.intentScore} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">Based on engagement actions</p>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Quality Score</span>
                      <span className={`font-bold ${getScoreColor(selectedLead.qualityScore)}`}>
                        {selectedLead.qualityScore}%
                      </span>
                    </div>
                    <Progress value={selectedLead.qualityScore} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">Based on profile match data</p>
                  </div>
                </TabsContent>

                <TabsContent value="activity" className="space-y-3">
                  {selectedLead.timeline.map((item, index) => (
                    <div key={index} className="flex gap-3 pb-3 border-b last:border-0">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="text-xs text-muted-foreground">{item.date}</div>
                        <div className="font-medium text-sm">{item.action}</div>
                        <div className="text-xs text-muted-foreground truncate">{item.detail}</div>
                      </div>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="ai" className="space-y-3">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="h-5 w-5 text-accent" />
                    <h3 className="font-medium">AI Recommendations</h3>
                  </div>
                  {selectedLead.aiRecommendations.map((rec) => (
                    <Card key={rec.id} className={`p-3 ${rec.priority === "high" ? "border-accent/50 bg-accent/5" : ""}`}>
                      <div className="flex items-start gap-2">
                        <Lightbulb className={`h-4 w-4 mt-0.5 flex-shrink-0 ${rec.priority === "high" ? "text-accent" : "text-muted-foreground"}`} />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-sm">{rec.title}</span>
                            <Badge variant={rec.priority === "high" ? "default" : "secondary"} className="text-[10px]">
                              {rec.priority}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{rec.description}</p>
                          <div className="flex items-center gap-1 mt-2">
                            <Progress value={rec.confidence} className="h-1 flex-1" />
                            <span className="text-[10px] text-muted-foreground">{rec.confidence}%</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
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
