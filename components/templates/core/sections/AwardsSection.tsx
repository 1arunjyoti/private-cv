/**
 * AwardsSection - Universal awards section component
 */

import React from "react";
import { View, Text, StyleSheet } from "@react-pdf/renderer";
import type { Award, LayoutSettings } from "@/db";
import { formatDate } from "@/lib/template-utils";
import { SectionHeading, RichText } from "../primitives";
import type {
  FontConfig,
  GetColorFn,
  ListStyle,
  SectionHeadingStyle,
} from "../types";

export interface AwardsSectionProps {
  awards: Award[];
  settings: LayoutSettings;
  fonts: FontConfig;
  fontSize: number;
  getColor: GetColorFn;
  lineHeight?: number;
  sectionTitle?: string;
  sectionMargin?: number;
  containerStyle?: object;
}

export const AwardsSection: React.FC<AwardsSectionProps> = ({
  awards,
  settings,
  fonts,
  fontSize,
  getColor,
  lineHeight = 1.3,
  sectionTitle = "Awards",
  sectionMargin,
  containerStyle,
}) => {
  if (!awards || awards.length === 0) return null;

  const listStyle: ListStyle = settings.awardsListStyle || "none";

  const styles = StyleSheet.create({
    container: {
      marginBottom: sectionMargin ?? settings.sectionMargin ?? 12,
      ...containerStyle,
    },
    entryBlock: {
      marginBottom: 8,
    },
    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "baseline",
      marginBottom: 2,
    },
    titleRow: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    listPrefix: {
      fontSize,
      marginRight: 4,
    },
    title: {
      fontSize: fontSize + 1,
      fontFamily: settings.awardsTitleBold
        ? fonts.bold
        : settings.awardsTitleItalic
          ? fonts.italic
          : fonts.base,
      fontWeight: settings.awardsTitleBold ? "bold" : "normal",
      fontStyle: settings.awardsTitleItalic ? "italic" : "normal",
      color: "#1a1a1a",
    },
    date: {
      fontSize,
      fontFamily: settings.awardsDateBold
        ? fonts.bold
        : settings.awardsDateItalic
          ? fonts.italic
          : fonts.base,
      fontWeight: settings.awardsDateBold ? "bold" : "normal",
      fontStyle: settings.awardsDateItalic ? "italic" : "normal",
      color: "#666666",
    },
    awarder: {
      fontSize,
      fontFamily: settings.awardsAwarderBold
        ? fonts.bold
        : settings.awardsAwarderItalic
          ? fonts.italic
          : fonts.base,
      fontWeight: settings.awardsAwarderBold ? "bold" : "normal",
      fontStyle: settings.awardsAwarderItalic ? "italic" : "normal",
      color: "#555555",
    },
    summary: {
      fontSize,
      color: "#444444",
      marginTop: 2,
      lineHeight,
    },
  });

  const getListPrefix = (index: number): string => {
    if (listStyle === "bullet") return "•";
    if (listStyle === "number") return `${index + 1}.`;
    return "";
  };

  return (
    <View style={styles.container}>
      {(settings.awardsHeadingVisible ?? true) && (
        <SectionHeading
          title={sectionTitle}
          style={settings.sectionHeadingStyle as SectionHeadingStyle}
          align={settings.sectionHeadingAlign}
          bold={settings.sectionHeadingBold}
          capitalization={settings.sectionHeadingCapitalization}
          size={settings.sectionHeadingSize}
          fontSize={fontSize}
          fontFamily={fonts.base}
          getColor={getColor}
          letterSpacing={
            (settings as unknown as Record<string, unknown>)
              .sectionHeadingLetterSpacing as number
          }
        />
      )}

      {awards.map((award, index) => {
        const prefix = getListPrefix(index);

        return (
          <View key={award.id} style={styles.entryBlock}>
            <View style={styles.headerRow}>
              <View style={styles.titleRow}>
                {prefix && <Text style={styles.listPrefix}>{prefix}</Text>}
                <Text style={styles.title}>{award.title}</Text>
              </View>
              {award.date && (
                <Text style={styles.date}>{formatDate(award.date)}</Text>
              )}
            </View>

            {award.awarder && (
              <Text style={styles.awarder}>{award.awarder}</Text>
            )}

            {award.summary && (
              <RichText
                text={award.summary}
                fontSize={fontSize}
                fonts={fonts}
                lineHeight={lineHeight}
                linkColor={getColor("links", "#444444")}
                showLinkIcon={settings.linkShowIcon}
                showFullUrl={settings.linkShowFullUrl}
                style={styles.summary}
              />
            )}
          </View>
        );
      })}
    </View>
  );
};

export default AwardsSection;
