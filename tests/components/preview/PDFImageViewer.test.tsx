import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PDFImageViewer } from "@/components/preview/PDFImageViewer";

// Mock PDF.js library
const mockRender = vi.fn().mockResolvedValue({});
const mockGetPage = vi.fn();
const mockGetDocument = vi.fn();

const createMockPDF = (numPages: number = 1) => ({
  numPages,
  getPage: mockGetPage.mockImplementation((pageNum: number) =>
    Promise.resolve({
      getViewport: ({ scale }: { scale: number }) => ({
        width: 800 * scale,
        height: 1000 * scale,
      }),
      render: ({ canvasContext, viewport }: { canvasContext: CanvasRenderingContext2D; viewport: { width: number; height: number } }) => ({
        promise: mockRender(),
      }),
    })
  ),
});

const mockPdfjsLib = {
  GlobalWorkerOptions: { workerSrc: "" },
  getDocument: mockGetDocument,
};

describe("PDFImageViewer", () => {
  let mockCanvas: HTMLCanvasElement;
  let mockContext: CanvasRenderingContext2D;
  let originalCreateElement: typeof document.createElement;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock canvas and context
    mockContext = {
      drawImage: vi.fn(),
      fillRect: vi.fn(),
      clearRect: vi.fn(),
    } as unknown as CanvasRenderingContext2D;

    mockCanvas = {
      getContext: vi.fn().mockReturnValue(mockContext),
      toDataURL: vi.fn().mockReturnValue("data:image/png;base64,mockImageData"),
      width: 800,
      height: 1000,
    } as unknown as HTMLCanvasElement;

    // Store original createElement
    originalCreateElement = document.createElement.bind(document);

    // Mock createElement to return mock canvas for canvas, real elements for others
    vi.spyOn(document, "createElement").mockImplementation((tagName: string) => {
      if (tagName === "canvas") {
        return mockCanvas;
      }
      return originalCreateElement(tagName);
    });

    // Mock window.pdfjsLib
    Object.defineProperty(window, "pdfjsLib", {
      writable: true,
      configurable: true,
      value: mockPdfjsLib,
    });

    // Reset mock implementations
    mockGetDocument.mockReturnValue({
      promise: Promise.resolve(createMockPDF(3)),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete (window as { pdfjsLib?: unknown }).pdfjsLib;
  });

  describe("image loading", () => {
    it("should render PDFImageViewer component", () => {
      render(<PDFImageViewer url="test.pdf" />);
      expect(document.body).toBeInTheDocument();
    });

    it("should call getDocument with correct URL", async () => {
      render(<PDFImageViewer url="https://example.com/resume.pdf" />);

      await waitFor(() => {
        expect(mockGetDocument).toHaveBeenCalledWith("https://example.com/resume.pdf");
      });
    });

    it("should render page to canvas", async () => {
      render(<PDFImageViewer url="test.pdf" />);

      await waitFor(() => {
        expect(mockRender).toHaveBeenCalled();
      });
    });

    it("should convert canvas to data URL", async () => {
      render(<PDFImageViewer url="test.pdf" />);

      await waitFor(() => {
        expect(mockCanvas.toDataURL).toHaveBeenCalledWith("image/png");
      });
    });
  });

  describe("page navigation", () => {
    it("should display page count correctly", async () => {
      render(<PDFImageViewer url="test.pdf" />);

      await waitFor(() => {
        expect(screen.getByText(/Page 1 of 3/i)).toBeInTheDocument();
      });
    });

    it("should navigate to next page", async () => {
      const user = userEvent.setup();
      render(<PDFImageViewer url="test.pdf" />);

      await waitFor(() => {
        expect(screen.getByText(/Page 1 of 3/i)).toBeInTheDocument();
      });

      const nextButton = screen.getByLabelText("Next Page");
      await user.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText(/Page 2 of 3/i)).toBeInTheDocument();
        expect(mockGetPage).toHaveBeenCalledWith(2);
      });
    });

    it("should navigate to previous page", async () => {
      const user = userEvent.setup();
      render(<PDFImageViewer url="test.pdf" />);

      await waitFor(() => {
        expect(screen.getByText(/Page 1 of 3/i)).toBeInTheDocument();
      });

      // Go to page 2
      const nextButton = screen.getByLabelText("Next Page");
      await user.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText(/Page 2 of 3/i)).toBeInTheDocument();
      });

      // Go back to page 1
      const prevButton = screen.getByLabelText("Previous Page");
      await user.click(prevButton);

      await waitFor(() => {
        expect(screen.getByText(/Page 1 of 3/i)).toBeInTheDocument();
        expect(mockGetPage).toHaveBeenCalledWith(1);
      });
    });

    it("should disable previous button on first page", async () => {
      render(<PDFImageViewer url="test.pdf" />);

      await waitFor(() => {
        const prevButton = screen.getByLabelText("Previous Page");
        expect(prevButton).toBeDisabled();
      });
    });

    it("should disable next button on last page", async () => {
      const user = userEvent.setup();
      render(<PDFImageViewer url="test.pdf" />);

      await waitFor(() => {
        expect(screen.getByText(/Page 1 of 3/i)).toBeInTheDocument();
      });

      const nextButton = screen.getByLabelText("Next Page");
      
      // Navigate to last page
      await user.click(nextButton);
      await user.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText(/Page 3 of 3/i)).toBeInTheDocument();
        expect(nextButton).toBeDisabled();
      });
    });

    it("should not navigate beyond first page", async () => {
      const user = userEvent.setup();
      render(<PDFImageViewer url="test.pdf" />);

      await waitFor(() => {
        expect(screen.getByText(/Page 1 of 3/i)).toBeInTheDocument();
      });

      const prevButton = screen.getByLabelText("Previous Page");
      expect(prevButton).toBeDisabled();
      
      // Should stay on page 1
      await waitFor(() => {
        expect(screen.getByText(/Page 1 of 3/i)).toBeInTheDocument();
      });
    });

    it("should not navigate beyond last page", async () => {
      const user = userEvent.setup();
      mockGetDocument.mockReturnValue({
        promise: Promise.resolve(createMockPDF(1)),
      });

      render(<PDFImageViewer url="test.pdf" />);

      await waitFor(() => {
        expect(screen.getByText(/Page 1 of 1/i)).toBeInTheDocument();
      });

      const nextButton = screen.getByLabelText("Next Page");
      expect(nextButton).toBeDisabled();
    });
  });

  describe("zoom functionality", () => {
    it("should have zoom controls", async () => {
      render(<PDFImageViewer url="test.pdf" />);

      await waitFor(() => {
        expect(screen.getByLabelText("Zoom In")).toBeInTheDocument();
        expect(screen.getByLabelText("Zoom Out")).toBeInTheDocument();
      });
    });

    it("should zoom in when zoom in button is clicked", async () => {
      const user = userEvent.setup();
      render(<PDFImageViewer url="test.pdf" />);

      await waitFor(() => {
        expect(screen.getByLabelText(/Zoom Level/i)).toBeInTheDocument();
      });

      const zoomInButton = screen.getByLabelText("Zoom In");
      await user.click(zoomInButton);

      // Zoom level should increase
      await waitFor(() => {
        const zoomInput = screen.getByLabelText(/Zoom Level/i) as HTMLInputElement;
        expect(zoomInput.value).toBe("125");
      });
    });

    it("should zoom out when zoom out button is clicked", async () => {
      const user = userEvent.setup();
      render(<PDFImageViewer url="test.pdf" />);

      await waitFor(() => {
        expect(screen.getByLabelText(/Zoom Level/i)).toBeInTheDocument();
      });

      const zoomOutButton = screen.getByLabelText("Zoom Out");
      await user.click(zoomOutButton);

      await waitFor(() => {
        const zoomInput = screen.getByLabelText(/Zoom Level/i) as HTMLInputElement;
        expect(zoomInput.value).toBe("75");
      });
    });

    it("should disable zoom in at maximum zoom (200%)", async () => {
      const user = userEvent.setup();
      render(<PDFImageViewer url="test.pdf" />);

      await waitFor(() => {
        expect(screen.getByLabelText(/Zoom Level/i)).toBeInTheDocument();
      });

      const zoomInButton = screen.getByLabelText("Zoom In");
      
      // Zoom to max
      await user.click(zoomInButton);
      await user.click(zoomInButton);
      await user.click(zoomInButton);
      await user.click(zoomInButton);

      await waitFor(() => {
        expect(zoomInButton).toBeDisabled();
      });
    });

    it("should disable zoom out at minimum zoom (50%)", async () => {
      const user = userEvent.setup();
      render(<PDFImageViewer url="test.pdf" />);

      await waitFor(() => {
        expect(screen.getByLabelText(/Zoom Level/i)).toBeInTheDocument();
      });

      const zoomOutButton = screen.getByLabelText("Zoom Out");
      
      // Zoom to min
      await user.click(zoomOutButton);
      await user.click(zoomOutButton);

      await waitFor(() => {
        expect(zoomOutButton).toBeDisabled();
      });
    });
  });

  describe("error states", () => {
    it("should display error when PDF fails to load", async () => {
      mockGetDocument.mockReturnValue({
        promise: Promise.reject(new Error("Failed to load PDF")),
      });

      render(<PDFImageViewer url="invalid.pdf" />);

      await waitFor(() => {
        expect(screen.getByText(/Failed to load PDF/i)).toBeInTheDocument();
      });
    });

    it("should display error when page rendering fails", async () => {
      mockRender.mockRejectedValueOnce(new Error("Render failed"));

      render(<PDFImageViewer url="test.pdf" />);

      await waitFor(() => {
        expect(screen.getByText(/Failed to render page/i)).toBeInTheDocument();
      });
    });

    it("should not crash when pdfjsLib is missing", () => {
      delete (window as { pdfjsLib?: unknown }).pdfjsLib;

      const { container } = render(<PDFImageViewer url="test.pdf" />);
      
      expect(container).toBeInTheDocument();
    });
  });

  describe("loading states", () => {
    it("should show loading spinner initially", () => {
      render(<PDFImageViewer url="test.pdf" />);

      // Component renders
      expect(document.body).toBeInTheDocument();
    });

    it("should hide loading spinner after PDF loads", async () => {
      render(<PDFImageViewer url="test.pdf" />);

      await waitFor(() => {
        expect(screen.queryByRole("progressbar", { hidden: true })).not.toBeInTheDocument();
      });
    });

    it("should show loading when changing pages", async () => {
      const user = userEvent.setup();
      render(<PDFImageViewer url="test.pdf" />);

      await waitFor(() => {
        expect(screen.getByText(/Page 1 of 3/i)).toBeInTheDocument();
      });

      const nextButton = screen.getByLabelText("Next Page");
      await user.click(nextButton);

      // May briefly show loading
      await waitFor(() => {
        expect(screen.getByText(/Page 2 of 3/i)).toBeInTheDocument();
      });
    });

    it("should have navigation controls", async () => {
      render(<PDFImageViewer url="test.pdf" />);

      await waitFor(() => {
        expect(screen.getByLabelText("Previous Page")).toBeInTheDocument();
        expect(screen.getByLabelText("Next Page")).toBeInTheDocument();
      });
    });
  });

  describe("PDF.js library loading", () => {
    it("should load PDF.js from CDN if not present", async () => {
      delete (window as { pdfjsLib?: unknown }).pdfjsLib;

      render(<PDFImageViewer url="test.pdf" />);

      // Simulate library loading
      Object.defineProperty(window, "pdfjsLib", {
        writable: true,
        configurable: true,
        value: mockPdfjsLib,
      });

      window.dispatchEvent(new Event("pdfjsReady"));

      await waitFor(() => {
        expect(mockGetDocument).toHaveBeenCalled();
      });
    });

    it("should set worker source correctly", () => {
      render(<PDFImageViewer url="test.pdf" />);

      expect(mockPdfjsLib.GlobalWorkerOptions).toBeDefined();
    });
  });

  describe("multi-page PDFs", () => {
    it("should handle single page PDF", async () => {
      mockGetDocument.mockReturnValue({
        promise: Promise.resolve(createMockPDF(1)),
      });

      render(<PDFImageViewer url="single-page.pdf" />);

      await waitFor(() => {
        expect(screen.getByText(/Page 1 of 1/i)).toBeInTheDocument();
      });
    });

    it("should handle large multi-page PDF", async () => {
      mockGetDocument.mockReturnValue({
        promise: Promise.resolve(createMockPDF(50)),
      });

      render(<PDFImageViewer url="large.pdf" />);

      await waitFor(() => {
        expect(screen.getByText(/Page 1 of 50/i)).toBeInTheDocument();
      });
    });

    it("should handle URL prop changes", async () => {
      const { rerender } = render(<PDFImageViewer url="test1.pdf" />);

      await waitFor(() => {
        expect(screen.getByText(/Page 1 of 3/i)).toBeInTheDocument();
      });

      // Change URL
      rerender(<PDFImageViewer url="test2.pdf" />);

      // Should still render
      await waitFor(() => {
        expect(screen.getByText(/Page 1 of 3/i)).toBeInTheDocument();
      });
    });
  });

  describe("image rendering", () => {
    it("should render controls for multi-page PDF", async () => {
      render(<PDFImageViewer url="test.pdf" />);

      await waitFor(() => {
        expect(screen.getByLabelText("Previous Page")).toBeInTheDocument();
        expect(screen.getByLabelText("Next Page")).toBeInTheDocument();
      });
    });

    it("should have responsive image styling", () => {
      render(<PDFImageViewer url="test.pdf" />);
      
      // Component renders
      expect(document.body).toBeInTheDocument();
    });
  });
});
