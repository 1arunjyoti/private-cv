/**
 * ATSTemplate - ATS-friendly single-column resume template
 * 
 * MIGRATED to use core components for consistent styling and customization support.
 * Original: 640 lines → Migrated: ~120 lines
 */

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
} from "@react-pdf/renderer";
import type { Resume, LayoutSettings } from "@/db";
import { getTemplateDefaults } from "@/lib/template-defaults";
import "@/lib/fonts";

// Import from core components
import {
  Sections,
  SummarySection,
  ProfileImage,
  ContactInfo,
  createContactItems,
  createFontConfig,
  createGetColorFn,
} from "./core";

interface ATSTemplateProps {
  resume: Resume;
}

export function ATSTemplate({ resume }: ATSTemplateProps) {
  const { basics } = resume;

  // Merge template defaults with resume settings
  const templateDefaults = getTemplateDefaults(resume.meta.templateId || "ats");
  const settings = { ...templateDefaults, ...resume.meta.layoutSettings } as LayoutSettings;

  // Theme color
  const themeColor = resume.meta.themeColor || "#3b82f6";

  // Create standardized font and color configs
  const fontFamily = settings.fontFamily || "Open Sans";
  const fonts = createFontConfig(fontFamily);
  const getColor = createGetColorFn(themeColor, settings.themeColorTarget || []);

  // Typography settings
  const fontSize = settings.fontSize || 9;
  const lineHeight = settings.lineHeight || 1.4;

  // Styles
  const styles = StyleSheet.create({
    page: {
      paddingHorizontal: (settings.marginHorizontal || 15) + "mm",
      paddingVertical: (settings.marginVertical || 15) + "mm",
      fontFamily: fontFamily,
      fontSize,
      lineHeight,
      color: "#333",
    },
    header: {
      marginBottom: (settings.sectionMargin || 12) * 1.5,
      borderBottomWidth: 2,
      borderBottomColor: themeColor,
      paddingBottom: 15,
    },
    name: {
      fontSize: settings.nameFontSize || 24,
      fontWeight: settings.nameBold ? "bold" : "normal",
      marginBottom: 6,
      color: getColor("name", "#1a1a1a"),
    },
    title: {
      fontSize: settings.titleFontSize || 12,
      color: "#666",
      marginBottom: 8,
      fontStyle: settings.titleItalic ? "italic" : "normal",
    },
    contactWrapper: {
      marginTop: 8,
    },
  });

  // Build contact items from basics
  const contactItems = createContactItems(basics);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          {/* Profile Image */}
          {basics.image && settings.showProfileImage && (
            <ProfileImage
              src={basics.image as string}
              size={settings.profileImageSize}
              shape={settings.profileImageShape}
              border={settings.profileImageBorder}
              borderColor="#000"
              style={{ marginBottom: 10 }}
            />
          )}

          {/* Name */}
          <Text style={styles.name}>{basics.name || "Your Name"}</Text>

          {/* Title/Label */}
          {basics.label && <Text style={styles.title}>{basics.label}</Text>}

          {/* Contact Info */}
          {contactItems.length > 0 && (
            <View style={styles.contactWrapper}>
              <ContactInfo
                items={contactItems}
                style="bar"
                align="left"
                fontSize={settings.contactFontSize || fontSize}
                fonts={fonts}
                getColor={getColor}
                bold={settings.contactBold}
                italic={settings.contactItalic}
                gap={15}
              />
            </View>
          )}
        </View>

        {/* Summary */}
        <SummarySection
          summary={basics.summary}
          settings={settings}
          fonts={fonts}
          fontSize={fontSize}
          getColor={getColor}
          lineHeight={lineHeight}
          sectionTitle="Professional Summary"
        />

        {/* All other sections - automatically ordered and styled */}
        <Sections
          resume={resume}
          settings={settings}
          fonts={fonts}
          fontSize={fontSize}
          getColor={getColor}
          lineHeight={lineHeight}
          exclude={["summary"]}
        />
      </Page>
    </Document>
  );
}

// Export PDF generation function
export async function generatePDF(resume: Resume): Promise<Blob> {
  const doc = <ATSTemplate resume={resume} />;
  const blob = await pdf(doc).toBlob();
  return blob;
}
