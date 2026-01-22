import React from "react";
import { View, Text } from "@react-pdf/renderer";
import { Resume } from "@/db";
import { PDFRichText } from "../PDFRichText";
import { formatDate } from "@/lib/template-utils";

import { LayoutSettings, TemplateStyles } from "@/components/design/types";

interface ClassicProjectsProps {
  projects: Resume["projects"];
  settings: LayoutSettings;
  styles: TemplateStyles;
  getColor: (target: string, fallback?: string) => string;
  fontSize: number;
  baseFont: string;
  boldFont: string;
  italicFont: string;
}

export const ClassicProjects: React.FC<ClassicProjectsProps> = ({
  projects,
  settings,
  styles,
  getColor,
  fontSize,
  baseFont,
  boldFont,
  italicFont,
}) => {
  if (!projects || projects.length === 0) return null;

  return (
    <View key="projects" style={styles.section}>
      {((settings.projectsHeadingVisible ?? true) as boolean) && (
        <View style={styles.sectionTitleWrapper}>
          <Text style={[styles.sectionTitle, { color: getColor("headings") }]}>
            Projects
          </Text>
        </View>
      )}
      {projects.map((proj, index) => (
        <View key={proj.id} style={styles.entryBlock}>
          <View style={styles.entryHeader}>
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
                    fontSize: fontSize + 1,
                    fontFamily: settings.projectsNameBold
                      ? boldFont
                      : settings.projectsNameItalic
                        ? italicFont
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
            <Text
              style={[
                styles.entryDate,
                { minWidth: "auto" },
                {
                  fontFamily: settings.projectsDateBold
                    ? boldFont
                    : settings.projectsDateItalic
                      ? italicFont
                      : baseFont,
                  fontWeight: settings.projectsDateBold ? "bold" : "normal",
                  fontStyle: settings.projectsDateItalic ? "italic" : "normal",
                },
              ]}
            >
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
                marginBottom: 1,
              }}
            >
              {proj.url}
            </Text>
          )}
          {proj.description && (
            <PDFRichText
              text={proj.description}
              style={styles.entrySummary}
              fontSize={fontSize}
              fontFamily={baseFont}
              boldFontFamily={boldFont}
              italicFontFamily={italicFont}
            />
          )}
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
                          : settings.projectsFeaturesItalic
                            ? italicFont
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
                  : settings.projectsTechnologiesItalic
                    ? italicFont
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
