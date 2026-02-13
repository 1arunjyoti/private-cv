import { Label } from "@/components/ui/label";
import { Briefcase } from "lucide-react";
import React from "react";
import { SettingsSection } from "../SettingsSection";
import { SubSectionCard } from "../SubSectionCard";

import { LayoutSettings, LayoutSettingValue } from "../types";

interface ExperienceSettingsProps {
  layoutSettings: LayoutSettings;
  updateSetting: (key: keyof LayoutSettings, value: LayoutSettingValue) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export function ExperienceSettings({
  layoutSettings,
  updateSetting,
  isOpen,
  onToggle,
}: ExperienceSettingsProps) {
  return (
    <SettingsSection
      title="Professional Experience"
      icon={Briefcase}
      isOpen={isOpen}
      onToggle={onToggle}
    >
      <div className="space-y-6">
        {/* Company Name */}
        <SubSectionCard>
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Company Name
          </Label>
          <div className="space-y-2">
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
                    updateSetting("experienceCompanyListStyle", style.value)
                  }
                  className={`py-2 px-3 rounded-md border text-xs font-medium transition-all ${
                    (layoutSettings.experienceCompanyListStyle || "none") ===
                    style.value
                      ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                      : "border-border bg-background hover:bg-muted"
                  }`}
                >
                  {style.label}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() =>
                  updateSetting(
                    "experienceCompanyBold",
                    !layoutSettings.experienceCompanyBold,
                  )
                }
                className={`flex-1 py-2 px-3 rounded-md border text-xs font-medium transition-all ${
                  layoutSettings.experienceCompanyBold
                    ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                    : "border-border bg-background hover:bg-muted"
                }`}
              >
                Bold
              </button>
              <button
                onClick={() =>
                  updateSetting(
                    "experienceCompanyItalic",
                    !layoutSettings.experienceCompanyItalic,
                  )
                }
                className={`flex-1 py-2 px-3 rounded-md border text-xs font-medium transition-all ${
                  layoutSettings.experienceCompanyItalic
                    ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                    : "border-border bg-background hover:bg-muted"
                }`}
              >
                Italic
              </button>
            </div>
          </div>
        </SubSectionCard>

        {/* Position */}
        <SubSectionCard>
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Position
          </Label>
          <div className="flex gap-2">
            <button
              onClick={() =>
                updateSetting(
                  "experiencePositionBold",
                  !layoutSettings.experiencePositionBold,
                )
              }
              className={`flex-1 py-2 px-3 rounded-md border text-xs font-medium transition-all ${
                layoutSettings.experiencePositionBold
                  ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                  : "border-border bg-background hover:bg-muted"
              }`}
            >
              Bold
            </button>
            <button
              onClick={() =>
                updateSetting(
                  "experiencePositionItalic",
                  !layoutSettings.experiencePositionItalic,
                )
              }
              className={`flex-1 py-2 px-3 rounded-md border text-xs font-medium transition-all ${
                layoutSettings.experiencePositionItalic
                  ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                  : "border-border bg-background hover:bg-muted"
              }`}
            >
              Italic
            </button>
          </div>
        </SubSectionCard>

        {/* Website Link */}
        <SubSectionCard>
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Company Website
          </Label>
          <div className="flex gap-2">
            <button
              onClick={() =>
                updateSetting(
                  "experienceWebsiteBold",
                  !layoutSettings.experienceWebsiteBold,
                )
              }
              className={`flex-1 py-2 px-3 rounded-md border text-xs font-medium transition-all ${
                layoutSettings.experienceWebsiteBold
                  ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                  : "border-border bg-background hover:bg-muted"
              }`}
            >
              Bold
            </button>
            <button
              onClick={() =>
                updateSetting(
                  "experienceWebsiteItalic",
                  !layoutSettings.experienceWebsiteItalic,
                )
              }
              className={`flex-1 py-2 px-3 rounded-md border text-xs font-medium transition-all ${
                layoutSettings.experienceWebsiteItalic
                  ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                  : "border-border bg-background hover:bg-muted"
              }`}
            >
              Italic
            </button>
          </div>
        </SubSectionCard>

        {/* Date */}
        <SubSectionCard>
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Start & End Date
          </Label>
          <div className="flex gap-2">
            <button
              onClick={() =>
                updateSetting(
                  "experienceDateBold",
                  !layoutSettings.experienceDateBold,
                )
              }
              className={`flex-1 py-2 px-3 rounded-md border text-xs font-medium transition-all ${
                layoutSettings.experienceDateBold
                  ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                  : "border-border bg-background hover:bg-muted"
              }`}
            >
              Bold
            </button>
            <button
              onClick={() =>
                updateSetting(
                  "experienceDateItalic",
                  !layoutSettings.experienceDateItalic,
                )
              }
              className={`flex-1 py-2 px-3 rounded-md border text-xs font-medium transition-all ${
                layoutSettings.experienceDateItalic
                  ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                  : "border-border bg-background hover:bg-muted"
              }`}
            >
              Italic
            </button>
          </div>
        </SubSectionCard>

        {/* Key Achievements */}
        <SubSectionCard>
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Key Achievements
          </Label>
          <div className="space-y-2">
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
                    updateSetting(
                      "experienceAchievementsListStyle",
                      style.value,
                    )
                  }
                  className={`py-2 px-3 rounded-md border text-xs font-medium transition-all ${
                    (layoutSettings.experienceAchievementsListStyle ||
                      "bullet") === style.value
                      ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                      : "border-border bg-background hover:bg-muted"
                  }`}
                >
                  {style.label}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() =>
                  updateSetting(
                    "experienceAchievementsBold",
                    !layoutSettings.experienceAchievementsBold,
                  )
                }
                className={`flex-1 py-2 px-3 rounded-md border text-xs font-medium transition-all ${
                  layoutSettings.experienceAchievementsBold
                    ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                    : "border-border bg-background hover:bg-muted"
                }`}
              >
                Bold
              </button>
              <button
                onClick={() =>
                  updateSetting(
                    "experienceAchievementsItalic",
                    !layoutSettings.experienceAchievementsItalic,
                  )
                }
                className={`flex-1 py-2 px-3 rounded-md border text-xs font-medium transition-all ${
                  layoutSettings.experienceAchievementsItalic
                    ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                    : "border-border bg-background hover:bg-muted"
                }`}
              >
                Italic
              </button>
            </div>
          </div>
        </SubSectionCard>
      </div>
    </SettingsSection>
  );
}
