import React from "react";
import { View, Text } from "@react-pdf/renderer";
import { Resume } from "@/db";
import { PDFRichText } from "../PDFRichText";
import { formatDate } from "@/lib/template-utils";

import { LayoutSettings, TemplateStyles } from "@/components/design/types";

interface ClassicAwardsProps {
  awards: Resume["awards"];
  settings: LayoutSettings;
  styles: TemplateStyles;
  getColor: (target: string, fallback?: string) => string;
  fontSize: number;
  baseFont: string;
  boldFont: string;
  italicFont: string;
}

export const ClassicAwards: React.FC<ClassicAwardsProps> = ({
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
      {awards.map((award, index) => (
        <View key={award.id} style={styles.entryBlock}>
          <View style={{ flexDirection: "row", marginBottom: 1 }}>
            {settings.awardsListStyle === "bullet" && (
              <Text style={{ marginRight: 4, fontSize: fontSize }}>•</Text>
            )}
            {settings.awardsListStyle === "number" && (
              <Text style={{ marginRight: 4, fontSize: fontSize }}>
                {index + 1}.
              </Text>
            )}
            <View style={{ flex: 1 }}>
              <View style={styles.entryHeader}>
                <Text
                  style={[
                    styles.entryTitle,
                    {
                      fontFamily: settings.awardsTitleBold
                        ? boldFont
                        : settings.awardsTitleItalic
                          ? italicFont
                          : baseFont,
                      fontWeight: settings.awardsTitleBold ? "bold" : "normal",
                      fontStyle: settings.awardsTitleItalic
                        ? "italic"
                        : "normal",
                    },
                  ]}
                >
                  {award.title}
                </Text>
                <Text
                  style={[
                    styles.entryDate,
                    {
                      fontFamily: settings.awardsDateBold
                        ? boldFont
                        : settings.awardsDateItalic
                          ? italicFont
                          : baseFont,
                      fontWeight: settings.awardsDateBold ? "bold" : "normal",
                      fontStyle: settings.awardsDateItalic
                        ? "italic"
                        : "normal",
                    },
                  ]}
                >
                  {formatDate(award.date)}
                </Text>
              </View>
              <Text
                style={[
                  styles.entrySubtitle,
                  {
                    fontFamily: settings.awardsAwarderBold
                      ? boldFont
                      : settings.awardsAwarderItalic
                        ? italicFont
                        : baseFont,
                    fontWeight: settings.awardsAwarderBold ? "bold" : "normal",
                    fontStyle: settings.awardsAwarderItalic
                      ? "italic"
                      : "normal",
                  },
                ]}
              >
                {award.awarder}
              </Text>
              {award.summary && (
                <PDFRichText
                  text={award.summary}
                  style={styles.entrySummary}
                  fontSize={fontSize}
                  fontFamily={baseFont}
                  boldFontFamily={boldFont}
                  italicFontFamily={italicFont}
                />
              )}
            </View>
          </View>
        </View>
      ))}
    </View>
  );
};
