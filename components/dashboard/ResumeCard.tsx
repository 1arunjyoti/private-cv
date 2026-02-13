"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  MoreVertical,
  Pencil,
  Trash2,
  Copy,
  FileText,
  Calendar,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import type { Resume } from "@/db";

import Image from "next/image";
import { templates } from "@/lib/templates-data";

import { useState } from "react";
import { DeleteResumeDialog } from "./DeleteResumeDialog";

interface ResumeCardProps {
  resume: Resume;
  onDelete: (id: string) => void;
  onDuplicate: (resume: Resume) => void;
}

export function ResumeCard({ resume, onDelete, onDuplicate }: ResumeCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const lastModified = new Date(resume.meta.lastModified);
  const template = templates.find((t) => t.id === resume.meta.templateId);
  const templateImage = template?.image || "/images/ats_scanner_template.jpg";

  return (
    <>
      <Card className="group relative overflow-hidden transition-all hover:shadow-md">
        <Link href={`/editor?id=${resume.id}`} className="absolute inset-0 z-0">
          <span className="sr-only">Edit {resume.meta.title}</span>
        </Link>

        <CardHeader className="relative z-10 flex flex-row items-start justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle className="line-clamp-1">{resume.meta.title}</CardTitle>
            <div className="flex items-center text-xs text-muted-foreground">
              <Calendar className="mr-1 h-3 w-3" />
              <span>
                Edited {formatDistanceToNow(lastModified, { addSuffix: true })}
              </span>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0 opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
              >
                <span className="sr-only">Open menu</span>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px] z-20">
              <DropdownMenuItem asChild>
                <Link
                  href={`/editor?id=${resume.id}`}
                  className="cursor-pointer"
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicate(resume);
                }}
                className="cursor-pointer"
              >
                <Copy className="mr-2 h-4 w-4" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteDialog(true);
                }}
                className="text-red-600 focus:text-red-600 cursor-pointer"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>

        <CardContent className="relative z-0 pb-2">
          <div className="aspect-210/297 w-full overflow-hidden rounded-md border bg-muted/40 relative">
            <Image
              src={templateImage}
              alt={resume.meta.title}
              fill
              className="object-cover object-top opacity-80 transition-all duration-300 group-hover:opacity-100 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-linear-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        </CardContent>

        <CardFooter className="relative z-10 pt-2">
          <div className="flex w-full items-center justify-between">
            <Badge
              variant="outline"
              className="text-xs font-normal bg-background/50 backdrop-blur-xs"
            >
              {template?.name || resume.meta.templateId || "Standard"}
            </Badge>
            <Button variant="ghost" size="sm" className="h-7 text-xs" asChild>
              <Link href={`/editor?id=${resume.id}`}>
                Open <FileText className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </div>
        </CardFooter>
      </Card>

      <DeleteResumeDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={() => onDelete(resume.id)}
        resumeTitle={resume.meta.title}
      />
    </>
  );
}
