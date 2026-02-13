export function buildSummaryPrompt(input: string): string {
  return [
    "You are a resume assistant.",
    "Write a concise professional summary (3-4 sentences, max 90 words).",
    "Use only facts present in the input.",
    "If key facts are missing, return exactly: INSUFFICIENT_DATA",
    "Use active voice, avoid first-person pronouns, and keep it ATS-friendly.",
    "Ensure each sentence is complete and ends with proper punctuation.",
    "The summary should be original and introduce the candidate based on the details provided.",
    "Do not add tools, achievements, certifications, or years of experience unless explicitly provided.",
    "Return only the summary text without markdown or quotes.",
    "",
    "Input:",
    input.trim(),
  ].join("\n");
}

export function buildSectionSummaryPrompt(section: string, input: string): string {
  return [
    "You are a resume assistant.",
    `Write a concise summary for the ${section} section (2-3 sentences, max 70 words).`,
    "Use only facts present in the input.",
    "If the input is too sparse to write a reliable summary, return exactly: INSUFFICIENT_DATA",
    "Use active voice, avoid first-person pronouns, and keep it ATS-friendly.",
    "Ensure each sentence is complete and ends with proper punctuation.",
    "Generate original content that accurately represents the details provided.",
    "Do not invent responsibilities, tools, metrics, or outcomes.",
    "Return only the summary text without markdown or quotes.",
    "",
    "Input:",
    input.trim(),
  ].join("\n");
}

export function buildHighlightsPrompt(section: string, input: string): string {
  return [
    "You are a resume assistant.",
    `Generate exactly 4 bullet achievements for the ${section} section.`,
    "Use only facts present in the input.",
    "Use action verbs and keep each bullet under 18 words.",
    "Only include metrics if they are explicitly present in the input.",
    "Each bullet must be a complete sentence and end with a period.",
    "Return one bullet per line without numbering.",
    "Do not add placeholders, assumptions, or generic fluff.",
    "",
    "Input:",
    input.trim(),
  ].join("\n");
}

export function buildJobMatchPrompt(input: string): string {
  return [
    "You are a resume assistant.",
    "Analyze the job description and resume context.",
    "Return a JSON object with keys: summary, keywords, gaps, suggestions.",
    "summary: 3-4 sentences, ATS-friendly, tailored to the specific job.",
    "keywords: array of 8-15 single or multi-word keywords from the job description that should appear in the resume.",
    "gaps: array of 3-6 strings describing notable gaps between the resume and job requirements.",
    "suggestions: array of 3-6 actionable improvement suggestions to better match the job.",
    "Return only valid JSON without markdown or extra text.",
    "Use only evidence from the provided input. Do not invent qualifications.",
    "",
    "Input:",
    input.trim(),
  ].join("\n");
}

export function buildRewritePrompt(
  section: string,
  input: string,
  tone: "neutral" | "formal" | "concise",
  context?: string,
): string {
  const toneLine =
    tone === "formal"
      ? "Use a formal, polished tone."
      : tone === "concise"
        ? "Be concise and minimize filler words."
        : "Use a neutral, professional tone.";
  const contextLines = context
    ? ["", "Context about the candidate:", context]
    : [];
  return [
    "You are a resume assistant.",
    `Improve the tone and clarity of the ${section} content.`,
    toneLine,
    "Use only facts present in the original text and provided context.",
    "Keep all factual details and avoid first-person pronouns.",
    "Keep it concise: reduce filler and keep output length within +/-15% of the original.",
    "Ensure sentences are complete and end with proper punctuation.",
    "Return only the improved text without quotes or markdown.",
    "Do NOT generate entirely new content — refine the existing text.",
    "Do not add new tools, metrics, timelines, or claims.",
    ...contextLines,
    "",
    "Existing text to improve:",
    input.trim(),
  ].join("\n");
}

export function buildGrammarPrompt(section: string, input: string): string {
  return [
    "You are a grammar checker for a resume.",
    `Fix grammar, spelling, and punctuation errors in the ${section} content.`,
    "IMPORTANT RULES:",
    "- Do NOT change the meaning, facts, tone, or style.",
    "- Do NOT rephrase or restructure sentences.",
    "- Only fix actual grammar, spelling, and punctuation mistakes.",
    "- Keep sentence structure as close as possible to the original.",
    "- If there are NO grammar, spelling or punctuation errors, return exactly: NO_CHANGES",
    "- Return only the corrected text without quotes or markdown.",
    "- Keep output length close to input length.",
    "",
    "Text to check:",
    input.trim(),
  ].join("\n");
}

/**
 * Build a prompt to quantify a bullet point with metrics/numbers
 */
export function buildBulletQuantifierPrompt(
  bullet: string,
  context: string,
): string {
  return [
    "You are a resume optimization expert specializing in quantifying achievements.",
    "Your task is to strengthen a bullet point with measurable outcomes only when supported by provided facts.",
    "",
    "Rules:",
    "- Use only metrics, percentages, dollar amounts, team sizes, or timeframes explicitly present in the bullet/context.",
    "- Do NOT invent or estimate numbers.",
    "- Keep the core achievement the same.",
    "- If no explicit measurable data is available, return the original bullet followed by ' [ADD_METRIC]'.",
    "- Use strong action verbs at the start.",
    "- Keep it under 25 words.",
    "- Return ONLY the improved bullet text, no quotes, no markdown, no explanation.",
    "",
    "Context about the role:",
    context.trim(),
    "",
    "Bullet to quantify:",
    bullet.trim(),
  ].join("\n");
}

/**
 * Build a prompt for consistency checking across the full resume
 */
export function buildConsistencyCheckPrompt(resumeText: string): string {
  return [
    "You are a meticulous resume proofreader checking for consistency issues.",
    "Analyze the resume and identify ALL inconsistencies.",
    "",
    "Check for:",
    "1. Tense inconsistencies (mixing past and present tense within same-type entries)",
    "2. Punctuation inconsistencies (some bullets end with periods, others don't)",
    "3. Formatting inconsistencies (capitalization patterns, date formats)",
    "4. Passive voice usage (flag each instance)",
    "5. Style inconsistencies (some bullets start with action verbs, others don't)",
    "",
    "Return a JSON object with this structure:",
    '  issues: Array of { type: "tense"|"punctuation"|"passive"|"formatting"|"style", description: string, location: string, original: string, fix: string, severity: "high"|"medium"|"low" }',
    "",
    "Rules:",
    "- Be specific about what to fix and where.",
    '- The "location" should identify which section and entry (e.g., "Work: Company Name, bullet 2").',
    '- The "original" should be the exact problematic text.',
    '- The "fix" should be the corrected text.',
    "- Use only text that exists in the resume.",
    "- Return only valid JSON without markdown code blocks.",
    "- If no issues found, return { issues: [] }.",
    "",
    "Resume:",
    resumeText.trim(),
  ].join("\n");
}

/**
 * Build a prompt for AI-enhanced resume import parsing
 */
export function buildImportParsingPrompt(rawText: string): string {
  return [
    "You are an expert resume parser. Extract structured data from the raw resume text below.",
    "Return a JSON object matching this exact structure:",
    "",
    "{",
    '  "basics": {',
    '    "name": "", "label": "", "email": "", "phone": "", "url": "", "summary": "",',
    '    "location": { "city": "", "country": "", "region": "" },',
    '    "profiles": [{ "network": "", "username": "", "url": "" }]',
    "  },",
    '  "work": [{ "company": "", "position": "", "startDate": "YYYY-MM", "endDate": "YYYY-MM or empty", "summary": "", "highlights": ["..."], "location": "" }],',
    '  "education": [{ "institution": "", "area": "", "studyType": "", "startDate": "YYYY-MM", "endDate": "YYYY-MM", "score": "", "courses": [] }],',
    '  "skills": [{ "name": "Category Name", "keywords": ["skill1", "skill2"] }],',
    '  "projects": [{ "name": "", "description": "", "highlights": [], "keywords": [], "startDate": "", "endDate": "", "url": "" }],',
    '  "certificates": [{ "name": "", "issuer": "", "date": "YYYY-MM", "url": "" }],',
    '  "languages": [{ "language": "", "fluency": "" }],',
    '  "publications": [{ "name": "", "publisher": "", "releaseDate": "", "url": "", "summary": "" }],',
    '  "awards": [{ "title": "", "date": "", "awarder": "", "summary": "" }]',
    "}",
    "",
    "Rules:",
    "- Extract as much data as possible from the text.",
    "- Dates should be in YYYY-MM format when possible (e.g., 2023-06).",
    "- For work experience, separate the description into a summary and bullet highlights.",
    "- Group skills by category (e.g., Programming Languages, Frameworks, Tools).",
    "- If a field cannot be determined, use an empty string or empty array.",
    "- Return only valid JSON without markdown code blocks.",
    "- Do NOT invent data that isn't in the text.",
    "",
    "Raw resume text:",
    rawText.trim(),
  ].join("\n");
}

/**
 * Build a prompt for LinkedIn/portfolio text parsing into resume fields
 */
export function buildLinkedInParsingPrompt(rawText: string): string {
  return [
    "You are an expert at parsing LinkedIn profiles and portfolio text into structured resume data.",
    "Extract all relevant information from the pasted text and return structured JSON.",
    "",
    "Return a JSON object matching this exact structure:",
    "{",
    '  "basics": {',
    '    "name": "", "label": "", "email": "", "phone": "", "url": "", "summary": "",',
    '    "location": { "city": "", "country": "", "region": "" },',
    '    "profiles": [{ "network": "LinkedIn", "username": "", "url": "" }]',
    "  },",
    '  "work": [{ "company": "", "position": "", "startDate": "YYYY-MM", "endDate": "YYYY-MM or empty", "summary": "", "highlights": ["..."], "location": "" }],',
    '  "education": [{ "institution": "", "area": "", "studyType": "", "startDate": "YYYY-MM", "endDate": "YYYY-MM", "score": "", "courses": [] }],',
    '  "skills": [{ "name": "Category Name", "keywords": ["skill1", "skill2"] }],',
    '  "projects": [{ "name": "", "description": "", "highlights": [], "keywords": [], "url": "" }],',
    '  "certificates": [{ "name": "", "issuer": "", "date": "YYYY-MM", "url": "" }],',
    '  "languages": [{ "language": "", "fluency": "" }],',
    '  "publications": [{ "name": "", "publisher": "", "releaseDate": "", "url": "", "summary": "" }],',
    '  "awards": [{ "title": "", "date": "", "awarder": "", "summary": "" }]',
    "}",
    "",
    "Rules:",
    "- LinkedIn profiles often have headline, about, experience, education, skills, certifications, etc.",
    "- Convert LinkedIn date formats (e.g., 'Jan 2020 - Present') to YYYY-MM format.",
    "- LinkedIn skills should be grouped into logical categories.",
    "- Extract volunteer experience as additional work entries if present.",
    "- Recommendations can be used as reference quotes.",
    "- Return only valid JSON without markdown code blocks.",
    "- Do NOT invent data that isn't in the text.",
    "",
    "Pasted text:",
    rawText.trim(),
  ].join("\n");
}

/**
 * Build a prompt for career gap analysis
 */
export function buildCareerGapAnalysisPrompt(resumeText: string): string {
  return [
    "You are a career counselor and resume expert. Analyze the resume for career gaps and provide actionable advice.",
    "",
    "Return a JSON object with this structure:",
    "{",
    '  "gaps": [{ "period": "Month Year - Month Year", "duration": "X months/years", "between": "Role A at Company → Role B at Company", "severity": "minor|moderate|significant", "suggestion": "How to address this gap" }],',
    '  "missingElements": [{ "element": "What\'s missing", "importance": "critical|recommended|nice-to-have", "reason": "Why it matters", "suggestion": "How to add it" }],',
    '  "careerProgression": { "assessment": "Description of career trajectory", "level": "entry|mid|senior|executive", "consistency": "consistent|mixed|concerning" },',
    '  "strengths": ["List of resume strengths"],',
    '  "recommendations": [{ "priority": 1, "category": "gaps|content|structure|skills", "title": "Short title", "description": "Detailed recommendation" }],',
    '  "overallScore": 0-100',
    "}",
    "",
    "Rules:",
    "- Identify ALL employment gaps longer than 3 months.",
    "- Evaluate if the resume has all expected sections for the detected career level.",
    "- Check for common missing elements (metrics, skills section depth, summary quality).",
    "- Provide specific, actionable suggestions — not generic advice.",
    "- Rank recommendations by priority (1 = most important).",
    "- Use only evidence from the resume text.",
    "- Return only valid JSON without markdown code blocks.",
    "",
    "Resume:",
    resumeText.trim(),
  ].join("\n");
}

/**
 * Build a prompt for AI-enhanced job match analysis
 */
export function buildJobMatchAnalysisPrompt(
  jobDescription: string,
  resumeContext: string,
): string {
  return [
    "You are an expert resume consultant and ATS optimization specialist.",
    "Analyze the job description against the resume and provide a detailed assessment.",
    "",
    "Return a JSON object with these keys:",
    "  overallFit: number (0-100) - how well the resume matches the job",
    "  summary: string - 3-5 sentence assessment of the fit",
    "  strengths: string[] - 3-5 things the resume does well for this job",
    "  weaknesses: string[] - 3-5 gaps or missing elements",
    "  keywords: string[] - 10-20 important keywords from the JD (include those both matched and missing)",
    "  matchedKeywords: string[] - keywords already in the resume",
    "  missingKeywords: string[] - keywords NOT in the resume that should be added",
    "  suggestions: string[] - 5-8 specific, actionable improvements",
    "  tailoredSummary: string - a rewritten professional summary tailored to this specific job",
    "",
    "Rules:",
    "  - Use only information from the job description and resume.",
    "  - Do not invent achievements, tools, certifications, or years of experience.",
    "  - Keep suggestions concise, concrete, and non-redundant.",
    "Return only valid JSON without markdown code blocks.",
    "",
    "Job Description:",
    jobDescription.trim(),
    "",
    "Resume:",
    resumeContext.trim(),
  ].join("\n");
}

/**
 * Build a prompt for AI-enhanced ATS analysis
 */
export function buildATSAnalysisPrompt(
  resumeText: string,
  jobDescription?: string,
): string {
  const jdSection = jobDescription
    ? [
        "",
        "Target Job Description:",
        jobDescription.trim(),
      ]
    : [];
  return [
    "You are an expert ATS (Applicant Tracking System) analyst.",
    "Analyze the resume for ATS compatibility and provide actionable feedback.",
    "",
    "Return a JSON object with these keys:",
    "  score: number (0-100) - overall ATS compatibility score",
    "  strengths: string[] - 3-5 things done well for ATS",
    "  criticalIssues: string[] - 2-5 issues that could cause ATS rejection",
    "  improvements: string[] - 5-8 specific improvements ranked by impact",
    "  keywordSuggestions: string[] - 5-10 industry keywords to add",
    "  formatIssues: string[] - any formatting concerns for ATS parsing",
    "  summaryFeedback: string - specific feedback on the professional summary",
    "  bulletFeedback: { original: string, improved: string, reason: string }[] - up to 3 bullet rewrites",
    "",
    "Rules:",
    "  - Use only evidence from the provided resume and job description.",
    "  - Do not invent missing sections or fabricated metrics.",
    "  - Keep each improvement actionable and concise.",
    "Return only valid JSON without markdown code blocks.",
    ...jdSection,
    "",
    "Resume:",
    resumeText.trim(),
  ].join("\n");
}
