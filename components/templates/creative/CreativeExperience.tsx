import React from "react";
import { View, Text, Link } from "@react-pdf/renderer";
import { Resume } from "@/db";
import { PDFRichText } from "../PDFRichText";
import { formatDate } from "@/lib/template-utils";
import { LayoutSettings, TemplateStyles } from "@/components/design/types";

interface CreativeExperienceProps {
  work: Resume["work"];
  settings: LayoutSettings;
  styles: TemplateStyles;
  getColor: (target: string, fallback?: string) => string;
  fontSize: number;
  baseFont: string;
  boldFont: string;
  italicFont: string;
}

export const CreativeExperience: React.FC<CreativeExperienceProps> = ({
  work,
  settings,
  styles,
  getColor,
  fontSize,
  baseFont,
  boldFont,
  italicFont,
}) => {
  if (!work || work.length === 0) return null;

  return (
    <View key="work" style={styles.section}>
      {((settings.workHeadingVisible ?? true) as boolean) && (
        <View style={styles.sectionTitleWrapper}>
          <Text style={[styles.sectionTitle, { color: getColor("headings") }]}>
            Professional Experience
          </Text>
        </View>
      )}

      {work.map((exp, index) => {
        // Company List Style
        const companyListStyle = settings.experienceCompanyListStyle || "none";
        const companyBullet =
          companyListStyle === "bullet"
            ? "• "
            : companyListStyle === "number"
              ? `${index + 1}. `
              : "";

        // Achievements List Style
        const achievementsListStyle =
          settings.experienceAchievementsListStyle || "bullet";

        return (
          <View key={exp.id} style={styles.entryBlock}>
            {/* Header: Company Name (Bold) | Location --- Date (Right) */}

            <View style={{ marginBottom: 2 }}>
              <View style={{ flexDirection: "row" }}>
                {/* Company Name with optional bullet/number */}
                <Text
                  style={{
                    fontFamily: settings.experienceCompanyBold
                      ? boldFont
                      : settings.experienceCompanyItalic
                        ? italicFont
                        : baseFont,
                    fontWeight: settings.experienceCompanyBold
                      ? "bold"
                      : "normal",
                    fontStyle: settings.experienceCompanyItalic
                      ? "italic"
                      : "normal",
                    fontSize: fontSize + 1,
                    color: "#000",
                  }}
                >
                  {companyBullet}
                  {exp.company}
                </Text>
              </View>

              <Text
                style={{
                  fontFamily: settings.experiencePositionBold
                    ? boldFont
                    : settings.experiencePositionItalic
                      ? italicFont
                      : baseFont,
                  fontWeight: settings.experiencePositionBold
                    ? "bold"
                    : "normal",
                  fontStyle: settings.experiencePositionItalic
                    ? "italic"
                    : "normal",
                  fontSize: fontSize,
                  color: "#444",
                  marginTop: 1,
                }}
              >
                {exp.position}
                {exp.url && (
                  <Link
                    src={exp.url}
                    style={{ textDecoration: "none", color: getColor("links") }}
                  >
                    {" "}
                    🔗
                  </Link>
                )}
              </Text>

              <View
                style={{
                  flexDirection: "row",
                  marginTop: 2,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: fontSize - 1,
                    fontFamily: settings.experienceDateBold
                      ? boldFont
                      : settings.experienceDateItalic
                        ? italicFont
                        : baseFont,
                    fontWeight: settings.experienceDateBold ? "bold" : "normal",
                    fontStyle: settings.experienceDateItalic
                      ? "italic"
                      : "normal",
                    color: "#666",
                  }}
                >
                  {formatDate(exp.startDate)} – {formatDate(exp.endDate)}
                </Text>
              </View>
            </View>

            {exp.summary && (
              <PDFRichText
                text={exp.summary}
                style={styles.entrySummary}
                fontSize={fontSize}
                fontFamily={baseFont}
                boldFontFamily={boldFont}
                italicFontFamily={italicFont}
              />
            )}

            {exp.highlights && exp.highlights.length > 0 && (
              <View style={styles.bulletList}>
                {exp.highlights.map((h, i) => (
                  <View key={i} style={styles.bulletItem}>
                    {achievementsListStyle !== "none" && (
                      <Text
                        style={[
                          styles.bullet,
                          { color: getColor("headings") },
                          achievementsListStyle === "number" && { width: 15 }, // More space for numbers
                        ]}
                      >
                        {achievementsListStyle === "number" ? `${i + 1}.` : "•"}
                      </Text>
                    )}
                    <Text
                      style={[
                        styles.bulletText,
                        {
                          fontWeight: settings.experienceAchievementsBold
                            ? "bold"
                            : "normal",
                          fontStyle: settings.experienceAchievementsItalic
                            ? "italic"
                            : "normal",
                          fontFamily: settings.experienceAchievementsBold
                            ? boldFont
                            : settings.experienceAchievementsItalic
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
          </View>
        );
      })}
    </View>
  );
};
