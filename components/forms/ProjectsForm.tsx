"use client";

import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FolderGit2, Plus, Sparkles, Trash2, X, Loader2, BarChart3 } from "lucide-react";
import type { Project } from "@/db";
import { v4 as uuidv4 } from "uuid";
import { CollapsibleSection } from "@/components/CollapsibleSection";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { useLLMSettingsStore } from "@/store/useLLMSettingsStore";
import {
  generatePromptTextAction,
  generateSectionSummaryAction,
  improveSectionTextAction,
  grammarCheckSectionTextAction,
} from "@/lib/llm/form-actions";
import {
  buildHighlightsPrompt,
  buildBulletQuantifierPrompt,
} from "@/lib/llm/prompts";
import { redactContactInfo } from "@/lib/llm/redaction";

interface ProjectsFormProps {
  data: Project[];
  onChange: (data: Project[]) => void;
}

export function ProjectsForm({ data, onChange }: ProjectsFormProps) {
  const [newKeyword, setNewKeyword] = useState<{ [key: string]: string }>({});
  const providerId = useLLMSettingsStore((state) => state.providerId);
  const apiKeys = useLLMSettingsStore((state) => state.apiKeys);
  const consent = useLLMSettingsStore((state) => state.consent);
  const redaction = useLLMSettingsStore((state) => state.redaction);
  const tone = useLLMSettingsStore((state) => state.tone);
  const [generatedDescriptions, setGeneratedDescriptions] = useState<Record<string, string>>({});
  const [generatedHighlights, setGeneratedHighlights] = useState<Record<string, string[]>>({});
  const [llmErrors, setLlmErrors] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState<Record<string, boolean>>({});
  const [quantifiedBullets, setQuantifiedBullets] = useState<Record<string, string>>({});
  const [isQuantifying, setIsQuantifying] = useState<Record<string, boolean>>({});

  const addProject = useCallback(() => {
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
  }, [data, onChange]);

  const removeProject = useCallback(
    (id: string) => {
      onChange(data.filter((proj) => proj.id !== id));
    },
    [data, onChange],
  );

  const updateProject = useCallback(
    (id: string, field: keyof Project, value: string | string[]) => {
      onChange(
        data.map((proj) =>
          proj.id === id ? { ...proj, [field]: value } : proj,
        ),
      );
    },
    [data, onChange],
  );

  const addHighlight = useCallback(
    (id: string) => {
      onChange(
        data.map((proj) =>
          proj.id === id
            ? { ...proj, highlights: [...proj.highlights, ""] }
            : proj,
        ),
      );
    },
    [data, onChange],
  );

  const updateHighlight = useCallback(
    (id: string, index: number, value: string) => {
      onChange(
        data.map((proj) => {
          if (proj.id === id) {
            const newHighlights = [...proj.highlights];
            newHighlights[index] = value;
            return { ...proj, highlights: newHighlights };
          }
          return proj;
        }),
      );
    },
    [data, onChange],
  );

  const removeHighlight = useCallback(
    (id: string, index: number) => {
      onChange(
        data.map((proj) => {
          if (proj.id === id) {
            return {
              ...proj,
              highlights: proj.highlights.filter((_, i) => i !== index),
            };
          }
          return proj;
        }),
      );
    },
    [data, onChange],
  );

  const addKeyword = useCallback(
    (id: string) => {
      const keyword = newKeyword[id]?.trim();
      if (!keyword) return;

      onChange(
        data.map((proj) =>
          proj.id === id
            ? { ...proj, keywords: [...proj.keywords, keyword] }
            : proj,
        ),
      );
      setNewKeyword((prev) => ({ ...prev, [id]: "" }));
    },
    [data, onChange, newKeyword],
  );

  const removeKeyword = useCallback(
    (id: string, index: number) => {
      onChange(
        data.map((proj) => {
          if (proj.id === id) {
            return {
              ...proj,
              keywords: proj.keywords.filter((_, i) => i !== index),
            };
          }
          return proj;
        }),
      );
    },
    [data, onChange],
  );

  const handleKeywordKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>, id: string) => {
      if (e.key === "Enter") {
        e.preventDefault();
        addKeyword(id);
      }
    },
    [addKeyword],
  );

  const buildInput = useCallback(
    (proj: Project) => {
      const peerContext = data
        .filter((item) => item.id !== proj.id)
        .slice(0, 3)
        .map((item) =>
          [
            item.name ? `Project: ${item.name}` : "",
            item.description ? `Description: ${item.description}` : "",
            item.keywords.length ? `Tech: ${item.keywords.join(", ")}` : "",
          ]
            .filter(Boolean)
            .join(" | "),
        )
        .filter(Boolean);

      const parts = [
        proj.name ? `Project: ${proj.name}` : "",
        proj.url ? `URL: ${proj.url}` : "",
        proj.description ? `Current Description: ${proj.description}` : "",
        proj.keywords.length ? `Tech: ${proj.keywords.join(", ")}` : "",
        peerContext.length ? `Other Projects:\n${peerContext.join("\n")}` : "",
      ].filter(Boolean);
      const raw = parts.join("\n");
      return redaction.stripContactInfo ? redactContactInfo(raw) : raw;
    },
    [data, redaction.stripContactInfo],
  );

  const handleGenerateDescription = useCallback(
    async (proj: Project) => {
      setLlmErrors((prev) => ({ ...prev, [proj.id]: "" }));
      setGeneratedDescriptions((prev) => ({ ...prev, [proj.id]: "" }));
      setIsGenerating((prev) => ({ ...prev, [proj.id]: true }));
      const result = await generateSectionSummaryAction({
        provider: { providerId, apiKeys, consent },
        section: "project",
        input: buildInput(proj),
      });
      if (!result.ok) {
        setLlmErrors((prev) => ({ ...prev, [proj.id]: result.error }));
      } else {
        setGeneratedDescriptions((prev) => ({ ...prev, [proj.id]: result.text }));
      }
      setIsGenerating((prev) => ({ ...prev, [proj.id]: false }));
    },
    [apiKeys, buildInput, consent, providerId],
  );

  const handleImproveDescription = useCallback(
    async (proj: Project) => {
      setLlmErrors((prev) => ({ ...prev, [proj.id]: "" }));
      setGeneratedDescriptions((prev) => ({ ...prev, [proj.id]: "" }));
      if (!proj.description?.trim()) {
        setLlmErrors((prev) => ({
          ...prev,
          [proj.id]: "Add a description before improving it.",
        }));
        return;
      }
      setIsGenerating((prev) => ({ ...prev, [proj.id]: true }));
      const raw = redaction.stripContactInfo
        ? redactContactInfo(proj.description)
        : proj.description;
      const result = await improveSectionTextAction({
        provider: { providerId, apiKeys, consent },
        section: "project description",
        text: raw,
        tone,
        context: buildInput(proj),
      });
      if (!result.ok) {
        setLlmErrors((prev) => ({ ...prev, [proj.id]: result.error }));
      } else {
        setGeneratedDescriptions((prev) => ({ ...prev, [proj.id]: result.text }));
      }
      setIsGenerating((prev) => ({ ...prev, [proj.id]: false }));
    },
    [apiKeys, buildInput, consent, providerId, redaction.stripContactInfo, tone],
  );

  const handleGrammarDescription = useCallback(
    async (proj: Project) => {
      setLlmErrors((prev) => ({ ...prev, [proj.id]: "" }));
      setGeneratedDescriptions((prev) => ({ ...prev, [proj.id]: "" }));
      if (!proj.description?.trim()) {
        setLlmErrors((prev) => ({
          ...prev,
          [proj.id]: "Add a description before checking grammar.",
        }));
        return;
      }
      setIsGenerating((prev) => ({ ...prev, [proj.id]: true }));
      const raw = redaction.stripContactInfo
        ? redactContactInfo(proj.description)
        : proj.description;
      const result = await grammarCheckSectionTextAction({
        provider: { providerId, apiKeys, consent },
        section: "project description",
        text: raw,
      });
      if (!result.ok) {
        setLlmErrors((prev) => ({ ...prev, [proj.id]: result.error }));
      } else if (result.noChanges) {
        setLlmErrors((prev) => ({ ...prev, [proj.id]: "✓ No grammar issues found." }));
      } else {
        setGeneratedDescriptions((prev) => ({
          ...prev,
          [proj.id]: result.text,
        }));
      }
      setIsGenerating((prev) => ({ ...prev, [proj.id]: false }));
    },
    [apiKeys, consent, providerId, redaction.stripContactInfo],
  );

  const handleGenerateHighlights = useCallback(
    async (proj: Project) => {
      setLlmErrors((prev) => ({ ...prev, [proj.id]: "" }));
      setGeneratedHighlights((prev) => ({ ...prev, [proj.id]: [] }));
      setIsGenerating((prev) => ({ ...prev, [proj.id]: true }));
      const result = await generatePromptTextAction({
        provider: { providerId, apiKeys, consent },
        requiredConsent: "generation",
        prompt: buildHighlightsPrompt("project", buildInput(proj)),
        temperature: 0.5,
        maxTokens: 256,
      });
      if (!result.ok) {
        setLlmErrors((prev) => ({ ...prev, [proj.id]: result.error }));
      } else {
        const bullets = result.text
          .split("\n")
          .map((line) => line.replace(/^[-•]\s*/, "").trim())
          .filter(Boolean);
        setGeneratedHighlights((prev) => ({ ...prev, [proj.id]: bullets }));
      }
      setIsGenerating((prev) => ({ ...prev, [proj.id]: false }));
    },
    [apiKeys, buildInput, consent, providerId],
  );

  const handleQuantifyBullet = useCallback(
    async (proj: Project, bulletIndex: number) => {
      const bullet = proj.highlights[bulletIndex];
      if (!bullet?.trim()) return;
      const key = `${proj.id}-${bulletIndex}`;
      setQuantifiedBullets((prev) => ({ ...prev, [key]: "" }));
      setIsQuantifying((prev) => ({ ...prev, [key]: true }));
      const result = await generatePromptTextAction({
        provider: { providerId, apiKeys, consent },
        requiredConsent: "rewriting",
        prompt: buildBulletQuantifierPrompt(bullet, buildInput(proj)),
        temperature: 0.5,
        maxTokens: 128,
      });
      if (!result.ok) {
        setLlmErrors((prev) => ({ ...prev, [proj.id]: result.error }));
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
          <FolderGit2 className="h-5 w-5" />
          Projects
        </h2>
        <Button type="button" variant="outline" size="sm" onClick={addProject}>
          <Plus className="h-4 w-4 mr-2" />
          Add Project
        </Button>
      </div>

      {data.length === 0 && (
        <div className="text-center text-muted-foreground py-8 border-2 border-dashed border-muted rounded-lg">
          No projects added yet. Click &quot;Add Project&quot; to get started.
        </div>
      )}

      {data.map((proj, index) => (
        <CollapsibleSection
          key={proj.id}
          title={
            <span className="flex items-center gap-2">
              <span className="text-muted-foreground text-sm">
                #{index + 1}
              </span>
              {proj.name || "New Project"}
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
                removeProject(proj.id);
              }}
              aria-label="Remove project"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          }
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`name-${proj.id}`}>Project Name</Label>
                <Input
                  id={`name-${proj.id}`}
                  placeholder="Project Name"
                  value={proj.name}
                  onChange={(e) =>
                    updateProject(proj.id, "name", e.target.value)
                  }
                  autoComplete="off"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`url-${proj.id}`}>Project URL</Label>
                <Input
                  id={`url-${proj.id}`}
                  placeholder="https://project.com"
                  value={proj.url}
                  onChange={(e) =>
                    updateProject(proj.id, "url", e.target.value)
                  }
                  autoComplete="url"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`startDate-${proj.id}`}>Start Date</Label>
                <Input
                  id={`startDate-${proj.id}`}
                  type="month"
                  value={proj.startDate}
                  onChange={(e) =>
                    updateProject(proj.id, "startDate", e.target.value)
                  }
                  autoComplete="off"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`endDate-${proj.id}`}>End Date</Label>
                <Input
                  id={`endDate-${proj.id}`}
                  type="month"
                  value={proj.endDate}
                  onChange={(e) =>
                    updateProject(proj.id, "endDate", e.target.value)
                  }
                  autoComplete="off"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor={`description-${proj.id}`}>Description</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleGenerateDescription(proj)}
                  disabled={isGenerating[proj.id]}
                >
                  {isGenerating[proj.id] ? (
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
                  onClick={() => handleImproveDescription(proj)}
                  disabled={isGenerating[proj.id]}
                >
                  Improve
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleGrammarDescription(proj)}
                  disabled={isGenerating[proj.id]}
                >
                  Grammar
                </Button>
              </div>
              <RichTextEditor
                id={`description-${proj.id}`}
                placeholder="Brief description of the project..."
                minHeight="min-h-[100px]"
                value={proj.description}
                onChange={(value) =>
                  updateProject(proj.id, "description", value)
                }
              />
              {llmErrors[proj.id] ? (
                <p className="text-xs text-destructive">{llmErrors[proj.id]}</p>
              ) : null}
              {generatedDescriptions[proj.id] ? (
                <div className="rounded-md border bg-muted/30 p-3 space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    Generated Description
                  </p>
                  <p className="text-sm whitespace-pre-wrap">
                    {generatedDescriptions[proj.id]}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => {
                        updateProject(proj.id, "description", generatedDescriptions[proj.id]);
                        setGeneratedDescriptions((prev) => ({ ...prev, [proj.id]: "" }));
                      }}
                    >
                      Apply
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleGenerateDescription(proj)}
                      disabled={isGenerating[proj.id]}
                    >
                      Regenerate
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setGeneratedDescriptions((prev) => ({ ...prev, [proj.id]: "" }))
                      }
                    >
                      Discard
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor={`keywords-${proj.id}`} className="text-sm">
                Technologies Used
              </Label>
              <div className="flex flex-wrap gap-2 min-h-8">
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
                      aria-label={`Remove keyword ${keyword}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  id={`keywords-${proj.id}`}
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
                  autoComplete="off"
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
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleGenerateHighlights(proj)}
                    disabled={isGenerating[proj.id]}
                  >
                    {isGenerating[proj.id] ? (
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
                    onClick={() => addHighlight(proj.id)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
              </div>
              {generatedHighlights[proj.id]?.length ? (
                <div className="rounded-md border bg-muted/30 p-3 space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    Generated Highlights
                  </p>
                  <ul className="text-sm list-disc pl-5 space-y-1">
                    {generatedHighlights[proj.id].map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => {
                        updateProject(proj.id, "highlights", generatedHighlights[proj.id]);
                        setGeneratedHighlights((prev) => ({ ...prev, [proj.id]: [] }));
                      }}
                    >
                      Apply
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleGenerateHighlights(proj)}
                      disabled={isGenerating[proj.id]}
                    >
                      Regenerate
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setGeneratedHighlights((prev) => ({ ...prev, [proj.id]: [] }))
                      }
                    >
                      Discard
                    </Button>
                  </div>
                </div>
              ) : null}
              <div className="space-y-2">
                {proj.highlights.map((highlight, hIndex) => {
                  const bulletKey = `${proj.id}-${hIndex}`;
                  return (
                    <div key={hIndex} className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground text-sm">•</span>
                        <Input
                          placeholder="Built a real-time chat feature..."
                          value={highlight}
                          onChange={(e) =>
                            updateHighlight(proj.id, hIndex, e.target.value)
                          }
                          className="flex-1"
                          aria-label={`Highlight ${hIndex + 1}`}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="shrink-0"
                          title="Quantify with AI"
                          onClick={() => handleQuantifyBullet(proj, hIndex)}
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
                          onClick={() => removeHighlight(proj.id, hIndex)}
                          aria-label="Remove highlight"
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
                                updateHighlight(proj.id, hIndex, quantifiedBullets[bulletKey]);
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
