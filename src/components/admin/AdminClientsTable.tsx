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
import { Building2, User, Briefcase, MoreHorizontal, Eye, Megaphone, Mail } from "lucide-react";

interface AdminClientsTableProps {
  searchQuery: string;
}

// Mock client data
const mockClients = [
  {
    id: "1",
    name: "Berkeley Homes",
    email: "marketing@berkeleyhomes.co.uk",
    type: "developer",
    activeCampaigns: 3,
    totalLeads: 245,
    totalSpend: 12500,
    status: "active",
  },
  {
    id: "2",
    name: "Knight Frank",
    email: "digital@knightfrank.com",
    type: "agent",
    activeCampaigns: 2,
    totalLeads: 128,
    totalSpend: 8200,
    status: "active",
  },
  {
    id: "3",
    name: "London & Country",
    email: "ads@londonandcountry.co.uk",
    type: "broker",
    activeCampaigns: 1,
    totalLeads: 89,
    totalSpend: 4500,
    status: "active",
  },
  {
    id: "4",
    name: "Barratt Developments",
    email: "campaigns@barrattdev.com",
    type: "developer",
    activeCampaigns: 4,
    totalLeads: 412,
    totalSpend: 18900,
    status: "active",
  },
  {
    id: "5",
    name: "Savills",
    email: "marketing@savills.com",
    type: "agent",
    activeCampaigns: 0,
    totalLeads: 56,
    totalSpend: 2100,
    status: "paused",
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
  const filteredClients = mockClients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Clients</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-center">Active Campaigns</TableHead>
              <TableHead className="text-center">Total Leads</TableHead>
              <TableHead className="text-right">Total Spend</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClients.map((client) => (
              <TableRow key={client.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{client.name}</p>
                    <p className="text-sm text-muted-foreground">{client.email}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getTypeIcon(client.type)}
                    <span className="text-sm">{getTypeLabel(client.type)}</span>
                  </div>
                </TableCell>
                <TableCell className="text-center">{client.activeCampaigns}</TableCell>
                <TableCell className="text-center">{client.totalLeads.toLocaleString()}</TableCell>
                <TableCell className="text-right">£{client.totalSpend.toLocaleString()}</TableCell>
                <TableCell className="text-center">
                  <Badge variant={client.status === "active" ? "default" : "secondary"}>
                    {client.status}
                  </Badge>
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
                        <Megaphone className="h-4 w-4" />
                        Create Campaign
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2">
                        <Mail className="h-4 w-4" />
                        Send Email
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default AdminClientsTable;
