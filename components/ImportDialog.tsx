"use client";

import { useState, useCallback, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  FileUp,
  FileText,
  FileJson,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { importService, type ImportResult } from "@/lib/import";

interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportComplete: (result: ImportResult) => void;
}

export function ImportDialog({
  open,
  onOpenChange,
  onImportComplete,
}: ImportDialogProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      setIsProcessing(true);

      try {
        const result = await importService.importFromFile(file);

        if (result.success) {
          onImportComplete(result);
          onOpenChange(false);
        } else {
          const errorMessage = result.errors.join(". ");
          // Provide helpful suggestions for common errors
          if (errorMessage.toLowerCase().includes("pdf")) {
            setError(
              `${errorMessage}. PDF files may be encrypted, image-based, or corrupted. Try converting to DOCX or using a different file.`,
            );
          } else {
            setError(errorMessage);
          }
        }
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Failed to process file";
        console.error("Import error:", err);

        // Provide more helpful error messages
        if (errorMsg.toLowerCase().includes("defineProperty")) {
          setError(
            "Browser compatibility issue with PDF parsing. Please try uploading a DOCX file instead, or try a different browser (Chrome/Firefox recommended).",
          );
        } else if (errorMsg.toLowerCase().includes("pdf")) {
          setError(
            `${errorMsg}. Try converting your PDF to DOCX format for better results.`,
          );
        } else {
          setError(errorMsg);
        }
      } finally {
        setIsProcessing(false);
      }
    },
    [onImportComplete, onOpenChange],
  );

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        handleFile(file);
      }
      // Reset input value to allow selecting same file again
      event.target.value = "";
    },
    [handleFile],
  );

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      setIsDragging(false);

      const file = event.dataTransfer.files?.[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile],
  );

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileUp className="h-5 w-5" />
            Import Resume
          </DialogTitle>
          <DialogDescription>
            Upload your existing resume in PDF, DOCX, or JSON format. We&apos;ll
            extract the data and fill in the forms for you.
          </DialogDescription>
        </DialogHeader>

        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".pdf,.docx,.json,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/json"
          onChange={handleFileChange}
        />

        {/* Drop zone */}
        <div
          className={cn(
            "relative border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-muted-foreground/50",
            isProcessing && "pointer-events-none opacity-50",
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          {isProcessing ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Processing your resume...
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <Upload className="h-10 w-10 text-muted-foreground" />
              <div>
                <p className="font-medium">Drag and drop your resume here</p>
                <p className="text-sm text-muted-foreground mt-1">
                  or click to browse
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Supported formats */}
        <div className="flex justify-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <FileText className="h-4 w-4" />
            <div className="flex items-center gap-2">
              <span>PDF</span>
              <span className="text-xs font-medium text-muted-foreground bg-muted-foreground/10 rounded-full px-2 py-0.5">
                Beta
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <FileText className="h-4 w-4" />
            <div className="flex items-center gap-2">
              <span>DOCX</span>
              <span className="text-xs font-medium text-muted-foreground bg-muted-foreground/10 rounded-full px-2 py-0.5">
                Beta
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <FileJson className="h-4 w-4" />
            <span>JSON</span>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Notes */}
        <div className="space-y-2 text-xs text-muted-foreground">
          <p className="flex items-start gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 shrink-0 text-green-500" />
            <span>
              <strong>PDF/DOCX:</strong> We&apos;ll automatically extract
              and organize your resume sections. Results may vary based on
              formatting.
            </span>
          </p>
          <p className="flex items-start gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 shrink-0 text-green-500" />
            <span>
              <strong>JSON (Recommended):</strong> Perfect results with JSON
              Resume format or files exported from this app.
            </span>
          </p>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button onClick={handleClick} disabled={isProcessing}>
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Processing...
              </>
            ) : (
              <>
                <FileUp className="h-4 w-4" />
                Select File
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
