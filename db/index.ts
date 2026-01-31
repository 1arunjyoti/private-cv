import Dexie, { type EntityTable } from 'dexie';

// Resume data model based on JSON Resume standard
export interface ResumeBasics {
  name: string;
  label: string;
  image?: Blob | string;
  email: string;
  phone: string;
  url: string;
  summary: string;
  location: {
    postalCode: string;
    region: string;
    address: string;
    city: string;
    country: string;
  };
  profiles: {
    network: string;
    username: string;
    url: string;
  }[];
}

export interface WorkExperience {
  location: string;
  name: string;
  id: string;
  company: string;
  position: string;
  url: string;
  startDate: string;
  endDate: string;
  summary: string;
  highlights: string[];
}

export interface Education {
  id: string;
  institution: string;
  url: string;
  area: string;
  studyType: string;
  startDate: string;
  endDate: string;
  score: string;
  summary?: string;
  courses: string[];
}

export interface Skill {
  id: string;
  name: string;
  level: string;
  keywords: string[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  highlights: string[];
  keywords: string[];
  startDate: string;
  endDate: string;
  url: string;
}

export interface Certificate {
  id: string;
  name: string;
  issuer: string;
  date: string;
  url: string;
  summary: string;
}

export interface Language {
  id: string;
  language: string;
  fluency: string;
}

export interface Interest {
  id: string;
  name: string;
  keywords: string[];
}

export interface Publication {
  id: string;
  name: string;
  publisher: string;
  releaseDate: string;
  url: string;
  summary: string;
}

export interface Award {
  id: string;
  title: string;
  date: string;
  awarder: string;
  summary: string;
}

export interface Reference {
  id: string;
  name: string;
  position: string;
  reference: string;
}

export interface CustomSection {
  id: string;
  name: string;
  items: {
    id: string;
    name: string;
    description: string;
    date: string;
    url: string;
    summary: string;
  }[];
}

export interface LayoutSettings {
  fontSize: number; // 8-12, default 9
  lineHeight: number; // 1.2-1.8, default 1.4
  sectionMargin: number; // 8-20, default 12
  bulletMargin: number; // 2-8, default 4
  sectionDisplayStyle: 'plain' | 'card'; // default 'plain'
  useBullets: boolean; // default true
  fontFamily: string; // default "Roboto"
  // Theme
  themeColorTarget: string[]; // 'name' | 'title' | 'headings' | 'links' | 'icons' | 'decorations'
  // Advanced Layout
  columnCount: 1 | 2 | 3; // 1=One, 2=Two, 3=Mix/Custom
  headerPosition: 'top' | 'left' | 'right' | 'sidebar';
  leftColumnWidth: number; // percentage 20-80
  middleColumnWidth?: number; // percentage, optional
  sectionOrder: string[];
  marginHorizontal: number; // 0-30mm
  marginVertical: number; // 0-30mm
  headerBottomMargin: number; // 0-50, default 20
  // Section Headings
  sectionHeadingStyle: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9; // 9 visual styles
  sectionHeadingAlign: 'left' | 'center' | 'right';
  sectionHeadingBold: boolean;
  sectionHeadingCapitalization: 'capitalize' | 'uppercase';
  sectionHeadingSize: 'S' | 'M' | 'L' | 'XL';
  sectionHeadingIcons: 'none' | 'outline' | 'filled';
  // Heading Visibility
  summaryHeadingVisible: boolean;
  workHeadingVisible: boolean;
  educationHeadingVisible: boolean;
  skillsHeadingVisible: boolean;
  projectsHeadingVisible: boolean;
  certificatesHeadingVisible: boolean;
  languagesHeadingVisible: boolean;
  interestsHeadingVisible: boolean;
  publicationsHeadingVisible: boolean;
  awardsHeadingVisible: boolean;
  referencesHeadingVisible: boolean;
  customHeadingVisible: boolean;
  // Entry Layout
  entryLayoutStyle: 1 | 2 | 3 | 4 | 5; // 5 layout styles
  entryColumnWidth: 'auto' | 'manual';
  entryTitleSize: 'S' | 'M' | 'L';
  entrySubtitleStyle: 'normal' | 'bold' | 'italic';
  entrySubtitlePlacement: 'sameLine' | 'nextLine';
  entryIndentBody: boolean;
  entryListStyle: 'bullet' | 'hyphen';
  // Personal Details
  personalDetailsAlign: 'left' | 'center' | 'right';
  personalDetailsArrangement: 1 | 2; // 2 arrangement styles
  personalDetailsContactStyle: 'icon' | 'bullet' | 'bar';
  personalDetailsIconStyle: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  // Name
  nameSize: 'XS' | 'S' | 'M' | 'L' | 'XL';
  nameFontSize: number;
  nameLineHeight: number;
  nameBold: boolean;
  nameFont: 'body' | 'creative';
  titleFontSize: number;
  titleLineHeight: number;
  titleBold: boolean;
  titleItalic: boolean;
  contactFontSize: number;
  contactBold: boolean;
  contactItalic: boolean;
  contactSeparator: 'pipe' | 'dash' | 'comma';
  contactLinkUnderline: boolean; // Whether to underline links in contact info
  // Link Display Options
  linkShowIcon: boolean;       // Show link icon (🔗) before links
  linkShowFullUrl: boolean;    // Show full URL instead of link text
  // Profile Image
  showProfileImage: boolean;
  profileImageSize: 'S' | 'M' | 'L';
  profileImageShape: 'circle' | 'square';
  profileImageBorder: boolean;
  // Skills
  skillsDisplayStyle: 'grid' | 'level' | 'compact' | 'bubble' | 'boxed';
  skillsLevelStyle: 0 | 1 | 2 | 3 | 4;
  skillsListStyle: 'bullet' | 'dash' | 'inline' | 'blank' | 'number';
  // Languages
  // Languages
  languagesListStyle: 'bullet' | 'number' | 'none';
  languagesNameBold: boolean;
  languagesNameItalic: boolean;
  languagesFluencyBold: boolean;
  languagesFluencyItalic: boolean;
  // Interests
  // Interests
  interestsListStyle: 'bullet' | 'number' | 'none';
  interestsNameBold: boolean;
  interestsNameItalic: boolean;
  interestsKeywordsBold: boolean;
  interestsKeywordsItalic: boolean;
  // Certificates
  certificatesDisplayStyle: 'grid' | 'compact' | 'bubble';
  certificatesLevelStyle: 1 | 2 | 3 | 4;
  // Professional Experience
  experienceCompanyListStyle: 'bullet' | 'number' | 'none';
  experienceCompanyBold: boolean;
  experienceCompanyItalic: boolean;
  experiencePositionBold: boolean;
  experiencePositionItalic: boolean;
  experienceWebsiteBold: boolean;
  experienceWebsiteItalic: boolean;
  experienceDateBold: boolean;
  experienceDateItalic: boolean;
  experienceAchievementsListStyle: 'bullet' | 'number' | 'none';
  experienceAchievementsBold: boolean;
  experienceAchievementsItalic: boolean;
  // Education
  educationInstitutionListStyle: 'bullet' | 'number' | 'none';
  educationInstitutionBold: boolean;
  educationInstitutionItalic: boolean;
  educationDegreeBold: boolean;
  educationDegreeItalic: boolean;
  educationAreaBold: boolean;
  educationAreaItalic: boolean;
  educationDateBold: boolean;
  educationDateItalic: boolean;
  educationGpaBold: boolean;
  educationGpaItalic: boolean;
  educationCoursesBold: boolean;
  educationCoursesItalic: boolean;
  // Publications
  publicationsListStyle: 'bullet' | 'number' | 'none';
  publicationsNameBold: boolean;
  publicationsNameItalic: boolean;
  publicationsPublisherBold: boolean;
  publicationsPublisherItalic: boolean;
  publicationsUrlBold: boolean;
  publicationsUrlItalic: boolean;
  publicationsDateBold: boolean;
  publicationsDateItalic: boolean;
  // Awards
  awardsListStyle: 'bullet' | 'number' | 'none';
  awardsTitleBold: boolean;
  awardsTitleItalic: boolean;
  awardsAwarderBold: boolean;
  awardsAwarderItalic: boolean;
  awardsDateBold: boolean;
  awardsDateItalic: boolean;
  // References
  referencesListStyle: 'bullet' | 'number' | 'none';
  referencesNameBold: boolean;
  referencesNameItalic: boolean;
  referencesPositionBold: boolean;
  referencesPositionItalic: boolean;
  // Custom Sections
  customSectionListStyle: 'bullet' | 'number' | 'none';
  customSectionNameBold: boolean;
  customSectionNameItalic: boolean;
  customSectionDescriptionBold: boolean;
  customSectionDescriptionItalic: boolean;
  customSectionDateBold: boolean;
  customSectionDateItalic: boolean;
  customSectionUrlBold: boolean;
  customSectionUrlItalic: boolean;
  // Project Styles
  projectsListStyle: 'bullet' | 'number' | 'none';
  projectsNameBold: boolean;
  projectsNameItalic: boolean;
  projectsDateBold: boolean;
  projectsDateItalic: boolean;
  projectsTechnologiesBold: boolean;
  projectsTechnologiesItalic: boolean;
  projectsAchievementsListStyle: 'bullet' | 'number' | 'none';
  projectsFeaturesBold: boolean;
  projectsFeaturesItalic: boolean;
  projectsUrlBold: boolean;
  projectsUrlItalic: boolean;
  // Certificate Styles
  certificatesListStyle: 'bullet' | 'number' | 'none';
  certificatesNameBold: boolean;
  certificatesNameItalic: boolean;
  certificatesIssuerBold: boolean;
  certificatesIssuerItalic: boolean;
  certificatesDateBold: boolean;
  certificatesDateItalic: boolean;
  certificatesUrlBold: boolean;
  certificatesUrlItalic: boolean;
}

export interface Resume {
  id: string;
  meta: {
    title: string;
    templateId: string;
    themeColor: string;
    lastModified: string;
    layoutSettings: LayoutSettings;
  };
  basics: ResumeBasics;
  work: WorkExperience[];
  education: Education[];
  skills: Skill[];
  projects: Project[];
  certificates: Certificate[];
  languages: Language[];
  interests: Interest[];
  publications: Publication[];
  awards: Award[];
  references: Reference[];
  custom: CustomSection[];
}

export interface AppSettings {
  id: string;
  theme: 'light' | 'dark' | 'system';
  defaultTemplateId: string;
}

// Dexie database definition
const db = new Dexie('ResumeBuilderDB') as Dexie & {
  resumes: EntityTable<Resume, 'id'>;
  settings: EntityTable<AppSettings, 'id'>;
};

// Schema version 1
db.version(1).stores({
  resumes: 'id, meta.title, meta.lastModified',
  settings: 'id',
});

export { db };
