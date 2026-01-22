import React from "react";
import { View, Text } from "@react-pdf/renderer";
import { Resume } from "@/db";

import { LayoutSettings, TemplateStyles } from "@/components/design/types";

interface GlowEducationProps {
  education: Resume["education"];
  settings: LayoutSettings;
  styles: TemplateStyles;
  getColor: (target: string, fallback?: string) => string;
  fontSize: number;
  baseFont: string;
  boldFont: string;
  italicFont: string;
}

export const GlowEducation: React.FC<GlowEducationProps> = ({
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
            EDUCATION
          </Text>
        </View>
      )}
      {education.map((edu) => (
        <View key={edu.id} style={styles.entryBlock}>
           <View style={styles.entryHeader}>
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.entryTitle,
                  {
                    fontSize: fontSize + 1,
                    fontFamily: settings.educationInstitutionBold ? boldFont : baseFont,
                    fontWeight: settings.educationInstitutionBold ? "bold" : "normal"
                  },
                ]}
              >
                {edu.studyType}
              </Text>
              <Text style={[styles.entrySubtitle, { fontFamily: italicFont, fontStyle: "italic" }]}>
                  {edu.institution}, {edu.area}
              </Text>
            </View>

            <View style={{ alignItems: "flex-end" }}>
                <Text style={[styles.entryDate, { color: getColor("dates", getColor("headings")) }]}>
                  {edu.startDate} – {edu.endDate}
                </Text>
            </View>
          </View>

           {edu.score && (
             <Text style={{ fontSize: fontSize, marginTop: 1, fontFamily: boldFont }}>
               GPA: {edu.score}
             </Text>
           )}
        </View>
      ))}
    </View>
  );
};
