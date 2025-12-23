import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  Building2,
  Plus,
  MoreHorizontal,
  Users,
  Filter,
  Download,
  ExternalLink,
  Pencil,
  Trash2,
  Loader2,
  Eye,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useCompanies, useCreateCompany, useDeleteCompany } from "@/hooks/useAdminData";
import { Skeleton } from "@/components/ui/skeleton";

interface AdminCompaniesTableProps {
  searchQuery: string;
}

const AdminCompaniesTable = ({ searchQuery }: AdminCompaniesTableProps) => {
  const navigate = useNavigate();
  const [industryFilter, setIndustryFilter] = useState<string>("all");
  const [addCompanyOpen, setAddCompanyOpen] = useState(false);
  const [newCompany, setNewCompany] = useState({
    name: "",
    website: "",
    industry: "residential",
  });

  const { data: companies = [], isLoading, error } = useCompanies();
  const createCompany = useCreateCompany();
  const deleteCompany = useDeleteCompany();

  const industries = [
    { value: "residential", label: "Residential Property" },
    { value: "commercial", label: "Commercial Property" },
    { value: "mixed", label: "Mixed Use" },
    { value: "lettings", label: "Lettings" },
    { value: "financial", label: "Financial Services" },
  ];

  const filteredCompanies = companies.filter((company) => {
    const matchesSearch =
      company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (company.website?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    const matchesIndustry = industryFilter === "all" || company.industry === industryFilter;
    return matchesSearch && matchesIndustry;
  });

  const handleAddCompany = async () => {
    if (!newCompany.name) {
      toast({
        title: "Validation Error",
        description: "Please enter a company name.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createCompany.mutateAsync({
        name: newCompany.name,
        website: newCompany.website || undefined,
        industry: newCompany.industry,
      });
      setNewCompany({ name: "", website: "", industry: "residential" });
      setAddCompanyOpen(false);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleDeleteCompany = async (companyId: string) => {
    try {
      await deleteCompany.mutateAsync(companyId);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleExport = () => {
    const csvContent = [
      ["Name", "Website", "Industry", "Status", "Created"],
      ...filteredCompanies.map((c) => [
        c.name,
        c.website || "",
        c.industry || "",
        c.status || "active",
        c.created_at,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "companies-export.csv";
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Export complete",
      description: `${filteredCompanies.length} companies exported to CSV.`,
    });
  };

  const getIndustryLabel = (industry: string | null) => {
    return industries.find((i) => i.value === industry)?.label || industry || "—";
  };

  const getIndustryBadgeVariant = (industry: string | null) => {
    switch (industry) {
      case "residential":
        return "default";
      case "commercial":
        return "secondary";
      case "financial":
        return "outline";
      default:
        return "secondary";
    }
  };

  if (error) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-destructive">
          Failed to load companies. Please try again.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <CardTitle className="text-lg">Companies Management</CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={industryFilter} onValueChange={setIndustryFilter}>
                <SelectTrigger className="w-[160px] h-9">
                  <SelectValue placeholder="Industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Industries</SelectItem>
                  {industries.map((industry) => (
                    <SelectItem key={industry.value} value={industry.value}>
                      {industry.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Dialog open={addCompanyOpen} onOpenChange={setAddCompanyOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Company
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Company</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name *</Label>
                    <Input
                      id="companyName"
                      value={newCompany.name}
                      onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                      placeholder="Enter company name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={newCompany.website}
                      onChange={(e) => setNewCompany({ ...newCompany, website: e.target.value })}
                      placeholder="https://example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry</Label>
                    <Select
                      value={newCompany.industry}
                      onValueChange={(value) => setNewCompany({ ...newCompany, industry: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        {industries.map((industry) => (
                          <SelectItem key={industry.value} value={industry.value}>
                            {industry.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setAddCompanyOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddCompany} disabled={createCompany.isPending}>
                      {createCompany.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Create Company
                    </Button>
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
                <TableHead>Company</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total Spend</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-10 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20 ml-auto" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : (
                filteredCompanies.map((company) => (
                  <TableRow key={company.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Building2 className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{company.name}</p>
                          {company.website && (
                            <a
                              href={company.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                            >
                              {company.website.replace(/^https?:\/\//, "")}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getIndustryBadgeVariant(company.industry)}>
                        {getIndustryLabel(company.industry)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={company.status === "active" ? "default" : "secondary"}>
                        {company.status || "active"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      £{(company.total_spend || 0).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/admin/companies/${company.id}`)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Users className="h-4 w-4 mr-2" />
                            View Users
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDeleteCompany(company.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
              {!isLoading && filteredCompanies.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No companies found
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

export default AdminCompaniesTable;
