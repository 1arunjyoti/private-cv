import React from "react";
import { View, Text } from "@react-pdf/renderer";
import { Resume } from "@/db";
import { LayoutSettings, TemplateStyles } from "@/components/design/types";
import { formatDate } from "@/lib/template-utils";

interface CreativeAwardsProps {
  awards: Resume["awards"];
  settings: LayoutSettings;
  styles: TemplateStyles;
  getColor: (target: string, fallback?: string) => string;
  fontSize: number;
  baseFont: string;
  boldFont: string;
  italicFont: string;
}

export const CreativeAwards: React.FC<CreativeAwardsProps> = ({
  awards,
  settings,
  styles,
  getColor,
  fontSize,
  baseFont,
  boldFont,
  italicFont,
}) => {
  if (!awards || awards.length === 0) return null;

  return (
    <View key="awards" style={styles.section}>
      {((settings.awardsHeadingVisible ?? true) as boolean) && (
        <View style={styles.sectionTitleWrapper}>
          <Text style={[styles.sectionTitle, { color: getColor("headings") }]}>
            Awards
          </Text>
        </View>
      )}

      {awards.map((award, index) => {
        const listStyle = settings.awardsListStyle || "none";

        return (
          <View
            key={award.id}
            style={{ ...styles.entryBlock, flexDirection: "row" }}
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
                  fontFamily: settings.awardsTitleBold
                    ? boldFont
                    : settings.awardsTitleItalic
                      ? italicFont
                      : baseFont,
                  fontWeight: settings.awardsTitleBold ? "bold" : "normal",
                  fontStyle: settings.awardsTitleItalic ? "italic" : "normal",
                  fontSize: fontSize,
                }}
              >
                {award.title}
              </Text>
              <Text
                style={{
                  fontFamily: settings.awardsAwarderBold
                    ? boldFont
                    : settings.awardsAwarderItalic
                      ? italicFont
                      : baseFont,
                  fontWeight: settings.awardsAwarderBold ? "bold" : "normal",
                  fontStyle: settings.awardsAwarderItalic ? "italic" : "normal",
                  fontSize: fontSize - 1,
                  color: "#555",
                }}
              >
                {award.awarder}
                {award.date && (
                  <Text
                    style={{
                      fontFamily: settings.awardsDateBold
                        ? boldFont
                        : settings.awardsDateItalic
                          ? italicFont
                          : baseFont,
                      fontWeight: settings.awardsDateBold ? "bold" : "normal",
                      fontStyle: settings.awardsDateItalic
                        ? "italic"
                        : "normal",
                    }}
                  >
                    {` | ${formatDate(award.date)}`}
                  </Text>
                )}
              </Text>
              {award.summary && (
                <Text
                  style={{
                    fontFamily: italicFont,
                    fontStyle: "italic",
                    fontSize: fontSize - 1,
                    color: "#666",
                    marginTop: 1,
                  }}
                >
                  {award.summary}
                </Text>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
};
