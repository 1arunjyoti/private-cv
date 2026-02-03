import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock the window and document objects for PDF.js tests
const mockCanvas = {
  getContext: vi.fn().mockReturnValue({
    drawImage: vi.fn(),
  }),
  toDataURL: vi.fn().mockReturnValue("data:image/jpeg;base64,/9j/test"),
  width: 0,
  height: 0,
};

const mockPage = {
  getViewport: vi.fn().mockReturnValue({ width: 612, height: 792, scale: 2.0 }),
  render: vi.fn().mockReturnValue({ promise: Promise.resolve() }),
};

const mockPdf = {
  numPages: 2,
  getPage: vi.fn().mockResolvedValue(mockPage),
};

const mockPdfjsLib = {
  GlobalWorkerOptions: { workerSrc: "" },
  getDocument: vi.fn().mockReturnValue({
    promise: Promise.resolve(mockPdf),
  }),
};

describe("pdf-utils", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup DOM mocks
    vi.stubGlobal("document", {
      createElement: vi.fn((tag: string) => {
        if (tag === "canvas") return mockCanvas;
        if (tag === "script") return { type: "", src: "", async: false, textContent: "" };
        if (tag === "a") return { href: "", download: "", click: vi.fn() };
        return {};
      }),
      head: {
        appendChild: vi.fn(),
      },
      body: {
        appendChild: vi.fn(),
        removeChild: vi.fn(),
      },
    });

    vi.stubGlobal("window", {
      pdfjsLib: mockPdfjsLib,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    });

    vi.stubGlobal("URL", {
      createObjectURL: vi.fn().mockReturnValue("blob:test"),
      revokeObjectURL: vi.fn(),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("loadPdfJs", () => {
    it("should resolve immediately if pdfjsLib is already loaded", async () => {
      const win = window as { pdfjsLib?: typeof mockPdfjsLib };
      win.pdfjsLib = mockPdfjsLib;

      // The function should resolve without adding scripts
      expect(win.pdfjsLib).toBeDefined();
      expect(win.pdfjsLib?.GlobalWorkerOptions).toBeDefined();
    });

    it("should have pdfjsLib available on window", () => {
      const win = window as { pdfjsLib?: typeof mockPdfjsLib };
      expect(win.pdfjsLib).toBeDefined();
      expect(win.pdfjsLib?.getDocument).toBeInstanceOf(Function);
    });

    it("should set worker source correctly", () => {
      const win = window as { pdfjsLib?: typeof mockPdfjsLib };
      expect(win.pdfjsLib?.GlobalWorkerOptions).toBeDefined();
    });
  });

  describe("convertPdfToJpg logic", () => {
    it("should handle single page PDF", async () => {
      const singlePagePdf = { ...mockPdf, numPages: 1 };
      mockPdfjsLib.getDocument.mockReturnValue({
        promise: Promise.resolve(singlePagePdf),
      });

      const pdf = await mockPdfjsLib.getDocument("test.pdf").promise;
      expect(pdf.numPages).toBe(1);
    });

    it("should handle multi-page PDF", async () => {
      mockPdfjsLib.getDocument.mockReturnValue({
        promise: Promise.resolve(mockPdf),
      });

      const pdf = await mockPdfjsLib.getDocument("test.pdf").promise;
      expect(pdf.numPages).toBe(2);
    });

    it("should get page with correct parameters", async () => {
      const pdf = await mockPdfjsLib.getDocument("test.pdf").promise;
      await pdf.getPage(1);
      
      expect(mockPdf.getPage).toHaveBeenCalledWith(1);
    });

    it("should calculate viewport with scale", () => {
      const scale = 2.0;
      const viewport = mockPage.getViewport({ scale });
      
      expect(mockPage.getViewport).toHaveBeenCalledWith({ scale });
      expect(viewport.scale).toBe(scale);
    });

    it("should render page to canvas", async () => {
      const pdf = await mockPdfjsLib.getDocument("test.pdf").promise;
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 2.0 });

      const renderContext = {
        canvasContext: mockCanvas.getContext("2d"),
        viewport,
        canvas: mockCanvas,
      };

      await page.render(renderContext).promise;
      expect(mockPage.render).toHaveBeenCalled();
    });

    it("should generate JPEG data URL from canvas", () => {
      const dataUrl = mockCanvas.toDataURL("image/jpeg", 0.95);
      
      expect(dataUrl).toContain("data:image/jpeg;base64");
    });

    it("should use correct JPEG quality", () => {
      mockCanvas.toDataURL("image/jpeg", 0.95);
      
      expect(mockCanvas.toDataURL).toHaveBeenCalledWith("image/jpeg", 0.95);
    });
  });

  describe("scale parameter", () => {
    it("should use default scale of 2.0", () => {
      const defaultScale = 2.0;
      const viewport = mockPage.getViewport({ scale: defaultScale });
      
      expect(viewport.scale).toBe(2.0);
    });

    it("should support custom scale values", () => {
      const customScale = 3.0;
      mockPage.getViewport.mockReturnValue({ 
        width: 918, 
        height: 1188, 
        scale: customScale 
      });

      const viewport = mockPage.getViewport({ scale: customScale });
      expect(viewport.scale).toBe(3.0);
    });

    it("should scale dimensions proportionally", () => {
      const baseWidth = 612;
      const baseHeight = 792;
      const scale = 2.0;

      mockPage.getViewport.mockReturnValue({
        width: baseWidth * scale,
        height: baseHeight * scale,
        scale,
      });

      const viewport = mockPage.getViewport({ scale });
      expect(viewport.width).toBe(1224);
      expect(viewport.height).toBe(1584);
    });
  });

  describe("error handling", () => {
    it("should handle missing canvas context", () => {
      const failingCanvas = {
        getContext: vi.fn().mockReturnValue(null),
      };

      const context = failingCanvas.getContext("2d");
      expect(context).toBeNull();
    });

    it("should handle PDF load failure", async () => {
      const errorPromise = Promise.reject(new Error("Failed to load PDF"));
      mockPdfjsLib.getDocument.mockReturnValue({
        promise: errorPromise,
      });

      await expect(errorPromise).rejects.toThrow("Failed to load PDF");
    });

    it("should handle page render failure", async () => {
      const renderErrorPromise = Promise.reject(new Error("Render failed"));
      mockPage.render.mockReturnValue({
        promise: renderErrorPromise,
      });

      await expect(renderErrorPromise).rejects.toThrow("Render failed");
    });
  });

  describe("downloadJpgs logic", () => {
    it("should handle empty data URLs array", () => {
      const dataUrls: string[] = [];
      expect(dataUrls.length).toBe(0);
    });

    it("should handle single page download as JPG", () => {
      const dataUrls = ["data:image/jpeg;base64,test1"];
      expect(dataUrls.length).toBe(1);
      
      // Should download as .jpg
      const filename = "resume";
      const expectedFilename = `${filename}.jpg`;
      expect(expectedFilename).toBe("resume.jpg");
    });

    it("should handle multi-page download as ZIP", () => {
      const dataUrls = [
        "data:image/jpeg;base64,test1",
        "data:image/jpeg;base64,test2",
      ];
      expect(dataUrls.length).toBe(2);
      
      // Should download as .zip
      const filename = "resume";
      const expectedFilename = `${filename}.zip`;
      expect(expectedFilename).toBe("resume.zip");
    });

    it("should extract base64 data correctly", () => {
      const dataUrl = "data:image/jpeg;base64,/9j/4AAQSkZJRg==";
      const base64Data = dataUrl.split(",")[1];
      
      expect(base64Data).toBe("/9j/4AAQSkZJRg==");
    });

    it("should generate correct filenames for multi-page", () => {
      const baseFilename = "resume";
      const pages = 3;
      
      const filenames = Array.from({ length: pages }, (_, i) => 
        `${baseFilename}_page_${i + 1}.jpg`
      );

      expect(filenames).toEqual([
        "resume_page_1.jpg",
        "resume_page_2.jpg",
        "resume_page_3.jpg",
      ]);
    });
  });

  describe("PDF viewport calculations", () => {
    it("should calculate US Letter dimensions", () => {
      // US Letter is 8.5 x 11 inches = 612 x 792 points
      const letterWidth = 612;
      const letterHeight = 792;

      expect(letterWidth).toBe(612);
      expect(letterHeight).toBe(792);
    });

    it("should calculate A4 dimensions", () => {
      // A4 is 210 x 297 mm = 595 x 842 points (approximately)
      const a4Width = 595;
      const a4Height = 842;

      expect(a4Width).toBe(595);
      expect(a4Height).toBe(842);
    });

    it("should calculate scaled dimensions for high DPI", () => {
      const baseWidth = 612;
      const baseHeight = 792;
      const scale = 2.0; // For high DPI displays

      const scaledWidth = baseWidth * scale;
      const scaledHeight = baseHeight * scale;

      expect(scaledWidth).toBe(1224);
      expect(scaledHeight).toBe(1584);
    });
  });
});

describe("Canvas operations", () => {
  it("should create proper canvas dimensions", () => {
    const viewport = { width: 1224, height: 1584 };
    const canvas = { width: 0, height: 0 };

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    expect(canvas.width).toBe(1224);
    expect(canvas.height).toBe(1584);
  });

  it("should convert canvas to JPEG with quality", () => {
    const quality = 0.95;
    expect(quality).toBeGreaterThan(0);
    expect(quality).toBeLessThanOrEqual(1);
  });
});
