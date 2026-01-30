import React from "react";
import { View, Text, Link } from "@react-pdf/renderer";
import { Resume } from "@/db";
import { PDFRichText } from "../PDFRichText";
import { formatDate } from "@/lib/template-utils";
import { LayoutSettings, TemplateStyles } from "@/components/design/types";

interface ProfessionalCustomProps {
  custom: Resume["custom"];
  settings: LayoutSettings;
  styles: TemplateStyles;
  getColor: (target: string, fallback?: string) => string;
  fontSize: number;
  baseFont: string;
  boldFont: string;
  italicFont: string;
}

export const ProfessionalCustom: React.FC<ProfessionalCustomProps> = ({
  custom,
  settings,
  styles,
  getColor,
  fontSize,
  baseFont,
  boldFont,
  italicFont,
}) => {
  if (!custom || custom.length === 0) return null;
  return (
    <View>
      {custom.map((sec) => (
        <View key={sec.id} style={styles.section}>
          {((settings.customHeadingVisible ?? true) as boolean) && (
            <View style={styles.sectionTitleWrapper}>
              <Text
                style={[styles.sectionTitle, { color: getColor("headings") }]}
              >
                {sec.name}
              </Text>
            </View>
          )}
          {sec.items.map((item, index) => (
            <View key={item.id} style={styles.entryBlock}>
              <View style={styles.entryHeader}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  {settings.customSectionListStyle === "bullet" && (
                    <Text style={{ marginRight: 4, fontSize: fontSize }}>
                      •
                    </Text>
                  )}
                  {settings.customSectionListStyle === "number" && (
                    <Text style={{ marginRight: 4, fontSize: fontSize }}>
                      {index + 1}.
                    </Text>
                  )}
                  <Text
                    style={[
                      styles.entryTitle,
                      {
                        fontFamily: settings.customSectionNameBold
                          ? boldFont
                          : settings.customSectionNameItalic
                            ? italicFont
                            : baseFont,
                        fontWeight: settings.customSectionNameBold
                          ? "bold"
                          : "normal",
                        fontStyle: settings.customSectionNameItalic
                          ? "italic"
                          : "normal",
                      },
                    ]}
                  >
                    {item.name}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.entryDate,
                    {
                      fontFamily: settings.customSectionDateBold
                        ? boldFont
                        : settings.customSectionDateItalic
                          ? italicFont
                          : baseFont,
                      fontWeight: settings.customSectionDateBold
                        ? "bold"
                        : "normal",
                      fontStyle: settings.customSectionDateItalic
                        ? "italic"
                        : "normal",
                    },
                  ]}
                >
                  {formatDate(item.date)}
                </Text>
              </View>

              <Text
                style={[
                  styles.entrySubtitle,
                  {
                    fontFamily: settings.customSectionDescriptionBold
                      ? boldFont
                      : settings.customSectionDescriptionItalic
                        ? italicFont
                        : baseFont,
                    fontWeight: settings.customSectionDescriptionBold
                      ? "bold"
                      : "normal",
                    fontStyle: settings.customSectionDescriptionItalic
                      ? "italic"
                      : "normal",
                  },
                ]}
              >
                {item.description}
              </Text>

              {item.url && (
                <Link
                  src={item.url}
                  style={{
                    fontSize: fontSize - 1,
                    color: getColor("links"),
                    textDecoration: "none",
                    marginBottom: 1,
                    fontFamily: settings.customSectionUrlBold
                      ? boldFont
                      : settings.customSectionUrlItalic
                        ? italicFont
                        : baseFont,
                    fontWeight: settings.customSectionUrlBold
                      ? "bold"
                      : "normal",
                    fontStyle: settings.customSectionUrlItalic
                      ? "italic"
                      : "normal",
                  }}
                >
                  {item.url}
                </Link>
              )}

              {item.summary && (
                <View style={styles.entrySummary}>
                  <PDFRichText
                    text={item.summary}
                    style={{ fontSize }}
                    fontSize={fontSize}
                  />
                </View>
              )}
            </View>
          ))}
        </View>
      ))}
    </View>
  );
};
