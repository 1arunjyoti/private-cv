import React from "react";
import { View, Text, Link } from "@react-pdf/renderer";
import { Resume } from "@/db";
import { PDFRichText } from "../PDFRichText";
import { formatDate } from "@/lib/template-utils";

import { LayoutSettings, TemplateStyles } from "@/components/design/types";

interface ClassicEducationProps {
  education: Resume["education"];
  settings: LayoutSettings;
  styles: TemplateStyles;
  getColor: (target: string, fallback?: string) => string;
  fontSize: number;
  baseFont: string;
  boldFont: string;
  italicFont: string;
}

export const ClassicEducation: React.FC<ClassicEducationProps> = ({
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
      {education.map((edu, index) => (
        <View key={edu.id} style={styles.entryBlock}>
          <View style={styles.entryHeader}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              {settings.educationInstitutionListStyle === "bullet" && (
                <Text style={{ marginRight: 4, fontSize: fontSize }}>•</Text>
              )}
              {settings.educationInstitutionListStyle === "number" && (
                <Text style={{ marginRight: 4, fontSize: fontSize }}>
                  {index + 1}.
                </Text>
              )}
              <Text
                style={[
                  styles.entryTitle,
                  {
                    fontSize: fontSize + 1,
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
                  },
                ]}
              >
                {edu.institution}
              </Text>
            </View>
            <Text
              style={[
                styles.entryDate,
                {
                  fontFamily: settings.educationDateBold
                    ? boldFont
                    : settings.educationDateItalic
                      ? italicFont
                      : baseFont,
                  fontWeight: settings.educationDateBold ? "bold" : "normal",
                  fontStyle: settings.educationDateItalic ? "italic" : "normal",
                },
              ]}
            >
              {formatDate(edu.startDate)} — {formatDate(edu.endDate)}
            </Text>
          </View>
          {edu.url && (
            <Link
              src={edu.url}
              style={{
                fontSize: fontSize - 1,
                color: getColor("links"),
                textDecoration: "none",
                marginBottom: 1,
                fontFamily: italicFont,
                fontStyle: "italic",
              }}
            >
              {edu.url}
            </Link>
          )}
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              marginBottom: 1,
            }}
          >
            <Text
              style={{
                fontSize: fontSize,
                fontFamily: settings.educationDegreeBold
                  ? boldFont
                  : settings.educationDegreeItalic
                    ? italicFont
                    : baseFont,
                fontWeight: settings.educationDegreeBold ? "bold" : "normal",
                fontStyle: settings.educationDegreeItalic ? "italic" : "normal",
              }}
            >
              {edu.studyType}
            </Text>
            {edu.area && (
              <Text
                style={{
                  fontSize: fontSize,
                  fontFamily: settings.educationAreaBold
                    ? boldFont
                    : settings.educationAreaItalic
                      ? italicFont
                      : baseFont,
                  fontWeight: settings.educationAreaBold ? "bold" : "normal",
                  fontStyle: settings.educationAreaItalic ? "italic" : "normal",
                }}
              >
                {` in ${edu.area}`}
              </Text>
            )}
          </View>
          {edu.score && (
            <Text
              style={[
                styles.entrySummary,
                {
                  fontFamily: settings.educationGpaBold
                    ? boldFont
                    : settings.educationGpaItalic
                      ? italicFont
                      : baseFont,
                  fontWeight: settings.educationGpaBold ? "bold" : "normal",
                  fontStyle: settings.educationGpaItalic ? "italic" : "normal",
                },
              ]}
            >
              {edu.score.includes(":") ? edu.score : `GPA/Score: ${edu.score}`}
            </Text>
          )}
          {edu.summary && (
            <PDFRichText
              text={edu.summary}
              style={styles.entrySummary}
              fontSize={fontSize}
              fontFamily={baseFont}
              boldFontFamily={boldFont}
              italicFontFamily={italicFont}
            />
          )}
          {edu.courses && edu.courses.length > 0 && (
            <Text
              style={[
                styles.entrySummary,
                {
                  fontFamily: settings.educationCoursesBold
                    ? boldFont
                    : settings.educationCoursesItalic
                      ? italicFont
                      : baseFont,
                  fontWeight: settings.educationCoursesBold ? "bold" : "normal",
                  fontStyle: settings.educationCoursesItalic
                    ? "italic"
                    : "normal",
                },
              ]}
            >
              Courses: {edu.courses.join(", ")}
            </Text>
          )}
        </View>
      ))}
    </View>
  );
};
