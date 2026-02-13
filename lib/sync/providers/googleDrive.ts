import type {
  ProviderAccountProfile,
  DownloadSyncFileResult,
  ProviderAuthState,
  ProviderSignInOptions,
  RemoteSyncFileMeta,
  SyncProviderAdapter,
  UploadSyncFileInput,
} from "@/lib/sync/providers/types";

const GOOGLE_DRIVE_API = "https://www.googleapis.com/drive/v3/files";
const GOOGLE_UPLOAD_API = "https://www.googleapis.com/upload/drive/v3/files";
const GOOGLE_REVOKE_ENDPOINT = "https://oauth2.googleapis.com/revoke";
const GOOGLE_SCOPE = "https://www.googleapis.com/auth/drive.appdata";
const DEFAULT_SYNC_FILENAME = "privatecv-sync.json";
const GOOGLE_GIS_CLIENT_SCRIPT = "https://accounts.google.com/gsi/client";

interface GoogleTokenClientResponse {
  access_token?: string;
  expires_in?: number;
  error?: string;
  error_description?: string;
}

interface GoogleTokenClient {
  requestAccessToken: (opts?: { prompt?: string }) => void;
}

interface GoogleIdentityRuntime {
  accounts?: {
    oauth2?: {
      initTokenClient: (opts: {
        client_id: string;
        scope: string;
        callback: (response: GoogleTokenClientResponse) => void;
        error_callback: (response: { message?: string }) => void;
      }) => GoogleTokenClient;
    };
  };
}

const base64UrlEncode = (input: Uint8Array): string => {
  let str = "";
  for (const byte of input) str += String.fromCharCode(byte);
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
};

const randomString = (length = 64): string => {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return base64UrlEncode(bytes).slice(0, length);
};

const isTokenValid = (auth: ProviderAuthState | null): auth is ProviderAuthState =>
  !!auth && auth.expiresAt > Date.now() + 30_000;

const getClientId = (): string => {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_DRIVE_CLIENT_ID;
  if (!clientId) {
    throw new Error(
      "Missing NEXT_PUBLIC_GOOGLE_DRIVE_CLIENT_ID. Set it to enable Google Drive sync.",
    );
  }
  return clientId;
};

const loadGoogleIdentityScript = async (): Promise<void> => {
  if (typeof window === "undefined") {
    throw new Error("Google sign-in is only available in the browser.");
  }

  const maybeGoogle = (window as typeof window & { google?: unknown }).google;
  if (maybeGoogle) return;

  await new Promise<void>((resolve, reject) => {
    const existing = document.querySelector(
      `script[src="${GOOGLE_GIS_CLIENT_SCRIPT}"]`,
    ) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error("Failed to load Google Identity Services.")),
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.src = GOOGLE_GIS_CLIENT_SCRIPT;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("Failed to load Google Identity Services."));
    document.head.appendChild(script);
  });
};

const toMultipartBody = (metadata: Record<string, unknown>, content: string) => {
  const boundary = `privatecv-${randomString(20)}`;
  const body = [
    `--${boundary}`,
    "Content-Type: application/json; charset=UTF-8",
    "",
    JSON.stringify(metadata),
    `--${boundary}`,
    "Content-Type: application/json; charset=UTF-8",
    "",
    content,
    `--${boundary}--`,
    "",
  ].join("\r\n");
  return { body, boundary };
};

async function driveFetch(
  url: string,
  auth: ProviderAuthState,
  init?: RequestInit,
): Promise<Response> {
  const headers = new Headers(init?.headers);
  headers.set("Authorization", `Bearer ${auth.accessToken}`);
  const response = await fetch(url, {
    ...init,
    headers,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Google Drive API error (${response.status}): ${message}`);
  }
  return response;
}

export class GoogleDriveSyncProvider implements SyncProviderAdapter {
  private authState: ProviderAuthState | null = null;
  private readonly fileName: string;

  constructor(fileName = DEFAULT_SYNC_FILENAME) {
    this.fileName = fileName;
  }

  getAuthState(): ProviderAuthState | null {
    return this.authState;
  }

  async signIn(options?: ProviderSignInOptions): Promise<ProviderAuthState> {
    if (isTokenValid(this.authState)) {
      return this.authState;
    }
    const interactive = options?.interactive ?? true;

    const clientId = getClientId();
    await loadGoogleIdentityScript();

    const token = await new Promise<{
      access_token: string;
      expires_in?: number;
      error?: string;
      error_description?: string;
    }>((resolve, reject) => {
      const googleObj = (
        window as typeof window & { google?: GoogleIdentityRuntime }
      ).google;
      if (!googleObj?.accounts?.oauth2?.initTokenClient) {
        reject(new Error("Google Identity Services is unavailable."));
        return;
      }

      const tokenClient = googleObj.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: GOOGLE_SCOPE,
        callback: (response: GoogleTokenClientResponse) => {
          if (response.error) {
            reject(
              new Error(
                `Google auth error: ${response.error_description ?? response.error}`,
              ),
            );
            return;
          }
          if (!response.access_token) {
            reject(new Error("Google authentication returned no access token."));
            return;
          }
          resolve({
            access_token: response.access_token,
            expires_in: response.expires_in,
          });
        },
        error_callback: (response: { message?: string }) => {
          reject(new Error(response.message ?? "Google authentication failed."));
        },
      });

      tokenClient.requestAccessToken({
        prompt: interactive ? "consent" : "none",
      });
    });

    this.authState = {
      accessToken: token.access_token,
      expiresAt: Date.now() + (token.expires_in ?? 3600) * 1000,
    };

    return this.authState;
  }

  async signOut(auth: ProviderAuthState | null): Promise<void> {
    this.authState = null;
    if (!auth) return;

    try {
      await fetch(
        `${GOOGLE_REVOKE_ENDPOINT}?token=${encodeURIComponent(auth.accessToken)}`,
        { method: "POST" },
      );
    } catch {
      // Revocation failure should not block local sign out.
    }
  }

  async getAccountProfile(
    auth: ProviderAuthState,
  ): Promise<ProviderAccountProfile | null> {
    const response = await driveFetch(
      "https://www.googleapis.com/drive/v3/about?fields=user(displayName,emailAddress)",
      auth,
    );
    const json = (await response.json()) as {
      user?: { displayName?: string; emailAddress?: string };
    };
    if (!json.user) return null;
    return {
      displayName: json.user.displayName,
      email: json.user.emailAddress,
    };
  }

  async deleteSyncFile(
    auth: ProviderAuthState,
    fileMeta: RemoteSyncFileMeta,
  ): Promise<void> {
    await driveFetch(`${GOOGLE_DRIVE_API}/${fileMeta.remoteId}`, auth, {
      method: "DELETE",
    });
  }

  async ensureSyncFile(auth: ProviderAuthState): Promise<RemoteSyncFileMeta> {
    const escapedFileName = this.fileName
      .replace(/\\/g, "\\\\")
      .replace(/'/g, "\\'");
    const query = encodeURIComponent(
      `name='${escapedFileName}' and 'appDataFolder' in parents and trashed=false`,
    );
    const findUrl = `${GOOGLE_DRIVE_API}?spaces=appDataFolder&q=${query}&fields=files(id,modifiedTime)`;
    const listResponse = await driveFetch(findUrl, auth);
    const listJson = (await listResponse.json()) as {
      files?: Array<{ id: string; modifiedTime?: string }>;
    };

    if (listJson.files?.length) {
      return {
        remoteId: listJson.files[0].id,
        modifiedTime: listJson.files[0].modifiedTime,
      };
    }

    const { body, boundary } = toMultipartBody(
      { name: this.fileName, parents: ["appDataFolder"] },
      "{}",
    );

    const createResponse = await driveFetch(
      `${GOOGLE_UPLOAD_API}?uploadType=multipart&fields=id,modifiedTime`,
      auth,
      {
        method: "POST",
        headers: { "Content-Type": `multipart/related; boundary=${boundary}` },
        body,
      },
    );

    const created = (await createResponse.json()) as {
      id: string;
      modifiedTime?: string;
    };

    return {
      remoteId: created.id,
      modifiedTime: created.modifiedTime,
    };
  }

  async downloadSyncFile(
    auth: ProviderAuthState,
    fileMeta: RemoteSyncFileMeta,
  ): Promise<DownloadSyncFileResult> {
    const metadataResponse = await driveFetch(
      `${GOOGLE_DRIVE_API}/${fileMeta.remoteId}?fields=id,modifiedTime`,
      auth,
    );
    const metadata = (await metadataResponse.json()) as {
      id: string;
      modifiedTime?: string;
    };

    const etag = metadataResponse.headers.get("etag") ?? undefined;
    const contentResponse = await driveFetch(
      `${GOOGLE_DRIVE_API}/${fileMeta.remoteId}?alt=media`,
      auth,
    );

    return {
      fileMeta: {
        remoteId: metadata.id,
        etag: contentResponse.headers.get("etag") ?? etag,
        modifiedTime: metadata.modifiedTime,
      },
      raw: await contentResponse.text(),
    };
  }

  async uploadSyncFile(
    auth: ProviderAuthState,
    input: UploadSyncFileInput,
  ): Promise<RemoteSyncFileMeta> {
    const { body, boundary } = toMultipartBody({}, input.content);
    const headers: HeadersInit = {
      "Content-Type": `multipart/related; boundary=${boundary}`,
    };
    if (input.fileMeta.etag) {
      headers["If-Match"] = input.fileMeta.etag;
    }

    const response = await driveFetch(
      `${GOOGLE_UPLOAD_API}/${input.fileMeta.remoteId}?uploadType=multipart&fields=id,modifiedTime`,
      auth,
      { method: "PATCH", headers, body },
    );

    const json = (await response.json()) as { id: string; modifiedTime?: string };
    return {
      remoteId: json.id,
      etag: response.headers.get("etag") ?? undefined,
      modifiedTime: json.modifiedTime,
    };
  }
}
