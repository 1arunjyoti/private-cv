/**
 * Example: Creating a new template with ~50 lines using the Template Factory
 *
 * This demonstrates Phase 4 of the template refactoring:
 * - Templates are now just configuration + layout selection
 * - No more duplicating 500+ lines of rendering logic
 * - New templates can be created in minutes, not hours
 */

import { createTemplate, type TemplateConfig } from "@/lib/template-factory";

// ============================================================================
// EXAMPLE 1: Minimal template definition (~15 lines)
// Uses all defaults from the base theme
// ============================================================================

const minimalConfig: TemplateConfig = {
  id: "minimal-example",
  name: "Minimal Example",
  layoutType: "single-column",
  defaultThemeColor: "#333333",
};

export const { Template: MinimalTemplate, generatePDF: generateMinimalPDF } =
  createTemplate(minimalConfig);

// ============================================================================
// EXAMPLE 2: Two-column template with sidebar (~25 lines)
// Customizes layout and section distribution
// ============================================================================

const sidebarConfig: TemplateConfig = {
  id: "sidebar-example",
  name: "Sidebar Example",
  layoutType: "two-column-sidebar-left",
  defaultThemeColor: "#0ea5e9",

  // Customize which sections go in each column
  leftColumnSections: ["skills", "languages", "interests", "certificates"],
  rightColumnSections: [
    "summary",
    "work",
    "education",
    "projects",
    "awards",
    "publications",
    "references",
    "custom",
  ],

  // Override specific theme settings
  themeOverrides: {},
};

export const { Template: SidebarTemplate, generatePDF: generateSidebarPDF } =
  createTemplate(sidebarConfig);

// ============================================================================
// EXAMPLE 3: Creative sidebar layout (~35 lines)
// Uses the creative-sidebar layout with colored background
// ============================================================================

const creativeSidebarConfig: TemplateConfig = {
  id: "creative-sidebar-example",
  name: "Creative Sidebar",
  layoutType: "creative-sidebar",
  defaultThemeColor: "#8b5cf6",

  // Enable colored sidebar background
  sidebarBackground: true,
  sidebarBackgroundColor: "#f3f4f6",

  // Section distribution for creative layout
  leftColumnSections: ["summary", "certificates", "languages", "interests"],
  rightColumnSections: [
    "work",
    "education",
    "skills",
    "projects",
    "awards",
    "publications",
    "references",
    "custom",
  ],

  themeOverrides: {
    fontFamily: "Montserrat",
    sectionHeadingStyle: 5,
    sectionHeadingIcons: "outline",
  },
};

export const {
  Template: CreativeSidebarTemplate,
  generatePDF: generateCreativeSidebarPDF,
} = createTemplate(creativeSidebarConfig);

// ============================================================================
// EXAMPLE 4: Developer-focused template (~40 lines)
// Emphasizes skills and projects
// ============================================================================

const developerConfig: TemplateConfig = {
  id: "developer-focused",
  name: "Developer Focused",
  layoutType: "single-column",
  baseTheme: "developer", // Inherit from existing developer theme
  defaultThemeColor: "#22c55e",

  themeOverrides: {
    // Prioritize technical sections
    sectionOrder: [
      "summary",
      "skills",
      "projects",
      "work",
      "education",
      "certificates",
      "languages",
      "publications",
      "awards",
      "interests",
      "references",
      "custom",
    ],

    // Developer-specific styling
    skillsDisplayStyle: "level",
    skillsLevelStyle: 2,
    projectsTechnologiesBold: true,
    projectsAchievementsListStyle: "bullet",

    // Clean code-like aesthetic
    fontFamily: "Roboto",
    sectionHeadingStyle: 4,
    sectionHeadingCapitalization: "uppercase",
  },
};

export const {
  Template: DeveloperFocusedTemplate,
  generatePDF: generateDeveloperFocusedPDF,
} = createTemplate(developerConfig);

// ============================================================================
// EXAMPLE 5: Executive template (~45 lines)
// Formal, serif-based for senior positions
// ============================================================================

const executiveConfig: TemplateConfig = {
  id: "executive",
  name: "Executive",
  layoutType: "single-column-centered",
  baseTheme: "elegant",
  defaultThemeColor: "#1e293b",

  themeOverrides: {
    // Traditional serif typography
    fontFamily: "Times-Roman",
    nameFontSize: 28,
    nameLineHeight: 1.1,
    nameBold: true,
    titleFontSize: 14,
    titleItalic: true,

    // Formal section styling
    sectionHeadingStyle: 3,
    sectionHeadingCapitalization: "uppercase",
    sectionHeadingAlign: "left",

    // Executive-appropriate section order
    sectionOrder: [
      "summary",
      "work",
      "education",
      "skills",
      "awards",
      "publications",
      "certificates",
      "languages",
      "references",
      "interests",
      "custom",
    ],

    // Subtle styling
    entrySubtitleStyle: "italic",
    experiencePositionItalic: true,
  },
};

export const {
  Template: ExecutiveTemplate,
  generatePDF: generateExecutivePDF,
} = createTemplate(executiveConfig);

// ============================================================================
// COMPARISON: Line counts
// ============================================================================
//
// Old approach (e.g., ClassicTemplate.tsx):     ~375 lines
// Old approach (e.g., ProfessionalTemplate.tsx): ~537 lines
// Old approach (e.g., CreativeTemplate.tsx):     ~282 lines
//
// New approach with factory:
// - MinimalTemplate:         ~10 lines of config
// - SidebarTemplate:         ~20 lines of config
// - CreativeSidebarTemplate: ~25 lines of config
// - DeveloperFocusedTemplate: ~40 lines of config
// - ExecutiveTemplate:       ~45 lines of config
//
// Benefits:
// 1. 80-95% reduction in code per template
// 2. Consistent behavior across all templates
// 3. Easy to add new customization options globally
// 4. Changes to core components automatically apply everywhere
// 5. New templates can be created in minutes
// ============================================================================
