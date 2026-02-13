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

interface DeleteAllResumesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function DeleteAllResumesDialog({
  open,
  onOpenChange,
  onConfirm,
}: DeleteAllResumesDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90%] rounded-lg sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete all resumes?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete{" "}
            <span className="font-bold text-destructive">ALL</span> your saved
            resumes from this device.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col gap-4 sm:flex-row sm:space-x-2">
          <Button
            variant="outline"
            className="mt-0 w-full sm:w-auto"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
              onOpenChange(false);
            }}
            className="w-full sm:w-auto"
          >
            Delete All Resumes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
