"use client";

import { useCallback } from "react";
import type { Dispatch, SetStateAction } from "react";
import { useLLMSettingsStore } from "@/store/useLLMSettingsStore";
import {
  generateSectionSummaryAction,
  improveSectionTextAction,
  grammarCheckSectionTextAction,
} from "@/lib/llm/form-actions";
import { redactContactInfo } from "@/lib/llm/redaction";

interface UseSectionAIActionsOptions<T> {
  section: string | ((item: T) => string);
  improveSection?: string | ((item: T) => string);
  grammarSection?: string | ((item: T) => string);
  getId: (item: T) => string;
  buildInput: (item: T) => string;
  getCurrentText: (item: T) => string;
  setErrors: Dispatch<SetStateAction<Record<string, string>>>;
  setGenerated: Dispatch<SetStateAction<Record<string, string>>>;
  setLoading: Dispatch<SetStateAction<Record<string, boolean>>>;
  emptyImproveMessage?: string;
  emptyGrammarMessage?: string;
  noChangesMessage?: string;
}

export function useSectionAIActions<T>(opts: UseSectionAIActionsOptions<T>) {
  const providerId = useLLMSettingsStore((state) => state.providerId);
  const apiKeys = useLLMSettingsStore((state) => state.apiKeys);
  const consent = useLLMSettingsStore((state) => state.consent);
  const redaction = useLLMSettingsStore((state) => state.redaction);
  const tone = useLLMSettingsStore((state) => state.tone);

  const resolveSection = useCallback(
    (value: string | ((item: T) => string) | undefined, item: T) => {
      if (!value) return undefined;
      return typeof value === "function" ? value(item) : value;
    },
    [],
  );

  const handleGenerate = useCallback(
    async (item: T) => {
      const id = opts.getId(item);
      opts.setErrors((prev) => ({ ...prev, [id]: "" }));
      opts.setGenerated((prev) => ({ ...prev, [id]: "" }));
      opts.setLoading((prev) => ({ ...prev, [id]: true }));
      try {
        const result = await generateSectionSummaryAction({
          provider: { providerId, apiKeys, consent },
          section: resolveSection(opts.section, item) || "",
          input: opts.buildInput(item),
        });
        if (!result.ok) {
          opts.setErrors((prev) => ({ ...prev, [id]: result.error }));
          return;
        }
        opts.setGenerated((prev) => ({ ...prev, [id]: result.text }));
      } finally {
        opts.setLoading((prev) => ({ ...prev, [id]: false }));
      }
    },
    [apiKeys, consent, opts, providerId, resolveSection],
  );

  const handleImprove = useCallback(
    async (item: T) => {
      const id = opts.getId(item);
      opts.setErrors((prev) => ({ ...prev, [id]: "" }));
      opts.setGenerated((prev) => ({ ...prev, [id]: "" }));
      const currentText = opts.getCurrentText(item);
      if (!currentText.trim()) {
        opts.setErrors((prev) => ({
          ...prev,
          [id]: opts.emptyImproveMessage ?? "Add a description before improving it.",
        }));
        return;
      }

      opts.setLoading((prev) => ({ ...prev, [id]: true }));
      try {
        const result = await improveSectionTextAction({
          provider: { providerId, apiKeys, consent },
          section:
            resolveSection(opts.improveSection, item) ??
            resolveSection(opts.section, item) ??
            "",
          text: redaction.stripContactInfo
            ? redactContactInfo(currentText)
            : currentText,
          tone,
          context: opts.buildInput(item),
        });
        if (!result.ok) {
          opts.setErrors((prev) => ({ ...prev, [id]: result.error }));
          return;
        }
        opts.setGenerated((prev) => ({ ...prev, [id]: result.text }));
      } finally {
        opts.setLoading((prev) => ({ ...prev, [id]: false }));
      }
    },
    [
      apiKeys,
      consent,
      opts,
      providerId,
      redaction.stripContactInfo,
      resolveSection,
      tone,
    ],
  );

  const handleGrammar = useCallback(
    async (item: T) => {
      const id = opts.getId(item);
      opts.setErrors((prev) => ({ ...prev, [id]: "" }));
      opts.setGenerated((prev) => ({ ...prev, [id]: "" }));
      const currentText = opts.getCurrentText(item);
      if (!currentText.trim()) {
        opts.setErrors((prev) => ({
          ...prev,
          [id]:
            opts.emptyGrammarMessage ??
            "Add a description before checking grammar.",
        }));
        return;
      }

      opts.setLoading((prev) => ({ ...prev, [id]: true }));
      try {
        const result = await grammarCheckSectionTextAction({
          provider: { providerId, apiKeys, consent },
          section:
            resolveSection(opts.grammarSection, item) ??
            resolveSection(opts.improveSection, item) ??
            resolveSection(opts.section, item) ??
            "",
          text: redaction.stripContactInfo
            ? redactContactInfo(currentText)
            : currentText,
        });
        if (!result.ok) {
          opts.setErrors((prev) => ({ ...prev, [id]: result.error }));
          return;
        }
        if (result.noChanges) {
          opts.setErrors((prev) => ({
            ...prev,
            [id]: opts.noChangesMessage ?? "✓ No grammar issues found.",
          }));
          return;
        }
        opts.setGenerated((prev) => ({ ...prev, [id]: result.text }));
      } finally {
        opts.setLoading((prev) => ({ ...prev, [id]: false }));
      }
    },
    [
      apiKeys,
      consent,
      opts,
      providerId,
      redaction.stripContactInfo,
      resolveSection,
    ],
  );

  const clearGenerated = useCallback(
    (id: string) => {
      opts.setGenerated((prev) => ({ ...prev, [id]: "" }));
    },
    [opts],
  );

  return {
    handleGenerate,
    handleImprove,
    handleGrammar,
    clearGenerated,
  };
}
