import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
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
  FileText,
  MoreHorizontal,
  CheckSquare,
  Megaphone,
  ArrowUp,
  ArrowDown,
  Plus,
  Upload
} from "lucide-react";
import { demoLeads, demoCampaigns } from "@/lib/demoData";
import { Lead } from "@/lib/types";
import { toast } from "@/hooks/use-toast";
import ReportUploadDialog from "./ReportUploadDialog";

interface AdminLeadsTableProps {
  searchQuery: string;
}

type SortDirection = "asc" | "desc" | null;

interface ColumnSort {
  field: string;
  direction: SortDirection;
}

const AdminLeadsTable = ({ searchQuery }: AdminLeadsTableProps) => {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [clientFilter, setClientFilter] = useState<string>("all");
  const [countryFilter, setCountryFilter] = useState<string>("all");
  const [scoreFilter, setScoreFilter] = useState<string>("all");
  const [columnSort, setColumnSort] = useState<ColumnSort>({ field: "createdAt", direction: "desc" });
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [leadStatuses, setLeadStatuses] = useState<Record<string, string>>({});
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [addLeadOpen, setAddLeadOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // New lead form state
  const [newLead, setNewLead] = useState({
    name: "",
    email: "",
    phone: "",
    country: "United Kingdom",
    budget: "",
    bedrooms: "",
    notes: "",
    campaignName: "",
  });

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
      case "new": return "New";
      case "contacted": return "Contacted";
      case "booked_viewing": return "Viewing Booked";
      case "offer": return "Offer Made";
      case "won": return "Won";
      case "lost": return "Lost";
      default: return status;
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
      if (!columnSort.direction) return 0;
      let comparison = 0;
      switch (columnSort.field) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "email":
          comparison = a.email.localeCompare(b.email);
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
        case "campaign":
          comparison = (a.campaignName || "").localeCompare(b.campaignName || "");
          break;
        case "status":
          comparison = getLeadStatus(a).localeCompare(getLeadStatus(b));
          break;
        default:
          comparison = 0;
      }
      return columnSort.direction === "asc" ? comparison : -comparison;
    });

  const exportToCSV = (leads: Lead[]) => {
    const headers = ["Name", "Email", "Phone", "Country", "Campaign", "Intent Score", "Quality Score", "Combined Score", "Status", "Budget", "Bedrooms", "Date", "Notes"];
    const rows = leads.map(lead => [
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
      description: `${leads.length} leads exported to CSV.`,
    });
  };

  const toggleSort = (field: string) => {
    if (columnSort.field === field) {
      if (columnSort.direction === "desc") {
        setColumnSort({ field, direction: "asc" });
      } else if (columnSort.direction === "asc") {
        setColumnSort({ field: "createdAt", direction: "desc" });
      }
    } else {
      setColumnSort({ field, direction: "desc" });
    }
  };

  const toggleSelectAll = () => {
    if (selectedLeads.size === filteredLeads.length) {
      setSelectedLeads(new Set());
    } else {
      setSelectedLeads(new Set(filteredLeads.map(l => l.id)));
    }
  };

  const toggleSelectLead = (leadId: string) => {
    const newSelected = new Set(selectedLeads);
    if (newSelected.has(leadId)) {
      newSelected.delete(leadId);
    } else {
      newSelected.add(leadId);
    }
    setSelectedLeads(newSelected);
  };

  const bulkUpdateStatus = (newStatus: string) => {
    const newStatuses = { ...leadStatuses };
    selectedLeads.forEach(id => {
      newStatuses[id] = newStatus;
    });
    setLeadStatuses(newStatuses);
    toast({
      title: "Bulk status update",
      description: `${selectedLeads.size} leads updated to ${getStatusLabel(newStatus)}.`,
    });
    setSelectedLeads(new Set());
  };

  const bulkExport = () => {
    const leadsToExport = filteredLeads.filter(l => selectedLeads.has(l.id));
    exportToCSV(leadsToExport);
    setSelectedLeads(new Set());
  };

  const bulkAssignToCampaign = (campaignName: string) => {
    toast({
      title: "Leads assigned",
      description: `${selectedLeads.size} leads assigned to "${campaignName}".`,
    });
    setSelectedLeads(new Set());
  };

  const handleAddLead = () => {
    if (!newLead.name || !newLead.email) {
      toast({
        title: "Validation error",
        description: "Name and email are required.",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Lead added",
      description: `${newLead.name} has been added successfully.`,
    });
    
    setNewLead({
      name: "",
      email: "",
      phone: "",
      country: "United Kingdom",
      budget: "",
      bedrooms: "",
      notes: "",
      campaignName: "",
    });
    setAddLeadOpen(false);
  };

  const handleCSVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (!file.name.endsWith('.csv')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV file.",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0]?.split(',').map(h => h.trim().toLowerCase());
      
      if (!headers?.includes('name') || !headers?.includes('email')) {
        toast({
          title: "Invalid CSV format",
          description: "CSV must include 'name' and 'email' columns.",
          variant: "destructive",
        });
        return;
      }
      
      const dataRows = lines.slice(1);
      toast({
        title: "Upload successful",
        description: `${dataRows.length} leads imported from CSV.`,
      });
      setUploadOpen(false);
    };
    reader.readAsText(file);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const renderSortIcon = (field: string) => {
    if (columnSort.field !== field) return <ArrowUpDown className="h-3 w-3 ml-1 opacity-50" />;
    if (columnSort.direction === "asc") return <ArrowUp className="h-3 w-3 ml-1" />;
    return <ArrowDown className="h-3 w-3 ml-1" />;
  };

  const ColumnHeader = ({ field, label, className = "" }: { field: string; label: string; className?: string }) => (
    <TableHead className={`text-xs ${className}`}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 -ml-3 text-xs font-medium">
            {label}
            {renderSortIcon(field)}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuLabel>Column Options</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setColumnSort({ field, direction: "asc" })}>
            <ArrowUp className="h-3 w-3 mr-2" /> Sort Ascending
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setColumnSort({ field, direction: "desc" })}>
            <ArrowDown className="h-3 w-3 mr-2" /> Sort Descending
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Filter className="h-3 w-3 mr-2" /> Filter
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              {field === "status" && (
                <>
                  <DropdownMenuItem onClick={() => setStatusFilter("all")}>All</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("new")}>New</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("contacted")}>Contacted</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("booked_viewing")}>Viewing Booked</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("won")}>Won</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("lost")}>Lost</DropdownMenuItem>
                </>
              )}
              {field === "country" && (
                <>
                  <DropdownMenuItem onClick={() => setCountryFilter("all")}>All Countries</DropdownMenuItem>
                  {uniqueCountries.map(c => (
                    <DropdownMenuItem key={c} onClick={() => setCountryFilter(c)}>{c}</DropdownMenuItem>
                  ))}
                </>
              )}
              {field === "campaign" && (
                <>
                  <DropdownMenuItem onClick={() => setClientFilter("all")}>All Campaigns</DropdownMenuItem>
                  {uniqueClients.map(c => (
                    <DropdownMenuItem key={c} onClick={() => setClientFilter(c!)}>{c}</DropdownMenuItem>
                  ))}
                </>
              )}
              {field === "score" && (
                <>
                  <DropdownMenuItem onClick={() => setScoreFilter("all")}>All Scores</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setScoreFilter("high")}>High (80+)</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setScoreFilter("medium")}>Medium (60-79)</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setScoreFilter("low")}>Low (&lt;60)</DropdownMenuItem>
                </>
              )}
              {!["status", "country", "campaign", "score"].includes(field) && (
                <DropdownMenuItem disabled>No filters available</DropdownMenuItem>
              )}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
    </TableHead>
  );

  return (
    <>
      <Card className="border-border/50">
        <CardHeader className="px-4 py-4 sm:px-6">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-lg font-semibold">
              All Leads
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({filteredLeads.length})
              </span>
            </CardTitle>
            <div className="flex items-center gap-2">
              {/* Report Upload */}
              <ReportUploadDialog 
                type="leads" 
                onUploadComplete={(data) => {
                  console.log("Lead report processed:", data);
                }} 
              />
              {/* Add Lead Dialog */}
              <Dialog open={addLeadOpen} onOpenChange={setAddLeadOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="h-9 gap-2">
                    <Plus className="h-4 w-4" />
                    Add Lead
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add New Lead</DialogTitle>
                    <DialogDescription>
                      Manually add a new lead to the system.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        value={newLead.name}
                        onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                        placeholder="John Smith"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newLead.email}
                        onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                        placeholder="john@example.com"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={newLead.phone}
                        onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                        placeholder="+44 7700 900000"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="country">Country</Label>
                        <Select
                          value={newLead.country}
                          onValueChange={(value) => setNewLead({ ...newLead, country: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                            <SelectItem value="United Arab Emirates">UAE</SelectItem>
                            <SelectItem value="Saudi Arabia">Saudi Arabia</SelectItem>
                            <SelectItem value="Qatar">Qatar</SelectItem>
                            <SelectItem value="Nigeria">Nigeria</SelectItem>
                            <SelectItem value="Ghana">Ghana</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="budget">Budget (£)</Label>
                        <Input
                          id="budget"
                          value={newLead.budget}
                          onChange={(e) => setNewLead({ ...newLead, budget: e.target.value })}
                          placeholder="500,000"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="bedrooms">Bedrooms</Label>
                        <Select
                          value={newLead.bedrooms}
                          onValueChange={(value) => setNewLead({ ...newLead, bedrooms: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1</SelectItem>
                            <SelectItem value="2">2</SelectItem>
                            <SelectItem value="3">3</SelectItem>
                            <SelectItem value="4+">4+</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="campaign">Campaign</Label>
                        <Select
                          value={newLead.campaignName}
                          onValueChange={(value) => setNewLead({ ...newLead, campaignName: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {demoCampaigns.map(c => (
                              <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        value={newLead.notes}
                        onChange={(e) => setNewLead({ ...newLead, notes: e.target.value })}
                        placeholder="Additional notes..."
                        rows={3}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setAddLeadOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddLead}>Add Lead</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              {/* Upload CSV Dialog */}
              <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9 gap-2">
                    <Upload className="h-4 w-4" />
                    Upload CSV
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Upload Leads CSV</DialogTitle>
                    <DialogDescription>
                      Import leads from a CSV file. Required columns: name, email.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                      <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                      <p className="text-sm text-muted-foreground mb-4">
                        Drag and drop your CSV file here, or click to browse
                      </p>
                      <Input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv"
                        onChange={handleCSVUpload}
                        className="max-w-[200px] mx-auto"
                      />
                    </div>
                    <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground">
                        <strong>CSV Format:</strong> name, email, phone, country, budget, bedrooms, notes
                      </p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setUploadOpen(false)}>
                      Cancel
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              <Button 
                onClick={() => exportToCSV(filteredLeads)} 
                variant="outline" 
                size="sm" 
                className="h-9 gap-2"
              >
                <Download className="h-4 w-4" />
                Export All
              </Button>
            </div>
          </div>

          {/* Bulk Actions Bar */}
          {selectedLeads.size > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
              <span className="text-sm font-medium text-primary">
                {selectedLeads.size} selected
              </span>
              <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
                      <CheckSquare className="h-3.5 w-3.5" />
                      Update Status
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem onClick={() => bulkUpdateStatus("new")}>New</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => bulkUpdateStatus("contacted")}>Contacted</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => bulkUpdateStatus("booked_viewing")}>Viewing Booked</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => bulkUpdateStatus("offer")}>Offer Made</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => bulkUpdateStatus("won")}>Won</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => bulkUpdateStatus("lost")}>Lost</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
                      <Megaphone className="h-3.5 w-3.5" />
                      Assign Campaign
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    {demoCampaigns.map(c => (
                      <DropdownMenuItem key={c.id} onClick={() => bulkAssignToCampaign(c.name)}>
                        {c.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={bulkExport}>
                  <Download className="h-3.5 w-3.5" />
                  Export
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 text-xs text-muted-foreground hover:text-foreground" 
                  onClick={() => setSelectedLeads(new Set())}
                >
                  Clear
                </Button>
              </div>
            </div>
          )}

          {/* Quick Filters Row */}
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <Filter className="h-4 w-4 text-muted-foreground hidden sm:block" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[130px] h-9 text-xs">
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
              <SelectTrigger className="w-[160px] h-9 text-xs">
                <SelectValue placeholder="Campaign" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Campaigns</SelectItem>
                {uniqueClients.map(client => (
                  <SelectItem key={client} value={client!}>{client}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={countryFilter} onValueChange={setCountryFilter}>
              <SelectTrigger className="w-[130px] h-9 text-xs">
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
              <SelectTrigger className="w-[130px] h-9 text-xs">
                <SelectValue placeholder="Score" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Scores</SelectItem>
                <SelectItem value="high">High (80+)</SelectItem>
                <SelectItem value="medium">Medium (60-79)</SelectItem>
                <SelectItem value="low">Low (&lt;60)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="w-12 pl-4">
                    <Checkbox
                      checked={selectedLeads.size === filteredLeads.length && filteredLeads.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <ColumnHeader field="name" label="Name" />
                  <ColumnHeader field="email" label="Email" className="hidden md:table-cell" />
                  <ColumnHeader field="country" label="Country" className="hidden lg:table-cell" />
                  <ColumnHeader field="campaign" label="Campaign" className="hidden sm:table-cell" />
                  <ColumnHeader field="score" label="Score" />
                  <ColumnHeader field="status" label="Status" />
                  <ColumnHeader field="createdAt" label="Date" className="hidden md:table-cell" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.map((lead) => (
                  <TableRow 
                    key={lead.id} 
                    className="cursor-pointer transition-colors hover:bg-muted/40"
                  >
                    <TableCell className="pl-4" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedLeads.has(lead.id)}
                        onCheckedChange={() => toggleSelectLead(lead.id)}
                      />
                    </TableCell>
                    <TableCell 
                      className="font-medium text-sm" 
                      onClick={() => setSelectedLead(lead)}
                    >
                      {lead.name}
                    </TableCell>
                    <TableCell 
                      className="text-sm text-muted-foreground hidden md:table-cell" 
                      onClick={() => setSelectedLead(lead)}
                    >
                      {lead.email}
                    </TableCell>
                    <TableCell 
                      className="text-sm hidden lg:table-cell" 
                      onClick={() => setSelectedLead(lead)}
                    >
                      {lead.country}
                    </TableCell>
                    <TableCell 
                      className="text-sm hidden sm:table-cell max-w-[150px] truncate" 
                      onClick={() => setSelectedLead(lead)}
                    >
                      {lead.campaignName}
                    </TableCell>
                    <TableCell onClick={() => setSelectedLead(lead)}>
                      <span className={`font-semibold text-sm ${getScoreColor(totalScore(lead))}`}>
                        {totalScore(lead)}
                      </span>
                    </TableCell>
                    <TableCell onClick={() => setSelectedLead(lead)}>
                      <Badge 
                        variant="outline" 
                        className={`text-xs whitespace-nowrap ${getStatusColor(getLeadStatus(lead))}`}
                      >
                        {getStatusLabel(getLeadStatus(lead))}
                      </Badge>
                    </TableCell>
                    <TableCell 
                      className="text-sm text-muted-foreground hidden md:table-cell" 
                      onClick={() => setSelectedLead(lead)}
                    >
                      {formatDate(lead.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {filteredLeads.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
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
                        className="text-xs gap-1"
                        onClick={() => updateLeadStatus(selectedLead.id, "won")}
                      >
                        <CheckCircle className="h-3 w-3" />
                        Won
                      </Button>
                      <Button 
                        variant={getLeadStatus(selectedLead) === "lost" ? "destructive" : "outline"} 
                        size="sm"
                        className="text-xs gap-1 col-span-2"
                        onClick={() => updateLeadStatus(selectedLead.id, "lost")}
                      >
                        <XCircle className="h-3 w-3" />
                        Mark as Lost
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Lead Scores */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Lead Scores
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-center mb-4">
                      <span className={`text-4xl font-bold ${getScoreColor(totalScore(selectedLead))}`}>
                        {totalScore(selectedLead)}
                      </span>
                      <p className="text-xs text-muted-foreground">Combined Score</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Intent Score</span>
                        <span className="font-medium">{selectedLead.intentScore}</span>
                      </div>
                      <Progress value={selectedLead.intentScore} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Quality Score</span>
                        <span className="font-medium">{selectedLead.qualityScore}</span>
                      </div>
                      <Progress value={selectedLead.qualityScore} className="h-2" />
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
                      <span className="text-sm">{selectedLead.country}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{formatDate(selectedLead.createdAt)}</span>
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
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Budget</p>
                        <p className="font-medium">{selectedLead.budget}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Bedrooms</p>
                        <p className="font-medium">{selectedLead.bedrooms}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-muted-foreground">Campaign Source</p>
                        <p className="font-medium">{selectedLead.campaignName}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Notes */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {selectedLead.notes || "No notes available for this lead."}
                    </p>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <div className="flex gap-2">
                  <Button className="flex-1 gap-2" variant="outline">
                    <Mail className="h-4 w-4" />
                    Email
                  </Button>
                  <Button className="flex-1 gap-2" variant="outline">
                    <Phone className="h-4 w-4" />
                    Call
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
