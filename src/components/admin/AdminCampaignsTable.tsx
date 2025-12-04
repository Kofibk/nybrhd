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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MoreHorizontal, Eye, Pause, Play, Copy, BarChart3 } from "lucide-react";

interface AdminCampaignsTableProps {
  searchQuery: string;
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

const AdminCampaignsTable = ({ searchQuery }: AdminCampaignsTableProps) => {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [clientFilter, setClientFilter] = useState<string>("all");

  const filteredCampaigns = mockCampaigns.filter((campaign) => {
    const matchesSearch =
      campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.client.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || campaign.status === statusFilter;
    const matchesClient = clientFilter === "all" || campaign.client === clientFilter;
    return matchesSearch && matchesStatus && matchesClient;
  });

  const uniqueClients = [...new Set(mockCampaigns.map((c) => c.client))];

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 md:p-6">
        <CardTitle className="text-base md:text-lg">All Campaigns</CardTitle>
        <div className="flex gap-2 w-full sm:w-auto">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-32 text-xs md:text-sm">
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
            <SelectTrigger className="w-full sm:w-40 text-xs md:text-sm">
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
        </div>
      </CardHeader>
      <CardContent className="p-0 md:p-6 md:pt-0">
        <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Campaign</TableHead>
              <TableHead>Client</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-right">Budget</TableHead>
              <TableHead className="text-right">Spent</TableHead>
              <TableHead className="text-center">Leads</TableHead>
              <TableHead className="text-right">CPL</TableHead>
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
