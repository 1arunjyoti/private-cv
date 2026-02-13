import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SkillsForm } from "@/components/forms/SkillsForm";
import type { Skill } from "@/db";

// Mock uuid to have predictable IDs
vi.mock("uuid", () => ({
  v4: vi.fn().mockReturnValue("mock-uuid-123"),
}));

describe("SkillsForm", () => {
  const mockOnChange = vi.fn();

  const createSkill = (overrides?: Partial<Skill>): Skill => ({
    id: "skill-1",
    name: "Programming Languages",
    level: "Advanced",
    keywords: ["JavaScript", "TypeScript", "Python"],
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("rendering", () => {
    it("should render empty state when no skills", () => {
      render(<SkillsForm data={[]} onChange={mockOnChange} />);

      expect(screen.getByText(/no skills added/i)).toBeDefined();
    });

    it("should render the Skills heading", () => {
      render(<SkillsForm data={[]} onChange={mockOnChange} />);

      expect(screen.getByText("Skills")).toBeDefined();
    });

    it("should render Add Skill button", () => {
      render(<SkillsForm data={[]} onChange={mockOnChange} />);

      expect(screen.getByText("Add Skill")).toBeDefined();
    });

    it("should render skill entries", () => {
      const skills = [createSkill()];
      render(<SkillsForm data={skills} onChange={mockOnChange} />);

      expect(screen.getByDisplayValue("Programming Languages")).toBeDefined();
    });

    it("should render skill level input", () => {
      const skills = [createSkill()];
      render(<SkillsForm data={skills} onChange={mockOnChange} />);

      expect(screen.getByDisplayValue("Advanced")).toBeDefined();
    });

    it("should render keywords as tags", () => {
      const skills = [createSkill()];
      render(<SkillsForm data={skills} onChange={mockOnChange} />);

      expect(screen.getByText("JavaScript")).toBeDefined();
      expect(screen.getByText("TypeScript")).toBeDefined();
      expect(screen.getByText("Python")).toBeDefined();
    });

    it("should render multiple skills", () => {
      const skills = [
        createSkill({ id: "skill-1", name: "Languages" }),
        createSkill({ id: "skill-2", name: "Frameworks" }),
      ];
      render(<SkillsForm data={skills} onChange={mockOnChange} />);

      expect(screen.getByDisplayValue("Languages")).toBeDefined();
      expect(screen.getByDisplayValue("Frameworks")).toBeDefined();
    });
  });

  describe("adding skills", () => {
    it("should add a new skill when Add Skill is clicked", async () => {
      const user = userEvent.setup();
      render(<SkillsForm data={[]} onChange={mockOnChange} />);

      await user.click(screen.getByText("Add Skill"));

      expect(mockOnChange).toHaveBeenCalledWith([
        expect.objectContaining({
          id: "mock-uuid-123",
          name: "",
          level: "",
          keywords: [],
        }),
      ]);
    });

    it("should append to existing skills", async () => {
      const user = userEvent.setup();
      const existingSkills = [createSkill()];
      render(<SkillsForm data={existingSkills} onChange={mockOnChange} />);

      await user.click(screen.getByText("Add Skill"));

      expect(mockOnChange).toHaveBeenCalledWith([
        existingSkills[0],
        expect.objectContaining({
          id: "mock-uuid-123",
        }),
      ]);
    });
  });

  describe("removing skills", () => {
    it("should remove a skill when delete button is clicked", async () => {
      const user = userEvent.setup();
      const skills = [createSkill()];
      render(<SkillsForm data={skills} onChange={mockOnChange} />);

      const removeButton = screen.getByLabelText("Remove skill");
      await user.click(removeButton);

      expect(mockOnChange).toHaveBeenCalledWith([]);
    });

    it("should remove only the targeted skill", async () => {
      const user = userEvent.setup();
      const skills = [
        createSkill({ id: "skill-1", name: "Languages" }),
        createSkill({ id: "skill-2", name: "Frameworks" }),
      ];
      render(<SkillsForm data={skills} onChange={mockOnChange} />);

      const removeButtons = screen.getAllByLabelText("Remove skill");
      await user.click(removeButtons[0]);

      expect(mockOnChange).toHaveBeenCalledWith([skills[1]]);
    });
  });

  describe("updating skills", () => {
    it("should update skill name", async () => {
      const user = userEvent.setup();
      const skills = [createSkill({ name: "" })];
      render(<SkillsForm data={skills} onChange={mockOnChange} />);

      const nameInput = screen.getByPlaceholderText(/skill category/i);
      await user.type(nameInput, "Web Development");

      expect(mockOnChange).toHaveBeenCalled();
    });

    it("should update skill level", async () => {
      const user = userEvent.setup();
      const skills = [createSkill({ level: "" })];
      render(<SkillsForm data={skills} onChange={mockOnChange} />);

      const levelInput = screen.getByPlaceholderText(/native.*advanced/i);
      await user.type(levelInput, "Expert");

      expect(mockOnChange).toHaveBeenCalled();
    });
  });

  describe("managing keywords", () => {
    it("should add a keyword when Add button is clicked", async () => {
      const user = userEvent.setup();
      const skills = [createSkill({ keywords: [] })];
      render(<SkillsForm data={skills} onChange={mockOnChange} />);

      const keywordInput = screen.getByPlaceholderText(/add skill/i);
      await user.type(keywordInput, "React");
      
      const addButton = screen.getByRole("button", { name: "Add" });
      await user.click(addButton);

      expect(mockOnChange).toHaveBeenCalledWith([
        expect.objectContaining({
          keywords: ["React"],
        }),
      ]);
    });

    it("should add a keyword when Enter is pressed", async () => {
      const user = userEvent.setup();
      const skills = [createSkill({ keywords: [] })];
      render(<SkillsForm data={skills} onChange={mockOnChange} />);

      const keywordInput = screen.getByPlaceholderText(/add skill/i);
      await user.type(keywordInput, "Vue{enter}");

      expect(mockOnChange).toHaveBeenCalledWith([
        expect.objectContaining({
          keywords: ["Vue"],
        }),
      ]);
    });

    it("should not add empty keyword", async () => {
      const user = userEvent.setup();
      const skills = [createSkill({ keywords: ["Existing"] })];
      render(<SkillsForm data={skills} onChange={mockOnChange} />);

      const addButton = screen.getByRole("button", { name: "Add" });
      await user.click(addButton);

      // Should not have been called since input is empty
      expect(mockOnChange).not.toHaveBeenCalled();
    });

    it("should remove a keyword when X is clicked", async () => {
      const user = userEvent.setup();
      const skills = [createSkill({ keywords: ["JavaScript", "TypeScript"] })];
      render(<SkillsForm data={skills} onChange={mockOnChange} />);

      const removeKeywordButton = screen.getByLabelText("Remove keyword JavaScript");
      await user.click(removeKeywordButton);

      expect(mockOnChange).toHaveBeenCalledWith([
        expect.objectContaining({
          keywords: ["TypeScript"],
        }),
      ]);
    });

    it("should append to existing keywords", async () => {
      const user = userEvent.setup();
      const skills = [createSkill({ keywords: ["JavaScript"] })];
      render(<SkillsForm data={skills} onChange={mockOnChange} />);

      const keywordInput = screen.getByPlaceholderText(/add skill/i);
      await user.type(keywordInput, "TypeScript");
      
      const addButton = screen.getByRole("button", { name: "Add" });
      await user.click(addButton);

      expect(mockOnChange).toHaveBeenCalledWith([
        expect.objectContaining({
          keywords: ["JavaScript", "TypeScript"],
        }),
      ]);
    });
  });

  describe("accessibility", () => {
    it("should have accessible labels for inputs", () => {
      const skills = [createSkill()];
      render(<SkillsForm data={skills} onChange={mockOnChange} />);

      expect(screen.getByLabelText(/skill category/i)).toBeDefined();
      expect(screen.getByLabelText(/proficiency level/i)).toBeDefined();
    });

    it("should have accessible remove buttons", () => {
      const skills = [createSkill()];
      render(<SkillsForm data={skills} onChange={mockOnChange} />);

      expect(screen.getByLabelText("Remove skill")).toBeDefined();
    });

    it("should have accessible keyword remove buttons", () => {
      const skills = [createSkill({ keywords: ["JavaScript"] })];
      render(<SkillsForm data={skills} onChange={mockOnChange} />);

      expect(screen.getByLabelText("Remove keyword JavaScript")).toBeDefined();
    });
  });

  describe("grid layout", () => {
    it("should render skills in a grid", () => {
      const skills = [
        createSkill({ id: "1", name: "Languages" }),
        createSkill({ id: "2", name: "Frameworks" }),
        createSkill({ id: "3", name: "Tools" }),
      ];
      render(<SkillsForm data={skills} onChange={mockOnChange} />);

      // All three skills should be rendered
      expect(screen.getByDisplayValue("Languages")).toBeDefined();
      expect(screen.getByDisplayValue("Frameworks")).toBeDefined();
      expect(screen.getByDisplayValue("Tools")).toBeDefined();
    });
  });
});
