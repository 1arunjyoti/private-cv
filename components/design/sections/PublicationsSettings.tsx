import { Label } from "@/components/ui/label";
import { BookOpen } from "lucide-react";
import React from "react";
import { SettingsSection } from "../SettingsSection";
import { SubSectionCard } from "../SubSectionCard";

import { LayoutSettings, LayoutSettingValue } from "../types";

interface PublicationsSettingsProps {
  layoutSettings: LayoutSettings;
  updateSetting: (key: keyof LayoutSettings, value: LayoutSettingValue) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export function PublicationsSettings({
  layoutSettings,
  updateSetting,
  isOpen,
  onToggle,
}: PublicationsSettingsProps) {
  return (
    <SettingsSection
      title="Publications Style"
      icon={BookOpen}
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
                  updateSetting("publicationsListStyle", style.value)
                }
                className={`py-2 px-3 rounded-md border text-xs font-medium transition-all ${
                  (layoutSettings.publicationsListStyle || "bullet") ===
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
            Publication Name
          </Label>
          <div className="flex gap-2">
            <button
              onClick={() =>
                updateSetting(
                  "publicationsNameBold",
                  !layoutSettings.publicationsNameBold,
                )
              }
              className={`flex-1 py-2 px-3 rounded-md border text-xs font-medium transition-all ${
                layoutSettings.publicationsNameBold
                  ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                  : "border-border bg-background hover:bg-muted"
              }`}
            >
              Bold
            </button>
            <button
              onClick={() =>
                updateSetting(
                  "publicationsNameItalic",
                  !layoutSettings.publicationsNameItalic,
                )
              }
              className={`flex-1 py-2 px-3 rounded-md border text-xs font-medium transition-all ${
                layoutSettings.publicationsNameItalic
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
            Publisher
          </Label>
          <div className="flex gap-2">
            <button
              onClick={() =>
                updateSetting(
                  "publicationsPublisherBold",
                  !layoutSettings.publicationsPublisherBold,
                )
              }
              className={`flex-1 py-2 px-3 rounded-md border text-xs font-medium transition-all ${
                layoutSettings.publicationsPublisherBold
                  ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                  : "border-border bg-background hover:bg-muted"
              }`}
            >
              Bold
            </button>
            <button
              onClick={() =>
                updateSetting(
                  "publicationsPublisherItalic",
                  !layoutSettings.publicationsPublisherItalic,
                )
              }
              className={`flex-1 py-2 px-3 rounded-md border text-xs font-medium transition-all ${
                layoutSettings.publicationsPublisherItalic
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
                  "publicationsUrlBold",
                  !layoutSettings.publicationsUrlBold,
                )
              }
              className={`flex-1 py-2 px-3 rounded-md border text-xs font-medium transition-all ${
                layoutSettings.publicationsUrlBold
                  ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                  : "border-border bg-background hover:bg-muted"
              }`}
            >
              Bold
            </button>
            <button
              onClick={() =>
                updateSetting(
                  "publicationsUrlItalic",
                  !layoutSettings.publicationsUrlItalic,
                )
              }
              className={`flex-1 py-2 px-3 rounded-md border text-xs font-medium transition-all ${
                layoutSettings.publicationsUrlItalic
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
            Release Date
          </Label>
          <div className="flex gap-2">
            <button
              onClick={() =>
                updateSetting(
                  "publicationsDateBold",
                  !layoutSettings.publicationsDateBold,
                )
              }
              className={`flex-1 py-2 px-3 rounded-md border text-xs font-medium transition-all ${
                layoutSettings.publicationsDateBold
                  ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                  : "border-border bg-background hover:bg-muted"
              }`}
            >
              Bold
            </button>
            <button
              onClick={() =>
                updateSetting(
                  "publicationsDateItalic",
                  !layoutSettings.publicationsDateItalic,
                )
              }
              className={`flex-1 py-2 px-3 rounded-md border text-xs font-medium transition-all ${
                layoutSettings.publicationsDateItalic
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
