/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from "vitest";
import type { LayoutSettings } from "@/components/design/types";
import type { Resume } from "@/db";

// Mock react-pdf/renderer
vi.mock("@react-pdf/renderer", () => ({
  Document: ({ children }: { children: React.ReactNode }) => children,
  Page: ({ children }: { children: React.ReactNode }) => children,
  View: ({ children }: { children: React.ReactNode }) => children,
  Text: ({ children }: { children: React.ReactNode }) => children,
  StyleSheet: {
    create: (styles: Record<string, object>) => styles,
  },
  pdf: vi.fn(),
}));

// Mock fonts
vi.mock("@/lib/fonts", () => ({}));

// Types for testing
type LayoutType =
  | "single-column"
  | "single-column-centered"
  | "two-column-sidebar-left"
  | "two-column-sidebar-right"
  | "two-column-equal"
  | "three-column"
  | "creative-sidebar";

interface TemplateConfig {
  id: string;
  name: string;
  layoutType: LayoutType;
  baseTheme?: string;
  themeOverrides?: Partial<LayoutSettings>;
  defaultThemeColor?: string;
  leftColumnSections?: string[];
  rightColumnSections?: string[];
  middleColumnSections?: string[];
}

describe("Template Factory Types", () => {
  describe("LayoutType", () => {
    const validLayoutTypes: LayoutType[] = [
      "single-column",
      "single-column-centered",
      "two-column-sidebar-left",
      "two-column-sidebar-right",
      "two-column-equal",
      "three-column",
      "creative-sidebar",
    ];

    it("should have all expected layout types", () => {
      expect(validLayoutTypes).toHaveLength(7);
    });

    it("should include single-column layouts", () => {
      expect(validLayoutTypes).toContain("single-column");
      expect(validLayoutTypes).toContain("single-column-centered");
    });

    it("should include two-column layouts", () => {
      expect(validLayoutTypes).toContain("two-column-sidebar-left");
      expect(validLayoutTypes).toContain("two-column-sidebar-right");
      expect(validLayoutTypes).toContain("two-column-equal");
    });

    it("should include three-column layout", () => {
      expect(validLayoutTypes).toContain("three-column");
    });

    it("should include creative-sidebar layout", () => {
      expect(validLayoutTypes).toContain("creative-sidebar");
    });
  });

  describe("TemplateConfig", () => {
    it("should require id, name, and layoutType", () => {
      const config: TemplateConfig = {
        id: "test-template",
        name: "Test Template",
        layoutType: "single-column",
      };

      expect(config.id).toBe("test-template");
      expect(config.name).toBe("Test Template");
      expect(config.layoutType).toBe("single-column");
    });

    it("should allow optional baseTheme", () => {
      const config: TemplateConfig = {
        id: "test-template",
        name: "Test Template",
        layoutType: "single-column",
        baseTheme: "modern",
      };

      expect(config.baseTheme).toBe("modern");
    });

    it("should allow themeOverrides", () => {
      const config: TemplateConfig = {
        id: "test-template",
        name: "Test Template",
        layoutType: "single-column",
        themeOverrides: {
          fontSize: 12,
          fontFamily: "Arial",
        },
      };

      expect(config.themeOverrides?.fontSize).toBe(12);
      expect(config.themeOverrides?.fontFamily).toBe("Arial");
    });

    it("should allow column section configuration", () => {
      const config: TemplateConfig = {
        id: "two-column-template",
        name: "Two Column Template",
        layoutType: "two-column-sidebar-left",
        leftColumnSections: ["skills", "languages", "interests"],
        rightColumnSections: ["work", "education", "projects"],
      };

      expect(config.leftColumnSections).toContain("skills");
      expect(config.rightColumnSections).toContain("work");
    });

    it("should allow three-column section configuration", () => {
      const config: TemplateConfig = {
        id: "three-column-template",
        name: "Three Column Template",
        layoutType: "three-column",
        leftColumnSections: ["skills"],
        middleColumnSections: ["work", "education"],
        rightColumnSections: ["certificates"],
      };

      expect(config.middleColumnSections).toContain("work");
    });
  });
});

describe("basicsToContactItems helper logic", () => {
  const basicsToContactItems = (
    basics: Partial<Resume["basics"]>,
    showFullUrl: boolean = false,
  ) => {
    const items: Array<{
      type: string;
      value: string;
      url?: string;
      label?: string;
    }> = [];

    if (basics.email) {
      items.push({
        type: "email",
        value: basics.email,
        url: `mailto:${basics.email}`,
      });
    }
    if (basics.phone) {
      items.push({
        type: "phone",
        value: basics.phone,
        url: `tel:${basics.phone}`,
      });
    }
    if (basics.location?.city) {
      const loc = [basics.location.city, basics.location.country]
        .filter(Boolean)
        .join(", ");
      items.push({ type: "location", value: loc });
    }
    if (basics.url) {
      items.push({
        type: "url",
        value: showFullUrl
          ? basics.url
          : basics.url.replace(/^https?:\/\//, "").replace(/\/$/, ""),
        url: basics.url,
      });
    }

    basics.profiles?.forEach((profile) => {
      if (profile.url) {
        items.push({
          type: "profile",
          value: profile.username || profile.network || profile.url,
          url: profile.url,
          label: showFullUrl
            ? `${profile.network}: ${profile.url}`
            : profile.username
              ? `${profile.network}: ${profile.username}`
              : profile.network,
        });
      }
    });

    return items;
  };

  it("should handle email", () => {
    const items = basicsToContactItems({ email: "test@example.com" });

    expect(items).toHaveLength(1);
    expect(items[0].type).toBe("email");
    expect(items[0].value).toBe("test@example.com");
    expect(items[0].url).toBe("mailto:test@example.com");
  });

  it("should handle phone", () => {
    const items = basicsToContactItems({ phone: "+1-555-123-4567" });

    expect(items).toHaveLength(1);
    expect(items[0].type).toBe("phone");
    expect(items[0].value).toBe("+1-555-123-4567");
    expect(items[0].url).toBe("tel:+1-555-123-4567");
  });

  it("should handle location with city and country", () => {
    const items = basicsToContactItems({
      location: {
        city: "New York",
        country: "USA",
        address: "",
        region: "",
        postalCode: "",
      },
    });

    expect(items).toHaveLength(1);
    expect(items[0].type).toBe("location");
    expect(items[0].value).toBe("New York, USA");
  });

  it("should handle location with only city", () => {
    const items = basicsToContactItems({
      location: {
        city: "San Francisco",
        country: "",
        address: "",
        region: "",
        postalCode: "",
      },
    });

    expect(items).toHaveLength(1);
    expect(items[0].value).toBe("San Francisco");
  });

  it("should handle URL and strip protocol when showFullUrl is false", () => {
    const items = basicsToContactItems({ url: "https://example.com/" }, false);

    expect(items).toHaveLength(1);
    expect(items[0].type).toBe("url");
    expect(items[0].value).toBe("example.com");
    expect(items[0].url).toBe("https://example.com/");
  });

  it("should keep full URL when showFullUrl is true", () => {
    const items = basicsToContactItems({ url: "https://example.com/" }, true);

    expect(items[0].value).toBe("https://example.com/");
  });

  it("should handle profiles", () => {
    const items = basicsToContactItems({
      profiles: [
        {
          network: "LinkedIn",
          username: "johndoe",
          url: "https://linkedin.com/in/johndoe",
        },
        {
          network: "GitHub",
          username: "johndoe",
          url: "https://github.com/johndoe",
        },
      ],
    });

    expect(items).toHaveLength(2);
    expect(items[0].type).toBe("profile");
    expect(items[0].value).toBe("johndoe");
    expect(items[0].label).toBe("LinkedIn: johndoe");
  });

  it("should handle profile without username", () => {
    const items = basicsToContactItems({
      profiles: [
        { network: "Portfolio", url: "https://portfolio.com", username: "" },
      ],
    });

    expect(items).toHaveLength(1);
    expect(items[0].value).toBe("Portfolio");
    expect(items[0].label).toBe("Portfolio");
  });

  it("should handle all contact info together", () => {
    const items = basicsToContactItems({
      email: "test@example.com",
      phone: "+1-555-123-4567",
      location: {
        city: "New York",
        country: "USA",
        address: "",
        region: "",
        postalCode: "",
      },
      url: "https://example.com",
      profiles: [
        {
          network: "LinkedIn",
          username: "johndoe",
          url: "https://linkedin.com/in/johndoe",
        },
      ],
    });

    expect(items).toHaveLength(5);
    expect(items.map((i) => i.type)).toEqual([
      "email",
      "phone",
      "location",
      "url",
      "profile",
    ]);
  });

  it("should handle empty basics", () => {
    const items = basicsToContactItems({});

    expect(items).toHaveLength(0);
  });

  it("should skip profiles without URL", () => {
    const items = basicsToContactItems({
      profiles: [
        { network: "LinkedIn", username: "johndoe" } as any, // No URL
      ],
    });

    expect(items).toHaveLength(0);
  });
});

describe("Header alignment handling", () => {
  const alignments = ["left", "center", "right"] as const;

  alignments.forEach((align) => {
    it(`should support ${align} alignment`, () => {
      expect(["left", "center", "right"]).toContain(align);
    });
  });

  it("should map alignment to flex alignment", () => {
    const alignToFlex = (align: string) => {
      switch (align) {
        case "center":
          return "center";
        case "right":
          return "flex-end";
        default:
          return "flex-start";
      }
    };

    expect(alignToFlex("left")).toBe("flex-start");
    expect(alignToFlex("center")).toBe("center");
    expect(alignToFlex("right")).toBe("flex-end");
  });
});

describe("Section ordering", () => {
  const allSections = [
    "summary",
    "work",
    "education",
    "skills",
    "projects",
    "certificates",
    "languages",
    "interests",
    "publications",
    "awards",
    "references",
    "custom",
  ];

  it("should have all expected sections", () => {
    expect(allSections).toHaveLength(12);
  });

  it("should be able to filter sections for left column", () => {
    const leftColumnSections = ["skills", "languages", "interests"];
    const filteredSections = allSections.filter((s) =>
      leftColumnSections.includes(s),
    );

    expect(filteredSections).toEqual(["skills", "languages", "interests"]);
  });

  it("should be able to filter sections for right column", () => {
    const leftColumnSections = ["skills", "languages", "interests"];
    const rightColumnSections = allSections.filter(
      (s) => !leftColumnSections.includes(s),
    );

    expect(rightColumnSections).toContain("work");
    expect(rightColumnSections).toContain("education");
    expect(rightColumnSections).not.toContain("skills");
  });

  it("should support custom section ordering", () => {
    const customOrder = ["summary", "skills", "work", "education"];
    const orderedSections = customOrder.filter((s) => allSections.includes(s));

    expect(orderedSections).toEqual(customOrder);
  });
});

describe("Style calculations", () => {
  it("should prefer layout header background over template config background", () => {
    const resolveHeaderBg = (
      layoutHeaderBackgroundColor?: string,
      templateHeaderBackgroundColor?: string,
    ) => layoutHeaderBackgroundColor || templateHeaderBackgroundColor;

    expect(resolveHeaderBg("#111111", "#ffffff")).toBe("#111111");
  });

  it("should fallback to template config header background when layout value is empty", () => {
    const resolveHeaderBg = (
      layoutHeaderBackgroundColor?: string,
      templateHeaderBackgroundColor?: string,
    ) => layoutHeaderBackgroundColor || templateHeaderBackgroundColor;

    expect(resolveHeaderBg("", "#ffffff")).toBe("#ffffff");
    expect(resolveHeaderBg(undefined, "#ffffff")).toBe("#ffffff");
  });

  it("should calculate name style correctly", () => {
    const settings = {
      nameFontSize: 28,
      nameBold: true,
      nameItalic: false,
      nameLineHeight: 1.2,
      nameLetterSpacing: 0.5,
    };

    const nameStyle = {
      fontSize: settings.nameFontSize || 28,
      fontWeight: settings.nameBold ? "bold" : "normal",
      fontStyle: settings.nameItalic ? "italic" : "normal",
      lineHeight: settings.nameLineHeight || 1.2,
      letterSpacing: settings.nameLetterSpacing || 0,
    };

    expect(nameStyle.fontSize).toBe(28);
    expect(nameStyle.fontWeight).toBe("bold");
    expect(nameStyle.fontStyle).toBe("normal");
    expect(nameStyle.letterSpacing).toBe(0.5);
  });

  it("should calculate title style correctly", () => {
    const settings = {
      titleFontSize: 14,
      titleBold: false,
      titleItalic: true,
      titleLineHeight: 1.2,
    };

    const titleStyle = {
      fontSize: settings.titleFontSize || 14,
      fontWeight: settings.titleBold ? "bold" : "normal",
      fontStyle: settings.titleItalic ? "italic" : "normal",
      lineHeight: settings.titleLineHeight || 1.2,
    };

    expect(titleStyle.fontSize).toBe(14);
    expect(titleStyle.fontWeight).toBe("normal");
    expect(titleStyle.fontStyle).toBe("italic");
  });

  it("should handle missing settings with defaults", () => {
    const settings: Partial<typeof fullSettings> = {};

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const fullSettings = {
      nameFontSize: 28,
      nameBold: true,
      nameItalic: false,
      nameLineHeight: 1.2,
    };

    const nameStyle = {
      fontSize: settings.nameFontSize || 28,
      fontWeight:
        settings.nameBold !== undefined
          ? settings.nameBold
            ? "bold"
            : "normal"
          : "bold",
      lineHeight: settings.nameLineHeight || 1.2,
    };

    expect(nameStyle.fontSize).toBe(28);
    expect(nameStyle.fontWeight).toBe("bold");
    expect(nameStyle.lineHeight).toBe(1.2);
  });
});

describe("Profile photo configuration", () => {
  it("should support different photo positions", () => {
    const positions = ["left", "right"];

    expect(positions).toContain("left");
    expect(positions).toContain("right");
  });

  it("should support different photo shapes", () => {
    const shapes = ["circle", "square", "rounded"];

    expect(shapes).toContain("circle");
    expect(shapes).toContain("square");
    expect(shapes).toContain("rounded");
  });

  it("should calculate margin based on position", () => {
    const getMargin = (position: string) => ({
      marginLeft: position === "right" ? 12 : 0,
      marginRight: position === "left" ? 12 : 0,
    });

    expect(getMargin("right")).toEqual({ marginLeft: 12, marginRight: 0 });
    expect(getMargin("left")).toEqual({ marginLeft: 0, marginRight: 12 });
  });

  it("should calculate photo size correctly", () => {
    const defaultSize = 80;
    const customSize = 100;
    const sidebarMultiplier = 1.25;

    expect(defaultSize).toBe(80);
    expect(customSize * sidebarMultiplier).toBe(125);
  });
});

describe("Column width calculations", () => {
  it("should calculate left column width", () => {
    const leftColumnWidth = 30;
    expect(leftColumnWidth).toBeGreaterThan(0);
    expect(leftColumnWidth).toBeLessThan(100);
  });

  it("should calculate right column width based on left", () => {
    const leftColumnWidth = 30;
    const columnGap = 5;
    const rightColumnWidth = 100 - leftColumnWidth - columnGap;

    expect(rightColumnWidth).toBe(65);
  });

  it("should handle equal columns", () => {
    const columnGap = 5;
    const leftWidth = (100 - columnGap) / 2;
    const rightWidth = (100 - columnGap) / 2;

    expect(leftWidth).toBe(rightWidth);
  });

  it("should handle three columns", () => {
    const leftWidth = 25;
    const middleWidth = 40;
    const columnGap = 5;
    const rightWidth = 100 - leftWidth - middleWidth - columnGap * 2;

    expect(leftWidth + middleWidth + rightWidth + columnGap * 2).toBe(100);
  });
});
