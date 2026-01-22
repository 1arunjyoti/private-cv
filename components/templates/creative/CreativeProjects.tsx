import React from "react";
import { View, Text, Link } from "@react-pdf/renderer";
import { Resume } from "@/db";

import { formatDate } from "@/lib/template-utils";
import { LayoutSettings, TemplateStyles } from "@/components/design/types";

interface CreativeProjectsProps {
  projects: Resume["projects"];
  settings: LayoutSettings;
  styles: TemplateStyles;
  getColor: (target: string, fallback?: string) => string;
  fontSize: number;
  baseFont: string;
  boldFont: string;
  italicFont: string;
}

export const CreativeProjects: React.FC<CreativeProjectsProps> = ({
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

      {projects.map((proj, index) => {
        const achievementsListStyle =
          settings.projectsAchievementsListStyle || "bullet";
        const isNumber = achievementsListStyle === "number";

        const projectListStyle = settings.projectsListStyle || "none";
        const projectBullet =
          projectListStyle === "bullet"
            ? "• "
            : projectListStyle === "number"
              ? `${index + 1}. `
              : "";

        return (
          <View key={proj.id} style={styles.entryBlock}>
            <View style={{ marginBottom: 2 }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                }}
              >
                <Text
                  style={{
                    fontFamily: settings.projectsNameBold
                      ? boldFont
                      : settings.projectsNameItalic
                        ? italicFont
                        : baseFont,
                    fontWeight: settings.projectsNameBold ? "bold" : "normal",
                    fontStyle: settings.projectsNameItalic
                      ? "italic"
                      : "normal",
                    fontSize: fontSize + 1,
                    color: "#000",
                    flex: 1,
                  }}
                >
                  {projectBullet}
                  {proj.name}
                  {proj.url && (
                    <Link
                      src={proj.url}
                      style={{
                        textDecoration: "none",
                        color: getColor("links"),
                        fontSize: fontSize,
                      }}
                    >
                      {" "}
                      🔗
                    </Link>
                  )}
                </Text>

                <Text
                  style={{
                    fontSize: fontSize - 1,
                    fontFamily: settings.projectsDateBold
                      ? boldFont
                      : settings.projectsDateItalic
                        ? italicFont
                        : baseFont,
                    fontWeight: settings.projectsDateBold ? "bold" : "normal",
                    fontStyle: settings.projectsDateItalic
                      ? "italic"
                      : "normal",
                    color: "#666",
                    marginLeft: 8,
                    textAlign: "right",
                    minWidth: 60,
                  }}
                >
                  {formatDate(proj.startDate)} – {formatDate(proj.endDate)}
                </Text>
              </View>

              {proj.description && (
                <Text
                  style={{
                    fontFamily: baseFont,
                    fontSize: fontSize,
                    color: "#444",
                    marginTop: 1,
                  }}
                >
                  {proj.description}
                </Text>
              )}
            </View>

            {proj.highlights && proj.highlights.length > 0 && (
              <View style={styles.bulletList}>
                {proj.highlights.map((h, i) => (
                  <View key={i} style={styles.bulletItem}>
                    {achievementsListStyle !== "none" && (
                      <Text
                        style={[
                          styles.bullet,
                          { color: getColor("headings") },
                          isNumber && { width: 15 },
                        ]}
                      >
                        {isNumber ? `${i + 1}.` : "•"}
                      </Text>
                    )}
                    <Text
                      style={[
                        styles.bulletText,
                        {
                          fontWeight: settings.projectsFeaturesBold
                            ? "bold"
                            : "normal",
                          fontStyle: settings.projectsFeaturesItalic
                            ? "italic"
                            : "normal",
                          fontFamily: settings.projectsFeaturesBold
                            ? boldFont
                            : settings.projectsFeaturesItalic
                              ? italicFont
                              : baseFont,
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
                  fontSize: fontSize - 1,
                  color: "#666",
                  marginTop: 2,
                }}
              >
                Stack: {proj.keywords.join(" • ")}
              </Text>
            )}
          </View>
        );
      })}
    </View>
  );
};
