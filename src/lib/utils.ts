import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number to compact notation (e.g., 500000 → "£500K", 1500000 → "£1.5M")
 */
export function formatCompactCurrency(value: number): string {
  if (value >= 1000000) {
    const millions = value / 1000000;
    return `£${millions % 1 === 0 ? millions.toFixed(0) : millions.toFixed(1)}M`;
  }
  if (value >= 1000) {
    const thousands = value / 1000;
    return `£${thousands % 1 === 0 ? thousands.toFixed(0) : thousands.toFixed(0)}K`;
  }
  return `£${value}`;
}

/**
 * Format budget string to compact notation (e.g., "£500,000 - £1,000,000" → "£500K - £1M")
 */
export function formatBudget(budget: string | undefined | null): string {
  if (!budget) return "Not specified";
  
  // Extract all numbers from the string
  const numbers = budget.match(/[\d,]+/g);
  if (!numbers || numbers.length === 0) return budget;
  
  // Parse numbers (remove commas)
  const parsedNumbers = numbers.map(n => parseInt(n.replace(/,/g, ""), 10));
  
  // Format each number
  const formatted = parsedNumbers.map(formatCompactCurrency);
  
  // If it's a range (2 numbers), return as range
  if (formatted.length >= 2) {
    return `${formatted[0]} - ${formatted[1]}`;
  }
  
  // Single value
  return formatted[0];
}
