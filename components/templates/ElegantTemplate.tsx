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

interface ElegantTemplateProps {
  resume: Resume;
}

const createStyles = (
  themeColor: string,
  settings: LayoutSettings & {
    fontSize: number;
    lineHeight: number;
    sectionMargin: number;
    bulletMargin: number;
    headerBottomMargin?: number;
  },
) =>
  StyleSheet.create({
    page: {
      padding: 30,
      paddingTop: 40,
      fontFamily: "Open Sans",
      fontSize: settings.fontSize,
      lineHeight: settings.lineHeight,
      color: "#374151", // Slate 700
      backgroundColor: "#fff",
      paddingBottom: 30,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: settings.headerBottomMargin || 24,
      borderBottomWidth: 1,
      borderBottomColor: themeColor,
      paddingBottom: 16,
    },
    headerLeft: {
      flex: 1,
      marginRight: 20,
    },
    headerRight: {
      alignItems: "flex-end",
      justifyContent: "center",
      maxWidth: "40%",
    },
    name: {
      fontSize: 32,
      fontWeight: "bold",
      color: themeColor,
      marginBottom: 6,
      letterSpacing: -0.5,
      lineHeight: 1.1,
    },
    title: {
      fontSize: settings.fontSize + 2,
      color: "#6b7280", // Slate 500
      textTransform: "uppercase",
      letterSpacing: 2,
      marginBottom: 4,
    },
    contactItem: {
      fontSize: settings.fontSize - 0.5,
      color: "#4b5563", // Slate 600
      marginBottom: 3,
      textAlign: "right",
    },
    // Sections
    section: {
      marginBottom: settings.sectionMargin,
    },
    sectionTitleWrapper: getSectionHeadingWrapperStyles(settings, themeColor),
    sectionTitle: {
      fontSize:
        settings.sectionHeadingSize === "XL"
          ? settings.fontSize + 6
          : settings.sectionHeadingSize === "L"
            ? settings.fontSize + 4
            : settings.sectionHeadingSize === "M"
              ? settings.fontSize + 2
              : settings.fontSize + 1,
      fontWeight: settings.sectionHeadingBold ? "bold" : "semibold",
      color: themeColor,
      textTransform: settings.sectionHeadingCapitalization || "uppercase",
      letterSpacing: 1.5,
    },
    // Content
    entryContainer: {
      marginBottom: 10,
    },
    entryHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 2,
    },
    entryTitle: {
      fontSize: settings.fontSize + 1.5,
      fontWeight: "bold",
      color: "#111827", // Slate 900
      flex: 1,
    },
    entryDate: {
      fontSize: settings.fontSize,
      color: "#6b7280", // Slate 500
      textAlign: "right",
      marginLeft: 10,
    },
    entryCompany: {
      fontSize: settings.fontSize + 0.5,
      fontWeight: "semibold",
      color: "#4b5563", // Slate 600
      marginBottom: 2,
    },
    summary: {
      fontSize: settings.fontSize,
      lineHeight: settings.lineHeight,
      marginBottom: 4,
      color: "#374151",
    },
    bulletList: {
      marginTop: 2,
      paddingLeft: 0,
    },
    bulletItem: {
      flexDirection: "row",
      marginBottom: settings.bulletMargin,
      paddingLeft: 8,
    },
    bullet: {
      width: 10,
      fontSize: 10,
      color: themeColor,
      marginRight: 4,
    },
    bulletText: {
      flex: 1,
      fontSize: settings.fontSize,
      lineHeight: settings.lineHeight,
      color: "#374151",
    },
    // Skills
    skillsList: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    skillItem: {
      backgroundColor: "#f3f4f6",
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 4,
    },
    skillText: {
      fontSize: settings.fontSize,
      color: "#374151",
      fontWeight: "semibold",
    },
  });

export function ElegantTemplate({ resume }: ElegantTemplateProps) {
  const {
    basics,
    work,
    education,
    skills,
    projects,
    certificates,
    languages,
    interests,
    publications,
    awards,
    references,
    custom,
  } = resume;
  const themeColor = resume.meta.themeColor || "#2c3e50";

  // Merge template defaults with resume settings
  const templateDefaults = getTemplateDefaults(resume.meta.templateId || 'elegant');
  const settings = { ...templateDefaults, ...resume.meta.layoutSettings } as LayoutSettings & {
    fontSize: number;
    lineHeight: number;
    sectionMargin: number;
    bulletMargin: number;
  };

  const styles = createStyles(themeColor, settings);

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
          marginBottom: 12,
          objectFit: "cover",
          borderColor: themeColor,
          borderWidth: settings.profileImageBorder ? 1 : 0,
        }}
      />
    );
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {renderProfileImage()}
            <Text style={styles.name}>{basics.name}</Text>
            <Text style={styles.title}>{basics.label}</Text>
          </View>
          <View style={styles.headerRight}>
            {basics.email && (
              <Text style={styles.contactItem}>{basics.email}</Text>
            )}
            {basics.phone && (
              <Text style={styles.contactItem}>{basics.phone}</Text>
            )}
            {basics.location?.city && (
              <Text style={styles.contactItem}>
                {basics.location.city}, {basics.location.country}
              </Text>
            )}
            {basics.url && (
              <Link src={basics.url} style={styles.contactItem}>
                Portfolio
              </Link>
            )}
          </View>
        </View>

        <View>
          {basics.summary && (
            <View style={styles.section}>
              {((settings.summaryHeadingVisible ?? true) as boolean) && (
                <View style={styles.sectionTitleWrapper}>
                  <Text style={styles.sectionTitle}>Profile</Text>
                </View>
              )}
              <PDFRichText
                text={basics.summary}
                style={styles.summary}
                fontSize={settings.fontSize}
                fontFamily="Open Sans"
                boldFontFamily="Open Sans"
                italicFontFamily="Open Sans"
              />
            </View>
          )}

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
                      {formatDate(exp.startDate)} — {formatDate(exp.endDate)}
                    </Text>
                  </View>
                  <Text style={styles.entryCompany}>{exp.company}</Text>

                  {exp.summary && (
                    <Text style={styles.summary}>{exp.summary}</Text>
                  )}
                  {exp.highlights.length > 0 && (
                    <View style={styles.bulletList}>
                      {exp.highlights.map((h, i) => (
                        <View key={i} style={styles.bulletItem}>
                          {settings.useBullets && (
                            <Text style={styles.bullet}>•</Text>
                          )}
                          <Text style={styles.bulletText}>{h}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}

          {education.length > 0 && (
            <View style={styles.section}>
              {((settings.educationHeadingVisible ?? true) as boolean) && (
                <View style={styles.sectionTitleWrapper}>
                  <Text style={styles.sectionTitle}>Education</Text>
                </View>
              )}
              {education.map((edu) => (
                <View key={edu.id} style={styles.entryContainer}>
                  <View style={styles.entryHeader}>
                    <Text style={styles.entryTitle}>{edu.institution}</Text>
                    <Text style={styles.entryDate}>
                      {formatDate(edu.startDate)} — {formatDate(edu.endDate)}
                    </Text>
                  </View>
                  <Text style={styles.entryCompany}>
                    {edu.studyType} {edu.area}
                  </Text>
                  {edu.score && (
                    <Text style={styles.summary}>Grade: {edu.score}</Text>
                  )}
                </View>
              ))}
            </View>
          )}

          {skills.length > 0 && (
            <View style={styles.section}>
              {((settings.skillsHeadingVisible ?? true) as boolean) && (
                <View style={styles.sectionTitleWrapper}>
                  <Text style={styles.sectionTitle}>Skills</Text>
                </View>
              )}
              <View style={styles.skillsList}>
                {skills.map((skill) => (
                  <View key={skill.id} style={styles.skillItem}>
                    <Text style={styles.skillText}>{skill.name}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

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
                      <Link
                        src={proj.url}
                        style={{
                          fontSize: settings.fontSize,
                          color: themeColor,
                        }}
                      >
                        Link
                      </Link>
                    )}
                  </View>
                  {proj.description && (
                    <PDFRichText
                      text={proj.description}
                      style={styles.summary}
                      fontSize={settings.fontSize}
                      fontFamily="Open Sans"
                      boldFontFamily="Open Sans"
                      italicFontFamily="Open Sans"
                    />
                  )}
                  {proj.highlights && proj.highlights.length > 0 && (
                    <View style={styles.bulletList}>
                      {proj.highlights.map((h, i) => (
                        <View key={i} style={styles.bulletItem}>
                          {settings.useBullets && (
                            <Text style={styles.bullet}>•</Text>
                          )}
                          <Text style={styles.bulletText}>{h}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}

          {certificates && certificates.length > 0 && (
            <View style={styles.section}>
              {((settings.certificatesHeadingVisible ?? true) as boolean) && (
                <View style={styles.sectionTitleWrapper}>
                  <Text style={styles.sectionTitle}>Certificates</Text>
                </View>
              )}
              {certificates.map((cert) => (
                <View key={cert.id} style={styles.entryContainer}>
                  <View style={styles.entryHeader}>
                    <Text style={styles.entryTitle}>{cert.name}</Text>
                    <Text style={styles.entryDate}>{formatDate(cert.date)}</Text>
                  </View>
                  <Text style={styles.entryCompany}>{cert.issuer}</Text>
                  {cert.summary && (
                    <PDFRichText
                      text={cert.summary}
                      style={styles.summary}
                      fontSize={settings.fontSize}
                      fontFamily="Open Sans"
                      boldFontFamily="Open Sans"
                      italicFontFamily="Open Sans"
                    />
                  )}
                  {cert.url && (
                    <Link
                      src={cert.url}
                      style={{
                        fontSize: settings.fontSize - 0.5,
                        color: themeColor,
                        marginTop: 2,
                      }}
                    >
                      View Certificate
                    </Link>
                  )}
                </View>
              ))}
            </View>
          )}

          {languages && languages.length > 0 && (
            <View style={styles.section}>
              {((settings.languagesHeadingVisible ?? true) as boolean) && (
                <View style={styles.sectionTitleWrapper}>
                  <Text style={styles.sectionTitle}>Languages</Text>
                </View>
              )}
              <View style={styles.skillsList}>
                {languages.map((lang) => (
                  <View key={lang.id} style={styles.skillItem}>
                    <Text style={styles.skillText}>
                      {lang.language} — {lang.fluency}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {interests && interests.length > 0 && (
            <View style={styles.section}>
              {((settings.interestsHeadingVisible ?? true) as boolean) && (
                <View style={styles.sectionTitleWrapper}>
                  <Text style={styles.sectionTitle}>Interests</Text>
                </View>
              )}
              <View style={styles.skillsList}>
                {interests.map((interest) => (
                  <View key={interest.id} style={styles.skillItem}>
                    <Text style={styles.skillText}>
                      {interest.name}
                      {interest.keywords.length > 0 &&
                        ` (${interest.keywords.join(", ")})`}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {publications && publications.length > 0 && (
            <View style={styles.section}>
              {((settings.publicationsHeadingVisible ?? true) as boolean) && (
                <View style={styles.sectionTitleWrapper}>
                  <Text style={styles.sectionTitle}>Publications</Text>
                </View>
              )}
              {publications.map((pub) => (
                <View key={pub.id} style={styles.entryContainer}>
                  <View style={styles.entryHeader}>
                    <Text style={styles.entryTitle}>{pub.name}</Text>
                    <Text style={styles.entryDate}>
                      {formatDate(pub.releaseDate)}
                    </Text>
                  </View>
                  <Text style={styles.entryCompany}>{pub.publisher}</Text>
                  {pub.summary && (
                    <PDFRichText
                      text={pub.summary}
                      style={styles.summary}
                      fontSize={settings.fontSize}
                      fontFamily="Open Sans"
                      boldFontFamily="Open Sans"
                      italicFontFamily="Open Sans"
                    />
                  )}
                  {pub.url && (
                    <Link
                      src={pub.url}
                      style={{
                        fontSize: settings.fontSize - 0.5,
                        color: themeColor,
                        marginTop: 2,
                      }}
                    >
                      View Publication
                    </Link>
                  )}
                </View>
              ))}
            </View>
          )}

          {awards && awards.length > 0 && (
            <View style={styles.section}>
              {((settings.awardsHeadingVisible ?? true) as boolean) && (
                <View style={styles.sectionTitleWrapper}>
                  <Text style={styles.sectionTitle}>Awards</Text>
                </View>
              )}
              {awards.map((award) => (
                <View key={award.id} style={styles.entryContainer}>
                  <View style={styles.entryHeader}>
                    <Text style={styles.entryTitle}>{award.title}</Text>
                    <Text style={styles.entryDate}>{formatDate(award.date)}</Text>
                  </View>
                  <Text style={styles.entryCompany}>{award.awarder}</Text>
                  {award.summary && (
                    <PDFRichText
                      text={award.summary}
                      style={styles.summary}
                      fontSize={settings.fontSize}
                      fontFamily="Open Sans"
                      boldFontFamily="Open Sans"
                      italicFontFamily="Open Sans"
                    />
                  )}
                </View>
              ))}
            </View>
          )}

          {references && references.length > 0 && (
            <View style={styles.section}>
              {((settings.referencesHeadingVisible ?? true) as boolean) && (
                <View style={styles.sectionTitleWrapper}>
                  <Text style={styles.sectionTitle}>References</Text>
                </View>
              )}
              {references.map((ref) => (
                <View key={ref.id} style={styles.entryContainer}>
                  <Text style={styles.entryTitle}>{ref.name}</Text>
                  <Text style={styles.entryCompany}>{ref.position}</Text>
                  {ref.reference && (
                    <PDFRichText
                      text={ref.reference}
                      style={styles.summary}
                      fontSize={settings.fontSize}
                      fontFamily="Open Sans"
                      boldFontFamily="Open Sans"
                      italicFontFamily="Open Sans"
                    />
                  )}
                </View>
              ))}
            </View>
          )}

          {custom && custom.length > 0 && (
            <>
              {custom.map((section) => (
                <View key={section.id} style={styles.section}>
                  {((settings.customHeadingVisible ?? true) as boolean) && (
                    <View style={styles.sectionTitleWrapper}>
                      <Text style={styles.sectionTitle}>{section.name}</Text>
                    </View>
                  )}
                  {section.items.map((item) => (
                    <View key={item.id} style={styles.entryContainer}>
                      <View style={styles.entryHeader}>
                        <Text style={styles.entryTitle}>{item.name}</Text>
                        {item.date && (
                          <Text style={styles.entryDate}>
                            {formatDate(item.date)}
                          </Text>
                        )}
                      </View>
                      {item.description && (
                        <Text style={styles.entryCompany}>{item.description}</Text>
                      )}
                      {item.summary && (
                        <PDFRichText
                          text={item.summary}
                          style={styles.summary}
                          fontSize={settings.fontSize}
                          fontFamily="Open Sans"
                          boldFontFamily="Open Sans"
                          italicFontFamily="Open Sans"
                        />
                      )}
                      {item.url && (
                        <Link
                          src={item.url}
                          style={{
                            fontSize: settings.fontSize - 0.5,
                            color: themeColor,
                            marginTop: 2,
                          }}
                        >
                          View Link
                        </Link>
                      )}
                    </View>
                  ))}
                </View>
              ))}
            </>
          )}
        </View>
      </Page>
    </Document>
  );
}

export async function generateElegantPDF(resume: Resume): Promise<Blob> {
  const doc = <ElegantTemplate resume={resume} />;
  const blob = await pdf(doc).toBlob();
  return blob;
}
