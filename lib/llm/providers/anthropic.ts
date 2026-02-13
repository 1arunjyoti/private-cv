import Anthropic from "@anthropic-ai/sdk";
import type { LLMGenerateInput, LLMProvider } from "@/lib/llm/types";

const DEFAULT_MODEL = "claude-haiku-4-5-20251001";

async function requestAnthropic(
  apiKey: string,
  input: LLMGenerateInput,
): Promise<string> {
  const client = new Anthropic({
    apiKey: apiKey,
    dangerouslyAllowBrowser: true,
  });

  try {
    const message = await client.messages.create({
      model: DEFAULT_MODEL,
      system: input.system || undefined,
      messages: [
        {
          role: "user",
          content: input.prompt,
        },
      ],
      temperature: input.temperature ?? 0.5,
      max_tokens: input.maxTokens ?? 512,
    });

    const text = message.content
      .filter((block) => block.type === "text")
      .map((block) => ("text" in block ? block.text : ""))
      .join("")
      .trim();

    if (!text) {
      throw new Error("Anthropic returned an empty response.");
    }

    return text;
  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      // Check for credit/quota limit error
      if (error.status === 400 && error.message.includes("credit balance")) {
        throw new Error("Insufficient credits on Anthropic account. Please add credits at console.anthropic.com/account/billing");
      }
      throw new Error(`Anthropic API error (${error.status}): ${error.message}`);
    }
    throw error;
  }
}

export const anthropicProvider: LLMProvider = {
  id: "anthropic",
  label: `Anthropic (${DEFAULT_MODEL})`,
  status: "ready",
  requiresApiKey: true,
  async validateKey(apiKey: string) {
    if (!apiKey) return false;
    const result = await requestAnthropic(apiKey, {
      prompt: "Respond with the word OK.",
      temperature: 0,
      maxTokens: 4,
    });
    return result.toLowerCase().includes("ok");
  },
  async generateText(apiKey: string, input: LLMGenerateInput) {
    if (!apiKey) {
      throw new Error("Missing Anthropic API key.");
    }
    return requestAnthropic(apiKey, input);
  },
};
