import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  MoreHorizontal,
  UserCheck,
  UserX,
  Building2,
  Filter,
  Download,
  Mail,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useProfiles, useUpdateProfile, useCompanies } from "@/hooks/useAdminData";
import { Skeleton } from "@/components/ui/skeleton";

interface AdminUsersTableProps {
  searchQuery: string;
}

const AdminUsersTable = ({ searchQuery }: AdminUsersTableProps) => {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const { data: profiles = [], isLoading, error } = useProfiles();
  const { data: companies = [] } = useCompanies();
  const updateProfile = useUpdateProfile();

  const filteredUsers = profiles.filter((user: any) => {
    const matchesSearch =
      (user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.company?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    const matchesType = typeFilter === "all" || user.user_type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    try {
      await updateProfile.mutateAsync({ id: userId, status: newStatus });
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleExport = () => {
    const csvContent = [
      ["Name", "Email", "Company", "Type", "Status", "Created"],
      ...filteredUsers.map((u: any) => [
        u.full_name || "",
        u.email,
        u.company?.name || "Individual",
        u.user_type,
        u.status,
        u.created_at,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "users-export.csv";
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Export complete",
      description: `${filteredUsers.length} users exported to CSV.`,
    });
  };

  const getUserTypeBadgeVariant = (type: string) => {
    switch (type) {
      case "developer":
        return "default";
      case "agent":
        return "secondary";
      case "broker":
        return "outline";
      default:
        return "secondary";
    }
  };

  if (error) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-destructive">
          Failed to load users. Please try again.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-4 px-4 md:px-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <CardTitle className="text-base md:text-lg">Users Management</CardTitle>
          <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground hidden sm:block" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[120px] h-8 sm:h-9 text-xs sm:text-sm">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-[130px] h-8 sm:h-9 text-xs sm:text-sm">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="developer">Developer</SelectItem>
                  <SelectItem value="agent">Agent</SelectItem>
                  <SelectItem value="broker">Broker</SelectItem>
                  <SelectItem value="individual">Individual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" size="sm" onClick={handleExport} className="h-8 sm:h-9 text-xs sm:text-sm">
              <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-0 md:px-6">
        {/* Mobile hint */}
        <div className="md:hidden px-4 py-2 bg-muted/30 border-b text-xs text-muted-foreground">
          ← Scroll to see all columns →
        </div>
        <div className="overflow-x-auto">
          <Table className="min-w-[860px]">
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">User</TableHead>
                <TableHead className="text-xs hidden sm:table-cell">Company</TableHead>
                <TableHead className="text-xs hidden lg:table-cell">Job Title</TableHead>
                <TableHead className="text-xs">Type</TableHead>
                <TableHead className="text-xs hidden sm:table-cell">Onboarding</TableHead>
                <TableHead className="text-right text-xs">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-10 w-48" /></TableCell>
                    <TableCell className="hidden sm:table-cell"><Skeleton className="h-6 w-32" /></TableCell>
                    <TableCell className="hidden lg:table-cell"><Skeleton className="h-6 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell className="hidden sm:table-cell"><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : (
                filteredUsers.map((user: any) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-xs sm:text-sm">{user.full_name || "Unnamed"}</p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground truncate max-w-[120px] sm:max-w-none">
                          {user.email}
                        </p>
                        {/* Show company on mobile under email */}
                        {user.company && (
                          <div className="flex items-center gap-1 mt-0.5 sm:hidden">
                            <Building2 className="h-2.5 w-2.5 text-muted-foreground" />
                            <span className="text-[10px] text-muted-foreground">{user.company.name}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {user.company ? (
                        <div className="flex items-center gap-1.5">
                          <Building2 className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs sm:text-sm">{user.company.name}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs sm:text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <span className="text-xs sm:text-sm text-muted-foreground">{user.job_title || "—"}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getUserTypeBadgeVariant(user.user_type)} className="text-[10px] sm:text-xs">
                        {user.user_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant={user.onboarding_completed ? "default" : "secondary"} className="text-[10px] sm:text-xs">
                        {user.onboarding_completed ? "Complete" : "Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleToggleStatus(user.id, user.status)} className="text-xs">
                            {user.status === "active" ? (
                              <>
                                <UserX className="h-3.5 w-3.5 mr-2" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <UserCheck className="h-3.5 w-3.5 mr-2" />
                                Activate
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-xs">
                            <Mail className="h-3.5 w-3.5 mr-2" />
                            Send Email
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
              {!isLoading && filteredUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No users found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminUsersTable;
