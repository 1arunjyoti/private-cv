import { db, type Resume } from "@/db";
import { decryptEnvelope, encryptEnvelope } from "@/lib/sync/crypto";
import { buildCloudEnvelope, parseCloudEnvelope, type CloudSyncEnvelopeV1 } from "@/lib/sync/schema";

export type SyncComparisonState =
  | "in-sync"
  | "local-newer"
  | "remote-newer"
  | "diverged"
  | "remote-missing";

export interface SyncComparison {
  state: SyncComparisonState;
  localEnvelope: CloudSyncEnvelopeV1;
  remoteEnvelope: CloudSyncEnvelopeV1 | null;
}

export interface SyncPreparationInput {
  deviceId: string;
  encryptionEnabled: boolean;
  passphrase?: string;
}

const isEnvelopeLike = (value: unknown): boolean =>
  typeof value === "object" && value !== null && "version" in value;

export function compareEnvelopes(
  localEnvelope: CloudSyncEnvelopeV1,
  remoteEnvelope: CloudSyncEnvelopeV1 | null,
): SyncComparison {
  if (!remoteEnvelope) {
    return { state: "remote-missing", localEnvelope, remoteEnvelope: null };
  }

  if (localEnvelope.checksum === remoteEnvelope.checksum) {
    return { state: "in-sync", localEnvelope, remoteEnvelope };
  }

  const localTime = Date.parse(localEnvelope.updatedAt);
  const remoteTime = Date.parse(remoteEnvelope.updatedAt);
  const skewMs = Math.abs(localTime - remoteTime);
  const MAX_CLOCK_SKEW_MS = 7 * 24 * 60 * 60 * 1000;

  if (Number.isFinite(localTime) && Number.isFinite(remoteTime)) {
    if (skewMs > MAX_CLOCK_SKEW_MS && localEnvelope.deviceId !== remoteEnvelope.deviceId) {
      return { state: "diverged", localEnvelope, remoteEnvelope };
    }
    if (localTime > remoteTime) {
      return { state: "local-newer", localEnvelope, remoteEnvelope };
    }
    if (remoteTime > localTime) {
      return { state: "remote-newer", localEnvelope, remoteEnvelope };
    }
  }

  return { state: "diverged", localEnvelope, remoteEnvelope };
}

export async function buildLocalEnvelope(
  input: SyncPreparationInput,
): Promise<CloudSyncEnvelopeV1> {
  const resumes = await db.resumes.toArray();
  const envelope = await buildCloudEnvelope(resumes, input.deviceId);

  if (!input.encryptionEnabled) {
    return envelope;
  }
  if (!input.passphrase) {
    throw new Error("Passphrase is required when encryption is enabled.");
  }
  return encryptEnvelope(envelope, input.passphrase);
}

export async function parseRemoteEnvelope(
  raw: string | null,
  passphrase?: string,
): Promise<CloudSyncEnvelopeV1 | null> {
  let envelope: CloudSyncEnvelopeV1 | null = null;
  try {
    envelope = parseCloudEnvelope(raw);
  } catch (error) {
    const message = (error as Error).message;
    if (error instanceof SyntaxError) {
      return null;
    }
    if (
      message !== "Invalid cloud sync envelope." &&
      message !== "Invalid cloud sync resumes payload." &&
      message !== "Invalid encrypted cloud sync payload."
    ) {
      throw error;
    }

    // Backward compatibility: treat non-envelope/legacy JSON as empty remote.
    // This lets first sync bootstrap without forcing manual cloud cleanup.
    try {
      const parsed = raw ? (JSON.parse(raw) as unknown) : null;
      if (isEnvelopeLike(parsed)) {
        throw error;
      }
      return null;
    } catch (parseError) {
      if (parseError instanceof SyntaxError) {
        return null;
      }
      throw parseError;
    }
  }
  if (!envelope) return null;
  if (!envelope.encrypted) return envelope;
  if (!passphrase) {
    throw new Error("Passphrase required to read encrypted cloud sync data.");
  }
  return decryptEnvelope(envelope, passphrase);
}

export async function replaceLocalResumes(resumes: Resume[]): Promise<void> {
  await db.transaction("rw", db.resumes, async () => {
    await db.resumes.clear();
    if (resumes.length > 0) {
      await db.resumes.bulkPut(resumes);
    }
  });
}

export function duplicateWithConflictSuffix(resumes: Resume[]): Resume[] {
  const suffix = new Date().toISOString().slice(0, 19).replace("T", " ");
  return resumes.map((resume) => ({
    ...resume,
    id: crypto.randomUUID(),
    meta: {
      ...resume.meta,
      title: `${resume.meta.title} (Conflict copy ${suffix})`,
      lastModified: new Date().toISOString(),
    },
  }));
}
