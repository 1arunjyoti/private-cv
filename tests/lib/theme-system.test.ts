/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from "vitest";
import { deepMerge, BASE_THEME, TYPOGRAPHY_PRESETS, HEADING_PRESETS, LAYOUT_PRESETS, ENTRY_PRESETS } from "@/lib/theme-system";

describe("deepMerge", () => {
  describe("basic merging", () => {
    it("should merge two simple objects", () => {
      const obj1 = { a: 1, b: 2 };
      const obj2 = { c: 3 };
      
      const result = deepMerge<{ a: number; b: number; c: number }>(obj1, obj2);
      
      expect(result).toEqual({ a: 1, b: 2, c: 3 });
    });

    it("should override properties from later objects", () => {
      const obj1 = { a: 1, b: 2 };
      const obj2 = { b: 3 };
      
      const result = deepMerge(obj1, obj2);
      
      expect(result).toEqual({ a: 1, b: 3 });
    });

    it("should merge multiple objects", () => {
      const obj1 = { a: 1 };
      const obj2 = { b: 2 };
      const obj3 = { c: 3 };
      
      const result = deepMerge<{ a: number; b: number; c: number }>(obj1, obj2, obj3);
      
      expect(result).toEqual({ a: 1, b: 2, c: 3 });
    });

    it("should handle empty objects", () => {
      const obj1 = { a: 1 };
      const obj2 = {};
      
      const result = deepMerge(obj1, obj2);
      
      expect(result).toEqual({ a: 1 });
    });

    it("should handle undefined objects", () => {
      const obj1 = { a: 1 };
      
      const result = deepMerge(obj1, undefined);
      
      expect(result).toEqual({ a: 1 });
    });
  });

  describe("nested object merging", () => {
    it("should deep merge nested objects", () => {
      const obj1 = { 
        a: 1, 
        nested: { x: 1, y: 2 } 
      };
      const obj2 = { 
        nested: { y: 3, z: 4 } 
      };
      
      const result = deepMerge<any>(obj1, obj2);
      
      expect(result).toEqual({
        a: 1,
        nested: { x: 1, y: 3, z: 4 },
      });
    });

    it("should deep merge deeply nested objects", () => {
      const obj1 = {
        level1: {
          level2: {
            level3: { a: 1 },
          },
        },
      };
      const obj2 = {
        level1: {
          level2: {
            level3: { b: 2 },
          },
        },
      };
      
      const result = deepMerge<any>(obj1, obj2);
      
      expect(result.level1.level2.level3).toEqual({ a: 1, b: 2 });
    });

    it("should override nested values from later objects", () => {
      const obj1 = {
        config: { fontSize: 12, fontFamily: "Arial" },
      };
      const obj2 = {
        config: { fontSize: 14 },
      };
      
      const result = deepMerge<any>(obj1, obj2);
      
      expect(result.config.fontSize).toBe(14);
      expect(result.config.fontFamily).toBe("Arial");
    });
  });

  describe("array handling", () => {
    it("should replace arrays entirely (not merge)", () => {
      const obj1 = { items: [1, 2, 3] };
      const obj2 = { items: [4, 5] };
      
      const result = deepMerge(obj1, obj2);
      
      expect(result.items).toEqual([4, 5]);
    });

    it("should handle arrays with objects", () => {
      const obj1 = { items: [{ id: 1 }, { id: 2 }] };
      const obj2 = { items: [{ id: 3 }] };
      
      const result = deepMerge(obj1, obj2);
      
      expect(result.items).toEqual([{ id: 3 }]);
    });

    it("should not merge nested arrays in objects", () => {
      const obj1 = { 
        config: { 
          sectionOrder: ["work", "education"] 
        } 
      };
      const obj2 = { 
        config: { 
          sectionOrder: ["skills", "projects"] 
        } 
      };
      
      const result = deepMerge(obj1, obj2);
      
      expect(result.config.sectionOrder).toEqual(["skills", "projects"]);
    });
  });

  describe("type preservation", () => {
    it("should preserve string values", () => {
      const obj1 = { name: "John" };
      const obj2 = { title: "Developer" };
      
      const result = deepMerge<any>(obj1, obj2);
      
      expect(typeof result.name).toBe("string");
      expect(typeof result.title).toBe("string");
    });

    it("should preserve number values", () => {
      const obj1 = { fontSize: 12, lineHeight: 1.5 };
      
      const result = deepMerge<any>(obj1);
      
      expect(typeof result.fontSize).toBe("number");
      expect(typeof result.lineHeight).toBe("number");
    });

    it("should preserve boolean values", () => {
      const obj1 = { enabled: true, visible: false };
      
      const result = deepMerge<any>(obj1);
      
      expect(result.enabled).toBe(true);
      expect(result.visible).toBe(false);
    });

    it("should preserve null values", () => {
      const obj1 = { value: "test" };
      const obj2 = { value: null };
      
      const result = deepMerge<any>(obj1, obj2 as { value: string | null });
      
      // Note: null is not considered undefined, so it should be preserved
      expect(result.value).toBeNull();
    });
  });

  describe("edge cases", () => {
    it("should handle no arguments", () => {
      const result = deepMerge<any>();
      
      expect(result).toEqual({});
    });

    it("should handle single argument", () => {
      const obj = { a: 1 };
      
      const result = deepMerge<any>(obj);
      
      expect(result).toEqual({ a: 1 });
    });

    it("should not modify original objects", () => {
      const obj1 = { a: 1, nested: { b: 2 } };
      const obj2 = { nested: { c: 3 } };
      
      deepMerge<any>(obj1, obj2);
      
      expect(obj1.nested).toEqual({ b: 2 });
      expect("c" in obj1.nested).toBe(false);
    });

    it("should handle mixed undefined values", () => {
      const obj1 = { a: 1, b: undefined };
      const obj2 = { a: undefined, c: 3 };
      
      const result = deepMerge<any>(obj1 as { a: number; b?: number }, obj2 as { a?: number; c: number });
      
      // undefined values should not override defined values
      expect(result.a).toBe(1);
      expect(result.c).toBe(3);
    });
  });
});

describe("BASE_THEME", () => {
  it("should have core typography settings", () => {
    expect(BASE_THEME.fontSize).toBeDefined();
    expect(BASE_THEME.lineHeight).toBeDefined();
    expect(BASE_THEME.fontFamily).toBeDefined();
  });

  it("should have page margin settings", () => {
    expect(BASE_THEME.marginHorizontal).toBeDefined();
    expect(BASE_THEME.marginVertical).toBeDefined();
  });

  it("should have section spacing settings", () => {
    expect(BASE_THEME.sectionMargin).toBeDefined();
    expect(BASE_THEME.bulletMargin).toBeDefined();
    expect(BASE_THEME.useBullets).toBeDefined();
    expect(BASE_THEME.headerBottomMargin).toBeDefined();
  });

  it("should have color target settings", () => {
    expect(BASE_THEME.themeColorTarget).toBeInstanceOf(Array);
    expect(BASE_THEME.themeColorTarget).toContain("headings");
    expect(BASE_THEME.themeColorTarget).toContain("links");
  });

  it("should have section order", () => {
    expect(BASE_THEME.sectionOrder).toBeInstanceOf(Array);
    expect(BASE_THEME.sectionOrder?.length).toBeGreaterThan(0);
  });

  it("should have section heading visibility defaults", () => {
    expect(BASE_THEME.summaryHeadingVisible).toBeDefined();
    expect(BASE_THEME.workHeadingVisible).toBeDefined();
    expect(BASE_THEME.educationHeadingVisible).toBeDefined();
    expect(BASE_THEME.skillsHeadingVisible).toBeDefined();
    expect(BASE_THEME.projectsHeadingVisible).toBeDefined();
  });

  it("should have default section display style", () => {
    expect(BASE_THEME.sectionDisplayStyle).toBeDefined();
  });
});

describe("TYPOGRAPHY_PRESETS", () => {
  const presetNames = ["modern", "classic", "professional", "creative", "ats", "minimal", "monospace"] as const;

  presetNames.forEach((presetName) => {
    describe(`${presetName} preset`, () => {
      it("should have fontFamily", () => {
        expect(TYPOGRAPHY_PRESETS[presetName].fontFamily).toBeDefined();
        expect(typeof TYPOGRAPHY_PRESETS[presetName].fontFamily).toBe("string");
      });

      it("should have name typography settings", () => {
        expect(TYPOGRAPHY_PRESETS[presetName].nameFontSize).toBeDefined();
        expect(TYPOGRAPHY_PRESETS[presetName].nameLineHeight).toBeDefined();
        expect(TYPOGRAPHY_PRESETS[presetName].nameBold).toBeDefined();
      });

      it("should have title typography settings", () => {
        expect(TYPOGRAPHY_PRESETS[presetName].titleFontSize).toBeDefined();
        expect(TYPOGRAPHY_PRESETS[presetName].titleLineHeight).toBeDefined();
      });

      it("should have contact typography settings", () => {
        expect(TYPOGRAPHY_PRESETS[presetName].contactFontSize).toBeDefined();
      });
    });
  });

  it("should have different font families for different presets", () => {
    expect(TYPOGRAPHY_PRESETS.modern.fontFamily).not.toBe(TYPOGRAPHY_PRESETS.classic.fontFamily);
    expect(TYPOGRAPHY_PRESETS.professional.fontFamily).not.toBe(TYPOGRAPHY_PRESETS.classic.fontFamily);
  });

  it("should have reasonable font sizes", () => {
    Object.values(TYPOGRAPHY_PRESETS).forEach((preset: any) => {
      expect(preset.nameFontSize).toBeGreaterThan(10);
      expect(preset.nameFontSize).toBeLessThan(50);
      expect(preset.contactFontSize).toBeGreaterThan(6);
      expect(preset.contactFontSize).toBeLessThan(20);
    });
  });
});

describe("HEADING_PRESETS", () => {
  const presetNames = ["underline", "bottomBorder", "filled", "accent", "framed", "plain", "code"] as const;

  presetNames.forEach((presetName) => {
    describe(`${presetName} preset`, () => {
      it("should have heading style", () => {
        expect(HEADING_PRESETS[presetName].sectionHeadingStyle).toBeDefined();
        expect(typeof HEADING_PRESETS[presetName].sectionHeadingStyle).toBe("number");
      });

      it("should have alignment setting", () => {
        expect(HEADING_PRESETS[presetName].sectionHeadingAlign).toBeDefined();
        expect(["left", "center", "right"]).toContain(HEADING_PRESETS[presetName].sectionHeadingAlign);
      });

      it("should have capitalization setting", () => {
        expect(HEADING_PRESETS[presetName].sectionHeadingCapitalization).toBeDefined();
      });

      it("should have size setting", () => {
        expect(HEADING_PRESETS[presetName].sectionHeadingSize).toBeDefined();
        expect(["S", "M", "L"]).toContain(HEADING_PRESETS[presetName].sectionHeadingSize);
      });
    });
  });
});

describe("LAYOUT_PRESETS", () => {
  const presetNames = ["singleColumn", "singleColumnCentered", "twoColumnLeft", "twoColumnWide", "threeColumn"] as const;

  presetNames.forEach((presetName) => {
    describe(`${presetName} preset`, () => {
      it("should have column count", () => {
        expect(LAYOUT_PRESETS[presetName].columnCount).toBeDefined();
        expect([1, 2, 3]).toContain(LAYOUT_PRESETS[presetName].columnCount);
      });

      it("should have header position", () => {
        expect(LAYOUT_PRESETS[presetName].headerPosition).toBeDefined();
      });

      it("should have left column width", () => {
        expect(LAYOUT_PRESETS[presetName].leftColumnWidth).toBeDefined();
        expect(LAYOUT_PRESETS[presetName].leftColumnWidth).toBeGreaterThan(0);
        expect(LAYOUT_PRESETS[presetName].leftColumnWidth).toBeLessThan(100);
      });
    });
  });

  it("should have single column layouts with columnCount 1", () => {
    expect(LAYOUT_PRESETS.singleColumn.columnCount).toBe(1);
    expect(LAYOUT_PRESETS.singleColumnCentered.columnCount).toBe(1);
  });

  it("should have two column layouts with columnCount 2", () => {
    expect(LAYOUT_PRESETS.twoColumnLeft.columnCount).toBe(2);
    expect(LAYOUT_PRESETS.twoColumnWide.columnCount).toBe(2);
  });

  it("should have three column layout with columnCount 3", () => {
    expect(LAYOUT_PRESETS.threeColumn.columnCount).toBe(3);
  });
});

describe("ENTRY_PRESETS", () => {
  const presetNames = ["traditional", "compact", "modern", "timeline"] as const;

  presetNames.forEach((presetName) => {
    describe(`${presetName} preset`, () => {
      it("should have entry layout style", () => {
        expect(ENTRY_PRESETS[presetName].entryLayoutStyle).toBeDefined();
      });

      it("should have title size", () => {
        expect(ENTRY_PRESETS[presetName].entryTitleSize).toBeDefined();
      });

      it("should have subtitle style", () => {
        expect(ENTRY_PRESETS[presetName].entrySubtitleStyle).toBeDefined();
      });

      it("should have list style", () => {
        expect(ENTRY_PRESETS[presetName].entryListStyle).toBeDefined();
      });
    });
  });
});

describe("Theme composition", () => {
  it("should be able to merge BASE_THEME with typography preset", () => {
    const merged = deepMerge(BASE_THEME, TYPOGRAPHY_PRESETS.modern);
    
    expect(merged.fontSize).toBe(BASE_THEME.fontSize);
    expect(merged.fontFamily).toBe(TYPOGRAPHY_PRESETS.modern.fontFamily);
  });

  it("should be able to merge multiple presets", () => {
    const merged = deepMerge(
      BASE_THEME,
      TYPOGRAPHY_PRESETS.professional,
      HEADING_PRESETS.underline,
      LAYOUT_PRESETS.singleColumn
    );
    
    expect(merged.fontFamily).toBe(TYPOGRAPHY_PRESETS.professional.fontFamily);
    expect(merged.sectionHeadingStyle).toBe(HEADING_PRESETS.underline.sectionHeadingStyle);
    expect(merged.columnCount).toBe(LAYOUT_PRESETS.singleColumn.columnCount);
  });

  it("should allow overriding preset values", () => {
    const customOverrides = { fontSize: 14, fontFamily: "Custom Font" };
    
    const merged = deepMerge(
      BASE_THEME,
      TYPOGRAPHY_PRESETS.modern,
      customOverrides
    );
    
    expect(merged.fontSize).toBe(14);
    expect(merged.fontFamily).toBe("Custom Font");
  });

  it("should preserve section order when merging", () => {
    const merged = deepMerge(BASE_THEME, TYPOGRAPHY_PRESETS.classic);
    
    expect(merged.sectionOrder).toEqual(BASE_THEME.sectionOrder);
  });
});
