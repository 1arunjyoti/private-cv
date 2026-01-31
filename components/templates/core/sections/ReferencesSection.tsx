/**
 * ReferencesSection - Universal references section component
 */

import React from "react";
import { View, Text, StyleSheet } from "@react-pdf/renderer";
import type { Reference, LayoutSettings } from "@/db";
import { SectionHeading, RichText } from "../primitives";
import type {
  FontConfig,
  GetColorFn,
  ListStyle,
  SectionHeadingStyle,
} from "../types";

export interface ReferencesSectionProps {
  references: Reference[];
  settings: LayoutSettings;
  fonts: FontConfig;
  fontSize: number;
  getColor: GetColorFn;
  lineHeight?: number;
  sectionTitle?: string;
  sectionMargin?: number;
  containerStyle?: object;
}

export const ReferencesSection: React.FC<ReferencesSectionProps> = ({
  references,
  settings,
  fonts,
  fontSize,
  getColor,
  lineHeight = 1.3,
  sectionTitle = "References",
  sectionMargin,
  containerStyle,
}) => {
  if (!references || references.length === 0) return null;

  const listStyle: ListStyle = settings.referencesListStyle || "none";

  const styles = StyleSheet.create({
    container: {
      marginBottom: sectionMargin ?? settings.sectionMargin ?? 12,
      ...containerStyle,
    },
    entryBlock: {
      marginBottom: 8,
    },
    nameRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    listPrefix: {
      fontSize,
      marginRight: 4,
    },
    name: {
      fontSize: fontSize + 1,
      fontFamily: settings.referencesNameBold
        ? fonts.bold
        : settings.referencesNameItalic
          ? fonts.italic
          : fonts.base,
      fontWeight: settings.referencesNameBold ? "bold" : "normal",
      fontStyle: settings.referencesNameItalic ? "italic" : "normal",
      color: getColor("title", "#1a1a1a"),
    },
    position: {
      fontSize,
      fontFamily: settings.referencesPositionBold
        ? fonts.bold
        : settings.referencesPositionItalic
          ? fonts.italic
          : fonts.base,
      fontWeight: settings.referencesPositionBold ? "bold" : "normal",
      fontStyle: settings.referencesPositionItalic ? "italic" : "normal",
      color: getColor("subtext", "#555555"),
    },
    reference: {
      fontSize,
      color: getColor("text", "#444444"),
      marginTop: 4,
      lineHeight,
      fontStyle: "italic",
    },
  });

  const getListPrefix = (index: number): string => {
    if (listStyle === "bullet") return "•";
    if (listStyle === "number") return `${index + 1}.`;
    return "";
  };

  return (
    <View style={styles.container}>
      {(settings.referencesHeadingVisible ?? true) && (
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

      {references.map((ref, index) => {
        const prefix = getListPrefix(index);

        return (
          <View key={ref.id} style={styles.entryBlock}>
            <View style={styles.nameRow}>
              {prefix && <Text style={styles.listPrefix}>{prefix}</Text>}
              <Text style={styles.name}>{ref.name}</Text>
            </View>

            {ref.position && (
              <Text style={styles.position}>{ref.position}</Text>
            )}

            {ref.reference && (
              <RichText
                text={`"${ref.reference}"`}
                fontSize={fontSize}
                fonts={fonts}
                lineHeight={lineHeight}
                linkColor={getColor("links", "#444444")}
                showLinkIcon={settings.linkShowIcon}
                showFullUrl={settings.linkShowFullUrl}
                style={styles.reference}
              />
            )}
          </View>
        );
      })}
    </View>
  );
};

export default ReferencesSection;
