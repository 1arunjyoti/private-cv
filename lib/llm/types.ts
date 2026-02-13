export type LLMProviderId = "google" | "openai" | "anthropic" | "local";

export type LLMFeature = "generation" | "analysis" | "rewriting";

export type LLMTone = "neutral" | "formal" | "concise";

/**
 * Local API types supported by the application
 * 
 * - **lmstudio**: LM Studio server (default: http://localhost:1234)
 *   - Uses OpenAI-compatible endpoint: /v1/chat/completions
 *   - Also supports: /api/v1/chat (native), /v1/messages (Anthropic-compatible)
 *   
 * - **openai**: OpenAI-compatible APIs
 *   - Uses endpoint: /v1/chat/completions
 *   
 * - **ollama**: Ollama server (default: http://localhost:11434)
 *   - Uses native endpoint: /api/generate
 *   
 * - **huggingface**: Hugging Face Inference API
 *   - Uses endpoint: /models/{model_id}
 */
export type LocalApiType = "openai" | "ollama" | "lmstudio" | "huggingface";

export interface LLMGenerateInput {
  prompt: string;
  system?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface LLMProvider {
  id: LLMProviderId;
  label: string;
  status: "ready" | "coming-soon";
  /** Whether this provider requires an API key to function. Local models (lmstudio, ollama, openai-compatible) do not. */
  requiresApiKey: boolean;
  validateKey: (apiKey: string) => Promise<boolean>;
  generateText: (apiKey: string, input: LLMGenerateInput) => Promise<string>;
}

export interface LLMConsentSettings {
  generation: boolean;
  analysis: boolean;
  rewriting: boolean;
}

export interface LLMRedactionSettings {
  stripContactInfo: boolean;
}

export interface LLMSettings {
  providerId: LLMProviderId;
  apiKeys: Record<LLMProviderId, string>;
  sessionOnly: boolean;
  consent: LLMConsentSettings;
  redaction: LLMRedactionSettings;
  tone: LLMTone;
  googleModel: string;
  openaiModel: string;
  anthropicModel: string;
  localEndpoint: string;
  localModel: string;
  localApiType: LocalApiType;
}
