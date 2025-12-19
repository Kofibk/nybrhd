import { useState } from "react";
import { Input } from "@/components/ui/input";
import AdminUsersTable from "@/components/admin/AdminUsersTable";
import ClientOnboardingWizard from "@/components/admin/ClientOnboardingWizard";

const AdminUsersPage = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <section aria-label="Admin users" className="h-full flex flex-col min-h-0">
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-shrink-0">
        <div className="flex items-center gap-3">
          <ClientOnboardingWizard />
        </div>
        <div className="w-full sm:w-auto sm:max-w-sm">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users…"
            aria-label="Search users"
            className="h-8 sm:h-9 text-sm"
          />
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <AdminUsersTable searchQuery={searchQuery} />
      </div>
    </section>
  );
};

export default AdminUsersPage;
