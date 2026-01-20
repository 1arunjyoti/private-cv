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
  if (!dateStr) return "Present";
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
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
 * @returns Numeric score from 1-5, defaulting to 3 if unknown
 */
export function getLevelScore(level: string): number {
  const l = (level || "").toLowerCase();
  if (["beginner", "novice", "basic"].some((k) => l.includes(k))) return 1;
  if (["intermediate", "competent"].some((k) => l.includes(k))) return 3;
  if (["advanced", "expert", "master", "proficient"].some((k) => l.includes(k)))
    return 5;
  return 3; // Default to intermediate
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
