import { useState, useRef, useMemo } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Download,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  LayoutGrid,
  LayoutList,
  Phone,
  Mail,
  Building2,
  Calendar,
  MessageSquare,
  MoreHorizontal,
  Eye,
  Flame,
  Star,
  Zap,
  CheckCircle,
  Snowflake
} from "lucide-react";
import { Lead } from "@/lib/types";
import { toast } from "@/hooks/use-toast";
import { LeadDetailDrawer } from "@/components/LeadDetailDrawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAirtableBuyersForTable } from "@/hooks/useAirtableBuyers";

interface DeveloperLeadsTableProps {
  searchQuery: string;
}

type SortDirection = "asc" | "desc" | null;

interface ColumnSort {
  field: string;
  direction: SortDirection;
}

type ViewMode = "table" | "cards";

// Map developer lead data to table-friendly format
interface DeveloperLead {
  id: string;
  dateAdded: string;
  name: string;
  phone: string;
  email: string;
  budgetRange: string;
  preferredBedrooms: string;
  developmentName: string;
  status: string;
  source: string;
  timeline: string;
  leadScore: number;
  notes: string;
}

const DeveloperLeadsTable = ({ searchQuery }: DeveloperLeadsTableProps) => {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [developmentFilter, setDevelopmentFilter] = useState<string>("all");
  const [columnSort, setColumnSort] = useState<ColumnSort>({ field: "dateAdded", direction: "desc" });
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const tableContainerRef = useRef<HTMLDivElement>(null);

  // Fetch real data from Airtable
  const { buyers: airtableBuyers, isLoading: airtableLoading } = useAirtableBuyersForTable({ enabled: true });
  
  // Convert Airtable data to lead format
  const leads: DeveloperLead[] = useMemo(() => {
    return airtableBuyers.map((buyer, index) => ({
      id: buyer.id || `lead-${index}`,
      dateAdded: buyer.createdTime || new Date().toISOString(),
      name: buyer.name || "Unknown",
      phone: buyer.phone || "",
      email: buyer.email || "",
      budgetRange: buyer.budgetRange || "",
      preferredBedrooms: buyer.bedrooms || "",
      developmentName: buyer.location || "",
      status: buyer.status || "New",
      source: "Airtable",
      timeline: buyer.timeline || "",
      leadScore: buyer.score || 50,
      notes: "",
    }));
  }, [airtableBuyers]);

  // Get unique statuses and developments
  const uniqueStatuses = useMemo(() => {
    const statuses = new Set<string>();
    leads.forEach(lead => {
      if (lead.status) statuses.add(lead.status);
    });
    return Array.from(statuses).sort();
  }, [leads]);

  const uniqueDevelopments = useMemo(() => {
    const developments = new Set<string>();
    leads.forEach(lead => {
      if (lead.developmentName) developments.add(lead.developmentName);
    });
    return Array.from(developments).sort();
  }, [leads]);
  
  // Convert to Lead format for the drawer
  const convertToLead = (dl: DeveloperLead): Lead => ({
    id: dl.id,
    name: dl.name,
    email: dl.email,
    phone: dl.phone,
    country: "United Kingdom",
    countryCode: "GB",
    budget: dl.budgetRange,
    bedrooms: dl.preferredBedrooms,
    status: 'new' as Lead['status'],
    source: (dl.source.toLowerCase() === 'facebook' ? 'facebook' : 'google') as Lead['source'],
    campaignId: dl.developmentName || '',
    campaignName: dl.developmentName,
    notes: dl.notes,
    createdAt: dl.dateAdded,
    purchaseTimeline: '0_3_months' as Lead['purchaseTimeline'],
    intentScore: dl.leadScore,
    qualityScore: dl.leadScore,
  });

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

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-amber-500";
    return "text-muted-foreground";
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <Flame className="h-3 w-3 text-red-500" />;
    if (score >= 70) return <Star className="h-3 w-3 text-yellow-500" />;
    if (score >= 60) return <Zap className="h-3 w-3 text-blue-500" />;
    if (score >= 50) return <CheckCircle className="h-3 w-3 text-green-500" />;
    return <Snowflake className="h-3 w-3 text-slate-400" />;
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

  // Filter leads
  const filteredLeads = leads
    .filter((lead) => {
      const matchesSearch =
        lead.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.developmentName?.toLowerCase().includes(searchQuery.toLowerCase());

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
        case "leadScore":
          comparison = (a.leadScore || 0) - (b.leadScore || 0);
          break;
        default:
          comparison = 0;
      }
      return columnSort.direction === "asc" ? comparison : -comparison;
    });

  // Virtual scrolling setup
  const rowVirtualizer = useVirtualizer({
    count: filteredLeads.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 60,
    overscan: 10,
  });

  const exportToCSV = () => {
    const headers = [
      "Date Added", "Name", "Phone", "Email", "Budget", "Bedrooms",
      "Development", "Status", "Source", "Lead Score"
    ];
    const rows = filteredLeads.map(lead => [
      lead.dateAdded,
      lead.name,
      lead.phone,
      lead.email,
      lead.budgetRange,
      lead.preferredBedrooms,
      lead.developmentName,
      lead.status,
      lead.source,
      lead.leadScore
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${(cell || '').toString().replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `developer_leads_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export successful",
      description: `${filteredLeads.length} leads exported to CSV.`,
    });
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

  const bulkExport = () => {
    const leadsToExport = filteredLeads.filter(l => selectedLeads.has(l.id));
    const headers = [
      "Date Added", "Name", "Phone", "Email", "Budget", "Bedrooms",
      "Development", "Status", "Source", "Lead Score"
    ];
    const rows = leadsToExport.map(lead => [
      lead.dateAdded,
      lead.name,
      lead.phone,
      lead.email,
      lead.budgetRange,
      lead.preferredBedrooms,
      lead.developmentName,
      lead.status,
      lead.source,
      lead.leadScore
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${(cell || '').toString().replace(/"/g, '""')}"`).join(","))
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

  return (
    <>
      <Card className="border-border/50 h-full flex flex-col">
        <CardHeader className="px-4 py-4 sm:px-6 flex-shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              All Leads
              <span className="text-sm font-normal text-muted-foreground">
                ({filteredLeads.length} of {leads.length})
              </span>
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
                <SelectItem value="all">All Statuses ({leads.length})</SelectItem>
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
                {filteredLeads.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    No leads found matching your criteria.
                  </div>
                ) : (
                  filteredLeads.map((lead) => (
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
                            <div className="flex items-center gap-1">
                              {getScoreIcon(lead.leadScore)}
                              <span className={`text-xs font-medium ${getScoreColor(lead.leadScore)}`}>
                                {lead.leadScore}
                              </span>
                            </div>
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
                        {lead.timeline && (
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3 w-3 text-muted-foreground shrink-0" />
                            <span>{lead.timeline}</span>
                          </div>
                        )}
                      </div>

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
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLead(convertToLead(lead));
                          }}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
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
                <Table className="min-w-[1200px]">
                  <TableHeader className="sticky top-0 z-10 bg-card">
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      <TableHead className="w-10 sm:w-12 pl-2 sm:pl-4">
                        <Checkbox
                          checked={selectedLeads.size === filteredLeads.length && filteredLeads.length > 0}
                          onCheckedChange={toggleSelectAll}
                        />
                      </TableHead>
                      <SortableHeader field="dateAdded" label="Date" className="w-24" />
                      <SortableHeader field="name" label="Name" className="min-w-[150px]" />
                      <TableHead className="text-xs">Contact</TableHead>
                      <SortableHeader field="developmentName" label="Development" className="min-w-[150px]" />
                      <TableHead className="text-xs">Budget</TableHead>
                      <TableHead className="text-xs">Beds</TableHead>
                      <SortableHeader field="leadScore" label="Score" className="w-20" />
                      <SortableHeader field="status" label="Status" className="w-28" />
                      <TableHead className="text-xs w-16">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                      const lead = filteredLeads[virtualRow.index];
                      return (
                        <TableRow 
                          key={lead.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => setSelectedLead(convertToLead(lead))}
                        >
                          <TableCell className="pl-2 sm:pl-4" onClick={(e) => e.stopPropagation()}>
                            <Checkbox
                              checked={selectedLeads.has(lead.id)}
                              onCheckedChange={() => toggleSelectLead(lead.id)}
                            />
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {formatDate(lead.dateAdded)}
                          </TableCell>
                          <TableCell>
                            <div className="font-medium text-sm">{lead.name}</div>
                            <div className="text-xs text-muted-foreground">{lead.source}</div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {lead.email && (
                                <a 
                                  href={`mailto:${lead.email}`}
                                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Mail className="h-3 w-3" />
                                  <span className="truncate max-w-[150px]">{lead.email}</span>
                                </a>
                              )}
                              {lead.phone && (
                                <a 
                                  href={`tel:${lead.phone}`}
                                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Phone className="h-3 w-3" />
                                  <span>{lead.phone}</span>
                                </a>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">{lead.developmentName || '-'}</TableCell>
                          <TableCell className="text-sm">{lead.budgetRange || '-'}</TableCell>
                          <TableCell className="text-sm">{lead.preferredBedrooms || '-'}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {getScoreIcon(lead.leadScore)}
                              <span className={`text-sm font-medium ${getScoreColor(lead.leadScore)}`}>
                                {lead.leadScore}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant="outline" 
                              className={`text-[10px] ${getStatusColor(lead.status)}`}
                            >
                              {lead.status}
                            </Badge>
                          </TableCell>
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setSelectedLead(convertToLead(lead))}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                {lead.phone && (
                                  <DropdownMenuItem onClick={() => window.open(`tel:${lead.phone}`, '_blank')}>
                                    <Phone className="h-4 w-4 mr-2" />
                                    Call
                                  </DropdownMenuItem>
                                )}
                                {lead.email && (
                                  <DropdownMenuItem onClick={() => window.open(`mailto:${lead.email}`, '_blank')}>
                                    <Mail className="h-4 w-4 mr-2" />
                                    Email
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Lead Detail Drawer */}
      <LeadDetailDrawer
        lead={selectedLead}
        open={!!selectedLead}
        onClose={() => setSelectedLead(null)}
      />
    </>
  );
};

export default DeveloperLeadsTable;
