import { type LayoutSettings as DBLayoutSettings } from "@/db";

export type LayoutSettings = DBLayoutSettings;
export type LayoutSettingValue = string | number | boolean | string[] | Record<string, string>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TemplateStyles = any;
