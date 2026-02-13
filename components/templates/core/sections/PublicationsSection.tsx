/**
 * PublicationsSection - Universal publications section component
 */

import React from "react";
import { View, StyleSheet } from "@react-pdf/renderer";
import type { Publication, LayoutSettings } from "@/db";
import { formatDate } from "@/lib/template-utils";
import { SectionHeading, RichText, EntryHeader } from "../primitives";
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
        return (
          <View key={pub.id} style={styles.entryBlock}>
            <EntryHeader
              title={pub.name}
              subtitle={pub.publisher}
              dateRange={formatDate(pub.releaseDate)}
              url={pub.url}
              layoutStyle={1}
              fontSize={fontSize}
              fonts={fonts}
              getColor={getColor}
              titleBold={settings.publicationsNameBold}
              titleItalic={settings.publicationsNameItalic}
              subtitleBold={settings.publicationsPublisherBold}
              subtitleItalic={settings.publicationsPublisherItalic}
              dateBold={settings.publicationsDateBold}
              dateItalic={settings.publicationsDateItalic}
              urlBold={settings.publicationsUrlBold}
              urlItalic={settings.publicationsUrlItalic}
              listStyle={listStyle}
              index={index}
              sectionLinkStyle={settings.sectionLinkStyle}
            />

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
