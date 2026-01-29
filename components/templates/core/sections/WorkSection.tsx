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
import { View, StyleSheet } from "@react-pdf/renderer";
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
      color: "#444444",
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

            {/* Summary */}
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

            {/* Highlights/Achievements */}
            {exp.highlights &&
              exp.highlights.length > 0 &&
              settings.useBullets !== false && (
                <View style={styles.highlightsWrapper}>
                  <BulletList
                    items={exp.highlights}
                    style={achievementsListStyle}
                    fontSize={fontSize}
                    fonts={fonts}
                    lineHeight={lineHeight}
                    bulletMargin={settings.bulletMargin}
                    bulletColor={getColor("decorations", "#333")}
                    textColor="#444444"
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
