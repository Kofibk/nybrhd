import { ReactNode, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

interface AdminRouteProps {
  children: ReactNode;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  const [isChecking, setIsChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminAccess = () => {
      // For demo mode, allow access from Lovable preview or localhost
      const hostname = window.location.hostname;
      
      if (
        hostname === "localhost" ||
        hostname.includes("lovable") ||
        hostname.includes("lovableproject")
      ) {
        setIsAdmin(true);
        setIsChecking(false);
        return;
      }

      // Check localStorage for admin flag (demo mode)
      const userProfile = localStorage.getItem("nb_user_profile");
      if (userProfile) {
        try {
          const profile = JSON.parse(userProfile);
          if (profile.isAdmin || profile.email?.includes("admin") || profile.role === "admin") {
            setIsAdmin(true);
          }
        } catch (e) {
          console.error("Error parsing user profile:", e);
        }
      }

      // Check URL param for easy testing
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("admin") === "true") {
        setIsAdmin(true);
      }

      setIsChecking(false);
    };

    checkAdminAccess();
  }, []);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;
