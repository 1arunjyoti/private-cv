import { describe, expect, it } from "vitest";
import { GoogleDriveSyncProvider } from "@/lib/sync/providers/googleDrive";
import type { ProviderAuthState } from "@/lib/sync/providers/types";

const shouldRunIntegration =
  process.env.RUN_GOOGLE_DRIVE_INTEGRATION === "true" &&
  !!process.env.GOOGLE_DRIVE_SYNC_TEST_TOKEN;

const describeIntegration = shouldRunIntegration ? describe : describe.skip;

describeIntegration("google drive sync provider integration", () => {
  it("round-trips sync payload in appDataFolder", async () => {
    const token = process.env.GOOGLE_DRIVE_SYNC_TEST_TOKEN;
    if (!token) {
      throw new Error("Missing GOOGLE_DRIVE_SYNC_TEST_TOKEN.");
    }

    const provider = new GoogleDriveSyncProvider(
      `privatecv-sync-integration-${Date.now()}.json`,
    );
    const auth: ProviderAuthState = {
      accessToken: token,
      expiresAt: Date.now() + 10 * 60_000,
    };

    const fileMeta = await provider.ensureSyncFile(auth);
    const payload = JSON.stringify({
      version: 1,
      updatedAt: new Date().toISOString(),
      deviceId: "integration-test",
      checksum: "integration-checksum",
      encrypted: false,
      resumes: [],
    });

    let uploadedMeta = fileMeta;
    try {
      uploadedMeta = await provider.uploadSyncFile(auth, {
        fileMeta,
        content: payload,
      });
      const downloaded = await provider.downloadSyncFile(auth, uploadedMeta);
      expect(downloaded.raw).toBe(payload);
      expect(downloaded.fileMeta.remoteId).toBe(uploadedMeta.remoteId);
    } finally {
      await provider.deleteSyncFile(auth, uploadedMeta);
    }
  });
});
