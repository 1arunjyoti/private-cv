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
      className="flex items-center justify-between p-2.5 rounded-lg bg-card border shadow-sm hover:border-primary/50 transition-colors group touch-none"
    >
      <div className="flex items-center gap-3">
        <div
          {...attributes}
          {...listeners}
          role="button"
          aria-label="Drag to reorder"
          className="cursor-grab active:cursor-grabbing p-1.5 hover:bg-muted rounded-md transition-colors"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
        <span className="text-sm font-medium">{label}</span>
      </div>
      <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
        {canMoveLeft && onMoveLeft && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onMoveLeft();
            }}
            aria-label="Move section left"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
          </Button>
        )}
        {canMoveRight && onMoveRight && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onMoveRight();
            }}
            aria-label="Move section right"
          >
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          disabled={isFirst}
          onClick={onMoveUp}
          aria-label="Move section up"
        >
          <ArrowUp className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          disabled={isLast}
          onClick={onMoveDown}
          aria-label="Move section down"
        >
          <ArrowDown className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
