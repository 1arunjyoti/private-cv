"use client";

import { useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Users, Plus, Trash2 } from "lucide-react";
import type { Reference } from "@/db";
import { v4 as uuidv4 } from "uuid";
import { CollapsibleSection } from "@/components/CollapsibleSection";
import { RichTextEditor } from "@/components/ui/RichTextEditor";

interface ReferencesFormProps {
  data: Reference[];
  onChange: (data: Reference[]) => void;
}

export function ReferencesForm({ data, onChange }: ReferencesFormProps) {
  const addReference = useCallback(() => {
    const newRef: Reference = {
      id: uuidv4(),
      name: "",
      position: "",
      reference: "",
    };
    onChange([...data, newRef]);
  }, [data, onChange]);

  const removeReference = useCallback(
    (id: string) => {
      onChange(data.filter((item) => item.id !== id));
    },
    [data, onChange],
  );

  const updateReference = useCallback(
    (id: string, field: keyof Reference, value: string) => {
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
          <Users className="h-5 w-5" />
          References
        </h2>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addReference}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Reference
        </Button>
      </div>

      {data.length === 0 && (
        <div className="text-center text-muted-foreground py-8 border-2 border-dashed border-muted rounded-lg">
          No references added yet.
        </div>
      )}

      {data.map((item) => (
        <CollapsibleSection
          key={item.id}
          title={item.name || "New Reference"}
          defaultOpen={true}
          actions={
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-destructive hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                removeReference(item.id);
              }}
              aria-label="Remove reference"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          }
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  placeholder="e.g. John Doe"
                  value={item.name}
                  onChange={(e) =>
                    updateReference(item.id, "name", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Position / Company</Label>
                <Input
                  placeholder="e.g. Manager at Google"
                  value={item.position}
                  onChange={(e) =>
                    updateReference(item.id, "position", e.target.value)
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Reference</Label>
              <RichTextEditor
                placeholder="The reference text..."
                minHeight="min-h-[60px]"
                value={item.reference}
                onChange={(value) =>
                  updateReference(item.id, "reference", value)
                }
              />
            </div>
          </div>
        </CollapsibleSection>
      ))}
    </div>
  );
}
