import React from "react";
import { View, Text } from "@react-pdf/renderer";
import { Resume } from "@/db";
import { LayoutSettings, TemplateStyles } from "@/components/design/types";

interface GlowCertificatesProps {
  certificates: Resume["certificates"];
  settings: LayoutSettings;
  styles: TemplateStyles;
  getColor: (target: string, fallback?: string) => string;
  fontSize: number;
  baseFont: string;
  boldFont: string;
}

export const GlowCertificates: React.FC<GlowCertificatesProps> = ({
  certificates,
  settings,
  styles,
  getColor,
  fontSize,
  baseFont,
  boldFont,
}) => {
  if (!certificates || certificates.length === 0) return null;

  return (
    <View key="certificates" style={styles.section}>
      {((settings.certificatesHeadingVisible ?? true) as boolean) && (
        <View style={styles.sectionTitleWrapper}>
          <Text style={[styles.sectionTitle, { color: getColor("headings") }]}>
            CERTIFICATES
          </Text>
        </View>
      )}
      {certificates.map((cert) => (
        <View key={cert.id} style={styles.entryBlock}>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={{ fontSize: fontSize + 1, fontFamily: boldFont, fontWeight: "bold" }}>
              {cert.name}
            </Text>
            <Text style={{ fontSize: fontSize, color: getColor("dates") }}>
              {cert.date}
            </Text>
          </View>
          <Text style={{ fontSize: fontSize, fontFamily: baseFont }}>
             {cert.issuer}
          </Text>
        </View>
      ))}
    </View>
  );
};
