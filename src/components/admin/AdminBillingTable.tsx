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
import { useSubscriptions, useInvoices, useAdminStats } from "@/hooks/useAdminData";
import { Skeleton } from "@/components/ui/skeleton";

interface AdminBillingTableProps {
  searchQuery: string;
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "active":
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case "past_due":
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    case "paused":
    case "trial":
      return <Clock className="h-4 w-4 text-yellow-500" />;
    case "cancelled":
      return <XCircle className="h-4 w-4 text-gray-500" />;
    default:
      return null;
  }
};

const getStatusColor = (status: string): "default" | "destructive" | "secondary" | "outline" => {
  switch (status) {
    case "active":
      return "default";
    case "past_due":
      return "destructive";
    case "paused":
    case "trial":
      return "secondary";
    case "cancelled":
      return "outline";
    default:
      return "secondary";
  }
};

const getPlanColor = (plan: string) => {
  switch (plan) {
    case "enterprise":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
    case "growth":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    case "starter":
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    case "custom":
      return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200";
    default:
      return "";
  }
};

const AdminBillingTable = ({ searchQuery }: AdminBillingTableProps) => {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [planFilter, setPlanFilter] = useState<string>("all");

  const { data: subscriptions = [], isLoading: subsLoading } = useSubscriptions();
  const { data: stats } = useAdminStats();

  const filteredBilling = subscriptions.filter((sub: any) => {
    const matchesSearch = sub.company?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false;
    const matchesStatus = statusFilter === "all" || sub.status === statusFilter;
    const matchesPlan = planFilter === "all" || sub.plan === planFilter;
    return matchesSearch && matchesStatus && matchesPlan;
  });

  const totalMonthlyRevenue = stats?.mrr || 0;
  const activeSubscriptions = stats?.activeSubscriptions || 0;
  const overdueCount = subscriptions.filter((s: any) => s.status === "past_due").length;

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
            <p className="text-[10px] md:text-sm text-muted-foreground">Total Revenue</p>
            <p className="text-lg md:text-2xl font-bold">£{(stats?.totalRevenue || 0).toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 md:p-4">
            <p className="text-[10px] md:text-sm text-muted-foreground">Active Subscriptions</p>
            <p className="text-lg md:text-2xl font-bold">{activeSubscriptions}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 md:p-4">
            <p className="text-[10px] md:text-sm text-muted-foreground">Overdue Payments</p>
            <p className="text-lg md:text-2xl font-bold text-red-600">{overdueCount}</p>
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
                <SelectItem value="past_due">Overdue</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="trial">Trial</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={planFilter} onValueChange={setPlanFilter}>
              <SelectTrigger className="w-full sm:w-32 text-xs md:text-sm">
                <SelectValue placeholder="Plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Plans</SelectItem>
                <SelectItem value="starter">Starter</SelectItem>
                <SelectItem value="growth">Growth</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
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
                <TableHead className="text-right text-xs hidden md:table-cell">Leads Used</TableHead>
                <TableHead className="text-center text-xs">Status</TableHead>
                <TableHead className="text-xs hidden lg:table-cell">Billing Cycle</TableHead>
                <TableHead className="text-right text-xs w-10">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subsLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-8 w-32" /></TableCell>
                    <TableCell className="hidden sm:table-cell"><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16 ml-auto" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-6 w-12 ml-auto" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16 mx-auto" /></TableCell>
                    <TableCell className="hidden lg:table-cell"><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-7 w-7 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : (
                filteredBilling.map((billing: any) => (
                  <TableRow key={billing.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-xs sm:text-sm">{billing.company?.name || "Unknown"}</p>
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
                      £{(billing.monthly_fee || 0).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right text-xs sm:text-sm hidden md:table-cell">
                      {billing.leads_used || 0} / {billing.leads_included || "∞"}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-0.5 sm:gap-1">
                        {getStatusIcon(billing.status)}
                        <Badge variant={getStatusColor(billing.status)} className="text-[10px] sm:text-xs">
                          {billing.status}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs hidden lg:table-cell capitalize">
                      {billing.billing_cycle || "monthly"}
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
                          {billing.status === "past_due" && (
                            <DropdownMenuItem className="gap-2 text-xs text-blue-600">
                              <AlertCircle className="h-3.5 w-3.5" />
                              Send Reminder
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
              {!subsLoading && filteredBilling.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No subscriptions found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminBillingTable;
