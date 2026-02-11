import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Heading } from "lucide-react";
import { SettingsSection } from "../SettingsSection";
import { SpacingControl } from "../SpacingControl";

import { LayoutSettings, LayoutSettingValue } from "../types";

interface HeaderSettingsProps {
  layoutSettings: LayoutSettings;
  updateSetting: (key: keyof LayoutSettings, value: LayoutSettingValue) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export function HeaderSettings({
  layoutSettings,
  updateSetting,
  isOpen,
  onToggle,
}: HeaderSettingsProps) {
  return (
    <SettingsSection
      title="Header"
      icon={Heading}
      isOpen={isOpen}
      onToggle={onToggle}
    >
      {/* Header Position */}
      <div className="space-y-3">
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Position
        </Label>
        <div className="flex gap-2">
          {[
            { value: "top", label: "Middle" },
            { value: "left", label: "Left" },
            { value: "right", label: "Right" },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => updateSetting("headerPosition", option.value)}
              className={`flex flex-col items-center gap-2 p-2 rounded-lg border transition-all hover:bg-accent flex-1 ${
                (layoutSettings.headerPosition || "top") === option.value
                  ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                  : "border-border bg-transparent hover:border-primary/30"
              }`}
            >
              <div className="h-8 w-10 rounded bg-muted/80 border flex overflow-hidden shadow-inner p-0.5">
                {option.value === "top" && (
                  <div className="w-full h-full flex flex-col gap-0.5">
                    <div className="h-2 bg-foreground/20 w-full rounded-[1px]" />
                    <div className="flex-1 bg-background rounded-[1px]" />
                  </div>
                )}
                {option.value === "left" && (
                  <div className="w-full h-full flex gap-0.5">
                    <div className="w-2.5 bg-foreground/20 h-full rounded-[1px]" />
                    <div className="flex-1 bg-background rounded-[1px]" />
                  </div>
                )}
                {option.value === "right" && (
                  <div className="w-full h-full flex gap-0.5">
                    <div className="flex-1 bg-background rounded-[1px]" />
                    <div className="w-2.5 bg-foreground/20 h-full rounded-[1px]" />
                  </div>
                )}
              </div>
              <span className="text-xs font-medium">{option.label}</span>
            </button>
          ))}
        </div>
        <br />
        <SpacingControl
          label="Space below header"
          value={layoutSettings.headerBottomMargin || 10}
          unit="px"
          min={0}
          max={60}
          step={2}
          onChange={(val) => updateSetting("headerBottomMargin", val)}
        />
      </div>

      <Separator />

      {/* Profile Photo Settings */}
      <div className="space-y-4">
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Profile Photo
        </Label>

        {/* Photo Position */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground">
            Position in Header
          </Label>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                { value: "left", label: "Left" },
                { value: "right", label: "Right" },
              ] as const
            ).map((option) => (
              <button
                key={option.value}
                onClick={() =>
                  updateSetting("profilePhotoPosition", option.value)
                }
                className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-all hover:bg-accent ${
                  (layoutSettings.profilePhotoPosition || "right") ===
                  option.value
                    ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                    : "border-border bg-transparent hover:border-primary/30"
                }`}
              >
                <div className="h-8 w-14 rounded bg-muted/80 border flex items-center gap-1 p-1">
                  {option.value === "left" ? (
                    <>
                      <div className="w-4 h-4 rounded-full bg-foreground/30 shrink-0" />
                      <div className="flex-1 flex flex-col gap-0.5">
                        <div className="h-1 w-full bg-foreground/20 rounded-sm" />
                        <div className="h-1 w-3/4 bg-foreground/10 rounded-sm" />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex-1 flex flex-col gap-0.5">
                        <div className="h-1 w-full bg-foreground/20 rounded-sm" />
                        <div className="h-1 w-3/4 bg-foreground/10 rounded-sm" />
                      </div>
                      <div className="w-4 h-4 rounded-full bg-foreground/30 shrink-0" />
                    </>
                  )}
                </div>
                <span className="text-xs font-medium">{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Photo Shape */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground">
            Shape
          </Label>
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                { value: "circle", label: "Circle" },
                { value: "rounded", label: "Rounded" },
                { value: "square", label: "Square" },
              ] as const
            ).map((option) => (
              <button
                key={option.value}
                onClick={() => updateSetting("profilePhotoShape", option.value)}
                className={`flex flex-col items-center gap-2 p-2 rounded-lg border transition-all hover:bg-accent ${
                  (layoutSettings.profilePhotoShape || "circle") ===
                  option.value
                    ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                    : "border-border bg-transparent hover:border-primary/30"
                }`}
              >
                <div
                  className={`w-6 h-6 bg-foreground/30 ${
                    option.value === "circle"
                      ? "rounded-full"
                      : option.value === "rounded"
                        ? "rounded-md"
                        : "rounded-none"
                  }`}
                />
                <span className="text-xs font-medium">{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Photo Size */}
        <SpacingControl
          label="Photo Size"
          value={layoutSettings.profilePhotoSize || 80}
          unit="pt"
          min={40}
          max={150}
          step={5}
          onChange={(val) => updateSetting("profilePhotoSize", val)}
        />

        {/* Border Toggle */}
        <div className="flex items-center space-x-2 pt-2">
          <Switch
            id="photo-border"
            checked={layoutSettings.profilePhotoBorder || false}
            onCheckedChange={(checked) =>
              updateSetting("profilePhotoBorder", checked)
            }
          />
          <Label htmlFor="photo-border" className="text-xs font-medium">
            Show border around photo
          </Label>
        </div>
      </div>

      <Separator />

      {/* Name Section */}
      <div className="space-y-4">
        <div className="space-y-3">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Name Typography
          </Label>
          <div className="flex gap-2 mb-4">
            <button
              onClick={() =>
                updateSetting("nameBold", !layoutSettings.nameBold)
              }
              className={`px-3 h-8 rounded-md border flex items-center justify-center transition-all text-xs font-medium w-full ${
                layoutSettings.nameBold
                  ? "bg-accent border-accent-foreground/20 text-accent-foreground font-bold"
                  : "border-border bg-background text-muted-foreground"
              }`}
            >
              Bold
            </button>
            <button
              onClick={() =>
                updateSetting("nameItalic", !layoutSettings.nameItalic)
              }
              className={`px-3 h-8 rounded-md border flex items-center justify-center transition-all text-xs font-medium w-full ${
                layoutSettings.nameItalic
                  ? "bg-accent border-accent-foreground/20 text-accent-foreground font-bold italic"
                  : "border-border bg-background text-muted-foreground italic"
              }`}
            >
              Italic
            </button>
          </div>

          <SpacingControl
            label="Font Size"
            value={layoutSettings.nameFontSize || 28}
            unit="pt"
            min={10}
            max={60}
            step={2}
            onChange={(val) => updateSetting("nameFontSize", val)}
          />

          <SpacingControl
            label="Line Height"
            value={layoutSettings.nameLineHeight || 1.2}
            min={0.8}
            max={2.0}
            step={0.05}
            decimals={2}
            onChange={(val) => updateSetting("nameLineHeight", val)}
          />
        </div>

        <Separator />

        <div className="space-y-3">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Title & Contact
          </Label>
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <SpacingControl
                label="Title Font Size"
                value={layoutSettings.titleFontSize || 14}
                unit="pt"
                min={10}
                max={40}
                step={1}
                onChange={(val) => updateSetting("titleFontSize", val)}
              />
            </div>
            <div className="flex gap-1">
              <button
                onClick={() =>
                  updateSetting("titleBold", !layoutSettings.titleBold)
                }
                className={`h-8 w-8 rounded-md border flex items-center justify-center transition-all text-xs font-medium ${
                  layoutSettings.titleBold
                    ? "bg-accent border-accent-foreground/20 text-accent-foreground font-bold"
                    : "border-border bg-background text-muted-foreground"
                }`}
                title="Bold"
              >
                B
              </button>
              <button
                onClick={() =>
                  updateSetting("titleItalic", !layoutSettings.titleItalic)
                }
                className={`h-8 w-8 rounded-md border flex items-center justify-center transition-all text-xs font-medium ${
                  layoutSettings.titleItalic
                    ? "bg-accent border-accent-foreground/20 text-accent-foreground font-bold italic"
                    : "border-border bg-background text-muted-foreground italic"
                }`}
                title="Italic"
              >
                I
              </button>
            </div>
          </div>
          <SpacingControl
            label="Line Height"
            value={layoutSettings.titleLineHeight || 1.2}
            min={0.8}
            max={2.0}
            step={0.05}
            decimals={2}
            onChange={(val) => updateSetting("titleLineHeight", val)}
          />
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <SpacingControl
                label="Contact Font Size"
                value={layoutSettings.contactFontSize || 10}
                unit="pt"
                min={8}
                max={20}
                step={0.5}
                decimals={1}
                onChange={(val) => updateSetting("contactFontSize", val)}
              />
            </div>
            <div className="flex gap-1">
              <button
                onClick={() =>
                  updateSetting("contactBold", !layoutSettings.contactBold)
                }
                className={`h-8 w-8 rounded-md border flex items-center justify-center transition-all text-xs font-medium ${
                  layoutSettings.contactBold
                    ? "bg-accent border-accent-foreground/20 text-accent-foreground font-bold"
                    : "border-border bg-background text-muted-foreground"
                }`}
                title="Bold"
              >
                B
              </button>
              <button
                onClick={() =>
                  updateSetting("contactItalic", !layoutSettings.contactItalic)
                }
                className={`h-8 w-8 rounded-md border flex items-center justify-center transition-all text-xs font-medium ${
                  layoutSettings.contactItalic
                    ? "bg-accent border-accent-foreground/20 text-accent-foreground font-bold italic"
                    : "border-border bg-background text-muted-foreground italic"
                }`}
                title="Italic"
              >
                I
              </button>
            </div>
          </div>
          {/* Contact Line Height */}
          <div className="flex-1">
            <SpacingControl
              label="Line Height"
              value={layoutSettings.contactLineHeight || 1.2}
              min={0.8}
              max={2.0}
              step={0.05}
              decimals={2}
              onChange={(val) => updateSetting("contactLineHeight", val)}
            />
          </div>

          {/* Contact Layout & Style */}
          <div className="space-y-4">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Contact Layout
            </Label>

            <div className="grid grid-cols-2 gap-3">
              {[1, 2].map((arrangement) => (
                <button
                  key={arrangement}
                  onClick={() =>
                    updateSetting(
                      "personalDetailsArrangement",
                      arrangement as 1 | 2,
                    )
                  }
                  className={`flex items-center justify-center p-3 rounded-lg border transition-all hover:bg-muted/50 ${
                    (layoutSettings.personalDetailsArrangement || 1) ===
                    arrangement
                      ? "border-primary bg-accent"
                      : "border-border bg-card"
                  }`}
                >
                  {arrangement === 1 && (
                    <div className="flex flex-wrap gap-1 justify-center w-full scale-75">
                      <div className="h-2 w-8 bg-foreground/20 rounded-full" />
                      <div className="h-2 w-8 bg-foreground/20 rounded-full" />
                      <div className="h-2 w-8 bg-foreground/20 rounded-full" />
                    </div>
                  )}
                  {arrangement === 2 && (
                    <div className="flex flex-col gap-1 w-full items-start scale-75 pl-4">
                      <div className="h-2 w-20 bg-foreground/20 rounded-full" />
                      <div className="h-2 w-20 bg-foreground/20 rounded-full" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">
                Separator Style
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { value: "pipe", label: "| (pipe)" },
                    { value: "dash", label: "- (dash)" },
                    { value: "comma", label: ", (comma)" },
                  ] as const
                ).map((option) => (
                  <button
                    key={option.value}
                    onClick={() =>
                      updateSetting("contactSeparator", option.value)
                    }
                    className={`h-8 rounded-md border text-xs font-medium transition-all ${
                      (layoutSettings.contactSeparator || "pipe") ===
                      option.value
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background hover:bg-muted"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1">
              <SpacingControl
                label="Separator Gap"
                value={layoutSettings.contactSeparatorGap || 4}
                unit="px"
                min={1}
                max={20}
                step={1}
                onChange={(val) => updateSetting("contactSeparatorGap", val)}
              />
            </div>
          </div>

          {/* Link Display Style */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">
              Link Style
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => updateSetting("linkShowFullUrl", false)}
                className={`flex items-center justify-center p-2 rounded-md border transition-all text-xs font-medium ${
                  !layoutSettings.linkShowFullUrl
                    ? "border-primary bg-primary/5 ring-1 ring-primary/20 text-primary"
                    : "border-border bg-transparent hover:border-primary/30"
                }`}
              >
                Short (Username)
              </button>
              <button
                onClick={() => updateSetting("linkShowFullUrl", true)}
                className={`flex items-center justify-center p-2 rounded-md border transition-all text-xs font-medium ${
                  layoutSettings.linkShowFullUrl
                    ? "border-primary bg-primary/5 ring-1 ring-primary/20 text-primary"
                    : "border-border bg-transparent hover:border-primary/30"
                }`}
              >
                Full (URL)
              </button>
            </div>
          </div>
        </div>
      </div>
    </SettingsSection>
  );
}
