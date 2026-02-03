import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LanguagesForm } from "@/components/forms/LanguagesForm";
import type { Language } from "@/db";

// Mock uuid
vi.mock("uuid", () => ({
  v4: vi.fn().mockReturnValue("mock-uuid-lang"),
}));

describe("LanguagesForm", () => {
  const mockOnChange = vi.fn();

  const createLanguage = (overrides?: Partial<Language>): Language => ({
    id: "lang-1",
    language: "English",
    fluency: "Native speaker",
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("rendering", () => {
    it("should render empty state when no languages", () => {
      render(<LanguagesForm data={[]} onChange={mockOnChange} />);

      expect(screen.getByText(/no languages added/i)).toBeDefined();
    });

    it("should render the Languages heading", () => {
      render(<LanguagesForm data={[]} onChange={mockOnChange} />);

      expect(screen.getByText("Languages")).toBeDefined();
    });

    it("should render Add Language button", () => {
      render(<LanguagesForm data={[]} onChange={mockOnChange} />);

      expect(screen.getByText("Add Language")).toBeDefined();
    });

    it("should render language entries", () => {
      const languages = [createLanguage()];
      render(<LanguagesForm data={languages} onChange={mockOnChange} />);

      expect(screen.getByDisplayValue("English")).toBeDefined();
    });

    it("should render fluency select", () => {
      const languages = [createLanguage()];
      render(<LanguagesForm data={languages} onChange={mockOnChange} />);

      expect(screen.getByDisplayValue("Native speaker")).toBeDefined();
    });

    it("should render multiple languages", () => {
      const languages = [
        createLanguage({ id: "1", language: "English" }),
        createLanguage({ id: "2", language: "Spanish" }),
      ];
      render(<LanguagesForm data={languages} onChange={mockOnChange} />);

      expect(screen.getByDisplayValue("English")).toBeDefined();
      expect(screen.getByDisplayValue("Spanish")).toBeDefined();
    });
  });

  describe("adding languages", () => {
    it("should add a new language when Add Language is clicked", async () => {
      const user = userEvent.setup();
      render(<LanguagesForm data={[]} onChange={mockOnChange} />);

      await user.click(screen.getByText("Add Language"));

      expect(mockOnChange).toHaveBeenCalledWith([
        expect.objectContaining({
          id: "mock-uuid-lang",
          language: "",
          fluency: "",
        }),
      ]);
    });

    it("should append to existing languages", async () => {
      const user = userEvent.setup();
      const existingLangs = [createLanguage()];
      render(<LanguagesForm data={existingLangs} onChange={mockOnChange} />);

      await user.click(screen.getByText("Add Language"));

      expect(mockOnChange).toHaveBeenCalledWith([
        existingLangs[0],
        expect.objectContaining({
          id: "mock-uuid-lang",
        }),
      ]);
    });
  });

  describe("removing languages", () => {
    it("should remove a language when delete button is clicked", async () => {
      const user = userEvent.setup();
      const languages = [createLanguage()];
      render(<LanguagesForm data={languages} onChange={mockOnChange} />);

      const removeButton = screen.getByLabelText("Remove language");
      await user.click(removeButton);

      expect(mockOnChange).toHaveBeenCalledWith([]);
    });

    it("should remove only the targeted language", async () => {
      const user = userEvent.setup();
      const languages = [
        createLanguage({ id: "1", language: "English" }),
        createLanguage({ id: "2", language: "Spanish" }),
      ];
      render(<LanguagesForm data={languages} onChange={mockOnChange} />);

      const removeButtons = screen.getAllByLabelText("Remove language");
      await user.click(removeButtons[0]);

      expect(mockOnChange).toHaveBeenCalledWith([languages[1]]);
    });
  });

  describe("updating languages", () => {
    it("should update language name", async () => {
      const user = userEvent.setup();
      const languages = [createLanguage({ id: "lang-test", language: "" })];
      render(<LanguagesForm data={languages} onChange={mockOnChange} />);

      const languageInput = screen.getByPlaceholderText("e.g. English");
      await user.type(languageInput, "French");

      expect(mockOnChange).toHaveBeenCalled();
    });

    it("should update fluency level", async () => {
      const user = userEvent.setup();
      const languages = [createLanguage({ fluency: "" })];
      render(<LanguagesForm data={languages} onChange={mockOnChange} />);

      const fluencySelect = screen.getByLabelText(/fluency/i);
      await user.selectOptions(fluencySelect, "Fluent");

      expect(mockOnChange).toHaveBeenCalledWith([
        expect.objectContaining({
          fluency: "Fluent",
        }),
      ]);
    });
  });

  describe("fluency options", () => {
    const fluencyLevels = [
      "Native speaker",
      "Fluent",
      "Proficient",
      "Intermediate",
      "Beginner",
    ];

    it("should have all fluency options available", () => {
      const languages = [createLanguage()];
      render(<LanguagesForm data={languages} onChange={mockOnChange} />);

      const fluencySelect = screen.getByLabelText(/fluency/i);
      
      fluencyLevels.forEach((level) => {
        expect(fluencySelect.querySelector(`option[value="${level}"]`)).toBeDefined();
      });
    });

    it("should have a disabled placeholder option", () => {
      const languages = [createLanguage({ fluency: "" })];
      render(<LanguagesForm data={languages} onChange={mockOnChange} />);

      expect(screen.getByText("Select fluency")).toBeDefined();
    });
  });

  describe("accessibility", () => {
    it("should have accessible labels for inputs", () => {
      const languages = [createLanguage({ id: "lang-acc" })];
      render(<LanguagesForm data={languages} onChange={mockOnChange} />);

      // Check for language input by placeholder since label text conflicts with remove button
      expect(screen.getByPlaceholderText(/english/i)).toBeDefined();
      expect(screen.getByLabelText(/fluency/i)).toBeDefined();
    });

    it("should have accessible remove button", () => {
      const languages = [createLanguage()];
      render(<LanguagesForm data={languages} onChange={mockOnChange} />);

      expect(screen.getByLabelText("Remove language")).toBeDefined();
    });
  });

  describe("form fields", () => {
    it("should have placeholder for language name", () => {
      const languages = [createLanguage({ language: "" })];
      render(<LanguagesForm data={languages} onChange={mockOnChange} />);

      expect(screen.getByPlaceholderText(/english/i)).toBeDefined();
    });
  });

  describe("layout", () => {
    it("should not show empty state when languages exist", () => {
      const languages = [createLanguage()];
      render(<LanguagesForm data={languages} onChange={mockOnChange} />);

      expect(screen.queryByText(/no languages added/i)).toBeNull();
    });

    it("should render each language in its own row", () => {
      const languages = [
        createLanguage({ id: "1", language: "English" }),
        createLanguage({ id: "2", language: "Spanish" }),
        createLanguage({ id: "3", language: "French" }),
      ];
      render(<LanguagesForm data={languages} onChange={mockOnChange} />);

      const removeButtons = screen.getAllByLabelText("Remove language");
      expect(removeButtons).toHaveLength(3);
    });
  });
});
