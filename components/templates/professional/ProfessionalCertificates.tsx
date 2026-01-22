import React from "react";
import { View, Text, Link } from "@react-pdf/renderer";
import { Resume } from "@/db";
import { PDFRichText } from "../PDFRichText";
import { formatDate } from "@/lib/template-utils";
import { LayoutSettings, TemplateStyles } from "@/components/design/types";

interface ProfessionalCertificatesProps {
  certificates: Resume["certificates"];
  settings: LayoutSettings;
  styles: TemplateStyles;
  getColor: (target: string, fallback?: string) => string;
  fontSize: number;
  baseFont: string;
  boldFont: string;
  italicFont: string;
}

export const ProfessionalCertificates: React.FC<
  ProfessionalCertificatesProps
> = ({
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
    <View style={styles.section}>
      {((settings.certificatesHeadingVisible ?? true) as boolean) && (
        <View style={styles.sectionTitleWrapper}>
          <Text style={[styles.sectionTitle, { color: getColor("headings") }]}>
            Certifications
          </Text>
        </View>
      )}
      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
        {certificates.map((cert, index) => (
          <View
            key={cert.id}
            style={{
              marginBottom: 4,
              width:
                settings.certificatesDisplayStyle === "grid" ? "48%" : "100%",
              marginRight:
                settings.certificatesDisplayStyle === "grid" ? "2%" : 0,
            }}
          >
            <View style={{ flexDirection: "row" }}>
              {settings.certificatesListStyle === "bullet" && (
                <Text style={{ marginRight: 4 }}>•</Text>
              )}
              {settings.certificatesListStyle === "number" && (
                <Text style={{ marginRight: 4 }}>{index + 1}.</Text>
              )}
              <View style={{ flex: 1 }}>
                <View style={styles.entryHeader}>
                  <Text
                    style={[
                      styles.entryTitle,
                      {
                        fontFamily: settings.certificatesNameBold
                          ? boldFont
                          : settings.certificatesNameItalic
                            ? italicFont
                            : baseFont,
                        fontWeight: settings.certificatesNameBold
                          ? "bold"
                          : "normal",
                        fontStyle: settings.certificatesNameItalic
                          ? "italic"
                          : "normal",
                      },
                    ]}
                  >
                    {cert.name}
                  </Text>
                  <Text
                    style={[
                      styles.entryDate,
                      {
                        fontFamily: settings.certificatesDateItalic
                          ? italicFont
                          : baseFont,
                        fontWeight: settings.certificatesDateBold
                          ? "bold"
                          : "normal",
                        fontStyle: settings.certificatesDateItalic
                          ? "italic"
                          : "normal",
                      },
                    ]}
                  >
                    {formatDate(cert.date)}
                  </Text>
                </View>

                <Text
                  style={[
                    styles.entrySubtitle,
                    {
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
                    },
                  ]}
                >
                  {cert.issuer}
                </Text>

                {cert.url && (
                  <Link
                    src={cert.url}
                    style={{
                      fontSize: fontSize - 1,
                      color: getColor("links"),
                      textDecoration: "none",
                      marginBottom: 1,
                      fontFamily: settings.certificatesUrlBold
                        ? boldFont
                        : settings.certificatesUrlItalic
                          ? italicFont
                          : baseFont,
                      fontWeight: settings.certificatesUrlBold
                        ? "bold"
                        : "normal",
                      fontStyle: settings.certificatesUrlItalic
                        ? "italic"
                        : "normal",
                    }}
                  >
                    {cert.url}
                  </Link>
                )}

                {cert.summary && (
                  <View style={styles.entrySummary}>
                    <PDFRichText
                      text={cert.summary}
                      style={{ fontSize }}
                      fontSize={fontSize}
                    />
                  </View>
                )}
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};
