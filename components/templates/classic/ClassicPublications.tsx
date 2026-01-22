import React from "react";
import { View, Text, Link } from "@react-pdf/renderer";
import { Resume } from "@/db";
import { PDFRichText } from "../PDFRichText";
import { formatDate } from "@/lib/template-utils";

import { LayoutSettings, TemplateStyles } from "@/components/design/types";

interface ClassicPublicationsProps {
  publications: Resume["publications"];
  settings: LayoutSettings;
  styles: TemplateStyles;
  getColor: (target: string, fallback?: string) => string;
  fontSize: number;
  baseFont: string;
  boldFont: string;
  italicFont: string;
}

export const ClassicPublications: React.FC<ClassicPublicationsProps> = ({
  publications,
  settings,
  styles,
  getColor,
  fontSize,
  baseFont,
  boldFont,
  italicFont,
}) => {
  if (!publications || publications.length === 0) return null;

  return (
    <View key="publications" style={styles.section}>
      {((settings.publicationsHeadingVisible ?? true) as boolean) && (
        <View style={styles.sectionTitleWrapper}>
          <Text style={[styles.sectionTitle, { color: getColor("headings") }]}>
            Publications
          </Text>
        </View>
      )}
      {publications.map((pub, index) => (
        <View key={pub.id} style={styles.entryBlock}>
          <View style={{ flexDirection: "row", marginBottom: 1 }}>
            {settings.publicationsListStyle === "bullet" && (
              <Text style={{ marginRight: 4, fontSize: fontSize }}>•</Text>
            )}
            {settings.publicationsListStyle === "number" && (
              <Text style={{ marginRight: 4, fontSize: fontSize }}>
                {index + 1}.
              </Text>
            )}
            <View style={{ flex: 1 }}>
              <View style={styles.entryHeader}>
                <Text
                  style={[
                    styles.entryTitle,
                    {
                      fontFamily: settings.publicationsNameBold
                        ? boldFont
                        : settings.publicationsNameItalic
                          ? italicFont
                          : baseFont,
                      fontWeight: settings.publicationsNameBold
                        ? "bold"
                        : "normal",
                      fontStyle: settings.publicationsNameItalic
                        ? "italic"
                        : "normal",
                    },
                  ]}
                >
                  {pub.name}
                </Text>
                <Text
                  style={[
                    styles.entryDate,
                    {
                      fontFamily: settings.publicationsDateBold
                        ? boldFont
                        : settings.publicationsDateItalic
                          ? italicFont
                          : baseFont,
                      fontWeight: settings.publicationsDateBold
                        ? "bold"
                        : "normal",
                      fontStyle: settings.publicationsDateItalic
                        ? "italic"
                        : "normal",
                    },
                  ]}
                >
                  {formatDate(pub.releaseDate)}
                </Text>
              </View>
              <Text
                style={[
                  styles.entrySubtitle,
                  {
                    fontFamily: settings.publicationsPublisherBold
                      ? boldFont
                      : settings.publicationsPublisherItalic
                        ? italicFont
                        : baseFont,
                    fontWeight: settings.publicationsPublisherBold
                      ? "bold"
                      : "normal",
                    fontStyle: settings.publicationsPublisherItalic
                      ? "italic"
                      : "normal",
                  },
                ]}
              >
                {pub.publisher}
              </Text>
              {pub.url && (
                <Link
                  src={pub.url}
                  style={{
                    fontSize: fontSize - 1,
                    color: getColor("links"),
                    textDecoration: "none",
                    marginBottom: 1,
                    fontFamily: settings.publicationsUrlBold
                      ? boldFont
                      : settings.publicationsUrlItalic
                        ? italicFont
                        : baseFont,
                    fontWeight: settings.publicationsUrlBold
                      ? "bold"
                      : "normal",
                    fontStyle: settings.publicationsUrlItalic
                      ? "italic"
                      : "normal",
                  }}
                >
                  {pub.url}
                </Link>
              )}
              {pub.summary && (
                <PDFRichText
                  text={pub.summary}
                  style={styles.entrySummary}
                  fontSize={fontSize}
                  fontFamily={baseFont}
                  boldFontFamily={boldFont}
                  italicFontFamily={italicFont}
                />
              )}
            </View>
          </View>
        </View>
      ))}
    </View>
  );
};
