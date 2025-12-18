import { useState } from "react";
import { Input } from "@/components/ui/input";
import AdminCompaniesTable from "@/components/admin/AdminCompaniesTable";
import ClientOnboardingWizard from "@/components/admin/ClientOnboardingWizard";

const AdminCompaniesPage = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <section aria-label="Admin companies" className="h-full flex flex-col min-h-0">
      <div className="mb-4 flex items-center justify-between gap-3 flex-shrink-0">
        <div className="flex items-center gap-3">
          <ClientOnboardingWizard />
        </div>
        <div className="w-full max-w-sm">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search companies…"
            aria-label="Search companies"
          />
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <AdminCompaniesTable searchQuery={searchQuery} />
      </div>
    </section>
  );
};

export default AdminCompaniesPage;
