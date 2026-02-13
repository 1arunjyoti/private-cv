"use client";

import { useState, useMemo, useCallback } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Target,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
  Loader2,
  Lightbulb,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import type { Resume } from "@/db";
import { extractKeywords, checkLikelyMatch } from "@/lib/text-processing";
import { useLLMSettingsStore } from "@/store/useLLMSettingsStore";
import { ensureLLMProvider } from "@/lib/llm/ensure-provider";
import { parseLLMJson } from "@/lib/llm/json";
import { buildJobMatchAnalysisPrompt } from "@/lib/llm/prompts";
import { redactContactInfo } from "@/lib/llm/redaction";
import { useResumeStore } from "@/store/useResumeStore";

interface JobMatcherProps {
  resume: Resume;
}

interface MatchResult {
  keyword: string;
  found: boolean;
  locations: string[];
}

interface LLMAnalysisResult {
  overallFit: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  keywords: string[];
  matchedKeywords: string[];
  missingKeywords: string[];
  suggestions: string[];
  tailoredSummary: string;
}

export function JobMatcher({ resume }: JobMatcherProps) {
  const [jobDescription, setJobDescription] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [llmError, setLlmError] = useState<string | null>(null);
  const [llmSummary, setLlmSummary] = useState("");
  const [llmKeywords, setLlmKeywords] = useState<string[]>([]);
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [llmAnalysis, setLlmAnalysis] = useState<LLMAnalysisResult | null>(null);

  const providerId = useLLMSettingsStore((state) => state.providerId);
  const apiKeys = useLLMSettingsStore((state) => state.apiKeys);
  const consent = useLLMSettingsStore((state) => state.consent);
  const redaction = useLLMSettingsStore((state) => state.redaction);
  const updateCurrentResume = useResumeStore(
    (state) => state.updateCurrentResume,
  );

  // Find where keyword appears - wrapped in useCallback
  const findKeywordLocation = useCallback(
    (keyword: string): string[] => {
      const locations: string[] = [];

      // Check Summary
      if (
        checkLikelyMatch(keyword, resume.basics.summary) ||
        checkLikelyMatch(keyword, resume.basics.label)
      ) {
        locations.push("Summary");
      }

      // Check Work
      resume.work.forEach((w) => {
        const workText = [w.position, w.summary, ...w.highlights].join(" ");
        if (checkLikelyMatch(keyword, workText)) {
          locations.push(`Work: ${w.company || "Experience"}`);
        }
      });

      // Check Skills
      resume.skills.forEach((s) => {
        const skillText = [s.name, ...s.keywords].join(" ");
        if (checkLikelyMatch(keyword, skillText)) {
          locations.push(`Skills: ${s.name || "Skills"}`);
        }
      });

      // Check Projects
      resume.projects.forEach((p) => {
        const projText = [
          p.name,
          p.description,
          ...p.highlights,
          ...p.keywords,
        ].join(" ");
        if (checkLikelyMatch(keyword, projText)) {
          locations.push(`Project: ${p.name || "Project"}`);
        }
      });

      return locations;
    },
    [resume],
  );

  // Match results
  const matchResults = useMemo((): MatchResult[] => {
    if (!jobDescription.trim()) return [];

    const keywords = extractKeywords(jobDescription);

    return keywords.map((keyword) => {
      const locations = findKeywordLocation(keyword);
      return {
        keyword,
        found: locations.length > 0,
        locations,
      };
    });
  }, [jobDescription, findKeywordLocation]);

  const matchedCount = matchResults.filter((r) => r.found).length;
  const totalCount = matchResults.length;
  const matchPercentage =
    totalCount > 0 ? Math.round((matchedCount / totalCount) * 100) : 0;

  const getScoreColor = (percentage: number) => {
    if (percentage >= 70) return "text-green-500";
    if (percentage >= 50) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreIcon = (percentage: number) => {
    if (percentage >= 70)
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    if (percentage >= 50)
      return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    return <XCircle className="h-5 w-5 text-red-500" />;
  };

  const buildResumeContext = useCallback(() => {
    const parts: string[] = [];
    if (resume.basics.name) parts.push(`Name: ${resume.basics.name}`);
    if (resume.basics.label) parts.push(`Title: ${resume.basics.label}`);
    if (resume.basics.summary) parts.push(`Summary: ${resume.basics.summary}`);
    if (resume.skills.length) {
      const skills = resume.skills
        .map((s) => [s.name, ...s.keywords].filter(Boolean).join(", "))
        .filter(Boolean);
      if (skills.length) parts.push(`Skills: ${skills.join(" | ")}`);
    }
    if (resume.work.length) {
      const work = resume.work
        .map((w) =>
          [w.position, w.company, w.summary, ...(w.highlights || [])].filter(Boolean).join(" | "),
        )
        .filter(Boolean);
      if (work.length) parts.push(`Experience:\n${work.join("\n")}`);
    }
    if (resume.projects.length) {
      const projects = resume.projects
        .map((p) =>
          [p.name, p.description, ...p.keywords, ...(p.highlights || [])].filter(Boolean).join(" | "),
        )
        .filter(Boolean);
      if (projects.length) parts.push(`Projects:\n${projects.join("\n")}`);
    }
    if (resume.education.length) {
      const edu = resume.education
        .map((e) =>
          [e.studyType, e.area, e.institution].filter(Boolean).join(" | "),
        )
        .filter(Boolean);
      if (edu.length) parts.push(`Education: ${edu.join(" | ")}`);
    }
    if (resume.certificates.length) {
      const certs = resume.certificates
        .map((c) => [c.name, c.issuer].filter(Boolean).join(" from "))
        .filter(Boolean);
      if (certs.length) parts.push(`Certificates: ${certs.join(", ")}`);
    }
    const raw = parts.join("\n");
    return redaction.stripContactInfo ? redactContactInfo(raw) : raw;
  }, [resume, redaction.stripContactInfo]);

  const parseLLMOutput = useCallback((output: string) => {
    const trimmed = output.trim();
    const parsed = parseLLMJson<Record<string, unknown>>(trimmed, {
      sanitizeMultilineStrings: true,
    });
    if (parsed) {
      return parsed;
    }

    const summaryMatch = trimmed.match(
      /summary\s*:\s*([\s\S]*?)(?:keywords\s*:|$)/i,
    );
    const keywordsMatch = trimmed.match(/keywords?\s*:\s*([\s\S]*)/i);

    const summary = summaryMatch?.[1]?.trim() || "";
    const keywordsRaw = keywordsMatch?.[1]?.trim() || "";
    const keywords = keywordsRaw
      ? keywordsRaw
          .split(/[\n,]/)
          .map((line) => line.replace(/^[-•]\s*/, "").trim())
          .filter(Boolean)
      : [];

    return {
      summary: summary || trimmed,
      keywords,
    };
  }, []);

  const handleLLMAnalyze = useCallback(async () => {
    setLlmError(null);
    setLlmSummary("");
    setLlmKeywords([]);
    setSelectedKeywords([]);
    setLlmAnalysis(null);

    const result = ensureLLMProvider({
      providerId,
      apiKeys,
      consent,
      requiredConsent: "analysis",
    });
    if ("error" in result) {
      setLlmError(result.error);
      return;
    }
    if (!jobDescription.trim()) {
      setLlmError("Paste a job description first.");
      return;
    }

    setIsAnalyzing(true);
    try {
      const jd = redaction.stripContactInfo
        ? redactContactInfo(jobDescription)
        : jobDescription;
      const resumeContext = buildResumeContext();
      const output = await result.provider.generateText(result.apiKey, {
        prompt: buildJobMatchAnalysisPrompt(jd, resumeContext),
        temperature: 0.4,
        maxTokens: 1024,
      });
      const parsed = parseLLMOutput(output) as Partial<LLMAnalysisResult> & {
        summary?: string;
        keywords?: string[];
      };

      // Extract enhanced analysis if available
      const analysis: LLMAnalysisResult = {
        overallFit: typeof parsed.overallFit === "number" ? parsed.overallFit : 0,
        summary: typeof parsed.summary === "string" ? parsed.summary.trim() : "",
        strengths: Array.isArray(parsed.strengths) ? parsed.strengths.map(String) : [],
        weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses.map(String) : [],
        keywords: Array.isArray(parsed.keywords)
          ? parsed.keywords.map((k) => String(k).trim()).filter(Boolean)
          : extractKeywords(jobDescription),
        matchedKeywords: Array.isArray(parsed.matchedKeywords)
          ? parsed.matchedKeywords.map((k) => String(k).trim()).filter(Boolean)
          : [],
        missingKeywords: Array.isArray(parsed.missingKeywords)
          ? parsed.missingKeywords.map((k) => String(k).trim()).filter(Boolean)
          : [],
        suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions.map(String) : [],
        tailoredSummary: typeof parsed.tailoredSummary === "string" ? parsed.tailoredSummary.trim() : "",
      };

      setLlmAnalysis(analysis);
      setLlmSummary(analysis.tailoredSummary || analysis.summary);
      setLlmKeywords(analysis.missingKeywords.length > 0 ? analysis.missingKeywords : analysis.keywords);
      setSelectedKeywords(analysis.missingKeywords.length > 0 ? analysis.missingKeywords : analysis.keywords);
    } catch (err) {
      setLlmError((err as Error).message);
    } finally {
      setIsAnalyzing(false);
    }
  }, [
    apiKeys,
    buildResumeContext,
    consent,
    jobDescription,
    parseLLMOutput,
    providerId,
    redaction.stripContactInfo,
  ]);

  const handleApplySummary = useCallback(() => {
    if (!llmSummary) return;
    updateCurrentResume({
      basics: {
        ...resume.basics,
        summary: llmSummary,
      },
    });
  }, [llmSummary, resume.basics, updateCurrentResume]);

  const handleApplyKeywords = useCallback(() => {
    if (!selectedKeywords.length) return;
    const existing = resume.skills.find((s) => s.name === "Job Keywords");
    const nextKeywords = Array.from(
      new Set([...(existing?.keywords || []), ...selectedKeywords]),
    );
    const nextSkills = existing
      ? resume.skills.map((s) =>
          s.name === "Job Keywords" ? { ...s, keywords: nextKeywords } : s,
        )
      : [
          ...resume.skills,
          {
            id: crypto.randomUUID(),
            name: "Job Keywords",
            level: "",
            keywords: nextKeywords,
          },
        ];
    updateCurrentResume({ skills: nextSkills });
  }, [resume.skills, selectedKeywords, updateCurrentResume]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Target className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">Job Description Matcher</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Paste Job Description</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="jd">
              Paste the job description to see how well your resume matches
            </Label>
            <Textarea
              id="jd"
              placeholder="Paste the job description here..."
              className="min-h-50"
              value={jobDescription}
              onChange={(e) => {
                setJobDescription(e.target.value);
                setShowResults(false);
              }}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => setShowResults(true)}
              disabled={!jobDescription.trim()}
              className="w-full sm:w-auto"
            >
              <Target className="h-4 w-4" />
              Analyze Match
            </Button>
            <Button
              variant="outline"
              onClick={handleLLMAnalyze}
              disabled={!jobDescription.trim() || isAnalyzing}
              className="w-full sm:w-auto"
            >
              {isAnalyzing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              LLM Analyze
            </Button>
          </div>
        </CardContent>
      </Card>

      {(llmSummary || llmKeywords.length > 0 || llmError || llmAnalysis) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              AI Analysis
              {llmAnalysis && llmAnalysis.overallFit > 0 && (
                <Badge
                  variant="outline"
                  className={`ml-2 ${
                    llmAnalysis.overallFit >= 70
                      ? "text-green-600 border-green-300"
                      : llmAnalysis.overallFit >= 50
                        ? "text-yellow-600 border-yellow-300"
                        : "text-red-600 border-red-300"
                  }`}
                >
                  {llmAnalysis.overallFit}% Fit
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {llmError ? (
              <p className="text-sm text-destructive">{llmError}</p>
            ) : null}

            {/* AI Summary */}
            {llmAnalysis?.summary ? (
              <div className="rounded-md border bg-muted/30 p-3 text-sm whitespace-pre-wrap">
                {llmAnalysis.summary}
              </div>
            ) : null}

            {/* Strengths & Weaknesses */}
            {llmAnalysis && (llmAnalysis.strengths.length > 0 || llmAnalysis.weaknesses.length > 0) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {llmAnalysis.strengths.length > 0 && (
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1.5 text-green-700 dark:text-green-400">
                      <TrendingUp className="h-3.5 w-3.5" />
                      Strengths
                    </Label>
                    <ul className="space-y-1">
                      {llmAnalysis.strengths.map((s, i) => (
                        <li key={i} className="text-xs text-muted-foreground flex gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0 mt-0.5" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {llmAnalysis.weaknesses.length > 0 && (
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1.5 text-red-700 dark:text-red-400">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      Gaps
                    </Label>
                    <ul className="space-y-1">
                      {llmAnalysis.weaknesses.map((w, i) => (
                        <li key={i} className="text-xs text-muted-foreground flex gap-1.5">
                          <XCircle className="h-3.5 w-3.5 text-red-500 shrink-0 mt-0.5" />
                          {w}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Actionable Suggestions */}
            {llmAnalysis && llmAnalysis.suggestions.length > 0 && (
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  <Lightbulb className="h-3.5 w-3.5 text-yellow-500" />
                  Improvement Suggestions
                </Label>
                <div className="rounded-md border bg-yellow-50/50 dark:bg-yellow-900/10 p-3">
                  <ol className="space-y-1.5 list-decimal list-inside">
                    {llmAnalysis.suggestions.map((s, i) => (
                      <li key={i} className="text-xs text-muted-foreground">{s}</li>
                    ))}
                  </ol>
                </div>
              </div>
            )}

            {/* Tailored Summary */}
            {llmSummary ? (
              <div className="space-y-2">
                <Label>Tailored Summary for This Job</Label>
                <div className="rounded-md border bg-muted/30 p-3 text-sm whitespace-pre-wrap">
                  {llmSummary}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleApplySummary}>
                    Apply Summary
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLLMAnalyze}
                    disabled={isAnalyzing}
                  >
                    Regenerate
                  </Button>
                </div>
              </div>
            ) : null}

            {/* Missing Keywords to add */}
            {llmKeywords.length > 0 ? (
              <div className="space-y-2">
                <Label>Missing Keywords to Add</Label>
                <div className="flex flex-wrap gap-2">
                  {llmKeywords.map((keyword) => {
                    const checked = selectedKeywords.includes(keyword);
                    return (
                      <label
                        key={keyword}
                        className="flex items-center gap-2 rounded-md border px-2 py-1 text-xs bg-background"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            setSelectedKeywords((prev) =>
                              e.target.checked
                                ? [...prev, keyword]
                                : prev.filter((k) => k !== keyword),
                            );
                          }}
                        />
                        {keyword}
                      </label>
                    );
                  })}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleApplyKeywords}>
                    Add to Skills
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedKeywords([])}
                  >
                    Clear Selection
                  </Button>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}

      {showResults && matchResults.length > 0 && (
        <>
          {/* Score Card */}
          <Card>
            <CardContent className="py-6">
              <div className="flex items-center justify-center gap-4">
                {getScoreIcon(matchPercentage)}
                <div className="text-center">
                  <p
                    className={`text-4xl font-bold ${getScoreColor(
                      matchPercentage,
                    )}`}
                  >
                    {matchPercentage}%
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {matchedCount} of {totalCount} keywords matched
                  </p>
                </div>
              </div>
              <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    matchPercentage >= 70
                      ? "bg-green-500"
                      : matchPercentage >= 50
                        ? "bg-yellow-500"
                        : "bg-red-500"
                  }`}
                  style={{ width: `${matchPercentage}%` }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Keywords Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Found Keywords */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  Found in Resume ({matchResults.filter((r) => r.found).length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {matchResults
                    .filter((r) => r.found)
                    .map((result) => (
                      <span
                        key={result.keyword}
                        className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-md cursor-help border border-green-200"
                        title={result.locations.join(", ")}
                      >
                        {result.keyword}
                      </span>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Missing Keywords */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2 text-red-600">
                  <XCircle className="h-4 w-4" />
                  Missing from Resume (
                  {matchResults.filter((r) => !r.found).length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {matchResults
                    .filter((r) => !r.found)
                    .map((result) => (
                      <span
                        key={result.keyword}
                        className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-md border border-red-200"
                      >
                        {result.keyword}
                      </span>
                    ))}
                </div>
                {matchResults.filter((r) => !r.found).length > 0 && (
                  <p className="text-xs text-muted-foreground mt-3">
                    Consider adding these keywords or their variations (e.g.
                    synonyms) to your resume.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
