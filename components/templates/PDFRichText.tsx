/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Link, Text, View } from "@react-pdf/renderer";
import { Style } from "@react-pdf/types";

// Define a recursive style type to match React-PDF's behavior
type PdfStyle = Style | Style[];

interface PDFRichTextProps {
  text: string;
  style?: PdfStyle;
  fontSize?: number;
  fontFamily?: string;
  boldFontFamily?: string;
  italicFontFamily?: string;
  boldItalicFontFamily?: string;
  linkColor?: string;
  showLinkIcon?: boolean;
  showFullUrl?: boolean;
}

interface Context {
  fontSize: number;
  fontFamily: string;
  boldFontFamily: string;
  italicFontFamily: string;
  boldItalicFontFamily: string;
  style: PdfStyle;
  linkColor: string;
  showLinkIcon: boolean;
  showFullUrl: boolean;
  /** Tracks active styles for font selection */
  isBold: boolean;
  isItalic: boolean;
}

export const PDFRichText = ({
  text,
  style,
  fontSize = 10,
  fontFamily = "Times-Roman",
  boldFontFamily = "Times-Bold",
  italicFontFamily = "Times-Italic",
  boldItalicFontFamily,
  linkColor = "#3b82f6",
  showLinkIcon = false,
  showFullUrl = false,
}: PDFRichTextProps) => {
  if (!text) return null;

  // Use boldFontFamily as fallback for boldItalic if not provided
  const finalBoldItalic = boldItalicFontFamily || boldFontFamily;

  const ctx: Context = {
    fontSize,
    fontFamily,
    boldFontFamily,
    italicFontFamily,
    boldItalicFontFamily: finalBoldItalic,
    style: style || {},
    linkColor,
    showLinkIcon,
    showFullUrl,
    isBold: false,
    isItalic: false,
  };

  const lines = text.split("\n");

  return (
    <View style={{ flexDirection: "column" }}>
      {lines.map((line, lineIndex) => {
        // Handle Lists
        if (line.trim().startsWith("- ")) {
          const content = line.trim().substring(2);
          return (
            <View
              key={lineIndex}
              style={{ flexDirection: "row", marginLeft: 10, marginBottom: 2 }}
            >
              <Text
                style={[
                  { fontSize, fontFamily, marginRight: 5 },
                  ctx.style as any,
                ]}
              >
                •
              </Text>
              <Text
                style={[{ flex: 1, fontSize, fontFamily }, ctx.style as any]}
              >
                {renderBold(content, ctx)}
              </Text>
            </View>
          );
        }

        if (!line.trim()) {
          return <View key={lineIndex} style={{ height: fontSize * 0.5 }} />;
        }

        let align: any = "justify";
        let lineContent = line;

        if (line.includes('align="center"')) align = "center";
        else if (line.includes('align="right"')) align = "right";
        else if (line.includes('align="left"')) align = "left";
        else if (line.includes('align="justify"')) align = "justify";

        if (line.includes("<div")) {
          lineContent = lineContent
            .replace(/<div[^>]*>/g, "")
            .replace(/<\/div>/g, "");
        }

        return (
          <View key={lineIndex} style={{ marginBottom: 2 }}>
            <Text
              style={[
                { textAlign: align, fontSize, fontFamily },
                ctx.style as any,
              ]}
            >
              {renderBold(lineContent, ctx)}
            </Text>
          </View>
        );
      })}
    </View>
  );
};

const getFontForContext = (ctx: Context) => {
  if (ctx.isBold && ctx.isItalic) return ctx.boldItalicFontFamily;
  if (ctx.isBold) return ctx.boldFontFamily;
  if (ctx.isItalic) return ctx.italicFontFamily;
  return ctx.fontFamily;
};

const renderBold = (text: string, ctx: Context) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length >= 4) {
      const content = part.substring(2, part.length - 2);
      const newCtx = { ...ctx, isBold: true };
      return (
        <Text
          key={i}
          style={{ fontFamily: getFontForContext(newCtx), fontWeight: "bold" }}
        >
          {renderItalic(content, newCtx)}
        </Text>
      );
    }
    return renderItalic(part, ctx);
  });
};

const renderItalic = (text: string, ctx: Context) => {
  const parts = text.split(/(\*.*?\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("*") && part.endsWith("*") && part.length >= 2) {
      const content = part.substring(1, part.length - 1);
      const newCtx = { ...ctx, isItalic: true };
      return (
        <Text
          key={i}
          style={{ fontFamily: getFontForContext(newCtx), fontStyle: "italic" }}
        >
          {renderUnderline(content, newCtx)}
        </Text>
      );
    }
    return renderUnderline(part, ctx);
  });
};

const renderUnderline = (text: string, ctx: Context) => {
  const parts = text.split(/(<u>.*?<\/u>)/g);
  return parts.map((part, i) => {
    if (part.startsWith("<u>") && part.endsWith("</u>")) {
      const content = part.substring(3, part.length - 4);
      return (
        <Text key={i} style={{ textDecoration: "underline" }}>
          {renderLink(content, ctx)}
        </Text>
      );
    }
    return renderLink(part, ctx);
  });
};

const renderLink = (text: string, ctx: Context) => {
  const parts = text.split(/(\[.*?\]\(.*?\))/g);
  return parts.map((part, i) => {
    if (part.startsWith("[") && part.includes("](") && part.endsWith(")")) {
      const split = part.slice(1, -1).split("](");
      if (split.length === 2) {
        const linkText = split[0];
        const linkUrl = split[1];
        // Determine display text based on options
        const displayText = ctx.showFullUrl ? linkUrl : linkText;
        const iconPrefix = ctx.showLinkIcon ? "🔗 " : "";
        return (
          <Link
            key={i}
            src={linkUrl}
            style={{
              color: ctx.linkColor,
              textDecoration: "none",
            }}
          >
            {iconPrefix}
            {renderText(displayText, ctx)}
          </Link>
        );
      }
    }
    return renderText(part, ctx);
  });
};

const renderText = (text: string, ctx: Context) => {
  if (!text) return null;
  // Return just the string or a Text node that ONLY manages font if we're deeper
  // But React-PDF handles nesting well if we just return the string here since it's already inside a Text
  return text;
};
