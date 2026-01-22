import React from "react";
import { View, Text } from "@react-pdf/renderer";
import { Resume } from "@/db";
import { PDFRichText } from "../PDFRichText";
import { formatDate } from "@/lib/template-utils";
import { LayoutSettings, TemplateStyles } from "@/components/design/types";

interface CreativeEducationProps {
  education: Resume["education"];
  settings: LayoutSettings;
  styles: TemplateStyles;
  getColor: (target: string, fallback?: string) => string;
  fontSize: number;
  baseFont: string;
  boldFont: string;
  italicFont: string;
}

export const CreativeEducation: React.FC<CreativeEducationProps> = ({
  education,
  settings,
  styles,
  getColor,
  fontSize,
  baseFont,
  boldFont,
  italicFont,
}) => {
  if (!education || education.length === 0) return null;

  return (
    <View key="education" style={styles.section}>
      {((settings.educationHeadingVisible ?? true) as boolean) && (
        <View style={styles.sectionTitleWrapper}>
          <Text style={[styles.sectionTitle, { color: getColor("headings") }]}>
            Education
          </Text>
        </View>
      )}

      {education.map((edu, index) => {
        const institutionListStyle =
          settings.educationInstitutionListStyle || "none";
        const institutionBullet =
          institutionListStyle === "bullet"
            ? "• "
            : institutionListStyle === "number"
              ? `${index + 1}. `
              : "";

        return (
          <View key={edu.id} style={styles.entryBlock}>
            {/* Andrew Kim: 
                Harvard Business School (Bold)
                MSc Finance (Italic)
                Sep 2013 - Aug 2014 | Harvard, USA
                * Graduated with distinction (Bullet)
            */}

            <View style={{ marginBottom: 2 }}>
              <View style={{ flexDirection: "row" }}>
                <Text
                  style={{
                    fontFamily: settings.educationInstitutionBold
                      ? boldFont
                      : settings.educationInstitutionItalic
                        ? italicFont
                        : baseFont,
                    fontWeight: settings.educationInstitutionBold
                      ? "bold"
                      : "normal",
                    fontStyle: settings.educationInstitutionItalic
                      ? "italic"
                      : "normal",
                    fontSize: fontSize + 1,
                    color: "#000",
                  }}
                >
                  {institutionBullet}
                  {edu.institution}
                </Text>
              </View>

              <Text style={{ fontSize: fontSize, marginTop: 1 }}>
                <Text
                  style={{
                    fontFamily: settings.educationDegreeBold
                      ? boldFont
                      : settings.educationDegreeItalic
                        ? italicFont
                        : baseFont,
                    fontWeight: settings.educationDegreeBold
                      ? "bold"
                      : "normal",
                    fontStyle: settings.educationDegreeItalic
                      ? "italic"
                      : "normal",
                    color: "#444",
                  }}
                >
                  {edu.studyType}
                </Text>
                {edu.area && (
                  <Text
                    style={{
                      fontFamily: settings.educationAreaBold
                        ? boldFont
                        : settings.educationAreaItalic
                          ? italicFont
                          : baseFont,
                      fontWeight: settings.educationAreaBold
                        ? "bold"
                        : "normal",
                      fontStyle: settings.educationAreaItalic
                        ? "italic"
                        : "normal",
                      color: "#444",
                    }}
                  >
                    {` ${edu.area}`}
                  </Text>
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
                    fontFamily: settings.educationDateBold
                      ? boldFont
                      : settings.educationDateItalic
                        ? italicFont
                        : baseFont,
                    fontWeight: settings.educationDateBold ? "bold" : "normal",
                    fontStyle: settings.educationDateItalic
                      ? "italic"
                      : "normal",
                    color: "#666",
                  }}
                >
                  {formatDate(edu.startDate)} – {formatDate(edu.endDate)}
                </Text>
              </View>
            </View>

            {/* In the image, thesis/distinction is a bullet point. We'll render summary/score here too or as bullets */}
            {edu.score && (
              <Text
                style={{
                  fontSize: fontSize,
                  fontFamily: settings.educationGpaBold
                    ? boldFont
                    : settings.educationGpaItalic
                      ? italicFont
                      : baseFont,
                  fontWeight: settings.educationGpaBold ? "bold" : "normal",
                  fontStyle: settings.educationGpaItalic ? "italic" : "normal",
                  marginTop: 2,
                }}
              >
                Grade: {edu.score}
              </Text>
            )}

            {edu.courses && edu.courses.length > 0 && (
              <>
                {(settings as any).educationCoursesListStyle === "inline" ||
                !(settings as any).educationCoursesListStyle ? (
                  <Text
                    style={{
                      marginTop: 2,
                      fontSize: fontSize,
                      fontFamily: settings.educationCoursesBold
                        ? boldFont
                        : settings.educationCoursesItalic
                          ? italicFont
                          : baseFont,
                      fontWeight: settings.educationCoursesBold
                        ? "bold"
                        : "normal",
                      fontStyle: settings.educationCoursesItalic
                        ? "italic"
                        : "normal",
                    }}
                  >
                    Courses: {edu.courses.join(", ")}
                  </Text>
                ) : (
                  <View style={styles.bulletList}>
                    {edu.courses.map((course, i) => (
                      <View key={i} style={styles.bulletItem}>
                        <Text
                          style={[
                            styles.bullet,
                            { color: getColor("headings") },
                          ]}
                        >
                          •
                        </Text>
                        <Text
                          style={[
                            styles.bulletText,
                            {
                              fontFamily: settings.educationCoursesBold
                                ? boldFont
                                : settings.educationCoursesItalic
                                  ? italicFont
                                  : baseFont,
                              fontWeight: settings.educationCoursesBold
                                ? "bold"
                                : "normal",
                              fontStyle: settings.educationCoursesItalic
                                ? "italic"
                                : "normal",
                            },
                          ]}
                        >
                          {course}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </>
            )}

            {edu.summary && (
              <PDFRichText
                text={edu.summary}
                style={{ ...styles.entrySummary, marginTop: 2 }}
                fontSize={fontSize}
                fontFamily={baseFont}
                boldFontFamily={boldFont}
                italicFontFamily={italicFont}
              />
            )}
          </View>
        );
      })}
    </View>
  );
};
