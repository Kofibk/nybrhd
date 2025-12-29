// Test accounts that bypass normal authentication flow for development/testing
export const TEST_EMAILS = [
  'kofi@naybourhood.ai',
] as const;

export const isTestEmail = (email: string): boolean => {
  return TEST_EMAILS.includes(email.toLowerCase().trim() as typeof TEST_EMAILS[number]);
};
