"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Loader2,
} from "lucide-react";

interface PdfjsLib {
  GlobalWorkerOptions: { workerSrc: string };
  getDocument: (url: string) => {
    promise: Promise<{
      numPages: number;
      getPage: (pageNum: number) => Promise<{
        getViewport: (options: { scale: number }) => {
          width: number;
          height: number;
        };
        render: (options: {
          canvasContext: CanvasRenderingContext2D;
          viewport: { width: number; height: number };
        }) => { promise: Promise<void> };
      }>;
    }>;
  };
}

declare global {
  interface Window {
    pdfjsLib?: PdfjsLib;
  }
}

interface PDFImageViewerProps {
  url: string;
}

export function PDFImageViewer({ url }: PDFImageViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageImage, setPageImage] = useState<string | null>(null);
  const [pdfjsLib, setPdfjsLib] = useState<PdfjsLib | null>(null);

  const pdfDocRef = useRef<unknown>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Load PDF.js client-side and configure local worker once.
  useEffect(() => {
    let isMounted = true;

    const loadPdfJs = async () => {
      try {
        if (window.pdfjsLib) {
          window.pdfjsLib.GlobalWorkerOptions.workerSrc =
            "https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.530/build/pdf.worker.min.mjs";
          if (!isMounted) return;
          setPdfjsLib(window.pdfjsLib);
          return;
        }

        const pdfJsUrl =
          "https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.530/build/pdf.min.mjs";
        const loaded = (await import(
          /* webpackIgnore: true */ pdfJsUrl
        )) as unknown as PdfjsLib;
        loaded.GlobalWorkerOptions.workerSrc =
          "https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.530/build/pdf.worker.min.mjs";
        if (!isMounted) return;
        window.pdfjsLib = loaded;
        setPdfjsLib(loaded);
      } catch (err) {
        console.error("Failed to initialize PDF.js:", err);
        if (!isMounted) return;
        setError("Failed to initialize PDF preview.");
        setIsLoading(false);
      }
    };

    loadPdfJs();

    return () => {
      isMounted = false;
    };
  }, []);

  // Load PDF document once pdfjs is ready
  useEffect(() => {
    if (!pdfjsLib) return;

    let isMounted = true;

    const loadPDF = async () => {
      try {
        setIsLoading(true);
        setError(null);
        setPageImage(null); // Clear old image
        setNumPages(0); // Reset pages
        setPageNumber(1); // Reset to page 1

        const pdf = await pdfjsLib.getDocument(url).promise;

        if (!isMounted) return;

        pdfDocRef.current = pdf;
        setNumPages(pdf.numPages);
        // Don't set isLoading to false here - renderPage will do it
      } catch (err) {
        console.error("Failed to load PDF:", err);
        if (isMounted) {
          setError("Failed to load PDF. Please try regenerating.");
          setIsLoading(false);
        }
      }
    };

    loadPDF();

    return () => {
      isMounted = false;
    };
  }, [url, pdfjsLib]);

  // Render current page to canvas and convert to image
  const renderPage = useCallback(async () => {
    const pdf = pdfDocRef.current as {
      getPage: (pageNum: number) => Promise<{
        getViewport: (options: { scale: number }) => {
          width: number;
          height: number;
        };
        render: (options: {
          canvasContext: CanvasRenderingContext2D;
          viewport: { width: number; height: number };
        }) => { promise: Promise<void> };
      }>;
    } | null;

    if (!pdf || pageNumber < 1 || pageNumber > numPages) return;

    try {
      setIsLoading(true);

      const page = await pdf.getPage(pageNumber);
      // Render at a stable high DPI and apply visual zoom via CSS transform.
      const viewport = page.getViewport({ scale: 2.0 });

      if (!canvasRef.current) {
        canvasRef.current = document.createElement("canvas");
      }
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      if (!context) {
        throw new Error("Could not get canvas context");
      }

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({
        canvasContext: context,
        viewport: viewport,
      }).promise;

      const imageUrl = canvas.toDataURL("image/png");
      setPageImage(imageUrl);
      setIsLoading(false);
    } catch (err) {
      console.error("Failed to render page:", err);
      setError("Failed to render page.");
      setIsLoading(false);
    }
  }, [pageNumber, numPages]);

  // Re-render when page or scale changes
  useEffect(() => {
    if (numPages > 0) {
      renderPage();
    }
  }, [numPages, pageNumber, renderPage]);

  const goToPrevPage = () => {
    setPageNumber((prev) => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setPageNumber((prev) => Math.min(prev + 1, numPages));
  };

  const zoomIn = () => {
    setScale((prev) => Math.min(prev + 0.25, 2.0));
  };

  const zoomOut = () => {
    setScale((prev) => Math.max(prev - 0.25, 0.5));
  };

  if (error) {
    return <div className="text-center text-destructive py-8">{error}</div>;
  }

  return (
    <div className="flex flex-col">
      {/* PDF Controls - Pagination & Zoom */}
      {numPages > 0 && (
        <div className="flex items-center justify-between p-2 mb-2 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={goToPrevPage}
              disabled={pageNumber <= 1 || isLoading}
              className="h-8 w-8"
              aria-label="Previous Page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground min-w-20 text-center">
              Page {pageNumber} of {numPages}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={goToNextPage}
              disabled={pageNumber >= numPages || isLoading}
              className="h-8 w-8"
              aria-label="Next Page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={zoomOut}
              disabled={scale <= 0.5 || isLoading}
              className="h-8 w-8"
              aria-label="Zoom Out"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <div className="flex items-center">
              <Input
                type="number"
                min={50}
                max={200}
                step={25}
                value={Math.round(scale * 100)}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (!isNaN(val)) {
                    setScale(Math.max(0.5, Math.min(2.0, val / 100)));
                  }
                }}
                className="w-16 h-8 text-center px-1 py-0 border-none bg-transparent focus-visible:ring-0 after:content-['%']"
                name="zoom"
                autoComplete="off"
                aria-label="Zoom Level Percentage"
              />
              <span className="text-sm text-muted-foreground -ml-2 mr-2">
                %
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={zoomIn}
              disabled={scale >= 2.0 || isLoading}
              className="h-8 w-8"
              aria-label="Zoom In"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <div className="flex justify-center items-start min-h-100 overflow-auto">
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}
        {!isLoading && pageImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={pageImage}
            alt={`Page ${pageNumber}`}
            className="rounded-lg shadow-lg h-auto max-w-none"
            style={{
              width: "100%",
              maxWidth: "800px",
              transform: `scale(${scale})`,
              transformOrigin: "top center",
            }}
          />
        )}
      </div>
    </div>
  );
}
