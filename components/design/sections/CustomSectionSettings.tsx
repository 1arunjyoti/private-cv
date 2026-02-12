import { Label } from "@/components/ui/label";
import { Wrench } from "lucide-react";
import React from "react";
import { SettingsSection } from "../SettingsSection";
import { SubSectionCard } from "../SubSectionCard";

import { LayoutSettings, LayoutSettingValue } from "../types";

interface CustomSectionSettingsProps {
  layoutSettings: LayoutSettings;
  updateSetting: (key: keyof LayoutSettings, value: LayoutSettingValue) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export function CustomSectionSettings({
  layoutSettings,
  updateSetting,
  isOpen,
  onToggle,
}: CustomSectionSettingsProps) {
  return (
    <SettingsSection
      title="Custom Section Style"
      icon={Wrench}
      isOpen={isOpen}
      onToggle={onToggle}
    >
      <div className="space-y-6">
        <SubSectionCard>
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            List Style
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
                  updateSetting("customSectionListStyle", style.value)
                }
                className={`py-2 px-3 rounded-md border text-xs font-medium transition-all ${
                  (layoutSettings.customSectionListStyle || "bullet") ===
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

        <SubSectionCard>
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Name
          </Label>
          <div className="flex gap-2">
            <button
              onClick={() =>
                updateSetting(
                  "customSectionNameBold",
                  !layoutSettings.customSectionNameBold,
                )
              }
              className={`flex-1 py-2 px-3 rounded-md border text-xs font-medium transition-all ${
                layoutSettings.customSectionNameBold
                  ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                  : "border-border bg-background hover:bg-muted"
              }`}
            >
              Bold
            </button>
            <button
              onClick={() =>
                updateSetting(
                  "customSectionNameItalic",
                  !layoutSettings.customSectionNameItalic,
                )
              }
              className={`flex-1 py-2 px-3 rounded-md border text-xs font-medium transition-all ${
                layoutSettings.customSectionNameItalic
                  ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                  : "border-border bg-background hover:bg-muted"
              }`}
            >
              Italic
            </button>
          </div>
        </SubSectionCard>

        <SubSectionCard>
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Subtitle
          </Label>
          <div className="flex gap-2">
            <button
              onClick={() =>
                updateSetting(
                  "customSectionDescriptionBold",
                  !layoutSettings.customSectionDescriptionBold,
                )
              }
              className={`flex-1 py-2 px-3 rounded-md border text-xs font-medium transition-all ${
                layoutSettings.customSectionDescriptionBold
                  ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                  : "border-border bg-background hover:bg-muted"
              }`}
            >
              Bold
            </button>
            <button
              onClick={() =>
                updateSetting(
                  "customSectionDescriptionItalic",
                  !layoutSettings.customSectionDescriptionItalic,
                )
              }
              className={`flex-1 py-2 px-3 rounded-md border text-xs font-medium transition-all ${
                layoutSettings.customSectionDescriptionItalic
                  ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                  : "border-border bg-background hover:bg-muted"
              }`}
            >
              Italic
            </button>
          </div>
        </SubSectionCard>

        <SubSectionCard>
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Date
          </Label>
          <div className="flex gap-2">
            <button
              onClick={() =>
                updateSetting(
                  "customSectionDateBold",
                  !layoutSettings.customSectionDateBold,
                )
              }
              className={`flex-1 py-2 px-3 rounded-md border text-xs font-medium transition-all ${
                layoutSettings.customSectionDateBold
                  ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                  : "border-border bg-background hover:bg-muted"
              }`}
            >
              Bold
            </button>
            <button
              onClick={() =>
                updateSetting(
                  "customSectionDateItalic",
                  !layoutSettings.customSectionDateItalic,
                )
              }
              className={`flex-1 py-2 px-3 rounded-md border text-xs font-medium transition-all ${
                layoutSettings.customSectionDateItalic
                  ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                  : "border-border bg-background hover:bg-muted"
              }`}
            >
              Italic
            </button>
          </div>
        </SubSectionCard>

        <SubSectionCard>
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            URL
          </Label>
          <div className="flex gap-2">
            <button
              onClick={() =>
                updateSetting(
                  "customSectionUrlBold",
                  !layoutSettings.customSectionUrlBold,
                )
              }
              className={`flex-1 py-2 px-3 rounded-md border text-xs font-medium transition-all ${
                layoutSettings.customSectionUrlBold
                  ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                  : "border-border bg-background hover:bg-muted"
              }`}
            >
              Bold
            </button>
            <button
              onClick={() =>
                updateSetting(
                  "customSectionUrlItalic",
                  !layoutSettings.customSectionUrlItalic,
                )
              }
              className={`flex-1 py-2 px-3 rounded-md border text-xs font-medium transition-all ${
                layoutSettings.customSectionUrlItalic
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
