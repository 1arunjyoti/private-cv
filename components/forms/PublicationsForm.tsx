"use client";

import { useCallback, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { BookOpen, Plus, Trash2, Sparkles, Loader2 } from "lucide-react";
import type { Publication } from "@/db";
import { v4 as uuidv4 } from "uuid";
import { CollapsibleSection } from "@/components/CollapsibleSection";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { useLLMSettingsStore } from "@/store/useLLMSettingsStore";
import { redactContactInfo } from "@/lib/llm/redaction";
import { useSectionAIActions } from "./hooks/useSectionAIActions";

interface PublicationsFormProps {
  data: Publication[];
  onChange: (data: Publication[]) => void;
}

export function PublicationsForm({ data, onChange }: PublicationsFormProps) {
  const redaction = useLLMSettingsStore((state) => state.redaction);
  const [generatedSummaries, setGeneratedSummaries] = useState<
    Record<string, string>
  >({});
  const [llmErrors, setLlmErrors] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState<Record<string, boolean>>({});
  const addPublication = useCallback(() => {
    const newPub: Publication = {
      id: uuidv4(),
      name: "",
      publisher: "",
      releaseDate: "",
      url: "",
      summary: "",
    };
    onChange([...data, newPub]);
  }, [data, onChange]);

  const removePublication = useCallback(
    (id: string) => {
      onChange(data.filter((pub) => pub.id !== id));
    },
    [data, onChange],
  );

  const updatePublication = useCallback(
    (id: string, field: keyof Publication, value: string) => {
      onChange(
        data.map((pub) => (pub.id === id ? { ...pub, [field]: value } : pub)),
      );
    },
    [data, onChange],
  );

  const buildInput = useCallback(
    (pub: Publication) => {
      const peerContext = data
        .filter((item) => item.id !== pub.id)
        .slice(0, 3)
        .map((item) =>
          [
            item.name ? `Publication: ${item.name}` : "",
            item.publisher ? `Publisher: ${item.publisher}` : "",
            item.summary ? `Summary: ${item.summary}` : "",
          ]
            .filter(Boolean)
            .join(" | "),
        )
        .filter(Boolean);

      const parts = [
        pub.name ? `Publication: ${pub.name}` : "",
        pub.publisher ? `Publisher: ${pub.publisher}` : "",
        pub.releaseDate ? `Date: ${pub.releaseDate}` : "",
        pub.summary ? `Current Summary: ${pub.summary}` : "",
        peerContext.length
          ? `Other Publications:\n${peerContext.join("\n")}`
          : "",
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
  } = useSectionAIActions<Publication>({
    section: "publication",
    getId: (pub) => pub.id,
    buildInput,
    getCurrentText: (pub) => pub.summary || "",
    setErrors: setLlmErrors,
    setGenerated: setGeneratedSummaries,
    setLoading: setIsGenerating,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Publications
        </h2>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addPublication}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Publication
        </Button>
      </div>

      {data.length === 0 && (
        <div className="text-center text-muted-foreground py-8 border-2 border-dashed border-muted rounded-lg">
          No publications added yet.
        </div>
      )}

      {data.map((pub) => (
        <CollapsibleSection
          key={pub.id}
          title={pub.name || "New Publication"}
          defaultOpen={true}
          actions={
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-destructive hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                removePublication(pub.id);
              }}
              aria-label="Remove publication"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          }
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`name-${pub.id}`}>Publication Name</Label>
                <Input
                  id={`name-${pub.id}`}
                  placeholder="e.g. My Great Article"
                  value={pub.name}
                  onChange={(e) =>
                    updatePublication(pub.id, "name", e.target.value)
                  }
                  autoComplete="off"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`publisher-${pub.id}`}>Publisher</Label>
                <Input
                  id={`publisher-${pub.id}`}
                  placeholder="e.g. Medium, IEEE"
                  value={pub.publisher}
                  onChange={(e) =>
                    updatePublication(pub.id, "publisher", e.target.value)
                  }
                  autoComplete="organization"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`releaseDate-${pub.id}`}>Release Date</Label>
                <Input
                  id={`releaseDate-${pub.id}`}
                  type="date"
                  value={pub.releaseDate}
                  onChange={(e) =>
                    updatePublication(pub.id, "releaseDate", e.target.value)
                  }
                  autoComplete="off"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`url-${pub.id}`}>URL</Label>
                <Input
                  id={`url-${pub.id}`}
                  placeholder="https://..."
                  value={pub.url}
                  onChange={(e) =>
                    updatePublication(pub.id, "url", e.target.value)
                  }
                  autoComplete="url"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor={`summary-${pub.id}`}>Description</Label>
                  <span className="text-xs text-muted-foreground sm:hidden">
                    {(pub.summary || "").length} characters
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground mr-2 hidden sm:inline">
                    {(pub.summary || "").length} characters
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleGenerateSummary(pub)}
                      disabled={isGenerating[pub.id]}
                    >
                      {isGenerating[pub.id] ? (
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
                      onClick={() => handleImproveSummary(pub)}
                      disabled={isGenerating[pub.id]}
                    >
                      Improve
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleGrammarSummary(pub)}
                      disabled={isGenerating[pub.id]}
                    >
                      Grammar
                    </Button>
                  </div>
                </div>
              </div>
              <RichTextEditor
                id={`summary-${pub.id}`}
                placeholder="Brief description of the publication..."
                minHeight="min-h-[60px]"
                value={pub.summary}
                onChange={(value) =>
                  updatePublication(pub.id, "summary", value)
                }
              />
              {llmErrors[pub.id] ? (
                <p className="text-xs text-destructive">{llmErrors[pub.id]}</p>
              ) : null}
              {generatedSummaries[pub.id] ? (
                <div className="rounded-md border bg-muted/30 p-3 space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    Generated Description
                  </p>
                  <p className="text-sm whitespace-pre-wrap">
                    {generatedSummaries[pub.id]}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => {
                        updatePublication(
                          pub.id,
                          "summary",
                          generatedSummaries[pub.id],
                        );
                        clearGenerated(pub.id);
                      }}
                    >
                      Apply
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleGenerateSummary(pub)}
                      disabled={isGenerating[pub.id]}
                    >
                      Regenerate
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => clearGenerated(pub.id)}
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
