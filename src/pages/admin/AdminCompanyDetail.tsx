import { useParams, useNavigate } from "react-router-dom";
import { useCompanies, useProfiles, type Profile } from "@/hooks/useAdminData";
import { getDemoOnboardingSubmissions } from "@/lib/demoOnboardingStore";
import AdminHeader from "@/components/admin/AdminHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Building2,
  Globe,
  MapPin,
  Mail,
  Phone,
  User,
  Target,
  Users,
  Linkedin,
  Instagram,
  CheckCircle2,
  XCircle,
  Sparkles,
} from "lucide-react";

export default function AdminCompanyDetail() {
  const { companyId } = useParams();
  const navigate = useNavigate();

  const { data: companies = [], isLoading: companiesLoading } = useCompanies();
  const { data: profiles = [], isLoading: profilesLoading } = useProfiles();

  // Get demo onboarding submissions for additional data
  const demoSubmissions = getDemoOnboardingSubmissions();

  // Find company from DB or demo data
  const company = companies.find((c) => c.id === companyId);
  const demoSubmission = demoSubmissions.find((s) => s.company.id === companyId);

  // Find users associated with this company
  const companyUsers = (profiles as Profile[]).filter((u) => u.company_id === companyId);
  const primaryUser = companyUsers[0];

  // Get onboarding data from demo submission or profile
  const onboardingData = demoSubmission
    ? {
        goals: demoSubmission.user.goals || [],
        regions: demoSubmission.user.regions_covered || [],
        upsellInterest: demoSubmission.user.upsell_interest ?? false,
        invitedTeamEmails: demoSubmission.invited_team_emails || [],
        linkedin: null,
        instagram: null,
      }
    : {
        goals: primaryUser?.goals || [],
        regions: primaryUser?.regions_covered || [],
        upsellInterest: primaryUser?.upsell_interest ?? false,
        invitedTeamEmails: [],
        linkedin: (primaryUser as any)?.company_linkedin || null,
        instagram: (primaryUser as any)?.company_instagram || null,
      };

  const isLoading = companiesLoading || profilesLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <AdminHeader />
        <main className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-48 mb-8" />
          <div className="grid gap-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </main>
      </div>
    );
  }

  if (!company && !demoSubmission) {
    return (
      <div className="min-h-screen bg-background">
        <AdminHeader />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">Company not found</h1>
            <Button onClick={() => navigate("/admin/companies")} className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Companies
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const companyData = company || {
    id: demoSubmission!.company.id,
    name: demoSubmission!.company.name,
    website: demoSubmission!.company.website,
    industry: demoSubmission!.company.industry,
    address: demoSubmission!.company.address,
    logo_url: demoSubmission!.company.logo_url,
    status: "active",
    total_spend: 0,
    total_leads: 0,
    monthly_budget: null,
    created_at: demoSubmission!.submitted_at,
  };

  const userType = demoSubmission?.user.user_type || primaryUser?.user_type || "developer";

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/admin/companies")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div className="flex items-center gap-3">
              {companyData.logo_url ? (
                <img
                  src={companyData.logo_url}
                  alt={companyData.name}
                  className="h-12 w-12 rounded-lg object-cover"
                />
              ) : (
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold text-foreground">{companyData.name}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="capitalize">
                    {userType}
                  </Badge>
                  <Badge variant={companyData.status === "active" ? "default" : "secondary"}>
                    {companyData.status || "active"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Company Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Company Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <InfoRow
                icon={<Building2 className="h-4 w-4" />}
                label="Company Name"
                value={companyData.name}
              />
              <InfoRow
                icon={<Globe className="h-4 w-4" />}
                label="Website"
                value={companyData.website}
                isLink
              />
              <InfoRow
                icon={<MapPin className="h-4 w-4" />}
                label="Address"
                value={companyData.address}
              />
              <InfoRow
                icon={<Building2 className="h-4 w-4" />}
                label="Industry"
                value={companyData.industry}
              />

              {(onboardingData.linkedin || onboardingData.instagram) && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-muted-foreground">Social Links</p>
                    {onboardingData.linkedin && (
                      <InfoRow
                        icon={<Linkedin className="h-4 w-4" />}
                        label="LinkedIn"
                        value={onboardingData.linkedin}
                        isLink
                      />
                    )}
                    {onboardingData.instagram && (
                      <InfoRow
                        icon={<Instagram className="h-4 w-4" />}
                        label="Instagram"
                        value={onboardingData.instagram}
                        isLink
                      />
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Primary Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Primary Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <InfoRow
                icon={<User className="h-4 w-4" />}
                label="Name"
                value={demoSubmission?.user.full_name || primaryUser?.full_name}
              />
              <InfoRow
                icon={<Mail className="h-4 w-4" />}
                label="Email"
                value={demoSubmission?.user.email || primaryUser?.email}
              />
              <InfoRow
                icon={<Phone className="h-4 w-4" />}
                label="Phone"
                value={demoSubmission?.user.phone || primaryUser?.phone}
              />
              <InfoRow
                icon={<User className="h-4 w-4" />}
                label="Job Title"
                value={demoSubmission?.user.job_title || primaryUser?.job_title}
              />
            </CardContent>
          </Card>

          {/* Regions Covered */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Regions Covered
              </CardTitle>
            </CardHeader>
            <CardContent>
              {onboardingData.regions.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {onboardingData.regions.map((region, i) => (
                    <Badge key={i} variant="secondary">
                      {region}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No regions specified</p>
              )}
            </CardContent>
          </Card>

          {/* Goals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Goals
              </CardTitle>
            </CardHeader>
            <CardContent>
              {onboardingData.goals.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {onboardingData.goals.map((goal, i) => (
                    <Badge key={i} variant="outline">
                      {goal}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No goals specified</p>
              )}
            </CardContent>
          </Card>

          {/* Team Invitations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Invited Team Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              {onboardingData.invitedTeamEmails.length > 0 ? (
                <div className="space-y-2">
                  {onboardingData.invitedTeamEmails.map((email, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 p-2 rounded-lg bg-muted/50"
                    >
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{email}</span>
                      <Badge variant="outline" className="ml-auto text-xs">
                        Pending
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No team members invited</p>
              )}
            </CardContent>
          </Card>

          {/* Upsell Interest */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Upsell Interest
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                {onboardingData.upsellInterest ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="text-sm">
                      Interested in additional services
                    </span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Not interested at this time
                    </span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
  isLink = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | null | undefined;
  isLink?: boolean;
}) {
  if (!value) {
    return (
      <div className="flex items-start gap-3">
        <div className="text-muted-foreground mt-0.5">{icon}</div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-sm text-muted-foreground">—</p>
        </div>
      </div>
    );
  }

  const displayValue = isLink ? (
    <a
      href={value.startsWith("http") ? value : `https://${value}`}
      target="_blank"
      rel="noopener noreferrer"
      className="text-sm text-primary hover:underline"
    >
      {value}
    </a>
  ) : (
    <p className="text-sm">{value}</p>
  );

  return (
    <div className="flex items-start gap-3">
      <div className="text-muted-foreground mt-0.5">{icon}</div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        {displayValue}
      </div>
    </div>
  );
}
