import React from "react";
import { View, Text, Link } from "@react-pdf/renderer";
import { Resume } from "@/db";
import { LayoutSettings, TemplateStyles } from "@/components/design/types";
import { formatDate } from "@/lib/template-utils";

interface CreativePublicationsProps {
  publications: Resume["publications"];
  settings: LayoutSettings;
  styles: TemplateStyles;
  getColor: (target: string, fallback?: string) => string;
  fontSize: number;
  baseFont: string;
  boldFont: string;
  italicFont: string;
}

export const CreativePublications: React.FC<CreativePublicationsProps> = ({
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

      {publications.map((pub, index) => {
        const listStyle = settings.publicationsListStyle || "none";

        return (
          <View
            key={pub.id}
            style={{ ...styles.entryBlock, flexDirection: "row" }}
          >
            {listStyle === "bullet" && (
              <Text
                style={{
                  fontSize: fontSize,
                  marginRight: 4,
                  color: getColor("headings"),
                }}
              >
                •
              </Text>
            )}
            {listStyle === "number" && (
              <Text
                style={{
                  fontSize: fontSize,
                  marginRight: 4,
                  color: getColor("headings"),
                  minWidth: 12,
                }}
              >
                {index + 1}.
              </Text>
            )}

            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontFamily: settings.publicationsNameBold
                    ? boldFont
                    : settings.publicationsNameItalic
                      ? italicFont
                      : baseFont,
                  fontWeight: settings.publicationsNameBold ? "bold" : "normal",
                  fontStyle: settings.publicationsNameItalic
                    ? "italic"
                    : "normal",
                  fontSize: fontSize,
                }}
              >
                {pub.name}
                {pub.url && (
                  <Link
                    src={pub.url}
                    style={{ textDecoration: "none", color: getColor("links") }}
                  >
                    {" "}
                    🔗
                  </Link>
                )}
              </Text>
              <Text
                style={{
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
                  fontSize: fontSize - 1,
                  color: "#555",
                }}
              >
                {pub.publisher}{" "}
                {pub.releaseDate && (
                  <Text
                    style={{
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
                    }}
                  >
                    {`| ${formatDate(pub.releaseDate)}`}
                  </Text>
                )}
              </Text>
              {pub.summary && (
                <Text
                  style={{
                    fontFamily: italicFont,
                    fontStyle: "italic",
                    fontSize: fontSize - 1,
                    color: "#666",
                    marginTop: 1,
                  }}
                >
                  {pub.summary}
                </Text>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
};
