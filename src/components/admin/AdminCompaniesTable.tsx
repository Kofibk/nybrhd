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
  Building2,
  Plus,
  MoreHorizontal,
  Users,
  Filter,
  Download,
  ExternalLink,
  Pencil,
  Trash2,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Company {
  id: string;
  name: string;
  website: string | null;
  industry: string;
  userCount: number;
  activeCampaigns: number;
  totalSpend: number;
  createdAt: string;
}

interface AdminCompaniesTableProps {
  searchQuery: string;
}

const AdminCompaniesTable = ({ searchQuery }: AdminCompaniesTableProps) => {
  const [industryFilter, setIndustryFilter] = useState<string>("all");
  const [addCompanyOpen, setAddCompanyOpen] = useState(false);
  const [newCompany, setNewCompany] = useState({
    name: "",
    website: "",
    industry: "property_development",
  });

  // Mock companies data - in production this would come from the database
  const [companies, setCompanies] = useState<Company[]>([
    {
      id: "c1",
      name: "Luxury Developments Ltd",
      website: "https://luxurydev.com",
      industry: "property_development",
      userCount: 5,
      activeCampaigns: 3,
      totalSpend: 25000,
      createdAt: "2024-01-10",
    },
    {
      id: "c2",
      name: "Premier Estates",
      website: "https://premierestates.co.uk",
      industry: "estate_agency",
      userCount: 8,
      activeCampaigns: 5,
      totalSpend: 18500,
      createdAt: "2024-01-15",
    },
    {
      id: "c3",
      name: "City Mortgages",
      website: "https://citymortgages.com",
      industry: "mortgage_broker",
      userCount: 3,
      activeCampaigns: 2,
      totalSpend: 12000,
      createdAt: "2024-01-20",
    },
    {
      id: "c4",
      name: "Global Properties International",
      website: "https://globalproperties.io",
      industry: "property_development",
      userCount: 12,
      activeCampaigns: 8,
      totalSpend: 45000,
      createdAt: "2024-02-01",
    },
    {
      id: "c5",
      name: "HomeFind Agents",
      website: null,
      industry: "estate_agency",
      userCount: 4,
      activeCampaigns: 1,
      totalSpend: 5500,
      createdAt: "2024-02-05",
    },
  ]);

  const industries = [
    { value: "property_development", label: "Property Development" },
    { value: "estate_agency", label: "Estate Agency" },
    { value: "mortgage_broker", label: "Mortgage Broker" },
    { value: "other", label: "Other" },
  ];

  const filteredCompanies = companies.filter((company) => {
    const matchesSearch =
      company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (company.website?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    const matchesIndustry = industryFilter === "all" || company.industry === industryFilter;
    return matchesSearch && matchesIndustry;
  });

  const handleAddCompany = () => {
    if (!newCompany.name) {
      toast({
        title: "Validation Error",
        description: "Please enter a company name.",
        variant: "destructive",
      });
      return;
    }

    const company: Company = {
      id: `c${Date.now()}`,
      name: newCompany.name,
      website: newCompany.website || null,
      industry: newCompany.industry,
      userCount: 0,
      activeCampaigns: 0,
      totalSpend: 0,
      createdAt: new Date().toISOString().split("T")[0],
    };

    setCompanies([company, ...companies]);
    setNewCompany({ name: "", website: "", industry: "property_development" });
    setAddCompanyOpen(false);
    toast({
      title: "Company created",
      description: `${company.name} has been added successfully.`,
    });
  };

  const handleDeleteCompany = (companyId: string) => {
    const company = companies.find((c) => c.id === companyId);
    if (company && company.userCount > 0) {
      toast({
        title: "Cannot delete company",
        description: "Please reassign or remove all users before deleting this company.",
        variant: "destructive",
      });
      return;
    }

    setCompanies(companies.filter((c) => c.id !== companyId));
    toast({
      title: "Company deleted",
      description: "The company has been removed.",
    });
  };

  const handleExport = () => {
    const csvContent = [
      ["Name", "Website", "Industry", "Users", "Active Campaigns", "Total Spend", "Created"],
      ...filteredCompanies.map((c) => [
        c.name,
        c.website || "",
        c.industry,
        c.userCount.toString(),
        c.activeCampaigns.toString(),
        `£${c.totalSpend}`,
        c.createdAt,
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

  const getIndustryLabel = (industry: string) => {
    return industries.find((i) => i.value === industry)?.label || industry;
  };

  const getIndustryBadgeVariant = (industry: string) => {
    switch (industry) {
      case "property_development":
        return "default";
      case "estate_agency":
        return "secondary";
      case "mortgage_broker":
        return "outline";
      default:
        return "secondary";
    }
  };

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
                    <Button onClick={handleAddCompany}>Create Company</Button>
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
                <TableHead className="text-center">Users</TableHead>
                <TableHead className="text-center">Campaigns</TableHead>
                <TableHead className="text-right">Total Spend</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCompanies.map((company) => (
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
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Users className="h-3 w-3 text-muted-foreground" />
                      <span>{company.userCount}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">{company.activeCampaigns}</TableCell>
                  <TableCell className="text-right font-medium">
                    £{company.totalSpend.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
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
              ))}
              {filteredCompanies.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
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