"use client";

import { useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Trophy, Plus, Trash2 } from "lucide-react";
import type { Award } from "@/db";
import { v4 as uuidv4 } from "uuid";
import { CollapsibleSection } from "@/components/CollapsibleSection";
import { RichTextEditor } from "@/components/ui/RichTextEditor";

interface AwardsFormProps {
  data: Award[];
  onChange: (data: Award[]) => void;
}

export function AwardsForm({ data, onChange }: AwardsFormProps) {
  const addAward = useCallback(() => {
    const newAward: Award = {
      id: uuidv4(),
      title: "",
      date: "",
      awarder: "",
      summary: "",
    };
    onChange([...data, newAward]);
  }, [data, onChange]);

  const removeAward = useCallback(
    (id: string) => {
      onChange(data.filter((item) => item.id !== id));
    },
    [data, onChange],
  );

  const updateAward = useCallback(
    (id: string, field: keyof Award, value: string) => {
      onChange(
        data.map((item) =>
          item.id === id ? { ...item, [field]: value } : item,
        ),
      );
    },
    [data, onChange],
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Awards
        </h2>
        <Button type="button" variant="outline" size="sm" onClick={addAward}>
          <Plus className="h-4 w-4 mr-2" />
          Add Award
        </Button>
      </div>

      {data.length === 0 && (
        <div className="text-center text-muted-foreground py-8 border-2 border-dashed border-muted rounded-lg">
          No awards added yet.
        </div>
      )}

      {data.map((item) => (
        <CollapsibleSection
          key={item.id}
          title={item.title || "New Award"}
          defaultOpen={true}
          actions={
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-destructive hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                removeAward(item.id);
              }}
              aria-label="Remove award"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          }
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Award Title</Label>
                <Input
                  placeholder="e.g. Employee of the Month"
                  value={item.title}
                  onChange={(e) =>
                    updateAward(item.id, "title", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Awarder</Label>
                <Input
                  placeholder="e.g. Company Inc."
                  value={item.awarder}
                  onChange={(e) =>
                    updateAward(item.id, "awarder", e.target.value)
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={item.date}
                onChange={(e) => updateAward(item.id, "date", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <RichTextEditor
                placeholder="Brief description of the award..."
                minHeight="min-h-[60px]"
                value={item.summary}
                onChange={(value) => updateAward(item.id, "summary", value)}
              />
            </div>
          </div>
        </CollapsibleSection>
      ))}
    </div>
  );
}
