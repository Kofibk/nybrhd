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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
        <Card>
          <CardContent className="p-3 md:p-4">
            <p className="text-[10px] md:text-sm text-muted-foreground">Monthly Revenue</p>
            <p className="text-lg md:text-2xl font-bold text-green-600">£{totalMonthlyRevenue.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 md:p-4">
            <p className="text-[10px] md:text-sm text-muted-foreground">Ad Spend Managed</p>
            <p className="text-lg md:text-2xl font-bold">£{totalAdSpendManaged.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 md:p-4">
            <p className="text-[10px] md:text-sm text-muted-foreground">Active Subscriptions</p>
            <p className="text-lg md:text-2xl font-bold">{mockBillingData.filter(b => b.status === "active").length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 md:p-4">
            <p className="text-[10px] md:text-sm text-muted-foreground">Overdue Payments</p>
            <p className="text-lg md:text-2xl font-bold text-red-600">{mockBillingData.filter(b => b.status === "overdue").length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Billing Table */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 md:p-6">
          <CardTitle className="text-base md:text-lg">Client Billing</CardTitle>
          <div className="flex gap-2 w-full sm:w-auto">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-32 text-xs md:text-sm">
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
              <SelectTrigger className="w-full sm:w-32 text-xs md:text-sm">
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
                <TableHead className="text-xs">Client</TableHead>
                <TableHead className="text-xs hidden sm:table-cell">Plan</TableHead>
                <TableHead className="text-right text-xs">Fee</TableHead>
                <TableHead className="text-right text-xs hidden md:table-cell">Ad Budget</TableHead>
                <TableHead className="text-center text-xs">Status</TableHead>
                <TableHead className="text-xs hidden lg:table-cell">Next Billing</TableHead>
                <TableHead className="text-xs hidden xl:table-cell">Payment</TableHead>
                <TableHead className="text-right text-xs w-10">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBilling.map((billing) => (
                <TableRow key={billing.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-xs sm:text-sm">{billing.clientName}</p>
                      <div className="sm:hidden">
                        <Badge className={`${getPlanColor(billing.plan)} text-[10px] mt-0.5`} variant="outline">
                          {billing.plan}
                        </Badge>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge className={getPlanColor(billing.plan)} variant="outline">
                      {billing.plan}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium text-xs sm:text-sm">
                    £{billing.monthlyFee.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right text-xs sm:text-sm hidden md:table-cell">
                    £{billing.adSpendBudget.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-0.5 sm:gap-1">
                      {getStatusIcon(billing.status)}
                      <Badge variant={getStatusColor(billing.status) as any} className="text-[10px] sm:text-xs">
                        {billing.status}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs hidden lg:table-cell">{billing.nextBilling}</TableCell>
                  <TableCell className="text-xs text-muted-foreground hidden xl:table-cell">
                    {billing.paymentMethod}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="gap-2 text-xs">
                          <Eye className="h-3.5 w-3.5" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2 text-xs">
                          <FileText className="h-3.5 w-3.5" />
                          View Invoices
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2 text-xs">
                          <CreditCard className="h-3.5 w-3.5" />
                          Update Payment
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {billing.status === "active" && (
                          <DropdownMenuItem className="gap-2 text-xs text-yellow-600">
                            <Clock className="h-3.5 w-3.5" />
                            Pause Subscription
                          </DropdownMenuItem>
                        )}
                        {billing.status === "paused" && (
                          <DropdownMenuItem className="gap-2 text-xs text-green-600">
                            <CheckCircle className="h-3.5 w-3.5" />
                            Reactivate
                          </DropdownMenuItem>
                        )}
                        {billing.status === "overdue" && (
                          <DropdownMenuItem className="gap-2 text-xs text-blue-600">
                            <AlertCircle className="h-3.5 w-3.5" />
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminBillingTable;
