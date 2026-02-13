import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { db, type Resume } from "@/db";
import { useResumeStore } from "@/store/useResumeStore";
import {
  buildCloudEnvelope,
  type CloudSyncEnvelopeV1,
} from "@/lib/sync/schema";
import {
  compareEnvelopes,
  duplicateWithConflictSuffix,
  parseRemoteEnvelope,
  replaceLocalResumes,
} from "@/lib/sync/engine";
import { encryptEnvelope } from "@/lib/sync/crypto";
import { getSyncProvider } from "@/lib/sync/providers";
import type {
  ProviderAccountProfile,
  ProviderAuthState,
  RemoteSyncFileMeta,
  SyncProviderId,
} from "@/lib/sync/providers/types";

const STORAGE_KEY = "cloud-sync-settings";
const FEATURE_FLAG = process.env.NEXT_PUBLIC_ENABLE_CLOUD_SYNC === "true";
const RETRY_BASE_DELAY_MS = 700;
const RETRY_ATTEMPTS = 3;
const AUTH_EXPIRY_GRACE_MS = 30_000;
const SYNC_METRICS_STORAGE_KEY = "cloud-sync-metrics-v1";


type SyncStatus =
  | "not-connected"
  | "syncing"
  | "up-to-date"
  | "conflict"
  | "error";

type ConflictResolution = "keep-local" | "use-cloud" | "keep-both";

interface SyncConflict {
  localEnvelope: CloudSyncEnvelopeV1;
  remoteEnvelope: CloudSyncEnvelopeV1;
}

interface SyncSettingsState {
  providerId: SyncProviderId;
  auth: ProviderAuthState | null;
  remoteFileMeta: RemoteSyncFileMeta | null;
  lastSyncAt: string | null;
  encryptionEnabled: boolean;
  deviceId: string;
}

interface SyncState extends SyncSettingsState {
  linkedAccount: ProviderAccountProfile | null;
  status: SyncStatus;
  error: string | null;
  passphrase: string;
  conflict: SyncConflict | null;
  setProvider: (providerId: SyncProviderId) => void;
  setEncryptionEnabled: (enabled: boolean) => void;
  setPassphrase: (passphrase: string) => void;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  loadLinkedAccount: () => Promise<void>;
  deleteCloudData: () => Promise<void>;
  syncNow: () => Promise<void>;
  restoreFromCloud: () => Promise<void>;
  resolveConflict: (resolution: ConflictResolution) => Promise<void>;
  startupPull: () => Promise<void>;
  clearError: () => void;
}

const defaultState: SyncSettingsState = {
  providerId: "google-drive",
  auth: null,
  remoteFileMeta: null,
  lastSyncAt: null,
  encryptionEnabled: false,
  deviceId: typeof crypto !== "undefined" ? crypto.randomUUID() : "device",
};

const storage = createJSONStorage(() => ({
  getItem: async (name: string) => {
    const record = await db.settings.get(name);
    return record?.value ?? null;
  },
  setItem: async (name: string, value: string) => {
    await db.settings.put({ id: name, value });
  },
  removeItem: async (name: string) => {
    await db.settings.delete(name);
  },
}));

async function refreshResumeStore(): Promise<void> {
  const allResumes = await db.resumes.orderBy("meta.lastModified").reverse().toArray();
  const current = useResumeStore.getState().currentResume;

  if (current) {
    const matched = allResumes.find((resume) => resume.id === current.id) ?? null;
    useResumeStore.setState({ currentResume: matched });
    return;
  }
  useResumeStore.setState({ currentResume: allResumes[0] ?? null });
}

async function persistCurrentResumeIfNeeded(): Promise<void> {
  const current = useResumeStore.getState().currentResume;
  if (!current) return;
  await db.resumes.put(current);
}

async function getLocalResumesSnapshot(): Promise<Resume[]> {
  const localResumes = await db.resumes.toArray();
  const current = useResumeStore.getState().currentResume;
  if (!current) {
    return localResumes;
  }

  const index = localResumes.findIndex((resume) => resume.id === current.id);
  if (index === -1) {
    return [...localResumes, current];
  }

  const next = [...localResumes];
  next[index] = current;
  return next;
}

const delay = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

const isTransientError = (error: unknown): boolean => {
  const message = (error as Error)?.message?.toLowerCase() ?? "";
  return (
    message.includes("network") ||
    message.includes("timeout") ||
    message.includes("(429)") ||
    message.includes("(500)") ||
    message.includes("(502)") ||
    message.includes("(503)") ||
    message.includes("(504)")
  );
};

const isAuthError = (message: string): boolean =>
  message.includes("(401)") || message.toLowerCase().includes("invalid_token");

interface SyncMetrics {
  attempts: number;
  syncSuccess: number;
  syncFailure: number;
  conflicts: number;
}

const defaultSyncMetrics = (): SyncMetrics => ({
  attempts: 0,
  syncSuccess: 0,
  syncFailure: 0,
  conflicts: 0,
});

const readSyncMetrics = (): SyncMetrics => {
  if (typeof window === "undefined") return defaultSyncMetrics();
  try {
    const raw = window.localStorage.getItem(SYNC_METRICS_STORAGE_KEY);
    if (!raw) return defaultSyncMetrics();
    const parsed = JSON.parse(raw) as Partial<SyncMetrics>;
    return {
      attempts: typeof parsed.attempts === "number" ? parsed.attempts : 0,
      syncSuccess: typeof parsed.syncSuccess === "number" ? parsed.syncSuccess : 0,
      syncFailure: typeof parsed.syncFailure === "number" ? parsed.syncFailure : 0,
      conflicts: typeof parsed.conflicts === "number" ? parsed.conflicts : 0,
    };
  } catch {
    return defaultSyncMetrics();
  }
};

const writeSyncMetrics = (metrics: SyncMetrics): void => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SYNC_METRICS_STORAGE_KEY, JSON.stringify(metrics));
  } catch {
    // Metrics are best-effort and must not block sync.
  }
};

const trackSyncMetric = (event: "attempt" | "sync_success" | "sync_failure" | "conflict"): void => {
  const metrics = readSyncMetrics();
  if (event === "attempt") metrics.attempts += 1;
  if (event === "sync_success") metrics.syncSuccess += 1;
  if (event === "sync_failure") metrics.syncFailure += 1;
  if (event === "conflict") metrics.conflicts += 1;
  writeSyncMetrics(metrics);
};

const getConflictRate = (): number => {
  const metrics = readSyncMetrics();
  if (metrics.attempts === 0) return 0;
  return metrics.conflicts / metrics.attempts;
};

const logSyncEvent = (
  level: "info" | "error",
  event: string,
  data: Record<string, unknown>,
): void => {
  if (process.env.NODE_ENV === "test") return;
  const logger = level === "error" ? console.error : console.info;
  logger("[cloud-sync]", {
    event,
    timestamp: new Date().toISOString(),
    ...data,
  });
};

const toUserFacingSyncError = (message: string): string => {
  const normalized = message.toLowerCase();
  if (
    normalized.includes("invalid cloud sync resumes payload") ||
    normalized.includes("invalid encrypted cloud sync payload") ||
    normalized.includes("decrypted cloud data is invalid") ||
    normalized.includes("integrity check")
  ) {
    return "Cloud backup data appears invalid. Delete cloud data and sync again.";
  }
  if (
    normalized.includes("network") ||
    normalized.includes("timeout") ||
    normalized.includes("(429)") ||
    normalized.includes("(500)") ||
    normalized.includes("(502)") ||
    normalized.includes("(503)") ||
    normalized.includes("(504)")
  ) {
    return "Cloud sync is temporarily unavailable. Please retry in a moment.";
  }
  return message;
};

async function withRetry<T>(task: () => Promise<T>): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= RETRY_ATTEMPTS; attempt += 1) {
    try {
      return await task();
    } catch (error) {
      lastError = error;
      if (!isTransientError(error) || attempt === RETRY_ATTEMPTS) {
        break;
      }
      await delay(RETRY_BASE_DELAY_MS * attempt);
    }
  }
  throw lastError;
}

async function uploadLocalEnvelope(
  state: SyncState,
  fileMetaOverride?: RemoteSyncFileMeta,
): Promise<RemoteSyncFileMeta> {
  if (!state.auth || !(fileMetaOverride || state.remoteFileMeta)) {
    throw new Error("Cloud sync is not connected.");
  }
  await persistCurrentResumeIfNeeded();
  const provider = getSyncProvider(state.providerId);
  const resumes = await getLocalResumesSnapshot();
  const plainEnvelope = await buildCloudEnvelope(resumes, state.deviceId);
  const envelopeToUpload = state.encryptionEnabled
    ? await encryptEnvelope(plainEnvelope, state.passphrase)
    : plainEnvelope;

  return withRetry(() =>
    provider.uploadSyncFile(state.auth!, {
      fileMeta: fileMetaOverride ?? state.remoteFileMeta!,
      content: JSON.stringify(envelopeToUpload),
    }),
  );
}

const isAuthExpired = (auth: ProviderAuthState | null): boolean => {
  if (!auth) return true;
  return auth.expiresAt <= Date.now() + AUTH_EXPIRY_GRACE_MS;
};

async function ensureFreshAuth(): Promise<ProviderAuthState | null> {
  const state = useSyncStore.getState();
  if (!state.auth || !isAuthExpired(state.auth)) {
    return state.auth;
  }
  const provider = getSyncProvider(state.providerId);
  try {
    const auth = await withRetry(() => provider.signIn({ interactive: false }));
    const linkedAccount = await withRetry(() =>
      provider.getAccountProfile(auth),
    );
    useSyncStore.setState({ auth, linkedAccount, error: null });
    return auth;
  } catch (error) {
    const message = (error as Error)?.message ?? "Failed to refresh Google Drive session.";
    if (isAuthError(message)) {
      useSyncStore.setState({
        auth: null,
        linkedAccount: null,
        status: "not-connected",
        error: "Session expired. Click Connect Google Drive.",
      });
      return null;
    }

    // Keep existing auth for transient/non-auth failures to avoid forcing reconnect.
    useSyncStore.setState({ error: message });
    return state.auth;
  }
}

export const useSyncStore = create<SyncState>()(
  persist(
    (set, get) => ({
      ...defaultState,
      status: "not-connected",
      linkedAccount: null,
      error: null,
      passphrase: "",
      conflict: null,

      setProvider: (providerId) => set({ providerId }),
      setEncryptionEnabled: (enabled) => set({ encryptionEnabled: enabled }),
      setPassphrase: (passphrase) => set({ passphrase }),
      clearError: () => set({ error: null }),

      connect: async () => {
        if (!FEATURE_FLAG) {
          set({ error: "Cloud sync is disabled by feature flag.", status: "error" });
          return;
        }
        set({ status: "syncing", error: null });
        try {
          const { providerId } = get();
          if (providerId !== "google-drive") {
            throw new Error("Only Google Drive is supported in v1.");
          }
          const provider = getSyncProvider(providerId);
          const auth = await withRetry(() =>
            provider.signIn({ interactive: true }),
          );
          const linkedAccount = await withRetry(() =>
            provider.getAccountProfile(auth),
          );
          const remoteFileMeta = await withRetry(() =>
            provider.ensureSyncFile(auth),
          );
          set({
            auth,
            linkedAccount,
            remoteFileMeta,
            status: "up-to-date",
            error: null,
          });
        } catch (error) {
          set({
            status: "error",
            error: (error as Error).message,
          });
        }
      },

      disconnect: async () => {
        const state = get();
        try {
          const provider = getSyncProvider(state.providerId);
          await provider.signOut(state.auth);
        } finally {
          set({
            auth: null,
            linkedAccount: null,
            remoteFileMeta: null,
            status: "not-connected",
            conflict: null,
            error: null,
          });
        }
      },

      loadLinkedAccount: async () => {
        const state = get();
        if (!state.auth || !state.remoteFileMeta) return;
        if (state.linkedAccount?.email || state.linkedAccount?.displayName) return;
        if (isAuthExpired(state.auth)) {
          set({
            status: "not-connected",
            auth: null,
            linkedAccount: null,
            error: "Session expired. Click Connect Google Drive.",
          });
          return;
        }
        try {
          const provider = getSyncProvider(state.providerId);
          const linkedAccount = await withRetry(() =>
            provider.getAccountProfile(state.auth),
          );
          if (linkedAccount) {
            set({ linkedAccount });
          }
        } catch (error) {
          const message = (error as Error).message;
          if (message.includes("(401)") || message.toLowerCase().includes("invalid_token")) {
            set({
              status: "not-connected",
              auth: null,
              linkedAccount: null,
              error: "Session expired. Click Connect Google Drive.",
            });
            return;
          }
          // Non-blocking profile fetch; keep current sync state untouched.
        }
      },

      deleteCloudData: async () => {
        const state = get();
        const auth = await ensureFreshAuth();
        if (!auth || !state.remoteFileMeta) {
          set({ status: "not-connected" });
          return;
        }

        set({ status: "syncing", error: null });
        try {
          const provider = getSyncProvider(state.providerId);
          await withRetry(() =>
            provider.deleteSyncFile(auth, state.remoteFileMeta!),
          );
          const remoteFileMeta = await withRetry(() =>
            provider.ensureSyncFile(auth),
          );
          set({
            status: "up-to-date",
            conflict: null,
            remoteFileMeta,
            lastSyncAt: null,
          });
        } catch (error) {
          const message = (error as Error).message;
          if (isAuthError(message)) {
            set({
              status: "error",
              error: "Session expired. Reconnect to Google Drive.",
              auth: null,
            });
            return;
          }
          set({
            status: "error",
            error: message,
          });
        }
      },

      restoreFromCloud: async () => {
        const state = get();
        const auth = await ensureFreshAuth();
        if (!auth || !state.remoteFileMeta) {
          set({ status: "not-connected" });
          return;
        }
        if (state.encryptionEnabled && !state.passphrase) {
          set({
            status: "error",
            error:
              "Encryption is enabled. Enter your passphrase to restore cloud data.",
          });
          return;
        }

        set({ status: "syncing", error: null });
        try {
          const provider = getSyncProvider(state.providerId);
          const remoteResult = await withRetry(() =>
            provider.downloadSyncFile(auth, state.remoteFileMeta!),
          );
          const remoteEnvelope = await parseRemoteEnvelope(
            remoteResult.raw,
            state.passphrase || undefined,
          );

          if (!remoteEnvelope) {
            set({
              status: "error",
              error: "No cloud backup found yet. Run Sync now to create one.",
            });
            return;
          }

          await replaceLocalResumes(remoteEnvelope.resumes);
          await refreshResumeStore();
          set({
            status: "up-to-date",
            conflict: null,
            remoteFileMeta: remoteResult.fileMeta,
            lastSyncAt: new Date().toISOString(),
          });
        } catch (error) {
          const message = (error as Error).message;
          if (isAuthError(message)) {
            set({
              status: "error",
              error: "Session expired. Reconnect to Google Drive.",
              auth: null,
            });
            return;
          }
          set({
            status: "error",
            error: message,
          });
        }
      },

      syncNow: async () => {
        const state = get();
        trackSyncMetric("attempt");
        const auth = await ensureFreshAuth();
        if (!auth || !state.remoteFileMeta) {
          set({ status: "not-connected" });
          return;
        }
        if (state.encryptionEnabled && !state.passphrase) {
          set({
            status: "error",
            error:
              "Encryption is enabled. Enter your passphrase to continue syncing.",
          });
          return;
        }

        set({ status: "syncing", error: null });
        try {
          await persistCurrentResumeIfNeeded();
          const provider = getSyncProvider(state.providerId);
          const localResumes = await getLocalResumesSnapshot();
          const localEnvelope = await buildCloudEnvelope(localResumes, state.deviceId);
          const remoteResult = await withRetry(() =>
            provider.downloadSyncFile(auth, state.remoteFileMeta!),
          );
          const remoteEnvelope = await parseRemoteEnvelope(
            remoteResult.raw,
            state.passphrase || undefined,
          );

          const comparison = compareEnvelopes(localEnvelope, remoteEnvelope);
          if (comparison.state === "in-sync") {
            trackSyncMetric("sync_success");
            logSyncEvent("info", "sync_success", {
              mode: "in-sync",
              providerId: state.providerId,
              conflictRate: getConflictRate(),
            });
            set({
              status: "up-to-date",
              conflict: null,
              remoteFileMeta: remoteResult.fileMeta,
              lastSyncAt: new Date().toISOString(),
            });
            return;
          }

          if (comparison.state === "remote-newer" && comparison.remoteEnvelope) {
            await replaceLocalResumes(comparison.remoteEnvelope.resumes);
            await refreshResumeStore();
            trackSyncMetric("sync_success");
            logSyncEvent("info", "sync_success", {
              mode: "remote-newer",
              providerId: state.providerId,
              conflictRate: getConflictRate(),
            });
            set({
              status: "up-to-date",
              conflict: null,
              remoteFileMeta: remoteResult.fileMeta,
              lastSyncAt: new Date().toISOString(),
            });
            return;
          }

          if (comparison.state === "diverged" && comparison.remoteEnvelope) {
            trackSyncMetric("conflict");
            logSyncEvent("info", "sync_conflict", {
              providerId: state.providerId,
              conflictRate: getConflictRate(),
            });
            set({
              status: "conflict",
              conflict: {
                localEnvelope: comparison.localEnvelope,
                remoteEnvelope: comparison.remoteEnvelope,
              },
              remoteFileMeta: remoteResult.fileMeta,
            });
            return;
          }

          const uploadedMeta = await uploadLocalEnvelope(
            get(),
            remoteResult.fileMeta,
          );
          trackSyncMetric("sync_success");
          logSyncEvent("info", "sync_success", {
            mode: "uploaded-local",
            providerId: state.providerId,
            conflictRate: getConflictRate(),
          });
          set({
            status: "up-to-date",
            remoteFileMeta: uploadedMeta,
            lastSyncAt: new Date().toISOString(),
            conflict: null,
          });
        } catch (error) {
          const message = (error as Error).message;
          if (isAuthError(message)) {
            trackSyncMetric("sync_failure");
            logSyncEvent("error", "sync_failure", {
              providerId: state.providerId,
              reason: "auth-expired",
              rawError: message,
            });
            set({
              status: "error",
              error: "Session expired. Reconnect to Google Drive.",
              auth: null,
            });
            return;
          }
          trackSyncMetric("sync_failure");
          logSyncEvent("error", "sync_failure", {
            providerId: state.providerId,
            reason: "sync-error",
            rawError: message,
          });
          set({
            status: "error",
            error: toUserFacingSyncError(message),
          });
        }
      },

      resolveConflict: async (resolution) => {
        const state = get();
        const conflict = state.conflict;
        const auth = await ensureFreshAuth();
        if (!conflict || !auth || !state.remoteFileMeta) {
          return;
        }

        set({ status: "syncing", error: null });
        try {
          if (resolution === "use-cloud") {
            await replaceLocalResumes(conflict.remoteEnvelope.resumes);
            await refreshResumeStore();
            set({
              status: "up-to-date",
              conflict: null,
              lastSyncAt: new Date().toISOString(),
            });
            return;
          }

          if (resolution === "keep-both") {
            const localCopies = duplicateWithConflictSuffix(conflict.localEnvelope.resumes);
            const merged = [...conflict.remoteEnvelope.resumes, ...localCopies];
            await replaceLocalResumes(merged);
            await refreshResumeStore();
            const uploadedMeta = await uploadLocalEnvelope(get());
            set({
              status: "up-to-date",
              conflict: null,
              remoteFileMeta: uploadedMeta,
              lastSyncAt: new Date().toISOString(),
            });
            return;
          }

          const uploadedMeta = await uploadLocalEnvelope(get());
          set({
            status: "up-to-date",
            conflict: null,
            remoteFileMeta: uploadedMeta,
            lastSyncAt: new Date().toISOString(),
          });
        } catch (error) {
          const message = (error as Error).message;
          if (isAuthError(message)) {
            set({
              status: "error",
              error: "Session expired. Reconnect to Google Drive.",
              auth: null,
            });
            return;
          }
          set({
            status: "error",
            error: message,
          });
        }
      },

      startupPull: async () => {
        const state = get();
        if (!state.auth || !state.remoteFileMeta) return;
        try {
          const auth = await ensureFreshAuth();
          if (!auth) return;
          const provider = getSyncProvider(state.providerId);
          const remoteResult = await withRetry(() =>
            provider.downloadSyncFile(auth, state.remoteFileMeta!),
          );
          const remoteEnvelope = await parseRemoteEnvelope(
            remoteResult.raw,
            state.passphrase || undefined,
          );
          if (!remoteEnvelope) return;
          await replaceLocalResumes(remoteEnvelope.resumes);
          await refreshResumeStore();
          set({
            status: "up-to-date",
            remoteFileMeta: remoteResult.fileMeta,
            lastSyncAt: new Date().toISOString(),
          });
        } catch (error) {
          const message = (error as Error).message;
          if (isAuthError(message)) {
            set({
              status: "error",
              error: "Session expired. Reconnect to Google Drive.",
              auth: null,
            });
            return;
          }
          set({
            status: "error",
            error: message,
          });
        }
      },
    }),
    {
      name: STORAGE_KEY,
      storage,
      partialize: (state) => ({
        providerId: state.providerId,
        auth: state.auth,
        remoteFileMeta: state.remoteFileMeta,
        lastSyncAt: state.lastSyncAt,
        encryptionEnabled: state.encryptionEnabled,
        deviceId: state.deviceId,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        state.status = state.auth && state.remoteFileMeta ? "up-to-date" : "not-connected";
      },
    },
  ),
);

export const isCloudSyncEnabled = FEATURE_FLAG;
