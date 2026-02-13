import { beforeEach, describe, expect, it, vi } from "vitest";
import { createMockResume } from "@/tests/utils/factories";

const mockProvider = {
  signIn: vi.fn(),
  signOut: vi.fn(),
  getAuthState: vi.fn(),
  getAccountProfile: vi.fn(),
  deleteSyncFile: vi.fn(),
  ensureSyncFile: vi.fn(),
  downloadSyncFile: vi.fn(),
  uploadSyncFile: vi.fn(),
};

const mockSetResumeState = vi.fn();

vi.mock("@/lib/sync/providers", () => ({
  getSyncProvider: vi.fn(() => mockProvider),
}));

vi.mock("@/store/useResumeStore", () => ({
  useResumeStore: {
    getState: () => ({ currentResume: null }),
    setState: mockSetResumeState,
  },
}));

vi.mock("@/db", () => ({
  db: {
    resumes: {
      toArray: vi.fn(),
      put: vi.fn(),
      orderBy: vi.fn(() => ({
        reverse: vi.fn(() => ({
          toArray: vi.fn().mockResolvedValue([]),
        })),
      })),
      clear: vi.fn(),
      bulkPut: vi.fn(),
    },
    settings: {
      get: vi.fn().mockResolvedValue(null),
      put: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn().mockResolvedValue(undefined),
    },
    transaction: vi.fn(async (_mode: string, _table: unknown, fn: () => Promise<void>) => {
      await fn();
    }),
  },
}));

describe("useSyncStore", () => {
  const createCurrentResume = (title: string, id = "resume-1") => {
    const base = createMockResume({ id });
    return {
      ...base,
      meta: {
        ...base.meta,
        title,
      },
    };
  };

  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_ENABLE_CLOUD_SYNC = "true";
    const { db } = await import("@/db");
    vi.mocked(db.resumes.toArray).mockResolvedValue([]);
  });

  it("connects and stores auth/remote metadata", async () => {
    mockProvider.signIn.mockResolvedValue({
      accessToken: "token",
      expiresAt: Date.now() + 60_000,
    });
    mockProvider.getAccountProfile.mockResolvedValue({
      email: "user@example.com",
      displayName: "Test User",
    });
    mockProvider.ensureSyncFile.mockResolvedValue({ remoteId: "remote-file" });
    mockProvider.downloadSyncFile.mockResolvedValue({
      fileMeta: { remoteId: "remote-file" },
      raw: null,
    });

    const { useSyncStore } = await import("@/store/useSyncStore");
    await useSyncStore.getState().connect();
    const state = useSyncStore.getState();
    expect(state.auth?.accessToken).toBe("token");
    expect(state.remoteFileMeta?.remoteId).toBe("remote-file");
    expect(state.linkedAccount?.email).toBe("user@example.com");
  });

  it("requires passphrase when encryption is enabled", async () => {
    const { useSyncStore } = await import("@/store/useSyncStore");
    useSyncStore.setState({
      auth: { accessToken: "token", expiresAt: Date.now() + 60_000 },
      remoteFileMeta: { remoteId: "remote-file" },
      encryptionEnabled: true,
      passphrase: "",
    });
    await useSyncStore.getState().syncNow();
    expect(useSyncStore.getState().status).toBe("error");
    expect(useSyncStore.getState().error).toContain("passphrase");
  });

  it("refreshes auth when token is expired", async () => {
    mockProvider.signIn.mockResolvedValue({
      accessToken: "new-token",
      expiresAt: Date.now() + 60_000,
    });
    mockProvider.getAccountProfile.mockResolvedValue({
      email: "user@example.com",
    });
    mockProvider.downloadSyncFile.mockResolvedValue({
      fileMeta: { remoteId: "remote-file" },
      raw: null,
    });

    const { useSyncStore } = await import("@/store/useSyncStore");
    useSyncStore.setState({
      auth: { accessToken: "old-token", expiresAt: Date.now() - 1000 },
      remoteFileMeta: { remoteId: "remote-file" },
    });
    await useSyncStore.getState().syncNow();
    expect(mockProvider.signIn).toHaveBeenCalledTimes(1);
    expect(useSyncStore.getState().auth?.accessToken).toBe("new-token");
  });

  it("persists current resume before syncing", async () => {
    const { db } = await import("@/db");
    const { useSyncStore } = await import("@/store/useSyncStore");
    const { useResumeStore } = await import("@/store/useResumeStore");
    mockProvider.downloadSyncFile.mockResolvedValue({
      fileMeta: { remoteId: "remote-file" },
      raw: null,
    });
    useResumeStore.getState = (() => ({
      currentResume: createCurrentResume("Test"),
    })) as never;
    useSyncStore.setState({
      auth: { accessToken: "token", expiresAt: Date.now() + 60_000 },
      remoteFileMeta: { remoteId: "remote-file" },
    });
    await useSyncStore.getState().syncNow();
    expect(vi.mocked(db.resumes.put)).toHaveBeenCalledTimes(2);
  });

  it("includes current resume even if not in db snapshot", async () => {
    const { db } = await import("@/db");
    const { useSyncStore } = await import("@/store/useSyncStore");
    const { useResumeStore } = await import("@/store/useResumeStore");
    vi.mocked(db.resumes.toArray).mockResolvedValue([]);
    mockProvider.downloadSyncFile.mockResolvedValue({
      fileMeta: { remoteId: "remote-file" },
      raw: null,
    });
    useResumeStore.getState = (() => ({
      currentResume: createCurrentResume("InMemory"),
    })) as never;
    useSyncStore.setState({
      auth: { accessToken: "token", expiresAt: Date.now() + 60_000 },
      remoteFileMeta: { remoteId: "remote-file" },
    });
    await useSyncStore.getState().syncNow();
    expect(mockProvider.downloadSyncFile).toHaveBeenCalledTimes(1);
  });

  it("deletes cloud backup and re-initializes sync file", async () => {
    const { useSyncStore } = await import("@/store/useSyncStore");
    mockProvider.deleteSyncFile.mockResolvedValue(undefined);
    mockProvider.ensureSyncFile.mockResolvedValue({ remoteId: "new-remote-file" });
    useSyncStore.setState({
      auth: { accessToken: "token", expiresAt: Date.now() + 60_000 },
      remoteFileMeta: { remoteId: "remote-file" },
      lastSyncAt: "2026-02-12T00:00:00.000Z",
    });
    await useSyncStore.getState().deleteCloudData();
    expect(mockProvider.deleteSyncFile).toHaveBeenCalledTimes(1);
    expect(mockProvider.ensureSyncFile).toHaveBeenCalledTimes(1);
    expect(useSyncStore.getState().remoteFileMeta?.remoteId).toBe("new-remote-file");
    expect(useSyncStore.getState().lastSyncAt).toBeNull();
  });

  it("persists current resume before conflict-resolution upload", async () => {
    const { db } = await import("@/db");
    const { useSyncStore } = await import("@/store/useSyncStore");
    const { useResumeStore } = await import("@/store/useResumeStore");
    useResumeStore.getState = (() => ({
      currentResume: createCurrentResume("Unsaved Changes"),
    })) as never;
    mockProvider.uploadSyncFile.mockResolvedValue({ remoteId: "remote-file" });
    useSyncStore.setState({
      auth: { accessToken: "token", expiresAt: Date.now() + 60_000 },
      remoteFileMeta: { remoteId: "remote-file" },
      conflict: {
        localEnvelope: {
          version: 1,
          updatedAt: "2026-01-01T00:00:00.000Z",
          deviceId: "local",
          resumes: [],
          checksum: "a",
          encrypted: false,
        },
        remoteEnvelope: {
          version: 1,
          updatedAt: "2026-01-01T00:00:00.000Z",
          deviceId: "remote",
          resumes: [],
          checksum: "b",
          encrypted: false,
        },
      },
      status: "conflict",
    });
    await useSyncStore.getState().resolveConflict("keep-local");
    expect(vi.mocked(db.resumes.put)).toHaveBeenCalledTimes(1);
    expect(mockProvider.uploadSyncFile).toHaveBeenCalledTimes(1);
  });

  it("sets conflict state when local and remote diverge", async () => {
    const { db } = await import("@/db");
    vi.mocked(db.resumes.toArray).mockResolvedValue([
      {
        id: "resume-local",
        meta: {
          title: "Local",
          templateId: "ats",
          themeColor: "#000",
          lastModified: "2026-02-01T00:00:00.000Z",
          layoutSettings: {} as never,
        },
        basics: {
          name: "",
          label: "",
          image: "",
          email: "",
          phone: "",
          url: "",
          summary: "",
          location: {
            city: "",
            country: "",
            postalCode: "",
            region: "",
            address: "",
          },
          profiles: [],
        },
        work: [],
        education: [],
        skills: [],
        projects: [],
        certificates: [],
        languages: [],
        interests: [],
        publications: [],
        awards: [],
        references: [],
        custom: [],
      },
    ]);

    mockProvider.downloadSyncFile.mockResolvedValue({
      fileMeta: { remoteId: "remote-file" },
      raw: JSON.stringify({
        version: 1,
        updatedAt: "invalid-date",
        deviceId: "remote-device",
        encrypted: false,
        checksum: "different",
        resumes: [
          {
            id: "resume-remote",
            meta: {
              title: "Remote",
              templateId: "ats",
              themeColor: "#000",
              lastModified: "2026-02-01T00:00:00.000Z",
              layoutSettings: {},
            },
            basics: {
              name: "",
              label: "",
              image: "",
              email: "",
              phone: "",
              url: "",
              summary: "",
              location: {
                city: "",
                country: "",
                postalCode: "",
                region: "",
                address: "",
              },
              profiles: [],
            },
            work: [],
            education: [],
            skills: [],
            projects: [],
            certificates: [],
            languages: [],
            interests: [],
            publications: [],
            awards: [],
            references: [],
            custom: [],
          },
        ],
      }),
    });

    const { useSyncStore } = await import("@/store/useSyncStore");
    useSyncStore.setState({
      auth: { accessToken: "token", expiresAt: Date.now() + 60_000 },
      remoteFileMeta: { remoteId: "remote-file" },
    });
    await useSyncStore.getState().syncNow();
    expect(useSyncStore.getState().status).toBe("conflict");
    expect(useSyncStore.getState().conflict).not.toBeNull();
  });

  it("does not auto-sync without manual trigger", async () => {
    vi.useFakeTimers();
    const { useSyncStore } = await import("@/store/useSyncStore");
    const syncSpy = vi.fn().mockResolvedValue(undefined);
    useSyncStore.setState({
      auth: { accessToken: "token", expiresAt: Date.now() + 60_000 },
      remoteFileMeta: { remoteId: "remote-file" },
      syncNow: syncSpy,
    } as never);

    vi.advanceTimersByTime(10 * 60 * 1000);
    expect(syncSpy).toHaveBeenCalledTimes(0);
    vi.useRealTimers();
  });

  it("clears auth and shows reconnect message when sync hits 401", async () => {
    const { useSyncStore } = await import("@/store/useSyncStore");
    mockProvider.downloadSyncFile.mockRejectedValue(
      new Error("Google Drive API error (401): invalid_token"),
    );

    useSyncStore.setState({
      auth: { accessToken: "token", expiresAt: Date.now() + 60_000 },
      remoteFileMeta: { remoteId: "remote-file" },
    });

    await useSyncStore.getState().syncNow();

    expect(useSyncStore.getState().auth).toBeNull();
    expect(useSyncStore.getState().status).toBe("error");
    expect(useSyncStore.getState().error).toContain("Session expired");
  });

  it("surfaces malformed v1 payloads as sync errors", async () => {
    const { useSyncStore } = await import("@/store/useSyncStore");
    mockProvider.downloadSyncFile.mockResolvedValue({
      fileMeta: { remoteId: "remote-file" },
      raw: JSON.stringify({
        version: 1,
        updatedAt: "2026-02-12T00:00:00.000Z",
        deviceId: "remote-device",
        encrypted: false,
        checksum: "different",
        resumes: [{ id: 123 }],
      }),
    });

    useSyncStore.setState({
      auth: { accessToken: "token", expiresAt: Date.now() + 60_000 },
      remoteFileMeta: { remoteId: "remote-file" },
    });

    await useSyncStore.getState().syncNow();

    expect(useSyncStore.getState().status).toBe("error");
    expect(useSyncStore.getState().error).toContain("Cloud backup data appears invalid");
  });

  it("retries transient 429 errors before succeeding", async () => {
    const { useSyncStore } = await import("@/store/useSyncStore");

    mockProvider.downloadSyncFile
      .mockRejectedValueOnce(new Error("Google Drive API error (429): rate limit"))
      .mockRejectedValueOnce(new Error("Google Drive API error (429): rate limit"))
      .mockResolvedValue({
        fileMeta: { remoteId: "remote-file" },
        raw: null,
      });
    mockProvider.uploadSyncFile.mockResolvedValue({ remoteId: "remote-file" });

    useSyncStore.setState({
      auth: { accessToken: "token", expiresAt: Date.now() + 60_000 },
      remoteFileMeta: { remoteId: "remote-file" },
    });

    await useSyncStore.getState().syncNow();

    expect(mockProvider.downloadSyncFile).toHaveBeenCalledTimes(3);
    expect(useSyncStore.getState().status).toBe("up-to-date");
  });
});
