import type { Resume } from "@/db";

export interface EncryptedPayloadV1 {
  alg: "AES-GCM";
  kdf: "PBKDF2";
  salt: string;
  iv: string;
  ciphertext: string;
}

export interface CloudSyncEnvelopeV1 {
  version: 1;
  updatedAt: string;
  deviceId: string;
  resumes: Resume[];
  checksum: string;
  encrypted: boolean;
  payload?: EncryptedPayloadV1;
}

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isValidEncryptedPayload = (
  value: unknown,
): value is EncryptedPayloadV1 => {
  if (!isRecord(value)) return false;
  return (
    value.alg === "AES-GCM" &&
    value.kdf === "PBKDF2" &&
    typeof value.salt === "string" &&
    typeof value.iv === "string" &&
    typeof value.ciphertext === "string"
  );
};

const isValidResumeRecord = (value: unknown): value is Resume => {
  if (!isRecord(value) || !isRecord(value.meta)) {
    return false;
  }
  return (
    typeof value.id === "string" &&
    typeof value.meta.title === "string" &&
    typeof value.meta.templateId === "string" &&
    typeof value.meta.themeColor === "string" &&
    typeof value.meta.lastModified === "string"
  );
};

export function isValidResumeArray(value: unknown): value is Resume[] {
  return Array.isArray(value) && value.every((item) => isValidResumeRecord(item));
}

function stableStringify(value: JsonValue): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  }

  const entries = Object.keys(value)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`);
  return `{${entries.join(",")}}`;
}

export function normalizeResumes(resumes: Resume[]): Resume[] {
  return [...resumes].sort((a, b) => a.id.localeCompare(b.id));
}

export async function computeEnvelopeChecksum(
  resumes: Resume[],
): Promise<string> {
  const normalized = normalizeResumes(resumes);
  const data = stableStringify(normalized as unknown as JsonValue);
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(data),
  );

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function buildCloudEnvelope(
  resumes: Resume[],
  deviceId: string,
): Promise<CloudSyncEnvelopeV1> {
  const normalized = normalizeResumes(resumes);
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    deviceId,
    resumes: normalized,
    checksum: await computeEnvelopeChecksum(normalized),
    encrypted: false,
  };
}

export function parseCloudEnvelope(raw: string | null): CloudSyncEnvelopeV1 | null {
  if (!raw || !raw.trim()) return null;

  const parsed = JSON.parse(raw) as unknown;
  if (!isRecord(parsed)) {
    throw new Error("Invalid cloud sync envelope.");
  }

  if (
    parsed.version !== 1 ||
    typeof parsed.updatedAt !== "string" ||
    typeof parsed.deviceId !== "string" ||
    typeof parsed.checksum !== "string" ||
    typeof parsed.encrypted !== "boolean"
  ) {
    throw new Error("Invalid cloud sync envelope.");
  }

  if (parsed.resumes !== undefined && !isValidResumeArray(parsed.resumes)) {
    throw new Error("Invalid cloud sync resumes payload.");
  }
  if (parsed.encrypted && !isValidEncryptedPayload(parsed.payload)) {
    throw new Error("Invalid encrypted cloud sync payload.");
  }

  return {
    version: 1,
    updatedAt: parsed.updatedAt,
    deviceId: parsed.deviceId,
    checksum: parsed.checksum,
    encrypted: parsed.encrypted,
    resumes: parsed.resumes ?? [],
    payload: isValidEncryptedPayload(parsed.payload) ? parsed.payload : undefined,
  };
}
