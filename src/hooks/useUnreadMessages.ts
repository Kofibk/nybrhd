import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useUnreadMessages = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('unread_count');

      if (error) {
        console.error('Error fetching unread count:', error);
        setUnreadCount(0);
        return;
      }

      if (data && data.length > 0) {
        const total = data.reduce((sum, c) => sum + (c.unread_count || 0), 0);
        setUnreadCount(total);
      } else {
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error in fetchUnreadCount:', error);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUnreadCount();

    // Set up real-time subscription for conversations
    const conversationsChannel = supabase
      .channel('unread-messages-channel')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'conversations' 
        },
        () => {
          fetchUnreadCount();
        }
      )
      .subscribe();

    // Also listen for new messages
    const messagesChannel = supabase
      .channel('new-messages-channel')
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: 'sender_type=eq.buyer'
        },
        () => {
          fetchUnreadCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(conversationsChannel);
      supabase.removeChannel(messagesChannel);
    };
  }, [fetchUnreadCount]);

  return { unreadCount, loading, refetch: fetchUnreadCount };
};
