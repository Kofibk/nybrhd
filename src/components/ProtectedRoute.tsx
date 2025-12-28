import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
  requireSubscription?: boolean;
}

const ProtectedRoute = ({ children, requireSubscription = true }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, profile } = useAuth();
  const { subscriptionStatus, isLoading: subLoading } = useSubscription();
  const location = useLocation();

  // Don't require subscription for these paths
  const exemptPaths = ['/subscribe', '/onboarding', '/settings'];
  const isExemptPath = exemptPaths.some(path => location.pathname.startsWith(path));

  if (isLoading || subLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login with return URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user needs to complete onboarding
  if (profile && !profile.onboarding_completed && !location.pathname.startsWith('/onboarding')) {
    return <Navigate to="/onboarding" replace />;
  }

  // Check subscription status for protected routes
  if (requireSubscription && !isExemptPath) {
    const isSubscribed = subscriptionStatus === 'active' || subscriptionStatus === 'trial';
    if (!isSubscribed && profile?.onboarding_completed) {
      return <Navigate to="/subscribe" state={{ from: location }} replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
