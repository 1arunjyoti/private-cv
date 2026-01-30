import { Document, Page, View, StyleSheet, pdf } from "@react-pdf/renderer";
import type { Resume } from "@/db";
import { getTemplateDefaults } from "@/lib/template-defaults";
import { mmToPt } from "@/lib/template-utils";
import "@/lib/fonts"; // Auto-registers all fonts
import { getSectionHeadingWrapperStyles } from "@/lib/template-styles";

// Sub-components
import { ClassicHeader } from "./old_files/classic/ClassicHeader";
import { ClassicSummary } from "./old_files/classic/ClassicSummary";
import { ClassicExperience } from "./old_files/classic/ClassicExperience";
import { ClassicEducation } from "./old_files/classic/ClassicEducation";
import { ClassicSkills } from "./old_files/classic/ClassicSkills";
import { ClassicProjects } from "./old_files/classic/ClassicProjects";
import { ClassicCertificates } from "./old_files/classic/ClassicCertificates";
import { ClassicAwards } from "./old_files/classic/ClassicAwards";
import { ClassicPublications } from "./old_files/classic/ClassicPublications";
import { ClassicReferences } from "./old_files/classic/ClassicReferences";
import { ClassicLanguages } from "./old_files/classic/ClassicLanguages";
import { ClassicInterests } from "./old_files/classic/ClassicInterests";
import { ClassicCustom } from "./old_files/classic/ClassicCustom";

interface ClassicSlateTemplateProps {
  resume: Resume;
}

export function ClassicSlateTemplate({ resume }: ClassicSlateTemplateProps) {
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

  // Merge template defaults with resume settings
  const templateDefaults = getTemplateDefaults(
    resume.meta.templateId || "classic-slate",
  );
  const settings = { ...templateDefaults, ...resume.meta.layoutSettings };

  // Defaults
  const fontSize = settings.fontSize;
  const lineHeight = settings.lineHeight;
  const sectionMargin = settings.sectionMargin;
  const bulletMargin = settings.bulletMargin;
  const marginH = mmToPt(settings.marginHorizontal);
  const marginV = mmToPt(settings.marginVertical);

  // Layout Controls
  const columnCount = settings.columnCount;
  const leftColumnWidthPercent = settings.leftColumnWidth;
  const rightColumnWidthPercent = 100 - leftColumnWidthPercent;
  const layoutHeaderPos = settings.headerPosition;
  const headerAlign: "left" | "center" | "right" =
    layoutHeaderPos === "left" || layoutHeaderPos === "right"
      ? layoutHeaderPos
      : "center";

  // Typography Constants
  const selectedFont = settings.fontFamily;
  const baseFont = selectedFont;
  const boldFont = selectedFont;
  const italicFont = selectedFont;

  // Helper to get color
  const colorTargets = settings.themeColorTarget;
  const getColor = (target: string, fallback: string = "#000000") => {
    return colorTargets.includes(target) ? resume.meta.themeColor : fallback;
  };

  // Styles
  const styles = StyleSheet.create({
    page: {
      paddingHorizontal: marginH,
      paddingVertical: marginV,
      fontFamily: baseFont,
      fontSize: fontSize,
      lineHeight: lineHeight,
      color: "#000",
      flexDirection: "column",
    },
    // Header
    header: {
      marginBottom: settings.headerBottomMargin,
      textAlign: headerAlign,
      // Slate specific: Header usually has lines
      borderBottomWidth: 2,
      borderBottomColor: getColor("decorations", "#000000"),
      borderBottomStyle: "solid",
      borderTopWidth: 2,
      borderTopColor: getColor("decorations", "#000000"),
      borderTopStyle: "solid",
      paddingVertical: 10,
      width: "100%",
    },
    name: {
      fontSize: settings.nameFontSize,
      fontFamily:
        settings.nameFont === "creative"
          ? "Helvetica"
          : settings.nameBold
            ? boldFont
            : baseFont,
      fontWeight:
        settings.nameBold || settings.nameFont === "creative"
          ? "bold"
          : "normal",
      marginBottom: 4,
      lineHeight: settings.nameLineHeight,
      textTransform: "capitalize", // Slate usually Capitalize
      letterSpacing: 0,
      color: getColor("name"),
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
      justifyContent:
        headerAlign === "left"
          ? "flex-start"
          : headerAlign === "right"
            ? "flex-end"
            : "center",
      flexWrap: "wrap",
      rowGap: 2,
      columnGap: 0,
      fontSize: settings.contactFontSize,
      marginTop: 2,
    },

    // Columns
    columnsContainer: {
      flexDirection: "row",
      gap: 12, // Gap between columns
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
    // Slate specific section title wrapper override
    sectionTitleWrapper: {
      ...getSectionHeadingWrapperStyles(settings, getColor),
      paddingVertical: 2,
      marginBottom: 6,
    },
    sectionTitle: {
      fontSize:
        settings.sectionHeadingSize === "L" ? fontSize + 4 : fontSize + 2,
      fontFamily: settings.sectionHeadingBold ? boldFont : baseFont,
      fontWeight: settings.sectionHeadingBold ? "bold" : "normal",
      textTransform: settings.sectionHeadingCapitalization,
      letterSpacing: 0.8,
      color: getColor("headings"),
      // Remove underline derived from settings if style=2 (which implies lines above/below in our slate logic)
      textDecoration: "none",
    },

    // Entries
    entryBlock: {
      marginBottom: 6,
    },
    entryHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "baseline",
      marginBottom: 2,
      flexWrap: "wrap",
    },
    entryTitle: {
      fontSize: settings.entryTitleSize === "L" ? fontSize + 3 : fontSize + 1,
      fontFamily: boldFont,
      fontWeight: "bold",
    },
    entryDate: {
      fontSize: fontSize,
      fontFamily: italicFont,
      fontStyle: "italic",
      textAlign: "right",
      minWidth: 60,
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
      marginBottom: 2,
    },
    entrySummary: {
      fontSize: fontSize,
      marginTop: 1,
      marginBottom: 2,
      textAlign: settings.entryIndentBody ? "left" : "justify",
      marginLeft: settings.entryIndentBody ? 8 : 0,
    },

    // Lists/Bullets
    bulletList: {
      marginLeft: 10,
      marginTop: 1,
    },
    bulletItem: {
      flexDirection: "row",
      marginBottom: bulletMargin,
    },
    bullet: {
      width: 8,
      fontSize: fontSize,
    },
    bulletText: {
      flex: 1,
      fontSize: fontSize,
    },

    // Grids (Skills etc)
    gridContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 4,
    },
  });

  // Common Props to pass to sub-components
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
    summary: () => <ClassicSummary summary={basics.summary} {...commonProps} />,
    work: () => <ClassicExperience work={work} {...commonProps} />,
    education: () => (
      <ClassicEducation education={education} {...commonProps} />
    ),
    skills: () => (
      <ClassicSkills skills={skills} {...commonProps} lineHeight={lineHeight} />
    ),
    projects: () => <ClassicProjects projects={projects} {...commonProps} />,
    certificates: () => (
      <ClassicCertificates certificates={certificates} {...commonProps} />
    ),
    awards: () => <ClassicAwards awards={awards} {...commonProps} />,
    publications: () => (
      <ClassicPublications publications={publications} {...commonProps} />
    ),
    languages: () => (
      <ClassicLanguages languages={languages} {...commonProps} />
    ),
    interests: () => (
      <ClassicInterests interests={interests} {...commonProps} />
    ),
    references: () => (
      <ClassicReferences references={references} {...commonProps} />
    ),
    custom: () => <ClassicCustom custom={custom} {...commonProps} />,
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
  // For Classic Slate: Main (Left - 65%) vs Sidebar (Right - 35%)
  // Intelligently distribute: Put content-heavy sections in main, compact sections in sidebar
  const MAIN_SECTIONS = ["summary", "work", "projects", "references", "custom"];
  const SIDEBAR_SECTIONS = [
    "skills",
    "languages",
    "interests",
    "education",
    "certificates",
    "awards",
    "publications",
  ];

  const leftColumnContent = order.filter(
    (id) =>
      MAIN_SECTIONS.includes(id) ||
      (!SIDEBAR_SECTIONS.includes(id) && !MAIN_SECTIONS.includes(id)),
  );
  const rightColumnContent = order.filter((id) =>
    SIDEBAR_SECTIONS.includes(id),
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <ClassicHeader basics={basics} {...commonProps} />

        {columnCount === 1 ? (
          <View>
            {order.map((sectionId) => {
              const renderer =
                SECTION_RENDERERS[sectionId as keyof typeof SECTION_RENDERERS];
              return renderer ? (
                <View key={sectionId}>{renderer()}</View>
              ) : null;
            })}
          </View>
        ) : (
          <View style={styles.columnsContainer}>
            {/* Left Column (Main) */}
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

            {/* Right Column (Sidebar) */}
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
      </Page>
    </Document>
  );
}

export async function generateClassicSlatePDF(resume: Resume): Promise<Blob> {
  const doc = <ClassicSlateTemplate resume={resume} />;
  const blob = await pdf(doc).toBlob();
  return blob;
}
