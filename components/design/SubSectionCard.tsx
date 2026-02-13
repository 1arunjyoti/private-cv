import React from "react";
import { cn } from "@/lib/utils";

interface SubSectionCardProps {
  children: React.ReactNode;
  className?: string;
}

export function SubSectionCard({ children, className }: SubSectionCardProps) {
  return (
    <div
      className={cn(
        "bg-muted/30 p-3 rounded-lg border border-border/50 shadow-sm space-y-3 transition-colors hover:bg-muted/40",
        className,
      )}
    >
      {children}
    </div>
  );
}
