import { v4 as uuidv4 } from "uuid";
import { parseLLMJson } from "@/lib/llm/json";
import type { ParsedResumeData } from "./types";

/**
 * Parse LLM output (JSON) from AI import parsing/LinkedIn parsing prompts
 * into the ParsedResumeData format used by the import system.
 */
export function parseLLMImportOutput(output: string): ParsedResumeData {
  let parsed: Record<string, unknown>;
  try {
    const parsedResult = parseLLMJson<Record<string, unknown>>(output, {
      sanitizeMultilineStrings: true,
    });
    if (!parsedResult) {
      throw new Error("Could not parse AI response as JSON");
    }
    parsed = parsedResult;
  } catch {
    throw new Error("Could not parse AI response as JSON");
  }

  const data: ParsedResumeData = {};

  // Map basics
  if (parsed.basics && typeof parsed.basics === "object") {
    const b = parsed.basics as Record<string, unknown>;
    data.basics = {
      name: (b.name as string) || "",
      label: (b.label as string) || "",
      email: (b.email as string) || "",
      phone: (b.phone as string) || "",
      url: (b.url as string) || "",
      summary: (b.summary as string) || "",
      location: b.location && typeof b.location === "object"
        ? {
            city: ((b.location as Record<string, string>).city) || "",
            country: ((b.location as Record<string, string>).country) || "",
            region: ((b.location as Record<string, string>).region) || "",
            postalCode: "",
            address: "",
          }
        : undefined,
      profiles: Array.isArray(b.profiles)
        ? b.profiles.map((p: Record<string, string>) => ({
            network: p.network || "",
            username: p.username || "",
            url: p.url || "",
          }))
        : [],
    };
  }

  // Map work
  if (Array.isArray(parsed.work)) {
    data.work = parsed.work.map((w: Record<string, unknown>) => ({
      id: uuidv4(),
      company: (w.company as string) || "",
      position: (w.position as string) || "",
      startDate: (w.startDate as string) || "",
      endDate: (w.endDate as string) || "",
      summary: (w.summary as string) || "",
      highlights: Array.isArray(w.highlights) ? w.highlights.filter(Boolean) : [],
      location: (w.location as string) || "",
      url: (w.url as string) || "",
      name: (w.name as string) || "",
    }));
  }

  // Map education
  if (Array.isArray(parsed.education)) {
    data.education = parsed.education.map((e: Record<string, unknown>) => ({
      id: uuidv4(),
      institution: (e.institution as string) || "",
      area: (e.area as string) || "",
      studyType: (e.studyType as string) || "",
      startDate: (e.startDate as string) || "",
      endDate: (e.endDate as string) || "",
      score: (e.score as string) || "",
      courses: Array.isArray(e.courses) ? e.courses.filter(Boolean) : [],
      url: (e.url as string) || "",
    }));
  }

  // Map skills
  if (Array.isArray(parsed.skills)) {
    data.skills = parsed.skills.map((s: Record<string, unknown>) => ({
      id: uuidv4(),
      name: (s.name as string) || "",
      level: (s.level as string) || "",
      keywords: Array.isArray(s.keywords) ? s.keywords.filter(Boolean) : [],
    }));
  }

  // Map projects
  if (Array.isArray(parsed.projects)) {
    data.projects = parsed.projects.map((p: Record<string, unknown>) => ({
      id: uuidv4(),
      name: (p.name as string) || "",
      description: (p.description as string) || "",
      highlights: Array.isArray(p.highlights) ? p.highlights.filter(Boolean) : [],
      keywords: Array.isArray(p.keywords) ? p.keywords.filter(Boolean) : [],
      startDate: (p.startDate as string) || "",
      endDate: (p.endDate as string) || "",
      url: (p.url as string) || "",
    }));
  }

  // Map certificates
  if (Array.isArray(parsed.certificates)) {
    data.certificates = parsed.certificates.map((c: Record<string, unknown>) => ({
      id: uuidv4(),
      name: (c.name as string) || "",
      issuer: (c.issuer as string) || "",
      date: (c.date as string) || "",
      url: (c.url as string) || "",
      summary: (c.summary as string) || "",
    }));
  }

  // Map languages
  if (Array.isArray(parsed.languages)) {
    data.languages = parsed.languages.map((l: Record<string, unknown>) => ({
      id: uuidv4(),
      language: (l.language as string) || "",
      fluency: (l.fluency as string) || "",
    }));
  }

  // Map publications
  if (Array.isArray(parsed.publications)) {
    data.publications = parsed.publications.map((p: Record<string, unknown>) => ({
      id: uuidv4(),
      name: (p.name as string) || "",
      publisher: (p.publisher as string) || "",
      releaseDate: (p.releaseDate as string) || "",
      url: (p.url as string) || "",
      summary: (p.summary as string) || "",
    }));
  }

  // Map awards
  if (Array.isArray(parsed.awards)) {
    data.awards = parsed.awards.map((a: Record<string, unknown>) => ({
      id: uuidv4(),
      title: (a.title as string) || "",
      date: (a.date as string) || "",
      awarder: (a.awarder as string) || "",
      summary: (a.summary as string) || "",
    }));
  }

  // Map references
  if (Array.isArray(parsed.references)) {
    data.references = parsed.references.map((r: Record<string, unknown>) => ({
      id: uuidv4(),
      name: (r.name as string) || "",
      position: (r.position as string) || "",
      reference: (r.reference as string) || "",
    }));
  }

  return data;
}
