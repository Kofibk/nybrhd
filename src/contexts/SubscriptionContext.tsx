import React, { createContext, useContext, useState, ReactNode } from 'react';
import { 
  SubscriptionTier, 
  SubscriptionTierConfig, 
  getTierConfig, 
  canAccessFeature,
  getUpgradePath 
} from '@/lib/subscriptionTiers';

interface SubscriptionContextType {
  currentTier: SubscriptionTier;
  tierConfig: SubscriptionTierConfig;
  setTier: (tier: SubscriptionTier) => void;
  canAccess: (requiredTier: SubscriptionTier) => boolean;
  upgradePath: SubscriptionTier | null;
  contactsUsed: number;
  contactsRemaining: number | 'unlimited';
  setContactsUsed: (count: number) => void;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

interface SubscriptionProviderProps {
  children: ReactNode;
  initialTier?: SubscriptionTier;
}

export const SubscriptionProvider = ({ 
  children, 
  initialTier = 'growth' 
}: SubscriptionProviderProps) => {
  const [currentTier, setCurrentTier] = useState<SubscriptionTier>(initialTier);
  const [contactsUsed, setContactsUsed] = useState(0);

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
