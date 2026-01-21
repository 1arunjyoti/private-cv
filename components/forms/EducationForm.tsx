"use client";

import { useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { GraduationCap, Plus, Trash2 } from "lucide-react";
import type { Education } from "@/db";
import { v4 as uuidv4 } from "uuid";
import { CollapsibleSection } from "@/components/CollapsibleSection";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EducationFormProps {
  data: Education[];
  onChange: (data: Education[]) => void;
}

const getScoreType = (score: string) => {
  if (score.startsWith("GPA: ")) return "GPA";
  if (score.startsWith("CGPA: ")) return "CGPA";
  if (score.startsWith("Percentage: ")) return "Percentage";
  if (score.startsWith("Score: ")) return "Score";
  return "Score"; // Default
};

const getScoreValue = (score: string) => {
  if (score.includes(": ")) {
    return score.split(": ")[1] || "";
  }
  return score;
};

export function EducationForm({ data, onChange }: EducationFormProps) {
  const addEducation = useCallback(() => {
    const newEdu: Education = {
      id: uuidv4(),
      institution: "",
      url: "",
      area: "",
      studyType: "",
      startDate: "",
      endDate: "",
      score: "",
      summary: "",
      courses: [],
    };
    onChange([...data, newEdu]);
  }, [data, onChange]);

  const removeEducation = useCallback(
    (id: string) => {
      onChange(data.filter((edu) => edu.id !== id));
    },
    [data, onChange],
  );

  const updateEducation = useCallback(
    (id: string, field: keyof Education, value: string | string[]) => {
      onChange(
        data.map((edu) => (edu.id === id ? { ...edu, [field]: value } : edu)),
      );
    },
    [data, onChange],
  );

  const addCourse = useCallback(
    (id: string) => {
      onChange(
        data.map((edu) =>
          edu.id === id ? { ...edu, courses: [...edu.courses, ""] } : edu,
        ),
      );
    },
    [data, onChange],
  );

  const updateCourse = useCallback(
    (id: string, index: number, value: string) => {
      onChange(
        data.map((edu) => {
          if (edu.id === id) {
            const newCourses = [...edu.courses];
            newCourses[index] = value;
            return { ...edu, courses: newCourses };
          }
          return edu;
        }),
      );
    },
    [data, onChange],
  );

  const removeCourse = useCallback(
    (id: string, index: number) => {
      onChange(
        data.map((edu) => {
          if (edu.id === id) {
            return {
              ...edu,
              courses: edu.courses.filter((_, i) => i !== index),
            };
          }
          return edu;
        }),
      );
    },
    [data, onChange],
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <GraduationCap className="h-5 w-5" />
          Education
        </h2>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addEducation}
        >
          <Plus className="h-4 w-4" />
          Add Education
        </Button>
      </div>

      {data.length === 0 && (
        <div className="text-center text-muted-foreground py-8 border-2 border-dashed border-muted rounded-lg">
          No education added yet. Click &quot;Add Education&quot; to get
          started.
        </div>
      )}

      {data.map((edu, index) => (
        <CollapsibleSection
          key={edu.id}
          title={
            <span className="flex items-center gap-2">
              <span className="text-muted-foreground text-sm">
                #{index + 1}
              </span>
              {edu.institution || edu.area
                ? `${edu.studyType ? edu.studyType + " in " : ""}${edu.area}${
                    edu.area && edu.institution ? " - " : ""
                  }${edu.institution}`
                : "New Education"}
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
                removeEducation(edu.id);
              }}
              aria-label="Remove education"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          }
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Institution</Label>
                <Input
                  placeholder="University of Technology"
                  value={edu.institution}
                  onChange={(e) =>
                    updateEducation(edu.id, "institution", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Website</Label>
                <Input
                  placeholder="https://university.edu"
                  value={edu.url}
                  onChange={(e) =>
                    updateEducation(edu.id, "url", e.target.value)
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Degree Type</Label>
                <Input
                  placeholder="Bachelor's, Master's, PhD..."
                  value={edu.studyType}
                  onChange={(e) =>
                    updateEducation(edu.id, "studyType", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Field of Study</Label>
                <Input
                  placeholder="Computer Science"
                  value={edu.area}
                  onChange={(e) =>
                    updateEducation(edu.id, "area", e.target.value)
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="month"
                  value={edu.startDate}
                  onChange={(e) =>
                    updateEducation(edu.id, "startDate", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input
                  type="month"
                  value={edu.endDate}
                  onChange={(e) =>
                    updateEducation(edu.id, "endDate", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Select
                  value={getScoreType(edu.score)}
                  onValueChange={(value) => {
                    const currentVal = getScoreValue(edu.score);
                    updateEducation(
                      edu.id,
                      "score",
                      currentVal ? `${value}: ${currentVal}` : "",
                    );
                  }}
                >
                  <SelectTrigger className="h-8 w-fit border-none p-0 focus:ring-0 text-sm font-medium">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GPA">GPA</SelectItem>
                    <SelectItem value="CGPA">CGPA</SelectItem>
                    <SelectItem value="Percentage">Percentage</SelectItem>
                    <SelectItem value="Score">Score</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="e.g. 3.8/4.0 or 90%"
                  value={getScoreValue(edu.score)}
                  onChange={(e) => {
                    const type = getScoreType(edu.score);
                    const val = e.target.value;
                    updateEducation(
                      edu.id,
                      "score",
                      val ? `${type}: ${val}` : "",
                    );
                  }}
                  className="mt-0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <RichTextEditor
                placeholder="Brief description of your studies, thesis, or key achievements..."
                minHeight="min-h-[60px]"
                value={edu.summary || ""}
                onChange={(value) => updateEducation(edu.id, "summary", value)}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Relevant Courses</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => addCourse(edu.id)}
                >
                  <Plus className="h-4 w-4" />
                  Add
                </Button>
              </div>
              <div className="space-y-2">
                {edu.courses.map((course, cIndex) => (
                  <div key={cIndex} className="flex items-center gap-2">
                    <span className="text-muted-foreground text-sm">•</span>
                    <Input
                      placeholder="Data Structures & Algorithms"
                      value={course}
                      onChange={(e) =>
                        updateCourse(edu.id, cIndex, e.target.value)
                      }
                      className="flex-1"
                      aria-label={`Course ${cIndex + 1}`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive shrink-0"
                      onClick={() => removeCourse(edu.id, cIndex)}
                      aria-label="Remove course"
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
