import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useAdminAuth = () => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user?.email) {
          setIsAdmin(false);
          setIsLoading(false);
          return;
        }

        setUserEmail(session.user.email);

        // Check if email is in admin whitelist
        const { data, error } = await supabase
          .from("admin_emails")
          .select("email")
          .eq("email", session.user.email.toLowerCase())
          .single();

        if (error || !data) {
          setIsAdmin(false);
        } else {
          setIsAdmin(true);
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminStatus();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkAdminStatus();
    });

    return () => subscription.unsubscribe();
  }, []);

  return { isAdmin, isLoading, userEmail };
};
