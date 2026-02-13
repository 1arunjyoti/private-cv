/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from 'vitest';
import { formatDate, getLevelScore, formatSectionTitle, mmToPt } from '@/lib/template-utils';

describe('Template Utils', () => {
  describe('formatDate', () => {
    it('should format valid ISO date', () => {
      const result = formatDate('2023-01-15');
      expect(result).toBe('Jan 2023');
    });

    it('should handle "Present" correctly', () => {
      const result = formatDate('Present');
      expect(result).toBe('Present');
    });

    it('should handle "present" (lowercase)', () => {
      const result = formatDate('present');
      expect(result).toBe('Present');
    });

    it('should handle empty string', () => {
      const result = formatDate('');
      expect(result).toBe('');
    });

    it('should handle invalid date format gracefully', () => {
      const result = formatDate('not-a-date');
      // Should return original string or empty
      expect(typeof result).toBe('string');
    });

    it('should format YYYY-MM format', () => {
      const result = formatDate('2023-01');
      expect(result).toMatch(/2023/);
    });

    it('should format full date with day', () => {
      const result = formatDate('2023-01-15');
      expect(result).toMatch(/Jan|January/);
      expect(result).toMatch(/2023/);
    });

    it('should handle different date formats', () => {
      expect(formatDate('2023')).toBe('2023');
      expect(formatDate('2023-01')).toContain('2023');
      expect(formatDate('2023-01-01')).toContain('2023');
    });

    it('should handle leap year dates', () => {
      const result = formatDate('2024-02-29');
      expect(result).toMatch(/Feb|February/);
      expect(result).toMatch(/2024/);
    });
  });

  describe('getLevelScore', () => {
    it('should return correct score for Beginner', () => {
      expect(getLevelScore('Beginner')).toBe(1);
    });

    it('should return correct score for Intermediate', () => {
      expect(getLevelScore('Intermediate')).toBe(2);
    });

    it('should return correct score for Advanced', () => {
      expect(getLevelScore('Advanced')).toBe(3);
    });

    it('should return correct score for Expert', () => {
      expect(getLevelScore('Expert')).toBe(4);
    });

    it('should be case-insensitive', () => {
      expect(getLevelScore('beginner')).toBe(1);
      expect(getLevelScore('EXPERT')).toBe(4);
      expect(getLevelScore('InTeRmEdIaTe')).toBe(2);
    });

    it('should handle unknown levels', () => {
      expect(getLevelScore('Unknown')).toBe(0);
      expect(getLevelScore('')).toBe(0);
    });

    it('should handle null/undefined', () => {
      expect(getLevelScore(null as any)).toBe(0);
      expect(getLevelScore(undefined as any)).toBe(0);
    });
  });

  describe('mmToPt', () => {
    it('should convert mm to pt correctly', () => {
      // 1mm = 2.83465pt
      expect(mmToPt(10)).toBeCloseTo(28.35, 1);
    });

    it('should handle zero', () => {
      expect(mmToPt(0)).toBe(0);
    });

    it('should handle negative values', () => {
      expect(mmToPt(-10)).toBeLessThan(0);
    });

    it('should handle decimal values', () => {
      expect(mmToPt(5.5)).toBeCloseTo(15.59, 1);
    });

    it('should handle very large values', () => {
      const result = mmToPt(1000);
      expect(result).toBeGreaterThan(2000);
    });
  });

  describe('formatSectionTitle', () => {
    it('should format to uppercase', () => {
      const result = formatSectionTitle('work experience', 'uppercase');
      expect(result).toBe('WORK EXPERIENCE');
    });

    it('should format to lowercase', () => {
      const result = formatSectionTitle('WORK EXPERIENCE', 'lowercase');
      expect(result).toBe('work experience');
    });

    it('should format to title case', () => {
      const result = formatSectionTitle('work experience', 'titlecase');
      expect(result).toBe('Work Experience');
    });

    it('should format to capitalize (first letter only)', () => {
      const result = formatSectionTitle('work experience', 'capitalize');
      expect(result).toBe('Work experience');
    });

    it('should handle empty string', () => {
      expect(formatSectionTitle('', 'uppercase')).toBe('');
      expect(formatSectionTitle('', 'lowercase')).toBe('');
    });

    it('should handle single word', () => {
      expect(formatSectionTitle('work', 'titlecase')).toBe('Work');
      expect(formatSectionTitle('WORK', 'lowercase')).toBe('work');
    });

    it('should handle special characters', () => {
      const result = formatSectionTitle('work & experience', 'titlecase');
      expect(result).toContain('&');
    });

    it('should handle multiple spaces', () => {
      const result = formatSectionTitle('work  experience', 'titlecase');
      expect(result).toMatch(/Work\s+Experience/);
    });

    it('should handle unicode characters', () => {
      const result = formatSectionTitle('café résumé', 'titlecase');
      expect(result).toContain('Café');
    });

    it('should default to original if invalid capitalization', () => {
      const result = formatSectionTitle('Work Experience', 'invalid' as any);
      expect(typeof result).toBe('string');
    });
  });
});
