"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useSyncStore } from "@/store/useSyncStore";
import { AlertTriangle } from "lucide-react";

export function ConflictDialog() {
  const status = useSyncStore((state) => state.status);
  const conflict = useSyncStore((state) => state.conflict);
  const resolveConflict = useSyncStore((state) => state.resolveConflict);

  const open = status === "conflict" && !!conflict;
  const localCount = conflict?.localEnvelope.resumes.length ?? 0;
  const cloudCount = conflict?.remoteEnvelope.resumes.length ?? 0;

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <div className="mb-2 flex items-center gap-2 text-amber-600">
            <AlertTriangle className="h-5 w-5" />
            <DialogTitle>Cloud sync conflict detected</DialogTitle>
          </div>
          <DialogDescription>
            Local and cloud data both changed. Choose how to resolve this
            conflict.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 rounded-md border bg-muted/30 p-3 text-sm">
          <p>Local resumes: {localCount}</p>
          <p>Cloud resumes: {cloudCount}</p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => resolveConflict("use-cloud")}>
            Use cloud
          </Button>
          <Button variant="outline" onClick={() => resolveConflict("keep-both")}>
            Keep both
          </Button>
          <Button onClick={() => resolveConflict("keep-local")}>
            Keep local
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
