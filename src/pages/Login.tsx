import { useEffect, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogoWithTransparency } from "@/components/LogoWithTransparency";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Mail } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Get the return URL from state, or default to developer dashboard
  const from = (location.state as { from?: Location })?.from?.pathname || "/developer";

  const handleSendLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          // Send users back to /login so we can exchange the code for a session.
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });

      if (error) throw error;

      toast.success("Magic link sent. Check your email and open it in this browser.");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to send magic link";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const { isAuthenticated, profile, isLoading: authLoading } = useAuth();

  // Handle magic-link callbacks (PKCE code exchange)
  useEffect(() => {
    const url = new URL(window.location.href);
    const code = url.searchParams.get("code");

    if (!code) return;

    setIsLoading(true);
    supabase.auth
      .exchangeCodeForSession(code)
      .then(({ error }) => {
        if (error) {
          toast.error("This sign-in link is invalid or expired. Please request a new one.");
          return;
        }

        // Clean up URL to avoid re-processing the code on refresh
        url.searchParams.delete("code");
        window.history.replaceState({}, "", url.pathname + url.search + url.hash);
      })
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;

    if (profile?.onboarding_completed) {
      if (from && from !== "/login") {
        navigate(from, { replace: true });
      } else {
        const userType = profile?.user_type || "developer";
        const dashboardPath = userType === "broker" ? "/broker" : `/${userType}`;
        navigate(dashboardPath, { replace: true });
      }
    } else {
      navigate("/onboarding", { replace: true });
    }
  }, [authLoading, isAuthenticated, profile, from, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 shadow-card">
        <div className="text-center mb-8">
          <Link to="/landing" className="flex justify-center mb-4">
            <LogoWithTransparency className="h-14 w-auto" variant="white" />
          </Link>
          <p className="text-muted-foreground mt-1">AI-Powered Property Sales Platform</p>
        </div>

        <form onSubmit={handleSendLink} className="space-y-6">
          <div>
            <Label htmlFor="email">Email Address</Label>
            <div className="relative mt-2">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                disabled={isLoading}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              We'll email you a secure sign-in link.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              If you see “Invalid token”, request a new link and open it once (some email scanners pre-open links).
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              "Send Magic Link"
            )}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-border">
          <p className="text-xs text-center text-muted-foreground">
            Don't have an account? Enter your email above to get started.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Login;
