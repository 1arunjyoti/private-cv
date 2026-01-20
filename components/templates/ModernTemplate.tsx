import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
  Link,
  Image,
} from "@react-pdf/renderer";
import type { Resume, LayoutSettings } from "@/db";
import { PDFRichText } from "./PDFRichText";
import { getTemplateDefaults } from "@/lib/template-defaults";
import { formatDate, PROFILE_IMAGE_SIZES } from "@/lib/template-utils";
import "@/lib/fonts";
import { getSectionHeadingWrapperStyles } from "@/lib/template-styles";

interface ModernTemplateProps {
  resume: Resume;
}

const createStyles = (
  themeColor: string,
  settings: LayoutSettings & {
    fontSize: number;
    lineHeight: number;
    sectionMargin: number;
    bulletMargin: number;
    fontFamily?: string;
  },
) =>
  StyleSheet.create({
    page: {
      padding: 30,
      fontFamily: settings.fontFamily || "Open Sans",
      fontSize: settings.fontSize,
      lineHeight: settings.lineHeight,
      color: "#333",
    },
    header: {
      alignItems: "center",
      marginBottom: settings.sectionMargin * 1.5,
    },
    name: {
      fontSize: 32,
      fontWeight: "bold",
      color: themeColor,
      marginBottom: 30,
      letterSpacing: -0.5,
    },
    title: {
      fontSize: settings.fontSize + 4,
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
      fontSize: settings.fontSize,
      color: "#555",
    },
    contactItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    section: {
      marginBottom: settings.sectionMargin,
    },
    sectionTitleWrapper: getSectionHeadingWrapperStyles(settings, themeColor),
    sectionTitle: {
      fontSize:
        settings.sectionHeadingSize === "L"
          ? settings.fontSize + 4
          : settings.fontSize + 2,
      fontWeight: settings.sectionHeadingBold ? "bold" : "normal",
      textTransform: settings.sectionHeadingCapitalization || "uppercase",
      color: "#1a1a1a",
    },
    summary: {
      fontSize: settings.fontSize + 1,
      color: "#444",
      textAlign: "justify",
    },
    // Work Experience
    entryContainer: {
      marginBottom: 10,
    },
    entryHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "baseline",
      marginBottom: 4,
    },
    entryTitle: {
      fontSize: settings.fontSize + 2,
      fontWeight: "bold",
      color: "#222",
    },
    entrySubtitle: {
      fontSize: settings.fontSize + 1,
      color: themeColor,
      fontWeight: "semibold",
    },
    entryDate: {
      fontSize: settings.fontSize,
      color: "#888",
      fontStyle: "italic",
    },
    bulletList: {
      marginTop: 4,
      paddingLeft: 0,
    },
    bulletItem: {
      flexDirection: "row",
      marginBottom: settings.bulletMargin,
    },
    bullet: {
      width: 15,
      fontSize: settings.fontSize + 4,
      lineHeight: 1,
      color: themeColor,
      textAlign: "center",
    },
    bulletText: {
      flex: 1,
      fontSize: settings.fontSize,
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
      fontSize: settings.fontSize,
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

  // Merge template defaults with resume settings
  const templateDefaults = getTemplateDefaults(resume.meta.templateId || 'modern');
  const settings = { ...templateDefaults, ...resume.meta.layoutSettings } as LayoutSettings & {
    fontSize: number;
    lineHeight: number;
    sectionMargin: number;
    bulletMargin: number;
    fontFamily?: string;
  };

  const styles = createStyles(themeColor, settings);
  const fontFamily = settings.fontFamily || "Open Sans";

  const renderProfileImage = () => {
    if (!basics.image || !settings.showProfileImage) return null;

    const size = PROFILE_IMAGE_SIZES[settings.profileImageSize || "M"];

    return (
      // eslint-disable-next-line jsx-a11y/alt-text
      <Image
        src={basics.image}
        style={{
          width: size,
          height: size,
          borderRadius: settings.profileImageShape === "square" ? 0 : size / 2,
          borderWidth: settings.profileImageBorder ? 1 : 0,
          borderColor: themeColor,
          objectFit: "cover",
          marginBottom: 10,
        }}
      />
    );
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          {renderProfileImage()}
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
            {((settings.summaryHeadingVisible ?? true) as boolean) && (
              <View style={styles.sectionTitleWrapper}>
                <Text style={styles.sectionTitle}>Summary</Text>
              </View>
            )}
            <PDFRichText
              text={basics.summary}
              style={styles.summary}
              fontSize={settings.fontSize + 1}
              fontFamily={fontFamily}
              boldFontFamily={fontFamily}
              italicFontFamily={fontFamily}
            />
          </View>
        )}

        {/* Work Experience */}
        {work.length > 0 && (
          <View style={styles.section}>
            {((settings.workHeadingVisible ?? true) as boolean) && (
              <View style={styles.sectionTitleWrapper}>
                <Text style={styles.sectionTitle}>Experience</Text>
              </View>
            )}
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
                  <PDFRichText
                    text={exp.summary}
                    style={{
                      ...styles.summary,
                      marginTop: 4,
                      marginBottom: 4,
                    }}
                    fontSize={settings.fontSize + 1}
                    fontFamily={fontFamily}
                    boldFontFamily={fontFamily}
                    italicFontFamily={fontFamily}
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
        )}

        {/* Skills - Modern Tag Style */}
        {skills.length > 0 && (
          <View style={styles.section}>
            {((settings.skillsHeadingVisible ?? true) as boolean) && (
              <Text style={styles.sectionTitle}>Skills & Expertise</Text>
            )}
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
              {((settings.educationHeadingVisible ?? true) as boolean) && (
                <Text style={styles.sectionTitle}>Education</Text>
              )}
              {education.map((edu) => (
                <View key={edu.id} style={styles.entryContainer}>
                  <Text style={styles.entryTitle}>{edu.institution}</Text>
                  <Text style={styles.entrySubtitle}>
                    {edu.studyType} {edu.area && `in ${edu.area}`}
                  </Text>
                  <Text style={styles.entryDate}>
                    {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                  </Text>
                  {edu.url && (
                    <Link
                      src={edu.url}
                      style={{
                        fontSize: 9,
                        color: themeColor,
                        marginBottom: 2,
                      }}
                    >
                      {edu.url.replace(/^https?:\/\//, "")}
                    </Link>
                  )}
                  {edu.summary && (
                    <PDFRichText
                      text={edu.summary}
                      style={{ ...styles.summary, fontSize: settings.fontSize }}
                      fontSize={settings.fontSize}
                      fontFamily={fontFamily}
                      boldFontFamily={fontFamily}
                      italicFontFamily={fontFamily}
                    />
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Projects */}
          {projects.length > 0 && (
            <View style={{ width: education.length > 0 ? "48%" : "100%" }}>
              {((settings.projectsHeadingVisible ?? true) as boolean) && (
                <Text style={styles.sectionTitle}>Projects</Text>
              )}
              {projects.map((proj) => (
                <View key={proj.id} style={styles.entryContainer}>
                  <Text style={styles.entryTitle}>{proj.name}</Text>
                  <PDFRichText
                    text={proj.description}
                    style={{ ...styles.summary, fontSize: 9 }}
                    fontSize={9}
                    fontFamily={fontFamily}
                    boldFontFamily={fontFamily}
                    italicFontFamily={fontFamily}
                  />
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
