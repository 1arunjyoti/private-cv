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

interface CreativeTemplateProps {
  resume: Resume;
}

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
      flexDirection: "row",
      fontFamily: "Open Sans",
      fontSize: settings.fontSize,
      lineHeight: settings.lineHeight,
    },
    // Left sidebar
    sidebar: {
      width: "35%",
      backgroundColor: themeColor,
      color: "#ffffff",
      padding: 25,
      paddingTop: 40,
    },
    sidebarSection: {
      marginBottom: settings.sectionMargin,
    },
    sidebarTitleWrapper: {
      flexDirection: "row",
      marginBottom: 6,
      justifyContent:
        settings.sectionHeadingAlign === "center"
          ? "center"
          : settings.sectionHeadingAlign === "right"
            ? "flex-end"
            : "flex-start",
      ...(settings.sectionHeadingStyle === 1 && {
        borderBottomWidth: 1,
        borderBottomColor: "rgba(255,255,255,0.3)",
        paddingBottom: 4,
      }),
      ...(settings.sectionHeadingStyle === 3 && {
        borderBottomWidth: 2,
        borderBottomColor: "rgba(255,255,255,0.3)",
        paddingBottom: 4,
      }),
      ...(settings.sectionHeadingStyle === 4 && {
        backgroundColor: "rgba(255,255,255,0.1)",
        paddingVertical: 2,
        paddingHorizontal: 8,
        borderRadius: 4,
      }),
      ...(settings.sectionHeadingStyle === 5 && {
        borderLeftWidth: 4,
        borderLeftColor: "rgba(255,255,255,0.5)",
        paddingLeft: 8,
      }),
      ...(settings.sectionHeadingStyle === 6 && {
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderTopColor: "rgba(255,255,255,0.3)",
        borderBottomColor: "rgba(255,255,255,0.3)",
        paddingVertical: 2,
      }),
      ...(settings.sectionHeadingStyle === 7 && {
        borderBottomWidth: 1,
        borderBottomColor: "rgba(255,255,255,0.3)",
        borderStyle: "dashed",
        paddingBottom: 4,
      }),
      ...(settings.sectionHeadingStyle === 8 && {
        borderBottomWidth: 1,
        borderBottomColor: "rgba(255,255,255,0.3)",
        borderStyle: "dotted",
        paddingBottom: 4,
      }),
    },
    sidebarTitle: {
      fontSize: settings.sectionHeadingSize === "L" ? 14 : 12,
      fontFamily: settings.sectionHeadingBold ? "bold" : "normal",
      marginBottom: 0,
      textTransform: settings.sectionHeadingCapitalization || "uppercase",
      letterSpacing: 1,
      color: "#ffffff",
    },
    sidebarText: {
      fontSize: settings.fontSize,
      marginBottom: 3,
      opacity: 0.9,
    },
    sidebarLabel: {
      fontSize: settings.fontSize - 1,
      opacity: 0.7,
      marginBottom: 2,
      textTransform: "uppercase",
    },
    profileImage: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: "rgba(255,255,255,0.2)",
      marginBottom: 15,
      alignSelf: "center",
    },
    skillItem: {
      marginBottom: 8,
    },
    skillName: {
      fontSize: settings.fontSize,
      fontWeight: "bold",
      marginBottom: 2,
    },
    skillBar: {
      height: 4,
      backgroundColor: "rgba(255,255,255,0.2)",
      borderRadius: 2,
    },
    skillBarFill: {
      height: 4,
      backgroundColor: "#ffffff",
      borderRadius: 2,
    },
    profileLink: {
      fontSize: settings.fontSize - 1,
      color: "#ffffff",
      opacity: 0.9,
      marginBottom: 4,
    },
    // Main content
    main: {
      width: "65%",
      padding: 30,
      paddingTop: 40,
      backgroundColor: "#ffffff",
    },
    header: {
      marginBottom: settings.sectionMargin * 1.5,
    },
    name: {
      fontSize: 28,
      fontWeight: "bold",
      color: themeColor,
      marginBottom: 8,
    },
    title: {
      fontSize: settings.fontSize + 3,
      color: "#666",
      marginBottom: 8,
    },
    summary: {
      fontSize: settings.fontSize,
      lineHeight: settings.lineHeight,
      color: "#555",
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
      color: themeColor,
      marginBottom: 0,
      textTransform: settings.sectionHeadingCapitalization || "uppercase",
      letterSpacing: 0.8,
    },
    entryContainer: {
      marginBottom: 8,
    },
    entryHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 3,
    },
    entryTitle: {
      fontSize: settings.fontSize + 1,
      fontWeight: "bold",
      color: "#333",
    },
    entrySubtitle: {
      fontSize: settings.fontSize,
      color: "#666",
    },
    entryDate: {
      fontSize: settings.fontSize - 1,
      color: "#888",
    },
    entrySummary: {
      fontSize: settings.fontSize,
      color: "#555",
      marginBottom: 4,
    },
    bulletList: {
      marginLeft: 8,
    },
    bulletItem: {
      flexDirection: "row",
      marginBottom: settings.bulletMargin,
    },
    bullet: {
      width: 12,
      fontSize: settings.fontSize,
      color: themeColor,
    },
    bulletText: {
      flex: 1,
      fontSize: settings.fontSize - 1,
      color: "#555",
    },
    projectTech: {
      fontSize: settings.fontSize - 1,
      color: "#888",
      fontStyle: "italic",
    },
  });

export function CreativeTemplate({ resume }: CreativeTemplateProps) {
  const { basics, work, education, skills, projects } = resume;
  const themeColor = resume.meta.themeColor || "#3b82f6";

  // Merge template defaults with resume settings
  const templateDefaults = getTemplateDefaults(resume.meta.templateId || 'creative');
  const settings = { ...templateDefaults, ...resume.meta.layoutSettings } as LayoutSettings & {
    fontSize: number;
    lineHeight: number;
    sectionMargin: number;
    bulletMargin: number;
  };

  const styles = createStyles(themeColor, settings);

  const getSkillLevel = (level: string): number => {
    const levels: Record<string, number> = {
      beginner: 25,
      intermediate: 50,
      advanced: 75,
      expert: 100,
    };
    return levels[level.toLowerCase()] || 60;
  };

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
          borderColor: "#fff",
          objectFit: "cover",
          marginBottom: 15,
          alignSelf: "center",
        }}
      />
    );
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Sidebar */}
        <View style={styles.sidebar}>
          {renderProfileImage()}
          {/* Contact */}
          <View style={styles.sidebarSection}>
            <Text style={styles.sidebarTitle}>Contact</Text>
            {basics.email && (
              <View style={{ marginBottom: 6 }}>
                <Text style={styles.sidebarLabel}>Email</Text>
                <Text style={styles.sidebarText}>{basics.email}</Text>
              </View>
            )}
            {basics.phone && (
              <View style={{ marginBottom: 6 }}>
                <Text style={styles.sidebarLabel}>Phone</Text>
                <Text style={styles.sidebarText}>{basics.phone}</Text>
              </View>
            )}
            {(basics.location.city || basics.location.country) && (
              <View style={{ marginBottom: 6 }}>
                <Text style={styles.sidebarLabel}>Location</Text>
                <Text style={styles.sidebarText}>
                  {basics.location.city}
                  {basics.location.city && basics.location.country ? ", " : ""}
                  {basics.location.country}
                </Text>
              </View>
            )}
            {basics.url && (
              <View style={{ marginBottom: 6 }}>
                <Text style={styles.sidebarLabel}>Website</Text>
                <Link src={basics.url} style={styles.profileLink}>
                  {basics.url.replace(/^https?:\/\//, "")}
                </Link>
              </View>
            )}
          </View>

          {/* Social Profiles */}
          {basics.profiles.length > 0 && (
            <View style={styles.sidebarSection}>
              <Text style={styles.sidebarTitle}>Profiles</Text>
              {basics.profiles.map((profile, index) => (
                <View key={index} style={{ marginBottom: 6 }}>
                  <Text style={styles.sidebarLabel}>{profile.network}</Text>
                  <Link src={profile.url} style={styles.profileLink}>
                    @{profile.username}
                  </Link>
                </View>
              ))}
            </View>
          )}

          {/* Skills */}
          {skills.length > 0 && (
            <View style={styles.sidebarSection}>
              {((settings.skillsHeadingVisible ?? true) as boolean) && (
                <View style={styles.sidebarTitleWrapper}>
                  <Text style={styles.sidebarTitle}>Skills</Text>
                </View>
              )}
              {skills.map((skill) => (
                <View key={skill.id} style={styles.skillItem}>
                  <Text style={styles.skillName}>{skill.name}</Text>
                  <View style={styles.skillBar}>
                    <View
                      style={[
                        styles.skillBarFill,
                        { width: `${getSkillLevel(skill.level)}%` },
                      ]}
                    />
                  </View>
                  {skill.keywords.length > 0 && (
                    <Text
                      style={[
                        styles.sidebarText,
                        { fontSize: 7, marginTop: 2 },
                      ]}
                    >
                      {skill.keywords.slice(0, 4).join(" • ")}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Education (compact) */}
          {education.length > 0 && (
            <View style={styles.sidebarSection}>
              {((settings.educationHeadingVisible ?? true) as boolean) && (
                <View style={styles.sidebarTitleWrapper}>
                  <Text style={styles.sidebarTitle}>Education</Text>
                </View>
              )}
              {education.map((edu) => (
                <View key={edu.id} style={{ marginBottom: 8 }}>
                  <Text style={styles.skillName}>
                    {edu.studyType} {edu.area && `in ${edu.area}`}
                  </Text>
                  <Text style={styles.sidebarText}>{edu.institution}</Text>
                  {edu.url && (
                    <Link src={edu.url} style={styles.profileLink}>
                      {edu.url.replace(/^https?:\/\//, "")}
                    </Link>
                  )}
                  <Text style={[styles.sidebarText, { fontSize: 7 }]}>
                    {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                  </Text>
                  {edu.summary && (
                    <PDFRichText
                      text={edu.summary}
                      style={{
                        ...styles.sidebarText,
                        fontSize: 8,
                        marginTop: 2,
                        opacity: 0.8,
                      }}
                      fontSize={8}
                      fontFamily="Open Sans"
                      boldFontFamily="Open Sans"
                      italicFontFamily="Open Sans"
                    />
                  )}
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Main Content */}
        <View style={styles.main}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.name}>{basics.name || "Your Name"}</Text>
            {basics.label && <Text style={styles.title}>{basics.label}</Text>}
            {basics.summary && (
              <PDFRichText
                text={basics.summary}
                style={styles.summary}
                fontSize={settings.fontSize}
                fontFamily="Open Sans"
                boldFontFamily="Open Sans"
                italicFontFamily="Open Sans"
              />
            )}
          </View>

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
                    <View>
                      <Text style={styles.entryTitle}>{exp.position}</Text>
                      <Text style={styles.entrySubtitle}>{exp.company}</Text>
                    </View>
                    <Text style={styles.entryDate}>
                      {formatDate(exp.startDate)} - {formatDate(exp.endDate)}
                    </Text>
                  </View>
                  {exp.summary && (
                    <PDFRichText
                      text={exp.summary}
                      style={styles.entrySummary}
                      fontSize={settings.fontSize}
                      fontFamily="Open Sans"
                      boldFontFamily="Open Sans"
                      italicFontFamily="Open Sans"
                    />
                  )}
                  {exp.highlights.length > 0 && (
                    <View style={styles.bulletList}>
                      {exp.highlights.slice(0, 3).map((highlight, i) => (
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

          {/* Projects */}
          {projects.length > 0 && (
            <View style={styles.section}>
              {((settings.projectsHeadingVisible ?? true) as boolean) && (
                <View style={styles.sectionTitleWrapper}>
                  <Text style={styles.sectionTitle}>Projects</Text>
                </View>
              )}
              {projects.map((proj) => (
                <View key={proj.id} style={styles.entryContainer}>
                  <View style={styles.entryHeader}>
                    <Text style={styles.entryTitle}>{proj.name}</Text>
                    {proj.url && (
                      <Link src={proj.url} style={styles.entryDate}>
                        View Project
                      </Link>
                    )}
                  </View>
                  {proj.description && (
                    <PDFRichText
                      text={proj.description}
                      style={styles.entrySummary}
                      fontSize={settings.fontSize}
                      fontFamily="Open Sans"
                      boldFontFamily="Open Sans"
                      italicFontFamily="Open Sans"
                    />
                  )}
                  {proj.keywords.length > 0 && (
                    <Text style={styles.projectTech}>
                      {proj.keywords.join(" • ")}
                    </Text>
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
export async function generateCreativePDF(resume: Resume): Promise<Blob> {
  const doc = <CreativeTemplate resume={resume} />;
  const blob = await pdf(doc).toBlob();
  return blob;
}
