import React from "react";
import { View, Text } from "@react-pdf/renderer";
import { Resume } from "@/db";
import { LayoutSettings, TemplateStyles } from "@/components/design/types";

interface ProfessionalReferencesProps {
  references: Resume["references"];
  settings: LayoutSettings;
  styles: TemplateStyles;
  getColor: (target: string, fallback?: string) => string;
  fontSize: number;
  baseFont: string;
  boldFont: string;
  italicFont: string;
}

export const ProfessionalReferences: React.FC<ProfessionalReferencesProps> = ({
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
    <View style={styles.section}>
      {((settings.referencesHeadingVisible ?? true) as boolean) && (
        <View style={styles.sectionTitleWrapper}>
          <Text style={[styles.sectionTitle, { color: getColor("headings") }]}>
            References
          </Text>
        </View>
      )}
      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
        {references.map((ref, index) => (
          <View
            key={ref.id}
            style={{
              width: "48%",
              marginRight: "2%",
              marginBottom: 6,
              flexDirection: "row",
            }}
          >
            {settings.referencesListStyle === "bullet" && (
              <Text style={{ marginRight: 4, fontSize: fontSize }}>•</Text>
            )}
            {settings.referencesListStyle === "number" && (
              <Text style={{ marginRight: 4, fontSize: fontSize }}>
                {index + 1}.
              </Text>
            )}
            <View>
              <Text
                style={{
                  fontSize: fontSize,
                  fontFamily: settings.referencesNameBold
                    ? boldFont
                    : settings.referencesNameItalic
                      ? italicFont
                      : baseFont,
                  fontWeight: settings.referencesNameBold ? "bold" : "normal",
                  fontStyle: settings.referencesNameItalic
                    ? "italic"
                    : "normal",
                }}
              >
                {ref.name}
              </Text>
              <Text
                style={{
                  fontSize: fontSize,
                  color: "#4b5563",
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
                }}
              >
                {ref.position} {ref.position && ref.reference ? "|" : ""}{" "}
                {ref.reference}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};
