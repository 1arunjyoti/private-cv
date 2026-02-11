"use client";

import { useEffect, useState, useCallback, Suspense, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BasicsForm,
  WorkForm,
  EducationForm,
  SkillsForm,
  ProjectsForm,
  CertificatesForm,
  LanguagesForm,
  InterestsForm,
  PublicationsForm,
  AwardsForm,
  ReferencesForm,
  CustomForm,
} from "@/components/forms";
import { PDFPreview } from "@/components/preview/PDFPreview";
import { JobMatcher } from "@/components/JobMatcher";
import { useResumeStore } from "@/store/useResumeStore";
import { generateMockResume } from "@/lib/mockData";
import { DesignSettings } from "@/components/DesignSettings";

import {
  User,
  Briefcase,
  GraduationCap,
  Wrench,
  FolderKanban,
  Award,
  Languages,
  Heart,
  BookOpen,
  Trophy,
  Users,
  Layers,
  Save,
  FileDown,
  Loader2,
  ArrowLeft,
  Target,
  Menu,
  RotateCcw,
  Wand2,
  ChevronDown,
  PenLine,
  FileUp,
  Info,
  FileJson,
  LayoutTemplate,
  Paintbrush,
  Settings,
  TrendingUp,
  Linkedin,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { ResetConfirmDialog } from "@/components/ResetConfirmDialog";
import { ATSScore } from "@/components/editor/ATSScore";
import { ConsistencyChecker } from "@/components/editor/ConsistencyChecker";
import { CareerGapAnalysis } from "@/components/editor/CareerGapAnalysis";
import { DisclaimerDialog } from "@/components/DisclaimerDialog";
import { Separator } from "@/components/ui/separator";
import { ImportDialog } from "@/components/ImportDialog";
import { ImportReview } from "@/components/ImportReview";
import { LinkedInImport } from "@/components/LinkedInImport";
import {
  importService,
  type ImportResult,
  type ParsedResumeData,
} from "@/lib/import";

// Moved outside component to prevent recreation on every render
const EDITOR_TABS = [
  { id: "basics", label: "Basics", icon: User },
  { id: "work", label: "Experience", icon: Briefcase },
  { id: "education", label: "Education", icon: GraduationCap },
  { id: "skills", label: "Skills", icon: Wrench },
  { id: "projects", label: "Projects", icon: FolderKanban },
  { id: "certificates", label: "Certificates", icon: Award },
  { id: "languages", label: "Languages", icon: Languages },
  { id: "interests", label: "Interests", icon: Heart },
  { id: "publications", label: "Publications", icon: BookOpen },
  { id: "awards", label: "Awards", icon: Trophy },
  { id: "references", label: "References", icon: Users },
  { id: "custom", label: "Custom", icon: Layers },
  { id: "match", label: "Job Match", icon: Target },
];

function EditorContent() {
  const searchParams = useSearchParams();
  const resumeId = searchParams.get("id");
  const templateParam = searchParams.get("template");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Use individual selectors to optimize re-renders
  const currentResume = useResumeStore((state) => state.currentResume);
  const isLoading = useResumeStore((state) => state.isLoading);
  const error = useResumeStore((state) => state.error);
  const loadResume = useResumeStore((state) => state.loadResume);
  const createNewResume = useResumeStore((state) => state.createNewResume);
  const saveResume = useResumeStore((state) => state.saveResume);
  const updateCurrentResume = useResumeStore(
    (state) => state.updateCurrentResume,
  );
  const resetResume = useResumeStore((state) => state.resetResume);

  // DisclaimerDialog is now imported from components/DisclaimerDialog
  // but we need to add the import at the top first.

  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("basics");
  const [view, setView] = useState<"content" | "customize">("content");
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importReviewOpen, setImportReviewOpen] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  // Dialog states for dropdown menu items
  const [atsScoreOpen, setAtsScoreOpen] = useState(false);
  const [consistencyCheckerOpen, setConsistencyCheckerOpen] = useState(false);
  const [careerGapAnalysisOpen, setCareerGapAnalysisOpen] = useState(false);
  const [linkedInImportOpen, setLinkedInImportOpen] = useState(false);

  // Load or create resume on mount
  useEffect(() => {
    if (resumeId) {
      loadResume(resumeId);
    } else if (!currentResume) {
      createNewResume(undefined, templateParam || undefined);
    }
  }, [resumeId, loadResume, createNewResume, currentResume, templateParam]);

  const handleSave = useCallback(async () => {
    if (!currentResume) return;
    setIsSaving(true);
    try {
      await saveResume(currentResume);
    } finally {
      setIsSaving(false);
    }
  }, [currentResume, saveResume]);

  const handleReset = useCallback(() => {
    resetResume();
  }, [resetResume]);

  const handleExportJSON = useCallback(() => {
    if (!currentResume) return;
    const dataStr = JSON.stringify(currentResume, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${currentResume.meta.title || "resume"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [currentResume]);

  const handleImportResume = useCallback(() => {
    setImportDialogOpen(true);
  }, []);

  const handleImportComplete = useCallback((result: ImportResult) => {
    setImportResult(result);
    setImportDialogOpen(false);
    setImportReviewOpen(true);
  }, []);

  const handleImportConfirm = useCallback(
    (data: ParsedResumeData) => {
      if (!currentResume) return;
      const merged = importService.mergeWithResume(currentResume, data);
      updateCurrentResume(merged);
      setImportReviewOpen(false);
      setImportResult(null);
    },
    [currentResume, updateCurrentResume],
  );

  const handleImportCancel = useCallback(() => {
    setImportReviewOpen(false);
    setImportResult(null);
  }, []);

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const parsed = JSON.parse(content);

          // Basic validation
          if (!parsed.basics) {
            alert("Invalid resume JSON file");
            return;
          }

          // Ensure we keep the current ID and just update content
          updateCurrentResume({
            ...parsed,
            id: currentResume?.id || parsed.id,
          });
        } catch (err) {
          console.error("Failed to import JSON", err);
          alert("Failed to parse JSON file");
        }
      };
      reader.readAsText(file);
      // Reset input value to allow selecting same file again
      event.target.value = "";
    },
    [currentResume, updateCurrentResume],
  );

  const handleFillSampleData = useCallback(() => {
    if (!currentResume) return;
    const mockData = generateMockResume();
    updateCurrentResume({
      ...currentResume,
      basics: mockData.basics,
      work: mockData.work,
      education: mockData.education,
      skills: mockData.skills,
      projects: mockData.projects,
      certificates: mockData.certificates,
      languages: mockData.languages,
      interests: mockData.interests,
      publications: mockData.publications,
      awards: mockData.awards,
      references: mockData.references,
      custom: mockData.custom,
    });
  }, [currentResume, updateCurrentResume]);

  if (isLoading && !currentResume) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background p-4">
        <p className="text-destructive text-center">{error}</p>
        <Link href="/">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Home
          </Button>
        </Link>
      </div>
    );
  }

  if (!currentResume) {
    return null;
  }

  // Use EDITOR_TABS constant defined outside component

  return (
    <div className="h-screen overflow-hidden bg-background flex flex-col">
      <input
        type="file"
        accept=".json"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Import Dialogs */}
      <ImportDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        onImportComplete={handleImportComplete}
      />

      {importResult && (
        <ImportReview
          open={importReviewOpen}
          onOpenChange={setImportReviewOpen}
          importResult={importResult}
          onConfirm={handleImportConfirm}
          onCancel={handleImportCancel}
        />
      )}
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
            <Link href="/templates">
              <Button variant="ghost" size="icon" className="shrink-0">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex-1 min-w-0">
              <input
                type="text"
                value={currentResume.meta.title}
                onChange={(e) =>
                  updateCurrentResume({
                    meta: { ...currentResume.meta, title: e.target.value },
                  })
                }
                className="w-full text-base sm:text-lg font-semibold bg-transparent border-0 focus:outline-none focus:ring-0 p-0 text-foreground placeholder:text-muted-foreground truncate"
                placeholder="Resume Title"
                name="title"
                autoComplete="off"
                aria-label="Resume Title"
              />
              <p className="text-xs text-muted-foreground hidden sm:block truncate">
                Last saved:{" "}
                {new Date(currentResume.meta.lastModified).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* View Toggle */}
            <div className="hidden lg:flex items-center gap-1 bg-muted p-1 rounded-lg mr-2 border">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setView("content")}
                className={`gap-2 h-8 rounded-md transition-all ${
                  view === "content"
                    ? "bg-background text-foreground shadow-sm hover:bg-background"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <PenLine className="h-4 w-4" />
                Content
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setView("customize")}
                className={`gap-2 h-8 rounded-md transition-all ${
                  view === "customize"
                    ? "bg-background text-foreground shadow-sm hover:bg-background"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Paintbrush className="h-4 w-4" />
                Customize
              </Button>
            </div>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-2">
              {/* More Options Dropdown */}
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-primary border-primary/20 hover:bg-primary/10 gap-2"
                  >
                    <Menu className="h-4 w-4" />
                    More Options
                    <ChevronDown className="h-3 w-3 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => setAtsScoreOpen(true)}
                    className="mb-1"
                  >
                    <Target className="h-4 w-4" />
                    Check ATS Score
                    <span className=" text-xs px-2 py-0.5 rounded-full bg-muted-foreground/10">
                      Beta
                    </span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setConsistencyCheckerOpen(true)}
                    className="mb-1"
                  >
                    <FileJson className="h-4 w-4" />
                    Consistency Checker
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setCareerGapAnalysisOpen(true)}
                    className="mb-1"
                  >
                    <TrendingUp className="h-4 w-4" />
                    Career Gap Analysis
                  </DropdownMenuItem>
                  {currentResume && (
                    <DropdownMenuItem
                      onClick={() => setLinkedInImportOpen(true)}
                      className="mb-1"
                    >
                      <Linkedin className="h-4 w-4" />
                      LinkedIn / Portfolio Import
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link href="/settings">
                      <Settings className="h-4 w-4" />
                      LLM Settings
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Render dialogs outside dropdown with controlled state */}
              <ATSScore
                resume={currentResume}
                open={atsScoreOpen}
                onOpenChange={setAtsScoreOpen}
              />
              <ConsistencyChecker
                resume={currentResume}
                open={consistencyCheckerOpen}
                onOpenChange={setConsistencyCheckerOpen}
              />
              <CareerGapAnalysis
                resume={currentResume}
                open={careerGapAnalysisOpen}
                onOpenChange={setCareerGapAnalysisOpen}
              />
              {currentResume && (
                <LinkedInImport
                  resume={currentResume}
                  open={linkedInImportOpen}
                  onOpenChange={setLinkedInImportOpen}
                />
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleFillSampleData}
                className="text-primary border-primary/20 hover:bg-primary/10"
              >
                <Wand2 className="h-4 w-4" />
                Fill Sample
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-primary border-primary/20 hover:bg-primary/10 gap-2"
                  >
                    <FileJson className="h-4 w-4" />
                    Import / Export
                    <ChevronDown className="h-3 w-3 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleImportResume}>
                    <FileUp className="h-4 w-4" />
                    Import Resume (PDF/DOCX/JSON)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportJSON}>
                    <FileDown className="h-4 w-4" />
                    Export JSON
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                size="sm"
                variant="outline"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save
              </Button>
              <ResetConfirmDialog onConfirm={handleReset} />
              <ThemeToggle />

              {/* Disclaimer */}
              <DisclaimerDialog />
            </div>

            {/* Mobile Actions */}
            <div className="flex lg:hidden items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  setView(view === "content" ? "customize" : "content")
                }
              >
                {view === "content" ? (
                  <Paintbrush className="h-5 w-5" />
                ) : (
                  <PenLine className="h-5 w-5" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Save className="h-5 w-5" />
                )}
              </Button>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="w-75 sm:w-100 overflow-y-auto p-4"
                >
                  <SheetHeader className="text-left border-b pb-4">
                    <SheetTitle>Editor Menu</SheetTitle>
                    <SheetDescription>
                      Manage your resume and editor settings.
                    </SheetDescription>
                  </SheetHeader>

                  <div className="flex flex-col gap-6 mt-2">
                    {/* Section: Resume Actions */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 px-1">
                        <Settings className="w-4 h-4 text-muted-foreground" />
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Resume Actions
                        </h4>
                      </div>
                      <div className="grid gap-2">
                        <Button
                          variant="outline"
                          className="justify-start text-foreground h-10 bg-background"
                          onClick={handleImportResume}
                        >
                          <FileUp className="h-4 w-4" />
                          Import Resume (PDF/DOCX/JSON)
                        </Button>
                        <Button
                          variant="outline"
                          className="justify-start text-foreground h-10 bg-background"
                          onClick={handleExportJSON}
                        >
                          <FileDown className="h-4 w-4" />
                          Export JSON
                        </Button>
                      </div>
                    </div>

                    <Separator />

                    {/* Section: View & Design */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 px-1">
                        <LayoutTemplate className="w-4 h-4 text-muted-foreground" />
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          View & Design
                        </h4>
                      </div>

                      {/* View Mode Toggle */}
                      <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-lg">
                        <Button
                          variant="ghost"
                          size="sm"
                          className={cn(
                            "h-8 transition-all duration-200",
                            view === "content"
                              ? "bg-background text-foreground shadow-sm hover:bg-background/90"
                              : "text-muted-foreground hover:text-foreground hover:bg-transparent",
                          )}
                          onClick={() => setView("content")}
                        >
                          <PenLine className="h-3.5 w-3.5 mr-2" />
                          Content
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={cn(
                            "h-8 transition-all duration-200",
                            view === "customize"
                              ? "bg-background text-foreground shadow-sm hover:bg-background/90"
                              : "text-muted-foreground hover:text-foreground hover:bg-transparent",
                          )}
                          onClick={() => setView("customize")}
                        >
                          <Paintbrush className="h-3.5 w-3.5 mr-2" />
                          Customize
                        </Button>
                      </div>

                      {/* Theme Toggle */}
                      <div className="flex items-center justify-between p-2 rounded-md border bg-background/50">
                        <span className="text-sm font-medium pl-1">
                          Appearance
                        </span>
                        <ThemeToggle />
                      </div>
                    </div>

                    <Separator />

                    {/* Section: Tools */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 px-1">
                        <Menu className="w-4 h-4 text-muted-foreground" />
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          More Options
                        </h4>
                      </div>
                      <div className="space-y-2">
                        <ATSScore
                          resume={currentResume}
                          className="w-full justify-start h-10 px-4 bg-background border-primary/10"
                        />
                        <ConsistencyChecker
                          resume={currentResume}
                          className="w-full justify-start h-10 px-4 bg-background border-primary/10"
                        />
                        <CareerGapAnalysis
                          resume={currentResume}
                          className="w-full justify-start h-10 px-4 bg-background border-primary/10"
                        />
                        {currentResume && (
                          <LinkedInImport
                            resume={currentResume}
                            className="justify-start text-foreground h-10 bg-background w-full"
                            trigger={
                              <Button
                                variant="outline"
                                className="justify-start text-foreground h-10 bg-background w-full "
                              >
                                <Linkedin className="h-4 w-4" />
                                LinkedIn / Portfolio Import
                              </Button>
                            }
                          />
                        )}
                        <Button
                          variant="outline"
                          className="justify-start w-full h-10"
                          asChild
                        >
                          <Link href="/settings">
                            <Settings className="h-4 w-4" />
                            LLM Settings
                          </Link>
                        </Button>

                        <Button
                          variant="outline"
                          className="justify-start w-full h-10 border-dashed"
                          onClick={handleFillSampleData}
                        >
                          <Wand2 className="h-4 w-4" />
                          Fill Sample Data
                        </Button>

                        <DisclaimerDialog
                          trigger={
                            <Button
                              variant="ghost"
                              className="justify-start w-full h-10 border"
                            >
                              <Info className="h-4 w-4" />
                              Help & Instructions
                            </Button>
                          }
                        />
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="mt-auto pt-2">
                      <ResetConfirmDialog
                        onConfirm={handleReset}
                        trigger={
                          <Button
                            variant="ghost"
                            className="justify-start w-full text-destructive h-10 border"
                          >
                            <RotateCcw className="h-4 w-4" />
                            Reset All Data
                          </Button>
                        }
                      />
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 max-w-8xl grid grid-cols-1 lg:grid-cols-2 gap-8 overflow-hidden">
        {/* Left Side - Editor Controls */}
        <div className="min-h-0 overflow-hidden flex flex-col lg:border-r bg-background/50">
          {view === "customize" ? (
            <DesignSettings />
          ) : (
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              orientation="horizontal"
              className="flex flex-col md:flex-row h-full"
            >
              {/* Mobile Horizontal Tab Bar */}
              <div className="md:hidden w-full border-b bg-muted/10 shrink-0 overflow-x-auto scrollbar-hide">
                <TabsList className="bg-transparent flex items-center justify-start p-2 gap-2 h-auto w-max rounded-none">
                  {EDITOR_TABS.map((tab) => (
                    <TabsTrigger
                      key={tab.id}
                      value={tab.id}
                      className="flex-col gap-1 px-3 py-2 h-auto text-xs font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all rounded-md min-w-17.5"
                    >
                      <tab.icon className="h-4 w-4 shrink-0 mb-1" />
                      <span className="truncate max-w-20">{tab.label}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {/* Desktop Vertical Sidebar */}
              <div className="hidden md:block w-40 lg:w-45 border-r h-full overflow-y-auto bg-muted/10 shrink-0">
                <TabsList className="bg-transparent flex flex-col items-stretch justify-start p-2 gap-1 h-auto w-full rounded-none">
                  {EDITOR_TABS.map((tab) => (
                    <TabsTrigger
                      key={tab.id}
                      value={tab.id}
                      className="justify-start gap-3 px-3 py-2.5 h-auto text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all w-full mb-1"
                    >
                      <tab.icon className="h-4 w-4 shrink-0" />
                      <span className="truncate">{tab.label}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {/* Content Area */}
              <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide bg-background">
                <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6 min-h-125 pb-20">
                  <TabsContent
                    value="basics"
                    className="mt-0 focus-visible:outline-none animate-in fade-in-50 duration-300"
                  >
                    <BasicsForm
                      data={currentResume.basics}
                      onChange={(basics) => updateCurrentResume({ basics })}
                    />
                  </TabsContent>

                  <TabsContent
                    value="work"
                    className="mt-0 focus-visible:outline-none animate-in fade-in-50 duration-300"
                  >
                    <WorkForm
                      data={currentResume.work}
                      onChange={(work) => updateCurrentResume({ work })}
                    />
                  </TabsContent>

                  <TabsContent
                    value="education"
                    className="mt-0 focus-visible:outline-none animate-in fade-in-50 duration-300"
                  >
                    <EducationForm
                      data={currentResume.education}
                      onChange={(education) =>
                        updateCurrentResume({ education })
                      }
                    />
                  </TabsContent>

                  <TabsContent
                    value="skills"
                    className="mt-0 focus-visible:outline-none animate-in fade-in-50 duration-300"
                  >
                    <SkillsForm
                      data={currentResume.skills}
                      onChange={(skills) => updateCurrentResume({ skills })}
                    />
                  </TabsContent>

                  <TabsContent
                    value="projects"
                    className="mt-0 focus-visible:outline-none animate-in fade-in-50 duration-300"
                  >
                    <ProjectsForm
                      data={currentResume.projects}
                      onChange={(projects) => updateCurrentResume({ projects })}
                    />
                  </TabsContent>

                  <TabsContent
                    value="match"
                    className="mt-0 focus-visible:outline-none animate-in fade-in-50 duration-300"
                  >
                    <JobMatcher resume={currentResume} />
                  </TabsContent>

                  <TabsContent
                    value="certificates"
                    className="mt-0 focus-visible:outline-none animate-in fade-in-50 duration-300"
                  >
                    <CertificatesForm
                      data={currentResume.certificates}
                      onChange={(certificates) =>
                        updateCurrentResume({ certificates })
                      }
                    />
                  </TabsContent>

                  <TabsContent
                    value="languages"
                    className="mt-0 focus-visible:outline-none animate-in fade-in-50 duration-300"
                  >
                    <LanguagesForm
                      data={currentResume.languages}
                      onChange={(languages) =>
                        updateCurrentResume({ languages })
                      }
                    />
                  </TabsContent>

                  <TabsContent
                    value="interests"
                    className="mt-0 focus-visible:outline-none animate-in fade-in-50 duration-300"
                  >
                    <InterestsForm
                      data={currentResume.interests}
                      onChange={(interests) =>
                        updateCurrentResume({ interests })
                      }
                    />
                  </TabsContent>

                  <TabsContent
                    value="publications"
                    className="mt-0 focus-visible:outline-none animate-in fade-in-50 duration-300"
                  >
                    <PublicationsForm
                      data={currentResume.publications}
                      onChange={(publications) =>
                        updateCurrentResume({ publications })
                      }
                    />
                  </TabsContent>

                  <TabsContent
                    value="awards"
                    className="mt-0 focus-visible:outline-none animate-in fade-in-50 duration-300"
                  >
                    <AwardsForm
                      data={currentResume.awards}
                      onChange={(awards) => updateCurrentResume({ awards })}
                    />
                  </TabsContent>

                  <TabsContent
                    value="references"
                    className="mt-0 focus-visible:outline-none animate-in fade-in-50 duration-300"
                  >
                    <ReferencesForm
                      data={currentResume.references}
                      onChange={(references) =>
                        updateCurrentResume({ references })
                      }
                    />
                  </TabsContent>

                  <TabsContent
                    value="custom"
                    className="mt-0 focus-visible:outline-none animate-in fade-in-50 duration-300"
                  >
                    <CustomForm
                      data={currentResume.custom}
                      onChange={(custom) => updateCurrentResume({ custom })}
                    />
                  </TabsContent>
                </div>
              </div>
            </Tabs>
          )}
        </div>

        {/* Right Side - Live Preview */}
        <div
          className={`lg:block ${
            view === "customize" ? "block" : "hidden"
          } overflow-y-auto py-6 md:py-8 pl-1`}
        >
          <div className="min-h-full">
            <div className="mb-4 pl-4 flex items-center justify-between lg:hidden">
              <h3 className="font-medium text-muted-foreground">
                Live Preview
              </h3>
            </div>
            <PDFPreview resume={currentResume} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default function EditorPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen flex items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <EditorContent />
    </Suspense>
  );
}
