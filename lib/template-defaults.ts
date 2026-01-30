//legacy code

import { LayoutSettings } from "@/components/design/types";
import { SECTIONS } from "./constants";

/**
 * Template-specific default layout settings.
 * Each template has a unique visual style and configuration.
 */

const baseDefaults = {
  fontSize: 8.5,
  lineHeight: 1.15,
  marginHorizontal: 12,
  marginVertical: 10,
  sectionMargin: 6,
  
  bulletMargin: 1,
  useBullets: true,
  themeColorTarget: ["headings", "links", "icons", "decorations"],
  
  // Link settings
  linkShowFullUrl: true,

  //headerBottomMargin: 2,
  sectionOrder: SECTIONS.map((s) => s.id),
  // Section heading visibility defaults
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
};

export const TEMPLATE_DEFAULTS: Record<string, Partial<LayoutSettings>> = {
  // Classic Template - Traditional serif with structured layout, optimized for content density
  classic: {
    ...baseDefaults,
    fontFamily: "Times-Roman",
    columnCount: 1,
    headerPosition: "top",
    leftColumnWidth: 30,
    headerBottomMargin: 4,
    sectionOrder: [
      "summary",
      "work",
      "education",
      "skills",
      "projects",
      "certificates",
      "publications",
      "awards",
      "languages",
      "interests",
      "references",
      "custom",
    ],
    
    // Section Headings - Solid underline, uppercase, compact
    sectionHeadingStyle: 3,
    sectionHeadingAlign: "left",
    sectionHeadingBold: true,
    sectionHeadingCapitalization: "uppercase",
    sectionHeadingSize: "M",
    sectionHeadingIcons: "none",
    
    // Entry Layout - Traditional style, compact
    entryLayoutStyle: 1,
    entryColumnWidth: "auto",
    entryTitleSize: "M",
    entrySubtitleStyle: "italic",
    entrySubtitlePlacement: "nextLine",
    entryIndentBody: false,
    entryListStyle: "bullet",
    
    // Header/Personal Details - Centered, formal, compact
    personalDetailsAlign: "center",
    personalDetailsArrangement: 1,
    personalDetailsContactStyle: "icon",
    personalDetailsIconStyle: 1,
    nameSize: "M",

    nameFontSize: 22,
    nameLineHeight: 1,
    nameBold: true,
    nameFont: "body",
    titleFontSize: 11,
    titleLineHeight: 1,
    titleBold: false,
    titleItalic: true,
    contactFontSize: 9,
    contactBold: false,
    contactItalic: false,
    contactSeparator: "pipe",

    showProfileImage: false,
    profileImageSize: "M",
    profileImageShape: "circle",
    profileImageBorder: false,
    
    // Skills - Grid layout
    skillsDisplayStyle: "grid",
    skillsLevelStyle: 0,
    skillsListStyle: "bullet",
    
    // Languages - Bullet list
    languagesListStyle: "bullet",
    languagesNameBold: true,
    languagesNameItalic: false,
    languagesFluencyBold: false,
    languagesFluencyItalic: false,
    
    // Interests - Bullet list
    interestsListStyle: "bullet",
    interestsNameBold: true,
    interestsNameItalic: false,
    interestsKeywordsBold: false,
    interestsKeywordsItalic: false,
    
    // Experience
    experienceCompanyListStyle: "bullet",
    experienceCompanyBold: true,
    experienceCompanyItalic: false,
    experiencePositionBold: false,
    experiencePositionItalic: true,
    experienceWebsiteBold: false,
    experienceWebsiteItalic: false,
    experienceDateBold: false,
    experienceDateItalic: false,
    experienceAchievementsListStyle: "bullet",
    experienceAchievementsBold: false,
    experienceAchievementsItalic: false,
    
    // Education
    educationInstitutionListStyle: "bullet",
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
    
    // Projects
    projectsListStyle: "bullet",
    projectsNameBold: true,
    projectsNameItalic: false,
    projectsDateBold: false,
    projectsDateItalic: false,
    projectsTechnologiesBold: false,
    projectsTechnologiesItalic: false,
    projectsAchievementsListStyle: "bullet",
    projectsFeaturesBold: false,
    projectsFeaturesItalic: false,
    
    // Certificates
    certificatesDisplayStyle: "compact",
    certificatesLevelStyle: 1,
    certificatesListStyle: "bullet",
    certificatesNameBold: true,
    certificatesNameItalic: false,
    certificatesIssuerBold: false,
    certificatesIssuerItalic: false,
    certificatesDateBold: false,
    certificatesDateItalic: false,
    certificatesUrlBold: false,
    certificatesUrlItalic: false,
    
    // Publications
    publicationsListStyle: "bullet",
    publicationsNameBold: true,
    publicationsNameItalic: false,
    publicationsPublisherBold: false,
    publicationsPublisherItalic: false,
    publicationsUrlBold: false,
    publicationsUrlItalic: false,
    publicationsDateBold: false,
    publicationsDateItalic: false,
    
    // Awards
    awardsListStyle: "bullet",
    awardsTitleBold: true,
    awardsTitleItalic: false,
    awardsAwarderBold: false,
    awardsAwarderItalic: false,
    awardsDateBold: false,
    awardsDateItalic: false,
    
    // References
    referencesListStyle: "bullet",
    referencesNameBold: true,
    referencesNameItalic: false,
    referencesPositionBold: false,
    referencesPositionItalic: false,
    
    // Custom
    customSectionListStyle: "bullet",
    customSectionNameBold: true,
    customSectionNameItalic: false,
    customSectionDescriptionBold: false,
    customSectionDescriptionItalic: false,
    customSectionDateBold: false,
    customSectionDateItalic: false,
    customSectionUrlBold: false,
    customSectionUrlItalic: false,
  },

  // ATS Template - Simple, machine-readable, single column
  ats: {
    ...baseDefaults,
    fontFamily: "Roboto",
    columnCount: 1,
    headerPosition: "top",
    leftColumnWidth: 30,
    headerBottomMargin: 15,
    sectionOrder: [
      "summary",
      "work",
      "skills",
      "education",
      "projects",
      "certificates",
      "languages",
      "publications",
      "awards",
      "interests",
      "references",
      "custom",
    ],
    
    // Section Headings - Simple, no decoration
    sectionHeadingStyle: 2,
    sectionHeadingAlign: "left",
    sectionHeadingBold: true,
    sectionHeadingCapitalization: "uppercase",
    sectionHeadingSize: "M",
    sectionHeadingIcons: "none",
    
    // Entry Layout - Clean and simple
    entryLayoutStyle: 1,
    entryColumnWidth: "auto",
    entryTitleSize: "M",
    entrySubtitleStyle: "normal",
    entrySubtitlePlacement: "nextLine",
    entryIndentBody: false,
    entryListStyle: "bullet",
    
    // Header - Left aligned, text-based
    personalDetailsAlign: "left",
    personalDetailsArrangement: 2,
    personalDetailsContactStyle: "icon",
    personalDetailsIconStyle: 1,
    nameSize: "L",
    nameFontSize: 32,
    nameLineHeight: 1.2,
    nameBold: true,
    nameFont: "body",
    titleFontSize: 14,
    titleLineHeight: 1.2,
    titleBold: false,
    titleItalic: false,
    contactFontSize: 10,
    contactBold: false,
    contactItalic: false,
    contactSeparator: "pipe",
    showProfileImage: false,
    profileImageSize: "M",
    profileImageShape: "circle",
    profileImageBorder: false,
    
    // Skills - Simple list
    skillsDisplayStyle: "level",
    skillsLevelStyle: 1,
    skillsListStyle: "bullet",
    
    // Languages
    languagesListStyle: "bullet",
    languagesNameBold: true,
    languagesNameItalic: false,
    languagesFluencyBold: false,
    languagesFluencyItalic: false,
    
    // Interests
    interestsListStyle: "bullet",
    interestsNameBold: false,
    interestsNameItalic: false,
    interestsKeywordsBold: false,
    interestsKeywordsItalic: false,
    
    // Experience - Simple formatting
    experienceCompanyListStyle: "none",
    experienceCompanyBold: true,
    experienceCompanyItalic: false,
    experiencePositionBold: true,
    experiencePositionItalic: false,
    experienceWebsiteBold: false,
    experienceWebsiteItalic: false,
    experienceDateBold: false,
    experienceDateItalic: false,
    experienceAchievementsListStyle: "bullet",
    experienceAchievementsBold: false,
    experienceAchievementsItalic: false,
    
    // Education
    educationInstitutionListStyle: "none",
    educationInstitutionBold: true,
    educationInstitutionItalic: false,
    educationDegreeBold: true,
    educationDegreeItalic: false,
    educationAreaBold: false,
    educationAreaItalic: false,
    educationDateBold: false,
    educationDateItalic: false,
    educationGpaBold: false,
    educationGpaItalic: false,
    educationCoursesBold: false,
    educationCoursesItalic: false,
    
    // Projects
    projectsListStyle: "bullet",
    projectsNameBold: true,
    projectsNameItalic: false,
    projectsDateBold: false,
    projectsDateItalic: false,
    projectsTechnologiesBold: false,
    projectsTechnologiesItalic: false,
    projectsAchievementsListStyle: "bullet",
    projectsFeaturesBold: false,
    projectsFeaturesItalic: false,
    projectsUrlBold: false,
    projectsUrlItalic: false,
    
    // Certificates
    certificatesDisplayStyle: "compact",
    certificatesLevelStyle: 1,
    certificatesListStyle: "bullet",
    certificatesNameBold: true,
    certificatesNameItalic: false,
    certificatesIssuerBold: false,
    certificatesIssuerItalic: false,
    certificatesDateBold: false,
    certificatesDateItalic: false,
    certificatesUrlBold: false,
    certificatesUrlItalic: false,
    
    // Publications
    publicationsListStyle: "bullet",
    publicationsNameBold: true,
    publicationsNameItalic: false,
    publicationsPublisherBold: false,
    publicationsPublisherItalic: false,
    publicationsUrlBold: false,
    publicationsUrlItalic: false,
    publicationsDateBold: false,
    publicationsDateItalic: false,
    
    // Awards
    awardsListStyle: "bullet",
    awardsTitleBold: true,
    awardsTitleItalic: false,
    awardsAwarderBold: false,
    awardsAwarderItalic: false,
    awardsDateBold: false,
    awardsDateItalic: false,
    
    // References
    referencesListStyle: "bullet",
    referencesNameBold: true,
    referencesNameItalic: false,
    referencesPositionBold: false,
    referencesPositionItalic: false,
    
    // Custom
    customSectionListStyle: "bullet",
    customSectionNameBold: true,
    customSectionNameItalic: false,
    customSectionDescriptionBold: false,
    customSectionDescriptionItalic: false,
    customSectionDateBold: false,
    customSectionDateItalic: false,
    customSectionUrlBold: false,
    customSectionUrlItalic: false,
  },

  // Creative Template - Two-column with colored sidebar
  creative: {
    ...baseDefaults,
    fontFamily: "Montserrat",
    columnCount: 2,
    headerPosition: "top",
    leftColumnWidth: 35,
    headerBottomMargin: 25,
    sectionOrder: [
      "summary",
      "skills",
      "projects",
      "work",
      "education",
      "certificates",
      "languages",
      "interests",
      "awards",
      "publications",
      "references",
      "custom",
    ],
    
    // Section Headings - Left accent bar
    sectionHeadingStyle: 5,
    sectionHeadingAlign: "left",
    sectionHeadingBold: true,
    sectionHeadingCapitalization: "uppercase",
    sectionHeadingSize: "M",
    sectionHeadingIcons: "outline",
    
    // Entry Layout - Modern style
    entryLayoutStyle: 2,
    entryColumnWidth: "auto",
    entryTitleSize: "M",
    entrySubtitleStyle: "bold",
    entrySubtitlePlacement: "sameLine",
    entryIndentBody: false,
    entryListStyle: "bullet",
    
    // Header - Centered with image
    personalDetailsAlign: "center",
    personalDetailsArrangement: 1,
    personalDetailsContactStyle: "icon",
    personalDetailsIconStyle: 2,
    nameSize: "L",
    nameFontSize: 30,
    nameLineHeight: 1.2,
    nameBold: true,
    nameFont: "body",
    titleFontSize: 14,
    titleLineHeight: 1.2,
    titleBold: false,
    titleItalic: false,
    contactFontSize: 10,
    contactBold: false,
    contactItalic: false,
    contactSeparator: "dash",
    showProfileImage: true,
    profileImageSize: "M",
    profileImageShape: "circle",
    profileImageBorder: true,
    
    // Skills - Grid with level bars
    skillsDisplayStyle: "grid",
    skillsLevelStyle: 0,
    skillsListStyle: "blank",
    
    // Languages
    languagesListStyle: "bullet",
    languagesNameBold: true,
    languagesNameItalic: false,
    languagesFluencyBold: true,
    languagesFluencyItalic: false,
    
    // Interests
    interestsListStyle: "bullet",
    interestsNameBold: true,
    interestsNameItalic: false,
    interestsKeywordsBold: false,
    interestsKeywordsItalic: true,
    
    // Experience
    experienceCompanyListStyle: "none",
    experienceCompanyBold: true,
    experienceCompanyItalic: false,
    experiencePositionBold: true,
    experiencePositionItalic: false,
    experienceWebsiteBold: false,
    experienceWebsiteItalic: false,
    experienceDateBold: true,
    experienceDateItalic: false,
    experienceAchievementsListStyle: "bullet",
    experienceAchievementsBold: false,
    experienceAchievementsItalic: false,
    
    // Education
    educationInstitutionListStyle: "none",
    educationInstitutionBold: true,
    educationInstitutionItalic: false,
    educationDegreeBold: true,
    educationDegreeItalic: false,
    educationAreaBold: false,
    educationAreaItalic: true,
    educationDateBold: false,
    educationDateItalic: false,
    educationGpaBold: true,
    educationGpaItalic: false,
    educationCoursesBold: false,
    educationCoursesItalic: false,
    
    // Projects
    projectsListStyle: "bullet",
    projectsNameBold: true,
    projectsNameItalic: false,
    projectsDateBold: true,
    projectsDateItalic: false,
    projectsTechnologiesBold: true,
    projectsTechnologiesItalic: false,
    projectsAchievementsListStyle: "bullet",
    projectsFeaturesBold: false,
    projectsFeaturesItalic: false,
    
    // Certificates
    certificatesDisplayStyle: "grid",
    certificatesLevelStyle: 3,
    certificatesListStyle: "bullet",
    certificatesNameBold: true,
    certificatesNameItalic: false,
    certificatesIssuerBold: false,
    certificatesIssuerItalic: true,
    certificatesDateBold: false,
    certificatesDateItalic: false,
    certificatesUrlBold: false,
    certificatesUrlItalic: false,
    
    // Publications
    publicationsListStyle: "bullet",
    publicationsNameBold: true,
    publicationsNameItalic: true,
    publicationsPublisherBold: false,
    publicationsPublisherItalic: false,
    publicationsUrlBold: false,
    publicationsUrlItalic: false,
    publicationsDateBold: false,
    publicationsDateItalic: false,
    
    // Awards
    awardsListStyle: "bullet",
    awardsTitleBold: true,
    awardsTitleItalic: false,
    awardsAwarderBold: false,
    awardsAwarderItalic: true,
    awardsDateBold: false,
    awardsDateItalic: false,
    
    // References
    referencesListStyle: "bullet",
    referencesNameBold: true,
    referencesNameItalic: false,
    referencesPositionBold: false,
    referencesPositionItalic: true,
    
    // Custom
    customSectionListStyle: "bullet",
    customSectionNameBold: true,
    customSectionNameItalic: false,
    customSectionDescriptionBold: false,
    customSectionDescriptionItalic: false,
    customSectionDateBold: false,
    customSectionDateItalic: false,
    customSectionUrlBold: false,
    customSectionUrlItalic: false,
  },

  "classic-slate": {
    ...baseDefaults,
    fontFamily: "Helvetica",
    columnCount: 2,
    headerPosition: "top",
    leftColumnWidth: 65,
    headerBottomMargin: 10,
    sectionOrder: [
      "summary",
      "work",
      "skills",
      "education",
      "projects",
      "certificates",
      "publications",
      "awards",
      "languages",
      "interests",
      "references",
      "custom",
    ],

    // Section Headings - Center, Lines Above/Below
    sectionHeadingStyle: 6,
    sectionHeadingAlign: "center",
    sectionHeadingBold: true,
    sectionHeadingCapitalization: "capitalize",
    sectionHeadingSize: "M",
    sectionHeadingIcons: "none",

    // Entry Layout
    entryLayoutStyle: 1,
    entryColumnWidth: "auto",
    entryTitleSize: "M",
    entrySubtitleStyle: "normal",
    entrySubtitlePlacement: "sameLine",
    entryIndentBody: false,
    entryListStyle: "bullet",

    // Header/Personal Details
    personalDetailsAlign: "center",
    personalDetailsArrangement: 1,
    personalDetailsContactStyle: "bullet",
    personalDetailsIconStyle: 1,
    nameSize: "L",

    nameFontSize: 24,
    nameLineHeight: 1.2,
    nameBold: true,
    nameFont: "body",
    titleFontSize: 12,
    titleLineHeight: 1.2,
    titleBold: false,
    titleItalic: false,
    contactFontSize: 9,
    contactBold: false,
    contactItalic: false,
    contactSeparator: "pipe",

    showProfileImage: false,
  },

  // Modern Template - Minimalist, clean typography
  modern: {
    ...baseDefaults,
    fontFamily: "Open Sans",
    columnCount: 1,
    headerPosition: "top",
    leftColumnWidth: 30,
    headerBottomMargin: 12,
    sectionOrder: [
      "summary",
      "work",
      "projects",
      "skills",
      "education",
      "certificates",
      "languages",
      "awards",
      "publications",
      "interests",
      "references",
      "custom",
    ],
    
    // Section Headings - Top & bottom border
    sectionHeadingStyle: 6,
    sectionHeadingAlign: "left",
    sectionHeadingBold: true,
    sectionHeadingCapitalization: "uppercase",
    sectionHeadingSize: "S",
    sectionHeadingIcons: "none",
    
    // Entry Layout
    entryLayoutStyle: 1,
    entryColumnWidth: "auto",
    entryTitleSize: "M",
    entrySubtitleStyle: "normal",
    entrySubtitlePlacement: "sameLine",
    entryIndentBody: false,
    entryListStyle: "hyphen",
    
    // Header - Left aligned, clean
    personalDetailsAlign: "left",
    personalDetailsArrangement: 1,
    personalDetailsContactStyle: "icon",
    personalDetailsIconStyle: 1,
    nameSize: "L",
    nameFontSize: 36,
    nameLineHeight: 1.1,
    nameBold: true,
    nameFont: "body",
    titleFontSize: 16,
    titleLineHeight: 1.2,
    titleBold: false,
    titleItalic: false,
    contactFontSize: 10,
    contactBold: false,
    contactItalic: false,
    contactSeparator: "dash",
    showProfileImage: false,
    profileImageSize: "M",
    profileImageShape: "circle",
    profileImageBorder: false,
    
    // Skills
    skillsDisplayStyle: "compact",
    skillsLevelStyle: 1,
    skillsListStyle: "bullet",
    
    // Languages
    languagesListStyle: "bullet",
    languagesNameBold: true,
    languagesNameItalic: false,
    languagesFluencyBold: false,
    languagesFluencyItalic: false,
    
    // Interests
    interestsListStyle: "bullet",
    interestsNameBold: false,
    interestsNameItalic: false,
    interestsKeywordsBold: false,
    interestsKeywordsItalic: false,
    
    // Experience
    experienceCompanyListStyle: "none",
    experienceCompanyBold: true,
    experienceCompanyItalic: false,
    experiencePositionBold: false,
    experiencePositionItalic: false,
    experienceWebsiteBold: false,
    experienceWebsiteItalic: false,
    experienceDateBold: false,
    experienceDateItalic: false,
    experienceAchievementsListStyle: "bullet",
    experienceAchievementsBold: false,
    experienceAchievementsItalic: false,
    
    // Education
    educationInstitutionListStyle: "none",
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
    
    // Projects
    projectsListStyle: "bullet",
    projectsNameBold: true,
    projectsNameItalic: false,
    projectsDateBold: false,
    projectsDateItalic: false,
    projectsTechnologiesBold: false,
    projectsTechnologiesItalic: false,
    projectsAchievementsListStyle: "bullet",
    projectsFeaturesBold: false,
    projectsFeaturesItalic: false,
    
    // Certificates
    certificatesDisplayStyle: "compact",
    certificatesLevelStyle: 1,
    certificatesListStyle: "bullet",
    certificatesNameBold: true,
    certificatesNameItalic: false,
    certificatesIssuerBold: false,
    certificatesIssuerItalic: false,
    certificatesDateBold: false,
    certificatesDateItalic: false,
    certificatesUrlBold: false,
    certificatesUrlItalic: false,
    
    // Publications
    publicationsListStyle: "bullet",
    publicationsNameBold: true,
    publicationsNameItalic: true,
    publicationsPublisherBold: false,
    publicationsPublisherItalic: false,
    publicationsUrlBold: false,
    publicationsUrlItalic: false,
    publicationsDateBold: false,
    publicationsDateItalic: false,
    
    // Awards
    awardsListStyle: "bullet",
    awardsTitleBold: true,
    awardsTitleItalic: false,
    awardsAwarderBold: false,
    awardsAwarderItalic: false,
    awardsDateBold: false,
    awardsDateItalic: false,
    
    // References
    referencesListStyle: "bullet",
    referencesNameBold: true,
    referencesNameItalic: false,
    referencesPositionBold: false,
    referencesPositionItalic: false,
    
    // Custom
    customSectionListStyle: "bullet",
    customSectionNameBold: true,
    customSectionNameItalic: false,
    customSectionDescriptionBold: false,
    customSectionDescriptionItalic: false,
    customSectionDateBold: false,
    customSectionDateItalic: false,
    customSectionUrlBold: false,
    customSectionUrlItalic: false,
  },

  // Multicolumn Template - 3-column layout
  multicolumn: {
    ...baseDefaults,
    fontFamily: "Roboto",
    columnCount: 3,
    headerPosition: "top",
    leftColumnWidth: 25, // Left column width (approx 25%)
    // Note: We'll infer Middle/Right from the remaining 75%. 
    // E.g. Middle = 50%, Right = 25% or similar logic in the template.
    headerBottomMargin: 12,
    sectionOrder: [
      // Left Column
      "skills",
      "languages",
      "interests",
      
      // Middle Column (Main)
      "summary",
      "work",
      "projects",
      
      // Right Column
      "education",
      "certificates",
      "awards",
      "publications",
      "references",
      "custom",
    ],

    // Section Headings
    sectionHeadingStyle: 4,
    sectionHeadingAlign: "left",
    sectionHeadingBold: true,
    sectionHeadingCapitalization: "uppercase",
    sectionHeadingSize: "S",
    sectionHeadingIcons: "none",

    // Entry Layout
    entryLayoutStyle: 1,
    entryColumnWidth: "auto",
    entryTitleSize: "M",
    entrySubtitleStyle: "bold",
    entrySubtitlePlacement: "sameLine",
    entryIndentBody: false,
    entryListStyle: "bullet",

    // Header/Personal Details
    personalDetailsAlign: "left",
    personalDetailsArrangement: 1,
    personalDetailsContactStyle: "icon",
    personalDetailsIconStyle: 1,
    nameSize: "L",
    nameFontSize: 28,
    nameLineHeight: 1.2,
    nameBold: true,
    nameFont: "body",
    titleFontSize: 14,
    titleLineHeight: 1.2,
    titleBold: false,
    titleItalic: false,
    contactFontSize: 10,
    contactBold: false,
    contactItalic: false,
    contactSeparator: "dash",

    showProfileImage: true,
    profileImageSize: "M",
    profileImageShape: "circle",
    profileImageBorder: false,

    // Skills
    skillsDisplayStyle: "grid",
    skillsLevelStyle: 0,
    skillsListStyle: "bullet",

    // Languages
    languagesListStyle: "bullet",
    languagesNameBold: true,
    languagesNameItalic: false,
    languagesFluencyBold: false,
    languagesFluencyItalic: false,

    // Interests
    interestsListStyle: "bullet",
    interestsNameBold: true,
    interestsNameItalic: false,
    interestsKeywordsBold: false,
    interestsKeywordsItalic: false,

    // Experience
    experienceCompanyListStyle: "none",
    experienceCompanyBold: true,
    experienceCompanyItalic: false,
    experiencePositionBold: true,
    experiencePositionItalic: false,
    experienceWebsiteBold: false,
    experienceWebsiteItalic: false,
    experienceDateBold: false,
    experienceDateItalic: true,
    experienceAchievementsListStyle: "bullet",
    experienceAchievementsBold: false,
    experienceAchievementsItalic: false,

    // Education
    educationInstitutionListStyle: "none",
    educationInstitutionBold: true,
    educationInstitutionItalic: false,
    educationDegreeBold: true,
    educationDegreeItalic: false,
    educationAreaBold: false,
    educationAreaItalic: false,
    educationDateBold: false,
    educationDateItalic: true,
    educationGpaBold: false,
    educationGpaItalic: false,
    educationCoursesBold: false,
    educationCoursesItalic: false,

    // Projects
    projectsListStyle: "bullet",
    projectsNameBold: true,
    projectsNameItalic: false,
    projectsDateBold: false,
    projectsDateItalic: true,
    projectsTechnologiesBold: false,
    projectsTechnologiesItalic: true,
    projectsAchievementsListStyle: "bullet",
    projectsFeaturesBold: false,
    projectsFeaturesItalic: false,

    // Certificates
    certificatesDisplayStyle: "compact",
    certificatesLevelStyle: 1,
    certificatesListStyle: "bullet",
    certificatesNameBold: true,
    certificatesNameItalic: false,
    certificatesIssuerBold: false,
    certificatesIssuerItalic: true,
    certificatesDateBold: false,
    certificatesDateItalic: false,
    certificatesUrlBold: false,
    certificatesUrlItalic: false,

    // Publications
    publicationsListStyle: "bullet",
    publicationsNameBold: true,
    publicationsNameItalic: false,
    publicationsPublisherBold: false,
    publicationsPublisherItalic: true,
    publicationsUrlBold: false,
    publicationsUrlItalic: false,
    publicationsDateBold: false,
    publicationsDateItalic: false,

    // Awards
    awardsListStyle: "bullet",
    awardsTitleBold: true,
    awardsTitleItalic: false,
    awardsAwarderBold: false,
    awardsAwarderItalic: true,
    awardsDateBold: false,
    awardsDateItalic: false,

    // References
    referencesListStyle: "bullet",
    referencesNameBold: true,
    referencesNameItalic: false,
    referencesPositionBold: false,
    referencesPositionItalic: true,

    // Custom
    customSectionListStyle: "bullet",
    customSectionNameBold: true,
    customSectionNameItalic: false,
    customSectionDescriptionBold: false,
    customSectionDescriptionItalic: false,
    customSectionDateBold: false,
    customSectionDateItalic: false,
    customSectionUrlBold: false,
    customSectionUrlItalic: false,
  },

  // Professional Template - Executive style with serif
  professional: {
    ...baseDefaults,
    fontFamily: "Roboto",
    columnCount: 2,
    headerPosition: "top",
    leftColumnWidth: 30,
    headerBottomMargin: 15,
    sectionOrder: [
      "summary",
      "work",
      "education",
      "skills",
      "certificates",
      "publications",
      "awards",
      "projects",
      "languages",
      "references",
      "interests",
      "custom",
    ],
    
    // Section Headings - Background highlight
    sectionHeadingStyle: 4,
    sectionHeadingAlign: "left",
    sectionHeadingBold: true,
    sectionHeadingCapitalization: "uppercase",
    sectionHeadingSize: "M",
    sectionHeadingIcons: "none",
    
    // Entry Layout
    entryLayoutStyle: 1,
    entryColumnWidth: "auto",
    entryTitleSize: "M",
    entrySubtitleStyle: "italic",
    entrySubtitlePlacement: "nextLine",
    entryIndentBody: false,
    entryListStyle: "bullet",
    
    // Header - Centered, formal
    personalDetailsAlign: "center",
    personalDetailsArrangement: 1,
    personalDetailsContactStyle: "icon",
    personalDetailsIconStyle: 1,
    nameSize: "L",
    nameFontSize: 32,
    nameLineHeight: 1.2,
    nameBold: true,
    nameFont: "body",
    titleFontSize: 16,
    titleLineHeight: 1.2,
    titleBold: true,
    titleItalic: false,
    contactFontSize: 10,
    contactBold: false,
    contactItalic: false,
    contactSeparator: "pipe",
    showProfileImage: true,
    profileImageSize: "M",
    profileImageShape: "circle",
    profileImageBorder: true,
    
    // Skills
    skillsDisplayStyle: "level",
    skillsLevelStyle: 4,
    skillsListStyle: "bullet",
    
    // Languages
    languagesListStyle: "bullet",
    languagesNameBold: true,
    languagesNameItalic: false,
    languagesFluencyBold: true,
    languagesFluencyItalic: false,
    
    // Interests
    interestsListStyle: "bullet",
    interestsNameBold: true,
    interestsNameItalic: false,
    interestsKeywordsBold: false,
    interestsKeywordsItalic: false,
    
    // Experience
    experienceCompanyListStyle: "none",
    experienceCompanyBold: true,
    experienceCompanyItalic: false,
    experiencePositionBold: true,
    experiencePositionItalic: false,
    experienceWebsiteBold: false,
    experienceWebsiteItalic: true,
    experienceDateBold: false,
    experienceDateItalic: true,
    experienceAchievementsListStyle: "bullet",
    experienceAchievementsBold: false,
    experienceAchievementsItalic: false,
    
    // Education
    educationInstitutionListStyle: "none",
    educationInstitutionBold: true,
    educationInstitutionItalic: false,
    educationDegreeBold: true,
    educationDegreeItalic: false,
    educationAreaBold: false,
    educationAreaItalic: true,
    educationDateBold: false,
    educationDateItalic: true,
    educationGpaBold: true,
    educationGpaItalic: false,
    educationCoursesBold: false,
    educationCoursesItalic: false,
    
    // Projects
    projectsListStyle: "bullet",
    projectsNameBold: true,
    projectsNameItalic: false,
    projectsDateBold: false,
    projectsDateItalic: true,
    projectsTechnologiesBold: true,
    projectsTechnologiesItalic: false,
    projectsAchievementsListStyle: "bullet",
    projectsFeaturesBold: false,
    projectsFeaturesItalic: false,
    
    // Certificates
    certificatesDisplayStyle: "compact",
    certificatesLevelStyle: 4,
    certificatesListStyle: "bullet",
    certificatesNameBold: true,
    certificatesNameItalic: false,
    certificatesIssuerBold: false,
    certificatesIssuerItalic: true,
    certificatesDateBold: false,
    certificatesDateItalic: true,
    certificatesUrlBold: false,
    certificatesUrlItalic: false,
    
    // Publications
    publicationsListStyle: "bullet",
    publicationsNameBold: true,
    publicationsNameItalic: true,
    publicationsPublisherBold: true,
    publicationsPublisherItalic: false,
    publicationsUrlBold: false,
    publicationsUrlItalic: false,
    publicationsDateBold: false,
    publicationsDateItalic: true,
    
    // Awards
    awardsListStyle: "bullet",
    awardsTitleBold: true,
    awardsTitleItalic: false,
    awardsAwarderBold: true,
    awardsAwarderItalic: false,
    awardsDateBold: false,
    awardsDateItalic: true,
    
    // References
    referencesListStyle: "bullet",
    referencesNameBold: true,
    referencesNameItalic: false,
    referencesPositionBold: true,
    referencesPositionItalic: false,
    
    // Custom
    customSectionListStyle: "bullet",
    customSectionNameBold: true,
    customSectionNameItalic: false,
    customSectionDescriptionBold: false,
    customSectionDescriptionItalic: false,
    customSectionDateBold: false,
    customSectionDateItalic: true,
    customSectionUrlBold: false,
    customSectionUrlItalic: false,
  },

  // Elegant Template - Sophisticated with full-width banner
  elegant: {
    ...baseDefaults,
    fontFamily: "Lato",
    columnCount: 1,
    headerPosition: "top",
    leftColumnWidth: 30,
    headerBottomMargin: 28,
    sectionOrder: [
      "summary",
      "education",
      "publications",
      "work",
      "awards",
      "projects",
      "skills",
      "certificates",
      "languages",
      "interests",
      "references",
      "custom",
    ],
    
    // Section Headings - Dashed underline
    sectionHeadingStyle: 7,
    sectionHeadingAlign: "left",
    sectionHeadingBold: true,
    sectionHeadingCapitalization: "capitalize",
    sectionHeadingSize: "L",
    sectionHeadingIcons: "none",
    
    // Entry Layout
    entryLayoutStyle: 2,
    entryColumnWidth: "auto",
    entryTitleSize: "L",
    entrySubtitleStyle: "italic",
    entrySubtitlePlacement: "sameLine",
    entryIndentBody: false,
    entryListStyle: "bullet",
    
    // Header - Centered, elegant
    personalDetailsAlign: "center",
    personalDetailsArrangement: 1,
    personalDetailsContactStyle: "icon",
    personalDetailsIconStyle: 2,
    nameSize: "L",
    nameFontSize: 34,
    nameLineHeight: 1.2,
    nameBold: true,
    nameFont: "body",
    titleFontSize: 15,
    titleLineHeight: 1.2,
    titleBold: false,
    titleItalic: true,
    contactFontSize: 10,
    contactBold: false,
    contactItalic: false,
    contactSeparator: "dash",
    showProfileImage: true,
    profileImageSize: "L",
    profileImageShape: "circle",
    profileImageBorder: true,
    
    // Skills
    skillsDisplayStyle: "grid",
    skillsLevelStyle: 1,
    skillsListStyle: "blank",
    
    // Languages
    languagesListStyle: "bullet",
    languagesNameBold: true,
    languagesNameItalic: false,
    languagesFluencyBold: false,
    languagesFluencyItalic: true,
    
    // Interests
    interestsListStyle: "bullet",
    interestsNameBold: false,
    interestsNameItalic: false,
    interestsKeywordsBold: false,
    interestsKeywordsItalic: true,
    
    // Experience
    experienceCompanyListStyle: "none",
    experienceCompanyBold: true,
    experienceCompanyItalic: false,
    experiencePositionBold: false,
    experiencePositionItalic: true,
    experienceWebsiteBold: false,
    experienceWebsiteItalic: false,
    experienceDateBold: false,
    experienceDateItalic: true,
    experienceAchievementsListStyle: "bullet",
    experienceAchievementsBold: false,
    experienceAchievementsItalic: false,
    
    // Education
    educationInstitutionListStyle: "none",
    educationInstitutionBold: true,
    educationInstitutionItalic: false,
    educationDegreeBold: false,
    educationDegreeItalic: true,
    educationAreaBold: false,
    educationAreaItalic: false,
    educationDateBold: false,
    educationDateItalic: true,
    educationGpaBold: true,
    educationGpaItalic: false,
    educationCoursesBold: false,
    educationCoursesItalic: true,
    
    // Projects
    projectsListStyle: "bullet",
    projectsNameBold: true,
    projectsNameItalic: false,
    projectsDateBold: false,
    projectsDateItalic: true,
    projectsTechnologiesBold: false,
    projectsTechnologiesItalic: true,
    projectsAchievementsListStyle: "bullet",
    projectsFeaturesBold: false,
    projectsFeaturesItalic: false,
    
    // Certificates
    certificatesDisplayStyle: "grid",
    certificatesLevelStyle: 1,
    certificatesListStyle: "bullet",
    certificatesNameBold: true,
    certificatesNameItalic: false,
    certificatesIssuerBold: false,
    certificatesIssuerItalic: true,
    certificatesDateBold: false,
    certificatesDateItalic: true,
    certificatesUrlBold: false,
    certificatesUrlItalic: false,
    
    // Publications
    publicationsListStyle: "bullet",
    publicationsNameBold: true,
    publicationsNameItalic: true,
    publicationsPublisherBold: false,
    publicationsPublisherItalic: true,
    publicationsUrlBold: false,
    publicationsUrlItalic: false,
    publicationsDateBold: false,
    publicationsDateItalic: true,
    
    // Awards
    awardsListStyle: "bullet",
    awardsTitleBold: true,
    awardsTitleItalic: true,
    awardsAwarderBold: false,
    awardsAwarderItalic: true,
    awardsDateBold: false,
    awardsDateItalic: true,
    
    // References
    referencesListStyle: "bullet",
    referencesNameBold: true,
    referencesNameItalic: false,
    referencesPositionBold: false,
    referencesPositionItalic: true,
    
    // Custom
    customSectionListStyle: "bullet",
    customSectionNameBold: true,
    customSectionNameItalic: false,
    customSectionDescriptionBold: false,
    customSectionDescriptionItalic: true,
    customSectionDateBold: false,
    customSectionDateItalic: true,
    customSectionUrlBold: false,
    customSectionUrlItalic: false,
  },
  glow: {
    ...baseDefaults,
    themeColorTarget: [
      "headings",
      "links",
      "icons",
      "decorations",
      "name",
      "title",
    ],
    fontFamily: "Roboto",
    columnCount: 1,
    headerPosition: "left",
    leftColumnWidth: 30,
    headerBottomMargin: 10,
    sectionOrder: [
      "summary",
      "work",
      "education",
      "skills",
      "projects",
      "certificates",
      "publications",
      "awards",
      "languages",
      "interests",
      "references",
      "custom",
    ],

    // Section Headings - Uppercase, Bold, Large
    sectionHeadingStyle: 5, // No underline, we use border-left
    sectionHeadingAlign: "left",
    sectionHeadingBold: true,
    sectionHeadingCapitalization: "uppercase",
    sectionHeadingSize: "L",
    sectionHeadingIcons: "none",

    // Header
    nameFontSize: 28,
    nameBold: true,
    nameLineHeight: 1.0, // Reduced line height for Glow header
    nameFont: "body",
    titleFontSize: 12,
    titleBold: false,
    titleItalic: false,
    contactFontSize: 9,

    // Experience
    experienceCompanyListStyle: "bullet",
    experienceCompanyBold: true,
    experienceCompanyItalic: false,
    experiencePositionBold: false,
    experiencePositionItalic: true,
    experienceWebsiteBold: false,
    experienceWebsiteItalic: false,
    experienceDateBold: false,
    experienceDateItalic: false,
    experienceAchievementsListStyle: "bullet",
    experienceAchievementsBold: false,
    experienceAchievementsItalic: false,

    // Education
    educationInstitutionListStyle: "bullet",
    educationInstitutionBold: true,
    educationInstitutionItalic: false,
    educationDegreeBold: false,
    educationDegreeItalic: true,
    educationAreaBold: false,
    educationAreaItalic: false,
    educationDateBold: false,
    educationDateItalic: false,
    educationGpaBold: true,
    educationGpaItalic: false,
    educationCoursesBold: false,
    educationCoursesItalic: false,
    
    // Projects
    projectsListStyle: "bullet",
    projectsNameBold: true,
    projectsNameItalic: false,
    projectsDateBold: false,
    projectsDateItalic: false,
    projectsTechnologiesBold: false,
    projectsTechnologiesItalic: true,
    projectsAchievementsListStyle: "bullet",
    
    // Certificates
    certificatesListStyle: "bullet",
    certificatesNameBold: true,
    certificatesNameItalic: false,
    certificatesIssuerBold: false,
    certificatesIssuerItalic: true,
    certificatesDateBold: false,
    certificatesDateItalic: false,
    certificatesUrlBold: false,
    certificatesUrlItalic: false,

    // Entry
    entryTitleSize: "M",
    entrySubtitleStyle: "normal",
    
    // Skills
    skillsListStyle: "bullet",

    // Interests
    interestsListStyle: "bullet",
    interestsNameBold: true,
    interestsNameItalic: false,
    

    // Awards
    awardsListStyle: "bullet",
    awardsTitleBold: true,
    awardsTitleItalic: false,
    awardsAwarderBold: false,
    awardsAwarderItalic: true,
    awardsDateBold: false,
    awardsDateItalic: false,
    

    // Publications
    publicationsListStyle: "bullet",
    publicationsNameBold: true,
    publicationsNameItalic: false,
    publicationsPublisherBold: false,
    publicationsPublisherItalic: true,
    publicationsUrlBold: false,
    publicationsUrlItalic: false,
    publicationsDateBold: false,
    publicationsDateItalic: false,

    // References
    referencesListStyle: "bullet",
    referencesNameBold: true,
    referencesNameItalic: false,
    referencesPositionBold: false,
    referencesPositionItalic: true,

    // Languages
    languagesListStyle: "bullet",
    languagesNameBold: true,
    languagesNameItalic: false,

    // Custom
    customSectionListStyle: "bullet",
    customSectionNameBold: true,
    customSectionNameItalic: false,
    customSectionDescriptionBold: false,
    customSectionDescriptionItalic: true,
    customSectionDateBold: false,
    customSectionDateItalic: false,
    customSectionUrlBold: false,
    customSectionUrlItalic: false,
  },
  
  // Stylish Template - Wave header, two columns
  stylish: {
    ...baseDefaults,
    fontFamily: "Roboto",
    columnCount: 2,
    headerPosition: "left", // Default alignment
    leftColumnWidth: 65, // Main content is wider (left)
    headerBottomMargin: 0, // Header includes the wave, so no extra margin needed
    sectionOrder: [
      "summary",
      "work",
      "education",
      "skills",
      "projects",
      "languages",
      "certificates",
      "awards",
      "interests",
      "publications",
      "references",
      "custom",
    ],

    // Section Headings
    sectionHeadingStyle: 6, // Custom style handled in component
    sectionHeadingAlign: "left",
    sectionHeadingBold: true,
    sectionHeadingCapitalization: "uppercase",
    sectionHeadingSize: "M",
    sectionHeadingIcons: "none",

    // Entry Layout
    entryLayoutStyle: 1,
    entryColumnWidth: "auto",
    entryTitleSize: "M",
    entrySubtitleStyle: "normal",
    entrySubtitlePlacement: "nextLine",
    entryIndentBody: false,
    entryListStyle: "bullet",

    // Header
    personalDetailsAlign: "left",
    personalDetailsArrangement: 1,
    personalDetailsContactStyle: "icon",
    personalDetailsIconStyle: 1,
    nameFontSize: 30,
    nameLineHeight: 1.0,
    nameBold: true,
    nameFont: "body",
    titleFontSize: 14,
    titleLineHeight: 1.0,
    titleBold: false,
    titleItalic: false,
    contactFontSize: 10,
    contactBold: false,
    contactItalic: false,
    contactSeparator: "pipe",
    
    showProfileImage: true,
    profileImageSize: "M",
    profileImageShape: "circle",
    profileImageBorder: false,

    // Specific section styles
    skillsDisplayStyle: "grid", // Will look like chips
    skillsLevelStyle: 0,
    skillsListStyle: "bullet",

    languagesListStyle: "bullet",
    languagesNameBold: true, 
  },

  "polished": {
    ...baseDefaults,
    fontFamily: "Roboto",
    columnCount: 2,
    headerPosition: "top",
    leftColumnWidth: 65,
    headerBottomMargin: 0,
    sectionOrder: [
      "summary",
      "work",
      "education",
      "languages",
      "skills",
      "interests",
      "awards",
      "certificates",
      "custom",
      "publications",
      "projects",
      "references",
    ],

    // Section Headings
    sectionHeadingStyle: 2,
    sectionHeadingAlign: "left",
    sectionHeadingBold: false, 
    sectionHeadingCapitalization: "uppercase",
    sectionHeadingSize: "M",
    sectionHeadingIcons: "none",

    // Entry Layout
    entryLayoutStyle: 1,
    entryColumnWidth: "auto",
    entryTitleSize: "M",
    entrySubtitleStyle: "normal",
    entrySubtitlePlacement: "sameLine",
    entryIndentBody: false,
    entryListStyle: "bullet",

    // Header
    personalDetailsAlign: "left",
    personalDetailsArrangement: 1,
    personalDetailsContactStyle: "icon",
    personalDetailsIconStyle: 1,
    nameSize: "L",

    nameFontSize: 24,
    nameLineHeight: 1.2,
    nameBold: true,
    nameFont: "body",
    titleFontSize: 12,
    titleLineHeight: 1.2,
    titleBold: false,
    titleItalic: false,
    contactFontSize: 9,
    contactBold: false,
    contactItalic: false,
    contactSeparator: "pipe",

    showProfileImage: true,
    profileImageSize: "L",
    profileImageShape: "circle",
    profileImageBorder: false,

    // Specific section styles
    skillsDisplayStyle: "grid",
    skillsLevelStyle: 0,
    skillsListStyle: "bullet",
  },
};

// Import the new theme system for backwards compatibility
import { getCompiledTheme, COMPILED_THEMES } from "./theme-system";

/**
 * Get default layout settings for a specific template
 * 
 * This function now uses the new theme system internally while maintaining
 * backwards compatibility. The theme system provides:
 * - Composable presets (typography, headings, layouts, entries)
 * - Deep merge inheritance to reduce duplication
 * - ~50 lines per template instead of ~150
 * 
 * @param templateId The template identifier
 * @returns Complete layout settings with template-specific defaults
 */
export function getTemplateDefaults(templateId: string = 'ats'): Partial<LayoutSettings> {
  // First try the new theme system
  if (COMPILED_THEMES[templateId]) {
    return COMPILED_THEMES[templateId];
  }
  
  // Fallback to legacy TEMPLATE_DEFAULTS for any templates not yet migrated
  if (TEMPLATE_DEFAULTS[templateId]) {
    return TEMPLATE_DEFAULTS[templateId];
  }
  
  // Ultimate fallback to ATS from theme system
  return getCompiledTheme('ats');
}

/**
 * Get default theme color for a specific template
 * @param templateId The template identifier
 * @returns Hex color code for the template's default theme
 */
export function getTemplateThemeColor(templateId: string = 'ats'): string {
  const themeColors: Record<string, string> = {
    classic: '#000000',      // Black - traditional
    ats: '#2563eb',          // Blue - professional
    creative: '#8b5cf6',     // Purple - modern and friendly
    modern: '#10b981',       // Emerald - minimalist
    professional: '#0f172a', // Dark slate - executive
    elegant: '#2c3e50',      // Dark blue - sophisticated
    glow: '#f59e0b',         // Amber - high contrast
    stylish: '#ec4899',      // Pink - modern
    polished: '#0d9488',     // Teal - polished
    "classic-slate": '#334155', // Slate
    multicolumn: '#0284c7',  // Sky blue
    timeline: '#6366f1',     // Indigo
    developer: '#22c55e',    // Green
    developer2: '#3b82f6',   // Blue
  };
  
  return themeColors[templateId] || '#2563eb';
}
