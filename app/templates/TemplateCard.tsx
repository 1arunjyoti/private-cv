import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, Maximize2, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Template } from "@/lib/templates-data";
import { cn } from "@/lib/utils";

interface TemplateCardProps {
  template: Template;
  index: number;
  onPreview: (template: Template) => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}

export function TemplateCard({
  template,
  index,
  onPreview,
  isFavorite,
  onToggleFavorite,
}: TemplateCardProps) {
  return (
    <div
      className={`group relative rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden ${
        template.disabled ? "opacity-75 grayscale" : "hover:border-primary/50"
      }`}
    >
      <div
        className={`h-56 border-b relative overflow-hidden rounded-t-xl ${
          template.image ? "bg-muted/5" : template.gradient
        } group-hover:scale-105 transition-transform duration-500`}
      >
        <div className="absolute top-4 left-4 z-20">
          <Button
            variant="secondary"
            size="icon"
            className={cn(
              "h-8 w-8 rounded-full bg-white/80 dark:bg-black/80 backdrop-blur-sm shadow-sm hover:bg-white dark:hover:bg-black transition-colors",
              isFavorite && "text-red-500 hover:text-red-600",
            )}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleFavorite(template.id);
            }}
          >
            <Heart className={cn("h-4 w-4", isFavorite && "fill-current")} />
            <span className="sr-only">Favorite</span>
          </Button>
        </div>
        {template.image ? (
          <div className="relative h-full flex items-center justify-center">
            <div className="relative h-full w-full max-w-70 p-4">
              <Image
                src={template.image}
                alt={`${template.name} preview`}
                width={300}
                height={380}
                className="object-contain"
                quality={80}
                priority={index < 2}
                sizes="(max-width: 640px) 200px, (max-width: 1024px) 280px, 300px"
              />
              <div
                className="absolute inset-0 flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity bg-black/10 md:bg-black/10 cursor-pointer"
                onClick={() => onPreview(template)}
              >
                <Button
                  variant="secondary"
                  size="sm"
                  className="shadow-lg transform transition-transform md:translate-y-4 md:group-hover:translate-y-0"
                >
                  <Maximize2 className="h-4 w-4 mr-2" />
                  Preview
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative p-6 flex flex-col items-center justify-center gap-2 h-full">
            <div className="h-40 w-28 bg-white shadow-xl rounded border flex flex-col p-3 gap-2 group-hover:-translate-y-1 transition-transform">
              <div className="h-2.5 w-12 bg-gray-200 rounded" />
              <div className="space-y-1.5 pt-1">
                <div className="h-1.5 w-full bg-gray-100 rounded" />
                <div className="h-1.5 w-full bg-gray-100 rounded" />
                <div className="h-1.5 w-16 bg-gray-100 rounded" />
              </div>
              <div className="space-y-1.5 pt-2">
                <div className="flex gap-1">
                  <div className="h-12 w-1 bg-primary/10 rounded" />
                  <div className="flex-1 space-y-1">
                    <div className="h-1.5 w-full bg-gray-50 rounded" />
                    <div className="h-1.5 w-full bg-gray-50 rounded" />
                    <div className="h-1.5 w-3/4 bg-gray-50 rounded" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="absolute top-4 right-4 px-2.5 py-0.5 rounded-lg bg-white/50 dark:bg-black/30 backdrop-blur text-xs font-semibold text-foreground/80 shadow-xs text-right">
          {Array.isArray(template.category)
            ? template.category.map((cat, i) => (
                <span key={cat}>
                  {cat}
                  {i < template.category.length - 1 && <br />}
                </span>
              ))
            : template.category}
          {template.release && (
            <>
              <br />
              <span className="opacity-75 font-normal text-[10px] uppercase tracking-wide">
                {template.release}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col gap-4">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2">
            {template.name}
            {template.beta && (
              <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                Beta
              </Badge>
            )}
          </h3>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {template.description}
          </p>
        </div>

        <div className="flex-1">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Best For
          </div>
          <ul className="grid grid-cols-2 gap-2">
            {template.features.slice(0, 4).map((feature) => (
              <li
                key={feature}
                className="flex items-center gap-1.5 text-xs text-muted-foreground/80"
              >
                <CheckCircle2 className="h-3 w-3 text-primary shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {/* Color Variants Indicator */}
        {template.colors && template.colors.length > 0 && (
          <div className="flex gap-1 mb-2">
            {template.colors.slice(0, 5).map((color, i) => (
              <div
                key={i}
                className="w-3 h-3 rounded-full border border-white/20 shadow-sm ring-1 ring-black/5"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        )}

        <div className="pt-4 border-t mt-2">
          {template.disabled ? (
            <Button disabled className="w-full h-10">
              Coming Soon
            </Button>
          ) : (
            <Link href={`/editor?template=${template.id}`}>
              <Button className="w-full h-10 shadow-sm group-hover:shadow group-hover:bg-primary/90 cursor-pointer">
                Use This Template
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
