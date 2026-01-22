import React from "react";
import { View, Text } from "@react-pdf/renderer";
import { Resume } from "@/db";
import { LayoutSettings, TemplateStyles } from "@/components/design/types";

interface CreativeInterestsProps {
  interests: Resume["interests"];
  settings: LayoutSettings;
  styles: TemplateStyles;
  getColor: (target: string, fallback?: string) => string;
  fontSize: number;
  baseFont: string;
  boldFont: string;
  italicFont: string;
}

export const CreativeInterests: React.FC<CreativeInterestsProps> = ({
  interests,
  settings,
  styles,
  getColor,
  fontSize,
  baseFont,
  boldFont,
  italicFont,
}) => {
  if (!interests || interests.length === 0) return null;

  return (
    <View key="interests" style={styles.section}>
      {((settings.interestsHeadingVisible ?? true) as boolean) && (
        <View style={styles.sectionTitleWrapper}>
          <Text
            style={[
              styles.sectionTitle,
              {
                color: getColor("headings"),
              },
            ]}
          >
            Interests
          </Text>
        </View>
      )}

      {interests.map((interest, index) => {
        const listStyle = settings.interestsListStyle || "none";

        return (
          <View
            key={interest.id}
            style={{ marginBottom: 6, flexDirection: "row" }}
          >
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
              <Text
                style={{
                  fontFamily: settings.interestsNameBold
                    ? boldFont
                    : settings.interestsNameItalic
                      ? italicFont
                      : baseFont,
                  fontWeight: settings.interestsNameBold ? "bold" : "normal",
                  fontStyle: settings.interestsNameItalic ? "italic" : "normal",
                  fontSize: fontSize,
                }}
              >
                {interest.name}
              </Text>
              {interest.keywords && interest.keywords.length > 0 && (
                <Text
                  style={{
                    fontFamily: settings.interestsKeywordsBold
                      ? boldFont
                      : settings.interestsKeywordsItalic
                        ? italicFont
                        : baseFont,
                    fontWeight: settings.interestsKeywordsBold
                      ? "bold"
                      : "normal",
                    fontStyle: settings.interestsKeywordsItalic
                      ? "italic"
                      : "normal",
                    fontSize: fontSize - 1,
                    color: "#555",
                  }}
                >
                  {interest.keywords.join(", ")}
                </Text>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
};
