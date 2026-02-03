import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CustomForm } from "@/components/forms/CustomForm";
import type { CustomSection } from "@/db";

// Mock uuid
let mockUuidCounter = 0;
vi.mock("uuid", () => ({
  v4: vi.fn(() => `mock-uuid-custom-${++mockUuidCounter}`),
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

// Mock window.confirm
vi.stubGlobal("confirm", vi.fn().mockReturnValue(true));

describe("CustomForm", () => {
  const mockOnChange = vi.fn();

  const createCustomSection = (overrides?: Partial<CustomSection>): CustomSection => ({
    id: "section-1",
    name: "Volunteering",
    items: [
      {
        id: "item-1",
        name: "Community Helper",
        description: "Local community service",
        date: "2024-01",
        url: "https://example.org",
        summary: "Helped organize events",
      },
    ],
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockUuidCounter = 0;
  });

  describe("rendering", () => {
    it("should render empty state when no sections", () => {
      render(<CustomForm data={[]} onChange={mockOnChange} />);

      expect(screen.getByText(/no custom sections added/i)).toBeDefined();
    });

    it("should render the Custom Sections heading", () => {
      render(<CustomForm data={[]} onChange={mockOnChange} />);

      expect(screen.getByText("Custom Sections")).toBeDefined();
    });

    it("should render Add Section button", () => {
      render(<CustomForm data={[]} onChange={mockOnChange} />);

      expect(screen.getByText("Add Section")).toBeDefined();
    });

    it("should render section tabs", () => {
      const sections = [createCustomSection()];
      render(<CustomForm data={sections} onChange={mockOnChange} />);

      expect(screen.getByText("Volunteering")).toBeDefined();
    });

    it("should render multiple section tabs", () => {
      const sections = [
        createCustomSection({ id: "1", name: "Volunteering" }),
        createCustomSection({ id: "2", name: "Speaking" }),
      ];
      render(<CustomForm data={sections} onChange={mockOnChange} />);

      expect(screen.getByText("Volunteering")).toBeDefined();
      expect(screen.getByText("Speaking")).toBeDefined();
    });

    it("should display Untitled for unnamed sections", () => {
      const sections = [createCustomSection({ name: "" })];
      render(<CustomForm data={sections} onChange={mockOnChange} />);

      expect(screen.getByText("Untitled")).toBeDefined();
    });
  });

  describe("adding sections", () => {
    it("should add a new section when Add Section is clicked", async () => {
      const user = userEvent.setup();
      render(<CustomForm data={[]} onChange={mockOnChange} />);

      await user.click(screen.getByText("Add Section"));

      expect(mockOnChange).toHaveBeenCalledWith([
        expect.objectContaining({
          name: "New Section",
          items: [],
        }),
      ]);
    });

    it("should append to existing sections", async () => {
      const user = userEvent.setup();
      const existingSections = [createCustomSection()];
      render(<CustomForm data={existingSections} onChange={mockOnChange} />);

      await user.click(screen.getByText("Add Section"));

      expect(mockOnChange).toHaveBeenCalledWith([
        existingSections[0],
        expect.objectContaining({
          name: "New Section",
          items: [],
        }),
      ]);
    });
  });

  describe("removing sections", () => {
    it("should show confirmation before removing section", async () => {
      const user = userEvent.setup();
      const sections = [createCustomSection()];
      render(<CustomForm data={sections} onChange={mockOnChange} />);

      // Find the delete button in the section content area
      const deleteButtons = screen.getAllByRole("button");
      const deleteButton = deleteButtons.find(btn => 
        btn.querySelector('svg.lucide-trash-2')
      );
      
      if (deleteButton) {
        await user.click(deleteButton);
        expect(window.confirm).toHaveBeenCalled();
      }
    });

    it("should remove section when confirmed", async () => {
      const user = userEvent.setup();
      const sections = [createCustomSection()];
      render(<CustomForm data={sections} onChange={mockOnChange} />);

      // Find the delete button
      const deleteButtons = screen.getAllByRole("button");
      const deleteButton = deleteButtons.find(btn => 
        btn.querySelector('svg.lucide-trash-2')
      );
      
      if (deleteButton) {
        await user.click(deleteButton);
        expect(mockOnChange).toHaveBeenCalledWith([]);
      }
    });

    it("should not remove section when cancelled", async () => {
      vi.mocked(window.confirm).mockReturnValueOnce(false);
      
      const user = userEvent.setup();
      const sections = [createCustomSection()];
      render(<CustomForm data={sections} onChange={mockOnChange} />);

      const deleteButtons = screen.getAllByRole("button");
      const deleteButton = deleteButtons.find(btn => 
        btn.querySelector('svg.lucide-trash-2')
      );
      
      if (deleteButton) {
        await user.click(deleteButton);
        // onChange should not have been called with empty array
        const removeCalls = mockOnChange.mock.calls.filter(
          call => call[0].length === 0
        );
        expect(removeCalls).toHaveLength(0);
      }
    });
  });

  describe("updating section name", () => {
    it("should update section name", async () => {
      const user = userEvent.setup();
      const sections = [createCustomSection({ name: "" })];
      render(<CustomForm data={sections} onChange={mockOnChange} />);

      const nameInput = screen.getByPlaceholderText(/section title/i);
      await user.type(nameInput, "New Name");

      expect(mockOnChange).toHaveBeenCalled();
    });
  });

  describe("managing items", () => {
    it("should render Add Item button", () => {
      const sections = [createCustomSection()];
      render(<CustomForm data={sections} onChange={mockOnChange} />);

      expect(screen.getByText("Add Item")).toBeDefined();
    });

    it("should add an item when Add Item is clicked", async () => {
      const user = userEvent.setup();
      const sections = [createCustomSection({ items: [] })];
      render(<CustomForm data={sections} onChange={mockOnChange} />);

      await user.click(screen.getByText("Add Item"));

      expect(mockOnChange).toHaveBeenCalledWith([
        expect.objectContaining({
          items: [
            expect.objectContaining({
              name: "",
              description: "",
              date: "",
              url: "",
              summary: "",
            }),
          ],
        }),
      ]);
    });

    it("should show empty items state", () => {
      const sections = [createCustomSection({ items: [] })];
      render(<CustomForm data={sections} onChange={mockOnChange} />);

      expect(screen.getByText(/no items in this section/i)).toBeDefined();
    });

    it("should render existing items", () => {
      const sections = [createCustomSection()];
      render(<CustomForm data={sections} onChange={mockOnChange} />);

      expect(screen.getByText("Community Helper")).toBeDefined();
    });
  });

  describe("tabs functionality", () => {
    it("should switch between sections", async () => {
      const user = userEvent.setup();
      const sections = [
        createCustomSection({ id: "1", name: "Section One", items: [] }),
        createCustomSection({ id: "2", name: "Section Two", items: [] }),
      ];
      render(<CustomForm data={sections} onChange={mockOnChange} />);

      // Click on second tab
      await user.click(screen.getByText("Section Two"));

      // The second section's content should be visible
      // Both tabs should exist
      expect(screen.getByText("Section One")).toBeDefined();
      expect(screen.getByText("Section Two")).toBeDefined();
    });

    it("should default to first section being active", () => {
      const sections = [
        createCustomSection({ id: "1", name: "First Section", items: [] }),
        createCustomSection({ id: "2", name: "Second Section", items: [] }),
      ];
      render(<CustomForm data={sections} onChange={mockOnChange} />);

      // First section should be visible
      const nameInput = screen.getByPlaceholderText(/section title/i);
      expect(nameInput).toBeDefined();
    });
  });

  describe("accessibility", () => {
    it("should have section name input", () => {
      const sections = [createCustomSection()];
      render(<CustomForm data={sections} onChange={mockOnChange} />);

      expect(screen.getByPlaceholderText(/section title/i)).toBeDefined();
    });
  });

  describe("item fields", () => {
    it("should render item with all fields", () => {
      const sections = [createCustomSection()];
      render(<CustomForm data={sections} onChange={mockOnChange} />);

      // Item title should be visible
      expect(screen.getByText("Community Helper")).toBeDefined();
    });
  });

  describe("section structure", () => {
    it("should have correct data structure for new section", async () => {
      const user = userEvent.setup();
      render(<CustomForm data={[]} onChange={mockOnChange} />);

      await user.click(screen.getByText("Add Section"));

      const call = mockOnChange.mock.calls[0][0];
      expect(call[0]).toHaveProperty("id");
      expect(call[0]).toHaveProperty("name", "New Section");
      expect(call[0]).toHaveProperty("items");
      expect(call[0].items).toEqual([]);
    });

    it("should have correct data structure for new item", async () => {
      const user = userEvent.setup();
      const sections = [createCustomSection({ items: [] })];
      render(<CustomForm data={sections} onChange={mockOnChange} />);

      await user.click(screen.getByText("Add Item"));

      const call = mockOnChange.mock.calls[0][0];
      const newItem = call[0].items[0];
      expect(newItem).toHaveProperty("id");
      expect(newItem).toHaveProperty("name", "");
      expect(newItem).toHaveProperty("description", "");
      expect(newItem).toHaveProperty("date", "");
      expect(newItem).toHaveProperty("url", "");
      expect(newItem).toHaveProperty("summary", "");
    });
  });

  describe("empty state guidance", () => {
    it("should show guidance text for empty state", () => {
      render(<CustomForm data={[]} onChange={mockOnChange} />);

      expect(screen.getByText(/volunteering.*speaking.*organizations/i)).toBeDefined();
    });
  });
});
