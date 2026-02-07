/**
 * Resume format classification.
 *
 * Analyses raw text (post-preprocessing) and classifies the resume layout so
 * that downstream parsers can choose the best extraction strategy.
 */

import { SECTION_HEADINGS, CONTACT_PATTERNS } from './types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ResumeFormat =
  | 'chronological'   // Traditional: clear sections, date-ordered entries
  | 'functional'      // Skills-first / grouped by competency area
  | 'combination'     // Mix of skills summary + chronological work history
  | 'creative'        // Non-standard layout; headers may be missing/unusual
  | 'academic'        // Heavy on publications, research, teaching
  | 'unknown';

export interface FormatClassification {
  format: ResumeFormat;
  confidence: number;            // 0-100
  traits: FormatTraits;
}

export interface FormatTraits {
  /** How many recognisable section headings were found */
  sectionCount: number;
  /** Ratio of bullet-point lines to total content lines */
  bulletDensity: number;
  /** Whether dates appear prominently near the top */
  datesNearTop: boolean;
  /** Whether a skills section appears before work */
  skillsBeforeWork: boolean;
  /** Whether publication/research headings are present */
  hasAcademicSections: boolean;
  /** Average content-line length */
  avgLineLength: number;
  /** Number of detected date ranges in the whole text */
  dateRangeCount: number;
  /** Whether contact info was found in the header area */
  hasContactHeader: boolean;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function countMatchingLines(lines: string[], regex: RegExp): number {
  return lines.filter((l) => regex.test(l.trim())).length;
}

function findSectionPositions(lines: string[]): Map<string, number> {
  const positions = new Map<string, number>();
  const allHeadingPatterns: { re: RegExp; section: string }[] = [];

  for (const [sectionName, headings] of Object.entries(SECTION_HEADINGS)) {
    for (const heading of headings) {
      const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const re = new RegExp(`^\\s*${escaped}\\s*:?\\s*[-–—_]*\\s*$`, 'i');
      allHeadingPatterns.push({ re, section: sectionName });
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (!trimmed) continue;
    for (const { re, section } of allHeadingPatterns) {
      if (re.test(trimmed) && !positions.has(section)) {
        positions.set(section, i);
        break;
      }
    }
  }

  return positions;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Classify the format of a resume from its (preprocessed) plain-text.
 */
export function classifyResumeFormat(text: string): FormatClassification {
  const lines = text.split('\n');
  const contentLines = lines.map((l) => l.trim()).filter((l) => l.length > 0);

  if (contentLines.length === 0) {
    return {
      format: 'unknown',
      confidence: 0,
      traits: emptyTraits(),
    };
  }

  // ---- Compute traits ----

  const sectionPositions = findSectionPositions(lines);
  const sectionCount = sectionPositions.size;

  const bulletRe = /^[•\-\*\u2022\u2023\u25E6]\s/;
  const bulletLines = countMatchingLines(contentLines, bulletRe);
  const bulletDensity = bulletLines / contentLines.length;

  const dateRangeRe =
    /(?:(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+)?\d{4}\s*[-–—]\s*(?:(?:(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+)?\d{4}|present|current)/gi;
  const dateRangeCount = (text.match(dateRangeRe) || []).length;

  // Are dates in the first 30 % of lines?
  const topThreshold = Math.ceil(contentLines.length * 0.3);
  const earlyDateRe =
    /\d{4}\s*[-–—]\s*(?:\d{4}|present|current)/i;
  const datesNearTop = contentLines.slice(0, topThreshold).some((l) => earlyDateRe.test(l));

  // Skills before work?
  const skillsPos = sectionPositions.get('skills') ?? Infinity;
  const workPos = sectionPositions.get('work') ?? Infinity;
  const skillsBeforeWork = skillsPos < workPos && skillsPos !== Infinity;

  // Academic sections
  const academicSections = ['publications', 'awards', 'references'];
  const hasAcademicSections = academicSections.some((s) => sectionPositions.has(s));

  // Average line length
  const avgLineLength = contentLines.reduce((s, l) => s + l.length, 0) / contentLines.length;

  // Contact header
  const headerText = contentLines.slice(0, Math.min(8, contentLines.length)).join('\n');
  const hasContactHeader =
    CONTACT_PATTERNS.email.test(headerText) || CONTACT_PATTERNS.phone.test(headerText);
  // Reset global regex state
  CONTACT_PATTERNS.email.lastIndex = 0;
  CONTACT_PATTERNS.phone.lastIndex = 0;

  const traits: FormatTraits = {
    sectionCount,
    bulletDensity,
    datesNearTop,
    skillsBeforeWork,
    hasAcademicSections,
    avgLineLength,
    dateRangeCount,
    hasContactHeader,
  };

  // ---- Score each format ----

  const scores: Record<ResumeFormat, number> = {
    chronological: 0,
    functional: 0,
    combination: 0,
    creative: 0,
    academic: 0,
    unknown: 0,
  };

  // Chronological: clear sections, dates, work section exists early
  if (sectionCount >= 3) scores.chronological += 25;
  if (datesNearTop) scores.chronological += 15;
  if (dateRangeCount >= 2) scores.chronological += 20;
  if (bulletDensity >= 0.15) scores.chronological += 15;
  if (workPos < Infinity && !skillsBeforeWork) scores.chronological += 15;
  if (hasContactHeader) scores.chronological += 10;

  // Functional: skills-first, fewer date ranges
  if (skillsBeforeWork) scores.functional += 30;
  if (dateRangeCount <= 1) scores.functional += 15;
  if (sectionCount >= 2) scores.functional += 15;
  if (bulletDensity >= 0.2) scores.functional += 15;
  if (hasContactHeader) scores.functional += 10;

  // Combination: skills before work BUT also has date ranges
  if (skillsBeforeWork && dateRangeCount >= 2) scores.combination += 35;
  if (sectionCount >= 4) scores.combination += 20;
  if (bulletDensity >= 0.15) scores.combination += 15;
  if (hasContactHeader) scores.combination += 10;

  // Creative: few sections, low bullet density, unusual layout
  if (sectionCount <= 1) scores.creative += 30;
  if (bulletDensity < 0.08) scores.creative += 20;
  if (avgLineLength < 30) scores.creative += 15;
  if (!hasContactHeader) scores.creative += 10;

  // Academic: publication / awards sections present
  if (hasAcademicSections) scores.academic += 35;
  if (sectionPositions.has('publications')) scores.academic += 20;
  if (sectionCount >= 4) scores.academic += 15;
  if (dateRangeCount >= 3) scores.academic += 10;

  // Pick winner
  let best: ResumeFormat = 'unknown';
  let bestScore = 0;
  for (const [fmt, score] of Object.entries(scores) as [ResumeFormat, number][]) {
    if (score > bestScore) {
      bestScore = score;
      best = fmt;
    }
  }

  // Confidence is capped at 95 — we're never 100 % sure without AI
  const confidence = Math.min(95, bestScore);

  return { format: best, confidence, traits };
}

function emptyTraits(): FormatTraits {
  return {
    sectionCount: 0,
    bulletDensity: 0,
    datesNearTop: false,
    skillsBeforeWork: false,
    hasAcademicSections: false,
    avgLineLength: 0,
    dateRangeCount: 0,
    hasContactHeader: false,
  };
}
