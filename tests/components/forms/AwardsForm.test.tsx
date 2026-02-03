import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AwardsForm } from "@/components/forms/AwardsForm";
import type { Award } from "@/db";

// Mock uuid
vi.mock("uuid", () => ({
  v4: vi.fn().mockReturnValue("mock-uuid-award"),
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

describe("AwardsForm", () => {
  const mockOnChange = vi.fn();

  const createAward = (overrides?: Partial<Award>): Award => ({
    id: "award-1",
    title: "Employee of the Year",
    date: "2024-01-15",
    awarder: "Tech Company Inc.",
    summary: "Recognized for exceptional performance",
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("rendering", () => {
    it("should render empty state when no awards", () => {
      render(<AwardsForm data={[]} onChange={mockOnChange} />);

      expect(screen.getByText(/no awards added/i)).toBeDefined();
    });

    it("should render the Awards heading", () => {
      render(<AwardsForm data={[]} onChange={mockOnChange} />);

      expect(screen.getByText("Awards")).toBeDefined();
    });

    it("should render Add Award button", () => {
      render(<AwardsForm data={[]} onChange={mockOnChange} />);

      expect(screen.getByText("Add Award")).toBeDefined();
    });

    it("should render award entries", () => {
      const awards = [createAward()];
      render(<AwardsForm data={awards} onChange={mockOnChange} />);

      expect(screen.getByText("Employee of the Year")).toBeDefined();
    });

    it("should display New Award for unnamed awards", () => {
      const awards = [createAward({ title: "" })];
      render(<AwardsForm data={awards} onChange={mockOnChange} />);

      expect(screen.getByText("New Award")).toBeDefined();
    });

    it("should render multiple awards", () => {
      const awards = [
        createAward({ id: "1", title: "First Award" }),
        createAward({ id: "2", title: "Second Award" }),
      ];
      render(<AwardsForm data={awards} onChange={mockOnChange} />);

      expect(screen.getByText("First Award")).toBeDefined();
      expect(screen.getByText("Second Award")).toBeDefined();
    });
  });

  describe("adding awards", () => {
    it("should add a new award when Add Award is clicked", async () => {
      const user = userEvent.setup();
      render(<AwardsForm data={[]} onChange={mockOnChange} />);

      await user.click(screen.getByText("Add Award"));

      expect(mockOnChange).toHaveBeenCalledWith([
        expect.objectContaining({
          id: "mock-uuid-award",
          title: "",
          date: "",
          awarder: "",
          summary: "",
        }),
      ]);
    });

    it("should append to existing awards", async () => {
      const user = userEvent.setup();
      const existingAwards = [createAward()];
      render(<AwardsForm data={existingAwards} onChange={mockOnChange} />);

      await user.click(screen.getByText("Add Award"));

      expect(mockOnChange).toHaveBeenCalledWith([
        existingAwards[0],
        expect.objectContaining({
          id: "mock-uuid-award",
        }),
      ]);
    });
  });

  describe("removing awards", () => {
    it("should remove an award when delete button is clicked", async () => {
      const user = userEvent.setup();
      const awards = [createAward()];
      render(<AwardsForm data={awards} onChange={mockOnChange} />);

      const removeButton = screen.getByLabelText("Remove award");
      await user.click(removeButton);

      expect(mockOnChange).toHaveBeenCalledWith([]);
    });

    it("should remove only the targeted award", async () => {
      const user = userEvent.setup();
      const awards = [
        createAward({ id: "1", title: "First" }),
        createAward({ id: "2", title: "Second" }),
      ];
      render(<AwardsForm data={awards} onChange={mockOnChange} />);

      const removeButtons = screen.getAllByLabelText("Remove award");
      await user.click(removeButtons[0]);

      expect(mockOnChange).toHaveBeenCalledWith([awards[1]]);
    });
  });

  describe("updating awards", () => {
    it("should update award title", async () => {
      const user = userEvent.setup();
      const awards = [createAward({ title: "" })];
      render(<AwardsForm data={awards} onChange={mockOnChange} />);

      const titleInput = screen.getByLabelText(/award title/i);
      await user.type(titleInput, "Best Developer");

      expect(mockOnChange).toHaveBeenCalled();
    });

    it("should update awarder", async () => {
      const user = userEvent.setup();
      const awards = [createAward({ awarder: "" })];
      render(<AwardsForm data={awards} onChange={mockOnChange} />);

      const awarderInput = screen.getByLabelText(/awarder/i);
      await user.type(awarderInput, "Google");

      expect(mockOnChange).toHaveBeenCalled();
    });

    it("should update date", async () => {
      const user = userEvent.setup();
      const awards = [createAward({ date: "" })];
      render(<AwardsForm data={awards} onChange={mockOnChange} />);

      const dateInput = screen.getByLabelText(/date/i);
      await user.type(dateInput, "2024-06-15");

      expect(mockOnChange).toHaveBeenCalled();
    });

    it("should update summary", async () => {
      const user = userEvent.setup();
      const awards = [createAward({ summary: "" })];
      render(<AwardsForm data={awards} onChange={mockOnChange} />);

      const summaryEditor = screen.getByTestId("rich-text-editor");
      await user.type(summaryEditor, "New description");

      expect(mockOnChange).toHaveBeenCalled();
    });
  });

  describe("accessibility", () => {
    it("should have accessible labels", () => {
      const awards = [createAward()];
      render(<AwardsForm data={awards} onChange={mockOnChange} />);

      expect(screen.getByLabelText(/award title/i)).toBeDefined();
      expect(screen.getByLabelText(/awarder/i)).toBeDefined();
      expect(screen.getByLabelText(/date/i)).toBeDefined();
      expect(screen.getByLabelText(/description/i)).toBeDefined();
    });

    it("should have accessible remove button", () => {
      const awards = [createAward()];
      render(<AwardsForm data={awards} onChange={mockOnChange} />);

      expect(screen.getByLabelText("Remove award")).toBeDefined();
    });
  });

  describe("form fields", () => {
    it("should have date input type", () => {
      const awards = [createAward()];
      render(<AwardsForm data={awards} onChange={mockOnChange} />);

      const dateInput = screen.getByLabelText(/date/i);
      expect(dateInput.getAttribute("type")).toBe("date");
    });

    it("should have placeholder for title", () => {
      const awards = [createAward({ title: "" })];
      render(<AwardsForm data={awards} onChange={mockOnChange} />);

      expect(screen.getByPlaceholderText(/employee of the month/i)).toBeDefined();
    });

    it("should have placeholder for awarder", () => {
      const awards = [createAward({ awarder: "" })];
      render(<AwardsForm data={awards} onChange={mockOnChange} />);

      expect(screen.getByPlaceholderText(/company inc/i)).toBeDefined();
    });
  });
});
