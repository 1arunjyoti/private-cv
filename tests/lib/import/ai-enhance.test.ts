import { describe, expect, it } from "vitest";
import { parseLLMImportOutput } from "@/lib/import/ai-enhance";

describe("parseLLMImportOutput", () => {
  it("parses fenced JSON responses", () => {
    const output = [
      "```json",
      JSON.stringify(
        {
          basics: { name: "Alex Doe", email: "alex@example.com" },
          work: [{ company: "Acme", position: "Engineer" }],
        },
        null,
        2,
      ),
      "```",
    ].join("\n");

    const parsed = parseLLMImportOutput(output);

    expect(parsed.basics?.name).toBe("Alex Doe");
    expect(parsed.basics?.email).toBe("alex@example.com");
    expect(parsed.work?.length).toBe(1);
    expect(parsed.work?.[0]?.company).toBe("Acme");
    expect(parsed.work?.[0]?.position).toBe("Engineer");
  });

  it("parses JSON containing unescaped newlines in string fields", () => {
    const output = `{
      "basics": {
        "name": "Taylor",
        "summary": "Line one
Line two"
      }
    }`;

    const parsed = parseLLMImportOutput(output);

    expect(parsed.basics?.name).toBe("Taylor");
    expect(parsed.basics?.summary).toContain("Line one");
    expect(parsed.basics?.summary).toContain("Line two");
  });

  it("throws for non-JSON responses", () => {
    expect(() => parseLLMImportOutput("not json at all")).toThrow(
      "Could not parse AI response as JSON",
    );
  });
});

