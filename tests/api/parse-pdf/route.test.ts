import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/parse-pdf/route';
import { resetPdfParseRateLimitForTests } from '@/app/api/parse-pdf/rate-limit';
import { NextRequest } from 'next/server';

// Mock unpdf – now we mock getDocumentProxy (not extractText)
const mockGetDocumentProxy = vi.fn();
vi.mock('unpdf', () => ({
  getDocumentProxy: (...args: unknown[]) => mockGetDocumentProxy(...args),
}));

/**
 * Helper: build a fake PDFDocumentProxy that returns the given lines per page.
 * Each page is described by an array of strings – one string per "line" in the PDF.
 */
function buildMockPdf(pages: string[][]): {
  numPages: number;
  getPage: (n: number) => Promise<{ getTextContent: () => Promise<{ items: unknown[] }> }>;
} {
  return {
    numPages: pages.length,
    getPage: async (pageNum: number) => ({
      getTextContent: async () => {
        const lines = pages[pageNum - 1] ?? [];
        // Lay out items with a decreasing y so that extractPageText groups
        // them properly (one item per line, y spaced 20 pts apart).
        const items = lines.map((str, idx) => ({
          str,
          transform: [1, 0, 0, 1, 0, 800 - idx * 20], // x=0, y descends
          width: str.length * 6,
          height: 12,
          hasEOL: false,
        }));
        return { items };
      },
    }),
  };
}

/** Shorthand: build a single-page mock PDF */
function mockSinglePage(lines: string[]) {
  mockGetDocumentProxy.mockResolvedValueOnce(buildMockPdf([lines]));
}

/**
 * Helper to create a mock NextRequest with FormData
 */
function createMockRequest(
  file: File | null,
  headers: Record<string, string> = {},
): NextRequest {
  const formData = new FormData();
  if (file) {
    formData.append('file', file);
  }

  return {
    formData: () => Promise.resolve(formData),
    headers: new Headers(headers),
  } as unknown as NextRequest;
}

/**
 * Helper to create a valid PDF file (starts with %PDF header)
 */
function createPDFFile(content: string = 'PDF content', name: string = 'resume.pdf'): File {
  // Create mock PDF with proper header
  const pdfHeader = '%PDF-1.4\n';
  const fullContent = pdfHeader + content;
  const blob = new Blob([fullContent], { type: 'application/pdf' });
  return new File([blob], name, { type: 'application/pdf' });
}

/**
 * Helper to create a file with invalid PDF content
 */
function createInvalidPDFFile(name: string = 'fake.pdf'): File {
  const blob = new Blob(['Not a PDF file'], { type: 'application/pdf' });
  return new File([blob], name, { type: 'application/pdf' });
}

describe('POST /api/parse-pdf', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetPdfParseRateLimitForTests();
  });

  describe('Input Validation', () => {
    it('should return 400 when no file is provided', async () => {
      const request = createMockRequest(null);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('No file provided');
    });

    it('should return 400 for invalid file type (not PDF)', async () => {
      const textFile = new File(['Hello World'], 'document.txt', {
        type: 'text/plain',
      });
      const request = createMockRequest(textFile);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Invalid file type');
    });

    it('should return 400 for DOCX file', async () => {
      const docxFile = new File(['content'], 'document.docx', {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });
      const request = createMockRequest(docxFile);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Invalid file type');
    });

    it('should return 400 for file with .pdf extension but invalid content', async () => {
      const fakeFile = createInvalidPDFFile();
      const request = createMockRequest(fakeFile);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Invalid PDF file');
    });

    it('should return 413 when file exceeds max size', async () => {
      const previousMax = process.env.PDF_PARSE_MAX_FILE_SIZE_BYTES;
      process.env.PDF_PARSE_MAX_FILE_SIZE_BYTES = '12';

      try {
        const oversized = createPDFFile('A'.repeat(100));
        const request = createMockRequest(oversized);
        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(413);
        expect(data.error).toContain('too large');
      } finally {
        if (previousMax === undefined) {
          delete process.env.PDF_PARSE_MAX_FILE_SIZE_BYTES;
        } else {
          process.env.PDF_PARSE_MAX_FILE_SIZE_BYTES = previousMax;
        }
      }
    });
  });

  describe('Rate Limiting', () => {
    it('should return 429 when request limit is exceeded for same IP', async () => {
      const previousMax = process.env.PDF_PARSE_RATE_LIMIT_MAX_REQUESTS;
      const previousWindow = process.env.PDF_PARSE_RATE_LIMIT_WINDOW_MS;
      process.env.PDF_PARSE_RATE_LIMIT_MAX_REQUESTS = '2';
      process.env.PDF_PARSE_RATE_LIMIT_WINDOW_MS = '60000';

      try {
        mockGetDocumentProxy.mockResolvedValue(
          buildMockPdf([['This line has enough characters to avoid scan warning. '.repeat(3)]]),
        );

        const file = createPDFFile();
        const headers = { 'x-forwarded-for': '203.0.113.10' };

        const first = await POST(createMockRequest(file, headers));
        const second = await POST(createMockRequest(file, headers));
        const third = await POST(createMockRequest(file, headers));
        const payload = await third.json();

        expect(first.status).toBe(200);
        expect(second.status).toBe(200);
        expect(third.status).toBe(429);
        expect(third.headers.get('Retry-After')).toBeTruthy();
        expect(payload.error).toContain('Too many PDF parse requests');
      } finally {
        if (previousMax === undefined) {
          delete process.env.PDF_PARSE_RATE_LIMIT_MAX_REQUESTS;
        } else {
          process.env.PDF_PARSE_RATE_LIMIT_MAX_REQUESTS = previousMax;
        }
        if (previousWindow === undefined) {
          delete process.env.PDF_PARSE_RATE_LIMIT_WINDOW_MS;
        } else {
          process.env.PDF_PARSE_RATE_LIMIT_WINDOW_MS = previousWindow;
        }
      }
    });
  });

  describe('Successful Parsing', () => {
    it('should extract text from valid PDF', async () => {
      mockSinglePage(['John Doe', 'Software Engineer', 'john@example.com']);

      const file = createPDFFile();
      const request = createMockRequest(file);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.text).toContain('John Doe');
      expect(data.numPages).toBe(1);
    });

    it('should normalize extracted text', async () => {
      mockSinglePage(['John   Doe', '', '', '', 'Software Engineer']);

      const file = createPDFFile();
      const request = createMockRequest(file);
      const response = await POST(request);
      const data = await response.json();

      // Interior spaces are intentionally preserved for multi-column
      // detection downstream; only leading/trailing whitespace per line
      // is trimmed by the API route.
      expect(data.text).toContain('John   Doe');
      // Multiple blank lines normalized to max 2
      expect(data.text).not.toContain('\n\n\n');
    });

    it('should handle multi-page PDFs', async () => {
      mockGetDocumentProxy.mockResolvedValueOnce(
        buildMockPdf([
          ['Page 1 content'],
          ['Page 2 content'],
          ['Page 3 content'],
        ]),
      );

      const file = createPDFFile();
      const request = createMockRequest(file);
      const response = await POST(request);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.numPages).toBe(3);
    });

    it('should handle special characters correctly', async () => {
      mockSinglePage(['José García', '• Skill 1', '• Skill 2']);

      const file = createPDFFile();
      const request = createMockRequest(file);
      const response = await POST(request);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.text).toContain('José');
    });

    it('should normalize unicode characters', async () => {
      mockSinglePage([
        '\u201CSmart quotes\u201D and \u2019apostrophes\u2019 and \u2010hyphens',
      ]);

      const file = createPDFFile();
      const request = createMockRequest(file);
      const response = await POST(request);
      const data = await response.json();

      // Smart quotes converted to standard quotes
      expect(data.text).toContain('"');
      expect(data.text).toContain("'");
    });

    it('should fix word hyphenation at line breaks', async () => {
      // Hyphen at end of one line, continuation on the next
      mockSinglePage(['Soft-', 'ware Engineer']);

      const file = createPDFFile();
      const request = createMockRequest(file);
      const response = await POST(request);
      const data = await response.json();

      // Hyphenated word should be merged
      expect(data.text).toContain('Software');
    });
  });

  describe('Scanned PDF Detection', () => {
    it('should detect empty/scanned PDF', async () => {
      mockSinglePage(['']);

      const file = createPDFFile();
      const request = createMockRequest(file);
      const response = await POST(request);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.warning).toContain('image-based');
    });

    it('should detect PDF with very little text per page', async () => {
      mockGetDocumentProxy.mockResolvedValueOnce(
        buildMockPdf([['Some text'], [], [], [], []]),
      );

      const file = createPDFFile();
      const request = createMockRequest(file);
      const response = await POST(request);
      const data = await response.json();

      // Less than 100 chars per page
      expect(data.warning).toContain('image-based');
    });

    it('should not warn for PDF with adequate text', async () => {
      const longLine = 'This is a resume with plenty of text content. '.repeat(10);
      mockSinglePage([longLine]);

      const file = createPDFFile();
      const request = createMockRequest(file);
      const response = await POST(request);
      const data = await response.json();

      expect(data.warning).toBeUndefined();
    });
  });

  describe('Error Handling', () => {
    it('should return 422 for corrupted PDF', async () => {
      mockGetDocumentProxy.mockRejectedValueOnce(
        new Error('Invalid PDF structure')
      );

      const file = createPDFFile();
      const request = createMockRequest(file);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(422);
      expect(data.error).toContain('Failed to read PDF content');
      expect(data.suggestion).toBeDefined();
    });

    it('should return 422 for encrypted PDF', async () => {
      mockGetDocumentProxy.mockRejectedValueOnce(
        new Error('PDF is encrypted')
      );

      const file = createPDFFile();
      const request = createMockRequest(file);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(422);
      expect(data.details).toContain('encrypted');
    });

    it('should return 500 for unexpected errors', async () => {
      // Mock formData to throw
      const request = {
        formData: () => Promise.reject(new Error('Network error')),
      } as unknown as NextRequest;

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to parse PDF');
    });

    it('should handle non-Error thrown values', async () => {
      mockGetDocumentProxy.mockRejectedValueOnce('String error');

      const file = createPDFFile();
      const request = createMockRequest(file);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(422);
      expect(data.details).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle PDF file with uppercase extension', async () => {
      mockSinglePage(['Content that is long enough to pass the scanned check here.']);

      const pdfHeader = '%PDF-1.4\n';
      const blob = new Blob([pdfHeader + 'content'], { type: 'application/pdf' });
      const file = new File([blob], 'resume.PDF', { type: 'application/pdf' });
      
      const request = createMockRequest(file);
      const response = await POST(request);

      expect(response.status).toBe(200);
    });

    it('should handle very large PDF', async () => {
      const largeLine = 'A'.repeat(100000);
      mockGetDocumentProxy.mockResolvedValueOnce(
        buildMockPdf(Array.from({ length: 50 }, () => [largeLine.slice(0, 2000)])),
      );

      const file = createPDFFile();
      const request = createMockRequest(file);
      const response = await POST(request);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.numPages).toBe(50);
    });

    it('should handle PDF with null characters', async () => {
      mockSinglePage(['John\x00Doe\x00Engineer and more text to satisfy length check.']);

      const file = createPDFFile();
      const request = createMockRequest(file);
      const response = await POST(request);
      const data = await response.json();

      // Null characters should be removed
      expect(data.text).not.toContain('\x00');
    });

    it('should handle whitespace-only PDF', async () => {
      mockSinglePage(['   ', '\t  ', '   ']);

      const file = createPDFFile();
      const request = createMockRequest(file);
      const response = await POST(request);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.warning).toContain('image-based');
    });

    it('should handle bullet point variations', async () => {
      mockSinglePage(['\u2022 Item 1', '\u25CF Item 2', '\u25CB Item 3']);

      const file = createPDFFile();
      const request = createMockRequest(file);
      const response = await POST(request);
      const data = await response.json();

      // All bullet types should be normalized to •
      expect(data.text).toContain('• Item 1');
    });
  });
});
