import { Label } from "@/components/ui/label";
import { THEME_COLORS } from "@/lib/constants";
import { Palette } from "lucide-react";
import React from "react";
import { SettingsSection } from "../SettingsSection";

import { LayoutSettings, LayoutSettingValue } from "../types";

interface ThemeSettingsProps {
  layoutSettings: LayoutSettings;
  currentThemeColor: string;
  updateSetting: (key: keyof LayoutSettings, value: LayoutSettingValue) => void;
  updateThemeColor: (color: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export function ThemeSettings({
  layoutSettings,
  currentThemeColor,
  updateSetting,
  updateThemeColor,
  isOpen,
  onToggle,
}: ThemeSettingsProps) {
  return (
    <SettingsSection
      title="Accent Color"
      icon={Palette}
      isOpen={isOpen}
      onToggle={onToggle}
    >
      <div className="space-y-4">
        <div className="flex gap-4">
          {THEME_COLORS.map((color) => (
            <button
              key={color.value}
              onClick={() => updateThemeColor(color.value)}
              className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
                currentThemeColor === color.value
                  ? "ring-2 ring-offset-2 ring-primary scale-110"
                  : "hover:scale-105 border-border"
              }`}
              style={{ backgroundColor: color.value }}
              title={color.name}
            >
              {currentThemeColor === color.value && (
                <div className="w-2 h-2 bg-white rounded-full shadow-sm" />
              )}
            </button>
          ))}
          <div className="col-span-1 relative flex items-center justify-center">
            <input
              type="color"
              value={currentThemeColor || "#000000"}
              onChange={(e) => updateThemeColor(e.target.value)}
              className="w-8 h-8 rounded-full cursor-pointer opacity-0 absolute top-0 left-0 z-10"
            />
          </div>
        </div>

        <div className="bg-muted/30 p-3 rounded-lg border space-y-3">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Apply Color To
          </Label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: "name", label: "Name" },
              { id: "title", label: "Prof. Title" },
              { id: "headings", label: "Headings" },
              { id: "links", label: "Links" },
              { id: "decorations", label: "Decorations" },
            ].map((item) => {
              const targets = layoutSettings.themeColorTarget || [
                "headings",
                "links",
                "icons",
                "decorations",
              ];
              const isChecked = targets.includes(item.id);

              return (
                <div key={item.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`target-${item.id}`}
                    checked={isChecked}
                    onChange={(e) => {
                      const newTargets = e.target.checked
                        ? [...targets, item.id]
                        : targets.filter((t: string) => t !== item.id);
                      updateSetting("themeColorTarget", newTargets);
                    }}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label
                    htmlFor={`target-${item.id}`}
                    className="text-xs text-foreground cursor-pointer select-none"
                  >
                    {item.label}
                  </label>
                </div>
              );
            })}
          </div>
        </div>

        {/* Link Display Options */}
        <div className="bg-muted/30 p-3 rounded-lg border space-y-3">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Link Display
          </Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="linkShowIcon"
                checked={layoutSettings.linkShowIcon || false}
                onChange={(e) =>
                  updateSetting("linkShowIcon", e.target.checked)
                }
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label
                htmlFor="linkShowIcon"
                className="text-xs text-foreground cursor-pointer select-none"
              >
                Show link icon (🔗)
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="linkShowFullUrl"
                checked={layoutSettings.linkShowFullUrl || false}
                onChange={(e) =>
                  updateSetting("linkShowFullUrl", e.target.checked)
                }
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label
                htmlFor="linkShowFullUrl"
                className="text-xs text-foreground cursor-pointer select-none"
              >
                Show full URL
              </label>
            </div>
          </div>
        </div>
      </div>
    </SettingsSection>
  );
}
