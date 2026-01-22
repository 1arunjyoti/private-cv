import React from "react";
import { View, Text, Link } from "@react-pdf/renderer";
import { Resume } from "@/db";
import { LayoutSettings, TemplateStyles } from "@/components/design/types";
import { formatDate } from "@/lib/template-utils";

interface CreativeCertificatesProps {
  certificates: Resume["certificates"];
  settings: LayoutSettings;
  styles: TemplateStyles;
  getColor: (target: string, fallback?: string) => string;
  fontSize: number;
  baseFont: string;
  boldFont: string;
  italicFont: string;
}

export const CreativeCertificates: React.FC<CreativeCertificatesProps> = ({
  certificates,
  settings,
  styles,
  getColor,
  fontSize,
  baseFont,
  boldFont,
  italicFont,
}) => {
  if (!certificates || certificates.length === 0) return null;

  return (
    <View key="certificates" style={styles.section}>
      {((settings.certificatesHeadingVisible ?? true) as boolean) && (
        <View style={styles.sectionTitleWrapper}>
          <Text
            style={[
              styles.sectionTitle,
              {
                color: getColor("headings"),
              },
            ]}
          >
            Certificates
          </Text>
        </View>
      )}

      {certificates.map((cert, index) => {
        const listStyle = settings.certificatesListStyle || "none";

        return (
          <View key={cert.id} style={{ marginBottom: 8, flexDirection: "row" }}>
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
                  fontFamily: settings.certificatesNameBold
                    ? boldFont
                    : settings.certificatesNameItalic
                      ? italicFont
                      : baseFont,
                  fontWeight: settings.certificatesNameBold ? "bold" : "normal",
                  fontStyle: settings.certificatesNameItalic
                    ? "italic"
                    : "normal",
                  fontSize: fontSize,
                }}
              >
                {cert.name}
                {cert.url && (
                  <Link
                    src={cert.url}
                    style={{
                      textDecoration: "none",
                      color: getColor("links"),
                      fontSize: fontSize,
                    }}
                  >
                    {" "}
                    🔗
                  </Link>
                )}
              </Text>
              {cert.issuer && (
                <Text
                  style={{
                    fontFamily: settings.certificatesIssuerBold
                      ? boldFont
                      : settings.certificatesIssuerItalic
                        ? italicFont
                        : baseFont,
                    fontWeight: settings.certificatesIssuerBold
                      ? "bold"
                      : "normal",
                    fontStyle: settings.certificatesIssuerItalic
                      ? "italic"
                      : "normal",
                    fontSize: fontSize - 1,
                    color: "#555",
                  }}
                >
                  {cert.issuer}
                </Text>
              )}
              {/* Andrew Kim style has 'Level 1 & 2' italicized potentially? Or text. Simple text for now. */}
              {cert.date && (
                <Text
                  style={{
                    fontFamily: settings.certificatesDateBold
                      ? boldFont
                      : settings.certificatesDateItalic
                        ? italicFont
                        : baseFont,
                    fontWeight: settings.certificatesDateBold
                      ? "bold"
                      : "normal",
                    fontStyle: settings.certificatesDateItalic
                      ? "italic"
                      : "normal",
                    fontSize: fontSize - 2,
                    color: "#777",
                  }}
                >
                  {formatDate(cert.date)}
                </Text>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
};
