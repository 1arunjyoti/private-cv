import { Document, Page, View, StyleSheet, pdf } from "@react-pdf/renderer";
import type { Resume } from "@/db";
import { getTemplateDefaults } from "@/lib/template-defaults";
import { mmToPt } from "@/lib/template-utils";
import "@/lib/fonts"; // Auto-registers all fonts
import { getSectionHeadingWrapperStyles } from "@/lib/template-styles";

// Custom Header
import { MulticolumnHeader } from "./multicolumn/MulticolumnHeader";

// Sub-components (Reusing Classic's sub-components)
import { ClassicSummary } from "./classic/ClassicSummary";
import { ClassicExperience } from "./classic/ClassicExperience";
import { ClassicEducation } from "./classic/ClassicEducation";
import { ClassicSkills } from "./classic/ClassicSkills";
import { ClassicProjects } from "./classic/ClassicProjects";
import { ClassicCertificates } from "./classic/ClassicCertificates";
import { ClassicAwards } from "./classic/ClassicAwards";
import { ClassicPublications } from "./classic/ClassicPublications";
import { ClassicReferences } from "./classic/ClassicReferences";
import { ClassicLanguages } from "./classic/ClassicLanguages";
import { ClassicInterests } from "./classic/ClassicInterests";
import { ClassicCustom } from "./classic/ClassicCustom";

interface MulticolumnTemplateProps {
  resume: Resume;
}

export function MulticolumnTemplate({ resume }: MulticolumnTemplateProps) {
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
    resume.meta.templateId || "multicolumn",
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
  const leftColumnWidthPercent = settings.leftColumnWidth || 25; // Default 25% if not set
  // Assume Main (Middle) is twice the side OR remaining split.
  // Let's go with: Middle takes 50%, Right takes Remaining (approx 25%).
  // Adjustable via logic if we wanted.
  const middleColumnWidthPercent = 50;
  const rightColumnWidthPercent =
    100 - leftColumnWidthPercent - middleColumnWidthPercent;

  const headerAlign: "left" | "center" | "right" = "left";

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
    headerWrapper: {
      marginBottom: settings.headerBottomMargin,
    },

    // Columns
    columnsContainer: {
      flexDirection: "row",
      gap: 12,
      height: "100%", // Extend to bottom if needed?
    },
    leftColumn: {
      width: `${leftColumnWidthPercent}%`,
    },
    middleColumn: {
      width: `${middleColumnWidthPercent}%`,
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

    // Standard Sub-component styles needed by Classic components
    entryBlock: { marginBottom: 6 },
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
    bulletList: { marginLeft: 10, marginTop: 1 },
    bulletItem: { flexDirection: "row", marginBottom: bulletMargin },
    bullet: { width: 8, fontSize: fontSize },
    bulletText: { flex: 1, fontSize: fontSize },
    gridContainer: { flexDirection: "row", flexWrap: "wrap", gap: 4 },
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
          "skills",
          "languages",
          "interests",
          "summary",
          "work",
          "projects",
          "education",
          "certificates",
          "awards",
          "publications",
          "references",
        ];

  // 3-Column Split Logic
  // Split based on explicit lists for now to ensure good distribution as per defaults
  // Left: Skills, Languages, Interests
  // Middle: Summary, Work, Projects
  // Right: Education, Certificates, Awards, Publications, References

  const LHS_SECTIONS = ["skills", "languages", "interests"];
  const MID_SECTIONS = ["summary", "work", "projects", "custom"];
  const RHS_SECTIONS = [
    "education",
    "certificates",
    "awards",
    "publications",
    "references",
  ];

  const leftColumnContent = order.filter((id) => LHS_SECTIONS.includes(id));
  const middleColumnContent = order.filter((id) => MID_SECTIONS.includes(id));
  const rightColumnContent = order.filter((id) => RHS_SECTIONS.includes(id));

  // Handle orphans - dump them in middle
  const allKnown = [...LHS_SECTIONS, ...MID_SECTIONS, ...RHS_SECTIONS];
  const orphans = order.filter((id) => !allKnown.includes(id));
  middleColumnContent.push(...orphans);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerWrapper}>
          <MulticolumnHeader
            basics={basics}
            settings={settings}
            styles={styles}
            getColor={getColor}
            fontSize={fontSize}
            baseFont={baseFont}
            boldFont={boldFont}
          />
        </View>

        <View style={styles.columnsContainer}>
          {/* Left Column */}
          <View style={styles.leftColumn}>
            {leftColumnContent.map((sectionId) => {
              const renderer =
                SECTION_RENDERERS[sectionId as keyof typeof SECTION_RENDERERS];
              return renderer ? (
                <View key={sectionId}>{renderer()}</View>
              ) : null;
            })}
          </View>

          {/* Middle Column */}
          <View style={styles.middleColumn}>
            {middleColumnContent.map((sectionId) => {
              const renderer =
                SECTION_RENDERERS[sectionId as keyof typeof SECTION_RENDERERS];
              return renderer ? (
                <View key={sectionId}>{renderer()}</View>
              ) : null;
            })}
          </View>

          {/* Right Column */}
          <View style={styles.rightColumn}>
            {rightColumnContent.map((sectionId) => {
              const renderer =
                SECTION_RENDERERS[sectionId as keyof typeof SECTION_RENDERERS];
              return renderer ? (
                <View key={sectionId}>{renderer()}</View>
              ) : null;
            })}
          </View>
        </View>
      </Page>
    </Document>
  );
}

export async function generateMulticolumnPDF(resume: Resume): Promise<Blob> {
  const doc = <MulticolumnTemplate resume={resume} />;
  const blob = await pdf(doc).toBlob();
  return blob;
}
