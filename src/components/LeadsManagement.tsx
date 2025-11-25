import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, Mail, Phone, MapPin, TrendingUp, Target, Calendar, 
  DollarSign, Home, MessageSquare, Filter, Search, Download 
} from "lucide-react";
import { useState } from "react";

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  profileScore: number;
  intentScore: number;
  status: "new" | "qualified" | "viewing" | "offer" | "closed";
  source: string;
  budget: string;
  propertyType: string;
  timeline: string;
  lastActivity: string;
  interactions: number;
  notes: string;
}

const LeadsManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const mockLeads: Lead[] = [
    {
      id: "1",
      name: "James Okonkwo",
      email: "james.o@example.com",
      phone: "+234 801 234 5678",
      location: "Lagos, Nigeria",
      profileScore: 85,
      intentScore: 78,
      status: "qualified",
      source: "Meta Campaign - Lagos HNW",
      budget: "£800k - £1.2M",
      propertyType: "3-4 bed apartment",
      timeline: "3-6 months",
      lastActivity: "2 hours ago",
      interactions: 12,
      notes: "Interested in waterfront properties. Looking to relocate from Lagos."
    },
    {
      id: "2",
      name: "Sarah Mitchell",
      email: "sarah.m@example.com",
      phone: "+44 7700 900123",
      location: "London, UK",
      profileScore: 72,
      intentScore: 91,
      status: "viewing",
      source: "Google Ads - UK Investors",
      budget: "£500k - £750k",
      propertyType: "2 bed apartment",
      timeline: "Immediate",
      lastActivity: "1 day ago",
      interactions: 18,
      notes: "First-time buyer, very engaged. Scheduled viewing for Marina Heights."
    },
    {
      id: "3",
      name: "Ahmed Al-Rashid",
      email: "ahmed.r@example.com",
      phone: "+971 50 123 4567",
      location: "Dubai, UAE",
      profileScore: 90,
      intentScore: 85,
      status: "offer",
      source: "LinkedIn - Dubai Expats",
      budget: "£1.5M - £2M",
      propertyType: "Penthouse",
      timeline: "1-2 months",
      lastActivity: "3 hours ago",
      interactions: 24,
      notes: "Made offer on Skyline Tower penthouse. Awaiting developer response."
    },
    {
      id: "4",
      name: "Jennifer Wong",
      email: "jenny.w@example.com",
      phone: "+65 9123 4567",
      location: "Singapore",
      profileScore: 68,
      intentScore: 82,
      status: "new",
      source: "Website - Organic Search",
      budget: "£600k - £900k",
      propertyType: "2-3 bed apartment",
      timeline: "6-12 months",
      lastActivity: "5 hours ago",
      interactions: 5,
      notes: "Exploring investment opportunities in UK property market."
    },
    {
      id: "5",
      name: "Marcus Thompson",
      email: "marcus.t@example.com",
      phone: "+1 555 0123",
      location: "New York, USA",
      profileScore: 79,
      intentScore: 76,
      status: "qualified",
      source: "Instagram Ads",
      budget: "£700k - £1M",
      propertyType: "3 bed house",
      timeline: "3-6 months",
      lastActivity: "1 day ago",
      interactions: 9,
      notes: "Interested in areas with good schools. Family of 4."
    }
  ];

  const getScoreColor = (score: number) => {
    if (score >= 75) return "text-green-600";
    if (score >= 50) return "text-yellow-600";
    return "text-muted-foreground";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new": return "default";
      case "qualified": return "secondary";
      case "viewing": return "default";
      case "offer": return "default";
      case "closed": return "default";
      default: return "default";
    }
  };

  const filteredLeads = mockLeads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header & Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Lead Management</h2>
          <p className="text-muted-foreground">Track and manage your buyer pipeline</p>
        </div>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Export Leads
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search leads by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="qualified">Qualified</SelectItem>
            <SelectItem value="viewing">Viewing</SelectItem>
            <SelectItem value="offer">Offer</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Total Leads", value: mockLeads.length, color: "text-primary" },
          { label: "New", value: mockLeads.filter(l => l.status === "new").length, color: "text-blue-600" },
          { label: "Qualified", value: mockLeads.filter(l => l.status === "qualified").length, color: "text-yellow-600" },
          { label: "Viewing", value: mockLeads.filter(l => l.status === "viewing").length, color: "text-orange-600" },
          { label: "Offer", value: mockLeads.filter(l => l.status === "offer").length, color: "text-green-600" }
        ].map((stat) => (
          <Card key={stat.label} className="p-4">
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
          </Card>
        ))}
      </div>

      {/* Leads List & Detail View */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Leads List */}
        <div className="space-y-4">
          <h3 className="font-bold text-lg">All Leads ({filteredLeads.length})</h3>
          <div className="space-y-3 max-h-[800px] overflow-y-auto">
            {filteredLeads.map((lead) => (
              <Card 
                key={lead.id} 
                className={`p-4 cursor-pointer transition-all hover:shadow-lg ${
                  selectedLead?.id === lead.id ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => setSelectedLead(lead)}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-bold text-lg">{lead.name}</h4>
                    <Badge variant={getStatusColor(lead.status)} className="capitalize mt-1">
                      {lead.status}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${getScoreColor((lead.profileScore + lead.intentScore) / 2)}`}>
                      {Math.round((lead.profileScore + lead.intentScore) / 2)}
                    </div>
                    <div className="text-xs text-muted-foreground">Total Score</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Profile</div>
                    <Progress value={lead.profileScore} className="h-2" />
                    <div className="text-xs font-medium mt-1">{lead.profileScore}%</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Intent</div>
                    <Progress value={lead.intentScore} className="h-2" />
                    <div className="text-xs font-medium mt-1">{lead.intentScore}%</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {lead.lastActivity}
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" />
                    {lead.interactions} interactions
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Lead Detail Panel */}
        <div>
          {selectedLead ? (
            <Card className="p-6 sticky top-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold mb-2">{selectedLead.name}</h3>
                  <Badge variant={getStatusColor(selectedLead.status)} className="capitalize">
                    {selectedLead.status}
                  </Badge>
                </div>
                <Button size="sm">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Contact
                </Button>
              </div>

              <Tabs defaultValue="overview" className="space-y-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="scoring">Scoring</TabsTrigger>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div>
                    <h4 className="font-bold mb-3">Contact Information</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{selectedLead.email}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{selectedLead.phone}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{selectedLead.location}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{selectedLead.source}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold mb-3">Buyer Profile</h4>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <DollarSign className="h-4 w-4 text-muted-foreground mt-1" />
                        <div>
                          <div className="text-sm font-medium">Budget</div>
                          <div className="text-sm text-muted-foreground">{selectedLead.budget}</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Home className="h-4 w-4 text-muted-foreground mt-1" />
                        <div>
                          <div className="text-sm font-medium">Property Type</div>
                          <div className="text-sm text-muted-foreground">{selectedLead.propertyType}</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Calendar className="h-4 w-4 text-muted-foreground mt-1" />
                        <div>
                          <div className="text-sm font-medium">Timeline</div>
                          <div className="text-sm text-muted-foreground">{selectedLead.timeline}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold mb-2">Notes</h4>
                    <p className="text-sm text-muted-foreground">{selectedLead.notes}</p>
                  </div>
                </TabsContent>

                <TabsContent value="scoring" className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-bold">Profile Score</h4>
                      <span className={`text-2xl font-bold ${getScoreColor(selectedLead.profileScore)}`}>
                        {selectedLead.profileScore}%
                      </span>
                    </div>
                    <Progress value={selectedLead.profileScore} className="h-3 mb-4" />
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Budget Match</span>
                        <span className="font-medium">High</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Location Fit</span>
                        <span className="font-medium">Medium</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Financial Verification</span>
                        <span className="font-medium">Verified</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-bold">Intent Score</h4>
                      <span className={`text-2xl font-bold ${getScoreColor(selectedLead.intentScore)}`}>
                        {selectedLead.intentScore}%
                      </span>
                    </div>
                    <Progress value={selectedLead.intentScore} className="h-3 mb-4" />
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Engagement Level</span>
                        <span className="font-medium">Very High</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Response Time</span>
                        <span className="font-medium">Fast</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Timeline Urgency</span>
                        <span className="font-medium">{selectedLead.timeline}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-primary/5 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      <h4 className="font-bold">AI Recommendation</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      This lead shows high buying intent. Recommend scheduling a viewing within the next 48 hours 
                      and highlighting properties in their budget range with their preferred features.
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="activity" className="space-y-3">
                  <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {[
                      { time: "2 hours ago", action: "Viewed property listing", detail: "Marina Heights - Unit 405" },
                      { time: "1 day ago", action: "Downloaded brochure", detail: "Development Overview PDF" },
                      { time: "2 days ago", action: "Responded to email", detail: "Inquiry about payment plans" },
                      { time: "3 days ago", action: "Clicked email link", detail: "Virtual tour invitation" },
                      { time: "5 days ago", action: "Submitted inquiry form", detail: "Website contact form" }
                    ].map((activity, index) => (
                      <div key={index} className="p-3 bg-secondary/50 rounded-lg">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-medium text-sm">{activity.action}</span>
                          <span className="text-xs text-muted-foreground">{activity.time}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{activity.detail}</p>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          ) : (
            <Card className="p-12 text-center">
              <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Select a Lead</h3>
              <p className="text-muted-foreground">
                Click on a lead from the list to view detailed information and scoring
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeadsManagement;
