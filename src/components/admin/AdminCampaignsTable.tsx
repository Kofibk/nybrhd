import { useState, useEffect } from "react";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  MoreHorizontal, 
  Eye, 
  Pause, 
  Play, 
  Copy, 
  BarChart3,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Filter,
  Download
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import ReportUploadDialog from "./ReportUploadDialog";
import { useUploadedData } from "@/contexts/DataContext";

interface AdminCampaignsTableProps {
  searchQuery: string;
}

type SortDirection = "asc" | "desc" | null;

interface ColumnSort {
  field: string;
  direction: SortDirection;
}

// Mock campaign data
const mockCampaigns = [
  {
    id: "1",
    name: "Summer Launch - The Pinnacle",
    client: "Berkeley Homes",
    clientType: "developer",
    status: "live",
    budget: 5000,
    spent: 3200,
    leads: 87,
    cpl: 36.78,
    startDate: "2024-01-15",
  },
  {
    id: "2",
    name: "Mayfair Collection",
    client: "Knight Frank",
    clientType: "agent",
    status: "live",
    budget: 3500,
    spent: 2100,
    leads: 45,
    cpl: 46.67,
    startDate: "2024-01-20",
  },
  {
    id: "3",
    name: "International Mortgages Q1",
    client: "London & Country",
    clientType: "broker",
    status: "paused",
    budget: 2000,
    spent: 1500,
    leads: 32,
    cpl: 46.88,
    startDate: "2024-01-10",
  },
  {
    id: "4",
    name: "Riverside Development",
    client: "Barratt Developments",
    clientType: "developer",
    status: "live",
    budget: 8000,
    spent: 4500,
    leads: 156,
    cpl: 28.85,
    startDate: "2024-01-05",
  },
  {
    id: "5",
    name: "Chelsea Apartments",
    client: "Savills",
    clientType: "agent",
    status: "draft",
    budget: 4000,
    spent: 0,
    leads: 0,
    cpl: 0,
    startDate: "2024-02-01",
  },
  {
    id: "6",
    name: "BTL Portfolio Launch",
    client: "London & Country",
    clientType: "broker",
    status: "live",
    budget: 3000,
    spent: 1800,
    leads: 57,
    cpl: 31.58,
    startDate: "2024-01-18",
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "live":
      return "default";
    case "paused":
      return "secondary";
    case "draft":
      return "outline";
    default:
      return "secondary";
  }
};

interface Campaign {
  id: string;
  name: string;
  client: string;
  clientType: string;
  status: string;
  budget: number;
  spent: number;
  leads: number;
  cpl: number;
  startDate: string;
}

const AdminCampaignsTable = ({ searchQuery }: AdminCampaignsTableProps) => {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [clientFilter, setClientFilter] = useState<string>("all");
  const [columnSort, setColumnSort] = useState<ColumnSort>({ field: "startDate", direction: "desc" });
  
  // Get uploaded campaign data from context
  const { campaignData } = useUploadedData();
  
  // Local campaigns state (mockCampaigns + imported campaigns)
  const [localCampaigns, setLocalCampaigns] = useState<Campaign[]>(mockCampaigns);

  // Merge uploaded campaign data with local campaigns
  useEffect(() => {
    if (campaignData && campaignData.length > 0) {
      const mappedCampaigns: Campaign[] = campaignData.map((c, index) => ({
        id: `uploaded-${index}`,
        name: c['Campaign name'] || c.name || 'Unknown Campaign',
        client: c.client || 'Uploaded',
        clientType: c.clientType || 'developer',
        status: c['Campaign delivery'] === 'archived' ? 'paused' : 
                c['Campaign delivery'] === 'inactive' ? 'paused' : 'live',
        budget: parseFloat(c['Amount spent (GBP)'] || c.budget || '0') * 1.5 || 1000,
        spent: parseFloat(c['Amount spent (GBP)'] || c.spent || '0'),
        leads: parseInt(c.Results || c.leads || '0', 10),
        cpl: parseFloat(c['Amount spent (GBP)'] || '0') / Math.max(parseInt(c.Results || '1', 10), 1),
        startDate: c['Reporting starts'] || c.startDate || new Date().toISOString().split('T')[0],
      }));
      
      // Combine mock + uploaded, removing duplicates by name
      const combined = [...mappedCampaigns, ...mockCampaigns];
      const unique = combined.filter((c, i, arr) => 
        arr.findIndex(x => x.name === c.name) === i
      );
      setLocalCampaigns(unique);
    }
  }, [campaignData]);

  // Handle importing campaigns from file upload
  const handleCampaignsImport = (importedCampaigns: Campaign[]) => {
    setLocalCampaigns(prev => [...importedCampaigns, ...prev]);
  };

  const uniqueClients = [...new Set(localCampaigns.map((c) => c.client))];

  const filteredCampaigns = localCampaigns
    .filter((campaign) => {
      const matchesSearch =
        campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        campaign.client.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || campaign.status === statusFilter;
      const matchesClient = clientFilter === "all" || campaign.client === clientFilter;
      return matchesSearch && matchesStatus && matchesClient;
    })
    .sort((a, b) => {
      if (!columnSort.direction) return 0;
      let comparison = 0;
      switch (columnSort.field) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "client":
          comparison = a.client.localeCompare(b.client);
          break;
        case "status":
          comparison = a.status.localeCompare(b.status);
          break;
        case "budget":
          comparison = a.budget - b.budget;
          break;
        case "spent":
          comparison = a.spent - b.spent;
          break;
        case "leads":
          comparison = a.leads - b.leads;
          break;
        case "cpl":
          comparison = a.cpl - b.cpl;
          break;
        case "startDate":
          comparison = new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
          break;
        default:
          comparison = 0;
      }
      return columnSort.direction === "asc" ? comparison : -comparison;
    });

  const exportToCSV = () => {
    const headers = ["Campaign", "Client", "Status", "Budget", "Spent", "Leads", "CPL", "Start Date"];
    const rows = filteredCampaigns.map(c => [
      c.name, c.client, c.status, c.budget, c.spent, c.leads, c.cpl, c.startDate
    ]);
    const csvContent = [headers.join(","), ...rows.map(row => row.map(cell => `"${cell}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `campaigns_export_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    toast({ title: "Export successful", description: `${filteredCampaigns.length} campaigns exported.` });
  };

  const renderSortIcon = (field: string) => {
    if (columnSort.field !== field) return <ArrowUpDown className="h-3 w-3 ml-1 opacity-50" />;
    if (columnSort.direction === "asc") return <ArrowUp className="h-3 w-3 ml-1" />;
    return <ArrowDown className="h-3 w-3 ml-1" />;
  };

  const ColumnHeader = ({ field, label, className = "" }: { field: string; label: string; className?: string }) => (
    <TableHead className={className}>
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
                  <DropdownMenuItem onClick={() => setStatusFilter("all")}>All Status</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("live")}>Live</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("paused")}>Paused</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("draft")}>Draft</DropdownMenuItem>
                </>
              )}
              {field === "client" && (
                <>
                  <DropdownMenuItem onClick={() => setClientFilter("all")}>All Clients</DropdownMenuItem>
                  {uniqueClients.map(c => (
                    <DropdownMenuItem key={c} onClick={() => setClientFilter(c)}>{c}</DropdownMenuItem>
                  ))}
                </>
              )}
              {!["status", "client"].includes(field) && (
                <DropdownMenuItem disabled>No filters available</DropdownMenuItem>
              )}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
    </TableHead>
  );

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 md:p-6">
        <CardTitle className="text-base md:text-lg">All Campaigns ({filteredCampaigns.length})</CardTitle>
        <div className="flex gap-2 w-full sm:w-auto">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-32 text-xs md:text-sm h-8">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="live">Live</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
          <Select value={clientFilter} onValueChange={setClientFilter}>
            <SelectTrigger className="w-full sm:w-40 text-xs md:text-sm h-8">
              <SelectValue placeholder="Client" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Clients</SelectItem>
              {uniqueClients.map((client) => (
                <SelectItem key={client} value={client}>
                  {client}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <ReportUploadDialog 
            type="campaigns" 
            onUploadComplete={(data) => {
              console.log("Campaign report processed:", data);
            }}
            onCampaignsImport={handleCampaignsImport}
          />
          <Button onClick={exportToCSV} variant="outline" size="sm" className="gap-2 h-8">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0 md:p-6 md:pt-0">
        <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <ColumnHeader field="name" label="Campaign" />
              <ColumnHeader field="client" label="Client" />
              <ColumnHeader field="status" label="Status" className="text-center" />
              <ColumnHeader field="budget" label="Budget" className="text-right" />
              <ColumnHeader field="spent" label="Spent" className="text-right" />
              <ColumnHeader field="leads" label="Leads" className="text-center" />
              <ColumnHeader field="cpl" label="CPL" className="text-right" />
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCampaigns.map((campaign) => (
              <TableRow key={campaign.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{campaign.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Started {new Date(campaign.startDate).toLocaleDateString()}
                    </p>
                  </div>
                </TableCell>
                <TableCell>{campaign.client}</TableCell>
                <TableCell className="text-center">
                  <Badge variant={getStatusColor(campaign.status)}>{campaign.status}</Badge>
                </TableCell>
                <TableCell className="text-right">£{campaign.budget.toLocaleString()}</TableCell>
                <TableCell className="text-right">
                  <div>
                    <p>£{campaign.spent.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">
                      {Math.round((campaign.spent / campaign.budget) * 100)}%
                    </p>
                  </div>
                </TableCell>
                <TableCell className="text-center">{campaign.leads}</TableCell>
                <TableCell className="text-right">
                  {campaign.cpl > 0 ? `£${campaign.cpl.toFixed(2)}` : "-"}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="gap-2">
                        <Eye className="h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2">
                        <BarChart3 className="h-4 w-4" />
                        Analytics
                      </DropdownMenuItem>
                      {campaign.status === "live" ? (
                        <DropdownMenuItem className="gap-2">
                          <Pause className="h-4 w-4" />
                          Pause Campaign
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem className="gap-2">
                          <Play className="h-4 w-4" />
                          Resume Campaign
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem className="gap-2">
                        <Copy className="h-4 w-4" />
                        Duplicate
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminCampaignsTable;
