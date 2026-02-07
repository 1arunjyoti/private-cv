/**
 * Pre-processing and normalization for raw resume text.
 *
 * Running this BEFORE section detection dramatically improves parsing quality
 * because the downstream regex patterns operate on cleaner, more consistent text.
 */

// ---------------------------------------------------------------------------
// 1. Unicode & character normalisation
// ---------------------------------------------------------------------------

/** Collapse fancy Unicode into their ASCII equivalents */
function normalizeUnicode(text: string): string {
  return (
    text
      // Canonical decomposition + composition
      .normalize('NFKC')
      // Dash variants → standard hyphen-minus  (\u002D)
      .replace(/[\u2010-\u2015\u2212\uFE58\uFE63\uFF0D]/g, '-')
      // Quote variants → straight quotes
      .replace(/[\u2018\u2019\u201A\uFF07]/g, "'")
      .replace(/[\u201C\u201D\u201E\uFF02]/g, '"')
      // Bullet / list markers → standard bullet
      .replace(
        /[\u2022\u2023\u2043\u2219\u25AA\u25AB\u25CF\u25CB\u25E6\u2981\u29BE\u29BF\u00B7\u2218]/g,
        '•',
      )
      // Ellipsis
      .replace(/\u2026/g, '...')
      // Non-breaking spaces, thin spaces, etc.  → normal space
      .replace(/[\u00A0\u2000-\u200B\u202F\u205F\u3000\uFEFF]/g, ' ')
      // Strip invisible control characters (keep \n, \r, \t)
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
  );
}

// ---------------------------------------------------------------------------
// 2. Fix common OCR / PDF-extraction artefacts
// ---------------------------------------------------------------------------

const OCR_CORRECTIONS: [RegExp, string][] = [
  // Ligatures that sometimes survive extraction
  [/ﬁ/g, 'fi'],
  [/ﬂ/g, 'fl'],
  [/ﬀ/g, 'ff'],
  [/ﬃ/g, 'ffi'],
  [/ﬄ/g, 'ffl'],
  // Common OCR mis-reads
  [/\bl\s?nformation\b/gi, 'Information'],
  [/\bExper\s?ience\b/gi, 'Experience'],
  [/\bEduc\s?ation\b/gi, 'Education'],
  [/\bSkil\s?ls\b/gi, 'Skills'],
  [/\bRefer\s?ences\b/gi, 'References'],
  [/\bCert\s?ific\s?ations?\b/gi, 'Certifications'],
  // Degree-related OCR
  [/\bBachel\s?or\b/gi, 'Bachelor'],
  [/\bMast\s?er\b/gi, 'Master'],
];

function fixOCRArtifacts(text: string): string {
  let out = text;
  for (const [re, replacement] of OCR_CORRECTIONS) {
    out = out.replace(re, replacement);
  }
  return out;
}

// ---------------------------------------------------------------------------
// 3. Whitespace normalisation
// ---------------------------------------------------------------------------

function normalizeWhitespace(text: string): string {
  return (
    text
      // Tab → space (except leading tabs)
      .replace(/([^\n])\t+/g, '$1 ')
      // Collapse consecutive spaces (not newlines) to one
      .replace(/[ \t]{2,}/g, ' ')
      // Fix word-hyphenation across lines  (e.g.  "Micro-\nsoft" → "Microsoft")
      .replace(/(\w)-\s*\n\s*(\w)/g, '$1$2')
      // Trim each line
      .split('\n')
      .map((l) => l.trim())
      .join('\n')
      // Collapse 3+ blank lines → 2
      .replace(/\n{3,}/g, '\n\n')
      .trim()
  );
}

// ---------------------------------------------------------------------------
// 4. Remove headers / footers / page numbers
// ---------------------------------------------------------------------------

function removePageArtifacts(text: string): string {
  return (
    text
      // "Page X of Y"
      .replace(/^\s*page\s+\d+\s+(of|\/)\s+\d+\s*$/gim, '')
      // Standalone page numbers like "1", "2" at start/end of line surrounded by blank lines
      .replace(/\n\s*\d{1,2}\s*\n/g, '\n')
      // Repeated identical header/footer lines (heuristic – if same short line appears 3+ times)
      .replace(/^(.{5,60})\n(?:[\s\S]*?\n\1\n){2,}/gm, (_m, p1: string) => p1 + '\n')
  );
}

// ---------------------------------------------------------------------------
// 5. Normalise section-heading presentation
// ---------------------------------------------------------------------------

/**
 * Ensure section headings sit on their own line, surrounded by a blank line
 * above, which makes downstream regex detection far more reliable.
 *
 * Works for ALL-CAPS headings, Title-Case headings, and headings followed by
 * a colon or a decorative line of dashes/underscores.
 */
function normalizeSectionSeparators(text: string): string {
  const lines = text.split('\n');
  const out: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Detect decorative separator lines (-----, =====, _____)
    if (/^[-=_]{3,}$/.test(trimmed)) {
      // Turn them into blank lines (they confuse section parsing)
      out.push('');
      continue;
    }

    // If the line is a plausible heading (short, starts with uppercase, no bullet)
    const isShort = trimmed.length > 0 && trimmed.length < 50;
    const startsUpper = /^[A-Z]/.test(trimmed);
    const noBullet = !/^[•\-\*\d]/.test(trimmed);
    const isAllCaps = /^[A-Z\s&/,]+$/.test(trimmed) && trimmed.length >= 3;
    const endsWithColon = trimmed.endsWith(':');

    const prevIsBlank = i === 0 || out[out.length - 1]?.trim() === '';

    if (isShort && startsUpper && noBullet && (isAllCaps || endsWithColon)) {
      if (!prevIsBlank) {
        out.push('');
      }
      // Remove trailing colon for uniformity (detectSections already handles it)
      out.push(endsWithColon ? trimmed.slice(0, -1).trim() : trimmed);
      continue;
    }

    out.push(line);
  }

  return out.join('\n');
}

// ---------------------------------------------------------------------------
// 6. Multi-column text reordering  (best-effort heuristic)
// ---------------------------------------------------------------------------

/**
 * Many two-column PDFs produce text where left-column and right-column
 * content is interleaved line-by-line.  We detect this by looking for
 * lines that have a large interior gap (>= 4 spaces) and split them into
 * separate blocks, then concatenate left-block ↕ right-block.
 *
 * This is intentionally conservative: if fewer than 30 % of content lines
 * exhibit the pattern we leave the text unchanged.
 */
export function reorderMultiColumnText(text: string): string {
  const lines = text.split('\n');
  const leftCol: string[] = [];
  const rightCol: string[] = [];
  let multiColLineCount = 0;
  let totalContentLines = 0;

  // First pass – detect column split
  const GAP_RE = /^(.{15,}?)\s{4,}(.{15,})$/;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      leftCol.push('');
      rightCol.push('');
      continue;
    }
    totalContentLines++;

    const m = GAP_RE.exec(trimmed);
    if (m) {
      multiColLineCount++;
      leftCol.push(m[1].trim());
      rightCol.push(m[2].trim());
    } else {
      leftCol.push(trimmed);
      rightCol.push('');
    }
  }

  // Only treat as multi-column if a significant proportion of lines matched
  if (totalContentLines < 5 || multiColLineCount / totalContentLines < 0.3) {
    return text; // Not multi-column – return unchanged
  }

  // Merge: left column first, then right column
  const leftText = leftCol
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  const rightText = rightCol
    .filter((l) => l.trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return rightText ? `${leftText}\n\n${rightText}` : leftText;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface PreprocessOptions {
  /** Attempt multi-column reordering (recommended for PDF, not for DOCX) */
  multiColumn?: boolean;
}

/**
 * Full pre-processing pipeline.
 * Call this on the raw extracted text **before** any section detection.
 */
export function preprocessResumeText(
  text: string,
  options: PreprocessOptions = {},
): string {
  if (!text) return '';

  let out = normalizeUnicode(text);
  out = fixOCRArtifacts(out);

  // Multi-column reordering MUST run before whitespace normalisation
  // because it relies on interior multi-space gaps (>= 4 spaces) to
  // detect columnar layout.  normalizeWhitespace collapses those gaps.
  if (options.multiColumn !== false) {
    out = reorderMultiColumnText(out);
  }

  out = normalizeWhitespace(out);
  out = removePageArtifacts(out);
  out = normalizeSectionSeparators(out);
  // Final whitespace cleanup after all transforms
  out = out.replace(/\n{3,}/g, '\n\n').trim();

  return out;
}
