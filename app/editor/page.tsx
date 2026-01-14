"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  BasicsForm,
  WorkForm,
  EducationForm,
  SkillsForm,
  ProjectsForm,
} from "@/components/forms";
import { PDFPreview } from "@/components/preview/PDFPreview";
import { JobMatcher } from "@/components/JobMatcher";
import { useResumeStore } from "@/store/useResumeStore";
import {
  User,
  Briefcase,
  GraduationCap,
  Wrench,
  FolderKanban,
  Save,
  FileDown,
  Loader2,
  ArrowLeft,
  FileText,
  Target,
  Menu,
  RotateCcw,
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

function EditorContent() {
  const searchParams = useSearchParams();
  const resumeId = searchParams.get("id");
  const templateParam = searchParams.get("template");

  const {
    currentResume,
    isLoading,
    error,
    loadResume,
    createNewResume,
    saveResume,
    updateCurrentResume,
    resetResume,
  } = useResumeStore();

  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("basics");

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
    if (
      window.confirm(
        "Are you sure you want to reset all data? This cannot be undone."
      )
    ) {
      resetResume();
    }
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
    { id: "preview", label: "Preview", icon: FileText },
    { id: "match", label: "Job Match", icon: Target },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
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
            {/* Desktop Actions */}
            <div className="hidden sm:flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportJSON}>
                <FileDown className="h-4 w-4 mr-2" />
                Export JSON
              </Button>
              <Button size="sm" onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save
              </Button>
            </div>

            {/* Mobile Actions */}
            <div className="flex sm:hidden items-center gap-1">
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
                      onClick={handleExportJSON}
                    >
                      <FileDown className="h-4 w-4 mr-2" />
                      Export JSON
                    </Button>
                    <Button
                      variant="ghost"
                      className="justify-start text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                      onClick={handleReset}
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Reset All Data
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
      <main className="flex-1 container mx-auto px-4 py-6 md:py-8 max-w-5xl">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          {/* Scrollable Tabs List */}
          <div className="sticky top-16 z-40 -mx-4 px-4 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 border-b pb-2 sm:static sm:bg-transparent sm:border-0 sm:p-0 sm:mx-0 overflow-x-auto scrollbar-hide">
            <TabsList className="w-full sm:w-auto inline-flex h-auto p-1 bg-muted/50 rounded-lg">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="shrink-0 gap-2 py-2 px-3 sm:px-4 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
                >
                  <tab.icon className="h-4 w-4" />
                  <span className="hidden md:inline">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <div className="min-h-[500px]">
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
                onChange={(education) => updateCurrentResume({ education })}
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
              value="preview"
              className="mt-0 focus-visible:outline-none animate-in fade-in-50 duration-300"
            >
              <PDFPreview resume={currentResume} />
            </TabsContent>

            <TabsContent
              value="match"
              className="mt-0 focus-visible:outline-none animate-in fade-in-50 duration-300"
            >
              <JobMatcher resume={currentResume} />
            </TabsContent>
          </div>
        </Tabs>
      </main>
    </div>
  );
}

export default function EditorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <EditorContent />
    </Suspense>
  );
}
