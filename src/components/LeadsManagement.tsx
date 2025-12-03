import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { 
  User, Mail, Phone, MapPin, TrendingUp, Target, Calendar, 
  DollarSign, Home, MessageSquare, Search, Download, X,
  Building2, Clock
} from "lucide-react";
import { useState } from "react";

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  budget: string;
  bedrooms: string;
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
}

const LeadsManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [developmentFilter, setDevelopmentFilter] = useState("all");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const mockLeads: Lead[] = [
    {
      id: "1",
      name: "James Okonkwo",
      email: "james.o@example.com",
      phone: "+234 801 234 5678",
      country: "Nigeria",
      budget: "£800k - £1.2M",
      bedrooms: "3-4 bed",
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
      notes: "Interested in waterfront properties. Looking to relocate from Lagos."
    },
    {
      id: "2",
      name: "Sarah Mitchell",
      email: "sarah.m@example.com",
      phone: "+44 7700 900123",
      country: "United Kingdom",
      budget: "£500k - £750k",
      bedrooms: "2 bed",
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
      notes: "First-time buyer, very engaged."
    },
    {
      id: "3",
      name: "Ahmed Al-Rashid",
      email: "ahmed.r@example.com",
      phone: "+971 50 123 4567",
      country: "UAE",
      budget: "£1.5M - £2M",
      bedrooms: "Penthouse",
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
      notes: "Made offer on Skyline Tower penthouse. Awaiting developer response."
    },
    {
      id: "4",
      name: "Jennifer Wong",
      email: "jenny.w@example.com",
      phone: "+65 9123 4567",
      country: "Singapore",
      budget: "£600k - £900k",
      bedrooms: "2-3 bed",
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
      notes: "Exploring investment opportunities in UK property market."
    },
    {
      id: "5",
      name: "Marcus Thompson",
      email: "marcus.t@example.com",
      phone: "+1 555 0123",
      country: "USA",
      budget: "£700k - £1M",
      bedrooms: "3 bed house",
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
      notes: "Interested in areas with good schools. Family of 4."
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

  const filteredLeads = mockLeads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.country.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = [
    { label: "Total Leads", value: mockLeads.length, color: "text-foreground" },
    { label: "New", value: mockLeads.filter(l => l.status === "new").length, color: "text-blue-600" },
    { label: "Engaged", value: mockLeads.filter(l => l.status === "engaged").length, color: "text-warning" },
    { label: "Viewing", value: mockLeads.filter(l => l.status === "viewing").length, color: "text-accent" },
    { label: "Offer", value: mockLeads.filter(l => l.status === "offer").length, color: "text-success" },
  ];

  return (
    <div className="space-y-6">
      {/* Header & Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Lead Management</h2>
          <p className="text-muted-foreground text-sm">Track and manage your buyer pipeline</p>
        </div>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or country..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="engaged">Engaged</SelectItem>
            <SelectItem value="viewing">Viewing Booked</SelectItem>
            <SelectItem value="offer">Offer Made</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={developmentFilter} onValueChange={setDevelopmentFilter}>
          <SelectTrigger className="w-[180px]">
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

      {/* Stats Overview */}
      <div className="grid grid-cols-5 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-4 shadow-card">
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
          </Card>
        ))}
      </div>

      {/* Leads Table & Detail View */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Leads Table */}
        <div className={`space-y-4 ${selectedLead ? "lg:col-span-3" : "lg:col-span-5"}`}>
          <Card className="shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr className="text-left text-sm text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Country</th>
                    <th className="px-4 py-3 font-medium">Budget</th>
                    <th className="px-4 py-3 font-medium">Bedrooms</th>
                    <th className="px-4 py-3 font-medium">Score</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredLeads.map((lead) => (
                    <tr 
                      key={lead.id} 
                      className={`hover:bg-muted/30 transition-colors cursor-pointer ${
                        selectedLead?.id === lead.id ? "bg-muted/50" : ""
                      }`}
                      onClick={() => setSelectedLead(lead)}
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium text-foreground">{lead.name}</div>
                        <div className="text-xs text-muted-foreground">{lead.email}</div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{lead.country}</td>
                      <td className="px-4 py-3 text-muted-foreground">{lead.budget}</td>
                      <td className="px-4 py-3 text-muted-foreground">{lead.bedrooms}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold ${getScoreColor((lead.intentScore + lead.qualityScore) / 2)}`}>
                            {Math.round((lead.intentScore + lead.qualityScore) / 2)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={getStatusConfig(lead.status).color}>
                          {getStatusConfig(lead.status).label}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Lead Detail Panel */}
        {selectedLead && (
          <div className="lg:col-span-2">
            <Card className="p-5 shadow-card sticky top-24">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{selectedLead.name}</h3>
                  <Badge className={getStatusConfig(selectedLead.status).color}>
                    {getStatusConfig(selectedLead.status).label}
                  </Badge>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSelectedLead(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <Tabs defaultValue="profile" className="space-y-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                  <TabsTrigger value="scoring">Scoring</TabsTrigger>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="space-y-4">
                  {/* Contact Info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedLead.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedLead.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedLead.country}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Target className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedLead.source}</span>
                    </div>
                  </div>

                  {/* Preferences */}
                  <div className="pt-3 border-t">
                    <h4 className="font-medium mb-2 text-sm">Preferences</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Budget:</span>
                        <div className="font-medium">{selectedLead.budget}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Bedrooms:</span>
                        <div className="font-medium">{selectedLead.bedrooms}</div>
                      </div>
                    </div>
                  </div>

                  {/* Matched Units */}
                  <div className="pt-3 border-t">
                    <h4 className="font-medium mb-2 text-sm">Matched Units</h4>
                    <div className="space-y-1">
                      {selectedLead.matchedUnits.map((unit, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <Building2 className="h-3 w-3 text-muted-foreground" />
                          <span>{unit}</span>
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

                  <div className="flex gap-2 pt-2">
                    <Button size="sm" className="flex-1">Assign to Campaign</Button>
                    <Button size="sm" variant="outline" className="flex-1">Mark as Closed</Button>
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
                      <div className="p-2 rounded-full bg-muted">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">{item.action}</div>
                        <div className="text-xs text-muted-foreground">{item.detail}</div>
                        <div className="text-xs text-muted-foreground mt-1">{item.date}</div>
                      </div>
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadsManagement;