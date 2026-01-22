import React from "react";
import { View, Text } from "@react-pdf/renderer";
import { Resume } from "@/db";
import { LayoutSettings, TemplateStyles } from "@/components/design/types";

interface CreativeLanguagesProps {
  languages: Resume["languages"];
  settings: LayoutSettings;
  styles: TemplateStyles;
  getColor: (target: string, fallback?: string) => string;
  fontSize: number;
  baseFont: string;
  boldFont: string;
  italicFont: string;
}

export const CreativeLanguages: React.FC<CreativeLanguagesProps> = ({
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

  // Sidebar List
  // Andrew Kim: English (Bold) - Native (Italic) [Progress bar?? image has bars]
  // Let's implement the bars if we can, or just text.
  // The image definitely has progress bars.

  const getSkillLevel = (level: string): number => {
    const levels: Record<string, number> = {
      beginner: 25,
      intermediate: 50,
      advanced: 75,
      fluent: 100,
      native: 100,
    };
    const lower = level.toLowerCase();

    if (levels[lower]) return levels[lower];

    // fallback checking text
    if (lower.includes("native") || lower.includes("fluent")) return 100;
    if (lower.includes("advanced") || lower.includes("working")) return 75;
    if (lower.includes("intermediate")) return 50;
    return 25;
  };

  return (
    <View key="languages" style={[styles.section, { fontFamily: baseFont }]}>
      {((settings.languagesHeadingVisible ?? true) as boolean) && (
        <View style={styles.sectionTitleWrapper}>
          <Text
            style={[
              styles.sectionTitle,
              {
                color: getColor("headings"),
              },
            ]}
          >
            Languages
          </Text>
        </View>
      )}

      {languages.map((lang, index) => {
        const listStyle = settings.languagesListStyle || "none";

        return (
          <View key={lang.id} style={{ marginBottom: 8, flexDirection: "row" }}>
            {listStyle === "bullet" && (
              <Text
                style={{
                  fontSize: fontSize,
                  marginRight: 4,
                  color: getColor("headings"),
                }}
              >
                •
              </Text>
            )}
            {listStyle === "number" && (
              <Text
                style={{
                  fontSize: fontSize,
                  marginRight: 4,
                  color: getColor("headings"),
                  minWidth: 12,
                }}
              >
                {index + 1}.
              </Text>
            )}

            <View style={{ flex: 1 }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 2,
                }}
              >
                <Text
                  style={{
                    fontFamily: settings.languagesNameBold
                      ? boldFont
                      : settings.languagesNameItalic
                        ? italicFont
                        : baseFont,
                    fontWeight: settings.languagesNameBold ? "bold" : "normal",
                    fontStyle: settings.languagesNameItalic
                      ? "italic"
                      : "normal",
                    fontSize: fontSize,
                  }}
                >
                  {lang.language}
                </Text>
              </View>
              {lang.fluency && (
                <Text
                  style={{
                    fontFamily: settings.languagesFluencyBold
                      ? boldFont
                      : settings.languagesFluencyItalic
                        ? italicFont
                        : baseFont,
                    fontWeight: settings.languagesFluencyBold
                      ? "bold"
                      : "normal",
                    fontStyle: settings.languagesFluencyItalic
                      ? "italic"
                      : "normal",
                    fontSize: fontSize - 1,
                    color: "#666",
                    marginBottom: 2,
                  }}
                >
                  {lang.fluency}
                </Text>
              )}

              {/* Progress Bar */}
              <View
                style={{
                  height: 3,
                  backgroundColor: "#ddd",
                  borderRadius: 1.5,
                  width: "100%",
                  marginTop: 2,
                }}
              >
                <View
                  style={{
                    height: 3,
                    backgroundColor: "#333", // Dark grey/black for bar fill in Andrew Kim
                    borderRadius: 1.5,
                    width: `${getSkillLevel(lang.fluency)}%`,
                  }}
                />
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
};
