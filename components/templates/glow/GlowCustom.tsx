import React from "react";
import { View, Text } from "@react-pdf/renderer";
import { Resume } from "@/db";
import { LayoutSettings, TemplateStyles } from "@/components/design/types";
import { PDFRichText } from "../PDFRichText";

interface GlowCustomProps {
  custom: Resume["custom"];
  settings: LayoutSettings;
  styles: TemplateStyles;
  getColor: (target: string, fallback?: string) => string;
  fontSize: number;
  baseFont: string;
  boldFont: string;
}

export const GlowCustom: React.FC<GlowCustomProps> = ({
  custom,
  styles,
  getColor,
  fontSize,
  baseFont,
  boldFont,
}) => {
  if (!custom) return null;

  return (
    <>
      {custom.map((section) => {
        if (!section.items || section.items.length === 0) return null;

        return (
          <View key={section.id} style={styles.section}>
            <View style={styles.sectionTitleWrapper}>
              <Text style={[styles.sectionTitle, { color: getColor("headings") }]}>
                {section.name.toUpperCase()}
              </Text>
            </View>
            {section.items.map((item) => (
              <View key={item.id} style={styles.entryBlock}>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ fontSize: fontSize + 1, fontFamily: boldFont, fontWeight: "bold" }}>
                    {item.name}
                  </Text>
                  <Text style={{ fontSize: fontSize, color: getColor("dates") }}>
                    {item.date}
                  </Text>
                </View>
                <Text style={{ fontSize: fontSize, marginBottom: 1 }}>{item.description}</Text>
                 <View style={styles.entrySummary}>
                    <PDFRichText
                    text={item.summary}
                    style={{
                        fontSize: fontSize,
                        fontFamily: baseFont,
                    }}
                    />
                </View>
              </View>
            ))}
          </View>
        );
      })}
    </>
  );
};
