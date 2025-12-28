import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogoWithTransparency } from "@/components/LogoWithTransparency";

const AuthCallback = () => {
  const navigate = useNavigate();
  const { isAuthenticated, profile, isLoading: authLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");
      const errorParam = url.searchParams.get("error");
      const errorDescription = url.searchParams.get("error_description");

      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const hashError = hashParams.get("error");
      const hashErrorDescription = hashParams.get("error_description");
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");

      const normalizedError = (errorDescription || errorParam || hashErrorDescription || hashError || "").toLowerCase();

      const friendlyInvalidLink =
        normalizedError.includes("signature is invalid") ||
        normalizedError.includes("one-time token not found") ||
        normalizedError.includes("email link is invalid") ||
        normalizedError.includes("expired");

      // Handle OAuth/magic-link errors from the URL (query or hash)
      if (errorParam || hashError) {
        setError(
          friendlyInvalidLink
            ? "This sign-in link is invalid, expired, or has already been used. Please request a new link."
            : (errorDescription || errorParam || hashErrorDescription || hashError)
        );
        setProcessing(false);
        return;
      }

      try {
        // Implicit flow: tokens are returned in the URL hash
        if (accessToken && refreshToken) {
          const { error: setSessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (setSessionError) {
            setError("This sign-in link is invalid or expired. Please request a new one.");
            setProcessing(false);
            return;
          }

          // Clear tokens from URL
          window.history.replaceState({}, "", url.pathname + url.search);
          setProcessing(false);
          return;
        }

        // PKCE flow: code is returned in query params
        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

          if (exchangeError) {
            setError("This sign-in link is invalid or expired. Please request a new one.");
            setProcessing(false);
            return;
          }

          // Clean up URL to avoid re-processing the code on refresh
          url.searchParams.delete("code");
          window.history.replaceState({}, "", url.pathname);
          setProcessing(false);
          return;
        }

        // No callback params - might already be authenticated via session
        setProcessing(false);
      } catch {
        setError("An unexpected error occurred. Please try again.");
        setProcessing(false);
      }
    };

    handleCallback();
  }, []);

  // Redirect authenticated users to appropriate dashboard
  useEffect(() => {
    if (authLoading || processing) return;
    if (!isAuthenticated) return;

    if (profile?.onboarding_completed) {
      const userType = profile?.user_type || "developer";
      const dashboardPath = userType === "broker" ? "/broker" : `/${userType}`;
      navigate(dashboardPath, { replace: true });
    } else {
      navigate("/onboarding", { replace: true });
    }
  }, [authLoading, isAuthenticated, profile, processing, navigate]);

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 shadow-card">
          <div className="text-center mb-6">
            <LogoWithTransparency className="h-12 w-auto mx-auto mb-4" variant="white" />
          </div>
          
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Sign-in Failed</h2>
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button onClick={() => navigate("/login")} className="w-full mt-4">
              Back to Login
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 shadow-card">
        <div className="text-center mb-6">
          <LogoWithTransparency className="h-12 w-auto mx-auto mb-4" variant="white" />
        </div>
        
        <div className="flex flex-col items-center text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Signing you in...</p>
        </div>
      </Card>
    </div>
  );
};

export default AuthCallback;
