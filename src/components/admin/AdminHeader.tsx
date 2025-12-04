import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AdminHeader = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 py-3 md:py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="bg-primary/10 p-1.5 md:p-2 rounded-lg">
            <Shield className="h-5 w-5 md:h-6 md:w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-base md:text-xl font-bold">Naybourhood Admin</h1>
            <p className="text-[10px] md:text-xs text-muted-foreground hidden sm:block">Internal Dashboard</p>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <Link to="/" className="text-xs md:text-sm text-muted-foreground hover:text-foreground hidden sm:block">
            View Client App
          </Link>
          <Button variant="outline" size="sm" onClick={handleLogout} className="gap-1 md:gap-2 text-xs md:text-sm">
            <LogOut className="h-3 w-3 md:h-4 md:w-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
