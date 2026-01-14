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

interface ModernTemplateProps {
  resume: Resume;
}

const createStyles = (themeColor: string) =>
  StyleSheet.create({
    page: {
      padding: 40,
      fontFamily: "Open Sans",
      fontSize: 9,
      lineHeight: 1.6,
      color: "#333",
    },
    header: {
      alignItems: "center",
      marginBottom: 30,
    },
    name: {
      fontSize: 32,
      fontWeight: "bold",
      color: themeColor,
      marginBottom: 4,
      letterSpacing: -0.5,
    },
    title: {
      fontSize: 14,
      color: "#666",
      marginBottom: 12,
      fontWeight: "semibold",
      textTransform: "uppercase",
      letterSpacing: 1,
    },
    contactInfo: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "center",
      gap: 16,
      fontSize: 9,
      color: "#555",
    },
    contactItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: "bold",
      color: "#1a1a1a",
      marginBottom: 12,
      textTransform: "uppercase",
      letterSpacing: 1.2,
      borderBottomWidth: 2,
      borderBottomColor: themeColor,
      paddingBottom: 4,
    },
    summary: {
      fontSize: 10,
      color: "#444",
      textAlign: "justify",
    },
    // Work Experience
    entryContainer: {
      marginBottom: 16,
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
    entrySubtitle: {
      fontSize: 10,
      color: themeColor,
      fontWeight: "semibold",
    },
    entryDate: {
      fontSize: 9,
      color: "#888",
      fontStyle: "italic",
    },
    bulletList: {
      marginTop: 4,
      paddingLeft: 0,
    },
    bulletItem: {
      flexDirection: "row",
      marginBottom: 3,
    },
    bullet: {
      width: 15,
      fontSize: 14,
      lineHeight: 1,
      color: themeColor,
      textAlign: "center",
    },
    bulletText: {
      flex: 1,
      fontSize: 9,
      color: "#444",
    },
    // Skills
    skillsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    skillTag: {
      backgroundColor: "#f3f4f6",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
      fontSize: 9,
      color: "#374151",
    },
    // Grid for Edu & Projects if needed, or keeping standard list
    gridTwo: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
    },
    gridItem: {
      width: "48%",
      marginBottom: 12,
    },
  });

export function ModernTemplate({ resume }: ModernTemplateProps) {
  const { basics, work, education, skills, projects } = resume;
  const themeColor = resume.meta.themeColor || "#10b981"; // Default to emerald green for modern
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
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>{basics.name || "Your Name"}</Text>
          {basics.label && <Text style={styles.title}>{basics.label}</Text>}

          <View style={styles.contactInfo}>
            {basics.email && <Text>{basics.email}</Text>}
            {basics.phone && <Text>{basics.phone}</Text>}
            {basics.location.city && (
              <Text>
                {basics.location.city}
                {basics.location.country ? `, ${basics.location.country}` : ""}
              </Text>
            )}
            {basics.url && (
              <Link src={basics.url} style={{ color: themeColor }}>
                Portfolio
              </Link>
            )}
          </View>
        </View>

        {/* Summary */}
        {basics.summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Summary</Text>
            <Text style={styles.summary}>{basics.summary}</Text>
          </View>
        )}

        {/* Work Experience */}
        {work.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Experience</Text>
            {work.map((exp) => (
              <View key={exp.id} style={styles.entryContainer}>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryTitle}>{exp.position}</Text>
                  <Text style={styles.entryDate}>
                    {formatDate(exp.startDate)} - {formatDate(exp.endDate)}
                  </Text>
                </View>
                <Text style={styles.entrySubtitle}>{exp.company}</Text>

                {exp.summary && (
                  <Text
                    style={{ ...styles.summary, marginTop: 4, marginBottom: 4 }}
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

        {/* Skills - Modern Tag Style */}
        {skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills & Expertise</Text>
            <View style={styles.skillsContainer}>
              {skills.flatMap((s) => [
                <Text
                  key={s.id}
                  style={[
                    styles.skillTag,
                    {
                      fontWeight: "bold",
                      backgroundColor: `${themeColor}20`,
                      color: themeColor,
                    },
                  ]}
                >
                  {s.name}
                </Text>,
                ...s.keywords.map((k, i) => (
                  <Text key={`${s.id}-${i}`} style={styles.skillTag}>
                    {k}
                  </Text>
                )),
              ])}
            </View>
          </View>
        )}

        <View style={styles.gridTwo}>
          {/* Education */}
          {education.length > 0 && (
            <View style={{ width: projects.length > 0 ? "48%" : "100%" }}>
              <Text style={styles.sectionTitle}>Education</Text>
              {education.map((edu) => (
                <View key={edu.id} style={styles.entryContainer}>
                  <Text style={styles.entryTitle}>{edu.institution}</Text>
                  <Text style={styles.entrySubtitle}>
                    {edu.studyType} {edu.area && `in ${edu.area}`}
                  </Text>
                  <Text style={styles.entryDate}>
                    {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Projects */}
          {projects.length > 0 && (
            <View style={{ width: education.length > 0 ? "48%" : "100%" }}>
              <Text style={styles.sectionTitle}>Projects</Text>
              {projects.map((proj) => (
                <View key={proj.id} style={styles.entryContainer}>
                  <Text style={styles.entryTitle}>{proj.name}</Text>
                  <Text style={[styles.summary, { fontSize: 9 }]}>
                    {proj.description}
                  </Text>
                  {proj.url && (
                    <Link
                      src={proj.url}
                      style={{ fontSize: 9, color: themeColor }}
                    >
                      View Project
                    </Link>
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
export async function generateModernPDF(resume: Resume): Promise<Blob> {
  const doc = <ModernTemplate resume={resume} />;
  const blob = await pdf(doc).toBlob();
  return blob;
}
