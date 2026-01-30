/**
 * Theme System for Resume Templates
 * 
 * This module provides a composable theme configuration system that:
 * 1. Defines reusable style presets (typography, spacing, entries, etc.)
 * 2. Uses deep merge for inheritance to minimize duplication
 * 3. Allows templates to be defined in ~50 lines instead of ~150
 * 
 * Architecture:
 * - BaseTheme: Core settings shared by all templates
 * - StylePresets: Reusable configurations for specific aspects (typography, entries, etc.)
 * - LayoutPresets: Column and spacing configurations
 * - TemplateTheme: Combines base + presets + overrides
 */

import type { LayoutSettings } from "@/components/design/types";
import { SECTIONS } from "./constants";

// ============================================================================
// DEEP MERGE UTILITY
// ============================================================================

/**
 * Deep merge multiple objects, with later objects taking precedence
 */
export function deepMerge<T extends object>(...objects: Array<Partial<T> | undefined>): T {
  const result = {} as T;
  
  for (const obj of objects) {
    if (!obj) continue;
    
    for (const key of Object.keys(obj) as Array<keyof T>) {
      const resultValue = result[key];
      const objValue = obj[key];
      
      if (Array.isArray(objValue)) {
        (result as Record<string, unknown>)[key as string] = objValue;
      } else if (objValue && typeof objValue === "object" && !Array.isArray(objValue)) {
        (result as Record<string, unknown>)[key as string] = deepMerge(
          (resultValue as object) || {},
          objValue as object
        );
      } else if (objValue !== undefined) {
        (result as Record<string, unknown>)[key as string] = objValue;
      }
    }
  }
  
  return result;
}

// ============================================================================
// BASE THEME - Core defaults for all templates
// ============================================================================

export const BASE_THEME: Partial<LayoutSettings> = {
  // Core typography
  fontSize: 9,
  lineHeight: 1.3,
  fontFamily: "Roboto",
  
  // Page margins
  marginHorizontal: 12,
  marginVertical: 12,
  
  // Section spacing
  sectionMargin: 4,
  bulletMargin: 1,
  useBullets: true,
  headerBottomMargin: 12,
  
  // Color targets
  themeColorTarget: ["headings", "links", "icons", "decorations"],
  
  // Section order
  sectionOrder: SECTIONS.map((s) => s.id),
  
  // All section heading visibility defaults
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
  
  // Default profile image settings
  showProfileImage: false,
  profileImageSize: "M",
  profileImageShape: "circle",
  profileImageBorder: false,
};

// ============================================================================
// TYPOGRAPHY PRESETS
// ============================================================================

export const TYPOGRAPHY_PRESETS = {
  /** Clean sans-serif for modern look */
  modern: {
    fontFamily: "Open Sans",
    nameFontSize: 32,
    nameLineHeight: 1.1,
    nameBold: true,
    nameFont: "body",
    titleFontSize: 14,
    titleLineHeight: 1.2,
    titleBold: false,
    titleItalic: false,
    contactFontSize: 10,
    contactBold: false,
    contactItalic: false,
  },
  
  /** Traditional serif for classic look */
  classic: {
    fontFamily: "Times-Roman",
    nameFontSize: 22,
    nameLineHeight: 1.0,
    nameBold: true,
    nameFont: "body",
    nameLetterSpacing: 1,
    titleFontSize: 11,
    titleLineHeight: 1.0,
    titleBold: false,
    titleItalic: true,
    contactFontSize: 9,
    contactBold: false,
    contactItalic: false,
  },
  
  /** Clean Roboto for professional look */
  professional: {
    fontFamily: "Roboto",
    nameFontSize: 28,
    nameLineHeight: 1.2,
    nameBold: true,
    nameFont: "body",
    titleFontSize: 13,
    titleLineHeight: 1.2,
    titleBold: false,
    titleItalic: false,
    contactFontSize: 10,
    contactBold: false,
    contactItalic: false,
  },
  
  /** Bold Montserrat for creative look */
  creative: {
    fontFamily: "Montserrat",
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
  },
  
  /** Large ATS-friendly typography */
  ats: {
    fontFamily: "Roboto",
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
  },
  
  /** Helvetica for clean minimal look */
  minimal: {
    fontFamily: "Helvetica",
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
  },
} as const;

// ============================================================================
// SECTION HEADING PRESETS
// ============================================================================

export const HEADING_PRESETS = {
  /** Simple underline */
  underline: {
    sectionHeadingStyle: 3 as const,
    sectionHeadingAlign: "left" as const,
    sectionHeadingBold: true,
    sectionHeadingCapitalization: "uppercase" as const,
    sectionHeadingSize: "M" as const,
    sectionHeadingIcons: "none" as const,
    sectionHeadingLetterSpacing: 0.8,
  },
  
  /** Bottom border only */
  bottomBorder: {
    sectionHeadingStyle: 2 as const,
    sectionHeadingAlign: "left" as const,
    sectionHeadingBold: true,
    sectionHeadingCapitalization: "uppercase" as const,
    sectionHeadingSize: "M" as const,
    sectionHeadingIcons: "none" as const,
  },
  
  /** Background fill */
  filled: {
    sectionHeadingStyle: 4 as const,
    sectionHeadingAlign: "left" as const,
    sectionHeadingBold: true,
    sectionHeadingCapitalization: "uppercase" as const,
    sectionHeadingSize: "M" as const,
    sectionHeadingIcons: "none" as const,
  },
  
  /** Left accent bar */
  accent: {
    sectionHeadingStyle: 5 as const,
    sectionHeadingAlign: "left" as const,
    sectionHeadingBold: true,
    sectionHeadingCapitalization: "uppercase" as const,
    sectionHeadingSize: "M" as const,
    sectionHeadingIcons: "outline" as const,
  },
  
  /** Top and bottom lines */
  framed: {
    sectionHeadingStyle: 6 as const,
    sectionHeadingAlign: "center" as const,
    sectionHeadingBold: true,
    sectionHeadingCapitalization: "capitalize" as const,
    sectionHeadingSize: "M" as const,
    sectionHeadingIcons: "none" as const,
  },
  
  /** No decoration */
  plain: {
    sectionHeadingStyle: 1 as const,
    sectionHeadingAlign: "left" as const,
    sectionHeadingBold: true,
    sectionHeadingCapitalization: "uppercase" as const,
    sectionHeadingSize: "S" as const,
    sectionHeadingIcons: "none" as const,
  },
} as const;

// ============================================================================
// LAYOUT PRESETS
// ============================================================================

export const LAYOUT_PRESETS = {
  /** Single column layout */
  singleColumn: {
    columnCount: 1 as const,
    headerPosition: "top" as const,
    leftColumnWidth: 30,
    personalDetailsAlign: "left" as const,
    personalDetailsArrangement: 1 as const,
  },
  
  /** Single column centered header */
  singleColumnCentered: {
    columnCount: 1 as const,
    headerPosition: "top" as const,
    leftColumnWidth: 30,
    personalDetailsAlign: "center" as const,
    personalDetailsArrangement: 1 as const,
  },
  
  /** Two columns with sidebar on left */
  twoColumnLeft: {
    columnCount: 2 as const,
    headerPosition: "top" as const,
    leftColumnWidth: 30,
    personalDetailsAlign: "left" as const,
    personalDetailsArrangement: 1 as const,
  },
  
  /** Two columns with wider main content */
  twoColumnWide: {
    columnCount: 2 as const,
    headerPosition: "top" as const,
    leftColumnWidth: 35,
    personalDetailsAlign: "center" as const,
    personalDetailsArrangement: 1 as const,
  },
  
  /** Three columns */
  threeColumn: {
    columnCount: 3 as const,
    headerPosition: "top" as const,
    leftColumnWidth: 25,
    personalDetailsAlign: "left" as const,
    personalDetailsArrangement: 1 as const,
  },
} as const;

// ============================================================================
// ENTRY STYLE PRESETS
// ============================================================================

export const ENTRY_PRESETS = {
  /** Traditional entry style with clear hierarchy */
  traditional: {
    entryLayoutStyle: 1 as const,
    entryColumnWidth: "auto" as const,
    entryTitleSize: "M" as const,
    entrySubtitleStyle: "italic" as const,
    entrySubtitlePlacement: "nextLine" as const,
    entryIndentBody: false,
    entryListStyle: "bullet" as const,
  },
  
  /** Compact entry style */
  compact: {
    entryLayoutStyle: 1 as const,
    entryColumnWidth: "auto" as const,
    entryTitleSize: "M" as const,
    entrySubtitleStyle: "normal" as const,
    entrySubtitlePlacement: "sameLine" as const,
    entryIndentBody: false,
    entryListStyle: "bullet" as const,
  },
  
  /** Modern entry with bold subtitles */
  modern: {
    entryLayoutStyle: 2 as const,
    entryColumnWidth: "auto" as const,
    entryTitleSize: "M" as const,
    entrySubtitleStyle: "bold" as const,
    entrySubtitlePlacement: "sameLine" as const,
    entryIndentBody: false,
    entryListStyle: "bullet" as const,
  },
} as const;

// ============================================================================
// CONTACT STYLE PRESETS
// ============================================================================

export const CONTACT_PRESETS = {
  /** Icons with pipe separator */
  iconPipe: {
    personalDetailsContactStyle: "icon" as const,
    personalDetailsIconStyle: 1 as const,
    contactSeparator: "pipe" as const,
  },
  
  /** Icons with dash separator */
  iconDash: {
    personalDetailsContactStyle: "icon" as const,
    personalDetailsIconStyle: 2 as const,
    contactSeparator: "dash" as const,
  },
  
  /** Bullet points */
  bullet: {
    personalDetailsContactStyle: "bullet" as const,
    personalDetailsIconStyle: 1 as const,
    contactSeparator: "pipe" as const,
  },
  
  /** Plain text with bar */
  bar: {
    personalDetailsContactStyle: "bar" as const,
    personalDetailsIconStyle: 1 as const,
    contactSeparator: "pipe" as const,
  },
} as const;

// ============================================================================
// SECTION-SPECIFIC DEFAULTS
// ============================================================================

/** Default settings for all section fields (bold/italic) */
export const DEFAULT_SECTION_STYLES: Partial<LayoutSettings> = {
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
};

// ============================================================================
// THEME COMPOSER
// ============================================================================

export interface ThemeConfig {
  /** Base typography preset */
  typography?: keyof typeof TYPOGRAPHY_PRESETS;
  /** Section heading preset */
  headings?: keyof typeof HEADING_PRESETS;
  /** Layout preset */
  layout?: keyof typeof LAYOUT_PRESETS;
  /** Entry style preset */
  entries?: keyof typeof ENTRY_PRESETS;
  /** Contact display preset */
  contact?: keyof typeof CONTACT_PRESETS;
  /** Custom overrides */
  overrides?: Partial<LayoutSettings>;
}

/**
 * Compose a complete theme from presets
 * @param config Theme configuration with preset selections and overrides
 * @returns Complete LayoutSettings object
 */
export function composeTheme(config: ThemeConfig): Partial<LayoutSettings> {
  const parts: Partial<LayoutSettings>[] = [
    BASE_THEME,
    DEFAULT_SECTION_STYLES,
  ];
  
  // Add selected presets
  if (config.typography) {
    parts.push(TYPOGRAPHY_PRESETS[config.typography]);
  }
  if (config.headings) {
    parts.push(HEADING_PRESETS[config.headings]);
  }
  if (config.layout) {
    parts.push(LAYOUT_PRESETS[config.layout]);
  }
  if (config.entries) {
    parts.push(ENTRY_PRESETS[config.entries]);
  }
  if (config.contact) {
    parts.push(CONTACT_PRESETS[config.contact]);
  }
  
  // Add custom overrides last
  if (config.overrides) {
    parts.push(config.overrides);
  }
  
  return deepMerge<LayoutSettings>(...parts);
}

// ============================================================================
// TEMPLATE THEMES - Simplified definitions using presets
// ============================================================================

export const TEMPLATE_THEMES: Record<string, ThemeConfig> = {
  ats: {
    typography: "ats",
    headings: "bottomBorder",
    layout: "singleColumn",
    entries: "compact",
    contact: "iconPipe",
    overrides: {
      headerBottomMargin: 15,
      personalDetailsArrangement: 2,
      sectionOrder: [
        "summary", "work", "skills", "education", "projects",
        "certificates", "languages", "publications", "awards",
        "interests", "references", "custom",
      ],
    },
  },
  
  classic: {
    typography: "classic",
    headings: "underline",
    layout: "singleColumnCentered",
    entries: "traditional",
    contact: "iconPipe",
    overrides: {
      fontSize: 8.5,
      lineHeight: 1.1,
      headerBottomMargin: 2,
      experienceCompanyListStyle: "bullet",
      educationInstitutionListStyle: "bullet",
      titleItalic: true,
      experiencePositionItalic: true,
      entrySubtitleStyle: "italic",
    },
  },
  
  modern: {
    typography: "modern",
    headings: "framed",
    layout: "singleColumn",
    entries: "compact",
    contact: "iconDash",
    overrides: {
      nameFontSize: 36,
      sectionHeadingAlign: "left",
      entryListStyle: "hyphen",
      sectionOrder: [
        "summary", "work", "projects", "skills", "education",
        "certificates", "languages", "awards", "publications",
        "interests", "references", "custom",
      ],
    },
  },
  
  creative: {
    typography: "creative",
    headings: "accent",
    layout: "twoColumnWide",
    entries: "modern",
    contact: "iconDash",
    overrides: {
      leftColumnWidth: 33, // Optimized width
      headerBottomMargin: 20,
      nameFontSize: 24, // Reduced fro 30
      showProfileImage: true,
      profileImageBorder: true,
      skillsListStyle: "blank",
      languagesFluencyBold: true,
      interestsKeywordsItalic: true,
      experienceDateBold: true,
      educationAreaItalic: true,
      educationGpaBold: true,
      projectsDateBold: true,
      projectsTechnologiesBold: true,
      certificatesDisplayStyle: "grid",
      certificatesLevelStyle: 3,
      certificatesIssuerItalic: true,
      publicationsNameItalic: true,
      awardsAwarderItalic: true,
      referencesPositionItalic: true,
      sectionOrder: [
        "summary", "skills", "projects", "work", "education",
        "certificates", "languages", "interests", "awards",
        "publications", "references", "custom",
      ],
    },
  },
  
  professional: {
    typography: "professional",
    headings: "bottomBorder",
    layout: "twoColumnLeft",
    entries: "compact",
    contact: "iconPipe",
    overrides: {
      headerBottomMargin: 15,
      sectionOrder: [
        "summary", "work", "education", "skills", "certificates",
        "projects", "languages", "awards", "publications",
        "interests", "references", "custom",
      ],
    },
  },
  
  elegant: {
    typography: "modern",
    headings: "plain",
    layout: "singleColumn",
    entries: "compact",
    contact: "bar",
    overrides: {
      fontFamily: "Open Sans",
      headerBottomMargin: 24,
      sectionHeadingCapitalization: "uppercase",
    },
  },
  
  "classic-slate": {
    typography: "minimal",
    headings: "framed",
    layout: "twoColumnWide",
    entries: "compact",
    contact: "bullet",
    overrides: {
      leftColumnWidth: 65,
      headerBottomMargin: 10,
      sectionOrder: [
        "summary", "work", "skills", "education", "projects",
        "certificates", "publications", "awards", "languages",
        "interests", "references", "custom",
      ],
    },
  },
  
  multicolumn: {
    typography: "professional",
    headings: "filled",
    layout: "threeColumn",
    entries: "modern",
    contact: "iconDash",
    overrides: {
      showProfileImage: true,
      experienceDateItalic: true,
      educationDateItalic: true,
      projectsDateItalic: true,
      projectsTechnologiesItalic: true,
      certificatesIssuerItalic: true,
      publicationsPublisherItalic: true,
      awardsAwarderItalic: true,
      referencesPositionItalic: true,
      sectionOrder: [
        "skills", "languages", "interests",
        "summary", "work", "projects",
        "education", "certificates", "awards",
        "publications", "references", "custom",
      ],
    },
  },
  
  glow: {
    typography: "modern",
    headings: "accent",
    layout: "twoColumnLeft",
    entries: "modern",
    contact: "iconDash",
    overrides: {
      showProfileImage: true,
      profileImageBorder: true,
    },
  },
  
  stylish: {
    typography: "creative",
    headings: "underline",
    layout: "twoColumnWide",
    entries: "modern",
    contact: "iconDash",
    overrides: {
      showProfileImage: true,
      profileImageBorder: true,
    },
  },
  
  timeline: {
    typography: "professional",
    headings: "plain",
    layout: "singleColumn",
    entries: "traditional",
    contact: "iconPipe",
    overrides: {
      sectionHeadingStyle: 7,
    },
  },
  
  polished: {
    typography: "modern",
    headings: "bottomBorder",
    layout: "twoColumnLeft",
    entries: "compact",
    contact: "iconPipe",
    overrides: {
      showProfileImage: true,
    },
  },
  
  developer: {
    typography: "professional",
    headings: "filled",
    layout: "singleColumn",
    entries: "compact",
    contact: "iconDash",
    overrides: {
      skillsDisplayStyle: "level",
      projectsTechnologiesBold: true,
    },
  },
  
  developer2: {
    typography: "professional",
    headings: "accent",
    layout: "twoColumnLeft",
    entries: "modern",
    contact: "iconDash",
    overrides: {
      showProfileImage: true,
      skillsDisplayStyle: "level",
      projectsTechnologiesBold: true,
    },
  },
};

// ============================================================================
// COMPILED THEMES (for backwards compatibility)
// ============================================================================

/**
 * Get compiled template defaults
 * This maintains backwards compatibility with the existing getTemplateDefaults function
 */
export function getCompiledTheme(templateId: string): Partial<LayoutSettings> {
  const themeConfig = TEMPLATE_THEMES[templateId];
  if (!themeConfig) {
    // Fallback to ATS if template not found
    return composeTheme(TEMPLATE_THEMES.ats);
  }
  return composeTheme(themeConfig);
}

/**
 * Pre-compiled themes for all templates
 * Use this for performance if themes are accessed frequently
 */
export const COMPILED_THEMES: Record<string, Partial<LayoutSettings>> = 
  Object.fromEntries(
    Object.keys(TEMPLATE_THEMES).map(id => [id, getCompiledTheme(id)])
  );
