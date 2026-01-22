import React from "react";
import { View, Text } from "@react-pdf/renderer";
import { PDFRichText } from "../PDFRichText";

import { LayoutSettings, TemplateStyles } from "@/components/design/types";

interface ClassicSummaryProps {
  summary: string;
  settings: LayoutSettings;
  styles: TemplateStyles;
  getColor: (target: string, fallback?: string) => string;
  fontSize: number;
  baseFont: string;
  boldFont: string;
  italicFont: string;
}

export const ClassicSummary: React.FC<ClassicSummaryProps> = ({
  summary,
  settings,
  styles,
  getColor,
  fontSize,
  baseFont,
  boldFont,
  italicFont,
}) => {
  if (!summary) return null;

  return (
    <View key="summary" style={styles.section}>
      {((settings.summaryHeadingVisible ?? true) as boolean) && (
        <View style={styles.sectionTitleWrapper}>
          <Text style={[styles.sectionTitle, { color: getColor("headings") }]}>
            Summary
          </Text>
        </View>
      )}
      <PDFRichText
        text={summary}
        style={{ ...styles.entrySummary }}
        fontSize={fontSize}
        fontFamily={baseFont}
        boldFontFamily={boldFont}
        italicFontFamily={italicFont}
      />
    </View>
  );
};
