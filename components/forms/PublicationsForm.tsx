"use client";

import { useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { BookOpen, Plus, Trash2 } from "lucide-react";
import type { Publication } from "@/db";
import { v4 as uuidv4 } from "uuid";
import { CollapsibleSection } from "@/components/CollapsibleSection";
import { RichTextEditor } from "@/components/ui/RichTextEditor";

interface PublicationsFormProps {
  data: Publication[];
  onChange: (data: Publication[]) => void;
}

export function PublicationsForm({ data, onChange }: PublicationsFormProps) {
  const addPublication = useCallback(() => {
    const newPub: Publication = {
      id: uuidv4(),
      name: "",
      publisher: "",
      releaseDate: "",
      url: "",
      summary: "",
    };
    onChange([...data, newPub]);
  }, [data, onChange]);

  const removePublication = useCallback(
    (id: string) => {
      onChange(data.filter((pub) => pub.id !== id));
    },
    [data, onChange],
  );

  const updatePublication = useCallback(
    (id: string, field: keyof Publication, value: string) => {
      onChange(
        data.map((pub) => (pub.id === id ? { ...pub, [field]: value } : pub)),
      );
    },
    [data, onChange],
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Publications
        </h2>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addPublication}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Publication
        </Button>
      </div>

      {data.length === 0 && (
        <div className="text-center text-muted-foreground py-8 border-2 border-dashed border-muted rounded-lg">
          No publications added yet.
        </div>
      )}

      {data.map((pub) => (
        <CollapsibleSection
          key={pub.id}
          title={pub.name || "New Publication"}
          defaultOpen={true}
          actions={
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-destructive hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                removePublication(pub.id);
              }}
              aria-label="Remove publication"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          }
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Publication Name</Label>
                <Input
                  placeholder="e.g. My Great Article"
                  value={pub.name}
                  onChange={(e) =>
                    updatePublication(pub.id, "name", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Publisher</Label>
                <Input
                  placeholder="e.g. Medium, IEEE"
                  value={pub.publisher}
                  onChange={(e) =>
                    updatePublication(pub.id, "publisher", e.target.value)
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Release Date</Label>
                <Input
                  type="date"
                  value={pub.releaseDate}
                  onChange={(e) =>
                    updatePublication(pub.id, "releaseDate", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>URL</Label>
                <Input
                  placeholder="https://..."
                  value={pub.url}
                  onChange={(e) =>
                    updatePublication(pub.id, "url", e.target.value)
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <RichTextEditor
                placeholder="Brief description of the publication..."
                minHeight="min-h-[60px]"
                value={pub.summary}
                onChange={(value) =>
                  updatePublication(pub.id, "summary", value)
                }
              />
            </div>
          </div>
        </CollapsibleSection>
      ))}
    </div>
  );
}
