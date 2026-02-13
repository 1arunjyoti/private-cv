"use client";

import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Layers, Plus, Trash2, Sparkles, Loader2 } from "lucide-react";
import type { CustomSection } from "@/db";
import { v4 as uuidv4 } from "uuid";
import { CollapsibleSection } from "@/components/CollapsibleSection";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { useLLMSettingsStore } from "@/store/useLLMSettingsStore";
import { redactContactInfo } from "@/lib/llm/redaction";
import { useSectionAIActions } from "./hooks/useSectionAIActions";

interface CustomFormProps {
  data: CustomSection[];
  onChange: (data: CustomSection[]) => void;
}

type CustomAIItemContext = {
  section: CustomSection;
  item: CustomSection["items"][number];
};

export function CustomForm({ data, onChange }: CustomFormProps) {
  const redaction = useLLMSettingsStore((state) => state.redaction);
  const [generatedSummaries, setGeneratedSummaries] = useState<Record<string, string>>({});
  const [llmErrors, setLlmErrors] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState<Record<string, boolean>>({});

  const addSection = useCallback(() => {
    const newSection: CustomSection = {
      id: uuidv4(),
      name: "New Section",
      items: [],
    };
    const newData = [...data, newSection];
    onChange(newData);
  }, [data, onChange]);

  const removeSection = useCallback(
    (id: string) => {
      if (confirm("Are you sure you want to remove this entire section?")) {
        const newData = data.filter((sec) => sec.id !== id);
        onChange(newData);
      }
    },
    [data, onChange],
  );

  const updateSectionName = useCallback(
    (id: string, name: string) => {
      onChange(data.map((sec) => (sec.id === id ? { ...sec, name } : sec)));
    },
    [data, onChange],
  );

  const addItem = useCallback(
    (sectionId: string) => {
      onChange(
        data.map((sec) =>
          sec.id === sectionId
            ? {
                ...sec,
                items: [
                  ...sec.items,
                  {
                    id: uuidv4(),
                    name: "",
                    description: "",
                    date: "",
                    url: "",
                    summary: "",
                  },
                ],
              }
            : sec,
        ),
      );
    },
    [data, onChange],
  );

  const removeItem = useCallback(
    (sectionId: string, itemId: string) => {
      onChange(
        data.map((sec) =>
          sec.id === sectionId
            ? {
                ...sec,
                items: sec.items.filter((item) => item.id !== itemId),
              }
            : sec,
        ),
      );
    },
    [data, onChange],
  );

  const updateItem = useCallback(
    (sectionId: string, itemId: string, field: string, value: string) => {
      onChange(
        data.map((sec) =>
          sec.id === sectionId
            ? {
                ...sec,
                items: sec.items.map((item) =>
                  item.id === itemId ? { ...item, [field]: value } : item,
                ),
              }
            : sec,
        ),
      );
    },
    [data, onChange],
  );

  const buildInput = useCallback(
    ({ section, item }: CustomAIItemContext) => {
      const peerContext = section.items
        .filter((entry) => entry.id !== item.id)
        .slice(0, 3)
        .map((entry) =>
          [
            entry.name ? `Title: ${entry.name}` : "",
            entry.description ? `Subtitle: ${entry.description}` : "",
            entry.summary ? `Summary: ${entry.summary}` : "",
          ]
            .filter(Boolean)
            .join(" | "),
        )
        .filter(Boolean);

      const parts = [
        section.name ? `Section: ${section.name}` : "",
        item.name ? `Title: ${item.name}` : "",
        item.description ? `Subtitle: ${item.description}` : "",
        item.date ? `Date: ${item.date}` : "",
        item.summary ? `Current Summary: ${item.summary}` : "",
        peerContext.length ? `Other Items:\n${peerContext.join("\n")}` : "",
      ].filter(Boolean);
      const raw = parts.join("\n");
      return redaction.stripContactInfo ? redactContactInfo(raw) : raw;
    },
    [redaction.stripContactInfo],
  );

  const {
    handleGenerate,
    handleImprove,
    handleGrammar,
    clearGenerated,
  } = useSectionAIActions<CustomAIItemContext>({
    section: ({ section }) => section.name || "custom item",
    getId: ({ item }) => item.id,
    buildInput,
    getCurrentText: ({ item }) => item.summary || "",
    setErrors: setLlmErrors,
    setGenerated: setGeneratedSummaries,
    setLoading: setIsGenerating,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Layers className="h-5 w-5" />
          Custom Sections
        </h2>
        <Button type="button" variant="outline" size="sm" onClick={addSection}>
          <Plus className="h-4 w-4 mr-2" />
          Add Section
        </Button>
      </div>

      {data.length === 0 && (
        <div className="text-center text-muted-foreground py-8 border-2 border-dashed border-muted rounded-lg">
          No custom sections added yet. Click &quot;Add Section&quot; to create
          one (e.g. Volunteering, Speaking, Organizations).
        </div>
      )}

      {data.map((sec, sectionIndex) => (
        <CollapsibleSection
          key={sec.id}
          title={
            <span className="flex items-center gap-2">
              <span className="text-muted-foreground text-sm">
                #{sectionIndex + 1}
              </span>
              {sec.name || "New Section"}
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
                removeSection(sec.id);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          }
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={`section-name-${sec.id}`}>Section Title</Label>
              <Input
                id={`section-name-${sec.id}`}
                value={sec.name}
                onChange={(e) => updateSectionName(sec.id, e.target.value)}
                placeholder="Section Title (e.g. Volunteering)"
                autoComplete="off"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium">Items</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addItem(sec.id)}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Item
                </Button>
              </div>

              <div className="space-y-3">
                {sec.items.length === 0 && (
                  <div className="text-sm text-center py-6 border-2 border-dashed rounded-lg text-muted-foreground">
                    No items in this section yet.
                  </div>
                )}
                {sec.items.map((item, itemIndex) => (
                  <div
                    key={item.id}
                    className="border rounded-lg p-4 space-y-4 bg-muted/30"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="text-sm text-muted-foreground font-medium">
                        Item #{itemIndex + 1}: {item.name || "Untitled"}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive shrink-0"
                        onClick={() => removeItem(sec.id, item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`name-${item.id}`}>
                          Item Name / Title
                        </Label>
                        <Input
                          id={`name-${item.id}`}
                          placeholder="e.g. Volunteer"
                          value={item.name}
                          onChange={(e) =>
                            updateItem(
                              sec.id,
                              item.id,
                              "name",
                              e.target.value,
                            )
                          }
                          autoComplete="off"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`description-${item.id}`}>
                          Subtitle / Organization
                        </Label>
                        <Input
                          id={`description-${item.id}`}
                          placeholder="e.g. Red Cross"
                          value={item.description}
                          onChange={(e) =>
                            updateItem(
                              sec.id,
                              item.id,
                              "description",
                              e.target.value,
                            )
                          }
                          autoComplete="off"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`date-${item.id}`}>Date</Label>
                        <Input
                          id={`date-${item.id}`}
                          type="text"
                          placeholder="e.g. 2020 - Present"
                          value={item.date}
                          onChange={(e) =>
                            updateItem(
                              sec.id,
                              item.id,
                              "date",
                              e.target.value,
                            )
                          }
                          autoComplete="off"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`url-${item.id}`}>URL</Label>
                        <Input
                          id={`url-${item.id}`}
                          placeholder="https://..."
                          value={item.url}
                          onChange={(e) =>
                            updateItem(
                              sec.id,
                              item.id,
                              "url",
                              e.target.value,
                            )
                          }
                          autoComplete="url"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor={`summary-${item.id}`}>
                          Description
                        </Label>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleGenerate({ section: sec, item })}
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
                            onClick={() => handleImprove({ section: sec, item })}
                            disabled={isGenerating[item.id]}
                          >
                            Improve
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleGrammar({ section: sec, item })}
                            disabled={isGenerating[item.id]}
                          >
                            Grammar
                          </Button>
                        </div>
                      </div>
                      <RichTextEditor
                        id={`summary-${item.id}`}
                        placeholder="Details about this item..."
                        minHeight="min-h-[60px]"
                        value={item.summary}
                        onChange={(value) =>
                          updateItem(sec.id, item.id, "summary", value)
                        }
                      />
                      {llmErrors[item.id] ? (
                        <p className="text-xs text-destructive">
                          {llmErrors[item.id]}
                        </p>
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
                                updateItem(
                                  sec.id,
                                  item.id,
                                  "summary",
                                  generatedSummaries[item.id],
                                );
                                clearGenerated(item.id);
                              }}
                            >
                              Apply
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleGenerate({ section: sec, item })}
                              disabled={isGenerating[item.id]}
                            >
                              Regenerate
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => clearGenerated(item.id)}
                            >
                              Discard
                            </Button>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CollapsibleSection>
      ))}
    </div>
  );
}
