import { Label } from "@/components/ui/label";
import { Heart } from "lucide-react";
import React from "react";
import { SettingsSection } from "../SettingsSection";
import { SubSectionCard } from "../SubSectionCard";

import { LayoutSettings, LayoutSettingValue } from "../types";

interface InterestsSettingsProps {
  layoutSettings: LayoutSettings;
  updateSetting: (key: keyof LayoutSettings, value: LayoutSettingValue) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export function InterestsSettings({
  layoutSettings,
  updateSetting,
  isOpen,
  onToggle,
}: InterestsSettingsProps) {
  return (
    <SettingsSection
      title="Interests Style"
      icon={Heart}
      isOpen={isOpen}
      onToggle={onToggle}
    >
      <div className="space-y-4">
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
                onClick={() => updateSetting("interestsListStyle", style.value)}
                className={`py-2 px-3 rounded-md border text-xs font-medium transition-all ${
                  (layoutSettings.interestsListStyle || "bullet") ===
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
            Interest Name
          </Label>
          <div className="flex gap-2">
            <button
              onClick={() =>
                updateSetting(
                  "interestsNameBold",
                  !layoutSettings.interestsNameBold,
                )
              }
              className={`flex-1 py-2 px-3 rounded-md border text-xs font-medium transition-all ${
                layoutSettings.interestsNameBold
                  ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                  : "border-border bg-background hover:bg-muted"
              }`}
            >
              Bold
            </button>
            <button
              onClick={() =>
                updateSetting(
                  "interestsNameItalic",
                  !layoutSettings.interestsNameItalic,
                )
              }
              className={`flex-1 py-2 px-3 rounded-md border text-xs font-medium transition-all ${
                layoutSettings.interestsNameItalic
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
            Keywords
          </Label>
          <div className="flex gap-2">
            <button
              onClick={() =>
                updateSetting(
                  "interestsKeywordsBold",
                  !layoutSettings.interestsKeywordsBold,
                )
              }
              className={`flex-1 py-2 px-3 rounded-md border text-xs font-medium transition-all ${
                layoutSettings.interestsKeywordsBold
                  ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                  : "border-border bg-background hover:bg-muted"
              }`}
            >
              Bold
            </button>
            <button
              onClick={() =>
                updateSetting(
                  "interestsKeywordsItalic",
                  !layoutSettings.interestsKeywordsItalic,
                )
              }
              className={`flex-1 py-2 px-3 rounded-md border text-xs font-medium transition-all ${
                layoutSettings.interestsKeywordsItalic
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
