import { Type } from "lucide-react";
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { SettingsSection } from "../SettingsSection";
import { LayoutSettings, LayoutSettingValue } from "../types";
import { CustomSection } from "@/db";

interface SectionTitlesSettingsProps {
  layoutSettings: LayoutSettings;
  updateSetting: (key: keyof LayoutSettings, value: LayoutSettingValue) => void;
  isOpen: boolean;
  onToggle: () => void;
  customSections?: CustomSection[];
}

const SECTIONS = [
  { id: "summary", label: "Summary", default: "Profile" },
  { id: "work", label: "Experience", default: "Experience" },
  { id: "education", label: "Education", default: "Education" },
  { id: "skills", label: "Skills", default: "Skills" },
  { id: "projects", label: "Projects", default: "Projects" },
  { id: "certificates", label: "Certificates", default: "Certificates" },
  { id: "languages", label: "Languages", default: "Languages" },
  { id: "interests", label: "Interests", default: "Interests" },
  { id: "awards", label: "Awards", default: "Awards" },
  { id: "publications", label: "Publications", default: "Publications" },
  { id: "references", label: "References", default: "References" },
];

export function SectionTitlesSettings({
  layoutSettings,
  updateSetting,
  isOpen,
  onToggle,
  customSections = [],
}: SectionTitlesSettingsProps) {
  const titles = layoutSettings.sectionTitles || {};

  const handleTitleChange = (sectionId: string, value: string) => {
    updateSetting("sectionTitles", {
      ...titles,
      [sectionId]: value,
    });
  };

  return (
    <SettingsSection
      title="Section Titles"
      icon={Type}
      isOpen={isOpen}
      onToggle={onToggle}
    >
      <div className="space-y-4">
        <p className="text-xs text-muted-foreground">
          Customize the headings for each section of your resume. Leave empty to
          use the default title.
        </p>

        <div className="space-y-3">
          {SECTIONS.map((section) => (
            <div key={section.id} className="grid gap-1.5">
              <Label
                htmlFor={`title-${section.id}`}
                className="text-xs font-medium text-muted-foreground flex justify-between"
              >
                <span>{section.label}</span>
                <span className="text-[10px] opacity-70">
                  Default: {section.default}
                </span>
              </Label>
              <Input
                id={`title-${section.id}`}
                placeholder={section.default}
                value={titles[section.id] || ""}
                onChange={(e) => handleTitleChange(section.id, e.target.value)}
                className="h-8 text-xs"
              />
            </div>
          ))}

          {customSections.length > 0 && (
            <>
              {customSections.map((section) => (
                <div key={section.id} className="grid gap-1.5">
                  <Label
                    htmlFor={`title-${section.id}`}
                    className="text-xs font-medium text-muted-foreground flex justify-between"
                  >
                    <span>{section.name}</span>
                    <span className="text-[10px] opacity-70">
                      Custom Section
                    </span>
                  </Label>
                  <Input
                    id={`title-${section.id}`}
                    placeholder={section.name}
                    value={titles[section.id] || ""}
                    onChange={(e) =>
                      handleTitleChange(section.id, e.target.value)
                    }
                    className="h-8 text-xs"
                  />
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </SettingsSection>
  );
}
