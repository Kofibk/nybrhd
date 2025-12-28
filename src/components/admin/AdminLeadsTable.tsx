import { useState, useRef, useMemo } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
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
import { 
  Download,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Plus,
  Upload,
  ExternalLink,
  LayoutGrid,
  LayoutList,
  Phone,
  Mail,
  Building2,
  Calendar,
  User,
  MessageSquare
} from "lucide-react";
// Demo data imports removed - using Airtable data
import { Lead } from "@/lib/types";
import { toast } from "@/hooks/use-toast";
import ReportUploadDialog from "./ReportUploadDialog";
import { LeadDetailDrawer } from "@/components/LeadDetailDrawer";
import { useUploadedData } from "@/contexts/DataContext";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AirtableLead {
  id: string;
  dateAdded: string;
  name: string;
  phone: string;
  email: string;
  budgetRange: string;
  preferredBedrooms: string;
  purchaseIn28Days: string;
  developmentName: string;
  brokerNeeded: string;
  agentTranscription: string;
  linkedinProfile: string;
  buyerSummary: string;
  status: string;
  source: string;
  campaignName: string;
  country: string;
  notes: string;
  intentScore: number;
  qualityScore: number;
  rawFields: { [key: string]: unknown };
}

interface AdminLeadsTableProps {
  searchQuery: string;
  airtableLeads?: AirtableLead[];
  airtableLoading?: boolean;
}

type SortDirection = "asc" | "desc" | null;

interface ColumnSort {
  field: string;
  direction: SortDirection;
}

type ViewMode = "table" | "cards";

const AdminLeadsTable = ({ searchQuery, airtableLeads = [], airtableLoading = false }: AdminLeadsTableProps) => {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [developmentFilter, setDevelopmentFilter] = useState<string>("all");
  const [columnSort, setColumnSort] = useState<ColumnSort>({ field: "dateAdded", direction: "desc" });
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [addLeadOpen, setAddLeadOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  
  // Get DataContext for syncing with dashboard
  const { setLeadData, setLeadFileName } = useUploadedData('admin');
  
  // Get unique statuses and developments from Airtable data
  const uniqueStatuses = useMemo(() => {
    const statuses = new Set<string>();
    airtableLeads.forEach(lead => {
      if (lead.status) statuses.add(lead.status);
    });
    return Array.from(statuses).sort();
  }, [airtableLeads]);

  const uniqueDevelopments = useMemo(() => {
    const developments = new Set<string>();
    airtableLeads.forEach(lead => {
      if (lead.developmentName) developments.add(lead.developmentName);
    });
    return Array.from(developments).sort();
  }, [airtableLeads]);
  
  // Convert Airtable leads to Lead format for the drawer
  const convertToLead = (al: AirtableLead): Lead => ({
    id: al.id,
    name: al.name,
    email: al.email,
    phone: al.phone,
    country: al.country,
    countryCode: al.country.substring(0, 2).toUpperCase(),
    budget: al.budgetRange,
    bedrooms: al.preferredBedrooms,
    status: 'new' as Lead['status'], // Use a default for the drawer
    source: (al.source || 'other') as Lead['source'],
    campaignId: al.campaignName || '',
    campaignName: al.campaignName,
    notes: al.notes || al.buyerSummary,
    createdAt: al.dateAdded,
    purchaseTimeline: '0_3_months' as Lead['purchaseTimeline'],
    intentScore: al.intentScore,
    qualityScore: al.qualityScore,
  });
  
  // Use Airtable leads - demo data removed
  const [localLeads] = useState<Lead[]>([]);
  const useAirtable = airtableLeads.length > 0;
  
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

  // Handle importing leads from file upload - also save to DataContext
  const handleLeadsImport = (importedLeads: Lead[]) => {
    // Convert to raw format and save to DataContext for dashboard
    const rawData = importedLeads.map(lead => ({
      'Name': lead.name,
      'Email': lead.email,
      'Phone': lead.phone,
      'Country': lead.country,
      'Budget': lead.budget,
      'Bedrooms': lead.bedrooms,
      'Timeline': lead.purchaseTimeline || '0-3 months',
      'Status': lead.status,
      'Source Platform': lead.source || 'Facebook',
      'Campaign': lead.campaignName,
      'Created Date': lead.createdAt,
    }));
    setLeadData(rawData);
    setLeadFileName('imported-leads.csv');
  };

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('new') || s.includes('fresh')) return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    if (s.includes('contact') || s.includes('reached') || s.includes('called')) return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
    if (s.includes('book') || s.includes('viewing') || s.includes('scheduled') || s.includes('meeting')) return "bg-purple-500/10 text-purple-500 border-purple-500/20";
    if (s.includes('offer') || s.includes('negotiat') || s.includes('proposal')) return "bg-orange-500/10 text-orange-500 border-orange-500/20";
    if (s.includes('won') || s.includes('closed') || s.includes('converted') || s.includes('sold')) return "bg-green-500/10 text-green-500 border-green-500/20";
    if (s.includes('lost') || s.includes('reject') || s.includes('dead') || s.includes('not interested')) return "bg-red-500/10 text-red-500 border-red-500/20";
    if (s.includes('follow') || s.includes('pending')) return "bg-cyan-500/10 text-cyan-500 border-cyan-500/20";
    if (s.includes('qualified') || s.includes('hot')) return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    return "bg-muted text-muted-foreground";
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const truncateText = (text: string, maxLength: number = 50) => {
    if (!text) return '-';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  // Filter Airtable leads
  const filteredAirtableLeads = airtableLeads
    .filter((lead) => {
      const matchesSearch =
        lead.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.developmentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.buyerSummary?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
      const matchesDevelopment = developmentFilter === "all" || lead.developmentName === developmentFilter;

      return matchesSearch && matchesStatus && matchesDevelopment;
    })
    .sort((a, b) => {
      if (!columnSort.direction) return 0;
      let comparison = 0;
      switch (columnSort.field) {
        case "name":
          comparison = (a.name || '').localeCompare(b.name || '');
          break;
        case "email":
          comparison = (a.email || '').localeCompare(b.email || '');
          break;
        case "dateAdded":
          comparison = new Date(a.dateAdded || 0).getTime() - new Date(b.dateAdded || 0).getTime();
          break;
        case "developmentName":
          comparison = (a.developmentName || '').localeCompare(b.developmentName || '');
          break;
        case "status":
          comparison = (a.status || '').localeCompare(b.status || '');
          break;
        default:
          comparison = 0;
      }
      return columnSort.direction === "asc" ? comparison : -comparison;
    });

  // Virtual scrolling setup
  const rowVirtualizer = useVirtualizer({
    count: filteredAirtableLeads.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 60,
    overscan: 10,
  });

  const exportToCSV = () => {
    const headers = [
      "Date Added", "Name", "Number", "Email", "Budget Range", "Preferred Bedrooms",
      "Purchase in 28 Days?", "Development Name", "Broker Needed?", "Agent Transcription",
      "LinkedIn/Company Profile", "Buyer Summary", "Status"
    ];
    const rows = filteredAirtableLeads.map(lead => [
      lead.dateAdded,
      lead.name,
      lead.phone,
      lead.email,
      lead.budgetRange,
      lead.preferredBedrooms,
      lead.purchaseIn28Days,
      lead.developmentName,
      lead.brokerNeeded,
      lead.agentTranscription,
      lead.linkedinProfile,
      lead.buyerSummary,
      lead.status
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${(cell || '').replace(/"/g, '""')}"`).join(","))
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
      description: `${filteredAirtableLeads.length} leads exported to CSV.`,
    });
  };

  const toggleSelectAll = () => {
    if (selectedLeads.size === filteredAirtableLeads.length) {
      setSelectedLeads(new Set());
    } else {
      setSelectedLeads(new Set(filteredAirtableLeads.map(l => l.id)));
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

  const bulkExport = () => {
    const leadsToExport = filteredAirtableLeads.filter(l => selectedLeads.has(l.id));
    // Export selected leads
    const headers = [
      "Date Added", "Name", "Number", "Email", "Budget Range", "Preferred Bedrooms",
      "Purchase in 28 Days?", "Development Name", "Broker Needed?", "Agent Transcription",
      "LinkedIn/Company Profile", "Buyer Summary", "Status"
    ];
    const rows = leadsToExport.map(lead => [
      lead.dateAdded,
      lead.name,
      lead.phone,
      lead.email,
      lead.budgetRange,
      lead.preferredBedrooms,
      lead.purchaseIn28Days,
      lead.developmentName,
      lead.brokerNeeded,
      lead.agentTranscription,
      lead.linkedinProfile,
      lead.buyerSummary,
      lead.status
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${(cell || '').replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `selected_leads_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export successful",
      description: `${leadsToExport.length} leads exported.`,
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

  const SortableHeader = ({ field, label, className = "" }: { field: string; label: string; className?: string }) => (
    <TableHead className={`text-xs whitespace-nowrap ${className}`}>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 -ml-3 text-xs font-medium"
        onClick={() => {
          if (columnSort.field === field) {
            setColumnSort({
              field,
              direction: columnSort.direction === "desc" ? "asc" : "desc"
            });
          } else {
            setColumnSort({ field, direction: "desc" });
          }
        }}
      >
        {label}
        {renderSortIcon(field)}
      </Button>
    </TableHead>
  );

  // Render Airtable leads table
  if (useAirtable) {
    return (
      <>
        <Card className="border-border/50 h-full flex flex-col">
          <CardHeader className="px-4 py-4 sm:px-6 flex-shrink-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                All Leads
                <span className="text-sm font-normal text-muted-foreground">
                  ({filteredAirtableLeads.length} of {airtableLeads.length})
                </span>
                {airtableLoading && (
                  <span className="text-xs text-muted-foreground animate-pulse">Syncing...</span>
                )}
                <Badge variant="outline" className="text-xs bg-primary/10 text-primary">Airtable</Badge>
              </CardTitle>
              <div className="flex items-center gap-2">
                {/* View Mode Toggle */}
                <div className="flex items-center border rounded-md overflow-hidden">
                  <Button
                    variant={viewMode === "table" ? "secondary" : "ghost"}
                    size="sm"
                    className="h-9 px-2.5 rounded-none"
                    onClick={() => setViewMode("table")}
                  >
                    <LayoutList className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "cards" ? "secondary" : "ghost"}
                    size="sm"
                    className="h-9 px-2.5 rounded-none"
                    onClick={() => setViewMode("cards")}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                </div>
                <ReportUploadDialog 
                  type="leads" 
                  onUploadComplete={(data) => {
                    const leads = (data?.leads || []) as Lead[];
                    if (leads.length > 0) {
                      handleLeadsImport(leads);
                    }
                  }}
                  onLeadsImport={handleLeadsImport}
                />
                <Button 
                  onClick={exportToCSV} 
                  variant="outline" 
                  size="sm" 
                  className="h-9 gap-2"
                >
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Export All</span>
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

            {/* Filters */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2 mt-4">
              <Filter className="h-4 w-4 text-muted-foreground hidden sm:block" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[160px] h-8 sm:h-9 text-xs">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses ({airtableLeads.length})</SelectItem>
                  {uniqueStatuses.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={developmentFilter} onValueChange={setDevelopmentFilter}>
                <SelectTrigger className="w-full sm:w-[180px] h-8 sm:h-9 text-xs">
                  <SelectValue placeholder="Development" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Developments</SelectItem>
                  {uniqueDevelopments.map(dev => (
                    <SelectItem key={dev} value={dev}>{dev}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>

          <CardContent className="p-0 flex-1 min-h-0 overflow-hidden">
            {viewMode === "cards" ? (
              /* Card View */
              <ScrollArea className="h-full">
                <div className="p-3 sm:p-4 space-y-3">
                  {filteredAirtableLeads.length === 0 && !airtableLoading ? (
                    <div className="text-center py-12 text-muted-foreground">
                      No leads found matching your criteria.
                    </div>
                  ) : (
                    filteredAirtableLeads.map((lead) => (
                      <div
                        key={lead.id}
                        className="bg-card border rounded-lg p-4 space-y-3 cursor-pointer hover:border-primary/50 transition-colors"
                        onClick={() => setSelectedLead(convertToLead(lead))}
                      >
                        {/* Header Row */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold text-sm truncate">{lead.name || 'Unknown'}</h3>
                              <Badge 
                                variant="outline" 
                                className={`text-[10px] shrink-0 ${getStatusColor(lead.status)}`}
                              >
                                {lead.status || 'Unknown'}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Added {formatDate(lead.dateAdded)}
                            </p>
                          </div>
                          <Checkbox
                            checked={selectedLeads.has(lead.id)}
                            onCheckedChange={() => toggleSelectLead(lead.id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>

                        {/* Contact Info */}
                        <div className="flex flex-wrap gap-3 text-xs">
                          {lead.phone && (
                            <a 
                              href={`tel:${lead.phone}`} 
                              className="flex items-center gap-1.5 text-muted-foreground hover:text-primary"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Phone className="h-3 w-3" />
                              <span>{lead.phone}</span>
                            </a>
                          )}
                          {lead.email && (
                            <a 
                              href={`mailto:${lead.email}`} 
                              className="flex items-center gap-1.5 text-muted-foreground hover:text-primary truncate max-w-[180px]"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Mail className="h-3 w-3 shrink-0" />
                              <span className="truncate">{lead.email}</span>
                            </a>
                          )}
                        </div>

                        {/* Key Details Grid */}
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {lead.developmentName && (
                            <div className="flex items-center gap-1.5">
                              <Building2 className="h-3 w-3 text-muted-foreground shrink-0" />
                              <span className="truncate">{lead.developmentName}</span>
                            </div>
                          )}
                          {lead.budgetRange && (
                            <div className="flex items-center gap-1.5">
                              <span className="text-muted-foreground">Budget:</span>
                              <span className="font-medium">{lead.budgetRange}</span>
                            </div>
                          )}
                          {lead.preferredBedrooms && (
                            <div className="flex items-center gap-1.5">
                              <span className="text-muted-foreground">Beds:</span>
                              <span>{lead.preferredBedrooms}</span>
                            </div>
                          )}
                          {lead.purchaseIn28Days && (
                            <div className="flex items-center gap-1.5">
                              <Calendar className="h-3 w-3 text-muted-foreground shrink-0" />
                              <span className={lead.purchaseIn28Days.toLowerCase().includes('yes') ? 'text-green-600 font-medium' : ''}>
                                {lead.purchaseIn28Days}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Summary */}
                        {lead.buyerSummary && (
                          <div className="text-xs text-muted-foreground border-t pt-2">
                            <div className="flex items-start gap-1.5">
                              <MessageSquare className="h-3 w-3 mt-0.5 shrink-0" />
                              <p className="line-clamp-2">{lead.buyerSummary}</p>
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 pt-1 border-t">
                          {lead.phone && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs flex-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(`tel:${lead.phone}`, '_blank');
                              }}
                            >
                              <Phone className="h-3 w-3 mr-1" />
                              Call
                            </Button>
                          )}
                          {lead.phone && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs flex-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(`https://wa.me/${lead.phone.replace(/\D/g, '')}`, '_blank');
                              }}
                            >
                              <MessageSquare className="h-3 w-3 mr-1" />
                              WhatsApp
                            </Button>
                          )}
                          {lead.linkedinProfile && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(
                                  lead.linkedinProfile.startsWith('http') ? lead.linkedinProfile : `https://${lead.linkedinProfile}`,
                                  '_blank'
                                );
                              }}
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            ) : (
              /* Table View */
              <>
                {/* Mobile hint */}
                <div className="sm:hidden px-4 py-2 bg-muted/30 border-b text-xs text-muted-foreground flex items-center gap-2">
                  <span>← Scroll horizontally to see all columns →</span>
                </div>
                <div ref={tableContainerRef} className="overflow-auto h-full">
                  <Table className="min-w-[1400px]">
                    <TableHeader className="sticky top-0 z-10 bg-card">
                      <TableRow className="bg-muted/30 hover:bg-muted/30">
                        <TableHead className="w-10 sm:w-12 pl-2 sm:pl-4">
                          <Checkbox
                            checked={selectedLeads.size === filteredAirtableLeads.length && filteredAirtableLeads.length > 0}
                            onCheckedChange={toggleSelectAll}
                          />
                        </TableHead>
                        <SortableHeader field="dateAdded" label="Date" />
                        <SortableHeader field="name" label="Name" />
                        <TableHead className="text-xs whitespace-nowrap">Number</TableHead>
                        <SortableHeader field="email" label="Email" />
                        <TableHead className="text-xs whitespace-nowrap">Budget</TableHead>
                        <TableHead className="text-xs whitespace-nowrap">Beds</TableHead>
                        <TableHead className="text-xs whitespace-nowrap">28 Days?</TableHead>
                        <SortableHeader field="developmentName" label="Development" />
                        <TableHead className="text-xs whitespace-nowrap">Broker?</TableHead>
                        <TableHead className="text-xs whitespace-nowrap min-w-[180px]">Transcription</TableHead>
                        <TableHead className="text-xs whitespace-nowrap">LinkedIn</TableHead>
                        <TableHead className="text-xs whitespace-nowrap min-w-[180px]">Summary</TableHead>
                        <SortableHeader field="status" label="Status" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <tr style={{ height: `${rowVirtualizer.getVirtualItems()[0]?.start ?? 0}px` }} />
                      {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                        const lead = filteredAirtableLeads[virtualRow.index];
                        if (!lead) return null;
                        return (
                          <TableRow 
                            key={lead.id}
                            data-index={virtualRow.index}
                            className="cursor-pointer transition-colors hover:bg-muted/40"
                            style={{ height: `${virtualRow.size}px` }}
                          >
                            <TableCell className="pl-2 sm:pl-4" onClick={(e) => e.stopPropagation()}>
                              <Checkbox
                                checked={selectedLeads.has(lead.id)}
                                onCheckedChange={() => toggleSelectLead(lead.id)}
                              />
                            </TableCell>
                            <TableCell className="text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap">
                              {formatDate(lead.dateAdded)}
                            </TableCell>
                            <TableCell 
                              className="font-medium text-xs sm:text-sm whitespace-nowrap" 
                              onClick={() => setSelectedLead(convertToLead(lead))}
                            >
                              {lead.name || '-'}
                            </TableCell>
                            <TableCell className="text-[10px] sm:text-xs whitespace-nowrap">
                              {lead.phone || '-'}
                            </TableCell>
                            <TableCell className="text-[10px] sm:text-xs text-muted-foreground max-w-[120px] truncate">
                              {lead.email || '-'}
                            </TableCell>
                            <TableCell className="text-[10px] sm:text-xs whitespace-nowrap">
                              {lead.budgetRange || '-'}
                            </TableCell>
                            <TableCell className="text-[10px] sm:text-xs text-center">
                              {lead.preferredBedrooms || '-'}
                            </TableCell>
                            <TableCell className="text-[10px] sm:text-xs whitespace-nowrap">
                              {lead.purchaseIn28Days || '-'}
                            </TableCell>
                            <TableCell className="text-[10px] sm:text-xs max-w-[120px] truncate">
                              {lead.developmentName || '-'}
                            </TableCell>
                            <TableCell className="text-[10px] sm:text-xs whitespace-nowrap">
                              {lead.brokerNeeded || '-'}
                            </TableCell>
                            <TableCell className="text-[10px] sm:text-xs max-w-[180px]">
                              <span title={lead.agentTranscription}>
                                {truncateText(lead.agentTranscription, 50)}
                              </span>
                            </TableCell>
                            <TableCell className="text-[10px] sm:text-xs">
                              {lead.linkedinProfile ? (
                                <a 
                                  href={lead.linkedinProfile.startsWith('http') ? lead.linkedinProfile : `https://${lead.linkedinProfile}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline inline-flex items-center gap-1"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <ExternalLink className="h-3 w-3" />
                                  <span className="hidden sm:inline">View</span>
                                </a>
                              ) : '-'}
                            </TableCell>
                            <TableCell className="text-[10px] sm:text-xs max-w-[180px]">
                              <span title={lead.buyerSummary}>
                                {truncateText(lead.buyerSummary, 50)}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant="outline" 
                                className={`text-[10px] sm:text-xs whitespace-nowrap ${getStatusColor(lead.status)}`}
                              >
                                {lead.status || 'Unknown'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      <tr style={{ height: `${rowVirtualizer.getTotalSize() - (rowVirtualizer.getVirtualItems()[rowVirtualizer.getVirtualItems().length - 1]?.end ?? 0)}px` }} />
                    </TableBody>
                  </Table>
                </div>
                {filteredAirtableLeads.length === 0 && !airtableLoading && (
                  <div className="text-center py-12 text-muted-foreground">
                    No leads found matching your criteria.
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <LeadDetailDrawer 
          lead={selectedLead} 
          open={!!selectedLead} 
          onClose={() => setSelectedLead(null)} 
        />
      </>
    );
  }

  // Fallback to demo leads table (original implementation)
  const filteredDemoLeads = localLeads
    .filter((lead) => {
      const matchesSearch =
        lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });

  return (
    <>
      <Card className="border-border/50 h-full flex flex-col">
        <CardHeader className="px-4 py-4 sm:px-6 flex-shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              All Leads
              <span className="text-sm font-normal text-muted-foreground">
                ({filteredDemoLeads.length})
              </span>
              <Badge variant="outline" className="text-xs">Demo Data</Badge>
            </CardTitle>
            <div className="flex items-center gap-2">
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
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setAddLeadOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddLead}>Add Lead</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
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
                      Import leads from a CSV file.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv"
                      onChange={handleCSVUpload}
                    />
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setUploadOpen(false)}>
                      Cancel
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 flex-1 min-h-0 overflow-hidden">
          <ScrollArea className="h-full">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-card">
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="text-xs">Name</TableHead>
                  <TableHead className="text-xs">Email</TableHead>
                  <TableHead className="text-xs">Phone</TableHead>
                  <TableHead className="text-xs">Country</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDemoLeads.map((lead) => (
                  <TableRow key={lead.id} className="cursor-pointer hover:bg-muted/40">
                    <TableCell className="font-medium text-sm">{lead.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{lead.email}</TableCell>
                    <TableCell className="text-sm">{lead.phone}</TableCell>
                    <TableCell className="text-sm">{lead.country}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {lead.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </>
  );
};

export default AdminLeadsTable;
