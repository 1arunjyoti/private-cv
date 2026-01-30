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
import { mmToPt } from "@/lib/template-utils";
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
import { CertificatesSection } from "./core/sections/CertificatesSection";
import { LanguagesSection } from "./core/sections/LanguagesSection";
import { InterestsSection } from "./core/sections/InterestsSection";
import { AwardsSection } from "./core/sections/AwardsSection";
import { PublicationsSection } from "./core/sections/PublicationsSection";
import { ReferencesSection } from "./core/sections/ReferencesSection";
import { CustomSection } from "./core/sections/CustomSection";

interface ClassicTemplateProps {
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
    items.push({
      type: "url",
      value: basics.url.replace(/^https?:\/\//, ""),
      url: basics.url,
    });
  }

  // Add profiles
  basics.profiles?.forEach((profile) => {
    if (profile.url) {
      items.push({
        type: "profile",
        value: profile.username || profile.network || profile.url,
        url: profile.url,
        label: profile.username
          ? `${profile.network}: ${profile.username}`
          : profile.network,
      });
    }
  });

  return items;
}

export function ClassicTemplate({ resume }: ClassicTemplateProps) {
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

  // Merge template defaults with resume settings
  const templateDefaults = getTemplateDefaults(
    resume.meta.templateId || "classic",
  );
  const settings = { ...templateDefaults, ...resume.meta.layoutSettings };

  // Create shared configs
  const fonts: FontConfig = createFontConfig(settings.fontFamily);
  const getColor: GetColorFn = createGetColorFn(
    resume.meta.themeColor,
    settings.themeColorTarget,
  );
  const fontSize = settings.fontSize;

  // Layout measurements
  const marginH = mmToPt(settings.marginHorizontal);
  const marginV = mmToPt(settings.marginVertical);
  const columnCount = settings.columnCount;
  const leftColumnWidthPercent = settings.leftColumnWidth;
  const rightColumnWidthPercent = 100 - leftColumnWidthPercent;

  // Header alignment
  const layoutHeaderPos = settings.headerPosition;
  const headerAlign: "left" | "center" | "right" =
    layoutHeaderPos === "left" || layoutHeaderPos === "right"
      ? layoutHeaderPos
      : "center";

  // Styles
  const styles = StyleSheet.create({
    page: {
      paddingHorizontal: marginH,
      paddingVertical: marginV,
      fontFamily: fonts.base,
      fontSize,
      lineHeight: settings.lineHeight,
      color: "#000",
      flexDirection: "column",
    },
    header: {
      marginBottom: settings.headerBottomMargin,
      textAlign: headerAlign,
      borderBottomWidth: settings.sectionHeadingStyle === 1 ? 2 : 0,
      borderBottomColor: getColor("decorations"),
      borderBottomStyle: "solid",
      paddingBottom: 8,
      width: "100%",
      alignItems:
        headerAlign === "center"
          ? "center"
          : headerAlign === "right"
            ? "flex-end"
            : "flex-start",
    },
    name: {
      fontSize: settings.nameFontSize,
      fontFamily:
        settings.nameFont === "creative"
          ? "Helvetica"
          : settings.nameBold
            ? fonts.bold
            : fonts.base,
      fontWeight:
        settings.nameBold || settings.nameFont === "creative"
          ? "bold"
          : "normal",
      marginBottom: 4,
      lineHeight: settings.nameLineHeight,
      textTransform: "uppercase",
      letterSpacing: 1,
      color: getColor("name"),
    },
    label: {
      fontSize: settings.titleFontSize,
      marginBottom: 3,
      fontWeight: settings.titleBold ? "bold" : "normal",
      fontStyle: settings.titleItalic ? "italic" : "normal",
      fontFamily: settings.titleBold
        ? fonts.bold
        : settings.titleItalic
          ? fonts.italic
          : fonts.base,
      lineHeight: settings.titleLineHeight,
      color: getColor("title"),
    },
    columnsContainer: {
      flexDirection: "row",
      gap: 12,
    },
    leftColumn: {
      width: `${leftColumnWidthPercent}%`,
    },
    rightColumn: {
      width: `${rightColumnWidthPercent}%`,
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

  // Section order
  const order =
    settings.sectionOrder && settings.sectionOrder.length > 0
      ? settings.sectionOrder
      : [
          "summary",
          "work",
          "education",
          "skills",
          "projects",
          "certificates",
          "languages",
          "interests",
          "awards",
          "publications",
          "references",
          "custom",
        ];

  // Section renderers map
  const renderSection = (sectionId: string) => {
    switch (sectionId) {
      case "summary":
        return basics.summary ? (
          <View key={sectionId} style={styles.section}>
            <SummarySection summary={basics.summary} {...commonProps} />
          </View>
        ) : null;
      case "work":
        return work && work.length > 0 ? (
          <View key={sectionId} style={styles.section}>
            <WorkSection work={work} {...commonProps} />
          </View>
        ) : null;
      case "education":
        return education && education.length > 0 ? (
          <View key={sectionId} style={styles.section}>
            <EducationSection education={education} {...commonProps} />
          </View>
        ) : null;
      case "skills":
        return skills && skills.length > 0 ? (
          <View key={sectionId} style={styles.section}>
            <SkillsSection skills={skills} {...commonProps} />
          </View>
        ) : null;
      case "projects":
        return projects && projects.length > 0 ? (
          <View key={sectionId} style={styles.section}>
            <ProjectsSection projects={projects} {...commonProps} />
          </View>
        ) : null;
      case "certificates":
        return certificates && certificates.length > 0 ? (
          <View key={sectionId} style={styles.section}>
            <CertificatesSection certificates={certificates} {...commonProps} />
          </View>
        ) : null;
      case "languages":
        return languages && languages.length > 0 ? (
          <View key={sectionId} style={styles.section}>
            <LanguagesSection languages={languages} {...commonProps} />
          </View>
        ) : null;
      case "interests":
        return interests && interests.length > 0 ? (
          <View key={sectionId} style={styles.section}>
            <InterestsSection interests={interests} {...commonProps} />
          </View>
        ) : null;
      case "awards":
        return awards && awards.length > 0 ? (
          <View key={sectionId} style={styles.section}>
            <AwardsSection awards={awards} {...commonProps} />
          </View>
        ) : null;
      case "publications":
        return publications && publications.length > 0 ? (
          <View key={sectionId} style={styles.section}>
            <PublicationsSection publications={publications} {...commonProps} />
          </View>
        ) : null;
      case "references":
        return references && references.length > 0 ? (
          <View key={sectionId} style={styles.section}>
            <ReferencesSection references={references} {...commonProps} />
          </View>
        ) : null;
      case "custom":
        return custom && custom.length > 0 ? (
          <View key={sectionId} style={styles.section}>
            <CustomSection custom={custom} {...commonProps} />
          </View>
        ) : null;
      default:
        return null;
    }
  };

  // Two-column layout logic
  const LHS_SECTIONS = [
    "skills",
    "education",
    "languages",
    "interests",
    "awards",
    "certificates",
    "references",
  ];
  const RHS_SECTIONS = [
    "summary",
    "work",
    "projects",
    "custom",
    "publications",
  ];

  const leftColumnContent = order.filter((id) => LHS_SECTIONS.includes(id));
  const rightColumnContent = order.filter((id) => RHS_SECTIONS.includes(id));

  // Put unknown sections in right column
  const knownSections = [...LHS_SECTIONS, ...RHS_SECTIONS];
  const orphans = order.filter((id) => !knownSections.includes(id));
  rightColumnContent.push(...orphans);

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
              borderColor={getColor("decorations")}
              style={{ marginBottom: 10 }}
            />
          )}
          {basics.name && <Text style={styles.name}>{basics.name}</Text>}
          {basics.label && <Text style={styles.label}>{basics.label}</Text>}
          <ContactInfo
            items={basicsToContactItems(basics)}
            style={
              settings.personalDetailsArrangement === 1 ? "bar" : "stacked"
            }
            align={headerAlign}
            fontSize={settings.contactFontSize}
            fonts={fonts}
            getColor={getColor}
            bold={settings.contactBold}
            italic={settings.contactItalic}
            separator={settings.contactSeparator}
            lineHeight={settings.lineHeight}
          />
        </View>

        {/* Content */}
        {columnCount === 1 ? (
          <View>{order.map((sectionId) => renderSection(sectionId))}</View>
        ) : (
          <View style={styles.columnsContainer}>
            <View style={styles.leftColumn}>
              {leftColumnContent.map((sectionId) => renderSection(sectionId))}
            </View>
            <View style={styles.rightColumn}>
              {rightColumnContent.map((sectionId) => renderSection(sectionId))}
            </View>
          </View>
        )}
      </Page>
    </Document>
  );
}

export async function generateClassicPDF(resume: Resume): Promise<Blob> {
  const doc = <ClassicTemplate resume={resume} />;
  const blob = await pdf(doc).toBlob();
  return blob;
}
