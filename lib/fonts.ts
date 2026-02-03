/**
 * Centralized font registration for PDF templates
 * Register fonts once and import in templates to avoid duplication
 */

import { Font } from "@react-pdf/renderer";

/**
 * Register all fonts used across templates
 * Call this once when any template is loaded
 */
export function registerPDFFonts() {
  // Open Sans - Used by most templates
  Font.register({
    family: "Open Sans",
    fonts: [
      {
        src: "https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-regular.ttf",
        fontWeight: "normal",
      },
      {
        src: "https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-600.ttf",
        fontWeight: "semibold",
      },
      {
        src: "https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-700.ttf",
        fontWeight: "bold",
      },
      {
        src: "https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-700italic.ttf",
        fontWeight: "bold",
        fontStyle: "italic",
      },
    ],
  });

  // Roboto - Used by Classic and Modern templates
  Font.register({
    family: "Roboto",
    fonts: [
      {
        src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf",
        fontWeight: "normal",
      },
      {
        src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf",
        fontWeight: "bold",
      },
      {
        src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-italic-webfont.ttf",
        fontStyle: "italic",
      },
      {
        src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bolditalic-webfont.ttf",
        fontWeight: "bold",
        fontStyle: "italic",
      },
    ],
  });

  // Lato - Used by Classic and Modern templates
  Font.register({
    family: "Lato",
    fonts: [
      {
        src: "https://cdn.jsdelivr.net/npm/@fontsource/lato@4.5.8/files/lato-latin-400-normal.woff",
        fontWeight: "normal",
      },
      {
        src: "https://cdn.jsdelivr.net/npm/@fontsource/lato@4.5.8/files/lato-latin-700-normal.woff",
        fontWeight: "bold",
      },
      {
        src: "https://cdn.jsdelivr.net/npm/@fontsource/lato@4.5.8/files/lato-latin-400-italic.woff",
        fontStyle: "italic",
      },
      {
        src: "https://cdn.jsdelivr.net/npm/@fontsource/lato@4.5.8/files/lato-latin-700-italic.woff",
        fontWeight: "bold",
        fontStyle: "italic",
      },
    ],
  });

  // Montserrat - Used by Classic and Modern templates
  Font.register({
    family: "Montserrat",
    fonts: [
      {
        src: "https://cdn.jsdelivr.net/npm/@fontsource/montserrat@4.5.13/files/montserrat-latin-400-normal.woff",
        fontWeight: "normal",
      },
      {
        src: "https://cdn.jsdelivr.net/npm/@fontsource/montserrat@4.5.13/files/montserrat-latin-700-normal.woff",
        fontWeight: "bold",
      },
      {
        src: "https://cdn.jsdelivr.net/npm/@fontsource/montserrat@4.5.13/files/montserrat-latin-400-italic.woff",
        fontStyle: "italic",
      },
      {
        src: "https://cdn.jsdelivr.net/npm/@fontsource/montserrat@4.5.13/files/montserrat-latin-700-italic.woff",
        fontWeight: "bold",
        fontStyle: "italic",
      },
    ],
  });
}

// Auto-register fonts on module load
let fontsRegistered = false;
if (!fontsRegistered) {
  registerPDFFonts();
  fontsRegistered = true;
}
