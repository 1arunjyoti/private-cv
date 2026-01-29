/**
 * CertificatesSection - Universal certificates section component
 */

import React from "react";
import { View, Text, Link, StyleSheet } from "@react-pdf/renderer";
import type { Certificate, LayoutSettings } from "@/db";
import { formatDate } from "@/lib/template-utils";
import { SectionHeading, RichText } from "../primitives";
import type {
  FontConfig,
  GetColorFn,
  ListStyle,
  SectionHeadingStyle,
} from "../types";

export interface CertificatesSectionProps {
  certificates: Certificate[];
  settings: LayoutSettings;
  fonts: FontConfig;
  fontSize: number;
  getColor: GetColorFn;
  lineHeight?: number;
  sectionTitle?: string;
  sectionMargin?: number;
  containerStyle?: object;
}

export const CertificatesSection: React.FC<CertificatesSectionProps> = ({
  certificates,
  settings,
  fonts,
  fontSize,
  getColor,
  lineHeight = 1.3,
  sectionTitle = "Certificates",
  sectionMargin,
  containerStyle,
}) => {
  if (!certificates || certificates.length === 0) return null;

  const linkColor = getColor("links", "#444444");
  const listStyle: ListStyle = settings.certificatesListStyle || "none";

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
    },
    listPrefix: {
      fontSize,
      marginRight: 4,
    },
    name: {
      fontSize: fontSize + 1,
      fontFamily: settings.certificatesNameBold
        ? fonts.bold
        : settings.certificatesNameItalic
          ? fonts.italic
          : fonts.base,
      fontWeight: settings.certificatesNameBold ? "bold" : "normal",
      fontStyle: settings.certificatesNameItalic ? "italic" : "normal",
      color: "#1a1a1a",
    },
    date: {
      fontSize,
      fontFamily: settings.certificatesDateBold
        ? fonts.bold
        : settings.certificatesDateItalic
          ? fonts.italic
          : fonts.base,
      fontWeight: settings.certificatesDateBold ? "bold" : "normal",
      fontStyle: settings.certificatesDateItalic ? "italic" : "normal",
      color: "#666666",
    },
    issuer: {
      fontSize,
      fontFamily: settings.certificatesIssuerBold
        ? fonts.bold
        : settings.certificatesIssuerItalic
          ? fonts.italic
          : fonts.base,
      fontWeight: settings.certificatesIssuerBold ? "bold" : "normal",
      fontStyle: settings.certificatesIssuerItalic ? "italic" : "normal",
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
      {(settings.certificatesHeadingVisible ?? true) && (
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

      {certificates.map((cert, index) => {
        const prefix = getListPrefix(index);

        return (
          <View key={cert.id} style={styles.entryBlock}>
            <View style={styles.headerRow}>
              <View style={styles.nameRow}>
                {prefix && <Text style={styles.listPrefix}>{prefix}</Text>}
                <Text style={styles.name}>{cert.name}</Text>
                {cert.url &&
                  (settings.linkShowIcon || settings.linkShowFullUrl) && (
                    <Link src={cert.url} style={{ textDecoration: "none" }}>
                      <Text
                        style={{
                          fontSize: fontSize - 1,
                          color: linkColor,
                          marginLeft: 4,
                          fontWeight: settings.certificatesUrlBold
                            ? "bold"
                            : "normal",
                          fontStyle: settings.certificatesUrlItalic
                            ? "italic"
                            : "normal",
                        }}
                      >
                        {settings.linkShowFullUrl
                          ? `  ${cert.url.replace(/^https?:\/\//, "").replace(/\/$/, "")}`
                          : settings.linkShowIcon
                            ? " 🔗"
                            : ""}
                      </Text>
                    </Link>
                  )}
              </View>
              {cert.date && (
                <Text style={styles.date}>{formatDate(cert.date)}</Text>
              )}
            </View>

            {cert.issuer && <Text style={styles.issuer}>{cert.issuer}</Text>}

            {cert.url &&
              !settings.linkShowIcon &&
              !settings.linkShowFullUrl && (
                <Link src={cert.url}>
                  <Text style={styles.url}>
                    {cert.url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                  </Text>
                </Link>
              )}

            {cert.summary && (
              <RichText
                text={cert.summary}
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
  );
};

export default CertificatesSection;
