import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
  Image,
  Link,
} from "@react-pdf/renderer";
import type { Resume } from "@/db";

// Helper to convert mm to pt (approximate)
const mmToPt = (mm: number) => mm * 2.835;

// Font registration if needed, but we use standard fonts.
// Times-Roman is standard.

interface ClassicTemplateProps {
  resume: Resume;
}

export function ClassicTemplate({ resume }: ClassicTemplateProps) {
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

  const settings = resume.meta.layoutSettings || {};

  // Defaults
  const fontSize = settings.fontSize || 10;
  const lineHeight = settings.lineHeight || 1.3;
  const sectionMargin = settings.sectionMargin || 15;
  const bulletMargin = settings.bulletMargin || 3;
  const marginH = settings.marginHorizontal
    ? mmToPt(settings.marginHorizontal)
    : 40;
  const marginV = settings.marginVertical
    ? mmToPt(settings.marginVertical)
    : 40;

  // Layout Controls
  const columnCount = settings.columnCount || 1;
  const leftColumnWidthPercent = settings.leftColumnWidth || 30; // Default 30%
  const rightColumnWidthPercent = 100 - leftColumnWidthPercent;
  const layoutHeaderPos = settings.headerPosition || "center";
  const headerAlign: "left" | "center" | "right" =
    layoutHeaderPos === "left" || layoutHeaderPos === "right"
      ? layoutHeaderPos
      : "center";

  // Typography Constants
  const baseFont = "Times-Roman";
  const boldFont = "Times-Roman";
  const italicFont = "Times-Roman";

  // Helper to get color
  const colorTargets = settings.themeColorTarget || [
    "headings",
    "links",
    "icons",
    "decorations",
  ];
  const getColor = (target: string, fallback: string = "#000000") => {
    return colorTargets.includes(target)
      ? resume.meta.themeColor || "#000000"
      : fallback;
  };

  // Styles
  const styles = StyleSheet.create({
    page: {
      paddingHorizontal: marginH,
      paddingVertical: marginV,
      fontFamily: baseFont,
      fontSize: fontSize,
      lineHeight: lineHeight,
      color: "#000",
      flexDirection: "column",
    },
    // Header
    header: {
      marginBottom: settings.headerBottomMargin || 20,
      textAlign: headerAlign,
      borderBottomWidth: settings.sectionHeadingStyle === 1 ? 3 : 0, // Example variant
      borderBottomColor: getColor("decorations"),
      borderBottomStyle: "solid",
      paddingBottom: 15,
      width: "100%",
    },
    name: {
      fontSize: settings.nameFontSize || 28,
      fontFamily:
        settings.nameFont === "creative"
          ? "Helvetica"
          : settings.nameBold
            ? boldFont
            : baseFont,
      fontWeight:
        settings.nameBold || settings.nameFont === "creative"
          ? "bold"
          : "normal",
      marginBottom: 8,
      lineHeight: settings.nameLineHeight || 1.2,
      textTransform: "uppercase",
      letterSpacing: 1.5,
      color: getColor("name"),
    },
    label: {
      fontSize: settings.titleFontSize || fontSize + 4,
      marginBottom: 6,
      fontWeight: settings.titleBold ? "bold" : "normal",
      fontStyle: settings.titleItalic ? "italic" : "normal",
      fontFamily: settings.titleBold
        ? boldFont
        : settings.titleItalic
          ? italicFont
          : baseFont,
      lineHeight: settings.titleLineHeight || 1.2,
    },
    contactRow: {
      flexDirection: "row",
      justifyContent:
        headerAlign === "left"
          ? "flex-start"
          : headerAlign === "right"
            ? "flex-end"
            : "center",
      flexWrap: "wrap",
      rowGap: 4,
      columnGap: 0,
      fontSize: settings.contactFontSize || fontSize,
      marginTop: 4,
    },

    // Columns
    columnsContainer: {
      flexDirection: "row",
      gap: 20, // Gap between columns
    },
    leftColumn: {
      width: `${leftColumnWidthPercent}%`,
    },
    rightColumn: {
      width: `${rightColumnWidthPercent}%`,
    },

    // Section Common
    section: {
      marginBottom: sectionMargin,
    },
    sectionTitleWrapper: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
      borderBottomWidth: settings.sectionHeadingStyle === 2 ? 0 : 1, // Default underline
      borderBottomColor: getColor("decorations"),
      paddingBottom: 2,
    },
    sectionTitle: {
      fontSize:
        settings.sectionHeadingSize === "L" ? fontSize + 6 : fontSize + 4,
      fontFamily: boldFont,
      fontWeight: "bold",
      textTransform: settings.sectionHeadingCapitalization || "uppercase",
      letterSpacing: 1,
      color: getColor("headings"),
      backgroundColor: "#fff",
    },

    // Entries
    entryBlock: {
      marginBottom: 10,
    },
    entryHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "baseline",
      marginBottom: 2,
      flexWrap: "wrap",
    },
    entryTitle: {
      fontSize: settings.entryTitleSize === "L" ? fontSize + 3 : fontSize + 1,
      fontFamily: boldFont,
      fontWeight: "bold",
    },
    entryDate: {
      fontSize: fontSize,
      fontFamily: italicFont,
      fontStyle: "italic",
      textAlign: "right",
      minWidth: 60,
    },
    entrySubtitle: {
      fontSize: fontSize + 0.5,
      fontFamily:
        settings.entrySubtitleStyle === "bold"
          ? boldFont
          : settings.entrySubtitleStyle === "italic"
            ? italicFont
            : baseFont,
      fontWeight: settings.entrySubtitleStyle === "bold" ? "bold" : "normal",
      fontStyle: settings.entrySubtitleStyle === "italic" ? "italic" : "normal",
      marginBottom: 3,
    },
    entrySummary: {
      fontSize: fontSize,
      marginTop: 2,
      marginBottom: 4,
      textAlign: settings.entryIndentBody ? "left" : "justify",
      marginLeft: settings.entryIndentBody ? 10 : 0,
    },

    // Lists/Bullets
    bulletList: {
      marginLeft: 15,
      marginTop: 2,
    },
    bulletItem: {
      flexDirection: "row",
      marginBottom: bulletMargin,
    },
    bullet: {
      width: 10,
      fontSize: fontSize,
    },
    bulletText: {
      flex: 1,
      fontSize: fontSize,
    },

    // Grids (Skills etc)
    gridContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
  });

  // --- Helpers ---
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "Present";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  // --- Renderers ---

  const contactStyle = {
    fontWeight: (settings.contactBold ? "bold" : "normal") as "bold" | "normal",
    fontStyle: (settings.contactItalic ? "italic" : "normal") as
      | "italic"
      | "normal",
    fontFamily: baseFont,
  };

  const ProfileImage = () => {
    if (!basics.image || !settings.showProfileImage) return null;

    const sizeMap = { S: 50, M: 80, L: 120 };
    const size = sizeMap[settings.profileImageSize || "M"];

    return (
      // @react-pdf/renderer Image does not support alt prop
      // eslint-disable-next-line jsx-a11y/alt-text
      <Image
        src={basics.image}
        style={{
          width: size,
          height: size,
          borderRadius: settings.profileImageShape === "square" ? 0 : size / 2,
          borderWidth: settings.profileImageBorder ? 1 : 0,
          borderColor: "#333",
          objectFit: "cover",
          marginBottom: 10,
        }}
      />
    );
  };

  const renderHeader = () => {
    const isRight = headerAlign === "right";
    const isCenter = headerAlign === "center";

    // New Settings
    const contactLayout = settings.personalDetailsArrangement || 1; // 1=Row, 2=Column

    // Helper to render an item
    const renderContactItem = (value: string, isLink: boolean = false) => {
      return (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Text
            style={[contactStyle, isLink ? { color: getColor("links") } : {}]}
          >
            {value}
          </Text>
        </View>
      );
    };

    return (
      <View
        style={[
          styles.header,
          {
            flexDirection: "row",
            alignItems: isCenter ? "center" : "flex-start",
            justifyContent: isCenter
              ? "center"
              : isRight
                ? "flex-end"
                : "flex-start",
            gap: 20,
          },
        ]}
      >
        {!isRight && <ProfileImage />}

        <View style={{ flex: 1 }}>
          <Text style={[styles.name, { color: getColor("name") }]}>
            {basics.name || "YOUR NAME"}
          </Text>
          {basics.label && (
            <Text
              style={[styles.label, { color: getColor("title", "#666666") }]}
            >
              {basics.label}
            </Text>
          )}

          <View
            style={[
              styles.contactRow,
              contactLayout === 2
                ? {
                    flexDirection: "column",
                    gap: 4,
                    alignItems: isCenter
                      ? "center"
                      : isRight
                        ? "flex-end"
                        : "flex-start",
                  }
                : {},
            ]}
          >
            {/* Email */}
            {basics.email &&
              (contactLayout === 2 ? (
                renderContactItem(basics.email, true)
              ) : (
                <Text style={[contactStyle, { color: getColor("links") }]}>
                  {basics.email}
                </Text>
              ))}

            {/* Phone */}
            {basics.phone &&
              (contactLayout === 2 ? (
                renderContactItem(basics.phone, false)
              ) : (
                <>
                  <Text style={{ color: getColor("decorations") }}>
                    {settings.contactSeparator === "dash"
                      ? " - "
                      : settings.contactSeparator === "comma"
                        ? ", "
                        : " | "}
                  </Text>
                  <Text style={[contactStyle, { color: getColor("links") }]}>
                    {basics.phone}
                  </Text>
                </>
              ))}

            {/* Location */}
            {basics.location.city &&
              (contactLayout === 2 ? (
                renderContactItem(
                  `${basics.location.city}${basics.location.country ? `, ${basics.location.country}` : ""}`,
                  false,
                )
              ) : (
                <>
                  <Text style={{ color: getColor("decorations") }}>
                    {settings.contactSeparator === "dash"
                      ? " - "
                      : settings.contactSeparator === "comma"
                        ? ", "
                        : " | "}
                  </Text>
                  <Text style={contactStyle}>
                    {basics.location.city}
                    {basics.location.country
                      ? `, ${basics.location.country}`
                      : ""}
                  </Text>
                </>
              ))}

            {/* URL */}
            {basics.url &&
              (contactLayout === 2 ? (
                renderContactItem(basics.url, true)
              ) : (
                <>
                  <Text style={{ color: getColor("decorations") }}>
                    {settings.contactSeparator === "dash"
                      ? " - "
                      : settings.contactSeparator === "comma"
                        ? ", "
                        : " | "}
                  </Text>
                  <Text style={[contactStyle, { color: getColor("links") }]}>
                    {basics.url}
                  </Text>
                </>
              ))}

            {/* Profiles */}
            {basics.profiles.map((p) => {
              return contactLayout === 2 ? (
                <View key={p.network + p.username}>
                  {renderContactItem(p.username || p.network, true)}
                </View>
              ) : (
                <View
                  key={p.network + p.username}
                  style={{ flexDirection: "row" }}
                >
                  <Text style={{ color: getColor("decorations") }}>
                    {settings.contactSeparator === "dash"
                      ? " - "
                      : settings.contactSeparator === "comma"
                        ? ", "
                        : " | "}
                  </Text>
                  <Text style={[contactStyle, { color: getColor("links") }]}>
                    {p.network}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {isRight && <ProfileImage />}
      </View>
    );
  };

  const renderSummary = () => {
    if (!basics.summary) return null;
    return (
      <View key="summary" style={styles.section}>
        <View style={styles.sectionTitleWrapper}>
          <Text style={[styles.sectionTitle, { color: getColor("headings") }]}>
            Summary
          </Text>
        </View>
        <Text style={{ ...styles.entrySummary, textAlign: "justify" }}>
          {basics.summary}
        </Text>
      </View>
    );
  };

  const renderWork = () => {
    if (!work || work.length === 0) return null;
    return (
      <View key="work" style={styles.section}>
        <View style={styles.sectionTitleWrapper}>
          <Text style={[styles.sectionTitle, { color: getColor("headings") }]}>
            Professional Experience
          </Text>
        </View>
        {work.map((exp, index) => (
          <View key={exp.id} style={styles.entryBlock}>
            <View style={styles.entryHeader}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                {settings.experienceCompanyListStyle === "bullet" && (
                  <Text style={{ marginRight: 4, fontSize: fontSize }}>•</Text>
                )}
                {settings.experienceCompanyListStyle === "number" && (
                  <Text style={{ marginRight: 4, fontSize: fontSize }}>
                    {index + 1}.
                  </Text>
                )}
                <Text
                  style={[
                    styles.entryTitle,
                    {
                      fontSize: fontSize + 1, // Explicitely override or keep defaults
                      fontFamily: settings.experienceCompanyBold
                        ? boldFont
                        : baseFont,
                      fontWeight: settings.experienceCompanyBold
                        ? "bold"
                        : "normal",
                      fontStyle: settings.experienceCompanyItalic
                        ? "italic"
                        : "normal",
                    },
                  ]}
                >
                  {exp.company}
                </Text>
                {exp.url && (
                  <Link src={exp.url} style={{ textDecoration: "none" }}>
                    <Text
                      style={[
                        {
                          fontSize: fontSize - 1,
                          color: getColor("links"),
                          marginLeft: 4,
                        },
                        {
                          fontFamily: settings.experienceWebsiteBold
                            ? boldFont
                            : baseFont,
                          fontWeight: settings.experienceWebsiteBold
                            ? "bold"
                            : "normal",
                          fontStyle: settings.experienceWebsiteItalic
                            ? "italic"
                            : "normal",
                        },
                      ]}
                    >
                      | {exp.url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                    </Text>
                  </Link>
                )}
              </View>
              <Text
                style={[
                  styles.entryDate,
                  {
                    fontFamily: settings.experienceDateItalic
                      ? italicFont
                      : baseFont, // specific preference usually for italic
                    fontWeight: settings.experienceDateBold ? "bold" : "normal",
                    fontStyle: settings.experienceDateItalic
                      ? "italic"
                      : "normal",
                  },
                ]}
              >
                {formatDate(exp.startDate)} — {formatDate(exp.endDate)}
              </Text>
            </View>
            <Text
              style={[
                styles.entrySubtitle,
                {
                  fontFamily: settings.experiencePositionBold
                    ? boldFont
                    : baseFont,
                  fontWeight: settings.experiencePositionBold
                    ? "bold"
                    : "normal",
                  fontStyle: settings.experiencePositionItalic
                    ? "italic"
                    : "normal",
                },
              ]}
            >
              {exp.position}
            </Text>
            {exp.summary && (
              <Text style={styles.entrySummary}>{exp.summary}</Text>
            )}
            {exp.highlights && exp.highlights.length > 0 && (
              <View style={styles.bulletList}>
                {exp.highlights.map((h, i) => (
                  <View key={i} style={styles.bulletItem}>
                    {settings.experienceAchievementsListStyle === "bullet" && (
                      <Text style={styles.bullet}>•</Text>
                    )}
                    {settings.experienceAchievementsListStyle === "number" && (
                      <Text style={styles.bullet}>{i + 1}.</Text>
                    )}
                    <Text
                      style={[
                        styles.bulletText,
                        {
                          fontFamily: settings.experienceAchievementsBold
                            ? boldFont
                            : baseFont,
                          fontWeight: settings.experienceAchievementsBold
                            ? "bold"
                            : "normal",
                          fontStyle: settings.experienceAchievementsItalic
                            ? "italic"
                            : "normal",
                        },
                      ]}
                    >
                      {h}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}
      </View>
    );
  };

  const renderEducation = () => {
    if (!education || education.length === 0) return null;
    return (
      <View key="education" style={styles.section}>
        <View style={styles.sectionTitleWrapper}>
          <Text style={[styles.sectionTitle, { color: getColor("headings") }]}>
            Education
          </Text>
        </View>
        {education.map((edu, index) => (
          <View key={edu.id} style={styles.entryBlock}>
            <View style={styles.entryHeader}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                {settings.educationInstitutionListStyle === "bullet" && (
                  <Text style={{ marginRight: 4, fontSize: fontSize }}>•</Text>
                )}
                {settings.educationInstitutionListStyle === "number" && (
                  <Text style={{ marginRight: 4, fontSize: fontSize }}>
                    {index + 1}.
                  </Text>
                )}
                <Text
                  style={[
                    styles.entryTitle,
                    {
                      fontSize: fontSize + 1,
                      fontFamily: settings.educationInstitutionBold
                        ? boldFont
                        : baseFont,
                      fontWeight: settings.educationInstitutionBold
                        ? "bold"
                        : "normal",
                      fontStyle: settings.educationInstitutionItalic
                        ? "italic"
                        : "normal",
                    },
                  ]}
                >
                  {edu.institution}
                </Text>
              </View>
              <Text
                style={[
                  styles.entryDate,
                  {
                    fontFamily: settings.educationDateItalic
                      ? italicFont
                      : baseFont,
                    fontWeight: settings.educationDateBold ? "bold" : "normal",
                    fontStyle: settings.educationDateItalic
                      ? "italic"
                      : "normal",
                  },
                ]}
              >
                {formatDate(edu.startDate)} — {formatDate(edu.endDate)}
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                marginBottom: 3,
              }}
            >
              <Text
                style={{
                  fontSize: fontSize + 0.5,
                  fontFamily: settings.educationDegreeBold
                    ? boldFont
                    : baseFont,
                  fontWeight: settings.educationDegreeBold ? "bold" : "normal",
                  fontStyle: settings.educationDegreeItalic
                    ? "italic"
                    : "normal",
                }}
              >
                {edu.studyType}
              </Text>
              {edu.area && (
                <Text
                  style={{
                    fontSize: fontSize + 0.5,
                    fontFamily: settings.educationAreaBold
                      ? boldFont
                      : baseFont,
                    fontWeight: settings.educationAreaBold ? "bold" : "normal",
                    fontStyle: settings.educationAreaItalic
                      ? "italic"
                      : "normal",
                  }}
                >
                  {` in ${edu.area}`}
                </Text>
              )}
            </View>
            {edu.score && (
              <Text
                style={[
                  styles.entrySummary,
                  {
                    fontFamily: settings.educationGpaBold ? boldFont : baseFont,
                    fontWeight: settings.educationGpaBold ? "bold" : "normal",
                    fontStyle: settings.educationGpaItalic
                      ? "italic"
                      : "normal",
                  },
                ]}
              >
                {edu.score.includes(":")
                  ? edu.score
                  : `GPA/Score: ${edu.score}`}
              </Text>
            )}
            {edu.courses && edu.courses.length > 0 && (
              <Text
                style={[
                  styles.entrySummary,
                  {
                    fontFamily: settings.educationCoursesBold
                      ? boldFont
                      : baseFont,
                    fontWeight: settings.educationCoursesBold
                      ? "bold"
                      : "normal",
                    fontStyle: settings.educationCoursesItalic
                      ? "italic"
                      : "normal",
                  },
                ]}
              >
                Courses: {edu.courses.join(", ")}
              </Text>
            )}
          </View>
        ))}
      </View>
    );
  };

  const getLevelScore = (level: string) => {
    const l = (level || "").toLowerCase();
    if (["beginner", "novice", "basic"].some((k) => l.includes(k))) return 1;
    if (["intermediate", "competent"].some((k) => l.includes(k))) return 3;
    if (
      ["advanced", "expert", "master", "proficient"].some((k) => l.includes(k))
    )
      return 5;
    return 3; // Default
  };

  const renderLanguages = () => {
    if (!languages || languages.length === 0) return null;

    return (
      <View key="languages" style={styles.section}>
        <View style={styles.sectionTitleWrapper}>
          <Text style={[styles.sectionTitle, { color: getColor("headings") }]}>
            Languages
          </Text>
        </View>
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          {languages.map((lang, index) => (
            <View
              key={index}
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginRight: settings.languagesListStyle === "none" ? 4 : 10,
                marginBottom: 4,
              }}
            >
              {settings.languagesListStyle === "bullet" && (
                <Text style={{ marginRight: 4, fontSize: fontSize }}>•</Text>
              )}
              {settings.languagesListStyle === "number" && (
                <Text style={{ marginRight: 4, fontSize: fontSize }}>
                  {index + 1}.
                </Text>
              )}
              <Text
                style={{
                  fontSize: fontSize,
                  fontFamily: settings.languagesNameBold ? boldFont : baseFont,
                  fontWeight: settings.languagesNameBold ? "bold" : "normal",
                  fontStyle: settings.languagesNameItalic ? "italic" : "normal",
                }}
              >
                {lang.language}
              </Text>
              {lang.fluency && (
                <Text
                  style={{
                    fontSize: fontSize,
                    fontFamily: settings.languagesFluencyBold
                      ? boldFont
                      : baseFont,
                    fontWeight: settings.languagesFluencyBold
                      ? "bold"
                      : "normal",
                    fontStyle: settings.languagesFluencyItalic
                      ? "italic"
                      : "normal",
                    marginLeft: 4,
                  }}
                >
                  ({lang.fluency})
                </Text>
              )}
              {settings.languagesListStyle === "none" &&
                index < languages.length - 1 && (
                  <Text style={{ fontSize: fontSize }}>,</Text>
                )}
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderSkills = () => {
    if (!skills || skills.length === 0) return null;

    const listStyle = settings.skillsListStyle || "blank"; // "bullet" | "dash" | "inline" | "blank"
    const levelStyle = settings.skillsLevelStyle ?? 0; // Default 0 (None)

    // Helper to render level
    const RenderLevel = ({ level }: { level: string }) => {
      if (!level || levelStyle === 0) return null;
      const score = getLevelScore(level); // 1-5
      const max = 5;

      // Style 1: Dots
      if (levelStyle === 1) {
        return (
          <View
            style={{
              flexDirection: "row",
              gap: 2,
              marginLeft: 6,
              alignItems: "center",
            }}
          >
            {[...Array(max)].map((_, i) => (
              <View
                key={i}
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: i < score ? getColor("decorations") : "#ddd",
                }}
              />
            ))}
          </View>
        );
      }

      // Style 2: Was Bars (Removed)
      if (levelStyle === 2) return null;
      // Style 3: Signal Bars (Growing height)
      if (levelStyle === 3) {
        return (
          <View
            style={{
              flexDirection: "row",
              gap: 2,
              marginLeft: 6,
              alignItems: "flex-end",
              height: 10,
            }}
          >
            {[...Array(max)].map((_, i) => (
              <View
                key={i}
                style={{
                  width: 4,
                  height: (i + 1) * 2,
                  backgroundColor: i < score ? getColor("decorations") : "#ddd",
                }}
              />
            ))}
          </View>
        );
      }
      // Style 4: Text
      return (
        <Text
          style={{
            fontSize: fontSize - 1,
            color: "#666",
            marginLeft: 6,
            fontStyle: "italic",
          }}
        >
          ({level})
        </Text>
      );
    };

    return (
      <View key="skills" style={styles.section}>
        <View style={styles.sectionTitleWrapper}>
          <Text style={[styles.sectionTitle, { color: getColor("headings") }]}>
            Skills
          </Text>
        </View>
        {listStyle === "inline" ? (
          <Text style={{ fontSize: fontSize, lineHeight: lineHeight }}>
            {skills.map((skill, index) => (
              <Text key={skill.id}>
                {index > 0 && " | "}
                <Text style={{ fontFamily: boldFont, fontWeight: "bold" }}>
                  {skill.name}
                </Text>
                {skill.keywords.join(", ")}
              </Text>
            ))}
          </Text>
        ) : (
          skills.map((skill) => (
            <View
              key={skill.id}
              style={{
                marginBottom: 4,
                flexDirection: "row",
                marginLeft: listStyle === "blank" ? 0 : 15, // Indent unless blank
                alignItems: "center",
              }}
            >
              {listStyle !== "blank" && (
                <Text style={{ marginRight: 5, fontSize: fontSize }}>
                  {listStyle === "bullet" ? "•" : "-"}
                </Text>
              )}
              <View
                style={{
                  flex: 1,
                  flexDirection: "row",
                  flexWrap: "wrap",
                  alignItems: "center",
                }}
              >
                <Text style={{ fontSize: fontSize }}>
                  <Text style={{ fontFamily: boldFont, fontWeight: "bold" }}>
                    {skill.name}:{" "}
                  </Text>
                  {skill.keywords.join(", ")}
                </Text>
                <RenderLevel level={skill.level} />
              </View>
            </View>
          ))
        )}
      </View>
    );
  };

  const renderProjects = () => {
    if (!projects || projects.length === 0) return null;
    return (
      <View key="projects" style={styles.section}>
        <View style={styles.sectionTitleWrapper}>
          <Text style={[styles.sectionTitle, { color: getColor("headings") }]}>
            Projects
          </Text>
        </View>
        {projects.map((proj) => (
          <View key={proj.id} style={styles.entryBlock}>
            <View style={styles.entryHeader}>
              <Text style={styles.entryTitle}>{proj.name}</Text>
              <Text style={{ ...styles.entryDate, minWidth: "auto" }}>
                {formatDate(proj.startDate)}{" "}
                {proj.endDate ? `— ${formatDate(proj.endDate)}` : ""}
              </Text>
            </View>
            {proj.url && (
              <Text
                style={{
                  fontSize: fontSize - 1,
                  fontFamily: italicFont,
                  fontStyle: "italic",
                  color: "#444",
                  marginBottom: 2,
                }}
              >
                {proj.url}
              </Text>
            )}
            <Text style={styles.entrySummary}>{proj.description}</Text>
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
            {proj.keywords && proj.keywords.length > 0 && (
              <Text
                style={{
                  ...styles.entrySummary,
                  marginTop: 2,
                  fontFamily: italicFont,
                  fontStyle: "italic",
                }}
              >
                Technologies: {proj.keywords.join(", ")}
              </Text>
            )}
          </View>
        ))}
      </View>
    );
  };

  const renderCertificates = () => {
    if (!certificates || certificates.length === 0) return null;
    return (
      <View key="certificates" style={styles.section}>
        <View style={styles.sectionTitleWrapper}>
          <Text style={[styles.sectionTitle, { color: getColor("headings") }]}>
            Certificates
          </Text>
        </View>
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          {certificates.map((cert, index) => (
            <View
              key={cert.id}
              style={{
                width:
                  settings.certificatesDisplayStyle === "grid" ? "48%" : "100%",
                marginRight:
                  settings.certificatesDisplayStyle === "grid" ? "2%" : 0,
                marginBottom: 10,
                flexDirection: "row",
              }}
            >
              {settings.certificatesListStyle === "bullet" && (
                <Text style={{ marginRight: 5, fontSize: fontSize }}>•</Text>
              )}
              {settings.certificatesListStyle === "number" && (
                <Text style={{ marginRight: 5, fontSize: fontSize }}>
                  {index + 1}.
                </Text>
              )}
              <View style={{ flex: 1 }}>
                <View style={styles.entryHeader}>
                  <Text
                    style={[
                      styles.entryTitle,
                      {
                        fontFamily: settings.certificatesNameBold
                          ? boldFont
                          : baseFont,
                        fontWeight: settings.certificatesNameBold
                          ? "bold"
                          : "normal",
                        fontStyle: settings.certificatesNameItalic
                          ? "italic"
                          : "normal",
                      },
                    ]}
                  >
                    {cert.name}
                  </Text>
                  <Text
                    style={[
                      styles.entryDate,
                      {
                        fontFamily: settings.certificatesDateBold
                          ? boldFont
                          : baseFont,
                        fontWeight: settings.certificatesDateBold
                          ? "bold"
                          : "normal",
                        fontStyle: settings.certificatesDateItalic
                          ? "italic"
                          : "normal",
                      },
                    ]}
                  >
                    {formatDate(cert.date)}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.entrySubtitle,
                    {
                      fontFamily: settings.certificatesIssuerBold
                        ? boldFont
                        : baseFont,
                      fontWeight: settings.certificatesIssuerBold
                        ? "bold"
                        : "normal",
                      fontStyle: settings.certificatesIssuerItalic
                        ? "italic"
                        : "normal",
                    },
                  ]}
                >
                  {cert.issuer}
                </Text>
                {cert.url && (
                  <Link
                    src={cert.url}
                    style={{
                      fontSize: fontSize,
                      color: getColor("links"),
                      textDecoration: "none",
                      marginBottom: 2,
                      fontFamily: settings.certificatesUrlBold
                        ? boldFont
                        : baseFont,
                      fontWeight: settings.certificatesUrlBold
                        ? "bold"
                        : "normal",
                      fontStyle: settings.certificatesUrlItalic
                        ? "italic"
                        : "normal",
                    }}
                  >
                    {cert.url}
                  </Link>
                )}
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderAwards = () => {
    if (!awards || awards.length === 0) return null;
    return (
      <View key="awards" style={styles.section}>
        <View style={styles.sectionTitleWrapper}>
          <Text style={[styles.sectionTitle, { color: getColor("headings") }]}>
            Awards
          </Text>
        </View>
        {awards.map((award, index) => (
          <View key={award.id} style={styles.entryBlock}>
            <View style={{ flexDirection: "row", marginBottom: 2 }}>
              {settings.awardsListStyle === "bullet" && (
                <Text style={{ marginRight: 5, fontSize: fontSize }}>•</Text>
              )}
              {settings.awardsListStyle === "number" && (
                <Text style={{ marginRight: 5, fontSize: fontSize }}>
                  {index + 1}.
                </Text>
              )}
              <View style={{ flex: 1 }}>
                <View style={styles.entryHeader}>
                  <Text
                    style={[
                      styles.entryTitle,
                      {
                        fontFamily: settings.awardsTitleBold
                          ? boldFont
                          : baseFont,
                        fontWeight: settings.awardsTitleBold
                          ? "bold"
                          : "normal",
                        fontStyle: settings.awardsTitleItalic
                          ? "italic"
                          : "normal",
                      },
                    ]}
                  >
                    {award.title}
                  </Text>
                  <Text
                    style={[
                      styles.entryDate,
                      {
                        fontFamily: settings.awardsDateBold
                          ? boldFont
                          : baseFont,
                        fontWeight: settings.awardsDateBold ? "bold" : "normal",
                        fontStyle: settings.awardsDateItalic
                          ? "italic"
                          : "normal",
                      },
                    ]}
                  >
                    {formatDate(award.date)}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.entrySubtitle,
                    {
                      fontFamily: settings.awardsAwarderBold
                        ? boldFont
                        : baseFont,
                      fontWeight: settings.awardsAwarderBold
                        ? "bold"
                        : "normal",
                      fontStyle: settings.awardsAwarderItalic
                        ? "italic"
                        : "normal",
                    },
                  ]}
                >
                  {award.awarder}
                </Text>
                {award.summary && (
                  <Text style={styles.entrySummary}>{award.summary}</Text>
                )}
              </View>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderPublications = () => {
    if (!publications || publications.length === 0) return null;
    return (
      <View key="publications" style={styles.section}>
        <View style={styles.sectionTitleWrapper}>
          <Text style={[styles.sectionTitle, { color: getColor("headings") }]}>
            Publications
          </Text>
        </View>
        {publications.map((pub, index) => (
          <View key={pub.id} style={styles.entryBlock}>
            <View style={{ flexDirection: "row", marginBottom: 2 }}>
              {settings.publicationsListStyle === "bullet" && (
                <Text style={{ marginRight: 5, fontSize: fontSize }}>•</Text>
              )}
              {settings.publicationsListStyle === "number" && (
                <Text style={{ marginRight: 5, fontSize: fontSize }}>
                  {index + 1}.
                </Text>
              )}
              <View style={{ flex: 1 }}>
                <View style={styles.entryHeader}>
                  <Text
                    style={[
                      styles.entryTitle,
                      {
                        fontFamily: settings.publicationsNameBold
                          ? boldFont
                          : baseFont,
                        fontWeight: settings.publicationsNameBold
                          ? "bold"
                          : "normal",
                        fontStyle: settings.publicationsNameItalic
                          ? "italic"
                          : "normal",
                      },
                    ]}
                  >
                    {pub.name}
                  </Text>
                  <Text
                    style={[
                      styles.entryDate,
                      {
                        fontFamily: settings.publicationsDateBold
                          ? boldFont
                          : baseFont,
                        fontWeight: settings.publicationsDateBold
                          ? "bold"
                          : "normal",
                        fontStyle: settings.publicationsDateItalic
                          ? "italic"
                          : "normal",
                      },
                    ]}
                  >
                    {formatDate(pub.releaseDate)}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.entrySubtitle,
                    {
                      fontFamily: settings.publicationsPublisherBold
                        ? boldFont
                        : baseFont,
                      fontWeight: settings.publicationsPublisherBold
                        ? "bold"
                        : "normal",
                      fontStyle: settings.publicationsPublisherItalic
                        ? "italic"
                        : "normal",
                    },
                  ]}
                >
                  {pub.publisher}
                </Text>
                {pub.url && (
                  <Link
                    src={pub.url}
                    style={{
                      fontSize: fontSize,
                      color: getColor("links"),
                      textDecoration: "none",
                      marginBottom: 2,
                      fontFamily: settings.publicationsUrlBold
                        ? boldFont
                        : baseFont,
                      fontWeight: settings.publicationsUrlBold
                        ? "bold"
                        : "normal",
                      fontStyle: settings.publicationsUrlItalic
                        ? "italic"
                        : "normal",
                    }}
                  >
                    {pub.url}
                  </Link>
                )}
                {pub.summary && (
                  <Text style={styles.entrySummary}>{pub.summary}</Text>
                )}
              </View>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderReferences = () => {
    if (!references || references.length === 0) return null;
    return (
      <View key="references" style={styles.section}>
        <View style={styles.sectionTitleWrapper}>
          <Text style={[styles.sectionTitle, { color: getColor("headings") }]}>
            References
          </Text>
        </View>
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          {references.map((ref, index) => (
            <View
              key={index}
              style={{
                width: "48%",
                marginRight: "2%",
                marginBottom: 10,
                flexDirection: "row",
              }}
            >
              {settings.referencesListStyle === "bullet" && (
                <Text style={{ marginRight: 5, fontSize: fontSize }}>•</Text>
              )}
              {settings.referencesListStyle === "number" && (
                <Text style={{ marginRight: 5, fontSize: fontSize }}>
                  {index + 1}.
                </Text>
              )}
              <View>
                <Text
                  style={{
                    fontSize: fontSize,
                    fontFamily: settings.referencesNameBold
                      ? boldFont
                      : baseFont,
                    fontWeight: settings.referencesNameBold ? "bold" : "normal",
                    fontStyle: settings.referencesNameItalic
                      ? "italic"
                      : "normal",
                  }}
                >
                  {ref.name}
                </Text>
                <Text
                  style={{
                    fontSize: fontSize,
                    color: "#4b5563",
                    fontFamily: settings.referencesPositionBold
                      ? boldFont
                      : baseFont,
                    fontWeight: settings.referencesPositionBold
                      ? "bold"
                      : "normal",
                    fontStyle: settings.referencesPositionItalic
                      ? "italic"
                      : "normal",
                  }}
                >
                  {ref.position}
                </Text>
                {ref.reference && (
                  <Text style={{ fontSize: fontSize, color: "#4b5563" }}>
                    {ref.reference}
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };
  const renderInterests = () => {
    if (!interests || interests.length === 0) return null;
    return (
      <View key="interests" style={styles.section}>
        <View style={styles.sectionTitleWrapper}>
          <Text style={[styles.sectionTitle, { color: getColor("headings") }]}>
            Interests
          </Text>
        </View>
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          {interests.map((int, index) => (
            <View
              key={index}
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginRight: settings.interestsListStyle === "none" ? 4 : 10,
                marginBottom: 4,
              }}
            >
              {settings.interestsListStyle === "bullet" && (
                <Text style={{ marginRight: 4, fontSize: fontSize }}>•</Text>
              )}
              {settings.interestsListStyle === "number" && (
                <Text style={{ marginRight: 4, fontSize: fontSize }}>
                  {index + 1}.
                </Text>
              )}
              <Text
                style={{
                  fontSize: fontSize,
                  fontFamily: settings.interestsNameBold ? boldFont : baseFont,
                  fontWeight: settings.interestsNameBold ? "bold" : "normal",
                  fontStyle: settings.interestsNameItalic ? "italic" : "normal",
                }}
              >
                {int.name}
              </Text>
              {int.keywords && int.keywords.length > 0 && (
                <Text
                  style={{
                    fontSize: fontSize,
                    fontFamily: settings.interestsKeywordsBold
                      ? boldFont
                      : baseFont,
                    fontWeight: settings.interestsKeywordsBold
                      ? "bold"
                      : "normal",
                    fontStyle: settings.interestsKeywordsItalic
                      ? "italic"
                      : "normal",
                  }}
                >
                  : {int.keywords.join(", ")}
                </Text>
              )}
              {settings.interestsListStyle === "none" &&
                index < interests.length - 1 && (
                  <Text style={{ fontSize: fontSize }}>,</Text>
                )}
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderCustom = () => {
    if (!custom || custom.length === 0) return null;
    return (
      <View key="custom-sections">
        {custom.map((sec) => (
          <View key={sec.id} style={styles.section}>
            <View style={styles.sectionTitleWrapper}>
              <Text
                style={[styles.sectionTitle, { color: getColor("headings") }]}
              >
                {sec.name}
              </Text>
            </View>
            {sec.items.map((item, index) => (
              <View key={item.id} style={styles.entryBlock}>
                <View style={{ flexDirection: "row", marginBottom: 2 }}>
                  {settings.customSectionListStyle === "bullet" && (
                    <Text style={{ marginRight: 5, fontSize: fontSize }}>
                      •
                    </Text>
                  )}
                  {settings.customSectionListStyle === "number" && (
                    <Text style={{ marginRight: 5, fontSize: fontSize }}>
                      {index + 1}.
                    </Text>
                  )}
                  <View style={{ flex: 1 }}>
                    <View style={styles.entryHeader}>
                      <Text
                        style={[
                          styles.entryTitle,
                          {
                            fontFamily: settings.customSectionNameBold
                              ? boldFont
                              : baseFont,
                            fontWeight: settings.customSectionNameBold
                              ? "bold"
                              : "normal",
                            fontStyle: settings.customSectionNameItalic
                              ? "italic"
                              : "normal",
                          },
                        ]}
                      >
                        {item.name}
                      </Text>
                      <Text
                        style={[
                          styles.entryDate,
                          {
                            fontFamily: settings.customSectionDateBold
                              ? boldFont
                              : baseFont,
                            fontWeight: settings.customSectionDateBold
                              ? "bold"
                              : "normal",
                            fontStyle: settings.customSectionDateItalic
                              ? "italic"
                              : "normal",
                          },
                        ]}
                      >
                        {formatDate(item.date)}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.entrySubtitle,
                        {
                          fontFamily: settings.customSectionDescriptionBold
                            ? boldFont
                            : baseFont,
                          fontWeight: settings.customSectionDescriptionBold
                            ? "bold"
                            : "normal",
                          fontStyle: settings.customSectionDescriptionItalic
                            ? "italic"
                            : "normal",
                        },
                      ]}
                    >
                      {item.description}
                    </Text>
                    {item.url && (
                      <Link
                        src={item.url}
                        style={{
                          fontSize: fontSize,
                          color: getColor("links"),
                          textDecoration: "none",
                          marginBottom: 2,
                          fontFamily: settings.customSectionUrlBold
                            ? boldFont
                            : baseFont,
                          fontWeight: settings.customSectionUrlBold
                            ? "bold"
                            : "normal",
                          fontStyle: settings.customSectionUrlItalic
                            ? "italic"
                            : "normal",
                        }}
                      >
                        {item.url}
                      </Link>
                    )}
                    {item.summary && (
                      <Text style={styles.entrySummary}>{item.summary}</Text>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </View>
        ))}
      </View>
    );
  };

  const SECTION_RENDERERS = {
    summary: renderSummary,
    work: renderWork,
    education: renderEducation,
    skills: renderSkills,
    projects: renderProjects,
    certificates: renderCertificates,
    awards: renderAwards,
    publications: renderPublications,
    languages: renderLanguages,
    interests: renderInterests,
    references: renderReferences,
    custom: renderCustom,
  };

  const order =
    settings.sectionOrder && settings.sectionOrder.length > 0
      ? settings.sectionOrder
      : [
          "summary",
          "work",
          "education",
          "skills",
          "projects",
          "certificates",
          "languages",
          "interests",
          "awards",
          "publications",
          "references",
          "custom",
        ];

  // Logic to split sections if columnCount === 2
  // We'll assume a default split if not explicitly managed by a complex UI
  const LHS_SECTIONS = [
    "skills",
    "education",
    "languages",
    "interests",
    "awards",
    "certificates",
    "references",
  ];
  const RHS_SECTIONS = ["summary", "work", "projects", "custom"];
  // Note: 'education' is tricky. In classic resumes, it's often at top or bottom.
  // If user sets 2 columns, they usually want a sidebar.
  // We will respect the *order* array but filter them into two lists.

  const leftColumnContent = order.filter((id) => LHS_SECTIONS.includes(id));
  const rightColumnContent = order.filter((id) => RHS_SECTIONS.includes(id));

  // If a section is NOT in either list (e.g. unknown custom), put it in Right (Main).
  const knownSections = [...LHS_SECTIONS, ...RHS_SECTIONS];
  const orphans = order.filter((id) => !knownSections.includes(id));
  rightColumnContent.push(...orphans);

  // For Single Column, just use 'order'

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {renderHeader()}

        {columnCount === 1 ? (
          <View>
            {order.map((sectionId) => {
              const renderer =
                SECTION_RENDERERS[sectionId as keyof typeof SECTION_RENDERERS];
              return renderer ? renderer() : null;
            })}
          </View>
        ) : (
          <View style={styles.columnsContainer}>
            {/* Left Column (Sidebar) */}
            <View style={styles.leftColumn}>
              {leftColumnContent.map((sectionId) => {
                const renderer =
                  SECTION_RENDERERS[
                    sectionId as keyof typeof SECTION_RENDERERS
                  ];
                return renderer ? renderer() : null;
              })}
            </View>

            {/* Right Column (Main) */}
            <View style={styles.rightColumn}>
              {rightColumnContent.map((sectionId) => {
                const renderer =
                  SECTION_RENDERERS[
                    sectionId as keyof typeof SECTION_RENDERERS
                  ];
                return renderer ? renderer() : null;
              })}
            </View>
          </View>
        )}
      </Page>
    </Document>
  );
}

export async function generateClassicPDF(resume: Resume): Promise<Blob> {
  const doc = <ClassicTemplate resume={resume} />;
  const blob = await pdf(doc).toBlob();
  return blob;
}
