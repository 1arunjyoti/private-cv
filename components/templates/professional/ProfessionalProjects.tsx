import React from "react";
import { View, Text, Link } from "@react-pdf/renderer";
import { Resume } from "@/db";
import { PDFRichText } from "../PDFRichText";
import { formatDate } from "@/lib/template-utils";
import { LayoutSettings, TemplateStyles } from "@/components/design/types";

interface ProfessionalProjectsProps {
  projects: Resume["projects"];
  settings: LayoutSettings;
  styles: TemplateStyles;
  getColor: (target: string, fallback?: string) => string;
  fontSize: number;
  baseFont: string;
  boldFont: string;
  italicFont: string;
}

export const ProfessionalProjects: React.FC<ProfessionalProjectsProps> = ({
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
    <View style={styles.section}>
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
            <View>
              {proj.startDate && (
                <Text
                  style={[
                    styles.entryDate,
                    {
                      fontFamily: settings.projectsDateBold
                        ? boldFont
                        : settings.projectsDateItalic
                          ? italicFont
                          : baseFont,
                      fontWeight: settings.projectsDateBold ? "bold" : "normal",
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
            <View style={{ marginBottom: 2, flex: 1, marginRight: 8 }}>
              <PDFRichText
                text={proj.description}
                style={styles.entrySubtitle}
                fontSize={fontSize}
              />
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
