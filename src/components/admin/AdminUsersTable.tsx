import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
  UserPlus,
  MoreHorizontal,
  UserCheck,
  UserX,
  Building2,
  Filter,
  Download,
  Mail,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface User {
  id: string;
  fullName: string;
  email: string;
  company: string | null;
  companyId: string | null;
  status: "active" | "inactive";
  userType: "developer" | "agent" | "broker" | "individual";
  phone: string | null;
  createdAt: string;
  lastLogin: string | null;
}

interface AdminUsersTableProps {
  searchQuery: string;
}

const AdminUsersTable = ({ searchQuery }: AdminUsersTableProps) => {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    fullName: "",
    email: "",
    userType: "individual" as User["userType"],
    companyId: "",
  });

  // Mock users data - in production this would come from the database
  const [users, setUsers] = useState<User[]>([
    {
      id: "1",
      fullName: "John Smith",
      email: "john@luxurydev.com",
      company: "Luxury Developments Ltd",
      companyId: "c1",
      status: "active",
      userType: "developer",
      phone: "+44 7700 900123",
      createdAt: "2024-01-15",
      lastLogin: "2024-02-10",
    },
    {
      id: "2",
      fullName: "Sarah Johnson",
      email: "sarah@premierestates.co.uk",
      company: "Premier Estates",
      companyId: "c2",
      status: "active",
      userType: "agent",
      phone: "+44 7700 900456",
      createdAt: "2024-01-20",
      lastLogin: "2024-02-09",
    },
    {
      id: "3",
      fullName: "Michael Brown",
      email: "m.brown@citymortgages.com",
      company: "City Mortgages",
      companyId: "c3",
      status: "inactive",
      userType: "broker",
      phone: "+44 7700 900789",
      createdAt: "2024-02-01",
      lastLogin: "2024-02-01",
    },
    {
      id: "4",
      fullName: "Emma Wilson",
      email: "emma.w@gmail.com",
      company: null,
      companyId: null,
      status: "active",
      userType: "individual",
      phone: null,
      createdAt: "2024-02-05",
      lastLogin: "2024-02-08",
    },
    {
      id: "5",
      fullName: "David Chen",
      email: "david@luxurydev.com",
      company: "Luxury Developments Ltd",
      companyId: "c1",
      status: "active",
      userType: "developer",
      phone: "+44 7700 900321",
      createdAt: "2024-02-08",
      lastLogin: "2024-02-10",
    },
  ]);

  // Mock companies for dropdown
  const companies = [
    { id: "c1", name: "Luxury Developments Ltd" },
    { id: "c2", name: "Premier Estates" },
    { id: "c3", name: "City Mortgages" },
    { id: "c4", name: "Global Properties" },
  ];

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.company?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    const matchesType = typeFilter === "all" || user.userType === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleToggleStatus = (userId: string) => {
    setUsers(users.map((user) => {
      if (user.id === userId) {
        const newStatus = user.status === "active" ? "inactive" : "active";
        toast({
          title: `User ${newStatus === "active" ? "activated" : "deactivated"}`,
          description: `${user.fullName} has been ${newStatus === "active" ? "activated" : "deactivated"}.`,
        });
        return { ...user, status: newStatus };
      }
      return user;
    }));
  };

  const handleAddUser = () => {
    if (!newUser.fullName || !newUser.email) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const company = companies.find((c) => c.id === newUser.companyId);
    const user: User = {
      id: `u${Date.now()}`,
      fullName: newUser.fullName,
      email: newUser.email,
      company: company?.name || null,
      companyId: newUser.companyId || null,
      status: "active",
      userType: newUser.userType,
      phone: null,
      createdAt: new Date().toISOString().split("T")[0],
      lastLogin: null,
    };

    setUsers([user, ...users]);
    setNewUser({ fullName: "", email: "", userType: "individual", companyId: "" });
    setAddUserOpen(false);
    toast({
      title: "User created",
      description: `${user.fullName} has been added successfully.`,
    });
  };

  const handleExport = () => {
    const csvContent = [
      ["Name", "Email", "Company", "Type", "Status", "Created"],
      ...filteredUsers.map((u) => [
        u.fullName,
        u.email,
        u.company || "Individual",
        u.userType,
        u.status,
        u.createdAt,
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

  const getUserTypeBadgeVariant = (type: User["userType"]) => {
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

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <CardTitle className="text-lg">Users Management</CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[120px] h-9">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[130px] h-9">
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
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Dialog open={addUserOpen} onOpenChange={setAddUserOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New User</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      value={newUser.fullName}
                      onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                      placeholder="Enter full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      placeholder="Enter email address"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="userType">User Type</Label>
                    <Select
                      value={newUser.userType}
                      onValueChange={(value) => setNewUser({ ...newUser, userType: value as User["userType"] })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="developer">Developer</SelectItem>
                        <SelectItem value="agent">Estate Agent</SelectItem>
                        <SelectItem value="broker">Mortgage Broker</SelectItem>
                        <SelectItem value="individual">Individual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Company (Optional)</Label>
                    <Select
                      value={newUser.companyId}
                      onValueChange={(value) => setNewUser({ ...newUser, companyId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select company" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No Company</SelectItem>
                        {companies.map((company) => (
                          <SelectItem key={company.id} value={company.id}>
                            {company.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setAddUserOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddUser}>Create User</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{user.fullName}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.company ? (
                      <div className="flex items-center gap-1.5">
                        <Building2 className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{user.company}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getUserTypeBadgeVariant(user.userType)}>
                      {user.userType}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.status === "active" ? "default" : "secondary"}>
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {user.lastLogin || "Never"}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleToggleStatus(user.id)}>
                          {user.status === "active" ? (
                            <>
                              <UserX className="h-4 w-4 mr-2" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <UserCheck className="h-4 w-4 mr-2" />
                              Activate
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Mail className="h-4 w-4 mr-2" />
                          Send Email
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {filteredUsers.length === 0 && (
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