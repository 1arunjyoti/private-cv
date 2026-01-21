"use client";

import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FolderGit2, Plus, Trash2, X } from "lucide-react";
import type { Project } from "@/db";
import { v4 as uuidv4 } from "uuid";
import { CollapsibleSection } from "@/components/CollapsibleSection";
import { RichTextEditor } from "@/components/ui/RichTextEditor";

interface ProjectsFormProps {
  data: Project[];
  onChange: (data: Project[]) => void;
}

export function ProjectsForm({ data, onChange }: ProjectsFormProps) {
  const [newKeyword, setNewKeyword] = useState<{ [key: string]: string }>({});

  const addProject = useCallback(() => {
    const newProject: Project = {
      id: uuidv4(),
      name: "",
      description: "",
      highlights: [],
      keywords: [],
      startDate: "",
      endDate: "",
      url: "",
    };
    onChange([...data, newProject]);
  }, [data, onChange]);

  const removeProject = useCallback(
    (id: string) => {
      onChange(data.filter((proj) => proj.id !== id));
    },
    [data, onChange],
  );

  const updateProject = useCallback(
    (id: string, field: keyof Project, value: string | string[]) => {
      onChange(
        data.map((proj) =>
          proj.id === id ? { ...proj, [field]: value } : proj,
        ),
      );
    },
    [data, onChange],
  );

  const addHighlight = useCallback(
    (id: string) => {
      onChange(
        data.map((proj) =>
          proj.id === id
            ? { ...proj, highlights: [...proj.highlights, ""] }
            : proj,
        ),
      );
    },
    [data, onChange],
  );

  const updateHighlight = useCallback(
    (id: string, index: number, value: string) => {
      onChange(
        data.map((proj) => {
          if (proj.id === id) {
            const newHighlights = [...proj.highlights];
            newHighlights[index] = value;
            return { ...proj, highlights: newHighlights };
          }
          return proj;
        }),
      );
    },
    [data, onChange],
  );

  const removeHighlight = useCallback(
    (id: string, index: number) => {
      onChange(
        data.map((proj) => {
          if (proj.id === id) {
            return {
              ...proj,
              highlights: proj.highlights.filter((_, i) => i !== index),
            };
          }
          return proj;
        }),
      );
    },
    [data, onChange],
  );

  const addKeyword = useCallback(
    (id: string) => {
      const keyword = newKeyword[id]?.trim();
      if (!keyword) return;

      onChange(
        data.map((proj) =>
          proj.id === id
            ? { ...proj, keywords: [...proj.keywords, keyword] }
            : proj,
        ),
      );
      setNewKeyword((prev) => ({ ...prev, [id]: "" }));
    },
    [data, onChange, newKeyword],
  );

  const removeKeyword = useCallback(
    (id: string, index: number) => {
      onChange(
        data.map((proj) => {
          if (proj.id === id) {
            return {
              ...proj,
              keywords: proj.keywords.filter((_, i) => i !== index),
            };
          }
          return proj;
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
          <FolderGit2 className="h-5 w-5" />
          Projects
        </h2>
        <Button type="button" variant="outline" size="sm" onClick={addProject}>
          <Plus className="h-4 w-4 mr-2" />
          Add Project
        </Button>
      </div>

      {data.length === 0 && (
        <div className="text-center text-muted-foreground py-8 border-2 border-dashed border-muted rounded-lg">
          No projects added yet. Click &quot;Add Project&quot; to get started.
        </div>
      )}

      {data.map((proj, index) => (
        <CollapsibleSection
          key={proj.id}
          title={
            <span className="flex items-center gap-2">
              <span className="text-muted-foreground text-sm">
                #{index + 1}
              </span>
              {proj.name || "New Project"}
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
                removeProject(proj.id);
              }}
              aria-label="Remove project"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          }
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Project Name</Label>
                <Input
                  placeholder="Project Name"
                  value={proj.name}
                  onChange={(e) =>
                    updateProject(proj.id, "name", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Project URL</Label>
                <Input
                  placeholder="https://project.com"
                  value={proj.url}
                  onChange={(e) =>
                    updateProject(proj.id, "url", e.target.value)
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="month"
                  value={proj.startDate}
                  onChange={(e) =>
                    updateProject(proj.id, "startDate", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input
                  type="month"
                  value={proj.endDate}
                  onChange={(e) =>
                    updateProject(proj.id, "endDate", e.target.value)
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <RichTextEditor
                placeholder="Brief description of the project..."
                minHeight="min-h-[100px]"
                value={proj.description}
                onChange={(value) =>
                  updateProject(proj.id, "description", value)
                }
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Technologies Used</Label>
              <div className="flex flex-wrap gap-2 min-h-8">
                {proj.keywords.map((keyword, kIndex) => (
                  <span
                    key={kIndex}
                    className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-primary/10 text-primary rounded-md"
                  >
                    {keyword}
                    <button
                      type="button"
                      onClick={() => removeKeyword(proj.id, kIndex)}
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
                  placeholder="Add technology..."
                  value={newKeyword[proj.id] || ""}
                  onChange={(e) =>
                    setNewKeyword({
                      ...newKeyword,
                      [proj.id]: e.target.value,
                    })
                  }
                  onKeyDown={(e) => handleKeywordKeyDown(e, proj.id)}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => addKeyword(proj.id)}
                >
                  Add
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Key Features / Highlights</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => addHighlight(proj.id)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
              <div className="space-y-2">
                {proj.highlights.map((highlight, hIndex) => (
                  <div key={hIndex} className="flex items-center gap-2">
                    <span className="text-muted-foreground text-sm">•</span>
                    <Input
                      placeholder="Built a real-time chat feature..."
                      value={highlight}
                      onChange={(e) =>
                        updateHighlight(proj.id, hIndex, e.target.value)
                      }
                      className="flex-1"
                      aria-label={`Highlight ${hIndex + 1}`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive shrink-0"
                      onClick={() => removeHighlight(proj.id, hIndex)}
                      aria-label="Remove highlight"
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
