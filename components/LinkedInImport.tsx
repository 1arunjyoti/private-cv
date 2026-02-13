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
  FileSpreadsheet,
  FileText,
  Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Resume } from "@/db";
import { useLLMSettingsStore } from "@/store/useLLMSettingsStore";
import { useResumeStore } from "@/store/useResumeStore";
import { ensureLLMProvider } from "@/lib/llm/ensure-provider";
import { buildLinkedInParsingPrompt } from "@/lib/llm/prompts";
import { redactContactInfo } from "@/lib/llm/redaction";
import { parseLLMImportOutput } from "@/lib/import/ai-enhance";
import {
  importService,
  type ParsedResumeData,
  linkedInCSVParser,
  linkedInPDFParser,
} from "@/lib/import";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface LinkedInImportProps {
  resume: Resume;
  className?: string;
  trigger?: React.ReactNode;
  open?: boolean; // Controlled open state
  onOpenChange?: (open: boolean) => void; // Controlled open state handler
}

export function LinkedInImport({
  resume,
  className,
  trigger,
  open: controlledOpen,
  onOpenChange,
}: LinkedInImportProps) {
  const [internalOpen, setInternalOpen] = useState(false);

  // Use controlled state if provided, otherwise use internal state
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  const [activeTab, setActiveTab] = useState("csv");
  const [inputText, setInputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<ParsedResumeData | null>(null);

  const providerId = useLLMSettingsStore((state) => state.providerId);
  const apiKeys = useLLMSettingsStore((state) => state.apiKeys);
  const consent = useLLMSettingsStore((state) => state.consent);
  const redaction = useLLMSettingsStore((state) => state.redaction);
  const updateCurrentResume = useResumeStore(
    (state) => state.updateCurrentResume,
  );

  const handleParseAI = useCallback(async () => {
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
      const sanitizedInput = redaction.stripContactInfo
        ? redactContactInfo(inputText)
        : inputText;
      const output = await result.provider.generateText(result.apiKey, {
        prompt: buildLinkedInParsingPrompt(sanitizedInput),
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
  }, [inputText, providerId, apiKeys, consent, redaction.stripContactInfo]);

  const handleFileUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>, type: "csv" | "pdf") => {
      const file = e.target.files?.[0];
      if (!file) return;

      setIsProcessing(true);
      setError(null);
      setParsedData(null);

      try {
        const result =
          type === "csv"
            ? await linkedInCSVParser.parse(file)
            : await linkedInPDFParser.parse(file);

        if (result.success) {
          setParsedData(result.data);
        } else {
          setError(result.errors.join("\n") || "Failed to parse file.");
        }
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsProcessing(false);
        // Reset input
        e.target.value = "";
      }
    },
    [],
  );

  const handleApply = useCallback(() => {
    if (!parsedData) return;

    const merged = importService.mergeWithResume(resume, parsedData);
    updateCurrentResume(merged);
    setParsedData(null);
    setInputText("");
    setOpen(false);
  }, [parsedData, resume, setOpen, updateCurrentResume]);

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
              className={cn(
                "text-primary border-primary/20 hover:bg-primary/10",
                className,
              )}
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
            Import your professional data from LinkedIn or other sources.
          </DialogDescription>
        </DialogHeader>

        {!parsedData ? (
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex-1 flex flex-col min-h-0"
          >
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="csv" className="gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                Data Export (CSV)
              </TabsTrigger>
              <TabsTrigger value="pdf" className="gap-2">
                <FileText className="h-4 w-4" />
                Profile PDF
              </TabsTrigger>
              <TabsTrigger value="ai" className="gap-2">
                <Linkedin className="h-4 w-4" />
                Paste Text (AI)
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="csv"
              className="flex-1 flex flex-col gap-4 mt-0"
            >
              <div className="rounded-md bg-muted/50 p-4 border border-dashed border-muted-foreground/25 flex flex-col items-center justify-center gap-2 text-center h-48">
                <div className="p-3 rounded-full bg-background border shadow-sm">
                  <Upload className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">Upload LinkedIn Data Export</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Upload the extraction ZIP file or individual CSVs <br />
                    (Positions.csv, Education.csv, Skills.csv, etc.)
                  </p>
                </div>
                <Button variant="secondary" size="sm" className="mt-2 relative">
                  Select File
                  <input
                    type="file"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    accept=".zip,.csv"
                    onChange={(e) => handleFileUpload(e, "csv")}
                    disabled={isProcessing}
                  />
                </Button>
              </div>

              <div className="text-xs text-muted-foreground bg-blue-50 dark:bg-blue-950/20 p-3 rounded-md border border-blue-100 dark:border-blue-900">
                <p className="font-medium text-blue-700 dark:text-blue-400 mb-1">
                  How to get your data:
                </p>
                <ol className="list-decimal list-inside space-y-0.5 ml-1">
                  <li>Go to LinkedIn Settings & Privacy</li>
                  <li>Select &quot;Data Privacy&quot; &gt; &quot;Get a copy of your data&quot;</li>
                  <li>
                    Select &quot;Download larger data archive&quot; (or specific files)
                  </li>
                  <li>Wait for email (10-20 mins) and download the ZIP</li>
                </ol>
              </div>
            </TabsContent>

            <TabsContent
              value="pdf"
              className="flex-1 flex flex-col gap-4 mt-0"
            >
              <div className="rounded-md bg-muted/50 p-4 border border-dashed border-muted-foreground/25 flex flex-col items-center justify-center gap-2 text-center h-48">
                <div className="p-3 rounded-full bg-background border shadow-sm">
                  <FileText className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">Upload Profile PDF</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Upload the &quot;Save to PDF&quot; file from your LinkedIn profile.
                  </p>
                </div>
                <Button variant="secondary" size="sm" className="mt-2 relative">
                  Select PDF
                  <input
                    type="file"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    accept=".pdf"
                    onChange={(e) => handleFileUpload(e, "pdf")}
                    disabled={isProcessing}
                  />
                </Button>
              </div>

              <div className="text-xs text-muted-foreground bg-yellow-50 dark:bg-yellow-950/20 p-3 rounded-md border border-yellow-100 dark:border-yellow-900">
                <p className="font-medium text-yellow-700 dark:text-yellow-400 mb-1">
                  Note on PDF Import:
                </p>
                <p>
                  PDF parsing relies on text extraction and may not be perfect
                  due to LinkedIn&apos;s variable formatting. Review imported data
                  carefully.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="ai" className="flex-1 flex flex-col gap-4 mt-0">
              <div className="flex items-start gap-2 p-2.5 rounded-md bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  <span className="font-medium">Requires AI:</span> This feature
                  needs an AI provider configured in Settings.
                </p>
              </div>
              <Textarea
                placeholder={
                  "Copy your LinkedIn profile page text and paste it here...\n\nOr paste any portfolio/bio text you'd like to import into your resume."
                }
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 min-h-37.5 text-sm"
                disabled={isProcessing}
              />

              <div className="text-xs text-muted-foreground space-y-1">
                <p className="font-medium">
                  How to copy your LinkedIn profile:
                </p>
                <ol className="list-decimal list-inside space-y-0.5 ml-1">
                  <li>Go to your LinkedIn profile page</li>
                  <li>
                    Select all text (Ctrl+A / Cmd+A) and copy (Ctrl+C / Cmd+C)
                  </li>
                  <li>Paste it in the text box above</li>
                </ol>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  onClick={handleParseAI}
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
            </TabsContent>

            {error && (
              <div className="flex items-start gap-2 p-3 mt-2 rounded-lg bg-destructive/10 text-destructive text-sm">
                <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                <span className="whitespace-pre-wrap">{error}</span>
              </div>
            )}

            <div className="flex justify-end gap-2 mt-2 pt-2 border-t">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
            </div>
          </Tabs>
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

            <div className="flex-1 overflow-y-auto space-y-3 pr-1 mt-3">
              {sectionCounts &&
                sectionCounts.basics > 0 &&
                parsedData?.basics && (
                  <div className="border rounded-lg p-3 space-y-1">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <User className="h-4 w-4 text-muted-foreground" />
                      Personal Info
                    </div>
                    <div className="text-xs space-y-0.5 text-muted-foreground">
                      {parsedData.basics.name && (
                        <p>
                          Name:{" "}
                          <span className="text-foreground">
                            {parsedData.basics.name}
                          </span>
                        </p>
                      )}
                      {parsedData.basics.label && (
                        <p>
                          Title:{" "}
                          <span className="text-foreground">
                            {parsedData.basics.label}
                          </span>
                        </p>
                      )}
                      {parsedData.basics.email && (
                        <p>
                          Email:{" "}
                          <span className="text-foreground">
                            {parsedData.basics.email}
                          </span>
                        </p>
                      )}
                      {parsedData.basics.summary && (
                        <p className="line-clamp-2">
                          Summary:{" "}
                          <span className="text-foreground">
                            {parsedData.basics.summary}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                )}

              {sectionCounts && sectionCounts.work > 0 && parsedData?.work && (
                <div className="border rounded-lg p-3 space-y-1">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    Work Experience
                    <Badge variant="secondary" className="text-xs">
                      {sectionCounts.work}
                    </Badge>
                  </div>
                  <div className="text-xs space-y-1">
                    {parsedData.work.slice(0, 5).map((w, i) => (
                      <p key={i} className="text-muted-foreground">
                        <span className="text-foreground font-medium">
                          {w.position}
                        </span>
                        {w.company && ` at ${w.company}`}
                        {w.startDate &&
                          ` (${w.startDate} - ${w.endDate || "Present"})`}
                      </p>
                    ))}
                    {sectionCounts.work > 5 && (
                      <p className="text-muted-foreground">
                        +{sectionCounts.work - 5} more...
                      </p>
                    )}
                  </div>
                </div>
              )}

              {sectionCounts &&
                sectionCounts.education > 0 &&
                parsedData?.education && (
                  <div className="border rounded-lg p-3 space-y-1">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <GraduationCap className="h-4 w-4 text-muted-foreground" />
                      Education
                      <Badge variant="secondary" className="text-xs">
                        {sectionCounts.education}
                      </Badge>
                    </div>
                    <div className="text-xs space-y-1">
                      {parsedData.education.map((e, i) => (
                        <p key={i} className="text-muted-foreground">
                          <span className="text-foreground font-medium">
                            {e.studyType} {e.area}
                          </span>
                          {e.institution && ` at ${e.institution}`}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

              {sectionCounts &&
                sectionCounts.skills > 0 &&
                parsedData?.skills && (
                  <div className="border rounded-lg p-3 space-y-1">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Wrench className="h-4 w-4 text-muted-foreground" />
                      Skills
                      <Badge variant="secondary" className="text-xs">
                        {sectionCounts.skills} groups
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {parsedData.skills
                        .flatMap((s) => s.keywords || [])
                        .slice(0, 15)
                        .map((kw, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {kw}
                          </Badge>
                        ))}
                    </div>
                  </div>
                )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t mt-auto">
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
