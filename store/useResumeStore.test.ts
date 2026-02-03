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
          sectionDisplayStyle: 'plain',
          useBullets: true,
          fontFamily: 'Roboto',
          themeColorTarget: ["headings", "links", "icons", "decorations"],
          columnCount: 1,
          headerPosition: 'top',
          leftColumnWidth: 30,
          marginHorizontal: 15,
          marginVertical: 15,
          headerBottomMargin: 20,
          sectionOrder: [],
          sectionHeadingStyle: 3,
          sectionHeadingAlign: 'left',
          sectionHeadingBold: false,
          sectionHeadingCapitalization: 'uppercase',
          sectionHeadingSize: 'M',
          sectionHeadingIcons: 'none',
          summaryHeadingVisible: true,
          workHeadingVisible: true,
          educationHeadingVisible: true,
          skillsHeadingVisible: true,
          projectsHeadingVisible: true,
          certificatesHeadingVisible: true,
          languagesHeadingVisible: true,
          interestsHeadingVisible: true,
          publicationsHeadingVisible: true,
          awardsHeadingVisible: true,
          referencesHeadingVisible: true,
          customHeadingVisible: true,
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
          nameFontSize: 0,
          nameLineHeight: 0,
          nameBold: true,
          nameFont: 'body',
          titleFontSize: 0,
          titleLineHeight: 0,
          titleBold: false,
          titleItalic: false,
          contactFontSize: 0,
          contactBold: false,
          contactItalic: false,
          contactSeparator: 'pipe',
          skillsDisplayStyle: 'grid',
          skillsLevelStyle: 3,
          skillsListStyle: 'bullet',
          languagesListStyle: 'bullet',
          languagesNameBold: true,
          languagesNameItalic: false,
          languagesFluencyBold: false,
          languagesFluencyItalic: false,
          interestsListStyle: 'bullet',
          interestsNameBold: true,
          interestsNameItalic: false,
          interestsKeywordsBold: false,
          interestsKeywordsItalic: false,
          certificatesDisplayStyle: 'grid',
          certificatesLevelStyle: 3,
          experienceCompanyListStyle: 'bullet',
          experienceCompanyBold: true,
          experienceCompanyItalic: false,
          experiencePositionBold: true,
          experiencePositionItalic: false,
          experienceWebsiteBold: false,
          experienceWebsiteItalic: false,
          experienceDateBold: false,
          experienceDateItalic: false,
          experienceAchievementsListStyle: 'bullet',
          experienceAchievementsBold: false,
          experienceAchievementsItalic: false,
          educationInstitutionListStyle: 'bullet',
          educationInstitutionBold: true,
          educationInstitutionItalic: false,
          educationDegreeBold: false,
          educationDegreeItalic: false,
          educationAreaBold: false,
          educationAreaItalic: false,
          educationDateBold: false,
          educationDateItalic: false,
          educationGpaBold: false,
          educationGpaItalic: false,
          educationCoursesBold: false,
          educationCoursesItalic: false,
          publicationsListStyle: 'bullet',
          publicationsNameBold: true,
          publicationsNameItalic: false,
          publicationsPublisherBold: false,
          publicationsPublisherItalic: false,
          publicationsUrlBold: false,
          publicationsUrlItalic: false,
          publicationsDateBold: false,
          publicationsDateItalic: false,
          awardsListStyle: 'bullet',
          awardsTitleBold: true,
          awardsTitleItalic: false,
          awardsAwarderBold: false,
          awardsAwarderItalic: false,
          awardsDateBold: false,
          awardsDateItalic: false,
          referencesListStyle: 'bullet',
          referencesNameBold: true,
          referencesNameItalic: false,
          referencesPositionBold: false,
          referencesPositionItalic: false,
          customSectionListStyle: 'bullet',
          customSectionNameBold: true,
          customSectionNameItalic: false,
          customSectionDescriptionBold: false,
          customSectionDescriptionItalic: false,
          customSectionDateBold: false,
          customSectionDateItalic: false,
          customSectionUrlBold: false,
          customSectionUrlItalic: false,
          projectsListStyle: 'bullet',
          projectsNameBold: true,
          projectsNameItalic: false,
          projectsDateBold: false,
          projectsDateItalic: false,
          projectsTechnologiesBold: false,
          projectsTechnologiesItalic: false,
          projectsAchievementsListStyle: 'bullet',
          projectsFeaturesBold: false,
          projectsFeaturesItalic: false,
          projectsUrlBold: false,
          projectsUrlItalic: false,
          certificatesListStyle: 'bullet',
          certificatesNameBold: true,
          certificatesNameItalic: false,
          certificatesIssuerBold: false,
          certificatesIssuerItalic: false,
          certificatesDateBold: false,
          certificatesDateItalic: false,
          certificatesUrlBold: false,
          certificatesUrlItalic: false,
          contactLinkUnderline: false,
          linkShowIcon: false,
          linkShowFullUrl: false
        },
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
