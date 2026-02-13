import { describe, expect, it } from "vitest";
import { createMockResume } from "@/tests/utils/factories";
import { buildCloudEnvelope } from "@/lib/sync/schema";
import {
  compareEnvelopes,
  duplicateWithConflictSuffix,
  parseRemoteEnvelope,
} from "@/lib/sync/engine";
import { encryptEnvelope } from "@/lib/sync/crypto";

describe("sync engine", () => {
  it("detects in-sync when checksums match", async () => {
    const resumes = [createMockResume({ id: "resume-1" })];
    const local = await buildCloudEnvelope(resumes, "device-a");
    const remote = { ...local };
    const result = compareEnvelopes(local, remote);
    expect(result.state).toBe("in-sync");
  });

  it("detects remote-newer by timestamp", async () => {
    const local = await buildCloudEnvelope([createMockResume({ id: "a" })], "d1");
    const remote = await buildCloudEnvelope([createMockResume({ id: "b" })], "d2");
    local.updatedAt = "2026-02-01T00:00:00.000Z";
    remote.updatedAt = "2026-02-02T00:00:00.000Z";
    const result = compareEnvelopes(local, remote);
    expect(result.state).toBe("remote-newer");
  });

  it("detects diverged when checksums differ and timestamps are equal", async () => {
    const local = await buildCloudEnvelope([createMockResume({ id: "a" })], "d1");
    const remote = await buildCloudEnvelope([createMockResume({ id: "b" })], "d2");
    remote.updatedAt = local.updatedAt;
    const result = compareEnvelopes(local, remote);
    expect(result.state).toBe("diverged");
  });

  it("detects diverged on large clock skew across devices", async () => {
    const local = await buildCloudEnvelope([createMockResume({ id: "a" })], "device-a");
    const remote = await buildCloudEnvelope([createMockResume({ id: "b" })], "device-b");
    local.updatedAt = "2026-01-01T00:00:00.000Z";
    remote.updatedAt = "2026-02-15T00:00:00.000Z";
    const result = compareEnvelopes(local, remote);
    expect(result.state).toBe("diverged");
  });

  it("parses encrypted remote envelope when passphrase is provided", async () => {
    const base = await buildCloudEnvelope([createMockResume({ id: "a" })], "d1");
    const encrypted = await encryptEnvelope(base, "secret");
    const parsed = await parseRemoteEnvelope(JSON.stringify(encrypted), "secret");
    expect(parsed?.resumes.length).toBe(1);
    expect(parsed?.encrypted).toBe(true);
  });

  it("treats invalid/legacy remote JSON as empty remote state", async () => {
    const parsed = await parseRemoteEnvelope("{}");
    expect(parsed).toBeNull();
  });

  it("throws on malformed v1 envelope instead of treating it as legacy", async () => {
    await expect(
      parseRemoteEnvelope(JSON.stringify({ version: 1 })),
    ).rejects.toThrow("Invalid cloud sync envelope.");
  });

  it("throws when v1 envelope contains invalid encrypted payload", async () => {
    const malformedEncrypted = {
      version: 1,
      updatedAt: "2026-02-12T00:00:00.000Z",
      deviceId: "device-a",
      checksum: "abc123",
      encrypted: true,
      payload: { alg: "AES-GCM" },
    };

    await expect(
      parseRemoteEnvelope(JSON.stringify(malformedEncrypted), "secret"),
    ).rejects.toThrow("Invalid encrypted cloud sync payload.");
  });

  it("throws when v1 envelope contains invalid resume records", async () => {
    const malformedResumes = {
      version: 1,
      updatedAt: "2026-02-12T00:00:00.000Z",
      deviceId: "device-a",
      checksum: "abc123",
      encrypted: false,
      resumes: [{ id: 123 }],
    };

    await expect(
      parseRemoteEnvelope(JSON.stringify(malformedResumes)),
    ).rejects.toThrow("Invalid cloud sync resumes payload.");
  });

  it("duplicates resumes with conflict suffix", () => {
    const duplicated = duplicateWithConflictSuffix([
      createMockResume({ id: "resume-1", meta: { ...createMockResume().meta, title: "Base" } }),
    ]);
    expect(duplicated[0].id).not.toBe("resume-1");
    expect(duplicated[0].meta.title).toContain("Conflict copy");
  });
});
