import React from "react";
import { View, Text } from "@react-pdf/renderer";
import { Resume } from "@/db";
import { PDFRichText } from "../PDFRichText";
import { formatDate } from "@/lib/template-utils";
import { LayoutSettings, TemplateStyles } from "@/components/design/types";

interface ProfessionalEducationProps {
  education: Resume["education"];
  settings: LayoutSettings;
  styles: TemplateStyles;
  getColor: (target: string, fallback?: string) => string;
  fontSize: number;
  baseFont: string;
  boldFont: string;
  italicFont: string;
}

export const ProfessionalEducation: React.FC<ProfessionalEducationProps> = ({
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
    <View style={styles.section}>
      {((settings.educationHeadingVisible ?? true) as boolean) && (
        <View style={styles.sectionTitleWrapper}>
          <Text style={[styles.sectionTitle, { color: getColor("headings") }]}>
            Education
          </Text>
        </View>
      )}
      {education.map((edu, index) => (
        <View key={edu.id} style={{ marginBottom: 6 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              flexWrap: "wrap",
            }}
          >
            <View style={{ flexDirection: "row", flex: 1 }}>
              {settings.educationInstitutionListStyle === "bullet" && (
                <Text style={{ marginRight: 4, fontSize: fontSize }}>•</Text>
              )}
              {settings.educationInstitutionListStyle === "number" && (
                <Text style={{ marginRight: 4, fontSize: fontSize }}>
                  {index + 1}.
                </Text>
              )}
              <Text
                style={{
                  fontWeight: settings.educationInstitutionBold
                    ? "bold"
                    : "normal",
                  fontStyle: settings.educationInstitutionItalic
                    ? "italic"
                    : "normal",
                  fontSize: fontSize,
                  fontFamily: settings.educationInstitutionBold
                    ? boldFont
                    : settings.educationInstitutionItalic
                      ? italicFont
                      : baseFont,
                }}
              >
                {edu.institution}
              </Text>
            </View>
            <Text
              style={{
                fontSize: fontSize - 1,
                color: "#666",
                fontStyle: settings.educationDateItalic ? "italic" : "normal",
                fontWeight: settings.educationDateBold ? "bold" : "normal",
                fontFamily: settings.educationDateBold
                  ? boldFont
                  : settings.educationDateItalic
                    ? italicFont
                    : baseFont,
                textAlign: "right",
              }}
            >
              {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
            </Text>
          </View>

          <Text
            style={{
              fontSize: fontSize,
            }}
          >
            <Text
              style={{
                fontWeight: settings.educationDegreeBold ? "bold" : "normal",
                fontStyle: settings.educationDegreeItalic ? "italic" : "normal",
                fontFamily: settings.educationDegreeBold
                  ? boldFont
                  : settings.educationDegreeItalic
                    ? italicFont
                    : baseFont,
              }}
            >
              {edu.studyType}
            </Text>
            {edu.area && (
              <Text
                style={{
                  fontFamily: settings.educationAreaBold ? boldFont : baseFont,
                  fontWeight: settings.educationAreaBold ? "bold" : "normal",
                  fontStyle: settings.educationAreaItalic ? "italic" : "normal",
                }}
              >
                {` ${edu.area}`}
              </Text>
            )}
          </Text>

          {edu.score && (
            <Text
              style={{
                fontSize: fontSize - 1,
                fontFamily: settings.educationGpaBold
                  ? boldFont
                  : settings.educationGpaItalic
                    ? italicFont
                    : baseFont,
                fontWeight: settings.educationGpaBold ? "bold" : "normal",
                fontStyle: settings.educationGpaItalic ? "italic" : "normal",
              }}
            >
              {edu.score}
            </Text>
          )}

          {edu.summary && (
            <View style={{ marginTop: 2, marginBottom: 2 }}>
              <PDFRichText
                text={edu.summary}
                fontSize={fontSize}
                style={{ fontSize }}
              />
            </View>
          )}

          {edu.courses && edu.courses.length > 0 && (
            <Text
              style={{
                fontSize: fontSize,
                marginTop: 2,
                fontFamily: settings.educationCoursesBold ? boldFont : baseFont,
                fontWeight: settings.educationCoursesBold ? "bold" : "normal",
                fontStyle: settings.educationCoursesItalic
                  ? "italic"
                  : "normal",
              }}
            >
              Courses: {edu.courses.join(", ")}
            </Text>
          )}
        </View>
      ))}
    </View>
  );
};
