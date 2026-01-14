"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Plus,
  Trash2,
  GraduationCap,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { Education } from "@/db";
import { v4 as uuidv4 } from "uuid";
import { useState } from "react";

interface EducationFormProps {
  data: Education[];
  onChange: (data: Education[]) => void;
}

export function EducationForm({ data, onChange }: EducationFormProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const addEducation = () => {
    const newEdu: Education = {
      id: uuidv4(),
      institution: "",
      url: "",
      area: "",
      studyType: "",
      startDate: "",
      endDate: "",
      score: "",
      courses: [],
    };
    onChange([...data, newEdu]);
    setExpandedId(newEdu.id);
  };

  const removeEducation = (id: string) => {
    onChange(data.filter((edu) => edu.id !== id));
  };

  const updateEducation = (
    id: string,
    field: keyof Education,
    value: string | string[]
  ) => {
    onChange(
      data.map((edu) => (edu.id === id ? { ...edu, [field]: value } : edu))
    );
  };

  const addCourse = (id: string) => {
    onChange(
      data.map((edu) =>
        edu.id === id ? { ...edu, courses: [...edu.courses, ""] } : edu
      )
    );
  };

  const updateCourse = (id: string, index: number, value: string) => {
    onChange(
      data.map((edu) => {
        if (edu.id === id) {
          const newCourses = [...edu.courses];
          newCourses[index] = value;
          return { ...edu, courses: newCourses };
        }
        return edu;
      })
    );
  };

  const removeCourse = (id: string, index: number) => {
    onChange(
      data.map((edu) => {
        if (edu.id === id) {
          return {
            ...edu,
            courses: edu.courses.filter((_, i) => i !== index),
          };
        }
        return edu;
      })
    );
  };

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
          <Plus className="h-4 w-4 mr-2" />
          Add Education
        </Button>
      </div>

      {data.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No education added yet. Click &quot;Add Education&quot; to get
            started.
          </CardContent>
        </Card>
      )}

      {data.map((edu, index) => (
        <Card key={edu.id} className="overflow-hidden">
          <CardHeader
            className="cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => setExpandedId(expandedId === edu.id ? null : edu.id)}
          >
            <CardTitle className="text-lg flex items-center justify-between">
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
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeEducation(edu.id);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                {expandedId === edu.id ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </div>
            </CardTitle>
          </CardHeader>

          {expandedId === edu.id && (
            <CardContent className="space-y-4 border-t">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
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
                  <Label>GPA / Score</Label>
                  <Input
                    placeholder="3.8/4.0"
                    value={edu.score}
                    onChange={(e) =>
                      updateEducation(edu.id, "score", e.target.value)
                    }
                  />
                </div>
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
                    <Plus className="h-4 w-4 mr-1" />
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
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive shrink-0"
                        onClick={() => removeCourse(edu.id, cIndex)}
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
