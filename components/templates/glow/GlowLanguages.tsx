import React from "react";
import { View, Text } from "@react-pdf/renderer";
import { Resume } from "@/db";
import { LayoutSettings, TemplateStyles } from "@/components/design/types";

interface GlowLanguagesProps {
  languages: Resume["languages"];
  settings: LayoutSettings;
  styles: TemplateStyles;
  getColor: (target: string, fallback?: string) => string;
  fontSize: number;
  baseFont: string;
  boldFont: string;
}

export const GlowLanguages: React.FC<GlowLanguagesProps> = ({
  languages,
  settings,
  styles,
  getColor,
  fontSize,
  baseFont,
  boldFont,
}) => {
  if (!languages || languages.length === 0) return null;

  return (
    <View key="languages" style={styles.section}>
      {((settings.languagesHeadingVisible ?? true) as boolean) && (
        <View style={styles.sectionTitleWrapper}>
          <Text style={[styles.sectionTitle, { color: getColor("headings") }]}>
            LANGUAGES
          </Text>
        </View>
      )}
      <View style={{ flexDirection: "column", gap: 4 }}>
        {languages.map((lang) => (
          <View key={lang.id} style={{ flexDirection: "row", justifyContent: "space-between" }}>
             <Text style={{ fontSize: fontSize, fontFamily: boldFont, fontWeight: "bold" }}>
                {lang.language}
             </Text>
             <Text style={{ fontSize: fontSize, fontFamily: baseFont }}>
                {lang.fluency}
             </Text>
          </View>
        ))}
      </View>
    </View>
  );
};
