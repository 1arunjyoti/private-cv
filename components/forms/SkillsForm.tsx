"use client";

import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Wrench, Plus, Trash2, X } from "lucide-react";
import type { Skill } from "@/db";
import { v4 as uuidv4 } from "uuid";
import { CollapsibleSection } from "@/components/CollapsibleSection";

interface SkillsFormProps {
  data: Skill[];
  onChange: (data: Skill[]) => void;
}

export function SkillsForm({ data, onChange }: SkillsFormProps) {
  const [newKeyword, setNewKeyword] = useState<{ [key: string]: string }>({});

  const addSkill = useCallback(() => {
    const newSkill: Skill = {
      id: uuidv4(),
      name: "",
      level: "",
      keywords: [],
    };
    onChange([...data, newSkill]);
  }, [data, onChange]);

  const removeSkill = useCallback(
    (id: string) => {
      onChange(data.filter((skill) => skill.id !== id));
    },
    [data, onChange],
  );

  const updateSkill = useCallback(
    (id: string, field: keyof Skill, value: string | string[]) => {
      onChange(
        data.map((skill) =>
          skill.id === id ? { ...skill, [field]: value } : skill,
        ),
      );
    },
    [data, onChange],
  );

  const addKeyword = useCallback(
    (id: string) => {
      const keyword = newKeyword[id]?.trim();
      if (!keyword) return;

      onChange(
        data.map((skill) =>
          skill.id === id
            ? { ...skill, keywords: [...skill.keywords, keyword] }
            : skill,
        ),
      );
      setNewKeyword((prev) => ({ ...prev, [id]: "" }));
    },
    [data, onChange, newKeyword],
  );

  const removeKeyword = useCallback(
    (id: string, index: number) => {
      onChange(
        data.map((skill) => {
          if (skill.id === id) {
            return {
              ...skill,
              keywords: skill.keywords.filter((_, i) => i !== index),
            };
          }
          return skill;
        }),
      );
    },
    [data, onChange],
  );

  const handleKeywordKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>, id: string) => {
      if (e.key === "Enter") {
        e.preventDefault();
        addKeyword(id);
      }
    },
    [addKeyword],
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Wrench className="h-5 w-5" />
          Skills
        </h2>
        <Button type="button" variant="outline" size="sm" onClick={addSkill}>
          <Plus className="h-4 w-4 mr-2" />
          Add Skill
        </Button>
      </div>

      {data.length === 0 && (
        <div className="text-center text-muted-foreground py-8 border-2 border-dashed border-muted rounded-lg">
          No skills added yet. Click &quot;Add Skill&quot; to get started.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.map((skill) => (
          <CollapsibleSection
            key={skill.id}
            title={
              <div
                className="flex-1 mr-4"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
              >
                <Input
                  value={skill.name}
                  onChange={(e) =>
                    updateSkill(skill.id, "name", e.target.value)
                  }
                  placeholder="Skill Category (e.g. Languages)"
                  className="h-8"
                  aria-label="Skill Category"
                />
              </div>
            }
            defaultOpen={true}
            actions={
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  removeSkill(skill.id);
                }}
                aria-label="Remove skill"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            }
          >
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Proficiency Level</Label>
                <Input
                  value={skill.level}
                  onChange={(e) =>
                    updateSkill(skill.id, "level", e.target.value)
                  }
                  placeholder="e.g. Native, Advanced"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Keywords / Skills</Label>
                <div className="flex flex-wrap gap-2 min-h-8">
                  {skill.keywords.map((keyword, kIndex) => (
                    <span
                      key={kIndex}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-primary/10 text-primary rounded-md"
                    >
                      {keyword}
                      <button
                        type="button"
                        onClick={() => removeKeyword(skill.id, kIndex)}
                        className="hover:text-destructive"
                        aria-label={`Remove keyword ${keyword}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add skill..."
                    value={newKeyword[skill.id] || ""}
                    onChange={(e) =>
                      setNewKeyword({
                        ...newKeyword,
                        [skill.id]: e.target.value,
                      })
                    }
                    onKeyDown={(e) => handleKeywordKeyDown(e, skill.id)}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => addKeyword(skill.id)}
                  >
                    Add
                  </Button>
                </div>
              </div>
            </div>
          </CollapsibleSection>
        ))}
      </div>
    </div>
  );
}
