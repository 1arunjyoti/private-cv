import { beforeEach, describe, expect, it, vi } from "vitest";
import { GoogleDriveSyncProvider } from "@/lib/sync/providers/googleDrive";
import type { ProviderAuthState } from "@/lib/sync/providers/types";

describe("google drive sync provider", () => {
  const auth: ProviderAuthState = {
    accessToken: "token",
    expiresAt: Date.now() + 60_000,
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("throws on signIn when client id env var is missing", async () => {
    const original = process.env.NEXT_PUBLIC_GOOGLE_DRIVE_CLIENT_ID;
    delete process.env.NEXT_PUBLIC_GOOGLE_DRIVE_CLIENT_ID;
    const provider = new GoogleDriveSyncProvider();
    await expect(provider.signIn()).rejects.toThrow(
      "Missing NEXT_PUBLIC_GOOGLE_DRIVE_CLIENT_ID",
    );
    process.env.NEXT_PUBLIC_GOOGLE_DRIVE_CLIENT_ID = original;
  });

  it("returns existing appData file when present", async () => {
    const provider = new GoogleDriveSyncProvider();
    vi.spyOn(global, "fetch")
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ files: [{ id: "file-1", modifiedTime: "2026-02-01T00:00:00Z" }] }),
          { status: 200 },
        ),
      );

    const result = await provider.ensureSyncFile(auth);
    expect(result.remoteId).toBe("file-1");
  });

  it("downloads sync file metadata and content", async () => {
    const provider = new GoogleDriveSyncProvider();
    vi.spyOn(global, "fetch")
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ id: "file-1", modifiedTime: "2026-02-01T00:00:00Z" }), {
          status: 200,
          headers: { etag: "etag-1" },
        }),
      )
      .mockResolvedValueOnce(
        new Response('{"version":1}', {
          status: 200,
          headers: { etag: "etag-2" },
        }),
      );

    const result = await provider.downloadSyncFile(auth, { remoteId: "file-1" });
    expect(result.fileMeta.remoteId).toBe("file-1");
    expect(result.fileMeta.etag).toBe("etag-2");
    expect(result.raw).toContain('"version":1');
  });

  it("fetches connected account profile", async () => {
    const provider = new GoogleDriveSyncProvider();
    vi.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          user: { displayName: "Test User", emailAddress: "user@example.com" },
        }),
        { status: 200 },
      ),
    );

    const profile = await provider.getAccountProfile(auth);
    expect(profile?.displayName).toBe("Test User");
    expect(profile?.email).toBe("user@example.com");
  });

  it("uploads file content and keeps metadata", async () => {
    const provider = new GoogleDriveSyncProvider();
    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ id: "file-1", modifiedTime: "2026-02-01T00:00:00Z" }), {
        status: 200,
        headers: { etag: "etag-3" },
      }),
    );

    const result = await provider.uploadSyncFile(auth, {
      fileMeta: { remoteId: "file-1", etag: "etag-2" },
      content: '{"hello":"world"}',
    });
    expect(result.remoteId).toBe("file-1");
    expect(result.etag).toBe("etag-3");
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining("/upload/drive/v3/files/file-1"),
      expect.objectContaining({
        method: "PATCH",
      }),
    );
  });

  it("deletes sync file from app data", async () => {
    const provider = new GoogleDriveSyncProvider();
    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(null, { status: 200 }),
    );
    await provider.deleteSyncFile(auth, { remoteId: "file-1" });
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining("/drive/v3/files/file-1"),
      expect.objectContaining({ method: "DELETE" }),
    );
  });
});
