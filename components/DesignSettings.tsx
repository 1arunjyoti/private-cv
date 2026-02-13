"use client";

import { Button } from "@/components/ui/button";
// import { ScrollArea } from "@/components/ui/scroll-area";
import { useResumeStore } from "@/store/useResumeStore";
import {
  getTemplateDefaults,
  getTemplateThemeColor,
} from "@/lib/template-defaults";
import { RotateCcw, ChevronsUpDown } from "lucide-react";
import { useState } from "react";

// Import new components
import { AwardsSettings } from "./design/sections/AwardsSettings";
import { CertificatesSettings } from "./design/sections/CertificatesSettings";
import { CustomSectionSettings } from "./design/sections/CustomSectionSettings";
import { EducationSettings } from "./design/sections/EducationSettings";
import { EntryLayoutSettings } from "./design/sections/EntryLayoutSettings";
import { ExperienceSettings } from "./design/sections/ExperienceSettings";
import { HeaderSettings } from "./design/sections/HeaderSettings";
import { InterestsSettings } from "./design/sections/InterestsSettings";
import { LanguagesSettings } from "./design/sections/LanguagesSettings";
import { PageLayoutSettings } from "./design/sections/PageLayoutSettings";
import { ProjectsSettings } from "./design/sections/ProjectsSettings";
import { PublicationsSettings } from "./design/sections/PublicationsSettings";
import { ReferencesSettings } from "./design/sections/ReferencesSettings";
import { SectionHeadingSettings } from "./design/sections/SectionHeadingSettings";
import { SectionTitlesSettings } from "./design/sections/SectionTitlesSettings";
import { SkillsSettings } from "./design/sections/SkillsSettings";
import { ThemeSettings } from "./design/sections/ThemeSettings";
import { TypographySettings } from "./design/sections/TypographySettings";

import { LayoutSettings, LayoutSettingValue } from "./design/types";

export function DesignSettings() {
  const currentResume = useResumeStore((state) => state.currentResume);
  const updateCurrentResume = useResumeStore(
    (state) => state.updateCurrentResume,
  );

  // Collapsible state
  const [openSections, setOpenSections] = useState({
    layout: false,
    header: false,
    sectionTitles: false,
    spacing: false,
    entryLayout: false,
    sectionHeadings: false,
    skills: false,
    languages: false,
    interests: false,
    certificates: false,
    themeColor: false,
    work: false,
    education: false,
    publications: false,
    awards: false,
    references: false,
    custom: false,
    projects: false,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const expandAll = () => {
    setOpenSections((prev) => {
      const next = { ...prev };
      (Object.keys(next) as Array<keyof typeof prev>).forEach((k) => {
        next[k] = true;
      });
      return next;
    });
  };

  const collapseAll = () => {
    setOpenSections((prev) => {
      const next = { ...prev };
      (Object.keys(next) as Array<keyof typeof prev>).forEach((k) => {
        next[k] = false;
      });
      return next;
    });
  };

  const allExpanded = Object.values(openSections).every(Boolean);

  if (!currentResume) return null;

  // Use template defaults if layoutSettings is not set - avoids 150 lines of duplicate defaults
  const layoutSettings =
    currentResume.meta.layoutSettings ||
    getTemplateDefaults(currentResume.meta.templateId);

  const updateSetting = (
    key: keyof LayoutSettings,
    value: LayoutSettingValue,
  ) => {
    updateCurrentResume({
      meta: {
        ...currentResume.meta,
        layoutSettings: {
          ...layoutSettings,
          [key]: value,
        },
      },
    });
  };

  const updateSettings = (settings: Partial<LayoutSettings>) => {
    updateCurrentResume({
      meta: {
        ...currentResume.meta,
        layoutSettings: {
          ...layoutSettings,
          ...settings,
        },
      },
    });
  };

  const updateThemeColor = (color: string) => {
    updateCurrentResume({
      meta: {
        ...currentResume.meta,
        themeColor: color,
      },
    });
  };

  const resetToDefaults = () => {
    if (
      confirm(
        `Reset all design settings to ${currentResume.meta.templateId.toUpperCase()} template defaults?`,
      )
    ) {
      const templateDefaults = getTemplateDefaults(
        currentResume.meta.templateId,
      );
      const themeColor = getTemplateThemeColor(currentResume.meta.templateId);

      updateCurrentResume({
        meta: {
          ...currentResume.meta,
          themeColor,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          layoutSettings: templateDefaults as any,
        },
      });
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex items-center justify-between p-4 border-b shrink-0 bg-background z-10">
        <h2 className="font-semibold">Design Settings</h2>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={allExpanded ? collapseAll : expandAll}
            title={allExpanded ? "Collapse All" : "Expand All"}
          >
            <ChevronsUpDown className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={resetToDefaults}
            title="Reset to Defaults"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto border-b lg:border-none">
        <div className="p-4 md:p-6 space-y-4 sm:pb-20">
          <PageLayoutSettings
            layoutSettings={layoutSettings}
            updateSetting={updateSetting}
            updateSettings={updateSettings}
            isOpen={openSections.layout}
            onToggle={() => toggleSection("layout")}
            templateId={currentResume.meta.templateId}
          />

          <HeaderSettings
            layoutSettings={layoutSettings}
            updateSetting={updateSetting}
            isOpen={openSections.header}
            onToggle={() => toggleSection("header")}
          />

          <TypographySettings
            layoutSettings={layoutSettings}
            updateSetting={updateSetting}
            isOpen={openSections.spacing}
            onToggle={() => toggleSection("spacing")}
          />

          <ThemeSettings
            layoutSettings={layoutSettings}
            currentThemeColor={currentResume.meta.themeColor || "#000000"}
            updateSetting={updateSetting}
            updateThemeColor={updateThemeColor}
            isOpen={openSections.themeColor}
            onToggle={() => toggleSection("themeColor")}
          />

          <SectionTitlesSettings
            layoutSettings={layoutSettings}
            updateSetting={updateSetting}
            isOpen={openSections.sectionTitles}
            onToggle={() => toggleSection("sectionTitles")}
            customSections={currentResume.custom || []}
          />

          <SectionHeadingSettings
            layoutSettings={layoutSettings}
            updateSetting={updateSetting}
            isOpen={openSections.sectionHeadings}
            onToggle={() => toggleSection("sectionHeadings")}
          />

          <EntryLayoutSettings
            layoutSettings={layoutSettings}
            updateSetting={updateSetting}
            isOpen={openSections.entryLayout}
            onToggle={() => toggleSection("entryLayout")}
          />

          <ExperienceSettings
            layoutSettings={layoutSettings}
            updateSetting={updateSetting}
            isOpen={openSections.work}
            onToggle={() => toggleSection("work")}
          />

          <ProjectsSettings
            layoutSettings={layoutSettings}
            updateSetting={updateSetting}
            isOpen={openSections.projects}
            onToggle={() => toggleSection("projects")}
          />

          <EducationSettings
            layoutSettings={layoutSettings}
            updateSetting={updateSetting}
            isOpen={openSections.education}
            onToggle={() => toggleSection("education")}
          />

          <SkillsSettings
            layoutSettings={layoutSettings}
            updateSetting={updateSetting}
            isOpen={openSections.skills}
            onToggle={() => toggleSection("skills")}
          />

          <LanguagesSettings
            layoutSettings={layoutSettings}
            updateSetting={updateSetting}
            isOpen={openSections.languages}
            onToggle={() => toggleSection("languages")}
          />

          <InterestsSettings
            layoutSettings={layoutSettings}
            updateSetting={updateSetting}
            isOpen={openSections.interests}
            onToggle={() => toggleSection("interests")}
          />

          <CertificatesSettings
            layoutSettings={layoutSettings}
            updateSetting={updateSetting}
            isOpen={openSections.certificates}
            onToggle={() => toggleSection("certificates")}
          />

          <PublicationsSettings
            layoutSettings={layoutSettings}
            updateSetting={updateSetting}
            isOpen={openSections.publications}
            onToggle={() => toggleSection("publications")}
          />

          <AwardsSettings
            layoutSettings={layoutSettings}
            updateSetting={updateSetting}
            isOpen={openSections.awards}
            onToggle={() => toggleSection("awards")}
          />

          <ReferencesSettings
            layoutSettings={layoutSettings}
            updateSetting={updateSetting}
            isOpen={openSections.references}
            onToggle={() => toggleSection("references")}
          />

          <CustomSectionSettings
            layoutSettings={layoutSettings}
            updateSetting={updateSetting}
            isOpen={openSections.custom}
            onToggle={() => toggleSection("custom")}
          />
        </div>
      </div>
    </div>
  );
}
