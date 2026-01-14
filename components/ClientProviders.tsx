"use client";

import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { OfflineIndicator } from "@/components/OfflineIndicator";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <>
      <OfflineIndicator />
      {children}
      <PWAInstallPrompt />
    </>
  );
}
