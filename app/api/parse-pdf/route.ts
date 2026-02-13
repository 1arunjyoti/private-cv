import { NextRequest, NextResponse } from 'next/server';
import { getDocumentProxy } from 'unpdf';
import { checkPdfParseRateLimit } from './rate-limit';

const DEFAULT_MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50MB

function parsePositiveInt(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function getMaxFileSizeBytes(): number {
  return parsePositiveInt(
    process.env.PDF_PARSE_MAX_FILE_SIZE_BYTES,
    DEFAULT_MAX_FILE_SIZE_BYTES,
  );
}

// ---------------------------------------------------------------------------
// Position-aware text extraction
// ---------------------------------------------------------------------------

interface TextItem {
  str: string;
  transform: number[];
  width: number;
  height: number;
  hasEOL?: boolean;
}

/**
 * Extract text from a single PDF page using position data to detect line breaks.
 *
 * unpdf's built-in `extractText` with `mergePages: true` crushes ALL whitespace
 * (including newlines) into single spaces.  Even with `mergePages: false` it only
 * adds `\n` when an item has `hasEOL === true`, which many PDFs do not set.
 *
 * This function detects line changes by comparing the y-coordinate of successive
 * text items and inserts `\n` when items move to a new vertical position.
 */
function extractPageText(items: TextItem[]): string {
  if (items.length === 0) return '';

  // Group items into lines based on y-coordinate proximity
  const lines: { y: number; height: number; items: { x: number; str: string; width: number }[] }[] = [];

  for (const item of items) {
    if (item.str == null) continue;

    const x = item.transform[4];
    const y = item.transform[5];
    const h = item.height || 10;

    // Try to find an existing line that matches this y-coordinate
    let matched = false;
    for (const line of lines) {
      // Items are on the same line if their y-coordinates are within half
      // the line height of each other.
      if (Math.abs(line.y - y) < Math.max(line.height, h) * 0.5) {
        line.items.push({ x, str: item.str, width: item.width });
        matched = true;
        break;
      }
    }

    if (!matched) {
      lines.push({ y, height: h, items: [{ x, str: item.str, width: item.width }] });
    }
  }

  // Sort lines top-to-bottom (PDF y-axis goes upward, so descending y = top first)
  lines.sort((a, b) => b.y - a.y);

  const textLines: string[] = [];

  for (const line of lines) {
    // Sort items left-to-right within the line
    line.items.sort((a, b) => a.x - b.x);

    let lineText = '';
    let prevEnd = 0; // x-coordinate where the previous item ended

    for (let i = 0; i < line.items.length; i++) {
      const item = line.items[i];
      if (!item.str) continue;

      if (lineText) {
        // Estimate average character width from this item
        const avgCharW = item.str.length > 0 ? item.width / item.str.length : 5;
        const gap = item.x - prevEnd;

        if (gap > avgCharW * 3) {
          // Large gap → likely multi-column separator, use wide space
          lineText += '    ';
        } else if (!lineText.endsWith(' ') && !item.str.startsWith(' ')) {
          lineText += ' ';
        }
      }

      lineText += item.str;
      prevEnd = item.x + item.width;
    }

    textLines.push(lineText);
  }

  return textLines.join('\n');
}

/**
 * Extract all text from a PDF with proper line-break preservation.
 */
async function extractTextWithPositions(
  arrayBuffer: ArrayBuffer,
): Promise<{ text: string; totalPages: number }> {
  const pdf = await getDocumentProxy(new Uint8Array(arrayBuffer));
  const pages: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = extractPageText(content.items as TextItem[]);
    pages.push(pageText.trim());
  }

  return { text: pages.join('\n\n'), totalPages: pdf.numPages };
}

// ---------------------------------------------------------------------------
// Normalize & helpers
// ---------------------------------------------------------------------------

/**
 * Normalize extracted PDF text to handle common issues:
 * - Remove excessive whitespace
 * - Fix broken words (hy-phen-ation)
 * - Handle unicode issues
 */
function normalizeText(text: string): string {
  if (!text) return '';
  
  const normalized = text
    // Normalize unicode characters
    .normalize('NFKC')
    // Replace various dash types with standard hyphen
    .replace(/[\u2010-\u2015\u2212]/g, '-')
    // Replace various quote types with standard quotes
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    // Replace bullet points and other list markers with standard bullet
    .replace(/[\u2022\u2023\u2043\u2219\u25AA\u25AB\u25CF\u25CB\u25E6\u2981\u29BE\u29BF]/g, '•')
    // Remove null characters and other control characters (except newline and tab)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Fix hyphenation at end of lines (word- \nrest -> wordrest)
    .replace(/(\w)-\s*\n\s*(\w)/g, '$1$2')
    // Normalize multiple newlines to max 2
    .replace(/\n{3,}/g, '\n\n')
    // Trim leading/trailing whitespace from each line but PRESERVE interior
    // gaps – multi-column PDFs use wide gaps to separate columns and the
    // client-side preprocessor needs them intact for column reordering.
    .split('\n')
    .map(line => line.trim())
    .join('\n')
    // Final trim
    .trim();
  
  return normalized;
}

/**
 * Try to detect if PDF might be image-based (scanned)
 */
function isLikelyScannedPDF(text: string, numPages: number): boolean {
  if (!text || !text.trim()) return true;
  
  // Very little text for number of pages suggests scanned PDF
  const avgCharsPerPage = text.length / numPages;
  if (avgCharsPerPage < 100) return true;
  
  // Too much garbage characters might indicate OCR issues
  const garbageRatio = (text.match(/[^\w\s.,!?;:'"()-]/g)?.length || 0) / text.length;
  if (garbageRatio > 0.3) return true;
  
  return false;
}

export async function POST(request: NextRequest) {
  try {
    const rateLimit = checkPdfParseRateLimit(request);
    if (rateLimit.limited) {
      return NextResponse.json(
        {
          error: 'Too many PDF parse requests. Please try again shortly.',
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateLimit.retryAfterSeconds ?? 60),
          },
        },
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload a PDF file.' },
        { status: 400 }
      );
    }

    const maxFileSizeBytes = getMaxFileSizeBytes();
    if (file.size > maxFileSizeBytes) {
      return NextResponse.json(
        {
          error: `PDF file is too large. Maximum allowed size is ${Math.floor(maxFileSizeBytes / (1024 * 1024))}MB.`,
        },
        { status: 413 },
      );
    }

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // Validate PDF header
    const uint8Array = new Uint8Array(arrayBuffer);
    const header = new TextDecoder().decode(uint8Array.slice(0, 8));
    if (!header.startsWith('%PDF')) {
      return NextResponse.json(
        { error: 'Invalid PDF file. The file does not appear to be a valid PDF.' },
        { status: 400 }
      );
    }

    let result: { text: string; totalPages: number };
    try {
      // Use position-aware extraction to preserve line breaks.
      // unpdf's extractText with mergePages:true collapses ALL whitespace
      // (including newlines) into single spaces, so we extract manually.
      result = await extractTextWithPositions(arrayBuffer);
    } catch (parseError) {
      console.error('PDF parsing error:', parseError);
      return NextResponse.json(
        { 
          error: 'Failed to read PDF content',
          details: parseError instanceof Error ? parseError.message : 'The PDF may be corrupted, encrypted, or use unsupported features.',
          suggestion: 'Try opening the PDF in a viewer and saving it as a new PDF, or convert it to DOCX format.'
        },
        { status: 422 }
      );
    }
    
    // Get raw and normalized text
    const rawText = result.text || '';
    const normalizedText = normalizeText(rawText);
    const numPages = result.totalPages || 1;
    
    // Check if PDF might be scanned/image-based
    if (isLikelyScannedPDF(normalizedText, numPages)) {
      return NextResponse.json({
        success: true,
        text: normalizedText,
        numPages,
        warning: 'This PDF appears to be image-based or scanned. Text extraction may be incomplete. For better results, please use a text-based PDF or convert to DOCX format.'
      });
    }
    
    return NextResponse.json({
      success: true,
      text: normalizedText,
      numPages
    });
  } catch (error) {
    console.error('PDF parsing error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to parse PDF',
        details: error instanceof Error ? error.message : 'Unknown error',
        suggestion: 'Try converting your PDF to DOCX format for better results.'
      },
      { status: 500 }
    );
  }
}
