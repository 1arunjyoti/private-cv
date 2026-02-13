export interface ParseLLMJsonOptions {
  sanitizeMultilineStrings?: boolean;
}

function sanitizeJsonString(text: string): string {
  let result = "";
  let inString = false;
  let escaped = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (char === "\\" && inString && !escaped) {
      escaped = true;
      result += char;
      continue;
    }
    if (char === "\"" && !escaped) {
      inString = !inString;
      result += char;
      continue;
    }
    if (inString && (char === "\n" || char === "\r")) {
      result += "\\n";
    } else {
      result += char;
    }
    escaped = false;
  }

  return result;
}

function extractJsonCandidate(text: string): string | null {
  const objectStart = text.indexOf("{");
  const arrayStart = text.indexOf("[");
  const useObject =
    objectStart !== -1 && (arrayStart === -1 || objectStart < arrayStart);
  const start = useObject ? objectStart : arrayStart;
  if (start === -1) return null;

  const end = useObject ? text.lastIndexOf("}") : text.lastIndexOf("]");
  if (end === -1 || end <= start) return null;

  return text.slice(start, end + 1).trim();
}

function parseCandidate<T>(
  text: string,
  opts: ParseLLMJsonOptions,
): T | null {
  const candidate = opts.sanitizeMultilineStrings
    ? sanitizeJsonString(text)
    : text;
  try {
    return JSON.parse(candidate) as T;
  } catch {
    return null;
  }
}

export function parseLLMJson<T>(
  output: string,
  opts: ParseLLMJsonOptions = {},
): T | null {
  const trimmed = output.trim();
  if (!trimmed) return null;

  const direct = parseCandidate<T>(trimmed, opts);
  if (direct) return direct;

  const codeBlockMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (codeBlockMatch?.[1]) {
    const fromCodeBlock = parseCandidate<T>(codeBlockMatch[1].trim(), opts);
    if (fromCodeBlock) return fromCodeBlock;
  }

  const candidate = extractJsonCandidate(trimmed);
  if (candidate) {
    const extracted = parseCandidate<T>(candidate, opts);
    if (extracted) return extracted;
  }

  return null;
}

