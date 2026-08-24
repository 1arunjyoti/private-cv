import { loadPdfJs } from "@/lib/pdfjs-loader";

export interface ExportJpgOptions {
  /** Render scale; 2.0 ≈ 144 DPI. */
  scale?: number;
  /** JPEG quality (0-1). */
  quality?: number;
  /** Called after each rendered page. */
  onProgress?: (done: number, total: number) => void;
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function withExtension(filename: string, ext: string): string {
  return filename.toLowerCase().endsWith(ext) ? filename : `${filename}${ext}`;
}

/**
 * Convert a PDF blob URL to per-page JPG downloads.
 *
 * Single-page PDFs download directly as `<filename>.jpg`. Multi-page PDFs are
 * zipped as `<filename>.zip`. Pages are streamed into the zip one at a time
 * and each canvas backing store is released immediately, so peak memory stays
 * at roughly one page bitmap instead of every page's base64 payload combined.
 *
 * @returns The number of pages exported.
 */
export async function exportPdfAsJpgs(
  pdfUrl: string,
  filename: string,
  options: ExportJpgOptions = {},
): Promise<number> {
  const { scale = 2.0, quality = 0.95, onProgress } = options;
  const pdfjsLib = await loadPdfJs();

  const loadingTask = pdfjsLib.getDocument({ url: pdfUrl });
  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;

  try {
    let zip: import("jszip") | null = null;
    let singlePageBlob: Blob | null = null;

    if (numPages > 1) {
      const JSZip = (await import("jszip")).default;
      zip = new JSZip();
    }

    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale });

      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      if (!context) {
        throw new Error("Failed to get canvas context");
      }

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({
        canvasContext: context,
        viewport: viewport,
        canvas: canvas,
      }).promise;

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", quality),
      );

      if (!blob) {
        throw new Error(`Failed to encode page ${i} as JPEG`);
      }

      if (zip) {
        const base = withExtension(filename, ".zip").slice(0, -4);
        zip.file(`${base}_page_${i}.jpg`, blob);
      } else {
        singlePageBlob = blob;
      }

      // Release the backing bitmap promptly before rendering the next page.
      canvas.width = 0;
      canvas.height = 0;

      onProgress?.(i, numPages);
    }

    if (zip) {
      const content = await zip.generateAsync({ type: "blob" });
      downloadBlob(content, withExtension(filename, ".zip"));
    } else if (singlePageBlob) {
      downloadBlob(singlePageBlob, withExtension(filename, ".jpg"));
    }

    return numPages;
  } finally {
    // Free the parsed document and its worker resources.
    void loadingTask.destroy();
  }
}
