import React from "react";
import { View, Text } from "@react-pdf/renderer";
// import { Resume } from "@/db"; // Unused
import { PDFRichText } from "../PDFRichText";
import { LayoutSettings, TemplateStyles } from "@/components/design/types";
// import { getSectionHeadingWrapperStyles } from "@/lib/template-styles"; // Unused

interface CreativeSummaryProps {
  summary: string;
  settings: LayoutSettings;
  styles: TemplateStyles;
  getColor: (target: string, fallback?: string) => string;
  fontSize: number;
  baseFont: string;
  boldFont: string;
  italicFont: string;
}

export const CreativeSummary: React.FC<CreativeSummaryProps> = ({
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
    <View style={styles.section}>
      {((settings.summaryHeadingVisible ?? true) as boolean) && (
        <View style={styles.sectionTitleWrapper}>
          <Text style={[styles.sectionTitle, { color: getColor("headings") }]}>
            Profile
          </Text>
        </View>
      )}
      <PDFRichText
        text={summary}
        style={{
          fontSize: fontSize,
          lineHeight: settings.lineHeight,
          fontFamily: baseFont,
          color: "#333", // Dark readable text
          textAlign: "left",
        }}
        fontSize={fontSize}
        fontFamily={baseFont}
        boldFontFamily={boldFont}
        italicFontFamily={italicFont}
      />
    </View>
  );
};
