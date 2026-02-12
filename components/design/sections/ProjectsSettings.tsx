import { Label } from "@/components/ui/label";
import { FolderGit2 } from "lucide-react";
import React from "react";
import { SettingsSection } from "../SettingsSection";
import { SubSectionCard } from "../SubSectionCard";

import { LayoutSettings, LayoutSettingValue } from "../types";

interface ProjectsSettingsProps {
  layoutSettings: LayoutSettings;
  updateSetting: (key: keyof LayoutSettings, value: LayoutSettingValue) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export function ProjectsSettings({
  layoutSettings,
  updateSetting,
  isOpen,
  onToggle,
}: ProjectsSettingsProps) {
  return (
    <SettingsSection
      title="Projects Style"
      icon={FolderGit2}
      isOpen={isOpen}
      onToggle={onToggle}
    >
      <div className="space-y-6">
        {/* Project List Style */}
        <SubSectionCard>
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Project List Style
          </Label>
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                { value: "bullet", label: "Bullet" },
                { value: "number", label: "Number" },
                { value: "none", label: "None" },
              ] as const
            ).map((style) => (
              <button
                key={style.value}
                onClick={() => updateSetting("projectsListStyle", style.value)}
                className={`py-2 px-3 rounded-md border text-xs font-medium transition-all ${
                  (layoutSettings.projectsListStyle || "bullet") === style.value
                    ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                    : "border-border bg-background hover:bg-muted"
                }`}
              >
                {style.label}
              </button>
            ))}
          </div>
        </SubSectionCard>

        {/* Project Name Style */}
        <SubSectionCard>
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Project Name
          </Label>
          <div className="flex gap-2">
            <button
              onClick={() =>
                updateSetting(
                  "projectsNameBold",
                  !layoutSettings.projectsNameBold,
                )
              }
              className={`flex-1 py-2 px-3 rounded-md border text-xs font-medium transition-all ${
                layoutSettings.projectsNameBold
                  ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                  : "border-border bg-background hover:bg-muted"
              }`}
            >
              Bold
            </button>
            <button
              onClick={() =>
                updateSetting(
                  "projectsNameItalic",
                  !layoutSettings.projectsNameItalic,
                )
              }
              className={`flex-1 py-2 px-3 rounded-md border text-xs font-medium transition-all ${
                layoutSettings.projectsNameItalic
                  ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                  : "border-border bg-background hover:bg-muted"
              }`}
            >
              Italic
            </button>
          </div>
        </SubSectionCard>

        {/* Date Style */}
        <SubSectionCard>
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Start & End Date
          </Label>
          <div className="flex gap-2">
            <button
              onClick={() =>
                updateSetting(
                  "projectsDateBold",
                  !layoutSettings.projectsDateBold,
                )
              }
              className={`flex-1 py-2 px-3 rounded-md border text-xs font-medium transition-all ${
                layoutSettings.projectsDateBold
                  ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                  : "border-border bg-background hover:bg-muted"
              }`}
            >
              Bold
            </button>
            <button
              onClick={() =>
                updateSetting(
                  "projectsDateItalic",
                  !layoutSettings.projectsDateItalic,
                )
              }
              className={`flex-1 py-2 px-3 rounded-md border text-xs font-medium transition-all ${
                layoutSettings.projectsDateItalic
                  ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                  : "border-border bg-background hover:bg-muted"
              }`}
            >
              Italic
            </button>
          </div>
        </SubSectionCard>

        {/* Technologies Style */}
        <SubSectionCard>
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Technologies Used
          </Label>
          <div className="flex gap-2">
            <button
              onClick={() =>
                updateSetting(
                  "projectsTechnologiesBold",
                  !layoutSettings.projectsTechnologiesBold,
                )
              }
              className={`flex-1 py-2 px-3 rounded-md border text-xs font-medium transition-all ${
                layoutSettings.projectsTechnologiesBold
                  ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                  : "border-border bg-background hover:bg-muted"
              }`}
            >
              Bold
            </button>
            <button
              onClick={() =>
                updateSetting(
                  "projectsTechnologiesItalic",
                  !layoutSettings.projectsTechnologiesItalic,
                )
              }
              className={`flex-1 py-2 px-3 rounded-md border text-xs font-medium transition-all ${
                layoutSettings.projectsTechnologiesItalic
                  ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                  : "border-border bg-background hover:bg-muted"
              }`}
            >
              Italic
            </button>
          </div>
        </SubSectionCard>

        {/* Key Features List Style */}
        <SubSectionCard>
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Key Features (List Style)
          </Label>
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                { value: "bullet", label: "Bullet" },
                { value: "number", label: "Number" },
                { value: "none", label: "None" },
              ] as const
            ).map((style) => (
              <button
                key={style.value}
                onClick={() =>
                  updateSetting("projectsAchievementsListStyle", style.value)
                }
                className={`py-2 px-3 rounded-md border text-xs font-medium transition-all ${
                  (layoutSettings.projectsAchievementsListStyle || "bullet") ===
                  style.value
                    ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                    : "border-border bg-background hover:bg-muted"
                }`}
              >
                {style.label}
              </button>
            ))}
          </div>
        </SubSectionCard>

        {/* Key Features Text Style */}
        <SubSectionCard>
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Key Features (Text Style)
          </Label>
          <div className="flex gap-2">
            <button
              onClick={() =>
                updateSetting(
                  "projectsFeaturesBold",
                  !layoutSettings.projectsFeaturesBold,
                )
              }
              className={`flex-1 py-2 px-3 rounded-md border text-xs font-medium transition-all ${
                layoutSettings.projectsFeaturesBold
                  ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                  : "border-border bg-background hover:bg-muted"
              }`}
            >
              Bold
            </button>
            <button
              onClick={() =>
                updateSetting(
                  "projectsFeaturesItalic",
                  !layoutSettings.projectsFeaturesItalic,
                )
              }
              className={`flex-1 py-2 px-3 rounded-md border text-xs font-medium transition-all ${
                layoutSettings.projectsFeaturesItalic
                  ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                  : "border-border bg-background hover:bg-muted"
              }`}
            >
              Italic
            </button>
          </div>
        </SubSectionCard>
      </div>
    </SettingsSection>
  );
}
