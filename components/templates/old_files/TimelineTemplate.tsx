import { Document, Page, View, StyleSheet, pdf } from "@react-pdf/renderer";
import type { Resume } from "@/db";
import { getTemplateDefaults } from "@/lib/template-defaults";
import { mmToPt } from "@/lib/template-utils";
import "@/lib/fonts"; // Auto-registers all fonts
import { getSectionHeadingWrapperStyles } from "@/lib/template-styles";

// Sub-components
import { TimelineHeader } from "@/components/templates/timeline/TimelineHeader";
import { TimelineSummary } from "@/components/templates/timeline/TimelineSummary";
import { TimelineExperience } from "@/components/templates/timeline/TimelineExperience";
import { TimelineEducation } from "@/components/templates/timeline/TimelineEducation";
import { TimelineSkills } from "@/components/templates/timeline/TimelineSkills";
// Re-using some classic ones for now if specific Timeline versions aren't critical immediately,
// but plan says to create custom ones. For generic lists (Awards, etc) effectively.
import { ClassicProjects } from "./classic/ClassicProjects";
import { ClassicCertificates } from "./classic/ClassicCertificates";
import { ClassicAwards } from "./classic/ClassicAwards";
import { ClassicReferences } from "./classic/ClassicReferences";
import { ClassicLanguages } from "./classic/ClassicLanguages";
import { ClassicInterests } from "./classic/ClassicInterests";
import { ClassicCustom } from "./classic/ClassicCustom";
import { ClassicPublications } from "./classic/ClassicPublications";

interface TimelineTemplateProps {
  resume: Resume;
}

export function TimelineTemplate({ resume }: TimelineTemplateProps) {
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

  const templateDefaults = getTemplateDefaults("timeline"); // Will fallback if timeline defaults not found, but we should probably add them to defaults lib eventually.
  // Ideally "timeline" is a valid ID. For now using defaults logic.

  const settings = { ...templateDefaults, ...resume.meta.layoutSettings };

  const fontSize = settings.fontSize || 10;
  const lineHeight = settings.lineHeight || 1.4;
  const marginH = mmToPt(settings.marginHorizontal || 20);
  const marginV = mmToPt(settings.marginVertical || 20);
  const sectionMargin = settings.sectionMargin || 12;

  // Colors
  const themeColor = resume.meta.themeColor || "#3b82f6"; // Default blue
  const colorTargets = settings.themeColorTarget || [];
  const getColor = (target: string, fallback: string = "#000000") => {
    return colorTargets.includes(target) ? themeColor : fallback;
  };

  // Fonts
  const baseFont = settings.fontFamily || "Roboto";
  const boldFont = settings.fontFamily || "Roboto"; // In real app, might want distinct bold font
  const italicFont = settings.fontFamily || "Roboto";

  const styles = StyleSheet.create({
    page: {
      paddingHorizontal: marginH,
      paddingVertical: marginV,
      fontFamily: baseFont,
      fontSize: fontSize,
      lineHeight: lineHeight,
      color: "#333",
      flexDirection: "column",
    },
    // Main column layout
    container: {
      flexDirection: "column",
      width: "100%",
    },
    section: {
      marginBottom: sectionMargin,
    },
    // Timeline specifics
    timelineContainer: {
      paddingLeft: 0, // Timeline usually needs specific padding
    },
  });

  const commonProps = {
    settings,
    styles: {} as any, // We'll pass specific styles to subs
    getColor,
    fontSize,
    baseFont,
    boldFont,
    italicFont,
    lineHeight,
    themeColor,
  };

  const SECTION_RENDERERS = {
    summary: () => (
      <TimelineSummary summary={basics.summary} {...commonProps} />
    ),
    work: () => <TimelineExperience work={work} {...commonProps} />,
    education: () => (
      <TimelineEducation education={education} {...commonProps} />
    ),
    skills: () => <TimelineSkills skills={skills} {...commonProps} />,
    // Reuse classic for others for now until dedicated ones needed
    projects: () => (
      <ClassicProjects projects={projects} {...commonProps} styles={styles} />
    ),
    certificates: () => (
      <ClassicCertificates
        certificates={certificates}
        {...commonProps}
        styles={styles}
      />
    ),
    awards: () => (
      <ClassicAwards awards={awards} {...commonProps} styles={styles} />
    ),
    publications: () => (
      <ClassicPublications
        publications={publications}
        {...commonProps}
        styles={styles}
      />
    ),
    languages: () => (
      <ClassicLanguages
        languages={languages}
        {...commonProps}
        styles={styles}
      />
    ),
    interests: () => (
      <ClassicInterests
        interests={interests}
        {...commonProps}
        styles={styles}
      />
    ),
    references: () => (
      <ClassicReferences
        references={references}
        {...commonProps}
        styles={styles}
      />
    ),
    custom: () => (
      <ClassicCustom custom={custom} {...commonProps} styles={styles} />
    ),
  };

  const order =
    settings.sectionOrder && settings.sectionOrder.length > 0
      ? settings.sectionOrder
      : [
          "summary",
          "awards", // Key achievements in photo often map here
          "work",
          "education",
          "skills",
          "projects",
          "certificates",
          "languages",
          "interests",
          "publications",
          "references",
          "custom",
        ];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <TimelineHeader basics={basics} {...commonProps} />

        <View style={styles.container}>
          {order.map((sectionId) => {
            const renderer =
              SECTION_RENDERERS[sectionId as keyof typeof SECTION_RENDERERS];
            return renderer ? (
              <View key={sectionId} style={styles.section}>
                {renderer()}
              </View>
            ) : null;
          })}
        </View>
      </Page>
    </Document>
  );
}

export async function generateTimelinePDF(resume: Resume): Promise<Blob> {
  const doc = <TimelineTemplate resume={resume} />;
  const blob = await pdf(doc).toBlob();
  return blob;
}
