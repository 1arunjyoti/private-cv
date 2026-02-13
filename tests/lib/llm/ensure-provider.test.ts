import { beforeEach, describe, expect, it, vi } from "vitest";
import type { LLMProvider } from "@/lib/llm/types";
import { ensureLLMProvider } from "@/lib/llm/ensure-provider";

const { mockGetProvider, mockSettingsGetState } = vi.hoisted(() => ({
  mockGetProvider: vi.fn(),
  mockSettingsGetState: vi.fn(),
}));

vi.mock("@/lib/llm/providers", () => ({
  getProvider: mockGetProvider,
}));

vi.mock("@/store/useLLMSettingsStore", () => ({
  useLLMSettingsStore: {
    getState: mockSettingsGetState,
  },
}));

const baseConsent = {
  generation: true,
  rewriting: true,
  analysis: true,
};

const buildProvider = (overrides: Partial<LLMProvider> = {}): LLMProvider => ({
  id: "google",
  label: "Google",
  status: "ready",
  requiresApiKey: true,
  validateKey: vi.fn(async () => true),
  generateText: vi.fn(async () => "ok"),
  ...overrides,
});

describe("ensureLLMProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSettingsGetState.mockReturnValue({ localApiType: "lmstudio" });
  });

  it("blocks when required consent is not enabled", () => {
    mockGetProvider.mockReturnValue(buildProvider());

    const result = ensureLLMProvider({
      providerId: "google",
      apiKeys: {
        google: "key",
        openai: "",
        anthropic: "",
        local: "",
      },
      consent: { ...baseConsent, generation: false },
      requiredConsent: "generation",
    });

    expect("error" in result && result.error).toBe(
      "Enable content generation consent to use this feature.",
    );
  });

  it("requires API key for local Hugging Face mode", () => {
    mockSettingsGetState.mockReturnValue({ localApiType: "huggingface" });
    mockGetProvider.mockReturnValue(
      buildProvider({
        id: "local",
        label: "Local Model",
        requiresApiKey: false,
      }),
    );

    const result = ensureLLMProvider({
      providerId: "local",
      apiKeys: {
        google: "",
        openai: "",
        anthropic: "",
        local: "",
      },
      consent: baseConsent,
      requiredConsent: "generation",
    });

    expect("error" in result && result.error).toBe(
      "Missing API key for Hugging Face Inference. Configure it in Settings.",
    );
  });

  it("does not require API key for local lmstudio mode", () => {
    mockSettingsGetState.mockReturnValue({ localApiType: "lmstudio" });
    const localProvider = buildProvider({
      id: "local",
      label: "Local Model",
      requiresApiKey: false,
    });
    mockGetProvider.mockReturnValue(localProvider);

    const result = ensureLLMProvider({
      providerId: "local",
      apiKeys: {
        google: "",
        openai: "",
        anthropic: "",
        local: "",
      },
      consent: baseConsent,
      requiredConsent: "generation",
    });

    expect("error" in result).toBe(false);
    if (!("error" in result)) {
      expect(result.provider).toBe(localProvider);
      expect(result.apiKey).toBe("");
    }
  });

  it("requires API key for cloud providers", () => {
    mockGetProvider.mockReturnValue(buildProvider({ label: "Google" }));

    const result = ensureLLMProvider({
      providerId: "google",
      apiKeys: {
        google: "",
        openai: "",
        anthropic: "",
        local: "",
      },
      consent: baseConsent,
      requiredConsent: "generation",
    });

    expect("error" in result && result.error).toBe(
      "Missing API key for Google. Configure it in Settings.",
    );
  });

  it("returns provider and trimmed API key when valid", () => {
    const provider = buildProvider({ label: "Google" });
    mockGetProvider.mockReturnValue(provider);

    const result = ensureLLMProvider({
      providerId: "google",
      apiKeys: {
        google: "  abc123  ",
        openai: "",
        anthropic: "",
        local: "",
      },
      consent: baseConsent,
      requiredConsent: "analysis",
    });

    expect("error" in result).toBe(false);
    if (!("error" in result)) {
      expect(result.provider).toBe(provider);
      expect(result.apiKey).toBe("abc123");
    }
  });
});
