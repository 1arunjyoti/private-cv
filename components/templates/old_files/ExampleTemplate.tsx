/**
 * Example Refactored Template
 * 
 * This is an example showing how to build a template using the new core components.
 * Compare this to the original ATSTemplate.tsx (640 lines) - this is ~100 lines.
 * 
 * Benefits of this approach:
 * 1. All customization settings automatically work
 * 2. Consistent styling across all templates
 * 3. Adding new features happens in one place (core components)
 * 4. New templates require minimal code
 */

import React from "react";
import { Document, Page, Text, View, StyleSheet, pdf } from "@react-pdf/renderer";
import type { Resume } from "@/db";
import { getTemplateDefaults } from "@/lib/template-defaults";
import "@/lib/fonts";

// Import from the new core library
import {
  Sections,
  ProfileImage,
  ContactInfo,
  createContactItems,
  createFontConfig,
  createGetColorFn,
  SummarySection,
} from "@/components/templates/core";

// Map text alignment to flex alignment
const ALIGN_MAP = {
  left: "flex-start",
  center: "center",
  right: "flex-end",
} as const;

interface ExampleTemplateProps {
  resume: Resume;
}

export function ExampleTemplate({ resume }: ExampleTemplateProps) {
  const { basics } = resume;

  // Get template defaults and merge with user settings
  const templateDefaults = getTemplateDefaults(resume.meta.templateId || "ats");
  const settings = { ...templateDefaults, ...resume.meta.layoutSettings };

  // Theme color
  const themeColor = resume.meta.themeColor || "#3b82f6";

  // Create standardized font and color configs
  const fonts = createFontConfig(settings.fontFamily || "Open Sans");
  const getColor = createGetColorFn(themeColor, settings.themeColorTarget || []);

  // Typography settings
  const fontSize = settings.fontSize || 9;
  const lineHeight = settings.lineHeight || 1.4;

  // Dynamic styles
  const styles = StyleSheet.create({
    page: {
      paddingHorizontal: (settings.marginHorizontal || 15) + "mm",
      paddingVertical: (settings.marginVertical || 15) + "mm",
      fontFamily: fonts.base,
      fontSize,
      lineHeight,
      color: "#333",
    },
    header: {
      marginBottom: settings.sectionMargin * 1.5,
      borderBottomWidth: 2,
      borderBottomColor: themeColor,
      paddingBottom: 15,
      alignItems: ALIGN_MAP[settings.personalDetailsAlign || "left"],
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
              borderColor={themeColor}
              style={{ marginBottom: 10 }}
            />
          )}

          {/* Name */}
          <Text style={styles.name}>{basics.name || "Your Name"}</Text>

          {/* Title/Label */}
          {basics.label && <Text style={styles.title}>{basics.label}</Text>}

          {/* Contact Info */}
          <View style={styles.contactWrapper}>
            <ContactInfo
              items={contactItems}
              style={settings.personalDetailsContactStyle === "icon" ? "icon" : "bar"}
              align={settings.personalDetailsAlign}
              fontSize={settings.contactFontSize || fontSize}
              fonts={fonts}
              getColor={getColor}
              bold={settings.contactBold}
              italic={settings.contactItalic}
            />
          </View>
        </View>

        {/* Summary (rendered separately for header placement) */}
        <SummarySection
          summary={basics.summary}
          settings={settings}
          fonts={fonts}
          fontSize={fontSize}
          getColor={getColor}
          lineHeight={lineHeight}
        />

        {/* All other sections - automatically ordered and styled */}
        <Sections
          resume={resume}
          settings={settings}
          fonts={fonts}
          fontSize={fontSize}
          getColor={getColor}
          lineHeight={lineHeight}
          exclude={["summary"]} // Already rendered above
        />
      </Page>
    </Document>
  );
}

// Export PDF generation function
export async function generateExamplePDF(resume: Resume): Promise<Blob> {
  const doc = <ExampleTemplate resume={resume} />;
  const blob = await pdf(doc).toBlob();
  return blob;
}
