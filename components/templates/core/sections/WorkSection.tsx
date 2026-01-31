/**
 * WorkSection - Universal work experience section component
 *
 * A single, configurable component that replaces:
 * - ATSTemplate inline work rendering
 * - ClassicExperience
 * - CreativeExperience
 * - PolishedExperience
 * - And all other template-specific work sections
 *
 * All styling is controlled via props, making it work with any template.
 */

import React from "react";
import { View, Text, StyleSheet } from "@react-pdf/renderer";
import type { WorkExperience, LayoutSettings } from "@/db";
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

export interface WorkSectionProps {
  work: WorkExperience[];
  settings: LayoutSettings;
  fonts: FontConfig;
  fontSize: number;
  getColor: GetColorFn;
  lineHeight?: number;
  /** Section title text */
  sectionTitle?: string;
  /** Override section margin */
  sectionMargin?: number;
  /** Custom container style */
  containerStyle?: object;
}

export const WorkSection: React.FC<WorkSectionProps> = ({
  work,
  settings,
  fonts,
  fontSize,
  getColor,
  lineHeight = 1.2,
  sectionTitle = "Professional Experience",
  sectionMargin,
  containerStyle,
}) => {
  if (!work || work.length === 0) return null;

  const styles = StyleSheet.create({
    container: {
      marginBottom: sectionMargin ?? settings.sectionMargin ?? 12,
      ...containerStyle,
    },
    entryBlock: {
      marginBottom: 8,
    },
    summaryText: {
      fontSize,
      color: getColor("text", "#444444"),
      marginTop: 2,
      /* marginBottom: 2, */
      lineHeight,
    },
    highlightsWrapper: {
      /* marginTop: 2, */
    },
  });

  // Determine list styles from settings
  const companyListStyle: ListStyle =
    settings.experienceCompanyListStyle || "none";
  const achievementsListStyle: ListStyle =
    settings.experienceAchievementsListStyle || "bullet";

  return (
    <View style={styles.container}>
      {/* Section Heading */}
      {(settings.workHeadingVisible ?? true) && (
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

      {/* Work Entries */}
      {work.map((exp, index) => {
        const dateRange = `${formatDate(exp.startDate)} – ${formatDate(exp.endDate)}`;

        return (
          <View key={exp.id} style={styles.entryBlock}>
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
                      fontFamily: settings.experienceDateBold
                        ? fonts.bold
                        : fonts.base,
                      fontWeight: settings.experienceDateBold
                        ? "bold"
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
                      fontFamily: settings.experienceDateBold
                        ? fonts.bold
                        : fonts.base,
                      fontWeight: settings.experienceDateBold
                        ? "bold"
                        : "normal",
                      color: getColor("text", "#444444"),
                      textAlign: "right",
                    }}
                  >
                    {dateRange && dateRange.includes("–")
                      ? " - " + dateRange.split("–")[1].trim()
                      : ""}
                  </Text>
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
                      left: 4, // Center of width 12
                      width: 4,
                      height: 4,
                      borderRadius: 2,
                      backgroundColor: getColor("decorations", "#000"),
                      zIndex: 10,
                    }}
                  />
                  {(index < work.length - 1 || true) && ( // Always show line for now, maybe handle last item if needed
                    <View
                      style={{
                        position: "absolute",
                        top: 4,
                        bottom: -16, // Extend to next item
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
                      fontFamily: settings.experienceCompanyBold
                        ? fonts.bold
                        : fonts.base,
                      fontWeight: settings.experienceCompanyBold
                        ? "bold"
                        : "normal",
                      color: getColor("primary", "#000"), // Section primary color
                    }}
                  >
                    {exp.position}
                  </Text>
                  <Text
                    style={{
                      fontSize: fontSize,
                      color: getColor("title", "#333"),
                      fontFamily: fonts.bold,
                      marginTop: 1,
                      marginBottom: 2,
                    }}
                  >
                    {exp.company}
                  </Text>

                  {exp.summary && (
                    <RichText
                      text={exp.summary}
                      fontSize={fontSize}
                      fonts={fonts}
                      lineHeight={lineHeight}
                      linkColor={getColor("links")}
                      showLinkIcon={settings.linkShowIcon}
                      showFullUrl={settings.linkShowFullUrl}
                      style={styles.summaryText}
                    />
                  )}

                  {exp.highlights &&
                    exp.highlights.length > 0 &&
                    settings.useBullets !== false && (
                      <View
                        style={[styles.highlightsWrapper, { marginTop: 4 }]}
                      >
                        <BulletList
                          items={exp.highlights}
                          style={achievementsListStyle}
                          fontSize={fontSize}
                          fonts={fonts}
                          lineHeight={lineHeight}
                          bulletMargin={settings.bulletMargin}
                          bulletColor={getColor("decorations", "#333")}
                          textColor={getColor("text", "#444444")}
                          getColor={getColor}
                          linkColor={getColor("links")}
                          showLinkIcon={settings.linkShowIcon}
                          showFullUrl={settings.linkShowFullUrl}
                          bold={settings.experienceAchievementsBold}
                          italic={settings.experienceAchievementsItalic}
                        />
                      </View>
                    )}
                </View>
              </View>
            ) : (
              <EntryHeader
                title={exp.company}
                subtitle={exp.position}
                dateRange={dateRange}
                url={exp.url}
                layoutStyle={settings.entryLayoutStyle as EntryLayoutStyle}
                fontSize={fontSize}
                fonts={fonts}
                getColor={getColor}
                titleBold={settings.experienceCompanyBold}
                titleItalic={settings.experienceCompanyItalic}
                subtitleBold={settings.experiencePositionBold}
                subtitleItalic={settings.experiencePositionItalic}
                dateBold={settings.experienceDateBold}
                dateItalic={settings.experienceDateItalic}
                listStyle={companyListStyle}
                index={index}
                showUrl={
                  (Boolean(exp.url) &&
                    settings.experienceWebsiteBold !== undefined) ||
                  (Boolean(exp.url) &&
                    (settings.linkShowIcon || settings.linkShowFullUrl))
                }
                showLinkIcon={settings.linkShowIcon}
                showFullUrl={settings.linkShowFullUrl}
                urlBold={settings.experienceWebsiteBold}
                urlItalic={settings.experienceWebsiteItalic}
              />
            )}

            {/* Summary (Only render here if NOT timeline layout) */}
            {exp.summary && settings.entryLayoutStyle !== 3 && (
              <RichText
                text={exp.summary}
                fontSize={fontSize}
                fonts={fonts}
                lineHeight={lineHeight}
                linkColor={getColor("links")}
                showLinkIcon={settings.linkShowIcon}
                showFullUrl={settings.linkShowFullUrl}
                style={styles.summaryText}
              />
            )}

            {/* Highlights/Achievements (Only render here if NOT timeline layout) */}
            {exp.highlights &&
              exp.highlights.length > 0 &&
              settings.useBullets !== false &&
              settings.entryLayoutStyle !== 3 && (
                <View style={styles.highlightsWrapper}>
                  <BulletList
                    items={exp.highlights}
                    style={achievementsListStyle}
                    fontSize={fontSize}
                    fonts={fonts}
                    lineHeight={lineHeight}
                    bulletMargin={settings.bulletMargin}
                    bulletColor={getColor("decorations", "#333")}
                    textColor={getColor("text", "#444444")}
                    getColor={getColor}
                    linkColor={getColor("links")}
                    showLinkIcon={settings.linkShowIcon}
                    showFullUrl={settings.linkShowFullUrl}
                    bold={settings.experienceAchievementsBold}
                    italic={settings.experienceAchievementsItalic}
                  />
                </View>
              )}
          </View>
        );
      })}
    </View>
  );
};

export default WorkSection;
