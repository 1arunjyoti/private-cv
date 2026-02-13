"use client";

import { useCallback, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Briefcase, Plus, Sparkles, Trash2, Loader2, BarChart3 } from "lucide-react";
import type { WorkExperience } from "@/db";
import { v4 as uuidv4 } from "uuid";
import { CollapsibleSection } from "@/components/CollapsibleSection";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { useLLMSettingsStore } from "@/store/useLLMSettingsStore";
import {
  generatePromptTextAction,
} from "@/lib/llm/form-actions";
import {
  buildHighlightsPrompt,
  buildBulletQuantifierPrompt,
} from "@/lib/llm/prompts";
import { redactContactInfo } from "@/lib/llm/redaction";
import { useSectionAIActions } from "./hooks/useSectionAIActions";

interface WorkFormProps {
  data: WorkExperience[];
  onChange: (data: WorkExperience[]) => void;
}

export function WorkForm({ data, onChange }: WorkFormProps) {
  const providerId = useLLMSettingsStore((state) => state.providerId);
  const apiKeys = useLLMSettingsStore((state) => state.apiKeys);
  const consent = useLLMSettingsStore((state) => state.consent);
  const redaction = useLLMSettingsStore((state) => state.redaction);
  const [generatedSummaries, setGeneratedSummaries] = useState<Record<string, string>>({});
  const [generatedHighlights, setGeneratedHighlights] = useState<Record<string, string[]>>({});
  const [llmErrors, setLlmErrors] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState<Record<string, boolean>>({});
  const [quantifiedBullets, setQuantifiedBullets] = useState<Record<string, string>>({});
  const [isQuantifying, setIsQuantifying] = useState<Record<string, boolean>>({});
  const addExperience = useCallback(() => {
    const newExp: WorkExperience = {
      id: uuidv4(),
      company: "",
      position: "",
      url: "",
      startDate: "",
      endDate: "",
      summary: "",
      highlights: [],
      location: "",
      name: "",
    };
    onChange([...data, newExp]);
  }, [data, onChange]);

  const removeExperience = useCallback(
    (id: string) => {
      onChange(data.filter((exp) => exp.id !== id));
    },
    [data, onChange],
  );

  const updateExperience = useCallback(
    (id: string, field: keyof WorkExperience, value: string | string[]) => {
      onChange(
        data.map((exp) => (exp.id === id ? { ...exp, [field]: value } : exp)),
      );
    },
    [data, onChange],
  );

  const addHighlight = useCallback(
    (id: string) => {
      onChange(
        data.map((exp) =>
          exp.id === id ? { ...exp, highlights: [...exp.highlights, ""] } : exp,
        ),
      );
    },
    [data, onChange],
  );

  const updateHighlight = useCallback(
    (id: string, index: number, value: string) => {
      onChange(
        data.map((exp) => {
          if (exp.id === id) {
            const newHighlights = [...exp.highlights];
            newHighlights[index] = value;
            return { ...exp, highlights: newHighlights };
          }
          return exp;
        }),
      );
    },
    [data, onChange],
  );

  const removeHighlight = useCallback(
    (id: string, index: number) => {
      onChange(
        data.map((exp) => {
          if (exp.id === id) {
            return {
              ...exp,
              highlights: exp.highlights.filter((_, i) => i !== index),
            };
          }
          return exp;
        }),
      );
    },
    [data, onChange],
  );

  const buildInput = useCallback(
    (exp: WorkExperience) => {
      const peerContext = data
        .filter((item) => item.id !== exp.id)
        .slice(0, 3)
        .map((item) =>
          [
            item.position ? `Role: ${item.position}` : "",
            item.company ? `Company: ${item.company}` : "",
            item.summary ? `Summary: ${item.summary}` : "",
          ]
            .filter(Boolean)
            .join(" | "),
        )
        .filter(Boolean);

      const parts = [
        exp.position ? `Role: ${exp.position}` : "",
        exp.company ? `Company: ${exp.company}` : "",
        exp.location ? `Location: ${exp.location}` : "",
        exp.summary ? `Current Summary: ${exp.summary}` : "",
        peerContext.length ? `Other Experience:\n${peerContext.join("\n")}` : "",
      ].filter(Boolean);
      const raw = parts.join("\n");
      return redaction.stripContactInfo ? redactContactInfo(raw) : raw;
    },
    [data, redaction.stripContactInfo],
  );

  const {
    handleGenerate: handleGenerateSummary,
    handleImprove: handleImproveSummary,
    handleGrammar: handleGrammarSummary,
    clearGenerated,
  } = useSectionAIActions<WorkExperience>({
    section: "work experience",
    getId: (exp) => exp.id,
    buildInput,
    getCurrentText: (exp) => exp.summary || "",
    setErrors: setLlmErrors,
    setGenerated: setGeneratedSummaries,
    setLoading: setIsGenerating,
  });

  const handleGenerateHighlights = useCallback(
    async (exp: WorkExperience) => {
      setLlmErrors((prev) => ({ ...prev, [exp.id]: "" }));
      setGeneratedHighlights((prev) => ({ ...prev, [exp.id]: [] }));
      setIsGenerating((prev) => ({ ...prev, [exp.id]: true }));
      const result = await generatePromptTextAction({
        provider: { providerId, apiKeys, consent },
        requiredConsent: "generation",
        prompt: buildHighlightsPrompt("work experience", buildInput(exp)),
        temperature: 0.3,
        maxTokens: 256,
      });
      if (!result.ok) {
        setLlmErrors((prev) => ({ ...prev, [exp.id]: result.error }));
      } else {
        const bullets = result.text
          .split("\n")
          .map((line) => line.replace(/^[-•]\s*/, "").trim())
          .filter(Boolean);
        setGeneratedHighlights((prev) => ({ ...prev, [exp.id]: bullets }));
      }
      setIsGenerating((prev) => ({ ...prev, [exp.id]: false }));
    },
    [apiKeys, buildInput, consent, providerId],
  );

  const handleQuantifyBullet = useCallback(
    async (exp: WorkExperience, bulletIndex: number) => {
      const bullet = exp.highlights[bulletIndex];
      if (!bullet?.trim()) return;
      const key = `${exp.id}-${bulletIndex}`;
      setQuantifiedBullets((prev) => ({ ...prev, [key]: "" }));
      setIsQuantifying((prev) => ({ ...prev, [key]: true }));
      const result = await generatePromptTextAction({
        provider: { providerId, apiKeys, consent },
        requiredConsent: "rewriting",
        prompt: buildBulletQuantifierPrompt(bullet, buildInput(exp)),
        temperature: 0.2,
        maxTokens: 128,
      });
      if (!result.ok) {
        setLlmErrors((prev) => ({ ...prev, [exp.id]: result.error }));
      } else {
        setQuantifiedBullets((prev) => ({ ...prev, [key]: result.text.trim() }));
      }
      setIsQuantifying((prev) => ({ ...prev, [key]: false }));
    },
    [apiKeys, buildInput, consent, providerId],
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Briefcase className="h-5 w-5" />
          Professional Experience
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
        <div className="text-center text-muted-foreground py-8 border-2 border-dashed border-muted rounded-lg">
          No professional experience added yet. Click &quot;Add Experience&quot;
          to get started.
        </div>
      )}

      {data.map((exp, index) => (
        <CollapsibleSection
          key={exp.id}
          title={
            <span className="flex items-center gap-2">
              <span className="text-muted-foreground text-sm">
                #{index + 1}
              </span>
              {exp.position || exp.company
                ? `${exp.position}${exp.position && exp.company ? " at " : ""}${
                    exp.company
                  }`
                : "New Experience"}
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
                removeExperience(exp.id);
              }}
              aria-label="Remove experience"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          }
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`company-${exp.id}`}>Company</Label>
                <Input
                  id={`company-${exp.id}`}
                  placeholder="Company Name"
                  value={exp.company}
                  onChange={(e) =>
                    updateExperience(exp.id, "company", e.target.value)
                  }
                  autoComplete="organization"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`position-${exp.id}`}>Position</Label>
                <Input
                  id={`position-${exp.id}`}
                  placeholder="Job Title"
                  value={exp.position}
                  onChange={(e) =>
                    updateExperience(exp.id, "position", e.target.value)
                  }
                  autoComplete="organization-title"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`url-${exp.id}`}>Company Website</Label>
              <Input
                id={`url-${exp.id}`}
                placeholder="https://company.com"
                value={exp.url}
                onChange={(e) =>
                  updateExperience(exp.id, "url", e.target.value)
                }
                autoComplete="url"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`startDate-${exp.id}`}>Start Date</Label>
                <Input
                  id={`startDate-${exp.id}`}
                  type="month"
                  value={exp.startDate}
                  onChange={(e) =>
                    updateExperience(exp.id, "startDate", e.target.value)
                  }
                  autoComplete="off"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`endDate-${exp.id}`}>End Date</Label>
                <Input
                  id={`endDate-${exp.id}`}
                  type="month"
                  placeholder="Leave empty if current"
                  value={exp.endDate}
                  onChange={(e) =>
                    updateExperience(exp.id, "endDate", e.target.value)
                  }
                  autoComplete="off"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor={`summary-${exp.id}`}>Description</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleGenerateSummary(exp)}
                  disabled={isGenerating[exp.id]}
                >
                  {isGenerating[exp.id] ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="h-3.5 w-3.5" />
                  )}
                  Generate
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleImproveSummary(exp)}
                  disabled={isGenerating[exp.id]}
                >
                  Improve
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleGrammarSummary(exp)}
                  disabled={isGenerating[exp.id]}
                >
                  Grammar
                </Button>
              </div>
              <RichTextEditor
                id={`summary-${exp.id}`}
                placeholder="Brief description of your role and responsibilities..."
                minHeight="min-h-[60px]"
                value={exp.summary}
                onChange={(value) => updateExperience(exp.id, "summary", value)}
              />
              {llmErrors[exp.id] ? (
                <p className="text-xs text-destructive">{llmErrors[exp.id]}</p>
              ) : null}
              {generatedSummaries[exp.id] ? (
                <div className="rounded-md border bg-muted/30 p-3 space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    Generated Summary
                  </p>
                  <p className="text-sm whitespace-pre-wrap">
                    {generatedSummaries[exp.id]}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => {
                        updateExperience(exp.id, "summary", generatedSummaries[exp.id]);
                        clearGenerated(exp.id);
                      }}
                    >
                      Apply
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleGenerateSummary(exp)}
                      disabled={isGenerating[exp.id]}
                    >
                      Regenerate
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        clearGenerated(exp.id)
                      }
                    >
                      Discard
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Key Achievements</Label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleGenerateHighlights(exp)}
                    disabled={isGenerating[exp.id]}
                  >
                    {isGenerating[exp.id] ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="h-3.5 w-3.5" />
                    )}
                    Generate
                  </Button>
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
              </div>
              {generatedHighlights[exp.id]?.length ? (
                <div className="rounded-md border bg-muted/30 p-3 space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    Generated Highlights
                  </p>
                  <ul className="text-sm list-disc pl-5 space-y-1">
                    {generatedHighlights[exp.id].map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => {
                        updateExperience(exp.id, "highlights", generatedHighlights[exp.id]);
                        setGeneratedHighlights((prev) => ({ ...prev, [exp.id]: [] }));
                      }}
                    >
                      Apply
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleGenerateHighlights(exp)}
                      disabled={isGenerating[exp.id]}
                    >
                      Regenerate
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setGeneratedHighlights((prev) => ({ ...prev, [exp.id]: [] }))
                      }
                    >
                      Discard
                    </Button>
                  </div>
                </div>
              ) : null}
              <div className="space-y-2">
                {exp.highlights.map((highlight, hIndex) => {
                  const bulletKey = `${exp.id}-${hIndex}`;
                  return (
                    <div key={hIndex} className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground text-sm">•</span>
                        <Input
                          placeholder="Increased revenue by 20%..."
                          value={highlight}
                          onChange={(e) =>
                            updateHighlight(exp.id, hIndex, e.target.value)
                          }
                          className="flex-1"
                          aria-label={`Achievement ${hIndex + 1}`}
                          autoComplete="off"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="shrink-0"
                          title="Quantify with AI"
                          onClick={() => handleQuantifyBullet(exp, hIndex)}
                          disabled={isQuantifying[bulletKey] || !highlight.trim()}
                        >
                          {isQuantifying[bulletKey] ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <BarChart3 className="h-3.5 w-3.5" />
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive shrink-0"
                          onClick={() => removeHighlight(exp.id, hIndex)}
                          aria-label="Remove achievement"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      {quantifiedBullets[bulletKey] && (
                        <div className="ml-5 rounded-md border bg-muted/30 p-2 space-y-1.5">
                          <p className="text-xs font-medium text-muted-foreground">Quantified Version</p>
                          <p className="text-sm">{quantifiedBullets[bulletKey]}</p>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              size="sm"
                              variant="default"
                              className="h-6 text-xs"
                              onClick={() => {
                                updateHighlight(exp.id, hIndex, quantifiedBullets[bulletKey]);
                                setQuantifiedBullets((prev) => ({ ...prev, [bulletKey]: "" }));
                              }}
                            >
                              Apply
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              className="h-6 text-xs"
                              onClick={() =>
                                setQuantifiedBullets((prev) => ({ ...prev, [bulletKey]: "" }))
                              }
                            >
                              Discard
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CollapsibleSection>
      ))}
    </div>
  );
}
