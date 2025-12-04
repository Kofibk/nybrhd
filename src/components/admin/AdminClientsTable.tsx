import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Building2, 
  User, 
  Briefcase, 
  MoreHorizontal, 
  Eye, 
  Megaphone, 
  Mail, 
  Edit, 
  UserX,
  Phone,
  Globe,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Filter,
  Download
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface AdminClientsTableProps {
  searchQuery: string;
}

type SortDirection = "asc" | "desc" | null;

interface ColumnSort {
  field: string;
  direction: SortDirection;
}

// Mock client data with more details
const mockClients = [
  {
    id: "1",
    name: "Berkeley Homes",
    contactName: "James Wilson",
    email: "marketing@berkeleyhomes.co.uk",
    phone: "+44 20 7123 4567",
    website: "www.berkeleyhomes.co.uk",
    type: "developer",
    activeCampaigns: 3,
    totalLeads: 245,
    totalSpend: 12500,
    status: "active",
    plan: "Enterprise",
    notes: "Key account - quarterly review scheduled",
  },
  {
    id: "2",
    name: "Knight Frank",
    contactName: "Sarah Chen",
    email: "digital@knightfrank.com",
    phone: "+44 20 7456 7890",
    website: "www.knightfrank.com",
    type: "agent",
    activeCampaigns: 2,
    totalLeads: 128,
    totalSpend: 8200,
    status: "active",
    plan: "Professional",
    notes: "",
  },
  {
    id: "3",
    name: "London & Country",
    contactName: "Michael Brown",
    email: "ads@londonandcountry.co.uk",
    phone: "+44 20 7890 1234",
    website: "www.londonandcountry.co.uk",
    type: "broker",
    activeCampaigns: 1,
    totalLeads: 89,
    totalSpend: 4500,
    status: "active",
    plan: "Starter",
    notes: "Interested in upgrading to Professional",
  },
  {
    id: "4",
    name: "Barratt Developments",
    contactName: "Emma Thompson",
    email: "campaigns@barrattdev.com",
    phone: "+44 20 7234 5678",
    website: "www.barrattdevelopments.co.uk",
    type: "developer",
    activeCampaigns: 4,
    totalLeads: 412,
    totalSpend: 18900,
    status: "active",
    plan: "Enterprise",
    notes: "VIP client - dedicated account manager",
  },
  {
    id: "5",
    name: "Savills",
    contactName: "David Lee",
    email: "marketing@savills.com",
    phone: "+44 20 7567 8901",
    website: "www.savills.com",
    type: "agent",
    activeCampaigns: 0,
    totalLeads: 56,
    totalSpend: 2100,
    status: "paused",
    plan: "Professional",
    notes: "Paused campaigns - budget review in progress",
  },
];

const getTypeIcon = (type: string) => {
  switch (type) {
    case "developer":
      return <Building2 className="h-4 w-4" />;
    case "agent":
      return <User className="h-4 w-4" />;
    case "broker":
      return <Briefcase className="h-4 w-4" />;
    default:
      return <User className="h-4 w-4" />;
  }
};

const getTypeLabel = (type: string) => {
  switch (type) {
    case "developer":
      return "Developer";
    case "agent":
      return "Estate Agent";
    case "broker":
      return "Mortgage Broker";
    default:
      return type;
  }
};

const AdminClientsTable = ({ searchQuery }: AdminClientsTableProps) => {
  const navigate = useNavigate();
  const [editingClient, setEditingClient] = useState<typeof mockClients[0] | null>(null);
  const [viewingClient, setViewingClient] = useState<typeof mockClients[0] | null>(null);
  const [columnSort, setColumnSort] = useState<ColumnSort>({ field: "name", direction: "asc" });
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [planFilter, setPlanFilter] = useState<string>("all");
  const [editFormData, setEditFormData] = useState({
    name: "",
    contactName: "",
    email: "",
    phone: "",
    website: "",
    type: "",
    plan: "",
    notes: "",
  });

  const filteredClients = mockClients
    .filter((client) => {
      const matchesSearch =
        client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.contactName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === "all" || client.type === typeFilter;
      const matchesStatus = statusFilter === "all" || client.status === statusFilter;
      const matchesPlan = planFilter === "all" || client.plan === planFilter;
      return matchesSearch && matchesType && matchesStatus && matchesPlan;
    })
    .sort((a, b) => {
      if (!columnSort.direction) return 0;
      let comparison = 0;
      switch (columnSort.field) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "contact":
          comparison = a.contactName.localeCompare(b.contactName);
          break;
        case "type":
          comparison = a.type.localeCompare(b.type);
          break;
        case "plan":
          comparison = a.plan.localeCompare(b.plan);
          break;
        case "campaigns":
          comparison = a.activeCampaigns - b.activeCampaigns;
          break;
        case "leads":
          comparison = a.totalLeads - b.totalLeads;
          break;
        case "spend":
          comparison = a.totalSpend - b.totalSpend;
          break;
        case "status":
          comparison = a.status.localeCompare(b.status);
          break;
        default:
          comparison = 0;
      }
      return columnSort.direction === "asc" ? comparison : -comparison;
    });

  const handleEditClient = (client: typeof mockClients[0]) => {
    setEditingClient(client);
    setEditFormData({
      name: client.name,
      contactName: client.contactName,
      email: client.email,
      phone: client.phone,
      website: client.website,
      type: client.type,
      plan: client.plan,
      notes: client.notes,
    });
  };

  const handleSaveEdit = () => {
    toast({
      title: "Client updated",
      description: `${editFormData.name} has been updated successfully.`,
    });
    setEditingClient(null);
  };

  const exportToCSV = () => {
    const headers = ["Name", "Contact", "Email", "Phone", "Type", "Plan", "Campaigns", "Leads", "Spend", "Status"];
    const rows = filteredClients.map(c => [
      c.name, c.contactName, c.email, c.phone, getTypeLabel(c.type), c.plan, c.activeCampaigns, c.totalLeads, c.totalSpend, c.status
    ]);
    const csvContent = [headers.join(","), ...rows.map(row => row.map(cell => `"${cell}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `clients_export_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    toast({ title: "Export successful", description: `${filteredClients.length} clients exported.` });
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
              {field === "type" && (
                <>
                  <DropdownMenuItem onClick={() => setTypeFilter("all")}>All Types</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTypeFilter("developer")}>Developer</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTypeFilter("agent")}>Estate Agent</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTypeFilter("broker")}>Mortgage Broker</DropdownMenuItem>
                </>
              )}
              {field === "status" && (
                <>
                  <DropdownMenuItem onClick={() => setStatusFilter("all")}>All Statuses</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("active")}>Active</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("paused")}>Paused</DropdownMenuItem>
                </>
              )}
              {field === "plan" && (
                <>
                  <DropdownMenuItem onClick={() => setPlanFilter("all")}>All Plans</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setPlanFilter("Starter")}>Starter</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setPlanFilter("Professional")}>Professional</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setPlanFilter("Enterprise")}>Enterprise</DropdownMenuItem>
                </>
              )}
              {!["type", "status", "plan"].includes(field) && (
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
      <Card>
        <CardHeader className="p-4 md:p-6">
          <div className="flex flex-col sm:flex-row justify-between gap-3">
            <CardTitle className="text-base md:text-lg">All Clients ({filteredClients.length})</CardTitle>
            <Button onClick={exportToCSV} variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2 mt-3">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-36 h-8 text-xs">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="developer">Developer</SelectItem>
                <SelectItem value="agent">Estate Agent</SelectItem>
                <SelectItem value="broker">Mortgage Broker</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-32 h-8 text-xs">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
              </SelectContent>
            </Select>
            <Select value={planFilter} onValueChange={setPlanFilter}>
              <SelectTrigger className="w-full sm:w-36 h-8 text-xs">
                <SelectValue placeholder="Plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Plans</SelectItem>
                <SelectItem value="Starter">Starter</SelectItem>
                <SelectItem value="Professional">Professional</SelectItem>
                <SelectItem value="Enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0 md:p-6 md:pt-0">
          <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <ColumnHeader field="name" label="Client" />
                <ColumnHeader field="contact" label="Contact" />
                <ColumnHeader field="type" label="Type" />
                <ColumnHeader field="plan" label="Plan" />
                <ColumnHeader field="campaigns" label="Campaigns" className="text-center" />
                <ColumnHeader field="leads" label="Leads" className="text-center" />
                <ColumnHeader field="spend" label="Spend" className="text-right" />
                <ColumnHeader field="status" label="Status" className="text-center" />
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.map((client) => (
                <TableRow key={client.id} className="cursor-pointer" onClick={() => navigate(`/admin/clients/${client.id}`)}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{client.name}</p>
                      <p className="text-sm text-muted-foreground">{client.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">{client.contactName}</p>
                    <p className="text-xs text-muted-foreground">{client.phone}</p>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getTypeIcon(client.type)}
                      <span className="text-sm">{getTypeLabel(client.type)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{client.plan}</Badge>
                  </TableCell>
                  <TableCell className="text-center">{client.activeCampaigns}</TableCell>
                  <TableCell className="text-center">{client.totalLeads.toLocaleString()}</TableCell>
                  <TableCell className="text-right">£{client.totalSpend.toLocaleString()}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={client.status === "active" ? "default" : "secondary"}>
                      {client.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          className="gap-2"
                          onClick={() => navigate(`/admin/clients/${client.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="gap-2"
                          onClick={() => handleEditClient(client)}
                        >
                          <Edit className="h-4 w-4" />
                          Edit Client
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="gap-2">
                          <Megaphone className="h-4 w-4" />
                          Create Campaign
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2">
                          <Mail className="h-4 w-4" />
                          Send Email
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="gap-2 text-destructive">
                          <UserX className="h-4 w-4" />
                          Deactivate Client
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

      {/* View Client Dialog */}
      <Dialog open={!!viewingClient} onOpenChange={() => setViewingClient(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{viewingClient?.name}</DialogTitle>
            <DialogDescription>Client details and account information</DialogDescription>
          </DialogHeader>
          {viewingClient && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Contact Person</Label>
                  <p className="font-medium">{viewingClient.contactName}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Type</Label>
                  <p className="font-medium">{getTypeLabel(viewingClient.type)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <p className="font-medium">{viewingClient.email}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Phone</Label>
                  <p className="font-medium">{viewingClient.phone}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Website</Label>
                  <p className="font-medium">{viewingClient.website}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Plan</Label>
                  <Badge variant="outline">{viewingClient.plan}</Badge>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                <div className="text-center">
                  <p className="text-2xl font-bold">{viewingClient.activeCampaigns}</p>
                  <p className="text-sm text-muted-foreground">Active Campaigns</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{viewingClient.totalLeads}</p>
                  <p className="text-sm text-muted-foreground">Total Leads</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">£{viewingClient.totalSpend.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Total Spend</p>
                </div>
              </div>
              {viewingClient.notes && (
                <div className="pt-4 border-t">
                  <Label className="text-muted-foreground">Notes</Label>
                  <p className="text-sm mt-1">{viewingClient.notes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewingClient(null)}>Close</Button>
            <Button onClick={() => {
              if (viewingClient) handleEditClient(viewingClient);
              setViewingClient(null);
            }}>
              Edit Client
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Client Dialog */}
      <Dialog open={!!editingClient} onOpenChange={() => setEditingClient(null)}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Edit Client</DialogTitle>
            <DialogDescription>Update client information and settings</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Company Name</Label>
                <Input
                  id="edit-name"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-contact">Contact Person</Label>
                <Input
                  id="edit-contact"
                  value={editFormData.contactName}
                  onChange={(e) => setEditFormData({ ...editFormData, contactName: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Phone</Label>
                <Input
                  id="edit-phone"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-website">Website</Label>
              <Input
                id="edit-website"
                value={editFormData.website}
                onChange={(e) => setEditFormData({ ...editFormData, website: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-type">Client Type</Label>
                <Select
                  value={editFormData.type}
                  onValueChange={(value) => setEditFormData({ ...editFormData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="developer">Developer</SelectItem>
                    <SelectItem value="agent">Estate Agent</SelectItem>
                    <SelectItem value="broker">Mortgage Broker</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-plan">Plan</Label>
                <Select
                  value={editFormData.plan}
                  onValueChange={(value) => setEditFormData({ ...editFormData, plan: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Starter">Starter</SelectItem>
                    <SelectItem value="Professional">Professional</SelectItem>
                    <SelectItem value="Enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-notes">Internal Notes</Label>
              <Textarea
                id="edit-notes"
                value={editFormData.notes}
                onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingClient(null)}>Cancel</Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminClientsTable;
