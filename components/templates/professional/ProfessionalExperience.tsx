import React from "react";
import { View, Text, Link } from "@react-pdf/renderer";
import { Resume } from "@/db";
import { PDFRichText } from "../PDFRichText";
import { formatDate } from "@/lib/template-utils";
import { LayoutSettings, TemplateStyles } from "@/components/design/types";

interface ProfessionalExperienceProps {
  work: Resume["work"];
  settings: LayoutSettings;
  styles: TemplateStyles;
  getColor: (target: string, fallback?: string) => string;
  fontSize: number;
  baseFont: string;
  boldFont: string;
  italicFont: string;
}

export const ProfessionalExperience: React.FC<ProfessionalExperienceProps> = ({
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
    <View style={styles.section}>
      {((settings.workHeadingVisible ?? true) as boolean) && (
        <View style={styles.sectionTitleWrapper}>
          <Text style={[styles.sectionTitle, { color: getColor("headings") }]}>
            Experience
          </Text>
        </View>
      )}
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
                          : settings.experienceWebsiteItalic
                            ? italicFont
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
                  fontFamily: settings.experienceDateBold
                    ? boldFont
                    : settings.experienceDateItalic
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
                    : settings.experiencePositionItalic
                      ? italicFont
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
                          : settings.experienceAchievementsItalic
                            ? italicFont
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
