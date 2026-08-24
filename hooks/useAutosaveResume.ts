"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { db } from "@/db";
import { useResumeStore } from "@/store/useResumeStore";

/**
 * Debounced background autosave of the active resume to IndexedDB.
 *
 * The editor previously persisted to IndexedDB only via the manual Save
 * button, so a crash or accidental tab close lost everything typed since the
 * last explicit save. This hook writes `db.resumes` directly (bypassing store
 * loading flags) at most once per `delayMs` after the last change, and flushes
 * immediately when the tab is hidden or closed.
 */
export function useAutosaveResume(delayMs = 2000) {
  const currentResume = useResumeStore((state) => state.currentResume);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  const latestRef = useRef(currentResume);
  // Timestamp of the version known to be persisted. The first observed
  // resume (freshly loaded from IndexedDB or newly created) counts as saved.
  const savedStampRef = useRef<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flush = useCallback(async () => {
    const resume = latestRef.current;
    if (!resume) return;
    if (resume.meta.lastModified === savedStampRef.current) return;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    try {
      await db.resumes.put({ ...resume });
      savedStampRef.current = resume.meta.lastModified;
      setLastSavedAt(new Date());
    } catch (error) {
      // Background save must never surface as a blocking UI error.
      console.error("Autosave failed:", error);
    }
  }, []);

  useEffect(() => {
    latestRef.current = currentResume;
    if (!currentResume) return;

    // First observed version counts as already persisted.
    if (savedStampRef.current === null) {
      savedStampRef.current = currentResume.meta.lastModified;
      return;
    }

    if (currentResume.meta.lastModified === savedStampRef.current) return;

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      void flush();
    }, delayMs);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [currentResume, delayMs, flush]);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") void flush();
    };
    const onPageHide = () => {
      void flush();
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("pagehide", onPageHide);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pagehide", onPageHide);
    };
  }, [flush]);

  return { lastSavedAt, flush };
}
