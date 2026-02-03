import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/parse-pdf/route';
import { NextRequest } from 'next/server';

// Mock unpdf
vi.mock('unpdf', () => ({
  extractText: vi.fn(),
}));

import { extractText } from 'unpdf';

/**
 * Helper to create a mock NextRequest with FormData
 */
function createMockRequest(file: File | null): NextRequest {
  const formData = new FormData();
  if (file) {
    formData.append('file', file);
  }

  return {
    formData: () => Promise.resolve(formData),
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
  });

  describe('Successful Parsing', () => {
    it('should extract text from valid PDF', async () => {
      vi.mocked(extractText).mockResolvedValueOnce({
        text: 'John Doe\nSoftware Engineer\njohn@example.com',
        totalPages: 1,
      });

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
      vi.mocked(extractText).mockResolvedValueOnce({
        text: 'John   Doe\n\n\n\nSoftware Engineer',
        totalPages: 1,
      });

      const file = createPDFFile();
      const request = createMockRequest(file);
      const response = await POST(request);
      const data = await response.json();

      // Multiple spaces normalized to single space
      expect(data.text).not.toContain('   ');
      // Multiple newlines normalized to max 2
      expect(data.text).not.toContain('\n\n\n');
    });

    it('should handle multi-page PDFs', async () => {
      vi.mocked(extractText).mockResolvedValueOnce({
        text: 'Page 1 content\nPage 2 content\nPage 3 content',
        totalPages: 3,
      });

      const file = createPDFFile();
      const request = createMockRequest(file);
      const response = await POST(request);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.numPages).toBe(3);
    });

    it('should handle special characters correctly', async () => {
      vi.mocked(extractText).mockResolvedValueOnce({
        text: 'José García\n• Skill 1\n• Skill 2',
        totalPages: 1,
      });

      const file = createPDFFile();
      const request = createMockRequest(file);
      const response = await POST(request);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.text).toContain('José');
    });

    it('should normalize unicode characters', async () => {
      vi.mocked(extractText).mockResolvedValueOnce({
        text: '\u201CSmart quotes\u201D and \u2019apostrophes\u2019 and \u2010hyphens',
        totalPages: 1,
      });

      const file = createPDFFile();
      const request = createMockRequest(file);
      const response = await POST(request);
      const data = await response.json();

      // Smart quotes converted to standard quotes
      expect(data.text).toContain('"');
      expect(data.text).toContain("'");
    });

    it('should fix word hyphenation at line breaks', async () => {
      vi.mocked(extractText).mockResolvedValueOnce({
        text: 'Soft-\nware Engineer',
        totalPages: 1,
      });

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
      vi.mocked(extractText).mockResolvedValueOnce({
        text: '',
        totalPages: 1,
      });

      const file = createPDFFile();
      const request = createMockRequest(file);
      const response = await POST(request);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.warning).toContain('image-based');
    });

    it('should detect PDF with very little text per page', async () => {
      vi.mocked(extractText).mockResolvedValueOnce({
        text: 'Some text',
        totalPages: 5,
      });

      const file = createPDFFile();
      const request = createMockRequest(file);
      const response = await POST(request);
      const data = await response.json();

      // Less than 100 chars per page (9 chars / 5 pages = ~2 chars/page)
      expect(data.warning).toContain('image-based');
    });

    it('should not warn for PDF with adequate text', async () => {
      const longText = 'This is a resume with plenty of text content. '.repeat(10);
      vi.mocked(extractText).mockResolvedValueOnce({
        text: longText,
        totalPages: 1,
      });

      const file = createPDFFile();
      const request = createMockRequest(file);
      const response = await POST(request);
      const data = await response.json();

      expect(data.warning).toBeUndefined();
    });
  });

  describe('Error Handling', () => {
    it('should return 422 for corrupted PDF', async () => {
      vi.mocked(extractText).mockRejectedValueOnce(
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
      vi.mocked(extractText).mockRejectedValueOnce(
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
      vi.mocked(extractText).mockRejectedValueOnce('String error');

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
      vi.mocked(extractText).mockResolvedValueOnce({
        text: 'Content',
        totalPages: 1,
      });

      const pdfHeader = '%PDF-1.4\n';
      const blob = new Blob([pdfHeader + 'content'], { type: 'application/pdf' });
      const file = new File([blob], 'resume.PDF', { type: 'application/pdf' });
      
      const request = createMockRequest(file);
      const response = await POST(request);

      expect(response.status).toBe(200);
    });

    it('should handle very large PDF', async () => {
      const largeText = 'A'.repeat(100000);
      vi.mocked(extractText).mockResolvedValueOnce({
        text: largeText,
        totalPages: 50,
      });

      const file = createPDFFile();
      const request = createMockRequest(file);
      const response = await POST(request);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.numPages).toBe(50);
    });

    it('should handle PDF with null characters', async () => {
      vi.mocked(extractText).mockResolvedValueOnce({
        text: 'John\x00Doe\x00Engineer',
        totalPages: 1,
      });

      const file = createPDFFile();
      const request = createMockRequest(file);
      const response = await POST(request);
      const data = await response.json();

      // Null characters should be removed
      expect(data.text).not.toContain('\x00');
    });

    it('should handle undefined totalPages', async () => {
      vi.mocked(extractText).mockResolvedValueOnce({
        text: 'Some content here',
      } as { text: string; totalPages: number });

      const file = createPDFFile();
      const request = createMockRequest(file);
      const response = await POST(request);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.numPages).toBe(1); // Default to 1
    });

    it('should handle whitespace-only PDF', async () => {
      vi.mocked(extractText).mockResolvedValueOnce({
        text: '   \n\t  \n   ',
        totalPages: 1,
      });

      const file = createPDFFile();
      const request = createMockRequest(file);
      const response = await POST(request);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.warning).toContain('image-based');
    });

    it('should handle bullet point variations', async () => {
      vi.mocked(extractText).mockResolvedValueOnce({
        text: '\u2022 Item 1\n\u25CF Item 2\n\u25CB Item 3',
        totalPages: 1,
      });

      const file = createPDFFile();
      const request = createMockRequest(file);
      const response = await POST(request);
      const data = await response.json();

      // All bullet types should be normalized to •
      expect(data.text).toContain('• Item 1');
    });
  });
});
