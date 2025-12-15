import React, { createContext, useContext, useState, ReactNode } from 'react';

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

const DataContext = createContext<UploadedDataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [campaignData, setCampaignData] = useState<any[]>([]);
  const [campaignFileName, setCampaignFileName] = useState<string>('');
  const [campaignInsights, setCampaignInsights] = useState<DataInsights | null>(null);

  const [leadData, setLeadData] = useState<any[]>([]);
  const [leadFileName, setLeadFileName] = useState<string>('');
  const [leadInsights, setLeadInsights] = useState<DataInsights | null>(null);

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
