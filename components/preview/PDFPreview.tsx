"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Loader2, Download, Palette } from "lucide-react";
import type { Resume } from "@/db";
import { useResumeStore } from "@/store/useResumeStore";
import { useEffect } from "react";

type TemplateType = "ats" | "creative" | "modern" | "professional" | "elegant";

const TEMPLATES: { id: TemplateType; name: string; description: string }[] = [
  {
    id: "ats",
    name: "ATS Scanner",
    description: "Clean, single-column, ATS-friendly",
  },
  { id: "creative", name: "Creative", description: "Two-column with sidebar" },
  {
    id: "modern",
    name: "Modern",
    description: "Minimalist, typography-focused",
  },
  {
    id: "professional",
    name: "Professional",
    description: "Traditional serif, executive style",
  },
  {
    id: "elegant",
    name: "Elegant",
    description: "Sophisticated with full-width banner",
  },
];

// Dynamically import PDF generation to avoid SSR issues
const generatePDFAsync = async (
  resume: Resume,
  template: TemplateType
): Promise<Blob> => {
  if (template === "creative") {
    const { generateCreativePDF } = await import(
      "@/components/templates/CreativeTemplate"
    );
    return generateCreativePDF(resume);
  }
  if (template === "modern") {
    const { generateModernPDF } = await import(
      "@/components/templates/ModernTemplate"
    );
    return generateModernPDF(resume);
  }
  if (template === "professional") {
    const { generateProfessionalPDF } = await import(
      "@/components/templates/ProfessionalTemplate"
    );
    return generateProfessionalPDF(resume);
  }
  if (template === "elegant") {
    const { generateElegantPDF } = await import(
      "@/components/templates/ElegantTemplate"
    );
    return generateElegantPDF(resume);
  }
  const { generatePDF } = await import("@/components/templates/ATSTemplate");
  return generatePDF(resume);
};

interface PDFPreviewProps {
  resume: Resume;
}

export function PDFPreview({ resume }: PDFPreviewProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Initialize from resume meta, defaulting to 'ats'
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>(
    (resume.meta.templateId as TemplateType) || "ats"
  );

  const { updateCurrentResume } = useResumeStore();

  // Sync internal state if resume prop changes (e.g. fresh load)
  useEffect(() => {
    if (resume.meta.templateId) {
      setSelectedTemplate(resume.meta.templateId as TemplateType);
    }
  }, [resume.meta.templateId]);

  const handleTemplateChange = (id: TemplateType) => {
    setSelectedTemplate(id);
    setPdfUrl(null); // Reset preview
    // Persist change
    updateCurrentResume({
      meta: {
        ...resume.meta,
        templateId: id,
      },
    });
  };

  const handleGenerate = useCallback(async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const blob = await generatePDFAsync(resume, selectedTemplate);
      const url = URL.createObjectURL(blob);

      // Cleanup previous URL
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }

      setPdfUrl(url);
    } catch (err) {
      console.error("PDF generation error:", err);
      setError("Failed to generate PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  }, [resume, pdfUrl, selectedTemplate]);

  const handleDownload = useCallback(() => {
    if (!pdfUrl) return;
    const a = document.createElement("a");
    a.href = pdfUrl;
    a.download = `${resume.meta.title || "resume"}.pdf`;
    a.click();
  }, [pdfUrl, resume.meta.title]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border-b">
        <div>
          <h3 className="font-semibold">PDF Preview</h3>
          <p className="text-sm text-muted-foreground">
            Select a template and generate your resume
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <FileText className="h-4 w-4 mr-2" />
            )}
            {pdfUrl ? "Regenerate" : "Generate PDF"}
          </Button>
          {pdfUrl && (
            <Button size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          )}
        </div>
      </div>

      {/* Template Selection */}
      <div className="flex gap-4 p-4 border-b bg-muted/30 overflow-x-auto">
        <div className="flex items-center gap-2 text-sm font-medium shrink-0">
          <Palette className="h-4 w-4" />
          Template:
        </div>
        <div className="flex gap-2">
          {TEMPLATES.map((template) => (
            <button
              key={template.id}
              onClick={() => handleTemplateChange(template.id)}
              className={`px-3 py-1.5 text-sm rounded-md border transition-colors whitespace-nowrap ${
                selectedTemplate === template.id
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background hover:bg-muted border-border"
              }`}
            >
              {template.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 bg-muted/50 p-4 overflow-auto">
        {error && (
          <div className="text-center text-destructive py-8">{error}</div>
        )}
        {!pdfUrl && !error && (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground min-h-[400px]">
            <FileText className="h-16 w-16 mb-4 opacity-50" />
            <p>Click &quot;Generate PDF&quot; to preview your resume</p>
            <p className="text-sm mt-2">
              Selected:{" "}
              <strong>
                {TEMPLATES.find((t) => t.id === selectedTemplate)?.name}
              </strong>
            </p>
          </div>
        )}
        {pdfUrl && (
          <iframe
            src={pdfUrl}
            className="w-full h-full min-h-[600px] rounded-lg border bg-white"
            title="PDF Preview"
          />
        )}
      </div>
    </div>
  );
}
