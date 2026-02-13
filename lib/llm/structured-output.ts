import { parseLLMJson } from "@/lib/llm/json";
import type { ValidationResult } from "@/lib/llm/analysis-validation";

interface GenerateStructuredOutputOptions<T> {
  generateText: (prompt: string, temperature: number, maxTokens: number) => Promise<string>;
  prompt: string;
  validator: (value: unknown) => ValidationResult<T>;
  schemaHint: string;
  temperature?: number;
  maxTokens?: number;
  repairAttempts?: number;
}

interface StructuredSuccess<T> {
  ok: true;
  data: T;
  repaired: boolean;
}

interface StructuredFailure {
  ok: false;
  error: string;
}

export type StructuredResult<T> = StructuredSuccess<T> | StructuredFailure;

function buildRepairPrompt(schemaHint: string, issue: string, rawOutput: string): string {
  return [
    "You are a JSON repair assistant.",
    "Your task is to repair an invalid assistant response into valid JSON only.",
    "Do not add markdown, explanation, or extra keys.",
    `Required schema: ${schemaHint}`,
    `Validation issue: ${issue}`,
    "",
    "Response to repair:",
    rawOutput.trim(),
  ].join("\n");
}

export async function generateStructuredOutput<T>(
  opts: GenerateStructuredOutputOptions<T>,
): Promise<StructuredResult<T>> {
  const temperature = opts.temperature ?? 0.2;
  const maxTokens = opts.maxTokens ?? 1024;
  const attempts = Math.max(opts.repairAttempts ?? 1, 0);

  let output = await opts.generateText(opts.prompt, temperature, maxTokens);
  let repaired = false;
  let lastError = "Unable to parse model output as valid JSON.";

  for (let attempt = 0; attempt <= attempts; attempt += 1) {
    const parsed = parseLLMJson<unknown>(output, {
      sanitizeMultilineStrings: true,
    });
    if (parsed) {
      const validation = opts.validator(parsed);
      if (validation.ok) {
        return { ok: true, data: validation.data, repaired };
      }
      lastError = validation.error;
    } else {
      lastError = "Model returned invalid JSON.";
    }

    if (attempt >= attempts) break;

    const repairPrompt = buildRepairPrompt(opts.schemaHint, lastError, output);
    output = await opts.generateText(repairPrompt, 0, maxTokens);
    repaired = true;
  }

  return {
    ok: false,
    error: `Failed to produce valid structured output. ${lastError}`,
  };
}
