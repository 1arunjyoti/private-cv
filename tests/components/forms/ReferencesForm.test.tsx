import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReferencesForm } from "@/components/forms/ReferencesForm";
import type { Reference } from "@/db";

// Mock uuid
vi.mock("uuid", () => ({
  v4: vi.fn().mockReturnValue("mock-uuid-ref"),
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

describe("ReferencesForm", () => {
  const mockOnChange = vi.fn();

  const createReference = (overrides?: Partial<Reference>): Reference => ({
    id: "ref-1",
    name: "John Smith",
    position: "Engineering Manager at Tech Corp",
    reference: "Jane is an exceptional developer with great problem-solving skills.",
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("rendering", () => {
    it("should render empty state when no references", () => {
      render(<ReferencesForm data={[]} onChange={mockOnChange} />);

      expect(screen.getByText(/no references added/i)).toBeDefined();
    });

    it("should render the References heading", () => {
      render(<ReferencesForm data={[]} onChange={mockOnChange} />);

      expect(screen.getByText("References")).toBeDefined();
    });

    it("should render Add Reference button", () => {
      render(<ReferencesForm data={[]} onChange={mockOnChange} />);

      expect(screen.getByText("Add Reference")).toBeDefined();
    });

    it("should render reference entries", () => {
      const refs = [createReference()];
      render(<ReferencesForm data={refs} onChange={mockOnChange} />);

      expect(screen.getByText("John Smith")).toBeDefined();
    });

    it("should display New Reference for unnamed references", () => {
      const refs = [createReference({ name: "" })];
      render(<ReferencesForm data={refs} onChange={mockOnChange} />);

      expect(screen.getByText("New Reference")).toBeDefined();
    });

    it("should render multiple references", () => {
      const refs = [
        createReference({ id: "1", name: "John Smith" }),
        createReference({ id: "2", name: "Jane Doe" }),
      ];
      render(<ReferencesForm data={refs} onChange={mockOnChange} />);

      expect(screen.getByText("John Smith")).toBeDefined();
      expect(screen.getByText("Jane Doe")).toBeDefined();
    });
  });

  describe("adding references", () => {
    it("should add a new reference when Add Reference is clicked", async () => {
      const user = userEvent.setup();
      render(<ReferencesForm data={[]} onChange={mockOnChange} />);

      await user.click(screen.getByText("Add Reference"));

      expect(mockOnChange).toHaveBeenCalledWith([
        expect.objectContaining({
          id: "mock-uuid-ref",
          name: "",
          position: "",
          reference: "",
        }),
      ]);
    });

    it("should append to existing references", async () => {
      const user = userEvent.setup();
      const existingRefs = [createReference()];
      render(<ReferencesForm data={existingRefs} onChange={mockOnChange} />);

      await user.click(screen.getByText("Add Reference"));

      expect(mockOnChange).toHaveBeenCalledWith([
        existingRefs[0],
        expect.objectContaining({
          id: "mock-uuid-ref",
        }),
      ]);
    });
  });

  describe("removing references", () => {
    it("should remove a reference when delete button is clicked", async () => {
      const user = userEvent.setup();
      const refs = [createReference()];
      render(<ReferencesForm data={refs} onChange={mockOnChange} />);

      const removeButton = screen.getByLabelText("Remove reference");
      await user.click(removeButton);

      expect(mockOnChange).toHaveBeenCalledWith([]);
    });

    it("should remove only the targeted reference", async () => {
      const user = userEvent.setup();
      const refs = [
        createReference({ id: "1", name: "First" }),
        createReference({ id: "2", name: "Second" }),
      ];
      render(<ReferencesForm data={refs} onChange={mockOnChange} />);

      const removeButtons = screen.getAllByLabelText("Remove reference");
      await user.click(removeButtons[0]);

      expect(mockOnChange).toHaveBeenCalledWith([refs[1]]);
    });
  });

  describe("updating references", () => {
    it("should update reference name", async () => {
      const user = userEvent.setup();
      const refs = [createReference({ name: "" })];
      render(<ReferencesForm data={refs} onChange={mockOnChange} />);

      const nameInput = screen.getByLabelText(/name/i);
      await user.type(nameInput, "New Name");

      expect(mockOnChange).toHaveBeenCalled();
    });

    it("should update position", async () => {
      const user = userEvent.setup();
      const refs = [createReference({ position: "" })];
      render(<ReferencesForm data={refs} onChange={mockOnChange} />);

      const positionInput = screen.getByLabelText(/position/i);
      await user.type(positionInput, "CEO at Startup");

      expect(mockOnChange).toHaveBeenCalled();
    });

    it("should update reference text", async () => {
      const user = userEvent.setup();
      const refs = [createReference({ reference: "" })];
      render(<ReferencesForm data={refs} onChange={mockOnChange} />);

      const referenceEditor = screen.getByTestId("rich-text-editor");
      await user.type(referenceEditor, "Great colleague");

      expect(mockOnChange).toHaveBeenCalled();
    });
  });

  describe("accessibility", () => {
    it("should have accessible labels", () => {
      const refs = [createReference()];
      render(<ReferencesForm data={refs} onChange={mockOnChange} />);

      expect(screen.getByPlaceholderText(/john doe/i)).toBeDefined();
      expect(screen.getByPlaceholderText(/manager at google/i)).toBeDefined();
    });

    it("should have accessible remove button", () => {
      const refs = [createReference()];
      render(<ReferencesForm data={refs} onChange={mockOnChange} />);

      expect(screen.getByLabelText("Remove reference")).toBeDefined();
    });
  });

  describe("form fields", () => {
    it("should have placeholder for name", () => {
      const refs = [createReference({ name: "" })];
      render(<ReferencesForm data={refs} onChange={mockOnChange} />);

      expect(screen.getByPlaceholderText(/john doe/i)).toBeDefined();
    });

    it("should have placeholder for position", () => {
      const refs = [createReference({ position: "" })];
      render(<ReferencesForm data={refs} onChange={mockOnChange} />);

      expect(screen.getByPlaceholderText(/manager at google/i)).toBeDefined();
    });
  });
});
