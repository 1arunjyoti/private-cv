"use client";

import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Resume } from "@/db";
import { useLLMSettingsStore } from "@/store/useLLMSettingsStore";
import { useResumeStore } from "@/store/useResumeStore";
import { ensureLLMProvider } from "@/lib/llm/ensure-provider";
import { parseLLMJson } from "@/lib/llm/json";
import { buildConsistencyCheckPrompt } from "@/lib/llm/prompts";
import { redactContactInfo } from "@/lib/llm/redaction";

interface ConsistencyCheckerProps {
  resume: Resume;
  className?: string;
  trigger?: React.ReactNode; // Custom trigger element
  open?: boolean; // Controlled open state
  onOpenChange?: (open: boolean) => void; // Controlled open state handler
}

interface ConsistencyIssue {
  type: "tense" | "punctuation" | "passive" | "formatting" | "style";
  description: string;
  location: string;
  original: string;
  fix: string;
  severity: "high" | "medium" | "low";
}

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  tense: { label: "Tense", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300" },
  punctuation: { label: "Punctuation", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" },
  passive: { label: "Passive Voice", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300" },
  formatting: { label: "Formatting", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300" },
  style: { label: "Style", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" },
};

const SEVERITY_COLORS: Record<string, string> = {
  high: "text-red-600 dark:text-red-400",
  medium: "text-yellow-600 dark:text-yellow-400",
  low: "text-muted-foreground",
};

export function ConsistencyChecker({ resume, className, trigger, open: controlledOpen, onOpenChange }: ConsistencyCheckerProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  
  // Use controlled state if provided, otherwise use internal state
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [issues, setIssues] = useState<ConsistencyIssue[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [appliedFixes, setAppliedFixes] = useState<Set<number>>(new Set());

  const providerId = useLLMSettingsStore((state) => state.providerId);
  const apiKeys = useLLMSettingsStore((state) => state.apiKeys);
  const consent = useLLMSettingsStore((state) => state.consent);
  const redaction = useLLMSettingsStore((state) => state.redaction);
  const updateCurrentResume = useResumeStore((state) => state.updateCurrentResume);

  const buildResumeText = useCallback(() => {
    const sections: string[] = [];

    if (resume.basics.summary) {
      sections.push(`SUMMARY:\n${resume.basics.summary}`);
    }

    resume.work.forEach((w) => {
      const header = `WORK: ${w.position} at ${w.company} (${w.startDate} - ${w.endDate || "Present"})`;
      const body = [w.summary, ...w.highlights].filter(Boolean).join("\n");
      sections.push(`${header}\n${body}`);
    });

    resume.education.forEach((e) => {
      const header = `EDUCATION: ${e.studyType} ${e.area} at ${e.institution} (${e.startDate} - ${e.endDate})`;
      const body = [e.summary, ...e.courses].filter(Boolean).join("\n");
      sections.push(`${header}\n${body}`);
    });

    resume.projects.forEach((p) => {
      const header = `PROJECT: ${p.name}`;
      const body = [p.description, ...p.highlights].filter(Boolean).join("\n");
      sections.push(`${header}\n${body}`);
    });

    resume.certificates.forEach((c) => {
      sections.push(`CERTIFICATE: ${c.name} by ${c.issuer}\n${c.summary || ""}`);
    });

    resume.awards.forEach((a) => {
      sections.push(`AWARD: ${a.title} by ${a.awarder}\n${a.summary || ""}`);
    });

    resume.publications.forEach((p) => {
      sections.push(`PUBLICATION: ${p.name} in ${p.publisher}\n${p.summary || ""}`);
    });

    const text = sections.join("\n\n");
    return redaction.stripContactInfo ? redactContactInfo(text) : text;
  }, [resume, redaction.stripContactInfo]);

  const handleAnalyze = useCallback(async () => {
    const result = ensureLLMProvider({
      providerId,
      apiKeys,
      consent,
      requiredConsent: "analysis",
    });

    if ("error" in result) {
      setError(result.error);
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setIssues([]);
    setAppliedFixes(new Set());

    try {
      const resumeText = buildResumeText();
      const output = await result.provider.generateText(result.apiKey, {
        prompt: buildConsistencyCheckPrompt(resumeText),
        temperature: 0.3,
        maxTokens: 2048,
      });

      const parsed = parseLLMJson<{ issues?: ConsistencyIssue[] }>(output, {
        sanitizeMultilineStrings: true,
      });
      if (!parsed) {
        setError("Could not parse AI response. Please try again.");
        return;
      }

      if (parsed.issues && Array.isArray(parsed.issues)) {
        setIssues(parsed.issues);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsAnalyzing(false);
    }
  }, [providerId, apiKeys, consent, buildResumeText]);

  const handleApplyFix = useCallback(
    (issue: ConsistencyIssue, index: number) => {
      if (!issue.original || !issue.fix) return;

      // Search through the resume and replace the original text with fix
      const updates: Partial<Resume> = {};
      // Strip bullet markers (•, -, *) from both sides to avoid doubling
      const stripBullet = (text: string) => text.trim().replace(/^[•\-\*]\s*/, "");
      const original = stripBullet(issue.original);
      const fix = stripBullet(issue.fix);

      // Check summary
      if (resume.basics.summary.includes(original)) {
        updates.basics = {
          ...resume.basics,
          summary: resume.basics.summary.replace(original, fix),
        };
      }

      // Check work
      const updatedWork = resume.work.map((w) => {
        let changed = false;
        let summary = w.summary;
        let highlights = [...w.highlights];
        if (w.summary.includes(original)) {
          summary = w.summary.replace(original, fix);
          changed = true;
        }
        highlights = highlights.map((h) => {
          const stripped = stripBullet(h);
          if (stripped === original) {
            changed = true;
            return fix;
          }
          if (stripped.includes(original)) {
            changed = true;
            return stripped.replace(original, fix);
          }
          if (h.includes(original)) {
            changed = true;
            return h.replace(original, fix);
          }
          return h;
        });
        return changed ? { ...w, summary, highlights } : w;
      });
      if (updatedWork.some((w, i) => w !== resume.work[i])) {
        updates.work = updatedWork;
      }

      // Check projects
      const updatedProjects = resume.projects.map((p) => {
        let changed = false;
        let description = p.description;
        let highlights = [...p.highlights];
        if (p.description.includes(original)) {
          description = p.description.replace(original, fix);
          changed = true;
        }
        highlights = highlights.map((h) => {
          const stripped = stripBullet(h);
          if (stripped === original) {
            changed = true;
            return fix;
          }
          if (stripped.includes(original)) {
            changed = true;
            return stripped.replace(original, fix);
          }
          if (h.includes(original)) {
            changed = true;
            return h.replace(original, fix);
          }
          return h;
        });
        return changed ? { ...p, description, highlights } : p;
      });
      if (updatedProjects.some((p, i) => p !== resume.projects[i])) {
        updates.projects = updatedProjects;
      }

      // Check education
      const updatedEducation = resume.education.map((e) => {
        let changed = false;
        let summary = e.summary || "";
        let courses = [...(e.courses || [])];
        
        if (e.summary && e.summary.includes(original)) {
          summary = e.summary.replace(original, fix);
          changed = true;
        }
        
        courses = courses.map((c) => {
          if (c.includes(original)) {
            changed = true;
            return c.replace(original, fix);
          }
          return c;
        });
        
        return changed ? { ...e, summary, courses } : e;
      });
      if (updatedEducation.some((e, i) => e !== resume.education[i])) {
        updates.education = updatedEducation;
      }

      // Check certificates
      const updatedCertificates = resume.certificates.map((c) => {
        if (c.summary && c.summary.includes(original)) {
          return { ...c, summary: c.summary.replace(original, fix) };
        }
        if (c.name.includes(original)) {
          return { ...c, name: c.name.replace(original, fix) };
        }
        return c;
      });
      if (updatedCertificates.some((c, i) => c !== resume.certificates[i])) {
        updates.certificates = updatedCertificates;
      }

      // Check awards
      const updatedAwards = resume.awards.map((a) => {
        if (a.summary && a.summary.includes(original)) {
          return { ...a, summary: a.summary.replace(original, fix) };
        }
        if (a.title.includes(original)) {
          return { ...a, title: a.title.replace(original, fix) };
        }
        return a;
      });
      if (updatedAwards.some((a, i) => a !== resume.awards[i])) {
        updates.awards = updatedAwards;
      }

      // Check publications
      const updatedPublications = resume.publications.map((p) => {
        if (p.summary && p.summary.includes(original)) {
          return { ...p, summary: p.summary.replace(original, fix) };
        }
        if (p.name.includes(original)) {
          return { ...p, name: p.name.replace(original, fix) };
        }
        return p;
      });
      if (updatedPublications.some((p, i) => p !== resume.publications[i])) {
        updates.publications = updatedPublications;
      }

      if (Object.keys(updates).length > 0) {
        updateCurrentResume(updates);
      }

      setAppliedFixes((prev) => new Set(prev).add(index));
    },
    [resume, updateCurrentResume],
  );

  const handleApplyAll = useCallback(() => {
    issues.forEach((issue, index) => {
      if (!appliedFixes.has(index) && issue.original && issue.fix) {
        handleApplyFix(issue, index);
      }
    });
  }, [issues, appliedFixes, handleApplyFix]);

  const highCount = issues.filter((i) => i.severity === "high").length;
  const medCount = issues.filter((i) => i.severity === "medium").length;
  const lowCount = issues.filter((i) => i.severity === "low").length;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {(controlledOpen === undefined || trigger) && (
        <DialogTrigger asChild>
          {trigger || (
            <Button
              variant="outline"
              size="sm"
              className={cn("text-primary border-primary/20 hover:bg-primary/10", className)}
            >
              <ShieldCheck className="h-4 w-4" />
              Consistency
            </Button>
          )}
        </DialogTrigger>
      )}
      <DialogContent className="rounded-lg sm:max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            Consistency Checker
          </DialogTitle>
          <DialogDescription>
            Scan your resume for tense, punctuation, formatting, and style inconsistencies.
          </DialogDescription>
          <div className="flex items-start gap-2 p-2.5 mt-2 rounded-md bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
            <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
            <p className="text-xs text-blue-700 dark:text-blue-300"><span className="font-medium">Requires AI:</span> This feature needs an AI provider configured in Settings.</p>
          </div>
        </DialogHeader>

        {/* Action bar */}
        <div className="flex items-center gap-2">
          <Button onClick={handleAnalyze} disabled={isAnalyzing} size="sm">
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <ShieldCheck className="h-4 w-4" />
                {issues.length > 0 ? "Re-scan" : "Scan Resume"}
              </>
            )}
          </Button>
          {issues.length > 0 && appliedFixes.size < issues.length && (
            <Button onClick={handleApplyAll} size="sm" variant="outline">
              Apply All Fixes
            </Button>
          )}
          {issues.length > 0 && (
            <div className="ml-auto flex items-center gap-2 text-xs">
              {highCount > 0 && (
                <Badge variant="outline" className="text-red-600 border-red-200">
                  {highCount} High
                </Badge>
              )}
              {medCount > 0 && (
                <Badge variant="outline" className="text-yellow-600 border-yellow-200">
                  {medCount} Medium
                </Badge>
              )}
              {lowCount > 0 && (
                <Badge variant="outline" className="text-muted-foreground">
                  {lowCount} Low
                </Badge>
              )}
            </div>
          )}
        </div>

        {error && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Results */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {issues.length === 0 && !isAnalyzing && !error && (
            <div className="text-center py-12 text-muted-foreground">
              <ShieldCheck className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Click &quot;Scan Resume&quot; to check for consistency issues.</p>
            </div>
          )}

          {issues.length > 0 && issues.every((_, i) => appliedFixes.has(i)) && (
            <div className="text-center py-8">
              <CheckCircle2 className="h-10 w-10 mx-auto mb-3 text-green-500" />
              <p className="font-medium text-green-700 dark:text-green-400">All fixes applied!</p>
              <p className="text-sm text-muted-foreground mt-1">Your resume is now consistent.</p>
            </div>
          )}

          {issues.map((issue, index) => (
            <div
              key={index}
              className={cn(
                "rounded-lg border p-3 space-y-2 transition-opacity",
                appliedFixes.has(index) && "opacity-50",
              )}
            >
              <div className="flex items-center gap-2 flex-wrap">
                <Badge
                  variant="secondary"
                  className={cn("text-xs", TYPE_LABELS[issue.type]?.color)}
                >
                  {TYPE_LABELS[issue.type]?.label || issue.type}
                </Badge>
                <span className={cn("text-xs font-medium", SEVERITY_COLORS[issue.severity])}>
                  {issue.severity}
                </span>
                <span className="text-xs text-muted-foreground ml-auto">
                  {issue.location}
                </span>
              </div>

              <p className="text-sm">{issue.description}</p>

              {issue.original && issue.fix && (
                <div className="flex items-center gap-2 text-xs bg-muted/50 rounded p-2">
                  <span className="line-through text-muted-foreground">{issue.original}</span>
                  <ArrowRight className="h-3 w-3 shrink-0 text-muted-foreground" />
                  <span className="font-medium text-green-700 dark:text-green-400">{issue.fix}</span>
                </div>
              )}

              {!appliedFixes.has(index) && issue.original && issue.fix && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6 text-xs"
                  onClick={() => handleApplyFix(issue, index)}
                >
                  Apply Fix
                </Button>
              )}
              {appliedFixes.has(index) && (
                <span className="text-xs text-green-600 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Applied
                </span>
              )}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
