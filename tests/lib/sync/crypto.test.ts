import { describe, expect, it } from "vitest";
import { createMockResume } from "@/tests/utils/factories";
import { buildCloudEnvelope } from "@/lib/sync/schema";
import {
  decryptEnvelope,
  decryptPayload,
  encryptEnvelope,
  encryptPayload,
} from "@/lib/sync/crypto";

describe("sync crypto", () => {
  it("encrypts and decrypts payload", async () => {
    const plaintext = JSON.stringify({ hello: "world" });
    const payload = await encryptPayload(plaintext, "secret-passphrase");
    const decrypted = await decryptPayload(payload, "secret-passphrase");
    expect(decrypted).toBe(plaintext);
  });

  it("fails decrypt with wrong passphrase", async () => {
    const payload = await encryptPayload("top-secret", "pass-A");
    await expect(decryptPayload(payload, "pass-B")).rejects.toThrow();
  });

  it("encrypts and decrypts a cloud envelope", async () => {
    const envelope = await buildCloudEnvelope([createMockResume()], "device-1");
    const encrypted = await encryptEnvelope(envelope, "secret-passphrase");
    expect(encrypted.encrypted).toBe(true);
    expect(encrypted.resumes).toEqual([]);
    const decrypted = await decryptEnvelope(encrypted, "secret-passphrase");
    expect(decrypted.resumes.length).toBe(1);
    expect(decrypted.checksum).toBe(envelope.checksum);
  });

  it("rejects encrypted envelope with checksum mismatch", async () => {
    const envelope = await buildCloudEnvelope([createMockResume()], "device-1");
    const encrypted = await encryptEnvelope(envelope, "secret-passphrase");
    const tampered = { ...encrypted, checksum: "deadbeef" };
    await expect(
      decryptEnvelope(tampered, "secret-passphrase"),
    ).rejects.toThrow("integrity check");
  });
});
