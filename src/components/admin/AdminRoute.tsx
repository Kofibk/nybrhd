import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Loader2, ShieldX } from "lucide-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

interface AdminRouteProps {
  children: ReactNode;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  const { isAdmin, isLoading, userEmail } = useAdminAuth();
  const { isAuthenticated, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <ShieldX className="h-16 w-16 text-muted-foreground mx-auto" />
          <h1 className="text-2xl font-semibold">Authentication Required</h1>
          <p className="text-muted-foreground">Please log in to access the admin dashboard.</p>
          <Button asChild>
            <Link to="/login">Go to Login</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4 max-w-md px-4">
          <ShieldX className="h-16 w-16 text-destructive mx-auto" />
          <h1 className="text-2xl font-semibold">Access Denied</h1>
          <p className="text-muted-foreground">
            Your account ({userEmail}) does not have admin privileges.
          </p>
          <p className="text-sm text-muted-foreground">
            Contact a system administrator if you believe this is an error.
          </p>
          <Button asChild variant="outline">
            <Link to={`/${user?.role || 'login'}`}>Return to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AdminRoute;
