/**
 * ProjectsSection - Universal projects section component
 */

import React from "react";
import { View, Text, Link, StyleSheet } from "@react-pdf/renderer";
import type { Project, LayoutSettings } from "@/db";
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

export interface ProjectsSectionProps {
  projects: Project[];
  settings: LayoutSettings;
  fonts: FontConfig;
  fontSize: number;
  getColor: GetColorFn;
  lineHeight?: number;
  sectionTitle?: string;
  sectionMargin?: number;
  containerStyle?: object;
}

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({
  projects,
  settings,
  fonts,
  fontSize,
  getColor,
  lineHeight = 1.2,
  sectionTitle = "Projects",
  sectionMargin,
  containerStyle,
}) => {
  if (!projects || projects.length === 0) return null;

  const themeColor = getColor("decorations", "#3b82f6");
  const linkColor = getColor("links", "#444444");

  const styles = StyleSheet.create({
    container: {
      marginBottom: sectionMargin ?? settings.sectionMargin ?? 12,
      ...containerStyle,
    },
    entryBlock: {
      marginBottom: 8,
    },
    descriptionText: {
      fontSize,
      color: "#444444",
      marginTop: 2,
      /* marginBottom: 4, */
      lineHeight,
    },
    keywordsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 4,
      /* marginTop: 4, */
    },
    keyword: {
      backgroundColor: themeColor + "15",
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 3,
    },
    keywordText: {
      fontSize: fontSize - 1,
      color: "#374151",
    },
    keywordsInline: {
      fontSize: fontSize - 1,
      color: "#666666",
      /* marginTop: 4, */
      fontFamily: settings.projectsTechnologiesBold
        ? fonts.bold
        : settings.projectsTechnologiesItalic
          ? fonts.italic
          : fonts.base,
      fontWeight: settings.projectsTechnologiesBold ? "bold" : "normal",
      fontStyle: settings.projectsTechnologiesItalic ? "italic" : "normal",
    },
    urlText: {
      fontSize: fontSize - 1,
      color: linkColor,
      marginTop: 2,
    },
    highlightsWrapper: {
      marginTop: 2,
    },
  });

  const projectsListStyle: ListStyle = settings.projectsListStyle || "none";
  const highlightsListStyle: ListStyle =
    settings.projectsAchievementsListStyle || "bullet";

  return (
    <View style={styles.container}>
      {/* Section Heading */}
      {(settings.projectsHeadingVisible ?? true) && (
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

      {/* Project Entries */}
      {projects.map((proj, index) => {
        const dateRange =
          proj.startDate || proj.endDate
            ? `${formatDate(proj.startDate)} – ${formatDate(proj.endDate)}`
            : undefined;

        return (
          <View key={proj.id} style={styles.entryBlock}>
            {/* Entry Header */}
            <EntryHeader
              title={proj.name}
              dateRange={dateRange}
              url={proj.url}
              layoutStyle={settings.entryLayoutStyle as EntryLayoutStyle}
              fontSize={fontSize}
              fonts={fonts}
              getColor={getColor}
              titleBold={settings.projectsNameBold}
              titleItalic={settings.projectsNameItalic}
              dateBold={settings.projectsDateBold}
              dateItalic={settings.projectsDateItalic}
              listStyle={projectsListStyle}
              index={index}
              showUrl={
                Boolean(proj.url) &&
                (settings.linkShowIcon || settings.linkShowFullUrl)
              }
              showLinkIcon={settings.linkShowIcon}
              showFullUrl={settings.linkShowFullUrl}
              urlBold={settings.projectsUrlBold}
              urlItalic={settings.projectsUrlItalic}
            />

            {/* URL (if not shown in header) */}
            {/* URL (if not shown in header) */}
            {proj.url &&
              !settings.linkShowIcon &&
              !settings.linkShowFullUrl &&
              settings.entryLayoutStyle === 1 && (
                <Link src={proj.url}>
                  <Text style={styles.urlText}>
                    {proj.url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                  </Text>
                </Link>
              )}

            {/* Description */}
            {proj.description && (
              <RichText
                text={proj.description}
                fontSize={fontSize}
                fonts={fonts}
                lineHeight={lineHeight}
                linkColor={linkColor}
                showLinkIcon={settings.linkShowIcon}
                showFullUrl={settings.linkShowFullUrl}
                style={styles.descriptionText}
              />
            )}

            {/* Highlights */}
            {proj.highlights &&
              proj.highlights.length > 0 &&
              settings.useBullets !== false && (
                <View style={styles.highlightsWrapper}>
                  <BulletList
                    items={proj.highlights}
                    style={highlightsListStyle}
                    fontSize={fontSize}
                    fonts={fonts}
                    lineHeight={lineHeight}
                    bulletMargin={settings.bulletMargin}
                    bulletColor={getColor("decorations", "#333")}
                    textColor="#444444"
                    getColor={getColor}
                    linkColor={linkColor}
                    showLinkIcon={settings.linkShowIcon}
                    showFullUrl={settings.linkShowFullUrl}
                    bold={settings.projectsFeaturesBold}
                    italic={settings.projectsFeaturesItalic}
                  />
                </View>
              )}

            {/* Keywords/Technologies */}
            {proj.keywords && proj.keywords.length > 0 && (
              <Text style={styles.keywordsInline}>
                Technologies: {proj.keywords.join(", ")}
              </Text>
            )}
          </View>
        );
      })}
    </View>
  );
};

export default ProjectsSection;
