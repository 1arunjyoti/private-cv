import { describe, it, expect, beforeEach } from 'vitest';
import { useResumeStore } from '@/store/useResumeStore';
import type { Resume } from '@/db';
import { createMockLayoutSettings } from '../tests/utils/factories';

describe('Resume Store', () => {
  beforeEach(() => {
    // Reset store state before each test
    useResumeStore.setState({
      currentResume: null,
      isLoading: false,
      error: null,
    });
  });

  it('should have initial state with null currentResume', () => {
    const state = useResumeStore.getState();
    expect(state.currentResume).toBeNull();
  });

  it('should have initial isLoading as false', () => {
    const state = useResumeStore.getState();
    expect(state.isLoading).toBe(false);
  });

  it('should have initial error as null', () => {
    const state = useResumeStore.getState();
    expect(state.error).toBeNull();
  });

  it('should clear error when clearError is called', () => {
    useResumeStore.setState({ error: 'Test error' });
    useResumeStore.getState().clearError();
    expect(useResumeStore.getState().error).toBeNull();
  });

  it('should update currentResume when updateCurrentResume is called', () => {
    const mockResume: Resume = {
      id: 'test-id',
      meta: {
        title: 'Test Resume',
        templateId: 'ats',
        themeColor: '#3b82f6',
        lastModified: new Date().toISOString(),
        layoutSettings: createMockLayoutSettings({}),
      },
      basics: {
        name: 'John Doe',
        label: 'Developer',
        image: '',
        email: 'john@example.com',
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
      work: [],
      education: [],
      skills: [],
      projects: [],
      certificates: [],
      languages: [],
      interests: [],
      publications: [],
      awards: [],
      references: [],
      custom: [],
    };

    useResumeStore.setState({ currentResume: mockResume });
    useResumeStore.getState().updateCurrentResume({
      basics: { ...mockResume.basics, name: 'Jane Doe' },
    });

    const state = useResumeStore.getState();
    expect(state.currentResume?.basics.name).toBe('Jane Doe');
  });
});
