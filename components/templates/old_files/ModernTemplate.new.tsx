import {
  Document,
  Page,
  View,
  StyleSheet,
  pdf,
  Text,
} from "@react-pdf/renderer";
import type { Resume } from "@/db";
import { getTemplateDefaults } from "@/lib/template-defaults";
import "@/lib/fonts";

// Core components
import {
  createFontConfig,
  createGetColorFn,
  ProfileImage,
  SectionHeading,
} from "./core";
import type { FontConfig, GetColorFn, ContactItem } from "./core";
import { ContactInfo } from "./core/primitives/ContactInfo";

// Universal sections
import { SummarySection } from "./core/sections/SummarySection";
import { WorkSection } from "./core/sections/WorkSection";
import { EducationSection } from "./core/sections/EducationSection";
import { SkillsSection } from "./core/sections/SkillsSection";
import { ProjectsSection } from "./core/sections/ProjectsSection";

interface ModernTemplateProps {
  resume: Resume;
}

// Helper to convert basics to contact items
function basicsToContactItems(basics: Resume["basics"]): ContactItem[] {
  const items: ContactItem[] = [];

  if (basics.email) {
    items.push({
      type: "email",
      value: basics.email,
      url: `mailto:${basics.email}`,
    });
  }
  if (basics.phone) {
    items.push({
      type: "phone",
      value: basics.phone,
      url: `tel:${basics.phone}`,
    });
  }
  if (basics.location?.city) {
    const loc = [basics.location.city, basics.location.country]
      .filter(Boolean)
      .join(", ");
    items.push({ type: "location", value: loc });
  }
  if (basics.url) {
    items.push({ type: "url", value: "Portfolio", url: basics.url });
  }

  // Add profiles
  basics.profiles?.forEach((profile) => {
    if (profile.url) {
      items.push({
        type: "profile",
        value: profile.username || profile.network || profile.url,
        url: profile.url,
        label: profile.network,
      });
    }
  });

  return items;
}

export function ModernTemplate({ resume }: ModernTemplateProps) {
  const { basics, work, education, skills, projects } = resume;

  // Merge template defaults with resume settings
  const templateDefaults = getTemplateDefaults(
    resume.meta.templateId || "modern",
  );
  const settings = { ...templateDefaults, ...resume.meta.layoutSettings };
  const themeColor = resume.meta.themeColor || "#10b981"; // Default emerald

  // Create shared configs
  const fonts: FontConfig = createFontConfig(
    settings.fontFamily || "Open Sans",
  );
  const getColor: GetColorFn = createGetColorFn(
    themeColor,
    settings.themeColorTarget,
  );
  const fontSize = settings.fontSize;

  // Styles
  const styles = StyleSheet.create({
    page: {
      padding: 30,
      fontFamily: fonts.base,
      fontSize,
      lineHeight: settings.lineHeight,
      color: "#333",
    },
    header: {
      alignItems: "center",
      marginBottom: settings.sectionMargin * 1.5,
    },
    name: {
      fontSize: 32,
      fontWeight: "bold",
      color: themeColor,
      marginBottom: 30,
      letterSpacing: -0.5,
    },
    title: {
      fontSize: fontSize + 4,
      color: "#666",
      marginBottom: 12,
      fontWeight: "semibold",
      textTransform: "uppercase",
      letterSpacing: 1,
    },
    section: {
      marginBottom: settings.sectionMargin,
    },
    gridTwo: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
    },
    gridItem: {
      width: "48%",
    },
  });

  // Common props for all sections
  const commonProps = {
    settings,
    fonts,
    fontSize,
    getColor,
    SectionHeading,
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          {basics.image && settings.showProfileImage && (
            <ProfileImage
              src={typeof basics.image === "string" ? basics.image : ""}
              size={settings.profileImageSize}
              shape={settings.profileImageShape}
              border={settings.profileImageBorder}
              borderColor={themeColor}
              style={{ marginBottom: 10 }}
            />
          )}
          <Text style={styles.name}>{basics.name || "Your Name"}</Text>
          {basics.label && <Text style={styles.title}>{basics.label}</Text>}
          <ContactInfo
            items={basicsToContactItems(basics)}
            style="bar"
            align="center"
            fontSize={fontSize}
            fonts={fonts}
            getColor={getColor}
            gap={16}
          />
        </View>

        {/* Summary */}
        {basics.summary && (
          <View style={styles.section}>
            <SummarySection summary={basics.summary} {...commonProps} />
          </View>
        )}

        {/* Work Experience */}
        {work && work.length > 0 && (
          <View style={styles.section}>
            <WorkSection
              work={work}
              {...commonProps}
              sectionTitle="Experience"
            />
          </View>
        )}

        {/* Skills */}
        {skills && skills.length > 0 && (
          <View style={styles.section}>
            <SkillsSection
              skills={skills}
              {...commonProps}
              sectionTitle="Skills & Expertise"
            />
          </View>
        )}

        {/* Education & Projects Grid */}
        <View style={styles.gridTwo}>
          {education && education.length > 0 && (
            <View
              style={{
                width: projects && projects.length > 0 ? "48%" : "100%",
              }}
            >
              <EducationSection education={education} {...commonProps} />
            </View>
          )}

          {projects && projects.length > 0 && (
            <View
              style={{
                width: education && education.length > 0 ? "48%" : "100%",
              }}
            >
              <ProjectsSection projects={projects} {...commonProps} />
            </View>
          )}
        </View>
      </Page>
    </Document>
  );
}

export async function generateModernPDF(resume: Resume): Promise<Blob> {
  const doc = <ModernTemplate resume={resume} />;
  const blob = await pdf(doc).toBlob();
  return blob;
}
