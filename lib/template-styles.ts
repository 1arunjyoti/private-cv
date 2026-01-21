/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Shared style generators for PDF templates
 * Consolidates common styling patterns used across all templates
 */

/**
 * Generate section heading wrapper styles based on settings
 * Supports 8 different visual styles consistently across all templates
 */
export function getSectionHeadingWrapperStyles(
  settings: {
    sectionHeadingAlign?: "left" | "center" | "right";
    sectionHeadingStyle?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  },
  getColorOrTheme: ((target: string) => string) | string,
) {
  // Support both getColor function and direct themeColor string
  const getColor =
    typeof getColorOrTheme === "function"
      ? getColorOrTheme
      : () => getColorOrTheme;
  const baseStyles: any = {
    marginBottom: 5,
    flexDirection: "row",
    justifyContent:
      settings.sectionHeadingAlign === "center"
        ? "center"
        : settings.sectionHeadingAlign === "right"
          ? "flex-end"
          : "flex-start",
    alignItems: "center",
  };

  // Style 1: Solid Underline
  if (settings.sectionHeadingStyle === 1) {
    return {
      ...baseStyles,
      borderBottomWidth: 1,
      borderBottomColor: getColor("decorations"),
      paddingBottom: 3,
    };
  }

  // Style 2: No Decoration (Text only)
  if (settings.sectionHeadingStyle === 2) {
    return baseStyles;
  }

  // Style 3: Double/Bold Underline
  if (settings.sectionHeadingStyle === 3) {
    return {
      ...baseStyles,
      borderBottomWidth: 2,
      borderBottomColor: getColor("decorations"),
      borderStyle: "solid",
      paddingBottom: 3,
    };
  }

  // Style 4: Background Highlight
  if (settings.sectionHeadingStyle === 4) {
    return {
      ...baseStyles,
      backgroundColor: getColor("decorations") + "20",
      paddingVertical: 2,
      paddingHorizontal: 6,
      borderRadius: 3,
    };
  }

  // Style 5: Left Accent
  if (settings.sectionHeadingStyle === 5) {
    return {
      ...baseStyles,
      borderLeftWidth: 2,
      borderLeftColor: getColor("decorations"),
      paddingLeft: 6,
    };
  }

  // Style 6: Top & Bottom Border
  if (settings.sectionHeadingStyle === 6) {
    return {
      ...baseStyles,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderTopColor: getColor("decorations"),
      borderBottomColor: getColor("decorations"),
      paddingVertical: 2,
    };
  }

  // Style 7: Dashed Underline
  if (settings.sectionHeadingStyle === 7) {
    return {
      ...baseStyles,
      borderBottomWidth: 1,
      borderBottomColor: getColor("decorations"),
      borderStyle: "dashed",
      paddingBottom: 3,
    };
  }

  // Style 8: Dotted Underline
  if (settings.sectionHeadingStyle === 8) {
    return {
      ...baseStyles,
      borderBottomWidth: 1,
      borderBottomColor: getColor("decorations"),
      borderStyle: "dotted",
      paddingBottom: 3,
    };
  }

  return baseStyles;
}

/**
 * Generate common entry styles (for job/education entries)
 */
export function getEntryStyles(fontSize: number) {
  return {
    entryBlock: {
      marginBottom: 6,
    },
    entryHeader: {
      flexDirection: "row" as const,
      justifyContent: "space-between" as const,
      alignItems: "baseline" as const,
      marginBottom: 1,
      flexWrap: "wrap" as const,
    },
    entryTitle: {
      fontSize: fontSize + 1,
      fontWeight: "bold" as const,
    },
    entrySubtitle: {
      fontSize: fontSize,
      marginBottom: 2,
    },
    entryDate: {
      fontSize: fontSize,
      textAlign: "right" as const,
      minWidth: 50,
    },
    entrySummary: {
      fontSize: fontSize,
      marginTop: 1,
      marginBottom: 2,
    },
  };
}

/**
 * Generate common bullet list styles
 */
export function getBulletStyles(fontSize: number, bulletMargin: number) {
  return {
    bulletList: {
      marginLeft: 10,
      marginTop: 1,
    },
    bulletItem: {
      flexDirection: "row" as const,
      marginBottom: bulletMargin,
    },
    bullet: {
      width: 8,
      fontSize: fontSize,
    },
    bulletText: {
      flex: 1,
      fontSize: fontSize,
    },
  };
}
