import { v4 as uuidv4 } from 'uuid';
import type {
  WorkExperience,
  Education,
  Skill,
  Project,
  Certificate,
  Language,
} from '@/db';
import type {
  ParsedResumeData,
  DetectedSection,
} from './types';
import {
  SECTION_HEADINGS,
  CONTACT_PATTERNS,
} from './types';

// ===================================================================
// Levenshtein distance – used by the semantic scorer
// ===================================================================

function levenshtein(a: string, b: string): number {
  const la = a.length;
  const lb = b.length;
  if (la === 0) return lb;
  if (lb === 0) return la;

  const matrix: number[][] = [];
  for (let i = 0; i <= la; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= lb; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= la; i++) {
    for (let j = 1; j <= lb; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      );
    }
  }
  return matrix[la][lb];
}

// ===================================================================
// Semantic section-heading scoring
// ===================================================================

/** Flat list of section keywords grouped by section type */
const SECTION_KEYWORDS: Record<string, string[]> = {};
for (const [section, headings] of Object.entries(SECTION_HEADINGS)) {
  SECTION_KEYWORDS[section] = [];
  for (const h of headings) {
    // Individual words from the heading
    for (const word of h.split(/\s+/)) {
      if (word.length >= 3 && !SECTION_KEYWORDS[section].includes(word)) {
        SECTION_KEYWORDS[section].push(word);
      }
    }
    // The full heading itself (for exact / fuzzy match)
    if (!SECTION_KEYWORDS[section].includes(h)) {
      SECTION_KEYWORDS[section].push(h);
    }
  }
}

/**
 * Score how likely a given line of text is a section heading and, if so,
 * which section type it most likely represents.
 *
 * Returns `null` when the line is unlikely to be a heading.
 */
function scoreSectionHeading(
  line: string,
  lineIndex: number,
  allLines: string[],
): { section: string; score: number } | null {
  const trimmed = line.trim();
  if (!trimmed || trimmed.length > 60) return null;

  // ---- Formatting-based score ----
  let fmtScore = 0;

  const isAllCaps = /^[A-Z\s&/,]+$/.test(trimmed) && trimmed.length >= 3;
  if (isAllCaps) fmtScore += 0.25;

  if (trimmed.endsWith(':')) fmtScore += 0.15;

  // Preceded by a blank line
  if (lineIndex === 0 || allLines[lineIndex - 1].trim() === '') fmtScore += 0.15;

  // Followed by a blank line (less common but valid)
  if (lineIndex < allLines.length - 1 && allLines[lineIndex + 1].trim() === '') fmtScore += 0.05;

  // Short standalone line (not a bullet)
  if (trimmed.length < 40 && !/^[•\-\*\d]/.test(trimmed)) fmtScore += 0.1;

  // Looks like a bullet / description line → penalise heavily
  if (/^[•\-\*]\s/.test(trimmed)) return null;
  if (/^\d+[.)]\s/.test(trimmed)) return null;

  // ---- Content-based score: match against known headings ----
  const stripped = trimmed
    .replace(/:$/, '')
    .replace(/[-–—_]+$/, '')
    .trim()
    .toLowerCase()
    // Collapse multiple spaces inside the heading (e.g. "WORK  EXPERIENCE" → "work experience")
    .replace(/\s+/g, ' ');

  let bestSection = '';
  let bestContentScore = 0;

  for (const [section, keywords] of Object.entries(SECTION_KEYWORDS)) {
    // Exact match against any heading
    const headingsForSection = SECTION_HEADINGS[section as keyof typeof SECTION_HEADINGS] ?? [];
    for (const h of headingsForSection) {
      if (stripped === h.toLowerCase()) {
        return { section, score: Math.min(1, fmtScore + 0.6) };
      }
    }

    // Fuzzy match – allow up to 2 edit-distance on the full heading
    for (const h of headingsForSection) {
      const dist = levenshtein(stripped, h.toLowerCase());
      if (dist <= 2 && dist < h.length * 0.35) {
        const fuzzyScore = 0.45 - dist * 0.08;
        if (fuzzyScore > bestContentScore) {
          bestContentScore = fuzzyScore;
          bestSection = section;
        }
      }
    }

    // Keyword overlap
    const lineWords = stripped.split(/\s+/);
    let matchedKeywordWeight = 0;
    for (const word of lineWords) {
      for (const kw of keywords) {
        if (kw.length < 3) continue;
        if (word === kw.toLowerCase()) {
          matchedKeywordWeight += 0.3;
        } else if (levenshtein(word, kw.toLowerCase()) <= 1 && word.length >= 4) {
          matchedKeywordWeight += 0.15;
        }
      }
    }
    if (matchedKeywordWeight > bestContentScore) {
      bestContentScore = Math.min(0.55, matchedKeywordWeight);
      bestSection = section;
    }
  }

  if (!bestSection) return null;

  const totalScore = fmtScore + bestContentScore;
  if (totalScore < 0.35) return null; // Not confident enough

  return { section: bestSection, score: Math.min(1, totalScore) };
}

// ===================================================================
// detectSections – hybrid: exact pattern + semantic fallback
// ===================================================================

/**
 * Detects and extracts sections from resume text.
 *
 * Uses two passes:
 * 1. Exact regex matching against known SECTION_HEADINGS (existing approach)
 * 2. Semantic scoring fallback that catches headings the exact match misses
 *    (e.g. typos, unusual wording, ALL-CAPS with extra spaces)
 *
 * Results from both passes are merged; if both detect the same line the
 * exact match wins.
 */
export function detectSections(text: string): DetectedSection[] {
  const lines = text.split('\n');

  // ----- Pass 1: exact regex patterns (original logic) -----
  const exactHits = new Map<number, { name: string; confidence: number }>();

  const allHeadings: { pattern: RegExp; name: string }[] = [];
  for (const [sectionName, headings] of Object.entries(SECTION_HEADINGS)) {
    for (const heading of headings) {
      const escapedHeading = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const pattern = new RegExp(`^\\s*${escapedHeading}\\s*:?\\s*[-–—_]*\\s*$`, 'i');
      allHeadings.push({ pattern, name: sectionName });
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (!trimmed) continue;
    for (const { pattern, name } of allHeadings) {
      if (pattern.test(trimmed)) {
        exactHits.set(i, { name, confidence: 0.9 });
        break;
      }
    }
  }

  // ----- Pass 2: semantic scoring -----
  const semanticHits = new Map<number, { name: string; confidence: number }>();

  for (let i = 0; i < lines.length; i++) {
    if (exactHits.has(i)) continue; // Already detected
    const result = scoreSectionHeading(lines[i], i, lines);
    if (result && result.score >= 0.35) {
      semanticHits.set(i, { name: result.section, confidence: result.score });
    }
  }

  // ----- Merge (exact wins) -----
  const allHits = new Map<number, { name: string; confidence: number }>();
  for (const [idx, hit] of exactHits) allHits.set(idx, hit);
  for (const [idx, hit] of semanticHits) {
    if (!allHits.has(idx)) allHits.set(idx, hit);
  }

  // Sort by line index
  const sortedIndices = [...allHits.keys()].sort((a, b) => a - b);

  // ----- Build DetectedSection[] -----
  const sections: DetectedSection[] = [];

  for (let k = 0; k < sortedIndices.length; k++) {
    const startIdx = sortedIndices[k];
    const endIdx = k + 1 < sortedIndices.length ? sortedIndices[k + 1] - 1 : lines.length - 1;
    const hit = allHits.get(startIdx)!;
    const content = lines
      .slice(startIdx + 1, endIdx + 1)
      .join('\n')
      .trim();

    if (content) {
      sections.push({
        name: hit.name,
        startIndex: startIdx,
        endIndex: endIdx,
        content,
        confidence: hit.confidence,
      });
    }
  }

  return sections;
}

// ===================================================================
// Contact info
// ===================================================================

export function extractContactInfo(text: string): {
  email?: string;
  phone?: string;
  url?: string;
  linkedin?: string;
  github?: string;
} {
  const result: {
    email?: string;
    phone?: string;
    url?: string;
    linkedin?: string;
    github?: string;
  } = {};

  // Reset global regex state before each use
  CONTACT_PATTERNS.email.lastIndex = 0;
  const emailMatch = text.match(CONTACT_PATTERNS.email);
  if (emailMatch) result.email = emailMatch[0];

  CONTACT_PATTERNS.phone.lastIndex = 0;
  const phoneMatch = text.match(CONTACT_PATTERNS.phone);
  if (phoneMatch) result.phone = phoneMatch[0];

  CONTACT_PATTERNS.linkedin.lastIndex = 0;
  const linkedinMatch = text.match(CONTACT_PATTERNS.linkedin);
  if (linkedinMatch) result.linkedin = linkedinMatch[0];

  CONTACT_PATTERNS.github.lastIndex = 0;
  const githubMatch = text.match(CONTACT_PATTERNS.github);
  if (githubMatch) result.github = githubMatch[0];

  CONTACT_PATTERNS.url.lastIndex = 0;
  const urlMatches = text.match(CONTACT_PATTERNS.url);
  if (urlMatches) {
    for (const url of urlMatches) {
      if (!url.includes('linkedin.com') && !url.includes('github.com')) {
        result.url = url.startsWith('http') ? url : `https://${url}`;
        break;
      }
    }
  }

  return result;
}

// ===================================================================
// Name extraction
// ===================================================================

export function extractName(text: string): string | undefined {
  const lines = text.split('\n').map((l) => l.trim()).filter((l) => l);

  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i];

    // ---- NEW: Try to extract name from the START of long lines ----
    // Many PDFs have headers like "ALEX JOHNSON Senior Developer alex@email.com | phone | ..."
    // Extract just the first 2-5 capitalized words before any separator or lowercase content.
    if (line.length > 60 || line.includes('@')) {
      // Look for 2-5 consecutive capitalized words at the start
      const startWords = line.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,4}|[A-Z]+(?:\s+[A-Z]+){1,4})\b/);
      if (startWords) {
        const candidate = startWords[0];
        const words = candidate.split(/\s+/).filter((w) => w.length > 0);
        if (words.length >= 2 && words.length <= 5) {
          const hasRealWords = words.filter((w) => w.length >= 2 && /[a-zA-Z]/.test(w)).length >= 2;
          if (hasRealWords) {
            const normalizedName = words
              .map((word) => {
                if (/^[A-Z]+$/.test(word) && word.length > 2) {
                  return word.charAt(0) + word.slice(1).toLowerCase();
                }
                return word;
              })
              .join(' ');
            return normalizedName;
          }
        }
      }
    }

    // ---- Original logic for clean, short lines ----
    // Reset global regex state before testing
    CONTACT_PATTERNS.email.lastIndex = 0;
    CONTACT_PATTERNS.phone.lastIndex = 0;

    if (CONTACT_PATTERNS.email.test(line)) continue;
    // Reset again since .test advances lastIndex
    CONTACT_PATTERNS.email.lastIndex = 0;
    CONTACT_PATTERNS.phone.lastIndex = 0;
    if (CONTACT_PATTERNS.phone.test(line)) continue;
    CONTACT_PATTERNS.phone.lastIndex = 0;

    if (line.length > 60) continue;
    if (line.toLowerCase().includes('@')) continue;
    if (/\d{5}/.test(line)) continue;
    if (/,\s*[A-Z]{2}\s*\d{5}/.test(line)) continue;

    const words = line.split(/\s+/).filter((w) => w.length > 0);
    if (words.length >= 2 && words.length <= 5) {
      const isName = words.every(
        (word) =>
          /^[A-Z]/.test(word) ||
          /^[A-Z]+$/.test(word) ||
          word.length <= 2,
      );
      const hasRealWords = words.filter((w) => w.length >= 2 && /[a-zA-Z]/.test(w)).length >= 2;
      if (isName && hasRealWords) {
        const normalizedName = words
          .map((word) => {
            if (/^[A-Z]+$/.test(word) && word.length > 2) {
              return word.charAt(0) + word.slice(1).toLowerCase();
            }
            return word;
          })
          .join(' ');
        return normalizedName;
      }
    }
  }

  return undefined;
}

// ===================================================================
// Title extraction
// ===================================================================

export function extractTitle(text: string): string | undefined {
  const lines = text.split('\n').map((l) => l.trim()).filter((l) => l);

  for (let i = 1; i < Math.min(10, lines.length); i++) {
    const line = lines[i];

    // ---- NEW: Try to extract title from long header lines ----
    // Look for title keywords even in lines that contain email/phone
    if (line.length > 60 || line.includes('@')) {
      // Try to find title pattern before any contact info
      // Split by common separators (|, email, URL patterns)
      const beforeContact = line.split(/\s*\|\s*|https?:\/\/|[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i)[0];
      
      const titlePatterns = [
        /developer/i, /engineer/i, /designer/i, /manager/i,
        /analyst/i, /consultant/i, /specialist/i, /architect/i,
        /director/i, /lead/i, /senior/i, /junior/i, /associate/i,
        /coordinator/i, /administrator/i, /executive/i, /officer/i,
        /scientist/i, /researcher/i, /professor/i, /teacher/i,
        /accountant/i, /attorney/i, /lawyer/i, /nurse/i, /technician/i,
        /intern\b/i, /strategist/i, /planner/i, /editor/i, /writer/i,
        /marketing/i, /sales/i, /recruiter/i, /advisor/i,
      ];

      for (const pattern of titlePatterns) {
        if (pattern.test(beforeContact)) {
          // Extract just the title portion (words around the keyword)
          const words = beforeContact.split(/\s+/);
          // Find the keyword position
          const keywordIdx = words.findIndex(w => pattern.test(w));
          if (keywordIdx >= 0) {
            // Include 0-3 words before and 0-3 words after the keyword
            const start = Math.max(0, keywordIdx - 3);
            const end = Math.min(words.length, keywordIdx + 4);
            const titleWords = words.slice(start, end);
            const title = titleWords.join(' ').trim();
            if (title.length < 80 && title.length > 0) {
              return title;
            }
          }
        }
      }
    }

    // ---- Original logic for clean lines ----
    // Reset global regex state
    CONTACT_PATTERNS.email.lastIndex = 0;
    CONTACT_PATTERNS.phone.lastIndex = 0;

    if (CONTACT_PATTERNS.email.test(line)) continue;
    CONTACT_PATTERNS.email.lastIndex = 0;
    if (CONTACT_PATTERNS.phone.test(line)) continue;
    CONTACT_PATTERNS.phone.lastIndex = 0;
    if (line.includes('@')) continue;

    let isSectionHeading = false;
    for (const headings of Object.values(SECTION_HEADINGS)) {
      if (headings.some((h) => line.toLowerCase() === h.toLowerCase())) {
        isSectionHeading = true;
        break;
      }
    }
    if (isSectionHeading) continue;

    const titlePatterns = [
      /developer/i, /engineer/i, /designer/i, /manager/i,
      /analyst/i, /consultant/i, /specialist/i, /architect/i,
      /director/i, /lead/i, /senior/i, /junior/i, /associate/i,
      /coordinator/i, /administrator/i, /executive/i, /officer/i,
      /scientist/i, /researcher/i, /professor/i, /teacher/i,
      /accountant/i, /attorney/i, /lawyer/i, /nurse/i, /technician/i,
      /intern\b/i, /strategist/i, /planner/i, /editor/i, /writer/i,
      /marketing/i, /sales/i, /recruiter/i, /advisor/i,
    ];

    if (titlePatterns.some((p) => p.test(line)) && line.length < 80) {
      return line;
    }
  }

  return undefined;
}

// ===================================================================
// Location extraction
// ===================================================================

export function extractLocation(text: string): {
  city?: string;
  country?: string;
  region?: string;
} {
  const result: { city?: string; country?: string; region?: string } = {};

  const locationPattern =
    /([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)\s*,\s*([A-Z]{2}|[A-Z][a-z]+(?:\s[A-Z][a-z]+)?)/g;
  const match = text.match(locationPattern);

  if (match) {
    const parts = match[0].split(',').map((p) => p.trim());
    result.city = parts[0];
    if (parts[1]) {
      if (parts[1].length === 2) {
        result.region = parts[1];
      } else {
        result.country = parts[1];
      }
    }
  }

  return result;
}

// ===================================================================
// Enhanced entity extraction – company / position
// ===================================================================

/** Common company-name suffixes */
const COMPANY_SUFFIXES =
  /\b(?:Inc\.?|LLC|Ltd\.?|Corp\.?|Co\.?|GmbH|AG|SA|PLC|LP|LLP|Group|Holdings|Partners|Associates|International|Technologies|Solutions|Consulting|Services|Studio|Labs|Digital)\b/i;

/** Common position / title keywords */
const POSITION_KEYWORDS =
  /\b(?:developer|engineer|designer|manager|analyst|consultant|specialist|architect|director|lead|senior|junior|associate|coordinator|administrator|executive|officer|scientist|researcher|professor|teacher|accountant|attorney|lawyer|nurse|technician|intern|vp|cto|ceo|cfo|coo|head|chief|principal|staff|founder|co-founder|president|strategist|planner|editor|writer|recruiter|advisor|full-stack|fullstack|full stack|front-end|frontend|front end|back-end|backend|back end)\b/i;

/**
 * Smarter extraction of company name and position from a single line.
 *
 * Handles many common formats:
 *   "Position at Company"
 *   "Company | Position"
 *   "Position - Company"
 *   "Company, Position"
 *   "Position, Company Inc."
 *   "Company — Position — Location"
 */
export function extractCompanyAndPosition(
  line: string,
  nextLine?: string,
): { company?: string; position?: string } {
  const trimmed = line.trim();
  if (!trimmed) return {};

  // 1) "Position at Company"
  const atMatch = trimmed.match(/^(.+?)\s+at\s+(.+)$/i);
  if (atMatch) {
    return smartAssign(atMatch[1].trim(), atMatch[2].trim());
  }

  // 2) Split by common separators
  const separators = [' | ', ' - ', ' – ', ' — ', ', '];
  for (const sep of separators) {
    if (trimmed.includes(sep)) {
      const parts = trimmed.split(sep).map((p) => p.trim()).filter(Boolean);
      if (parts.length === 2) {
        return smartAssign(parts[0], parts[1]);
      }
      if (parts.length === 3) {
        // Third part is likely location – ignore it
        return smartAssign(parts[0], parts[1]);
      }
    }
  }

  // 2.5) NEW: Check if line contains BOTH company suffix AND position keyword
  //      with no separator (common after date-stripping leaves "TechCorp Inc. Senior Developer...")
  const companySuffixMatch = trimmed.match(COMPANY_SUFFIXES);
  const positionKeywordMatch = trimmed.match(POSITION_KEYWORDS);
  if (companySuffixMatch && positionKeywordMatch) {
    // Find where the company suffix ends
    const suffixIndex = trimmed.indexOf(companySuffixMatch[0]) + companySuffixMatch[0].length;
    // Find where the position keyword starts (look for capital letter followed by position keyword)
    const positionStart = trimmed.slice(suffixIndex).search(/\s+[A-Z]/);
    if (positionStart > 0) {
      const companyPart = trimmed.slice(0, suffixIndex + positionStart).trim();
      const positionPart = trimmed.slice(suffixIndex + positionStart).trim();
      // Only take position text up to lowercase descriptive content
      const positionWords = positionPart.split(/\s+/);
      const capitalizedWords = [];
      for (const word of positionWords) {
        if (/^[A-Z]/.test(word) || word === 'and' || word === 'of' || word === '&' || /^[a-z-]+$/.test(word)) {
          capitalizedWords.push(word);
        } else {
          break; // Stop at first lowercase word that's not a connector
        }
      }
      if (capitalizedWords.length > 0 && companyPart.length > 0) {
        return { company: companyPart, position: capitalizedWords.join(' ') };
      }
    }
  }

  // 3) No separator – whole line is probably just the position (or company)
  if (POSITION_KEYWORDS.test(trimmed)) {
    // Looks like a position – try using nextLine as company
    const result: { company?: string; position?: string } = { position: trimmed };
    if (nextLine) {
      const nextTrimmed = nextLine.trim();
      if (
        nextTrimmed &&
        !isDateLine(nextTrimmed) &&
        !isBulletLine(nextTrimmed) &&
        nextTrimmed.length < 80
      ) {
        result.company = nextTrimmed;
      }
    }
    return result;
  }

  if (COMPANY_SUFFIXES.test(trimmed)) {
    const result: { company?: string; position?: string } = { company: trimmed };
    if (nextLine) {
      const nextTrimmed = nextLine.trim();
      if (nextTrimmed && POSITION_KEYWORDS.test(nextTrimmed)) {
        result.position = nextTrimmed;
      }
    }
    return result;
  }

  // 4) Fallback – no separator, no keyword match on this line.
  //    Try the next line to disambiguate (common pattern: Company on line 1,
  //    Position on line 2, or vice-versa).
  if (nextLine) {
    const nextTrimmed = nextLine.trim();
    if (
      nextTrimmed &&
      !isDateLine(nextTrimmed) &&
      !isBulletLine(nextTrimmed) &&
      nextTrimmed.length < 80
    ) {
      if (POSITION_KEYWORDS.test(nextTrimmed)) {
        return { company: trimmed, position: nextTrimmed };
      }
      if (COMPANY_SUFFIXES.test(nextTrimmed)) {
        return { position: trimmed, company: nextTrimmed };
      }
      // Neither line has strong signals – use smartAssign for best guess
      return smartAssign(trimmed, nextTrimmed);
    }
  }

  // Truly alone – treat as position
  return { position: trimmed };
}

/** Given two candidate strings, decide which is the company and which is the position. */
function smartAssign(a: string, b: string): { company?: string; position?: string } {
  const aIsPosition = POSITION_KEYWORDS.test(a);
  const bIsPosition = POSITION_KEYWORDS.test(b);
  const aIsCompany = COMPANY_SUFFIXES.test(a);
  const bIsCompany = COMPANY_SUFFIXES.test(b);

  if (aIsPosition && !bIsPosition) return { position: a, company: b };
  if (bIsPosition && !aIsPosition) return { position: b, company: a };
  if (aIsCompany && !bIsCompany) return { company: a, position: b };
  if (bIsCompany && !aIsCompany) return { company: b, position: a };

  // Both or neither match – default: first = position, second = company
  return { position: a, company: b };
}

function isDateLine(line: string): boolean {
  return /\b(?:19|20)\d{2}\b/.test(line) &&
    /[-–—]|\bto\b|present|current/i.test(line);
}

function isBulletLine(line: string): boolean {
  return /^[•\-\*\u2022\u2023\u25E6]\s/.test(line) || /^\d+[.)]\s/.test(line);
}

// ===================================================================
// Enhanced date extraction & normalisation
// ===================================================================

const MONTH_MAP: Record<string, string> = {
  jan: '01', january: '01',
  feb: '02', february: '02',
  mar: '03', march: '03',
  apr: '04', april: '04',
  may: '05',
  jun: '06', june: '06',
  jul: '07', july: '07',
  aug: '08', august: '08',
  sep: '09', september: '09', sept: '09',
  oct: '10', october: '10',
  nov: '11', november: '11',
  dec: '12', december: '12',
};

/**
 * Normalise any single date token into "YYYY-MM" or "YYYY".
 *
 * Handles:
 *   "January 2020", "Jan 2020", "01/2020", "2020-01", "1/2020"
 *   "12.2019" (European), "2020", "2020-01-15"
 */
export function normalizeDate(raw: string): string {
  const s = raw.trim().toLowerCase();

  // "present" etc → empty string (means current)
  if (/^(present|current|ongoing|now|today|till date|to date)$/i.test(s)) {
    return '';
  }

  // ISO "YYYY-MM-DD"
  const isoFull = s.match(/^(\d{4})-(\d{2})-\d{2}$/);
  if (isoFull) return `${isoFull[1]}-${isoFull[2]}`;

  // ISO "YYYY-MM"
  const iso = s.match(/^(\d{4})-(\d{2})$/);
  if (iso) return `${iso[1]}-${iso[2]}`;

  // "MM/YYYY" or "M/YYYY"
  const slashMY = s.match(/^(\d{1,2})\/(\d{4})$/);
  if (slashMY) {
    const mm = slashMY[1].padStart(2, '0');
    return `${slashMY[2]}-${mm}`;
  }

  // "MM.YYYY" (European)
  const dotMY = s.match(/^(\d{1,2})\.(\d{4})$/);
  if (dotMY) {
    const mm = dotMY[1].padStart(2, '0');
    return `${dotMY[2]}-${mm}`;
  }

  // "Month YYYY" or "Mon. YYYY" or "Mon YYYY"
  for (const [key, mm] of Object.entries(MONTH_MAP)) {
    const re = new RegExp(`^${key}\\.?\\s*,?\\s*(\\d{4})$`, 'i');
    const m = s.match(re);
    if (m) return `${m[1]}-${mm}`;
  }

  // "YYYY Month" (less common)
  for (const [key, mm] of Object.entries(MONTH_MAP)) {
    const re = new RegExp(`^(\\d{4})\\s+${key}\\.?$`, 'i');
    const m = s.match(re);
    if (m) return `${m[1]}-${mm}`;
  }

  // Standalone year
  const yearOnly = s.match(/^(\d{4})$/);
  if (yearOnly) return yearOnly[1];

  // Fallback – try to pull a year from anywhere
  const anyYear = s.match(/((?:19|20)\d{2})/);
  if (anyYear) {
    // Also try to find a month name near it
    for (const [key, mm] of Object.entries(MONTH_MAP)) {
      if (s.includes(key)) {
        return `${anyYear[1]}-${mm}`;
      }
    }
    return anyYear[1];
  }

  return raw.trim();
}

/**
 * Extract start / end dates from a block of text.
 *
 * Handles many more formats than the previous implementation:
 *   "January 2020 – Present"
 *   "Jan 2020 - Dec 2023"
 *   "01/2020 - 12/2023"
 *   "2020 - 2023"
 *   "2020-01 — 2023-12"
 *   "12.2019 - 06.2021"
 *   two separate date tokens on different lines
 */
export function extractDates(text: string): { startDate?: string; endDate?: string; rawString?: string } {
  const result: { startDate?: string; endDate?: string; rawString?: string } = {};

  // ---- 1) Full date range on one token ----
  // Month-Year — Month-Year / Present
  const monthRangeRe =
    /(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\.?\s*,?\s*\d{4}\s*[-–—]\s*(?:(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\.?\s*,?\s*\d{4}|present|current|ongoing|now|today|till\s*date|to\s*date)/gi;
  monthRangeRe.lastIndex = 0;
  const monthRangeMatch = text.match(monthRangeRe);
  if (monthRangeMatch) {
    const parts = monthRangeMatch[0].split(/\s*[-–—]\s*/);
    if (parts.length >= 2) {
      result.startDate = normalizeDate(parts[0]);
      result.endDate = normalizeDate(parts.slice(1).join('-'));
      result.rawString = monthRangeMatch[0];
    }
    return result;
  }

  // "MM/YYYY - MM/YYYY" or "MM.YYYY - MM.YYYY"
  const numericRangeRe =
    /(\d{1,2}[/.]?\d{4})\s*[-–—]\s*(\d{1,2}[/.]?\d{4}|present|current|ongoing|now)/gi;
  numericRangeRe.lastIndex = 0;
  const numRange = text.match(numericRangeRe);
  if (numRange) {
    const parts = numRange[0].split(/\s*[-–—]\s*/);
    if (parts.length >= 2) {
      result.startDate = normalizeDate(parts[0]);
      result.endDate = normalizeDate(parts[1]);
      result.rawString = numRange[0];
      return result;
    }
  }

  // "YYYY - YYYY" or "YYYY - Present"
  const yearRangeRe =
    /\b((?:19|20)\d{2})\s*[-–—]\s*((?:19|20)\d{2}|present|current|ongoing|now|today)\b/gi;
  yearRangeRe.lastIndex = 0;
  const yearRange = text.match(yearRangeRe);
  if (yearRange) {
    const parts = yearRange[0].split(/\s*[-–—]\s*/);
    if (parts.length >= 2) {
      result.startDate = normalizeDate(parts[0]);
      result.endDate = normalizeDate(parts[1]);
      return result;
    }
  }

  // ---- 2) Individual dates (order of appearance) ----
  const monthYearRe =
    /(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\.?\s*,?\s*\d{4}/gi;
  monthYearRe.lastIndex = 0;
  const individualDates = text.match(monthYearRe);
  if (individualDates && individualDates.length >= 2) {
    result.startDate = normalizeDate(individualDates[0]);
    result.endDate = normalizeDate(individualDates[1]);
  } else if (individualDates && individualDates.length === 1) {
    result.startDate = normalizeDate(individualDates[0]);
  }

  // Check for "Present" / "Current" separately
  if (/present|current|ongoing|now/gi.test(text)) {
    result.endDate = '';
  }

  return result;
}

// ===================================================================
// Work experience parsing  (improved entity extraction)
// ===================================================================

export function parseWorkExperience(content: string): Partial<WorkExperience>[] {
  const experiences: Partial<WorkExperience>[] = [];
  const blocks = splitByEntryBoundaries(content);

  for (const block of blocks) {
    if (!block.trim()) continue;

    const lines = block.split('\n').map((l) => l.trim()).filter((l) => l);
    if (lines.length === 0) continue;

    const experience: Partial<WorkExperience> = {
      id: uuidv4(),
      highlights: [],
    };

    // --- Identify header lines (non-bullet, near the top) ---
    // Header lines are the first consecutive non-bullet lines before any
    // bullet content.  Date-only lines are also part of the header.
    // SPECIAL CASE: If line 0 starts with a bullet but contains entity info
    // (company/position/dates), treat it as a header line.
    let headerLineCount = 0;
    const firstLineIsBulletHeader = 
      lines.length > 0 && 
      isBulletLine(lines[0]) &&
      (lines[0].match(/\bat\b|[|-]/) || /\d{4}/.test(lines[0]));
    
    if (firstLineIsBulletHeader) {
      // Line 0 is a bullet but contains header info
      headerLineCount = 1;
      // Check if line 1 is also a header (position on next line)
      if (lines.length > 1 && !isBulletLine(lines[1]) && !isDateLine(lines[1])) {
        headerLineCount = 2;
      }
    } else {
      // Normal case: count consecutive non-bullet lines
      for (let i = 0; i < Math.min(4, lines.length); i++) {
        if (isBulletLine(lines[i])) break;
        headerLineCount++;
      }
    }

    // --- Strip inline dates from the first header line before entity
    //     extraction so "Position | Company | Jan 2020 – Present" becomes
    //     "Position | Company" for cleaner extraction. ---
    const dateInlineRe =
      /\s*[|,]?\s*(?:(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\.?\s*,?\s*)?\d{4}\s*[-–—]\s*(?:(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\.?\s*,?\s*\d{4}|present|current|ongoing|now)\s*$/i;

    // Use enhanced entity extraction
    if (headerLineCount >= 1) {
      // Clean the primary header line by removing bullet marker AND trailing date range
      let cleanFirstLine = lines[0].replace(/^[•\-\*\u2022\u2023\u25E6]\s*/, '').trim();
      cleanFirstLine = cleanFirstLine.replace(dateInlineRe, '').trim();
      const nextLine = headerLineCount >= 2 ? lines[1] : undefined;
      const { company, position } = extractCompanyAndPosition(
        cleanFirstLine || lines[0],
        nextLine,
      );
      if (position) experience.position = position;
      if (company) experience.company = company;

      // Check remaining header lines for location, date-only lines, or
      // a company that wasn't detected yet.
      for (let h = 1; h < headerLineCount; h++) {
        const hLine = lines[h];
        // Skip lines already consumed by extractCompanyAndPosition
        if (hLine === nextLine && (company || position)) continue;
        if (isDateLine(hLine)) continue;
        if (!experience.company && !isBulletLine(hLine) && hLine.length < 80) {
          experience.company = hLine;
        } else if (!experience.location && !isBulletLine(hLine) && hLine.length < 60) {
          experience.location = hLine;
        }
      }
    }

    // Extract dates from entire block
    const dates = extractDates(block);
    if (dates.startDate) experience.startDate = dates.startDate;
    if (dates.endDate !== undefined) experience.endDate = dates.endDate;

    // Extract highlights (bullet points)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (isBulletLine(line)) {
        const highlight = line.replace(/^[•\-\*\u2022\u2023\u25E6\d.)\s]+/, '').trim();
        if (highlight) {
          experience.highlights!.push(highlight);
        }
      }
    }

    // Build summary from remaining non-bullet, non-header content
    if (!experience.highlights || experience.highlights.length === 0) {
      const summaryLines = lines.slice(headerLineCount).filter(
        (l) => !isBulletLine(l) && !isDateLine(l),
      );
      if (summaryLines.length > 0) {
        experience.summary = summaryLines.join(' ').substring(0, 500);
      }
    }

    if (experience.position || experience.company) {
      experiences.push(experience);
    }
  }

  return experiences;
}

// ===================================================================
// Education parsing
// ===================================================================

export function parseEducation(content: string): Partial<Education>[] {
  const educations: Partial<Education>[] = [];
  const blocks = splitByEntryBoundaries(content);

  for (const block of blocks) {
    if (!block.trim()) continue;

    const lines = block.split('\n').map((l) => l.trim()).filter((l) => l);
    if (lines.length === 0) continue;

    const education: Partial<Education> = {
      id: uuidv4(),
      courses: [],
    };

    const degreePatterns = [
      /(?:Bachelor|Master|PhD|Ph\.?D\.?|Doctor(?:ate)?|Associate|MBA|B\.?S\.?c?|M\.?S\.?c?|B\.?A\.?|M\.?A\.?|B\.?Eng\.?|M\.?Eng\.?|B\.?Com\.?|LL\.?B\.?|LL\.?M\.?|DBA|Ed\.?D\.?|Diploma|Certificate|Postgraduate|Undergraduate)/i,
    ];

    const institutionKeywords =
      /university|college|institute|school|academy|polytechnic|universität|école|universidad/i;

    // First pass: look for institution, degree, GPA
    for (const line of lines) {
      // Degree detection
      if (!education.studyType) {
        for (const pattern of degreePatterns) {
          if (pattern.test(line)) {
            if (line.toLowerCase().includes(' in ')) {
              const parts = line.split(/ in /i);
              education.studyType = parts[0].trim();
              education.area = parts.slice(1).join(' in ').trim();
            } else if (line.toLowerCase().includes(' of ')) {
              education.studyType = line.trim();
              const parts = line.split(/ of /i);
              education.area = parts.slice(1).join(' of ').trim();
            } else {
              education.studyType = line.trim();
            }
            break;
          }
        }
      }

      // Institution detection
      if (institutionKeywords.test(line) && !education.institution) {
        // If the line also has a degree, strip the degree part
        education.institution = line.trim();
      }

      // GPA
      const gpaMatch = line.match(/(?:GPA|CGPA|Grade|Score):?\s*([\d.]+(?:\s*\/\s*[\d.]+)?)/i);
      if (gpaMatch) {
        education.score = gpaMatch[1];
      }
    }

    // Second pass: if no institution found by keyword, use the first
    // non-degree, non-date, non-bullet line (common in simple formats
    // like "MIT\nBS Computer Science\n2018-2022")
    if (!education.institution) {
      for (const line of lines) {
        if (isDateLine(line) || isBulletLine(line)) continue;
        // Skip if it's the degree line we already captured
        if (education.studyType && line.trim() === education.studyType) continue;
        if (education.area && line.includes(education.area)) continue;
        // Use the first remaining short line as institution
        if (line.length < 80) {
          education.institution = line.trim();
          break;
        }
      }
    }

    const dates = extractDates(block);
    if (dates.startDate) education.startDate = dates.startDate;
    if (dates.endDate !== undefined) education.endDate = dates.endDate;

    if (education.institution || education.studyType) {
      educations.push(education);
    }
  }

  return educations;
}

// ===================================================================
// Skills parsing
// ===================================================================

export function parseSkills(content: string): Partial<Skill>[] {
  const skills: Partial<Skill>[] = [];
  const lines = content.split('\n').map((l) => l.trim()).filter((l) => l);

  let currentCategory = '';

  for (const line of lines) {
    // Detect category header – "Category:" or "Category -" at start
    const catMatch = line.match(/^([^•\-\*\d][^:]{2,40}):\s*(.*)$/);
    if (catMatch) {
      currentCategory = catMatch[1].trim();
      const rest = catMatch[2].trim();
      if (rest) {
        // Skills listed on same line as category
        addSkillItems(rest, currentCategory, skills);
      }
      continue;
    }

    // Bullet-prefixed line
    const cleanLine = line.replace(/^[•\-\*\u2022\u2023\u25E6]\s*/, '').trim();
    addSkillItems(cleanLine, currentCategory, skills);
  }

  return consolidateSkills(skills);
}

function addSkillItems(text: string, category: string, skills: Partial<Skill>[]) {
  const items = text.split(/[,;•|/]/).map((s) => s.trim()).filter((s) => s && s.length < 50);
  if (items.length === 0) return;

  if (category) {
    // Group under category
    const existing = skills.find((s) => s.name?.toLowerCase() === category.toLowerCase());
    if (existing) {
      for (const item of items) {
        if (!existing.keywords?.includes(item)) {
          existing.keywords?.push(item);
        }
      }
    } else {
      skills.push({
        id: uuidv4(),
        name: category,
        level: '',
        keywords: items,
      });
    }
  } else {
    for (const item of items) {
      skills.push({
        id: uuidv4(),
        name: item,
        level: '',
        keywords: [],
      });
    }
  }
}

function consolidateSkills(skills: Partial<Skill>[]): Partial<Skill>[] {
  const seen = new Set<string>();
  return skills.filter((skill) => {
    const key = skill.name?.toLowerCase() || '';
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// ===================================================================
// Projects parsing
// ===================================================================

export function parseProjects(content: string): Partial<Project>[] {
  const projects: Partial<Project>[] = [];
  const blocks = splitByEntryBoundaries(content);

  for (const block of blocks) {
    if (!block.trim()) continue;

    const lines = block.split('\n').map((l) => l.trim()).filter((l) => l);
    if (lines.length === 0) continue;

    const project: Partial<Project> = {
      id: uuidv4(),
      highlights: [],
      keywords: [],
    };

    project.name = lines[0].replace(/^[•\-\*\u2022\u2023\u25E6]\s*/, '').trim();

    const dates = extractDates(block);
    if (dates.startDate) project.startDate = dates.startDate;
    if (dates.endDate !== undefined) project.endDate = dates.endDate;

    const descriptionParts: string[] = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (isBulletLine(line)) {
        const highlight = line.replace(/^[•\-\*\u2022\u2023\u25E6]\s*/, '').trim();
        if (highlight) project.highlights!.push(highlight);
      } else {
        descriptionParts.push(line);
      }
    }

    if (descriptionParts.length > 0) {
      project.description = descriptionParts.join(' ').substring(0, 500);
    }

    const urlPattern =
      /(?:https?:\/\/)?(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&/=]*)/gi;
    urlPattern.lastIndex = 0;
    const urlMatch = block.match(urlPattern);
    if (urlMatch && urlMatch.length > 0) {
      project.url = urlMatch[0].startsWith('http') ? urlMatch[0] : `https://${urlMatch[0]}`;
    }

    if (project.name) {
      projects.push(project);
    }
  }

  return projects;
}

// ===================================================================
// Certificates parsing
// ===================================================================

export function parseCertificates(content: string): Partial<Certificate>[] {
  const certificates: Partial<Certificate>[] = [];
  const lines = content.split('\n').map((l) => l.trim()).filter((l) => l);

  for (const line of lines) {
    const cleanLine = line.replace(/^[•\-\*\u2022\u2023\u25E6]\s*/, '').trim();
    if (!cleanLine) continue;

    const certificate: Partial<Certificate> = { id: uuidv4() };

    if (cleanLine.includes(' - ')) {
      const parts = cleanLine.split(' - ');
      certificate.name = parts[0].trim();
      certificate.issuer = parts.slice(1).join(' - ').trim();
    } else if (cleanLine.includes(', ')) {
      const parts = cleanLine.split(', ');
      certificate.name = parts[0].trim();
      certificate.issuer = parts.slice(1).join(', ').trim();
    } else {
      certificate.name = cleanLine;
    }

    const dates = extractDates(cleanLine);
    if (dates.startDate) certificate.date = dates.startDate;

    if (certificate.name) {
      certificates.push(certificate);
    }
  }

  return certificates;
}

// ===================================================================
// Languages parsing
// ===================================================================

export function parseLanguages(content: string): Partial<Language>[] {
  const languages: Partial<Language>[] = [];
  const lines = content.split('\n').map((l) => l.trim()).filter((l) => l);

  const fluencyRe =
    /\b(native|fluent|professional|intermediate|beginner|basic|advanced|proficient|conversational|elementary|working\s+proficiency|limited\s+working|full\s+professional|native\s+or\s+bilingual)\b/gi;

  for (const line of lines) {
    const cleanLine = line.replace(/^[•\-\*\u2022\u2023\u25E6]\s*/, '').trim();
    if (!cleanLine) continue;

    const language: Partial<Language> = { id: uuidv4() };

    fluencyRe.lastIndex = 0;
    const match = cleanLine.match(fluencyRe);
    if (match) {
      language.fluency = match[0];
      language.language = cleanLine.replace(fluencyRe, '').replace(/[():\-,]/g, '').trim();
    }

    if (!language.language) {
      if (cleanLine.includes(' - ')) {
        const parts = cleanLine.split(' - ');
        language.language = parts[0].trim();
        language.fluency = parts[1]?.trim() || '';
      } else if (cleanLine.includes(':')) {
        const parts = cleanLine.split(':');
        language.language = parts[0].trim();
        language.fluency = parts[1]?.trim() || '';
      } else {
        language.language = cleanLine;
      }
    }

    if (language.language) {
      languages.push(language);
    }
  }

  return languages;
}

// ===================================================================
// Entry boundary splitting (improved)
// ===================================================================

/**
 * Splits a section's content into individual entry blocks.
 *
 * Uses a combination of:
 *  - Date-range lines as boundaries (including inline dates)
 *  - Blank-line gaps (single blank line is enough after meaningful content)
 *  - Non-bullet "title-like" lines after bullet-heavy blocks
 */
function splitByEntryBoundaries(content: string): string[] {
  const lines = content.split('\n');
  const blocks: string[] = [];
  let currentBlock: string[] = [];
  let blockHasDateRange = false;
  let blockHasBullets = false;
  let blockHasContent = false;
  let consecutiveBlankLines = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      consecutiveBlankLines++;
      currentBlock.push(line);
      continue;
    }

    // Check if this line contains a date range
    const dateRangePattern =
      /(?:(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\.?\s+)?\d{4}\s*[-–—]\s*(?:(?:(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\.?\s+)?\d{4}|present|current|ongoing|now)/gi;
    dateRangePattern.lastIndex = 0;
    const lineHasDateRange = dateRangePattern.test(trimmed);
    const isBullet = isBulletLine(trimmed);
    const isTitle = !isBullet && trimmed.length < 100;

    let shouldSplit = false;

    // H1: A blank-line gap (1+ blank lines) followed by a title-like line,
    // when the current block already has meaningful content (dates or bullets).
    if (
      consecutiveBlankLines >= 1 &&
      isTitle &&
      blockHasContent &&
      (blockHasDateRange || blockHasBullets)
    ) {
      shouldSplit = true;
    }

    // H2: A title line that ALSO contains a date range (e.g.
    // "Software Engineer | Google | Jan 2020 - Present"), when the current
    // block already had a date range.  This is a very common format where
    // entries have inline dates.
    if (lineHasDateRange && isTitle && blockHasDateRange && blockHasContent) {
      shouldSplit = true;
    }

    // H3: Double-blank-line gap followed by any title-like content.
    if (consecutiveBlankLines >= 2 && isTitle && blockHasContent) {
      shouldSplit = true;
    }

    // H4: Original heuristic – title-like line (starts uppercase, no bullet,
    // no inline date) after block with dates/bullets.
    // BUT exclude cases where this looks like header lines (company/position/desc)
    // after a bullet-company line with inline date.
    if (
      !shouldSplit &&
      isTitle &&
      /^[A-Z]/.test(trimmed) &&
      !lineHasDateRange &&
      currentBlock.length > 0 &&
      blockHasContent &&
      (blockHasDateRange || blockHasBullets)
    ) {
      // Special case: if the block starts with a bullet+date line (common format
      // for work entries), allow up to 3 consecutive non-bullet lines as header/desc.
      const firstContentLine = currentBlock.find(l => l.trim());
      const firstLineIsBulletWithDate = 
        firstContentLine &&
        isBulletLine(firstContentLine) &&
        /\d{4}/.test(firstContentLine);

      if (firstLineIsBulletWithDate) {
        // Count consecutive non-bullet lines after the first bullet line
        let nonBulletCount = 0;
        for (let j = 1; j < currentBlock.length; j++) {
          const blockLine = currentBlock[j].trim();
          if (!blockLine) continue; // Skip blank lines
          if (isBulletLine(blockLine)) break; // Stop at first bullet after header
          nonBulletCount++;
        }
        // Allow up to 3 non-bullet lines (position, description, maybe location)
        if (nonBulletCount >= 3) {
          shouldSplit = true;
        }
      } else {
        shouldSplit = true;
      }
    }

    if (shouldSplit && currentBlock.length > 0) {
      const blockContent = currentBlock.join('\n').trim();
      if (blockContent) blocks.push(blockContent);
      currentBlock = [];
      blockHasDateRange = false;
      blockHasBullets = false;
      blockHasContent = false;
    }

    currentBlock.push(line);
    consecutiveBlankLines = 0;
    blockHasContent = true;
    if (lineHasDateRange) blockHasDateRange = true;
    if (isBullet) blockHasBullets = true;
  }

  if (currentBlock.length > 0) {
    const blockContent = currentBlock.join('\n').trim();
    if (blockContent) blocks.push(blockContent);
  }

  return blocks;
}

// ===================================================================
// Confidence calculation  (improved)
// ===================================================================

export function calculateConfidence(data: ParsedResumeData): {
  overall: number;
  sections: Record<string, number>;
} {
  const sections: Record<string, number> = {};
  let total = 0;
  let count = 0;

  // ---- Basics ----
  if (data.basics) {
    let s = 0;
    if (data.basics.name) s += 30;
    if (data.basics.email) s += 25;
    if (data.basics.phone) s += 15;
    if (data.basics.label) s += 15;
    if (data.basics.summary) s += 15;
    sections.basics = Math.min(100, s);
    total += sections.basics;
    count++;
  }

  // ---- Work ----
  if (data.work && data.work.length > 0) {
    let s = 0;
    for (const exp of data.work) {
      let entryScore = 0;
      if (exp.position) entryScore += 25;
      if (exp.company) entryScore += 25;
      if (exp.startDate) entryScore += 15;
      // Validate date format
      if (exp.startDate && /^\d{4}(-\d{2})?$/.test(exp.startDate)) entryScore += 5;
      if (exp.highlights && exp.highlights.length > 0) entryScore += 25;
      if (exp.summary) entryScore += 5;
      s += entryScore;
    }
    sections.work = Math.min(100, Math.round(s / data.work.length));
    total += sections.work;
    count++;
  }

  // ---- Education ----
  if (data.education && data.education.length > 0) {
    let s = 0;
    for (const edu of data.education) {
      if (edu.institution) s += 30;
      if (edu.studyType) s += 25;
      if (edu.area) s += 25;
      if (edu.startDate || edu.endDate) s += 20;
    }
    sections.education = Math.min(100, Math.round(s / data.education.length));
    total += sections.education;
    count++;
  }

  // ---- Skills ----
  if (data.skills && data.skills.length > 0) {
    const hasCategories = data.skills.some(
      (s) => s.keywords && s.keywords.length > 0,
    );
    let s = 50 + data.skills.length * 5;
    if (hasCategories) s += 15;
    sections.skills = Math.min(100, s);
    total += sections.skills;
    count++;
  }

  // ---- Projects ----
  if (data.projects && data.projects.length > 0) {
    let s = 0;
    for (const p of data.projects) {
      if (p.name) s += 40;
      if (p.description || (p.highlights && p.highlights.length > 0)) s += 40;
      if (p.url) s += 20;
    }
    sections.projects = Math.min(100, Math.round(s / data.projects.length));
    total += sections.projects;
    count++;
  }

  // ---- Certificates ----
  if (data.certificates && data.certificates.length > 0) {
    let s = 0;
    for (const c of data.certificates) {
      if (c.name) s += 50;
      if (c.issuer) s += 30;
      if (c.date) s += 20;
    }
    sections.certificates = Math.min(100, Math.round(s / data.certificates.length));
    total += sections.certificates;
    count++;
  }

  // ---- Languages ----
  if (data.languages && data.languages.length > 0) {
    let s = 0;
    for (const l of data.languages) {
      if (l.language) s += 60;
      if (l.fluency) s += 40;
    }
    sections.languages = Math.min(100, Math.round(s / data.languages.length));
    total += sections.languages;
    count++;
  }

  const overall = count > 0 ? Math.round(total / count) : 0;
  return { overall, sections };
}
