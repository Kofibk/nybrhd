import { useState, useRef, useMemo, useCallback } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Card, CardContent } from "@/components/ui/card";
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
import { LeadDetailDrawer } from "@/components/LeadDetailDrawer";
import { Lead } from "@/lib/types";
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
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { 
  Download,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  LayoutGrid,
  LayoutList,
  Phone,
  Mail,
  MapPin,
  Calendar,
  User,
  UserPlus,
  MoreHorizontal,
  Wallet,
  BedDouble,
  Target,
  Building2,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TransformedBuyer, useUpdateAirtableBuyer, getUniqueBuyerStatuses, getUniqueCallers } from "@/hooks/useAirtableBuyers";
import { 
  BuyersFilterPanel, 
  FilterCondition, 
  SortConfig, 
  GroupConfig,
  applyFilters,
  applySorts,
  groupBuyers,
} from "./BuyersFilterPanel";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

interface AdminBuyersTableProps {
  searchQuery: string;
  buyers: TransformedBuyer[];
  isLoading: boolean;
}

type SortDirection = "asc" | "desc" | null;

interface ColumnSort {
  field: keyof TransformedBuyer;
  direction: SortDirection;
}

type ViewMode = "table" | "cards";

// Format date helper
const formatDate = (dateString: string) => {
  if (!dateString) return '—';
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

// Reusable row component for buyer table with expanded details
const BuyerTableRow = ({ 
  buyer, 
  isSelected, 
  onSelect, 
  onAssign,
  onRowClick,
  getScoreColor,
  getIntentColor,
  getStatusColor,
  showExpanded = false,
}: { 
  buyer: TransformedBuyer;
  isSelected: boolean;
  onSelect: (id: string, checked: boolean) => void;
  onAssign: (buyer: TransformedBuyer) => void;
  onRowClick: (buyer: TransformedBuyer) => void;
  getScoreColor: (score: number) => string;
  getIntentColor: (intent: string) => string;
  getStatusColor: (status: string) => string;
  showExpanded?: boolean;
}) => (
  <TableRow className="hover:bg-muted/50 cursor-pointer" onClick={() => onRowClick(buyer)}>
    <TableCell className="w-8" onClick={(e) => e.stopPropagation()}>
      <Checkbox checked={isSelected} onCheckedChange={(checked) => onSelect(buyer.id, !!checked)} />
    </TableCell>
    <TableCell className="min-w-[120px]">
      <div className="text-xs text-muted-foreground">{formatDate(buyer.createdTime)}</div>
    </TableCell>
    <TableCell>
      <div>
        <div className="font-medium">{buyer.name}</div>
        <div className="text-xs text-muted-foreground flex flex-col gap-0.5">
          {buyer.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{buyer.email}</span>}
          {buyer.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{buyer.phone}</span>}
        </div>
      </div>
    </TableCell>
    <TableCell>
      <Badge className={cn("font-bold", getScoreColor(buyer.score))}>{buyer.score}</Badge>
    </TableCell>
    <TableCell>
      {buyer.intent && <Badge className={getIntentColor(buyer.intent)}>{buyer.intent}</Badge>}
    </TableCell>
    <TableCell>
      <Badge variant="outline" className={getStatusColor(buyer.status)}>{buyer.status}</Badge>
    </TableCell>
    <TableCell className="text-sm">{buyer.budgetRange || '—'}</TableCell>
    <TableCell className="text-sm">{buyer.bedrooms || '—'}</TableCell>
    <TableCell className="text-sm">{buyer.location || buyer.country || '—'}</TableCell>
    <TableCell className="text-sm">{buyer.timeline || '—'}</TableCell>
    <TableCell className="text-sm">{buyer.paymentMethod || '—'}</TableCell>
    <TableCell className="text-sm">{buyer.purpose || '—'}</TableCell>
    <TableCell className="text-sm max-w-[120px]">
      {buyer.development ? (
        <Badge variant="secondary" className="text-xs truncate">
          <Building2 className="h-3 w-3 mr-1 flex-shrink-0" />
          <span className="truncate">{buyer.development}</span>
        </Badge>
      ) : '—'}
    </TableCell>
    <TableCell className="text-sm max-w-[200px]">
      {buyer.summary ? (
        <span className="text-xs text-muted-foreground line-clamp-2">{buyer.summary}</span>
      ) : '—'}
    </TableCell>
    <TableCell>
      {buyer.assignedCaller ? (
        <Badge variant="secondary" className="text-xs">
          <User className="h-3 w-3 mr-1" />{buyer.assignedCaller}
        </Badge>
      ) : (
        <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground" onClick={() => onAssign(buyer)}>
          <UserPlus className="h-3 w-3 mr-1" />Assign
        </Button>
      )}
    </TableCell>
    <TableCell>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onAssign(buyer)}>
            <UserPlus className="h-4 w-4 mr-2" />Assign Caller
          </DropdownMenuItem>
          {buyer.phone && (
            <DropdownMenuItem onClick={() => window.open(`tel:${buyer.phone}`)}>
              <Phone className="h-4 w-4 mr-2" />Call {buyer.phone}
            </DropdownMenuItem>
          )}
          {buyer.email && (
            <DropdownMenuItem onClick={() => window.open(`mailto:${buyer.email}`)}>
              <Mail className="h-4 w-4 mr-2" />Email
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </TableCell>
  </TableRow>
);

const AdminBuyersTable = ({ searchQuery, buyers, isLoading }: AdminBuyersTableProps) => {
  // Advanced filter state
  const [filters, setFilters] = useState<FilterCondition[]>([]);
  const [sorts, setSorts] = useState<SortConfig[]>([{ field: "score", direction: "desc" }]);
  const [groupBy, setGroupBy] = useState<GroupConfig>({ field: null });
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  
  const [selectedBuyers, setSelectedBuyers] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [buyerToAssign, setBuyerToAssign] = useState<TransformedBuyer | null>(null);
  const [selectedCaller, setSelectedCaller] = useState<string>("");
  const tableContainerRef = useRef<HTMLDivElement>(null);
  
  // Drawer state for buyer details
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedBuyerForDrawer, setSelectedBuyerForDrawer] = useState<Lead | null>(null);
  
  const updateBuyer = useUpdateAirtableBuyer();
  
  // Convert TransformedBuyer to Lead type for the drawer
  const convertBuyerToLead = useCallback((buyer: TransformedBuyer): Lead => {
    return {
      id: buyer.id,
      name: buyer.name,
      email: buyer.email,
      phone: buyer.phone,
      countryCode: buyer.country === 'United Kingdom' ? 'GB' : buyer.country?.slice(0, 2)?.toUpperCase() || '',
      country: buyer.country || '',
      budget: buyer.budgetRange || '',
      bedrooms: buyer.bedrooms || '',
      paymentMethod: buyer.paymentMethod?.toLowerCase()?.includes('cash') ? 'cash' : 
                     buyer.paymentMethod?.toLowerCase()?.includes('mortgage') ? 'mortgage' : 'undecided',
      buyerStatus: buyer.timeline?.includes('28') || buyer.intent?.toLowerCase() === 'hot' ? 'actively_looking' : 'browsing',
      purchaseTimeline: buyer.timeline?.includes('28') ? 'within_28_days' :
                        buyer.timeline?.includes('0-3') || buyer.timeline?.includes('0 - 3') ? '0_3_months' :
                        buyer.timeline?.includes('3-6') || buyer.timeline?.includes('3 - 6') ? '3_6_months' :
                        buyer.timeline?.includes('6-9') || buyer.timeline?.includes('6 - 9') ? '6_9_months' :
                        buyer.timeline?.includes('9-12') || buyer.timeline?.includes('9 - 12') ? '9_12_months' : '12_months_plus',
      intentScore: buyer.intent?.toLowerCase() === 'hot' ? 90 : 
                   buyer.intent?.toLowerCase() === 'warm' ? 70 : 50,
      qualityScore: buyer.score || 50,
      status: buyer.status?.toLowerCase()?.includes('won') ? 'won' :
              buyer.status?.toLowerCase()?.includes('lost') ? 'lost' :
              buyer.status?.toLowerCase()?.includes('offer') ? 'offer' :
              buyer.status?.toLowerCase()?.includes('viewing') ? 'booked_viewing' :
              buyer.status?.toLowerCase()?.includes('contacted') || buyer.status?.toLowerCase()?.includes('progress') ? 'contacted' : 'new',
      campaignId: '',
      campaignName: buyer.development || '',
      createdAt: buyer.createdTime,
      notes: buyer.summary || '',
      source: 'meta_campaign',
      purpose: buyer.purpose?.toLowerCase()?.includes('invest') ? 'investment' : 
               buyer.purpose?.toLowerCase()?.includes('primary') || buyer.purpose?.toLowerCase()?.includes('personal') ? 'primary_residence' : 
               buyer.purpose?.toLowerCase()?.includes('holiday') ? 'holiday_home' : undefined,
    };
  }, []);
  
  // Handle row click to open drawer
  const handleRowClick = useCallback((buyer: TransformedBuyer) => {
    const leadData = convertBuyerToLead(buyer);
    setSelectedBuyerForDrawer(leadData);
    setDrawerOpen(true);
  }, [convertBuyerToLead]);
  
  // Fetch profiles for caller assignment
  const { data: profiles } = useQuery({
    queryKey: ['admin-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, user_id, full_name, email, company_id')
        .order('full_name');
      if (error) throw error;
      return data || [];
    },
  });

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('pending')) return 'bg-amber-100 text-amber-800 border-amber-200';
    if (s.includes('progress') || s.includes('contacted')) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (s.includes('cold') || s.includes('no response')) return 'bg-slate-100 text-slate-800 border-slate-200';
    if (s.includes('not interested')) return 'bg-red-100 text-red-800 border-red-200';
    if (s.includes('duplicate') || s.includes('fake')) return 'bg-gray-100 text-gray-600 border-gray-200';
    if (s.includes('converted') || s.includes('won')) return 'bg-green-100 text-green-800 border-green-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getIntentColor = (intent: string) => {
    const i = intent.toLowerCase();
    if (i === 'hot') return 'bg-red-500 text-white';
    if (i === 'warm') return 'bg-amber-500 text-white';
    return 'bg-blue-500 text-white';
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-amber-500 text-white';
    if (score >= 70) return 'bg-green-500 text-white';
    if (score >= 50) return 'bg-blue-500 text-white';
    return 'bg-muted text-muted-foreground';
  };

  // Filter, sort and group buyers using the new filter system
  const filteredBuyers = useMemo(() => {
    // First apply search filter
    let result = buyers.filter(buyer => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const searchable = `${buyer.name} ${buyer.email} ${buyer.phone} ${buyer.location} ${buyer.country}`.toLowerCase();
        if (!searchable.includes(query)) return false;
      }
      return true;
    });
    
    // Apply advanced filters
    result = applyFilters(result, filters);
    
    // Apply sorting
    result = applySorts(result, sorts);
    
    return result;
  }, [buyers, searchQuery, filters, sorts]);

  // Group buyers if grouping is enabled
  const groupedBuyers = useMemo(() => {
    return groupBuyers(filteredBuyers, groupBy);
  }, [filteredBuyers, groupBy]);

  // Initialize all groups as expanded
  useMemo(() => {
    if (groupBy.field && expandedGroups.size === 0) {
      setExpandedGroups(new Set(Array.from(groupedBuyers.keys())));
    }
  }, [groupBy.field, groupedBuyers]);

  const toggleGroup = (groupName: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupName)) {
      newExpanded.delete(groupName);
    } else {
      newExpanded.add(groupName);
    }
    setExpandedGroups(newExpanded);
  };

  // Virtualization for large lists (only when not grouped)
  const rowVirtualizer = useVirtualizer({
    count: groupBy.field ? 0 : filteredBuyers.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 56,
    overscan: 10,
  });

  const handleSort = (field: keyof TransformedBuyer) => {
    // Toggle or add sort
    const existingIndex = sorts.findIndex(s => s.field === field);
    if (existingIndex >= 0) {
      const existing = sorts[existingIndex];
      if (existing.direction === "desc") {
        setSorts(sorts.map((s, i) => i === existingIndex ? { ...s, direction: "asc" } : s));
      } else {
        // Remove the sort
        setSorts(sorts.filter((_, i) => i !== existingIndex));
      }
    } else {
      setSorts([{ field, direction: "desc" }, ...sorts]);
    }
  };

  const SortIcon = ({ field }: { field: keyof TransformedBuyer }) => {
    const sortConfig = sorts.find(s => s.field === field);
    if (!sortConfig) {
      return <ArrowUpDown className="h-3 w-3 ml-1 opacity-50" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ArrowUp className="h-3 w-3 ml-1" /> 
      : <ArrowDown className="h-3 w-3 ml-1" />;
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedBuyers(new Set(filteredBuyers.map(b => b.id)));
    } else {
      setSelectedBuyers(new Set());
    }
  };

  const handleSelectBuyer = (id: string, checked: boolean) => {
    const newSet = new Set(selectedBuyers);
    if (checked) {
      newSet.add(id);
    } else {
      newSet.delete(id);
    }
    setSelectedBuyers(newSet);
  };

  // Send email notification for assignment
  const sendAssignmentNotification = async (buyer: TransformedBuyer, callerName: string) => {
    const callerProfile = profiles?.find(p => p.full_name === callerName || p.email === callerName);
    if (!callerProfile?.email) {
      console.log('No email found for caller:', callerName);
      return;
    }
    
    try {
      await supabase.functions.invoke('send-assignment-notification', {
        body: {
          callerEmail: callerProfile.email,
          callerName: callerProfile.full_name || callerName,
          buyerName: buyer.name,
          buyerEmail: buyer.email,
          buyerPhone: buyer.phone,
          buyerBudget: buyer.budgetRange,
          buyerLocation: buyer.location || buyer.country,
          buyerIntent: buyer.intent,
          buyerScore: buyer.score,
          buyerTimeline: buyer.timeline,
          buyerDevelopment: buyer.development,
        },
      });
      console.log('Assignment notification sent to:', callerProfile.email);
    } catch (error) {
      console.error('Failed to send assignment notification:', error);
    }
  };

  const handleAssignCaller = async () => {
    if (!buyerToAssign || !selectedCaller) return;
    
    try {
      // Find the caller's user_id and company_id from profiles
      const callerProfile = profiles?.find(p => p.full_name === selectedCaller || p.email === selectedCaller);
      
      // Update Airtable
      await updateBuyer.mutateAsync({
        recordId: buyerToAssign.id,
        data: {
          'Assigned Caller': selectedCaller,
          'Status': 'Contacted - In Progress',
        },
      });
      
      // Create assignment record in Supabase
      if (callerProfile?.user_id) {
        const { data: session } = await supabase.auth.getSession();
        const { error: assignError } = await supabase
          .from('buyer_assignments')
          .upsert({
            airtable_record_id: buyerToAssign.id,
            airtable_lead_id: buyerToAssign.leadId,
            user_id: callerProfile.user_id,
            company_id: callerProfile.company_id,
            assigned_by: session?.session?.user?.id,
            status: 'assigned',
          }, {
            onConflict: 'airtable_record_id,user_id',
          });
        
        if (assignError) {
          console.error('Error creating assignment record:', assignError);
        }
      }
      
      // Send email notification
      await sendAssignmentNotification(buyerToAssign, selectedCaller);
      
      toast({
        title: "Buyer assigned",
        description: `${buyerToAssign.name} has been assigned to ${selectedCaller}`,
      });
      
      setAssignDialogOpen(false);
      setBuyerToAssign(null);
      setSelectedCaller("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign buyer. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleBulkAssign = async () => {
    if (selectedBuyers.size === 0 || !selectedCaller) return;
    
    try {
      const buyersToUpdate = filteredBuyers.filter(b => selectedBuyers.has(b.id));
      const callerProfile = profiles?.find(p => p.full_name === selectedCaller || p.email === selectedCaller);
      const { data: session } = await supabase.auth.getSession();
      
      for (const buyer of buyersToUpdate) {
        // Update Airtable
        await updateBuyer.mutateAsync({
          recordId: buyer.id,
          data: {
            'Assigned Caller': selectedCaller,
            'Status': 'Contacted - In Progress',
          },
        });
        
        // Create assignment record in Supabase
        if (callerProfile?.user_id) {
          await supabase
            .from('buyer_assignments')
            .upsert({
              airtable_record_id: buyer.id,
              airtable_lead_id: buyer.leadId,
              user_id: callerProfile.user_id,
              company_id: callerProfile.company_id,
              assigned_by: session?.session?.user?.id,
              status: 'assigned',
            }, {
              onConflict: 'airtable_record_id,user_id',
            });
        }
        
        // Send email notification for each buyer
        await sendAssignmentNotification(buyer, selectedCaller);
      }
      
      toast({
        title: "Buyers assigned",
        description: `${selectedBuyers.size} buyers have been assigned to ${selectedCaller}`,
      });
      
      setSelectedBuyers(new Set());
      setSelectedCaller("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign buyers. Please try again.",
        variant: "destructive",
      });
    }
  };

  const exportToCSV = () => {
    const headers = [
      'Date Added', 'Name', 'Email', 'Phone', 'Budget', 'Bedrooms', 'Location', 'Country', 
      'Timeline', 'Payment Method', 'Purpose', 'Development', 'Score', 'Intent', 'Status', 
      'Buyer Summary', 'Assigned To', 'Preferred Communication'
    ];
    const rows = filteredBuyers.map(b => [
      b.createdTime, b.name, b.email, b.phone, b.budgetRange, b.bedrooms, 
      b.location, b.country, b.timeline, b.paymentMethod, b.purpose, b.development,
      b.score, b.intent, b.status, b.summary, b.assignedCaller, b.preferredComm
    ]);
    
    const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${v || ''}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `buyers-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({ title: "Exported", description: `${filteredBuyers.length} buyers exported to CSV` });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Advanced Filter Panel */}
      <BuyersFilterPanel
        buyers={buyers}
        filters={filters}
        onFiltersChange={setFilters}
        sorts={sorts}
        onSortsChange={setSorts}
        groupBy={groupBy}
        onGroupByChange={setGroupBy}
      />

      {/* Actions Bar */}
      <div className="flex flex-wrap items-center gap-3">
        {selectedBuyers.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{selectedBuyers.size} selected</span>
            <Select value={selectedCaller} onValueChange={setSelectedCaller}>
              <SelectTrigger className="w-[140px] h-8 text-xs">
                <SelectValue placeholder="Assign to..." />
              </SelectTrigger>
              <SelectContent>
                {profiles?.map(p => (
                  <SelectItem key={p.id} value={p.full_name || p.email}>
                    {p.full_name || p.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="sm" className="h-8 text-xs" onClick={handleBulkAssign} disabled={!selectedCaller}>
              <UserPlus className="h-3 w-3 mr-1" />
              Assign
            </Button>
          </div>
        )}

        <div className="flex-1" />

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span><strong>{filteredBuyers.length}</strong> buyers</span>
          <span><strong>{filteredBuyers.filter(b => !b.assignedCaller).length}</strong> unassigned</span>
          <span><strong>{filteredBuyers.filter(b => b.intent.toLowerCase() === 'hot').length}</strong> hot</span>
        </div>

        <div className="flex items-center gap-1 border rounded-md p-0.5">
          <Button
            variant={viewMode === "table" ? "secondary" : "ghost"}
            size="sm"
            className="h-7 px-2"
            onClick={() => setViewMode("table")}
          >
            <LayoutList className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "cards" ? "secondary" : "ghost"}
            size="sm"
            className="h-7 px-2"
            onClick={() => setViewMode("cards")}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>

        <Button variant="outline" size="sm" className="h-8 text-xs" onClick={exportToCSV}>
          <Download className="h-3 w-3 mr-1" />
          Export
        </Button>
      </div>

      {/* Table View */}
      {viewMode === "table" ? (
        <div ref={tableContainerRef} className="border rounded-lg overflow-auto max-h-[calc(100vh-360px)]">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow>
                <TableHead className="w-8">
                  <Checkbox
                    checked={selectedBuyers.size === filteredBuyers.length && filteredBuyers.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead className="cursor-pointer min-w-[100px]" onClick={() => handleSort('createdTime')}>
                  <div className="flex items-center text-xs">Date <SortIcon field="createdTime" /></div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('name')}>
                  <div className="flex items-center">Name <SortIcon field="name" /></div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('score')}>
                  <div className="flex items-center">Score <SortIcon field="score" /></div>
                </TableHead>
                <TableHead>Intent</TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('status')}>
                  <div className="flex items-center">Status <SortIcon field="status" /></div>
                </TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Beds</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Timeline</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Purpose</TableHead>
                <TableHead>Development</TableHead>
                <TableHead>Summary</TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('assignedCaller')}>
                  <div className="flex items-center">Assigned <SortIcon field="assignedCaller" /></div>
                </TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groupBy.field ? (
                // Grouped view
                Array.from(groupedBuyers.entries()).map(([groupName, groupBuyers]) => (
                  <Collapsible key={groupName} open={expandedGroups.has(groupName)} onOpenChange={() => toggleGroup(groupName)} asChild>
                    <>
                      <CollapsibleTrigger asChild>
                        <TableRow className="bg-muted/50 hover:bg-muted cursor-pointer">
                          <TableCell colSpan={16}>
                            <div className="flex items-center gap-2">
                              {expandedGroups.has(groupName) ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                              <span className="font-medium">{groupName}</span>
                              <Badge variant="secondary" className="text-xs">
                                {groupBuyers.length}
                              </Badge>
                            </div>
                          </TableCell>
                        </TableRow>
                      </CollapsibleTrigger>
                      <CollapsibleContent asChild>
                        <>
                          {groupBuyers.map(buyer => (
                            <BuyerTableRow
                              key={buyer.id}
                              buyer={buyer}
                              isSelected={selectedBuyers.has(buyer.id)}
                              onSelect={handleSelectBuyer}
                              onAssign={(b) => {
                                setBuyerToAssign(b);
                                setAssignDialogOpen(true);
                              }}
                              onRowClick={handleRowClick}
                              getScoreColor={getScoreColor}
                              getIntentColor={getIntentColor}
                              getStatusColor={getStatusColor}
                            />
                          ))}
                        </>
                      </CollapsibleContent>
                    </>
                  </Collapsible>
                ))
              ) : (
                // Flat view with virtualization
                rowVirtualizer.getVirtualItems().map(virtualRow => {
                  const buyer = filteredBuyers[virtualRow.index];
                  return (
                    <BuyerTableRow
                      key={buyer.id}
                      buyer={buyer}
                      isSelected={selectedBuyers.has(buyer.id)}
                      onSelect={handleSelectBuyer}
                      onAssign={(b) => {
                        setBuyerToAssign(b);
                        setAssignDialogOpen(true);
                      }}
                      onRowClick={handleRowClick}
                      getScoreColor={getScoreColor}
                      getIntentColor={getIntentColor}
                      getStatusColor={getStatusColor}
                    />
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      ) : (
        /* Card View */
        <ScrollArea className="h-[calc(100vh-320px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-1">
            {filteredBuyers.map(buyer => (
              <Card key={buyer.id} className={cn(
                "hover:shadow-md transition-shadow",
                buyer.intent.toLowerCase() === 'hot' && "border-red-500/30 bg-red-500/5"
              )}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold">{buyer.name}</h3>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {buyer.location || buyer.country || 'Unknown'}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {buyer.intent && (
                        <Badge className={cn("text-xs", getIntentColor(buyer.intent))}>
                          {buyer.intent}
                        </Badge>
                      )}
                      <Badge className={cn("font-bold", getScoreColor(buyer.score))}>
                        {buyer.score}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                    <div className="flex items-center gap-1.5">
                      <Wallet className="h-3 w-3 text-muted-foreground" />
                      <span>{buyer.budgetRange || 'Not specified'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <BedDouble className="h-3 w-3 text-muted-foreground" />
                      <span>{buyer.bedrooms || 'Any'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span>{buyer.timeline || 'Not specified'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Target className="h-3 w-3 text-muted-foreground" />
                      <span>{buyer.purpose || 'Not specified'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline" className={getStatusColor(buyer.status)}>
                      {buyer.status}
                    </Badge>
                    {buyer.development && (
                      <Badge variant="secondary" className="text-xs">
                        <Building2 className="h-3 w-3 mr-1" />
                        {buyer.development}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t">
                    {buyer.assignedCaller ? (
                      <Badge variant="secondary" className="text-xs">
                        <User className="h-3 w-3 mr-1" />
                        {buyer.assignedCaller}
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">Unassigned</span>
                    )}
                    <Button 
                      size="sm" 
                      className="h-7 text-xs"
                      onClick={() => {
                        setBuyerToAssign(buyer);
                        setAssignDialogOpen(true);
                      }}
                    >
                      <UserPlus className="h-3 w-3 mr-1" />
                      {buyer.assignedCaller ? 'Reassign' : 'Assign'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}

      {filteredBuyers.length === 0 && (
        <div className="text-center py-12">
          <User className="h-12 w-12 mx-auto text-muted-foreground/50" />
          <h3 className="mt-4 font-semibold">No buyers found</h3>
          <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
        </div>
      )}

      {/* Assign Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Buyer</DialogTitle>
            <DialogDescription>
              Assign {buyerToAssign?.name} to a caller. This will update their status to "Contacted - In Progress".
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {buyerToAssign && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="font-medium">{buyerToAssign.name}</div>
                <div className="text-sm text-muted-foreground">
                  {buyerToAssign.email} • Score: {buyerToAssign.score}
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Caller</label>
              <Select value={selectedCaller} onValueChange={setSelectedCaller}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a caller..." />
                </SelectTrigger>
                <SelectContent>
                  {profiles?.map(p => (
                    <SelectItem key={p.id} value={p.full_name || p.email}>
                      {p.full_name || p.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssignCaller} disabled={!selectedCaller || updateBuyer.isPending}>
              {updateBuyer.isPending ? 'Assigning...' : 'Assign'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Buyer Detail Drawer */}
      <LeadDetailDrawer
        lead={selectedBuyerForDrawer}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
};

export default AdminBuyersTable;