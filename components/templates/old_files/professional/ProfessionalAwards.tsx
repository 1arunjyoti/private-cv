import React from "react";
import { View, Text } from "@react-pdf/renderer";
import { Resume } from "@/db";
import { PDFRichText } from "../PDFRichText";
import { formatDate } from "@/lib/template-utils";
import { LayoutSettings, TemplateStyles } from "@/components/design/types";

interface ProfessionalAwardsProps {
  awards: Resume["awards"];
  settings: LayoutSettings;
  styles: TemplateStyles;
  getColor: (target: string, fallback?: string) => string;
  fontSize: number;
  baseFont: string;
  boldFont: string;
  italicFont: string;
}

export const ProfessionalAwards: React.FC<ProfessionalAwardsProps> = ({
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
    <View style={styles.section}>
      {((settings.awardsHeadingVisible ?? true) as boolean) && (
        <View style={styles.sectionTitleWrapper}>
          <Text style={[styles.sectionTitle, { color: getColor("headings") }]}>
            Awards
          </Text>
        </View>
      )}
      {awards.map((award, index) => (
        <View key={award.id} style={{ marginBottom: 4, flexDirection: "row" }}>
          {settings.awardsListStyle === "bullet" && (
            <Text style={{ marginRight: 4, fontSize: fontSize }}>•</Text>
          )}
          {settings.awardsListStyle === "number" && (
            <Text style={{ marginRight: 4, fontSize: fontSize }}>
              {index + 1}.
            </Text>
          )}
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: fontSize,
                fontFamily: settings.awardsTitleBold
                  ? boldFont
                  : settings.awardsTitleItalic
                    ? italicFont
                    : baseFont,
                fontWeight: settings.awardsTitleBold ? "bold" : "normal",
                fontStyle: settings.awardsTitleItalic ? "italic" : "normal",
              }}
            >
              {award.title}
            </Text>
            <Text style={{ fontSize: fontSize - 0.5 }}>
              <Text
                style={{
                  fontFamily: settings.awardsAwarderBold ? boldFont : baseFont,
                  fontWeight: settings.awardsAwarderBold ? "bold" : "normal",
                  fontStyle: settings.awardsAwarderItalic ? "italic" : "normal",
                }}
              >
                {award.awarder}
              </Text>
              {" | "}
              <Text
                style={{
                  fontFamily: settings.awardsDateBold ? boldFont : baseFont,
                  fontWeight: settings.awardsDateBold ? "bold" : "normal",
                  fontStyle: settings.awardsDateItalic ? "italic" : "normal",
                }}
              >
                {formatDate(award.date)}
              </Text>
            </Text>
            {award.summary && (
              <View style={styles.entrySummary}>
                <PDFRichText
                  text={award.summary}
                  style={{ fontSize }}
                  fontSize={fontSize}
                />
              </View>
            )}
          </View>
        </View>
      ))}
    </View>
  );
};
