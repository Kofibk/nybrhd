import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  TrendingUp,
  User,
  Building,
  MessageSquare,
  Download,
  Filter,
  ArrowUpDown,
  ChevronDown,
  CheckCircle,
  XCircle,
  Eye,
  Clock,
  FileText
} from "lucide-react";
import { demoLeads } from "@/lib/demoData";
import { Lead } from "@/lib/types";
import { toast } from "@/hooks/use-toast";

interface AdminLeadsTableProps {
  searchQuery: string;
}

const AdminLeadsTable = ({ searchQuery }: AdminLeadsTableProps) => {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [clientFilter, setClientFilter] = useState<string>("all");
  const [countryFilter, setCountryFilter] = useState<string>("all");
  const [scoreFilter, setScoreFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<string>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [leadStatuses, setLeadStatuses] = useState<Record<string, string>>({});

  // Get unique clients/campaigns for filter
  const uniqueClients = [...new Set(demoLeads.map(lead => lead.campaignName))].filter(Boolean);
  const uniqueCountries = [...new Set(demoLeads.map(lead => lead.country))];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "contacted":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "booked_viewing":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      case "offer":
        return "bg-orange-500/10 text-orange-500 border-orange-500/20";
      case "won":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "lost":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "new":
        return "New";
      case "contacted":
        return "Contacted";
      case "booked_viewing":
        return "Viewing Booked";
      case "offer":
        return "Offer Made";
      case "won":
        return "Won";
      case "lost":
        return "Lost";
      default:
        return status;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const totalScore = (lead: Lead) => Math.round((lead.intentScore + lead.qualityScore) / 2);

  const getLeadStatus = (lead: Lead) => leadStatuses[lead.id] || lead.status;

  const updateLeadStatus = (leadId: string, newStatus: string) => {
    setLeadStatuses(prev => ({ ...prev, [leadId]: newStatus }));
    if (selectedLead?.id === leadId) {
      setSelectedLead({ ...selectedLead, status: newStatus as Lead["status"] });
    }
    toast({
      title: "Status updated",
      description: `Lead status changed to ${getStatusLabel(newStatus)}.`,
    });
  };

  const filteredLeads = demoLeads
    .filter((lead) => {
      const matchesSearch =
        lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.campaignName?.toLowerCase().includes(searchQuery.toLowerCase());

      const currentStatus = getLeadStatus(lead);
      const matchesStatus = statusFilter === "all" || currentStatus === statusFilter;
      const matchesClient = clientFilter === "all" || lead.campaignName === clientFilter;
      const matchesCountry = countryFilter === "all" || lead.country === countryFilter;
      
      const score = totalScore(lead);
      let matchesScore = true;
      if (scoreFilter === "high") matchesScore = score >= 80;
      else if (scoreFilter === "medium") matchesScore = score >= 60 && score < 80;
      else if (scoreFilter === "low") matchesScore = score < 60;

      return matchesSearch && matchesStatus && matchesClient && matchesCountry && matchesScore;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "score":
          comparison = totalScore(a) - totalScore(b);
          break;
        case "createdAt":
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case "country":
          comparison = a.country.localeCompare(b.country);
          break;
        default:
          comparison = 0;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });

  const exportToCSV = () => {
    const headers = ["Name", "Email", "Phone", "Country", "Campaign", "Intent Score", "Quality Score", "Combined Score", "Status", "Budget", "Bedrooms", "Date", "Notes"];
    const rows = filteredLeads.map(lead => [
      lead.name,
      lead.email,
      lead.phone,
      lead.country,
      lead.campaignName || "",
      lead.intentScore,
      lead.qualityScore,
      totalScore(lead),
      getStatusLabel(getLeadStatus(lead)),
      lead.budget,
      lead.bedrooms,
      formatDate(lead.createdAt),
      lead.notes || ""
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `leads_export_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export successful",
      description: `${filteredLeads.length} leads exported to CSV.`,
    });
  };

  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row justify-between gap-3">
              <CardTitle className="text-base md:text-lg">All Leads ({filteredLeads.length})</CardTitle>
              <Button onClick={exportToCSV} variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            </div>
            
            {/* Filters Row */}
            <div className="flex flex-wrap gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-36 h-8 text-xs">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="booked_viewing">Viewing Booked</SelectItem>
                  <SelectItem value="offer">Offer Made</SelectItem>
                  <SelectItem value="won">Won</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                </SelectContent>
              </Select>

              <Select value={clientFilter} onValueChange={setClientFilter}>
                <SelectTrigger className="w-full sm:w-44 h-8 text-xs">
                  <SelectValue placeholder="Client/Campaign" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Clients</SelectItem>
                  {uniqueClients.map(client => (
                    <SelectItem key={client} value={client!}>{client}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={countryFilter} onValueChange={setCountryFilter}>
                <SelectTrigger className="w-full sm:w-36 h-8 text-xs">
                  <SelectValue placeholder="Country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>
                  {uniqueCountries.map(country => (
                    <SelectItem key={country} value={country}>{country}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={scoreFilter} onValueChange={setScoreFilter}>
                <SelectTrigger className="w-full sm:w-36 h-8 text-xs">
                  <SelectValue placeholder="Score" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Scores</SelectItem>
                  <SelectItem value="high">High (80+)</SelectItem>
                  <SelectItem value="medium">Medium (60-79)</SelectItem>
                  <SelectItem value="low">Low (&lt;60)</SelectItem>
                </SelectContent>
              </Select>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 gap-1 text-xs">
                    <ArrowUpDown className="h-3 w-3" />
                    Sort
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => toggleSort("createdAt")}>
                    Date {sortField === "createdAt" && (sortDirection === "asc" ? "↑" : "↓")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toggleSort("name")}>
                    Name {sortField === "name" && (sortDirection === "asc" ? "↑" : "↓")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toggleSort("score")}>
                    Score {sortField === "score" && (sortDirection === "asc" ? "↑" : "↓")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toggleSort("country")}>
                    Country {sortField === "country" && (sortDirection === "asc" ? "↑" : "↓")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs cursor-pointer" onClick={() => toggleSort("name")}>
                    Name {sortField === "name" && (sortDirection === "asc" ? "↑" : "↓")}
                  </TableHead>
                  <TableHead className="text-xs hidden md:table-cell">Email</TableHead>
                  <TableHead className="text-xs hidden lg:table-cell cursor-pointer" onClick={() => toggleSort("country")}>
                    Country {sortField === "country" && (sortDirection === "asc" ? "↑" : "↓")}
                  </TableHead>
                  <TableHead className="text-xs hidden sm:table-cell">Campaign</TableHead>
                  <TableHead className="text-xs cursor-pointer" onClick={() => toggleSort("score")}>
                    Score {sortField === "score" && (sortDirection === "asc" ? "↑" : "↓")}
                  </TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs hidden md:table-cell cursor-pointer" onClick={() => toggleSort("createdAt")}>
                    Date {sortField === "createdAt" && (sortDirection === "asc" ? "↑" : "↓")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.map((lead) => (
                  <TableRow 
                    key={lead.id} 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setSelectedLead(lead)}
                  >
                    <TableCell className="font-medium text-xs md:text-sm">
                      {lead.name}
                    </TableCell>
                    <TableCell className="text-xs md:text-sm hidden md:table-cell">
                      {lead.email}
                    </TableCell>
                    <TableCell className="text-xs md:text-sm hidden lg:table-cell">
                      {lead.country}
                    </TableCell>
                    <TableCell className="text-xs md:text-sm hidden sm:table-cell max-w-[150px] truncate">
                      {lead.campaignName}
                    </TableCell>
                    <TableCell>
                      <span className={`font-semibold text-xs md:text-sm ${getScoreColor(totalScore(lead))}`}>
                        {totalScore(lead)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[10px] md:text-xs ${getStatusColor(getLeadStatus(lead))}`}>
                        {getStatusLabel(getLeadStatus(lead))}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs md:text-sm hidden md:table-cell">
                      {formatDate(lead.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {filteredLeads.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No leads found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lead Profile Drawer */}
      <Sheet open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {selectedLead && (
            <>
              <SheetHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <SheetTitle className="text-xl">{selectedLead.name}</SheetTitle>
                    <Badge variant="outline" className={`mt-2 ${getStatusColor(getLeadStatus(selectedLead))}`}>
                      {getStatusLabel(getLeadStatus(selectedLead))}
                    </Badge>
                  </div>
                </div>
              </SheetHeader>

              <div className="space-y-6">
                {/* Status Update Actions */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Update Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        variant={getLeadStatus(selectedLead) === "contacted" ? "default" : "outline"} 
                        size="sm"
                        className="text-xs"
                        onClick={() => updateLeadStatus(selectedLead.id, "contacted")}
                      >
                        <Phone className="h-3 w-3 mr-1" />
                        Contacted
                      </Button>
                      <Button 
                        variant={getLeadStatus(selectedLead) === "booked_viewing" ? "default" : "outline"} 
                        size="sm"
                        className="text-xs"
                        onClick={() => updateLeadStatus(selectedLead.id, "booked_viewing")}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Book Viewing
                      </Button>
                      <Button 
                        variant={getLeadStatus(selectedLead) === "offer" ? "default" : "outline"} 
                        size="sm"
                        className="text-xs"
                        onClick={() => updateLeadStatus(selectedLead.id, "offer")}
                      >
                        <Clock className="h-3 w-3 mr-1" />
                        Offer Made
                      </Button>
                      <Button 
                        variant={getLeadStatus(selectedLead) === "won" ? "default" : "outline"} 
                        size="sm"
                        className="text-xs text-green-600"
                        onClick={() => updateLeadStatus(selectedLead.id, "won")}
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Won
                      </Button>
                      <Button 
                        variant={getLeadStatus(selectedLead) === "lost" ? "default" : "outline"} 
                        size="sm"
                        className="text-xs text-red-600 col-span-2"
                        onClick={() => updateLeadStatus(selectedLead.id, "lost")}
                      >
                        <XCircle className="h-3 w-3 mr-1" />
                        Mark as Lost
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Scores Section */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Lead Scores
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <span className={`text-4xl font-bold ${getScoreColor(totalScore(selectedLead))}`}>
                        {totalScore(selectedLead)}
                      </span>
                      <p className="text-xs text-muted-foreground mt-1">Combined Score</p>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Intent Score</span>
                          <span className={getScoreColor(selectedLead.intentScore)}>
                            {selectedLead.intentScore}
                          </span>
                        </div>
                        <Progress value={selectedLead.intentScore} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Quality Score</span>
                          <span className={getScoreColor(selectedLead.qualityScore)}>
                            {selectedLead.qualityScore}
                          </span>
                        </div>
                        <Progress value={selectedLead.qualityScore} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Contact Information */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Contact Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedLead.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedLead.phone}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedLead.country}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{formatDate(selectedLead.createdAt)}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Preferences */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      Preferences
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Budget</span>
                      <span className="font-medium">{selectedLead.budget}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Bedrooms</span>
                      <span className="font-medium">{selectedLead.bedrooms}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Campaign Source</span>
                      <span className="font-medium truncate max-w-[180px]">{selectedLead.campaignName}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Notes */}
                {selectedLead.notes && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Notes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{selectedLead.notes}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col gap-2 pt-2">
                  <Button className="w-full" variant="default">
                    <Mail className="h-4 w-4 mr-2" />
                    Send Email
                  </Button>
                  <Button className="w-full" variant="outline">
                    <Phone className="h-4 w-4 mr-2" />
                    Call Lead
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};

export default AdminLeadsTable;