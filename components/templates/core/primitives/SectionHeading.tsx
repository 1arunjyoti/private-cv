/**
 * SectionHeading - Universal section heading component
 *
 * Supports 8 different visual styles consistently across all templates:
 * 1. Solid Underline
 * 2. No Decoration (Text only)
 * 3. Double/Bold Underline
 * 4. Background Highlight
 * 5. Left Accent
 * 6. Top & Bottom Border
 * 7. Dashed Underline
 * 8. Dotted Underline
 */

import React from "react";
import { View, Text, StyleSheet } from "@react-pdf/renderer";
import type { SectionHeadingStyle, GetColorFn } from "../types";

export interface SectionHeadingProps {
  title: string;
  style?: SectionHeadingStyle;
  align?: "left" | "center" | "right";
  bold?: boolean;
  capitalization?: "capitalize" | "uppercase" | "lowercase";
  size?: "S" | "M" | "L" | "XL";
  fontSize: number;
  fontFamily: string;
  getColor: GetColorFn;
  /** Letter spacing for the heading text */
  letterSpacing?: number;
  /** Custom wrapper styles to override defaults */
  wrapperStyle?: object;
  /** Custom text styles to override defaults */
  textStyle?: object;
}

// Font size multipliers for different size options
const SIZE_MULTIPLIERS = {
  S: 0,
  M: 1,
  L: 2,
  XL: 4,
};

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  title,
  style = 1,
  align = "left",
  bold = true,
  capitalization = "uppercase",
  size = "M",
  fontSize,
  fontFamily,
  getColor,
  letterSpacing = 0.5,
  wrapperStyle,
  textStyle,
}) => {
  const decorationColor = getColor("decorations", "#000000");
  const headingColor = getColor("headings", "#1a1a1a");

  const computedFontSize = fontSize + SIZE_MULTIPLIERS[size];

  // Base wrapper styles
  const baseWrapperStyles: object = {
    marginBottom: 3,
    flexDirection: "row",
    justifyContent:
      align === "center"
        ? "center"
        : align === "right"
          ? "flex-end"
          : "flex-start",
    alignItems: "center",
  };

  // Get style-specific wrapper decorations
  const getStyleDecorations = (): object => {
    switch (style) {
      case 1: // Solid Underline
        return {
          borderBottomWidth: 1,
          borderBottomColor: decorationColor,
          paddingBottom: 3,
        };
      case 2: // No Decoration
        return {};
      case 3: // Double/Bold Underline
        return {
          borderBottomWidth: 1,
          borderBottomColor: decorationColor,
          borderStyle: "solid",
          paddingBottom: 3,
        };
      case 4: // Background Highlight
        return {
          backgroundColor: decorationColor + "20",
          paddingVertical: 2,
          paddingHorizontal: 6,
          borderRadius: 3,
        };
      case 5: // Left Accent
        return {
          borderLeftWidth: 2,
          borderLeftColor: decorationColor,
          paddingLeft: 6,
        };
      case 6: // Top & Bottom Border
        return {
          borderTopWidth: 1,
          borderBottomWidth: 1,
          borderTopColor: decorationColor,
          borderBottomColor: decorationColor,
          paddingVertical: 2,
        };
      case 7: // Dashed Underline
        return {
          borderBottomWidth: 1,
          borderBottomColor: decorationColor,
          borderStyle: "dashed",
          paddingBottom: 3,
        };
      case 8: // Dotted Underline
        return {
          borderBottomWidth: 1,
          borderBottomColor: decorationColor,
          borderStyle: "dotted",
          paddingBottom: 3,
        };
      case 9: // Code Style
        return {
          paddingBottom: 3,
        };
      default:
        return {};
    }
  };

  // Format title based on capitalization
  const formatTitle = (text: string): string => {
    switch (capitalization) {
      case "uppercase":
        return text.toUpperCase();
      case "lowercase":
        return text.toLowerCase();
      case "capitalize":
        return text.toLowerCase().replace(/(^|\s)\S/g, (l) => l.toUpperCase());
      default:
        return text;
    }
  };

  const styles = StyleSheet.create({
    wrapper: {
      ...baseWrapperStyles,
      ...getStyleDecorations(),
      ...wrapperStyle,
    },
    text: {
      fontSize: computedFontSize,
      fontFamily: fontFamily,
      fontWeight: bold ? "bold" : "normal",
      color: headingColor,
      letterSpacing,
      ...textStyle,
    },
  });

  return (
    <View style={styles.wrapper} minPresenceAhead={50}>
      {style === 9 && (
        <Text
          style={{ ...styles.text, color: decorationColor, marginRight: 4 }}
        >
          #
        </Text>
      )}
      <Text style={styles.text}>{formatTitle(title)}</Text>
    </View>
  );
};

export default SectionHeading;
