/**
 * CustomSection - Universal custom section component
 */

import React from "react";
import { View, Text, Link, StyleSheet } from "@react-pdf/renderer";
import type { CustomSection as CustomSectionType, LayoutSettings } from "@/db";
import { SectionHeading, RichText } from "../primitives";
import type {
  FontConfig,
  GetColorFn,
  ListStyle,
  SectionHeadingStyle,
} from "../types";

export interface CustomSectionProps {
  custom: CustomSectionType[];
  settings: LayoutSettings;
  fonts: FontConfig;
  fontSize: number;
  getColor: GetColorFn;
  lineHeight?: number;
  sectionMargin?: number;
  containerStyle?: object;
}

export const CustomSection: React.FC<CustomSectionProps> = ({
  custom,
  settings,
  fonts,
  fontSize,
  getColor,
  lineHeight = 1.3,
  sectionMargin,
  containerStyle,
}) => {
  if (!custom || custom.length === 0) return null;

  const linkColor = getColor("links", "#444444");
  const listStyle: ListStyle = settings.customSectionListStyle || "none";

  const styles = StyleSheet.create({
    container: {
      marginBottom: sectionMargin ?? settings.sectionMargin ?? 12,
      ...containerStyle,
    },
    sectionBlock: {
      marginBottom: 12,
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
    nameRow: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    listPrefix: {
      fontSize,
      marginRight: 4,
    },
    name: {
      fontSize: fontSize + 1,
      fontFamily: settings.customSectionNameBold
        ? fonts.bold
        : settings.customSectionNameItalic
          ? fonts.italic
          : fonts.base,
      fontWeight: settings.customSectionNameBold ? "bold" : "normal",
      fontStyle: settings.customSectionNameItalic ? "italic" : "normal",
      color: "#1a1a1a",
    },
    date: {
      fontSize,
      fontFamily: settings.customSectionDateBold
        ? fonts.bold
        : settings.customSectionDateItalic
          ? fonts.italic
          : fonts.base,
      fontWeight: settings.customSectionDateBold ? "bold" : "normal",
      fontStyle: settings.customSectionDateItalic ? "italic" : "normal",
      color: "#666666",
    },
    description: {
      fontSize,
      fontFamily: settings.customSectionDescriptionBold
        ? fonts.bold
        : settings.customSectionDescriptionItalic
          ? fonts.italic
          : fonts.base,
      fontWeight: settings.customSectionDescriptionBold ? "bold" : "normal",
      fontStyle: settings.customSectionDescriptionItalic ? "italic" : "normal",
      color: "#555555",
    },

    url: {
      fontSize: fontSize - 1,
      color: linkColor,
      marginTop: 2,
      textDecoration: "none",
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
      {custom.map((section) => (
        <View key={section.id} style={styles.sectionBlock}>
          {(settings.customHeadingVisible ?? true) && (
            <SectionHeading
              title={section.name}
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

          {section.items.map((item, index) => {
            const prefix = getListPrefix(index);

            return (
              <View key={item.id} style={styles.entryBlock}>
                <View style={styles.headerRow}>
                  <View style={styles.nameRow}>
                    {prefix && <Text style={styles.listPrefix}>{prefix}</Text>}
                    <Text style={styles.name}>{item.name}</Text>
                    {item.url &&
                      (settings.linkShowIcon || settings.linkShowFullUrl) && (
                        <Link src={item.url} style={{ textDecoration: "none" }}>
                          <Text
                            style={{
                              fontSize: fontSize - 1,
                              color: linkColor,
                              marginLeft: 4,
                              fontWeight: settings.customSectionUrlBold
                                ? "bold"
                                : "normal",
                              fontStyle: settings.customSectionUrlItalic
                                ? "italic"
                                : "normal",
                            }}
                          >
                            {settings.linkShowFullUrl
                              ? `  ${item.url.replace(/^https?:\/\//, "").replace(/\/$/, "")}`
                              : settings.linkShowIcon
                                ? " 🔗"
                                : ""}
                          </Text>
                        </Link>
                      )}
                  </View>
                  {item.date && <Text style={styles.date}>{item.date}</Text>}
                </View>

                {item.description && (
                  <Text style={styles.description}>{item.description}</Text>
                )}

                {item.url &&
                  !settings.linkShowIcon &&
                  !settings.linkShowFullUrl && (
                    <Link src={item.url}>
                      <Text style={styles.url}>
                        {item.url
                          .replace(/^https?:\/\//, "")
                          .replace(/\/$/, "")}
                      </Text>
                    </Link>
                  )}

                {item.summary && (
                  <RichText
                    text={item.summary}
                    fontSize={fontSize}
                    fonts={fonts}
                    lineHeight={lineHeight}
                    linkColor={linkColor}
                    showLinkIcon={settings.linkShowIcon}
                    showFullUrl={settings.linkShowFullUrl}
                    style={styles.summary}
                  />
                )}
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
};

export default CustomSection;
