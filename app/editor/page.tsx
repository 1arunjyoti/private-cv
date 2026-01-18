"use client";

import { useEffect, useState, useCallback, Suspense, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
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
  Palette,
  PenLine,
  FileUp,
  Info,
} from "lucide-react";
import Link from "next/link";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { ResetConfirmDialog } from "@/components/ResetConfirmDialog";
import { ATSScore } from "@/components/editor/ATSScore";

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

  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("basics");
  const [view, setView] = useState<"content" | "customize">("content");

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

  const handleImportJSON = useCallback(() => {
    fileInputRef.current?.click();
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

  const tabs = [
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

  return (
    <div className="h-screen overflow-hidden bg-background flex flex-col">
      <input
        type="file"
        accept=".json"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
      />
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
            <Link href="/">
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
              />
              <p className="text-xs text-muted-foreground hidden sm:block truncate">
                Last saved:{" "}
                {new Date(currentResume.meta.lastModified).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* View Toggle */}
            <div className="hidden sm:flex items-center gap-1 bg-muted p-1 rounded-lg mr-2 border">
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
                <Palette className="h-4 w-4" />
                Customize
              </Button>
            </div>

            {/* Desktop Actions */}
            <div className="hidden sm:flex items-center gap-2">
              <ATSScore resume={currentResume} />
              {process.env.NODE_ENV === "development" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleFillSampleData}
                  className="text-primary border-primary/30 hover:bg-primary/10"
                >
                  <Wand2 className="h-4 w-4" />
                  Fill Sample
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleImportJSON}
                className="text-primary border-primary/30 hover:bg-primary/10"
              >
                <FileUp className="h-4 w-4" />
                Import JSON
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportJSON}
                className="text-primary border-primary/30 hover:bg-primary/10"
              >
                <FileDown className="h-4 w-4" />
                Export JSON
              </Button>
              <Button
                size="sm"
                variant="ghost"
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
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-primary/30 hover:bg-primary/10"
                  >
                    <Info className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Disclaimer</DialogTitle>
                    <DialogDescription asChild>
                      <div className="text-muted-foreground text-sm">
                        <div className="mt-4">
                          <h2 className="font-semibold text-lg text-foreground">
                            How to save your resume data:
                          </h2>
                          <p className="mt-2">
                            1. Click on the <b>Save</b> button to save your
                            resume data to your browser&apos;s local storage.
                            <b>(Not recommended to use this method)</b>
                          </p>
                          <p className="mt-1">
                            2. <b>(Better)</b> Alternately, you can also export
                            your resume data as a JSON file.
                          </p>
                          <p className="mt-1">
                            3. Then import your resume data from the downloaded{" "}
                            <b>JSON</b> file.
                          </p>
                        </div>

                        <div className="mt-6 mb-2">
                          <h2 className="font-semibold text-lg text-foreground">
                            How to use the resume builder:
                          </h2>
                          <p className="mt-2">
                            1. Click on the <b>Content</b> button to edit your
                            resume content.
                          </p>
                          <p className="mt-1">
                            2. Click on the <b>Customize</b> button to customize
                            your resume.
                          </p>
                        </div>
                      </div>
                    </DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            </div>

            {/* Mobile Actions */}
            <div className="flex sm:hidden items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  setView(view === "content" ? "customize" : "content")
                }
              >
                {view === "content" ? (
                  <Palette className="h-5 w-5" />
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
                <SheetContent side="right">
                  <SheetHeader className="text-left border-b pb-4">
                    <SheetTitle>Editor Actions</SheetTitle>
                    <SheetDescription>
                      Export or reset your resume data.
                    </SheetDescription>
                  </SheetHeader>
                  <div className="flex flex-col gap-4 mt-4">
                    <Button
                      variant="outline"
                      className="justify-start text-foreground"
                      onClick={handleImportJSON}
                    >
                      <FileUp className="h-4 w-4 mr-2" />
                      Import JSON
                    </Button>
                    <Button
                      variant="outline"
                      className="justify-start text-foreground"
                      onClick={handleExportJSON}
                    >
                      <FileDown className="h-4 w-4 mr-2" />
                      Export JSON
                    </Button>
                    <ResetConfirmDialog
                      onConfirm={handleReset}
                      trigger={
                        <Button
                          variant="ghost"
                          className="justify-start text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                        >
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Reset All Data
                        </Button>
                      }
                    />
                    <div className="h-px bg-border my-2" />
                    <p className="text-xs text-muted-foreground font-medium px-2">
                      View Mode
                    </p>
                    <Button
                      variant={view === "content" ? "secondary" : "ghost"}
                      className="justify-start"
                      onClick={() => setView("content")}
                    >
                      <PenLine className="h-4 w-4 mr-2" />
                      Content Editor
                    </Button>
                    <Button
                      variant={view === "customize" ? "secondary" : "ghost"}
                      className="justify-start"
                      onClick={() => setView("customize")}
                    >
                      <Palette className="h-4 w-4 mr-2" />
                      Customize Design
                    </Button>
                    {/* Add more mobile menu items here if needed */}
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
        <div className="min-h-0 overflow-hidden flex flex-col border-r bg-background/50">
          {view === "customize" ? (
            <div className="h-full overflow-y-auto p-4 md:p-6 scrollbar-hide">
              <DesignSettings />
            </div>
          ) : (
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              orientation="vertical"
              className="flex-row h-full"
            >
              {/* Vertical Sidebar */}
              <div className="w-12.5 md:w-40 lg:w-45 border-r h-full overflow-y-auto bg-muted/10 shrink-0">
                <TabsList className="bg-transparent flex flex-col items-stretch justify-start p-2 gap-1 h-auto w-full rounded-none">
                  {tabs.map((tab) => (
                    <TabsTrigger
                      key={tab.id}
                      value={tab.id}
                      className="justify-center md:justify-start gap-3 px-2 md:px-3 py-2.5 h-auto text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all w-full mb-1"
                    >
                      <tab.icon className="h-4 w-4 shrink-0" />
                      <span className="hidden md:block truncate">
                        {tab.label}
                      </span>
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
            <div className="mb-4 flex items-center justify-between lg:hidden">
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
