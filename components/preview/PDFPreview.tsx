"use client";

import { useCallback, useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Loader2,
  Download,
  Palette,
  FileType,
  ChevronDown,
  Image as ImageIcon,
} from "lucide-react";
import type { Resume } from "@/db";
import { useResumeStore } from "@/store/useResumeStore";
import dynamic from "next/dynamic";

import { type TemplateType } from "@/lib/constants";
import { templates } from "@/lib/templates-data";
import { generateDocx } from "@/lib/docx-generator";
import {
  getTemplateDefaults,
  getTemplateThemeColor,
} from "@/lib/template-defaults";
import type { LayoutSettings } from "@/db";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Dynamically import PDFImageViewer for mobile (avoids SSR issues)
const PDFImageViewer = dynamic(
  () => import("./PDFImageViewer").then((mod) => mod.PDFImageViewer),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    ),
  },
);

// Dynamically import PDF generation to avoid SSR issues
const templateRegistry = {
  classic: () =>
    import("@/components/templates/FactoryTemplates").then(
      (m) => m.generateClassicPDF,
    ),
  professional: () =>
    import("@/components/templates/FactoryTemplates").then(
      (m) => m.generateProfessionalPDF,
    ),
  "classic-slate": () =>
    import("@/components/templates/FactoryTemplates").then(
      (m) => m.generateClassicSlatePDF,
    ),
  creative: () =>
    import("@/components/templates/FactoryTemplates").then(
      (m) => m.generateCreativePDF,
    ),
  glow: () =>
    import("@/components/templates/FactoryTemplates").then(
      (m) => m.generateGlowPDF,
    ),

  developer: () =>
    import("@/components/templates/FactoryTemplates").then(
      (m) => m.generateDeveloperPDF,
    ),
  developer2: () =>
    import("@/components/templates/FactoryTemplates").then(
      (m) => m.generateDeveloper2PDF,
    ),
  ats: () =>
    import("@/components/templates/FactoryTemplates").then(
      (m) => m.generatePDF,
    ),
  modern: () =>
    import("@/components/templates/FactoryTemplates").then(
      (m) => m.generateModernPDF,
    ),
  elegant: () =>
    import("@/components/templates/FactoryTemplates").then(
      (m) => m.generateElegantPDF,
    ),
  multicolumn: () =>
    import("@/components/templates/FactoryTemplates").then(
      (m) => m.generateMulticolumnPDF,
    ),
  stylish: () =>
    import("@/components/templates/FactoryTemplates").then(
      (m) => m.generateStylishPDF,
    ),
  timeline: () =>
    import("@/components/templates/FactoryTemplates").then(
      (m) => m.generateTimelinePDF,
    ),
  polished: () =>
    import("@/components/templates/FactoryTemplates").then(
      (m) => m.generatePolishedPDF,
    ),
} as const;

const generatePDFAsync = async (
  resume: Resume,
  template: TemplateType,
): Promise<Blob> => {
  const loader =
    templateRegistry[template as keyof typeof templateRegistry] ||
    templateRegistry.ats;
  const generateFn = await loader();
  return await generateFn(resume);
};

interface PDFPreviewProps {
  resume: Resume;
}

export function PDFPreview({ resume }: PDFPreviewProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Ref to track usage to avoid re-dependency loop
  const pdfUrlRef = useRef<string | null>(null);
  const generationRequestRef = useRef(0);

  // Initialize from resume meta, defaulting to 'ats'
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>(
    (resume.meta.templateId as TemplateType) || "ats",
  );

  // Use selector for updateCurrentResume to avoid re-renders on any store change
  const updateCurrentResume = useResumeStore(
    (state) => state.updateCurrentResume,
  );

  // Detect mobile device on client side
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor;
      const isMobileDevice =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          userAgent,
        );
      const isSmallScreen = window.innerWidth < 768;
      setIsMobile(isMobileDevice || isSmallScreen);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Sync internal state if resume prop changes (e.g. fresh load)
  useEffect(() => {
    if (resume.meta.templateId) {
      setSelectedTemplate(resume.meta.templateId as TemplateType);
    }
  }, [resume.meta.templateId]);

  const handleGenerate = useCallback(async () => {
    const requestId = ++generationRequestRef.current;
    setIsGenerating(true);
    setError(null);

    try {
      const blob = await generatePDFAsync(resume, selectedTemplate);
      const url = URL.createObjectURL(blob);

      if (requestId !== generationRequestRef.current) {
        URL.revokeObjectURL(url);
        return;
      }

      // Cleanup previous URL using ref
      if (pdfUrlRef.current) {
        URL.revokeObjectURL(pdfUrlRef.current);
      }

      pdfUrlRef.current = url;
      setPdfUrl(url);
    } catch (err) {
      if (requestId !== generationRequestRef.current) return;
      console.error("PDF generation error:", err);
      setError("Failed to generate PDF. Please try again.");
    } finally {
      if (requestId !== generationRequestRef.current) return;
      setIsGenerating(false);
    }
  }, [resume, selectedTemplate]);

  // Debounced auto-generation (2s delay to reduce CPU usage during typing)
  useEffect(() => {
    const timer = setTimeout(() => {
      handleGenerate();
    }, 2000);

    return () => clearTimeout(timer);
  }, [resume, selectedTemplate, handleGenerate]);

  const handleTemplateChange = (id: TemplateType) => {
    generationRequestRef.current += 1;
    setSelectedTemplate(id);
    // Reset preview
    setPdfUrl(null);
    if (pdfUrlRef.current) {
      URL.revokeObjectURL(pdfUrlRef.current);
      pdfUrlRef.current = null;
    }

    // Get template-specific defaults
    const templateDefaults = getTemplateDefaults(id);
    const themeColor = getTemplateThemeColor(id);

    // Persist change with template defaults
    updateCurrentResume({
      meta: {
        ...resume.meta,
        templateId: id,
        themeColor,
        layoutSettings: templateDefaults as LayoutSettings,
      },
    });
  };

  useEffect(() => {
    return () => {
      generationRequestRef.current += 1;
      if (pdfUrlRef.current) {
        URL.revokeObjectURL(pdfUrlRef.current);
        pdfUrlRef.current = null;
      }
    };
  }, []);

  const handleDownload = useCallback(() => {
    if (!pdfUrl) return;
    const a = document.createElement("a");
    a.href = pdfUrl;
    a.download = `${resume.meta.title || "resume"}.pdf`;
    a.click();
  }, [pdfUrl, resume.meta.title]);

  const handleDownloadDocx = useCallback(async () => {
    try {
      const blob = await generateDocx(resume);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${resume.meta.title || "resume"}.docx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("DOCX generation error:", err);
    }
  }, [resume]);

  const handleDownloadJpg = useCallback(async () => {
    try {
      if (!pdfUrl) return;
      const { convertPdfToJpg, downloadJpgs } = await import("@/lib/pdf-utils");
      const jpgUrls = await convertPdfToJpg(pdfUrl);
      downloadJpgs(jpgUrls, resume.meta.title || "resume");
    } catch (err) {
      console.error("Failed to download JPG", err);
    }
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
              <FileText className="h-4 w-4" />
            )}
            {pdfUrl ? "Regenerate" : "Generate PDF"}
          </Button>
          {pdfUrl && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm">
                  <Download className="h-4 w-4" />
                  Download
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={handleDownload}
                  className="cursor-pointer"
                >
                  <FileText className="h-4 w-4" />
                  Download PDF
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleDownloadDocx}
                  className="cursor-pointer"
                >
                  <FileType className="h-4 w-4" />
                  Download DOCX
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleDownloadJpg}
                  className="cursor-pointer"
                >
                  <ImageIcon className="h-4 w-4" />
                  Download JPG
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Template Selection */}
      <div className="flex items-center justify-between gap-4 p-4 border-b bg-muted/30">
        <div className="flex items-center gap-2 text-sm font-medium shrink-0 text-muted-foreground">
          <Palette className="h-4 w-4" />
          Current Template:
        </div>
        <div>
          <Select
            value={selectedTemplate}
            onValueChange={(value) =>
              handleTemplateChange(value as TemplateType)
            }
          >
            <SelectTrigger className="w-45 bg-background border-input shadow-sm">
              <SelectValue placeholder="Select a template" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(
                templates.reduce(
                  (acc, template) => {
                    const category = Array.isArray(template.category)
                      ? template.category[0]
                      : template.category;
                    if (!acc[category]) acc[category] = [];
                    acc[category].push(template);
                    return acc;
                  },
                  {} as Record<string, typeof templates>,
                ),
              ).map(([category, categoryTemplates]) => (
                <SelectGroup key={category}>
                  <SelectLabel>{category}</SelectLabel>
                  {categoryTemplates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex-1 bg-muted/50 p-4 overflow-auto">
        {error && (
          <div className="text-center text-destructive py-8">{error}</div>
        )}
        {!pdfUrl && !error && (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground min-h-100">
            <FileText className="h-16 w-16 mb-4 opacity-50" />
            <p>Click &quot;Generate PDF&quot; to preview your resume</p>
            <p className="text-sm mt-2">
              Selected:{" "}
              <strong>
                {templates.find((t) => t.id === selectedTemplate)?.name}
              </strong>
            </p>
          </div>
        )}
        {pdfUrl && isMobile && <PDFImageViewer url={pdfUrl} />}
        {pdfUrl && !isMobile && (
          <iframe
            src={pdfUrl}
            className="w-full h-full min-h-150 rounded-lg border bg-white"
            title="PDF Preview"
          />
        )}
      </div>
    </div>
  );
}
