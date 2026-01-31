/**
 * LanguagesSection - Universal languages section component
 */

import React from "react";
import { View, Text, StyleSheet } from "@react-pdf/renderer";
import type { Language, LayoutSettings } from "@/db";
import { SectionHeading } from "../primitives";
import { getLevelScore } from "@/lib/template-utils";
import type {
  FontConfig,
  GetColorFn,
  ListStyle,
  SectionHeadingStyle,
} from "../types";

export interface LanguagesSectionProps {
  languages: Language[];
  settings: LayoutSettings;
  fonts: FontConfig;
  fontSize: number;
  getColor: GetColorFn;
  lineHeight?: number;
  sectionTitle?: string;
  sectionMargin?: number;
  containerStyle?: object;
  /** Display style: list, inline, or level */
  displayStyle?: "list" | "inline" | "level";
}

export const LanguagesSection: React.FC<LanguagesSectionProps> = ({
  languages,
  settings,
  fonts,
  fontSize,
  getColor,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  lineHeight = 1.3,
  sectionTitle = "Languages",
  sectionMargin,
  containerStyle,
  displayStyle = "list",
}) => {
  if (!languages || languages.length === 0) return null;

  const themeColor = getColor("decorations", "#666666");
  const listStyle: ListStyle = settings.languagesListStyle || "none";

  const styles = StyleSheet.create({
    container: {
      marginBottom: sectionMargin ?? settings.sectionMargin ?? 12,
      ...containerStyle,
    },
    // List style
    listContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 4,
    },
    listItem: {
      flexDirection: "row",
      alignItems: "center",
    },
    listPrefix: {
      fontSize,
      marginRight: 4,
    },
    languageName: {
      fontSize,
      fontFamily: settings.languagesNameBold
        ? fonts.bold
        : settings.languagesNameItalic
          ? fonts.italic
          : fonts.base,
      fontWeight: settings.languagesNameBold ? "bold" : "normal",
      fontStyle: settings.languagesNameItalic ? "italic" : "normal",
      color: getColor("title", "#333333"),
    },
    fluency: {
      fontSize,
      fontFamily: settings.languagesFluencyBold
        ? fonts.bold
        : settings.languagesFluencyItalic
          ? fonts.italic
          : fonts.base,
      fontWeight: settings.languagesFluencyBold ? "bold" : "normal",
      fontStyle: settings.languagesFluencyItalic ? "italic" : "normal",
      color: getColor("text", "#666666"),
    },
    separator: {
      fontSize,
      color: getColor("text", "#666666"),
      marginHorizontal: 4,
    },
    // Inline style
    inlineContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
    },
    inlineItem: {
      flexDirection: "row",
      alignItems: "center",
    },
    // Level style
    levelContainer: {
      flexDirection: "column",
      gap: 6,
    },
    levelItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    levelIndicator: {
      flexDirection: "row",
      gap: 2,
    },
    levelDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
  });

  const getListPrefix = (index: number): string => {
    if (listStyle === "bullet") return "•";
    if (listStyle === "number") return `${index + 1}.`;
    return "";
  };

  // Render level indicator
  const renderLevelIndicator = (fluency: string) => {
    const score = getLevelScore(fluency);
    return (
      <View style={styles.levelIndicator}>
        {[1, 2, 3, 4, 5].map((i) => (
          <View
            key={i}
            style={[
              styles.levelDot,
              {
                backgroundColor:
                  i <= score ? themeColor : getColor("muted", "#e5e7eb"),
              },
            ]}
          />
        ))}
      </View>
    );
  };

  // Render based on display style
  const renderContent = () => {
    switch (displayStyle) {
      case "inline":
        return (
          <View style={styles.inlineContainer}>
            {languages.map((lang, index) => (
              <View key={lang.id || index} style={styles.inlineItem}>
                <Text style={styles.languageName}>{lang.language}</Text>
                {lang.fluency && (
                  <>
                    <Text style={styles.separator}>-</Text>
                    <Text style={styles.fluency}>{lang.fluency}</Text>
                  </>
                )}
              </View>
            ))}
          </View>
        );

      case "level":
        return (
          <View style={styles.levelContainer}>
            {languages.map((lang, index) => (
              <View key={lang.id || index} style={styles.levelItem}>
                <Text style={styles.languageName}>{lang.language}</Text>
                {lang.fluency && renderLevelIndicator(lang.fluency)}
              </View>
            ))}
          </View>
        );

      case "list":
      default:
        return (
          <View style={styles.listContainer}>
            {languages.map((lang, index) => {
              const prefix = getListPrefix(index);
              return (
                <View key={lang.id || index} style={styles.listItem}>
                  {prefix && <Text style={styles.listPrefix}>{prefix}</Text>}
                  <Text style={styles.languageName}>{lang.language}</Text>
                  {lang.fluency && (
                    <>
                      <Text style={styles.separator}>-</Text>
                      <Text style={styles.fluency}>{lang.fluency}</Text>
                    </>
                  )}
                </View>
              );
            })}
          </View>
        );
    }
  };

  return (
    <View style={styles.container}>
      {(settings.languagesHeadingVisible ?? true) && (
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

      {renderContent()}
    </View>
  );
};

export default LanguagesSection;
