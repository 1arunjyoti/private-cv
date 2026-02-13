"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import {
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Search,
  ArrowUpDown,
  Filter,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { TemplateCard } from "./TemplateCard";
import { CATEGORIES, templates } from "@/lib/templates-data";
import type { Category, Template } from "@/lib/templates-data";

const ITEMS_PER_PAGE = 20;

type SortOption = "recommended" | "newest" | "popular" | "alphabetical";

export function TemplatesGallery() {
  const [selectedCategory, setSelectedCategory] = useState<Category>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("recommended");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [previewTemplate, setPreviewTemplate] = useState<{
    image: string;
    name: string;
    description: string;
  } | null>(null);

  // Load favorites from local storage
  useEffect(() => {
    const stored = localStorage.getItem("favoriteTemplates");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setFavorites(new Set(parsed.filter((item) => typeof item === "string")));
        }
      } catch {
        localStorage.removeItem("favoriteTemplates");
      }
    }
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(id)) {
      newFavorites.delete(id);
    } else {
      newFavorites.add(id);
    }
    setFavorites(newFavorites);
    localStorage.setItem(
      "favoriteTemplates",
      JSON.stringify(Array.from(newFavorites)),
    );
  }, [favorites]);

  const toggleTag = useCallback((tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
    setCurrentPage(1);
  }, []);

  const categories = CATEGORIES;

  // Extract all unique tags
  const allTags = useMemo(
    () => Array.from(new Set(templates.flatMap((t) => t.tags || []))).sort(),
    [],
  );

  const filteredTemplates = useMemo(
    () =>
      templates
        .filter((t: Template) => {
          // Category Filter
          if (selectedCategory !== "All") {
            if (Array.isArray(t.category)) {
              if (!t.category.includes(selectedCategory)) return false;
            } else {
              if (t.category !== selectedCategory) return false;
            }
          }

          // Search Filter
          if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const matchesName = t.name.toLowerCase().includes(query);
            const matchesDesc = t.description.toLowerCase().includes(query);
            const matchesTags = t.tags?.some((tag) =>
              tag.toLowerCase().includes(query),
            );
            if (!matchesName && !matchesDesc && !matchesTags) return false;
          }

          // Tag Filter (AND logic)
          if (selectedTags.length > 0) {
            const hasAllTags = selectedTags.every((tag) => t.tags?.includes(tag));
            if (!hasAllTags) return false;
          }

          return true;
        })
        .sort((a, b) => {
          switch (sortOption) {
            case "newest":
              return (
                new Date(b.date || "").getTime() - new Date(a.date || "").getTime()
              );
            case "popular":
              return (b.popularity || 0) - (a.popularity || 0);
            case "alphabetical":
              return a.name.localeCompare(b.name);
            case "recommended":
            default:
              return 0; // Keep default order
          }
        }),
    [searchQuery, selectedCategory, selectedTags, sortOption],
  );

  // Calculate pagination
  const totalPages = useMemo(
    () => Math.ceil(filteredTemplates.length / ITEMS_PER_PAGE),
    [filteredTemplates.length],
  );
  const paginatedTemplates = useMemo(
    () =>
      filteredTemplates.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE,
      ),
    [currentPage, filteredTemplates],
  );

  // Reset page relative to category changes
  const handleCategoryChange = useCallback((category: Category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="landing-container mx-auto space-y-8">
      {/* Header & Controls */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">
              Resume Templates
            </h1>
            <p className="text-muted-foreground">
              Select a design that fits your industry and personality.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search templates..."
                className="pl-9 w-full"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <Select
              value={sortOption}
              onValueChange={(value: SortOption) => setSortOption(value)}
            >
              <SelectTrigger className="w-full md:w-40">
                <ArrowUpDown className="mr-2 h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recommended">Recommended</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="alphabetical">Alphabetical</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant={isFiltersOpen ? "secondary" : "outline"}
              size="icon"
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
              className="shrink-0"
              title="Filter by attributes"
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Categories & Filter Panel */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 mr-2 text-sm font-medium text-muted-foreground">
              <SlidersHorizontal className="h-4 w-4" />
              Category:
            </div>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === cat
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {isFiltersOpen && (
            <div className="p-4 rounded-lg bg-muted/30 border animate-in slide-in-from-top-2">
              <div className="flex flex-wrap gap-2">
                <div className="text-sm font-medium text-muted-foreground w-full mb-2">
                  Filter by features:
                </div>
                {allTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary/90 transition-colors"
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                    {selectedTags.includes(tag) && (
                      <X className="ml-1 h-3 w-3" />
                    )}
                  </Badge>
                ))}
                {selectedTags.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedTags([]);
                      setCurrentPage(1);
                    }}
                    className="h-6 px-2 text-xs"
                  >
                    Clear filters
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedTemplates.map((template, index) => (
          <TemplateCard
            key={template.id}
            template={template}
            index={index}
            isFavorite={favorites.has(template.id)}
            onToggleFavorite={toggleFavorite}
            onPreview={(t) =>
              setPreviewTemplate({
                image: t.image!,
                name: t.name,
                description: t.description,
              })
            }
          />
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-lg">No templates found matching your criteria.</p>
          <Button
            variant="link"
            onClick={() => {
              setSelectedCategory("All");
              setSearchQuery("");
              setSelectedTags([]);
            }}
          >
            Clear all filters
          </Button>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 py-8 mt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          <div className="text-sm font-medium text-muted-foreground">
            Page {currentPage} of {totalPages}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex items-center gap-2"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      <Dialog
        open={!!previewTemplate}
        onOpenChange={(open) => !open && setPreviewTemplate(null)}
      >
        <DialogContent className="max-w-4xl w-[90vw] h-[90vh] p-0 overflow-hidden bg-muted/50 border-none">
          <DialogTitle className="sr-only">
            {previewTemplate?.name} Preview
          </DialogTitle>
          <div className="relative w-full h-full flex flex-col">
            <div className="absolute top-4 right-4 z-50">
              <Button
                variant="ghost"
                size="icon"
                className="bg-background/80 backdrop-blur hover:bg-background rounded-full shadow-sm"
                onClick={() => setPreviewTemplate(null)}
              >
                <span className="sr-only">Close</span>
                <span aria-hidden="true" className="text-xl">
                  ×
                </span>
              </Button>
            </div>
            <div className="flex-1 overflow-auto p-4 md:p-8 flex items-center justify-center">
              {previewTemplate && (
                <div className="relative shadow-2xl rounded-lg overflow-hidden ring-1 ring-border/20">
                  <Image
                    src={previewTemplate.image}
                    alt={previewTemplate.name}
                    width={800}
                    height={1132}
                    className="w-auto h-auto max-h-[85vh] max-w-full object-contain"
                    quality={100}
                  />
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
