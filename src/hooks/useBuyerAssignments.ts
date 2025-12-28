import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface BuyerAssignment {
  id: string;
  airtable_record_id: string;
  airtable_lead_id: number | null;
  user_id: string;
  company_id: string | null;
  assigned_by: string | null;
  assigned_at: string;
  status: 'assigned' | 'contacted' | 'in_progress' | 'converted' | 'expired' | 'released';
  notes: string | null;
  expires_at: string | null;
}

interface BuyerContact {
  id: string;
  assignment_id: string;
  user_id: string;
  airtable_record_id: string;
  contact_method: 'email' | 'whatsapp' | 'phone' | 'in_person';
  message_content: string | null;
  contacted_at: string;
  response_received: boolean;
  response_at: string | null;
  outcome: 'no_response' | 'interested' | 'not_interested' | 'viewing_booked' | 'converted' | null;
}

// Get all assignments for current user
export function useMyAssignments() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['buyer-assignments', 'my', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('buyer_assignments')
        .select('*')
        .eq('user_id', user?.id)
        .in('status', ['assigned', 'contacted', 'in_progress']);
      
      if (error) throw error;
      return data as BuyerAssignment[];
    },
    enabled: !!user?.id,
  });
}

// Get all assignments (admin only)
export function useAllAssignments() {
  return useQuery({
    queryKey: ['buyer-assignments', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('buyer_assignments')
        .select('*')
        .order('assigned_at', { ascending: false });
      
      if (error) throw error;
      return data as BuyerAssignment[];
    },
  });
}

// Check if a buyer is assigned to anyone
export function useBuyerAssignmentStatus(airtableRecordId: string) {
  return useQuery({
    queryKey: ['buyer-assignments', 'status', airtableRecordId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('buyer_assignments')
        .select('*')
        .eq('airtable_record_id', airtableRecordId)
        .in('status', ['assigned', 'contacted', 'in_progress'])
        .maybeSingle();
      
      if (error) throw error;
      return data as BuyerAssignment | null;
    },
    enabled: !!airtableRecordId,
  });
}

// Assign a buyer to a user (admin action)
export function useAssignBuyer() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({ 
      airtableRecordId, 
      airtableLeadId,
      userId, 
      companyId,
      notes,
      expiresAt 
    }: { 
      airtableRecordId: string;
      airtableLeadId?: number;
      userId: string;
      companyId?: string;
      notes?: string;
      expiresAt?: string;
    }) => {
      const { data, error } = await supabase
        .from('buyer_assignments')
        .insert({
          airtable_record_id: airtableRecordId,
          airtable_lead_id: airtableLeadId,
          user_id: userId,
          company_id: companyId,
          assigned_by: user?.id,
          notes,
          expires_at: expiresAt,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buyer-assignments'] });
    },
  });
}

// Release/unassign a buyer
export function useReleaseBuyer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (assignmentId: string) => {
      const { error } = await supabase
        .from('buyer_assignments')
        .update({ status: 'released' })
        .eq('id', assignmentId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buyer-assignments'] });
    },
  });
}

// Record a contact with a buyer
export function useRecordContact() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({
      assignmentId,
      airtableRecordId,
      contactMethod,
      messageContent,
    }: {
      assignmentId: string;
      airtableRecordId: string;
      contactMethod: 'email' | 'whatsapp' | 'phone' | 'in_person';
      messageContent?: string;
    }) => {
      // Record the contact
      const { data, error } = await supabase
        .from('buyer_contacts')
        .insert({
          assignment_id: assignmentId,
          user_id: user?.id,
          airtable_record_id: airtableRecordId,
          contact_method: contactMethod,
          message_content: messageContent,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Update assignment status to 'contacted'
      await supabase
        .from('buyer_assignments')
        .update({ status: 'contacted' })
        .eq('id', assignmentId);
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buyer-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['buyer-contacts'] });
    },
  });
}

// Get contact history for current user
export function useMyContactHistory() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['buyer-contacts', 'my', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('buyer_contacts')
        .select('*')
        .eq('user_id', user?.id)
        .order('contacted_at', { ascending: false });
      
      if (error) throw error;
      return data as BuyerContact[];
    },
    enabled: !!user?.id,
  });
}

// Get contacts used this month (for usage tracking)
export function useMonthlyContactCount() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['buyer-contacts', 'monthly-count', user?.id],
    queryFn: async () => {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      const { count, error } = await supabase
        .from('buyer_contacts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id)
        .gte('contacted_at', startOfMonth.toISOString());
      
      if (error) throw error;
      return count || 0;
    },
    enabled: !!user?.id,
  });
}
