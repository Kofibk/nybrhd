export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      admin_emails: {
        Row: {
          created_at: string
          email: string
          id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
        }
        Relationships: []
      }
      airtable_sync: {
        Row: {
          airtable_record_id: string
          airtable_table: string
          created_at: string
          id: string
          last_synced_at: string | null
          supabase_record_id: string
          supabase_table: string
        }
        Insert: {
          airtable_record_id: string
          airtable_table: string
          created_at?: string
          id?: string
          last_synced_at?: string | null
          supabase_record_id: string
          supabase_table: string
        }
        Update: {
          airtable_record_id?: string
          airtable_table?: string
          created_at?: string
          id?: string
          last_synced_at?: string | null
          supabase_record_id?: string
          supabase_table?: string
        }
        Relationships: []
      }
      client_invitations: {
        Row: {
          accepted_at: string | null
          client_type: Database["public"]["Enums"]["client_type"]
          company_name: string
          created_at: string
          created_company_id: string | null
          created_user_id: string | null
          email: string
          expires_at: string | null
          id: string
          invitation_token: string | null
          invited_by: string
          monthly_budget: number | null
          name: string
          notes: string | null
          opened_at: string | null
          phone: string | null
          sent_at: string | null
          status: Database["public"]["Enums"]["invitation_status"]
        }
        Insert: {
          accepted_at?: string | null
          client_type: Database["public"]["Enums"]["client_type"]
          company_name: string
          created_at?: string
          created_company_id?: string | null
          created_user_id?: string | null
          email: string
          expires_at?: string | null
          id?: string
          invitation_token?: string | null
          invited_by: string
          monthly_budget?: number | null
          name: string
          notes?: string | null
          opened_at?: string | null
          phone?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["invitation_status"]
        }
        Update: {
          accepted_at?: string | null
          client_type?: Database["public"]["Enums"]["client_type"]
          company_name?: string
          created_at?: string
          created_company_id?: string | null
          created_user_id?: string | null
          email?: string
          expires_at?: string | null
          id?: string
          invitation_token?: string | null
          invited_by?: string
          monthly_budget?: number | null
          name?: string
          notes?: string | null
          opened_at?: string | null
          phone?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["invitation_status"]
        }
        Relationships: [
          {
            foreignKeyName: "client_invitations_created_company_id_fkey"
            columns: ["created_company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_invitations_created_user_id_fkey"
            columns: ["created_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          address: string | null
          created_at: string
          id: string
          industry: string | null
          logo_url: string | null
          monthly_budget: number | null
          name: string
          notes: string | null
          onboarded_at: string | null
          onboarded_by: string | null
          primary_contact_id: string | null
          status: string | null
          total_leads: number | null
          total_spend: number | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          id?: string
          industry?: string | null
          logo_url?: string | null
          monthly_budget?: number | null
          name: string
          notes?: string | null
          onboarded_at?: string | null
          onboarded_by?: string | null
          primary_contact_id?: string | null
          status?: string | null
          total_leads?: number | null
          total_spend?: number | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          id?: string
          industry?: string | null
          logo_url?: string | null
          monthly_budget?: number | null
          name?: string
          notes?: string | null
          onboarded_at?: string | null
          onboarded_by?: string | null
          primary_contact_id?: string | null
          status?: string | null
          total_leads?: number | null
          total_spend?: number | null
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "companies_primary_contact_id_fkey"
            columns: ["primary_contact_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_line_items: {
        Row: {
          created_at: string
          description: string
          id: string
          invoice_id: string
          quantity: number | null
          total: number
          type: string | null
          unit_price: number
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          invoice_id: string
          quantity?: number | null
          total: number
          type?: string | null
          unit_price: number
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          invoice_id?: string
          quantity?: number | null
          total?: number
          type?: string | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_line_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount: number
          company_id: string
          created_at: string
          due_date: string | null
          id: string
          invoice_date: string
          invoice_number: string
          paid_at: string | null
          payment_method: string | null
          pdf_url: string | null
          status: Database["public"]["Enums"]["invoice_status"]
          stripe_invoice_id: string | null
          stripe_payment_intent_id: string | null
          subscription_id: string | null
          tax_amount: number | null
          total_amount: number
        }
        Insert: {
          amount: number
          company_id: string
          created_at?: string
          due_date?: string | null
          id?: string
          invoice_date?: string
          invoice_number: string
          paid_at?: string | null
          payment_method?: string | null
          pdf_url?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          stripe_invoice_id?: string | null
          stripe_payment_intent_id?: string | null
          subscription_id?: string | null
          tax_amount?: number | null
          total_amount: number
        }
        Update: {
          amount?: number
          company_id?: string
          created_at?: string
          due_date?: string | null
          id?: string
          invoice_date?: string
          invoice_number?: string
          paid_at?: string | null
          payment_method?: string | null
          pdf_url?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          stripe_invoice_id?: string | null
          stripe_payment_intent_id?: string | null
          subscription_id?: string | null
          tax_amount?: number | null
          total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoices_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company_address: string | null
          company_id: string | null
          company_instagram: string | null
          company_linkedin: string | null
          company_logo_url: string | null
          company_website: string | null
          created_at: string
          email: string
          full_name: string | null
          goals: string[] | null
          id: string
          job_title: string | null
          onboarding_completed: boolean | null
          onboarding_step: number | null
          phone: string | null
          regions_covered: string[] | null
          status: string
          updated_at: string
          upsell_interest: boolean | null
          user_id: string
          user_type: string
        }
        Insert: {
          avatar_url?: string | null
          company_address?: string | null
          company_id?: string | null
          company_instagram?: string | null
          company_linkedin?: string | null
          company_logo_url?: string | null
          company_website?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          goals?: string[] | null
          id?: string
          job_title?: string | null
          onboarding_completed?: boolean | null
          onboarding_step?: number | null
          phone?: string | null
          regions_covered?: string[] | null
          status?: string
          updated_at?: string
          upsell_interest?: boolean | null
          user_id: string
          user_type?: string
        }
        Update: {
          avatar_url?: string | null
          company_address?: string | null
          company_id?: string | null
          company_instagram?: string | null
          company_linkedin?: string | null
          company_logo_url?: string | null
          company_website?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          goals?: string[] | null
          id?: string
          job_title?: string | null
          onboarding_completed?: boolean | null
          onboarding_step?: number | null
          phone?: string | null
          regions_covered?: string[] | null
          status?: string
          updated_at?: string
          upsell_interest?: boolean | null
          user_id?: string
          user_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          auto_renew: boolean | null
          billing_cycle: string | null
          billing_cycle_end: string | null
          billing_cycle_start: string | null
          company_id: string
          created_at: string
          id: string
          leads_included: number | null
          leads_used: number | null
          monthly_fee: number | null
          overage_rate: number | null
          plan: Database["public"]["Enums"]["subscription_plan"]
          setup_fee: number | null
          status: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          trial_ends_at: string | null
          updated_at: string
        }
        Insert: {
          auto_renew?: boolean | null
          billing_cycle?: string | null
          billing_cycle_end?: string | null
          billing_cycle_start?: string | null
          company_id: string
          created_at?: string
          id?: string
          leads_included?: number | null
          leads_used?: number | null
          monthly_fee?: number | null
          overage_rate?: number | null
          plan?: Database["public"]["Enums"]["subscription_plan"]
          setup_fee?: number | null
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_ends_at?: string | null
          updated_at?: string
        }
        Update: {
          auto_renew?: boolean | null
          billing_cycle?: string | null
          billing_cycle_end?: string | null
          billing_cycle_start?: string | null
          company_id?: string
          created_at?: string
          id?: string
          leads_included?: number | null
          leads_used?: number | null
          monthly_fee?: number | null
          overage_rate?: number | null
          plan?: Database["public"]["Enums"]["subscription_plan"]
          setup_fee?: number | null
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_ends_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      team_invitations: {
        Row: {
          accepted_at: string | null
          company_id: string | null
          created_at: string
          email: string
          id: string
          inviter_id: string
          status: string
        }
        Insert: {
          accepted_at?: string | null
          company_id?: string | null
          created_at?: string
          email: string
          id?: string
          inviter_id: string
          status?: string
        }
        Update: {
          accepted_at?: string | null
          company_id?: string | null
          created_at?: string
          email?: string
          id?: string
          inviter_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_invitations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          granted_at: string | null
          granted_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_current_user_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "super_admin" | "admin" | "manager" | "member" | "viewer"
      client_type: "developer" | "agent" | "broker"
      invitation_status:
        | "pending"
        | "sent"
        | "opened"
        | "accepted"
        | "expired"
        | "cancelled"
      invoice_status:
        | "draft"
        | "pending"
        | "paid"
        | "failed"
        | "refunded"
        | "cancelled"
      subscription_plan: "starter" | "growth" | "enterprise" | "custom"
      subscription_status:
        | "active"
        | "past_due"
        | "cancelled"
        | "trial"
        | "paused"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["super_admin", "admin", "manager", "member", "viewer"],
      client_type: ["developer", "agent", "broker"],
      invitation_status: [
        "pending",
        "sent",
        "opened",
        "accepted",
        "expired",
        "cancelled",
      ],
      invoice_status: [
        "draft",
        "pending",
        "paid",
        "failed",
        "refunded",
        "cancelled",
      ],
      subscription_plan: ["starter", "growth", "enterprise", "custom"],
      subscription_status: [
        "active",
        "past_due",
        "cancelled",
        "trial",
        "paused",
      ],
    },
  },
} as const
