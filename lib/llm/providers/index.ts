import { googleProvider } from "@/lib/llm/providers/google";
import { openaiProvider } from "@/lib/llm/providers/openai";
import { anthropicProvider } from "@/lib/llm/providers/anthropic";
import { localProvider } from "@/lib/llm/providers/local";
import type { LLMProvider, LLMProviderId } from "@/lib/llm/types";

export const LLM_PROVIDERS: LLMProvider[] = [
  googleProvider,
  openaiProvider,
  anthropicProvider,
  localProvider,
];

export const getProvider = (id: LLMProviderId): LLMProvider | undefined =>
  LLM_PROVIDERS.find((provider) => provider.id === id);
