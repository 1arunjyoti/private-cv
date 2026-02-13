"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { ReactNode, useState } from "react";

interface ResetConfirmDialogProps {
  onConfirm: () => void;
  trigger?: ReactNode;
}

export function ResetConfirmDialog({
  onConfirm,
  trigger,
}: ResetConfirmDialogProps) {
  const [open, setOpen] = useState(false);

  const handleConfirm = () => {
    onConfirm();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant="outline"
            size="sm"
            className="text-destructive border-primary/20 hover:text-destructive/90 hover:bg-destructive/10"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-106.25 rounded-lg">
        <DialogHeader>
          <div className="flex items-center gap-2 text-destructive mb-2">
            <AlertTriangle className="h-5 w-5" />
            <DialogTitle>Reset All Data?</DialogTitle>
          </div>
          <DialogDescription>
            This action will permanently delete all your current resume data.
            This cannot be undone. Are you sure you want to proceed?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button variant="destructive" onClick={handleConfirm}>
            Reset Data
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
