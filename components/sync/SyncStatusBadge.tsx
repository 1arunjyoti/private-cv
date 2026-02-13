"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSyncStore } from "@/store/useSyncStore";
import { Loader2, RefreshCw } from "lucide-react";

const STATUS_LABEL: Record<
  ReturnType<typeof useSyncStore.getState>["status"],
  string
> = {
  "not-connected": "Not connected",
  syncing: "Syncing",
  "up-to-date": "Up to date",
  conflict: "Conflict",
  error: "Error",
};

export function SyncStatusBadge() {
  const status = useSyncStore((state) => state.status);
  const syncNow = useSyncStore((state) => state.syncNow);
  const auth = useSyncStore((state) => state.auth);
  const remoteFileMeta = useSyncStore((state) => state.remoteFileMeta);

  const variant =
    status === "error"
      ? "destructive"
      : status === "up-to-date"
        ? "secondary"
        : "outline";

  return (
    <div className="flex items-center gap-2">
      <Badge variant={variant}>{STATUS_LABEL[status]}</Badge>
      <Button
        size="sm"
        variant="outline"
        onClick={() => syncNow()}
        disabled={status === "syncing" || !auth || !remoteFileMeta}
      >
        {status === "syncing" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <RefreshCw className="h-4 w-4" />
        )}
        Sync now
      </Button>
    </div>
  );
}
