import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { db, type Resume, type LayoutSettings } from '@/db';
import { v4 as uuidv4 } from 'uuid';
import { getTemplateDefaults, getTemplateThemeColor } from '@/lib/template-defaults';

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
  deleteAllResumes: () => Promise<void>;
  duplicateResume: (resume: Resume) => Promise<void>;
  getAllResumes: () => Promise<Resume[]>;
  updateCurrentResume: (updates: Partial<Resume>) => void;
  resetResume: () => void;
  clearError: () => void;
}

const createEmptyResume = (title: string = 'Untitled Resume', templateId: string = 'ats'): Resume => {
  // Get template-specific defaults
  const templateDefaults = getTemplateDefaults(templateId);
  const themeColor = getTemplateThemeColor(templateId);

  return {
    id: uuidv4(),
    meta: {
      title,
      templateId,
      themeColor,
      lastModified: new Date().toISOString(),
      layoutSettings: templateDefaults as LayoutSettings,
    },
    basics: {
      name: '',
      label: '',
      image: '',
      email: '',
      phone: '',
      url: '',
      summary: '',
      location: {
        city: '', country: '',
        postalCode: '',
        region: '',
        address: ''
      },
      profiles: [],
    },
    education: [],
    skills: [],
    work: [],
    projects: [],
    certificates: [],
    publications: [],
    awards: [],
    languages: [],
    interests: [],
    references: [],
    custom: [],
  };
};

export const useResumeStore = create<ResumeState>()(
  persist(
    (set, get) => ({
      currentResume: null,
      isLoading: false,
      error: null,

      loadResume: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          // Check if we already have the resume in state (from persistence)
          const { currentResume } = get();
          if (currentResume && currentResume.id === id) {
             set({ isLoading: false });
             return;
          }

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

      deleteAllResumes: async () => {
        set({ isLoading: true, error: null });
        try {
          await db.resumes.clear();
          set({ currentResume: null, isLoading: false });
        } catch (err) {
          set({ error: (err as Error).message, isLoading: false });
        }
      },

      duplicateResume: async (originalResume: Resume) => {
        set({ isLoading: true, error: null });
        try {
          const newId = uuidv4();
          const newTimestamp = new Date().toISOString();

          // Create a deep copy of the original resume to avoid reference bugs
          const clonedResume = structuredClone(originalResume);

          const newResume: Resume = {
            ...clonedResume,
            id: newId,
            meta: {
              ...clonedResume.meta,
              title: `${clonedResume.meta.title} (Copy)`,
              lastModified: newTimestamp,
            },
          };

          await db.resumes.add(newResume);
          set({ currentResume: newResume, isLoading: false });
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
          // Ensure we get a new timestamp by waiting for next tick if needed
          const newTimestamp = new Date().toISOString();
          set({
            currentResume: {
              ...currentResume,
              ...updates,
              meta: {
                ...currentResume.meta,
                ...(updates.meta || {}),
                lastModified: newTimestamp,
              },
            },
          });
        }
      },

      resetResume: () => {
        const { currentResume } = get();
        if (currentResume) {
          const newResume = createEmptyResume(
            currentResume.meta.title,
            currentResume.meta.templateId
          );

          set({
            currentResume: {
              ...newResume,
              id: currentResume.id, // Keep the same ID
              meta: {
                ...newResume.meta,
                lastModified: new Date().toISOString(),
              },
            },
          });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'resume-storage', // unique name
      partialize: (state) => ({ currentResume: state.currentResume }), // only persist currentResume
    }
  )
);
