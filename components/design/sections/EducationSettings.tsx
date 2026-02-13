import { Label } from "@/components/ui/label";
import { GraduationCap } from "lucide-react";
import React from "react";
import { SettingsSection } from "../SettingsSection";
import { SubSectionCard } from "../SubSectionCard";

import { LayoutSettings, LayoutSettingValue } from "../types";

interface EducationSettingsProps {
  layoutSettings: LayoutSettings;
  updateSetting: (key: keyof LayoutSettings, value: LayoutSettingValue) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export function EducationSettings({
  layoutSettings,
  updateSetting,
  isOpen,
  onToggle,
}: EducationSettingsProps) {
  return (
    <SettingsSection
      title="Education Style"
      icon={GraduationCap}
      isOpen={isOpen}
      onToggle={onToggle}
    >
      <div className="space-y-6">
        {/* Institution Name */}
        <SubSectionCard>
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Institution Name
          </Label>
          <div className="space-y-2">
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
                    updateSetting("educationInstitutionListStyle", style.value)
                  }
                  className={`py-2 px-3 rounded-md border text-xs font-medium transition-all ${
                    (layoutSettings.educationInstitutionListStyle || "none") ===
                    style.value
                      ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                      : "border-border bg-background hover:bg-muted"
                  }`}
                >
                  {style.label}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() =>
                  updateSetting(
                    "educationInstitutionBold",
                    !layoutSettings.educationInstitutionBold,
                  )
                }
                className={`flex-1 py-2 px-3 rounded-md border text-xs font-medium transition-all ${
                  layoutSettings.educationInstitutionBold
                    ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                    : "border-border bg-background hover:bg-muted"
                }`}
              >
                Bold
              </button>
              <button
                onClick={() =>
                  updateSetting(
                    "educationInstitutionItalic",
                    !layoutSettings.educationInstitutionItalic,
                  )
                }
                className={`flex-1 py-2 px-3 rounded-md border text-xs font-medium transition-all ${
                  layoutSettings.educationInstitutionItalic
                    ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                    : "border-border bg-background hover:bg-muted"
                }`}
              >
                Italic
              </button>
            </div>
          </div>
        </SubSectionCard>

        {/* Degree Type */}
        <SubSectionCard>
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Degree Type
          </Label>
          <div className="flex gap-2">
            <button
              onClick={() =>
                updateSetting(
                  "educationDegreeBold",
                  !layoutSettings.educationDegreeBold,
                )
              }
              className={`flex-1 py-2 px-3 rounded-md border text-xs font-medium transition-all ${
                layoutSettings.educationDegreeBold
                  ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                  : "border-border bg-background hover:bg-muted"
              }`}
            >
              Bold
            </button>
            <button
              onClick={() =>
                updateSetting(
                  "educationDegreeItalic",
                  !layoutSettings.educationDegreeItalic,
                )
              }
              className={`flex-1 py-2 px-3 rounded-md border text-xs font-medium transition-all ${
                layoutSettings.educationDegreeItalic
                  ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                  : "border-border bg-background hover:bg-muted"
              }`}
            >
              Italic
            </button>
          </div>
        </SubSectionCard>

        {/* Field of Study */}
        <SubSectionCard>
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Field of Study
          </Label>
          <div className="flex gap-2">
            <button
              onClick={() =>
                updateSetting(
                  "educationAreaBold",
                  !layoutSettings.educationAreaBold,
                )
              }
              className={`flex-1 py-2 px-3 rounded-md border text-xs font-medium transition-all ${
                layoutSettings.educationAreaBold
                  ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                  : "border-border bg-background hover:bg-muted"
              }`}
            >
              Bold
            </button>
            <button
              onClick={() =>
                updateSetting(
                  "educationAreaItalic",
                  !layoutSettings.educationAreaItalic,
                )
              }
              className={`flex-1 py-2 px-3 rounded-md border text-xs font-medium transition-all ${
                layoutSettings.educationAreaItalic
                  ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                  : "border-border bg-background hover:bg-muted"
              }`}
            >
              Italic
            </button>
          </div>
        </SubSectionCard>

        {/* Start & End Date */}
        <SubSectionCard>
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Start & End Date
          </Label>
          <div className="flex gap-2">
            <button
              onClick={() =>
                updateSetting(
                  "educationDateBold",
                  !layoutSettings.educationDateBold,
                )
              }
              className={`flex-1 py-2 px-3 rounded-md border text-xs font-medium transition-all ${
                layoutSettings.educationDateBold
                  ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                  : "border-border bg-background hover:bg-muted"
              }`}
            >
              Bold
            </button>
            <button
              onClick={() =>
                updateSetting(
                  "educationDateItalic",
                  !layoutSettings.educationDateItalic,
                )
              }
              className={`flex-1 py-2 px-3 rounded-md border text-xs font-medium transition-all ${
                layoutSettings.educationDateItalic
                  ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                  : "border-border bg-background hover:bg-muted"
              }`}
            >
              Italic
            </button>
          </div>
        </SubSectionCard>

        {/* GPA */}
        <SubSectionCard>
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            GPA / Score
          </Label>
          <div className="flex gap-2">
            <button
              onClick={() =>
                updateSetting(
                  "educationGpaBold",
                  !layoutSettings.educationGpaBold,
                )
              }
              className={`flex-1 py-2 px-3 rounded-md border text-xs font-medium transition-all ${
                layoutSettings.educationGpaBold
                  ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                  : "border-border bg-background hover:bg-muted"
              }`}
            >
              Bold
            </button>
            <button
              onClick={() =>
                updateSetting(
                  "educationGpaItalic",
                  !layoutSettings.educationGpaItalic,
                )
              }
              className={`flex-1 py-2 px-3 rounded-md border text-xs font-medium transition-all ${
                layoutSettings.educationGpaItalic
                  ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                  : "border-border bg-background hover:bg-muted"
              }`}
            >
              Italic
            </button>
          </div>
        </SubSectionCard>

        {/* Courses */}
        <SubSectionCard>
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Courses
          </Label>
          <div className="flex gap-2">
            <button
              onClick={() =>
                updateSetting(
                  "educationCoursesBold",
                  !layoutSettings.educationCoursesBold,
                )
              }
              className={`flex-1 py-2 px-3 rounded-md border text-xs font-medium transition-all ${
                layoutSettings.educationCoursesBold
                  ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                  : "border-border bg-background hover:bg-muted"
              }`}
            >
              Bold
            </button>
            <button
              onClick={() =>
                updateSetting(
                  "educationCoursesItalic",
                  !layoutSettings.educationCoursesItalic,
                )
              }
              className={`flex-1 py-2 px-3 rounded-md border text-xs font-medium transition-all ${
                layoutSettings.educationCoursesItalic
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
