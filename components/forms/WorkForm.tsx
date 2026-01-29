"use client";

import { useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Briefcase, Plus, Trash2 } from "lucide-react";
import type { WorkExperience } from "@/db";
import { v4 as uuidv4 } from "uuid";
import { CollapsibleSection } from "@/components/CollapsibleSection";
import { RichTextEditor } from "@/components/ui/RichTextEditor";

interface WorkFormProps {
  data: WorkExperience[];
  onChange: (data: WorkExperience[]) => void;
}

export function WorkForm({ data, onChange }: WorkFormProps) {
  const addExperience = useCallback(() => {
    const newExp: WorkExperience = {
      id: uuidv4(),
      company: "",
      position: "",
      url: "",
      startDate: "",
      endDate: "",
      summary: "",
      highlights: [],
      location: undefined,
      name: undefined,
    };
    onChange([...data, newExp]);
  }, [data, onChange]);

  const removeExperience = useCallback(
    (id: string) => {
      onChange(data.filter((exp) => exp.id !== id));
    },
    [data, onChange],
  );

  const updateExperience = useCallback(
    (id: string, field: keyof WorkExperience, value: string | string[]) => {
      onChange(
        data.map((exp) => (exp.id === id ? { ...exp, [field]: value } : exp)),
      );
    },
    [data, onChange],
  );

  const addHighlight = useCallback(
    (id: string) => {
      onChange(
        data.map((exp) =>
          exp.id === id ? { ...exp, highlights: [...exp.highlights, ""] } : exp,
        ),
      );
    },
    [data, onChange],
  );

  const updateHighlight = useCallback(
    (id: string, index: number, value: string) => {
      onChange(
        data.map((exp) => {
          if (exp.id === id) {
            const newHighlights = [...exp.highlights];
            newHighlights[index] = value;
            return { ...exp, highlights: newHighlights };
          }
          return exp;
        }),
      );
    },
    [data, onChange],
  );

  const removeHighlight = useCallback(
    (id: string, index: number) => {
      onChange(
        data.map((exp) => {
          if (exp.id === id) {
            return {
              ...exp,
              highlights: exp.highlights.filter((_, i) => i !== index),
            };
          }
          return exp;
        }),
      );
    },
    [data, onChange],
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Briefcase className="h-5 w-5" />
          Professional Experience
        </h2>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addExperience}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Experience
        </Button>
      </div>

      {data.length === 0 && (
        <div className="text-center text-muted-foreground py-8 border-2 border-dashed border-muted rounded-lg">
          No professional experience added yet. Click &quot;Add Experience&quot;
          to get started.
        </div>
      )}

      {data.map((exp, index) => (
        <CollapsibleSection
          key={exp.id}
          title={
            <span className="flex items-center gap-2">
              <span className="text-muted-foreground text-sm">
                #{index + 1}
              </span>
              {exp.position || exp.company
                ? `${exp.position}${exp.position && exp.company ? " at " : ""}${
                    exp.company
                  }`
                : "New Experience"}
            </span>
          }
          defaultOpen={true}
          actions={
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-destructive hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                removeExperience(exp.id);
              }}
              aria-label="Remove experience"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          }
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`company-${exp.id}`}>Company</Label>
                <Input
                  id={`company-${exp.id}`}
                  placeholder="Company Name"
                  value={exp.company}
                  onChange={(e) =>
                    updateExperience(exp.id, "company", e.target.value)
                  }
                  autoComplete="organization"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`position-${exp.id}`}>Position</Label>
                <Input
                  id={`position-${exp.id}`}
                  placeholder="Job Title"
                  value={exp.position}
                  onChange={(e) =>
                    updateExperience(exp.id, "position", e.target.value)
                  }
                  autoComplete="organization-title"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`url-${exp.id}`}>Company Website</Label>
              <Input
                id={`url-${exp.id}`}
                placeholder="https://company.com"
                value={exp.url}
                onChange={(e) =>
                  updateExperience(exp.id, "url", e.target.value)
                }
                autoComplete="url"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`startDate-${exp.id}`}>Start Date</Label>
                <Input
                  id={`startDate-${exp.id}`}
                  type="month"
                  value={exp.startDate}
                  onChange={(e) =>
                    updateExperience(exp.id, "startDate", e.target.value)
                  }
                  autoComplete="off"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`endDate-${exp.id}`}>End Date</Label>
                <Input
                  id={`endDate-${exp.id}`}
                  type="month"
                  placeholder="Leave empty if current"
                  value={exp.endDate}
                  onChange={(e) =>
                    updateExperience(exp.id, "endDate", e.target.value)
                  }
                  autoComplete="off"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`summary-${exp.id}`}>Description</Label>
              <RichTextEditor
                id={`summary-${exp.id}`}
                placeholder="Brief description of your role and responsibilities..."
                minHeight="min-h-[60px]"
                value={exp.summary}
                onChange={(value) => updateExperience(exp.id, "summary", value)}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Key Achievements</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => addHighlight(exp.id)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
              <div className="space-y-2">
                {exp.highlights.map((highlight, hIndex) => (
                  <div key={hIndex} className="flex items-center gap-2">
                    <span className="text-muted-foreground text-sm">•</span>
                    <Input
                      placeholder="Increased revenue by 20%..."
                      value={highlight}
                      onChange={(e) =>
                        updateHighlight(exp.id, hIndex, e.target.value)
                      }
                      className="flex-1"
                      aria-label={`Achievement ${hIndex + 1}`}
                      autoComplete="off"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive shrink-0"
                      onClick={() => removeHighlight(exp.id, hIndex)}
                      aria-label="Remove achievement"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CollapsibleSection>
      ))}
    </div>
  );
}
