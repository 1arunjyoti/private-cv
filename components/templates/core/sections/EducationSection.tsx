/**
 * EducationSection - Universal education section component
 *
 * Replaces all template-specific education components with a single,
 * fully configurable component.
 */

import React from "react";
import { View, Text, Link, StyleSheet } from "@react-pdf/renderer";
import type { Education, LayoutSettings } from "@/db";
import { formatDate } from "@/lib/template-utils";
import {
  SectionHeading,
  BulletList,
  EntryHeader,
  RichText,
} from "../primitives";
import type {
  FontConfig,
  GetColorFn,
  ListStyle,
  EntryLayoutStyle,
  SectionHeadingStyle,
} from "../types";

export interface EducationSectionProps {
  education: Education[];
  settings: LayoutSettings;
  fonts: FontConfig;
  fontSize: number;
  getColor: GetColorFn;
  lineHeight?: number;
  sectionTitle?: string;
  sectionMargin?: number;
  containerStyle?: object;
}

export const EducationSection: React.FC<EducationSectionProps> = ({
  education,
  settings,
  fonts,
  fontSize,
  getColor,
  lineHeight = 1.3,
  sectionTitle = "Education",
  sectionMargin,
  containerStyle,
}) => {
  if (!education || education.length === 0) return null;

  const styles = StyleSheet.create({
    container: {
      marginBottom: sectionMargin ?? settings.sectionMargin ?? 12,
      ...containerStyle,
    },
    entryBlock: {
      marginBottom: 8,
    },
    detailRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginTop: 2,
    },
    detailText: {
      fontSize,
      color: getColor("subtext", "#555555"),
    },
    scoreText: {
      fontSize,
      fontFamily: settings.educationGpaBold
        ? fonts.bold
        : settings.educationGpaItalic
          ? fonts.italic
          : fonts.base,
      fontWeight: settings.educationGpaBold ? "bold" : "normal",
      fontStyle: settings.educationGpaItalic ? "italic" : "normal",
      color: getColor("meta", "#555555"),
    },
    link: {
      fontSize: fontSize - 1,
      color: getColor("links", "#444444"),
      textDecoration: "none",
    },
    coursesWrapper: {
      marginTop: 4,
    },
    coursesLabel: {
      fontSize,
      fontWeight: "bold",
      color: getColor("text", "#444444"),
      marginBottom: 2,
    },
    summaryText: {
      fontSize,
      color: getColor("text", "#444444"),
      marginTop: 2,
      lineHeight,
    },
  });

  const institutionListStyle: ListStyle =
    settings.educationInstitutionListStyle || "none";

  return (
    <View style={styles.container}>
      {/* Section Heading */}
      {(settings.educationHeadingVisible ?? true) && (
        <SectionHeading
          title={sectionTitle}
          style={settings.sectionHeadingStyle as SectionHeadingStyle}
          align={settings.sectionHeadingAlign}
          bold={settings.sectionHeadingBold}
          capitalization={settings.sectionHeadingCapitalization}
          size={settings.sectionHeadingSize}
          fontSize={fontSize}
          fontFamily={fonts.base}
          getColor={getColor}
          letterSpacing={
            (settings as unknown as Record<string, unknown>)
              .sectionHeadingLetterSpacing as number
          }
        />
      )}

      {/* Education Entries */}
      {education.map((edu, index) => {
        const dateRange = `${formatDate(edu.startDate)} – ${formatDate(edu.endDate)}`;

        // Build degree string
        let degreeStr = edu.studyType || "";
        if (edu.area) {
          degreeStr += degreeStr ? ` in ${edu.area}` : edu.area;
        }

        return (
          <View key={edu.id} style={styles.entryBlock}>
            {/* Entry Header */}
            {/* Entry Header */}
            {settings.entryLayoutStyle === 3 ? (
              // Timeline Layout
              <View
                style={{
                  flexDirection: "row",
                  marginBottom: 4,
                }}
              >
                {/* Left Column: Dates */}
                <View style={{ width: 85, paddingRight: 8 }}>
                  <Text
                    style={{
                      fontSize: fontSize,
                      fontFamily: settings.educationDateBold
                        ? settings.educationDateItalic
                          ? fonts.boldItalic
                          : fonts.bold
                        : settings.educationDateItalic
                          ? fonts.italic
                          : fonts.base,
                      fontWeight: settings.educationDateBold
                        ? "bold"
                        : "normal",
                      fontStyle: settings.educationDateItalic
                        ? "italic"
                        : "normal",
                      color: getColor("text", "#444444"),
                      textAlign: "right",
                    }}
                  >
                    {dateRange ? dateRange.split("–")[0].trim() : ""}
                  </Text>
                  <Text
                    style={{
                      fontSize: fontSize,
                      fontFamily: settings.educationDateBold
                        ? settings.educationDateItalic
                          ? fonts.boldItalic
                          : fonts.bold
                        : settings.educationDateItalic
                          ? fonts.italic
                          : fonts.base,
                      fontWeight: settings.educationDateBold
                        ? "bold"
                        : "normal",
                      fontStyle: settings.educationDateItalic
                        ? "italic"
                        : "normal",
                      color: getColor("text", "#444444"),
                      textAlign: "right",
                    }}
                  >
                    {dateRange && dateRange.includes("–")
                      ? " - " + dateRange.split("–")[1].trim()
                      : ""}
                  </Text>
                  {edu.score && (
                    <Text
                      style={{
                        fontSize: fontSize - 1,
                        color: getColor("meta", "#555555"),
                        textAlign: "right",
                        marginTop: 2,
                        fontFamily: settings.educationGpaBold
                          ? settings.educationGpaItalic
                            ? fonts.boldItalic
                            : fonts.bold
                          : settings.educationGpaItalic
                            ? fonts.italic
                            : fonts.base,
                        fontWeight: settings.educationGpaBold
                          ? "bold"
                          : "normal",
                        fontStyle: settings.educationGpaItalic
                          ? "italic"
                          : "normal",
                      }}
                    >
                      {edu.score.includes(":") ||
                      edu.score.toLowerCase().includes("gpa")
                        ? edu.score
                        : `GPA: ${edu.score}`}
                    </Text>
                  )}
                </View>

                {/* Middle Column: Line and Dot */}
                <View
                  style={{
                    width: 12,
                    alignItems: "center",
                    position: "relative",
                  }}
                >
                  <View
                    style={{
                      position: "absolute",
                      top: 4,
                      left: 4,
                      width: 4,
                      height: 4,
                      borderRadius: 2,
                      backgroundColor: getColor("decorations", "#000"),
                      zIndex: 10,
                    }}
                  />
                  {(index < education.length - 1 || true) && (
                    <View
                      style={{
                        position: "absolute",
                        top: 4,
                        bottom: -16,
                        width: 1,
                        backgroundColor: "#e5e7eb",
                        left: 5.5,
                      }}
                    />
                  )}
                </View>

                {/* Right Column: Content */}
                <View style={{ flex: 1, paddingLeft: 8 }}>
                  <Text
                    style={{
                      fontSize:
                        settings.entryTitleSize === "L"
                          ? fontSize + 2
                          : fontSize + 1,
                      fontFamily: settings.educationDegreeBold
                        ? settings.educationDegreeItalic
                          ? fonts.boldItalic
                          : fonts.bold
                        : settings.educationDegreeItalic
                          ? fonts.italic
                          : fonts.base,
                      fontWeight: settings.educationDegreeBold
                        ? "bold"
                        : "normal",
                      fontStyle: settings.educationDegreeItalic
                        ? "italic"
                        : "normal",
                      color: getColor("primary", "#000"),
                    }}
                  >
                    {degreeStr}
                  </Text>
                  <Text
                    style={{
                      fontSize: fontSize,
                      color: getColor("title", "#333"),
                      fontFamily: settings.educationInstitutionBold
                        ? settings.educationInstitutionItalic
                          ? fonts.boldItalic
                          : fonts.bold
                        : settings.educationInstitutionItalic
                          ? fonts.italic
                          : fonts.base,
                      fontWeight: settings.educationInstitutionBold
                        ? "bold"
                        : "normal",
                      fontStyle: settings.educationInstitutionItalic
                        ? "italic"
                        : "normal",
                      marginTop: 1,
                      marginBottom: 2,
                    }}
                  >
                    {edu.institution}
                  </Text>

                  {/* Summary */}
                  {edu.summary && (
                    <RichText
                      text={edu.summary}
                      fontSize={fontSize}
                      fonts={fonts}
                      lineHeight={lineHeight}
                      linkColor={getColor("links", "#444444")}
                      showLinkIcon={settings.linkShowIcon}
                      showFullUrl={settings.linkShowFullUrl}
                      style={styles.summaryText}
                    />
                  )}

                  {/* Courses */}
                  {edu.courses && edu.courses.length > 0 && (
                    <View style={styles.coursesWrapper}>
                      <Text style={styles.coursesLabel}>Courses:</Text>
                      <BulletList
                        items={edu.courses}
                        style="inline"
                        fontSize={fontSize}
                        fonts={fonts}
                        bold={settings.educationCoursesBold}
                        italic={settings.educationCoursesItalic}
                        textColor={getColor("text", "#555555")}
                        getColor={getColor}
                        linkColor={getColor("links")}
                        showLinkIcon={settings.linkShowIcon}
                        showFullUrl={settings.linkShowFullUrl}
                      />
                    </View>
                  )}
                </View>
              </View>
            ) : (
              <EntryHeader
                title={edu.institution}
                subtitle={degreeStr}
                dateRange={dateRange}
                url={edu.url}
                layoutStyle={settings.entryLayoutStyle as EntryLayoutStyle}
                fontSize={fontSize}
                fonts={fonts}
                getColor={getColor}
                titleBold={settings.educationInstitutionBold}
                titleItalic={settings.educationInstitutionItalic}
                subtitleBold={settings.educationDegreeBold}
                subtitleItalic={settings.educationDegreeItalic}
                dateBold={settings.educationDateBold}
                dateItalic={settings.educationDateItalic}
                listStyle={institutionListStyle}
                index={index}
                showUrl={
                  Boolean(edu.url) &&
                  (settings.linkShowIcon || settings.linkShowFullUrl)
                }
                showLinkIcon={settings.linkShowIcon}
                showFullUrl={settings.linkShowFullUrl}
                urlBold={settings.educationInstitutionBold} // Education doesn't have a separate URL bold setting, usually grouped with institution or uses a specific one? Checking defaults.. Education usually lacks specific URL bold setting in defaults. But I should check if I missed it.
                // Wait, Education doesn't have `educationUrlBold` in settings usually. It uses `educationInstitutionBold` for the title.
                // Let's check `LayoutSettings` definition again.
                // Actually, looking at `db/index.ts` earlier, Education has degree, area, date, gpa, courses. No specific URL setting?
                // If it's the specific URL setting the user is asking about, it might be relevant for sections that HAVE it.
                // For Education, it might fall back to standard link style or inherit.
                // If the user said "you removed the url bold, italic function", they likely refer to sections where they HAD detailed control.
                // Let's look at `db/index.ts` again if needed.
                // But for now, let's assume Education might not have it.
                // However, I should check `WorkSection` used `experienceWebsiteBold`.
                // `ProjectsSection` used `projectsUrlBold`.
                // `Certificates` has `certificatesUrlBold`.
                // `Publications` has `publicationsUrlBold`.
                // `Custom` has `customSectionUrlBold`.
                // `Education` does NOT seem to have `educationUrlBold` in the viewed file `db/index.ts` lines 230-243.
                // So for Education, maybe I shouldn't add it or it wasn't there before.
                // I will skip adding it to Education for now unless I find a matching setting.
                // Wait, I am currently editing `ProjectsSection` and `EducationSection`.
                // Let's hold off on EducationSection if I'm unsure.
                // I will just update ProjectsSection in this tool call.
                // Actually I cannot "skip" a file in `multi_replace` or `replace` if I already started.
                // But I am making individual calls.
                // So I will just update ProjectsSection here.
                // Setting `urlBold` to undefined simply defaults to normal, which is fine.
              />
            )}

            {/* Score/GPA (Render here if NOT timeline layout) */}
            {edu.score && settings.entryLayoutStyle !== 3 && (
              <Text style={styles.scoreText}>
                {edu.score.includes(":") ||
                edu.score.toLowerCase().includes("gpa")
                  ? edu.score
                  : `GPA: ${edu.score}`}
              </Text>
            )}

            {/* URL if not shown in header */}
            {edu.url &&
              !settings.linkShowIcon &&
              !settings.linkShowFullUrl &&
              settings.entryLayoutStyle !== 2 && (
                <Link src={edu.url} style={styles.link}>
                  <Text style={styles.link}>
                    {edu.url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                  </Text>
                </Link>
              )}

            {/* Summary (Render here if NOT timeline layout) */}
            {edu.summary && settings.entryLayoutStyle !== 3 && (
              <RichText
                text={edu.summary}
                fontSize={fontSize}
                fonts={fonts}
                lineHeight={lineHeight}
                linkColor={getColor("links", "#444444")}
                showLinkIcon={settings.linkShowIcon}
                showFullUrl={settings.linkShowFullUrl}
                style={styles.summaryText}
              />
            )}

            {/* Courses (Render here if NOT timeline layout) */}
            {edu.courses &&
              edu.courses.length > 0 &&
              settings.entryLayoutStyle !== 3 && (
                <View style={styles.coursesWrapper}>
                  <Text style={styles.coursesLabel}>Courses:</Text>
                  <BulletList
                    items={edu.courses}
                    style="inline"
                    fontSize={fontSize}
                    fonts={fonts}
                    bold={settings.educationCoursesBold}
                    italic={settings.educationCoursesItalic}
                    textColor={getColor("text", "#555555")}
                    getColor={getColor}
                    linkColor={getColor("links")}
                    showLinkIcon={settings.linkShowIcon}
                    showFullUrl={settings.linkShowFullUrl}
                  />
                </View>
              )}
          </View>
        );
      })}
    </View>
  );
};

export default EducationSection;
