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
  AlertTriangle,
  Loader2,
  TrendingUp,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Lightbulb,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Resume } from "@/db";
import { useLLMSettingsStore } from "@/store/useLLMSettingsStore";
import { ensureLLMProvider } from "@/lib/llm/ensure-provider";
import { buildCareerGapAnalysisPrompt } from "@/lib/llm/prompts";
import { redactContactInfo } from "@/lib/llm/redaction";
import {
  validateCareerGapAnalysis,
  type CareerGapAnalysisData,
} from "@/lib/llm/analysis-validation";
import { generateStructuredOutput } from "@/lib/llm/structured-output";

interface CareerGapAnalysisProps {
  resume: Resume;
  className?: string;
  trigger?: React.ReactNode; // Custom trigger element
  open?: boolean; // Controlled open state
  onOpenChange?: (open: boolean) => void; // Controlled open state handler
}

type AnalysisResult = CareerGapAnalysisData;

const SEVERITY_STYLES: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  minor: {
    bg: "bg-yellow-100 dark:bg-yellow-900/30",
    text: "text-yellow-700 dark:text-yellow-300",
    label: "Minor",
  },
  moderate: {
    bg: "bg-orange-100 dark:bg-orange-900/30",
    text: "text-orange-700 dark:text-orange-300",
    label: "Moderate",
  },
  significant: {
    bg: "bg-red-100 dark:bg-red-900/30",
    text: "text-red-700 dark:text-red-300",
    label: "Significant",
  },
};

const IMPORTANCE_STYLES: Record<string, { bg: string; text: string }> = {
  critical: {
    bg: "bg-red-100 dark:bg-red-900/30",
    text: "text-red-700 dark:text-red-300",
  },
  recommended: {
    bg: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-blue-700 dark:text-blue-300",
  },
  "nice-to-have": {
    bg: "bg-gray-100 dark:bg-gray-800",
    text: "text-gray-600 dark:text-gray-400",
  },
};

export function CareerGapAnalysis({
  resume,
  className,
  trigger,
  open: controlledOpen,
  onOpenChange,
}: CareerGapAnalysisProps) {
  const [internalOpen, setInternalOpen] = useState(false);

  // Use controlled state if provided, otherwise use internal state
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  const providerId = useLLMSettingsStore((state) => state.providerId);
  const apiKeys = useLLMSettingsStore((state) => state.apiKeys);
  const consent = useLLMSettingsStore((state) => state.consent);
  const redaction = useLLMSettingsStore((state) => state.redaction);

  const buildResumeText = useCallback(() => {
    const sections: string[] = [];

    if (resume.basics.name) sections.push(`Name: ${resume.basics.name}`);
    if (resume.basics.label) sections.push(`Title: ${resume.basics.label}`);
    if (resume.basics.summary)
      sections.push(`Summary: ${resume.basics.summary}`);

    resume.work.forEach((w) => {
      const line = [
        `Position: ${w.position}`,
        `Company: ${w.company}`,
        `Period: ${w.startDate} - ${w.endDate || "Present"}`,
        w.location ? `Location: ${w.location}` : "",
        w.summary ? `Description: ${w.summary}` : "",
        w.highlights.length
          ? `Achievements:\n${w.highlights.map((h) => `  - ${h}`).join("\n")}`
          : "",
      ]
        .filter(Boolean)
        .join("\n");
      sections.push(`\nWORK EXPERIENCE:\n${line}`);
    });

    resume.education.forEach((e) => {
      sections.push(
        `\nEDUCATION:\n${e.studyType} ${e.area} at ${e.institution} (${e.startDate} - ${e.endDate})`,
      );
    });

    if (resume.skills.length > 0) {
      const skillText = resume.skills
        .map((s) => `${s.name}: ${s.keywords.join(", ")}`)
        .join("\n");
      sections.push(`\nSKILLS:\n${skillText}`);
    }

    resume.projects.forEach((p) => {
      sections.push(`\nPROJECT: ${p.name}\n${p.description}`);
    });

    resume.certificates.forEach((c) => {
      sections.push(`\nCERTIFICATE: ${c.name} by ${c.issuer} (${c.date})`);
    });

    resume.publications.forEach((p) => {
      sections.push(`\nPUBLICATION: ${p.name} in ${p.publisher}`);
    });

    resume.awards.forEach((a) => {
      sections.push(`\nAWARD: ${a.title} from ${a.awarder} (${a.date})`);
    });

    const text = sections.join("\n");
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
    setAnalysis(null);

    try {
      const resumeText = buildResumeText();
      const structured = await generateStructuredOutput({
        generateText: (prompt, temperature, maxTokens) =>
          result.provider.generateText(result.apiKey, {
            prompt,
            temperature,
            maxTokens,
          }),
        prompt: buildCareerGapAnalysisPrompt(resumeText),
        temperature: 0.2,
        maxTokens: 2048,
        validator: validateCareerGapAnalysis,
        schemaHint:
          "{ gaps:{period:string,duration:string,between:string,severity:'minor'|'moderate'|'significant',suggestion:string}[], missingElements:{element:string,importance:'critical'|'recommended'|'nice-to-have',reason:string,suggestion:string}[], careerProgression:{assessment:string,level:string,consistency:string}, strengths:string[], recommendations:{priority:number,category:string,title:string,description:string}[], overallScore:number(0-100) }",
        repairAttempts: 1,
      });
      if (!structured.ok) {
        setError(structured.error);
        return;
      }
      setAnalysis(structured.data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsAnalyzing(false);
    }
  }, [providerId, apiKeys, consent, buildResumeText]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {(controlledOpen === undefined || trigger) && (
        <DialogTrigger asChild>
          {trigger || (
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "text-primary border-primary/20 hover:bg-primary/10",
                className,
              )}
            >
              <TrendingUp className="h-4 w-4" />
              Career Analysis
            </Button>
          )}
        </DialogTrigger>
      )}
      <DialogContent className="rounded-lg sm:max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Career Gap Analysis
          </DialogTitle>
          <DialogDescription>
            Analyze your resume for employment gaps, missing elements, and
            career progression.
          </DialogDescription>
          <div className="flex items-start gap-2 p-2.5 mt-2 rounded-md bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
            <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
            <p className="text-xs text-blue-700 dark:text-blue-300">
              <span className="font-medium">Requires AI:</span> This feature
              needs an AI provider configured in Settings.
            </p>
          </div>
        </DialogHeader>

        {/* Action bar */}
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={handleAnalyze} disabled={isAnalyzing} size="sm">
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <TrendingUp className="h-4 w-4" />
                {analysis ? "Re-analyze" : "Analyze Resume"}
              </>
            )}
          </Button>
          {analysis && (
            <div className="ml-auto flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                Overall Score:
              </span>
              <span
                className={cn(
                  "text-lg font-bold",
                  getScoreColor(analysis.overallScore),
                )}
              >
                {analysis.overallScore}/100
              </span>
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
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {!analysis && !isAnalyzing && !error && (
            <div className="text-center py-12 text-muted-foreground">
              <TrendingUp className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">
                Click &quot;Analyze Resume&quot; to get career insights.
              </p>
            </div>
          )}

          {analysis && (
            <>
              {/* Career Progression */}
              {analysis.careerProgression && (
                <div className="rounded-lg border p-4 space-y-2">
                  <h3 className="font-medium flex items-center gap-2 text-sm">
                    <Target className="h-4 w-4 text-primary" />
                    Career Progression
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {analysis.careerProgression.assessment}
                  </p>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="capitalize">
                      {analysis.careerProgression.level} Level
                    </Badge>
                    <Badge
                      variant="outline"
                      className={cn(
                        "capitalize",
                        analysis.careerProgression.consistency === "consistent"
                          ? "text-green-600 border-green-200"
                          : analysis.careerProgression.consistency === "mixed"
                            ? "text-yellow-600 border-yellow-200"
                            : "text-red-600 border-red-200",
                      )}
                    >
                      {analysis.careerProgression.consistency}
                    </Badge>
                  </div>
                </div>
              )}

              {/* Employment Gaps */}
              {analysis.gaps && analysis.gaps.length > 0 && (
                <div className="rounded-lg border p-4 space-y-3">
                  <h3 className="font-medium flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-orange-500" />
                    Employment Gaps
                    <Badge variant="secondary" className="text-xs">
                      {analysis.gaps.length}
                    </Badge>
                  </h3>
                  {analysis.gaps.map((gap, i) => {
                    const style =
                      SEVERITY_STYLES[gap.severity] || SEVERITY_STYLES.minor;
                    return (
                      <div
                        key={i}
                        className={cn("rounded p-3 space-y-1", style.bg)}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={cn("text-xs font-medium", style.text)}
                          >
                            {style.label}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {gap.period} ({gap.duration})
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {gap.between}
                        </p>
                        <p className="text-xs">
                          <span className="font-medium">Suggestion:</span>{" "}
                          {gap.suggestion}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}

              {analysis.gaps && analysis.gaps.length === 0 && (
                <div className="rounded-lg border p-4 flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  No significant employment gaps detected
                </div>
              )}

              {/* Missing Elements */}
              {analysis.missingElements &&
                analysis.missingElements.length > 0 && (
                  <div className="rounded-lg border p-4 space-y-3">
                    <h3 className="font-medium flex items-center gap-2 text-sm">
                      <AlertCircle className="h-4 w-4 text-blue-500" />
                      Missing or Weak Elements
                      <Badge variant="secondary" className="text-xs">
                        {analysis.missingElements.length}
                      </Badge>
                    </h3>
                    {analysis.missingElements.map((elem, i) => {
                      const style =
                        IMPORTANCE_STYLES[elem.importance] ||
                        IMPORTANCE_STYLES["nice-to-have"];
                      return (
                        <div key={i} className="rounded border p-3 space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge
                              className={cn("text-xs", style.bg, style.text)}
                              variant="secondary"
                            >
                              {elem.importance}
                            </Badge>
                            <span className="text-sm font-medium">
                              {elem.element}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {elem.reason}
                          </p>
                          <p className="text-xs">
                            <span className="font-medium">Suggestion:</span>{" "}
                            {elem.suggestion}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}

              {/* Strengths */}
              {analysis.strengths && analysis.strengths.length > 0 && (
                <div className="rounded-lg border p-4 space-y-2">
                  <h3 className="font-medium flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Strengths
                  </h3>
                  <ul className="space-y-1">
                    {analysis.strengths.map((s, i) => (
                      <li key={i} className="text-sm flex items-start gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-500 mt-0.5 shrink-0" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommendations */}
              {analysis.recommendations &&
                analysis.recommendations.length > 0 && (
                  <div className="rounded-lg border p-4 space-y-3">
                    <h3 className="font-medium flex items-center gap-2 text-sm">
                      <Lightbulb className="h-4 w-4 text-yellow-500" />
                      Recommendations
                    </h3>
                    {analysis.recommendations
                      .sort((a, b) => a.priority - b.priority)
                      .map((rec, i) => (
                        <div key={i} className="flex gap-3 items-start">
                          <span className="shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">
                            {rec.priority}
                          </span>
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">
                                {rec.title}
                              </span>
                              <Badge
                                variant="outline"
                                className="text-xs capitalize"
                              >
                                {rec.category}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {rec.description}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
