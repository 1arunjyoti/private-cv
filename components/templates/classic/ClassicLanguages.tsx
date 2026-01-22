import React from "react";
import { View, Text } from "@react-pdf/renderer";
import { Resume } from "@/db";

import { LayoutSettings, TemplateStyles } from "@/components/design/types";

interface ClassicLanguagesProps {
  languages: Resume["languages"];
  settings: LayoutSettings;
  styles: TemplateStyles;
  getColor: (target: string, fallback?: string) => string;
  fontSize: number;
  baseFont: string;
  boldFont: string;
  italicFont: string;
}

export const ClassicLanguages: React.FC<ClassicLanguagesProps> = ({
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
    <View key="languages" style={styles.section}>
      {((settings.languagesHeadingVisible ?? true) as boolean) && (
        <View style={styles.sectionTitleWrapper}>
          <Text style={[styles.sectionTitle, { color: getColor("headings") }]}>
            Languages
          </Text>
        </View>
      )}
      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
        {languages.map((lang, index) => (
          <View
            key={index}
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginRight: settings.languagesListStyle === "none" ? 3 : 8,
              marginBottom: 2,
            }}
          >
            {settings.languagesListStyle === "bullet" && (
              <Text style={{ marginRight: 3, fontSize: fontSize }}>•</Text>
            )}
            {settings.languagesListStyle === "number" && (
              <Text style={{ marginRight: 3, fontSize: fontSize }}>
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
            {lang.fluency && (
              <Text
                style={{
                  fontSize: fontSize,
                  fontFamily: settings.languagesFluencyBold
                    ? boldFont
                    : settings.languagesFluencyItalic
                      ? italicFont
                      : baseFont,
                  fontWeight: settings.languagesFluencyBold ? "bold" : "normal",
                  fontStyle: settings.languagesFluencyItalic
                    ? "italic"
                    : "normal",
                  marginLeft: 2,
                }}
              >
                ({lang.fluency})
              </Text>
            )}
            {settings.languagesListStyle === "none" &&
              index < languages.length - 1 && (
                <Text style={{ fontSize: fontSize }}>,</Text>
              )}
          </View>
        ))}
      </View>
    </View>
  );
};
