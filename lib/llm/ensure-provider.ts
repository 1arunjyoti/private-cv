import { getProvider } from "@/lib/llm/providers";
import type { LLMProvider, LLMProviderId } from "@/lib/llm/types";
import { useLLMSettingsStore } from "@/store/useLLMSettingsStore";

interface EnsureProviderSuccess {
  provider: LLMProvider;
  apiKey: string;
}

interface EnsureProviderError {
  error: string;
}

export type EnsureProviderResult = EnsureProviderSuccess | EnsureProviderError;

/**
 * Validates that an LLM provider is available and properly configured.
 * Handles the API key check correctly: local models (lmstudio, ollama, openai-compatible)
 * do not require an API key, while cloud providers (Google, OpenAI, Anthropic) do.
 *
 * HuggingFace (accessed via the "local" provider with localApiType="huggingface")
 * requires an API key and is enforced here.
 */
export function ensureLLMProvider(opts: {
  providerId: LLMProviderId;
  apiKeys: Record<LLMProviderId, string>;
  consent: { generation: boolean; rewriting: boolean; analysis: boolean };
  /** Which consent gate to check. Pass null to skip consent check. */
  requiredConsent: "generation" | "rewriting" | "analysis" | null;
}): EnsureProviderResult {
  const { providerId, apiKeys, consent, requiredConsent } = opts;

  if (requiredConsent) {
    if (!consent[requiredConsent]) {
      const labels: Record<string, string> = {
        generation: "content generation",
        rewriting: "rewriting",
        analysis: "analysis",
      };
      return { error: `Enable ${labels[requiredConsent]} consent to use this feature.` };
    }
  }

  const provider = getProvider(providerId);
  if (!provider || provider.status !== "ready") {
    return { error: "Selected provider is not available yet." };
  }

  const apiKey = apiKeys[providerId]?.trim() ?? "";
  const localApiType = useLLMSettingsStore.getState().localApiType;
  const requiresApiKey =
    provider.requiresApiKey ||
    (providerId === "local" && localApiType === "huggingface");

  // Only require an API key if the provider needs one
  if (requiresApiKey && !apiKey) {
    if (providerId === "local" && localApiType === "huggingface") {
      return {
        error:
          "Missing API key for Hugging Face Inference. Configure it in Settings.",
      };
    }
    return { error: `Missing API key for ${provider.label}. Configure it in Settings.` };
  }

  return { provider, apiKey };
}
