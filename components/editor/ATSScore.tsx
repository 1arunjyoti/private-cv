"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { calculateATSScore, type ATSCheck } from "@/lib/ats-score";
import { type Resume } from "@/db";
import { CheckCircle, AlertCircle, Target, Trophy, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface ATSScoreProps {
  resume: Resume | null;
}

function CheckItem({ check }: { check: ATSCheck }) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 p-3 rounded-lg border transition-colors",
        check.passed
          ? "bg-green-50/50 border-green-100 dark:bg-green-900/10 dark:border-green-800"
          : "bg-red-50/50 border-red-100 dark:bg-red-900/10 dark:border-red-800",
      )}
    >
      <div className="mt-0.5 shrink-0">
        {check.passed ? (
          <CheckCircle className="size-4 text-green-600" />
        ) : (
          <AlertCircle className="size-4 text-red-600" />
        )}
      </div>
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <p
            className={cn(
              "font-medium text-sm",
              check.passed
                ? "text-green-900 dark:text-green-100"
                : "text-red-900 dark:text-red-100",
            )}
          >
            {check.name}
          </p>
          <span className="text-xs font-mono text-muted-foreground/70">
            {check.score}/{check.maxScore}
          </span>
        </div>
        <p
          className={cn(
            "text-xs",
            check.passed
              ? "text-green-700 dark:text-green-300"
              : "text-red-700 dark:text-red-300",
          )}
        >
          {check.message}
        </p>

        {/* Show extra details for failures if available */}
        {check.details && check.details.length > 0 && !check.passed && (
          <div className="mt-2 text-xs bg-white/50 dark:bg-black/20 rounded p-2">
            <p className="font-semibold mb-1 flex items-center gap-1 opacity-80">
              <Info className="size-3" /> Issues found:
            </p>
            <ul className="list-disc list-inside space-y-0.5 opacity-80">
              {check.details.map((detail, idx) => (
                <li key={idx} className="truncate">
                  {detail}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export function ATSScore({ resume }: ATSScoreProps) {
  const [isOpen, setIsOpen] = useState(false);

  const scoreResult = useMemo(() => {
    if (!resume) return null;
    return calculateATSScore(resume);
  }, [resume]);

  const scoreStartColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const scoreRingColor = (score: number) => {
    if (score >= 80) return "stroke-green-500";
    if (score >= 60) return "stroke-yellow-500";
    return "stroke-red-500";
  };

  if (!resume) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="text-primary border-primary/30 hover:bg-primary/10 gap-2"
        >
          <Target className="size-4" />
          Check ATS Score
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="size-5 text-yellow-500" />
            ATS Score Analysis
          </DialogTitle>
          <DialogDescription>
            Optimize your resume for Applicant Tracking Systems.
          </DialogDescription>
        </DialogHeader>

        {scoreResult && (
          <div className="space-y-6 py-4">
            {/* Score Ring */}
            <div className="flex flex-col items-center justify-center">
              <div className="relative size-32">
                <svg className="size-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    className="stroke-muted"
                    strokeWidth="8"
                    fill="transparent"
                    r="40"
                    cx="50"
                    cy="50"
                  />
                  <circle
                    className={cn(
                      scoreRingColor(scoreResult.totalScore),
                      "transition-all duration-1000 ease-out",
                    )}
                    strokeWidth="8"
                    strokeLinecap="round"
                    fill="transparent"
                    r="40"
                    cx="50"
                    cy="50"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - scoreResult.totalScore / 100)}`}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span
                    className={cn(
                      "text-3xl font-bold",
                      scoreStartColor(scoreResult.totalScore),
                    )}
                  >
                    {scoreResult.totalScore}
                  </span>
                  <span className="text-xs text-muted-foreground uppercase tracking-widest">
                    Score
                  </span>
                </div>
              </div>
              <p className="mt-2 text-sm text-center text-muted-foreground max-w-xs">
                {scoreResult.totalScore >= 80
                  ? "Your resume is well-optimized!"
                  : scoreResult.totalScore >= 50
                    ? "Good start, but needs improvement."
                    : "Needs significant work to pass ATS filters."}
              </p>
            </div>

            {/* Breakdown */}
            <div className="space-y-6">
              <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                Detailed Breakdown
              </h3>

              {/* Impact Checks */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase text-muted-foreground/80 flex items-center gap-2">
                  <Target className="size-3" /> Impact & Reach
                </h4>
                {scoreResult.checks
                  .filter((c) => c.category === "impact")
                  .map((check) => (
                    <CheckItem key={check.id} check={check} />
                  ))}
              </div>

              {/* Content Checks */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase text-muted-foreground/80 flex items-center gap-2">
                  <Trophy className="size-3" /> Content Quality
                </h4>
                {scoreResult.checks
                  .filter((c) => c.category === "content")
                  .map((check) => (
                    <CheckItem key={check.id} check={check} />
                  ))}
              </div>

              {/* Formatting Checks */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase text-muted-foreground/80 flex items-center gap-2">
                  <CheckCircle className="size-3" /> Formatting
                </h4>
                {scoreResult.checks
                  .filter((c) => c.category === "formatting")
                  .map((check) => (
                    <CheckItem key={check.id} check={check} />
                  ))}
              </div>
            </div>

            {/* Feedback Summary */}
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-medium mb-2 flex items-center gap-2 text-sm">
                <Target className="size-4" />
                Key Improvements
              </h4>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                {scoreResult.checks.filter((c) => !c.passed).length === 0 ? (
                  <li>No critical issues found. Great job!</li>
                ) : (
                  scoreResult.checks
                    .filter((c) => !c.passed)
                    .map((c) => <li key={c.id}>{c.message}</li>)
                )}
              </ul>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
