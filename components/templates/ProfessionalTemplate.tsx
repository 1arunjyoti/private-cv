import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
  Image,
} from "@react-pdf/renderer";
import type { Resume, LayoutSettings } from "@/db";
import { PDFRichText } from "./PDFRichText";
import { getTemplateDefaults } from "@/lib/template-defaults";
import { formatDate, PROFILE_IMAGE_SIZES } from "@/lib/template-utils";
import "@/lib/fonts";
import { getSectionHeadingWrapperStyles } from "@/lib/template-styles";

const createStyles = (
  themeColor: string,
  settings: LayoutSettings & {
    fontSize: number;
    lineHeight: number;
    sectionMargin: number;
    bulletMargin: number;
  },
) =>
  StyleSheet.create({
    page: {
      padding: 30,
      fontFamily: "Times-Roman",
      fontSize: settings.fontSize,
      lineHeight: settings.lineHeight,
      color: "#000",
    },
    header: {
      marginBottom: settings.sectionMargin * 1.5,
      textAlign: "center",
      borderBottomWidth: 1,
      borderBottomColor: "#000",
      paddingBottom: 10,
    },
    name: {
      fontSize: 22,
      fontWeight: "bold",
      marginBottom: 12,
      textTransform: "uppercase",
    },
    title: {
      fontSize: settings.fontSize + 3,
      marginBottom: 6,
      fontStyle: "italic",
    },
    contactRow: {
      flexDirection: "row",
      justifyContent: "center",
      flexWrap: "wrap",
      gap: 12,
      fontSize: settings.fontSize,
    },
    section: {
      marginBottom: settings.sectionMargin,
    },
    sectionTitleWrapper: getSectionHeadingWrapperStyles(settings, themeColor),
    sectionTitle: {
      fontSize:
        settings.sectionHeadingSize === "L"
          ? settings.fontSize + 3
          : settings.fontSize + 1,
      fontWeight: settings.sectionHeadingBold ? "bold" : "normal",
      textTransform: settings.sectionHeadingCapitalization || "uppercase",
      letterSpacing: 0.5,
      // Removed intrinsic border/margin as wrapper handles it
    },
    entryHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 2,
    },
    entryTitle: {
      fontSize: settings.fontSize + 2,
      fontWeight: "bold",
    },
    entrySubtitle: {
      fontSize: settings.fontSize + 1,
      fontStyle: "italic",
    },
    entryDate: {
      fontSize: settings.fontSize + 1,
    },
    entrySummary: {
      fontSize: settings.fontSize + 1,
      marginTop: 2,
      marginBottom: 2,
    },
    bulletList: {
      paddingLeft: 10,
    },
    bulletItem: {
      flexDirection: "row",
      marginBottom: settings.bulletMargin,
    },
    bullet: {
      width: 10,
      fontSize: settings.fontSize,
    },
    bulletText: {
      flex: 1,
      fontSize: settings.fontSize,
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

  // Merge template defaults with resume settings
  const templateDefaults = getTemplateDefaults(resume.meta.templateId || 'professional');
  const settings = { ...templateDefaults, ...resume.meta.layoutSettings } as LayoutSettings & {
    fontSize: number;
    lineHeight: number;
    sectionMargin: number;
    bulletMargin: number;
  };

  const styles = createStyles("#000", settings);

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
          borderColor: "#000",
          objectFit: "cover",
          marginBottom: 10,
          alignSelf: "center",
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
            {((settings.summaryHeadingVisible ?? true) as boolean) && (
              <View style={styles.sectionTitleWrapper}>
                <Text style={styles.sectionTitle}>Professional Summary</Text>
              </View>
            )}
            <PDFRichText
              text={basics.summary}
              style={{ fontSize: 10 }}
              fontSize={10}
              fontFamily="Times-Roman"
              boldFontFamily="Times-Bold"
              italicFontFamily="Times-Italic"
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
              <View key={exp.id} style={{ marginBottom: 10 }}>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryTitle}>{exp.company}</Text>
                  <Text style={styles.entryDate}>
                    {formatDate(exp.startDate)} - {formatDate(exp.endDate)}
                  </Text>
                </View>
                <Text style={styles.entrySubtitle}>{exp.position}</Text>

                {exp.summary && (
                  <PDFRichText
                    text={exp.summary}
                    style={styles.entrySummary}
                    fontSize={settings.fontSize + 1}
                    fontFamily="Times-Roman"
                    boldFontFamily="Times-Bold"
                    italicFontFamily="Times-Italic"
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

        {/* Education */}
        {education.length > 0 && (
          <View style={styles.section}>
            {((settings.educationHeadingVisible ?? true) as boolean) && (
              <View style={styles.sectionTitleWrapper}>
                <Text style={styles.sectionTitle}>Education</Text>
              </View>
            )}
            {education.map((edu) => (
              <View key={edu.id} style={{ marginBottom: 6 }}>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryTitle}>{edu.institution}</Text>
                  <Text style={styles.entryDate}>
                    {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                  </Text>
                </View>
                {edu.url && (
                  <Text style={{ fontSize: 10, color: "#444" }}>{edu.url}</Text>
                )}
                <Text style={styles.entrySubtitle}>
                  {edu.studyType} {edu.area && `in ${edu.area}`}
                </Text>
                {edu.summary && (
                  <PDFRichText
                    text={edu.summary}
                    style={styles.entrySummary}
                    fontSize={settings.fontSize + 1}
                    fontFamily="Times-Roman"
                    boldFontFamily="Times-Bold"
                    italicFontFamily="Times-Italic"
                  />
                )}
              </View>
            ))}
          </View>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <View style={styles.section}>
            {((settings.skillsHeadingVisible ?? true) as boolean) && (
              <View style={styles.sectionTitleWrapper}>
                <Text style={styles.sectionTitle}>Skills</Text>
              </View>
            )}
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
            {((settings.projectsHeadingVisible ?? true) as boolean) && (
              <Text style={styles.sectionTitle}>Key Projects</Text>
            )}
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
                  <PDFRichText
                    text={proj.description}
                    style={styles.entrySummary}
                    fontSize={settings.fontSize + 1}
                    fontFamily="Times-Roman"
                    boldFontFamily="Times-Bold"
                    italicFontFamily="Times-Italic"
                  />
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
