"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Info,
  Save,
  Download,
  Cloud,
  FileText,
  Palette,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface DisclaimerDialogProps {
  trigger?: React.ReactNode;
}

export function DisclaimerDialog({ trigger }: DisclaimerDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant="outline"
            size="sm"
            className="hover:bg-primary/10"
          >
            <Info className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md w-[95vw] sm:w-full rounded-xl sm:rounded-lg max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="p-6 pb-2">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2.5 rounded-full shrink-0">
              <Info className="h-5 w-5 text-primary" />
            </div>
            <div className="text-left">
              <DialogTitle className="text-xl leading-none">Resume Guide</DialogTitle>
              <DialogDescription className="text-xs sm:text-sm mt-1">
                Everything you need to know about your data.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-6 mt-2 scrollbar-thin">
          <section className="space-y-4">
            <h3 className="font-bold text-[11px] uppercase tracking-widest text-muted-foreground/70 flex items-center gap-2">
              <Save className="h-3.5 w-3.5" />
              Data Persistence
            </h3>
            <div className="grid gap-3">
              <div className="flex items-start gap-3 p-3.5 rounded-xl border bg-orange-500/3 border-orange-200/50">
                <div className="mt-1 bg-orange-500/10 p-1.5 rounded-lg shrink-0">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                </div>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-sm">Local Storage</p>
                    <Badge variant="outline" className="text-[9px] px-1.5 h-4 bg-orange-500/10 text-orange-700 border-none font-bold uppercase">Basic</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed italic">Cleared when browser cache is deleted.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl border bg-primary/3 border-primary/20">
                <div className="mt-1 bg-primary/10 p-1.5 rounded-lg shrink-0">
                  <Download className="h-4 w-4 text-primary" />
                </div>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-sm">JSON Export</p>
                    <Badge variant="secondary" className="text-[9px] px-1.5 h-4 bg-green-500/20 text-green-700 border-none font-bold uppercase">Recommended</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">Download a file to keep your work safe and portable.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl border bg-blue-500/3 border-blue-200/50">
                <div className="mt-1 bg-blue-500/10 p-1.5 rounded-lg shrink-0">
                  <Cloud className="h-4 w-4 text-blue-600" />
                </div>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-sm">Google Drive Sync</p>
                    <Badge className="text-[9px] px-1.5 h-4 bg-blue-500 text-white border-none font-bold uppercase">Cloud Sync</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">Sync across devices for easy access anywhere.</p>
                </div>
              </div>
            </div>
          </section>

          <Separator className="opacity-50" />

          <section className="space-y-4">
            <h3 className="font-bold text-[11px] uppercase tracking-widest text-muted-foreground/70 flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Quick Start
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-3 p-3 rounded-xl border bg-card/50">
                <div className="bg-primary/10 p-2 rounded-lg shrink-0">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate">Content Editor</p>
                  <p className="text-[10px] text-muted-foreground truncate">Fill in your details</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl border bg-card/50">
                <div className="bg-primary/10 p-2 rounded-lg shrink-0">
                  <Palette className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate">Design Settings</p>
                  <p className="text-[10px] text-muted-foreground truncate">Style your layout</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
