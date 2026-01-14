"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Plus,
  Trash2,
  FolderKanban,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";
import type { Project } from "@/db";
import { v4 as uuidv4 } from "uuid";
import { useState } from "react";

interface ProjectsFormProps {
  data: Project[];
  onChange: (data: Project[]) => void;
}

export function ProjectsForm({ data, onChange }: ProjectsFormProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [newKeyword, setNewKeyword] = useState<{ [key: string]: string }>({});

  const addProject = () => {
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
    setExpandedId(newProject.id);
  };

  const removeProject = (id: string) => {
    onChange(data.filter((proj) => proj.id !== id));
  };

  const updateProject = (
    id: string,
    field: keyof Project,
    value: string | string[]
  ) => {
    onChange(
      data.map((proj) => (proj.id === id ? { ...proj, [field]: value } : proj))
    );
  };

  const addHighlight = (id: string) => {
    onChange(
      data.map((proj) =>
        proj.id === id
          ? { ...proj, highlights: [...proj.highlights, ""] }
          : proj
      )
    );
  };

  const updateHighlight = (id: string, index: number, value: string) => {
    onChange(
      data.map((proj) => {
        if (proj.id === id) {
          const newHighlights = [...proj.highlights];
          newHighlights[index] = value;
          return { ...proj, highlights: newHighlights };
        }
        return proj;
      })
    );
  };

  const removeHighlight = (id: string, index: number) => {
    onChange(
      data.map((proj) => {
        if (proj.id === id) {
          return {
            ...proj,
            highlights: proj.highlights.filter((_, i) => i !== index),
          };
        }
        return proj;
      })
    );
  };

  const addKeyword = (id: string) => {
    const keyword = newKeyword[id]?.trim();
    if (!keyword) return;

    onChange(
      data.map((proj) =>
        proj.id === id
          ? { ...proj, keywords: [...proj.keywords, keyword] }
          : proj
      )
    );
    setNewKeyword({ ...newKeyword, [id]: "" });
  };

  const removeKeyword = (id: string, index: number) => {
    onChange(
      data.map((proj) => {
        if (proj.id === id) {
          return {
            ...proj,
            keywords: proj.keywords.filter((_, i) => i !== index),
          };
        }
        return proj;
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
          <FolderKanban className="h-5 w-5" />
          Projects
        </h2>
        <Button type="button" variant="outline" size="sm" onClick={addProject}>
          <Plus className="h-4 w-4 mr-2" />
          Add Project
        </Button>
      </div>

      {data.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No projects added yet. Click &quot;Add Project&quot; to get started.
          </CardContent>
        </Card>
      )}

      {data.map((proj, index) => (
        <Card key={proj.id} className="overflow-hidden">
          <CardHeader
            className="cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() =>
              setExpandedId(expandedId === proj.id ? null : proj.id)
            }
          >
            <CardTitle className="text-lg flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="text-muted-foreground text-sm">
                  #{index + 1}
                </span>
                {proj.name || "New Project"}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeProject(proj.id);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                {expandedId === proj.id ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </div>
            </CardTitle>
          </CardHeader>

          {expandedId === proj.id && (
            <CardContent className="space-y-4 border-t">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <div className="space-y-2">
                  <Label>Project Name</Label>
                  <Input
                    placeholder="My Awesome Project"
                    value={proj.name}
                    onChange={(e) =>
                      updateProject(proj.id, "name", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Project URL</Label>
                  <Input
                    placeholder="https://github.com/username/project"
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
                <Textarea
                  placeholder="Brief description of the project..."
                  className="min-h-[100px]"
                  value={proj.description}
                  onChange={(e) =>
                    updateProject(proj.id, "description", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Technologies Used</Label>
                <div className="flex flex-wrap gap-2 min-h-[32px]">
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
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive shrink-0"
                        onClick={() => removeHighlight(proj.id, hIndex)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
}
