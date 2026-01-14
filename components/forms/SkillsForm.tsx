"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Wrench, X } from "lucide-react";
import type { Skill } from "@/db";
import { v4 as uuidv4 } from "uuid";
import { useState } from "react";

interface SkillsFormProps {
  data: Skill[];
  onChange: (data: Skill[]) => void;
}

export function SkillsForm({ data, onChange }: SkillsFormProps) {
  const [newKeyword, setNewKeyword] = useState<{ [key: string]: string }>({});

  const addSkill = () => {
    const newSkill: Skill = {
      id: uuidv4(),
      name: "",
      level: "",
      keywords: [],
    };
    onChange([...data, newSkill]);
  };

  const removeSkill = (id: string) => {
    onChange(data.filter((skill) => skill.id !== id));
  };

  const updateSkill = (
    id: string,
    field: keyof Skill,
    value: string | string[]
  ) => {
    onChange(
      data.map((skill) =>
        skill.id === id ? { ...skill, [field]: value } : skill
      )
    );
  };

  const addKeyword = (id: string) => {
    const keyword = newKeyword[id]?.trim();
    if (!keyword) return;

    onChange(
      data.map((skill) =>
        skill.id === id
          ? { ...skill, keywords: [...skill.keywords, keyword] }
          : skill
      )
    );
    setNewKeyword({ ...newKeyword, [id]: "" });
  };

  const removeKeyword = (id: string, index: number) => {
    onChange(
      data.map((skill) => {
        if (skill.id === id) {
          return {
            ...skill,
            keywords: skill.keywords.filter((_, i) => i !== index),
          };
        }
        return skill;
      })
    );
  };

  const handleKeywordKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    id: string
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addKeyword(id);
    }
  };

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
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No skills added yet. Click &quot;Add Skill&quot; to get started.
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.map((skill) => (
          <Card key={skill.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center justify-between">
                <Input
                  placeholder="Skill Category (e.g., Programming)"
                  value={skill.name}
                  onChange={(e) =>
                    updateSkill(skill.id, "name", e.target.value)
                  }
                  className="font-semibold border-0 p-0 h-auto focus-visible:ring-0 text-base"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive shrink-0"
                  onClick={() => removeSkill(skill.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">
                  Proficiency Level
                </Label>
                <Input
                  placeholder="Expert, Advanced, Intermediate..."
                  value={skill.level}
                  onChange={(e) =>
                    updateSkill(skill.id, "level", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">
                  Technologies / Keywords
                </Label>
                <div className="flex flex-wrap gap-2 min-h-[32px]">
                  {skill.keywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-primary/10 text-primary rounded-md"
                    >
                      {keyword}
                      <button
                        type="button"
                        onClick={() => removeKeyword(skill.id, index)}
                        className="hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add keyword..."
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
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
