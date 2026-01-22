export type TemplateType = "ats" | "creative" | "modern" | "professional" | "elegant" | "classic" | "glow" | "classic-slate";

export const TEMPLATES: { id: TemplateType; name: string; description: string }[] = [
  {
    id: "classic",
    name: "Classic",
    description: "Timeless, structured, serif layout",
  },
  {
    id: "professional",
    name: "Professional",
    description: "Modern two-column layout, high density",
  },
  {
    id: "classic-slate",
    name: "Classic Slate",
    description: "Elegant two-column layout with bordered sections",
  },
  { id: "creative", 
    name: "Creative", 
    description: "Two-column with sidebar" },
  {
    id: "glow",
    name: "Glow",
    description: "High contrast dark mode style",
  },
  {
    id: "ats",
    name: "ATS Scanner",
    description: "Clean, single-column, ATS-friendly",
  },
  {
    id: "modern",
    name: "Modern",
    description: "Minimalist, typography-focused",
  },
  {
    id: "elegant",
    name: "Elegant",
    description: "Sophisticated with full-width banner",
  },
];

export const THEME_COLORS = [
  { name: "Black", value: "#000000" },
  { name: "Slate", value: "#64748b" },
  { name: "Gray", value: "#9ca3af" },
  { name: "White", value: "#f1f5f9" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Purple", value: "#8b5cf6" },
  { name: "Green", value: "#10b981" },
  { name: "Red", value: "#ef4444" },
  { name: "Orange", value: "#f97316" },
];

export const SECTIONS = [
  { id: "summary", label: "Summary" },
  { id: "education", label: "Education" },
  { id: "skills", label: "Skills" },
  { id: "work", label: "Work Experience" },
  { id: "projects", label: "Projects" },
  { id: "certificates", label: "Certificates" },
  { id: "publications", label: "Publications" },
  { id: "awards", label: "Awards" },
  { id: "languages", label: "Languages" },
  { id: "interests", label: "Interests" },
  { id: "references", label: "References" },
  { id: "custom", label: "Custom Section" }, 
];
