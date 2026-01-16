import { describe, it, expect, beforeEach } from 'vitest';
import { useResumeStore } from '@/store/useResumeStore';
import type { Resume } from '@/db';

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
        layoutSettings: {
          fontSize: 9,
          lineHeight: 1.4,
          sectionMargin: 12,
          bulletMargin: 4,
          useBullets: true,
          columnCount: 1,
          headerPosition: 'top',
          leftColumnWidth: 30,
          marginHorizontal: 15,
          marginVertical: 15,
          sectionOrder: [], 
          sectionHeadingStyle: 4,
          sectionHeadingCapitalization: 'uppercase',
          sectionHeadingSize: 'M',
          sectionHeadingIcons: 'none',
          entryLayoutStyle: 1,
          entryColumnWidth: 'auto',
          entryTitleSize: 'M',
          entrySubtitleStyle: 'italic',
          entrySubtitlePlacement: 'nextLine',
          entryIndentBody: false,
          entryListStyle: 'bullet',
          personalDetailsAlign: 'center',
          personalDetailsArrangement: 1,
          personalDetailsContactStyle: 'icon',
          personalDetailsIconStyle: 1,
          nameSize: 'M',
          nameBold: true,
          nameFont: 'body',
          skillsDisplayStyle: 'grid',
          skillsLevelStyle: 3,
          languagesDisplayStyle: 'level',
          languagesLevelStyle: 'dots',
          interestsDisplayStyle: 'compact',
          interestsSeparator: 'pipe',
          interestsSubinfoStyle: 'dash',
          certificatesDisplayStyle: 'grid',
          certificatesLevelStyle: 3,
        },
      },
      basics: {
        name: 'John Doe',
        label: 'Developer',
        email: 'john@example.com',
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
