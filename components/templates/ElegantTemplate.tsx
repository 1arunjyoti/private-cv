import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  pdf,
  Link,
} from "@react-pdf/renderer";
import type { Resume } from "@/db";

// Register fonts
Font.register({
  family: "Open Sans",
  fonts: [
    {
      src: "https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-regular.ttf",
      fontWeight: "normal",
    },
    {
      src: "https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-600.ttf",
      fontWeight: "semibold",
    },
    {
      src: "https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-700.ttf",
      fontWeight: "bold",
    },
    {
      src: "https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-italic.ttf",
      fontStyle: "italic",
    },
  ],
});

interface ElegantTemplateProps {
  resume: Resume;
}

const createStyles = (themeColor: string) =>
  StyleSheet.create({
    page: {
      padding: 0, // Zero padding for full-width header
      fontFamily: "Open Sans",
      fontSize: 9,
      lineHeight: 1.5,
      color: "#333",
      paddingBottom: 40,
    },
    header: {
      backgroundColor: themeColor,
      padding: 40,
      paddingBottom: 30,
      color: "#ffffff",
    },
    headerContent: {
      maxWidth: "90%",
      marginHorizontal: "auto",
    },
    name: {
      fontSize: 28,
      fontWeight: "bold",
      marginBottom: 6,
      letterSpacing: 0.5,
      color: "#ffffff",
    },
    title: {
      fontSize: 13,
      marginBottom: 15,
      opacity: 0.9,
      textTransform: "uppercase",
      letterSpacing: 1.5,
      color: "#ffffff",
    },
    contactRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 20,
      fontSize: 9,
      opacity: 0.9,
      marginTop: 10,
    },
    contactItem: {
      color: "#ffffff",
    },
    body: {
      padding: 40,
      paddingTop: 30,
    },
    section: {
      marginBottom: 25,
    },
    sectionTitle: {
      fontSize: 11,
      fontWeight: "bold",
      color: themeColor,
      textTransform: "uppercase",
      letterSpacing: 1.2,
      marginBottom: 12,
      borderBottomWidth: 1.5,
      borderBottomColor: "#f0f0f0",
      paddingBottom: 6,
    },
    // Summary
    summary: {
      fontSize: 10,
      lineHeight: 1.6,
      marginBottom: 10,
      color: "#444",
    },
    // Work
    entryContainer: {
      marginBottom: 18,
    },
    entryHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "baseline",
      marginBottom: 4,
    },
    entryTitle: {
      fontSize: 11,
      fontWeight: "bold",
      color: "#222",
    },
    entryCompanyName: {
      fontSize: 10,
      fontWeight: "semibold",
      color: "#555",
    },
    entryDate: {
      fontSize: 9,
      color: "#888",
    },
    bulletList: {
      marginTop: 6,
      paddingLeft: 4,
    },
    bulletItem: {
      flexDirection: "row",
      marginBottom: 3,
    },
    bullet: {
      width: 12,
      fontSize: 12,
      lineHeight: 1,
      color: themeColor,
    },
    bulletText: {
      flex: 1,
      fontSize: 9.5,
      color: "#444",
      lineHeight: 1.5,
    },
    // Skills
    skillsList: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
    },
    skillItem: {
      backgroundColor: "#f8f9fa",
      paddingVertical: 4,
      paddingHorizontal: 10,
      borderRadius: 2,
    },
    skillName: {
      fontSize: 9,
      fontWeight: "bold",
      color: "#333",
    },
    // Grid
    row: {
      flexDirection: "row",
      gap: 30,
    },
    col: {
      flex: 1,
    },
  });

export function ElegantTemplate({ resume }: ElegantTemplateProps) {
  const { basics, work, education, skills, projects } = resume;
  const themeColor = resume.meta.themeColor || "#2c3e50"; // Default to dark blue/slate
  const styles = createStyles(themeColor);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "Present";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Banner Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.name}>{basics.name || "Your Name"}</Text>
            {basics.label && <Text style={styles.title}>{basics.label}</Text>}

            <View style={styles.contactRow}>
              {basics.email && (
                <Text style={styles.contactItem}>{basics.email}</Text>
              )}
              {basics.phone && (
                <Text style={styles.contactItem}>• {basics.phone}</Text>
              )}
              {basics.location.city && (
                <Text style={styles.contactItem}>
                  • {basics.location.city}
                  {basics.location.country
                    ? `, ${basics.location.country}`
                    : ""}
                </Text>
              )}
              {basics.url && (
                <Link src={basics.url} style={styles.contactItem}>
                  • Portfolio
                </Link>
              )}
            </View>
          </View>
        </View>

        <View style={styles.body}>
          {/* Summary */}
          {basics.summary && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Profile</Text>
              <Text style={styles.summary}>{basics.summary}</Text>
            </View>
          )}

          {/* Work & Projects split if needed, but linear is often cleaner for "Elegant" */}
          {/* Work Experience */}
          {work.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Experience</Text>
              {work.map((exp) => (
                <View key={exp.id} style={styles.entryContainer}>
                  <View style={styles.entryHeader}>
                    <View>
                      <Text style={styles.entryTitle}>{exp.position}</Text>
                      <Text style={styles.entryCompanyName}>{exp.company}</Text>
                    </View>
                    <View style={{ alignItems: "flex-end" }}>
                      <Text style={styles.entryDate}>
                        {formatDate(exp.startDate)} - {formatDate(exp.endDate)}
                      </Text>
                    </View>
                  </View>

                  {exp.summary && (
                    <Text
                      style={{
                        ...styles.summary,
                        marginTop: 4,
                        fontStyle: "italic",
                        fontSize: 9,
                      }}
                    >
                      {exp.summary}
                    </Text>
                  )}

                  {exp.highlights.length > 0 && (
                    <View style={styles.bulletList}>
                      {exp.highlights.map((highlight, i) => (
                        <View key={i} style={styles.bulletItem}>
                          <Text style={styles.bullet}>•</Text>
                          <Text style={styles.bulletText}>{highlight}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Education and Skills in a row? No, keep it clean stacked for readability */}
          {education.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Education</Text>
              {education.map((edu) => (
                <View key={edu.id} style={styles.entryContainer}>
                  <View style={styles.entryHeader}>
                    <View>
                      <Text style={styles.entryTitle}>{edu.institution}</Text>
                      <Text style={styles.entryCompanyName}>
                        {edu.studyType} {edu.area && `in ${edu.area}`}
                      </Text>
                    </View>
                    <Text style={styles.entryDate}>
                      {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                    </Text>
                  </View>
                  {edu.score && (
                    <Text style={[styles.summary, { fontSize: 9 }]}>
                      Grade: {edu.score}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Skills */}
          {skills.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Skills</Text>
              <View style={styles.skillsList}>
                {skills.map((skill) => (
                  <View key={skill.id} style={styles.skillItem}>
                    <Text style={styles.skillName}>
                      {skill.name}{" "}
                      {skill.keywords.length > 0 &&
                        `• ${skill.keywords.slice(0, 3).join(", ")}`}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Projects */}
          {projects.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Key Projects</Text>
              {projects.map((proj) => (
                <View key={proj.id} style={styles.entryContainer}>
                  <View style={styles.entryHeader}>
                    <Text style={styles.entryTitle}>{proj.name}</Text>
                    {proj.url && (
                      <Link
                        src={proj.url}
                        style={{ fontSize: 9, color: themeColor }}
                      >
                        View Link
                      </Link>
                    )}
                  </View>
                  {proj.description && (
                    <Text style={styles.summary}>{proj.description}</Text>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      </Page>
    </Document>
  );
}

// Export PDF generation function
export async function generateElegantPDF(resume: Resume): Promise<Blob> {
  const doc = <ElegantTemplate resume={resume} />;
  const blob = await pdf(doc).toBlob();
  return blob;
}
