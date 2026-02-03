"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";

export default function EditorError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Editor error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-lg space-y-6 text-center">
        <div className="flex justify-center">
          <div className="rounded-full bg-yellow-500/10 p-3">
            <AlertTriangle className="h-10 w-10 text-yellow-500" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Editor Error
          </h1>
          <p className="text-muted-foreground">
            The resume editor encountered an error. Your data is stored locally
            and should be safe.
          </p>
        </div>

        {error.message && (
          <div className="rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-4 text-left">
            <p className="text-sm font-medium text-yellow-700 dark:text-yellow-400 mb-1">
              Technical Details:
            </p>
            <p className="text-sm text-yellow-600 dark:text-yellow-500 font-mono">
              {error.message}
            </p>
          </div>
        )}

        <div className="space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button onClick={() => reset()} variant="default" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Retry Editor
            </Button>
            <Button
              onClick={() => (window.location.href = "/")}
              variant="outline"
              className="gap-2"
            >
              <Home className="h-4 w-4" />
              Go Home
            </Button>
          </div>

          <div className="rounded-lg border bg-muted/50 p-4 text-left">
            <p className="text-sm font-medium mb-2">💡 Tips to resolve:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Try refreshing the page</li>
              <li>• Check your browser console for details</li>
              <li>• Your resume data is saved in your browser&apos;s local storage</li>
              <li>• Try exporting your resume as PDF before troubleshooting</li>
            </ul>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Error ID: {error.digest || "unknown"}
        </p>
      </div>
    </div>
  );
}
