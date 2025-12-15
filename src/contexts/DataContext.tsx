import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface DataInsights {
  recommendations: string[];
  whatsWorking: string[];
  summary: string;
}

interface UploadedDataContextType {
  campaignData: any[];
  setCampaignData: (data: any[]) => void;
  campaignFileName: string;
  setCampaignFileName: (name: string) => void;
  campaignInsights: DataInsights | null;
  setCampaignInsights: (insights: DataInsights | null) => void;
  
  leadData: any[];
  setLeadData: (data: any[]) => void;
  leadFileName: string;
  setLeadFileName: (name: string) => void;
  leadInsights: DataInsights | null;
  setLeadInsights: (insights: DataInsights | null) => void;
  
  clearCampaignData: () => void;
  clearLeadData: () => void;
}

const STORAGE_KEYS = {
  campaignData: 'naybourhood_campaign_data',
  campaignFileName: 'naybourhood_campaign_filename',
  campaignInsights: 'naybourhood_campaign_insights',
  leadData: 'naybourhood_lead_data',
  leadFileName: 'naybourhood_lead_filename',
  leadInsights: 'naybourhood_lead_insights',
};

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

export function DataProvider({ children }: { children: ReactNode }) {
  const [campaignData, setCampaignDataState] = useState<any[]>(() => 
    loadFromStorage(STORAGE_KEYS.campaignData, [])
  );
  const [campaignFileName, setCampaignFileNameState] = useState<string>(() => 
    loadFromStorage(STORAGE_KEYS.campaignFileName, '')
  );
  const [campaignInsights, setCampaignInsightsState] = useState<DataInsights | null>(() => 
    loadFromStorage(STORAGE_KEYS.campaignInsights, null)
  );

  const [leadData, setLeadDataState] = useState<any[]>(() => 
    loadFromStorage(STORAGE_KEYS.leadData, [])
  );
  const [leadFileName, setLeadFileNameState] = useState<string>(() => 
    loadFromStorage(STORAGE_KEYS.leadFileName, '')
  );
  const [leadInsights, setLeadInsightsState] = useState<DataInsights | null>(() => 
    loadFromStorage(STORAGE_KEYS.leadInsights, null)
  );

  // Persist campaign data
  const setCampaignData = (data: any[]) => {
    setCampaignDataState(data);
    saveToStorage(STORAGE_KEYS.campaignData, data);
  };

  const setCampaignFileName = (name: string) => {
    setCampaignFileNameState(name);
    saveToStorage(STORAGE_KEYS.campaignFileName, name);
  };

  const setCampaignInsights = (insights: DataInsights | null) => {
    setCampaignInsightsState(insights);
    saveToStorage(STORAGE_KEYS.campaignInsights, insights);
  };

  // Persist lead data
  const setLeadData = (data: any[]) => {
    setLeadDataState(data);
    saveToStorage(STORAGE_KEYS.leadData, data);
  };

  const setLeadFileName = (name: string) => {
    setLeadFileNameState(name);
    saveToStorage(STORAGE_KEYS.leadFileName, name);
  };

  const setLeadInsights = (insights: DataInsights | null) => {
    setLeadInsightsState(insights);
    saveToStorage(STORAGE_KEYS.leadInsights, insights);
  };

  const clearCampaignData = () => {
    setCampaignData([]);
    setCampaignFileName('');
    setCampaignInsights(null);
  };

  const clearLeadData = () => {
    setLeadData([]);
    setLeadFileName('');
    setLeadInsights(null);
  };

  return (
    <DataContext.Provider
      value={{
        campaignData,
        setCampaignData,
        campaignFileName,
        setCampaignFileName,
        campaignInsights,
        setCampaignInsights,
        leadData,
        setLeadData,
        leadFileName,
        setLeadFileName,
        leadInsights,
        setLeadInsights,
        clearCampaignData,
        clearLeadData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useUploadedData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useUploadedData must be used within a DataProvider');
  }
  return context;
}
