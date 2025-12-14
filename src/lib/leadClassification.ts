import { Lead, LeadClassification, LEAD_CLASSIFICATIONS } from "./types";

/**
 * Calculate lead classification based on dual scoring (Quality + Intent)
 * 
 * Classification Matrix:
 * - 🔥 Hot: Intent >= 80 AND Quality >= 80
 * - ⭐ Star: Quality >= 80 AND Intent >= 60
 * - ⚡ Lightning: Intent >= 80 AND Quality >= 50
 * - ✓ Verified: Intent >= 60 AND Quality >= 60
 * - 💤 Dormant: Intent < 50 AND Quality >= 50 (good profile, no engagement)
 * - ⚠️ Warning: Quality < 50 AND Intent >= 60 (engaged but poor match)
 * - ❌ Cold: Intent < 50 AND Quality < 50
 */
export const classifyLead = (intentScore: number, qualityScore: number): LeadClassification => {
  // Hot: Both scores high
  if (intentScore >= 80 && qualityScore >= 80) {
    return "hot";
  }
  
  // Star: High quality, decent intent
  if (qualityScore >= 80 && intentScore >= 60) {
    return "star";
  }
  
  // Lightning: High intent, moderate quality
  if (intentScore >= 80 && qualityScore >= 50) {
    return "lightning";
  }
  
  // Verified: Both scores moderate
  if (intentScore >= 60 && qualityScore >= 60) {
    return "verified";
  }
  
  // Warning: Engaged but poor match
  if (intentScore >= 60 && qualityScore < 50) {
    return "warning";
  }
  
  // Dormant: Good profile, low engagement
  if (intentScore < 50 && qualityScore >= 50) {
    return "dormant";
  }
  
  // Cold: Both low
  return "cold";
};

/**
 * Get classification config for display
 */
export const getClassificationConfig = (classification: LeadClassification) => {
  return LEAD_CLASSIFICATIONS.find(c => c.value === classification) || LEAD_CLASSIFICATIONS[6];
};

/**
 * Get combined score for sorting
 */
export const getCombinedScore = (lead: Lead): number => {
  return (lead.intentScore + lead.qualityScore) / 2;
};

/**
 * Get priority order for lead classification (lower = higher priority)
 */
export const getClassificationPriority = (classification: LeadClassification): number => {
  const priorities: Record<LeadClassification, number> = {
    hot: 1,
    star: 2,
    lightning: 3,
    verified: 4,
    warning: 5,
    dormant: 6,
    cold: 7,
  };
  return priorities[classification];
};

/**
 * Sort leads by classification priority
 */
export const sortLeadsByPriority = (leads: Lead[]): Lead[] => {
  return [...leads].sort((a, b) => {
    const classA = a.classification || classifyLead(a.intentScore, a.qualityScore);
    const classB = b.classification || classifyLead(b.intentScore, b.qualityScore);
    return getClassificationPriority(classA) - getClassificationPriority(classB);
  });
};
