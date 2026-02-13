"use client";

import { useCallback, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Award, Plus, Trash2, Sparkles, Loader2 } from "lucide-react";
import type { Certificate } from "@/db";
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

interface CertificatesFormProps {
  data: Certificate[];
  onChange: (data: Certificate[]) => void;
}

export function CertificatesForm({ data, onChange }: CertificatesFormProps) {
  const providerId = useLLMSettingsStore((state) => state.providerId);
  const apiKeys = useLLMSettingsStore((state) => state.apiKeys);
  const consent = useLLMSettingsStore((state) => state.consent);
  const redaction = useLLMSettingsStore((state) => state.redaction);
  const tone = useLLMSettingsStore((state) => state.tone);
  const [generatedSummaries, setGeneratedSummaries] = useState<Record<string, string>>({});
  const [llmErrors, setLlmErrors] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState<Record<string, boolean>>({});
  const addCertificate = useCallback(() => {
    const newCert: Certificate = {
      id: uuidv4(),
      name: "",
      issuer: "",
      date: "",
      url: "",
      summary: "",
    };
    onChange([...data, newCert]);
  }, [data, onChange]);

  const removeCertificate = useCallback(
    (id: string) => {
      onChange(data.filter((cert) => cert.id !== id));
    },
    [data, onChange],
  );

  const updateCertificate = useCallback(
    (id: string, field: keyof Certificate, value: string) => {
      onChange(
        data.map((cert) =>
          cert.id === id ? { ...cert, [field]: value } : cert,
        ),
      );
    },
    [data, onChange],
  );

  const buildInput = useCallback(
    (cert: Certificate) => {
      const peerContext = data
        .filter((item) => item.id !== cert.id)
        .slice(0, 3)
        .map((item) =>
          [
            item.name ? `Certificate: ${item.name}` : "",
            item.issuer ? `Issuer: ${item.issuer}` : "",
            item.summary ? `Summary: ${item.summary}` : "",
          ]
            .filter(Boolean)
            .join(" | "),
        )
        .filter(Boolean);

      const parts = [
        cert.name ? `Certificate: ${cert.name}` : "",
        cert.issuer ? `Issuer: ${cert.issuer}` : "",
        cert.date ? `Date: ${cert.date}` : "",
        cert.summary ? `Current Summary: ${cert.summary}` : "",
        peerContext.length ? `Other Certificates:\n${peerContext.join("\n")}` : "",
      ].filter(Boolean);
      const raw = parts.join("\n");
      return redaction.stripContactInfo ? redactContactInfo(raw) : raw;
    },
    [data, redaction.stripContactInfo],
  );

  const handleGenerateSummary = useCallback(
    async (cert: Certificate) => {
      setLlmErrors((prev) => ({ ...prev, [cert.id]: "" }));
      setGeneratedSummaries((prev) => ({ ...prev, [cert.id]: "" }));
      setIsGenerating((prev) => ({ ...prev, [cert.id]: true }));
      const result = await generateSectionSummaryAction({
        provider: { providerId, apiKeys, consent },
        section: "certificate",
        input: buildInput(cert),
      });
      if (!result.ok) {
        setLlmErrors((prev) => ({ ...prev, [cert.id]: result.error }));
      } else {
        setGeneratedSummaries((prev) => ({ ...prev, [cert.id]: result.text }));
      }
      setIsGenerating((prev) => ({ ...prev, [cert.id]: false }));
    },
    [apiKeys, buildInput, consent, providerId],
  );

  const handleImproveSummary = useCallback(
    async (cert: Certificate) => {
      setLlmErrors((prev) => ({ ...prev, [cert.id]: "" }));
      setGeneratedSummaries((prev) => ({ ...prev, [cert.id]: "" }));
      if (!cert.summary?.trim()) {
        setLlmErrors((prev) => ({
          ...prev,
          [cert.id]: "Add a description before improving it.",
        }));
        return;
      }
      setIsGenerating((prev) => ({ ...prev, [cert.id]: true }));
      const raw = redaction.stripContactInfo
        ? redactContactInfo(cert.summary)
        : cert.summary;
      const result = await improveSectionTextAction({
        provider: { providerId, apiKeys, consent },
        section: "certificate",
        text: raw,
        tone,
        context: buildInput(cert),
      });
      if (!result.ok) {
        setLlmErrors((prev) => ({ ...prev, [cert.id]: result.error }));
      } else {
        setGeneratedSummaries((prev) => ({ ...prev, [cert.id]: result.text }));
      }
      setIsGenerating((prev) => ({ ...prev, [cert.id]: false }));
    },
    [apiKeys, buildInput, consent, providerId, redaction.stripContactInfo, tone],
  );

  const handleGrammarSummary = useCallback(
    async (cert: Certificate) => {
      setLlmErrors((prev) => ({ ...prev, [cert.id]: "" }));
      setGeneratedSummaries((prev) => ({ ...prev, [cert.id]: "" }));
      if (!cert.summary?.trim()) {
        setLlmErrors((prev) => ({
          ...prev,
          [cert.id]: "Add a description before checking grammar.",
        }));
        return;
      }
      setIsGenerating((prev) => ({ ...prev, [cert.id]: true }));
      const raw = redaction.stripContactInfo
        ? redactContactInfo(cert.summary)
        : cert.summary;
      const result = await grammarCheckSectionTextAction({
        provider: { providerId, apiKeys, consent },
        section: "certificate",
        text: raw,
      });
      if (!result.ok) {
        setLlmErrors((prev) => ({ ...prev, [cert.id]: result.error }));
      } else if (result.noChanges) {
        setLlmErrors((prev) => ({ ...prev, [cert.id]: "✓ No grammar issues found." }));
      } else {
        setGeneratedSummaries((prev) => ({
          ...prev,
          [cert.id]: result.text,
        }));
      }
      setIsGenerating((prev) => ({ ...prev, [cert.id]: false }));
    },
    [apiKeys, consent, providerId, redaction.stripContactInfo],
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Award className="h-5 w-5" />
          Certificates
        </h2>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addCertificate}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Certificate
        </Button>
      </div>

      {data.length === 0 && (
        <div className="text-center text-muted-foreground py-8 border-2 border-dashed border-muted rounded-lg">
          No certificates added yet. Click &quot;Add Certificate&quot; to get
          started.
        </div>
      )}

      {data.map((cert, index) => (
        <CollapsibleSection
          key={cert.id}
          title={
            <span className="flex items-center gap-2">
              <span className="text-muted-foreground text-sm">
                #{index + 1}
              </span>
              {cert.name || "New Certificate"}
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
                removeCertificate(cert.id);
              }}
              aria-label="Remove certificate"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          }
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`name-${cert.id}`}>Certificate Name</Label>
                <Input
                  id={`name-${cert.id}`}
                  placeholder="e.g. AWS Certified Solutions Architect"
                  value={cert.name}
                  onChange={(e) =>
                    updateCertificate(cert.id, "name", e.target.value)
                  }
                  autoComplete="off"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`issuer-${cert.id}`}>Issuer</Label>
                <Input
                  id={`issuer-${cert.id}`}
                  placeholder="e.g. Amazon Web Services"
                  value={cert.issuer}
                  onChange={(e) =>
                    updateCertificate(cert.id, "issuer", e.target.value)
                  }
                  autoComplete="organization"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`date-${cert.id}`}>Date</Label>
                <Input
                  id={`date-${cert.id}`}
                  type="date"
                  value={cert.date}
                  onChange={(e) =>
                    updateCertificate(cert.id, "date", e.target.value)
                  }
                  autoComplete="off"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`url-${cert.id}`}>URL</Label>
                <Input
                  id={`url-${cert.id}`}
                  placeholder="https://..."
                  value={cert.url}
                  onChange={(e) =>
                    updateCertificate(cert.id, "url", e.target.value)
                  }
                  autoComplete="url"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor={`summary-${cert.id}`}>Description</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleGenerateSummary(cert)}
                  disabled={isGenerating[cert.id]}
                >
                  {isGenerating[cert.id] ? (
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
                  onClick={() => handleImproveSummary(cert)}
                  disabled={isGenerating[cert.id]}
                >
                  Improve
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleGrammarSummary(cert)}
                  disabled={isGenerating[cert.id]}
                >
                  Grammar
                </Button>
              </div>
              <RichTextEditor
                id={`summary-${cert.id}`}
                placeholder="Brief description of the certification..."
                minHeight="min-h-[60px]"
                value={cert.summary}
                onChange={(value) =>
                  updateCertificate(cert.id, "summary", value)
                }
              />
              {llmErrors[cert.id] ? (
                <p className="text-xs text-destructive">{llmErrors[cert.id]}</p>
              ) : null}
              {generatedSummaries[cert.id] ? (
                <div className="rounded-md border bg-muted/30 p-3 space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    Generated Description
                  </p>
                  <p className="text-sm whitespace-pre-wrap">
                    {generatedSummaries[cert.id]}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => {
                        updateCertificate(cert.id, "summary", generatedSummaries[cert.id]);
                        setGeneratedSummaries((prev) => ({ ...prev, [cert.id]: "" }));
                      }}
                    >
                      Apply
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleGenerateSummary(cert)}
                      disabled={isGenerating[cert.id]}
                    >
                      Regenerate
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setGeneratedSummaries((prev) => ({ ...prev, [cert.id]: "" }))
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
