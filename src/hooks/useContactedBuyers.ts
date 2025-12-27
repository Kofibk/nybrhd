import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ContactInfo {
  channel: 'email' | 'whatsapp';
  sentAt: Date;
  messageSent: string;
}

export function useContactedBuyers() {
  const { user } = useAuth();
  const [contactedBuyers, setContactedBuyers] = useState<Map<string, ContactInfo>>(new Map());
  const [isLoading, setIsLoading] = useState(true);

  const fetchContacts = useCallback(async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('buyer_contacts')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching contacted buyers:', error);
        setIsLoading(false);
        return;
      }

      const contactMap = new Map<string, ContactInfo>();
      data?.forEach((contact: any) => {
        contactMap.set(contact.buyer_id, {
          channel: contact.channel || 'email',
          sentAt: new Date(contact.contacted_at),
          messageSent: contact.message_sent || '',
        });
      });

      setContactedBuyers(contactMap);
    } catch (err) {
      console.error('Error in fetchContacts:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchContacts();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('buyer_contacts_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'buyer_contacts',
        },
        (payload) => {
          const newContact = payload.new as any;
          if (newContact.user_id === user?.id) {
            setContactedBuyers((prev) => {
              const updated = new Map(prev);
              updated.set(newContact.buyer_id, {
                channel: newContact.channel || 'email',
                sentAt: new Date(newContact.contacted_at),
                messageSent: newContact.message_sent || '',
              });
              return updated;
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchContacts, user?.id]);

  const isContacted = useCallback(
    (buyerId: string): boolean => {
      return contactedBuyers.has(buyerId);
    },
    [contactedBuyers]
  );

  const getContactInfo = useCallback(
    (buyerId: string): ContactInfo | undefined => {
      return contactedBuyers.get(buyerId);
    },
    [contactedBuyers]
  );

  return {
    isContacted,
    getContactInfo,
    isLoading,
    refetch: fetchContacts,
  };
}
