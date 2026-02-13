import { Label } from "@/components/ui/label";
import { AlignLeft } from "lucide-react";
import React from "react";
import { SettingsSection } from "../SettingsSection";
import { SubSectionCard } from "../SubSectionCard";

import { LayoutSettings, LayoutSettingValue } from "../types";

interface EntryLayoutSettingsProps {
  layoutSettings: LayoutSettings;
  updateSetting: (key: keyof LayoutSettings, value: LayoutSettingValue) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export function EntryLayoutSettings({
  layoutSettings,
  updateSetting,
  isOpen,
  onToggle,
}: EntryLayoutSettingsProps) {
  return (
    <SettingsSection
      title="Entry Layouts"
      icon={AlignLeft}
      isOpen={isOpen}
      onToggle={onToggle}
    >
      <div className="space-y-4">
        {/* Entry Style */}
        <SubSectionCard>
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Layout Variation
          </Label>
          <div className="grid grid-cols-1 gap-2">
            {[1, 2, 3, 5].map((style) => (
              <button
                key={style}
                onClick={() => updateSetting("entryLayoutStyle", style)}
                className={`flex flex-col gap-1.5 p-3 rounded-lg border-2 transition-all text-left ${
                  (layoutSettings.entryLayoutStyle || 1) === style
                    ? "border-primary bg-accent"
                    : "border-transparent bg-muted/20 hover:border-border hover:bg-muted/40"
                }`}
              >
                <div className="flex items-center justify-between w-full gap-2">
                  <span className="text-xs font-semibold">
                    {style === 1 && "Standard"}
                    {style === 2 && "Inline"}
                    {style === 3 && "Timeline"}
                    {style === 5 && "Compact"}
                  </span>
                </div>

                {/* Visual Preview */}
                <div className="w-full opacity-80 pointer-events-none select-none">
                  {/* Style 1: Title...Date / Subtitle */}
                  {style === 1 && (
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between items-center">
                        <div className="h-1.5 w-1/3 bg-foreground/80 rounded-sm" />
                        <div className="h-1.5 w-1/5 bg-foreground/50 rounded-sm" />
                      </div>
                      <div className="h-1.5 w-1/2 bg-foreground/60 rounded-sm" />
                    </div>
                  )}

                  {/* Style 2: Title | Subtitle | Date... */}
                  {style === 2 && (
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-1/4 bg-foreground/80 rounded-sm" />
                      <div className="h-px bg-border w-2" />
                      <div className="h-1.5 w-1/4 bg-foreground/60 rounded-sm" />
                      <div className="h-px bg-border w-2" />
                      <div className="h-1.5 w-1/5 bg-foreground/50 rounded-sm" />
                    </div>
                  )}

                  {/* Style 3: Timeline */}
                  {style === 3 && (
                    <div className="flex gap-2">
                      {/* Date Column */}
                      <div className="w-[20%] flex justify-end pt-0.5">
                        <div className="h-1.5 w-full bg-foreground/50 rounded-sm" />
                      </div>
                      {/* Line Column */}
                      <div className="relative w-2 flex flex-col items-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-foreground/80 z-10" />
                        <div className="w-px h-4 bg-border absolute top-1.5" />
                      </div>
                      {/* Content Column */}
                      <div className="flex-1 flex flex-col gap-1">
                        <div className="h-1.5 w-3/4 bg-foreground/80 rounded-sm" />
                        <div className="h-1.5 w-1/2 bg-foreground/60 rounded-sm" />
                      </div>
                    </div>
                  )}

                  {/* Style 4: Removed (Stacked) */}

                  {/* Style 5: Title - Subtitle (Date) */}
                  {style === 5 && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 w-3/4">
                        <div className="h-1.5 w-1/3 bg-foreground/80 rounded-sm" />
                        <div className="text-[8px] opacity-50">-</div>
                        <div className="h-1.5 w-1/3 bg-foreground/60 rounded-sm" />
                      </div>
                      <div className="h-1.5 w-1/6 bg-foreground/50 rounded-sm" />
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </SubSectionCard>
      </div>
    </SettingsSection>
  );
}
