"use client";

import React, { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { calculateATSScore, type ATSCheck } from "@/lib/ats-score";
import { type Resume } from "@/db";
import {
  CheckCircle,
  AlertCircle,
  Target,
  Trophy,
  Info,
  AlertTriangle,
  Sparkles,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLLMSettingsStore } from "@/store/useLLMSettingsStore";
import { ensureLLMProvider } from "@/lib/llm/ensure-provider";
import { parseLLMJson } from "@/lib/llm/json";
import { buildATSAnalysisPrompt } from "@/lib/llm/prompts";
import { redactContactInfo } from "@/lib/llm/redaction";

interface AIATSAnalysis {
  score: number;
  strengths: string[];
  criticalIssues: string[];
  improvements: string[];
  keywordSuggestions: string[];
  formatIssues: string[];
  summaryFeedback: string;
  bulletFeedback: { original: string; improved: string; reason: string }[];
}

interface ATSScoreProps {
  resume: Resume | null;
  className?: string; // Allow custom styling for the trigger button
  trigger?: React.ReactNode; // Custom trigger element
  open?: boolean; // Controlled open state
  onOpenChange?: (open: boolean) => void; // Controlled open state handler
}

function CheckItem({ check }: { check: ATSCheck }) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 p-3 rounded-lg border transition-colors",
        check.passed
          ? "bg-green-50/50 border-green-100 dark:bg-green-900/10 dark:border-green-800"
          : "bg-red-50/50 border-red-100 dark:bg-red-900/10 dark:border-red-800",
      )}
    >
      <div className="mt-0.5 shrink-0">
        {check.passed ? (
          <CheckCircle className="size-4 text-green-600" />
        ) : (
          <AlertCircle className="size-4 text-red-600" />
        )}
      </div>
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <p
            className={cn(
              "font-medium text-sm",
              check.passed
                ? "text-green-900 dark:text-green-100"
                : "text-red-900 dark:text-red-100",
            )}
          >
            {check.name}
          </p>
          <span className="text-xs font-mono text-muted-foreground/70">
            {check.score}/{check.maxScore}
          </span>
        </div>
        <p
          className={cn(
            "text-xs",
            check.passed
              ? "text-green-700 dark:text-green-300"
              : "text-red-700 dark:text-red-300",
          )}
        >
          {check.message}
        </p>

        {/* Show extra details for failures if available */}
        {check.details && check.details.length > 0 && (
          <div className="mt-2 text-xs bg-white/50 dark:bg-black/20 rounded p-2">
            <p className="font-semibold mb-1 flex items-center gap-1 opacity-80">
              <Info className="size-3" />{" "}
              {check.passed ? "Details:" : "Issues found:"}
            </p>
            <ul className="list-disc list-inside space-y-0.5 opacity-80">
              {check.details.map((detail, idx) => (
                <li key={idx} className="truncate">
                  {detail}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export function ATSScore({ resume, className, trigger, open: controlledOpen, onOpenChange }: ATSScoreProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  
  // Use controlled state if provided, otherwise use internal state
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;
  
  const [jobDescription, setJobDescription] = useState("");
  const [aiAnalysis, setAiAnalysis] = useState<AIATSAnalysis | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);

  const providerId = useLLMSettingsStore((state) => state.providerId);
  const apiKeys = useLLMSettingsStore((state) => state.apiKeys);
  const consent = useLLMSettingsStore((state) => state.consent);
  const redaction = useLLMSettingsStore((state) => state.redaction);

  const scoreResult = useMemo(() => {
    if (!resume) return null;
    return calculateATSScore(resume, jobDescription);
  }, [resume, jobDescription]);

  const buildResumeText = useCallback(() => {
    if (!resume) return "";
    const parts: string[] = [];
    if (resume.basics.name) parts.push(`Name: ${resume.basics.name}`);
    if (resume.basics.label) parts.push(`Title: ${resume.basics.label}`);
    if (resume.basics.summary) parts.push(`Summary: ${resume.basics.summary}`);
    if (resume.skills.length) {
      parts.push(`Skills: ${resume.skills.map((s) => [s.name, ...s.keywords].filter(Boolean).join(": ")).join(" | ")}`);
    }
    if (resume.work.length) {
      resume.work.forEach((w) => {
        const line = [`${w.position} at ${w.company}`, w.summary, ...(w.highlights || [])].filter(Boolean).join(" | ");
        parts.push(`Work: ${line}`);
      });
    }
    if (resume.education.length) {
      resume.education.forEach((e) => {
        parts.push(`Education: ${[e.studyType, e.area, e.institution].filter(Boolean).join(" | ")}`);
      });
    }
    if (resume.projects.length) {
      resume.projects.forEach((p) => {
        const line = [p.name, p.description, ...(p.highlights || [])].filter(Boolean).join(" | ");
        parts.push(`Project: ${line}`);
      });
    }
    if (resume.certificates.length) {
      parts.push(`Certificates: ${resume.certificates.map((c) => [c.name, c.issuer].filter(Boolean).join(" from ")).join(", ")}`);
    }
    const raw = parts.join("\n");
    return redaction.stripContactInfo ? redactContactInfo(raw) : raw;
  }, [resume, redaction.stripContactInfo]);

  const parseLLMOutput = useCallback((output: string) => {
    return parseLLMJson<Record<string, unknown>>(output, {
      sanitizeMultilineStrings: true,
    });
  }, []);

  const handleAIAnalysis = useCallback(async () => {
    setAiError(null);
    setAiAnalysis(null);

    const result = ensureLLMProvider({
      providerId,
      apiKeys,
      consent,
      requiredConsent: "analysis",
    });
    if ("error" in result) {
      setAiError(result.error);
      return;
    }

    setIsAiAnalyzing(true);
    try {
      const resumeText = buildResumeText();
      const jd = jobDescription.trim()
        ? (redaction.stripContactInfo ? redactContactInfo(jobDescription) : jobDescription)
        : undefined;
      const output = await result.provider.generateText(result.apiKey, {
        prompt: buildATSAnalysisPrompt(resumeText, jd),
        temperature: 0.3,
        maxTokens: 1024,
      });
      const parsed = parseLLMOutput(output);
      if (!parsed) {
        setAiError("Failed to parse AI response. Try again.");
        return;
      }
      setAiAnalysis({
        score: typeof parsed.score === "number" ? parsed.score : 0,
        strengths: Array.isArray(parsed.strengths) ? parsed.strengths.map(String) : [],
        criticalIssues: Array.isArray(parsed.criticalIssues) ? parsed.criticalIssues.map(String) : [],
        improvements: Array.isArray(parsed.improvements) ? parsed.improvements.map(String) : [],
        keywordSuggestions: Array.isArray(parsed.keywordSuggestions) ? parsed.keywordSuggestions.map(String) : [],
        formatIssues: Array.isArray(parsed.formatIssues) ? parsed.formatIssues.map(String) : [],
        summaryFeedback: typeof parsed.summaryFeedback === "string" ? parsed.summaryFeedback : "",
        bulletFeedback: Array.isArray(parsed.bulletFeedback)
          ? parsed.bulletFeedback.filter((b: unknown) => b && typeof b === "object")
          : [],
      });
    } catch (err) {
      setAiError((err as Error).message);
    } finally {
      setIsAiAnalyzing(false);
    }
  }, [apiKeys, buildResumeText, consent, jobDescription, parseLLMOutput, providerId, redaction.stripContactInfo]);

  const scoreStartColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const scoreRingColor = (score: number) => {
    if (score >= 80) return "stroke-green-500";
    if (score >= 60) return "stroke-yellow-500";
    return "stroke-red-500";
  };

  if (!resume) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {(controlledOpen === undefined || trigger) && (
        <DialogTrigger asChild>
          {trigger || (
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "text-primary border-primary/20 hover:bg-primary/10 gap-2 relative",
                className,
              )}
            >
              <Target className="size-4" />
              Check ATS Score
              <Badge
                variant="secondary"
                className="text-xs font-medium text-muted-foreground bg-muted-foreground/10 rounded-full px-2 py-0.5"
              >
                Beta
              </Badge>
            </Button>
          )}
        </DialogTrigger>
      )}
      <DialogContent className="w-full sm:max-w-6xl max-h-[90vh] overflow-y-auto rounded-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="size-5 text-yellow-500" />
            ATS Score Analysis
            <Badge
              variant="outline"
              className="text-muted-foreground font-normal text-xs uppercase tracking-wider ml-2"
            >
              Beta
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Optimize your resume for Applicant Tracking Systems. Add a Job
            Description to get a relevance score.
          </DialogDescription>
        </DialogHeader>

        {/* Disclaimer Alert */}
        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-lg p-3 text-xs text-amber-900 dark:text-amber-200 flex gap-2 items-start mt-1">
          <AlertTriangle className="size-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
          <p>
            <strong>Disclaimer:</strong> This is a basic analysis tool. While it
            helps identify common issues, we recommend using professional
            services like Resume Worded for a more comprehensive ATS scoring and
            targeted feedback.
            <br />
            <br />
            This tool is currently in beta and may not be accurate in all cases.
            Work in progress to match professional ATS scoring tools as closely
            as possible.
          </p>
        </div>

        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label
              htmlFor="jd"
              className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
            >
              Target Job Description (Optional)
            </Label>
            <Textarea
              id="jd"
              placeholder="Paste the job description here to check for keyword matching..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="min-h-25 text-sm resize-y"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleAIAnalysis}
              disabled={isAiAnalyzing}
              className="gap-2"
            >
              {isAiAnalyzing ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Sparkles className="size-3.5" />
              )}
              AI Deep Analysis
            </Button>
          </div>

          {/* AI Analysis Panel */}
          {(aiAnalysis || aiError) && (
            <div className="rounded-xl border bg-linear-to-b from-purple-50/50 to-background dark:from-purple-900/10 p-4 space-y-4">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <Sparkles className="size-4 text-purple-500" />
                AI-Powered Analysis
                {aiAnalysis && aiAnalysis.score > 0 && (
                  <Badge
                    variant="outline"
                    className={cn(
                      "ml-auto",
                      aiAnalysis.score >= 80
                        ? "text-green-600 border-green-300"
                        : aiAnalysis.score >= 60
                          ? "text-yellow-600 border-yellow-300"
                          : "text-red-600 border-red-300"
                    )}
                  >
                    AI Score: {aiAnalysis.score}/100
                  </Badge>
                )}
              </h4>

              {aiError && (
                <p className="text-sm text-destructive">{aiError}</p>
              )}

              {aiAnalysis && (
                <>
                  {/* Summary Feedback */}
                  {aiAnalysis.summaryFeedback && (
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Summary Feedback</p>
                      <p className="text-sm text-muted-foreground">{aiAnalysis.summaryFeedback}</p>
                    </div>
                  )}

                  {/* Critical Issues */}
                  {aiAnalysis.criticalIssues.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-red-600 uppercase tracking-wider flex items-center gap-1">
                        <AlertCircle className="size-3" />
                        Critical Issues
                      </p>
                      <ul className="space-y-1">
                        {aiAnalysis.criticalIssues.map((issue, i) => (
                          <li key={i} className="text-xs text-red-700 dark:text-red-300 flex gap-1.5">
                            <span className="text-red-500 shrink-0">•</span>
                            {issue}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Strengths */}
                  {aiAnalysis.strengths.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-green-600 uppercase tracking-wider flex items-center gap-1">
                        <CheckCircle className="size-3" />
                        Strengths
                      </p>
                      <ul className="space-y-1">
                        {aiAnalysis.strengths.map((s, i) => (
                          <li key={i} className="text-xs text-green-700 dark:text-green-300 flex gap-1.5">
                            <span className="text-green-500 shrink-0">•</span>
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Improvements */}
                  {aiAnalysis.improvements.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ranked Improvements</p>
                      <ol className="space-y-1 list-decimal list-inside">
                        {aiAnalysis.improvements.map((imp, i) => (
                          <li key={i} className="text-xs text-muted-foreground">{imp}</li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {/* Keyword Suggestions */}
                  {aiAnalysis.keywordSuggestions.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Suggested Keywords</p>
                      <div className="flex flex-wrap gap-1.5">
                        {aiAnalysis.keywordSuggestions.map((kw, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">{kw}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Format Issues */}
                  {aiAnalysis.formatIssues.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Format Issues</p>
                      <ul className="space-y-1">
                        {aiAnalysis.formatIssues.map((fi, i) => (
                          <li key={i} className="text-xs text-muted-foreground flex gap-1.5">
                            <Info className="size-3 shrink-0 mt-0.5" />
                            {fi}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Bullet Rewrites */}
                  {aiAnalysis.bulletFeedback.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Bullet Rewrites</p>
                      {aiAnalysis.bulletFeedback.map((bf, i) => (
                        <div key={i} className="rounded border p-2 space-y-1 text-xs">
                          <div className="text-red-600 dark:text-red-400 line-through">{bf.original}</div>
                          <div className="text-green-600 dark:text-green-400">{bf.improved}</div>
                          <div className="text-muted-foreground italic">{bf.reason}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {scoreResult && (
            <div className="grid gap-6 py-4 lg:grid-cols-[320px,1fr]">
              {/* Left: Score Summary */}
              <div className="space-y-4">
                <div className="rounded-xl border bg-muted/30 p-4">
                  <div className="flex flex-col items-center justify-center">
                    <div className="relative size-32">
                      <svg
                        className="size-full -rotate-90"
                        viewBox="0 0 100 100"
                      >
                        <circle
                          className="stroke-muted"
                          strokeWidth="8"
                          fill="transparent"
                          r="40"
                          cx="50"
                          cy="50"
                        />
                        <circle
                          className={cn(
                            scoreRingColor(scoreResult.totalScore),
                            "transition-all duration-1000 ease-out",
                          )}
                          strokeWidth="8"
                          strokeLinecap="round"
                          fill="transparent"
                          r="40"
                          cx="50"
                          cy="50"
                          strokeDasharray={`${2 * Math.PI * 40}`}
                          strokeDashoffset={`${2 * Math.PI * 40 * (1 - scoreResult.totalScore / 100)}`}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span
                          className={cn(
                            "text-3xl font-bold",
                            scoreStartColor(scoreResult.totalScore),
                          )}
                        >
                          {scoreResult.totalScore}
                        </span>
                        <span className="text-xs text-muted-foreground uppercase tracking-widest">
                          Score
                        </span>
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-center text-muted-foreground max-w-xs">
                      {scoreResult.totalScore >= 80
                        ? "Your resume is well-optimized!"
                        : scoreResult.totalScore >= 50
                          ? "Good start, but needs improvement."
                          : "Needs significant work to pass ATS filters."}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border bg-background p-4">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                    Subscores
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-xs">
                      ATS: {scoreResult.atsScore}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Readability: {scoreResult.readabilityScore}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Coverage: {scoreResult.coverageScore}
                    </Badge>
                    {typeof scoreResult.matchScore === "number" && (
                      <Badge variant="outline" className="text-xs">
                        JD Match: {scoreResult.matchScore}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="rounded-xl border bg-background p-4">
                  <h4 className="font-medium mb-2 flex items-center gap-2 text-sm">
                    <AlertTriangle className="size-4" />
                    Top 3 Fixes
                  </h4>
                  {scoreResult.prioritizedFixes.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No high-priority issues found.
                    </p>
                  ) : (
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                      {scoreResult.prioritizedFixes.slice(0, 3).map((fix) => (
                        <li key={fix.id}>
                          <strong className="text-foreground">
                            {fix.title}:
                          </strong>{" "}
                          {fix.action}{" "}
                          <span className="text-muted-foreground">
                            ({fix.rationale})
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Right: Detailed Breakdown */}
              <div className="space-y-6">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                  Detailed Breakdown
                </h3>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold uppercase text-muted-foreground/80 flex items-center gap-2">
                      <Target className="size-3" /> Impact & Reach
                    </h4>
                    {scoreResult.checks
                      .filter((c) => c.category === "impact")
                      .map((check) => (
                        <CheckItem key={check.id} check={check} />
                      ))}
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold uppercase text-muted-foreground/80 flex items-center gap-2">
                      <Trophy className="size-3" /> Content Quality
                    </h4>
                    {scoreResult.checks
                      .filter((c) => c.category === "content")
                      .map((check) => (
                        <CheckItem key={check.id} check={check} />
                      ))}
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold uppercase text-muted-foreground/80 flex items-center gap-2">
                      <CheckCircle className="size-3" /> Formatting
                    </h4>
                    {scoreResult.checks
                      .filter((c) => c.category === "formatting")
                      .map((check) => (
                        <CheckItem key={check.id} check={check} />
                      ))}
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold uppercase text-muted-foreground/80 flex items-center gap-2">
                      <Info className="size-3" /> Readability
                    </h4>
                    {scoreResult.checks
                      .filter((c) => c.category === "readability")
                      .map((check) => (
                        <CheckItem key={check.id} check={check} />
                      ))}
                  </div>
                </div>

                {scoreResult.readabilityNotes.length > 0 && (
                  <div className="bg-muted/40 p-4 rounded-lg text-sm text-muted-foreground">
                    <div className="text-xs uppercase tracking-wider mb-2">
                      Readability Notes
                    </div>
                    <ul className="list-disc list-inside space-y-1">
                      {scoreResult.readabilityNotes.map((note, idx) => (
                        <li key={`readability-note-${idx}`}>{note}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Keyword Match */}
              {scoreResult.keywordMatch && (
                <div className="bg-muted/40 p-4 rounded-lg space-y-3">
                  <h4 className="font-medium mb-1 flex items-center gap-2 text-sm">
                    <Target className="size-4" />
                    Job Description Match
                  </h4>
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider">
                      Top Missing Priorities
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div>
                        Skills:{" "}
                        {scoreResult.keywordMatch.prioritizedMissing.skills
                          .length > 0
                          ? scoreResult.keywordMatch.prioritizedMissing.skills.join(
                              ", ",
                            )
                          : "None"}
                      </div>
                      <div>
                        Tools:{" "}
                        {scoreResult.keywordMatch.prioritizedMissing.tools
                          .length > 0
                          ? scoreResult.keywordMatch.prioritizedMissing.tools.join(
                              ", ",
                            )
                          : "None"}
                      </div>
                      <div>
                        Responsibilities:{" "}
                        {scoreResult.keywordMatch.prioritizedMissing
                          .responsibilities.length > 0
                          ? scoreResult.keywordMatch.prioritizedMissing.responsibilities.join(
                              ", ",
                            )
                          : "None"}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider pt-2">
                      Suggested Placement
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Skills:{" "}
                      {scoreResult.keywordMatch.suggestedPlacement.skills}
                      <br />
                      Tools: {scoreResult.keywordMatch.suggestedPlacement.tools}
                      <br />
                      Responsibilities:{" "}
                      {
                        scoreResult.keywordMatch.suggestedPlacement
                          .responsibilities
                      }
                    </div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider">
                      Missing Skills
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {scoreResult.keywordMatch.categories.skills.missing
                        .length > 0 ? (
                        scoreResult.keywordMatch.categories.skills.missing
                          .slice(0, 10)
                          .map((term) => (
                            <Badge
                              key={`miss-skill-${term}`}
                              variant="secondary"
                              className="text-xs"
                            >
                              {term}
                            </Badge>
                          ))
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          No major skill gaps.
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider pt-2">
                      Missing Tools
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {scoreResult.keywordMatch.categories.tools.missing
                        .length > 0 ? (
                        scoreResult.keywordMatch.categories.tools.missing
                          .slice(0, 10)
                          .map((term) => (
                            <Badge
                              key={`miss-tool-${term}`}
                              variant="secondary"
                              className="text-xs"
                            >
                              {term}
                            </Badge>
                          ))
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          No major tool gaps.
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider pt-2">
                      Missing Responsibilities
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {scoreResult.keywordMatch.categories.responsibilities
                        .missing.length > 0 ? (
                        scoreResult.keywordMatch.categories.responsibilities.missing
                          .slice(0, 8)
                          .map((term) => (
                            <Badge
                              key={`miss-resp-${term}`}
                              variant="secondary"
                              className="text-xs"
                            >
                              {term}
                            </Badge>
                          ))
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          Responsibilities aligned.
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider pt-2">
                      Matched Keywords
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {scoreResult.keywordMatch.matched.length > 0 ? (
                        scoreResult.keywordMatch.matched
                          .slice(0, 12)
                          .map((term) => (
                            <Badge
                              key={`match-${term}`}
                              variant="outline"
                              className="text-xs"
                            >
                              {term}
                            </Badge>
                          ))
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          No keyword matches detected.
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Bullet Suggestions */}
              {scoreResult.bulletSuggestions.length > 0 && (
                <div className="bg-muted/40 p-4 rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center gap-2 text-sm">
                    <Target className="size-4" />
                    Bullet Suggestions
                  </h4>
                  <div className="space-y-3 text-sm">
                    {scoreResult.bulletSuggestions.map((item, idx) => (
                      <div
                        key={`${item.companyOrProject}-${idx}`}
                        className="space-y-1"
                      >
                        <div className="text-xs uppercase tracking-wider text-muted-foreground">
                          {item.section} — {item.companyOrProject}
                        </div>
                        <div className="text-muted-foreground">
                          <span className="font-medium text-foreground">
                            Issue:
                          </span>{" "}
                          {item.issue}
                        </div>
                        <div className="text-muted-foreground">
                          <span className="font-medium text-foreground">
                            Template:
                          </span>{" "}
                          {item.template}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Feedback Summary */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium mb-2 flex items-center gap-2 text-sm">
                  <Target className="size-4" />
                  Key Improvements
                </h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  {scoreResult.checks.filter((c) => !c.passed).length === 0 ? (
                    <li>No critical issues found. Great job!</li>
                  ) : (
                    scoreResult.checks
                      .filter((c) => !c.passed)
                      .map((c) => <li key={c.id}>{c.message}</li>)
                  )}
                </ul>
              </div>

              {/* ATS Parsing Preview */}
              <div className="bg-muted/40 p-4 rounded-lg space-y-3">
                <h4 className="font-medium mb-1 flex items-center gap-2 text-sm">
                  <Info className="size-4" />
                  ATS Parsing Preview
                </h4>
                {scoreResult.parsingRisks.length > 0 && (
                  <div className="text-sm text-muted-foreground space-y-1">
                    {scoreResult.parsingRisks.map((risk) => (
                      <div key={risk.id}>
                        <strong className="text-foreground">
                          {risk.message}
                        </strong>{" "}
                        {risk.suggestion}
                      </div>
                    ))}
                  </div>
                )}
                <pre className="text-xs whitespace-pre-wrap bg-background/60 p-3 rounded border">
                  {scoreResult.parsingPreview}
                </pre>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
