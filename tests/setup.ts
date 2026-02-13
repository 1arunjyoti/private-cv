import { afterEach, beforeEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import 'fake-indexeddb/auto';

// Mock fetch for API endpoints instead of using MSW
const originalFetch = global.fetch;
global.fetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = typeof input === 'string' ? input : input instanceof Request ? input.url : input.toString();
  
  // Check if request was aborted
  if (init?.signal?.aborted) {
    throw new DOMException('The operation was aborted', 'AbortError');
  }
  
  // Handle parse-pdf endpoint
  if (url.includes('/api/parse-pdf')) {
    const formData = init?.body as FormData;
    const file = formData?.get('file') as File;
    
    if (!file) {
      return new Response(JSON.stringify({ error: 'No file provided' }), { status: 400 });
    }

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return new Response(JSON.stringify({ error: 'File size exceeds maximum limit of 5MB' }), { status: 413 });
    }

    // Check file type
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      return new Response(JSON.stringify({ error: 'Invalid file type. Please upload a PDF file.' }), { status: 400 });
    }
    
    // Check if type is wrong even if extension is .pdf
    if (file.type && file.type !== 'application/pdf') {
      return new Response(JSON.stringify({ error: 'Invalid file type. Please upload a PDF file.' }), { status: 400 });
    }

    // Corrupted file
    if (file.name.includes('corrupted')) {
      return new Response(JSON.stringify({ 
        error: 'Failed to read PDF content',
        details: 'The PDF may be corrupted, encrypted, or use unsupported features.'
      }), { status: 422 });
    }

    // Scanned PDF (small file)
    if (file.size < 2000) {
      return new Response(JSON.stringify({
        success: true,
        text: 'John Doe\\nEmail: john@example.com',
        numPages: 1,
        warning: 'This PDF appears to be image-based or scanned. Text extraction may be incomplete.'
      }), { status: 200 });
    }

    // Normal PDF
    return new Response(JSON.stringify({
      success: true,
      text: `JOHN DOE
Senior Software Engineer  
john.doe@email.com | +1-555-0123

WORK EXPERIENCE

Senior Software Engineer
Tech Company Inc | Jan 2020 - Present`,
      numPages: 1
    }), { status: 200 });
  }
  
  // Handle parse-docx endpoint
  if (url.includes('/api/parse-docx')) {
    return new Response(JSON.stringify({
      success: true,
      text: 'JANE SMITH\\nProduct Manager'
    }), { status: 200 });
  }
  
  // Default: call original fetch
  return originalFetch(input, init);
}) as typeof fetch;

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
} as unknown as typeof IntersectionObserver;

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
} as unknown as typeof ResizeObserver;

// Add arrayBuffer method to File prototype for tests
if (typeof File !== 'undefined' && !File.prototype.arrayBuffer) {
  File.prototype.arrayBuffer = async function(this: File) {
    return new Promise<ArrayBuffer>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result as ArrayBuffer);
      };
      reader.readAsArrayBuffer(this);
    });
  };
}

// Suppress console errors in tests (optional - remove if you want to see them)
const originalError = console.error;
beforeEach(() => {
  console.error = (...args: unknown[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterEach(() => {
  console.error = originalError;
});
