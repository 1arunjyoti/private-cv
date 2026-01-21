import { Label } from "@/components/ui/label";
import { Wrench } from "lucide-react";
import React from "react";
import { SettingsSection } from "../SettingsSection";

import { LayoutSettings, LayoutSettingValue } from "../types";

interface SkillsSettingsProps {
  layoutSettings: LayoutSettings;
  updateSetting: (key: keyof LayoutSettings, value: LayoutSettingValue) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export function SkillsSettings({
  layoutSettings,
  updateSetting,
  isOpen,
  onToggle,
}: SkillsSettingsProps) {
  return (
    <SettingsSection
      title="Skills Style"
      icon={Wrench}
      isOpen={isOpen}
      onToggle={onToggle}
    >
      <div className="space-y-4">
        <div className="space-y-3">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            List Style
          </Label>
          <div className="grid grid-cols-4 gap-2">
            {(
              [
                { value: "blank", label: "Blank" },
                { value: "bullet", label: "•" },
                { value: "dash", label: "-" },
                { value: "number", label: "Number" },
                { value: "inline", label: "Inline" },
              ] as const
            ).map((style) => (
              <button
                key={style.value}
                onClick={() => updateSetting("skillsListStyle", style.value)}
                className={`py-2 px-3 rounded-md border text-xs font-medium transition-all ${
                  (layoutSettings.skillsListStyle || "bullet") === style.value
                    ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                    : "border-border bg-background hover:bg-muted"
                }`}
              >
                {style.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Level Indicator
          </Label>
          <div className="grid grid-cols-4 gap-2">
            {[0, 1, 3, 4].map((levelStyle) => (
              <button
                key={levelStyle}
                onClick={() =>
                  updateSetting("skillsLevelStyle", levelStyle as 0 | 1 | 3 | 4)
                }
                className={`flex items-center justify-center p-2 rounded-lg border transition-all hover:bg-muted/50 ${
                  (layoutSettings.skillsLevelStyle || 0) === levelStyle
                    ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                    : "border-border bg-transparent hover:border-primary/30"
                }`}
              >
                {levelStyle === 0 && <span className="text-xs">None</span>}
                {levelStyle > 0 && (
                  <div className="flex gap-0.5 items-end h-3">
                    {[1, 2, 3, 4]
                      .slice(0, levelStyle === 4 ? 1 : levelStyle + 1)
                      .map((i) =>
                        levelStyle === 4 ? (
                          <span key={i} className="text-xs leading-none">
                            Text
                          </span>
                        ) : (
                          <div
                            key={i}
                            className={`w-1 rounded-sm ${
                              levelStyle === 1 || levelStyle === 3 // Dots or Signal (active color)
                                ? "bg-primary"
                                : "bg-current opacity-40"
                            }`}
                            style={{
                              height:
                                levelStyle === 3 ? `${i * 2 + 3}px` : "4px", // Signal grows, Dots fixed
                              width: levelStyle === 1 ? "4px" : "4px",
                              borderRadius: levelStyle === 1 ? "50%" : "1px",
                            }}
                          />
                        ),
                      )}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </SettingsSection>
  );
}
