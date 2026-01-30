import React from "react";
import { View, Text } from "@react-pdf/renderer";
import { Resume } from "@/db";
import { LayoutSettings, TemplateStyles } from "@/components/design/types";

interface CreativeReferencesProps {
  references: Resume["references"];
  settings: LayoutSettings;
  styles: TemplateStyles;
  getColor: (target: string, fallback?: string) => string;
  fontSize: number;
  baseFont: string;
  boldFont: string;
  italicFont: string;
}

export const CreativeReferences: React.FC<CreativeReferencesProps> = ({
  references,
  settings,
  styles,
  getColor,
  fontSize,
  baseFont,
  boldFont,
  italicFont,
}) => {
  if (!references || references.length === 0) return null;

  return (
    <View key="references" style={styles.section}>
      {((settings.referencesHeadingVisible ?? true) as boolean) && (
        <View style={styles.sectionTitleWrapper}>
          <Text style={[styles.sectionTitle, { color: getColor("headings") }]}>
            References
          </Text>
        </View>
      )}

      {references.map((ref, index) => {
        const listStyle = settings.referencesListStyle || "none";

        return (
          <View
            key={ref.id}
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
                  fontFamily: settings.referencesNameBold
                    ? boldFont
                    : settings.referencesNameItalic
                      ? italicFont
                      : baseFont,
                  fontWeight: settings.referencesNameBold ? "bold" : "normal",
                  fontStyle: settings.referencesNameItalic
                    ? "italic"
                    : "normal",
                  fontSize: fontSize,
                }}
              >
                {ref.name}
              </Text>
              <Text
                style={{
                  fontFamily: settings.referencesPositionBold
                    ? boldFont
                    : settings.referencesPositionItalic
                      ? italicFont
                      : baseFont,
                  fontWeight: settings.referencesPositionBold
                    ? "bold"
                    : "normal",
                  fontStyle: settings.referencesPositionItalic
                    ? "italic"
                    : "normal",
                  fontSize: fontSize,
                  color: "#444",
                }}
              >
                {ref.reference}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
};
