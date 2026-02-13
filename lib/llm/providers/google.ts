import { GoogleGenAI } from "@google/genai";
import type { LLMGenerateInput, LLMProvider } from "@/lib/llm/types";

const DEFAULT_MODEL = "gemini-3-flash-preview";

function buildPrompt(input: LLMGenerateInput): string {
  if (input.system) {
    return `${input.system}\n\n${input.prompt}`;
  }
  return input.prompt;
}

function extractGoogleText(response: unknown): {
  text: string | null;
  details: string;
  maxTokensReached: boolean;
} {
  const data = response as {
    text?: string;
    candidates?: Array<{
      content?: {
        parts?: Array<{
          text?: string;
        }>;
      };
      finishReason?: string;
    }>;
    promptFeedback?: {
      blockReason?: string;
      blockReasonMessage?: string;
    };
  };

  const directText = data.text?.trim();
  if (directText) {
    return { text: directText, details: "", maxTokensReached: false };
  }

  const fromParts = data.candidates
    ?.flatMap((candidate) => candidate.content?.parts ?? [])
    .map((part) => part.text?.trim() ?? "")
    .filter(Boolean)
    .join("\n")
    .trim();
  if (fromParts) {
    return { text: fromParts, details: "", maxTokensReached: false };
  }

  const blockReason = data.promptFeedback?.blockReason;
  const blockMessage = data.promptFeedback?.blockReasonMessage;
  const finishReason = data.candidates?.[0]?.finishReason;
  const details = [blockReason, blockMessage, finishReason]
    .filter(Boolean)
    .join(" | ");
  return {
    text: null,
    details,
    maxTokensReached: finishReason === "MAX_TOKENS",
  };
}

async function requestGoogleGenerate(
  apiKey: string,
  input: LLMGenerateInput,
): Promise<string> {
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: DEFAULT_MODEL,
    contents: buildPrompt(input),
    config: {
      temperature: input.temperature ?? 0.5,
      maxOutputTokens: input.maxTokens ?? 512,
    },
  });

  const parsed = extractGoogleText(response);
  if (parsed.text) {
    return parsed.text;
  }

  if (parsed.maxTokensReached) {
    const retryTokens = Math.min(Math.max((input.maxTokens ?? 512) * 2, 1024), 4096);
    const retryResponse = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: buildPrompt(input),
      config: {
        temperature: input.temperature ?? 0.5,
        maxOutputTokens: retryTokens,
      },
    });
    const retryParsed = extractGoogleText(retryResponse);
    if (retryParsed.text) {
      return retryParsed.text;
    }
    throw new Error(
      retryParsed.details
        ? `Google LLM returned no text after retry. Details: ${retryParsed.details}`
        : "Google LLM returned no text after retry."
    );
  }

  throw new Error(
    parsed.details
      ? `Google LLM returned no text. Details: ${parsed.details}`
      : "Google LLM returned no text."
  );
}

export const googleProvider: LLMProvider = {
  id: "google",
  label: `Google (${DEFAULT_MODEL})`,
  status: "ready",
  requiresApiKey: true,
  async validateKey(apiKey: string) {
    if (!apiKey) return false;
    const result = await requestGoogleGenerate(apiKey, {
      prompt: "Respond with the word OK.",
      temperature: 0,
      maxTokens: 32,
    });
    return result.toLowerCase().includes("ok");
  },
  async generateText(apiKey: string, input: LLMGenerateInput) {
    if (!apiKey) {
      throw new Error("Missing Google API key.");
    }
    return requestGoogleGenerate(apiKey, input);
  },
};
