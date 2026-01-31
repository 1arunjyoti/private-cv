/**
 * SummarySection - Universal summary/objective section component
 */

import React from "react";
import { View, Text, StyleSheet } from "@react-pdf/renderer";
import type { LayoutSettings } from "@/db";
import { SectionHeading, RichText } from "../primitives";
import type { FontConfig, GetColorFn, SectionHeadingStyle } from "../types";

export interface SummarySectionProps {
  summary: string;
  settings: LayoutSettings;
  fonts: FontConfig;
  fontSize: number;
  getColor: GetColorFn;
  lineHeight?: number;
  sectionTitle?: string;
  sectionMargin?: number;
  containerStyle?: object;
  /** Whether to use rich text rendering (supports markdown-like formatting) */
  useRichText?: boolean;
}

export const SummarySection: React.FC<SummarySectionProps> = ({
  summary,
  settings,
  fonts,
  fontSize,
  getColor,
  lineHeight = 1.4,
  sectionTitle = "Profile",
  sectionMargin,
  containerStyle,
  useRichText = true,
}) => {
  if (!summary) return null;

  const styles = StyleSheet.create({
    container: {
      marginBottom: sectionMargin ?? settings.sectionMargin ?? 12,
      ...containerStyle,
    },
    summaryText: {
      fontSize,
      color: getColor("text", "#444444"),
      lineHeight,
      textAlign: "justify",
    },
  });

  return (
    <View style={styles.container}>
      {(settings.summaryHeadingVisible ?? true) && (
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

      {useRichText ? (
        <RichText
          text={summary}
          fontSize={fontSize}
          fonts={fonts}
          lineHeight={lineHeight}
          linkColor={getColor("links")}
          showLinkIcon={settings.linkShowIcon}
          showFullUrl={settings.linkShowFullUrl}
          style={styles.summaryText}
        />
      ) : (
        <Text style={styles.summaryText}>{summary}</Text>
      )}
    </View>
  );
};

export default SummarySection;
