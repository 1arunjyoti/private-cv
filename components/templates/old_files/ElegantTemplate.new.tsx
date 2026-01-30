import { Document, Page, View, StyleSheet, pdf, Text, Link } from "@react-pdf/renderer";
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
import type { FontConfig, GetColorFn } from "./core";

// Universal sections
import { SummarySection } from "./core/sections/SummarySection";
import { WorkSection } from "./core/sections/WorkSection";
import { EducationSection } from "./core/sections/EducationSection";
import { SkillsSection } from "./core/sections/SkillsSection";
import { ProjectsSection } from "./core/sections/ProjectsSection";
import { CertificatesSection } from "./core/sections/CertificatesSection";
import { LanguagesSection } from "./core/sections/LanguagesSection";
import { InterestsSection } from "./core/sections/InterestsSection";
import { AwardsSection } from "./core/sections/AwardsSection";
import { PublicationsSection } from "./core/sections/PublicationsSection";
import { ReferencesSection } from "./core/sections/ReferencesSection";
import { CustomSection } from "./core/sections/CustomSection";

interface ElegantTemplateProps {
  resume: Resume;
}

export function ElegantTemplate({ resume }: ElegantTemplateProps) {
  const {
    basics,
    work,
    education,
    skills,
    projects,
    certificates,
    languages,
    interests,
    publications,
    awards,
    references,
    custom,
  } = resume;

  // Merge template defaults
  const templateDefaults = getTemplateDefaults(resume.meta.templateId || "elegant");
  const settings = { ...templateDefaults, ...resume.meta.layoutSettings };
  const themeColor = resume.meta.themeColor || "#2c3e50";

  // Create shared configs
  const fonts: FontConfig = createFontConfig(settings.fontFamily || "Open Sans");
  const getColor: GetColorFn = createGetColorFn(themeColor, settings.themeColorTarget);
  const fontSize = settings.fontSize;

  // Styles
  const styles = StyleSheet.create({
    page: {
      padding: 30,
      paddingTop: 40,
      fontFamily: fonts.base,
      fontSize,
      lineHeight: settings.lineHeight,
      color: "#374151",
      backgroundColor: "#fff",
      paddingBottom: 30,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: settings.headerBottomMargin || 24,
      borderBottomWidth: 1,
      borderBottomColor: themeColor,
      paddingBottom: 16,
    },
    headerLeft: {
      flex: 1,
      marginRight: 20,
    },
    headerRight: {
      alignItems: "flex-end",
      justifyContent: "center",
      maxWidth: "40%",
    },
    name: {
      fontSize: 32,
      fontWeight: "bold",
      color: themeColor,
      marginBottom: 6,
      letterSpacing: -0.5,
      lineHeight: 1.1,
    },
    title: {
      fontSize: fontSize + 2,
      color: "#6b7280",
      textTransform: "uppercase",
      letterSpacing: 2,
      marginBottom: 4,
    },
    contactItem: {
      fontSize: fontSize - 0.5,
      color: "#4b5563",
      marginBottom: 3,
      textAlign: "right",
    },
    section: {
      marginBottom: settings.sectionMargin,
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
        {/* Header - Elegant has a split header layout */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {basics.image && settings.showProfileImage && (
              <ProfileImage
                src={typeof basics.image === "string" ? basics.image : ""}
                size={settings.profileImageSize}
                shape={settings.profileImageShape}
                border={settings.profileImageBorder}
                borderColor={themeColor}
                style={{ marginBottom: 12 }}
              />
            )}
            <Text style={styles.name}>{basics.name}</Text>
            <Text style={styles.title}>{basics.label}</Text>
          </View>
          <View style={styles.headerRight}>
            {basics.email && <Text style={styles.contactItem}>{basics.email}</Text>}
            {basics.phone && <Text style={styles.contactItem}>{basics.phone}</Text>}
            {basics.location?.city && (
              <Text style={styles.contactItem}>
                {basics.location.city}, {basics.location.country}
              </Text>
            )}
            {basics.url && (
              <Link src={basics.url} style={styles.contactItem}>
                Portfolio
              </Link>
            )}
          </View>
        </View>

        {/* Content sections */}
        <View>
          {basics.summary && (
            <View style={styles.section}>
              <SummarySection 
                summary={basics.summary} 
                {...commonProps}
                sectionTitle="Profile"
              />
            </View>
          )}

          {work && work.length > 0 && (
            <View style={styles.section}>
              <WorkSection 
                work={work} 
                {...commonProps}
                sectionTitle="Experience"
              />
            </View>
          )}

          {education && education.length > 0 && (
            <View style={styles.section}>
              <EducationSection education={education} {...commonProps} />
            </View>
          )}

          {skills && skills.length > 0 && (
            <View style={styles.section}>
              <SkillsSection skills={skills} {...commonProps} />
            </View>
          )}

          {projects && projects.length > 0 && (
            <View style={styles.section}>
              <ProjectsSection projects={projects} {...commonProps} />
            </View>
          )}

          {certificates && certificates.length > 0 && (
            <View style={styles.section}>
              <CertificatesSection certificates={certificates} {...commonProps} />
            </View>
          )}

          {languages && languages.length > 0 && (
            <View style={styles.section}>
              <LanguagesSection languages={languages} {...commonProps} />
            </View>
          )}

          {interests && interests.length > 0 && (
            <View style={styles.section}>
              <InterestsSection interests={interests} {...commonProps} />
            </View>
          )}

          {awards && awards.length > 0 && (
            <View style={styles.section}>
              <AwardsSection awards={awards} {...commonProps} />
            </View>
          )}

          {publications && publications.length > 0 && (
            <View style={styles.section}>
              <PublicationsSection publications={publications} {...commonProps} />
            </View>
          )}

          {references && references.length > 0 && (
            <View style={styles.section}>
              <ReferencesSection references={references} {...commonProps} />
            </View>
          )}

          {custom && custom.length > 0 && (
            <View style={styles.section}>
              <CustomSection custom={custom} {...commonProps} />
            </View>
          )}
        </View>
      </Page>
    </Document>
  );
}

export async function generateElegantPDF(resume: Resume): Promise<Blob> {
  const doc = <ElegantTemplate resume={resume} />;
  const blob = await pdf(doc).toBlob();
  return blob;
}
