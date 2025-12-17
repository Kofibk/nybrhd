import { useState } from "react";
import AdminLeadsTable from "@/components/admin/AdminLeadsTable";
import { Input } from "@/components/ui/input";

const AdminLeadsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <section aria-label="Admin leads" className="h-full flex flex-col min-h-0">
      <div className="mb-4 flex items-center justify-between gap-3 flex-shrink-0">
        <div className="min-w-0">
          <h1 className="sr-only">Admin leads</h1>
        </div>
        <div className="w-full max-w-sm">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search leads…"
            aria-label="Search leads"
          />
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <AdminLeadsTable searchQuery={searchQuery} />
      </div>
    </section>
  );
};

export default AdminLeadsPage;
