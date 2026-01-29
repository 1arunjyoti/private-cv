/**
 * RichText - Universal rich text component with markdown-like formatting
 *
 * Wraps PDFRichText with standardized props
 */

import React from "react";
import { PDFRichText } from "../../PDFRichText";
import type { FontConfig } from "../types";

export interface RichTextProps {
  text: string;
  fontSize: number;
  fonts: FontConfig;
  lineHeight?: number;
  color?: string;
  linkColor?: string;
  showLinkIcon?: boolean;
  showFullUrl?: boolean;
  style?: object;
}

export const RichText: React.FC<RichTextProps> = ({
  text,
  fontSize,
  fonts,
  lineHeight = 1.3,
  color = "#444444",
  linkColor,
  showLinkIcon,
  showFullUrl,
  style,
}) => {
  if (!text) return null;

  return (
    <PDFRichText
      text={text}
      fontSize={fontSize}
      fontFamily={fonts.base}
      boldFontFamily={fonts.bold}
      italicFontFamily={fonts.italic}
      boldItalicFontFamily={fonts.boldItalic}
      linkColor={linkColor}
      showLinkIcon={showLinkIcon}
      showFullUrl={showFullUrl}
      style={{
        fontSize,
        color,
        lineHeight,
        ...style,
      }}
    />
  );
};

export default RichText;
