import { GoogleDriveSyncProvider } from "@/lib/sync/providers/googleDrive";
import type { SyncProviderAdapter, SyncProviderId } from "@/lib/sync/providers/types";

let googleDriveProvider: GoogleDriveSyncProvider | null = null;

export function getSyncProvider(providerId: SyncProviderId): SyncProviderAdapter {
  if (providerId === "google-drive") {
    if (!googleDriveProvider) {
      googleDriveProvider = new GoogleDriveSyncProvider();
    }
    return googleDriveProvider;
  }

  throw new Error(`${providerId} is not supported yet.`);
}
