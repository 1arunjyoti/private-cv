/**
 * EntryHeader - Universal entry header component for work/education/project entries
 *
 * Supports multiple layout styles:
 * 1. Title and date on same line, subtitle below
 * 2. Title, subtitle, date all on same line
 * 3. Title on line 1, subtitle and date on line 2
 * 4. Stacked: Title, subtitle, date each on separate lines
 * 5. Compact: All info condensed
 */

import React from "react";
import { View, Text, Link, StyleSheet } from "@react-pdf/renderer";
import type { EntryLayoutStyle, FontConfig, GetColorFn } from "../types";

export interface EntryHeaderProps {
  /** Primary title (e.g., Company name, Institution) */
  title: string;
  /** Secondary title (e.g., Position, Degree) */
  subtitle?: string;
  /** Tertiary info (e.g., Location) */
  location?: string;
  /** Date range string */
  dateRange?: string;
  /** URL associated with the entry */
  url?: string;
  /** Layout style (1-5) */
  layoutStyle?: EntryLayoutStyle;
  /** Font size */
  fontSize: number;
  /** Font configuration */
  fonts: FontConfig;
  /** Color resolver function */
  getColor: GetColorFn;
  /** Title styling */
  titleBold?: boolean;
  titleItalic?: boolean;
  titleColor?: string;
  /** Subtitle styling */
  subtitleBold?: boolean;
  subtitleItalic?: boolean;
  subtitleColor?: string;
  /** Date styling */
  dateBold?: boolean;
  dateItalic?: boolean;
  dateColor?: string;
  /** List style prefix */
  listStyle?: "bullet" | "number" | "none";
  /** Index for numbered lists */
  index?: number;
  /** Show URL inline */
  showUrl?: boolean;
  /** Show link icon instead of arrow */
  showLinkIcon?: boolean;
  /** Show full URL instead of icon */
  showFullUrl?: boolean;
  /** URL styling */
  urlBold?: boolean;
  urlItalic?: boolean;
}

export const EntryHeader: React.FC<EntryHeaderProps> = ({
  title,
  subtitle,
  location,
  dateRange,
  url,
  layoutStyle = 1,
  fontSize,
  fonts,
  getColor,
  titleBold = true,
  titleItalic = false,
  titleColor,
  subtitleBold = false,
  subtitleItalic = true,
  subtitleColor,
  dateBold = false,
  dateItalic = false,
  dateColor,
  listStyle = "none",
  index = 0,
  showUrl = false,
  showLinkIcon = false,
  showFullUrl = false,
  urlBold = false,
  urlItalic = false,
}) => {
  const linkColor = getColor("links", "#1a1a1a");
  const resolvedTitleColor = titleColor || "#1a1a1a";
  const resolvedSubtitleColor = subtitleColor || "#444444";
  const resolvedDateColor = dateColor || "#666666";

  const styles = StyleSheet.create({
    container: {
      marginBottom: 2,
    },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "baseline",
      flexWrap: "wrap",
    },
    leftGroup: {
      flexDirection: "row",
      alignItems: "baseline",
      flex: 1,
      flexWrap: "wrap",
    },
    listPrefix: {
      fontSize,
      fontFamily: fonts.base,
      marginRight: 4,
    },
    title: {
      fontSize: fontSize + 1,
      fontFamily: titleBold
        ? fonts.bold
        : titleItalic
          ? fonts.italic
          : fonts.base,
      fontWeight: titleBold ? "bold" : "normal",
      fontStyle: titleItalic ? "italic" : "normal",
      color: resolvedTitleColor,
    },
    subtitle: {
      fontSize,
      fontFamily: subtitleBold
        ? fonts.bold
        : subtitleItalic
          ? fonts.italic
          : fonts.base,
      fontWeight: subtitleBold ? "bold" : "normal",
      fontStyle: subtitleItalic ? "italic" : "normal",
      color: resolvedSubtitleColor,
    },
    location: {
      fontSize: fontSize - 1,
      fontFamily: fonts.base,
      color: "#666666",
    },
    date: {
      fontSize,
      fontFamily: dateBold
        ? fonts.bold
        : dateItalic
          ? fonts.italic
          : fonts.base,
      fontWeight: dateBold ? "bold" : "normal",
      fontStyle: dateItalic ? "italic" : "normal",
      color: resolvedDateColor,
      textAlign: "right",
    },
    url: {
      fontSize: fontSize - 1,
      color: linkColor,
      marginLeft: 4,
      textDecoration: "none",
    },
    separator: {
      fontSize,
      color: "#666666",
      marginHorizontal: 4,
    },
  });

  const getListPrefix = (): string => {
    if (listStyle === "bullet") return "•";
    if (listStyle === "number") return `${index + 1}.`;
    return "";
  };

  const listPrefix = getListPrefix();

  // Determine display text and style for URL
  const urlDisplayText =
    showFullUrl && url
      ? url.replace(/^https?:\/\//, "").replace(/\/$/, "")
      : showLinkIcon
        ? "🔗"
        : "↗";

  const defaultUrlStyle = {
    fontSize: fontSize - 1,
    color: linkColor,
    marginLeft: 4,
    textDecoration: "none",
    fontWeight: urlBold ? "bold" : "normal",
    fontStyle: urlItalic ? "italic" : "normal",
  } as const;

  // Layout Style 1: Title + Date on line 1, Subtitle on line 2
  if (layoutStyle === 1) {
    return (
      <View style={styles.container}>
        <View style={styles.row}>
          <View style={styles.leftGroup}>
            {listPrefix && <Text style={styles.listPrefix}>{listPrefix}</Text>}
            <Text style={styles.title}>{title}</Text>
            {showUrl && url && (
              <Link src={url} style={defaultUrlStyle}>
                <Text style={defaultUrlStyle}>{urlDisplayText}</Text>
              </Link>
            )}
          </View>
          {dateRange && <Text style={styles.date}>{dateRange}</Text>}
        </View>
        {subtitle && (
          <View style={{ marginTop: 1 }}>
            <Text style={styles.subtitle}>
              {subtitle}
              {location && <Text style={styles.location}> | {location}</Text>}
            </Text>
          </View>
        )}
      </View>
    );
  }

  // Layout Style 2: Title | Subtitle | Date all on same line
  if (layoutStyle === 2) {
    return (
      <View style={styles.container}>
        <View style={styles.row}>
          <View style={styles.leftGroup}>
            {listPrefix && <Text style={styles.listPrefix}>{listPrefix}</Text>}
            <Text style={styles.title}>{title}</Text>
            {subtitle && (
              <>
                <Text style={styles.separator}>|</Text>
                <Text style={styles.subtitle}>{subtitle}</Text>
              </>
            )}
            {location && (
              <>
                <Text style={styles.separator}>|</Text>
                <Text style={styles.location}>{location}</Text>
              </>
            )}
            {showUrl && url && (
              <Link src={url} style={defaultUrlStyle}>
                <Text style={defaultUrlStyle}>{urlDisplayText}</Text>
              </Link>
            )}
          </View>
          {dateRange && <Text style={styles.date}>{dateRange}</Text>}
        </View>
      </View>
    );
  }

  // Layout Style 3: Title on line 1, Subtitle + Date on line 2
  if (layoutStyle === 3) {
    return (
      <View style={styles.container}>
        <View style={styles.leftGroup}>
          {listPrefix && <Text style={styles.listPrefix}>{listPrefix}</Text>}
          <Text style={styles.title}>{title}</Text>
          {showUrl && url && (
            <Link src={url} style={styles.url}>
              <Text style={styles.url}>
                {showFullUrl
                  ? `  ${url.replace(/^https?:\/\//, "").replace(/\/$/, "")}`
                  : showLinkIcon
                    ? " 🔗"
                    : " ↗"}
              </Text>
            </Link>
          )}
        </View>
        <View style={[styles.row, { marginTop: 1 }]}>
          <Text style={styles.subtitle}>
            {subtitle}
            {location && <Text style={styles.location}> | {location}</Text>}
          </Text>
          {dateRange && <Text style={styles.date}>{dateRange}</Text>}
        </View>
      </View>
    );
  }

  // Layout Style 4: Stacked - each element on its own line
  if (layoutStyle === 4) {
    return (
      <View style={styles.container}>
        <View style={styles.leftGroup}>
          {listPrefix && <Text style={styles.listPrefix}>{listPrefix}</Text>}
          <Text style={styles.title}>{title}</Text>
          {showUrl && url && (
            <Link src={url} style={styles.url}>
              <Text style={styles.url}>↗</Text>
            </Link>
          )}
        </View>
        {subtitle && (
          <Text style={[styles.subtitle, { marginTop: 1 }]}>{subtitle}</Text>
        )}
        {location && (
          <Text style={[styles.location, { marginTop: 1 }]}>{location}</Text>
        )}
        {dateRange && (
          <Text style={[styles.date, { marginTop: 1, textAlign: "left" }]}>
            {dateRange}
          </Text>
        )}
      </View>
    );
  }

  // Layout Style 5: Compact - minimal spacing
  if (layoutStyle === 5) {
    return (
      <View style={[styles.container, { marginBottom: 1 }]}>
        <View style={styles.row}>
          <Text style={[styles.title, { fontSize }]}>
            {listPrefix && `${listPrefix} `}
            {title}
            {subtitle && ` - ${subtitle}`}
            {location && ` (${location})`}
          </Text>
          {dateRange && (
            <Text style={[styles.date, { fontSize: fontSize - 1 }]}>
              {dateRange}
            </Text>
          )}
        </View>
      </View>
    );
  }

  // Default fallback to Style 1
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.leftGroup}>
          {listPrefix && <Text style={styles.listPrefix}>{listPrefix}</Text>}
          <Text style={styles.title}>{title}</Text>
        </View>
        {dateRange && <Text style={styles.date}>{dateRange}</Text>}
      </View>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
};

export default EntryHeader;
