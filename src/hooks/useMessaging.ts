import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { toast } from 'sonner';

export interface Conversation {
  id: string;
  buyer_id: string;
  user_id: string;
  status: 'active' | 'buyer_responded' | 'awaiting_response' | 'closed';
  last_message_at: string;
  last_message_preview: string | null;
  unread_count: number;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_type: 'user' | 'buyer';
  sender_id: string;
  content: string;
  sent_via: 'platform' | 'email' | 'whatsapp' | 'web';
  delivered: boolean;
  delivered_at: string | null;
  read: boolean;
  read_at: string | null;
  media_url: string | null;
  created_at: string;
}

export interface MessageTemplate {
  id: string;
  user_id: string;
  name: string;
  content: string;
  last_used_at: string | null;
  created_at: string;
  updated_at: string;
}

export const useMessaging = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { currentTier } = useSubscription();

  const getContactLimit = useCallback(() => {
    switch (currentTier) {
      case 'access': return 30;
      case 'growth': return 100;
      case 'enterprise': return Infinity;
      default: return 30;
    }
  }, [currentTier]);

  const fetchConversations = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .order('last_message_at', { ascending: false });

      if (error) throw error;
      
      const typedData = (data || []) as Conversation[];
      setConversations(typedData);
      setUnreadCount(typedData.reduce((sum, c) => sum + (c.unread_count || 0), 0));
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMessages = useCallback(async (conversationId: string): Promise<Message[]> => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return (data || []) as Message[];
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  }, []);

  const getContactsUsedThisMonth = useCallback(async (): Promise<number> => {
    try {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { count, error } = await supabase
        .from('user_contacts')
        .select('*', { count: 'exact', head: true })
        .gte('contacted_at', startOfMonth.toISOString());

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error getting contacts count:', error);
      return 0;
    }
  }, []);

  const getBuyerContactCount = useCallback(async (buyerId: string): Promise<number> => {
    try {
      const { count, error } = await supabase
        .from('buyer_contacts')
        .select('*', { count: 'exact', head: true })
        .eq('buyer_id', buyerId);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error getting buyer contact count:', error);
      return 0;
    }
  }, []);

  const hasContactedBuyer = useCallback(async (buyerId: string): Promise<boolean> => {
    try {
      const { count, error } = await supabase
        .from('user_contacts')
        .select('*', { count: 'exact', head: true })
        .eq('buyer_id', buyerId);

      if (error) throw error;
      return (count || 0) > 0;
    } catch (error) {
      console.error('Error checking if contacted buyer:', error);
      return false;
    }
  }, []);

  const startConversation = useCallback(async (
    buyerId: string,
    message: string
  ): Promise<{ success: boolean; conversationId?: string; error?: string }> => {
    try {
      // Check contact limits
      const contactsUsed = await getContactsUsedThisMonth();
      const limit = getContactLimit();
      
      if (contactsUsed >= limit) {
        return { 
          success: false, 
          error: `You've reached your monthly contact limit (${contactsUsed}/${limit}). Upgrade to contact more buyers.`
        };
      }

      // Check if already contacted this buyer
      const alreadyContacted = await hasContactedBuyer(buyerId);
      
      // Check buyer contact limit (max 4 users)
      if (!alreadyContacted) {
        const buyerContacts = await getBuyerContactCount(buyerId);
        if (buyerContacts >= 4) {
          return { 
            success: false, 
            error: 'This buyer has already been contacted by the maximum number of users.'
          };
        }
      }

      // Check for existing conversation
      const { data: existingConv } = await supabase
        .from('conversations')
        .select('id')
        .eq('buyer_id', buyerId)
        .single();

      let conversationId: string;

      if (existingConv) {
        conversationId = existingConv.id;
      } else {
        // Create new conversation
        const { data: session } = await supabase.auth.getSession();
        const userId = session?.session?.user?.id;
        
        if (!userId) {
          return { success: false, error: 'You must be logged in to send messages.' };
        }

        const { data: newConv, error: convError } = await supabase
          .from('conversations')
          .insert({
            buyer_id: buyerId,
            user_id: userId,
            status: 'awaiting_response'
          })
          .select()
          .single();

        if (convError) throw convError;
        conversationId = newConv.id;

        // Track the contact if new
        if (!alreadyContacted) {
          await supabase.from('user_contacts').insert({ user_id: userId, buyer_id: buyerId });
          await supabase.from('buyer_contacts').insert({ buyer_id: buyerId, user_id: userId });
        }
      }

      // Send the message
      const { data: session } = await supabase.auth.getSession();
      const { error: msgError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_type: 'user',
          sender_id: session?.session?.user?.id || '',
          content: message,
          sent_via: 'platform',
          delivered: true,
          delivered_at: new Date().toISOString()
        });

      if (msgError) throw msgError;

      // Trigger notification edge function (fire and forget)
      supabase.functions.invoke('send-message-notification', {
        body: { conversationId, buyerId, message }
      }).catch(console.error);

      return { success: true, conversationId };
    } catch (error) {
      console.error('Error starting conversation:', error);
      return { success: false, error: 'Failed to send message. Please try again.' };
    }
  }, [getContactLimit, getContactsUsedThisMonth, hasContactedBuyer, getBuyerContactCount]);

  const sendMessage = useCallback(async (
    conversationId: string,
    content: string
  ): Promise<{ success: boolean; message?: Message; error?: string }> => {
    try {
      const { data: session } = await supabase.auth.getSession();
      const userId = session?.session?.user?.id;
      
      if (!userId) {
        return { success: false, error: 'You must be logged in to send messages.' };
      }

      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_type: 'user',
          sender_id: userId,
          content,
          sent_via: 'platform',
          delivered: true,
          delivered_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // Get buyer_id for notification
      const { data: conv } = await supabase
        .from('conversations')
        .select('buyer_id')
        .eq('id', conversationId)
        .single();

      if (conv) {
        supabase.functions.invoke('send-message-notification', {
          body: { conversationId, buyerId: conv.buyer_id, message: content }
        }).catch(console.error);
      }

      return { success: true, message: data as Message };
    } catch (error) {
      console.error('Error sending message:', error);
      return { success: false, error: 'Failed to send message. Please try again.' };
    }
  }, []);

  const markConversationRead = useCallback(async (conversationId: string) => {
    try {
      await supabase
        .from('conversations')
        .update({ unread_count: 0 })
        .eq('id', conversationId);

      await supabase
        .from('messages')
        .update({ read: true, read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .eq('sender_type', 'buyer')
        .eq('read', false);

      setConversations(prev => 
        prev.map(c => c.id === conversationId ? { ...c, unread_count: 0 } : c)
      );
      setUnreadCount(prev => Math.max(0, prev - (conversations.find(c => c.id === conversationId)?.unread_count || 0)));
    } catch (error) {
      console.error('Error marking conversation read:', error);
    }
  }, [conversations]);

  const closeConversation = useCallback(async (conversationId: string) => {
    try {
      await supabase
        .from('conversations')
        .update({ status: 'closed' })
        .eq('id', conversationId);

      setConversations(prev =>
        prev.map(c => c.id === conversationId ? { ...c, status: 'closed' } : c)
      );
      toast.success('Conversation closed');
    } catch (error) {
      console.error('Error closing conversation:', error);
      toast.error('Failed to close conversation');
    }
  }, []);

  // Real-time subscriptions
  useEffect(() => {
    fetchConversations();

    const conversationsChannel = supabase
      .channel('conversations-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'conversations' },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(conversationsChannel);
    };
  }, [fetchConversations]);

  return {
    conversations,
    loading,
    unreadCount,
    fetchConversations,
    fetchMessages,
    startConversation,
    sendMessage,
    markConversationRead,
    closeConversation,
    getContactsUsedThisMonth,
    getContactLimit,
    getBuyerContactCount,
    hasContactedBuyer
  };
};
