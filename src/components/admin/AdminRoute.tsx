import { ReactNode } from "react";

interface AdminRouteProps {
  children: ReactNode;
}

// Demo mode - no admin authentication required
const AdminRoute = ({ children }: AdminRouteProps) => {
  return <>{children}</>;
};

export default AdminRoute;
