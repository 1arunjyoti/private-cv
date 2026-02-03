# Template Development Guide

Complete guide for creating and modifying resume templates in SecureCV.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Quick Start: Add a New Template](#quick-start-add-a-new-template)
- [Modify an Existing Template](#modify-an-existing-template)
- [Configuration Reference](#configuration-reference)
- [Preset Reference](#preset-reference)
- [Advanced Customization](#advanced-customization)
- [Testing & Troubleshooting](#testing--troubleshooting)

---

## Architecture Overview

The template system uses a **factory pattern** with **composable themes**. Instead of writing hundreds of lines of custom PDF rendering code, you define configuration objects (~20-50 lines) that describe your template's appearance.

```
Template = TemplateConfig + ThemeConfig + Core Components
                ↓               ↓              ↓
         Layout & Colors    Styling      Shared Rendering
```

### System Files

| File | Purpose | When to Edit |
|------|---------|--------------|
| `lib/theme-system.ts` | Theme presets and `TEMPLATE_THEMES` | Styling changes (fonts, headings, spacing) |
| `components/templates/FactoryTemplates.tsx` | Template configs and exports | Layout changes (columns, backgrounds, sections) |
| `lib/constants.ts` | Template registry for UI | Adding/removing templates |
| `lib/template-factory.tsx` | Core rendering engine | Rarely - only for new features |

### Configuration Hierarchy (Priority: High → Low)

1. **TemplateConfig** (`FactoryTemplates.tsx`) - Layout, columns, backgrounds
2. **ThemeConfig overrides** (`theme-system.ts` → `TEMPLATE_THEMES[id].overrides`)
3. **Preset defaults** (`theme-system.ts` → `*_PRESETS`)
4. **Base theme** (`theme-system.ts` → `BASE_THEME`)

---

## Quick Start: Add a New Template

### Step 1: Define Theme (`lib/theme-system.ts`)

Add to `TEMPLATE_THEMES` object (~line 600):

```typescript
export const TEMPLATE_THEMES: Record<string, ThemeConfig> = {
  // ... existing templates ...

  myTemplate: {
    typography: "modern",      // Font family & sizes
    headings: "underline",     // Section heading style
    layout: "singleColumn",    // Column configuration
    entries: "compact",        // Work/education entry style
    contact: "iconPipe",       // Contact info display
    overrides: {
      // Custom overrides (optional)
      headerBottomMargin: 15,
      skillsDisplayStyle: "bubble",
    },
  },
};
```

### Step 2: Create Template Config (`components/templates/FactoryTemplates.tsx`)

Add configuration and create template:

```typescript
// Add after existing configs (~line 280)
const myTemplateConfig: TemplateConfig = {
  id: "myTemplate",              // Must match TEMPLATE_THEMES key
  name: "My Template",
  layoutType: "single-column",
  defaultThemeColor: "#3b82f6",
};

// Create template instance
const myTemplate = createTemplate(myTemplateConfig);

// Add exports for backwards compatibility
export const MyTemplate = myTemplate.Template;
export const generateMyTemplatePDF = myTemplate.generatePDF;

// Add to FACTORY_TEMPLATES registry (~line 470)
export const FACTORY_TEMPLATES = {
  // ... existing templates ...
  myTemplate: myTemplate,
};
```

### Step 3: Register in Constants (`lib/constants.ts`)

```typescript
// Add to TemplateType union
export type TemplateType = "ats" | ... | "myTemplate";

// Add to TEMPLATES array
export const TEMPLATES = [
  // ... existing templates ...
  {
    id: "myTemplate",
    name: "My Template",
    description: "Brief description for template picker",
  },
];
```

### Step 4: Test

```bash
npm run dev
```

Navigate to `/editor` and select your template from the design settings.

---

## Modify an Existing Template

### Quick Styling Changes

Edit `lib/theme-system.ts` → `TEMPLATE_THEMES`:

```typescript
classic: {
  typography: "modern",         // Change font preset
  headings: "filled",           // Change heading style
  // ...
  overrides: {
    headerBottomMargin: 20,     // Add custom spacing
    skillsDisplayStyle: "bubble",
  }
}
```

### Layout & Structure Changes

Edit `components/templates/FactoryTemplates.tsx`:

```typescript
const classicConfig: TemplateConfig = {
  id: "classic",
  layoutType: "two-column-sidebar-left",  // Change layout
  sidebarBackground: true,                 // Add sidebar background
  sidebarBackgroundColor: "#f4f4f0",
  leftColumnSections: ["skills", "education"],
  rightColumnSections: ["summary", "work", "projects"],
};
```

---

## Configuration Reference

### Layout Types

| Type | Description | Use Case |
|------|-------------|----------|
| `single-column` | Traditional single column | ATS-friendly, classic resumes |
| `single-column-centered` | Single column, centered header | Traditional academic style |
| `two-column-sidebar-left` | Narrow sidebar on left | Skills-focused layouts |
| `two-column-sidebar-right` | Narrow sidebar on right | Experience-focused layouts |
| `two-column-equal` | Two equal-width columns | Balanced layouts |
| `three-column` | Three columns | Dense information display |
| `creative-sidebar` | Sidebar with background color | Modern creative designs |

### TemplateConfig Properties

```typescript
interface TemplateConfig {
  // Required
  id: string;                    // Unique identifier (match TEMPLATE_THEMES key)
  name: string;                  // Display name
  layoutType: LayoutType;        // Layout structure

  // Common
  baseTheme?: string;            // Base theme to inherit (defaults to id)
  defaultThemeColor?: string;    // Default accent color (hex)
  themeOverrides?: Partial<LayoutSettings>; // Additional style overrides
  customStyles?: Record<string, object>;    // Custom PDF styles

  // Column Configuration
  leftColumnSections?: string[]; // Sections for left/sidebar column
  rightColumnSections?: string[];// Sections for right/main column
  middleColumnSections?: string[];// For three-column layouts

  // Full-Width Header
  fullWidthHeader?: boolean;             // Header spans full page width
  headerBackgroundColor?: string;        // Header background color
  headerTextColor?: string;              // Header text color

  // Sidebar Styling (left column)
  sidebarBackground?: boolean;           // Enable sidebar background
  sidebarBackgroundColor?: string;       // Sidebar background color
  sidebarTextColor?: string;             // Text color in sidebar
  sidebarPaddingLeft?: number;           // Left padding (default 0)
  sidebarPaddingRight?: number;          // Right padding (default 30)

  // Right Column Styling
  rightColumnBackgroundColor?: string;   // Right column background
  rightColumnTextColor?: string;         // Right column text color
  rightColumnPaddingLeft?: number;       // Left padding (default 12)
  rightColumnPaddingRight?: number;      // Right padding (default 0)

  // Page Styling
  pageBackgroundColor?: string;          // Overall page background
  cardBackgroundColor?: string;          // Section card background
  cardBorderColor?: string;              // Section card border

  // Custom Header
  headerComponent?: React.ComponentType<HeaderProps>; // Custom header component
}
```

### Section IDs

Available sections for column assignment:

| ID | Content |
|----|---------|
| `summary` | Professional summary |
| `work` | Work experience |
| `education` | Education history |
| `skills` | Skills list |
| `projects` | Projects |
| `certificates` | Certifications |
| `languages` | Language proficiency |
| `interests` | Personal interests |
| `publications` | Published works |
| `awards` | Awards & achievements |
| `references` | References |
| `custom` | User-defined sections |

---

## Preset Reference

### Typography Presets

| Preset | Font | Style |
|--------|------|-------|
| `modern` | Open Sans | Clean sans-serif, 32pt name |
| `classic` | Times-Roman | Traditional serif, letter-spaced name |
| `professional` | Roboto | Clean professional, 28pt name |
| `creative` | Montserrat | Bold geometric, 30pt name |
| `ats` | Roboto | ATS-friendly, larger sizes |
| `minimal` | Helvetica | Clean minimal, 24pt name |
| `monospace` | Courier | Developer/code style, 26pt name |

### Heading Presets

| Preset | Visual | Style # |
|--------|--------|---------|
| `plain` | `TITLE` | 1 |
| `bottomBorder` | `TITLE ─` | 2 |
| `underline` | `TITLE ═` | 3 |
| `filled` | `▐TITLE▌` | 4 |
| `accent` | `│ TITLE` | 5 |
| `framed` | `─TITLE─` | 6 |
| `code` | `# Title` | 9 |

### Layout Presets

| Preset | Columns | Header |
|--------|---------|--------|
| `singleColumn` | 1 | Left-aligned |
| `singleColumnCentered` | 1 | Centered |
| `twoColumnLeft` | 2 (30% left) | Left-aligned |
| `twoColumnWide` | 2 (35% left) | Centered |
| `threeColumn` | 3 (25% left) | Left-aligned |

### Entry Presets

| Preset | Subtitle Position | Style |
|--------|-------------------|-------|
| `traditional` | Next line | Italic subtitle |
| `compact` | Same line | Normal subtitle |
| `modern` | Same line | Bold subtitle |
| `timeline` | Left column | Date in left column |

### Contact Presets

| Preset | Separator | Icons |
|--------|-----------|-------|
| `iconPipe` | `\|` | Yes |
| `iconDash` | `-` | Yes |
| `bullet` | `•` | No |
| `bar` | `\|` | No |

---

## Advanced Customization

### Custom Header Component

For unique headers (like wave designs or vertical layouts):

```typescript
// components/templates/headers/MyHeader.tsx
import { View, Text } from "@react-pdf/renderer";
import type { HeaderProps } from "@/lib/template-factory";

export const MyHeader: React.FC<HeaderProps> = ({
  basics,
  settings,
  fonts,
  getColor,
  fontSize,
  headerTextColor,
}) => {
  return (
    <View>
      <Text style={{ 
        color: headerTextColor || getColor("name"),
        fontSize: settings.nameFontSize,
        fontFamily: fonts.body,
      }}>
        {basics.name}
      </Text>
      {/* Custom layout */}
    </View>
  );
};

// Use in TemplateConfig:
const myConfig: TemplateConfig = {
  id: "myTemplate",
  name: "My Template",
  layoutType: "creative-sidebar",
  headerComponent: MyHeader,
  // ...
};
```

### Theme Color Targeting

Control which elements use the accent color:

```typescript
overrides: {
  themeColorTarget: [
    "headings",      // Section headings
    "links",         // URLs and links
    "icons",         // Contact icons
    "decorations",   // Borders, lines
    "name",          // Name in header
  ]
}
```

### Dark Theme Example

```typescript
const darkTemplateConfig: TemplateConfig = {
  id: "dark",
  name: "Dark",
  layoutType: "creative-sidebar",
  defaultThemeColor: "#38bdf8",
  pageBackgroundColor: "#0f172a",
  cardBackgroundColor: "#1e293b",
  cardBorderColor: "#334155",
  headerTextColor: "#e2e8f0",
  sidebarTextColor: "#e2e8f0",
  rightColumnTextColor: "#e2e8f0",
};
```

### Common Style Overrides

The `overrides` object in ThemeConfig and `themeOverrides` in TemplateConfig accept any `LayoutSettings` property:

#### Core Typography
```typescript
{
  fontSize: 9,                    // Base font size (8-12)
  lineHeight: 1.3,                // Line height (1.2-1.8)
  fontFamily: "Open Sans",        // Font family
}
```

#### Page Layout
```typescript
{
  marginHorizontal: 12,           // Horizontal margins (0-30mm)
  marginVertical: 12,             // Vertical margins (0-30mm)
  columnCount: 1 | 2 | 3,         // Number of columns
  headerPosition: "top" | "left" | "right" | "sidebar",
  leftColumnWidth: 30,            // Left column width percentage (20-80)
  middleColumnWidth: 35,          // Middle column width (for 3-col)
}
```

#### Spacing
```typescript
{
  sectionMargin: 8,               // Space between sections (8-20)
  headerBottomMargin: 15,         // Space after header (0-50)
  bulletMargin: 2,                // Bullet list margin (2-8)
  useBullets: true,               // Enable bullet points
}
```

#### Name/Title Styling
```typescript
{
  nameFontSize: 28,               // Name font size
  nameLineHeight: 1.2,            // Name line height
  nameBold: true,                 // Bold name
  nameItalic: false,              // Italic name
  nameFont: "body" | "creative",  // Name font style
  nameLetterSpacing: 0,           // Letter spacing
  
  titleFontSize: 12,              // Job title font size
  titleLineHeight: 1.2,           // Title line height
  titleBold: false,               // Bold title
  titleItalic: true,              // Italic title
  
  contactFontSize: 10,            // Contact info font size
  contactBold: false,             // Bold contact
  contactItalic: false,           // Italic contact
  contactLineHeight: 1.4,         // Contact line height
  contactSeparator: "pipe" | "dash" | "comma",
  contactSeparatorGap: 8,         // Gap around separator
  contactLinkUnderline: false,    // Underline links
}
```

#### Section Headings
```typescript
{
  sectionHeadingStyle: 1-9,       // Visual style (see Heading Presets)
  sectionHeadingAlign: "left" | "center" | "right",
  sectionHeadingCapitalization: "capitalize" | "uppercase",
  sectionHeadingBold: true,
  sectionHeadingSize: "S" | "M" | "L" | "XL",
  sectionHeadingIcons: "none" | "outline" | "filled",
  sectionHeadingLetterSpacing: 0.8,
  sectionDisplayStyle: "plain" | "card",  // Card adds background/border
}
```

#### Heading Visibility (per section)
```typescript
{
  summaryHeadingVisible: true,
  workHeadingVisible: true,
  educationHeadingVisible: true,
  skillsHeadingVisible: true,
  projectsHeadingVisible: true,
  certificatesHeadingVisible: true,
  languagesHeadingVisible: true,
  interestsHeadingVisible: true,
  publicationsHeadingVisible: true,
  awardsHeadingVisible: true,
  referencesHeadingVisible: true,
  customHeadingVisible: true,
}
```

#### Entry Layout (Work/Education/Projects)
```typescript
{
  entryLayoutStyle: 1-5,          // Layout variant
  entryColumnWidth: "auto" | "manual",
  entryTitleSize: "S" | "M" | "L",
  entrySubtitleStyle: "normal" | "bold" | "italic",
  entrySubtitlePlacement: "sameLine" | "nextLine",
  entryIndentBody: false,
  entryListStyle: "bullet" | "hyphen",
}
```

#### Personal Details / Contact
```typescript
{
  personalDetailsAlign: "left" | "center" | "right",
  personalDetailsArrangement: 1 | 2,  // Layout arrangement
  personalDetailsContactStyle: "icon" | "bullet" | "bar",
  personalDetailsIconStyle: 1-8,      // Icon variant
}
```

#### Profile Photo
```typescript
{
  profilePhotoPosition: "left" | "right",
  profilePhotoShape: "circle" | "rounded" | "square",
  profilePhotoSize: 80,           // Size in points (40-150)
}
```

#### Link Display
```typescript
{
  linkShowIcon: false,            // Show 🔗 before links
  linkShowFullUrl: false,         // Show full URL
}
```

#### Skills
```typescript
{
  skillsDisplayStyle: "grid" | "level" | "compact" | "bubble" | "boxed",
  skillsLevelStyle: 0-4,          // Proficiency indicator style
  skillsListStyle: "bullet" | "dash" | "inline" | "blank" | "number",
}
```

#### Certificates
```typescript
{
  certificatesDisplayStyle: "grid" | "compact" | "bubble",
  certificatesLevelStyle: 1-4,
}
```

#### Theme Color Targeting
```typescript
{
  themeColorTarget: [
    "name",          // Name in header
    "title",         // Job title
    "headings",      // Section headings
    "links",         // URLs and links
    "icons",         // Contact icons
    "decorations",   // Borders, lines, accents
  ]
}
```

#### Section Order
```typescript
{
  sectionOrder: [
    "summary", "work", "education", "skills", "projects",
    "certificates", "languages", "interests", "publications",
    "awards", "references", "custom",
  ],
}
```

#### Per-Section Typography Styles

Each section has detailed typography controls. Example for Work Experience:

```typescript
{
  // Work Experience
  experienceCompanyListStyle: "bullet" | "number" | "none",
  experienceCompanyBold: true,
  experienceCompanyItalic: false,
  experiencePositionBold: true,
  experiencePositionItalic: false,
  experienceWebsiteBold: false,
  experienceWebsiteItalic: false,
  experienceDateBold: false,
  experienceDateItalic: false,
  experienceAchievementsListStyle: "bullet" | "number" | "none",
  experienceAchievementsBold: false,
  experienceAchievementsItalic: false,
}
```

Similar patterns exist for:
- `education*` - Institution, Degree, Area, Date, GPA, Courses
- `projects*` - Name, Date, Technologies, Achievements, Features, URL
- `certificates*` - Name, Issuer, Date, URL
- `publications*` - Name, Publisher, URL, Date
- `awards*` - Title, Awarder, Date
- `references*` - Name, Position
- `languages*` - Name, Fluency
- `interests*` - Name, Keywords
- `customSection*` - Name, Description, Date, URL

---

## Testing & Troubleshooting

### Testing Checklist

- [ ] Test with minimal data (just name and one job)
- [ ] Test with extensive data (multiple jobs, education, skills)
- [ ] Test with rich text (bold, italic, bullets)
- [ ] Test with and without profile image
- [ ] Test different theme colors
- [ ] Verify page breaks with long content
- [ ] Download PDF and verify print quality

### Common Issues

**Styles not applying:**
1. Check configuration hierarchy (TemplateConfig > ThemeConfig > Presets)
2. Verify property names match `LayoutSettings` interface
3. Ensure template ID matches in both files

**Layout problems:**
1. Check `layoutType` matches intended structure
2. Verify column section assignments don't overlap
3. Test with different content amounts

**Typography issues:**
1. Ensure font is registered in `lib/fonts.ts`
2. Check fontSize relationships (name > title > contact)
3. Verify preset is correctly referenced

**Colors not showing:**
1. Check `themeColorTarget` includes the target element
2. Verify `defaultThemeColor` is set
3. Ensure `getColor` is called in custom components

### Spacing Guidelines

| Template Style | sectionMargin | headerBottomMargin | bulletMargin |
|----------------|---------------|---------------------|--------------|
| Compact | 4-6 | 8-10 | 1-2 |
| Standard | 8-10 | 12-15 | 2-3 |
| Spacious | 12-16 | 18-24 | 3-4 |

---

## Existing Templates Reference

| ID | Layout | Key Features |
|----|--------|--------------|
| `ats` | Single column | ATS-friendly, clean |
| `classic` | Single centered | Serif font, traditional |
| `modern` | Single column | Sans-serif, minimal |
| `creative` | Creative sidebar | Two-column, colored sidebar |
| `professional` | Two-column left | Filled headings |
| `elegant` | Single column | Sophisticated, full banner |
| `classic-slate` | Two-column left | Bordered sections |
| `glow` | Single column | Dark header, high contrast |
| `multicolumn` | Three column | Dense layout |
| `stylish` | Two-column | Wave header |
| `timeline` | Single column | Timeline entries |
| `polished` | Creative sidebar | Colored right column |
| `developer` | Creative sidebar | Dark theme, code style |
| `developer2` | Creative sidebar | Vertical name, dark |

---

## Submission Checklist

Before submitting a new template:

- [ ] Theme added to `TEMPLATE_THEMES` in `lib/theme-system.ts`
- [ ] Config added to `FactoryTemplates.tsx`
- [ ] Template created with `createTemplate(config)`
- [ ] Exports added (Component + PDF generator)
- [ ] Added to `FACTORY_TEMPLATES` registry
- [ ] Type added to `TemplateType` in `lib/constants.ts`
- [ ] Entry added to `TEMPLATES` array
- [ ] Tested with minimal and extensive data
- [ ] Tested theme color changes
- [ ] PDF renders without errors
- [ ] No content overflow issues

---

**Happy template designing! 🎨**
