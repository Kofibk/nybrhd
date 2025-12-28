import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogoWithTransparency } from "@/components/LogoWithTransparency";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Mail, KeyRound } from "lucide-react";

const Login = () => {
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the return URL from state, or default to developer dashboard
  const from = (location.state as { from?: Location })?.from?.pathname || "/developer";

  const handleSendCode = async (e: React.FormEvent) => {
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
        },
      });

      if (error) {
        throw error;
      }

      setStep("code");
      toast.success("Verification code sent to your email");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to send code";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      toast.error("Please enter the verification code");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: "email",
      });

      if (error) {
        throw error;
      }

      if (data.session) {
        login(data.session);
        toast.success("Successfully logged in");

        // Check if user has completed onboarding
        const { data: profile } = await supabase
          .from("profiles")
          .select("onboarding_completed, user_type")
          .eq("user_id", data.session.user.id)
          .single();

        if (profile?.onboarding_completed) {
          // Navigate to the original destination or user's appropriate dashboard
          if (from && from !== "/login") {
            navigate(from);
          } else {
            const userType = profile.user_type || "developer";
            const dashboardPath = userType === "broker" ? "/broker" : `/${userType}`;
            navigate(dashboardPath);
          }
        } else {
          // Redirect to onboarding
          navigate("/onboarding");
        }
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Invalid code";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 shadow-card">
        <div className="text-center mb-8">
          <Link to="/landing" className="flex justify-center mb-4">
            <LogoWithTransparency className="h-14 w-auto" variant="white" />
          </Link>
          <p className="text-muted-foreground mt-1">AI-Powered Property Sales Platform</p>
        </div>

        {step === "email" ? (
          <form onSubmit={handleSendCode} className="space-y-6">
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
                We'll send a verification code to this email
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Code"
              )}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyCode} className="space-y-6">
            <div>
              <Label htmlFor="code">Verification Code</Label>
              <div className="relative mt-2">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="code"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="pl-10"
                  maxLength={6}
                  disabled={isLoading}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Enter the code sent to {email}
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify"
              )}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => setStep("email")}
              disabled={isLoading}
            >
              Back to email
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
