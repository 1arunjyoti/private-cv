import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { InterestsForm } from "@/components/forms/InterestsForm";
import type { Interest } from "@/db";

// Mock uuid
vi.mock("uuid", () => ({
  v4: vi.fn().mockReturnValue("mock-uuid-interest"),
}));

// Mock window.confirm
vi.stubGlobal("confirm", vi.fn().mockReturnValue(true));

describe("InterestsForm", () => {
  const mockOnChange = vi.fn();

  const createInterest = (overrides?: Partial<Interest>): Interest => ({
    id: "interest-1",
    name: "Photography",
    keywords: ["Landscape", "Portrait", "Street"],
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("rendering", () => {
    it("should render empty state when no interests", () => {
      render(<InterestsForm data={[]} onChange={mockOnChange} />);

      expect(screen.getByText(/no interests added/i)).toBeDefined();
    });

    it("should render the Interests heading", () => {
      render(<InterestsForm data={[]} onChange={mockOnChange} />);

      expect(screen.getByText("Interests")).toBeDefined();
    });

    it("should render Add Interest button", () => {
      render(<InterestsForm data={[]} onChange={mockOnChange} />);

      expect(screen.getByText("Add Interest")).toBeDefined();
    });

    it("should render interest entries", () => {
      const interests = [createInterest()];
      render(<InterestsForm data={interests} onChange={mockOnChange} />);

      expect(screen.getByText("Photography")).toBeDefined();
    });

    it("should render keywords as tags", () => {
      const interests = [createInterest()];
      render(<InterestsForm data={interests} onChange={mockOnChange} />);

      expect(screen.getByText("Landscape")).toBeDefined();
      expect(screen.getByText("Portrait")).toBeDefined();
      expect(screen.getByText("Street")).toBeDefined();
    });

    it("should display New Interest for unnamed interests", () => {
      const interests = [createInterest({ name: "" })];
      render(<InterestsForm data={interests} onChange={mockOnChange} />);

      expect(screen.getByText("New Interest")).toBeDefined();
    });
  });

  describe("adding interests", () => {
    it("should add a new interest when Add Interest is clicked", async () => {
      const user = userEvent.setup();
      render(<InterestsForm data={[]} onChange={mockOnChange} />);

      await user.click(screen.getByText("Add Interest"));

      expect(mockOnChange).toHaveBeenCalledWith([
        expect.objectContaining({
          id: "mock-uuid-interest",
          name: "",
          keywords: [],
        }),
      ]);
    });
  });

  describe("removing interests", () => {
    it("should show confirmation before removing", async () => {
      const user = userEvent.setup();
      const interests = [createInterest()];
      render(<InterestsForm data={interests} onChange={mockOnChange} />);

      const removeButton = screen.getByLabelText("Remove interest");
      await user.click(removeButton);

      expect(window.confirm).toHaveBeenCalled();
    });

    it("should remove interest when confirmed", async () => {
      const user = userEvent.setup();
      const interests = [createInterest()];
      render(<InterestsForm data={interests} onChange={mockOnChange} />);

      const removeButton = screen.getByLabelText("Remove interest");
      await user.click(removeButton);

      expect(mockOnChange).toHaveBeenCalledWith([]);
    });

    it("should not remove interest when cancelled", async () => {
      vi.mocked(window.confirm).mockReturnValueOnce(false);
      
      const user = userEvent.setup();
      const interests = [createInterest()];
      render(<InterestsForm data={interests} onChange={mockOnChange} />);

      const removeButton = screen.getByLabelText("Remove interest");
      await user.click(removeButton);

      expect(mockOnChange).not.toHaveBeenCalled();
    });
  });

  describe("managing keywords", () => {
    it("should add a keyword when Add button is clicked", async () => {
      const user = userEvent.setup();
      const interests = [createInterest({ keywords: [] })];
      render(<InterestsForm data={interests} onChange={mockOnChange} />);

      const keywordInput = screen.getByPlaceholderText(/add keyword/i);
      await user.type(keywordInput, "NewKeyword");

      const addButton = screen.getByRole("button", { name: "Add" });
      await user.click(addButton);

      expect(mockOnChange).toHaveBeenCalledWith([
        expect.objectContaining({
          keywords: ["NewKeyword"],
        }),
      ]);
    });

    it("should remove a keyword when X is clicked", async () => {
      const user = userEvent.setup();
      const interests = [createInterest({ keywords: ["First", "Second"] })];
      render(<InterestsForm data={interests} onChange={mockOnChange} />);

      const removeKeywordButton = screen.getByLabelText("Remove keyword First");
      await user.click(removeKeywordButton);

      expect(mockOnChange).toHaveBeenCalledWith([
        expect.objectContaining({
          keywords: ["Second"],
        }),
      ]);
    });

    it("should add keyword on Enter key", async () => {
      const user = userEvent.setup();
      const interests = [createInterest({ keywords: [] })];
      render(<InterestsForm data={interests} onChange={mockOnChange} />);

      const keywordInput = screen.getByPlaceholderText(/add keyword/i);
      await user.type(keywordInput, "EnterKeyword{enter}");

      expect(mockOnChange).toHaveBeenCalledWith([
        expect.objectContaining({
          keywords: ["EnterKeyword"],
        }),
      ]);
    });
  });

  describe("accessibility", () => {
    it("should have accessible labels", () => {
      const interests = [createInterest()];
      render(<InterestsForm data={interests} onChange={mockOnChange} />);

      expect(screen.getByLabelText(/interest name/i)).toBeDefined();
      expect(screen.getByLabelText(/keywords/i)).toBeDefined();
    });

    it("should have accessible remove buttons", () => {
      const interests = [createInterest({ keywords: ["Test"] })];
      render(<InterestsForm data={interests} onChange={mockOnChange} />);

      expect(screen.getByLabelText("Remove interest")).toBeDefined();
      expect(screen.getByLabelText("Remove keyword Test")).toBeDefined();
    });
  });
});
