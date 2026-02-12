import { Label } from "@/components/ui/label";
import { Heading2 } from "lucide-react";
import React from "react";
import { SettingsSection } from "../SettingsSection";
import { SubSectionCard } from "../SubSectionCard";

import { LayoutSettings, LayoutSettingValue } from "../types";

interface SectionHeadingSettingsProps {
  layoutSettings: LayoutSettings;
  updateSetting: (key: keyof LayoutSettings, value: LayoutSettingValue) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export function SectionHeadingSettings({
  layoutSettings,
  updateSetting,
  isOpen,
  onToggle,
}: SectionHeadingSettingsProps) {
  return (
    <SettingsSection
      title="Section Headings"
      icon={Heading2}
      isOpen={isOpen}
      onToggle={onToggle}
    >
      <div className="space-y-6">
        {/* Style */}
        <SubSectionCard>
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Display Style
          </Label>
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((style) => (
              <button
                key={style}
                onClick={() => updateSetting("sectionHeadingStyle", style)}
                className={`py-2 px-3 rounded-md border text-xs font-medium transition-all ${
                  (layoutSettings.sectionHeadingStyle || 1) === style
                    ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                    : "border-border bg-background hover:bg-muted"
                }`}
              >
                Style {style}
              </button>
            ))}
          </div>
        </SubSectionCard>

        {/* Alignment */}
        <SubSectionCard>
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Alignment
          </Label>
          <div className="flex gap-2">
            {(
              [
                { value: "left", label: "Left" },
                { value: "center", label: "Center" },
                { value: "right", label: "Right" },
              ] as const
            ).map((align) => (
              <button
                key={align.value}
                onClick={() =>
                  updateSetting("sectionHeadingAlign", align.value)
                }
                className={`flex-1 py-2 px-3 rounded-md border text-xs font-medium transition-all ${
                  (layoutSettings.sectionHeadingAlign || "left") === align.value
                    ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                    : "border-border bg-background hover:bg-muted"
                }`}
              >
                {align.label}
              </button>
            ))}
          </div>
        </SubSectionCard>

        {/* Typography */}
        <SubSectionCard>
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Typography
          </Label>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() =>
                  updateSetting(
                    "sectionHeadingBold",
                    !layoutSettings.sectionHeadingBold,
                  )
                }
                className={`py-2 px-3 rounded-md border text-xs font-medium transition-all ${
                  layoutSettings.sectionHeadingBold
                    ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                    : "border-border bg-background hover:bg-muted"
                }`}
              >
                Bold
              </button>
              <button
                onClick={() =>
                  updateSetting(
                    "sectionHeadingCapitalization",
                    layoutSettings.sectionHeadingCapitalization === "uppercase"
                      ? "capitalize"
                      : "uppercase",
                  )
                }
                className={`py-2 px-3 rounded-md border text-xs font-medium transition-all ${
                  layoutSettings.sectionHeadingCapitalization === "uppercase"
                    ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                    : "border-border bg-background hover:bg-muted"
                }`}
              >
                Uppercase
              </button>
            </div>

            <div className="space-y-2">
              <Label className="text-[11px] text-muted-foreground">
                Heading Size
              </Label>
              <div className="flex gap-2">
                {(["S", "M", "L", "XL"] as const).map((size) => (
                  <button
                    key={size}
                    onClick={() => updateSetting("sectionHeadingSize", size)}
                    className={`flex-1 py-1.5 px-2 rounded-md border text-[10px] font-bold transition-all ${
                      (layoutSettings.sectionHeadingSize || "M") === size
                        ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                        : "border-border bg-background hover:bg-muted"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </SubSectionCard>

        {/* Icons */}
        <SubSectionCard>
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Icons
          </Label>
          <div className="flex gap-2">
            {(
              [
                { value: "none", label: "None" },
                { value: "outline", label: "Outline" },
                { value: "filled", label: "Filled" },
              ] as const
            ).map((style) => (
              <button
                key={style.value}
                onClick={() =>
                  updateSetting("sectionHeadingIcons", style.value)
                }
                className={`flex-1 py-2 px-3 rounded-md border text-xs font-medium transition-all ${
                  (layoutSettings.sectionHeadingIcons || "none") === style.value
                    ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                    : "border-border bg-background hover:bg-muted"
                }`}
              >
                {style.label}
              </button>
            ))}
          </div>
        </SubSectionCard>

        {/* Visible Headings */}
        <div className="space-y-3 mt-4 pt-4 border-t">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Visible Headings
          </Label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Summary", key: "summaryHeadingVisible" },
              { label: "Experience", key: "workHeadingVisible" },
              { label: "Education", key: "educationHeadingVisible" },
              { label: "Skills", key: "skillsHeadingVisible" },
              { label: "Projects", key: "projectsHeadingVisible" },
              { label: "Awards", key: "awardsHeadingVisible" },
              { label: "Certifications", key: "certificatesHeadingVisible" },
              { label: "Languages", key: "languagesHeadingVisible" },
              { label: "Interests", key: "interestsHeadingVisible" },
              { label: "Publications", key: "publicationsHeadingVisible" },
              { label: "References", key: "referencesHeadingVisible" },
              { label: "Custom", key: "customHeadingVisible" },
            ].map((item) => (
              <button
                key={item.key}
                onClick={() =>
                  updateSetting(
                    item.key as keyof LayoutSettings,
                    !(layoutSettings[item.key as keyof LayoutSettings] ?? true),
                  )
                }
                className={`flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium border transition-all ${
                  (layoutSettings[item.key as keyof LayoutSettings] ?? true)
                    ? "border-primary/50 bg-primary/5 text-primary"
                    : "border-border bg-background text-muted-foreground hover:bg-muted"
                }`}
              >
                <span>{item.label}</span>
                <div
                  className={`w-2 h-2 rounded-full ${
                    (layoutSettings[item.key as keyof LayoutSettings] ?? true)
                      ? "bg-primary"
                      : "bg-muted-foreground/30"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </SettingsSection>
  );
}
