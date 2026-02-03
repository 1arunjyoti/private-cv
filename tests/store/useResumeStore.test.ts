import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useResumeStore } from '@/store/useResumeStore';
import { db } from '@/db';
import type { Resume, LayoutSettings, WorkExperience, Education, Skill } from '@/db';
import { createMockResume } from '@/tests/utils/factories';

// Mock the database
vi.mock('@/db', () => ({
  db: {
    resumes: {
      get: vi.fn(),
      put: vi.fn(),
      add: vi.fn(),
      delete: vi.fn(),
      orderBy: vi.fn(() => ({
        reverse: vi.fn(() => ({
          toArray: vi.fn(),
        })),
      })),
    },
  },
}));

// Mock uuid
vi.mock('uuid', () => ({
  v4: vi.fn(() => 'test-uuid-1234'),
}));

describe('useResumeStore', () => {
  beforeEach(() => {
    // Clear localStorage to prevent persist middleware issues
    localStorage.clear();
    
    // Reset the store state before each test
    useResumeStore.setState({
      currentResume: null,
      isLoading: false,
      error: null,
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Initial State', () => {
    it('should have null currentResume initially', () => {
      const state = useResumeStore.getState();
      expect(state.currentResume).toBeNull();
    });

    it('should not be loading initially', () => {
      const state = useResumeStore.getState();
      expect(state.isLoading).toBe(false);
    });

    it('should have no error initially', () => {
      const state = useResumeStore.getState();
      expect(state.error).toBeNull();
    });
  });

  describe('loadResume', () => {
    it('should load resume from database', async () => {
      const mockResume = createMockResume();
      vi.mocked(db.resumes.get).mockResolvedValueOnce(mockResume);

      await useResumeStore.getState().loadResume(mockResume.id);

      expect(db.resumes.get).toHaveBeenCalledWith(mockResume.id);
      expect(useResumeStore.getState().currentResume).toEqual(mockResume);
      expect(useResumeStore.getState().isLoading).toBe(false);
    });

    it('should set error when resume not found', async () => {
      vi.mocked(db.resumes.get).mockResolvedValueOnce(undefined);

      await useResumeStore.getState().loadResume('non-existent-id');

      expect(useResumeStore.getState().error).toBe('Resume not found');
      expect(useResumeStore.getState().currentResume).toBeNull();
    });

    it('should set error on database failure', async () => {
      vi.mocked(db.resumes.get).mockRejectedValueOnce(new Error('DB error'));

      await useResumeStore.getState().loadResume('some-id');

      expect(useResumeStore.getState().error).toBe('DB error');
    });

    it('should skip loading if resume already in state', async () => {
      const mockResume = createMockResume();
      useResumeStore.setState({ currentResume: mockResume });

      await useResumeStore.getState().loadResume(mockResume.id);

      // Should not call db.get since resume is already loaded
      expect(db.resumes.get).not.toHaveBeenCalled();
    });

    it('should load different resume even if one is already in state', async () => {
      const existingResume = createMockResume({ id: 'existing-id' });
      const newResume = createMockResume({ id: 'new-id' });
      
      useResumeStore.setState({ currentResume: existingResume });
      vi.mocked(db.resumes.get).mockResolvedValueOnce(newResume);

      await useResumeStore.getState().loadResume('new-id');

      expect(db.resumes.get).toHaveBeenCalledWith('new-id');
      expect(useResumeStore.getState().currentResume?.id).toBe('new-id');
    });
  });

  describe('saveResume', () => {
    it('should save resume to database', async () => {
      const mockResume = createMockResume();
      vi.mocked(db.resumes.put).mockResolvedValueOnce(mockResume.id);

      await useResumeStore.getState().saveResume(mockResume);

      expect(db.resumes.put).toHaveBeenCalled();
      const savedResume = vi.mocked(db.resumes.put).mock.calls[0][0] as Resume;
      expect(savedResume.meta.lastModified).toBeDefined();
    });

    it('should update currentResume in state after save', async () => {
      const mockResume = createMockResume();
      vi.mocked(db.resumes.put).mockResolvedValueOnce(mockResume.id);

      await useResumeStore.getState().saveResume(mockResume);

      expect(useResumeStore.getState().currentResume).toBeDefined();
    });

    it('should update lastModified timestamp', async () => {
      const mockResume = createMockResume();
      const originalDate = mockResume.meta.lastModified;
      vi.mocked(db.resumes.put).mockResolvedValueOnce(mockResume.id);

      // Wait a bit to ensure timestamp changes
      await new Promise(resolve => setTimeout(resolve, 10));
      await useResumeStore.getState().saveResume(mockResume);

      const savedResume = vi.mocked(db.resumes.put).mock.calls[0][0] as Resume;
      expect(savedResume.meta.lastModified).not.toBe(originalDate);
    });

    it('should set error on database failure', async () => {
      const mockResume = createMockResume();
      vi.mocked(db.resumes.put).mockRejectedValueOnce(new Error('Save failed'));

      await useResumeStore.getState().saveResume(mockResume);

      expect(useResumeStore.getState().error).toBe('Save failed');
    });
  });

  describe('createNewResume', () => {
    it('should create new resume with default values', async () => {
      vi.mocked(db.resumes.add).mockResolvedValueOnce('test-uuid-1234');

      const resume = await useResumeStore.getState().createNewResume();

      expect(db.resumes.add).toHaveBeenCalled();
      expect(resume.id).toBe('test-uuid-1234');
      expect(resume.meta.title).toBe('Untitled Resume');
      expect(resume.meta.templateId).toBe('ats');
    });

    it('should create resume with custom title', async () => {
      vi.mocked(db.resumes.add).mockResolvedValueOnce('test-uuid-1234');

      const resume = await useResumeStore.getState().createNewResume('My Resume');

      expect(resume.meta.title).toBe('My Resume');
    });

    it('should create resume with custom template', async () => {
      vi.mocked(db.resumes.add).mockResolvedValueOnce('test-uuid-1234');

      const resume = await useResumeStore.getState().createNewResume('Resume', 'modern');

      expect(resume.meta.templateId).toBe('modern');
    });

    it('should set currentResume in state', async () => {
      vi.mocked(db.resumes.add).mockResolvedValueOnce('test-uuid-1234');

      await useResumeStore.getState().createNewResume();

      expect(useResumeStore.getState().currentResume).toBeDefined();
    });

    it('should throw and set error on database failure', async () => {
      vi.mocked(db.resumes.add).mockRejectedValueOnce(new Error('Create failed'));

      await expect(
        useResumeStore.getState().createNewResume()
      ).rejects.toThrow('Create failed');
      expect(useResumeStore.getState().error).toBe('Create failed');
    });

    it('should create resume with empty sections', async () => {
      vi.mocked(db.resumes.add).mockResolvedValueOnce('test-uuid-1234');

      const resume = await useResumeStore.getState().createNewResume();

      expect(resume.basics.name).toBe('');
      expect(resume.education).toEqual([]);
      expect(resume.work).toEqual([]);
      expect(resume.skills).toEqual([]);
    });
  });

  describe('deleteResume', () => {
    it('should delete resume from database', async () => {
      vi.mocked(db.resumes.delete).mockResolvedValueOnce(undefined);

      await useResumeStore.getState().deleteResume('resume-id');

      expect(db.resumes.delete).toHaveBeenCalledWith('resume-id');
    });

    it('should clear currentResume if deleting active resume', async () => {
      const mockResume = createMockResume({ id: 'active-resume' });
      useResumeStore.setState({ currentResume: mockResume });
      vi.mocked(db.resumes.delete).mockResolvedValueOnce(undefined);

      await useResumeStore.getState().deleteResume('active-resume');

      expect(useResumeStore.getState().currentResume).toBeNull();
    });

    it('should not clear currentResume if deleting different resume', async () => {
      const mockResume = createMockResume({ id: 'active-resume' });
      useResumeStore.setState({ currentResume: mockResume });
      vi.mocked(db.resumes.delete).mockResolvedValueOnce(undefined);

      await useResumeStore.getState().deleteResume('other-resume');

      expect(useResumeStore.getState().currentResume?.id).toBe('active-resume');
    });

    it('should set error on database failure', async () => {
      vi.mocked(db.resumes.delete).mockRejectedValueOnce(new Error('Delete failed'));

      await useResumeStore.getState().deleteResume('resume-id');

      expect(useResumeStore.getState().error).toBe('Delete failed');
    });
  });

  describe('getAllResumes', () => {
    it('should return all resumes ordered by lastModified', async () => {
      const resumes = [
        createMockResume({ id: 'resume-1' }),
        createMockResume({ id: 'resume-2' }),
      ];
      const mockToArray = vi.fn().mockResolvedValueOnce(resumes);
      const mockReverse = vi.fn(() => ({ toArray: mockToArray }));
      const mockOrderBy = vi.fn(() => ({ reverse: mockReverse }));
      vi.mocked(db.resumes.orderBy).mockImplementation(mockOrderBy as unknown as typeof db.resumes.orderBy);

      const result = await useResumeStore.getState().getAllResumes();

      expect(db.resumes.orderBy).toHaveBeenCalledWith('meta.lastModified');
      expect(mockReverse).toHaveBeenCalled();
      expect(result).toEqual(resumes);
    });

    it('should return empty array on database failure', async () => {
      vi.mocked(db.resumes.orderBy).mockImplementation(() => {
        throw new Error('DB error');
      });

      const result = await useResumeStore.getState().getAllResumes();

      expect(result).toEqual([]);
      expect(useResumeStore.getState().error).toBe('DB error');
    });
  });

  describe('updateCurrentResume', () => {
    it('should update current resume with partial data', () => {
      const mockResume = createMockResume();
      useResumeStore.setState({ currentResume: mockResume });

      useResumeStore.getState().updateCurrentResume({
        basics: { ...mockResume.basics, name: 'Updated Name' },
      });

      expect(useResumeStore.getState().currentResume?.basics.name).toBe('Updated Name');
    });

    it('should update lastModified timestamp', () => {
      const mockResume = createMockResume();
      const originalDate = mockResume.meta.lastModified;
      useResumeStore.setState({ currentResume: mockResume });

      // Wait a bit to ensure different timestamp
      vi.useFakeTimers();
      vi.setSystemTime(new Date(Date.now() + 1000)); // Advance by 1 second
      
      useResumeStore.getState().updateCurrentResume({
        basics: { ...mockResume.basics, name: 'New Name' },
      });

      vi.useRealTimers();
      expect(useResumeStore.getState().currentResume?.meta.lastModified).not.toBe(originalDate);
    });

    it('should merge meta updates', () => {
      const mockResume = createMockResume();
      useResumeStore.setState({ currentResume: mockResume });

      useResumeStore.getState().updateCurrentResume({
        meta: { ...mockResume.meta, title: 'New Title' },
      });

      expect(useResumeStore.getState().currentResume?.meta.title).toBe('New Title');
      expect(useResumeStore.getState().currentResume?.meta.templateId).toBeDefined();
    });

    it('should do nothing if no current resume', () => {
      useResumeStore.setState({ currentResume: null });

      useResumeStore.getState().updateCurrentResume({
        basics: { name: 'Test' } as Resume['basics'],
      });

      expect(useResumeStore.getState().currentResume).toBeNull();
    });

    it('should preserve other sections when updating', () => {
      const mockResume = createMockResume();
      mockResume.work = [{ id: 'work-1', company: 'Test Co' } as WorkExperience];
      useResumeStore.setState({ currentResume: mockResume });

      useResumeStore.getState().updateCurrentResume({
        basics: { ...mockResume.basics, name: 'New Name' },
      });

      expect(useResumeStore.getState().currentResume?.work).toEqual([
        { id: 'work-1', company: 'Test Co' },
      ]);
    });
  });

  describe('resetResume', () => {
    it('should reset resume to empty state keeping ID and title', () => {
      const mockResume = createMockResume({
        id: 'keep-this-id',
        meta: {
          title: 'Keep This Title',
          templateId: 'ats',
          themeColor: '#000000',
          lastModified: new Date().toISOString(),
          layoutSettings: {} as LayoutSettings,
        },
        basics: {
          name: 'Should Be Cleared',
          email: 'clear@example.com',
        } as Resume['basics'],
      });
      useResumeStore.setState({ currentResume: mockResume });

      useResumeStore.getState().resetResume();

      const state = useResumeStore.getState().currentResume;
      expect(state?.id).toBe('keep-this-id');
      expect(state?.meta.title).toBe('Keep This Title');
      expect(state?.basics.name).toBe('');
      expect(state?.basics.email).toBe('');
    });

    it('should do nothing if no current resume', () => {
      useResumeStore.setState({ currentResume: null });

      useResumeStore.getState().resetResume();

      expect(useResumeStore.getState().currentResume).toBeNull();
    });

    it('should keep template ID', () => {
      const mockResume = createMockResume({
        meta: {
          title: 'Test',
          templateId: 'modern',
          themeColor: '#000',
          lastModified: new Date().toISOString(),
          layoutSettings: {} as LayoutSettings,
        },
      });
      useResumeStore.setState({ currentResume: mockResume });

      useResumeStore.getState().resetResume();

      expect(useResumeStore.getState().currentResume?.meta.templateId).toBe('modern');
    });

    it('should clear all sections', () => {
      const mockResume = createMockResume();
      mockResume.work = [{ id: 'w1' } as WorkExperience];
      mockResume.education = [{ id: 'e1' } as Education];
      mockResume.skills = [{ id: 's1' } as Skill];
      useResumeStore.setState({ currentResume: mockResume });

      useResumeStore.getState().resetResume();

      const state = useResumeStore.getState().currentResume;
      expect(state?.work).toEqual([]);
      expect(state?.education).toEqual([]);
      expect(state?.skills).toEqual([]);
    });
  });

  describe('clearError', () => {
    it('should clear error state', () => {
      useResumeStore.setState({ error: 'Some error' });

      useResumeStore.getState().clearError();

      expect(useResumeStore.getState().error).toBeNull();
    });
  });

  describe('Loading State', () => {
    it('should set isLoading during async operations', async () => {
      vi.mocked(db.resumes.get).mockImplementation(
        () => Promise.resolve(createMockResume()) as ReturnType<typeof db.resumes.get>
      );

      const loadPromise = useResumeStore.getState().loadResume('test-id');
      
      // Should be loading immediately after call
      expect(useResumeStore.getState().isLoading).toBe(true);
      
      await loadPromise;
      
      // Should not be loading after completion
      expect(useResumeStore.getState().isLoading).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle concurrent updates', () => {
      const mockResume = createMockResume();
      useResumeStore.setState({ currentResume: mockResume });

      // Multiple rapid updates
      useResumeStore.getState().updateCurrentResume({
        basics: { ...mockResume.basics, name: 'Update 1' },
      });
      useResumeStore.getState().updateCurrentResume({
        basics: { ...mockResume.basics, name: 'Update 2' },
      });
      useResumeStore.getState().updateCurrentResume({
        basics: { ...mockResume.basics, name: 'Update 3' },
      });

      // Last update should win
      expect(useResumeStore.getState().currentResume?.basics.name).toBe('Update 3');
    });

    it('should handle empty string updates', () => {
      const mockResume = createMockResume();
      mockResume.basics.name = 'Original Name';
      useResumeStore.setState({ currentResume: mockResume });

      useResumeStore.getState().updateCurrentResume({
        basics: { ...mockResume.basics, name: '' },
      });

      expect(useResumeStore.getState().currentResume?.basics.name).toBe('');
    });

    it('should handle special characters in resume data', () => {
      const mockResume = createMockResume();
      useResumeStore.setState({ currentResume: mockResume });

      useResumeStore.getState().updateCurrentResume({
        basics: {
          ...mockResume.basics,
          name: 'José García-Müller',
          summary: 'Résumé with spëcial chäracters & <html> symbols',
        },
      });

      expect(useResumeStore.getState().currentResume?.basics.name).toBe('José García-Müller');
    });
  });
});
