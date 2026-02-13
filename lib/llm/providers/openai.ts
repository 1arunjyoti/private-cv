import OpenAI from "openai";
import type { LLMGenerateInput, LLMProvider } from "@/lib/llm/types";
import { useLLMSettingsStore } from "@/store/useLLMSettingsStore";

const DEFAULT_MODEL = "gpt-5-mini";
const MIN_MAX_OUTPUT_TOKENS = 16;

function getOpenAIModel(): string {
  const configured = useLLMSettingsStore.getState().openaiModel?.trim();
  return configured || DEFAULT_MODEL;
}

function formatAPIErrorDetails(error: InstanceType<typeof OpenAI.APIError>): string {
  const e = error as InstanceType<typeof OpenAI.APIError> & {
    type?: string;
    code?: string | null;
    param?: string | null;
    request_id?: string;
  };

  const details = [
    e.type ? `type=${e.type}` : "",
    e.code ? `code=${e.code}` : "",
    e.param ? `param=${e.param}` : "",
    e.request_id ? `request_id=${e.request_id}` : "",
  ].filter(Boolean);

  return details.length ? ` [${details.join(", ")}]` : "";
}

async function requestOpenAI(
  apiKey: string,
  input: LLMGenerateInput,
): Promise<string> {
  const client = new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true,
  });

  try {
    const messages: Array<{ role: "system" | "user"; content: string }> = [];

    if (input.system?.trim()) {
      messages.push({
        role: "system",
        content: input.system.trim(),
      });
    }

    messages.push({
      role: "user",
      content: input.prompt,
    });

    const response = await client.responses.create({
      model: getOpenAIModel(),
      input: messages,
      max_output_tokens: Math.max(
        input.maxTokens ?? 512,
        MIN_MAX_OUTPUT_TOKENS,
      ),
    });

    const text = response.output_text?.trim();

    if (!text) {
      throw new Error("OpenAI returned an empty response.");
    }

    return text;
  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      const details = formatAPIErrorDetails(error);
      if (error.status === 429) {
        throw new Error(
          `OpenAI quota/rate limit reached. Check billing and usage limits, or try again later.${details}`,
        );
      }
      throw new Error(
        `OpenAI API error (${error.status}): ${error.message}${details}`,
      );
    }
    throw error;
  }
}


export const openaiProvider: LLMProvider = {
  id: "openai",
  label: "OpenAI",
  status: "ready",
  requiresApiKey: true,

  async validateKey(apiKey: string) {
    if (!apiKey) return false;

    const result = await requestOpenAI(apiKey, {
      prompt: "Respond with the word OK.",
      temperature: 0,
      maxTokens: MIN_MAX_OUTPUT_TOKENS,
    });

    return result.toLowerCase().includes("ok");
  },

  async generateText(apiKey: string, input: LLMGenerateInput) {
    if (!apiKey) {
      throw new Error("Missing OpenAI API key.");
    }

    return requestOpenAI(apiKey, input);
  },
};
