"use client";

import { useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Languages, Plus, Trash2 } from "lucide-react";
import type { Language } from "@/db";
import { v4 as uuidv4 } from "uuid";

interface LanguagesFormProps {
  data: Language[];
  onChange: (data: Language[]) => void;
}

export function LanguagesForm({ data, onChange }: LanguagesFormProps) {
  const addLanguage = useCallback(() => {
    const newLang: Language = {
      id: uuidv4(),
      language: "",
      fluency: "",
    };
    onChange([...data, newLang]);
  }, [data, onChange]);

  const removeLanguage = useCallback(
    (id: string) => {
      onChange(data.filter((lang) => lang.id !== id));
    },
    [data, onChange],
  );

  const updateLanguage = useCallback(
    (id: string, field: keyof Language, value: string) => {
      onChange(
        data.map((lang) =>
          lang.id === id ? { ...lang, [field]: value } : lang,
        ),
      );
    },
    [data, onChange],
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Languages className="h-5 w-5" />
          Languages
        </h2>
        <Button type="button" variant="outline" size="sm" onClick={addLanguage}>
          <Plus className="h-4 w-4 mr-2" />
          Add Language
        </Button>
      </div>

      {data.length === 0 && (
        <div className="text-center text-muted-foreground py-8 border-2 border-dashed border-muted rounded-lg">
          No languages added yet.
        </div>
      )}

      {data.length > 0 && (
        <div className="grid gap-4">
          {data.map((lang) => (
            <div
              key={lang.id}
              className="p-4 flex flex-col sm:flex-row sm:items-end gap-4 border rounded-lg bg-background"
            >
              <div className="flex-1 space-y-2">
                <Label htmlFor={`language-${lang.id}`}>Language</Label>
                <Input
                  id={`language-${lang.id}`}
                  placeholder="e.g. English"
                  value={lang.language}
                  onChange={(e) =>
                    updateLanguage(lang.id, "language", e.target.value)
                  }
                  autoComplete="language"
                />
              </div>
              <div className="flex-1 space-y-2">
                <Label htmlFor={`fluency-${lang.id}`}>Fluency</Label>
                <select
                  id={`fluency-${lang.id}`}
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={lang.fluency}
                  onChange={(e) =>
                    updateLanguage(lang.id, "fluency", e.target.value)
                  }
                  autoComplete="off"
                >
                  <option value="" disabled>
                    Select fluency
                  </option>
                  <option value="Native speaker">Native speaker</option>
                  <option value="Fluent">Fluent</option>
                  <option value="Proficient">Proficient</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Beginner">Beginner</option>
                </select>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive shrink-0 sm:mb-0.5 self-end sm:self-auto"
                onClick={() => removeLanguage(lang.id)}
                aria-label="Remove language"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
