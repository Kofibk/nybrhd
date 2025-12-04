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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
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
  CreditCard, 
  FileText, 
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle
} from "lucide-react";

interface AdminBillingTableProps {
  searchQuery: string;
}

// Mock billing data
const mockBillingData = [
  {
    id: "1",
    clientName: "Berkeley Homes",
    plan: "Enterprise",
    monthlyFee: 2500,
    adSpendBudget: 15000,
    status: "active",
    nextBilling: "2024-02-01",
    lastPayment: "2024-01-01",
    paymentMethod: "Bank Transfer",
  },
  {
    id: "2",
    clientName: "Knight Frank",
    plan: "Professional",
    monthlyFee: 1500,
    adSpendBudget: 8000,
    status: "active",
    nextBilling: "2024-02-05",
    lastPayment: "2024-01-05",
    paymentMethod: "Credit Card",
  },
  {
    id: "3",
    clientName: "London & Country",
    plan: "Starter",
    monthlyFee: 500,
    adSpendBudget: 3000,
    status: "active",
    nextBilling: "2024-02-10",
    lastPayment: "2024-01-10",
    paymentMethod: "Credit Card",
  },
  {
    id: "4",
    clientName: "Barratt Developments",
    plan: "Enterprise",
    monthlyFee: 3000,
    adSpendBudget: 25000,
    status: "overdue",
    nextBilling: "2024-01-15",
    lastPayment: "2023-12-15",
    paymentMethod: "Bank Transfer",
  },
  {
    id: "5",
    clientName: "Savills",
    plan: "Professional",
    monthlyFee: 1500,
    adSpendBudget: 10000,
    status: "paused",
    nextBilling: "-",
    lastPayment: "2023-12-20",
    paymentMethod: "Credit Card",
  },
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case "active":
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case "overdue":
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    case "paused":
      return <Clock className="h-4 w-4 text-yellow-500" />;
    case "cancelled":
      return <XCircle className="h-4 w-4 text-gray-500" />;
    default:
      return null;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "default";
    case "overdue":
      return "destructive";
    case "paused":
      return "secondary";
    case "cancelled":
      return "outline";
    default:
      return "secondary";
  }
};

const getPlanColor = (plan: string) => {
  switch (plan) {
    case "Enterprise":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
    case "Professional":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    case "Starter":
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    default:
      return "";
  }
};

const AdminBillingTable = ({ searchQuery }: AdminBillingTableProps) => {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [planFilter, setPlanFilter] = useState<string>("all");

  const filteredBilling = mockBillingData.filter((billing) => {
    const matchesSearch = billing.clientName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || billing.status === statusFilter;
    const matchesPlan = planFilter === "all" || billing.plan === planFilter;
    return matchesSearch && matchesStatus && matchesPlan;
  });

  const totalMonthlyRevenue = filteredBilling
    .filter(b => b.status === "active")
    .reduce((sum, b) => sum + b.monthlyFee, 0);

  const totalAdSpendManaged = filteredBilling
    .filter(b => b.status === "active")
    .reduce((sum, b) => sum + b.adSpendBudget, 0);

  return (
    <div className="space-y-4">
      {/* Billing Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Monthly Revenue</p>
            <p className="text-2xl font-bold text-green-600">£{totalMonthlyRevenue.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Ad Spend Managed</p>
            <p className="text-2xl font-bold">£{totalAdSpendManaged.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Active Subscriptions</p>
            <p className="text-2xl font-bold">{mockBillingData.filter(b => b.status === "active").length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Overdue Payments</p>
            <p className="text-2xl font-bold text-red-600">{mockBillingData.filter(b => b.status === "overdue").length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Billing Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Client Billing</CardTitle>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={planFilter} onValueChange={setPlanFilter}>
              <SelectTrigger className="w-32">
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
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead className="text-right">Monthly Fee</TableHead>
                <TableHead className="text-right">Ad Budget</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead>Next Billing</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBilling.map((billing) => (
                <TableRow key={billing.id}>
                  <TableCell className="font-medium">{billing.clientName}</TableCell>
                  <TableCell>
                    <Badge className={getPlanColor(billing.plan)} variant="outline">
                      {billing.plan}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    £{billing.monthlyFee.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    £{billing.adSpendBudget.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      {getStatusIcon(billing.status)}
                      <Badge variant={getStatusColor(billing.status) as any}>
                        {billing.status}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>{billing.nextBilling}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {billing.paymentMethod}
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
                          <FileText className="h-4 w-4" />
                          View Invoices
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2">
                          <CreditCard className="h-4 w-4" />
                          Update Payment
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {billing.status === "active" && (
                          <DropdownMenuItem className="gap-2 text-yellow-600">
                            <Clock className="h-4 w-4" />
                            Pause Subscription
                          </DropdownMenuItem>
                        )}
                        {billing.status === "paused" && (
                          <DropdownMenuItem className="gap-2 text-green-600">
                            <CheckCircle className="h-4 w-4" />
                            Reactivate
                          </DropdownMenuItem>
                        )}
                        {billing.status === "overdue" && (
                          <DropdownMenuItem className="gap-2 text-blue-600">
                            <AlertCircle className="h-4 w-4" />
                            Send Reminder
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminBillingTable;
