import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogoWithTransparency } from "@/components/LogoWithTransparency";

const AuthCallback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    let timeoutId: number | undefined;
    let isMounted = true;

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

      const normalizedError = (
        errorDescription ||
        errorParam ||
        hashErrorDescription ||
        hashError ||
        ""
      ).toLowerCase();

      const friendlyInvalidLink =
        normalizedError.includes("signature is invalid") ||
        normalizedError.includes("one-time token not found") ||
        normalizedError.includes("email link is invalid") ||
        normalizedError.includes("expired");

      // Timeout fallback
      timeoutId = window.setTimeout(() => {
        if (isMounted) {
          setError(
            "Still signing you in — this usually means the link was opened in a different browser, expired, or was already used. Please request a new link."
          );
          setProcessing(false);
        }
      }, 15000);

      // Handle errors from URL
      if (errorParam || hashError) {
        if (isMounted) {
          setError(
            friendlyInvalidLink
              ? "This sign-in link is invalid, expired, or has already been used. Please request a new link."
              : errorDescription || errorParam || hashErrorDescription || hashError
          );
          setProcessing(false);
        }
        return;
      }

      try {
        // Implicit flow: tokens in hash
        if (accessToken && refreshToken) {
          const { error: setSessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (setSessionError) {
            if (isMounted) {
              setError("This sign-in link is invalid or expired. Please request a new one.");
              setProcessing(false);
            }
            return;
          }

          // Clear tokens from URL
          window.history.replaceState({}, "", url.pathname);
        }

        // PKCE flow: code in query params
        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

          if (exchangeError) {
            if (isMounted) {
              setError("This sign-in link is invalid or expired. Please request a new one.");
              setProcessing(false);
            }
            return;
          }

          // Clean up URL
          window.history.replaceState({}, "", url.pathname);
        }

        // Now get the session directly and redirect
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          // No session yet, wait a bit and try again
          await new Promise(resolve => setTimeout(resolve, 500));
          const { data: { session: retrySession } } = await supabase.auth.getSession();
          
          if (!retrySession?.user) {
            if (isMounted) {
              setError("Could not establish session. Please try logging in again.");
              setProcessing(false);
            }
            return;
          }
        }

        // Fetch profile directly
        const { data: { session: finalSession } } = await supabase.auth.getSession();
        if (finalSession?.user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("user_type, onboarding_completed")
            .eq("user_id", finalSession.user.id)
            .single();

          if (isMounted) {
            clearTimeout(timeoutId);
            
            if (profile?.onboarding_completed) {
              const userType = profile.user_type || "developer";
              const dashboardPath = userType === "broker" ? "/broker" : `/${userType}`;
              navigate(dashboardPath, { replace: true });
            } else {
              navigate("/onboarding", { replace: true });
            }
          }
        }
      } catch (err) {
        console.error("Auth callback error:", err);
        if (isMounted) {
          setError("An unexpected error occurred. Please try again.");
          setProcessing(false);
        }
      }
    };

    handleCallback();

    return () => {
      isMounted = false;
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [navigate]);

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
