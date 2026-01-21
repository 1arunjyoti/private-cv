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
import { useMemo, useCallback } from "react";
import type { Resume } from "@/db";
import { PDFRichText } from "./PDFRichText";
import { getTemplateDefaults } from "@/lib/template-defaults";
import {
  mmToPt,
  formatDate,
  getLevelScore,
  PROFILE_IMAGE_SIZES,
} from "@/lib/template-utils";
import "@/lib/fonts";
import { getSectionHeadingWrapperStyles } from "@/lib/template-styles";

// Static styles that don't depend on props or settings
const staticStyles = StyleSheet.create({
  mainContainer: {
    flexDirection: "row",
    gap: "4%",
  },
  entryBlock: {
    marginBottom: 6,
  },
  entryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 2,
    flexWrap: "wrap",
  },
  sidebarItem: {
    marginBottom: 3,
  },
});

interface ProfessionalTemplateProps {
  resume: Resume;
}

export function ProfessionalTemplate({ resume }: ProfessionalTemplateProps) {
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

  // Merge template defaults with resume settings - memoized to prevent recreation
  const templateDefaults = getTemplateDefaults(
    resume.meta.templateId || "professional",
  );
  const settings = useMemo(
    () => ({ ...templateDefaults, ...resume.meta.layoutSettings }),
    [templateDefaults, resume.meta.layoutSettings],
  );

  // Defaults and calculations
  const fontSize = settings.fontSize || 9;
  const lineHeight = settings.lineHeight || 1.4;
  const sectionMargin = settings.sectionMargin || 10;
  const bulletMargin = settings.bulletMargin || 1;
  const marginH = mmToPt(settings.marginHorizontal || 15);
  const marginV = mmToPt(settings.marginVertical || 15);

  // Column sizing
  const columnCount = settings.columnCount || 2;
  const leftColumnWidthPercent = settings.leftColumnWidth || 30;
  // If 2 columns, calculate right width. If 1 column, these don't matter much (logic handles it)
  const rightColumnWidthPercent = 100 - leftColumnWidthPercent - 4; // 4% gap

  const layoutHeaderPos = settings.headerPosition || "left";
  const headerAlign: "left" | "center" | "right" =
    layoutHeaderPos === "left" || layoutHeaderPos === "right"
      ? layoutHeaderPos
      : "center";

  // Typography
  const baseFont = settings.fontFamily || "Roboto";
  const boldFont = settings.fontFamily || "Roboto";
  const italicFont = settings.fontFamily || "Roboto";

  const colorTargets = useMemo(
    () => settings.themeColorTarget || [],
    [settings.themeColorTarget],
  );

  const themeColor = resume.meta.themeColor;
  const getColor = useCallback(
    (target: string, fallback: string = "#000000") => {
      return colorTargets.includes(target) ? themeColor : fallback;
    },
    [colorTargets, themeColor],
  );

  // Memoize dynamic styles that depend on settings/props
  const styles = useMemo(
    () =>
      StyleSheet.create({
        page: {
          paddingHorizontal: marginH,
          paddingVertical: marginV,
          fontFamily: baseFont,
          fontSize: fontSize,
          lineHeight: lineHeight,
          color: "#000",
          flexDirection: "column",
        },
        header: {
          marginBottom: settings.headerBottomMargin ?? sectionMargin,
          borderBottomWidth: settings.sectionHeadingStyle === 1 ? 1 : 0,
          borderBottomColor: colorTargets.includes("decorations")
            ? resume.meta.themeColor
            : "#000000",
          paddingBottom: 10,
          width: "100%",
        },
        leftColumn: {
          width: `${leftColumnWidthPercent}%`,
        },
        rightColumn: {
          width: `${rightColumnWidthPercent}%`,
        },

        // Text elements
        name: {
          fontSize: settings.nameFontSize || 24,
          fontWeight: settings.nameBold ? "bold" : "normal",
          fontFamily:
            settings.nameFont === "creative"
              ? "Helvetica"
              : settings.nameBold
                ? boldFont
                : baseFont,
          textTransform: "uppercase",
          color: colorTargets.includes("name")
            ? resume.meta.themeColor
            : "#000000",
          lineHeight: settings.nameLineHeight || 1.2,
          marginBottom: 4,
        },
        title: {
          fontSize: settings.titleFontSize || 14,
          color: colorTargets.includes("title")
            ? resume.meta.themeColor
            : "#444",
          marginBottom: 4,
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
          rowGap: 2,
          columnGap: 0,
          fontSize: settings.contactFontSize || fontSize,
          marginTop: 2,
        },

        // Section Common
        section: {
          marginBottom: sectionMargin,
        },

        sectionTitleWrapper: {
          ...getSectionHeadingWrapperStyles(settings, getColor),
          marginBottom: 6,
        },
        sectionTitle: {
          fontSize:
            settings.sectionHeadingSize === "L" ? fontSize + 2 : fontSize + 1,
          fontWeight: settings.sectionHeadingBold ? "bold" : "normal",
          fontFamily: settings.sectionHeadingBold ? boldFont : baseFont,
          textTransform: settings.sectionHeadingCapitalization,
          color: colorTargets.includes("headings")
            ? resume.meta.themeColor
            : "#000000",
        },

        // Entry Styles
        entryTitle: {
          fontSize:
            settings.entryTitleSize === "L" ? fontSize + 2 : fontSize + 1,
          fontWeight: "bold",
          fontFamily: boldFont,
        },
        entrySubtitle: {
          fontSize: fontSize,
          fontWeight:
            settings.entrySubtitleStyle === "bold" ? "bold" : "normal",
          fontStyle:
            settings.entrySubtitleStyle === "italic" ? "italic" : "normal",
          fontFamily:
            settings.entrySubtitleStyle === "bold"
              ? boldFont
              : settings.entrySubtitleStyle === "italic"
                ? italicFont
                : baseFont,
          marginBottom: 1,
        },
        entryDate: {
          fontSize: fontSize - 0.5,
          color: "#666",
          textAlign: "right",
          fontFamily: italicFont,
          fontStyle: "italic",
          minWidth: 60,
        },
        entryLocation: {
          fontSize: fontSize - 0.5,
          fontStyle: "italic",
          fontFamily: italicFont,
          color: "#666",
        },
        entrySummary: {
          marginTop: 2,
          marginBottom: 2,
          marginLeft: settings.entryIndentBody ? 8 : 0,
        },

        // Lists
        bulletList: {
          marginLeft: settings.entryIndentBody ? 16 : 8,
        },
        bulletItem: {
          flexDirection: "row",
          marginBottom: bulletMargin,
        },
        bullet: {
          minWidth: 6,
          fontSize: fontSize,
          lineHeight: 1.3,
          marginRight: 2,
        },
        bulletText: {
          flex: 1,
          fontSize: fontSize,
          lineHeight: 1.3,
        },

        link: {
          textDecoration: "none",
          color: colorTargets.includes("links")
            ? resume.meta.themeColor
            : "#000",
        },
      }),
    [
      marginH,
      marginV,
      baseFont,
      fontSize,
      lineHeight,
      sectionMargin,
      bulletMargin,
      settings,
      leftColumnWidthPercent,
      rightColumnWidthPercent,
      headerAlign,
      boldFont,
      italicFont,
      colorTargets,
      resume.meta.themeColor,
      getColor,
    ],
  );

  // --- Renderers ---

  const contactStyle = {
    fontWeight: (settings.contactBold ? "bold" : "normal") as "bold" | "normal",
    fontStyle: (settings.contactItalic ? "italic" : "normal") as
      | "italic"
      | "normal",
    fontFamily: baseFont,
    fontSize: settings.contactFontSize || fontSize,
  };

  const ProfileImage = () => {
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
          borderColor: getColor("decorations"),
          objectFit: "cover",
          marginBottom: 10,
        }}
      />
    );
  };

  const renderHeader = () => {
    const isRight = headerAlign === "right";
    const isCenter = headerAlign === "center";
    const contactLayout = settings.personalDetailsArrangement; // 1 = Row, 2 = Column

    // Helper to render an item
    const renderContactItem = (
      value: string,
      isLink: boolean = false,
      href?: string,
    ) => {
      return (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          {href ? (
            <Link src={href} style={{ textDecoration: "none" }}>
              <Text
                style={[
                  contactStyle,
                  isLink ? { color: getColor("links") } : {},
                ]}
              >
                {value}
              </Text>
            </Link>
          ) : (
            <Text
              style={[contactStyle, isLink ? { color: getColor("links") } : {}]}
            >
              {value}
            </Text>
          )}
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
          <Text style={[styles.name, { textAlign: headerAlign }]}>
            {basics.name}
          </Text>
          <Text style={[styles.title, { textAlign: headerAlign }]}>
            {basics.label}
          </Text>

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
            {/* Contact Items - Similar to Classic logic */}
            {/* Email */}
            {basics.email &&
              (contactLayout === 2 ? (
                renderContactItem(basics.email, true, `mailto:${basics.email}`)
              ) : (
                <Link
                  src={`mailto:${basics.email}`}
                  style={{ textDecoration: "none" }}
                >
                  <Text style={[contactStyle, { color: getColor("links") }]}>
                    {basics.email}
                  </Text>
                </Link>
              ))}

            {/* Phone */}
            {basics.phone &&
              (contactLayout === 2 ? (
                renderContactItem(basics.phone, false, `tel:${basics.phone}`)
              ) : (
                <>
                  <Text style={{ color: getColor("decorations") }}>
                    {settings.contactSeparator === "dash"
                      ? " - "
                      : settings.contactSeparator === "comma"
                        ? ", "
                        : " | "}
                  </Text>
                  <Link
                    src={`tel:${basics.phone}`}
                    style={{ textDecoration: "none" }}
                  >
                    <Text style={[contactStyle, { color: getColor("links") }]}>
                      {basics.phone}
                    </Text>
                  </Link>
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
                renderContactItem(basics.url, true, basics.url)
              ) : (
                <>
                  <Text style={{ color: getColor("decorations") }}>
                    {settings.contactSeparator === "dash"
                      ? " - "
                      : settings.contactSeparator === "comma"
                        ? ", "
                        : " | "}
                  </Text>
                  <Link src={basics.url} style={{ textDecoration: "none" }}>
                    <Text style={[contactStyle, { color: getColor("links") }]}>
                      {basics.url.replace(/^https?:\/\//, "")}
                    </Text>
                  </Link>
                </>
              ))}

            {/* Profiles */}
            {basics.profiles?.map((p) => {
              const url = p.url;
              const label = p.network;
              // Basic implementation for brevity, can be expanded to full Classic logic if needed
              return contactLayout === 2 ? (
                <View key={p.network}>
                  {renderContactItem(label, true, url)}
                </View>
              ) : (
                <View key={p.network} style={{ flexDirection: "row" }}>
                  <Text style={{ color: getColor("decorations") }}>
                    {settings.contactSeparator === "dash"
                      ? " - "
                      : settings.contactSeparator === "comma"
                        ? ", "
                        : " | "}
                  </Text>
                  <Link src={url} style={{ textDecoration: "none" }}>
                    <Text style={[contactStyle, { color: getColor("links") }]}>
                      {label}
                    </Text>
                  </Link>
                </View>
              );
            })}
          </View>
        </View>

        {isRight && <ProfileImage />}
      </View>
    );
  };

  const renderSectionTitle = (title: string) => (
    <View style={styles.sectionTitleWrapper}>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );

  // --- Dynamic Content Renderers ---

  const renderSummary = () => {
    if (!basics.summary) return null;
    return (
      <View style={styles.section}>
        {((settings.summaryHeadingVisible ?? true) as boolean) &&
          renderSectionTitle("Professional Summary")}
        <PDFRichText
          text={basics.summary}
          style={{ fontSize: fontSize, lineHeight: lineHeight }}
          fontSize={fontSize}
        />
      </View>
    );
  };

  const renderExperience = () => {
    if (!work || work.length === 0) return null;
    return (
      <View style={styles.section}>
        {((settings.workHeadingVisible ?? true) as boolean) &&
          renderSectionTitle("Experience")}
        {work.map((exp, index) => (
          <View key={exp.id} style={staticStyles.entryBlock}>
            <View style={staticStyles.entryHeader}>
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
                      : baseFont,
                    fontWeight: settings.experienceDateBold ? "bold" : "normal",
                    fontStyle: settings.experienceDateItalic
                      ? "italic"
                      : "normal",
                  },
                ]}
              >
                {formatDate(exp.startDate)} - {formatDate(exp.endDate)}
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 2,
              }}
            >
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
            </View>

            {exp.summary && (
              <View style={styles.entrySummary}>
                <PDFRichText
                  text={exp.summary}
                  fontSize={fontSize}
                  style={{ fontSize }}
                />
              </View>
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

  const renderProjects = () => {
    if (!projects || projects.length === 0) return null;
    return (
      <View style={styles.section}>
        {((settings.projectsHeadingVisible ?? true) as boolean) &&
          renderSectionTitle("Projects")}
        {projects.map((proj, index) => (
          <View key={proj.id} style={staticStyles.entryBlock}>
            <View style={staticStyles.entryHeader}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                {settings.projectsListStyle === "bullet" && (
                  <Text style={{ marginRight: 4, fontSize: fontSize }}>•</Text>
                )}
                {settings.projectsListStyle === "number" && (
                  <Text style={{ marginRight: 4, fontSize: fontSize }}>
                    {index + 1}.
                  </Text>
                )}
                <Text
                  style={[
                    styles.entryTitle,
                    {
                      fontFamily: settings.projectsNameBold
                        ? boldFont
                        : baseFont,
                      fontWeight: settings.projectsNameBold ? "bold" : "normal",
                      fontStyle: settings.projectsNameItalic
                        ? "italic"
                        : "normal",
                    },
                  ]}
                >
                  {proj.name}
                </Text>
              </View>
              <View>
                {proj.startDate && (
                  <Text
                    style={[
                      styles.entryDate,
                      {
                        fontFamily: settings.projectsDateItalic
                          ? italicFont
                          : baseFont,
                        fontWeight: settings.projectsDateBold
                          ? "bold"
                          : "normal",
                        fontStyle: settings.projectsDateItalic
                          ? "italic"
                          : "normal",
                      },
                    ]}
                  >
                    {formatDate(proj.startDate)} - {formatDate(proj.endDate)}
                  </Text>
                )}
              </View>
            </View>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <View style={{ marginBottom: 2 }}>
                <PDFRichText
                  text={proj.description}
                  style={styles.entrySubtitle}
                  fontSize={fontSize}
                />
                {/* URL was here but flex logic made it tricky with RichText. Moving URL to header or own line if needed, but keeping simple for now */}
              </View>
              {proj.url && (
                <Link
                  src={proj.url}
                  style={{
                    fontSize: fontSize - 1,
                    color: getColor("links"),
                    fontWeight: settings.projectsUrlBold ? "bold" : "normal",
                    fontStyle: settings.projectsUrlItalic ? "italic" : "normal",
                    fontFamily: settings.projectsUrlBold
                      ? boldFont
                      : settings.projectsUrlItalic
                        ? italicFont
                        : baseFont,
                    textDecoration: "none",
                  }}
                >
                  {proj.url.replace(/^https?:\/\//, "")}
                </Link>
              )}
            </View>
            {proj.highlights && proj.highlights.length > 0 && (
              <View style={styles.bulletList}>
                {proj.highlights.map((h, i) => (
                  <View key={i} style={styles.bulletItem}>
                    {settings.projectsAchievementsListStyle === "bullet" && (
                      <Text style={styles.bullet}>•</Text>
                    )}
                    {settings.projectsAchievementsListStyle === "number" && (
                      <Text style={styles.bullet}>{i + 1}.</Text>
                    )}
                    <Text
                      style={[
                        styles.bulletText,
                        {
                          fontFamily: settings.projectsFeaturesBold
                            ? boldFont
                            : baseFont,
                          fontWeight: settings.projectsFeaturesBold
                            ? "bold"
                            : "normal",
                          fontStyle: settings.projectsFeaturesItalic
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
            {proj.keywords && proj.keywords.length > 0 && (
              <Text
                style={{
                  ...styles.entrySummary,
                  marginTop: 2,
                  fontFamily: settings.projectsTechnologiesBold
                    ? boldFont
                    : baseFont,
                  fontWeight: settings.projectsTechnologiesBold
                    ? "bold"
                    : "normal",
                  fontStyle: settings.projectsTechnologiesItalic
                    ? "italic"
                    : "normal",
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

  const renderSkills = () => {
    if (!skills || skills.length === 0) return null;

    // Support List Style & Level Style
    const listStyle = settings.skillsListStyle;
    const levelStyle = settings.skillsLevelStyle ?? 0;

    const RenderLevel = ({ level }: { level: string }) => {
      if (!level || levelStyle === 0) return null;
      const score = getLevelScore(level);
      const max = 5;
      if (levelStyle === 1) {
        // Dots
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
      if (levelStyle === 3) {
        // Bars
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
      <View style={styles.section}>
        {((settings.skillsHeadingVisible ?? true) as boolean) &&
          renderSectionTitle("Skills")}
        {listStyle === "inline" ? (
          <Text style={{ fontSize: fontSize, lineHeight: lineHeight }}>
            {skills.map((skill, index) => (
              <Text key={skill.id}>
                {index > 0 && " | "}
                <Text style={{ fontFamily: boldFont, fontWeight: "bold" }}>
                  {skill.name}
                </Text>
                {skill.keywords.length > 0 && `: ${skill.keywords.join(", ")}`}
              </Text>
            ))}
          </Text>
        ) : (
          <View>
            {skills.map((skill, index) => (
              <View
                key={skill.id}
                style={{ marginBottom: 6, flexDirection: "row" }}
              >
                {settings.skillsListStyle === "bullet" && (
                  <Text style={{ marginRight: 4, fontSize: fontSize }}>•</Text>
                )}
                {settings.skillsListStyle === "dash" && (
                  <Text style={{ marginRight: 4, fontSize: fontSize }}>-</Text>
                )}
                {settings.skillsListStyle === "number" && (
                  <Text style={{ marginRight: 4, fontSize: fontSize }}>
                    {index + 1}.
                  </Text>
                )}
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontWeight: "bold",
                      fontSize: fontSize,
                      fontFamily: boldFont,
                    }}
                  >
                    {skill.name}
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      flexWrap: "wrap",
                      gap: 4,
                      alignItems: "center",
                    }}
                  >
                    {skill.keywords.map((kw, k) => (
                      <Text
                        key={k}
                        style={{ fontSize: fontSize - 0.5, color: "#444" }}
                      >
                        {kw}
                        {k < skill.keywords.length - 1 ? "," : ""}
                      </Text>
                    ))}
                    <RenderLevel level={skill.level} />
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderEducation = () => {
    if (!education || education.length === 0) return null;
    // Education can be detailed or simple sidebar style
    // We'll impl detailed but allowing it to fit in sidebar naturally
    return (
      <View style={styles.section}>
        {((settings.educationHeadingVisible ?? true) as boolean) &&
          renderSectionTitle("Education")}
        {education.map((edu, index) => (
          <View key={edu.id} style={{ marginBottom: 6 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                flexWrap: "wrap",
              }}
            >
              <View style={{ flexDirection: "row", flex: 1 }}>
                {settings.educationInstitutionListStyle === "bullet" && (
                  <Text style={{ marginRight: 4, fontSize: fontSize }}>•</Text>
                )}
                {settings.educationInstitutionListStyle === "number" && (
                  <Text style={{ marginRight: 4, fontSize: fontSize }}>
                    {index + 1}.
                  </Text>
                )}
                <Text
                  style={{
                    fontWeight: settings.educationInstitutionBold
                      ? "bold"
                      : "normal",
                    fontStyle: settings.educationInstitutionItalic
                      ? "italic"
                      : "normal",
                    fontSize: fontSize,
                    fontFamily: settings.educationInstitutionBold
                      ? boldFont
                      : settings.educationInstitutionItalic
                        ? italicFont
                        : baseFont,
                  }}
                >
                  {edu.institution}
                </Text>
              </View>
              <Text
                style={{
                  fontSize: fontSize - 1,
                  color: "#666",
                  fontStyle: settings.educationDateItalic ? "italic" : "normal",
                  fontWeight: settings.educationDateBold ? "bold" : "normal",
                  fontFamily: settings.educationDateItalic
                    ? italicFont
                    : settings.educationDateBold
                      ? boldFont
                      : baseFont,
                  textAlign: "right",
                }}
              >
                {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
              </Text>
            </View>

            <Text
              style={{
                fontSize: fontSize,
              }}
            >
              <Text
                style={{
                  fontWeight: settings.educationDegreeBold ? "bold" : "normal",
                  fontStyle: settings.educationDegreeItalic
                    ? "italic"
                    : "normal",
                  fontFamily: settings.educationDegreeBold
                    ? boldFont
                    : settings.educationDegreeItalic
                      ? italicFont
                      : baseFont,
                }}
              >
                {edu.studyType}
              </Text>
              {edu.area && (
                <Text
                  style={{
                    fontFamily: settings.educationAreaBold
                      ? boldFont
                      : baseFont,
                    fontWeight: settings.educationAreaBold ? "bold" : "normal",
                    fontStyle: settings.educationAreaItalic
                      ? "italic"
                      : "normal",
                  }}
                >
                  {` ${edu.area}`}
                </Text>
              )}
            </Text>

            {edu.score && (
              <Text
                style={{
                  fontSize: fontSize - 1,
                  fontFamily: settings.educationGpaBold ? boldFont : baseFont,
                  fontWeight: settings.educationGpaBold ? "bold" : "normal",
                  fontStyle: settings.educationGpaItalic ? "italic" : "normal",
                }}
              >
                {edu.score}
              </Text>
            )}

            {edu.summary && (
              <View style={{ marginTop: 2, marginBottom: 2 }}>
                <PDFRichText
                  text={edu.summary}
                  fontSize={fontSize}
                  style={{ fontSize }}
                />
              </View>
            )}

            {edu.courses && edu.courses.length > 0 && (
              <Text
                style={{
                  fontSize: fontSize,
                  marginTop: 2,
                  fontFamily: settings.educationCoursesBold
                    ? boldFont
                    : baseFont,
                  fontWeight: settings.educationCoursesBold ? "bold" : "normal",
                  fontStyle: settings.educationCoursesItalic
                    ? "italic"
                    : "normal",
                }}
              >
                Courses: {edu.courses.join(", ")}
              </Text>
            )}
          </View>
        ))}
      </View>
    );
  };

  const renderLanguages = () => {
    if (!languages || languages.length === 0) return null;
    return (
      <View style={styles.section}>
        {((settings.languagesHeadingVisible ?? true) as boolean) &&
          renderSectionTitle("Languages")}
        {languages.map((lang, index) => (
          <View
            key={lang.id}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 2,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
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
            </View>
            <Text
              style={{
                fontSize: fontSize,
                color: "#666",
                fontFamily: settings.languagesFluencyBold
                  ? boldFont
                  : settings.languagesFluencyItalic
                    ? italicFont
                    : baseFont,
                fontWeight: settings.languagesFluencyBold ? "bold" : "normal",
                fontStyle: settings.languagesFluencyItalic
                  ? "italic"
                  : "normal",
              }}
            >
              {lang.fluency}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const renderCertificates = () => {
    if (!certificates || certificates.length === 0) return null;
    return (
      <View style={styles.section}>
        {((settings.certificatesHeadingVisible ?? true) as boolean) &&
          renderSectionTitle("Certifications")}
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          {certificates.map((cert, index) => (
            <View
              key={cert.id}
              style={{
                marginBottom: 4,
                width:
                  settings.certificatesDisplayStyle === "grid" ? "48%" : "100%",
                marginRight:
                  settings.certificatesDisplayStyle === "grid" ? "2%" : 0,
              }}
            >
              <View style={{ flexDirection: "row" }}>
                {settings.certificatesListStyle === "bullet" && (
                  <Text style={{ marginRight: 4 }}>•</Text>
                )}
                {settings.certificatesListStyle === "number" && (
                  <Text style={{ marginRight: 4 }}>{index + 1}.</Text>
                )}
                <View style={{ flex: 1 }}>
                  <View style={staticStyles.entryHeader}>
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
                          fontFamily: settings.certificatesDateItalic
                            ? italicFont
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
                        fontSize: fontSize - 1,
                        color: getColor("links"),
                        textDecoration: "none",
                        marginBottom: 1,
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

                  {cert.summary && (
                    <View style={styles.entrySummary}>
                      <PDFRichText
                        text={cert.summary}
                        style={{ fontSize }}
                        fontSize={fontSize}
                      />
                    </View>
                  )}
                </View>
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
      <View style={styles.section}>
        {((settings.awardsHeadingVisible ?? true) as boolean) &&
          renderSectionTitle("Awards")}
        {awards.map((award, index) => (
          <View
            key={award.id}
            style={{ marginBottom: 4, flexDirection: "row" }}
          >
            {settings.awardsListStyle === "bullet" && (
              <Text style={{ marginRight: 4, fontSize: fontSize }}>•</Text>
            )}
            {settings.awardsListStyle === "number" && (
              <Text style={{ marginRight: 4, fontSize: fontSize }}>
                {index + 1}.
              </Text>
            )}
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: fontSize,
                  fontFamily: settings.awardsTitleBold ? boldFont : baseFont,
                  fontWeight: settings.awardsTitleBold ? "bold" : "normal",
                  fontStyle: settings.awardsTitleItalic ? "italic" : "normal",
                }}
              >
                {award.title}
              </Text>
              <Text style={{ fontSize: fontSize - 0.5 }}>
                <Text
                  style={{
                    fontFamily: settings.awardsAwarderBold
                      ? boldFont
                      : baseFont,
                    fontWeight: settings.awardsAwarderBold ? "bold" : "normal",
                    fontStyle: settings.awardsAwarderItalic
                      ? "italic"
                      : "normal",
                  }}
                >
                  {award.awarder}
                </Text>
                {" | "}
                <Text
                  style={{
                    fontFamily: settings.awardsDateBold ? boldFont : baseFont,
                    fontWeight: settings.awardsDateBold ? "bold" : "normal",
                    fontStyle: settings.awardsDateItalic ? "italic" : "normal",
                  }}
                >
                  {formatDate(award.date)}
                </Text>
              </Text>
              {award.summary && (
                <View style={styles.entrySummary}>
                  <PDFRichText
                    text={award.summary}
                    style={{ fontSize }}
                    fontSize={fontSize}
                  />
                </View>
              )}
            </View>
          </View>
        ))}
      </View>
    );
  };

  // Interests, Publications, References similar patterns
  const renderInterests = () => {
    if (!interests || interests.length === 0) return null;
    return (
      <View style={styles.section}>
        {((settings.interestsHeadingVisible ?? true) as boolean) &&
          renderSectionTitle("Interests")}
        <View style={{ flexDirection: "row", flexWrap: "wrap", rowGap: 2 }}>
          {interests.map((int, index) => (
            <View
              key={index}
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginRight: settings.interestsListStyle === "none" ? 3 : 8,
              }}
            >
              {settings.interestsListStyle === "bullet" && (
                <Text style={{ marginRight: 3, fontSize: fontSize }}>•</Text>
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

  const renderPublications = () => {
    if (!publications || publications.length === 0) return null;
    return (
      <View style={styles.section}>
        {((settings.publicationsHeadingVisible ?? true) as boolean) &&
          renderSectionTitle("Publications")}
        {publications.map((pub, index) => (
          <View key={pub.id} style={staticStyles.entryBlock}>
            <View style={{ flexDirection: "row", marginBottom: 1 }}>
              {settings.publicationsListStyle === "bullet" && (
                <Text style={{ marginRight: 4, fontSize: fontSize }}>•</Text>
              )}
              {settings.publicationsListStyle === "number" && (
                <Text style={{ marginRight: 4, fontSize: fontSize }}>
                  {index + 1}.
                </Text>
              )}
              <View style={{ flex: 1 }}>
                <View style={staticStyles.entryHeader}>
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
                      fontSize: fontSize - 1,
                      color: getColor("links"),
                      textDecoration: "none",
                      marginBottom: 1,
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
                  <View style={styles.entrySummary}>
                    <PDFRichText
                      text={pub.summary}
                      style={{ fontSize }}
                      fontSize={fontSize}
                    />
                  </View>
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
      <View style={styles.section}>
        {((settings.referencesHeadingVisible ?? true) as boolean) &&
          renderSectionTitle("References")}
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          {references.map((ref, index) => (
            <View
              key={ref.id}
              style={{
                width: "48%",
                marginRight: "2%",
                marginBottom: 6,
                flexDirection: "row",
              }}
            >
              {settings.referencesListStyle === "bullet" && (
                <Text style={{ marginRight: 4, fontSize: fontSize }}>•</Text>
              )}
              {settings.referencesListStyle === "number" && (
                <Text style={{ marginRight: 4, fontSize: fontSize }}>
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
                  {ref.position} {ref.position && ref.reference ? "|" : ""}{" "}
                  {ref.reference}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderCustom = () => {
    if (!custom || custom.length === 0) return null;
    return (
      <View>
        {custom.map((sec) => (
          <View key={sec.id} style={styles.section}>
            {((settings.customHeadingVisible ?? true) as boolean) &&
              renderSectionTitle(sec.name)}
            {sec.items.map((item, index) => (
              <View key={item.id} style={staticStyles.entryBlock}>
                <View style={staticStyles.entryHeader}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    {settings.customSectionListStyle === "bullet" && (
                      <Text style={{ marginRight: 4, fontSize: fontSize }}>
                        •
                      </Text>
                    )}
                    {settings.customSectionListStyle === "number" && (
                      <Text style={{ marginRight: 4, fontSize: fontSize }}>
                        {index + 1}.
                      </Text>
                    )}
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
                  </View>
                  <Text
                    style={[
                      styles.entryDate,
                      {
                        fontFamily: settings.customSectionDateItalic
                          ? italicFont
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
                      fontSize: fontSize - 1,
                      color: getColor("links"),
                      textDecoration: "none",
                      marginBottom: 1,
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
                  <View style={styles.entrySummary}>
                    <PDFRichText
                      text={item.summary}
                      style={{ fontSize }}
                      fontSize={fontSize}
                    />
                  </View>
                )}
              </View>
            ))}
          </View>
        ))}
      </View>
    );
  };

  // --- Layout Logic ---

  const SECTION_RENDERERS = {
    summary: renderSummary,
    work: renderExperience,
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

  const LHS_SECTIONS = [
    "skills",
    "education",
    "languages",
    "certificates",
    "awards",
    "interests",
  ];

  const RHS_SECTIONS = [
    "summary",
    "work",
    "projects",
    "publications",
    "references",
    "custom",
  ];

  const order =
    settings.sectionOrder && settings.sectionOrder.length > 0
      ? settings.sectionOrder
      : [...RHS_SECTIONS, ...LHS_SECTIONS];

  const leftColumnContent = order.filter((id) => LHS_SECTIONS.includes(id));
  const rightColumnContent = order.filter((id) => RHS_SECTIONS.includes(id));

  const knownSections = [...LHS_SECTIONS, ...RHS_SECTIONS];
  const orphans = order.filter((id) => !knownSections.includes(id));
  if (orphans.length > 0) {
    rightColumnContent.push(...orphans);
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {renderHeader()}

        {columnCount === 1 ? (
          <View>
            {order.map((sectionId) => {
              const renderer =
                SECTION_RENDERERS[sectionId as keyof typeof SECTION_RENDERERS];
              return renderer ? (
                <View key={sectionId}>{renderer()}</View>
              ) : null;
            })}
          </View>
        ) : (
          <View style={staticStyles.mainContainer}>
            {/* Left Column / Sidebar */}
            <View style={styles.leftColumn}>
              {leftColumnContent.map((sectionId) => {
                const renderer =
                  SECTION_RENDERERS[
                    sectionId as keyof typeof SECTION_RENDERERS
                  ];
                return renderer ? (
                  <View key={sectionId}>{renderer()}</View>
                ) : null;
              })}
            </View>

            {/* Right Column / Main */}
            <View style={styles.rightColumn}>
              {rightColumnContent.map((sectionId) => {
                const renderer =
                  SECTION_RENDERERS[
                    sectionId as keyof typeof SECTION_RENDERERS
                  ];
                return renderer ? (
                  <View key={sectionId}>{renderer()}</View>
                ) : null;
              })}
            </View>
          </View>
        )}
      </Page>
    </Document>
  );
}

export async function generateProfessionalPDF(resume: Resume): Promise<Blob> {
  const doc = <ProfessionalTemplate resume={resume} />;
  const blob = await pdf(doc).toBlob();
  return blob;
}
