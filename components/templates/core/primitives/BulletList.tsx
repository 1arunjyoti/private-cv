/**
 * BulletList - Universal bullet/list rendering component
 *
 * Supports multiple list styles:
 * - bullet: Standard bullet points (•)
 * - number: Numbered list (1. 2. 3.)
 * - dash: Dash list (-)
 * - none: No markers, just indented text
 */

import React from "react";
import { View, Text, StyleSheet } from "@react-pdf/renderer";
import type { ListStyle, FontConfig, GetColorFn } from "../types";
import RichText from "./RichText";

export interface BulletListProps {
  items: string[];
  style?: ListStyle;
  fontSize: number;
  fonts: FontConfig;
  lineHeight?: number;
  bulletMargin?: number;
  bulletColor?: string;
  textColor?: string;
  linkColor?: string;
  getColor?: GetColorFn;
  /** Width of the bullet/number column */
  bulletWidth?: number;
  /** Left margin for the entire list */
  listMargin?: number;
  /** Custom bullet character */
  customBullet?: string;
  /** Bold text */
  bold?: boolean;
  /** Italic text */
  italic?: boolean;
  /** Show link icon */
  showLinkIcon?: boolean;
  /** Show full URL */
  showFullUrl?: boolean;
}

const BULLET_CHARS: Record<ListStyle, string> = {
  bullet: "•",
  dash: "-",
  number: "", // Handled separately
  none: "",
  blank: "",
  inline: "", // Handled separately
};

export const BulletList: React.FC<BulletListProps> = ({
  items,
  style = "bullet",
  fontSize,
  fonts,
  lineHeight = 1.3,
  bulletMargin = 2,
  bulletColor = "#333",
  textColor = "#444",
  linkColor,
  getColor,
  bulletWidth = 10,
  listMargin = 10,
  customBullet,
  bold = false,
  italic = false,
  showLinkIcon,
  showFullUrl,
}) => {
  if (!items || items.length === 0) return null;

  // Handle inline style (comma-separated)
  if (style === "inline") {
    const styles = StyleSheet.create({
      inlineText: {
        fontSize,
        fontFamily: bold ? fonts.bold : italic ? fonts.italic : fonts.base,
        fontWeight: bold ? "bold" : "normal",
        fontStyle: italic ? "italic" : "normal",
        color: textColor,
        lineHeight,
      },
    });

    return <Text style={styles.inlineText}>{items.join(", ")}</Text>;
  }

  const styles = StyleSheet.create({
    list: {
      marginLeft: listMargin,
      marginTop: 2,
    },
    item: {
      flexDirection: "row",
      marginBottom: bulletMargin,
    },
    bullet: {
      width: bulletWidth,
      fontSize,
      color: bulletColor,
      fontFamily: fonts.base,
    },
    text: {
      flex: 1,
    },
  });

  const getBulletText = (index: number): string => {
    if (customBullet) return customBullet;
    if (style === "number") return `${index + 1}.`;
    if (style === "none") return "";
    return BULLET_CHARS[style] || "•";
  };

  return (
    <View style={styles.list}>
      {items.map((item, index) => (
        <View key={index} style={styles.item}>
          {style !== "none" && (
            <Text style={styles.bullet}>{getBulletText(index)}</Text>
          )}
          <View style={styles.text}>
            <RichText
              text={item}
              fontSize={fontSize}
              fonts={fonts}
              lineHeight={lineHeight}
              color={textColor}
              linkColor={
                linkColor || (getColor ? getColor("links") : undefined)
              }
              showLinkIcon={showLinkIcon}
              showFullUrl={showFullUrl}
              style={{
                fontWeight: bold ? "bold" : "normal",
                fontStyle: italic ? "italic" : "normal",
              }}
            />
          </View>
        </View>
      ))}
    </View>
  );
};

/**
 * Single bullet item component for more granular control
 */
export interface BulletItemProps {
  text: string;
  index?: number;
  style?: ListStyle;
  fontSize: number;
  fonts: FontConfig;
  lineHeight?: number;
  bulletColor?: string;
  textColor?: string;
  linkColor?: string;
  getColor?: GetColorFn;
  bulletWidth?: number;
  customBullet?: string;
  bold?: boolean;
  italic?: boolean;
  showLinkIcon?: boolean;
  showFullUrl?: boolean;
}

export const BulletItem: React.FC<BulletItemProps> = ({
  text,
  index = 0,
  style = "bullet",
  fontSize,
  fonts,
  lineHeight = 1.3,
  bulletColor = "#333",
  textColor = "#444",
  linkColor,
  getColor,
  bulletWidth = 10,
  customBullet,
  bold = false,
  italic = false,
  showLinkIcon,
  showFullUrl,
}) => {
  const styles = StyleSheet.create({
    item: {
      flexDirection: "row",
      marginBottom: 2,
    },
    bullet: {
      width: bulletWidth,
      fontSize,
      color: bulletColor,
      fontFamily: fonts.base,
    },
    text: {
      flex: 1,
    },
  });

  const getBulletText = (): string => {
    if (customBullet) return customBullet;
    if (style === "number") return `${index + 1}.`;
    if (style === "none") return "";
    return BULLET_CHARS[style] || "•";
  };

  return (
    <View style={styles.item}>
      {style !== "none" && <Text style={styles.bullet}>{getBulletText()}</Text>}
      <View style={styles.text}>
        <RichText
          text={text}
          fontSize={fontSize}
          fonts={fonts}
          lineHeight={lineHeight}
          color={textColor}
          linkColor={linkColor || (getColor ? getColor("links") : undefined)}
          showLinkIcon={showLinkIcon}
          showFullUrl={showFullUrl}
          style={{
            fontWeight: bold ? "bold" : "normal",
            fontStyle: italic ? "italic" : "normal",
          }}
        />
      </View>
    </View>
  );
};

export default BulletList;
