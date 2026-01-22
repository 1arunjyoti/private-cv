import React from "react";
import { View, Text } from "@react-pdf/renderer";
import { PDFRichText } from "../PDFRichText";
import { LayoutSettings, TemplateStyles } from "@/components/design/types";

interface GlowSummaryProps {
  summary: string;
  settings: LayoutSettings;
  styles: TemplateStyles;
  getColor: (target: string, fallback?: string) => string;
  fontSize: number;
  baseFont: string;
}

export const GlowSummary: React.FC<GlowSummaryProps> = ({
  summary,
  settings,
  styles,
  getColor,
  fontSize,
  baseFont,
}) => {
  if (!summary) return null;

  return (
    <View key="summary" style={styles.section}>
      {((settings.summaryHeadingVisible ?? true) as boolean) && (
        <View style={styles.sectionTitleWrapper}>
          <Text style={[styles.sectionTitle, { color: getColor("headings") }]}>
            PROFILE
          </Text>
        </View>
      )}
      <View style={styles.entrySummary}>
        <PDFRichText
            text={summary}
            style={{
            fontSize: fontSize,
            fontFamily: baseFont,
            }}
        />
      </View>
    </View>
  );
};
