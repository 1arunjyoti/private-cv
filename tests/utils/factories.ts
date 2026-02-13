import type { Resume, ResumeBasics, WorkExperience, Education, Skill, Project, Certificate, Language, Interest, Publication, Award, Reference, CustomSection, LayoutSettings } from '@/db';
import { v4 as uuidv4 } from 'uuid';

/**
 * Factory to create mock Resume data with sensible defaults
 */
export const createMockResume = (overrides?: Partial<Resume>): Resume => {
  const now = new Date().toISOString();
  
  const defaultResume: Resume = {
    id: uuidv4(),
    meta: {
      title: 'Test Resume',
      templateId: 'ats',
      themeColor: '#3b82f6',
      lastModified: now,
      layoutSettings: createMockLayoutSettings(),
    },
    basics: createMockBasics(),
    work: [createMockWorkExperience()],
    education: [createMockEducation()],
    skills: [createMockSkill()],
    projects: [createMockProject()],
    certificates: [createMockCertificate()],
    languages: [createMockLanguage()],
    interests: [createMockInterest()],
    publications: [createMockPublication()],
    awards: [createMockAward()],
    references: [createMockReference()],
    custom: [],
  };

  return {
    ...defaultResume,
    ...overrides,
  };
};

export const createMockLayoutSettings = (overrides?: Partial<LayoutSettings>): LayoutSettings => ({
  fontSize: 9,
  lineHeight: 1.4,
  sectionMargin: 12,
  bulletMargin: 4,
  sectionDisplayStyle: 'plain',
  useBullets: true,
  sectionHeadingCapitalization: 'uppercase',
  fontFamily: 'Roboto',
  themeColorTarget: ['name'],
  columnCount: 1,
  headerPosition: 'top',
  leftColumnWidth: 30,
  sectionOrder: ['basics', 'work', 'education', 'skills'],
  sectionTitles: {},
  marginHorizontal: 15,
  marginVertical: 15,
  headerBottomMargin: 20,
  sectionHeadingStyle: 1,
  sectionHeadingAlign: 'left',
  sectionHeadingBold: true,
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
  entrySubtitleStyle: 'normal',
  entrySubtitlePlacement: 'sameLine',
  entryIndentBody: false,
  entryListStyle: 'bullet',
  personalDetailsAlign: 'left',
  personalDetailsArrangement: 1,
  personalDetailsContactStyle: 'icon',
  personalDetailsIconStyle: 1,
  nameSize: 'M',
  nameFontSize: 24,
  nameLineHeight: 1.2,
  nameBold: true,
  nameFont: 'body',
  nameItalic: false,
  titleFontSize: 12,
  titleLineHeight: 1.2,
  titleBold: false,
  titleItalic: false,
  contactFontSize: 9,
  contactBold: false,
  contactItalic: false,
  contactLineHeight: 1.4,
  contactSeparatorGap: 8,
  contactSeparator: 'pipe',
  contactLinkUnderline: false,
  linkShowIcon: false,
  linkShowFullUrl: false,
  profilePhotoPosition: 'right',
  profilePhotoShape: 'circle',
  profilePhotoSize: 80,
  profilePhotoBorder: false,
  skillsDisplayStyle: 'grid',
  skillsLevelStyle: 0,
  skillsListStyle: 'bullet',
  languagesListStyle: 'bullet',
  languagesNameBold: false,
  languagesNameItalic: false,
  languagesFluencyBold: false,
  languagesFluencyItalic: false,
  interestsListStyle: 'bullet',
  interestsNameBold: false,
  interestsNameItalic: false,
  interestsKeywordsBold: false,
  interestsKeywordsItalic: false,
  certificatesDisplayStyle: 'grid',
  certificatesLevelStyle: 1,
  experienceCompanyListStyle: 'none',
  experienceCompanyBold: true,
  experienceCompanyItalic: false,
  experiencePositionBold: false,
  experiencePositionItalic: false,
  experienceWebsiteBold: false,
  experienceWebsiteItalic: false,
  experienceDateBold: false,
  experienceDateItalic: false,
  experienceAchievementsListStyle: 'bullet',
  experienceAchievementsBold: false,
  experienceAchievementsItalic: false,
  educationInstitutionListStyle: 'none',
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
  publicationsNameBold: false,
  publicationsNameItalic: false,
  publicationsPublisherBold: false,
  publicationsPublisherItalic: false,
  publicationsUrlBold: false,
  publicationsUrlItalic: false,
  publicationsDateBold: false,
  publicationsDateItalic: false,
  awardsListStyle: 'bullet',
  awardsTitleBold: false,
  awardsTitleItalic: false,
  awardsAwarderBold: false,
  awardsAwarderItalic: false,
  awardsDateBold: false,
  awardsDateItalic: false,
  referencesListStyle: 'bullet',
  referencesNameBold: false,
  referencesNameItalic: false,
  referencesPositionBold: false,
  referencesPositionItalic: false,
  customSectionListStyle: 'bullet',
  customSectionNameBold: false,
  customSectionNameItalic: false,
  customSectionDescriptionBold: false,
  customSectionDescriptionItalic: false,
  customSectionDateBold: false,
  customSectionDateItalic: false,
  customSectionUrlBold: false,
  customSectionUrlItalic: false,
  projectsListStyle: 'bullet',
  projectsNameBold: false,
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
  certificatesNameBold: false,
  certificatesNameItalic: false,
  certificatesIssuerBold: false,
  certificatesIssuerItalic: false,
  certificatesDateBold: false,
  certificatesDateItalic: false,
  certificatesUrlBold: false,
  certificatesUrlItalic: false,
  sectionLinkStyle: 'inline',
  ...overrides,
});

export const createMockBasics = (overrides?: Partial<ResumeBasics>): ResumeBasics => ({
  name: 'John Doe',
  label: 'Software Engineer',
  image: '',
  email: 'john.doe@example.com',
  phone: '+1-555-123-4567',
  url: 'https://johndoe.com',
  summary: 'Experienced software engineer with a passion for building scalable web applications.',
  location: {
    address: '123 Main St',
    city: 'San Francisco',
    region: 'CA',
    postalCode: '94105',
    country: 'USA',
  },
  profiles: [
    {
      network: 'LinkedIn',
      username: 'johndoe',
      url: 'https://linkedin.com/in/johndoe',
    },
    {
      network: 'GitHub',
      username: 'johndoe',
      url: 'https://github.com/johndoe',
    },
  ],
  ...overrides,
});

export const createMockWorkExperience = (overrides?: Partial<WorkExperience>): WorkExperience => ({
  id: uuidv4(),
  company: 'Tech Corp',
  position: 'Senior Software Engineer',
  location: 'San Francisco, CA',
  url: 'https://techcorp.com',
  startDate: '2020-01-01',
  endDate: 'Present',
  summary: 'Led development of microservices architecture.',
  highlights: [
    'Developed and deployed 10+ microservices',
    'Reduced API latency by 40%',
    'Mentored 5 junior engineers',
  ],
  name: 'Tech Corp',
  ...overrides,
});

export const createMockEducation = (overrides?: Partial<Education>): Education => ({
  id: uuidv4(),
  institution: 'University of California',
  url: 'https://berkeley.edu',
  area: 'Computer Science',
  studyType: 'Bachelor of Science',
  startDate: '2015-09-01',
  endDate: '2019-05-31',
  score: '3.8 GPA',
  summary: 'Focus on distributed systems and machine learning.',
  courses: ['Data Structures', 'Algorithms', 'Operating Systems'],
  ...overrides,
});

export const createMockSkill = (overrides?: Partial<Skill>): Skill => ({
  id: uuidv4(),
  name: 'JavaScript',
  level: 'Expert',
  keywords: ['React', 'Node.js', 'TypeScript', 'Vue.js'],
  ...overrides,
});

export const createMockProject = (overrides?: Partial<Project>): Project => ({
  id: uuidv4(),
  name: 'E-commerce Platform',
  description: 'Built a full-stack e-commerce platform with React and Node.js',
  highlights: [
    'Handled 10K+ daily active users',
    'Integrated Stripe payment processing',
    'Implemented real-time inventory management',
  ],
  keywords: ['React', 'Node.js', 'MongoDB', 'Stripe'],
  startDate: '2021-03-01',
  endDate: '2021-12-31',
  url: 'https://github.com/johndoe/ecommerce',
  ...overrides,
});

export const createMockCertificate = (overrides?: Partial<Certificate>): Certificate => ({
  id: uuidv4(),
  name: 'AWS Solutions Architect',
  issuer: 'Amazon Web Services',
  date: '2022-06-15',
  url: 'https://aws.amazon.com/certification',
  summary: 'Professional level certification for cloud architecture',
  ...overrides,
});

export const createMockLanguage = (overrides?: Partial<Language>): Language => ({
  id: uuidv4(),
  language: 'English',
  fluency: 'Native',
  ...overrides,
});

export const createMockInterest = (overrides?: Partial<Interest>): Interest => ({
  id: uuidv4(),
  name: 'Open Source',
  keywords: ['Linux', 'Git', 'Docker'],
  ...overrides,
});

export const createMockPublication = (overrides?: Partial<Publication>): Publication => ({
  id: uuidv4(),
  name: 'Scaling Microservices: Best Practices',
  publisher: 'Tech Journal',
  releaseDate: '2023-03-15',
  url: 'https://techjournal.com/article/123',
  summary: 'An in-depth guide to scaling microservices in production',
  ...overrides,
});

export const createMockAward = (overrides?: Partial<Award>): Award => ({
  id: uuidv4(),
  title: 'Employee of the Year',
  date: '2022-12-01',
  awarder: 'Tech Corp',
  summary: 'Recognized for outstanding contributions to the platform',
  ...overrides,
});

export const createMockReference = (overrides?: Partial<Reference>): Reference => ({
  id: uuidv4(),
  name: 'Jane Smith',
  position: 'Engineering Manager',
  reference: 'John is an exceptional engineer who consistently delivers high-quality work.',
  ...overrides,
});

export const createMockCustomSection = (overrides?: Partial<CustomSection>): CustomSection => ({
  id: uuidv4(),
  name: 'Custom Section',
  items: [
    {
      id: uuidv4(),
      name: 'Custom Item',
      description: 'Custom item description',
      date: '2023-01-01',
      url: 'https://example.com',
      summary: 'Custom content goes here',
    },
  ],
  ...overrides,
});

/**
 * Create a minimal resume with only required fields
 */
export const createMinimalResume = (): Resume => {
  return createMockResume({
    basics: {
      name: 'Test User',
      label: '',
      image: '',
      email: '',
      phone: '',
      url: '',
      summary: '',
      location: {
        address: '',
        city: '',
        region: '',
        postalCode: '',
        country: '',
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
  });
};

/**
 * Create a resume with maximum data
 */
export const createMaximalResume = (): Resume => {
  return createMockResume({
    work: Array.from({ length: 10 }, (_, i) =>
      createMockWorkExperience({ company: `Company ${i + 1}` })
    ),
    education: Array.from({ length: 3 }, (_, i) =>
      createMockEducation({ institution: `University ${i + 1}` })
    ),
    skills: Array.from({ length: 20 }, (_, i) =>
      createMockSkill({ name: `Skill ${i + 1}` })
    ),
    projects: Array.from({ length: 8 }, (_, i) =>
      createMockProject({ name: `Project ${i + 1}` })
    ),
  });
};

/**
 * Create a mock File object for testing file uploads
 */
export const createMockFile = (
  type: 'pdf' | 'docx' | 'jpg' | 'png',
  size: number = 1024,
  name?: string
): File => {
  const mimeTypes = {
    pdf: 'application/pdf',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    jpg: 'image/jpeg',
    png: 'image/png',
  };

  const extensions = {
    pdf: '.pdf',
    docx: '.docx',
    jpg: '.jpg',
    png: '.png',
  };

  const fileName = name || `test-file${extensions[type]}`;
  const blob = new Blob(['a'.repeat(size)], { type: mimeTypes[type] });
  
  return new File([blob], fileName, { type: mimeTypes[type] });
};

/**
 * Create a large file for testing file size limits
 */
export const createLargeFile = (type: 'pdf' | 'docx', megabytes: number): File => {
  const bytes = megabytes * 1024 * 1024;
  return createMockFile(type, bytes);
};

/**
 * Create an invalid/corrupted file
 */
export const createCorruptedFile = (extension: string): File => {
  const blob = new Blob(['corrupted data!!!'], { type: 'application/octet-stream' });
  return new File([blob], `corrupted.${extension}`, { type: 'application/octet-stream' });
};
