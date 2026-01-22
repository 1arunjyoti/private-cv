import React from "react";
import { View, Text } from "@react-pdf/renderer";
import { Resume } from "@/db";
import { LayoutSettings, TemplateStyles } from "@/components/design/types";

interface ProfessionalLanguagesProps {
  languages: Resume["languages"];
  settings: LayoutSettings;
  styles: TemplateStyles;
  getColor: (target: string, fallback?: string) => string;
  fontSize: number;
  baseFont: string;
  boldFont: string;
  italicFont: string;
}

export const ProfessionalLanguages: React.FC<ProfessionalLanguagesProps> = ({
  languages,
  settings,
  styles,
  getColor,
  fontSize,
  baseFont,
  boldFont,
  italicFont,
}) => {
  if (!languages || languages.length === 0) return null;
  return (
    <View style={styles.section}>
      {((settings.languagesHeadingVisible ?? true) as boolean) && (
        <View style={styles.sectionTitleWrapper}>
          <Text style={[styles.sectionTitle, { color: getColor("headings") }]}>
            Languages
          </Text>
        </View>
      )}
      {languages.map((lang, index) => (
        <View
          key={lang.id}
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 2,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            {settings.languagesListStyle === "bullet" && (
              <Text style={{ marginRight: 4, fontSize: fontSize }}>•</Text>
            )}
            {settings.languagesListStyle === "number" && (
              <Text style={{ marginRight: 4, fontSize: fontSize }}>
                {index + 1}.
              </Text>
            )}
            <Text
              style={{
                fontSize: fontSize,
                fontFamily: settings.languagesNameBold
                  ? boldFont
                  : settings.languagesNameItalic
                    ? italicFont
                    : baseFont,
                fontWeight: settings.languagesNameBold ? "bold" : "normal",
                fontStyle: settings.languagesNameItalic ? "italic" : "normal",
              }}
            >
              {lang.language}
            </Text>
          </View>
          <Text
            style={{
              fontSize: fontSize,
              color: "#666",
              fontFamily: settings.languagesFluencyBold
                ? boldFont
                : settings.languagesFluencyItalic
                  ? italicFont
                  : baseFont,
              fontWeight: settings.languagesFluencyBold ? "bold" : "normal",
              fontStyle: settings.languagesFluencyItalic ? "italic" : "normal",
            }}
          >
            {lang.fluency}
          </Text>
        </View>
      ))}
    </View>
  );
};
