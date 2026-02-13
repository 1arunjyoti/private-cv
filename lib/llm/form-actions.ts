import type { LLMConsentSettings, LLMProviderId, LLMTone } from "@/lib/llm/types";
import { ensureLLMProvider } from "@/lib/llm/ensure-provider";
import {
  buildGrammarPrompt,
  buildRewritePrompt,
  buildSectionSummaryPrompt,
} from "@/lib/llm/prompts";
import { processGrammarOutput } from "@/lib/llm/grammar";

export interface LLMProviderContext {
  providerId: LLMProviderId;
  apiKeys: Record<LLMProviderId, string>;
  consent: LLMConsentSettings;
}

export type LLMTextActionResult =
  | { ok: true; text: string }
  | { ok: false; error: string };

export type LLMGrammarActionResult =
  | { ok: true; text: string; noChanges: boolean }
  | { ok: false; error: string };

async function generatePromptText(opts: {
  provider: LLMProviderContext;
  requiredConsent: "generation" | "rewriting" | "analysis" | null;
  prompt: string;
  temperature: number;
  maxTokens: number;
}): Promise<LLMTextActionResult> {
  const providerResult = ensureLLMProvider({
    providerId: opts.provider.providerId,
    apiKeys: opts.provider.apiKeys,
    consent: opts.provider.consent,
    requiredConsent: opts.requiredConsent,
  });
  if ("error" in providerResult) {
    return { ok: false, error: providerResult.error };
  }

  try {
    const text = await providerResult.provider.generateText(providerResult.apiKey, {
      prompt: opts.prompt,
      temperature: opts.temperature,
      maxTokens: opts.maxTokens,
    });
    return { ok: true, text };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

export async function generatePromptTextAction(opts: {
  provider: LLMProviderContext;
  requiredConsent: "generation" | "rewriting" | "analysis" | null;
  prompt: string;
  temperature?: number;
  maxTokens?: number;
}): Promise<LLMTextActionResult> {
  return generatePromptText({
    provider: opts.provider,
    requiredConsent: opts.requiredConsent,
    prompt: opts.prompt,
    temperature: opts.temperature ?? 0.3,
    maxTokens: opts.maxTokens ?? 256,
  });
}

export async function generateSectionSummaryAction(opts: {
  provider: LLMProviderContext;
  section: string;
  input: string;
  temperature?: number;
  maxTokens?: number;
}): Promise<LLMTextActionResult> {
  return generatePromptTextAction({
    provider: opts.provider,
    requiredConsent: "generation",
    prompt: buildSectionSummaryPrompt(opts.section, opts.input),
    temperature: opts.temperature ?? 0.3,
    maxTokens: opts.maxTokens ?? 256,
  });
}

export async function improveSectionTextAction(opts: {
  provider: LLMProviderContext;
  section: string;
  text: string;
  tone: LLMTone;
  context?: string;
  temperature?: number;
  maxTokens?: number;
}): Promise<LLMTextActionResult> {
  return generatePromptTextAction({
    provider: opts.provider,
    requiredConsent: "rewriting",
    prompt: buildRewritePrompt(opts.section, opts.text, opts.tone, opts.context),
    temperature: opts.temperature ?? 0.2,
    maxTokens: opts.maxTokens ?? 256,
  });
}

export async function grammarCheckSectionTextAction(opts: {
  provider: LLMProviderContext;
  section: string;
  text: string;
  temperature?: number;
  maxTokens?: number;
}): Promise<LLMGrammarActionResult> {
  const outputResult = await generatePromptTextAction({
    provider: opts.provider,
    requiredConsent: "rewriting",
    prompt: buildGrammarPrompt(opts.section, opts.text),
    temperature: opts.temperature ?? 0.1,
    maxTokens: opts.maxTokens ?? 256,
  });

  if (!outputResult.ok) {
    return outputResult;
  }

  const grammarResult = processGrammarOutput(opts.text, outputResult.text);
  if (grammarResult.error) {
    return { ok: false, error: grammarResult.error };
  }

  if (grammarResult.noChanges) {
    return { ok: true, text: "", noChanges: true };
  }

  return { ok: true, text: grammarResult.text || "", noChanges: false };
}
