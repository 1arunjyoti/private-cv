"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Briefcase, ChevronDown, ChevronUp } from "lucide-react";
import type { WorkExperience } from "@/db";
import { v4 as uuidv4 } from "uuid";
import { useState } from "react";

interface WorkFormProps {
  data: WorkExperience[];
  onChange: (data: WorkExperience[]) => void;
}

export function WorkForm({ data, onChange }: WorkFormProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const addExperience = () => {
    const newExp: WorkExperience = {
      id: uuidv4(),
      company: "",
      position: "",
      url: "",
      startDate: "",
      endDate: "",
      summary: "",
      highlights: [],
    };
    onChange([...data, newExp]);
    setExpandedId(newExp.id);
  };

  const removeExperience = (id: string) => {
    onChange(data.filter((exp) => exp.id !== id));
  };

  const updateExperience = (
    id: string,
    field: keyof WorkExperience,
    value: string | string[]
  ) => {
    onChange(
      data.map((exp) => (exp.id === id ? { ...exp, [field]: value } : exp))
    );
  };

  const addHighlight = (id: string) => {
    onChange(
      data.map((exp) =>
        exp.id === id ? { ...exp, highlights: [...exp.highlights, ""] } : exp
      )
    );
  };

  const updateHighlight = (id: string, index: number, value: string) => {
    onChange(
      data.map((exp) => {
        if (exp.id === id) {
          const newHighlights = [...exp.highlights];
          newHighlights[index] = value;
          return { ...exp, highlights: newHighlights };
        }
        return exp;
      })
    );
  };

  const removeHighlight = (id: string, index: number) => {
    onChange(
      data.map((exp) => {
        if (exp.id === id) {
          return {
            ...exp,
            highlights: exp.highlights.filter((_, i) => i !== index),
          };
        }
        return exp;
      })
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Briefcase className="h-5 w-5" />
          Work Experience
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
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No work experience added yet. Click &quot;Add Experience&quot; to
            get started.
          </CardContent>
        </Card>
      )}

      {data.map((exp, index) => (
        <Card key={exp.id} className="overflow-hidden">
          <CardHeader
            className="cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => setExpandedId(expandedId === exp.id ? null : exp.id)}
          >
            <CardTitle className="text-lg flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="text-muted-foreground text-sm">
                  #{index + 1}
                </span>
                {exp.position || exp.company
                  ? `${exp.position}${
                      exp.position && exp.company ? " at " : ""
                    }${exp.company}`
                  : "New Experience"}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeExperience(exp.id);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                {expandedId === exp.id ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </div>
            </CardTitle>
          </CardHeader>

          {expandedId === exp.id && (
            <CardContent className="space-y-4 border-t">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <div className="space-y-2">
                  <Label>Company</Label>
                  <Input
                    placeholder="Company Name"
                    value={exp.company}
                    onChange={(e) =>
                      updateExperience(exp.id, "company", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Position</Label>
                  <Input
                    placeholder="Job Title"
                    value={exp.position}
                    onChange={(e) =>
                      updateExperience(exp.id, "position", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Company Website</Label>
                <Input
                  placeholder="https://company.com"
                  value={exp.url}
                  onChange={(e) =>
                    updateExperience(exp.id, "url", e.target.value)
                  }
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    type="month"
                    value={exp.startDate}
                    onChange={(e) =>
                      updateExperience(exp.id, "startDate", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="month"
                    placeholder="Leave empty if current"
                    value={exp.endDate}
                    onChange={(e) =>
                      updateExperience(exp.id, "endDate", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Summary</Label>
                <Textarea
                  placeholder="Brief description of your role and responsibilities..."
                  className="min-h-[100px]"
                  value={exp.summary}
                  onChange={(e) =>
                    updateExperience(exp.id, "summary", e.target.value)
                  }
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
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive shrink-0"
                        onClick={() => removeHighlight(exp.id, hIndex)}
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
