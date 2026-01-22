import React from "react";
import { View, Text } from "@react-pdf/renderer";
import { Resume } from "@/db";
import { LayoutSettings, TemplateStyles } from "@/components/design/types";

interface GlowInterestsProps {
  interests: Resume["interests"];
  settings: LayoutSettings;
  styles: TemplateStyles;
  getColor: (target: string, fallback?: string) => string;
  fontSize: number;
  baseFont: string;
  boldFont: string;
}

export const GlowInterests: React.FC<GlowInterestsProps> = ({
  interests,
  settings,
  styles,
  getColor,
  fontSize,
  baseFont,
  // boldFont, // Unused
}) => {
  if (!interests || interests.length === 0) return null;

  return (
    <View key="interests" style={styles.section}>
      {((settings.interestsHeadingVisible ?? true) as boolean) && (
        <View style={styles.sectionTitleWrapper}>
          <Text style={[styles.sectionTitle, { color: getColor("headings") }]}>
            INTERESTS
          </Text>
        </View>
      )}
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {interests.map((int) => (
           <Text key={int.id} style={{ fontSize: fontSize, fontFamily: baseFont }}>
              • {int.name}
           </Text>
        ))}
      </View>
    </View>
  );
};
