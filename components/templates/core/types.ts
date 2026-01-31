/**
 * Shared types for core template components
 * These types provide a consistent interface across all templates
 */

import type { LayoutSettings } from "@/db";

/**
 * Font configuration for template rendering
 */
export interface FontConfig {
  base: string;
  bold: string;
  italic: string;
  boldItalic?: string;
}

/**
 * Color configuration resolved from theme settings
 */
export interface ColorConfig {
  primary: string;
  text: string;
  muted: string;
  heading: string;
  link: string;
  decoration: string;
  icon: string;
  background?: string;
}

/**
 * Function type for resolving theme colors based on target
 */
export type GetColorFn = (target: string, fallback?: string) => string;

/**
 * Common props shared by all section components
 */
export interface BaseSectionProps {
  settings: LayoutSettings;
  fonts: FontConfig;
  colors: ColorConfig;
  getColor: GetColorFn;
  fontSize: number;
  lineHeight?: number;
}

/**
 * Section heading style options (1-8)
 */
export type SectionHeadingStyle = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

/**
 * Section heading configuration
 */
export interface SectionHeadingConfig {
  style: SectionHeadingStyle;
  align: "left" | "center" | "right";
  bold: boolean;
  capitalization: "capitalize" | "uppercase" | "lowercase";
  size: "S" | "M" | "L" | "XL";
  showIcon?: boolean;
  iconStyle?: "outline" | "filled";
}

/**
 * List style configuration
 */
export type ListStyle = "bullet" | "number" | "blank" | "dash" | "inline" | "none";

/**
 * Entry layout style options (1-5)
 */
export type EntryLayoutStyle = 1 | 2 | 3 | 4 | 5;

/**
 * Profile image configuration
 */
export interface ProfileImageConfig {
  show: boolean;
  size: "S" | "M" | "L";
  shape: "circle" | "square";
  border: boolean;
  borderColor?: string;
}

/**
 * Text style configuration for individual text elements
 */
export interface TextStyleConfig {
  bold?: boolean;
  italic?: boolean;
  color?: string;
  fontSize?: number;
}

/**
 * Helper to create FontConfig from settings
 */
export function createFontConfig(fontFamily: string): FontConfig {
  return {
    base: fontFamily,
    bold: fontFamily,
    italic: fontFamily,
    boldItalic: fontFamily,
  };
}

/**
 * Helper to create ColorConfig from theme settings
 */
export function createColorConfig(
  themeColor: string,
  themeColorTargets: string[],
  defaults: Partial<ColorConfig> = {}
): ColorConfig {
  const hasTarget = (target: string) => themeColorTargets.includes(target);
  
  return {
    primary: themeColor,
    text: defaults.text ?? "#333333",
    muted: defaults.muted ?? "#666666",
    heading: hasTarget("headings") ? themeColor : (defaults.heading ?? "#1a1a1a"),
    link: hasTarget("links") ? themeColor : (defaults.link ?? "#3b82f6"),
    decoration: hasTarget("decorations") ? themeColor : (defaults.decoration ?? "#000000"),
    icon: hasTarget("icons") ? themeColor : (defaults.icon ?? "#666666"),
    background: defaults.background,
  };
}

/**
 * Helper to create getColor function from ColorConfig
 */
export function createGetColorFn(
  themeColor: string,
  themeColorTargets: string[]
): GetColorFn {
  return (target: string, fallback: string = "#000000") => {
    return themeColorTargets.includes(target) ? themeColor : fallback;
  };
}
