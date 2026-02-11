import { removeBackground as imglyRemoveBackground } from "@imgly/background-removal";

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
    const blob = await imglyRemoveBackground(imageSource, {
      progress: (key, current, total) => {
        // Optional: We could expose this progress if we want more granular UI updates
        // console.log(`Downloading ${key}: ${current} of ${total}`);
      },
    });
    return blob;
  } catch (error) {
    console.error("Error removing background:", error);
    throw new Error("Failed to remove background");
  }
}
