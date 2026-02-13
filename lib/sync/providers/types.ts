export type SyncProviderId = "google-drive" | "dropbox" | "onedrive";

export interface ProviderAuthState {
  accessToken: string;
  expiresAt: number;
  refreshToken?: string;
}

export interface ProviderAccountProfile {
  email?: string;
  displayName?: string;
}

export interface RemoteSyncFileMeta {
  remoteId: string;
  etag?: string;
  modifiedTime?: string;
}

export interface DownloadSyncFileResult {
  fileMeta: RemoteSyncFileMeta;
  raw: string | null;
}

export interface UploadSyncFileInput {
  fileMeta: RemoteSyncFileMeta;
  content: string;
}

export interface ProviderSignInOptions {
  interactive?: boolean;
}

export interface SyncProviderAdapter {
  signIn: (options?: ProviderSignInOptions) => Promise<ProviderAuthState>;
  signOut: (auth: ProviderAuthState | null) => Promise<void>;
  getAuthState: () => ProviderAuthState | null;
  getAccountProfile: (
    auth: ProviderAuthState,
  ) => Promise<ProviderAccountProfile | null>;
  deleteSyncFile: (
    auth: ProviderAuthState,
    fileMeta: RemoteSyncFileMeta,
  ) => Promise<void>;
  ensureSyncFile: (auth: ProviderAuthState) => Promise<RemoteSyncFileMeta>;
  downloadSyncFile: (
    auth: ProviderAuthState,
    fileMeta: RemoteSyncFileMeta,
  ) => Promise<DownloadSyncFileResult>;
  uploadSyncFile: (
    auth: ProviderAuthState,
    input: UploadSyncFileInput,
  ) => Promise<RemoteSyncFileMeta>;
}
