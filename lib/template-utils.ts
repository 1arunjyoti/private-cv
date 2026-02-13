/**
 * Shared utility functions for PDF templates
 * Consolidates common helper functions used across multiple templates
 */

/**
 * Format a date string for display in resume
 * @param dateStr - ISO date string or empty string
 * @returns Formatted date (e.g., "Jan 2024") or "Present" if empty
 */
export function formatDate(dateStr: string): string {
  // Handle empty string
  if (dateStr === "") return "";
  
  // Handle "Present" or "present"
  if (dateStr.toLowerCase() === "present") return "Present";
  
  // Handle year-only format (e.g., "2023")
  if (/^\d{4}$/.test(dateStr)) return dateStr;
  
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

/**
 * Format a date range string for display in resume sections.
 * @param startDateStr - Start date string
 * @param endDateStr - End date string
 * @returns Formatted range (e.g., "Jan 2024 – Present"), empty string if both are missing
 */
export function formatDateRange(startDateStr: string, endDateStr: string): string {
  const startDate = formatDate(startDateStr);
  const endDate = formatDate(endDateStr);
  if (!startDate && !endDate) return "";
  return `${startDate}${startDate && endDate ? " – " : ""}${endDate}`;
}

/**
 * Map of profile image sizes (in points)
 * Used consistently across all templates
 */
export const PROFILE_IMAGE_SIZES = {
  S: 50,
  M: 80,
  L: 120,
} as const;

/**
 * Convert a skill level string to a numeric score (1-5)
 * @param level - Skill level string (e.g., "Beginner", "Expert")
 * @returns Numeric score from 1-5, defaulting to 0 if unknown
 */
export function getLevelScore(level: string): number {
  if (!level) return 0;
  const l = level.toLowerCase();
  if (["beginner", "novice", "basic"].some((k) => l.includes(k))) return 1;
  if (["intermediate", "competent"].some((k) => l.includes(k))) return 2;
  if (["advanced"].some((k) => l.includes(k))) return 3;
  if (["expert", "master", "proficient"].some((k) => l.includes(k))) return 4;
  return 0; // Default to 0 for unknown levels
}

/**
 * Convert millimeters to points (approximate)
 * Used for PDF layout measurements
 * @param mm - Measurement in millimeters
 * @returns Measurement in points
 */
export function mmToPt(mm: number): number {
  return mm * 2.835;
}

/**
 * Format section title based on capitalization setting
 * @param title - The section title string
 * @param capitalization - "uppercase" | "capitalize" | "lowercase" | "titlecase"
 * @returns Formatted title string
 */
export function formatSectionTitle(title: string, capitalization: string): string {
  if (capitalization === "uppercase") return title.toUpperCase();
  if (capitalization === "lowercase") return title.toLowerCase();
  if (capitalization === "titlecase") {
    // Title case: capitalize first letter of each word
    return title.toLowerCase().replace(/(^|\s)\S/g, (L) => L.toUpperCase());
  }
  if (capitalization === "capitalize") {
    // Capitalize: only first letter of entire string
    return title.charAt(0).toUpperCase() + title.slice(1).toLowerCase();
  }
  return title;
}
