import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { 
  SubscriptionTier, 
  SubscriptionTierConfig, 
  getTierConfig, 
  canAccessFeature,
  getUpgradePath 
} from '@/lib/subscriptionTiers';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SubscriptionContextType {
  currentTier: SubscriptionTier;
  tierConfig: SubscriptionTierConfig;
  setTier: (tier: SubscriptionTier) => void;
  canAccess: (requiredTier: SubscriptionTier) => boolean;
  upgradePath: SubscriptionTier | null;
  contactsUsed: number;
  contactsRemaining: number | 'unlimited';
  setContactsUsed: (count: number) => void;
  isLoading: boolean;
  subscriptionStatus: string | null;
  subscriptionEnd: string | null;
  refreshSubscription: () => Promise<void>;
  initiateCheckout: (planType: SubscriptionTier) => Promise<void>;
  openCustomerPortal: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

interface SubscriptionProviderProps {
  children: ReactNode;
  initialTier?: SubscriptionTier;
}

// Map database plan to our tier system
const mapPlanToTier = (plan: string | null): SubscriptionTier => {
  switch (plan) {
    case 'starter':
      return 'access';
    case 'growth':
      return 'growth';
    case 'enterprise':
      return 'enterprise';
    default:
      return 'access'; // Default to access tier
  }
};

export const SubscriptionProvider = ({ 
  children, 
  initialTier = 'growth' 
}: SubscriptionProviderProps) => {
  const { user, profile, isAuthenticated, session } = useAuth();
  const [currentTier, setCurrentTier] = useState<SubscriptionTier>(initialTier);
  const [contactsUsed, setContactsUsed] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);

  const fetchSubscription = useCallback(async () => {
    if (!profile?.company_id) {
      setIsLoading(false);
      return;
    }

    try {
      // Fetch subscription from database
      const { data: subscription, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('company_id', profile.company_id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching subscription:', error);
      }

      if (subscription) {
        setCurrentTier(mapPlanToTier(subscription.plan));
        setSubscriptionStatus(subscription.status);
        setSubscriptionEnd(subscription.billing_cycle_end);
      }

      // Fetch contacts used this billing cycle from buyer_contacts table
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { count } = await supabase
        .from('buyer_contacts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id)
        .gte('contacted_at', startOfMonth.toISOString());

      setContactsUsed(count || 0);
    } catch (error) {
      console.error('Error fetching subscription data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [profile?.company_id, user?.id]);

  const refreshSubscription = async () => {
    setIsLoading(true);
    await fetchSubscription();
  };

  useEffect(() => {
    if (isAuthenticated && profile) {
      fetchSubscription();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, profile, fetchSubscription]);

  // Subscribe to realtime changes on subscriptions table
  useEffect(() => {
    if (!profile?.company_id) return;

    const channel = supabase
      .channel('subscription-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscriptions',
          filter: `company_id=eq.${profile.company_id}`,
        },
        () => {
          fetchSubscription();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.company_id, fetchSubscription]);

  const initiateCheckout = async (planType: SubscriptionTier) => {
    if (!session) {
      throw new Error('You must be logged in to upgrade');
    }

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          planType,
          companyId: profile?.company_id,
        },
      });

      if (error) {
        throw error;
      }

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  };

  const openCustomerPortal = async () => {
    if (!session) {
      throw new Error('You must be logged in to manage your subscription');
    }

    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');

      if (error) {
        throw error;
      }

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      throw error;
    }
  };

  const tierConfig = getTierConfig(currentTier);
  const upgradePath = getUpgradePath(currentTier);

  const contactsRemaining = tierConfig.monthlyContacts === 'unlimited' 
    ? 'unlimited' 
    : Math.max(0, tierConfig.monthlyContacts - contactsUsed);

  const value: SubscriptionContextType = {
    currentTier,
    tierConfig,
    setTier: setCurrentTier,
    canAccess: (requiredTier: SubscriptionTier) => canAccessFeature(currentTier, requiredTier),
    upgradePath,
    contactsUsed,
    contactsRemaining,
    setContactsUsed,
    isLoading,
    subscriptionStatus,
    subscriptionEnd,
    refreshSubscription,
    initiateCheckout,
    openCustomerPortal,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = (): SubscriptionContextType => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};
