import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminHeader from "@/components/admin/AdminHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Building2, 
  User, 
  Briefcase, 
  Mail, 
  Phone, 
  Globe, 
  Calendar,
  TrendingUp,
  Users,
  Target,
  DollarSign,
  Edit,
  Save,
  X
} from "lucide-react";

// Mock client data - matches AdminClientsTable IDs
const mockClientData: Record<string, any> = {
  "1": {
    id: "1",
    companyName: "Berkeley Homes",
    contactPerson: "James Wilson",
    email: "marketing@berkeleyhomes.co.uk",
    phone: "+44 20 7123 4567",
    website: "www.berkeleyhomes.co.uk",
    type: "developer",
    plan: "Enterprise",
    status: "active",
    joinDate: "2024-01-15",
    totalCampaigns: 3,
    activeLeads: 245,
    totalSpend: 12500,
    conversionRate: 8.5,
    notes: "Key account - quarterly review scheduled",
    address: "123 Thames Street, London, EC4R 3TD",
    developments: [
      { name: "Riverside Quarter", units: 150, status: "Live" },
      { name: "Greenwich Heights", units: 80, status: "Pre-Launch" }
    ],
    recentActivity: [
      { date: "2024-03-15", action: "Campaign launched", details: "Riverside Quarter - Spring Campaign" },
      { date: "2024-03-10", action: "Lead converted", details: "45 new leads from Meta campaign" },
      { date: "2024-03-05", action: "Budget increased", details: "Monthly budget increased to £5,000" }
    ]
  },
  "2": {
    id: "2",
    companyName: "Knight Frank",
    contactPerson: "Sarah Chen",
    email: "digital@knightfrank.com",
    phone: "+44 20 7456 7890",
    website: "www.knightfrank.com",
    type: "agent",
    plan: "Professional",
    status: "active",
    joinDate: "2024-02-20",
    totalCampaigns: 2,
    activeLeads: 128,
    totalSpend: 8200,
    conversionRate: 12.3,
    notes: "Strong performance in luxury market segment.",
    address: "45 Mayfair Lane, London, W1K 2PQ",
    developments: [],
    recentActivity: [
      { date: "2024-03-14", action: "New listing", details: "Added 5 new properties" },
      { date: "2024-03-08", action: "Campaign optimized", details: "CTR improved by 25%" }
    ]
  },
  "3": {
    id: "3",
    companyName: "London & Country",
    contactPerson: "Michael Brown",
    email: "ads@londonandcountry.co.uk",
    phone: "+44 20 7890 1234",
    website: "www.londonandcountry.co.uk",
    type: "broker",
    plan: "Starter",
    status: "active",
    joinDate: "2024-03-01",
    totalCampaigns: 1,
    activeLeads: 89,
    totalSpend: 4500,
    conversionRate: 6.2,
    notes: "Interested in upgrading to Professional",
    address: "78 City Road, London, EC1V 2NX",
    developments: [],
    recentActivity: [
      { date: "2024-03-12", action: "Campaign created", details: "First mortgage campaign launched" }
    ]
  },
  "4": {
    id: "4",
    companyName: "Barratt Developments",
    contactPerson: "Emma Thompson",
    email: "campaigns@barrattdev.com",
    phone: "+44 20 7234 5678",
    website: "www.barrattdevelopments.co.uk",
    type: "developer",
    plan: "Enterprise",
    status: "active",
    joinDate: "2023-11-10",
    totalCampaigns: 4,
    activeLeads: 412,
    totalSpend: 18900,
    conversionRate: 9.8,
    notes: "VIP client - dedicated account manager",
    address: "100 Westminster Bridge Road, London, SE1 7XA",
    developments: [
      { name: "Victoria Park", units: 200, status: "Live" },
      { name: "Canary Wharf Tower", units: 350, status: "Live" },
      { name: "Stratford Gardens", units: 120, status: "Pre-Launch" }
    ],
    recentActivity: [
      { date: "2024-03-16", action: "Lead surge", details: "120 new leads this week" },
      { date: "2024-03-14", action: "Campaign updated", details: "Creative refresh for Victoria Park" },
      { date: "2024-03-10", action: "Meeting scheduled", details: "Q2 strategy review booked" }
    ]
  },
  "5": {
    id: "5",
    companyName: "Savills",
    contactPerson: "David Lee",
    email: "marketing@savills.com",
    phone: "+44 20 7567 8901",
    website: "www.savills.com",
    type: "agent",
    plan: "Professional",
    status: "paused",
    joinDate: "2024-01-05",
    totalCampaigns: 0,
    activeLeads: 56,
    totalSpend: 2100,
    conversionRate: 5.4,
    notes: "Paused campaigns - budget review in progress",
    address: "33 Margaret Street, London, W1G 0JD",
    developments: [],
    recentActivity: [
      { date: "2024-03-01", action: "Campaigns paused", details: "All campaigns paused for review" }
    ]
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case "developer": return <Building2 className="h-4 w-4" />;
    case "agent": return <User className="h-4 w-4" />;
    case "broker": return <Briefcase className="h-4 w-4" />;
    default: return <Building2 className="h-4 w-4" />;
  }
};

const getTypeLabel = (type: string) => {
  switch (type) {
    case "developer": return "Property Developer";
    case "agent": return "Estate Agent";
    case "broker": return "Mortgage Broker";
    default: return type;
  }
};

export default function ClientDetail() {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  
  const client = mockClientData[clientId as keyof typeof mockClientData];
  
  const [formData, setFormData] = useState({
    companyName: client?.companyName || "",
    contactPerson: client?.contactPerson || "",
    email: client?.email || "",
    phone: client?.phone || "",
    website: client?.website || "",
    type: client?.type || "developer",
    plan: client?.plan || "Starter",
    address: client?.address || "",
    notes: client?.notes || ""
  });

  if (!client) {
    return (
      <div className="min-h-screen bg-background">
        <AdminHeader />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">Client not found</h1>
            <Button onClick={() => navigate("/admin")} className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const handleSave = () => {
    toast({
      title: "Client Updated",
      description: "Client details have been saved successfully."
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      companyName: client.companyName,
      contactPerson: client.contactPerson,
      email: client.email,
      phone: client.phone,
      website: client.website,
      type: client.type,
      plan: client.plan,
      address: client.address,
      notes: client.notes
    });
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <main className="container mx-auto px-3 md:px-4 py-4 md:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 md:gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/admin")} className="w-fit">
              <ArrowLeft className="mr-1 md:mr-2 h-4 w-4" />
              Back
            </Button>
            <div>
              <div className="flex flex-wrap items-center gap-2 md:gap-3">
                <h1 className="text-lg md:text-2xl font-bold text-foreground">{client.companyName}</h1>
                <Badge variant={client.status === "active" ? "default" : "secondary"}>
                  {client.status}
                </Badge>
              </div>
              <p className="text-xs md:text-sm text-muted-foreground flex items-center gap-2 mt-1">
                {getTypeIcon(client.type)}
                {getTypeLabel(client.type)} • {client.plan} Plan
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button variant="outline" size="sm" onClick={handleCancel}>
                  <X className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
                  <span className="hidden sm:inline">Cancel</span>
                </Button>
                <Button size="sm" onClick={handleSave}>
                  <Save className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
                  <span className="hidden sm:inline">Save</span>
                </Button>
              </>
            ) : (
              <Button size="sm" onClick={() => setIsEditing(true)}>
                <Edit className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden sm:inline">Edit Client</span>
              </Button>
            )}
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 mb-4 md:mb-8">
          <Card>
            <CardContent className="p-3 md:pt-6 md:p-6">
              <div className="flex items-center gap-2 md:gap-4">
                <div className="p-2 md:p-3 bg-primary/10 rounded-lg">
                  <Target className="h-4 w-4 md:h-6 md:w-6 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] md:text-sm text-muted-foreground">Total Campaigns</p>
                  <p className="text-lg md:text-2xl font-bold">{client.totalCampaigns}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 md:pt-6 md:p-6">
              <div className="flex items-center gap-2 md:gap-4">
                <div className="p-2 md:p-3 bg-accent/10 rounded-lg">
                  <Users className="h-4 w-4 md:h-6 md:w-6 text-accent" />
                </div>
                <div>
                  <p className="text-[10px] md:text-sm text-muted-foreground">Active Leads</p>
                  <p className="text-lg md:text-2xl font-bold">{client.activeLeads}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 md:pt-6 md:p-6">
              <div className="flex items-center gap-2 md:gap-4">
                <div className="p-2 md:p-3 bg-green-500/10 rounded-lg">
                  <DollarSign className="h-4 w-4 md:h-6 md:w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-[10px] md:text-sm text-muted-foreground">Total Spend</p>
                  <p className="text-lg md:text-2xl font-bold">£{client.totalSpend.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 md:pt-6 md:p-6">
              <div className="flex items-center gap-2 md:gap-4">
                <div className="p-2 md:p-3 bg-blue-500/10 rounded-lg">
                  <TrendingUp className="h-4 w-4 md:h-6 md:w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-[10px] md:text-sm text-muted-foreground">Conversion Rate</p>
                  <p className="text-lg md:text-2xl font-bold">{client.conversionRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="profile" className="space-y-4 md:space-y-6">
          <TabsList className="w-full md:w-auto overflow-x-auto">
            <TabsTrigger value="profile" className="text-xs md:text-sm">Profile</TabsTrigger>
            <TabsTrigger value="campaigns" className="text-xs md:text-sm">Campaigns</TabsTrigger>
            <TabsTrigger value="activity" className="text-xs md:text-sm">Activity</TabsTrigger>
            {client.type === "developer" && (
              <TabsTrigger value="developments" className="text-xs md:text-sm">Developments</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="profile">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Company Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Company Name</Label>
                    {isEditing ? (
                      <Input 
                        value={formData.companyName}
                        onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                      />
                    ) : (
                      <p className="text-foreground">{client.companyName}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Client Type</Label>
                    {isEditing ? (
                      <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="developer">Property Developer</SelectItem>
                          <SelectItem value="agent">Estate Agent</SelectItem>
                          <SelectItem value="broker">Mortgage Broker</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-foreground flex items-center gap-2">
                        {getTypeIcon(client.type)}
                        {getTypeLabel(client.type)}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Plan</Label>
                    {isEditing ? (
                      <Select value={formData.plan} onValueChange={(value) => setFormData({...formData, plan: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Starter">Starter</SelectItem>
                          <SelectItem value="Professional">Professional</SelectItem>
                          <SelectItem value="Enterprise">Enterprise</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-foreground">{client.plan}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Address</Label>
                    {isEditing ? (
                      <Input 
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                      />
                    ) : (
                      <p className="text-foreground">{client.address}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Website</Label>
                    {isEditing ? (
                      <Input 
                        value={formData.website}
                        onChange={(e) => setFormData({...formData, website: e.target.value})}
                      />
                    ) : (
                      <p className="text-foreground flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        {client.website}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Contact Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Contact Person</Label>
                    {isEditing ? (
                      <Input 
                        value={formData.contactPerson}
                        onChange={(e) => setFormData({...formData, contactPerson: e.target.value})}
                      />
                    ) : (
                      <p className="text-foreground flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {client.contactPerson}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    {isEditing ? (
                      <Input 
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                      />
                    ) : (
                      <p className="text-foreground flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        {client.email}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    {isEditing ? (
                      <Input 
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      />
                    ) : (
                      <p className="text-foreground flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {client.phone}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Member Since</Label>
                    <p className="text-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {new Date(client.joinDate).toLocaleDateString('en-GB', { 
                        day: 'numeric', 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Internal Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <Textarea 
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      rows={4}
                    />
                  ) : (
                    <p className="text-foreground">{client.notes}</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="campaigns">
            <Card>
              <CardHeader>
                <CardTitle>Client Campaigns</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Campaign list will be displayed here. Navigate to the Campaigns tab in the main dashboard to manage campaigns for this client.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {client.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start gap-4 pb-4 border-b border-border last:border-0">
                      <div className="w-2 h-2 mt-2 rounded-full bg-primary" />
                      <div>
                        <p className="font-medium text-foreground">{activity.action}</p>
                        <p className="text-sm text-muted-foreground">{activity.details}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(activity.date).toLocaleDateString('en-GB')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {client.type === "developer" && (
            <TabsContent value="developments">
              <Card>
                <CardHeader>
                  <CardTitle>Developments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {client.developments.map((dev, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div>
                          <p className="font-medium text-foreground">{dev.name}</p>
                          <p className="text-sm text-muted-foreground">{dev.units} units</p>
                        </div>
                        <Badge variant={dev.status === "Live" ? "default" : "secondary"}>
                          {dev.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  );
}
