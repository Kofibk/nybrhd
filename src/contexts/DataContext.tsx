import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { developerCampaigns, developerLeads } from '@/lib/developerDemoData';

interface DataInsights {
  recommendations: string[];
  whatsWorking: string[];
  summary: string;
}

type UserType = 'developer' | 'agent' | 'broker' | 'admin';

interface UserData {
  campaignData: any[];
  campaignFileName: string;
  campaignInsights: DataInsights | null;
  leadData: any[];
  leadFileName: string;
  leadInsights: DataInsights | null;
}

interface UploadedDataContextType {
  // Per-user type data accessors
  getCampaignData: (userType: UserType) => any[];
  setCampaignData: (userType: UserType, data: any[]) => void;
  getCampaignFileName: (userType: UserType) => string;
  setCampaignFileName: (userType: UserType, name: string) => void;
  getCampaignInsights: (userType: UserType) => DataInsights | null;
  setCampaignInsights: (userType: UserType, insights: DataInsights | null) => void;
  
  getLeadData: (userType: UserType) => any[];
  setLeadData: (userType: UserType, data: any[]) => void;
  getLeadFileName: (userType: UserType) => string;
  setLeadFileName: (userType: UserType, name: string) => void;
  getLeadInsights: (userType: UserType) => DataInsights | null;
  setLeadInsights: (userType: UserType, insights: DataInsights | null) => void;
  
  clearCampaignData: (userType: UserType) => void;
  clearLeadData: (userType: UserType) => void;
}

const getStorageKey = (userType: UserType, dataType: string) => 
  `naybourhood_${userType}_${dataType}`;

const loadFromStorage = <T,>(key: string, fallback: T): T => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
};

const saveToStorage = (key: string, value: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('Failed to save to localStorage:', e);
  }
};

const DataContext = createContext<UploadedDataContextType | undefined>(undefined);

// Clear old shared localStorage keys (one-time migration)
const clearOldSharedKeys = () => {
  const oldKeys = [
    'naybourhood_campaign_data',
    'naybourhood_campaign_filename', 
    'naybourhood_campaign_insights',
    'naybourhood_lead_data',
    'naybourhood_lead_filename',
    'naybourhood_lead_insights',
  ];
  
  const migrationKey = 'naybourhood_data_migration_v2';
  if (!localStorage.getItem(migrationKey)) {
    oldKeys.forEach(key => localStorage.removeItem(key));
    localStorage.setItem(migrationKey, 'true');
    console.log('Cleared old shared localStorage keys');
  }
};

const defaultUserData: UserData = {
  campaignData: [],
  campaignFileName: '',
  campaignInsights: null,
  leadData: [],
  leadFileName: '',
  leadInsights: null,
};

export function DataProvider({ children }: { children: ReactNode }) {
  // Run migration on mount
  clearOldSharedKeys();
  const [dataByUser, setDataByUser] = useState<Record<UserType, UserData>>(() => {
    const userTypes: UserType[] = ['developer', 'agent', 'broker', 'admin'];
    const initial: Record<string, UserData> = {};
    
    userTypes.forEach(userType => {
      // Check if developer has stored data, otherwise use demo data
      const storedCampaignData = loadFromStorage(getStorageKey(userType, 'campaign_data'), []);
      const storedLeadData = loadFromStorage(getStorageKey(userType, 'lead_data'), []);
      
      // Use demo data for developer if no data is stored
      const useDemoData = userType === 'developer' && storedCampaignData.length === 0 && storedLeadData.length === 0;
      
      initial[userType] = {
        campaignData: useDemoData ? developerCampaigns : storedCampaignData,
        campaignFileName: useDemoData ? 'Horizon Homes Demo Data' : loadFromStorage(getStorageKey(userType, 'campaign_filename'), ''),
        campaignInsights: loadFromStorage(getStorageKey(userType, 'campaign_insights'), null),
        leadData: useDemoData ? developerLeads : storedLeadData,
        leadFileName: useDemoData ? 'Horizon Homes Demo Leads' : loadFromStorage(getStorageKey(userType, 'lead_filename'), ''),
        leadInsights: loadFromStorage(getStorageKey(userType, 'lead_insights'), null),
      };
    });
    
    return initial as Record<UserType, UserData>;
  });

  const updateUserData = useCallback((userType: UserType, field: keyof UserData, value: any) => {
    setDataByUser(prev => ({
      ...prev,
      [userType]: {
        ...prev[userType],
        [field]: value,
      },
    }));
    
    const storageKeyMap: Record<keyof UserData, string> = {
      campaignData: 'campaign_data',
      campaignFileName: 'campaign_filename',
      campaignInsights: 'campaign_insights',
      leadData: 'lead_data',
      leadFileName: 'lead_filename',
      leadInsights: 'lead_insights',
    };
    
    saveToStorage(getStorageKey(userType, storageKeyMap[field]), value);
  }, []);

  // Campaign data accessors
  const getCampaignData = useCallback((userType: UserType) => 
    dataByUser[userType]?.campaignData || [], [dataByUser]);
  
  const setCampaignData = useCallback((userType: UserType, data: any[]) => 
    updateUserData(userType, 'campaignData', data), [updateUserData]);
  
  const getCampaignFileName = useCallback((userType: UserType) => 
    dataByUser[userType]?.campaignFileName || '', [dataByUser]);
  
  const setCampaignFileName = useCallback((userType: UserType, name: string) => 
    updateUserData(userType, 'campaignFileName', name), [updateUserData]);
  
  const getCampaignInsights = useCallback((userType: UserType) => 
    dataByUser[userType]?.campaignInsights || null, [dataByUser]);
  
  const setCampaignInsights = useCallback((userType: UserType, insights: DataInsights | null) => 
    updateUserData(userType, 'campaignInsights', insights), [updateUserData]);

  // Lead data accessors
  const getLeadData = useCallback((userType: UserType) => 
    dataByUser[userType]?.leadData || [], [dataByUser]);
  
  const setLeadData = useCallback((userType: UserType, data: any[]) => 
    updateUserData(userType, 'leadData', data), [updateUserData]);
  
  const getLeadFileName = useCallback((userType: UserType) => 
    dataByUser[userType]?.leadFileName || '', [dataByUser]);
  
  const setLeadFileName = useCallback((userType: UserType, name: string) => 
    updateUserData(userType, 'leadFileName', name), [updateUserData]);
  
  const getLeadInsights = useCallback((userType: UserType) => 
    dataByUser[userType]?.leadInsights || null, [dataByUser]);
  
  const setLeadInsights = useCallback((userType: UserType, insights: DataInsights | null) => 
    updateUserData(userType, 'leadInsights', insights), [updateUserData]);

  // Clear functions
  const clearCampaignData = useCallback((userType: UserType) => {
    setCampaignData(userType, []);
    setCampaignFileName(userType, '');
    setCampaignInsights(userType, null);
  }, [setCampaignData, setCampaignFileName, setCampaignInsights]);

  const clearLeadData = useCallback((userType: UserType) => {
    setLeadData(userType, []);
    setLeadFileName(userType, '');
    setLeadInsights(userType, null);
  }, [setLeadData, setLeadFileName, setLeadInsights]);

  return (
    <DataContext.Provider
      value={{
        getCampaignData,
        setCampaignData,
        getCampaignFileName,
        setCampaignFileName,
        getCampaignInsights,
        setCampaignInsights,
        getLeadData,
        setLeadData,
        getLeadFileName,
        setLeadFileName,
        getLeadInsights,
        setLeadInsights,
        clearCampaignData,
        clearLeadData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useUploadedData(userType: UserType = 'admin') {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useUploadedData must be used within a DataProvider');
  }
  
  // Return a simplified interface for the specific user type
  return {
    campaignData: context.getCampaignData(userType),
    setCampaignData: (data: any[]) => context.setCampaignData(userType, data),
    campaignFileName: context.getCampaignFileName(userType),
    setCampaignFileName: (name: string) => context.setCampaignFileName(userType, name),
    campaignInsights: context.getCampaignInsights(userType),
    setCampaignInsights: (insights: DataInsights | null) => context.setCampaignInsights(userType, insights),
    leadData: context.getLeadData(userType),
    setLeadData: (data: any[]) => context.setLeadData(userType, data),
    leadFileName: context.getLeadFileName(userType),
    setLeadFileName: (name: string) => context.setLeadFileName(userType, name),
    leadInsights: context.getLeadInsights(userType),
    setLeadInsights: (insights: DataInsights | null) => context.setLeadInsights(userType, insights),
    clearCampaignData: () => context.clearCampaignData(userType),
    clearLeadData: () => context.clearLeadData(userType),
  };
}
