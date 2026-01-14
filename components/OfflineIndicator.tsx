"use client";

import { useSyncExternalStore } from "react";
import { WifiOff } from "lucide-react";

// Subscribe to online/offline changes
function subscribe(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

function getSnapshot() {
  return navigator.onLine;
}

function getServerSnapshot() {
  return true; // Assume online on server
}

export function OfflineIndicator() {
  const isOnline = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  // Only show when offline
  if (isOnline) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-100 py-2 px-4 text-center text-sm font-medium bg-yellow-500 text-yellow-950 animate-in slide-in-from-top duration-300">
      <div className="flex items-center justify-center gap-2">
        <WifiOff className="h-4 w-4" />
        <span>You&apos;re offline. Changes are saved locally.</span>
      </div>
    </div>
  );
}
