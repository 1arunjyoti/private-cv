"use client";

import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  User,
  Briefcase,
  GraduationCap,
  Wrench,
  FolderKanban,
  Award,
  Languages,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ImportResult, ParsedResumeData } from "@/lib/import";

interface ImportReviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  importResult: ImportResult;
  onConfirm: (data: ParsedResumeData) => void;
  onCancel: () => void;
}

interface SectionCardProps {
  title: string;
  icon: React.ReactNode;
  count: number;
  confidence: number;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function SectionCard({
  title,
  icon,
  count,
  confidence,
  children,
  defaultOpen = false,
}: SectionCardProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const confidenceColor =
    confidence >= 70
      ? "text-green-600"
      : confidence >= 40
        ? "text-yellow-600"
        : "text-red-600";

  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        className="w-full px-4 py-3 flex items-center justify-between bg-muted/50 hover:bg-muted/70 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          <span className="text-muted-foreground">{icon}</span>
          <span className="font-medium">{title}</span>
          <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
            {count} {count === 1 ? "item" : "items"}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {confidence > 0 && (
            <span className={cn("text-xs font-medium", confidenceColor)}>
              {confidence}% match
            </span>
          )}
          {isOpen ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </div>
      </button>
      {isOpen && <div className="p-4 space-y-3 text-sm">{children}</div>}
    </div>
  );
}

export function ImportReview({
  open,
  onOpenChange,
  importResult,
  onConfirm,
  onCancel,
}: ImportReviewProps) {
  const { data, confidence, warnings } = importResult;

  const sections = useMemo(() => {
    const result = [];

    if (data.basics?.name || data.basics?.email) {
      result.push({
        id: "basics",
        title: "Personal Info",
        icon: <User className="h-4 w-4" />,
        count: 1,
        confidence: confidence.sections.basics || 0,
        content: (
          <div className="space-y-2">
            {data.basics?.name && (
              <div>
                <span className="text-muted-foreground">Name:</span>{" "}
                <span className="font-medium">{data.basics.name}</span>
              </div>
            )}
            {data.basics?.label && (
              <div>
                <span className="text-muted-foreground">Title:</span>{" "}
                {data.basics.label}
              </div>
            )}
            {data.basics?.email && (
              <div>
                <span className="text-muted-foreground">Email:</span>{" "}
                {data.basics.email}
              </div>
            )}
            {data.basics?.phone && (
              <div>
                <span className="text-muted-foreground">Phone:</span>{" "}
                {data.basics.phone}
              </div>
            )}
            {data.basics?.location?.city && (
              <div>
                <span className="text-muted-foreground">Location:</span>{" "}
                {[data.basics.location.city, data.basics.location.country]
                  .filter(Boolean)
                  .join(", ")}
              </div>
            )}
            {data.basics?.summary && (
              <div>
                <span className="text-muted-foreground block mb-1">
                  Summary:
                </span>
                <p className="text-xs bg-muted p-2 rounded">
                  {data.basics.summary.substring(0, 200)}
                  {data.basics.summary.length > 200 && "..."}
                </p>
              </div>
            )}
          </div>
        ),
      });
    }

    if (data.work && data.work.length > 0) {
      result.push({
        id: "work",
        title: "Work Experience",
        icon: <Briefcase className="h-4 w-4" />,
        count: data.work.length,
        confidence: confidence.sections.work || 0,
        content: (
          <div className="space-y-3">
            {data.work.map((exp, idx) => (
              <div key={idx} className="p-2 bg-muted/50 rounded">
                <div className="font-medium">
                  {exp.position || "Position not detected"}
                </div>
                <div className="text-muted-foreground">
                  {exp.company || "Company not detected"}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {exp.startDate || "?"} - {exp.endDate || "Present"}
                </div>
                {exp.highlights && exp.highlights.length > 0 && (
                  <div className="text-xs mt-2">
                    {exp.highlights.length} bullet points detected
                  </div>
                )}
              </div>
            ))}
          </div>
        ),
      });
    }

    if (data.education && data.education.length > 0) {
      result.push({
        id: "education",
        title: "Education",
        icon: <GraduationCap className="h-4 w-4" />,
        count: data.education.length,
        confidence: confidence.sections.education || 0,
        content: (
          <div className="space-y-3">
            {data.education.map((edu, idx) => (
              <div key={idx} className="p-2 bg-muted/50 rounded">
                <div className="font-medium">
                  {edu.studyType || ""} {edu.area ? `in ${edu.area}` : ""}
                </div>
                <div className="text-muted-foreground">
                  {edu.institution || "Institution not detected"}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {edu.startDate || "?"} - {edu.endDate || "?"}
                </div>
              </div>
            ))}
          </div>
        ),
      });
    }

    if (data.skills && data.skills.length > 0) {
      result.push({
        id: "skills",
        title: "Skills",
        icon: <Wrench className="h-4 w-4" />,
        count: data.skills.length,
        confidence: confidence.sections.skills || 0,
        content: (
          <div className="flex flex-wrap gap-2">
            {data.skills.slice(0, 20).map((skill, idx) => (
              <span
                key={idx}
                className="px-2 py-1 bg-muted rounded-full text-xs"
              >
                {skill.name}
              </span>
            ))}
            {data.skills.length > 20 && (
              <span className="px-2 py-1 text-xs text-muted-foreground">
                +{data.skills.length - 20} more
              </span>
            )}
          </div>
        ),
      });
    }

    if (data.projects && data.projects.length > 0) {
      result.push({
        id: "projects",
        title: "Projects",
        icon: <FolderKanban className="h-4 w-4" />,
        count: data.projects.length,
        confidence: 60,
        content: (
          <div className="space-y-2">
            {data.projects.map((project, idx) => (
              <div key={idx} className="p-2 bg-muted/50 rounded">
                <div className="font-medium">{project.name}</div>
                {project.description && (
                  <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {project.description}
                  </div>
                )}
              </div>
            ))}
          </div>
        ),
      });
    }

    if (data.certificates && data.certificates.length > 0) {
      result.push({
        id: "certificates",
        title: "Certificates",
        icon: <Award className="h-4 w-4" />,
        count: data.certificates.length,
        confidence: 60,
        content: (
          <div className="space-y-2">
            {data.certificates.map((cert, idx) => (
              <div key={idx} className="p-2 bg-muted/50 rounded">
                <div className="font-medium">{cert.name}</div>
                {cert.issuer && (
                  <div className="text-xs text-muted-foreground">
                    {cert.issuer}
                  </div>
                )}
              </div>
            ))}
          </div>
        ),
      });
    }

    if (data.languages && data.languages.length > 0) {
      result.push({
        id: "languages",
        title: "Languages",
        icon: <Languages className="h-4 w-4" />,
        count: data.languages.length,
        confidence: 70,
        content: (
          <div className="flex flex-wrap gap-2">
            {data.languages.map((lang, idx) => (
              <span
                key={idx}
                className="px-2 py-1 bg-muted rounded-full text-xs"
              >
                {lang.language}
                {lang.fluency && (
                  <span className="text-muted-foreground">
                    {" "}
                    ({lang.fluency})
                  </span>
                )}
              </span>
            ))}
          </div>
        ),
      });
    }

    return result;
  }, [data, confidence]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            Review Imported Data
          </DialogTitle>
          <DialogDescription>
            We extracted the following information from your resume. Review and
            confirm to apply the data.
          </DialogDescription>
        </DialogHeader>

        {/* Confidence overview */}
        <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
          <div className="flex-1">
            <div className="text-sm font-medium">Overall Match Confidence</div>
            <div className="text-xs text-muted-foreground">
              Based on how well we could parse your resume
            </div>
          </div>
          <div
            className={cn(
              "text-2xl font-bold",
              confidence.overall >= 70
                ? "text-green-600"
                : confidence.overall >= 40
                  ? "text-yellow-600"
                  : "text-red-600"
            )}
          >
            {confidence.overall}%
          </div>
        </div>

        {/* Warnings */}
        {warnings.length > 0 && (
          <div className="space-y-2">
            {warnings.map((warning, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded text-xs"
              >
                <AlertTriangle className="h-3.5 w-3.5 text-yellow-600 shrink-0 mt-0.5" />
                <span className="text-yellow-800 dark:text-yellow-200">
                  {warning}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Sections */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {sections.length > 0 ? (
            sections.map((section, idx) => (
              <SectionCard
                key={section.id}
                title={section.title}
                icon={section.icon}
                count={section.count}
                confidence={section.confidence}
                defaultOpen={idx === 0}
              >
                {section.content}
              </SectionCard>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
              <p>No data could be extracted from the file.</p>
              <p className="text-sm">
                Try a different file format or manually enter your information.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="shrink-0 gap-2 sm:gap-0">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            onClick={() => onConfirm(data)}
            disabled={sections.length === 0}
          >
            Apply to Resume
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
