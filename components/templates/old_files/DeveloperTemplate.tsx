import {
  Document,
  Page,
  View,
  StyleSheet,
  pdf,
  Font,
} from "@react-pdf/renderer";
import type { Resume } from "@/db";
import { getTemplateDefaults } from "@/lib/template-defaults";
import { mmToPt } from "@/lib/template-utils";
import "@/lib/fonts";

// Sub-components
import { DeveloperHeader } from "./developer/DeveloperHeader";
import { DeveloperSummary } from "./developer/DeveloperSummary";
import { DeveloperSkills } from "./developer/DeveloperSkills";
import { DeveloperExperience } from "./developer/DeveloperExperience";
import { DeveloperEducation } from "./developer/DeveloperEducation";
import { DeveloperProjects } from "./developer/DeveloperProjects";
import { DeveloperCertifications } from "./developer/DeveloperCertifications";
import { DeveloperLanguages } from "./developer/DeveloperLanguages";

// Reusing classic for minor sections if needed, or creating generic simple ones
// For now, I'll allow reusing Classic for less critical sections if they exist,
// OR simply render them as comments.
// Let's implement a Generic "Comment Block" for others.

interface DeveloperTemplateProps {
  resume: Resume;
}

export function DeveloperTemplate({ resume }: DeveloperTemplateProps) {
  const { basics, work, education, skills, projects, certificates, languages } =
    resume;

  const templateDefaults = getTemplateDefaults("developer"); // Will fallback to default if not found
  const settings = { ...templateDefaults, ...resume.meta.layoutSettings };

  // Layout Defaults
  // Developer theme is fixed width usually, but let's allow margin control
  const marginH = mmToPt(settings.marginHorizontal || 10);
  const marginV = mmToPt(settings.marginVertical || 10);

  const themeColor = resume.meta.themeColor || "#38b6ff"; // Default to a blue-ish if not set, or maybe user sets it.

  // Using Courier for code aesthetic
  const baseFont = "Courier";

  const styles = StyleSheet.create({
    page: {
      flexDirection: "row",
      backgroundColor: "#1E1E1E", // VS Code Dark
      fontFamily: baseFont,
      color: "#D4D4D4", // Default text
      fontSize: 10,
    },
    // Left Main
    leftColumn: {
      width: "60%",
      paddingTop: marginV,
      paddingBottom: marginV,
      paddingLeft: marginH,
      paddingRight: 10,
    },
    // Right Sidebar
    rightColumn: {
      width: "40%",
      paddingTop: marginV,
      paddingBottom: marginV,
      paddingLeft: 10,
      paddingRight: marginH,
    },
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.leftColumn}>
          <DeveloperHeader
            basics={basics}
            settings={settings}
            themeColor={themeColor}
          />

          {/* Main sections usually Experience, Projects */}
          {work && work.length > 0 && (
            <DeveloperExperience work={work} themeColor={themeColor} />
          )}
          {projects && projects.length > 0 && (
            <DeveloperProjects projects={projects} themeColor={themeColor} />
          )}
        </View>

        <View style={styles.rightColumn}>
          {/* Sidebar sections: Summary, Skills, Education */}
          {basics.summary && (
            <DeveloperSummary
              summary={basics.summary}
              themeColor={themeColor}
            />
          )}
          {skills && skills.length > 0 && (
            <DeveloperSkills skills={skills} themeColor={themeColor} />
          )}
          {education && education.length > 0 && (
            <DeveloperEducation education={education} themeColor={themeColor} />
          )}
          {certificates && certificates.length > 0 && (
            <DeveloperCertifications
              certificates={certificates}
              themeColor={themeColor}
            />
          )}
          {languages && languages.length > 0 && (
            <DeveloperLanguages languages={languages} themeColor={themeColor} />
          )}

          {/* Placeholder for others */}
        </View>
      </Page>
    </Document>
  );
}

export async function generateDeveloperPDF(resume: Resume): Promise<Blob> {
  const doc = <DeveloperTemplate resume={resume} />;
  const blob = await pdf(doc).toBlob();
  return blob;
}
