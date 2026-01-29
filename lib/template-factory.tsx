/**
 * Template Factory - Simplified template creation
 *
 * This module provides a factory system for creating resume templates with minimal code.
 * Instead of 500+ lines per template, new templates can be created in ~50 lines by:
 * 1. Selecting a layout type (single column, two-column, sidebar, etc.)
 * 2. Applying a theme configuration
 * 3. Adding any custom overrides
 *
 * The factory handles all common rendering logic, section ordering, and styling.
 */

import React from "react";
import {
  Document,
  Page,
  View,
  StyleSheet,
  Text,
  pdf,
} from "@react-pdf/renderer";
import type { Resume, LayoutSettings } from "@/db";
import { mmToPt } from "@/lib/template-utils";
import "@/lib/fonts";

// Core components
import {
  createFontConfig,
  createGetColorFn,
  ProfileImage,
  SectionHeading,
} from "@/components/templates/core";
import type {
  FontConfig,
  GetColorFn,
  ContactItem,
} from "@/components/templates/core";
import { ContactInfo } from "@/components/templates/core/primitives/ContactInfo";

// Universal sections
import { SummarySection } from "@/components/templates/core/sections/SummarySection";
import { WorkSection } from "@/components/templates/core/sections/WorkSection";
import { EducationSection } from "@/components/templates/core/sections/EducationSection";
import { SkillsSection } from "@/components/templates/core/sections/SkillsSection";
import { ProjectsSection } from "@/components/templates/core/sections/ProjectsSection";
import { CertificatesSection } from "@/components/templates/core/sections/CertificatesSection";
import { LanguagesSection } from "@/components/templates/core/sections/LanguagesSection";
import { InterestsSection } from "@/components/templates/core/sections/InterestsSection";
import { AwardsSection } from "@/components/templates/core/sections/AwardsSection";
import { PublicationsSection } from "@/components/templates/core/sections/PublicationsSection";
import { ReferencesSection } from "@/components/templates/core/sections/ReferencesSection";
import { CustomSection } from "@/components/templates/core/sections/CustomSection";

import { getCompiledTheme, deepMerge } from "./theme-system";

// ============================================================================
// TYPES
// ============================================================================

export type LayoutType =
  | "single-column"
  | "single-column-centered"
  | "two-column-sidebar-left"
  | "two-column-sidebar-right"
  | "two-column-equal"
  | "creative-sidebar";

export interface TemplateConfig {
  /** Unique template identifier */
  id: string;
  /** Display name for the template */
  name: string;
  /** Layout type determines the overall structure */
  layoutType: LayoutType;
  /** Base theme to inherit from (optional, uses template id if not specified) */
  baseTheme?: string;
  /** Theme overrides */
  themeOverrides?: Partial<LayoutSettings>;
  /** Default theme color */
  defaultThemeColor?: string;
  /** Sections to render in left/sidebar column (for two-column layouts) */
  leftColumnSections?: string[];
  /** Sections to render in right/main column (for two-column layouts) */
  rightColumnSections?: string[];
  /** Custom header component */
  headerComponent?: React.ComponentType<HeaderProps>;
  /** Custom styles to merge with generated styles */
  customStyles?: Record<string, object>;
  /** Whether to show sidebar background (for creative-sidebar layout) */
  sidebarBackground?: boolean;
  /** Sidebar background color */
  sidebarBackgroundColor?: string;
}

export interface HeaderProps {
  basics: Resume["basics"];
  settings: LayoutSettings;
  fonts: FontConfig;
  getColor: GetColorFn;
  fontSize: number;
  align: "left" | "center" | "right";
}

export interface TemplateProps {
  resume: Resume;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Convert basics to contact items for ContactInfo component
 */
function basicsToContactItems(basics: Resume["basics"]): ContactItem[] {
  const items: ContactItem[] = [];

  if (basics.email) {
    items.push({
      type: "email",
      value: basics.email,
      url: `mailto:${basics.email}`,
    });
  }
  if (basics.phone) {
    items.push({
      type: "phone",
      value: basics.phone,
      url: `tel:${basics.phone}`,
    });
  }
  if (basics.location?.city) {
    const loc = [basics.location.city, basics.location.country]
      .filter(Boolean)
      .join(", ");
    items.push({ type: "location", value: loc });
  }
  if (basics.url) {
    items.push({
      type: "url",
      value: basics.url.replace(/^https?:\/\//, ""),
      url: basics.url,
    });
  }

  basics.profiles?.forEach((profile) => {
    if (profile.url) {
      items.push({
        type: "profile",
        value: profile.username || profile.network || profile.url,
        url: profile.url,
        label: profile.username
          ? `${profile.network}: ${profile.username}`
          : profile.network,
      });
    }
  });

  return items;
}

/**
 * Default header component
 */
const DefaultHeader: React.FC<HeaderProps & { showImage?: boolean }> = ({
  basics,
  settings,
  fonts,
  getColor,
  fontSize,
  align,
  showImage = true,
}) => {
  const nameStyle = {
    fontSize: settings.nameFontSize || 28,
    fontWeight: settings.nameBold ? ("bold" as const) : ("normal" as const),
    fontFamily:
      settings.nameFont === "creative"
        ? "Helvetica"
        : settings.nameBold
          ? fonts.bold
          : fonts.base,
    textTransform: "uppercase" as const,
    color: getColor("name"),
    lineHeight: settings.nameLineHeight || 1.2,
    letterSpacing:
      ((settings as unknown as Record<string, unknown>)
        .nameLetterSpacing as number) || 0,
    marginBottom: 4,
    textAlign: align,
  };

  const titleStyle = {
    fontSize: settings.titleFontSize || 14,
    fontWeight: settings.titleBold ? ("bold" as const) : ("normal" as const),
    fontStyle: settings.titleItalic ? ("italic" as const) : ("normal" as const),
    fontFamily: settings.titleBold
      ? fonts.bold
      : settings.titleItalic
        ? fonts.italic
        : fonts.base,
    lineHeight: settings.titleLineHeight || 1.2,
    marginBottom: 8,
    textAlign: align,
    color: getColor("title"),
  };

  return (
    <View
      style={{
        alignItems:
          align === "center"
            ? "center"
            : align === "right"
              ? "flex-end"
              : "flex-start",
      }}
    >
      {showImage && basics.image && settings.showProfileImage && (
        <ProfileImage
          src={typeof basics.image === "string" ? basics.image : ""}
          size={settings.profileImageSize}
          shape={settings.profileImageShape}
          border={settings.profileImageBorder}
          borderColor={getColor("decorations")}
          style={{ marginBottom: 10 }}
        />
      )}
      {basics.name && <Text style={nameStyle}>{basics.name}</Text>}
      {basics.label && <Text style={titleStyle}>{basics.label}</Text>}
      <ContactInfo
        items={basicsToContactItems(basics)}
        style={settings.personalDetailsArrangement === 2 ? "stacked" : "bar"}
        align={align}
        fontSize={settings.contactFontSize || fontSize}
        fonts={fonts}
        getColor={getColor}
        bold={settings.contactBold}
        italic={settings.contactItalic}
        separator={settings.contactSeparator}
        linkUnderline={
          ((settings as unknown as Record<string, unknown>)
            .contactLinkUnderline as boolean) ?? true
        }
        lineHeight={settings.lineHeight}
      />
    </View>
  );
};

// ============================================================================
// SECTION RENDERER
// ============================================================================

interface SectionRendererProps {
  sectionId: string;
  resume: Resume;
  settings: LayoutSettings;
  fonts: FontConfig;
  fontSize: number;
  getColor: GetColorFn;
  sectionMargin: number;
}

const SectionRenderer: React.FC<SectionRendererProps> = ({
  sectionId,
  resume,
  settings,
  fonts,
  fontSize,
  getColor,
  sectionMargin,
}) => {
  const {
    basics,
    work,
    education,
    skills,
    projects,
    certificates,
    languages,
    interests,
    awards,
    publications,
    references,
    custom,
  } = resume;

  const commonProps = {
    settings,
    fonts,
    fontSize,
    getColor,
    SectionHeading,
  };

  const sectionStyle = { marginBottom: sectionMargin };

  switch (sectionId) {
    case "summary":
      return basics.summary ? (
        <View style={sectionStyle}>
          <SummarySection summary={basics.summary} {...commonProps} />
        </View>
      ) : null;
    case "work":
      return work && work.length > 0 ? (
        <View style={sectionStyle}>
          <WorkSection work={work} {...commonProps} />
        </View>
      ) : null;
    case "education":
      return education && education.length > 0 ? (
        <View style={sectionStyle}>
          <EducationSection education={education} {...commonProps} />
        </View>
      ) : null;
    case "skills":
      return skills && skills.length > 0 ? (
        <View style={sectionStyle}>
          <SkillsSection skills={skills} {...commonProps} />
        </View>
      ) : null;
    case "projects":
      return projects && projects.length > 0 ? (
        <View style={sectionStyle}>
          <ProjectsSection projects={projects} {...commonProps} />
        </View>
      ) : null;
    case "certificates":
      return certificates && certificates.length > 0 ? (
        <View style={sectionStyle}>
          <CertificatesSection certificates={certificates} {...commonProps} />
        </View>
      ) : null;
    case "languages":
      return languages && languages.length > 0 ? (
        <View style={sectionStyle}>
          <LanguagesSection languages={languages} {...commonProps} />
        </View>
      ) : null;
    case "interests":
      return interests && interests.length > 0 ? (
        <View style={sectionStyle}>
          <InterestsSection interests={interests} {...commonProps} />
        </View>
      ) : null;
    case "awards":
      return awards && awards.length > 0 ? (
        <View style={sectionStyle}>
          <AwardsSection awards={awards} {...commonProps} />
        </View>
      ) : null;
    case "publications":
      return publications && publications.length > 0 ? (
        <View style={sectionStyle}>
          <PublicationsSection publications={publications} {...commonProps} />
        </View>
      ) : null;
    case "references":
      return references && references.length > 0 ? (
        <View style={sectionStyle}>
          <ReferencesSection references={references} {...commonProps} />
        </View>
      ) : null;
    case "custom":
      return custom && custom.length > 0 ? (
        <View style={sectionStyle}>
          <CustomSection custom={custom} {...commonProps} />
        </View>
      ) : null;
    default:
      return null;
  }
};

// ============================================================================
// TEMPLATE FACTORY
// ============================================================================

/**
 * Create a template component from a configuration
 */
export function createTemplate(config: TemplateConfig) {
  // Pre-compute theme
  const baseTheme = getCompiledTheme(config.baseTheme || config.id);
  const theme = config.themeOverrides
    ? deepMerge<LayoutSettings>(baseTheme, config.themeOverrides)
    : baseTheme;

  // Default column assignments based on layout type
  const defaultLeftSections = [
    "skills",
    "education",
    "languages",
    "certificates",
    "interests",
    "awards",
    "references",
  ];
  const defaultRightSections = [
    "summary",
    "work",
    "projects",
    "publications",
    "custom",
  ];

  const leftColumnSections = config.leftColumnSections || defaultLeftSections;
  const rightColumnSections =
    config.rightColumnSections || defaultRightSections;

  // Template component
  const Template: React.FC<TemplateProps> = ({ resume }) => {
    const { basics } = resume;

    // Merge theme with resume settings
    const settings = deepMerge<LayoutSettings>(
      theme as LayoutSettings,
      resume.meta.layoutSettings || {},
    );
    const themeColor =
      resume.meta.themeColor || config.defaultThemeColor || "#2563eb";

    // Create shared configs
    const fonts: FontConfig = createFontConfig(settings.fontFamily || "Roboto");
    const getColor: GetColorFn = createGetColorFn(
      themeColor,
      settings.themeColorTarget || [],
    );
    const fontSize = settings.fontSize || 9;

    // Layout measurements
    const marginH = mmToPt(settings.marginHorizontal || 12);
    const marginV = mmToPt(settings.marginVertical || 12);
    const sectionMargin = settings.sectionMargin || 8;

    // Header alignment - matches Classic template logic
    const headerAlign: "left" | "center" | "right" =
      // For Classic template, use headerPosition setting
      config.id === "classic"
        ? settings.headerPosition === "left" ||
          settings.headerPosition === "right"
          ? settings.headerPosition
          : "center"
        : // For other templates, use existing logic
          config.layoutType === "single-column-centered"
          ? "center"
          : settings.personalDetailsAlign === "center"
            ? "center"
            : settings.personalDetailsAlign === "right"
              ? "right"
              : "left";

    // Column widths
    const leftWidth = settings.leftColumnWidth || 30;
    const rightWidth = 100 - leftWidth - 4; // 4% gap

    // Section order
    const order =
      settings.sectionOrder && settings.sectionOrder.length > 0
        ? settings.sectionOrder
        : [...rightColumnSections, ...leftColumnSections];

    // Filter sections by column
    const leftContent = order.filter((id) => leftColumnSections.includes(id));
    const rightContent = order.filter((id) => rightColumnSections.includes(id));

    // Orphan sections go to right/main column
    const knownSections = [...leftColumnSections, ...rightColumnSections];
    const orphans = order.filter((id) => !knownSections.includes(id));
    rightContent.push(...orphans);

    // Create styles
    const styles = StyleSheet.create({
      page: {
        paddingHorizontal: marginH,
        paddingVertical: marginV,
        fontFamily: fonts.base,
        fontSize,
        lineHeight: settings.lineHeight || 1.3,
        color: "#000",
        flexDirection:
          config.layoutType === "creative-sidebar" ? "row" : "column",
        ...(config.layoutType === "creative-sidebar"
          ? { paddingTop: 30, paddingBottom: 30 }
          : {}),
      },
      header: {
        marginBottom: settings.headerBottomMargin || 12,
        borderBottomWidth:
          settings.sectionHeadingStyle === 1
            ? config.id === "classic"
              ? 2
              : 1
            : 0, // Classic uses thicker border
        borderBottomColor: getColor("decorations"),
        borderBottomStyle: "solid",
        paddingBottom: settings.sectionHeadingStyle === 1 ? 8 : 0,
      },
      columnsContainer: {
        flexDirection: "row",
        gap: 12,
      },
      leftColumn: {
        width: `${leftWidth}%`,
      },
      rightColumn: {
        width: `${rightWidth}%`,
      },
      // Creative sidebar styles
      sidebarBackground: {
        position: "absolute",
        top: -30,
        left: 0,
        bottom: -30,
        width: "32%",
        backgroundColor: config.sidebarBackgroundColor || "#f4f4f0",
      },
      sidebar: {
        width: "32%",
        paddingHorizontal: 20,
        color: "#333",
      },
      main: {
        width: "68%",
        paddingHorizontal: 30,
        backgroundColor: "#fff",
        paddingLeft: 25,
      },
      ...config.customStyles,
    });

    // Header component
    const HeaderComponent = config.headerComponent || DefaultHeader;

    // Section renderer helper
    const renderSection = (sectionId: string) => (
      <SectionRenderer
        key={sectionId}
        sectionId={sectionId}
        resume={resume}
        settings={settings}
        fonts={fonts}
        fontSize={fontSize}
        getColor={getColor}
        sectionMargin={sectionMargin}
      />
    );

    // Render based on layout type and settings
    const effectiveColumnCount = settings.columnCount || 1;
    const isDynamicLayout =
      config.layoutType === "single-column-centered" &&
      effectiveColumnCount > 1;

    switch (config.layoutType) {
      case "single-column":
      case "single-column-centered":
        return (
          <Document>
            <Page size="A4" style={styles.page}>
              <View style={styles.header}>
                <HeaderComponent
                  basics={basics}
                  settings={settings}
                  fonts={fonts}
                  getColor={getColor}
                  fontSize={fontSize}
                  align={headerAlign}
                />
              </View>

              {/* Support dynamic column layout for templates like Classic */}
              {effectiveColumnCount === 1 ? (
                <View>{order.map(renderSection)}</View>
              ) : (
                <View style={styles.columnsContainer}>
                  <View style={styles.leftColumn}>
                    {leftContent.map(renderSection)}
                  </View>
                  <View style={styles.rightColumn}>
                    {rightContent.map(renderSection)}
                  </View>
                </View>
              )}
            </Page>
          </Document>
        );

      case "two-column-sidebar-left":
      case "two-column-sidebar-right":
      case "two-column-equal":
        const isLeftSidebar = config.layoutType === "two-column-sidebar-left";
        return (
          <Document>
            <Page size="A4" style={styles.page}>
              <View style={styles.header}>
                <HeaderComponent
                  basics={basics}
                  settings={settings}
                  fonts={fonts}
                  getColor={getColor}
                  fontSize={fontSize}
                  align={headerAlign}
                />
              </View>

              {settings.columnCount === 1 ? (
                <View>{order.map(renderSection)}</View>
              ) : (
                <View style={styles.columnsContainer}>
                  <View
                    style={
                      isLeftSidebar ? styles.leftColumn : styles.rightColumn
                    }
                  >
                    {(isLeftSidebar ? leftContent : rightContent).map(
                      renderSection,
                    )}
                  </View>
                  <View
                    style={
                      isLeftSidebar ? styles.rightColumn : styles.leftColumn
                    }
                  >
                    {(isLeftSidebar ? rightContent : leftContent).map(
                      renderSection,
                    )}
                  </View>
                </View>
              )}
            </Page>
          </Document>
        );

      case "creative-sidebar":
        return (
          <Document>
            <Page size="A4" style={styles.page}>
              {config.sidebarBackground && (
                <View fixed style={styles.sidebarBackground} />
              )}

              <View style={styles.sidebar}>
                <View
                  style={{ marginBottom: sectionMargin, alignItems: "center" }}
                >
                  <HeaderComponent
                    basics={basics}
                    settings={settings}
                    fonts={fonts}
                    getColor={getColor}
                    fontSize={fontSize}
                    align="center"
                  />
                </View>
                {leftContent.map(renderSection)}
              </View>

              <View style={styles.main}>{rightContent.map(renderSection)}</View>
            </Page>
          </Document>
        );

      default:
        return (
          <Document>
            <Page size="A4" style={styles.page}>
              <View style={styles.header}>
                <HeaderComponent
                  basics={basics}
                  settings={settings}
                  fonts={fonts}
                  getColor={getColor}
                  fontSize={fontSize}
                  align={headerAlign}
                />
              </View>
              <View>{order.map(renderSection)}</View>
            </Page>
          </Document>
        );
    }
  };

  // Set display name for debugging
  Template.displayName = `${config.name}Template`;

  // PDF generation function
  const generatePDF = async (resume: Resume): Promise<Blob> => {
    const doc = <Template resume={resume} />;
    const blob = await pdf(doc).toBlob();
    return blob;
  };

  return {
    Template,
    generatePDF,
    config,
  };
}

// ============================================================================
// PRE-BUILT TEMPLATE CONFIGS
// ============================================================================

export const TEMPLATE_CONFIGS: Record<string, TemplateConfig> = {
  ats: {
    id: "ats",
    name: "ATS",
    layoutType: "single-column",
    defaultThemeColor: "#2563eb",
  },

  classic: {
    id: "classic",
    name: "Classic",
    layoutType: "single-column-centered",
    defaultThemeColor: "#000000",
    leftColumnSections: [
      "skills",
      "education",
      "languages",
      "interests",
      "awards",
      "certificates",
      "references",
    ],
    rightColumnSections: [
      "summary",
      "work",
      "projects",
      "custom",
      "publications",
    ],
    themeOverrides: {
      fontFamily: "Times-Roman",
      headerBottomMargin: 2,
      sectionMargin: 5,
      bulletMargin: 1,
      entryIndentBody: false,
      entryTitleSize: "M",
      entrySubtitleStyle: "italic",
      contactSeparator: "pipe",
      contactLinkUnderline: false,
    },
  },

  modern: {
    id: "modern",
    name: "Modern",
    layoutType: "single-column",
    defaultThemeColor: "#10b981",
  },

  creative: {
    id: "creative",
    name: "Creative",
    layoutType: "creative-sidebar",
    defaultThemeColor: "#8b5cf6",
    sidebarBackground: true,
    sidebarBackgroundColor: "#f4f4f0",
    leftColumnSections: ["summary", "certificates", "languages", "interests"],
    rightColumnSections: [
      "work",
      "education",
      "skills",
      "projects",
      "awards",
      "publications",
      "references",
      "custom",
    ],
  },

  professional: {
    id: "professional",
    name: "Professional",
    layoutType: "two-column-sidebar-left",
    defaultThemeColor: "#0f172a",
    leftColumnSections: [
      "skills",
      "education",
      "languages",
      "certificates",
      "awards",
      "interests",
    ],
    rightColumnSections: [
      "summary",
      "work",
      "projects",
      "publications",
      "references",
      "custom",
    ],
  },

  elegant: {
    id: "elegant",
    name: "Elegant",
    layoutType: "single-column",
    defaultThemeColor: "#2c3e50",
  },

  "classic-slate": {
    id: "classic-slate",
    name: "Classic Slate",
    layoutType: "two-column-equal",
    defaultThemeColor: "#334155",
  },

  multicolumn: {
    id: "multicolumn",
    name: "Multicolumn",
    layoutType: "two-column-sidebar-left",
    defaultThemeColor: "#0284c7",
    leftColumnSections: ["skills", "languages", "interests"],
    rightColumnSections: [
      "summary",
      "work",
      "projects",
      "education",
      "certificates",
      "awards",
      "publications",
      "references",
      "custom",
    ],
  },

  glow: {
    id: "glow",
    name: "Glow",
    layoutType: "two-column-sidebar-left",
    defaultThemeColor: "#f59e0b",
  },

  stylish: {
    id: "stylish",
    name: "Stylish",
    layoutType: "two-column-sidebar-left",
    defaultThemeColor: "#ec4899",
  },

  timeline: {
    id: "timeline",
    name: "Timeline",
    layoutType: "single-column",
    defaultThemeColor: "#6366f1",
  },

  polished: {
    id: "polished",
    name: "Polished",
    layoutType: "two-column-sidebar-left",
    defaultThemeColor: "#0d9488",
  },

  developer: {
    id: "developer",
    name: "Developer",
    layoutType: "single-column",
    defaultThemeColor: "#22c55e",
  },

  developer2: {
    id: "developer2",
    name: "Developer 2",
    layoutType: "two-column-sidebar-left",
    defaultThemeColor: "#3b82f6",
  },
};

// ============================================================================
// FACTORY EXPORTS
// ============================================================================

/**
 * Get a template by ID
 */
export function getTemplate(templateId: string) {
  const config = TEMPLATE_CONFIGS[templateId];
  if (!config) {
    // Fallback to ATS
    return createTemplate(TEMPLATE_CONFIGS.ats);
  }
  return createTemplate(config);
}

/**
 * Create all templates (for registration)
 */
export function createAllTemplates() {
  return Object.fromEntries(
    Object.entries(TEMPLATE_CONFIGS).map(([id, config]) => [
      id,
      createTemplate(config),
    ]),
  );
}
