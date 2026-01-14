import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
} from "@react-pdf/renderer";
import type { Resume } from "@/db";

// Using standard serif font (Times-Roman) which doesn't need external registration
// or we can register a specific one if needed. Reference: https://react-pdf.org/fonts

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Times-Roman", // Standard serif font
    fontSize: 10,
    lineHeight: 1.5,
    color: "#000", // Strictly black for professional look
  },
  header: {
    marginBottom: 20,
    textAlign: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    paddingBottom: 10,
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 12,
    marginBottom: 6,
    fontStyle: "italic",
  },
  contactRow: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 12,
    fontSize: 9,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 8,
    textTransform: "uppercase",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingBottom: 2,
    letterSpacing: 0.5,
  },
  entryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  entryTitle: {
    fontSize: 11,
    fontWeight: "bold",
  },
  entrySubtitle: {
    fontSize: 10,
    fontStyle: "italic",
  },
  entryDate: {
    fontSize: 10,
  },
  entrySummary: {
    fontSize: 10,
    marginTop: 2,
    marginBottom: 2,
  },
  bulletList: {
    paddingLeft: 10,
  },
  bulletItem: {
    flexDirection: "row",
    marginBottom: 1,
  },
  bullet: {
    width: 10,
    fontSize: 10,
  },
  bulletText: {
    flex: 1,
    fontSize: 10,
  },
  skillsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
});

interface ProfessionalTemplateProps {
  resume: Resume;
}

export function ProfessionalTemplate({ resume }: ProfessionalTemplateProps) {
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
            {basics.phone && <Text>• {basics.phone}</Text>}
            {basics.location.city && (
              <Text>
                • {basics.location.city}
                {basics.location.country ? `, ${basics.location.country}` : ""}
              </Text>
            )}
            {basics.url && <Text>• {basics.url}</Text>}
          </View>
        </View>

        {/* Summary */}
        {basics.summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Professional Summary</Text>
            <Text style={{ fontSize: 10 }}>{basics.summary}</Text>
          </View>
        )}

        {/* Work Experience */}
        {work.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Experience</Text>
            {work.map((exp) => (
              <View key={exp.id} style={{ marginBottom: 10 }}>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryTitle}>{exp.company}</Text>
                  <Text style={styles.entryDate}>
                    {formatDate(exp.startDate)} - {formatDate(exp.endDate)}
                  </Text>
                </View>
                <Text style={styles.entrySubtitle}>{exp.position}</Text>

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
              <View key={edu.id} style={{ marginBottom: 6 }}>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryTitle}>{edu.institution}</Text>
                  <Text style={styles.entryDate}>
                    {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                  </Text>
                </View>
                <Text style={styles.entrySubtitle}>
                  {edu.studyType} {edu.area && `in ${edu.area}`}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills</Text>
            <View>
              {skills.map((skill) => (
                <Text key={skill.id} style={{ fontSize: 10, marginBottom: 2 }}>
                  <Text style={{ fontWeight: "bold" }}>{skill.name}: </Text>
                  {skill.keywords.join(", ")}
                </Text>
              ))}
            </View>
          </View>
        )}
        {/* Projects */}
        {projects.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Key Projects</Text>
            {projects.map((proj) => (
              <View key={proj.id} style={{ marginBottom: 6 }}>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryTitle}>{proj.name}</Text>
                  {proj.url && (
                    <Text style={{ fontSize: 9, color: "#444" }}>
                      {proj.url}
                    </Text>
                  )}
                </View>
                {proj.description && (
                  <Text style={styles.entrySummary}>{proj.description}</Text>
                )}
                {proj.keywords.length > 0 && (
                  <Text
                    style={{ fontSize: 9, fontStyle: "italic", marginTop: 2 }}
                  >
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
export async function generateProfessionalPDF(resume: Resume): Promise<Blob> {
  const doc = <ProfessionalTemplate resume={resume} />;
  const blob = await pdf(doc).toBlob();
  return blob;
}
