/**
 * Removes the background from an image using a client-side AI model.
 *
 * @param imageSource The image source (Blob, File, URL, or HTMLImageElement)
 * @returns A Promise resolving to a Blob of the image with the background removed (PNG)
 */
export async function removeBackground(
  imageSource: Blob | File | string | HTMLImageElement
): Promise<Blob> {
  try {
    // The library automatically handles downloading and caching the models.
    // By default, it uses a public CDN.
    // We can configure it to use local assets if needed, but for now,
    // we'll rely on the default behavior which fits the "Zero-Knowledge"
    // requirement as processing happens locally.
    //
    // Dynamic import keeps @imgly/background-removal (multi-MB) out of the
    // editor's initial bundle; it is only fetched when this feature is used.
    const { removeBackground: imglyRemoveBackground } =
      await import("@imgly/background-removal");
    const blob = await imglyRemoveBackground(imageSource);
    return blob;
  } catch (error) {
    console.error("Error removing background:", error);
    throw new Error("Failed to remove background");
  }
}
