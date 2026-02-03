/**
 * Image utilities for profile photo handling
 * 
 * Handles:
 * - Client-side image compression to target size
 * - File validation (type, size constraints)
 * - Conversion to base64 data URL
 */

/** Supported image MIME types */
const SUPPORTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/** Maximum file size before compression (5MB) */
const MAX_INPUT_SIZE = 5 * 1024 * 1024;

/** Default maximum output size (500KB) */
const DEFAULT_MAX_SIZE_KB = 500;

export interface ImageValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates an image file for upload
 */
export function validateImageFile(file: File): ImageValidationResult {
  if (!SUPPORTED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Please upload a JPEG, PNG, or WebP image.',
    };
  }

  if (file.size > MAX_INPUT_SIZE) {
    return {
      valid: false,
      error: 'Image must be smaller than 5MB.',
    };
  }

  return { valid: true };
}

/**
 * Reads a file as a data URL
 */
function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Loads an image from a data URL
 */
function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = dataUrl;
  });
}

/**
 * Compresses an image to a canvas at given dimensions
 */
function compressToCanvas(
  img: HTMLImageElement,
  maxDimension: number = 800
): HTMLCanvasElement {
  let { width, height } = img;

  // Scale down if larger than max dimension
  if (width > maxDimension || height > maxDimension) {
    const ratio = Math.min(maxDimension / width, maxDimension / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  // Use high-quality image smoothing
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, width, height);

  return canvas;
}

/**
 * Converts canvas to base64 at given JPEG quality
 */
function canvasToDataUrl(canvas: HTMLCanvasElement, quality: number): string {
  return canvas.toDataURL('image/jpeg', quality);
}

/**
 * Gets size of a base64 data URL in bytes
 */
function getBase64Size(dataUrl: string): number {
  // Remove data URL prefix
  const base64 = dataUrl.split(',')[1] || '';
  // Base64 encodes 3 bytes into 4 characters
  return Math.round((base64.length * 3) / 4);
}

export interface CompressImageResult {
  dataUrl: string;
  sizeKB: number;
  width: number;
  height: number;
}

/**
 * Compresses an image file to a maximum size in KB
 * 
 * Uses binary search on JPEG quality to find optimal compression
 * that meets the size target while maintaining quality.
 * 
 * @param file - The image file to compress
 * @param maxSizeKB - Maximum output size in KB (default: 500)
 * @returns Promise with compressed image data URL and metadata
 */
export async function compressImage(
  file: File,
  maxSizeKB: number = DEFAULT_MAX_SIZE_KB
): Promise<CompressImageResult> {
  const targetBytes = maxSizeKB * 1024;

  // Read and load the image
  const originalDataUrl = await readFileAsDataURL(file);
  const img = await loadImage(originalDataUrl);

  // Initial compression to canvas
  let canvas = compressToCanvas(img, 800);
  let dataUrl = canvasToDataUrl(canvas, 0.9);
  let size = getBase64Size(dataUrl);

  // If already small enough at high quality, return
  if (size <= targetBytes) {
    return {
      dataUrl,
      sizeKB: Math.round(size / 1024),
      width: canvas.width,
      height: canvas.height,
    };
  }

  // Binary search for optimal quality
  let minQuality = 0.1;
  let maxQuality = 0.9;
  let bestDataUrl = dataUrl;

  for (let i = 0; i < 8; i++) {
    const midQuality = (minQuality + maxQuality) / 2;
    dataUrl = canvasToDataUrl(canvas, midQuality);
    size = getBase64Size(dataUrl);

    if (size <= targetBytes) {
      bestDataUrl = dataUrl;
      minQuality = midQuality;
    } else {
      maxQuality = midQuality;
    }
  }

  size = getBase64Size(bestDataUrl);

  // If still too large, reduce dimensions further
  if (size > targetBytes) {
    const dimensions = [600, 400, 300];
    for (const dim of dimensions) {
      canvas = compressToCanvas(img, dim);
      dataUrl = canvasToDataUrl(canvas, 0.8);
      size = getBase64Size(dataUrl);
      if (size <= targetBytes) {
        bestDataUrl = dataUrl;
        break;
      }
    }
  }

  return {
    dataUrl: bestDataUrl,
    sizeKB: Math.round(getBase64Size(bestDataUrl) / 1024),
    width: canvas.width,
    height: canvas.height,
  };
}

/**
 * Removes the image from state (returns empty string)
 */
export function clearImage(): string {
  return '';
}
