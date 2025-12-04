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
  Building2, Clock, Sparkles, Lightbulb, CreditCard, Timer
} from "lucide-react";
import { useState } from "react";
import { AIRecommendation, PaymentMethod, BuyerStatus, PurchaseTimeline } from "@/lib/types";

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
  source: string;
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

const LeadsManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [developmentFilter, setDevelopmentFilter] = useState("all");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const mockLeads: Lead[] = [
    {
      id: "1",
      name: "James Okonkwo",
      email: "james.o@example.com",
      phone: "+234 801 234 5678",
      country: "Nigeria",
      budget: "£800k - £1.2M",
      bedrooms: "3-4 bed",
      paymentMethod: "mortgage",
      buyerStatus: "actively_looking",
      purchaseTimeline: "0_3_months",
      intentScore: 78,
      qualityScore: 85,
      status: "engaged",
      source: "Meta Campaign - Lagos HNW",
      lastActivity: "2 hours ago",
      assignedAgent: "Sarah Johnson",
      matchedUnits: ["Marina Heights - Unit 405", "Skyline Tower - Unit 1201"],
      timeline: [
        { date: "2 hours ago", action: "Viewed listing", detail: "Marina Heights - Unit 405" },
        { date: "1 day ago", action: "Downloaded brochure", detail: "Development Overview PDF" },
        { date: "3 days ago", action: "Submitted inquiry", detail: "Website form" },
      ],
      notes: "Interested in waterfront properties. Looking to relocate from Lagos.",
      aiRecommendations: [
        {
          id: "rec_1",
          type: "follow_up",
          title: "Schedule a call",
          description: "Lead engagement is high. Best time to call: 2-4pm GMT based on activity patterns.",
          confidence: 88,
          priority: "high",
        },
        {
          id: "rec_2",
          type: "next_action",
          title: "Send virtual tour",
          description: "This lead responds well to visual content. Share Marina Heights virtual tour.",
          confidence: 75,
          priority: "medium",
        },
      ],
    },
    {
      id: "2",
      name: "Sarah Mitchell",
      email: "sarah.m@example.com",
      phone: "+44 7700 900123",
      country: "United Kingdom",
      budget: "£500k - £750k",
      bedrooms: "2 bed",
      paymentMethod: "mortgage",
      buyerStatus: "actively_looking",
      purchaseTimeline: "within_28_days",
      intentScore: 91,
      qualityScore: 72,
      status: "viewing",
      source: "Google Ads - UK Investors",
      lastActivity: "1 day ago",
      assignedAgent: "Mike Chen",
      matchedUnits: ["Garden Residences - Unit 12"],
      timeline: [
        { date: "1 day ago", action: "Viewing booked", detail: "Marina Heights - Dec 5" },
        { date: "3 days ago", action: "Called", detail: "Discussed payment plans" },
      ],
      notes: "First-time buyer, very engaged.",
      aiRecommendations: [
        {
          id: "rec_3",
          type: "next_action",
          title: "Prepare mortgage info",
          description: "Lead is a first-time buyer. Send mortgage calculator and financing options.",
          confidence: 82,
          priority: "high",
        },
      ],
    },
    {
      id: "3",
      name: "Ahmed Al-Rashid",
      email: "ahmed.r@example.com",
      phone: "+971 50 123 4567",
      country: "UAE",
      budget: "£1.5M - £2M",
      bedrooms: "Penthouse",
      paymentMethod: "cash",
      buyerStatus: "actively_looking",
      purchaseTimeline: "0_3_months",
      intentScore: 85,
      qualityScore: 90,
      status: "offer",
      source: "LinkedIn - Dubai Expats",
      lastActivity: "3 hours ago",
      assignedAgent: "Sarah Johnson",
      matchedUnits: ["Skyline Tower - Penthouse A"],
      timeline: [
        { date: "3 hours ago", action: "Offer submitted", detail: "£1.85M" },
        { date: "5 days ago", action: "Viewing completed", detail: "Very interested" },
      ],
      notes: "Made offer on Skyline Tower penthouse. Awaiting developer response.",
      aiRecommendations: [
        {
          id: "rec_4",
          type: "next_action",
          title: "Fast-track response",
          description: "Cash buyer with high intent. Prioritize developer response within 24 hours.",
          confidence: 92,
          priority: "high",
        },
      ],
    },
    {
      id: "4",
      name: "Jennifer Wong",
      email: "jenny.w@example.com",
      phone: "+65 9123 4567",
      country: "Singapore",
      budget: "£600k - £900k",
      bedrooms: "2-3 bed",
      paymentMethod: "undecided",
      buyerStatus: "browsing",
      purchaseTimeline: "3_6_months",
      intentScore: 82,
      qualityScore: 68,
      status: "new",
      source: "Website - Organic Search",
      lastActivity: "5 hours ago",
      assignedAgent: null,
      matchedUnits: ["Marina Heights - Unit 302", "Riverside Plaza - Unit 15"],
      timeline: [
        { date: "5 hours ago", action: "Submitted inquiry", detail: "Investment opportunities" },
      ],
      notes: "Exploring investment opportunities in UK property market.",
      aiRecommendations: [
        {
          id: "rec_5",
          type: "follow_up",
          title: "Nurture with content",
          description: "Early-stage lead. Send investment ROI calculator and market insights.",
          confidence: 70,
          priority: "medium",
        },
      ],
    },
    {
      id: "5",
      name: "Marcus Thompson",
      email: "marcus.t@example.com",
      phone: "+1 555 0123",
      country: "USA",
      budget: "£700k - £1M",
      bedrooms: "3 bed house",
      paymentMethod: "mortgage",
      buyerStatus: "actively_looking",
      purchaseTimeline: "6_9_months",
      intentScore: 76,
      qualityScore: 79,
      status: "engaged",
      source: "Instagram Ads",
      lastActivity: "1 day ago",
      assignedAgent: null,
      matchedUnits: ["Garden Residences - Unit 8"],
      timeline: [
        { date: "1 day ago", action: "Clicked email", detail: "Virtual tour invitation" },
        { date: "4 days ago", action: "Downloaded brochure", detail: "Garden Residences" },
      ],
      notes: "Interested in areas with good schools. Family of 4.",
      aiRecommendations: [
        {
          id: "rec_6",
          type: "next_action",
          title: "Highlight family amenities",
          description: "Lead has family. Emphasize nearby schools and family-friendly features.",
          confidence: 78,
          priority: "medium",
        },
      ],
    }
  ];

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

  const filteredLeads = mockLeads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.country.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = [
    { label: "Total", value: mockLeads.length, color: "text-foreground" },
    { label: "New", value: mockLeads.filter(l => l.status === "new").length, color: "text-blue-600" },
    { label: "Engaged", value: mockLeads.filter(l => l.status === "engaged").length, color: "text-warning" },
    { label: "Viewing", value: mockLeads.filter(l => l.status === "viewing").length, color: "text-accent" },
    { label: "Offer", value: mockLeads.filter(l => l.status === "offer").length, color: "text-success" },
  ];

  const handleLeadClick = (lead: Lead) => {
    setSelectedLead(lead);
    setDrawerOpen(true);
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 md:gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-lg md:text-xl font-semibold">Lead Management</h2>
          <p className="text-muted-foreground text-xs md:text-sm">Track and manage your buyer pipeline</p>
        </div>
        <Button size="sm" className="w-full sm:w-auto">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
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
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[140px]">
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
          <Select value={developmentFilter} onValueChange={setDevelopmentFilter}>
            <SelectTrigger className="w-full sm:w-[160px]">
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
          <table className="w-full min-w-[600px]">
            <thead className="bg-muted/50">
              <tr className="text-left text-xs md:text-sm text-muted-foreground">
                <th className="px-3 md:px-4 py-2 md:py-3 font-medium">Name</th>
                <th className="px-3 md:px-4 py-2 md:py-3 font-medium hidden sm:table-cell">Country</th>
                <th className="px-3 md:px-4 py-2 md:py-3 font-medium">Budget</th>
                <th className="px-3 md:px-4 py-2 md:py-3 font-medium hidden md:table-cell">Timeline</th>
                <th className="px-3 md:px-4 py-2 md:py-3 font-medium">Score</th>
                <th className="px-3 md:px-4 py-2 md:py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredLeads.map((lead) => (
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
                  <td className="px-3 md:px-4 py-2 md:py-3 text-muted-foreground text-xs md:text-sm">{lead.budget}</td>
                  <td className="px-3 md:px-4 py-2 md:py-3 text-muted-foreground text-xs hidden md:table-cell">{getTimelineLabel(lead.purchaseTimeline)}</td>
                  <td className="px-3 md:px-4 py-2 md:py-3">
                    <span className={`font-semibold text-sm ${getScoreColor((lead.intentScore + lead.qualityScore) / 2)}`}>
                      {Math.round((lead.intentScore + lead.qualityScore) / 2)}
                    </span>
                  </td>
                  <td className="px-3 md:px-4 py-2 md:py-3">
                    <Badge className={`${getStatusConfig(lead.status).color} text-[10px] md:text-xs`}>
                      {getStatusConfig(lead.status).label}
                    </Badge>
                  </td>
                </tr>
              ))}
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
                        <div className="font-medium">{selectedLead.budget}</div>
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
