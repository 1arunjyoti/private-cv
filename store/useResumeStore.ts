import { create } from 'zustand';
import { db, type Resume } from '@/db';
import { v4 as uuidv4 } from 'uuid';

interface ResumeState {
  // Current active resume being edited
  currentResume: Resume | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadResume: (id: string) => Promise<void>;
  saveResume: (resume: Resume) => Promise<void>;
  createNewResume: (title?: string, templateId?: string) => Promise<Resume>;
  deleteResume: (id: string) => Promise<void>;
  getAllResumes: () => Promise<Resume[]>;
  updateCurrentResume: (updates: Partial<Resume>) => void;
  resetResume: () => void;
  clearError: () => void;
}

const createEmptyResume = (title: string = 'Untitled Resume', templateId: string = 'ats'): Resume => ({
  id: uuidv4(),
  meta: {
    title,
    templateId,
    themeColor: '#3b82f6',
    lastModified: new Date().toISOString(),
  },
  basics: {
    name: '',
    label: '',
    email: '',
    phone: '',
    url: '',
    summary: '',
    location: { city: '', country: '' },
    profiles: [],
  },
  work: [],
  education: [],
  skills: [],
  projects: [],
});

export const useResumeStore = create<ResumeState>((set, get) => ({
  currentResume: null,
  isLoading: false,
  error: null,

  loadResume: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const resume = await db.resumes.get(id);
      if (resume) {
        set({ currentResume: resume, isLoading: false });
      } else {
        set({ error: 'Resume not found', isLoading: false });
      }
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  saveResume: async (resume: Resume) => {
    set({ isLoading: true, error: null });
    try {
      const updatedResume = {
        ...resume,
        meta: {
          ...resume.meta,
          lastModified: new Date().toISOString(),
        },
      };
      await db.resumes.put(updatedResume);
      set({ currentResume: updatedResume, isLoading: false });
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  createNewResume: async (title?: string, templateId: string = 'ats') => {
    set({ isLoading: true, error: null });
    try {
      const newResume = createEmptyResume(title, templateId);
      await db.resumes.add(newResume);
      set({ currentResume: newResume, isLoading: false });
      return newResume;
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
      throw err;
    }
  },

  deleteResume: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await db.resumes.delete(id);
      const { currentResume } = get();
      if (currentResume?.id === id) {
        set({ currentResume: null });
      }
      set({ isLoading: false });
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  getAllResumes: async () => {
    try {
      return await db.resumes.orderBy('meta.lastModified').reverse().toArray();
    } catch (err) {
      set({ error: (err as Error).message });
      return [];
    }
  },

  updateCurrentResume: (updates: Partial<Resume>) => {
    const { currentResume } = get();
    if (currentResume) {
      set({
        currentResume: {
          ...currentResume,
          ...updates,
          meta: {
            ...currentResume.meta,
            ...(updates.meta || {}),
            lastModified: new Date().toISOString(),
          },
        },
      });
    }
  },

  resetResume: () => {
    const { currentResume } = get();
    if (currentResume) {
      const empty = createEmptyResume(currentResume.meta.title, currentResume.meta.templateId);
      set({
        currentResume: {
          ...empty,
          id: currentResume.id, // Keep same ID
          meta: currentResume.meta, // Keep same meta (title, theme, template)
        }
      });
    }
  },

  clearError: () => set({ error: null }),
}));
