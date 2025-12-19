import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SyncResult {
  success: boolean;
  action: string;
  results?: Record<string, { synced: number; errors: number }>;
  record?: unknown;
  message?: string;
  error?: string;
}

export function useAirtableSync() {
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();

  const pullFromAirtable = async (table?: string): Promise<SyncResult | null> => {
    setIsSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('airtable-sync', {
        body: { action: 'pull', table },
      });

      if (error) throw error;

      toast({
        title: 'Sync Complete',
        description: `Successfully pulled data from Airtable${table ? ` for ${table}` : ''}`,
      });

      return data as SyncResult;
    } catch (error) {
      console.error('Pull from Airtable failed:', error);
      toast({
        title: 'Sync Failed',
        description: 'Failed to pull data from Airtable',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsSyncing(false);
    }
  };

  const pushToAirtable = async (table: string, recordId: string): Promise<SyncResult | null> => {
    setIsSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('airtable-sync', {
        body: { action: 'push', table, recordId },
      });

      if (error) throw error;

      toast({
        title: 'Sync Complete',
        description: `Successfully pushed record to Airtable`,
      });

      return data as SyncResult;
    } catch (error) {
      console.error('Push to Airtable failed:', error);
      toast({
        title: 'Sync Failed',
        description: 'Failed to push data to Airtable',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsSyncing(false);
    }
  };

  const fullSync = async (): Promise<SyncResult | null> => {
    setIsSyncing(true);
    try {
      // First pull all data from Airtable
      const pullResult = await supabase.functions.invoke('airtable-sync', {
        body: { action: 'pull' },
      });

      if (pullResult.error) throw pullResult.error;

      toast({
        title: 'Full Sync Complete',
        description: 'Successfully synchronized with Airtable',
      });

      return pullResult.data as SyncResult;
    } catch (error) {
      console.error('Full sync failed:', error);
      toast({
        title: 'Sync Failed',
        description: 'Failed to complete full sync with Airtable',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsSyncing(false);
    }
  };

  return {
    isSyncing,
    pullFromAirtable,
    pushToAirtable,
    fullSync,
  };
}
