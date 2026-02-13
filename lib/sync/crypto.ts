import {
  computeEnvelopeChecksum,
  type CloudSyncEnvelopeV1,
  type EncryptedPayloadV1,
  isValidResumeArray,
} from "@/lib/sync/schema";

const SALT_BYTES = 16;
const IV_BYTES = 12;
const PBKDF2_ITERATIONS = 150_000;
type StrictBytes = Uint8Array<ArrayBuffer>;

const toStrictBytes = (bytes: Uint8Array): StrictBytes =>
  bytes.buffer instanceof ArrayBuffer
    ? new Uint8Array(
        bytes.buffer,
        bytes.byteOffset,
        bytes.byteLength,
      ) as StrictBytes
    : Uint8Array.from(bytes) as StrictBytes;

const toBase64 = (bytes: Uint8Array): string => {
  let output = "";
  bytes.forEach((byte) => {
    output += String.fromCharCode(byte);
  });
  return btoa(output);
};

const fromBase64 = (value: string): StrictBytes => {
  const decoded = atob(value);
  const bytes = new Uint8Array(decoded.length);
  for (let i = 0; i < decoded.length; i += 1) {
    bytes[i] = decoded.charCodeAt(i);
  }
  return toStrictBytes(bytes);
};

const deriveKey = async (
  passphrase: string,
  salt: StrictBytes,
): Promise<CryptoKey> => {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    toStrictBytes(new TextEncoder().encode(passphrase)),
    "PBKDF2",
    false,
    ["deriveKey"],
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    {
      name: "AES-GCM",
      length: 256,
    },
    false,
    ["encrypt", "decrypt"],
  );
};

export async function encryptPayload(
  plaintext: string,
  passphrase: string,
): Promise<EncryptedPayloadV1> {
  if (!passphrase) {
    throw new Error("Passphrase is required for encryption.");
  }
  const salt = toStrictBytes(crypto.getRandomValues(new Uint8Array(SALT_BYTES)));
  const iv = toStrictBytes(crypto.getRandomValues(new Uint8Array(IV_BYTES)));
  const key = await deriveKey(passphrase, salt);
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    toStrictBytes(new TextEncoder().encode(plaintext)),
  );

  return {
    alg: "AES-GCM",
    kdf: "PBKDF2",
    salt: toBase64(salt),
    iv: toBase64(iv),
    ciphertext: toBase64(new Uint8Array(ciphertext)),
  };
}

export async function decryptPayload(
  payload: EncryptedPayloadV1,
  passphrase: string,
): Promise<string> {
  if (!passphrase) {
    throw new Error("Passphrase is required to decrypt cloud data.");
  }
  const salt = fromBase64(payload.salt);
  const iv = fromBase64(payload.iv);
  const ciphertext = fromBase64(payload.ciphertext);
  const key = await deriveKey(passphrase, salt);
  const plaintext = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    ciphertext,
  );

  return new TextDecoder().decode(plaintext);
}

export async function encryptEnvelope(
  envelope: CloudSyncEnvelopeV1,
  passphrase: string,
): Promise<CloudSyncEnvelopeV1> {
  const payload = await encryptPayload(JSON.stringify(envelope.resumes), passphrase);
  return {
    ...envelope,
    encrypted: true,
    payload,
    resumes: [],
  };
}

export async function decryptEnvelope(
  envelope: CloudSyncEnvelopeV1,
  passphrase: string,
): Promise<CloudSyncEnvelopeV1> {
  if (!envelope.encrypted) {
    return envelope;
  }
  if (!envelope.payload) {
    throw new Error("Encrypted cloud data is missing payload.");
  }

  const raw = await decryptPayload(envelope.payload, passphrase);
  const resumes = JSON.parse(raw) as unknown;
  if (!isValidResumeArray(resumes)) {
    throw new Error("Decrypted cloud data is invalid.");
  }
  const computedChecksum = await computeEnvelopeChecksum(resumes);
  if (computedChecksum !== envelope.checksum) {
    throw new Error("Encrypted cloud data failed integrity check.");
  }

  return {
    ...envelope,
    resumes,
  };
}
