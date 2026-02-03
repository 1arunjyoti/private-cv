/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * ContactInfo - Universal contact information display component
 *
 * Supports multiple display styles:
 * - icon: Icons before each item
 * - bullet: Bullet points before each item
 * - bar: Pipe separators between items
 * - comma: Comma separators between items
 */

import React from "react";
import { View, Text, Link, StyleSheet } from "@react-pdf/renderer";
import type { FontConfig, GetColorFn } from "../types";

export interface ContactItem {
  type: "email" | "phone" | "location" | "url" | "profile" | "custom";
  value: string;
  url?: string;
  label?: string;
  icon?: string;
}

export interface ContactInfoProps {
  items: ContactItem[];
  /** Display style */
  style?: "icon" | "bullet" | "bar" | "comma" | "stacked";
  /** Alignment */
  align?: "left" | "center" | "right";
  fontSize: number;
  fonts: FontConfig;
  getColor: GetColorFn;
  textColor?: string;
  /** Bold text */
  bold?: boolean;
  /** Italic text */
  italic?: boolean;
  /** Gap between items (for inline styles) */
  gap?: number;
  /** Custom separator character or style name */
  separator?: string;
  /** Show underline on links */
  linkUnderline?: boolean;
  /** Line height for text */
  lineHeight?: number;
  /** Gap between separator and items */
  separatorGap?: number;
  /** Override text color for all items */
  color?: string;
}

// Default icons for contact types
const DEFAULT_ICONS: Record<string, string> = {
  email: "✉",
  phone: "☎",
  location: "📍",
  url: "🔗",
  profile: "👤",
  custom: "•",
};

export const ContactInfo: React.FC<ContactInfoProps> = ({
  items,
  style = "bar",
  align = "center",
  fontSize,
  fonts,
  getColor,
  textColor = "#555555",
  bold = false,
  italic = false,
  gap = 6,
  separator,
  linkUnderline = true,
  lineHeight = 1.2,
  separatorGap = 4,
  color,
}) => {
  if (!items || items.length === 0) return null;

  // Use override color if provided, otherwise use textColor
  const finalTextColor = color || textColor;
  const linkColor = getColor("links", finalTextColor);
  const iconColor = getColor("icons", finalTextColor);

  const styles = StyleSheet.create({
    container: {
      flexDirection: style === "stacked" ? "column" : "row",
      flexWrap: "wrap",
      justifyContent:
        align === "center"
          ? "center"
          : align === "right"
            ? "flex-end"
            : "flex-start",
      alignItems:
        style === "stacked"
          ? align === "center"
            ? "center"
            : align === "right"
              ? "flex-end"
              : "flex-start"
          : "center",
      gap: style === "stacked" ? 0 : gap, // Reduced gap for stacked to let lineHeight handle spacing
    },
    item: {
      flexDirection: "row",
      alignItems: "center",
    },
    icon: {
      fontSize,
      color: iconColor,
      marginRight: 4,
      lineHeight,
    },
    bullet: {
      fontSize,
      color: finalTextColor,
      marginRight: 4,
      lineHeight,
    },
    separator: {
      fontSize,
      color: finalTextColor,
      marginHorizontal: separatorGap,
      lineHeight,
    },
    text: {
      fontSize,
      fontFamily: bold ? fonts.bold : italic ? fonts.italic : fonts.base,
      fontWeight: bold ? "bold" : "normal",
      fontStyle: italic ? "italic" : "normal",
      color: finalTextColor,
      lineHeight,
    },
    link: {
      fontSize,
      fontFamily: bold ? fonts.bold : italic ? fonts.italic : fonts.base,
      fontWeight: bold ? "bold" : "normal",
      fontStyle: italic ? "italic" : "normal",
      color: linkColor,
      textDecoration: linkUnderline ? "underline" : "none",
      lineHeight,
    },
  });

  const getSeparator = (): string => {
    if (!separator) {
      switch (style) {
        case "bar":
          return "|";
        case "comma":
          return ",";
        case "bullet":
          return "•";
        default:
          return "";
      }
    }

    // Map keywords to characters
    switch (separator) {
      case "pipe":
        return "|";
      case "dash":
        return "-";
      case "comma":
        return ",";
      case "bullet":
        return "•";
      default:
        return separator;
    }
  };

  const renderItem = (item: ContactItem, index: number) => {
    const isLink = item.url || item.type === "email" || item.type === "url";
    const href =
      item.url || (item.type === "email" ? `mailto:${item.value}` : undefined);
    const displayValue = item.label || item.value;

    // Use accent color for location items to match other contact items
    const useAccentColor = isLink || item.type === "location";

    // Non-link accented items (like location) should not have an underline
    const textStyle = useAccentColor
      ? { ...styles.link, textDecoration: "none" as any }
      : styles.text;

    const content = (
      <View style={styles.item} key={index}>
        {style === "icon" && (
          <Text style={styles.icon}>
            {item.icon || DEFAULT_ICONS[item.type] || "•"}
          </Text>
        )}
        {style === "bullet" && <Text style={styles.bullet}>•</Text>}
        {isLink && href ? (
          <Link src={href}>
            <Text style={styles.link}>{displayValue}</Text>
          </Link>
        ) : (
          <Text style={textStyle}>{displayValue}</Text>
        )}
      </View>
    );

    return content;
  };

  // Stacked layout - each item on its own line
  if (style === "stacked") {
    return (
      <View style={styles.container}>
        {items.map((item, index) => renderItem(item, index))}
      </View>
    );
  }

  // Inline layouts with separators
  const separatorChar = getSeparator();
  const needsSeparator = style === "bar" || style === "comma" || !!separator;

  return (
    <View style={styles.container}>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {renderItem(item, index)}
          {needsSeparator && index < items.length - 1 && (
            <Text style={styles.separator}>{separatorChar}</Text>
          )}
        </React.Fragment>
      ))}
    </View>
  );
};

/**
 * Helper to create ContactItem array from resume basics
 */
export function createContactItems(basics: {
  email?: string;
  phone?: string;
  url?: string;
  location?: { city?: string; country?: string };
  profiles?: { network: string; url: string; username: string }[];
}): ContactItem[] {
  const items: ContactItem[] = [];

  if (basics.email) {
    items.push({ type: "email", value: basics.email });
  }
  if (basics.phone) {
    items.push({ type: "phone", value: basics.phone });
  }
  if (basics.location?.city) {
    const locationStr = basics.location.country
      ? `${basics.location.city}, ${basics.location.country}`
      : basics.location.city;
    items.push({ type: "location", value: locationStr });
  }
  if (basics.url) {
    items.push({
      type: "url",
      value: basics.url.replace(/^https?:\/\//, "").replace(/\/$/, ""),
      url: basics.url,
    });
  }
  if (basics.profiles) {
    basics.profiles.forEach((profile) => {
      items.push({
        type: "profile",
        value: profile.username || profile.network,
        url: profile.url,
        label: profile.network,
      });
    });
  }

  return items;
}

export default ContactInfo;
