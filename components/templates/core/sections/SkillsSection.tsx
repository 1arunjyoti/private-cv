/**
 * SkillsSection - Universal skills section component
 *
 * Supports multiple display styles:
 * - grid: Skills grouped in columns with keywords
 * - level: Skills with proficiency indicators
 * - compact: Inline comma-separated keywords
 * - bubble: Tag/pill style display
 */

import React from "react";
import { View, Text, StyleSheet } from "@react-pdf/renderer";
import type { Skill, LayoutSettings } from "@/db";
import { SectionHeading } from "../primitives";
import { getLevelScore } from "@/lib/template-utils";
import type { FontConfig, GetColorFn, SectionHeadingStyle } from "../types";

export interface SkillsSectionProps {
  skills: Skill[];
  settings: LayoutSettings;
  fonts: FontConfig;
  fontSize: number;
  getColor: GetColorFn;
  lineHeight?: number;
  sectionTitle?: string;
  sectionMargin?: number;
  containerStyle?: object;
  /** Override display style */
  displayStyle?: "grid" | "level" | "compact" | "bubble" | "boxed";
}

export const SkillsSection: React.FC<SkillsSectionProps> = ({
  skills,
  settings,
  fonts,
  fontSize,
  getColor,
  lineHeight = 1.3,
  sectionTitle = "Skills",
  sectionMargin,
  containerStyle,
  displayStyle,
}) => {
  if (!skills || skills.length === 0) return null;

  const themeColor = getColor("decorations", "#666666");
  const style = displayStyle || settings.skillsDisplayStyle || "grid";
  const levelStyle = settings.skillsLevelStyle || 0;
  const listStyle = settings.skillsListStyle || "blank";

  const styles = StyleSheet.create({
    container: {
      marginBottom: sectionMargin ?? settings.sectionMargin ?? 12,
      ...containerStyle,
    },
    // Grid style
    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
    },
    gridItem: {
      /* marginBottom: 6, */
      minWidth: "45%",
      flexDirection: "row",
      alignItems: "flex-start",
    },
    skillName: {
      fontSize: fontSize + 1,
      fontFamily: fonts.bold,
      fontWeight: "bold",
      color: getColor("title", "#1a1a1a"),
    },
    skillKeywords: {
      fontSize,
      color: getColor("text", "#555555"),
      lineHeight,
    },
    // Level style
    levelContainer: {
      marginBottom: 6,
      flexDirection: "row",
      alignItems: "flex-start",
    },
    levelRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 4,
    },
    levelName: {
      fontSize,
      fontFamily: fonts.base,
      color: getColor("title", "#333333"),
    },
    levelIndicator: {
      flexDirection: "row",
      gap: 2,
      marginLeft: 4,
    },
    levelDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    levelBar: {
      height: 4,
      borderRadius: 2,
    },
    levelBarContainer: {
      width: 60,
      height: 4,
      backgroundColor: "#e5e7eb",
      borderRadius: 2,
    },
    // Compact style
    compactContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 4,
    },
    compactItem: {
      fontSize,
      color: getColor("text", "#444444"),
    },
    // Bubble/Tag style
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
      color: getColor("text", "#374151"),
    },
    bubbleCategory: {
      marginBottom: 8,
    },
    bubbleCategoryName: {
      fontSize,
      fontFamily: fonts.bold,
      fontWeight: "bold",
      color: getColor("title", "#1a1a1a"),
    },
    // List prefix styles
    listItemRow: {
      flexDirection: "row",
      alignItems: "flex-start",
    },
    listPrefix: {
      fontSize,
      color: getColor("subtext", "#666666"),
      marginRight: 6,
      minWidth: listStyle === "number" ? 18 : 12,
    },
    listContent: {
      flex: 1,
      flexShrink: 1,
    },
  });

  // Get list prefix based on style
  const getListPrefix = (index: number): string => {
    // 'inline' style is handled separately with vertical list layout
    if (listStyle === "inline") return "";
    if (listStyle === "bullet") return "•";
    if (listStyle === "number") return `${index + 1}.`;
    if (listStyle === "dash") return "-";
    // 'blank' and 'none' mean no prefix
    return "";
  };

  // Render level indicator based on style
  const renderLevelIndicator = (level: string) => {
    const score = getLevelScore(level);

    // Style 0: No indicator
    if (levelStyle === 0) return null;

    // Style 1: Dots
    if (levelStyle === 1) {
      return (
        <View style={styles.levelIndicator}>
          {[1, 2, 3, 4, 5].map((i) => (
            <View
              key={i}
              style={[
                styles.levelDot,
                {
                  backgroundColor: i <= score ? themeColor : "#e5e7eb",
                },
              ]}
            />
          ))}
        </View>
      );
    }

    // Style 2: Squares
    if (levelStyle === 2) {
      return (
        <View style={styles.levelIndicator}>
          {[1, 2, 3, 4, 5].map((i) => (
            <View
              key={i}
              style={[
                styles.levelDot,
                {
                  borderRadius: 0,
                  backgroundColor: i <= score ? themeColor : "#e5e7eb",
                },
              ]}
            />
          ))}
        </View>
      );
    }

    // Style 3: Signal bars (growing height)
    if (levelStyle === 3) {
      return (
        <View
          style={{
            flexDirection: "row",
            gap: 2,
            alignItems: "flex-end",
            height: 10,
            marginLeft: 4,
          }}
        >
          {[1, 2, 3, 4, 5].map((i) => (
            <View
              key={i}
              style={{
                width: 4,
                height: i * 2,
                backgroundColor: i <= score ? themeColor : "#e5e7eb",
              }}
            />
          ))}
        </View>
      );
    }

    // Style 4: Text label
    if (levelStyle === 4) {
      return (
        <Text
          style={{
            fontSize: fontSize - 1,
            fontWeight: "normal",
            color: getColor("subtext", "#666666"),
            marginLeft: 4,
          }}
        >
          {`(${level})`}
        </Text>
      );
    }

    return null;
  };

  // Render based on display style
  const renderContent = () => {
    // Special handling for 'inline' list style - render as simple vertical list
    if (listStyle === "inline") {
      return (
        <View>
          {skills.map((skill) => (
            <View
              key={skill.id}
              style={{
                marginBottom: 4,
                flexDirection: "row",
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <Text style={styles.skillName}>{skill.name}</Text>
              {skill.level && renderLevelIndicator(skill.level)}
              {skill.keywords.length > 0 && (
                <Text style={styles.skillKeywords}>
                  {": "}
                  {skill.keywords.join(", ")}
                </Text>
              )}
            </View>
          ))}
        </View>
      );
    }

    switch (style) {
      case "grid":
        return (
          <View style={styles.grid}>
            {skills.map((skill, index) => {
              const prefix = getListPrefix(index);
              return (
                <View key={skill.id} style={styles.gridItem}>
                  {prefix && <Text style={styles.listPrefix}>{prefix}</Text>}
                  <View style={prefix ? styles.listContent : undefined}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        flexWrap: "wrap",
                        marginBottom: 2,
                      }}
                    >
                      <Text style={styles.skillName}>{skill.name}</Text>
                      {skill.level && renderLevelIndicator(skill.level)}
                    </View>
                    {skill.keywords.length > 0 && (
                      <Text style={styles.skillKeywords}>
                        {skill.keywords.join(", ")}
                      </Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        );

      case "level":
        return (
          <View>
            {skills.map((skill, index) => {
              const prefix = getListPrefix(index);
              return (
                <View key={skill.id} style={styles.levelContainer}>
                  {prefix && <Text style={styles.listPrefix}>{prefix}</Text>}
                  <View style={prefix ? styles.listContent : undefined}>
                    <View style={styles.levelRow}>
                      <Text style={styles.levelName}>{skill.name}</Text>
                      {skill.level && renderLevelIndicator(skill.level)}
                    </View>
                    {skill.keywords.length > 0 && (
                      <Text style={styles.skillKeywords}>
                        {skill.keywords.join(", ")}
                      </Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        );

      case "compact":
        // Flatten all keywords into a single list
        const allKeywords = skills.flatMap((skill) =>
          skill.keywords.length > 0 ? skill.keywords : [skill.name],
        );
        return (
          <View style={styles.compactContainer}>
            <Text style={styles.compactItem}>{allKeywords.join(" • ")}</Text>
          </View>
        );

      case "bubble":
        return (
          <View>
            {skills.map((skill) => (
              <View key={skill.id} style={styles.bubbleCategory}>
                {skill.name && (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      flexWrap: "wrap",
                      marginBottom: 4,
                    }}
                  >
                    <Text style={styles.bubbleCategoryName}>{skill.name}</Text>
                    {skill.level && renderLevelIndicator(skill.level)}
                  </View>
                )}
                <View style={styles.bubbleContainer}>
                  {skill.keywords.map((keyword, i) => (
                    <View key={i} style={styles.bubble}>
                      <Text style={styles.bubbleText}>{keyword}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        );

      case "boxed":
        return (
          <View>
            {skills.map((skill) => (
              <View key={skill.id} style={styles.bubbleCategory}>
                {skill.name && (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      flexWrap: "wrap",
                      marginBottom: 4,
                    }}
                  >
                    <Text style={styles.bubbleCategoryName}>{skill.name}</Text>
                    {skill.level && renderLevelIndicator(skill.level)}
                  </View>
                )}
                <View style={[styles.bubbleContainer, { gap: 8 }]}>
                  {skill.keywords.map((keyword, i) => (
                    <View
                      key={i}
                      style={{
                        borderWidth: 1,
                        borderColor: themeColor,
                        paddingHorizontal: 10,
                        paddingVertical: 5,
                        borderRadius: 2, // Boxy look
                      }}
                    >
                      <Text
                        style={{
                          fontSize: fontSize,
                          color: getColor("text", "#374151"),
                          fontFamily: fonts.bold,
                        }}
                      >
                        {keyword}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Section Heading */}
      {(settings.skillsHeadingVisible ?? true) && (
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

export default SkillsSection;
