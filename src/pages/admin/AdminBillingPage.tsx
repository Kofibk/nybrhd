import { useState } from "react";
import { Input } from "@/components/ui/input";
import AdminBillingTable from "@/components/admin/AdminBillingTable";

const AdminBillingPage = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <section aria-label="Admin billing" className="h-full flex flex-col min-h-0">
      <div className="mb-4 flex items-center justify-between gap-3 flex-shrink-0">
        <div className="min-w-0">
          <h1 className="sr-only">Billing</h1>
        </div>
        <div className="w-full max-w-sm">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search billing…"
            aria-label="Search billing"
          />
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <AdminBillingTable searchQuery={searchQuery} />
      </div>
    </section>
  );
};

export default AdminBillingPage;
