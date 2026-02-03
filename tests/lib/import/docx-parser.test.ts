import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DOCXParser } from '@/lib/import/docx-parser';
import { createMockFile } from '@/tests/utils/factories';

// Mock mammoth module
vi.mock('mammoth', () => ({
  default: {
    extractRawText: vi.fn(),
    convertToHtml: vi.fn(),
  },
}));

import mammoth from 'mammoth';

describe('DOCXParser', () => {
  let parser: DOCXParser;

  beforeEach(() => {
    parser = new DOCXParser();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('extractText', () => {
    it('should extract text from DOCX file', async () => {
      const mockText = 'John Doe\nSoftware Engineer';
      vi.mocked(mammoth.extractRawText).mockResolvedValueOnce({
        value: mockText,
        messages: [],
      });

      const file = createMockFile('docx', 5000, 'resume.docx');
      const result = await parser.extractText(file);

      expect(mammoth.extractRawText).toHaveBeenCalled();
      expect(result).toBe(mockText);
    });

    it('should handle empty DOCX', async () => {
      vi.mocked(mammoth.extractRawText).mockResolvedValueOnce({
        value: '',
        messages: [],
      });

      const file = createMockFile('docx', 1000);
      const result = await parser.extractText(file);

      expect(result).toBe('');
    });

    it('should handle mammoth extraction error', async () => {
      vi.mocked(mammoth.extractRawText).mockRejectedValueOnce(
        new Error('Corrupted file')
      );

      const file = createMockFile('docx', 5000);
      await expect(parser.extractText(file)).rejects.toThrow('Corrupted file');
    });
  });

  describe('extractHtml', () => {
    it('should extract HTML from DOCX file', async () => {
      const mockHtml = '<p><strong>John Doe</strong></p><p>Software Engineer</p>';
      vi.mocked(mammoth.convertToHtml).mockResolvedValueOnce({
        value: mockHtml,
        messages: [],
      });

      const file = createMockFile('docx', 5000);
      const result = await parser.extractHtml(file);

      expect(mammoth.convertToHtml).toHaveBeenCalled();
      expect(result.html).toBe(mockHtml);
    });

    it('should include mammoth messages', async () => {
      (vi.mocked(mammoth.convertToHtml) as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        value: '<p>Content</p>',
        messages: [
          { message: 'Warning: Unsupported style', type: 'warning' },
        ],
      });

      const file = createMockFile('docx', 5000);
      const result = await parser.extractHtml(file);

      expect(result.messages.length).toBeGreaterThan(0);
    });
  });

  describe('parse', () => {
    const setupMocks = (text: string, html: string = '<p>Content</p>') => {
      vi.mocked(mammoth.extractRawText).mockResolvedValueOnce({
        value: text,
        messages: [],
      });
      vi.mocked(mammoth.convertToHtml).mockResolvedValueOnce({
        value: html,
        messages: [],
      });
    };

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

      setupMocks(resumeText);

      const file = createMockFile('docx', 5000, 'resume.docx');
      const result = await parser.parse(file);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.basics?.name).toBeDefined();
      expect(result.confidence.overall).toBeGreaterThan(0);
      expect(result.errors.length).toBe(0);
    });

    it('should return failure for empty DOCX', async () => {
      setupMocks('', '');

      const file = createMockFile('docx', 1000);
      const result = await parser.parse(file);

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('Could not extract text');
    });

    it('should return failure for whitespace-only DOCX', async () => {
      setupMocks('   \n\t  \n   ');

      const file = createMockFile('docx', 1000);
      const result = await parser.parse(file);

      expect(result.success).toBe(false);
    });

    it('should add warning for low confidence', async () => {
      setupMocks('Random text without resume structure');

      const file = createMockFile('docx', 5000);
      const result = await parser.parse(file);

      expect(result.warnings.some(w => w.toLowerCase().includes('confidence'))).toBe(true);
    });

    it('should add mammoth warnings to result', async () => {
      vi.mocked(mammoth.extractRawText).mockResolvedValueOnce({
        value: 'John Doe\nDeveloper',
        messages: [],
      });
      (vi.mocked(mammoth.convertToHtml) as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        value: '<p>John Doe</p>',
        messages: [
          { message: 'Warning: Unsupported feature', type: 'warning' },
        ],
      });

      const file = createMockFile('docx', 5000);
      const result = await parser.parse(file);

      expect(result.warnings.some(w => w.includes('Warning'))).toBe(true);
    });

    it('should return error result on parse error', async () => {
      vi.mocked(mammoth.extractRawText).mockRejectedValueOnce(
        new Error('File corrupted')
      );

      const file = createMockFile('docx', 5000);
      const result = await parser.parse(file);

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should include raw text in result', async () => {
      const rawText = 'John Doe\nDeveloper';
      setupMocks(rawText);

      const file = createMockFile('docx', 5000);
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

      setupMocks(resumeText);

      const file = createMockFile('docx', 5000);
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

      setupMocks(resumeText);

      const file = createMockFile('docx', 5000);
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

      setupMocks(resumeText);

      const file = createMockFile('docx', 5000);
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

      setupMocks(resumeText);

      const file = createMockFile('docx', 5000);
      const result = await parser.parse(file);

      expect(result.data.skills).toBeDefined();
      expect(result.data.skills?.length).toBeGreaterThan(0);
    });

    it('should parse projects section', async () => {
      const resumeText = `
John Doe

Projects
E-commerce Platform
Built a full-stack shopping site
• React frontend
• Node.js backend
https://github.com/john/ecommerce
      `;

      setupMocks(resumeText);

      const file = createMockFile('docx', 5000);
      const result = await parser.parse(file);

      expect(result.data.projects).toBeDefined();
    });

    it('should parse certificates section', async () => {
      const resumeText = `
John Doe

Certifications
• AWS Solutions Architect - Amazon
• Google Cloud Professional
• PMP - Project Management Institute
      `;

      setupMocks(resumeText);

      const file = createMockFile('docx', 5000);
      const result = await parser.parse(file);

      expect(result.data.certificates).toBeDefined();
    });

    it('should parse languages section', async () => {
      const resumeText = `
John Doe

Languages
• English - Native
• Spanish - Fluent
• French - Intermediate
      `;

      setupMocks(resumeText);

      const file = createMockFile('docx', 5000);
      const result = await parser.parse(file);

      expect(result.data.languages).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    const setupMocks = (text: string, html: string = '<p>Content</p>') => {
      vi.mocked(mammoth.extractRawText).mockResolvedValueOnce({
        value: text,
        messages: [],
      });
      vi.mocked(mammoth.convertToHtml).mockResolvedValueOnce({
        value: html,
        messages: [],
      });
    };

    it('should handle DOCX with only headers', async () => {
      setupMocks('Experience\nEducation\nSkills');

      const file = createMockFile('docx', 1000);
      const result = await parser.parse(file);

      // Should not crash, may have low confidence
      expect(result).toBeDefined();
    });

    it('should handle large DOCX files', async () => {
      const longText = 'John Doe\n' + 'Experience content\n'.repeat(500);
      setupMocks(longText);

      const file = createMockFile('docx', 100000);
      const result = await parser.parse(file);

      expect(result).toBeDefined();
    });

    it('should handle special characters', async () => {
      setupMocks('José García\nDéveloppeur\njose@example.com');

      const file = createMockFile('docx', 5000);
      const result = await parser.parse(file);

      expect(result.data.basics?.name).toContain('José');
    });

    it('should handle DOCX with tables', async () => {
      // Tables are converted to text by mammoth
      setupMocks('Skills\nJavaScript | Python | Java');

      const file = createMockFile('docx', 5000);
      const result = await parser.parse(file);

      expect(result).toBeDefined();
    });

    it('should handle DOCX with images gracefully', async () => {
      vi.mocked(mammoth.extractRawText).mockResolvedValueOnce({
        value: 'John Doe\nDeveloper',
        messages: [],
      });
      (vi.mocked(mammoth.convertToHtml) as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        value: '<p>John Doe</p><img src="data:image/png;base64,...">',
        messages: [{ message: 'Image not included', type: 'warning' }],
      });

      const file = createMockFile('docx', 5000);
      const result = await parser.parse(file);

      // Should parse text despite image warnings
      expect(result.success).toBe(true);
    });

    it('should handle malformed content gracefully', async () => {
      setupMocks('Random\x00garbage\x00text with nulls');

      const file = createMockFile('docx', 5000);
      const result = await parser.parse(file);

      expect(result).toBeDefined();
    });
  });

  describe('DOCX vs PDF specific features', () => {
    const setupMocks = (text: string, html: string = '<p>Content</p>') => {
      vi.mocked(mammoth.extractRawText).mockResolvedValueOnce({
        value: text,
        messages: [],
      });
      vi.mocked(mammoth.convertToHtml).mockResolvedValueOnce({
        value: html,
        messages: [],
      });
    };

    it('should have higher confidence threshold for DOCX', async () => {
      // DOCX typically preserves structure better, so low confidence
      // warning threshold is different (30 vs 20 for PDF)
      setupMocks('Some minimal content');

      const file = createMockFile('docx', 5000);
      const result = await parser.parse(file);

      // Should have a confidence warning for low-quality content
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('should use HTML extraction for better structure', async () => {
      const text = 'John Doe\nDeveloper';
      const html = '<h1>John Doe</h1><p>Developer</p>';

      vi.mocked(mammoth.extractRawText).mockResolvedValueOnce({
        value: text,
        messages: [],
      });
      vi.mocked(mammoth.convertToHtml).mockResolvedValueOnce({
        value: html,
        messages: [],
      });

      const file = createMockFile('docx', 5000);
      await parser.parse(file);

      // Both extractRawText and convertToHtml should be called
      expect(mammoth.extractRawText).toHaveBeenCalled();
      expect(mammoth.convertToHtml).toHaveBeenCalled();
    });
  });
});
