import React from "react";
import { View, Text } from "@react-pdf/renderer";
import { Resume } from "@/db";
import { LayoutSettings, TemplateStyles } from "@/components/design/types";

interface GlowReferencesProps {
  references: Resume["references"];
  settings: LayoutSettings;
  styles: TemplateStyles;
  getColor: (target: string, fallback?: string) => string;
  fontSize: number;
  baseFont: string;
  boldFont: string;
}

export const GlowReferences: React.FC<GlowReferencesProps> = ({
  references,
  settings,
  styles,
  getColor,
  fontSize,
  baseFont,
  boldFont,
}) => {
  if (!references || references.length === 0) return null;

  return (
    <View key="references" style={styles.section}>
      {((settings.referencesHeadingVisible ?? true) as boolean) && (
        <View style={styles.sectionTitleWrapper}>
          <Text style={[styles.sectionTitle, { color: getColor("headings") }]}>
            REFERENCES
          </Text>
        </View>
      )}
      {references.map((ref) => (
        <View key={ref.id} style={styles.entryBlock}>
           <Text style={{ fontSize: fontSize + 1, fontFamily: boldFont, fontWeight: "bold" }}>
              {ref.name}
           </Text>
           <Text style={{ fontSize: fontSize, fontFamily: baseFont }}>
              {ref.reference}
           </Text>
        </View>
      ))}
    </View>
  );
};
