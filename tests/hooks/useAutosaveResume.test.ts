import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAutosaveResume } from "@/hooks/useAutosaveResume";
import { useResumeStore } from "@/store/useResumeStore";
import { db } from "@/db";
import { createMockResume } from "@/tests/utils/factories";

// Real timers with a tiny debounce window: fake-indexeddb's internal queue
// stalls under vi.useFakeTimers(), so timing is controlled via delay instead.
const DELAY_MS = 10;
const settle = (ms = 80) =>
  act(() => new Promise((resolve) => setTimeout(resolve, ms)));

describe("useAutosaveResume", () => {
  let resume: ReturnType<typeof createMockResume>;

  beforeEach(() => {
    resume = createMockResume();
    useResumeStore.setState({ currentResume: null });
  });

  afterEach(() => {
    useResumeStore.setState({ currentResume: null });
  });

  it("does not persist the initially loaded resume", async () => {
    // First observed resume counts as already persisted (loaded/created).
    useResumeStore.setState({ currentResume: resume });
    const { result } = renderHook(() => useAutosaveResume(DELAY_MS));
    await settle();

    expect(await db.resumes.get(resume.id)).toBeUndefined();
    expect(result.current.lastSavedAt).toBeNull();
  });

  it("writes changes to IndexedDB after the debounce window", async () => {
    useResumeStore.setState({ currentResume: resume });
    renderHook(() => useAutosaveResume(DELAY_MS));

    act(() => {
      useResumeStore.setState({
        currentResume: {
          ...resume,
          meta: {
            ...resume.meta,
            title: "Autosaved Title",
            lastModified: new Date().toISOString(),
          },
        },
      });
    });

    expect(await db.resumes.get(resume.id)).toBeUndefined();

    await settle();

    const stored = await db.resumes.get(resume.id);
    expect(stored?.meta.title).toBe("Autosaved Title");
  });

  it("coalesces rapid edits into a single write", async () => {
    useResumeStore.setState({ currentResume: resume });
    renderHook(() => useAutosaveResume(DELAY_MS));

    act(() => {
      // All five edits land within one debounce window.
      for (let i = 0; i < 5; i++) {
        useResumeStore.setState({
          currentResume: {
            ...resume,
            meta: {
              ...resume.meta,
              title: `Edit ${i}`,
              lastModified: new Date(Date.now() + i * 2).toISOString(),
            },
          },
        });
      }
    });

    await settle();

    const stored = await db.resumes.get(resume.id);
    expect(stored?.meta.title).toBe("Edit 4");
  });

  it("flushes immediately when the tab becomes hidden", async () => {
    useResumeStore.setState({ currentResume: resume });
    renderHook(() => useAutosaveResume(600_000)); // far beyond test lifetime

    act(() => {
      useResumeStore.setState({
        currentResume: {
          ...resume,
          meta: {
            ...resume.meta,
            title: "Hidden Save",
            lastModified: new Date().toISOString(),
          },
        },
      });
    });

    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      get: () => "hidden",
    });
    await act(async () => {
      document.dispatchEvent(new Event("visibilitychange"));
      await Promise.resolve();
    });

    const stored = await db.resumes.get(resume.id);
    expect(stored?.meta.title).toBe("Hidden Save");
  });
});
