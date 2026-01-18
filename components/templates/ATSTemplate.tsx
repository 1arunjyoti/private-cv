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
import { MarkdownText } from "./MarkdownText";

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

// Helper to create dynamic styles
const createStyles = (
  themeColor: string,
  settings: {
    fontSize: number;
    lineHeight: number;
    sectionMargin: number;
    bulletMargin: number;
    marginHorizontal?: number;
    marginVertical?: number;
  },
) =>
  StyleSheet.create({
    page: {
      paddingHorizontal: (settings.marginHorizontal || 15) + "mm",
      paddingVertical: (settings.marginVertical || 15) + "mm",
      fontFamily: "Open Sans",
      fontSize: settings.fontSize,
      lineHeight: settings.lineHeight,
      color: "#333",
    },
    header: {
      marginBottom: settings.sectionMargin * 1.5,
      borderBottomWidth: 2,
      borderBottomColor: themeColor,
      paddingBottom: 15,
    },
    name: {
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: 22,
      color: "#1a1a1a",
    },
    title: {
      fontSize: settings.fontSize + 3,
      color: "#666",
      marginBottom: 8,
    },
    contactRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 15,
      fontSize: settings.fontSize,
      color: "#555",
    },
    summary: {
      marginBottom: settings.sectionMargin,
      fontSize: settings.fontSize,
      lineHeight: settings.lineHeight,
      color: "#444",
    },
    section: {
      marginBottom: settings.sectionMargin,
      lineHeight: settings.lineHeight,
    },
    sectionTitle: {
      fontSize: settings.fontSize + 1,
      fontWeight: "bold",
      marginBottom: 6,
      color: "#1a1a1a",
      textTransform: "uppercase",
      letterSpacing: 0.8,
      borderBottomWidth: 1,
      borderBottomColor: "#e5e5e5",
      paddingBottom: 3,
    },
    entryHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 4,
    },
    entryTitle: {
      fontSize: settings.fontSize + 2,
      fontWeight: "bold",
      color: "#1a1a1a",
    },
    entrySubtitle: {
      fontSize: settings.fontSize + 1,
      color: "#666",
    },
    entryDate: {
      fontSize: settings.fontSize,
      color: "#888",
    },
    entrySummary: {
      fontSize: settings.fontSize,
      color: "#444",
      marginBottom: 4,
    },
    bulletList: {
      marginLeft: 10,
    },
    bulletItem: {
      flexDirection: "row",
      marginBottom: settings.bulletMargin,
    },
    bullet: {
      width: 15,
      fontSize: settings.fontSize,
    },
    bulletText: {
      flex: 1,
      fontSize: settings.fontSize,
      color: "#444",
      lineHeight: settings.lineHeight,
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
      fontSize: settings.fontSize + 1,
      fontWeight: "bold",
      marginBottom: 2,
    },
    skillKeywords: {
      fontSize: settings.fontSize,
      color: "#555",
    },
    projectEntry: {
      marginBottom: 10,
    },
    link: {
      fontSize: settings.fontSize,
      color: "#3b82f6",
    },
    experienceItem: {
      marginBottom: 10,
    },
    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 2,
    },
    companyName: {
      fontSize: settings.fontSize + 1,
      fontWeight: "bold",
      color: "#1a1a1a",
    },
    date: {
      fontSize: settings.fontSize,
      color: "#666",
    },
    jobTitle: {
      fontSize: settings.fontSize,
      fontStyle: "italic",
      marginBottom: 2,
      color: "#444",
    },
  });

interface ATSTemplateProps {
  resume: Resume;
  themeColor?: string;
  layoutSettings?: {
    fontSize?: number;
    lineHeight?: number;
    sectionMargin?: number;
    bulletMargin?: number;
    marginHorizontal?: number;
    marginVertical?: number;
  };
}

export function ATSTemplate({ resume }: ATSTemplateProps) {
  const { basics, work, education, skills, projects } = resume;

  // Default settings if not present
  const settings = resume.meta.layoutSettings || {
    fontSize: 8.5,
    lineHeight: 1.2,
    sectionMargin: 8,
    bulletMargin: 2,
    useBullets: true,
    columnCount: 1,
    headerPosition: "top",
    leftColumnWidth: 30,
    sectionOrder: [
      "work",
      "education",
      "skills",
      "projects",
      "certificates",
      "languages",
      "interests",
      "publications",
      "awards",
      "references",
      "custom",
    ],
    marginHorizontal: 15,
    marginVertical: 15,
  };

  const themeColor = resume.meta.themeColor || "#3b82f6";
  const styles = createStyles(themeColor, settings);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "Present";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  const renderSection = (id: string) => {
    switch (id) {
      case "work":
        return work.length > 0 ? (
          <View key="work" style={styles.section}>
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
                  <MarkdownText
                    text={exp.summary}
                    style={styles.entrySummary}
                  />
                )}
                {exp.highlights.length > 0 && (
                  <View style={styles.bulletList}>
                    {exp.highlights.map((highlight, i) => (
                      <View key={i} style={styles.bulletItem}>
                        {settings.useBullets && (
                          <Text style={styles.bullet}>•</Text>
                        )}
                        <Text style={styles.bulletText}>{highlight}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        ) : null;

      case "education":
        return education.length > 0 ? (
          <View key="education" style={styles.section}>
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
                  <Text style={styles.entrySummary}>
                    {edu.score.includes(":") ? edu.score : `GPA: ${edu.score}`}
                  </Text>
                )}
                {edu.summary && (
                  <MarkdownText
                    text={edu.summary}
                    style={styles.entrySummary}
                  />
                )}
              </View>
            ))}
          </View>
        ) : null;

      case "skills":
        return skills.length > 0 ? (
          <View key="skills" style={styles.section}>
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
        ) : null;

      case "projects":
        return projects.length > 0 ? (
          <View key="projects" style={styles.section}>
            <Text style={styles.sectionTitle}>Projects</Text>
            {projects.map((proj) => (
              <View key={proj.id} style={styles.projectEntry}>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryTitle}>{proj.name}</Text>
                  {proj.url && <Text style={styles.link}>{proj.url}</Text>}
                </View>
                {proj.description && (
                  <MarkdownText
                    text={proj.description}
                    style={styles.entrySummary}
                  />
                )}
                {proj.keywords.length > 0 && (
                  <Text style={styles.skillKeywords}>
                    Technologies: {proj.keywords.join(", ")}
                  </Text>
                )}
              </View>
            ))}
          </View>
        ) : null;

      case "certificates":
        return resume.certificates.length > 0 ? (
          <View key="certificates" style={styles.section}>
            <Text style={styles.sectionTitle}>Certificates</Text>
            {resume.certificates.map((cert) => (
              <View key={cert.id} style={styles.experienceItem}>
                <View style={styles.headerRow}>
                  <Text style={styles.companyName}>{cert.name}</Text>
                  <Text style={styles.date}>{formatDate(cert.date)}</Text>
                </View>
                <Text style={styles.jobTitle}>{cert.issuer}</Text>
                {cert.url && (
                  <Link src={cert.url} style={styles.link}>
                    {cert.url}
                  </Link>
                )}
                <MarkdownText text={cert.summary} style={styles.summary} />
              </View>
            ))}
          </View>
        ) : null;

      case "languages":
        return resume.languages.length > 0 ? (
          <View key="languages" style={styles.section}>
            <Text style={styles.sectionTitle}>Languages</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
              {resume.languages.map((lang, index) => (
                <Text key={index} style={styles.summary}>
                  <Text style={{ fontWeight: "bold" }}>{lang.language}</Text>
                  {lang.fluency ? ` - ${lang.fluency}` : ""}
                </Text>
              ))}
            </View>
          </View>
        ) : null;

      case "interests":
        return resume.interests.length > 0 ? (
          <View key="interests" style={styles.section}>
            <Text style={styles.sectionTitle}>Interests</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
              {resume.interests.map((interest, index) => (
                <Text key={index} style={styles.summary}>
                  <Text style={{ fontWeight: "bold" }}>{interest.name}</Text>
                  {interest.keywords.length > 0
                    ? `: ${interest.keywords.join(", ")}`
                    : ""}
                </Text>
              ))}
            </View>
          </View>
        ) : null;

      case "publications":
        return resume.publications.length > 0 ? (
          <View key="publications" style={styles.section}>
            <Text style={styles.sectionTitle}>Publications</Text>
            {resume.publications.map((pub) => (
              <View key={pub.id} style={styles.experienceItem}>
                <View style={styles.headerRow}>
                  <Text style={styles.companyName}>{pub.name}</Text>
                  <Text style={styles.date}>{formatDate(pub.releaseDate)}</Text>
                </View>
                <Text style={styles.jobTitle}>{pub.publisher}</Text>
                {pub.url && (
                  <Link src={pub.url} style={styles.link}>
                    {pub.url}
                  </Link>
                )}
                <MarkdownText text={pub.summary} style={styles.summary} />
              </View>
            ))}
          </View>
        ) : null;

      case "awards":
        return resume.awards.length > 0 ? (
          <View key="awards" style={styles.section}>
            <Text style={styles.sectionTitle}>Awards</Text>
            {resume.awards.map((award) => (
              <View key={award.id} style={styles.experienceItem}>
                <View style={styles.headerRow}>
                  <Text style={styles.companyName}>{award.title}</Text>
                  <Text style={styles.date}>{formatDate(award.date)}</Text>
                </View>
                <Text style={styles.jobTitle}>{award.awarder}</Text>
                <MarkdownText text={award.summary} style={styles.summary} />
              </View>
            ))}
          </View>
        ) : null;

      case "references":
        return resume.references.length > 0 ? (
          <View key="references" style={styles.section}>
            <Text style={styles.sectionTitle}>References</Text>
            {resume.references.map((ref) => (
              <View key={ref.id} style={styles.experienceItem}>
                <Text style={styles.companyName}>{ref.name}</Text>
                {ref.position && (
                  <Text style={styles.jobTitle}>{ref.position}</Text>
                )}
                <MarkdownText text={ref.reference} style={styles.summary} />
              </View>
            ))}
          </View>
        ) : null;

      case "custom":
        return resume.custom.length > 0 ? (
          <View key="custom">
            {resume.custom.map((section) => (
              <View key={section.id} style={styles.section}>
                <Text style={styles.sectionTitle}>{section.name}</Text>
                {section.items.map((item) => (
                  <View key={item.id} style={styles.experienceItem}>
                    <View style={styles.headerRow}>
                      <Text style={styles.companyName}>{item.name}</Text>
                      <Text style={styles.date}>{item.date}</Text>
                    </View>
                    {item.description && (
                      <Text style={styles.jobTitle}>{item.description}</Text>
                    )}
                    {item.url && (
                      <Link src={item.url} style={styles.link}>
                        {item.url}
                      </Link>
                    )}
                    <MarkdownText text={item.summary} style={styles.summary} />
                  </View>
                ))}
              </View>
            ))}
          </View>
        ) : null;

      default:
        return null;
    }
  };

  const orderedSections = settings.sectionOrder || [
    "work",
    "education",
    "skills",
    "projects",
    "certificates",
    "languages",
    "interests",
    "publications",
    "awards",
    "references",
    "custom",
  ];

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

        {/* Summary (Fixed position for now) */}
        {basics.summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Professional Summary</Text>
            <Text style={styles.summary}>{basics.summary}</Text>
          </View>
        )}

        {/* Dynamic Sections */}
        {orderedSections.map((sectionId) => renderSection(sectionId))}
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
