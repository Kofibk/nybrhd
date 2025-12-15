import React, { createContext, useContext, useState, ReactNode } from 'react';

// Development type for Property Developers
export interface Development {
  id: string;
  developmentName: string;
  developerName: string;
  country: string;
  city: string;
  area: string;
  propertyType: string;
  minPrice: number;
  maxPrice: number;
  currency: string;
  bedrooms: string[];
  totalUnits: number;
  availableUnits: number | null;
  amenities: string[];
  keyFeatures: string[];
  completionDate: string | null;
  summary: string;
  logoUrl?: string;
  heroImageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// Property type for Estate Agents
export interface Property {
  id: string;
  propertyName: string;
  propertyType: string;
  country: string;
  city: string;
  area: string;
  postcode: string | null;
  price: number;
  currency: string;
  priceType: 'sale' | 'rent';
  bedrooms: number;
  bathrooms: number;
  squareFootage: number | null;
  features: string[];
  description: string;
  status: string;
  heroImageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// Product type for Mortgage Brokers
export interface Product {
  id: string;
  productName: string;
  productType: string;
  lender: string;
  interestRate: string;
  ltv: string;
  termOptions: string[];
  minLoan: number;
  maxLoan: number;
  currency: string;
  eligibility: string[];
  features: string[];
  fees: string[];
  description: string;
  logoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface InventoryContextType {
  // Developments (for developers)
  developments: Development[];
  addDevelopment: (dev: Omit<Development, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateDevelopment: (id: string, dev: Partial<Development>) => void;
  deleteDevelopment: (id: string) => void;
  
  // Properties (for agents)
  properties: Property[];
  addProperty: (prop: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProperty: (id: string, prop: Partial<Property>) => void;
  deleteProperty: (id: string) => void;
  
  // Products (for brokers)
  products: Product[];
  addProduct: (prod: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProduct: (id: string, prod: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
}

const STORAGE_KEYS = {
  developments: 'naybourhood_developments',
  properties: 'naybourhood_properties',
  products: 'naybourhood_products',
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

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [developments, setDevelopments] = useState<Development[]>(() => 
    loadFromStorage(STORAGE_KEYS.developments, [])
  );
  const [properties, setProperties] = useState<Property[]>(() => 
    loadFromStorage(STORAGE_KEYS.properties, [])
  );
  const [products, setProducts] = useState<Product[]>(() => 
    loadFromStorage(STORAGE_KEYS.products, [])
  );

  // Development methods
  const addDevelopment = (dev: Omit<Development, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newDev: Development = {
      ...dev,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [...developments, newDev];
    setDevelopments(updated);
    saveToStorage(STORAGE_KEYS.developments, updated);
  };

  const updateDevelopment = (id: string, dev: Partial<Development>) => {
    const updated = developments.map(d => 
      d.id === id ? { ...d, ...dev, updatedAt: new Date().toISOString() } : d
    );
    setDevelopments(updated);
    saveToStorage(STORAGE_KEYS.developments, updated);
  };

  const deleteDevelopment = (id: string) => {
    const updated = developments.filter(d => d.id !== id);
    setDevelopments(updated);
    saveToStorage(STORAGE_KEYS.developments, updated);
  };

  // Property methods
  const addProperty = (prop: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProp: Property = {
      ...prop,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [...properties, newProp];
    setProperties(updated);
    saveToStorage(STORAGE_KEYS.properties, updated);
  };

  const updateProperty = (id: string, prop: Partial<Property>) => {
    const updated = properties.map(p => 
      p.id === id ? { ...p, ...prop, updatedAt: new Date().toISOString() } : p
    );
    setProperties(updated);
    saveToStorage(STORAGE_KEYS.properties, updated);
  };

  const deleteProperty = (id: string) => {
    const updated = properties.filter(p => p.id !== id);
    setProperties(updated);
    saveToStorage(STORAGE_KEYS.properties, updated);
  };

  // Product methods
  const addProduct = (prod: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProd: Product = {
      ...prod,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [...products, newProd];
    setProducts(updated);
    saveToStorage(STORAGE_KEYS.products, updated);
  };

  const updateProduct = (id: string, prod: Partial<Product>) => {
    const updated = products.map(p => 
      p.id === id ? { ...p, ...prod, updatedAt: new Date().toISOString() } : p
    );
    setProducts(updated);
    saveToStorage(STORAGE_KEYS.products, updated);
  };

  const deleteProduct = (id: string) => {
    const updated = products.filter(p => p.id !== id);
    setProducts(updated);
    saveToStorage(STORAGE_KEYS.products, updated);
  };

  return (
    <InventoryContext.Provider
      value={{
        developments,
        addDevelopment,
        updateDevelopment,
        deleteDevelopment,
        properties,
        addProperty,
        updateProperty,
        deleteProperty,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
}
