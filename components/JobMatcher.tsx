"use client";

import { useState, useMemo, useCallback } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Target, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import type { Resume } from "@/db";

interface JobMatcherProps {
  resume: Resume;
}

interface MatchResult {
  keyword: string;
  found: boolean;
  locations: string[];
}

// Common words to ignore
const STOP_WORDS = new Set([
  "a",
  "an",
  "the",
  "and",
  "or",
  "but",
  "in",
  "on",
  "at",
  "to",
  "for",
  "of",
  "with",
  "by",
  "from",
  "as",
  "is",
  "was",
  "are",
  "were",
  "been",
  "be",
  "have",
  "has",
  "had",
  "do",
  "does",
  "did",
  "will",
  "would",
  "could",
  "should",
  "may",
  "might",
  "must",
  "shall",
  "can",
  "need",
  "dare",
  "ought",
  "used",
  "it",
  "its",
  "you",
  "your",
  "we",
  "our",
  "they",
  "their",
  "this",
  "that",
  "these",
  "those",
  "i",
  "me",
  "my",
  "myself",
  "he",
  "him",
  "his",
  "she",
  "her",
  "who",
  "whom",
  "which",
  "what",
  "where",
  "when",
  "why",
  "how",
  "all",
  "each",
  "every",
  "both",
  "few",
  "more",
  "most",
  "other",
  "some",
  "such",
  "no",
  "nor",
  "not",
  "only",
  "own",
  "same",
  "so",
  "than",
  "too",
  "very",
  "just",
  "also",
  "now",
  "here",
  "there",
  "then",
  "once",
  "if",
  "when",
  "up",
  "out",
  "into",
  "through",
  "during",
  "before",
  "after",
  "above",
  "below",
  "between",
  "under",
  "again",
  "further",
  "about",
  "against",
  "while",
  "etc",
  "years",
  "year",
  "experience",
  "work",
  "working",
  "ability",
  "able",
  "strong",
  "excellent",
  "good",
  "great",
  "best",
  "required",
  "requirements",
  "responsibilities",
  "including",
  "job",
  "role",
  "position",
  "team",
  "company",
  "looking",
  "seeking",
]);

// Extract keywords from job description (moved outside component)
const extractKeywords = (text: string): string[] => {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s\-+#.]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word));

  // Get unique words with frequency
  const wordFreq = new Map<string, number>();
  words.forEach((word) => {
    wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
  });

  // Sort by frequency and return top keywords
  return Array.from(wordFreq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30)
    .map(([word]) => word);
};

export function JobMatcher({ resume }: JobMatcherProps) {
  const [jobDescription, setJobDescription] = useState("");
  const [showResults, setShowResults] = useState(false);

  // Get all resume text content
  const resumeText = useMemo(() => {
    const parts: string[] = [];

    // Basics
    parts.push(resume.basics.name, resume.basics.label, resume.basics.summary);

    // Work
    resume.work.forEach((w) => {
      parts.push(w.company, w.position, w.summary, ...w.highlights);
    });

    // Education
    resume.education.forEach((e) => {
      parts.push(e.institution, e.area, e.studyType, ...e.courses);
    });

    // Skills
    resume.skills.forEach((s) => {
      parts.push(s.name, ...s.keywords);
    });

    // Projects
    resume.projects.forEach((p) => {
      parts.push(p.name, p.description, ...p.highlights, ...p.keywords);
    });

    return parts.join(" ").toLowerCase();
  }, [resume]);

  // Find where keyword appears - wrapped in useCallback
  const findKeywordLocation = useCallback(
    (keyword: string): string[] => {
      const locations: string[] = [];
      const lowerKeyword = keyword.toLowerCase();

      if (
        resume.basics.summary.toLowerCase().includes(lowerKeyword) ||
        resume.basics.label.toLowerCase().includes(lowerKeyword)
      ) {
        locations.push("Summary");
      }

      resume.work.forEach((w) => {
        const workText = [w.position, w.summary, ...w.highlights]
          .join(" ")
          .toLowerCase();
        if (workText.includes(lowerKeyword)) {
          locations.push(`Work: ${w.company || "Experience"}`);
        }
      });

      resume.skills.forEach((s) => {
        const skillText = [s.name, ...s.keywords].join(" ").toLowerCase();
        if (skillText.includes(lowerKeyword)) {
          locations.push(`Skills: ${s.name || "Skills"}`);
        }
      });

      resume.projects.forEach((p) => {
        const projText = [p.name, p.description, ...p.keywords]
          .join(" ")
          .toLowerCase();
        if (projText.includes(lowerKeyword)) {
          locations.push(`Project: ${p.name || "Project"}`);
        }
      });

      return locations;
    },
    [resume]
  );

  // Match results - now includes findKeywordLocation in dependencies
  const matchResults = useMemo((): MatchResult[] => {
    if (!jobDescription.trim()) return [];

    const keywords = extractKeywords(jobDescription);
    return keywords.map((keyword) => ({
      keyword,
      found: resumeText.includes(keyword.toLowerCase()),
      locations: findKeywordLocation(keyword),
    }));
  }, [jobDescription, resumeText, findKeywordLocation]);

  const matchedCount = matchResults.filter((r) => r.found).length;
  const totalCount = matchResults.length;
  const matchPercentage =
    totalCount > 0 ? Math.round((matchedCount / totalCount) * 100) : 0;

  const getScoreColor = (percentage: number) => {
    if (percentage >= 70) return "text-green-500";
    if (percentage >= 50) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreIcon = (percentage: number) => {
    if (percentage >= 70)
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    if (percentage >= 50)
      return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    return <XCircle className="h-5 w-5 text-red-500" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Target className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">Job Description Matcher</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Paste Job Description</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="jd">
              Paste the job description to see how well your resume matches
            </Label>
            <Textarea
              id="jd"
              placeholder="Paste the job description here..."
              className="min-h-[200px]"
              value={jobDescription}
              onChange={(e) => {
                setJobDescription(e.target.value);
                setShowResults(false);
              }}
            />
          </div>
          <Button
            onClick={() => setShowResults(true)}
            disabled={!jobDescription.trim()}
            className="w-full sm:w-auto"
          >
            <Target className="h-4 w-4 mr-2" />
            Analyze Match
          </Button>
        </CardContent>
      </Card>

      {showResults && matchResults.length > 0 && (
        <>
          {/* Score Card */}
          <Card>
            <CardContent className="py-6">
              <div className="flex items-center justify-center gap-4">
                {getScoreIcon(matchPercentage)}
                <div className="text-center">
                  <p
                    className={`text-4xl font-bold ${getScoreColor(
                      matchPercentage
                    )}`}
                  >
                    {matchPercentage}%
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {matchedCount} of {totalCount} keywords matched
                  </p>
                </div>
              </div>
              <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    matchPercentage >= 70
                      ? "bg-green-500"
                      : matchPercentage >= 50
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}
                  style={{ width: `${matchPercentage}%` }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Keywords Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Found Keywords */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  Found in Resume ({matchResults.filter((r) => r.found).length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {matchResults
                    .filter((r) => r.found)
                    .map((result) => (
                      <span
                        key={result.keyword}
                        className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-md"
                        title={result.locations.join(", ")}
                      >
                        {result.keyword}
                      </span>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Missing Keywords */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2 text-red-600">
                  <XCircle className="h-4 w-4" />
                  Missing from Resume (
                  {matchResults.filter((r) => !r.found).length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {matchResults
                    .filter((r) => !r.found)
                    .map((result) => (
                      <span
                        key={result.keyword}
                        className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-md"
                      >
                        {result.keyword}
                      </span>
                    ))}
                </div>
                {matchResults.filter((r) => !r.found).length > 0 && (
                  <p className="text-xs text-muted-foreground mt-3">
                    Consider adding these keywords to your resume if they are
                    relevant to your experience.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
