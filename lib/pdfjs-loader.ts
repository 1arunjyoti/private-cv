import type * as PdfJs from "pdfjs-dist";

type PdfJsModule = typeof import("pdfjs-dist");

let pdfjsPromise: Promise<PdfJsModule> | null = null;

/**
 * Load the locally bundled PDF.js build (no CDN, no SRI concerns).
 *
 * The resolved module is cached on `window.pdfjsLib`, which also serves as the
 * injection point used by tests to provide a mock implementation.
 */
export function loadPdfJs(): Promise<PdfJsModule> {
  const win = window as unknown as { pdfjsLib?: PdfJsModule };
  if (win.pdfjsLib) {
    return Promise.resolve(win.pdfjsLib);
  }

  if (!pdfjsPromise) {
    pdfjsPromise = import("pdfjs-dist").then((mod: PdfJsModule) => {
      mod.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/build/pdf.worker.min.mjs",
        import.meta.url,
      ).toString();
      win.pdfjsLib = mod;
      return mod;
    });
  }

  return pdfjsPromise;
}

export type { PdfJs, PdfJsModule };
