import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PublicationsForm } from "@/components/forms/PublicationsForm";
import type { Publication } from "@/db";

// Mock uuid
vi.mock("uuid", () => ({
  v4: vi.fn().mockReturnValue("mock-uuid-pub"),
}));

// Mock RichTextEditor
vi.mock("@/components/ui/RichTextEditor", () => ({
  RichTextEditor: ({ value, onChange, placeholder, id }: { value: string; onChange: (v: string) => void; placeholder?: string; id?: string }) => (
    <textarea
      data-testid="rich-text-editor"
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  ),
}));

describe("PublicationsForm", () => {
  const mockOnChange = vi.fn();

  const createPublication = (overrides?: Partial<Publication>): Publication => ({
    id: "pub-1",
    name: "Building Scalable Systems",
    publisher: "IEEE",
    releaseDate: "2024-03-15",
    url: "https://ieee.org/article/123",
    summary: "A paper on system design",
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("rendering", () => {
    it("should render empty state when no publications", () => {
      render(<PublicationsForm data={[]} onChange={mockOnChange} />);

      expect(screen.getByText(/no publications added/i)).toBeDefined();
    });

    it("should render the Publications heading", () => {
      render(<PublicationsForm data={[]} onChange={mockOnChange} />);

      expect(screen.getByText("Publications")).toBeDefined();
    });

    it("should render Add Publication button", () => {
      render(<PublicationsForm data={[]} onChange={mockOnChange} />);

      expect(screen.getByText("Add Publication")).toBeDefined();
    });

    it("should render publication entries", () => {
      const pubs = [createPublication()];
      render(<PublicationsForm data={pubs} onChange={mockOnChange} />);

      expect(screen.getByText("Building Scalable Systems")).toBeDefined();
    });

    it("should display New Publication for unnamed publications", () => {
      const pubs = [createPublication({ name: "" })];
      render(<PublicationsForm data={pubs} onChange={mockOnChange} />);

      expect(screen.getByText("New Publication")).toBeDefined();
    });
  });

  describe("adding publications", () => {
    it("should add a new publication when Add Publication is clicked", async () => {
      const user = userEvent.setup();
      render(<PublicationsForm data={[]} onChange={mockOnChange} />);

      await user.click(screen.getByText("Add Publication"));

      expect(mockOnChange).toHaveBeenCalledWith([
        expect.objectContaining({
          id: "mock-uuid-pub",
          name: "",
          publisher: "",
          releaseDate: "",
          url: "",
          summary: "",
        }),
      ]);
    });
  });

  describe("removing publications", () => {
    it("should remove a publication when delete button is clicked", async () => {
      const user = userEvent.setup();
      const pubs = [createPublication()];
      render(<PublicationsForm data={pubs} onChange={mockOnChange} />);

      const removeButton = screen.getByLabelText("Remove publication");
      await user.click(removeButton);

      expect(mockOnChange).toHaveBeenCalledWith([]);
    });
  });

  describe("updating publications", () => {
    it("should update publication name", async () => {
      const user = userEvent.setup();
      const pubs = [createPublication({ name: "" })];
      render(<PublicationsForm data={pubs} onChange={mockOnChange} />);

      const nameInput = screen.getByLabelText(/publication name/i);
      await user.type(nameInput, "New Title");

      expect(mockOnChange).toHaveBeenCalled();
    });

    it("should update publisher", async () => {
      const user = userEvent.setup();
      const pubs = [createPublication({ publisher: "" })];
      render(<PublicationsForm data={pubs} onChange={mockOnChange} />);

      const publisherInput = screen.getByLabelText(/publisher/i);
      await user.type(publisherInput, "Nature");

      expect(mockOnChange).toHaveBeenCalled();
    });

    it("should update release date", async () => {
      const user = userEvent.setup();
      const pubs = [createPublication({ releaseDate: "" })];
      render(<PublicationsForm data={pubs} onChange={mockOnChange} />);

      const dateInput = screen.getByLabelText(/release date/i);
      await user.type(dateInput, "2024-06-01");

      expect(mockOnChange).toHaveBeenCalled();
    });

    it("should update URL", async () => {
      const user = userEvent.setup();
      const pubs = [createPublication({ url: "" })];
      render(<PublicationsForm data={pubs} onChange={mockOnChange} />);

      const urlInput = screen.getByLabelText(/url/i);
      await user.type(urlInput, "https://example.com");

      expect(mockOnChange).toHaveBeenCalled();
    });

    it("should update summary", async () => {
      const user = userEvent.setup();
      const pubs = [createPublication({ summary: "" })];
      render(<PublicationsForm data={pubs} onChange={mockOnChange} />);

      const summaryEditor = screen.getByTestId("rich-text-editor");
      await user.type(summaryEditor, "New summary");

      expect(mockOnChange).toHaveBeenCalled();
    });
  });

  describe("accessibility", () => {
    it("should have accessible labels", () => {
      const pubs = [createPublication()];
      render(<PublicationsForm data={pubs} onChange={mockOnChange} />);

      expect(screen.getByLabelText(/publication name/i)).toBeDefined();
      expect(screen.getByLabelText(/publisher/i)).toBeDefined();
      expect(screen.getByLabelText(/release date/i)).toBeDefined();
      expect(screen.getByLabelText(/url/i)).toBeDefined();
      expect(screen.getByLabelText(/description/i)).toBeDefined();
    });

    it("should have accessible remove button", () => {
      const pubs = [createPublication()];
      render(<PublicationsForm data={pubs} onChange={mockOnChange} />);

      expect(screen.getByLabelText("Remove publication")).toBeDefined();
    });
  });

  describe("form fields", () => {
    it("should have date input type for release date", () => {
      const pubs = [createPublication()];
      render(<PublicationsForm data={pubs} onChange={mockOnChange} />);

      const dateInput = screen.getByLabelText(/release date/i);
      expect(dateInput.getAttribute("type")).toBe("date");
    });

    it("should have placeholders for inputs", () => {
      const pubs = [createPublication({ name: "", publisher: "" })];
      render(<PublicationsForm data={pubs} onChange={mockOnChange} />);

      expect(screen.getByPlaceholderText(/my great article/i)).toBeDefined();
      expect(screen.getByPlaceholderText(/medium.*ieee/i)).toBeDefined();
    });
  });
});
