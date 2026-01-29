/**
 * InterestsSection - Universal interests section component
 */

import React from "react";
import { View, Text, StyleSheet } from "@react-pdf/renderer";
import type { Interest, LayoutSettings } from "@/db";
import { SectionHeading } from "../primitives";
import type {
  FontConfig,
  GetColorFn,
  ListStyle,
  SectionHeadingStyle,
} from "../types";

export interface InterestsSectionProps {
  interests: Interest[];
  settings: LayoutSettings;
  fonts: FontConfig;
  fontSize: number;
  getColor: GetColorFn;
  lineHeight?: number;
  sectionTitle?: string;
  sectionMargin?: number;
  containerStyle?: object;
}

export const InterestsSection: React.FC<InterestsSectionProps> = ({
  interests,
  settings,
  fonts,
  fontSize,
  getColor,
  lineHeight = 1.3,
  sectionTitle = "Interests",
  sectionMargin,
  containerStyle,
}) => {
  if (!interests || interests.length === 0) return null;

  const themeColor = getColor("decorations", "#666666");
  const listStyle: ListStyle = settings.interestsListStyle || "none";

  const styles = StyleSheet.create({
    container: {
      marginBottom: sectionMargin ?? settings.sectionMargin ?? 12,
      ...containerStyle,
    },
    listContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
    },
    listItem: {
      flexDirection: "row",
      alignItems: "flex-start",
    },
    listPrefix: {
      fontSize,
      marginRight: 4,
    },
    interestName: {
      fontSize,
      fontFamily: settings.interestsNameBold
        ? fonts.bold
        : settings.interestsNameItalic
          ? fonts.italic
          : fonts.base,
      fontWeight: settings.interestsNameBold ? "bold" : "normal",
      fontStyle: settings.interestsNameItalic ? "italic" : "normal",
      color: "#333333",
    },
    keywords: {
      fontSize,
      fontFamily: settings.interestsKeywordsBold
        ? fonts.bold
        : settings.interestsKeywordsItalic
          ? fonts.italic
          : fonts.base,
      fontWeight: settings.interestsKeywordsBold ? "bold" : "normal",
      fontStyle: settings.interestsKeywordsItalic ? "italic" : "normal",
      color: "#666666",
    },
    // Bubble style
    bubbleContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 6,
    },
    bubble: {
      backgroundColor: themeColor + "15",
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 12,
    },
    bubbleText: {
      fontSize: fontSize - 1,
      color: "#374151",
    },
  });

  const getListPrefix = (index: number): string => {
    if (listStyle === "bullet") return "•";
    if (listStyle === "number") return `${index + 1}.`;
    return "";
  };

  return (
    <View style={styles.container}>
      {(settings.interestsHeadingVisible ?? true) && (
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

      <View style={styles.listContainer}>
        {interests.map((interest, index) => {
          const prefix = getListPrefix(index);

          return (
            <View key={interest.id || index} style={styles.listItem}>
              {prefix && <Text style={styles.listPrefix}>{prefix}</Text>}
              <Text style={styles.interestName}>
                {interest.name}
                {interest.keywords && interest.keywords.length > 0 && (
                  <Text style={styles.keywords}>
                    : {interest.keywords.join(", ")}
                  </Text>
                )}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default InterestsSection;
