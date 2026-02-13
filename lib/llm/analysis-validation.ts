type ValidationSuccess<T> = { ok: true; data: T };
type ValidationFailure = { ok: false; error: string };
export type ValidationResult<T> = ValidationSuccess<T> | ValidationFailure;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown): string | null {
  return typeof value === "string" ? value.trim() : null;
}

function asNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function asStringArray(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null;
  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
}

function boundedScore(value: unknown): number | null {
  const score = asNumber(value);
  if (score === null) return null;
  if (score < 0 || score > 100) return null;
  return score;
}

export interface ATSAnalysisData {
  score: number;
  strengths: string[];
  criticalIssues: string[];
  improvements: string[];
  keywordSuggestions: string[];
  formatIssues: string[];
  summaryFeedback: string;
  bulletFeedback: { original: string; improved: string; reason: string }[];
}

export function validateATSAnalysis(value: unknown): ValidationResult<ATSAnalysisData> {
  if (!isRecord(value)) return { ok: false, error: "Expected JSON object." };
  const score = boundedScore(value.score);
  const strengths = asStringArray(value.strengths);
  const criticalIssues = asStringArray(value.criticalIssues);
  const improvements = asStringArray(value.improvements);
  const keywordSuggestions = asStringArray(value.keywordSuggestions);
  const formatIssues = asStringArray(value.formatIssues);
  const summaryFeedback = asString(value.summaryFeedback);

  if (score === null) return { ok: false, error: "Field 'score' must be a number from 0 to 100." };
  if (!strengths) return { ok: false, error: "Field 'strengths' must be a string array." };
  if (!criticalIssues) return { ok: false, error: "Field 'criticalIssues' must be a string array." };
  if (!improvements) return { ok: false, error: "Field 'improvements' must be a string array." };
  if (!keywordSuggestions) return { ok: false, error: "Field 'keywordSuggestions' must be a string array." };
  if (!formatIssues) return { ok: false, error: "Field 'formatIssues' must be a string array." };
  if (summaryFeedback === null) return { ok: false, error: "Field 'summaryFeedback' must be a string." };

  const bulletRaw = value.bulletFeedback;
  if (!Array.isArray(bulletRaw)) {
    return { ok: false, error: "Field 'bulletFeedback' must be an array." };
  }
  const bulletFeedback = bulletRaw
    .filter((item) => isRecord(item))
    .map((item) => ({
      original: asString(item.original) || "",
      improved: asString(item.improved) || "",
      reason: asString(item.reason) || "",
    }))
    .filter((item) => item.original && item.improved && item.reason);

  return {
    ok: true,
    data: {
      score,
      strengths,
      criticalIssues,
      improvements,
      keywordSuggestions,
      formatIssues,
      summaryFeedback,
      bulletFeedback,
    },
  };
}

export interface JobMatchAnalysisData {
  overallFit: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  keywords: string[];
  matchedKeywords: string[];
  missingKeywords: string[];
  suggestions: string[];
  tailoredSummary: string;
}

export function validateJobMatchAnalysis(
  value: unknown,
): ValidationResult<JobMatchAnalysisData> {
  if (!isRecord(value)) return { ok: false, error: "Expected JSON object." };
  const overallFit = boundedScore(value.overallFit);
  const summary = asString(value.summary);
  const strengths = asStringArray(value.strengths);
  const weaknesses = asStringArray(value.weaknesses);
  const keywords = asStringArray(value.keywords);
  const matchedKeywords = asStringArray(value.matchedKeywords);
  const missingKeywords = asStringArray(value.missingKeywords);
  const suggestions = asStringArray(value.suggestions);
  const tailoredSummary = asString(value.tailoredSummary);

  if (overallFit === null) {
    return { ok: false, error: "Field 'overallFit' must be a number from 0 to 100." };
  }
  if (summary === null) return { ok: false, error: "Field 'summary' must be a string." };
  if (!strengths) return { ok: false, error: "Field 'strengths' must be a string array." };
  if (!weaknesses) return { ok: false, error: "Field 'weaknesses' must be a string array." };
  if (!keywords) return { ok: false, error: "Field 'keywords' must be a string array." };
  if (!matchedKeywords) return { ok: false, error: "Field 'matchedKeywords' must be a string array." };
  if (!missingKeywords) return { ok: false, error: "Field 'missingKeywords' must be a string array." };
  if (!suggestions) return { ok: false, error: "Field 'suggestions' must be a string array." };
  if (tailoredSummary === null) {
    return { ok: false, error: "Field 'tailoredSummary' must be a string." };
  }

  return {
    ok: true,
    data: {
      overallFit,
      summary,
      strengths,
      weaknesses,
      keywords,
      matchedKeywords,
      missingKeywords,
      suggestions,
      tailoredSummary,
    },
  };
}

export interface CareerGapAnalysisData {
  gaps: {
    period: string;
    duration: string;
    between: string;
    severity: "minor" | "moderate" | "significant";
    suggestion: string;
  }[];
  missingElements: {
    element: string;
    importance: "critical" | "recommended" | "nice-to-have";
    reason: string;
    suggestion: string;
  }[];
  careerProgression: {
    assessment: string;
    level: string;
    consistency: string;
  };
  strengths: string[];
  recommendations: {
    priority: number;
    category: string;
    title: string;
    description: string;
  }[];
  overallScore: number;
}

export function validateCareerGapAnalysis(
  value: unknown,
): ValidationResult<CareerGapAnalysisData> {
  if (!isRecord(value)) return { ok: false, error: "Expected JSON object." };

  const overallScore = boundedScore(value.overallScore);
  const strengths = asStringArray(value.strengths);
  if (overallScore === null) {
    return { ok: false, error: "Field 'overallScore' must be a number from 0 to 100." };
  }
  if (!strengths) return { ok: false, error: "Field 'strengths' must be a string array." };

  const progressionRaw = value.careerProgression;
  if (!isRecord(progressionRaw)) {
    return { ok: false, error: "Field 'careerProgression' must be an object." };
  }
  const assessment = asString(progressionRaw.assessment);
  const level = asString(progressionRaw.level);
  const consistency = asString(progressionRaw.consistency);
  if (!assessment || !level || !consistency) {
    return { ok: false, error: "Field 'careerProgression' has invalid values." };
  }

  if (!Array.isArray(value.gaps)) {
    return { ok: false, error: "Field 'gaps' must be an array." };
  }
  const gaps = value.gaps
    .filter((item) => isRecord(item))
    .map((item) => ({
      period: asString(item.period) || "",
      duration: asString(item.duration) || "",
      between: asString(item.between) || "",
      severity:
        item.severity === "minor" || item.severity === "moderate" || item.severity === "significant"
          ? item.severity
          : null,
      suggestion: asString(item.suggestion) || "",
    }))
    .filter((item) => item.period && item.duration && item.between && item.severity && item.suggestion) as CareerGapAnalysisData["gaps"];

  if (!Array.isArray(value.missingElements)) {
    return { ok: false, error: "Field 'missingElements' must be an array." };
  }
  const missingElements = value.missingElements
    .filter((item) => isRecord(item))
    .map((item) => ({
      element: asString(item.element) || "",
      importance:
        item.importance === "critical" || item.importance === "recommended" || item.importance === "nice-to-have"
          ? item.importance
          : null,
      reason: asString(item.reason) || "",
      suggestion: asString(item.suggestion) || "",
    }))
    .filter((item) => item.element && item.importance && item.reason && item.suggestion) as CareerGapAnalysisData["missingElements"];

  if (!Array.isArray(value.recommendations)) {
    return { ok: false, error: "Field 'recommendations' must be an array." };
  }
  const recommendations = value.recommendations
    .filter((item) => isRecord(item))
    .map((item) => ({
      priority: asNumber(item.priority) ?? NaN,
      category: asString(item.category) || "",
      title: asString(item.title) || "",
      description: asString(item.description) || "",
    }))
    .filter(
      (item) =>
        Number.isFinite(item.priority) &&
        item.priority > 0 &&
        item.category &&
        item.title &&
        item.description,
    );

  return {
    ok: true,
    data: {
      gaps,
      missingElements,
      careerProgression: { assessment, level, consistency },
      strengths,
      recommendations,
      overallScore,
    },
  };
}

export interface ConsistencyIssueData {
  type: "tense" | "punctuation" | "passive" | "formatting" | "style";
  description: string;
  location: string;
  original: string;
  fix: string;
  severity: "high" | "medium" | "low";
}

export interface ConsistencyAnalysisData {
  issues: ConsistencyIssueData[];
}

export function validateConsistencyAnalysis(
  value: unknown,
): ValidationResult<ConsistencyAnalysisData> {
  if (!isRecord(value)) return { ok: false, error: "Expected JSON object." };
  if (!Array.isArray(value.issues)) {
    return { ok: false, error: "Field 'issues' must be an array." };
  }

  const issues = value.issues
    .filter((item) => isRecord(item))
    .map((item) => ({
      type:
        item.type === "tense" ||
        item.type === "punctuation" ||
        item.type === "passive" ||
        item.type === "formatting" ||
        item.type === "style"
          ? item.type
          : null,
      description: asString(item.description) || "",
      location: asString(item.location) || "",
      original: asString(item.original) || "",
      fix: asString(item.fix) || "",
      severity:
        item.severity === "high" || item.severity === "medium" || item.severity === "low"
          ? item.severity
          : null,
    }))
    .filter(
      (item) =>
        item.type &&
        item.description &&
        item.location &&
        item.original &&
        item.fix &&
        item.severity,
    ) as ConsistencyIssueData[];

  return { ok: true, data: { issues } };
}
