import { LayoutList } from "lucide-react";
import React from "react";
import { SettingsSection } from "../SettingsSection";
import { SpacingControl } from "../SpacingControl";
import { SubSectionCard } from "../SubSectionCard";
import { LayoutSettings, LayoutSettingValue } from "../types";

interface TypographySettingsProps {
  layoutSettings: LayoutSettings;
  updateSetting: (key: keyof LayoutSettings, value: LayoutSettingValue) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export function TypographySettings({
  layoutSettings,
  updateSetting,
  isOpen,
  onToggle,
}: TypographySettingsProps) {
  return (
    <SettingsSection
      title="Typography & Spacing"
      icon={LayoutList}
      isOpen={isOpen}
      onToggle={onToggle}
    >
      <div className="space-y-4">
        <SubSectionCard>
          <div className="space-y-2">
            <label className="text-xs font-medium">Font Family</label>
            <select
              className="w-full h-8 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={layoutSettings.fontFamily || "Open Sans"}
              onChange={(e) => updateSetting("fontFamily", e.target.value)}
            >
              <option value="Roboto">Roboto</option>
              <option value="Open Sans">Open Sans</option>
              <option value="Lato">Lato</option>
              <option value="Montserrat">Montserrat</option>
              <option value="Times-Roman">Times New Roman</option>
              <option value="Helvetica">Helvetica</option>
              <option value="Courier">Courier</option>
            </select>
          </div>
        </SubSectionCard>

        <SubSectionCard>
          <SpacingControl
            label="Body Font Size"
            value={layoutSettings.fontSize}
            unit="pt"
            min={7}
            max={12}
            step={0.5}
            decimals={1}
            onChange={(val) => updateSetting("fontSize", val)}
          />
          <SpacingControl
            label="Body Line Height"
            value={layoutSettings.lineHeight}
            min={1.0}
            max={2.0}
            step={0.05}
            decimals={2}
            onChange={(val) => updateSetting("lineHeight", val)}
          />
        </SubSectionCard>

        <SubSectionCard>
          <SpacingControl
            label="Left/Right Margins"
            value={layoutSettings.marginHorizontal || 15}
            unit="mm"
            min={5}
            max={30}
            step={1}
            onChange={(val) => updateSetting("marginHorizontal", val)}
          />
          <SpacingControl
            label="Top/Bottom Margins"
            value={layoutSettings.marginVertical || 15}
            unit="mm"
            min={5}
            max={30}
            step={1}
            onChange={(val) => updateSetting("marginVertical", val)}
          />
        </SubSectionCard>

        <SubSectionCard>
          <SpacingControl
            label="Section Spacing"
            value={layoutSettings.sectionMargin}
            unit="px"
            min={0}
            max={32}
            step={2}
            onChange={(val) => updateSetting("sectionMargin", val)}
          />
        </SubSectionCard>
      </div>
    </SettingsSection>
  );
}
