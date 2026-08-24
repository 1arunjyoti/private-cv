import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import JSZip from "jszip";

const mockState = vi.hoisted(() => {
  const destroyMock = vi.fn().mockResolvedValue(undefined);
  return {
    destroyMock,
    numPages: 1,
    canvases: [] as { width: number; height: number }[],
    lib: {
      GlobalWorkerOptions: { workerSrc: "" },
      getDocument: () => ({
        promise: Promise.resolve({
          numPages: mockState_numPages(),
          getPage: async (pageNum: number) => ({
            getViewport: ({ scale }: { scale: number }) => ({
              width: 100 * scale,
              height: 141 * scale,
            }),
            render: () => ({ promise: Promise.resolve() }),
          }),
        }),
        destroy: destroyMock,
      }),
    },
  };
});

function mockState_numPages() {
  return mockState.numPages;
}

vi.mock("@/lib/pdfjs-loader", () => ({
  loadPdfJs: async () => mockState.lib,
}));

describe("exportPdfAsJpgs", () => {
  let clickedAnchors: { download: string }[];
  let createdBlobs: Blob[];

  const realCreate = document.createElement.bind(document);

  beforeEach(() => {
    vi.resetModules();
    mockState.destroyMock.mockClear();
    mockState.canvases = [];
    mockState.numPages = 1;

    clickedAnchors = [];
    createdBlobs = [];

    vi.spyOn(URL, "createObjectURL").mockImplementation((obj: Blob | MediaSource) => {
      createdBlobs.push(obj as Blob);
      return `blob:mock-${createdBlobs.length}`;
    });
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});

    vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
      if (tag === "canvas") {
        const canvas = {
          width: 0,
          height: 0,
          getContext: () => ({}),
          toBlob: (cb: (b: Blob | null) => void) =>
            cb(new Blob(["jpgdata"], { type: "image/jpeg" })),
        };
        mockState.canvases.push(canvas);
        return canvas as unknown as HTMLCanvasElement;
      }
      if (tag === "a") {
        const anchor = {
          href: "",
          download: "",
          click: () => clickedAnchors.push(anchor),
        };
        return anchor as unknown as HTMLAnchorElement;
      }
      return realCreate(tag as keyof HTMLElementTagNameMap);
    });
    vi.spyOn(document.body, "appendChild").mockImplementation(
      () => null as unknown as Node,
    );
    vi.spyOn(document.body, "removeChild").mockImplementation(
      () => null as unknown as Node,
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("downloads a single page directly as JPG without zipping", async () => {
    const { exportPdfAsJpgs } = await import("@/lib/pdf-utils");
    const pages = await exportPdfAsJpgs("blob:pdf", "resume");

    expect(pages).toBe(1);
    expect(clickedAnchors).toHaveLength(1);
    expect(clickedAnchors[0].download).toBe("resume.jpg");
    expect(createdBlobs[0].type).toBe("image/jpeg");
    expect(mockState.destroyMock).toHaveBeenCalledTimes(1);
  });

  it("streams every page into a single zip and releases canvases", async () => {
    mockState.numPages = 3;

    const { exportPdfAsJpgs } = await import("@/lib/pdf-utils");
    const progress: [number, number][] = [];
    const pages = await exportPdfAsJpgs("blob:pdf", "resume", {
      onProgress: (done, total) => progress.push([done, total]),
    });

    expect(pages).toBe(3);
    expect(progress).toEqual([
      [1, 3],
      [2, 3],
      [3, 3],
    ]);
    expect(clickedAnchors).toHaveLength(1);
    expect(clickedAnchors[0].download).toBe("resume.zip");

    // All three page canvases were created and released afterwards.
    expect(mockState.canvases).toHaveLength(3);
    for (const canvas of mockState.canvases) {
      expect(canvas.width).toBe(0);
      expect(canvas.height).toBe(0);
    }

    // The downloaded zip contains one JPEG per page with the right names.
    const zip = await JSZip.loadAsync(createdBlobs[0]);
    const names = Object.keys(zip.files).sort();
    expect(names).toEqual([
      "resume_page_1.jpg",
      "resume_page_2.jpg",
      "resume_page_3.jpg",
    ]);
    expect(mockState.destroyMock).toHaveBeenCalledTimes(1);
  });

  it("throws when the canvas context is unavailable and still destroys the document", async () => {
    vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
      if (tag === "canvas") {
        return {
          width: 0,
          height: 0,
          getContext: () => null,
          toBlob: vi.fn(),
        } as unknown as HTMLCanvasElement;
      }
      return realCreate(tag as keyof HTMLElementTagNameMap);
    });

    const { exportPdfAsJpgs } = await import("@/lib/pdf-utils");
    await expect(exportPdfAsJpgs("blob:pdf", "resume")).rejects.toThrow(
      "Failed to get canvas context",
    );
    expect(mockState.destroyMock).toHaveBeenCalledTimes(1);
  });
});
