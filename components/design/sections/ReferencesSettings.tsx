import { Label } from "@/components/ui/label";
import { Users } from "lucide-react";
import React from "react";
import { SettingsSection } from "../SettingsSection";
import { SubSectionCard } from "../SubSectionCard";

import { LayoutSettings, LayoutSettingValue } from "../types";

interface ReferencesSettingsProps {
  layoutSettings: LayoutSettings;
  updateSetting: (key: keyof LayoutSettings, value: LayoutSettingValue) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export function ReferencesSettings({
  layoutSettings,
  updateSetting,
  isOpen,
  onToggle,
}: ReferencesSettingsProps) {
  return (
    <SettingsSection
      title="References Style"
      icon={Users}
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
                  updateSetting("referencesListStyle", style.value)
                }
                className={`py-2 px-3 rounded-md border text-xs font-medium transition-all ${
                  (layoutSettings.referencesListStyle || "bullet") ===
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
                  "referencesNameBold",
                  !layoutSettings.referencesNameBold,
                )
              }
              className={`flex-1 py-2 px-3 rounded-md border text-xs font-medium transition-all ${
                layoutSettings.referencesNameBold
                  ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                  : "border-border bg-background hover:bg-muted"
              }`}
            >
              Bold
            </button>
            <button
              onClick={() =>
                updateSetting(
                  "referencesNameItalic",
                  !layoutSettings.referencesNameItalic,
                )
              }
              className={`flex-1 py-2 px-3 rounded-md border text-xs font-medium transition-all ${
                layoutSettings.referencesNameItalic
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
            Position
          </Label>
          <div className="flex gap-2">
            <button
              onClick={() =>
                updateSetting(
                  "referencesPositionBold",
                  !layoutSettings.referencesPositionBold,
                )
              }
              className={`flex-1 py-2 px-3 rounded-md border text-xs font-medium transition-all ${
                layoutSettings.referencesPositionBold
                  ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                  : "border-border bg-background hover:bg-muted"
              }`}
            >
              Bold
            </button>
            <button
              onClick={() =>
                updateSetting(
                  "referencesPositionItalic",
                  !layoutSettings.referencesPositionItalic,
                )
              }
              className={`flex-1 py-2 px-3 rounded-md border text-xs font-medium transition-all ${
                layoutSettings.referencesPositionItalic
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
