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
import { View, Text, Link, StyleSheet, Svg, Path } from "@react-pdf/renderer";
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
  /** Section Link Style (overrides legacy showUrl/showFullUrl) */
  sectionLinkStyle?: "icon" | "inline" | "newline" | "underline";
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
  // showUrl = false, // Removed unused prop
  showLinkIcon = false,
  showFullUrl = false,
  urlBold = false,
  urlItalic = false,
  sectionLinkStyle,
}) => {
  const linkColor = getColor("links", "#1a1a1a");
  const resolvedTitleColor = titleColor || getColor("title", "#1a1a1a");
  const resolvedSubtitleColor = subtitleColor || getColor("subtext", "#444444");
  const resolvedDateColor = dateColor || getColor("meta", "#666666");

  // Resolve effective link style
  // detailed logic: if sectionLinkStyle is present, use it.
  // if not, fall back to legacy props (showFullUrl -> inline, showLinkIcon -> icon, else -> icon/none?)
  // Actually, for backward compat, let's derive a style if not provided.
  const effectiveLinkStyle =
    sectionLinkStyle ||
    (showFullUrl ? "inline" : showLinkIcon ? "icon" : "icon"); // Default to icon if url is present

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
      textDecoration:
        effectiveLinkStyle === "underline" && url ? "underline" : "none",
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
      color: getColor("subtext", "#666666"),
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
    urlNewline: {
      fontSize: fontSize - 1,
      color: linkColor,
      marginTop: 1,
      textDecoration: "none",
    },
    separator: {
      fontSize,
      color: getColor("text", "#666666"),
      marginHorizontal: 4,
    },
  });

  const getListPrefix = (): string => {
    if (listStyle === "bullet") return "•";
    if (listStyle === "number") return `${index + 1}.`;
    return "";
  };

  const listPrefix = getListPrefix();

  // URL Display Logic
  const renderUrl = () => {
    if (!url) return null;
    if (effectiveLinkStyle === "underline") return null; // Title is link

    const content =
      effectiveLinkStyle === "inline" || effectiveLinkStyle === "newline" ? (
        <Text>{url.replace(/^https?:\/\//, "").replace(/\/$/, "")}</Text>
      ) : effectiveLinkStyle === "icon" ? (
        <Svg
          viewBox="0 0 24 24"
          style={{ width: fontSize, height: fontSize }}
          stroke={linkColor}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <Path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <Path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </Svg>
      ) : (
        <Text>↗</Text>
      );

    const style =
      effectiveLinkStyle === "newline"
        ? styles.urlNewline
        : {
            ...styles.url,
            fontWeight: urlBold ? ("bold" as const) : ("normal" as const),
            fontStyle: urlItalic ? ("italic" as const) : ("normal" as const),
          };

    return (
      <Link src={url} style={style}>
        {content}
      </Link>
    );
  };

  /* Title Element (refactored from nested component to standard JSX) */
  const titleElement =
    url && effectiveLinkStyle === "underline" ? (
      <Link src={url} style={{ textDecoration: "none" }}>
        <Text style={styles.title}>{title}</Text>
      </Link>
    ) : (
      <Text style={styles.title}>{title}</Text>
    );

  // Layout Style 1: Title + Date on line 1, Subtitle on line 2
  if (layoutStyle === 1) {
    return (
      <View style={styles.container}>
        <View style={styles.row}>
          <View style={styles.leftGroup}>
            {listPrefix && <Text style={styles.listPrefix}>{listPrefix}</Text>}
            {titleElement}
            {(effectiveLinkStyle === "inline" ||
              effectiveLinkStyle === "icon") &&
              renderUrl()}
          </View>
          {dateRange && <Text style={styles.date}>{dateRange}</Text>}
        </View>

        {/* Newline URL */}
        {effectiveLinkStyle === "newline" && url && renderUrl()}

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
            {titleElement}
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
            {(effectiveLinkStyle === "inline" ||
              effectiveLinkStyle === "icon") &&
              renderUrl()}
          </View>
          {dateRange && <Text style={styles.date}>{dateRange}</Text>}
        </View>
        {/* Newline URL */}
        {effectiveLinkStyle === "newline" && url && renderUrl()}
      </View>
    );
  }

  // Layout Style 3: Title on line 1, Subtitle + Date on line 2
  if (layoutStyle === 3) {
    return (
      <View style={styles.container}>
        <View style={styles.leftGroup}>
          {listPrefix && <Text style={styles.listPrefix}>{listPrefix}</Text>}
          {titleElement}
          {(effectiveLinkStyle === "inline" || effectiveLinkStyle === "icon") &&
            renderUrl()}
        </View>
        {/* Newline URL */}
        {effectiveLinkStyle === "newline" && url && renderUrl()}
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
          {titleElement}
          {(effectiveLinkStyle === "inline" || effectiveLinkStyle === "icon") &&
            renderUrl()}
        </View>
        {/* Newline URL */}
        {effectiveLinkStyle === "newline" && url && (
          <View style={{ marginTop: 1 }}>{renderUrl()}</View>
        )}
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
