import { useState } from "react";
import AdminLeadsTable from "@/components/admin/AdminLeadsTable";
import { Input } from "@/components/ui/input";

const AdminLeadsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <section aria-label="Admin leads">
      <div className="mb-4 flex items-center justify-between gap-3">
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

      <AdminLeadsTable searchQuery={searchQuery} />
    </section>
  );
};

export default AdminLeadsPage;
