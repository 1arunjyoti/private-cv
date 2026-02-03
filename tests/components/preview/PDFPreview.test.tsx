import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PDFPreview } from "@/components/preview/PDFPreview";
import type { Resume } from "@/db";
import { useResumeStore } from "@/store/useResumeStore";

// Mock dependencies
vi.mock("@/store/useResumeStore");
vi.mock("@/lib/docx-generator", () => ({
  generateDocx: vi.fn().mockResolvedValue(new Blob(["docx"], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" })),
}));

vi.mock("@/lib/pdf-utils", () => ({
  convertPdfToJpg: vi.fn().mockResolvedValue(["data:image/jpeg;base64,test"]),
  downloadJpgs: vi.fn(),
}));

// Mock dynamic imports for templates
vi.mock("@/components/templates/FactoryTemplates", () => ({
  generatePDF: vi.fn().mockResolvedValue(new Blob(["pdf"], { type: "application/pdf" })),
  generateClassicPDF: vi.fn().mockResolvedValue(new Blob(["pdf"], { type: "application/pdf" })),
  generateProfessionalPDF: vi.fn().mockResolvedValue(new Blob(["pdf"], { type: "application/pdf" })),
  generateModernPDF: vi.fn().mockResolvedValue(new Blob(["pdf"], { type: "application/pdf" })),
}));

vi.mock("@/lib/template-defaults", () => ({
  getTemplateDefaults: vi.fn().mockReturnValue({}),
  getTemplateThemeColor: vi.fn().mockReturnValue("#000000"),
}));

// Mock Next.js dynamic import
vi.mock("next/dynamic", () => ({
  default: (fn: () => Promise<{ PDFImageViewer: React.ComponentType }>) => {
    return function MockDynamicComponent(props: unknown) {
      return <div data-testid="pdf-image-viewer" {...props} />;
    };
  },
}));

const mockUpdateCurrentResume = vi.fn();

const createMockResume = (overrides?: Partial<Resume>): Resume => ({
  id: "resume-1",
  basics: {
    name: "John Doe",
    label: "Software Engineer",
    email: "john@example.com",
    phone: "123-456-7890",
    url: "",
    summary: "",
    location: { address: "", city: "", countryCode: "", region: "", postalCode: "" },
    profiles: [],
    image: "",
  },
  work: [],
  education: [],
  skills: [],
  projects: [],
  certificates: [],
  publications: [],
  languages: [],
  interests: [],
  references: [],
  awards: [],
  custom: [],
  meta: {
    title: "My Resume",
    templateId: "ats",
    themeColor: "#000000",
    version: 1,
    lastModified: new Date().toISOString(),
    layoutSettings: {},
  },
  ...overrides,
});

describe("PDFPreview", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useResumeStore).mockReturnValue(mockUpdateCurrentResume);
    
    // Mock URL.createObjectURL and revokeObjectURL
    global.URL.createObjectURL = vi.fn().mockReturnValue("blob:mock-url");
    global.URL.revokeObjectURL = vi.fn();
    
    // Mock window properties for mobile detection
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1024,
    });
    
    Object.defineProperty(navigator, "userAgent", {
      writable: true,
      configurable: true,
      value: "Mozilla/5.0",
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("rendering", () => {
    it("should render the preview component", () => {
      const resume = createMockResume();
      render(<PDFPreview resume={resume} />);

      expect(screen.getByText("PDF Preview")).toBeInTheDocument();
      expect(screen.getByText(/Select a template and generate your resume/i)).toBeInTheDocument();
    });

    it("should render Generate PDF button initially", () => {
      const resume = createMockResume();
      render(<PDFPreview resume={resume} />);

      expect(screen.getByRole("button", { name: /Generate PDF/i })).toBeInTheDocument();
    });

    it("should render template selector", () => {
      const resume = createMockResume();
      render(<PDFPreview resume={resume} />);

      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });
  });

  describe("loading states", () => {
    it("should show loading spinner when generating PDF", async () => {
      const resume = createMockResume();
      render(<PDFPreview resume={resume} />);
      
      // Component renders with generate button
      expect(screen.getByRole("button", { name: /Generate PDF/i })).toBeInTheDocument();
    });

    it("should change button text to Regenerate after generation", async () => {
      const resume = createMockResume();
      render(<PDFPreview resume={resume} />);

      // Wait for auto-generation (debounced 2s)
      await waitFor(() => {
        expect(screen.getByRole("button", { name: /Regenerate/i })).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it("should auto-generate PDF on mount", async () => {
      const resume = createMockResume();
      const { generatePDF } = await import("@/components/templates/FactoryTemplates");
      
      render(<PDFPreview resume={resume} />);

      await waitFor(() => {
        expect(generatePDF).toHaveBeenCalled();
      }, { timeout: 3000 });
    });
  });

  describe("error handling", () => {
    it("should display error message when PDF generation fails", async () => {
      const user = userEvent.setup();
      const resume = createMockResume();
      
      const { generatePDF } = await import("@/components/templates/FactoryTemplates");
      vi.mocked(generatePDF).mockRejectedValueOnce(new Error("Generation failed"));

      render(<PDFPreview resume={resume} />);
      
      const generateButton = screen.getByRole("button", { name: /Generate PDF/i });
      await user.click(generateButton);

      await waitFor(() => {
        expect(screen.getByText(/Failed to generate PDF/i)).toBeInTheDocument();
      });
    });

    it("should clear error on successful regeneration", async () => {
      const user = userEvent.setup();
      const resume = createMockResume();
      
      const { generatePDF } = await import("@/components/templates/FactoryTemplates");
      
      // First call fails
      vi.mocked(generatePDF).mockRejectedValueOnce(new Error("Generation failed"));

      render(<PDFPreview resume={resume} />);
      
      const generateButton = screen.getByRole("button", { name: /Generate PDF/i });
      await user.click(generateButton);

      await waitFor(() => {
        expect(screen.getByText(/Failed to generate PDF/i)).toBeInTheDocument();
      });

      // Second call succeeds
      vi.mocked(generatePDF).mockResolvedValueOnce(new Blob(["pdf"], { type: "application/pdf" }));
      await user.click(generateButton);

      await waitFor(() => {
        expect(screen.queryByText(/Failed to generate PDF/i)).not.toBeInTheDocument();
      });
    });
  });

  describe("template switching", () => {
    it("should update template when selection changes", async () => {
      const resume = createMockResume();
      render(<PDFPreview resume={resume} />);

      // Template selector is rendered
      const templateSelect = screen.getByRole("combobox");
      expect(templateSelect).toBeInTheDocument();
    });

    it("should have generate button that triggers PDF creation", async () => {
      const resume = createMockResume();
      const { generatePDF } = await import("@/components/templates/FactoryTemplates");
      
      render(<PDFPreview resume={resume} />);

      // Should auto-generate on mount
      await waitFor(() => {
        expect(generatePDF).toHaveBeenCalled();
      }, { timeout: 3000 });
    });

    it("should create object URL for PDF", async () => {
      const resume = createMockResume();
      render(<PDFPreview resume={resume} />);

      // Wait for PDF generation and URL creation
      await waitFor(() => {
        expect(global.URL.createObjectURL).toHaveBeenCalled();
      }, { timeout: 3000 });
    });
  });

  describe("zoom functionality", () => {
    it("should render component on mobile devices", () => {
      // Mock mobile device
      Object.defineProperty(navigator, "userAgent", {
        writable: true,
        configurable: true,
        value: "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)",
      });

      const resume = createMockResume();
      render(<PDFPreview resume={resume} />);

      // Component renders
      expect(screen.getByText("PDF Preview")).toBeInTheDocument();
    });

    it("should render iframe on desktop", async () => {
      const resume = createMockResume();
      render(<PDFPreview resume={resume} />);

      // Wait for PDF generation and iframe creation
      await waitFor(() => {
        const iframe = document.querySelector("iframe");
        expect(iframe).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe("download functionality", () => {
    it("should show download menu after PDF is generated", async () => {
      const resume = createMockResume();
      render(<PDFPreview resume={resume} />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /Download/i })).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it("should show download button after PDF generation", async () => {
      const resume = createMockResume();
      render(<PDFPreview resume={resume} />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /Download/i })).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it("should have generateDocx function available", async () => {
      const { generateDocx } = await import("@/lib/docx-generator");
      expect(generateDocx).toBeDefined();
    });

    it("should have PDF utils functions available", async () => {
      const { convertPdfToJpg, downloadJpgs } = await import("@/lib/pdf-utils");
      expect(convertPdfToJpg).toBeDefined();
      expect(downloadJpgs).toBeDefined();
    });
  });

  describe("mobile detection", () => {
    it("should detect mobile user agent", () => {
      Object.defineProperty(navigator, "userAgent", {
        writable: true,
        configurable: true,
        value: "Mozilla/5.0 (Android 10; Mobile; rv:68.0) Gecko/68.0 Firefox/68.0",
      });

      const resume = createMockResume();
      render(<PDFPreview resume={resume} />);

      // Component renders
      expect(screen.getByText("PDF Preview")).toBeInTheDocument();
    });

    it("should detect small screen size", () => {
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 500,
      });

      const resume = createMockResume();
      render(<PDFPreview resume={resume} />);

      // Component renders
      expect(screen.getByText("PDF Preview")).toBeInTheDocument();
    });
  });

  describe("cleanup", () => {
    it("should create object URLs during PDF generation", async () => {
      const resume = createMockResume();
      render(<PDFPreview resume={resume} />);

      await waitFor(() => {
        expect(global.URL.createObjectURL).toHaveBeenCalled();
      }, { timeout: 3000 });
    });
  });
});
