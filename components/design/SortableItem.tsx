import { Button } from "@/components/ui/button";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  GripVertical,
} from "lucide-react";
import React from "react";

interface SortableItemProps {
  id: string;
  label: string;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
  onMoveLeft?: () => void;
  onMoveRight?: () => void;
  canMoveLeft?: boolean;
  canMoveRight?: boolean;
}

export function SortableItem({
  id,
  label,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
  onMoveLeft,
  onMoveRight,
  canMoveLeft,
  canMoveRight,
}: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between p-2 rounded-lg bg-card border shadow-sm hover:border-primary/50 transition-colors group touch-none gap-2"
    >
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <div
          {...attributes}
          {...listeners}
          role="button"
          aria-label="Drag to reorder"
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded-md transition-colors shrink-0"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
        <span className="text-sm font-medium truncate" title={label}>
          {label}
        </span>
      </div>
      <div className="flex items-center gap-0.5 shrink-0">
        {canMoveLeft && onMoveLeft && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onMoveLeft();
            }}
            aria-label="Move section left"
          >
            <ArrowLeft className="h-3 w-3" />
          </Button>
        )}
        {canMoveRight && onMoveRight && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onMoveRight();
            }}
            aria-label="Move section right"
          >
            <ArrowRight className="h-3 w-3" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          disabled={isFirst}
          onClick={onMoveUp}
          aria-label="Move section up"
        >
          <ArrowUp className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          disabled={isLast}
          onClick={onMoveDown}
          aria-label="Move section down"
        >
          <ArrowDown className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
