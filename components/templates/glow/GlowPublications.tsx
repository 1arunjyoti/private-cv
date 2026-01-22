import React from "react";
import { View, Text, Link } from "@react-pdf/renderer";
import { Resume } from "@/db";
import { LayoutSettings, TemplateStyles } from "@/components/design/types";
import { PDFRichText } from "../PDFRichText";

interface GlowPublicationsProps {
  publications: Resume["publications"];
  settings: LayoutSettings;
  styles: TemplateStyles;
  getColor: (target: string, fallback?: string) => string;
  fontSize: number;
  baseFont: string;
  boldFont: string;
}

export const GlowPublications: React.FC<GlowPublicationsProps> = ({
  publications,
  settings,
  styles,
  getColor,
  fontSize,
  baseFont,
  boldFont,
}) => {
  if (!publications || publications.length === 0) return null;

  return (
    <View key="publications" style={styles.section}>
      {((settings.publicationsHeadingVisible ?? true) as boolean) && (
        <View style={styles.sectionTitleWrapper}>
          <Text style={[styles.sectionTitle, { color: getColor("headings") }]}>
            PUBLICATIONS
          </Text>
        </View>
      )}
      {publications.map((pub) => (
        <View key={pub.id} style={styles.entryBlock}>
           <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <View style={{ flexDirection: "row", alignItems: "baseline" }}>
                <Text style={{ fontSize: fontSize + 1, fontFamily: boldFont, fontWeight: "bold" }}>
                    {pub.name}
                </Text>
                {pub.url && (
                    <Link src={pub.url}>
                        <Text style={{ fontSize: fontSize - 1, color: getColor("links"), marginLeft: 4 }}>↗</Text>
                    </Link>
                )}
            </View>
            <Text style={{ fontSize: fontSize, color: getColor("dates") }}>
                {pub.releaseDate}
            </Text>
          </View>
           <Text style={{ fontSize: fontSize, fontFamily: baseFont, marginTop: 1 }}>
              {pub.publisher}
           </Text>
           <View style={styles.entrySummary}>
            <PDFRichText
              text={pub.summary}
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
};
