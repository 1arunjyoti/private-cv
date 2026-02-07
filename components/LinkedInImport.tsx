"use client";

import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Linkedin,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  User,
  Briefcase,
  GraduationCap,
  Wrench,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Resume } from "@/db";
import { useLLMSettingsStore } from "@/store/useLLMSettingsStore";
import { useResumeStore } from "@/store/useResumeStore";
import { ensureLLMProvider } from "@/lib/llm/ensure-provider";
import { buildLinkedInParsingPrompt } from "@/lib/llm/prompts";
import { parseLLMImportOutput } from "@/lib/import/ai-enhance";
import { importService, type ParsedResumeData } from "@/lib/import";

interface LinkedInImportProps {
  resume: Resume;
  className?: string;
  trigger?: React.ReactNode;
  open?: boolean; // Controlled open state
  onOpenChange?: (open: boolean) => void; // Controlled open state handler
}

export function LinkedInImport({ resume, className, trigger, open: controlledOpen, onOpenChange }: LinkedInImportProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  
  // Use controlled state if provided, otherwise use internal state
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;
  
  const [inputText, setInputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<ParsedResumeData | null>(null);

  const providerId = useLLMSettingsStore((state) => state.providerId);
  const apiKeys = useLLMSettingsStore((state) => state.apiKeys);
  const consent = useLLMSettingsStore((state) => state.consent);
  const updateCurrentResume = useResumeStore((state) => state.updateCurrentResume);

  const handleParse = useCallback(async () => {
    if (!inputText.trim()) return;

    const result = ensureLLMProvider({
      providerId,
      apiKeys,
      consent,
      requiredConsent: "analysis",
    });

    if ("error" in result) {
      setError(result.error);
      return;
    }

    setIsProcessing(true);
    setError(null);
    setParsedData(null);

    try {
      const output = await result.provider.generateText(result.apiKey, {
        prompt: buildLinkedInParsingPrompt(inputText),
        temperature: 0.3,
        maxTokens: 4096,
      });

      const data = parseLLMImportOutput(output);
      setParsedData(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsProcessing(false);
    }
  }, [inputText, providerId, apiKeys, consent]);

  const handleApply = useCallback(() => {
    if (!parsedData) return;

    const merged = importService.mergeWithResume(resume, parsedData);
    updateCurrentResume(merged);
    setParsedData(null);
    setInputText("");
    setOpen(false);
  }, [parsedData, resume, updateCurrentResume]);

  const sectionCounts = parsedData
    ? {
        basics: parsedData.basics?.name ? 1 : 0,
        work: parsedData.work?.length || 0,
        education: parsedData.education?.length || 0,
        skills: parsedData.skills?.length || 0,
        projects: parsedData.projects?.length || 0,
        certificates: parsedData.certificates?.length || 0,
      }
    : null;

  const totalItems = sectionCounts
    ? Object.values(sectionCounts).reduce((a, b) => a + b, 0)
    : 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {(controlledOpen === undefined || trigger) && (
        <DialogTrigger asChild>
          {trigger || (
            <Button
              variant="outline"
              size="sm"
              className={cn("text-primary border-primary/20 hover:bg-primary/10", className)}
            >
              <Linkedin className="h-4 w-4" />
              LinkedIn Import
            </Button>
          )}
        </DialogTrigger>
      )}
      <DialogContent className="rounded-lg sm:max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Linkedin className="h-5 w-5" />
            LinkedIn / Portfolio Import
          </DialogTitle>
          <DialogDescription>
            Paste your LinkedIn profile text or portfolio content. AI will parse it into
            structured resume fields.
          </DialogDescription>
          <div className="flex items-start gap-2 p-2.5 mt-2 rounded-md bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
            <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
            <p className="text-xs text-blue-700 dark:text-blue-300"><span className="font-medium">Requires AI:</span> This feature needs an AI provider configured in Settings.</p>
          </div>
        </DialogHeader>

        {!parsedData ? (
          <>
            <Textarea
              placeholder={"Copy your LinkedIn profile page text and paste it here...\n\nOr paste any portfolio/bio text you'd like to import into your resume."}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="min-h-50 text-sm"
              disabled={isProcessing}
            />

            <div className="text-xs text-muted-foreground space-y-1">
              <p className="font-medium">How to copy your LinkedIn profile:</p>
              <ol className="list-decimal list-inside space-y-0.5 ml-1">
                <li>Go to your LinkedIn profile page</li>
                <li>Select all text (Ctrl+A / Cmd+A) and copy (Ctrl+C / Cmd+C)</li>
                <li>Paste it in the text box above</li>
              </ol>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleParse}
                disabled={isProcessing || !inputText.trim()}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Parsing...
                  </>
                ) : (
                  <>
                    <Linkedin className="h-4 w-4" />
                    Parse with AI
                  </>
                )}
              </Button>
            </div>
          </>
        ) : (
          <>
            {/* Results preview */}
            <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
              <div>
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  Successfully parsed {totalItems} items
                </p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  Review below and apply to your resume
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {sectionCounts && sectionCounts.basics > 0 && parsedData.basics && (
                <div className="border rounded-lg p-3 space-y-1">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <User className="h-4 w-4 text-muted-foreground" />
                    Personal Info
                  </div>
                  <div className="text-xs space-y-0.5 text-muted-foreground">
                    {parsedData.basics.name && <p>Name: <span className="text-foreground">{parsedData.basics.name}</span></p>}
                    {parsedData.basics.label && <p>Title: <span className="text-foreground">{parsedData.basics.label}</span></p>}
                    {parsedData.basics.email && <p>Email: <span className="text-foreground">{parsedData.basics.email}</span></p>}
                    {parsedData.basics.summary && (
                      <p className="line-clamp-2">Summary: <span className="text-foreground">{parsedData.basics.summary}</span></p>
                    )}
                  </div>
                </div>
              )}

              {sectionCounts && sectionCounts.work > 0 && parsedData.work && (
                <div className="border rounded-lg p-3 space-y-1">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    Work Experience
                    <Badge variant="secondary" className="text-xs">{sectionCounts.work}</Badge>
                  </div>
                  <div className="text-xs space-y-1">
                    {parsedData.work.slice(0, 5).map((w, i) => (
                      <p key={i} className="text-muted-foreground">
                        <span className="text-foreground font-medium">{w.position}</span>
                        {w.company && ` at ${w.company}`}
                        {w.startDate && ` (${w.startDate} - ${w.endDate || "Present"})`}
                      </p>
                    ))}
                    {sectionCounts.work > 5 && (
                      <p className="text-muted-foreground">+{sectionCounts.work - 5} more...</p>
                    )}
                  </div>
                </div>
              )}

              {sectionCounts && sectionCounts.education > 0 && parsedData.education && (
                <div className="border rounded-lg p-3 space-y-1">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    Education
                    <Badge variant="secondary" className="text-xs">{sectionCounts.education}</Badge>
                  </div>
                  <div className="text-xs space-y-1">
                    {parsedData.education.map((e, i) => (
                      <p key={i} className="text-muted-foreground">
                        <span className="text-foreground font-medium">{e.studyType} {e.area}</span>
                        {e.institution && ` at ${e.institution}`}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {sectionCounts && sectionCounts.skills > 0 && parsedData.skills && (
                <div className="border rounded-lg p-3 space-y-1">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Wrench className="h-4 w-4 text-muted-foreground" />
                    Skills
                    <Badge variant="secondary" className="text-xs">{sectionCounts.skills} groups</Badge>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {parsedData.skills.flatMap((s) => s.keywords || []).slice(0, 15).map((kw, i) => (
                      <Badge key={i} variant="outline" className="text-xs">{kw}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setParsedData(null);
                  setInputText("");
                }}
              >
                Start Over
              </Button>
              <Button onClick={handleApply}>
                <CheckCircle2 className="h-4 w-4" />
                Apply to Resume
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
