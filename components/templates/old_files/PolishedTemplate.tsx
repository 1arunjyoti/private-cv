import { Document, Page, View, StyleSheet, pdf } from "@react-pdf/renderer";
import type { Resume } from "@/db";
import { getTemplateDefaults } from "@/lib/template-defaults";
import { mmToPt } from "@/lib/template-utils";
import "@/lib/fonts";
import { getSectionHeadingWrapperStyles } from "@/lib/template-styles";

// Sub-components
import { PolishedHeader } from "@/components/templates/polished/PolishedHeader";
import { PolishedSidebar } from "@/components/templates/polished/PolishedSidebar";

// Dedicated sections
import { PolishedExperience } from "@/components/templates/polished/PolishedExperience";
import { PolishedEducation } from "@/components/templates/polished/PolishedEducation";
import { PolishedSkills } from "@/components/templates/polished/PolishedSkills";
import { PolishedSummary } from "@/components/templates/polished/PolishedSummary";
import { PolishedLanguages } from "@/components/templates/polished/PolishedLanguages";
// Re-using Classic for generic ones initially, then specializing if needed
import { ClassicProjects } from "./classic/ClassicProjects";
import { ClassicCertificates } from "./classic/ClassicCertificates";
import { ClassicAwards } from "./classic/ClassicAwards";
import { ClassicPublications } from "./classic/ClassicPublications";
import { ClassicReferences } from "./classic/ClassicReferences";
import { ClassicInterests } from "./classic/ClassicInterests";
import { ClassicCustom } from "./classic/ClassicCustom";

interface PolishedTemplateProps {
  resume: Resume;
}

export function PolishedTemplate({ resume }: PolishedTemplateProps) {
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

  const templateDefaults = getTemplateDefaults("polished");
  // Merge with user settings
  const settings = { ...templateDefaults, ...resume.meta.layoutSettings };

  // Layout Defaults
  const fontSize = settings.fontSize || 10;
  const lineHeight = settings.lineHeight || 1.4;
  const marginH = mmToPt(settings.marginHorizontal || 10);
  const marginV = mmToPt(settings.marginVertical || 10);

  // Theme Color
  const themeColor = resume.meta.themeColor || "#38b6ff";

  // Fonts
  const baseFont = settings.fontFamily || "Roboto";
  const boldFont = settings.fontFamily || "Roboto"; // In real app, might handle weights
  const italicFont = settings.fontFamily || "Roboto";

  const getColor = (target: string, fallback: string = "#000000") => {
    const colorTargets = settings.themeColorTarget || [];
    return colorTargets.includes(target) ? themeColor : fallback;
  };

  const styles = StyleSheet.create({
    page: {
      flexDirection: "row",
      backgroundColor: "#FFFFFF",
      fontFamily: baseFont,
      fontSize: fontSize,
      lineHeight: lineHeight,
    },
    // Left Main Column
    mainColumn: {
      width: "65%", // Approx 2/3
      paddingTop: marginV,
      paddingBottom: marginV,
      paddingLeft: marginH,
      paddingRight: 20, // Gap
      backgroundColor: "#FFFFFF",
    },
    // Right Sidebar
    sidebar: {
      width: "35%",
      backgroundColor: themeColor,
      color: "#FFFFFF", // Default text color in sidebar
      paddingTop: marginV,
      paddingBottom: marginV,
      paddingLeft: 20,
      paddingRight: marginH,
    },
    // Helper to fill page
    columnContainer: {
      flex: 1,
      flexDirection: "row",
      height: "100%",
    },
  });

  const commonProps = {
    settings,
    resume, // Pass full resume if needed
    basics, // Pass basics convenience
    styles: {}, // Pass local styles if needed, or component handles its own
    themeColor,
    getColor,
    fontSize,
    baseFont,
    boldFont,
    italicFont,
    lineHeight,
  };

  // Section Renderers
  // We need to map sections to their components
  // And also decide which column they goto.
  // We'll define a Map of Renderers.

  const SECTION_RENDERERS = {
    summary: () => (
      <PolishedSummary summary={basics.summary} {...commonProps} />
    ),
    work: () => <PolishedExperience work={work} {...commonProps} />,
    education: () => (
      <PolishedEducation education={education} {...commonProps} />
    ),
    skills: () => (
      <PolishedSkills skills={skills} {...commonProps} layout="list" />
    ), // Sidebar usually
    projects: () => <ClassicProjects projects={projects} {...commonProps} />, // Reuse for now
    certificates: () => (
      <ClassicCertificates certificates={certificates} {...commonProps} />
    ),
    awards: () => <ClassicAwards awards={awards} {...commonProps} />,
    publications: () => (
      <ClassicPublications publications={publications} {...commonProps} />
    ),
    languages: () => (
      <PolishedLanguages languages={languages} {...commonProps} />
    ),
    interests: () => (
      <ClassicInterests interests={interests} {...commonProps} />
    ),
    references: () => (
      <ClassicReferences references={references} {...commonProps} />
    ),
    custom: () => <ClassicCustom custom={custom} {...commonProps} />,
  };

  // Layout Logic
  // Per design image:
  // Main (Left): Header, Summary, Experience, Education, Languages (Maybe?)
  // Sidebar (Right): Profile Photo, Key Achievements (Awards/Custom), Skills, Courses (Custom/Cert), Passions (Interests)

  // We should respect users order if they re-order, BUT the column split is usually fixed-ish in rigid templates OR we let them choose "left/right" columns.
  // ClassicTemplate splits by index or defined lists. Use defined lists for default "Polished" look.

  const MAIN_CONSTANTS = ["summary", "work", "education", "languages"]; // Default Left
  const SIDEBAR_CONSTANTS = [
    "skills",
    "interests",
    "awards",
    "certificates",
    "custom",
    "projects",
  ]; // Default Right

  // However, user order determines the vertical order within the column.
  // We can filter the ordered list.
  const order = settings.sectionOrder || [
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

  const mainContentIds = order.filter(
    (id) =>
      MAIN_CONSTANTS.includes(id) ||
      (!SIDEBAR_CONSTANTS.includes(id) && !MAIN_CONSTANTS.includes(id)),
  );
  const sidebarContentIds = order.filter((id) =>
    SIDEBAR_CONSTANTS.includes(id),
  );

  // Note: PolishedHeader is a special component that sits at Top of Main Column usually.

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.mainColumn}>
          <PolishedHeader basics={basics} {...commonProps} />
          {mainContentIds.map((id) => {
            const Renderer =
              SECTION_RENDERERS[id as keyof typeof SECTION_RENDERERS];
            return Renderer ? (
              <View key={id} style={{ marginBottom: settings.sectionMargin }}>
                {Renderer()}
              </View>
            ) : null;
          })}
        </View>

        <View style={styles.sidebar}>
          <PolishedSidebar basics={basics} {...commonProps}>
            {sidebarContentIds.map((id) => {
              const Renderer =
                SECTION_RENDERERS[id as keyof typeof SECTION_RENDERERS];
              // Pass a prop to tell renderer it's in sidebar (white text)?
              // Or wrap in a SidebarSection component that handles styling?
              // Let's pass `isSidebar={true}` to commonProps or overrides.
              return Renderer ? (
                <View key={id} style={{ marginBottom: settings.sectionMargin }}>
                  {Renderer()}
                </View>
              ) : null;
            })}
          </PolishedSidebar>
        </View>
      </Page>
    </Document>
  );
}

export async function generatePolishedPDF(resume: Resume): Promise<Blob> {
  const doc = <PolishedTemplate resume={resume} />;
  const blob = await pdf(doc).toBlob();
  return blob;
}
