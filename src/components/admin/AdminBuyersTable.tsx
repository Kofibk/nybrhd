import { useState, useRef, useMemo } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
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
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TransformedBuyer, useUpdateAirtableBuyer, getUniqueBuyerStatuses, getUniqueCallers } from "@/hooks/useAirtableBuyers";
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

const AdminBuyersTable = ({ searchQuery, buyers, isLoading }: AdminBuyersTableProps) => {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [callerFilter, setCallerFilter] = useState<string>("all");
  const [intentFilter, setIntentFilter] = useState<string>("all");
  const [columnSort, setColumnSort] = useState<ColumnSort>({ field: "score", direction: "desc" });
  const [selectedBuyers, setSelectedBuyers] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [buyerToAssign, setBuyerToAssign] = useState<TransformedBuyer | null>(null);
  const [selectedCaller, setSelectedCaller] = useState<string>("");
  const tableContainerRef = useRef<HTMLDivElement>(null);
  
  const updateBuyer = useUpdateAirtableBuyer();
  
  // Fetch profiles for caller assignment
  const { data: profiles } = useQuery({
    queryKey: ['admin-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .order('full_name');
      if (error) throw error;
      return data || [];
    },
  });
  
  // Get unique values for filters
  const uniqueStatuses = useMemo(() => getUniqueBuyerStatuses(buyers), [buyers]);
  const uniqueCallers = useMemo(() => getUniqueCallers(buyers), [buyers]);

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

  // Filter and sort buyers
  const filteredBuyers = useMemo(() => {
    let filtered = buyers.filter(buyer => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const searchable = `${buyer.name} ${buyer.email} ${buyer.phone} ${buyer.location} ${buyer.country}`.toLowerCase();
        if (!searchable.includes(query)) return false;
      }
      
      // Status filter
      if (statusFilter !== "all" && buyer.status !== statusFilter) return false;
      
      // Caller filter
      if (callerFilter !== "all") {
        if (callerFilter === "unassigned" && buyer.assignedCaller) return false;
        if (callerFilter !== "unassigned" && buyer.assignedCaller !== callerFilter) return false;
      }
      
      // Intent filter
      if (intentFilter !== "all" && buyer.intent.toLowerCase() !== intentFilter.toLowerCase()) return false;
      
      return true;
    });

    // Sort
    if (columnSort.direction) {
      filtered.sort((a, b) => {
        const aVal = a[columnSort.field];
        const bVal = b[columnSort.field];
        
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return columnSort.direction === 'asc' ? aVal - bVal : bVal - aVal;
        }
        
        const aStr = String(aVal || '').toLowerCase();
        const bStr = String(bVal || '').toLowerCase();
        return columnSort.direction === 'asc' 
          ? aStr.localeCompare(bStr) 
          : bStr.localeCompare(aStr);
      });
    }

    return filtered;
  }, [buyers, searchQuery, statusFilter, callerFilter, intentFilter, columnSort]);

  // Virtualization for large lists
  const rowVirtualizer = useVirtualizer({
    count: filteredBuyers.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 56,
    overscan: 10,
  });

  const handleSort = (field: keyof TransformedBuyer) => {
    setColumnSort(prev => ({
      field,
      direction: prev.field === field 
        ? prev.direction === 'asc' ? 'desc' : prev.direction === 'desc' ? null : 'asc'
        : 'desc'
    }));
  };

  const SortIcon = ({ field }: { field: keyof TransformedBuyer }) => {
    if (columnSort.field !== field || !columnSort.direction) {
      return <ArrowUpDown className="h-3 w-3 ml-1 opacity-50" />;
    }
    return columnSort.direction === 'asc' 
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

  const handleAssignCaller = async () => {
    if (!buyerToAssign || !selectedCaller) return;
    
    try {
      await updateBuyer.mutateAsync({
        recordId: buyerToAssign.id,
        data: {
          'Assigned Caller': selectedCaller,
          'Status': 'Contacted - In Progress',
        },
      });
      
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
      
      for (const buyer of buyersToUpdate) {
        await updateBuyer.mutateAsync({
          recordId: buyer.id,
          data: {
            'Assigned Caller': selectedCaller,
            'Status': 'Contacted - In Progress',
          },
        });
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
    const headers = ['Name', 'Email', 'Phone', 'Budget', 'Bedrooms', 'Location', 'Country', 'Timeline', 'Score', 'Intent', 'Status', 'Assigned To'];
    const rows = filteredBuyers.map(b => [
      b.name, b.email, b.phone, b.budgetRange, b.bedrooms, b.location, b.country, b.timeline, b.score, b.intent, b.status, b.assignedCaller
    ]);
    
    const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${v}"`).join(','))].join('\n');
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
      {/* Filters & Actions Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px] h-8 text-xs">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {uniqueStatuses.map(status => (
              <SelectItem key={status} value={status}>{status}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={callerFilter} onValueChange={setCallerFilter}>
          <SelectTrigger className="w-[160px] h-8 text-xs">
            <SelectValue placeholder="All Callers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Callers</SelectItem>
            <SelectItem value="unassigned">Unassigned</SelectItem>
            {uniqueCallers.map(caller => (
              <SelectItem key={caller} value={caller}>{caller}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={intentFilter} onValueChange={setIntentFilter}>
          <SelectTrigger className="w-[120px] h-8 text-xs">
            <SelectValue placeholder="Intent" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Intent</SelectItem>
            <SelectItem value="hot">Hot</SelectItem>
            <SelectItem value="warm">Warm</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex-1" />

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

      {/* Stats Bar */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span><strong>{filteredBuyers.length}</strong> buyers shown</span>
        <span>•</span>
        <span><strong>{filteredBuyers.filter(b => !b.assignedCaller).length}</strong> unassigned</span>
        <span>•</span>
        <span><strong>{filteredBuyers.filter(b => b.intent.toLowerCase() === 'hot').length}</strong> hot leads</span>
      </div>

      {/* Table View */}
      {viewMode === "table" ? (
        <div ref={tableContainerRef} className="border rounded-lg overflow-auto max-h-[calc(100vh-320px)]">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    checked={selectedBuyers.size === filteredBuyers.length && filteredBuyers.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
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
                <TableHead>Location</TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('assignedCaller')}>
                  <div className="flex items-center">Assigned <SortIcon field="assignedCaller" /></div>
                </TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rowVirtualizer.getVirtualItems().map(virtualRow => {
                const buyer = filteredBuyers[virtualRow.index];
                return (
                  <TableRow key={buyer.id} className="hover:bg-muted/50">
                    <TableCell>
                      <Checkbox
                        checked={selectedBuyers.has(buyer.id)}
                        onCheckedChange={(checked) => handleSelectBuyer(buyer.id, !!checked)}
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{buyer.name}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-2">
                          {buyer.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{buyer.email}</span>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn("font-bold", getScoreColor(buyer.score))}>
                        {buyer.score}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {buyer.intent && (
                        <Badge className={getIntentColor(buyer.intent)}>
                          {buyer.intent}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(buyer.status)}>
                        {buyer.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{buyer.budgetRange || '—'}</TableCell>
                    <TableCell className="text-sm">
                      {buyer.location || buyer.country || '—'}
                    </TableCell>
                    <TableCell>
                      {buyer.assignedCaller ? (
                        <Badge variant="secondary" className="text-xs">
                          <User className="h-3 w-3 mr-1" />
                          {buyer.assignedCaller}
                        </Badge>
                      ) : (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 text-xs text-muted-foreground"
                          onClick={() => {
                            setBuyerToAssign(buyer);
                            setAssignDialogOpen(true);
                          }}
                        >
                          <UserPlus className="h-3 w-3 mr-1" />
                          Assign
                        </Button>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => {
                            setBuyerToAssign(buyer);
                            setAssignDialogOpen(true);
                          }}>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Assign Caller
                          </DropdownMenuItem>
                          {buyer.phone && (
                            <DropdownMenuItem onClick={() => window.open(`tel:${buyer.phone}`)}>
                              <Phone className="h-4 w-4 mr-2" />
                              Call {buyer.phone}
                            </DropdownMenuItem>
                          )}
                          {buyer.email && (
                            <DropdownMenuItem onClick={() => window.open(`mailto:${buyer.email}`)}>
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
    </div>
  );
};

export default AdminBuyersTable;