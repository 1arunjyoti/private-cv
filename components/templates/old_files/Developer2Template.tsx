import {
  Document,
  Page,
  View,
  StyleSheet,
  pdf,
  Text,
} from "@react-pdf/renderer";
import type { Resume } from "@/db";
import { getTemplateDefaults } from "@/lib/template-defaults";
import { mmToPt } from "@/lib/template-utils";
import "@/lib/fonts";

// Sub-components
import { Developer2Header } from "./developer2/Developer2Header";
import { Developer2Section } from "./developer2/Developer2Section";
import { Developer2Education } from "./developer2/Developer2Education";
import { Developer2Skills } from "./developer2/Developer2Skills";
import { Developer2Projects } from "./developer2/Developer2Projects";
import { Developer2Certifications } from "./developer2/Developer2Certifications";
import { Developer2Interests } from "./developer2/Developer2Interests";

interface Developer2TemplateProps {
  resume: Resume;
}

export function Developer2Template({ resume }: Developer2TemplateProps) {
  const {
    basics,
    work, // Not used in this specific design requested (only Education, Skills, Projects, Certifications, Interests shown in image)
    // But usually we should support Experience. I'll add a generic section for it if it exists.
    education,
    skills,
    projects,
    certificates,
    interests,
  } = resume;

  const templateDefaults = getTemplateDefaults("developer2");
  const settings = { ...templateDefaults, ...resume.meta.layoutSettings };

  const marginH = mmToPt(settings.marginHorizontal || 10);
  const marginV = mmToPt(settings.marginVertical || 10);

  const themeColor = resume.meta.themeColor || "#74C365"; // Mantis Green default from image
  const backgroundColor = "#1C1C1C"; // Dark Grey
  const sidebarColor = "#1C1C1C"; // Same background effectively
  const fontFamily = "Helvetica"; // Clean sans-serif

  const styles = StyleSheet.create({
    page: {
      flexDirection: "row",
      backgroundColor: backgroundColor,
      fontFamily: fontFamily,
      color: "#FFFFFF",
      fontSize: 10,
    },
    sidebar: {
      width: "35%",
      paddingTop: marginV + 20,
      paddingBottom: marginV,
      paddingLeft: marginH,
      paddingRight: 20,
      backgroundColor: sidebarColor,
      height: "100%",
      position: "relative",
    },
    main: {
      width: "65%",
      paddingTop: marginV + 20,
      paddingBottom: marginV,
      paddingRight: marginH,
      paddingLeft: 10,
    },
    // Rotated Text
    rotatedTextContainer: {
      position: "absolute",
      bottom: 100,
      left: 20,
      transform: "rotate(-90deg)",
      transformOrigin: "0 0",
      width: 300, // Ensure enough width
    },
    rotatedText: {
      fontSize: 40,
      fontWeight: "bold",
      color: themeColor,
      opacity: 0.8,
    },
    rotatedSubText: {
      fontSize: 40,
      fontWeight: "bold",
      color: "#2d2d2d", // Darker part "Web" in image looks green?
      // Actually image says "Web" (Green) "Developer" (Green)
      // It seems like large decorative text.
    },
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Sidebar */}
        <View style={styles.sidebar}>
          <Developer2Header
            basics={basics}
            themeColor={themeColor}
            fontFamily={fontFamily}
          />

          {/* Decorative Vertical Text */}
          {/* "Web Developer" - user title or hardcoded? 
                 Image has "Web Developer" large. 
                 I'll use the user's label or title.
             */}
          <View
            style={{
              position: "absolute",
              bottom: 10,
              left: 60,
              transform: "rotate(-90deg)",
              width: 600,
            }}
          >
            <Text
              style={{ fontSize: 50, color: themeColor, fontWeight: "bold" }}
            >
              {basics.label || "Developer"}
            </Text>
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.main}>
          {/* Numbered Sections */}
          {/* Order is usually fixed in design but dynamic in content */}

          {/* 01 Education */}
          {education && education.length > 0 && (
            <Developer2Section
              number="01"
              title="Education"
              themeColor={themeColor}
              fontFamily={fontFamily}
            >
              <Developer2Education
                education={education}
                fontFamily={fontFamily}
              />
            </Developer2Section>
          )}

          {/* 02 Skills */}
          {skills && skills.length > 0 && (
            <Developer2Section
              number="02"
              title="Skills"
              themeColor={themeColor}
              fontFamily={fontFamily}
            >
              <Developer2Skills skills={skills} fontFamily={fontFamily} />
            </Developer2Section>
          )}

          {/* 03 Projects */}
          {projects && projects.length > 0 && (
            <Developer2Section
              number="03"
              title="Projects"
              themeColor={themeColor}
              fontFamily={fontFamily}
            >
              <Developer2Projects projects={projects} fontFamily={fontFamily} />
            </Developer2Section>
          )}

          {/* 04 Certifications */}
          {certificates && certificates.length > 0 && (
            <Developer2Section
              number="04"
              title="Certifications"
              themeColor={themeColor}
              fontFamily={fontFamily}
            >
              <Developer2Certifications
                certificates={certificates}
                fontFamily={fontFamily}
              />
            </Developer2Section>
          )}

          {/* 05 Interests */}
          {interests && interests.length > 0 && (
            <Developer2Section
              number="05"
              title="Interests"
              themeColor={themeColor}
              fontFamily={fontFamily}
            >
              <Developer2Interests
                interests={interests}
                fontFamily={fontFamily}
              />
            </Developer2Section>
          )}

          {/* Fallback for Experience if needed (User data might have it) */}
          {/* If work exists but isn't Education/Skills/etc, we should probably show it or the template is useless for professionals */}
          {work && work.length > 0 && (
            <Developer2Section
              number="06"
              title="Experience"
              themeColor={themeColor}
              fontFamily={fontFamily}
            >
              {work.map((job, index) => (
                <View key={index} style={{ marginBottom: 10 }}>
                  <Text
                    style={{ fontSize: 12, color: "#FFF", fontWeight: "bold" }}
                  >
                    {job.position}
                  </Text>
                  <Text style={{ fontSize: 10, color: "#CCC" }}>
                    {job.name}
                  </Text>
                  <Text style={{ fontSize: 9, color: "#AAA" }}>
                    {job.startDate} - {job.endDate || "Present"}
                  </Text>
                  <Text style={{ fontSize: 10, color: "#DDD", marginTop: 2 }}>
                    {job.summary}
                  </Text>
                </View>
              ))}
            </Developer2Section>
          )}
        </View>
      </Page>
    </Document>
  );
}

export async function generateDeveloper2PDF(resume: Resume): Promise<Blob> {
  const doc = <Developer2Template resume={resume} />;
  const blob = await pdf(doc).toBlob();
  return blob;
}
