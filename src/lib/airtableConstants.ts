// Centralized Airtable table name constants
// Use these constants throughout the codebase to prevent table name mismatches

export const AIRTABLE_TABLES = {
  // Core entities
  USERS: 'Users',
  COMPANIES: 'Companies',
  USER_ROLES: 'User_Roles',
  
  // Properties & Developments
  DEVELOPMENTS: 'Developments',
  
  // Campaigns & Marketing
  CAMPAIGNS: 'Campaigns',
  CAMPAIGN_DATA: 'Previous Campaign Data',
  CREATIVE_ASSETS: 'Creative_Assets',
  AD_COPIES: 'Ad_Copies',
  CAMPAIGN_METRICS: 'Campaign_Metrics',
  
  // Buyers (formerly called Leads in some places - they are the same table)
  BUYERS: 'Buyers',
  
  // Buyer-related data
  LEAD_INTERACTIONS: 'Lead_Interactions',
  LEAD_SOURCES: 'Lead_Sources',
  
  // Automation
  AUTOMATION_SEQUENCES: 'Automation_Sequences',
  AUTOMATION_MESSAGES: 'Automation_Messages',
  
  // Billing & Admin
  SUBSCRIPTIONS: 'Subscriptions',
  INVOICES: 'Invoices',
  SETTINGS: 'Settings',
  AUDIT_LOGS: 'Audit_Logs',
} as const;

export type AirtableTableName = typeof AIRTABLE_TABLES[keyof typeof AIRTABLE_TABLES];

// Helper to validate table names at runtime
export function isValidAirtableTable(tableName: string): tableName is AirtableTableName {
  return Object.values(AIRTABLE_TABLES).includes(tableName as AirtableTableName);
}
