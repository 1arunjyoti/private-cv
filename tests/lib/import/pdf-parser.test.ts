import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PDFParser } from '@/lib/import/pdf-parser';
import { createMockFile } from '@/tests/utils/factories';

// Mock fetch for API calls
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('PDFParser', () => {
  let parser: PDFParser;

  beforeEach(() => {
    parser = new PDFParser();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('extractText', () => {
    it('should call API with file', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          text: 'Resume content here',
          numPages: 1,
        }),
      });

      const file = createMockFile('pdf', 5000, 'resume.pdf');
      const result = await parser.extractText(file);

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith('/api/parse-pdf', expect.objectContaining({
        method: 'POST',
      }));
      expect(result).toBe('Resume content here');
    });

    it('should throw error on API failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Bad Request',
        json: async () => ({
          error: 'Invalid file type',
        }),
      });

      const file = createMockFile('pdf', 5000);
      await expect(parser.extractText(file)).rejects.toThrow('Invalid file type');
    });

    it('should throw error when success is false', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: false,
          error: 'Failed to extract text',
        }),
      });

      const file = createMockFile('pdf', 5000);
      await expect(parser.extractText(file)).rejects.toThrow('Failed to extract text');
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const file = createMockFile('pdf', 5000);
      await expect(parser.extractText(file)).rejects.toThrow('Network error');
    });

    it('should include details and suggestion in error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Unprocessable Entity',
        json: async () => ({
          error: 'Failed to read PDF',
          details: 'Corrupted file',
          suggestion: 'Try another PDF',
        }),
      });

      const file = createMockFile('pdf', 5000);
      await expect(parser.extractText(file)).rejects.toThrow(/Failed to read PDF.*Corrupted file.*Try another/);
    });
  });

  describe('parse', () => {
    it('should return parsed resume data on success', async () => {
      const resumeText = `
John Doe
Software Engineer
john@example.com
(555) 123-4567

Experience
Senior Developer at Tech Corp
2020 - Present
• Built scalable applications
• Led team of 5 engineers

Education
Bachelor of Science in Computer Science
University of Technology
2016 - 2020

Skills
JavaScript, Python, React, Node.js
      `;

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          text: resumeText,
          numPages: 1,
        }),
      });

      const file = createMockFile('pdf', 5000, 'resume.pdf');
      const result = await parser.parse(file);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.basics?.name).toBeDefined();
      expect(result.confidence.overall).toBeGreaterThan(0);
      expect(result.errors.length).toBe(0);
    });

    it('should return failure for empty PDF', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          text: '',
          numPages: 1,
        }),
      });

      const file = createMockFile('pdf', 1000);
      const result = await parser.parse(file);

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('Could not extract text');
    });

    it('should return failure for whitespace-only PDF', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          text: '   \n\t  \n   ',
          numPages: 1,
        }),
      });

      const file = createMockFile('pdf', 1000);
      const result = await parser.parse(file);

      expect(result.success).toBe(false);
    });

    it('should add warning for scanned PDFs', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          text: 'Some text',
          numPages: 1,
          warning: 'This PDF appears to be image-based',
        }),
      });

      const file = createMockFile('pdf', 5000);
      const result = await parser.parse(file);

      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings.some(w => w.includes('image-based'))).toBe(true);
    });

    it('should add warning for low confidence', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          text: 'Random text without resume structure',
          numPages: 1,
        }),
      });

      const file = createMockFile('pdf', 5000);
      const result = await parser.parse(file);

      expect(result.warnings.some(w => w.toLowerCase().includes('confidence'))).toBe(true);
    });

    it('should return error result on API error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Server Error',
        json: async () => ({
          error: 'Server error',
        }),
      });

      const file = createMockFile('pdf', 5000);
      const result = await parser.parse(file);

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should include raw text in result', async () => {
      const rawText = 'John Doe\nDeveloper';
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          text: rawText,
          numPages: 1,
        }),
      });

      const file = createMockFile('pdf', 5000);
      const result = await parser.parse(file);

      expect(result.rawText).toBe(rawText);
    });

    it('should extract contact information', async () => {
      const resumeText = `
Jane Smith
jane.smith@example.com
(555) 987-6543
linkedin.com/in/janesmith
github.com/janesmith
      `;

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          text: resumeText,
          numPages: 1,
        }),
      });

      const file = createMockFile('pdf', 5000);
      const result = await parser.parse(file);

      expect(result.data.basics?.email).toBe('jane.smith@example.com');
      expect(result.data.basics?.phone).toMatch(/555.*987.*6543/);
    });

    it('should parse work experience section', async () => {
      const resumeText = `
John Doe
Developer

Work Experience
Senior Engineer at Google
2020 - Present
• Developed microservices
• Led team of 3

Software Developer at Startup
2018 - 2020
• Built web applications
      `;

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          text: resumeText,
          numPages: 1,
        }),
      });

      const file = createMockFile('pdf', 5000);
      const result = await parser.parse(file);

      expect(result.data.work).toBeDefined();
      expect(result.data.work?.length).toBeGreaterThan(0);
    });

    it('should parse education section', async () => {
      const resumeText = `
John Doe

Education
Master of Science in Computer Science
Stanford University
2018 - 2020

Bachelor of Engineering
MIT
2014 - 2018
      `;

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          text: resumeText,
          numPages: 1,
        }),
      });

      const file = createMockFile('pdf', 5000);
      const result = await parser.parse(file);

      expect(result.data.education).toBeDefined();
      expect(result.data.education?.length).toBeGreaterThan(0);
    });

    it('should parse skills section', async () => {
      const resumeText = `
John Doe

Skills
Programming: JavaScript, Python, Java
Frameworks: React, Node.js, Django
Tools: Git, Docker, AWS
      `;

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          text: resumeText,
          numPages: 1,
        }),
      });

      const file = createMockFile('pdf', 5000);
      const result = await parser.parse(file);

      expect(result.data.skills).toBeDefined();
      expect(result.data.skills?.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle PDF with only headers', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          text: 'Experience\nEducation\nSkills',
          numPages: 1,
        }),
      });

      const file = createMockFile('pdf', 1000);
      const result = await parser.parse(file);

      // Should not crash, may have low confidence
      expect(result).toBeDefined();
    });

    it('should handle multi-page PDF', async () => {
      const longText = 'John Doe\n' + 'Experience content\n'.repeat(100);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          text: longText,
          numPages: 5,
        }),
      });

      const file = createMockFile('pdf', 50000);
      const result = await parser.parse(file);

      expect(result).toBeDefined();
    });

    it('should handle special characters in PDF', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          text: 'José García\nDéveloppeur\njose@example.com',
          numPages: 1,
        }),
      });

      const file = createMockFile('pdf', 5000);
      const result = await parser.parse(file);

      expect(result.data.basics?.name).toContain('José');
    });

    it('should handle timeout gracefully', async () => {
      mockFetch.mockImplementation(() => new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout')), 100);
      }));

      const file = createMockFile('pdf', 5000);
      const result = await parser.parse(file);

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});
