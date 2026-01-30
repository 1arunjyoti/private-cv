import { Document, Page, View, StyleSheet, pdf } from "@react-pdf/renderer";
import { useMemo, useCallback } from "react";
import type { Resume } from "@/db";
import { getTemplateDefaults } from "@/lib/template-defaults";
import { mmToPt } from "@/lib/template-utils";
import "@/lib/fonts";
import { getSectionHeadingWrapperStyles } from "@/lib/template-styles";

// Components
import { ProfessionalHeader } from "./ProfessionalHeader";
import { ProfessionalSummary } from "./ProfessionalSummary";
import { ProfessionalExperience } from "./ProfessionalExperience";
import { ProfessionalEducation } from "./ProfessionalEducation";
import { ProfessionalSkills } from "./ProfessionalSkills";
import { ProfessionalProjects } from "./ProfessionalProjects";
import { ProfessionalCertificates } from "./ProfessionalCertificates";
import { ProfessionalLanguages } from "./ProfessionalLanguages";
import { ProfessionalInterests } from "./ProfessionalInterests";
import { ProfessionalAwards } from "./ProfessionalAwards";
import { ProfessionalPublications } from "./ProfessionalPublications";
import { ProfessionalReferences } from "./ProfessionalReferences";
import { ProfessionalCustom } from "./ProfessionalCustom";

interface ProfessionalTemplateProps {
  resume: Resume;
}

export function ProfessionalTemplate({ resume }: ProfessionalTemplateProps) {
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
    resume.meta.templateId || "professional",
  );
  const settings = useMemo(
    () => ({ ...templateDefaults, ...resume.meta.layoutSettings }),
    [templateDefaults, resume.meta.layoutSettings],
  );

  // Defaults and calculations
  const fontSize = settings.fontSize || 9;
  const lineHeight = settings.lineHeight || 1.4;
  const sectionMargin = settings.sectionMargin || 10;
  const bulletMargin = settings.bulletMargin || 1;
  const marginH = mmToPt(settings.marginHorizontal || 15);
  const marginV = mmToPt(settings.marginVertical || 15);

  // Column sizing
  const columnCount = settings.columnCount || 2;
  const leftColumnWidthPercent = settings.leftColumnWidth || 30;
  // If 2 columns, calculate right width. If 1 column, these don't matter much (logic handles it)
  const rightColumnWidthPercent = 100 - leftColumnWidthPercent - 4; // 4% gap

  const layoutHeaderPos = settings.headerPosition || "left";
  const headerAlign: "left" | "center" | "right" =
    layoutHeaderPos === "left" || layoutHeaderPos === "right"
      ? layoutHeaderPos
      : "center";

  // Typography
  const baseFont = settings.fontFamily || "Roboto";
  const boldFont = settings.fontFamily || "Roboto";
  const italicFont = settings.fontFamily || "Roboto";

  const colorTargets = useMemo(
    () => settings.themeColorTarget || [],
    [settings.themeColorTarget],
  );

  const themeColor = resume.meta.themeColor;
  const getColor = useCallback(
    (target: string, fallback: string = "#000000") => {
      return colorTargets.includes(target) ? themeColor : fallback;
    },
    [colorTargets, themeColor],
  );

  // Memoize dynamic styles that depend on settings/props
  const styles = useMemo(
    () =>
      StyleSheet.create({
        // Former static styles merged here to be available in TemplateStyles
        mainContainer: {
          flexDirection: "row",
          gap: "4%",
        },
        entryBlock: {
          marginBottom: 6,
        },
        entryHeader: {
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 2,
          flexWrap: "wrap",
        },
        sidebarItem: {
          marginBottom: 3,
        },

        // Dynamic styles
        page: {
          paddingHorizontal: marginH,
          paddingVertical: marginV,
          fontFamily: baseFont,
          fontSize: fontSize,
          lineHeight: lineHeight,
          color: "#000",
          flexDirection: "column",
        },
        header: {
          marginBottom: settings.headerBottomMargin ?? sectionMargin,
          borderBottomWidth: settings.sectionHeadingStyle === 1 ? 1 : 0,
          borderBottomColor: colorTargets.includes("decorations")
            ? resume.meta.themeColor
            : "#000000",
          paddingBottom: 10,
          width: "100%",
        },
        leftColumn: {
          width: `${leftColumnWidthPercent}%`,
        },
        rightColumn: {
          width: `${rightColumnWidthPercent}%`,
        },

        // Text elements
        name: {
          fontSize: settings.nameFontSize || 24,
          fontWeight: settings.nameBold ? "bold" : "normal",
          fontFamily:
            settings.nameFont === "creative"
              ? "Helvetica"
              : settings.nameBold
                ? boldFont
                : baseFont,
          textTransform: "uppercase",
          color: colorTargets.includes("name")
            ? resume.meta.themeColor
            : "#000000",
          lineHeight: settings.nameLineHeight || 1.2,
          marginBottom: 4,
        },
        title: {
          fontSize: settings.titleFontSize || 14,
          color: colorTargets.includes("title")
            ? resume.meta.themeColor
            : "#444",
          marginBottom: 4,
          fontWeight: settings.titleBold ? "bold" : "normal",
          fontStyle: settings.titleItalic ? "italic" : "normal",
          fontFamily: settings.titleBold
            ? boldFont
            : settings.titleItalic
              ? italicFont
              : baseFont,
          lineHeight: settings.titleLineHeight || 1.2,
        },
        contactRow: {
          flexDirection: "row",
          justifyContent:
            headerAlign === "left"
              ? "flex-start"
              : headerAlign === "right"
                ? "flex-end"
                : "center",
          flexWrap: "wrap",
          rowGap: 2,
          columnGap: 0,
          fontSize: settings.contactFontSize || fontSize,
          marginTop: 2,
        },

        // Section Common
        section: {
          marginBottom: sectionMargin,
        },

        sectionTitleWrapper: {
          ...getSectionHeadingWrapperStyles(settings, getColor),
          marginBottom: 6,
        },
        sectionTitle: {
          fontSize:
            settings.sectionHeadingSize === "L" ? fontSize + 2 : fontSize + 1,
          fontWeight: settings.sectionHeadingBold ? "bold" : "normal",
          fontFamily: settings.sectionHeadingBold ? boldFont : baseFont,
          textTransform: settings.sectionHeadingCapitalization,
          color: colorTargets.includes("headings")
            ? resume.meta.themeColor
            : "#000000",
        },

        // Entry Styles
        entryTitle: {
          fontSize:
            settings.entryTitleSize === "L" ? fontSize + 2 : fontSize + 1,
          fontWeight: "bold",
          fontFamily: boldFont,
        },
        entrySubtitle: {
          fontSize: fontSize,
          fontWeight:
            settings.entrySubtitleStyle === "bold" ? "bold" : "normal",
          fontStyle:
            settings.entrySubtitleStyle === "italic" ? "italic" : "normal",
          fontFamily:
            settings.entrySubtitleStyle === "bold"
              ? boldFont
              : settings.entrySubtitleStyle === "italic"
                ? italicFont
                : baseFont,
          marginBottom: 1,
        },
        entryDate: {
          fontSize: fontSize - 0.5,
          color: "#666",
          textAlign: "right",
          fontFamily: italicFont,
          fontStyle: "italic",
          minWidth: 60,
        },
        entryLocation: {
          fontSize: fontSize - 0.5,
          fontStyle: "italic",
          fontFamily: italicFont,
          color: "#666",
        },
        entrySummary: {
          marginTop: 2,
          marginBottom: 2,
          marginLeft: settings.entryIndentBody ? 8 : 0,
        },

        // Lists
        bulletList: {
          marginLeft: settings.entryIndentBody ? 16 : 8,
        },
        bulletItem: {
          flexDirection: "row",
          marginBottom: bulletMargin,
        },
        bullet: {
          minWidth: 6,
          fontSize: fontSize,
          lineHeight: 1.3,
          marginRight: 2,
        },
        bulletText: {
          flex: 1,
          fontSize: fontSize,
          lineHeight: 1.3,
        },

        link: {
          textDecoration: "none",
          color: colorTargets.includes("links")
            ? resume.meta.themeColor
            : "#000",
        },
      }),
    [
      marginH,
      marginV,
      baseFont,
      fontSize,
      lineHeight,
      sectionMargin,
      bulletMargin,
      settings,
      leftColumnWidthPercent,
      rightColumnWidthPercent,
      headerAlign,
      boldFont,
      italicFont,
      colorTargets,
      resume.meta.themeColor,
      getColor,
    ],
  );

  // --- Renderers ---

  const SECTION_RENDERERS = {
    summary: () => (
      <ProfessionalSummary
        summary={basics.summary}
        settings={settings}
        styles={styles}
        getColor={getColor}
        fontSize={fontSize}
        lineHeight={lineHeight}
      />
    ),
    work: () => (
      <ProfessionalExperience
        work={work}
        settings={settings}
        styles={styles}
        getColor={getColor}
        fontSize={fontSize}
        baseFont={baseFont}
        boldFont={boldFont}
        italicFont={italicFont}
      />
    ),
    education: () => (
      <ProfessionalEducation
        education={education}
        settings={settings}
        styles={styles}
        getColor={getColor}
        fontSize={fontSize}
        baseFont={baseFont}
        boldFont={boldFont}
        italicFont={italicFont}
      />
    ),
    skills: () => (
      <ProfessionalSkills
        skills={skills}
        settings={settings}
        styles={styles}
        getColor={getColor}
        fontSize={fontSize}
        lineHeight={lineHeight}
        baseFont={baseFont}
        boldFont={boldFont}
      />
    ),
    projects: () => (
      <ProfessionalProjects
        projects={projects}
        settings={settings}
        styles={styles}
        getColor={getColor}
        fontSize={fontSize}
        baseFont={baseFont}
        boldFont={boldFont}
        italicFont={italicFont}
      />
    ),
    certificates: () => (
      <ProfessionalCertificates
        certificates={certificates}
        settings={settings}
        styles={styles}
        getColor={getColor}
        fontSize={fontSize}
        baseFont={baseFont}
        boldFont={boldFont}
        italicFont={italicFont}
      />
    ),
    awards: () => (
      <ProfessionalAwards
        awards={awards}
        settings={settings}
        styles={styles}
        getColor={getColor}
        fontSize={fontSize}
        baseFont={baseFont}
        boldFont={boldFont}
        italicFont={italicFont}
      />
    ),
    publications: () => (
      <ProfessionalPublications
        publications={publications}
        settings={settings}
        styles={styles}
        getColor={getColor}
        fontSize={fontSize}
        baseFont={baseFont}
        boldFont={boldFont}
        italicFont={italicFont}
      />
    ),
    languages: () => (
      <ProfessionalLanguages
        languages={languages}
        settings={settings}
        styles={styles}
        getColor={getColor}
        fontSize={fontSize}
        baseFont={baseFont}
        boldFont={boldFont}
        italicFont={italicFont}
      />
    ),
    interests: () => (
      <ProfessionalInterests
        interests={interests}
        settings={settings}
        styles={styles}
        getColor={getColor}
        fontSize={fontSize}
        baseFont={baseFont}
        boldFont={boldFont}
        italicFont={italicFont}
      />
    ),
    references: () => (
      <ProfessionalReferences
        references={references}
        settings={settings}
        styles={styles}
        getColor={getColor}
        fontSize={fontSize}
        baseFont={baseFont}
        boldFont={boldFont}
        italicFont={italicFont}
      />
    ),
    custom: () => (
      <ProfessionalCustom
        custom={custom}
        settings={settings}
        styles={styles}
        getColor={getColor}
        fontSize={fontSize}
        baseFont={baseFont}
        boldFont={boldFont}
        italicFont={italicFont}
      />
    ),
  };

  const LHS_SECTIONS = [
    "skills",
    "education",
    "languages",
    "certificates",
    "awards",
    "interests",
  ];

  const RHS_SECTIONS = [
    "summary",
    "work",
    "projects",
    "publications",
    "references",
    "custom",
  ];

  const order =
    settings.sectionOrder && settings.sectionOrder.length > 0
      ? settings.sectionOrder
      : [...RHS_SECTIONS, ...LHS_SECTIONS];

  const leftColumnContent = order.filter((id) => LHS_SECTIONS.includes(id));
  const rightColumnContent = order.filter((id) => RHS_SECTIONS.includes(id));

  const knownSections = [...LHS_SECTIONS, ...RHS_SECTIONS];
  const orphans = order.filter((id) => !knownSections.includes(id));
  if (orphans.length > 0) {
    rightColumnContent.push(...orphans);
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <ProfessionalHeader
          basics={basics}
          settings={settings}
          styles={styles}
          getColor={getColor}
          baseFont={baseFont}
          boldFont={boldFont}
          italicFont={italicFont}
          fontSize={fontSize}
        />

        {columnCount === 1 ? (
          <View>
            {order.map((sectionId) => {
              const renderer =
                SECTION_RENDERERS[sectionId as keyof typeof SECTION_RENDERERS];
              return renderer ? (
                <View key={sectionId}>{renderer()}</View>
              ) : null;
            })}
          </View>
        ) : (
          <View style={styles.mainContainer}>
            {/* Left Column / Sidebar */}
            <View style={styles.leftColumn}>
              {leftColumnContent.map((sectionId) => {
                const renderer =
                  SECTION_RENDERERS[
                    sectionId as keyof typeof SECTION_RENDERERS
                  ];
                return renderer ? (
                  <View key={sectionId}>{renderer()}</View>
                ) : null;
              })}
            </View>

            {/* Right Column / Main */}
            <View style={styles.rightColumn}>
              {rightColumnContent.map((sectionId) => {
                const renderer =
                  SECTION_RENDERERS[
                    sectionId as keyof typeof SECTION_RENDERERS
                  ];
                return renderer ? (
                  <View key={sectionId}>{renderer()}</View>
                ) : null;
              })}
            </View>
          </View>
        )}
      </Page>
    </Document>
  );
}

export async function generateProfessionalPDF(resume: Resume): Promise<Blob> {
  const doc = <ProfessionalTemplate resume={resume} />;
  const blob = await pdf(doc).toBlob();
  return blob;
}
