"use client";

import { useCallback, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Trophy, Plus, Trash2, Sparkles, Loader2 } from "lucide-react";
import type { Award } from "@/db";
import { v4 as uuidv4 } from "uuid";
import { CollapsibleSection } from "@/components/CollapsibleSection";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { useLLMSettingsStore } from "@/store/useLLMSettingsStore";
import {
  generateSectionSummaryAction,
  improveSectionTextAction,
  grammarCheckSectionTextAction,
} from "@/lib/llm/form-actions";
import { redactContactInfo } from "@/lib/llm/redaction";

interface AwardsFormProps {
  data: Award[];
  onChange: (data: Award[]) => void;
}

export function AwardsForm({ data, onChange }: AwardsFormProps) {
  const providerId = useLLMSettingsStore((state) => state.providerId);
  const apiKeys = useLLMSettingsStore((state) => state.apiKeys);
  const consent = useLLMSettingsStore((state) => state.consent);
  const redaction = useLLMSettingsStore((state) => state.redaction);
  const tone = useLLMSettingsStore((state) => state.tone);
  const [generatedSummaries, setGeneratedSummaries] = useState<Record<string, string>>({});
  const [llmErrors, setLlmErrors] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState<Record<string, boolean>>({});
  const addAward = useCallback(() => {
    const newAward: Award = {
      id: uuidv4(),
      title: "",
      date: "",
      awarder: "",
      summary: "",
    };
    onChange([...data, newAward]);
  }, [data, onChange]);

  const removeAward = useCallback(
    (id: string) => {
      onChange(data.filter((item) => item.id !== id));
    },
    [data, onChange],
  );

  const updateAward = useCallback(
    (id: string, field: keyof Award, value: string) => {
      onChange(
        data.map((item) =>
          item.id === id ? { ...item, [field]: value } : item,
        ),
      );
    },
    [data, onChange],
  );

  const buildInput = useCallback(
    (award: Award) => {
      const peerContext = data
        .filter((item) => item.id !== award.id)
        .slice(0, 3)
        .map((item) =>
          [
            item.title ? `Award: ${item.title}` : "",
            item.awarder ? `Awarder: ${item.awarder}` : "",
            item.summary ? `Summary: ${item.summary}` : "",
          ]
            .filter(Boolean)
            .join(" | "),
        )
        .filter(Boolean);

      const parts = [
        award.title ? `Award: ${award.title}` : "",
        award.awarder ? `Awarder: ${award.awarder}` : "",
        award.date ? `Date: ${award.date}` : "",
        award.summary ? `Current Summary: ${award.summary}` : "",
        peerContext.length ? `Other Awards:\n${peerContext.join("\n")}` : "",
      ].filter(Boolean);
      const raw = parts.join("\n");
      return redaction.stripContactInfo ? redactContactInfo(raw) : raw;
    },
    [data, redaction.stripContactInfo],
  );

  const handleGenerateSummary = useCallback(
    async (award: Award) => {
      setLlmErrors((prev) => ({ ...prev, [award.id]: "" }));
      setGeneratedSummaries((prev) => ({ ...prev, [award.id]: "" }));
      setIsGenerating((prev) => ({ ...prev, [award.id]: true }));
      const result = await generateSectionSummaryAction({
        provider: { providerId, apiKeys, consent },
        section: "award",
        input: buildInput(award),
      });
      if (!result.ok) {
        setLlmErrors((prev) => ({ ...prev, [award.id]: result.error }));
        setIsGenerating((prev) => ({ ...prev, [award.id]: false }));
        return;
      }
      setGeneratedSummaries((prev) => ({ ...prev, [award.id]: result.text }));
      setIsGenerating((prev) => ({ ...prev, [award.id]: false }));
    },
    [apiKeys, buildInput, consent, providerId],
  );

  const handleImproveSummary = useCallback(
    async (award: Award) => {
      setLlmErrors((prev) => ({ ...prev, [award.id]: "" }));
      setGeneratedSummaries((prev) => ({ ...prev, [award.id]: "" }));
      if (!award.summary?.trim()) {
        setLlmErrors((prev) => ({
          ...prev,
          [award.id]: "Add a description before improving it.",
        }));
        return;
      }
      const raw = redaction.stripContactInfo
        ? redactContactInfo(award.summary)
        : award.summary;
      setIsGenerating((prev) => ({ ...prev, [award.id]: true }));
      const result = await improveSectionTextAction({
        provider: { providerId, apiKeys, consent },
        section: "award",
        text: raw,
        tone,
        context: buildInput(award),
      });
      if (!result.ok) {
        setLlmErrors((prev) => ({ ...prev, [award.id]: result.error }));
        setIsGenerating((prev) => ({ ...prev, [award.id]: false }));
        return;
      }
      setGeneratedSummaries((prev) => ({ ...prev, [award.id]: result.text }));
      setIsGenerating((prev) => ({ ...prev, [award.id]: false }));
    },
    [apiKeys, buildInput, consent, providerId, redaction.stripContactInfo, tone],
  );

  const handleGrammarSummary = useCallback(
    async (award: Award) => {
      setLlmErrors((prev) => ({ ...prev, [award.id]: "" }));
      setGeneratedSummaries((prev) => ({ ...prev, [award.id]: "" }));
      if (!award.summary?.trim()) {
        setLlmErrors((prev) => ({
          ...prev,
          [award.id]: "Add a description before checking grammar.",
        }));
        return;
      }
      const raw = redaction.stripContactInfo
        ? redactContactInfo(award.summary)
        : award.summary;
      setIsGenerating((prev) => ({ ...prev, [award.id]: true }));
      const result = await grammarCheckSectionTextAction({
        provider: { providerId, apiKeys, consent },
        section: "award",
        text: raw,
      });
      if (!result.ok) {
        setLlmErrors((prev) => ({ ...prev, [award.id]: result.error }));
        setIsGenerating((prev) => ({ ...prev, [award.id]: false }));
        return;
      }
      if (result.noChanges) {
        setLlmErrors((prev) => ({ ...prev, [award.id]: "✓ No grammar issues found." }));
        setIsGenerating((prev) => ({ ...prev, [award.id]: false }));
        return;
      }
      setGeneratedSummaries((prev) => ({
        ...prev,
        [award.id]: result.text,
      }));
      setIsGenerating((prev) => ({ ...prev, [award.id]: false }));
    },
    [apiKeys, consent, providerId, redaction.stripContactInfo],
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Awards
        </h2>
        <Button type="button" variant="outline" size="sm" onClick={addAward}>
          <Plus className="h-4 w-4 mr-2" />
          Add Award
        </Button>
      </div>

      {data.length === 0 && (
        <div className="text-center text-muted-foreground py-8 border-2 border-dashed border-muted rounded-lg">
          No awards added yet.
        </div>
      )}

      {data.map((item) => (
        <CollapsibleSection
          key={item.id}
          title={item.title || "New Award"}
          defaultOpen={true}
          actions={
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-destructive hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                removeAward(item.id);
              }}
              aria-label="Remove award"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          }
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`title-${item.id}`}>Award Title</Label>
                <Input
                  id={`title-${item.id}`}
                  placeholder="e.g. Employee of the Month"
                  value={item.title}
                  onChange={(e) =>
                    updateAward(item.id, "title", e.target.value)
                  }
                  autoComplete="off"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`awarder-${item.id}`}>Awarder</Label>
                <Input
                  id={`awarder-${item.id}`}
                  placeholder="e.g. Company Inc."
                  value={item.awarder}
                  onChange={(e) =>
                    updateAward(item.id, "awarder", e.target.value)
                  }
                  autoComplete="organization"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`date-${item.id}`}>Date</Label>
              <Input
                id={`date-${item.id}`}
                type="date"
                value={item.date}
                onChange={(e) => updateAward(item.id, "date", e.target.value)}
                autoComplete="off"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor={`summary-${item.id}`}>Description</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleGenerateSummary(item)}
                  disabled={isGenerating[item.id]}
                >
                  {isGenerating[item.id] ? (
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
                  onClick={() => handleImproveSummary(item)}
                  disabled={isGenerating[item.id]}
                >
                  Improve
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleGrammarSummary(item)}
                  disabled={isGenerating[item.id]}
                >
                  Grammar
                </Button>
              </div>
              <RichTextEditor
                id={`summary-${item.id}`}
                placeholder="Brief description of the award..."
                minHeight="min-h-[60px]"
                value={item.summary}
                onChange={(value) => updateAward(item.id, "summary", value)}
              />
              {llmErrors[item.id] ? (
                <p className="text-xs text-destructive">{llmErrors[item.id]}</p>
              ) : null}
              {generatedSummaries[item.id] ? (
                <div className="rounded-md border bg-muted/30 p-3 space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    Generated Description
                  </p>
                  <p className="text-sm whitespace-pre-wrap">
                    {generatedSummaries[item.id]}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => {
                        updateAward(item.id, "summary", generatedSummaries[item.id]);
                        setGeneratedSummaries((prev) => ({ ...prev, [item.id]: "" }));
                      }}
                    >
                      Apply
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleGenerateSummary(item)}
                      disabled={isGenerating[item.id]}
                    >
                      Regenerate
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setGeneratedSummaries((prev) => ({ ...prev, [item.id]: "" }))
                      }
                    >
                      Discard
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </CollapsibleSection>
      ))}
    </div>
  );
}
