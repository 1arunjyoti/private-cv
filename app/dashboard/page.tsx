"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Plus, Loader2 } from "lucide-react";

import { useResumeStore } from "@/store/useResumeStore";
import { ResumeCard } from "@/components/dashboard/ResumeCard";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import type { Resume } from "@/db";

export default function DashboardPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getAllResumes = useResumeStore((state) => state.getAllResumes);
  const deleteResume = useResumeStore((state) => state.deleteResume);
  const duplicateResume = useResumeStore((state) => state.duplicateResume);

  const loadResumes = useCallback(async () => {
    setIsLoading(true);
    try {
      const all = await getAllResumes();
      setResumes(all);
    } finally {
      setIsLoading(false);
    }
  }, [getAllResumes]);

  useEffect(() => {
    loadResumes();
  }, [loadResumes]);

  const handleDelete = async (id: string) => {
    await deleteResume(id);
    loadResumes(); // Refresh list
  };

  const handleDuplicate = async (resume: Resume) => {
    await duplicateResume(resume);
    loadResumes();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 landing-container mx-auto px-4 pt-28 pb-8 md:pt-32 md:pb-12">
        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">My Resumes</h1>
              <p className="text-muted-foreground">
                Manage your created resumes here.
              </p>
            </div>
            <Button asChild>
              <Link href="/templates">
                <Plus className="h-4 w-4" />
                New Resume
              </Link>
            </Button>
          </div>

          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : resumes.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center animate-in fade-in-50">
              <h3 className="mt-4 text-lg font-semibold">No resumes yet</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Get started by choosing a template.
              </p>
              <Button asChild>
                <Link href="/templates">Create your first resume</Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
              {resumes.map((resume) => (
                <ResumeCard
                  key={resume.id}
                  resume={resume}
                  onDelete={handleDelete}
                  onDuplicate={handleDuplicate}
                />
              ))}

              {/* Add New Card Slot */}
              <Link
                href="/templates"
                className="group relative flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed p-8 hover:border-primary/50 hover:bg-muted/50 transition-all"
              >
                <div className="rounded-full bg-muted p-4 group-hover:bg-primary/10 transition-colors">
                  <Plus className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <p className="font-medium text-muted-foreground group-hover:text-foreground">
                  Create New
                </p>
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
