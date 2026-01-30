import React from "react";
import { Document, Page, View, StyleSheet, pdf } from "@react-pdf/renderer";
import type { Resume } from "@/db";
import { getTemplateDefaults } from "@/lib/template-defaults";
import "@/lib/fonts"; // Auto-registers all fonts
import { getSectionHeadingWrapperStyles } from "@/lib/template-styles";

// Sub-components
import { CreativeHeader } from "./CreativeHeader";
import { CreativeSummary } from "./CreativeSummary";
import { CreativeExperience } from "./CreativeExperience";
import { CreativeEducation } from "./CreativeEducation";
import { CreativeSkills } from "./CreativeSkills";
import { CreativeProjects } from "./CreativeProjects";
import { CreativeCertificates } from "./CreativeCertificates";
import { CreativeAwards } from "./CreativeAwards";
import { CreativePublications } from "./CreativePublications";
import { CreativeReferences } from "./CreativeReferences";
import { CreativeLanguages } from "./CreativeLanguages";
import { CreativeInterests } from "./CreativeInterests";
import { CreativeCustom } from "./CreativeCustom";

interface CreativeTemplateProps {
  resume: Resume;
}

export function CreativeTemplate({ resume }: CreativeTemplateProps) {
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
  const templateDefaults = getTemplateDefaults(
    resume.meta.templateId || "creative",
  );
  const settings = { ...templateDefaults, ...resume.meta.layoutSettings };

  // Defaults
  const fontSize = settings.fontSize;
  const lineHeight = settings.lineHeight;
  const sectionMargin = settings.sectionMargin;
  const bulletMargin = settings.bulletMargin;

  // Typography
  const selectedFont = settings.fontFamily;
  const baseFont = selectedFont; // Can be overriden if specific fonts needed for name/headers
  const boldFont = selectedFont; // React-pdf handles bold automatically usually if registered, but helpful to be explicit
  const italicFont = selectedFont;

  // Colors
  const colorTargets = settings.themeColorTarget;
  const getColor = (target: string, fallback: string = "#000000") => {
    return colorTargets.includes(target) ? resume.meta.themeColor : fallback;
  };

  // Styles
  const styles = StyleSheet.create({
    page: {
      flexDirection: "row",
      fontFamily: baseFont,
      fontSize: fontSize,
      lineHeight: lineHeight,
      backgroundColor: "#fff",
      paddingTop: 30,
      paddingBottom: 30,
    },
    // Sidebar
    sidebarBackground: {
      position: "absolute",
      top: -30,
      left: 0,
      bottom: -30,
      width: "32%",
      backgroundColor: "#f4f4f0",
    },
    // Sidebar
    sidebar: {
      width: "32%", // Andrew Kim left column looks about 30-35%
      paddingHorizontal: 20,
      color: "#333",
    },
    // Main Content
    main: {
      width: "68%",
      paddingHorizontal: 30,
      backgroundColor: "#fff",
      paddingLeft: 25,
    },
    // Common Section
    section: {
      marginBottom: sectionMargin,
    },
    sectionTitleWrapper: getSectionHeadingWrapperStyles(settings, getColor),
    sectionTitle: {
      fontSize:
        settings.sectionHeadingSize === "L" ? fontSize + 2 : fontSize + 1,
      fontFamily: settings.sectionHeadingBold ? boldFont : baseFont,
      fontWeight: settings.sectionHeadingBold ? "bold" : "normal",
      textTransform: settings.sectionHeadingCapitalization,
      letterSpacing: 0.8,
      color: getColor("headings"),
      // Andrew Kim specific override for main column headings if not using standard wrapper:
      // borderBottomWidth: 1,
      // borderBottomColor: getColor("headings"),
      // width: "100%",
    },
    // Entry blocks
    entryBlock: {
      marginBottom: 8,
    },
    entrySummary: {
      fontSize: fontSize,
      marginTop: 2,
    },
    bulletList: {
      marginLeft: 10,
      marginTop: 2,
    },
    bulletItem: {
      flexDirection: "row",
      marginBottom: bulletMargin,
    },
    bullet: {
      width: 10,
      fontSize: fontSize,
    },
    bulletText: {
      flex: 1,
      fontSize: fontSize,
    },
    contactRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 4,
    },
  });

  const commonProps = {
    settings,
    styles,
    getColor,
    fontSize,
    baseFont,
    boldFont,
    italicFont,
    lineHeight,
  };

  const SECTION_RENDERERS = {
    summary: () => (
      <CreativeSummary summary={basics.summary} {...commonProps} />
    ),
    work: () => <CreativeExperience work={work} {...commonProps} />,
    education: () => (
      <CreativeEducation education={education} {...commonProps} />
    ),
    skills: () => (
      <CreativeSkills
        skills={skills}
        {...commonProps}
        lineHeight={lineHeight}
      />
    ),
    projects: () => <CreativeProjects projects={projects} {...commonProps} />,
    certificates: () => (
      <CreativeCertificates certificates={certificates} {...commonProps} />
    ),
    awards: () => <CreativeAwards awards={awards} {...commonProps} />,
    publications: () => (
      <CreativePublications publications={publications} {...commonProps} />
    ),
    languages: () => (
      <CreativeLanguages languages={languages} {...commonProps} />
    ),
    interests: () => (
      <CreativeInterests interests={interests} {...commonProps} />
    ),
    references: () => (
      <CreativeReferences references={references} {...commonProps} />
    ),
    custom: () => <CreativeCustom custom={custom} {...commonProps} />,
  };

  // Section Order Logic
  const order =
    settings.sectionOrder && settings.sectionOrder.length > 0
      ? settings.sectionOrder
      : [
          "summary", // Sidebar
          "work", // Main
          "education", // Main
          "skills", // Main
          "projects", // Main
          "certificates", // Sidebar
          "languages", // Sidebar
          "interests", // Sidebar
          "awards", // Main
          "publications", // Main
          "references", // Main
          "custom", // Main
        ];

  // Andrew Kim Layout:
  // Left: Header (Fixed), Summary, Certificates, Languages, Interests
  // Right: Experience, Education, Skills, Projects

  const LHS_SECTIONS = ["summary", "certificates", "languages", "interests"];

  const RHS_SECTIONS = [
    "work",
    "education",
    "skills",
    "projects",
    "awards",
    "publications",
    "references",
    "custom",
  ];

  // NOTE: If user reorders sections, they might want to move Skills to Sidebar?
  // For now, I'll stick to the "Layout Definitions" - items in LHS stay in LHS but reorder amongst themselves relative to global order,
  // or should I obey the global order blindly and just fill columns?
  // ClassicTemplate splits them by ID. So if I move "skills" up, it stays in Right column but moves up in Right column.
  // Unless we have a way to drag between columns (which we don't seem to have in the UI yet, just a single list).
  // So hardcoding column assignment based on section type is the safest bet for preserving the design intent.

  const leftColumnContent = order.filter((id) => LHS_SECTIONS.includes(id));
  const rightColumnContent = order.filter((id) => RHS_SECTIONS.includes(id));

  // Catch orphans
  const knownSections = [...LHS_SECTIONS, ...RHS_SECTIONS];
  const orphans = order.filter((id) => !knownSections.includes(id));
  rightColumnContent.push(...orphans);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Fixed Background for Sidebar to ensure full bleed height with page padding */}
        <View fixed style={styles.sidebarBackground} />

        {/* Left Column (Sidebar) */}
        <View style={styles.sidebar}>
          {/* Header is always top of Sidebar */}
          <CreativeHeader basics={basics} {...commonProps} />

          {leftColumnContent.map((sectionId) => {
            const renderer =
              SECTION_RENDERERS[sectionId as keyof typeof SECTION_RENDERERS];
            return renderer ? <View key={sectionId}>{renderer()}</View> : null;
          })}
        </View>

        {/* Right Column (Main) */}
        <View style={styles.main}>
          {rightColumnContent.map((sectionId) => {
            const renderer =
              SECTION_RENDERERS[sectionId as keyof typeof SECTION_RENDERERS];
            return renderer ? <View key={sectionId}>{renderer()}</View> : null;
          })}
        </View>
      </Page>
    </Document>
  );
}

export async function generateCreativePDF(resume: Resume): Promise<Blob> {
  const doc = <CreativeTemplate resume={resume} />;
  const blob = await pdf(doc).toBlob();
  return blob;
}
