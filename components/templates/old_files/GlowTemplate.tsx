import { Document, Page, View, StyleSheet, pdf } from "@react-pdf/renderer";
import type { Resume } from "@/db";
import { getTemplateDefaults } from "@/lib/template-defaults";
import { mmToPt } from "@/lib/template-utils";
import "@/lib/fonts"; // Auto-registers all fonts
import { getSectionHeadingWrapperStyles } from "@/lib/template-styles";

// Sub-components
import { GlowHeader } from "./glow/GlowHeader";
import { GlowSummary } from "./glow/GlowSummary";
import { GlowExperience } from "./glow/GlowExperience";
import { GlowEducation } from "./glow/GlowEducation";
import { GlowSkills } from "./glow/GlowSkills";
import { GlowProjects } from "./glow/GlowProjects";
import { GlowCertificates } from "./glow/GlowCertificates";
import { GlowAwards } from "./glow/GlowAwards";
import { GlowPublications } from "./glow/GlowPublications";
import { GlowReferences } from "./glow/GlowReferences";
import { GlowLanguages } from "./glow/GlowLanguages";
import { GlowInterests } from "./glow/GlowInterests";
import { GlowCustom } from "./glow/GlowCustom";

interface GlowTemplateProps {
  resume: Resume;
}

export function GlowTemplate({ resume }: GlowTemplateProps) {
  const {
    basics,
    work,
    education,
    skills,
    projects,
    certificates,
    languages,
    interests,
    publications,
    awards,
    references,
    custom,
  } = resume;

  // Merge template defaults
  const templateDefaults = getTemplateDefaults(
    resume.meta.templateId || "glow",
  );
  const settings = { ...templateDefaults, ...resume.meta.layoutSettings };

  // Defaults
  const fontSize = settings.fontSize;
  const lineHeight = settings.lineHeight;
  const sectionMargin = settings.sectionMargin;
  const marginH = mmToPt(settings.marginHorizontal);
  const marginV = mmToPt(settings.marginVertical);

  // Layout Controls
  const columnCount = settings.columnCount;
  const leftColumnWidthPercent = settings.leftColumnWidth;
  const rightColumnWidthPercent = 100 - leftColumnWidthPercent;

  // Typography Constants
  const selectedFont = settings.fontFamily;
  const baseFont = selectedFont;
  const boldFont = selectedFont;
  const italicFont = selectedFont;

  // Colors
  const themeColor = resume.meta.themeColor || "#F4D03F"; // Default Yellow/Gold if not set
  const darkColor = "#1F2937"; // Dark background for header

  // Helper to get color - respects user's themeColorTarget settings
  const colorTargets = settings.themeColorTarget;
  const getColor = (target: string, fallback: string = "#000000") => {
    return colorTargets.includes(target) ? themeColor : fallback;
  };

  // Styles
  const styles = StyleSheet.create({
    page: {
      paddingHorizontal: 0, // Header is full width
      paddingVertical: 0,
      paddingTop: marginV,
      paddingBottom: marginV,
      fontFamily: baseFont,
      fontSize: fontSize,
      lineHeight: lineHeight,
      color: "#000",
      flexDirection: "column",
    },
    // Content Container (the white part)
    contentContainer: {
      paddingHorizontal: marginH,
      paddingTop: 0, // Using page padding now for top margin
    },
    // Header
    header: {
      marginBottom: settings.headerBottomMargin,
      width: "100%",
    },
    name: {
      fontSize: settings.nameFontSize,
      fontFamily: settings.nameBold ? boldFont : baseFont,
      fontWeight: settings.nameBold ? "bold" : "normal",
      marginBottom: 4,
      lineHeight: settings.nameLineHeight,
      textTransform: "uppercase",
      letterSpacing: 1,
    },
    label: {
      fontSize: settings.titleFontSize,
      marginBottom: 3,
      fontWeight: settings.titleBold ? "bold" : "normal",
      fontStyle: settings.titleItalic ? "italic" : "normal",
      fontFamily: settings.titleBold
        ? boldFont
        : settings.titleItalic
          ? italicFont
          : baseFont,
      lineHeight: settings.titleLineHeight,
    },
    contactRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      rowGap: 2,
      columnGap: 10,
      fontSize: settings.contactFontSize,
    },

    // Columns
    columnsContainer: {
      flexDirection: "row",
      gap: 20,
    },
    leftColumn: {
      width: `${leftColumnWidthPercent}%`,
    },
    rightColumn: {
      width: `${rightColumnWidthPercent}%`,
    },

    // Section Common
    section: {
      marginBottom: sectionMargin,
    },
    sectionTitleWrapper: getSectionHeadingWrapperStyles(settings, getColor),
    sectionTitle: {
      fontSize:
        settings.sectionHeadingSize === "L" ? fontSize + 4 : fontSize + 2,
      fontFamily: settings.sectionHeadingBold ? boldFont : baseFont,
      fontWeight: settings.sectionHeadingBold ? "bold" : "normal",
      textTransform: settings.sectionHeadingCapitalization,
      letterSpacing: 0.8,
      color: getColor("headings"),
    },

    // Entries
    entryBlock: {
      marginBottom: 8,
    },
    entryHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 2,
    },
    entryTitle: {
      // Defined in components
      color: "#000",
    },
    entrySubtitle: {
      fontSize: fontSize,
      fontFamily:
        settings.entrySubtitleStyle === "bold"
          ? boldFont
          : settings.entrySubtitleStyle === "italic"
            ? italicFont
            : baseFont,
      fontWeight: settings.entrySubtitleStyle === "bold" ? "bold" : "normal",
      fontStyle: settings.entrySubtitleStyle === "italic" ? "italic" : "normal",
      color: "#333",
      marginBottom: 2,
    },
    entryDate: {
      fontSize: fontSize,
      fontFamily: baseFont,
      textAlign: "right",
      minWidth: 60,
    },
    entrySummary: {
      fontSize: fontSize,
      marginTop: 2,
      marginBottom: 2,
      textAlign: settings.entryIndentBody ? "left" : "justify",
      marginLeft: settings.entryIndentBody ? 8 : 0,
      lineHeight: 1.4,
      color: "#333",
    },

    // Lists/Bullets
    bulletList: {
      marginLeft: 10,
      marginTop: 1,
    },
    bulletItem: {
      flexDirection: "row",
      marginBottom: settings.bulletMargin,
    },
    bullet: {
      width: 8,
      fontSize: fontSize,
    },
    bulletText: {
      flex: 1,
      fontSize: fontSize,
    },
  });

  const commonProps = {
    settings,
    styles,
    getColor,
    fontSize,
    baseFont,
    boldFont,
    italicFont,
    lineHeight,
  };

  const SECTION_RENDERERS = {
    summary: () => <GlowSummary summary={basics.summary} {...commonProps} />,
    work: () => <GlowExperience work={work} {...commonProps} />,
    education: () => <GlowEducation education={education} {...commonProps} />,
    skills: () => (
      <GlowSkills skills={skills} {...commonProps} lineHeight={lineHeight} />
    ),
    projects: () => <GlowProjects projects={projects} {...commonProps} />,
    certificates: () => (
      <GlowCertificates certificates={certificates} {...commonProps} />
    ),
    awards: () => <GlowAwards awards={awards} {...commonProps} />,
    publications: () => (
      <GlowPublications publications={publications} {...commonProps} />
    ),
    languages: () => <GlowLanguages languages={languages} {...commonProps} />,
    interests: () => <GlowInterests interests={interests} {...commonProps} />,
    references: () => (
      <GlowReferences references={references} {...commonProps} />
    ),
    custom: () => <GlowCustom custom={custom} {...commonProps} />,
  };

  const order =
    settings.sectionOrder && settings.sectionOrder.length > 0
      ? settings.sectionOrder
      : [
          "summary",
          "work",
          "education",
          "skills",
          "projects",
          "certificates",
          "languages",
          "interests",
          "awards",
          "publications",
          "references",
          "custom",
        ];

  // Logic to split sections if columnCount === 2
  const LHS_SECTIONS = [
    "skills",
    "education",
    "languages",
    "interests",
    "awards",
    "certificates",
    "references",
  ];
  const RHS_SECTIONS = [
    "summary",
    "work",
    "projects",
    "publications",
    "custom",
  ];

  const leftColumnContent = order.filter((id) => LHS_SECTIONS.includes(id));
  const rightColumnContent = order.filter((id) => RHS_SECTIONS.includes(id));

  // Orphans
  const knownSections = [...LHS_SECTIONS, ...RHS_SECTIONS];
  const orphans = order.filter((id) => !knownSections.includes(id));
  rightColumnContent.push(...orphans);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header takes full width, outside content margins if we want it to span full page width */}
        <GlowHeader
          basics={basics}
          {...commonProps}
          headerBackgroundColor={darkColor}
          headerTextColor="#FFFFFF"
        />

        <View style={styles.contentContainer}>
          {columnCount === 1 ? (
            <View>
              {order.map((sectionId) => {
                const renderer =
                  SECTION_RENDERERS[
                    sectionId as keyof typeof SECTION_RENDERERS
                  ];
                return renderer ? (
                  <View key={sectionId}>{renderer()}</View>
                ) : null;
              })}
            </View>
          ) : (
            <View style={styles.columnsContainer}>
              {/* Left Column */}
              <View style={styles.leftColumn}>
                {leftColumnContent.map((sectionId) => {
                  const renderer =
                    SECTION_RENDERERS[
                      sectionId as keyof typeof SECTION_RENDERERS
                    ];
                  return renderer ? (
                    <View key={sectionId}>{renderer()}</View>
                  ) : null;
                })}
              </View>

              {/* Right Column */}
              <View style={styles.rightColumn}>
                {rightColumnContent.map((sectionId) => {
                  const renderer =
                    SECTION_RENDERERS[
                      sectionId as keyof typeof SECTION_RENDERERS
                    ];
                  return renderer ? (
                    <View key={sectionId}>{renderer()}</View>
                  ) : null;
                })}
              </View>
            </View>
          )}
        </View>
      </Page>
    </Document>
  );
}

export async function generateGlowPDF(resume: Resume): Promise<Blob> {
  const doc = <GlowTemplate resume={resume} />;
  const blob = await pdf(doc).toBlob();
  return blob;
}
