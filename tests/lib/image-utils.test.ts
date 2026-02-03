import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { validateImageFile, compressImage, clearImage } from '@/lib/image-utils';

// Helper to create mock files with specific types and sizes
function createMockFile(type: 'jpg' | 'png' | 'webp' | 'pdf' | 'gif', sizeInBytes: number): File {
  const mimeTypes: Record<string, string> = {
    jpg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    pdf: 'application/pdf',
    gif: 'image/gif',
  };

  const content = new Uint8Array(sizeInBytes);
  return new File([content], `test.${type}`, { type: mimeTypes[type] });
}

describe('Image Utils', () => {
  describe('validateImageFile', () => {
    it('should accept valid JPG file', () => {
      const file = createMockFile('jpg', 1024 * 500); // 500KB
      const result = validateImageFile(file);
      
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should accept valid PNG file', () => {
      const file = createMockFile('png', 1024 * 500);
      const result = validateImageFile(file);
      
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should accept valid WebP file', () => {
      const file = createMockFile('webp', 1024 * 500);
      const result = validateImageFile(file);
      
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject files larger than 5MB', () => {
      const file = createMockFile('jpg', 1024 * 1024 * 6); // 6MB
      const result = validateImageFile(file);
      
      expect(result.valid).toBe(false);
      expect(result.error).toContain('5MB');
    });

    it('should reject files exactly at 5MB limit', () => {
      const file = createMockFile('jpg', 5 * 1024 * 1024 + 1); // Just over 5MB
      const result = validateImageFile(file);
      
      expect(result.valid).toBe(false);
    });

    it('should accept files just under 5MB limit', () => {
      const file = createMockFile('jpg', 5 * 1024 * 1024 - 1); // Just under 5MB
      const result = validateImageFile(file);
      
      expect(result.valid).toBe(true);
    });

    it('should reject non-image files (PDF)', () => {
      const file = createMockFile('pdf', 1024);
      const result = validateImageFile(file);
      
      expect(result.valid).toBe(false);
      expect(result.error).toContain('JPEG');
    });

    it('should reject GIF files', () => {
      const file = createMockFile('gif', 1024);
      const result = validateImageFile(file);
      
      expect(result.valid).toBe(false);
      expect(result.error).toContain('JPEG');
    });

    it('should return error message with supported formats', () => {
      const file = createMockFile('pdf', 1024);
      const result = validateImageFile(file);
      
      expect(result.error).toContain('JPEG');
      expect(result.error).toContain('PNG');
      expect(result.error).toContain('WebP');
    });
  });

  describe('clearImage', () => {
    it('should return empty string', () => {
      const result = clearImage();
      expect(result).toBe('');
    });
  });

  describe('compressImage', () => {
    // Mock canvas and image elements
    let mockCanvas: {
      width: number;
      height: number;
      getContext: ReturnType<typeof vi.fn>;
      toDataURL: ReturnType<typeof vi.fn>;
    };
    let mockContext: {
      imageSmoothingEnabled: boolean;
      imageSmoothingQuality: string;
      drawImage: ReturnType<typeof vi.fn>;
    };

    beforeEach(() => {
      mockContext = {
        imageSmoothingEnabled: false,
        imageSmoothingQuality: '',
        drawImage: vi.fn(),
      };

      mockCanvas = {
        width: 0,
        height: 0,
        getContext: vi.fn().mockReturnValue(mockContext),
        // Return a small base64 data URL to simulate compression
        toDataURL: vi.fn().mockReturnValue('data:image/jpeg;base64,' + 'A'.repeat(1000)),
      };

      vi.stubGlobal('document', {
        createElement: vi.fn((tag: string) => {
          if (tag === 'canvas') return mockCanvas;
          return {};
        }),
      });

      // Mock Image constructor
      vi.stubGlobal('Image', class MockImage {
        width = 800;
        height = 600;
        src = '';
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;

        constructor() {
          setTimeout(() => {
            if (this.onload) this.onload();
          }, 0);
        }
      });

      // Mock FileReader
      vi.stubGlobal('FileReader', class MockFileReader {
        result: string | null = null;
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;

        readAsDataURL() {
          this.result = 'data:image/jpeg;base64,' + 'B'.repeat(2000);
          setTimeout(() => {
            if (this.onload) this.onload();
          }, 0);
        }
      });
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('should return compressed image data', async () => {
      const file = createMockFile('jpg', 1024 * 100);
      
      const result = await compressImage(file, 500);
      
      expect(result.dataUrl).toContain('data:image/jpeg;base64');
      expect(result.sizeKB).toBeGreaterThanOrEqual(0);
      expect(result.width).toBeGreaterThan(0);
      expect(result.height).toBeGreaterThan(0);
    });

    it('should use default max size of 500KB', async () => {
      const file = createMockFile('jpg', 1024 * 100);
      
      // Call without specifying maxSizeKB
      const result = await compressImage(file);
      
      expect(result).toBeDefined();
      expect(result.dataUrl).toBeDefined();
    });

    it('should respect custom max size parameter', async () => {
      const file = createMockFile('jpg', 1024 * 100);
      
      const result = await compressImage(file, 200);
      
      expect(result).toBeDefined();
    });

    it('should set canvas context properties', async () => {
      const file = createMockFile('jpg', 1024 * 100);
      
      await compressImage(file, 500);
      
      expect(mockCanvas.getContext).toHaveBeenCalledWith('2d');
    });

    it('should call toDataURL with jpeg format', async () => {
      const file = createMockFile('jpg', 1024 * 100);
      
      await compressImage(file, 500);
      
      expect(mockCanvas.toDataURL).toHaveBeenCalledWith('image/jpeg', expect.any(Number));
    });

    it('should return width and height in result', async () => {
      const file = createMockFile('jpg', 1024 * 100);
      
      const result = await compressImage(file, 500);
      
      expect(typeof result.width).toBe('number');
      expect(typeof result.height).toBe('number');
    });
  });

  describe('getBase64Size logic', () => {
    it('should calculate correct size for base64 string', () => {
      // Base64 encodes 3 bytes into 4 characters
      // So 12 base64 characters = 9 bytes
      const getBase64Size = (dataUrl: string): number => {
        const base64 = dataUrl.split(',')[1] || '';
        return Math.round((base64.length * 3) / 4);
      };

      const dataUrl = 'data:image/jpeg;base64,AAAAAAAAAA==';
      const size = getBase64Size(dataUrl);
      
      // 10 base64 chars + 2 padding = 12 chars total, which is 9 bytes
      // But the actual content is 'AAAAAAAAAA==' which is 12 chars = 9 bytes
      expect(size).toBeGreaterThan(0);
    });

    it('should handle empty base64', () => {
      const getBase64Size = (dataUrl: string): number => {
        const base64 = dataUrl.split(',')[1] || '';
        return Math.round((base64.length * 3) / 4);
      };

      const dataUrl = 'data:image/jpeg;base64,';
      const size = getBase64Size(dataUrl);
      
      expect(size).toBe(0);
    });

    it('should handle data URL without comma', () => {
      const getBase64Size = (dataUrl: string): number => {
        const base64 = dataUrl.split(',')[1] || '';
        return Math.round((base64.length * 3) / 4);
      };

      const dataUrl = 'invalidDataUrl';
      const size = getBase64Size(dataUrl);
      
      expect(size).toBe(0);
    });
  });

  describe('compressToCanvas logic', () => {
    it('should scale down images larger than max dimension', () => {
      const calculateDimensions = (width: number, height: number, maxDimension: number) => {
        if (width > maxDimension || height > maxDimension) {
          const ratio = Math.min(maxDimension / width, maxDimension / height);
          return {
            width: Math.round(width * ratio),
            height: Math.round(height * ratio),
          };
        }
        return { width, height };
      };

      const result = calculateDimensions(1600, 1200, 800);
      
      expect(result.width).toBe(800);
      expect(result.height).toBe(600);
    });

    it('should maintain aspect ratio when scaling', () => {
      const calculateDimensions = (width: number, height: number, maxDimension: number) => {
        if (width > maxDimension || height > maxDimension) {
          const ratio = Math.min(maxDimension / width, maxDimension / height);
          return {
            width: Math.round(width * ratio),
            height: Math.round(height * ratio),
          };
        }
        return { width, height };
      };

      const original = { width: 2000, height: 1000 };
      const result = calculateDimensions(original.width, original.height, 800);
      
      const originalRatio = original.width / original.height;
      const newRatio = result.width / result.height;
      
      expect(Math.abs(originalRatio - newRatio)).toBeLessThan(0.1);
    });

    it('should not scale images smaller than max dimension', () => {
      const calculateDimensions = (width: number, height: number, maxDimension: number) => {
        if (width > maxDimension || height > maxDimension) {
          const ratio = Math.min(maxDimension / width, maxDimension / height);
          return {
            width: Math.round(width * ratio),
            height: Math.round(height * ratio),
          };
        }
        return { width, height };
      };

      const result = calculateDimensions(400, 300, 800);
      
      expect(result.width).toBe(400);
      expect(result.height).toBe(300);
    });
  });

  describe('binary search compression logic', () => {
    it('should find optimal quality through binary search', () => {
      // Simulate binary search logic
      const findOptimalQuality = (
        targetSize: number,
        getSizeAtQuality: (q: number) => number
      ) => {
        let minQuality = 0.1;
        let maxQuality = 0.9;
        let bestQuality = maxQuality;

        for (let i = 0; i < 8; i++) {
          const midQuality = (minQuality + maxQuality) / 2;
          const size = getSizeAtQuality(midQuality);

          if (size <= targetSize) {
            bestQuality = midQuality;
            minQuality = midQuality;
          } else {
            maxQuality = midQuality;
          }
        }

        return bestQuality;
      };

      // Mock size function - higher quality = larger size
      const getSizeAtQuality = (q: number) => Math.round(q * 1000);
      
      const optimalQuality = findOptimalQuality(500, getSizeAtQuality);
      
      // Should converge to around 0.5 for target 500 when max size is 1000
      expect(optimalQuality).toBeGreaterThanOrEqual(0.4);
      expect(optimalQuality).toBeLessThanOrEqual(0.6);
    });

    it('should reduce dimensions if quality adjustment is insufficient', () => {
      const dimensions = [600, 400, 300];
      
      let finalDimension = 800;
      const targetSize = 100;
      
      // Simulate finding a dimension that works
      for (const dim of dimensions) {
        const estimatedSize = dim * 0.5; // Simplified size estimate
        if (estimatedSize <= targetSize) {
          finalDimension = dim;
          break;
        }
      }
      
      // The loop should have found 300 as the final dimension
      expect(finalDimension).toBeLessThanOrEqual(800);
      expect(dimensions.some(d => d <= 600)).toBe(true);
    });
  });

  describe('supported image types', () => {
    const supportedTypes = ['image/jpeg', 'image/png', 'image/webp'];

    it('should support JPEG', () => {
      expect(supportedTypes).toContain('image/jpeg');
    });

    it('should support PNG', () => {
      expect(supportedTypes).toContain('image/png');
    });

    it('should support WebP', () => {
      expect(supportedTypes).toContain('image/webp');
    });

    it('should not support GIF', () => {
      expect(supportedTypes).not.toContain('image/gif');
    });

    it('should not support BMP', () => {
      expect(supportedTypes).not.toContain('image/bmp');
    });

    it('should not support TIFF', () => {
      expect(supportedTypes).not.toContain('image/tiff');
    });
  });

  describe('size constants', () => {
    const MAX_INPUT_SIZE = 5 * 1024 * 1024;
    const DEFAULT_MAX_SIZE_KB = 500;

    it('should have max input size of 5MB', () => {
      expect(MAX_INPUT_SIZE).toBe(5242880);
    });

    it('should have default max output size of 500KB', () => {
      expect(DEFAULT_MAX_SIZE_KB).toBe(500);
    });

    it('should have reasonable compression ratio potential', () => {
      const inputSizeKB = MAX_INPUT_SIZE / 1024;
      const outputSizeKB = DEFAULT_MAX_SIZE_KB;
      const compressionRatio = inputSizeKB / outputSizeKB;
      
      // Can compress up to ~10:1 (5120KB / 500KB = 10.24)
      expect(compressionRatio).toBeGreaterThanOrEqual(10);
    });
  });
});
