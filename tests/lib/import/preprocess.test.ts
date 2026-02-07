import { describe, it, expect } from 'vitest';
import { preprocessResumeText, reorderMultiColumnText } from '@/lib/import/preprocess';

describe('preprocessResumeText', () => {
  describe('Unicode normalization', () => {
    it('should normalize fancy dashes to hyphens', () => {
      const text = 'Jan 2020 \u2013 Dec 2023'; // en-dash
      const result = preprocessResumeText(text);
      expect(result).toContain('Jan 2020 - Dec 2023');
    });

    it('should normalize curly quotes to straight quotes', () => {
      const text = '\u201CHello\u201D and \u2018World\u2019';
      const result = preprocessResumeText(text);
      expect(result).toContain('"Hello"');
      expect(result).toContain("'World'");
    });

    it('should normalize bullet variants to standard bullet', () => {
      const text = '\u25CF Item 1\n\u25CB Item 2\n\u2219 Item 3';
      const result = preprocessResumeText(text);
      expect(result).toContain('• Item 1');
      expect(result).toContain('• Item 2');
      expect(result).toContain('• Item 3');
    });

    it('should normalize non-breaking spaces', () => {
      const text = 'Hello\u00A0World\u202FTest';
      const result = preprocessResumeText(text);
      expect(result).toContain('Hello World Test');
    });

    it('should strip control characters but keep newlines', () => {
      const text = 'Line 1\x00\x01\nLine 2';
      const result = preprocessResumeText(text);
      expect(result).toBe('Line 1\nLine 2');
    });
  });

  describe('OCR artifact fixes', () => {
    it('should fix common ligatures', () => {
      const text = 'ﬁnding and ﬂow';
      const result = preprocessResumeText(text);
      expect(result).toContain('finding');
      expect(result).toContain('flow');
    });

    it('should fix broken section heading words', () => {
      expect(preprocessResumeText('Exper ience')).toContain('Experience');
      expect(preprocessResumeText('Educ ation')).toContain('Education');
      expect(preprocessResumeText('Skil ls')).toContain('Skills');
    });
  });

  describe('Whitespace normalization', () => {
    it('should collapse multiple spaces', () => {
      const text = 'Hello    World   Test';
      const result = preprocessResumeText(text);
      expect(result).toBe('Hello World Test');
    });

    it('should fix end-of-line hyphenation', () => {
      const text = 'Micro-\nsoft Corporation';
      const result = preprocessResumeText(text);
      expect(result).toContain('Microsoft Corporation');
    });

    it('should collapse excessive blank lines', () => {
      const text = 'Section 1\n\n\n\n\nSection 2';
      const result = preprocessResumeText(text);
      expect(result).toBe('Section 1\n\nSection 2');
    });

    it('should trim each line', () => {
      const text = '  Hello  \n  World  ';
      const result = preprocessResumeText(text);
      expect(result).toBe('Hello\nWorld');
    });
  });

  describe('Page artifact removal', () => {
    it('should remove "Page X of Y" lines', () => {
      const text = 'Some content\nPage 1 of 3\nMore content';
      const result = preprocessResumeText(text);
      expect(result).not.toContain('Page 1 of 3');
      expect(result).toContain('Some content');
      expect(result).toContain('More content');
    });
  });

  describe('Section separator normalization', () => {
    it('should remove decorative lines', () => {
      const text = 'EXPERIENCE\n-----------\nSome content';
      const result = preprocessResumeText(text);
      expect(result).not.toContain('-----');
      // ALL-CAPS heading is preserved (case may or may not change)
      expect(result.toUpperCase()).toContain('EXPERIENCE');
      expect(result).toContain('Some content');
    });
  });

  describe('Edge cases', () => {
    it('should handle empty string', () => {
      expect(preprocessResumeText('')).toBe('');
    });

    it('should handle null-ish input', () => {
      expect(preprocessResumeText('')).toBe('');
    });

    it('should not crash on very long input', () => {
      const longText = 'Developer at Company\n' + '• Task description here\n'.repeat(5000);
      expect(() => preprocessResumeText(longText)).not.toThrow();
    });
  });
});

describe('reorderMultiColumnText', () => {
  it('should leave single-column text unchanged', () => {
    const text = 'Line 1\nLine 2\nLine 3\nLine 4\nLine 5\nLine 6';
    expect(reorderMultiColumnText(text)).toBe(text);
  });

  it('should reorder two-column text', () => {
    // Simulate 2-column PDF text with 4+ space gaps
    const lines = [
      'Left column line 1      Right column line 1',
      'Left column line 2      Right column line 2',
      'Left column line 3      Right column line 3',
      'Left column line 4      Right column line 4',
      'Left column line 5      Right column line 5',
      'Left column line 6      Right column line 6',
    ];
    const text = lines.join('\n');
    const result = reorderMultiColumnText(text);

    // Left column content should come before right column content
    const leftIdx = result.indexOf('Left column line 1');
    const rightIdx = result.indexOf('Right column line 1');
    expect(leftIdx).toBeLessThan(rightIdx);
  });

  it('should not split text that only has a few wide-gap lines', () => {
    // Only 1 out of 6 lines has a gap — should not transform
    const lines = [
      'Normal line 1',
      'Normal line 2',
      'Left side content      Right side content',
      'Normal line 3',
      'Normal line 4',
      'Normal line 5',
    ];
    const text = lines.join('\n');
    const result = reorderMultiColumnText(text);
    expect(result).toBe(text);
  });
});
