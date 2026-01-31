/* eslint-disable @typescript-eslint/no-explicit-any */
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
  | "three-column"
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
  /** Sections to render in middle column (for three-column layouts) */
  middleColumnSections?: string[];
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
  /** Whether the header should span the full width of the page (ignoring page margins) */
  fullWidthHeader?: boolean;
  /** Background color for the full-width header */
  headerBackgroundColor?: string;
  /** Text color associated with the full-width header context */
  headerTextColor?: string;
  /** Right column background color (for creative-sidebar layout) */
  rightColumnBackgroundColor?: string;
  /** Right column text color (for creative-sidebar layout) */
  rightColumnTextColor?: string;
  /** Sidebar (Left column) text color */
  sidebarTextColor?: string;
  /** Background color for the entire page */
  pageBackgroundColor?: string;
  /** Background color for section cards (when sectionDisplayStyle is 'card') */
  cardBackgroundColor?: string;
  /** Border color for section cards */
  cardBorderColor?: string;
  /** Right padding for the sidebar (default 30) */
  sidebarPaddingRight?: number;
  /** Left padding for the sidebar (default 0) */
  sidebarPaddingLeft?: number;
}

export interface HeaderProps {
  basics: Resume["basics"];
  settings: LayoutSettings;
  fonts: FontConfig;
  getColor: GetColorFn;
  fontSize: number;
  align: "left" | "center" | "right";
  headerTextColor?: string;
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
  headerTextColor,
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
    color: getColor("name", headerTextColor),
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
    color: getColor("title", headerTextColor),
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
          borderColor={
            headerTextColor ? headerTextColor : getColor("decorations")
          }
          style={{ marginBottom: 10 }}
        />
      )}
      {basics.name && (
        <Text style={nameStyle} hyphenationCallback={(word) => [word]}>
          {basics.name}
        </Text>
      )}
      {basics.label && (
        <Text style={titleStyle} hyphenationCallback={(word) => [word]}>
          {basics.label}
        </Text>
      )}
      <ContactInfo
        items={basicsToContactItems(basics)}
        style={
          settings.personalDetailsArrangement === 2
            ? "stacked"
            : (settings.personalDetailsContactStyle as any) || "bar"
        }
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
        color={headerTextColor}
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
  containerStyle?: any; // Allow style override
}

const SectionRenderer: React.FC<SectionRendererProps> = ({
  sectionId,
  resume,
  settings,
  fonts,
  fontSize,
  getColor,
  sectionMargin,
  containerStyle,
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

  const style = containerStyle || {
    marginBottom: sectionMargin,
  };

  switch (sectionId) {
    case "summary":
      return basics.summary ? (
        <View style={style}>
          <SummarySection summary={basics.summary} {...commonProps} />
        </View>
      ) : null;
    case "work":
      return work && work.length > 0 ? (
        <View style={style}>
          <WorkSection work={work} {...commonProps} />
        </View>
      ) : null;
    case "education":
      return education && education.length > 0 ? (
        <View style={style}>
          <EducationSection education={education} {...commonProps} />
        </View>
      ) : null;
    case "skills":
      return skills && skills.length > 0 ? (
        <View style={style}>
          <SkillsSection skills={skills} {...commonProps} />
        </View>
      ) : null;
    case "projects":
      return projects && projects.length > 0 ? (
        <View style={style}>
          <ProjectsSection projects={projects} {...commonProps} />
        </View>
      ) : null;
    case "certificates":
      return certificates && certificates.length > 0 ? (
        <View style={style}>
          <CertificatesSection certificates={certificates} {...commonProps} />
        </View>
      ) : null;
    case "languages":
      return languages && languages.length > 0 ? (
        <View style={style}>
          <LanguagesSection languages={languages} {...commonProps} />
        </View>
      ) : null;
    case "interests":
      return interests && interests.length > 0 ? (
        <View style={style}>
          <InterestsSection interests={interests} {...commonProps} />
        </View>
      ) : null;
    case "awards":
      return awards && awards.length > 0 ? (
        <View style={style}>
          <AwardsSection awards={awards} {...commonProps} />
        </View>
      ) : null;
    case "publications":
      return publications && publications.length > 0 ? (
        <View style={style}>
          <PublicationsSection publications={publications} {...commonProps} />
        </View>
      ) : null;
    case "references":
      return references && references.length > 0 ? (
        <View style={style}>
          <ReferencesSection references={references} {...commonProps} />
        </View>
      ) : null;
    case "custom":
      return custom && custom.length > 0 ? (
        <View style={style}>
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

    // Header alignment - generic logic for all templates
    // If headerPosition is explicitly set to an alignment value, use it.
    // Note: 'top' in headerPosition maps to 'center' alignment in this context
    const pos = settings.headerPosition as string;
    const headerAlign: "left" | "center" | "right" =
      pos === "left" || pos === "right"
        ? (pos as "left" | "right")
        : pos === "top" || pos === "center"
          ? "center"
          : config.layoutType === "single-column-centered"
            ? "center"
            : settings.personalDetailsAlign === "center"
              ? "center"
              : settings.personalDetailsAlign === "right"
                ? "right"
                : "left";

    // Column widths
    const leftWidth = settings.leftColumnWidth || 30;
    const rightWidth =
      config.layoutType === "three-column"
        ? 100 - leftWidth - 50 // Fixed 50% middle column for now
        : 100 - leftWidth - 4; // 4% gap for 2-column

    // Section order
    const order =
      settings.sectionOrder && settings.sectionOrder.length > 0
        ? settings.sectionOrder
        : [...rightColumnSections, ...leftColumnSections];

    // Filter sections by column
    // Filter sections by column
    const leftContent = order.filter((id) => leftColumnSections.includes(id));
    const middleContent = order.filter((id) =>
      (config.middleColumnSections || []).includes(id),
    );
    const rightContent = order.filter((id) => rightColumnSections.includes(id));

    // Orphan sections go to right/main column
    const knownSections = [
      ...leftColumnSections,
      ...(config.middleColumnSections || []),
      ...rightColumnSections,
    ];
    const orphans = order.filter((id) => !knownSections.includes(id));

    if (config.layoutType === "three-column") {
      middleContent.push(...orphans);
    } else {
      rightContent.push(...orphans);
    }

    // Create styles
    const styles = StyleSheet.create({
      page: {
        paddingHorizontal: marginH, // Consistent padding for all pages
        paddingVertical: marginV,
        fontFamily: fonts.base,
        fontSize,
        lineHeight: settings.lineHeight || 1.3,
        color: "#000",
        backgroundColor: config.pageBackgroundColor || "#ffffff",
        flexDirection:
          config.layoutType === "creative-sidebar" ||
          (config.layoutType === "three-column" &&
            settings.headerPosition === "sidebar")
            ? "row"
            : "column",
        ...(config.layoutType === "creative-sidebar" ||
        (config.layoutType === "three-column" &&
          settings.headerPosition === "sidebar")
          ? { paddingTop: 30, paddingBottom: 30, paddingLeft: marginH, paddingRight: marginH }
          : {}),
      },
      // Body content wrapper - no longer needs to handle padding
      body: {
        flexGrow: 1,
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
        // Full width header support via negative margins
        ...(config.fullWidthHeader
          ? {
              backgroundColor: config.headerBackgroundColor,
              // Break out of page padding
              marginTop: -marginV,
              marginLeft: -marginH,
              marginRight: -marginH,
              // Restore internal padding
              paddingTop: marginV,
              paddingHorizontal: marginH,
              // Use headerBottomMargin for spacing below header
              paddingBottom: settings.headerBottomMargin || 12,
            }
          : {}),
      },
      columnsContainer: {
        flexDirection: "row",
        gap: 12,
      },
      leftColumn: {
        width: `${leftWidth}%`,
      },
      middleColumn: {
        width: "50%",
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
        width: `${leftWidth}%`,
        backgroundColor: config.sidebarBackgroundColor || "#f4f4f0",
      },
      rightColumnBackground: {
        position: "absolute",
        top: -30,
        right: 0,
        bottom: -30,
        width: `${100 - leftWidth}%`,
        backgroundColor: config.rightColumnBackgroundColor || "transparent",
      },
      sidebar: {
        width: `${leftWidth}%`,
        paddingLeft: config.sidebarPaddingLeft !== undefined ? config.sidebarPaddingLeft : 0,
        paddingRight:
          config.sidebarPaddingRight !== undefined
            ? config.sidebarPaddingRight
            : 12,
        color: config.sidebarTextColor || "#333",
      },
      main: {
        width: `${100 - leftWidth}%`,
        paddingHorizontal: 0,
        backgroundColor: config.rightColumnBackgroundColor
          ? "transparent"
          : "#fff",
        paddingLeft: 12,
        paddingRight: 0,
        // Add vertical padding if background is set
        ...(config.rightColumnBackgroundColor
          ? { paddingTop: 20, paddingBottom: 20 }
          : {}),
        color: config.rightColumnTextColor || "#333",
      },
      ...config.customStyles,
    });

    // Header component
    const HeaderComponent = config.headerComponent || DefaultHeader;

    // Section renderer helper
    const renderSection = (sectionId: string, colorFn?: GetColorFn) => {
      // Determine style based on preferences
      let containerStyle = { marginBottom: sectionMargin } as any;

      if (settings.sectionDisplayStyle === "card") {
        containerStyle = {
          marginBottom: sectionMargin,
          backgroundColor: config.cardBackgroundColor || "#ffffff",
          borderRadius: 6,
          padding: 10, // Reduced from 12 to save space
          borderWidth: 1,
          borderColor: config.cardBorderColor || "transparent",
        };
      }

      return (
        <SectionRenderer
          key={sectionId}
          sectionId={sectionId}
          resume={resume}
          settings={settings}
          fonts={fonts}
          fontSize={fontSize}
          getColor={colorFn || getColor}
          sectionMargin={sectionMargin}
          containerStyle={containerStyle}
        />
      );
    };

    // Render based on layout type and settings
    const effectiveColumnCount = settings.columnCount || 1;

    // Create color function for columns that respects theme targets
    const createColumnColorFn = (
      columnTextColor?: string,
    ): GetColorFn | undefined => {
      if (!columnTextColor) return undefined;
      return (target: string) => {
        // If target is configured to use theme color, return theme color
        if (settings.themeColorTarget?.includes(target)) {
          return themeColor;
        }
        // Otherwise return column text color
        return columnTextColor;
      };
    };

    const rightColorFn = createColumnColorFn(config.rightColumnTextColor);
    const sidebarColorFn = createColumnColorFn(config.sidebarTextColor);

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
                  headerTextColor={config.headerTextColor}
                />
              </View>

              {/* Support dynamic column layout for templates like Classic */}
              {effectiveColumnCount === 1 ? (
                <View>{order.map((id) => renderSection(id))}</View>
              ) : (
                <View style={styles.columnsContainer}>
                  <View style={styles.leftColumn}>
                    {leftContent.map((id) => renderSection(id))}
                  </View>
                  <View style={styles.rightColumn}>
                    {rightContent.map((id) => renderSection(id))}
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
                  headerTextColor={config.headerTextColor}
                />
              </View>

              {settings.columnCount === 1 ? (
                <View>{order.map((id) => renderSection(id))}</View>
              ) : (
                <View style={styles.columnsContainer}>
                  <View
                    style={
                      isLeftSidebar ? styles.leftColumn : styles.rightColumn
                    }
                  >
                    {(isLeftSidebar ? leftContent : rightContent).map((id) =>
                      renderSection(id),
                    )}
                  </View>
                  <View
                    style={
                      isLeftSidebar ? styles.rightColumn : styles.leftColumn
                    }
                  >
                    {(isLeftSidebar ? rightContent : leftContent).map((id) =>
                      renderSection(id),
                    )}
                  </View>
                </View>
              )}
            </Page>
          </Document>
        );

      case "three-column":
        // Calculate middle column width
        const middleWidth = settings.middleColumnWidth || 50;
        const remainingWidth = 100 - leftWidth - middleWidth;

        // Ensure right column has at least some space, otherwise adjust
        // This is a simple safeguard
        const finalRightWidth = remainingWidth > 0 ? remainingWidth : 10;
        const finalMiddleWidth =
          remainingWidth > 0 ? middleWidth : 100 - leftWidth - finalRightWidth;

        // Sidebar header mode - columns render directly as page uses row flex
        if (settings.headerPosition === "sidebar") {
          return (
            <Document>
              <Page size="A4" style={styles.page}>
                {config.sidebarBackground && (
                  <View fixed style={styles.sidebarBackground} />
                )}

                {/* Left column with header spanning full height */}
                <View
                  style={{
                    width: `${leftWidth}%`,
                    paddingLeft: 15,
                    paddingRight: 10,
                  }}
                >
                  <HeaderComponent
                    basics={basics}
                    settings={settings}
                    fonts={fonts}
                    getColor={getColor}
                    fontSize={fontSize}
                    align={headerAlign}
                    headerTextColor={config.headerTextColor}
                  />
                  {leftContent.map((id) => renderSection(id, sidebarColorFn))}
                </View>

                {/* Middle column */}
                <View
                  style={{
                    width: `${finalMiddleWidth}%`,
                    paddingHorizontal: 15,
                  }}
                >
                  {middleContent.map((id) => renderSection(id))}
                </View>

                {/* Right column */}
                <View
                  style={{
                    width: `${finalRightWidth}%`,
                    paddingHorizontal: 15,
                  }}
                >
                  {rightContent.map((id) => renderSection(id))}
                </View>
              </Page>
            </Document>
          );
        }

        // Standard three-column (header at top)
        return (
          <Document>
            <Page size="A4" style={styles.page}>
              {config.sidebarBackground && (
                <View fixed style={styles.sidebarBackground} />
              )}

              <View style={styles.header}>
                <HeaderComponent
                  basics={basics}
                  settings={settings}
                  fonts={fonts}
                  getColor={getColor}
                  fontSize={fontSize}
                  align={headerAlign}
                  headerTextColor={config.headerTextColor}
                />
              </View>

              <View style={styles.columnsContainer}>
                <View style={styles.leftColumn}>
                  {leftContent.map((id) => renderSection(id, sidebarColorFn))}
                </View>
                <View style={{ width: `${finalMiddleWidth}%` }}>
                  {middleContent.map((id) => renderSection(id))}
                </View>
                <View style={{ width: `${finalRightWidth}%` }}>
                  {rightContent.map((id) => renderSection(id))}
                </View>
              </View>
            </Page>
          </Document>
        );

      case "creative-sidebar":
        // Check if main content should be split into two columns
        const hasSplitMain =
          config.middleColumnSections && config.middleColumnSections.length > 0;

        return (
          <Document>
            <Page size="A4" style={styles.page}>
              {config.sidebarBackground && (
                <View fixed style={styles.sidebarBackground} />
              )}
              {config.rightColumnBackgroundColor && (
                <View fixed style={styles.rightColumnBackground} />
              )}

              <View style={styles.sidebar}>
                <View
                  style={{
                    marginBottom: settings.headerBottomMargin || 24,
                    alignItems:
                      headerAlign === "center"
                        ? "center"
                        : headerAlign === "right"
                          ? "flex-end"
                          : "flex-start",
                  }}
                >
                  <HeaderComponent
                    basics={basics}
                    settings={settings}
                    fonts={fonts}
                    getColor={getColor}
                    fontSize={fontSize}
                    align={headerAlign}
                    headerTextColor={config.sidebarTextColor}
                  />
                </View>
                {leftContent.map((id) => renderSection(id, sidebarColorFn))}
              </View>

              {/* Main content - single or split into two columns */}
              {hasSplitMain ? (
                <View style={{ ...styles.main, flexDirection: "row" }}>
                  {/* Middle column */}
                  <View style={{ width: "50%", paddingRight: 8 }}>
                    {middleContent.map((id) => renderSection(id, rightColorFn))}
                  </View>
                  {/* Right column */}
                  <View style={{ width: "50%", paddingLeft: 8 }}>
                    {rightContent.map((id) => renderSection(id, rightColorFn))}
                  </View>
                </View>
              ) : (
                <View style={styles.main}>
                  {rightContent.map((id) => renderSection(id, rightColorFn))}
                </View>
              )}
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
              <View>{order.map((id) => renderSection(id))}</View>
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
    layoutType: "creative-sidebar",
    defaultThemeColor: "#0d9488",
    sidebarBackground: false,
    leftColumnSections: ["skills", "education", "awards", "certificates", "interests", "languages"],
    rightColumnSections: ["summary", "work", "projects", "publications", "references", "custom"],
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
