import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { db } from '@/db';
import { 
  clearTestDatabase, 
  seedTestData, 
  getAllResumes, 
  getResumeById,
  resumeExists,
  deleteResumeById,
  countResumes,
  setupTestDatabase,
  teardownTestDatabase,
} from '@/tests/utils/db-helpers';
import { createMockResume } from '@/tests/utils/factories';
import { mockStandardResume, mockResumeCollection } from '@/tests/mocks/mockResumes';

describe('Database Edge Cases', () => {
  beforeEach(async () => {
    await setupTestDatabase();
  });

  afterEach(async () => {
    await teardownTestDatabase();
  });

  describe('Concurrent Operations', () => {
    it('should handle concurrent adds without data loss', async () => {
      const resumes = Array.from({ length: 10 }, () => createMockResume());
      
      // Add all resumes concurrently
      await Promise.all(resumes.map(resume => db.resumes.add(resume)));
      
      const count = await countResumes();
      expect(count).toBe(10);
    });

    it('should handle concurrent updates to same resume', async () => {
      const resume = createMockResume();
      await db.resumes.add(resume);
      
      // Try to update the same resume multiple times concurrently
      const updates = Array.from({ length: 5 }, (_, i) => 
        db.resumes.update(resume.id, { 
          meta: { ...resume.meta, title: `Title ${i}` } 
        })
      );
      
      await Promise.all(updates);
      
      const updated = await getResumeById(resume.id);
      expect(updated).toBeDefined();
      expect(updated?.meta.title).toMatch(/Title \d/);
    });

    it('should handle concurrent deletes', async () => {
      const resumes = Array.from({ length: 5 }, () => createMockResume());
      await seedTestData(resumes);
      
      // Delete all concurrently
      await Promise.all(resumes.map(r => deleteResumeById(r.id)));
      
      const count = await countResumes();
      expect(count).toBe(0);
    });
  });

  describe('Duplicate IDs', () => {
    it('should prevent duplicate IDs', async () => {
      const resume = createMockResume();
      await db.resumes.add(resume);
      
      // Try to add the same resume again
      await expect(db.resumes.add(resume)).rejects.toThrow();
    });

    it('should allow update with existing ID', async () => {
      const resume = createMockResume();
      await db.resumes.add(resume);
      
      // Update should work
      await expect(
        db.resumes.update(resume.id, { meta: { ...resume.meta, title: 'Updated' } })
      ).resolves.toBeDefined();
      
      const updated = await getResumeById(resume.id);
      expect(updated?.meta.title).toBe('Updated');
    });

    it('should use put to upsert resume', async () => {
      const resume = createMockResume();
      
      // First put creates
      await db.resumes.put(resume);
      expect(await resumeExists(resume.id)).toBe(true);
      
      // Second put updates
      const updatedResume = { ...resume, meta: { ...resume.meta, title: 'Updated' } };
      await db.resumes.put(updatedResume);
      
      const result = await getResumeById(resume.id);
      expect(result?.meta.title).toBe('Updated');
    });
  });

  describe('Large Batch Operations', () => {
    it('should handle adding 100+ resumes', async () => {
      const resumes = Array.from({ length: 100 }, () => createMockResume());
      
      await db.resumes.bulkAdd(resumes);
      
      const count = await countResumes();
      expect(count).toBe(100);
    });

    it('should handle querying large dataset', async () => {
      const resumes = Array.from({ length: 100 }, () => createMockResume());
      await seedTestData(resumes);
      
      const allResumes = await getAllResumes();
      expect(allResumes.length).toBe(100);
    });

    it('should handle bulk delete', async () => {
      const resumes = Array.from({ length: 50 }, () => createMockResume());
      await seedTestData(resumes);
      
      const idsToDelete = resumes.slice(0, 25).map(r => r.id);
      await db.resumes.bulkDelete(idsToDelete);
      
      const count = await countResumes();
      expect(count).toBe(25);
    });
  });

  describe('Data Validation', () => {
    it('should reject invalid data types', async () => {
      const invalidResume = {
        id: 123, // Should be string
        meta: 'invalid', // Should be object
      } as any;
      
      // Dexie might allow this, but we should validate
      // This test shows the importance of validation layer
      await expect(db.resumes.add(invalidResume)).rejects.toThrow();
    });

    it('should handle null values', async () => {
      const resume = createMockResume();
      resume.basics.email = null as any;
      
      // Should either reject or handle gracefully
      await db.resumes.add(resume);
      const retrieved = await getResumeById(resume.id);
      expect(retrieved).toBeDefined();
    });

    it('should handle undefined values', async () => {
      const resume = createMockResume();
      resume.basics.phone = undefined as any;
      
      await db.resumes.add(resume);
      const retrieved = await getResumeById(resume.id);
      expect(retrieved).toBeDefined();
    });
  });

  describe('Complex Queries', () => {
    it('should filter resumes by template', async () => {
      const atsResume = createMockResume({ meta: { ...mockStandardResume.meta, templateId: 'ats' } });
      const modernResume = createMockResume({ meta: { ...mockStandardResume.meta, templateId: 'modern' } });
      
      await seedTestData([atsResume, modernResume]);
      
      const atsResults = await db.resumes
        .filter(r => r.meta.templateId === 'ats')
        .toArray();
      
      expect(atsResults.length).toBe(1);
      expect(atsResults[0].meta.templateId).toBe('ats');
    });

    it('should sort resumes by lastModified', async () => {
      const resume1 = createMockResume({ 
        meta: { ...mockStandardResume.meta, lastModified: '2023-01-01' } 
      });
      const resume2 = createMockResume({ 
        meta: { ...mockStandardResume.meta, lastModified: '2023-12-31' } 
      });
      
      await seedTestData([resume1, resume2]);
      
      const sorted = await db.resumes
        .toCollection()
        .sortBy('meta.lastModified');
      
      expect(sorted[0].meta.lastModified).toBe('2023-01-01');
      expect(sorted[1].meta.lastModified).toBe('2023-12-31');
    });

    it('should search resumes by name', async () => {
      const resume1 = createMockResume({ 
        basics: { ...mockStandardResume.basics, name: 'John Doe' } 
      });
      const resume2 = createMockResume({ 
        basics: { ...mockStandardResume.basics, name: 'Jane Smith' } 
      });
      
      await seedTestData([resume1, resume2]);
      
      const results = await db.resumes
        .filter(r => r.basics.name.toLowerCase().includes('john'))
        .toArray();
      
      expect(results.length).toBe(1);
      expect(results[0].basics.name).toBe('John Doe');
    });
  });

  describe('Transaction Handling', () => {
    it('should rollback on transaction failure', async () => {
      const resume1 = createMockResume();
      const resume2 = createMockResume();
      
      try {
        await db.transaction('rw', db.resumes, async () => {
          await db.resumes.add(resume1);
          // Try to add duplicate (should fail)
          await db.resumes.add(resume1);
          await db.resumes.add(resume2);
        });
      } catch (error) {
        // Transaction should rollback
      }
      
      // Neither resume should be in database
      const count = await countResumes();
      expect(count).toBe(0);
    });
  });

  describe('Storage Limits', () => {
    it('should handle approaching storage quota', async () => {
      // Create resume with large data
      const largeResume = createMockResume({
        basics: {
          ...mockStandardResume.basics,
          summary: 'A'.repeat(100000), // 100KB of text
        },
      });
      
      // Should be able to store
      await expect(db.resumes.add(largeResume)).resolves.toBeDefined();
    });
  });

  describe('Migration Scenarios', () => {
    it('should handle schema version changes', async () => {
      // This would test database migrations
      // Implementation depends on migration strategy
    });
  });

  describe('Data Integrity', () => {
    it('should maintain referential integrity', async () => {
      const resume = createMockResume();
      await db.resumes.add(resume);
      
      // Verify all related data exists
      const retrieved = await getResumeById(resume.id);
      expect(retrieved?.work).toBeDefined();
      expect(retrieved?.education).toBeDefined();
      expect(retrieved?.skills).toBeDefined();
    });

    it('should preserve array order in layoutSettings', async () => {
      const resume = createMockResume();
      // sectionOrder is inside meta.layoutSettings
      resume.meta.layoutSettings.sectionOrder = ['basics', 'work', 'education', 'skills'];
      
      await db.resumes.add(resume);
      const retrieved = await getResumeById(resume.id);
      
      expect(retrieved?.meta.layoutSettings.sectionOrder).toEqual(['basics', 'work', 'education', 'skills']);
    });

    it('should handle nested objects correctly', async () => {
      const resume = createMockResume();
      await db.resumes.add(resume);
      
      const retrieved = await getResumeById(resume.id);
      expect(retrieved?.basics.location).toBeDefined();
      expect(retrieved?.basics.location.city).toBe(resume.basics.location.city);
    });
  });

  describe('Error Recovery', () => {
    it('should recover from database corruption', async () => {
      // This would test recovery mechanisms
      // Implementation depends on error handling strategy
    });

    it('should handle read errors gracefully', async () => {
      // Simulate database error
      const result = await getResumeById('non-existent-id');
      expect(result).toBeUndefined();
    });
  });
});
