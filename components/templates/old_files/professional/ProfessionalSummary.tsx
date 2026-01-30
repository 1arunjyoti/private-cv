import React from "react";
import { View, Text } from "@react-pdf/renderer";
import { PDFRichText } from "../PDFRichText";
import { LayoutSettings, TemplateStyles } from "@/components/design/types";

interface ProfessionalSummaryProps {
  summary: string;
  settings: LayoutSettings;
  styles: TemplateStyles;
  getColor: (target: string, fallback?: string) => string;
  fontSize: number;
  lineHeight: number;
}

export const ProfessionalSummary: React.FC<ProfessionalSummaryProps> = ({
  summary,
  settings,
  styles,
  getColor,
  fontSize,
  lineHeight,
}) => {
  if (!summary) return null;
  return (
    <View style={styles.section}>
      {((settings.summaryHeadingVisible ?? true) as boolean) && (
        <View style={styles.sectionTitleWrapper}>
          <Text style={[styles.sectionTitle, { color: getColor("headings") }]}>
            Professional Summary
          </Text>
        </View>
      )}
      <PDFRichText
        text={summary}
        style={{ fontSize: fontSize, lineHeight: lineHeight }}
        fontSize={fontSize}
      />
    </View>
  );
};
