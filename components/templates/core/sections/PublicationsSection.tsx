/**
 * PublicationsSection - Universal publications section component
 */

import React from "react";
import { View, Text, Link, StyleSheet } from "@react-pdf/renderer";
import type { Publication, LayoutSettings } from "@/db";
import { formatDate } from "@/lib/template-utils";
import { SectionHeading, RichText } from "../primitives";
import type {
  FontConfig,
  GetColorFn,
  ListStyle,
  SectionHeadingStyle,
} from "../types";

export interface PublicationsSectionProps {
  publications: Publication[];
  settings: LayoutSettings;
  fonts: FontConfig;
  fontSize: number;
  getColor: GetColorFn;
  lineHeight?: number;
  sectionTitle?: string;
  sectionMargin?: number;
  containerStyle?: object;
}

export const PublicationsSection: React.FC<PublicationsSectionProps> = ({
  publications,
  settings,
  fonts,
  fontSize,
  getColor,
  lineHeight = 1.3,
  sectionTitle = "Publications",
  sectionMargin,
  containerStyle,
}) => {
  if (!publications || publications.length === 0) return null;

  const linkColor = getColor("links", "#444444");
  const listStyle: ListStyle = settings.publicationsListStyle || "none";

  const styles = StyleSheet.create({
    container: {
      marginBottom: sectionMargin ?? settings.sectionMargin ?? 12,
      ...containerStyle,
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
      fontFamily: settings.publicationsNameBold
        ? fonts.bold
        : settings.publicationsNameItalic
          ? fonts.italic
          : fonts.base,
      fontWeight: settings.publicationsNameBold ? "bold" : "normal",
      fontStyle: settings.publicationsNameItalic ? "italic" : "normal",
      color: getColor("title", "#1a1a1a"),
    },
    date: {
      fontSize,
      fontFamily: settings.publicationsDateBold
        ? fonts.bold
        : settings.publicationsDateItalic
          ? fonts.italic
          : fonts.base,
      fontWeight: settings.publicationsDateBold ? "bold" : "normal",
      fontStyle: settings.publicationsDateItalic ? "italic" : "normal",
      color: getColor("meta", "#666666"),
    },
    publisher: {
      fontSize,
      fontFamily: settings.publicationsPublisherBold
        ? fonts.bold
        : settings.publicationsPublisherItalic
          ? fonts.italic
          : fonts.base,
      fontWeight: settings.publicationsPublisherBold ? "bold" : "normal",
      fontStyle: settings.publicationsPublisherItalic ? "italic" : "normal",
      color: getColor("subtext", "#555555"),
    },

    url: {
      fontSize: fontSize - 1,
      color: linkColor,
      marginTop: 2,
      textDecoration: "none",
    },
    summary: {
      fontSize,
      color: getColor("text", "#444444"),
      marginTop: 2,
      lineHeight,
    },
  });

  const getListPrefix = (index: number): string => {
    if (listStyle === "bullet") return "•";
    if (listStyle === "number") return `${index + 1}.`;
    return "";
  };

  // Resolve effective link style
  const effectiveLinkStyle =
    settings.sectionLinkStyle ||
    (settings.linkShowFullUrl
      ? "inline"
      : settings.linkShowIcon
        ? "icon"
        : "icon");

  return (
    <View style={styles.container}>
      {(settings.publicationsHeadingVisible ?? true) && (
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

      {publications.map((pub, index) => {
        const prefix = getListPrefix(index);

        return (
          <View key={pub.id} style={styles.entryBlock}>
            <View style={styles.headerRow}>
              <View style={styles.nameRow}>
                {prefix && <Text style={styles.listPrefix}>{prefix}</Text>}

                {/* Title (Link if underline style) */}
                {pub.url && effectiveLinkStyle === "underline" ? (
                  <Link src={pub.url} style={{ textDecoration: "none" }}>
                    <Text
                      style={[styles.name, { textDecoration: "underline" }]}
                    >
                      {pub.name}
                    </Text>
                  </Link>
                ) : (
                  <Text style={styles.name}>{pub.name}</Text>
                )}

                {/* Inline URL or Icon */}
                {pub.url &&
                  (effectiveLinkStyle === "inline" ||
                    effectiveLinkStyle === "icon") && (
                    <Link src={pub.url} style={{ textDecoration: "none" }}>
                      <Text
                        style={{
                          fontSize: fontSize - 1,
                          color: linkColor,
                          marginLeft: 4,
                          fontWeight: settings.publicationsUrlBold
                            ? "bold"
                            : "normal",
                          fontStyle: settings.publicationsUrlItalic
                            ? "italic"
                            : "normal",
                        }}
                      >
                        {effectiveLinkStyle === "inline"
                          ? `  ${pub.url.replace(/^https?:\/\//, "").replace(/\/$/, "")}`
                          : " 🔗"}
                      </Text>
                    </Link>
                  )}
              </View>
              {pub.releaseDate && (
                <Text style={styles.date}>{formatDate(pub.releaseDate)}</Text>
              )}
            </View>

            {pub.publisher && (
              <Text style={styles.publisher}>{pub.publisher}</Text>
            )}

            {/* Newline/Below URL */}
            {pub.url && effectiveLinkStyle === "newline" && (
              <Link src={pub.url} style={styles.url}>
                <Text style={styles.url}>
                  {pub.url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                </Text>
              </Link>
            )}

            {pub.summary && (
              <RichText
                text={pub.summary}
                fontSize={fontSize}
                fonts={fonts}
                lineHeight={lineHeight}
                linkColor={linkColor}
                showLinkIcon={effectiveLinkStyle === "icon"}
                showFullUrl={effectiveLinkStyle === "inline"}
                style={styles.summary}
              />
            )}
          </View>
        );
      })}
    </View>
  );
};

export default PublicationsSection;
