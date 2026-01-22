import React from "react";
import { View, Text } from "@react-pdf/renderer";
import { Resume } from "@/db";
import { LayoutSettings, TemplateStyles } from "@/components/design/types";

interface CreativeCustomProps {
  custom: Resume["custom"];
  settings: LayoutSettings;
  styles: TemplateStyles;
  getColor: (target: string, fallback?: string) => string;
  fontSize: number;
  baseFont: string;
  boldFont: string;
  italicFont: string;
}

export const CreativeCustom: React.FC<CreativeCustomProps> = ({
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
    <>
      {custom.map((section) => {
        if (!section || !section.items || section.items.length === 0)
          return null;

        return (
          <View key={section.id} style={styles.section}>
            <View style={styles.sectionTitleWrapper}>
              <Text
                style={[styles.sectionTitle, { color: getColor("headings") }]}
              >
                {section.name}
              </Text>
            </View>

            {section.items.map((item, index) => {
              const listStyle = settings.customSectionListStyle || "none";

              return (
                <View
                  key={item.id}
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
                        fontSize: fontSize,
                      }}
                    >
                      {item.name}
                    </Text>
                    <Text
                      style={{
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
                        fontSize: fontSize - 1,
                        color: "#555",
                      }}
                    >
                      {item.description}
                      {item.date && (
                        <Text
                          style={{
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
                          }}
                        >
                          {` | ${item.date}`}
                        </Text>
                      )}
                    </Text>
                    {item.summary && (
                      <Text
                        style={{
                          fontFamily: baseFont,
                          fontSize: fontSize,
                          color: "#444",
                          marginTop: 2,
                        }}
                      >
                        {item.summary}
                      </Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        );
      })}
    </>
  );
};
