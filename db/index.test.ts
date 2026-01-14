import { describe, it, expect } from 'vitest';
import { db } from '@/db';

describe('Database Schema', () => {
  it('should have resumes table defined', () => {
    expect(db.resumes).toBeDefined();
  });

  it('should have settings table defined', () => {
    expect(db.settings).toBeDefined();
  });

  it('should be named ResumeBuilderDB', () => {
    expect(db.name).toBe('ResumeBuilderDB');
  });
});
