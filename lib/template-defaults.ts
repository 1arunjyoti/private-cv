/**
 * Template Defaults - Migrated to Factory Template System
 * 
 * This file provides a compatibility layer for retrieving template-specific
 * default settings. All template configurations now use the composable theme
 * system and factory pattern for consistency and maintainability.
 * 
 * Architecture:
 * - Theme configurations: lib/theme-system.ts (composable presets)
 * - Template factory: lib/template-factory.tsx (rendering logic)
 * - Template metadata: lib/templates-data.ts (UI display)
 * 
 * The new system reduces template definitions from ~150 lines to ~50 lines
 * by using composable presets and deep merge inheritance.
 */

import { LayoutSettings } from "@/components/design/types";
import { getCompiledTheme, COMPILED_THEMES } from "./theme-system";
import { TEMPLATE_CONFIGS } from "./template-factory";

/**
 * Get default layout settings for a specific template
 * 
 * Uses the composable theme system from lib/theme-system.ts which provides:
 * - Composable presets (typography, headings, layouts, entries)
 * - Deep merge inheritance to eliminate duplication
 * - ~50 lines per template instead of ~150+
 * 
 * All templates are now defined using the factory pattern in theme-system.ts.
 * This function provides backwards compatibility for existing code.
 * 
 * @param templateId The template identifier (e.g., 'ats', 'classic', 'creative')
 * @returns Complete layout settings with template-specific defaults
 */
export function getTemplateDefaults(templateId: string = 'ats'): Partial<LayoutSettings> {
  // Get from compiled themes (pre-compiled for performance)
  if (COMPILED_THEMES[templateId]) {
    return COMPILED_THEMES[templateId];
  }
  
  // Fallback to ATS if template not found
  console.warn(`Template "${templateId}" not found, falling back to ATS`);
  return getCompiledTheme('ats');
}

/**
 * Get default theme color for a specific template
 * 
 * Theme colors are now defined in the template factory configuration
 * (lib/template-factory.tsx). This provides a single source of truth
 * for both template rendering and UI display.
 * 
 * @param templateId The template identifier
 * @returns Hex color code for the template's default theme
 */
export function getTemplateThemeColor(templateId: string = 'ats'): string {
  // Get from factory config if available
  const config = TEMPLATE_CONFIGS[templateId];
  if (config?.defaultThemeColor) {
    return config.defaultThemeColor;
  }
  
  // Fallback to blue (ATS default)
  return '#2563eb';
}
