import React from "react";
import { View, Text } from "@react-pdf/renderer";
import { Resume } from "@/db";
import { LayoutSettings, TemplateStyles } from "@/components/design/types";
import { PDFRichText } from "../PDFRichText";

interface GlowAwardsProps {
  awards: Resume["awards"];
  settings: LayoutSettings;
  styles: TemplateStyles;
  getColor: (target: string, fallback?: string) => string;
  fontSize: number;
  baseFont: string;
  boldFont: string;
}

export const GlowAwards: React.FC<GlowAwardsProps> = ({
  awards,
  settings,
  styles,
  getColor,
  fontSize,
  baseFont,
  boldFont,
}) => {
  if (!awards || awards.length === 0) return null;

  return (
    <View key="awards" style={styles.section}>
      {((settings.awardsHeadingVisible ?? true) as boolean) && (
        <View style={styles.sectionTitleWrapper}>
          <Text style={[styles.sectionTitle, { color: getColor("headings") }]}>
            AWARDS
          </Text>
        </View>
      )}
      {awards.map((award) => (
        <View key={award.id} style={styles.entryBlock}>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={{ fontSize: fontSize + 1, fontFamily: boldFont, fontWeight: "bold" }}>
              {award.title}
            </Text>
            <Text style={{ fontSize: fontSize, color: getColor("dates") }}>
              {award.date}
            </Text>
          </View>
          <Text style={{ fontSize: fontSize, marginBottom: 2, fontFamily: baseFont }}>
             {award.awarder}
          </Text>
           <View style={styles.entrySummary}>
            <PDFRichText
              text={award.summary}
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
