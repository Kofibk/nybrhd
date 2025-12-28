import { useEffect, useState, useCallback } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LogoWithTransparency } from "@/components/LogoWithTransparency";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Mail, CheckCircle, AlertCircle } from "lucide-react";

const COOLDOWN_SECONDS = 60;

const Login = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [linkSent, setLinkSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Get the return URL from state, or default to developer dashboard
  const from = (location.state as { from?: Location })?.from?.pathname || "/developer";

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSendLink = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim()) {
      setErrorMessage("Please enter your email address");
      return;
    }

    if (cooldown > 0) {
      setErrorMessage(`Please wait ${cooldown} seconds before requesting another link`);
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      setLinkSent(true);
      setCooldown(COOLDOWN_SECONDS);
      toast.success("Magic link sent! Check your email.");
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : "Failed to send magic link";
      setErrorMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [email, cooldown]);

  const { isAuthenticated, profile, isLoading: authLoading } = useAuth();

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

        {errorMessage && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        {linkSent ? (
          <div className="space-y-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Check your email</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  We sent a sign-in link to <span className="font-medium text-foreground">{email}</span>
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <a
                href="https://mail.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg border border-border bg-background hover:bg-muted transition-colors text-sm font-medium"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <path d="M22 6L12 13L2 6V4L12 11L22 4V6Z" fill="#EA4335"/>
                  <path d="M22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6L12 13L22 6Z" fill="#FBBC05"/>
                  <path d="M2 6V18C2 19.1 2.9 20 4 20H12V13L2 6Z" fill="#34A853"/>
                  <path d="M22 6V18C22 19.1 21.1 20 20 20H12V13L22 6Z" fill="#4285F4"/>
                </svg>
                Gmail
              </a>
              <a
                href="https://outlook.live.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg border border-border bg-background hover:bg-muted transition-colors text-sm font-medium"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <path d="M24 7.387V16.614C24 17.93 22.93 19 21.613 19H9.387C8.069 19 7 17.93 7 16.613V7.387C7 6.069 8.07 5 9.387 5H21.614C22.93 5 24 6.07 24 7.387Z" fill="#0078D4"/>
                  <path d="M24 7.387L15.5 13L7 7.387V5.5L15.5 11L24 5.5V7.387Z" fill="#28A8EA"/>
                  <path d="M9 5H2.5C1.12 5 0 6.12 0 7.5V16.5C0 17.88 1.12 19 2.5 19H9V5Z" fill="#0078D4"/>
                  <path d="M9 8.5V15.5L4.5 12L0 15.5V8.5L4.5 12L9 8.5Z" fill="#50D9FF"/>
                </svg>
                Outlook
              </a>
            </div>

            <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground space-y-2">
              <p className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
                <span><strong>Important:</strong> Open the link in <strong>this browser</strong> to sign in</span>
              </p>
              <p className="pl-6">• Links expire after 1 hour</p>
              <p className="pl-6">• Check spam folder if you don't see it</p>
            </div>

            <Button
              variant="outline"
              className="w-full"
              disabled={cooldown > 0 || isLoading}
              onClick={(e) => {
                setLinkSent(false);
                handleSendLink(e);
              }}
            >
              {cooldown > 0 ? (
                `Resend in ${cooldown}s`
              ) : isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Resend Link"
              )}
            </Button>

            <Button
              variant="ghost"
              className="w-full"
              onClick={() => {
                setLinkSent(false);
                setEmail("");
                setErrorMessage(null);
              }}
            >
              Use a different email
            </Button>
          </div>
        ) : (
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
                We'll email you a secure sign-in link. No password needed.
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading || cooldown > 0}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : cooldown > 0 ? (
                `Wait ${cooldown}s`
              ) : (
                "Send Magic Link"
              )}
            </Button>
          </form>
        )}

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
