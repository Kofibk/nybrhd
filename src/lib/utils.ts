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

  const raw = budget.trim();
  const hasPlus = /\+\s*$/.test(raw);

  // Normalise separators and strip currency symbols/commas for parsing.
  const normalised = raw
    .replace(/[£$,]/g, "")
    .replace(/–|—/g, "-")
    .replace(/\s+/g, " ")
    .toLowerCase();

  const globalMillion = /\b(million|mn)\b/.test(normalised) || /\b\d+(?:\.\d+)?\s*m\b/.test(normalised);
  const globalThousand = /\b(thousand)\b/.test(normalised) || /\b\d+(?:\.\d+)?\s*k\b/.test(normalised);

  // Extract all numeric tokens with optional unit suffix.
  const matches = Array.from(
    normalised.matchAll(/(\d+(?:\.\d+)?)(?:\s*)(m|million|mn|k|thousand)?/g)
  );

  if (matches.length === 0) return budget;

  const values = matches
    .map((m) => {
      const num = Number.parseFloat(m[1]);
      const unit = m[2];

      if (!Number.isFinite(num)) return null;

      if (unit === "m" || unit === "mn" || unit === "million") return num * 1_000_000;
      if (unit === "k" || unit === "thousand") return num * 1_000;

      // Handle formats like "£1 - £2 million" where the unit is global, not per-number.
      if (globalMillion && num < 1000) return num * 1_000_000;
      if (globalThousand && num < 1000) return num * 1_000;

      return num;
    })
    .filter((v): v is number => typeof v === "number");

  if (values.length === 0) return budget;

  const formatted = values.map((v) => formatCompactCurrency(Math.round(v)));

  if (formatted.length >= 2) return `${formatted[0]} - ${formatted[1]}`;
  return hasPlus ? `${formatted[0]}+` : formatted[0];
}
