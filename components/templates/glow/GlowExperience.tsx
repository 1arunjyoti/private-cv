import React from "react";
import { View, Text, Link } from "@react-pdf/renderer";
import { Resume } from "@/db";
import { PDFRichText } from "../PDFRichText";

import { LayoutSettings, TemplateStyles } from "@/components/design/types";

interface GlowExperienceProps {
  work: Resume["work"];
  settings: LayoutSettings;
  styles: TemplateStyles;
  getColor: (target: string, fallback?: string) => string;
  fontSize: number;
  baseFont: string;
  boldFont: string;
}

export const GlowExperience: React.FC<GlowExperienceProps> = ({
  work,
  settings,
  styles,
  getColor,
  fontSize,
  baseFont,
  boldFont,
}) => {
  if (!work || work.length === 0) return null;

  return (
    <View key="work" style={styles.section}>
      {((settings.workHeadingVisible ?? true) as boolean) && (
        <View style={styles.sectionTitleWrapper}>
           {/* Potential for Icon here */}
          <Text style={[styles.sectionTitle, { color: getColor("headings") }]}>
            PROFESSIONAL EXPERIENCE
          </Text>
        </View>
      )}
      {work.map((exp) => (
        <View key={exp.id} style={styles.entryBlock}>
          <View style={styles.entryHeader}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "baseline" }}>
                 <Text
                    style={[
                      styles.entryTitle,
                      {
                        fontSize: fontSize + 1,
                        color: "#000", // Dark text for body
                        fontFamily: settings.experienceCompanyBold
                          ? boldFont
                          : baseFont,
                         fontWeight: settings.experienceCompanyBold ? "bold" : "normal"
                      },
                    ]}
                  >
                    {exp.company}
                  </Text>
                  {exp.url && (
                    <Link src={exp.url} style={{ textDecoration: "none" }}>
                      <Text style={{ fontSize: fontSize - 2, color: getColor("links"), marginLeft: 5 }}>
                         ↗
                      </Text>
                    </Link>
                  )}
              </View>
              <Text style={[styles.entrySubtitle, { color: getColor("headings"), marginTop: 1 }]}>
                  {exp.position}
              </Text>
            </View>

            <View style={{ alignItems: "flex-end" }}>
                <Text style={[styles.entryDate, { color: getColor("headings"), fontWeight: "bold" }]}>
                  {exp.startDate} – {exp.endDate}
                </Text>
            </View>
          </View>
          
          <View style={styles.entrySummary}>
            <PDFRichText
              text={exp.summary}
              style={{
                fontSize: fontSize,
                fontFamily: baseFont,
              }}
            />
          </View>
        </View>
      ))}
    </View>
  );
};
