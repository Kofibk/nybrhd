import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  airtable, 
  AirtableTables,
  type AirtableUser,
  type AirtableCompany,
  type AirtableDevelopment,
  type AirtableCampaign,
  type AirtableLead,
  type AirtableCampaignMetric,
  type AirtableCreativeAsset,
  type AirtableAdCopy,
} from '@/lib/airtable';

// ============ USERS HOOKS ============
export function useAirtableUsers(options?: { filterByFormula?: string }) {
  return useQuery({
    queryKey: ['airtable', 'users', options],
    queryFn: () => airtable.users.list(options),
  });
}

export function useAirtableUser(recordId: string) {
  return useQuery({
    queryKey: ['airtable', 'users', recordId],
    queryFn: () => airtable.users.get(recordId),
    enabled: !!recordId,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<AirtableUser>) => airtable.users.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['airtable', 'users'] });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ recordId, data }: { recordId: string; data: Partial<AirtableUser> }) => 
      airtable.users.update(recordId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['airtable', 'users'] });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (recordId: string | string[]) => airtable.users.delete(recordId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['airtable', 'users'] });
    },
  });
}

// ============ COMPANIES HOOKS ============
export function useAirtableCompanies(options?: { filterByFormula?: string }) {
  return useQuery({
    queryKey: ['airtable', 'companies', options],
    queryFn: () => airtable.companies.list(options),
  });
}

export function useAirtableCompany(recordId: string) {
  return useQuery({
    queryKey: ['airtable', 'companies', recordId],
    queryFn: () => airtable.companies.get(recordId),
    enabled: !!recordId,
  });
}

export function useCreateCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<AirtableCompany>) => airtable.companies.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['airtable', 'companies'] });
    },
  });
}

export function useUpdateCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ recordId, data }: { recordId: string; data: Partial<AirtableCompany> }) => 
      airtable.companies.update(recordId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['airtable', 'companies'] });
    },
  });
}

// ============ DEVELOPMENTS HOOKS ============
export function useAirtableDevelopments(options?: { filterByFormula?: string }) {
  return useQuery({
    queryKey: ['airtable', 'developments', options],
    queryFn: () => airtable.developments.list(options),
  });
}

export function useAirtableDevelopment(recordId: string) {
  return useQuery({
    queryKey: ['airtable', 'developments', recordId],
    queryFn: () => airtable.developments.get(recordId),
    enabled: !!recordId,
  });
}

export function useCreateDevelopment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<AirtableDevelopment>) => airtable.developments.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['airtable', 'developments'] });
    },
  });
}

export function useUpdateDevelopment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ recordId, data }: { recordId: string; data: Partial<AirtableDevelopment> }) => 
      airtable.developments.update(recordId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['airtable', 'developments'] });
    },
  });
}

export function useDeleteDevelopment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (recordId: string | string[]) => airtable.developments.delete(recordId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['airtable', 'developments'] });
    },
  });
}

// ============ CAMPAIGNS HOOKS ============
export function useAirtableCampaigns(options?: { filterByFormula?: string }) {
  return useQuery({
    queryKey: ['airtable', 'campaigns', options],
    queryFn: () => airtable.campaigns.list(options),
  });
}

export function useAirtableCampaign(recordId: string) {
  return useQuery({
    queryKey: ['airtable', 'campaigns', recordId],
    queryFn: () => airtable.campaigns.get(recordId),
    enabled: !!recordId,
  });
}

export function useCreateCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<AirtableCampaign>) => airtable.campaigns.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['airtable', 'campaigns'] });
    },
  });
}

export function useUpdateCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ recordId, data }: { recordId: string; data: Partial<AirtableCampaign> }) => 
      airtable.campaigns.update(recordId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['airtable', 'campaigns'] });
    },
  });
}

export function useDeleteCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (recordId: string | string[]) => airtable.campaigns.delete(recordId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['airtable', 'campaigns'] });
    },
  });
}

// ============ LEADS HOOKS ============
export function useAirtableLeads(options?: { filterByFormula?: string; sort?: Array<{ field: string; direction: 'asc' | 'desc' }> }) {
  return useQuery({
    queryKey: ['airtable', 'leads', options],
    queryFn: () => airtable.leads.list(options),
  });
}

export function useAirtableLead(recordId: string) {
  return useQuery({
    queryKey: ['airtable', 'leads', recordId],
    queryFn: () => airtable.leads.get(recordId),
    enabled: !!recordId,
  });
}

export function useCreateLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<AirtableLead>) => airtable.leads.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['airtable', 'leads'] });
    },
  });
}

export function useUpdateLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ recordId, data }: { recordId: string; data: Partial<AirtableLead> }) => 
      airtable.leads.update(recordId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['airtable', 'leads'] });
    },
  });
}

export function useDeleteLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (recordId: string | string[]) => airtable.leads.delete(recordId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['airtable', 'leads'] });
    },
  });
}

// ============ CAMPAIGN METRICS HOOKS ============
export function useAirtableCampaignMetrics(options?: { filterByFormula?: string }) {
  return useQuery({
    queryKey: ['airtable', 'campaignMetrics', options],
    queryFn: () => airtable.campaignMetrics.list(options),
  });
}

export function useCreateCampaignMetric() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<AirtableCampaignMetric>) => airtable.campaignMetrics.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['airtable', 'campaignMetrics'] });
    },
  });
}

// ============ CREATIVE ASSETS HOOKS ============
export function useAirtableCreativeAssets(options?: { filterByFormula?: string }) {
  return useQuery({
    queryKey: ['airtable', 'creativeAssets', options],
    queryFn: () => airtable.creativeAssets.list(options),
  });
}

export function useCreateCreativeAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<AirtableCreativeAsset>) => airtable.creativeAssets.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['airtable', 'creativeAssets'] });
    },
  });
}

// ============ AD COPIES HOOKS ============
export function useAirtableAdCopies(options?: { filterByFormula?: string }) {
  return useQuery({
    queryKey: ['airtable', 'adCopies', options],
    queryFn: () => airtable.adCopies.list(options),
  });
}

export function useCreateAdCopy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<AirtableAdCopy>) => airtable.adCopies.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['airtable', 'adCopies'] });
    },
  });
}

// ============ SUBSCRIPTIONS & BILLING HOOKS ============
export function useAirtableSubscriptions(options?: { filterByFormula?: string }) {
  return useQuery({
    queryKey: ['airtable', 'subscriptions', options],
    queryFn: () => airtable.subscriptions.list(options),
  });
}

export function useAirtableInvoices(options?: { filterByFormula?: string }) {
  return useQuery({
    queryKey: ['airtable', 'invoices', options],
    queryFn: () => airtable.invoices.list(options),
  });
}

// ============ SETTINGS HOOKS ============
export function useAirtableSettings(options?: { filterByFormula?: string }) {
  return useQuery({
    queryKey: ['airtable', 'settings', options],
    queryFn: () => airtable.settings.list(options),
  });
}

export function useUpdateSetting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ recordId, data }: { recordId: string; data: { setting_value: string } }) => 
      airtable.settings.update(recordId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['airtable', 'settings'] });
    },
  });
}

// ============ AUTOMATION HOOKS ============
export function useAirtableAutomationSequences(options?: { filterByFormula?: string }) {
  return useQuery({
    queryKey: ['airtable', 'automationSequences', options],
    queryFn: () => airtable.automationSequences.list(options),
  });
}
