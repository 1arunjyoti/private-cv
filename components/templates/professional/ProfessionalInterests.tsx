import React from "react";
import { View, Text } from "@react-pdf/renderer";
import { Resume } from "@/db";
import { LayoutSettings, TemplateStyles } from "@/components/design/types";

interface ProfessionalInterestsProps {
  interests: Resume["interests"];
  settings: LayoutSettings;
  styles: TemplateStyles;
  getColor: (target: string, fallback?: string) => string;
  fontSize: number;
  baseFont: string;
  boldFont: string;
  italicFont: string;
}

export const ProfessionalInterests: React.FC<ProfessionalInterestsProps> = ({
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
    <View style={styles.section}>
      {((settings.interestsHeadingVisible ?? true) as boolean) && (
        <View style={styles.sectionTitleWrapper}>
          <Text style={[styles.sectionTitle, { color: getColor("headings") }]}>
            Interests
          </Text>
        </View>
      )}
      <View style={{ flexDirection: "row", flexWrap: "wrap", rowGap: 2 }}>
        {interests.map((int, index) => (
          <View
            key={index}
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginRight: settings.interestsListStyle === "none" ? 3 : 8,
            }}
          >
            {settings.interestsListStyle === "bullet" && (
              <Text style={{ marginRight: 3, fontSize: fontSize }}>•</Text>
            )}
            {settings.interestsListStyle === "number" && (
              <Text style={{ marginRight: 4, fontSize: fontSize }}>
                {index + 1}.
              </Text>
            )}
            <Text
              style={{
                fontSize: fontSize,
                fontFamily: settings.interestsNameBold
                  ? boldFont
                  : settings.interestsNameItalic
                    ? italicFont
                    : baseFont,
                fontWeight: settings.interestsNameBold ? "bold" : "normal",
                fontStyle: settings.interestsNameItalic ? "italic" : "normal",
              }}
            >
              {int.name}
            </Text>
            {int.keywords && int.keywords.length > 0 && (
              <Text
                style={{
                  fontSize: fontSize,
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
                }}
              >
                : {int.keywords.join(", ")}
              </Text>
            )}
            {settings.interestsListStyle === "none" &&
              index < interests.length - 1 && (
                <Text style={{ fontSize: fontSize }}>,</Text>
              )}
          </View>
        ))}
      </View>
    </View>
  );
};
