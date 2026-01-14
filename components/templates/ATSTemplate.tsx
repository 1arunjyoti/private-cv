import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  pdf,
} from "@react-pdf/renderer";
import type { Resume } from "@/db";

// Register fonts (using default fonts for now)
Font.register({
  family: "Open Sans",
  fonts: [
    {
      src: "https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-regular.ttf",
      fontWeight: "normal",
    },
    {
      src: "https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-700.ttf",
      fontWeight: "bold",
    },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Open Sans",
    fontSize: 10,
    lineHeight: 1.5,
    color: "#333",
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: "#3b82f6",
    paddingBottom: 15,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#1a1a1a",
  },
  title: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
  },
  contactRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 15,
    fontSize: 9,
    color: "#555",
  },
  summary: {
    marginBottom: 20,
    fontSize: 10,
    lineHeight: 1.6,
    color: "#444",
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#1a1a1a",
    textTransform: "uppercase",
    letterSpacing: 1,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
    paddingBottom: 4,
  },
  entryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  entryTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  entrySubtitle: {
    fontSize: 10,
    color: "#666",
  },
  entryDate: {
    fontSize: 9,
    color: "#888",
  },
  entrySummary: {
    fontSize: 10,
    color: "#444",
    marginBottom: 4,
  },
  bulletList: {
    marginLeft: 10,
  },
  bulletItem: {
    flexDirection: "row",
    marginBottom: 2,
  },
  bullet: {
    width: 15,
    fontSize: 10,
  },
  bulletText: {
    flex: 1,
    fontSize: 9,
    color: "#444",
  },
  skillsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 20,
  },
  skillCategory: {
    marginBottom: 8,
  },
  skillName: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 2,
  },
  skillKeywords: {
    fontSize: 9,
    color: "#555",
  },
  projectEntry: {
    marginBottom: 10,
  },
  link: {
    fontSize: 9,
    color: "#3b82f6",
  },
});

interface ATSTemplateProps {
  resume: Resume;
}

export function ATSTemplate({ resume }: ATSTemplateProps) {
  const { basics, work, education, skills, projects } = resume;

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
          <View style={styles.contactRow}>
            {basics.email && <Text>{basics.email}</Text>}
            {basics.phone && <Text>{basics.phone}</Text>}
            {basics.location.city && (
              <Text>
                {basics.location.city}
                {basics.location.country ? `, ${basics.location.country}` : ""}
              </Text>
            )}
            {basics.url && <Text style={styles.link}>{basics.url}</Text>}
          </View>
        </View>

        {/* Summary */}
        {basics.summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Professional Summary</Text>
            <Text style={styles.summary}>{basics.summary}</Text>
          </View>
        )}

        {/* Work Experience */}
        {work.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Work Experience</Text>
            {work.map((exp) => (
              <View key={exp.id} style={{ marginBottom: 12 }}>
                <View style={styles.entryHeader}>
                  <View>
                    <Text style={styles.entryTitle}>{exp.position}</Text>
                    <Text style={styles.entrySubtitle}>{exp.company}</Text>
                  </View>
                  <Text style={styles.entryDate}>
                    {formatDate(exp.startDate)} - {formatDate(exp.endDate)}
                  </Text>
                </View>
                {exp.summary && (
                  <Text style={styles.entrySummary}>{exp.summary}</Text>
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

        {/* Education */}
        {education.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            {education.map((edu) => (
              <View key={edu.id} style={{ marginBottom: 10 }}>
                <View style={styles.entryHeader}>
                  <View>
                    <Text style={styles.entryTitle}>
                      {edu.studyType} {edu.area && `in ${edu.area}`}
                    </Text>
                    <Text style={styles.entrySubtitle}>{edu.institution}</Text>
                  </View>
                  <Text style={styles.entryDate}>
                    {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                  </Text>
                </View>
                {edu.score && (
                  <Text style={styles.entrySummary}>GPA: {edu.score}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills</Text>
            <View style={styles.skillsGrid}>
              {skills.map((skill) => (
                <View key={skill.id} style={styles.skillCategory}>
                  <Text style={styles.skillName}>{skill.name}</Text>
                  <Text style={styles.skillKeywords}>
                    {skill.keywords.join(", ")}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Projects</Text>
            {projects.map((proj) => (
              <View key={proj.id} style={styles.projectEntry}>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryTitle}>{proj.name}</Text>
                  {proj.url && <Text style={styles.link}>{proj.url}</Text>}
                </View>
                {proj.description && (
                  <Text style={styles.entrySummary}>{proj.description}</Text>
                )}
                {proj.keywords.length > 0 && (
                  <Text style={styles.skillKeywords}>
                    Technologies: {proj.keywords.join(", ")}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
}

// Export PDF generation function
export async function generatePDF(resume: Resume): Promise<Blob> {
  const doc = <ATSTemplate resume={resume} />;
  const blob = await pdf(doc).toBlob();
  return blob;
}
