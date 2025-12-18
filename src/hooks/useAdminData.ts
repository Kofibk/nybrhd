import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

// Types
export interface Company {
  id: string;
  name: string;
  website: string | null;
  industry: string | null;
  address?: string | null;
  logo_url?: string | null;
  monthly_budget?: number | null;
  total_spend?: number | null;
  total_leads?: number | null;
  status?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  company_id: string | null;
  user_type: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ClientInvitation {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  company_name: string;
  client_type: "developer" | "agent" | "broker";
  status: "pending" | "sent" | "opened" | "accepted" | "expired" | "cancelled";
  invitation_token: string | null;
  monthly_budget: number | null;
  notes: string | null;
  invited_by: string;
  sent_at: string | null;
  accepted_at: string | null;
  expires_at: string | null;
  created_at: string;
}

export interface Subscription {
  id: string;
  company_id: string;
  plan: "starter" | "growth" | "enterprise" | "custom";
  status: "active" | "past_due" | "cancelled" | "trial" | "paused";
  monthly_fee: number | null;
  leads_included: number | null;
  leads_used: number | null;
  billing_cycle: string | null;
  billing_cycle_start: string | null;
  billing_cycle_end: string | null;
  trial_ends_at: string | null;
  created_at: string;
}

export interface Invoice {
  id: string;
  company_id: string;
  subscription_id: string | null;
  invoice_number: string;
  amount: number;
  tax_amount: number | null;
  total_amount: number;
  status: "draft" | "pending" | "paid" | "failed" | "refunded" | "cancelled";
  invoice_date: string;
  due_date: string | null;
  paid_at: string | null;
  created_at: string;
}

// Companies hooks
export function useCompanies() {
  return useQuery({
    queryKey: ["companies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as Company[];
    },
  });
}

export function useCreateCompany() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (company: { name: string; website?: string; industry?: string }) => {
      const { data, error } = await supabase
        .from("companies")
        .insert([company])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      toast({ title: "Company created successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create company", description: error.message, variant: "destructive" });
    },
  });
}

export function useUpdateCompany() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Company> & { id: string }) => {
      const { data, error } = await supabase
        .from("companies")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      toast({ title: "Company updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update company", description: error.message, variant: "destructive" });
    },
  });
}

export function useDeleteCompany() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("companies")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      toast({ title: "Company deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to delete company", description: error.message, variant: "destructive" });
    },
  });
}

// Profiles/Users hooks
export function useProfiles() {
  return useQuery({
    queryKey: ["profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          *,
          company:companies(id, name)
        `)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Profile> & { id: string }) => {
      const { data, error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
      toast({ title: "User updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update user", description: error.message, variant: "destructive" });
    },
  });
}

// Client Invitations hooks
export function useClientInvitations() {
  return useQuery({
    queryKey: ["client-invitations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("client_invitations")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as ClientInvitation[];
    },
  });
}

export function useCreateInvitation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (invitation: Omit<ClientInvitation, "id" | "created_at" | "status" | "invitation_token">) => {
      // Generate a unique invitation token
      const token = crypto.randomUUID();
      
      const { data, error } = await supabase
        .from("client_invitations")
        .insert({
          ...invitation,
          invitation_token: token,
          status: "pending",
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-invitations"] });
      toast({ title: "Invitation created successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create invitation", description: error.message, variant: "destructive" });
    },
  });
}

export function useUpdateInvitation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ClientInvitation> & { id: string }) => {
      const { data, error } = await supabase
        .from("client_invitations")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-invitations"] });
    },
  });
}

// Subscriptions hooks
export function useSubscriptions() {
  return useQuery({
    queryKey: ["subscriptions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscriptions")
        .select(`
          *,
          company:companies(id, name)
        `)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateSubscription() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (subscription: { company_id: string; plan?: "starter" | "growth" | "enterprise" | "custom"; monthly_fee?: number }) => {
      const { data, error } = await supabase
        .from("subscriptions")
        .insert([subscription])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      toast({ title: "Subscription created successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create subscription", description: error.message, variant: "destructive" });
    },
  });
}

export function useUpdateSubscription() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Subscription> & { id: string }) => {
      const { data, error } = await supabase
        .from("subscriptions")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      toast({ title: "Subscription updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update subscription", description: error.message, variant: "destructive" });
    },
  });
}

// Invoices hooks
export function useInvoices() {
  return useQuery({
    queryKey: ["invoices"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select(`
          *,
          company:companies(id, name)
        `)
        .order("invoice_date", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (invoice: { company_id: string; amount: number; total_amount: number; invoice_number?: string }) => {
      // Generate invoice number if not provided
      const invoiceNumber = invoice.invoice_number || `INV-${Date.now()}`;
      
      const { data, error } = await supabase
        .from("invoices")
        .insert([{
          ...invoice,
          invoice_number: invoiceNumber,
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast({ title: "Invoice created successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create invoice", description: error.message, variant: "destructive" });
    },
  });
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Invoice> & { id: string }) => {
      const { data, error } = await supabase
        .from("invoices")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast({ title: "Invoice updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update invoice", description: error.message, variant: "destructive" });
    },
  });
}

// Dashboard stats hook
export function useAdminStats() {
  return useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [companiesRes, profilesRes, invitationsRes, subscriptionsRes, invoicesRes] = await Promise.all([
        supabase.from("companies").select("id, status", { count: "exact" }),
        supabase.from("profiles").select("id, status", { count: "exact" }),
        supabase.from("client_invitations").select("id, status", { count: "exact" }),
        supabase.from("subscriptions").select("id, status, monthly_fee"),
        supabase.from("invoices").select("id, status, total_amount"),
      ]);
      
      const activeCompanies = companiesRes.data?.filter(c => c.status === "active").length || 0;
      const activeUsers = profilesRes.data?.filter(p => p.status === "active").length || 0;
      const pendingInvitations = invitationsRes.data?.filter(i => i.status === "pending" || i.status === "sent").length || 0;
      const activeSubscriptions = subscriptionsRes.data?.filter(s => s.status === "active").length || 0;
      const mrr = subscriptionsRes.data
        ?.filter(s => s.status === "active")
        .reduce((sum, s) => sum + (Number(s.monthly_fee) || 0), 0) || 0;
      const pendingInvoices = invoicesRes.data?.filter(i => i.status === "pending").length || 0;
      const totalRevenue = invoicesRes.data
        ?.filter(i => i.status === "paid")
        .reduce((sum, i) => sum + (Number(i.total_amount) || 0), 0) || 0;
      
      return {
        totalCompanies: companiesRes.count || 0,
        activeCompanies,
        totalUsers: profilesRes.count || 0,
        activeUsers,
        pendingInvitations,
        activeSubscriptions,
        mrr,
        pendingInvoices,
        totalRevenue,
      };
    },
  });
}
