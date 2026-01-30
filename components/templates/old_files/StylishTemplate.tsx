import {
  Document,
  Page,
  View,
  StyleSheet,
  pdf,
  Svg,
  Path,
  Defs,
  LinearGradient,
  Stop,
} from "@react-pdf/renderer";
import type { Resume } from "@/db";
import { getTemplateDefaults } from "@/lib/template-defaults";
import { mmToPt } from "@/lib/template-utils";
import "@/lib/fonts"; // Auto-registers all fonts
import { getSectionHeadingWrapperStyles } from "@/lib/template-styles";

// Sub-components
import { StylishHeader } from "@/components/templates/stylish/StylishHeader";
import { StylishSummary } from "@/components/templates/stylish/StylishSummary";
import { StylishExperience } from "@/components/templates/stylish/StylishExperience";
import { StylishEducation } from "@/components/templates/stylish/StylishEducation";
import { StylishSkills } from "@/components/templates/stylish/StylishSkills";
import { StylishProjects } from "@/components/templates/stylish/StylishProjects";
import { StylishCertificates } from "@/components/templates/stylish/StylishCertificates";
import { StylishAwards } from "@/components/templates/stylish/StylishAwards";
import { StylishPublications } from "@/components/templates/stylish/StylishPublications";
import { StylishReferences } from "@/components/templates/stylish/StylishReferences";
import { StylishLanguages } from "@/components/templates/stylish/StylishLanguages";
import { StylishInterests } from "@/components/templates/stylish/StylishInterests";
import { StylishCustom } from "@/components/templates/stylish/StylishCustom";

interface StylishTemplateProps {
  resume: Resume;
}

export function StylishTemplate({ resume }: StylishTemplateProps) {
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

  const templateDefaults = getTemplateDefaults(
    resume.meta.templateId || "stylish",
  );
  const settings = { ...templateDefaults, ...resume.meta.layoutSettings };

  const fontSize = settings.fontSize;
  const lineHeight = settings.lineHeight;
  const sectionMargin = settings.sectionMargin;
  const bulletMargin = settings.bulletMargin;
  const marginH = mmToPt(settings.marginHorizontal);
  const marginV = mmToPt(settings.marginVertical);

  const leftColumnWidthPercent = settings.leftColumnWidth;
  const rightColumnWidthPercent = 100 - leftColumnWidthPercent;

  const selectedFont = settings.fontFamily;
  const baseFont = selectedFont;
  const boldFont = selectedFont;
  const italicFont = selectedFont;

  const colorTargets = settings.themeColorTarget;
  const getColor = (target: string, fallback: string = "#000000") => {
    return colorTargets.includes(target) ? resume.meta.themeColor : fallback;
  };

  const styles = StyleSheet.create({
    page: {
      paddingHorizontal: 0, // Header is full width
      paddingVertical: 0,
      fontFamily: baseFont,
      fontSize: fontSize,
      lineHeight: lineHeight,
      color: "#333333",
      flexDirection: "column",
    },
    // The content container with margins
    contentContainer: {
      paddingHorizontal: marginH,
      paddingBottom: marginV,
      paddingTop: 0,
    },
    columnsContainer: {
      flexDirection: "row",
      gap: 15,
    },
    leftColumn: {
      width: `${leftColumnWidthPercent}%`,
      paddingRight: 5,
    },
    rightColumn: {
      width: `${rightColumnWidthPercent}%`,
    },
    section: {
      marginBottom: sectionMargin,
    },
    sectionTitle: {
      fontSize:
        settings.sectionHeadingSize === "L" ? fontSize + 4 : fontSize + 2,
      fontFamily: boldFont,
      fontWeight: "bold",
      textTransform: settings.sectionHeadingCapitalization,
      letterSpacing: 0.5,
      color: getColor("headings"),
      marginBottom: 3,
    },
    // Entries
    entryBlock: {
      marginBottom: 6,
    },
    entryHeader: {
      flexDirection: "column",
      marginBottom: 2,
    },
    entryTitle: {
      fontSize: settings.entryTitleSize === "L" ? fontSize + 2 : fontSize + 1,
      fontFamily: boldFont,
      fontWeight: "bold",
      color: getColor("headings"),
    },
    entrySubtitle: {
      fontSize: fontSize,
      fontFamily: italicFont,
      fontStyle: "italic",
      marginBottom: 1,
    },
    entryDate: {
      fontSize: fontSize - 1,
      color: "#666",
      marginBottom: 2,
    },
    entrySummary: {
      fontSize: fontSize,
      marginBottom: 2,
      textAlign: "justify",
    },
    // Bullets
    bulletList: {
      marginLeft: 8,
    },
    bulletItem: {
      flexDirection: "row",
      marginBottom: bulletMargin,
    },
    bullet: {
      width: 6,
      fontSize: fontSize,
    },
    bulletText: {
      flex: 1,
      fontSize: fontSize,
    },
    // Grid
    gridContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 6,
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
    summary: () => <StylishSummary summary={basics.summary} {...commonProps} />,
    work: () => <StylishExperience work={work} {...commonProps} />,
    education: () => (
      <StylishEducation education={education} {...commonProps} />
    ),
    skills: () => <StylishSkills skills={skills} {...commonProps} />,
    projects: () => <StylishProjects projects={projects} {...commonProps} />,
    certificates: () => (
      <StylishCertificates certificates={certificates} {...commonProps} />
    ),
    awards: () => <StylishAwards awards={awards} {...commonProps} />,
    publications: () => (
      <StylishPublications publications={publications} {...commonProps} />
    ),
    languages: () => (
      <StylishLanguages languages={languages} {...commonProps} />
    ),
    interests: () => (
      <StylishInterests interests={interests} {...commonProps} />
    ),
    references: () => (
      <StylishReferences references={references} {...commonProps} />
    ),
    custom: () => <StylishCustom custom={custom} {...commonProps} />,
    // Aliases for sidebar specific items if needed
    courses: () => null, // Typically inside education, but if split out
    achievements: () => null, // Typically inside experience
    passions: () => (
      <StylishInterests
        interests={interests}
        {...commonProps}
        title="Passions"
      />
    ),
  };

  const order = settings.sectionOrder;

  // Split logic based on ID list or convention
  // Current stylish convention: Main=Left, Sidebar=Right
  const MAIN_SECTIONS = [
    "work",
    "education",
    "projects",
    "skills",
    "languages",
    "certificates",
  ];
  const SIDEBAR_SECTIONS = [
    "summary",
    "achievements",
    "courses",
    "passions",
    "interests",
    "awards",
    "publications",
    "references",
    "custom",
  ];

  // Note: The new template defaults have explicit order list, but we can stick to column split logic
  // The 'leftColumnWidth' is 65%, so that receives the MAIN content.
  // The Sidebar is the Right column (narrower).

  const mainContent = order.filter((id) => MAIN_SECTIONS.includes(id));
  const sidebarContent = order.filter((id) => SIDEBAR_SECTIONS.includes(id));

  // Orphan handling
  const known = [...MAIN_SECTIONS, ...SIDEBAR_SECTIONS];
  const orphans = order.filter((id) => !known.includes(id));
  sidebarContent.push(...orphans);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Full width header */}
        <StylishHeader basics={basics} {...commonProps} />

        <View style={styles.contentContainer}>
          <View style={styles.columnsContainer}>
            {/* Left Column (Main) 65% */}
            <View style={styles.leftColumn}>
              {mainContent.map((sectionId) => {
                const renderer =
                  SECTION_RENDERERS[
                    sectionId as keyof typeof SECTION_RENDERERS
                  ];
                return renderer ? (
                  <View key={sectionId}>{renderer()}</View>
                ) : null;
              })}
            </View>

            {/* Right Column (Sidebar) 35% */}
            <View style={styles.rightColumn}>
              {sidebarContent.map((sectionId) => {
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
        </View>
      </Page>
    </Document>
  );
}

export async function generateStylishPDF(resume: Resume): Promise<Blob> {
  const doc = <StylishTemplate resume={resume} />;
  const blob = await pdf(doc).toBlob();
  return blob;
}
