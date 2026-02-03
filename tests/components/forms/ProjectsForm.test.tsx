import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProjectsForm } from "@/components/forms/ProjectsForm";
import type { Project } from "@/db";

// Mock uuid
vi.mock("uuid", () => ({
  v4: vi.fn().mockReturnValue("mock-uuid-456"),
}));

// Mock RichTextEditor
vi.mock("@/components/ui/RichTextEditor", () => ({
  RichTextEditor: ({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) => (
    <textarea
      data-testid="rich-text-editor"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  ),
}));

describe("ProjectsForm", () => {
  const mockOnChange = vi.fn();

  const createProject = (overrides?: Partial<Project>): Project => ({
    id: "project-1",
    name: "Resume Builder",
    description: "A web app for building resumes",
    highlights: ["Built with React", "Uses TypeScript"],
    keywords: ["React", "TypeScript", "Node.js"],
    startDate: "2024-01",
    endDate: "2024-06",
    url: "https://github.com/user/resume-builder",
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("rendering", () => {
    it("should render empty state when no projects", () => {
      render(<ProjectsForm data={[]} onChange={mockOnChange} />);

      expect(screen.getByText(/no projects added/i)).toBeDefined();
    });

    it("should render the Projects heading", () => {
      render(<ProjectsForm data={[]} onChange={mockOnChange} />);

      expect(screen.getByText("Projects")).toBeDefined();
    });

    it("should render Add Project button", () => {
      render(<ProjectsForm data={[]} onChange={mockOnChange} />);

      expect(screen.getByText("Add Project")).toBeDefined();
    });

    it("should render project entries", () => {
      const projects = [createProject()];
      render(<ProjectsForm data={projects} onChange={mockOnChange} />);

      expect(screen.getByText("Resume Builder")).toBeDefined();
    });

    it("should render project number", () => {
      const projects = [createProject()];
      render(<ProjectsForm data={projects} onChange={mockOnChange} />);

      expect(screen.getByText("#1")).toBeDefined();
    });

    it("should render multiple projects", () => {
      const projects = [
        createProject({ id: "1", name: "Project One" }),
        createProject({ id: "2", name: "Project Two" }),
      ];
      render(<ProjectsForm data={projects} onChange={mockOnChange} />);

      expect(screen.getByText("Project One")).toBeDefined();
      expect(screen.getByText("Project Two")).toBeDefined();
      expect(screen.getByText("#1")).toBeDefined();
      expect(screen.getByText("#2")).toBeDefined();
    });

    it("should display New Project for unnamed projects", () => {
      const projects = [createProject({ name: "" })];
      render(<ProjectsForm data={projects} onChange={mockOnChange} />);

      expect(screen.getByText("New Project")).toBeDefined();
    });
  });

  describe("adding projects", () => {
    it("should add a new project when Add Project is clicked", async () => {
      const user = userEvent.setup();
      render(<ProjectsForm data={[]} onChange={mockOnChange} />);

      await user.click(screen.getByText("Add Project"));

      expect(mockOnChange).toHaveBeenCalledWith([
        expect.objectContaining({
          id: "mock-uuid-456",
          name: "",
          description: "",
          highlights: [],
          keywords: [],
          startDate: "",
          endDate: "",
          url: "",
        }),
      ]);
    });

    it("should append to existing projects", async () => {
      const user = userEvent.setup();
      const existingProjects = [createProject()];
      render(<ProjectsForm data={existingProjects} onChange={mockOnChange} />);

      await user.click(screen.getByText("Add Project"));

      expect(mockOnChange).toHaveBeenCalledWith([
        existingProjects[0],
        expect.objectContaining({
          id: "mock-uuid-456",
        }),
      ]);
    });
  });

  describe("removing projects", () => {
    it("should remove a project when delete button is clicked", async () => {
      const user = userEvent.setup();
      const projects = [createProject()];
      render(<ProjectsForm data={projects} onChange={mockOnChange} />);

      const removeButton = screen.getByLabelText("Remove project");
      await user.click(removeButton);

      expect(mockOnChange).toHaveBeenCalledWith([]);
    });

    it("should remove only the targeted project", async () => {
      const user = userEvent.setup();
      const projects = [
        createProject({ id: "1", name: "First" }),
        createProject({ id: "2", name: "Second" }),
      ];
      render(<ProjectsForm data={projects} onChange={mockOnChange} />);

      const removeButtons = screen.getAllByLabelText("Remove project");
      await user.click(removeButtons[0]);

      expect(mockOnChange).toHaveBeenCalledWith([projects[1]]);
    });
  });

  describe("updating projects", () => {
    it("should update project name", async () => {
      const user = userEvent.setup();
      const projects = [createProject({ name: "" })];
      render(<ProjectsForm data={projects} onChange={mockOnChange} />);

      const nameInput = screen.getByLabelText(/project name/i);
      await user.type(nameInput, "New Project Name");

      expect(mockOnChange).toHaveBeenCalled();
    });

    it("should update project URL", async () => {
      const user = userEvent.setup();
      const projects = [createProject({ url: "" })];
      render(<ProjectsForm data={projects} onChange={mockOnChange} />);

      const urlInput = screen.getByLabelText(/project url/i);
      await user.type(urlInput, "https://example.com");

      expect(mockOnChange).toHaveBeenCalled();
    });

    it("should update start date", async () => {
      const user = userEvent.setup();
      const projects = [createProject({ startDate: "" })];
      render(<ProjectsForm data={projects} onChange={mockOnChange} />);

      const startDateInput = screen.getByLabelText(/start date/i);
      await user.type(startDateInput, "2024-01");

      expect(mockOnChange).toHaveBeenCalled();
    });

    it("should update end date", async () => {
      const user = userEvent.setup();
      const projects = [createProject({ endDate: "" })];
      render(<ProjectsForm data={projects} onChange={mockOnChange} />);

      const endDateInput = screen.getByLabelText(/end date/i);
      await user.type(endDateInput, "2024-12");

      expect(mockOnChange).toHaveBeenCalled();
    });
  });

  describe("managing highlights", () => {
    it("should add a highlight when Add Highlight is clicked", async () => {
      const user = userEvent.setup();
      const projects = [createProject({ highlights: [] })];
      render(<ProjectsForm data={projects} onChange={mockOnChange} />);

      // Find the Add button next to "Key Features / Highlights" label
      const highlightsSection = screen.getByText(/key features/i).closest("div");
      const addButton = highlightsSection?.querySelector("button");
      if (addButton) {
        await user.click(addButton);
      }

      expect(mockOnChange).toHaveBeenCalledWith([
        expect.objectContaining({
          highlights: [""],
        }),
      ]);
    });

    it("should remove a highlight when X is clicked", async () => {
      const user = userEvent.setup();
      const projects = [createProject({ highlights: ["First", "Second"] })];
      render(<ProjectsForm data={projects} onChange={mockOnChange} />);

      const removeHighlightButtons = screen.getAllByLabelText(/remove highlight/i);
      await user.click(removeHighlightButtons[0]);

      expect(mockOnChange).toHaveBeenCalledWith([
        expect.objectContaining({
          highlights: ["Second"],
        }),
      ]);
    });
  });

  describe("managing keywords", () => {
    it("should add a keyword when Add button is clicked", async () => {
      const user = userEvent.setup();
      const projects = [createProject({ keywords: [] })];
      render(<ProjectsForm data={projects} onChange={mockOnChange} />);

      const keywordInput = screen.getByPlaceholderText(/add technology/i);
      await user.type(keywordInput, "Docker");

      const addButtons = screen.getAllByRole("button", { name: /add/i });
      // Find the keyword add button (not the main Add Project button)
      const keywordAddButton = addButtons.find(btn => btn.textContent === "Add");
      if (keywordAddButton) {
        await user.click(keywordAddButton);
      }

      expect(mockOnChange).toHaveBeenCalled();
    });

    it("should remove a keyword when X is clicked", async () => {
      const user = userEvent.setup();
      const projects = [createProject({ keywords: ["React", "Vue"] })];
      render(<ProjectsForm data={projects} onChange={mockOnChange} />);

      const removeKeywordButton = screen.getByLabelText(/remove keyword react/i);
      await user.click(removeKeywordButton);

      expect(mockOnChange).toHaveBeenCalledWith([
        expect.objectContaining({
          keywords: ["Vue"],
        }),
      ]);
    });

    it("should not add empty keyword", async () => {
      const user = userEvent.setup();
      const projects = [createProject({ keywords: [] })];
      render(<ProjectsForm data={projects} onChange={mockOnChange} />);

      const addButtons = screen.getAllByRole("button", { name: /add/i });
      const keywordAddButton = addButtons.find(btn => btn.textContent === "Add");
      if (keywordAddButton) {
        await user.click(keywordAddButton);
      }

      // onChange should not be called for empty keyword
      const calls = mockOnChange.mock.calls;
      const keywordCalls = calls.filter(call => 
        call[0]?.[0]?.keywords?.length > 0
      );
      expect(keywordCalls).toHaveLength(0);
    });
  });

  describe("accessibility", () => {
    it("should have accessible labels for inputs", () => {
      const projects = [createProject()];
      render(<ProjectsForm data={projects} onChange={mockOnChange} />);

      expect(screen.getByLabelText(/project name/i)).toBeDefined();
      expect(screen.getByLabelText(/project url/i)).toBeDefined();
      expect(screen.getByLabelText(/start date/i)).toBeDefined();
      expect(screen.getByLabelText(/end date/i)).toBeDefined();
    });

    it("should have accessible remove button", () => {
      const projects = [createProject()];
      render(<ProjectsForm data={projects} onChange={mockOnChange} />);

      expect(screen.getByLabelText("Remove project")).toBeDefined();
    });
  });

  describe("description field", () => {
    it("should render description editor", () => {
      const projects = [createProject()];
      render(<ProjectsForm data={projects} onChange={mockOnChange} />);

      const descriptionEditors = screen.getAllByTestId("rich-text-editor");
      expect(descriptionEditors.length).toBeGreaterThan(0);
    });

    it("should update description", async () => {
      const user = userEvent.setup();
      const projects = [createProject({ description: "" })];
      render(<ProjectsForm data={projects} onChange={mockOnChange} />);

      const descriptionEditor = screen.getAllByTestId("rich-text-editor")[0];
      await user.type(descriptionEditor, "New description");

      expect(mockOnChange).toHaveBeenCalled();
    });
  });

  describe("date handling", () => {
    it("should accept month-year format for dates", () => {
      const projects = [createProject({ startDate: "2024-01", endDate: "2024-06" })];
      render(<ProjectsForm data={projects} onChange={mockOnChange} />);

      const startDateInput = screen.getByLabelText(/start date/i);
      const endDateInput = screen.getByLabelText(/end date/i);

      expect(startDateInput).toBeDefined();
      expect(endDateInput).toBeDefined();
    });
  });
});
