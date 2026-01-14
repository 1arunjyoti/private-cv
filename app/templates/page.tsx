"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  CheckCircle2,
  Layout,
  SlidersHorizontal,
} from "lucide-react";

type Category =
  | "All"
  | "ATS-Friendly"
  | "Creative"
  | "Modern"
  | "Professional"
  | "Elegant";

export default function TemplatesPage() {
  const [selectedCategory, setSelectedCategory] = useState<Category>("All");

  const categories: Category[] = [
    "All",
    "ATS-Friendly",
    "Creative",
    "Modern",
    "Professional",
    "Elegant",
  ];

  const templates = [
    {
      id: "ats",
      name: "ATS Scanner",
      description:
        "A clean, single-column layout optimized for Applicant Tracking Systems. Essential for online applications.",
      category: "ATS-Friendly",
      gradient: "bg-linear-to-br from-gray-50 to-gray-100",
      features: [
        "Single Column Layout",
        "Machine Readable",
        "Standard Fonts",
        "Keyword Optimized",
      ],
    },
    {
      id: "creative",
      name: "Creative Sidebar",
      description:
        "A modern two-column design with a colored sidebar. Perfect for showing off skills and personality.",
      category: "Creative",
      gradient: "bg-linear-to-br from-blue-50 to-indigo-50",
      features: [
        "Two Column Layout",
        "Skill Bars",
        "Colored Sidebar",
        "Space Efficient",
      ],
    },
    // Placeholder for a future 'Modern' template to demonstrate filtering
    {
      id: "modern",
      name: "Modern Minimalist",
      description:
        "A sleek, typography-focused design. (Coming Soon - using ATS template for now)",
      category: "Modern",
      gradient: "bg-linear-to-br from-emerald-50 to-teal-50",
      features: [
        "Clean Typography",
        "Minimalist Header",
        "Whitespace",
        "Elegant",
      ],
      disabled: false,
    },
    {
      id: "professional",
      name: "Executive Serif",
      description:
        "A traditional, authoritative design using serif fonts. Ideal for legal, academic, and executive roles.",
      category: "Professional",
      gradient: "bg-linear-to-br from-slate-50 to-gray-100",
      features: [
        "Traditional Layout",
        "Serif Typography",
        "Print Optimized",
        "Executive Look",
      ],
    },
    {
      id: "elegant",
      name: "Elegant Banner",
      description:
        "A sophisticated design with a full-width header. Stands out while maintaining readability.",
      category: "Elegant",
      gradient: "bg-linear-to-br from-slate-800 to-slate-900",
      features: [
        "Header Banner",
        "Visual Impact",
        "Clean Structure",
        "Modern Feel",
      ],
    },
  ];

  const filteredTemplates =
    selectedCategory === "All"
      ? templates
      : templates.filter((t) => t.category === selectedCategory);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </Link>
          <div className="font-semibold text-lg flex items-center gap-2">
            <Layout className="h-5 w-5" />
            Template Catalog
          </div>
          <div className="w-[100px]" /> {/* Spacer for centering */}
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header & Filter Section */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b">
            <div className="space-y-1 text-center md:text-left">
              <h1 className="text-3xl font-bold tracking-tight">
                Resume Templates
              </h1>
              <p className="text-muted-foreground">
                Select a design that fits your industry and personality.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 mr-2 text-sm font-medium text-muted-foreground">
                <SlidersHorizontal className="h-4 w-4" />
                Filter:
              </div>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
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
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className={`group relative rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden ${
                  template.disabled
                    ? "opacity-75 grayscale"
                    : "hover:border-primary/50"
                }`}
              >
                {/* Visual Preview Stub */}
                <div
                  className={`h-56 ${template.gradient} border-b relative p-6 flex flex-col items-center justify-center gap-2 group-hover:scale-105 transition-transform duration-500`}
                >
                  {/* Badge */}
                  <div className="absolute top-4 right-4 px-2.5 py-0.5 rounded-full bg-white/50 backdrop-blur text-xs font-semibold text-foreground/80 shadow-xs">
                    {template.category}
                  </div>

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

                <div className="p-5 flex-1 flex flex-col gap-4">
                  <div>
                    <h3 className="text-xl font-bold">{template.name}</h3>
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

                  <div className="pt-4 border-t mt-2">
                    {template.disabled ? (
                      <Button disabled className="w-full h-10">
                        Coming Soon
                      </Button>
                    ) : (
                      <Link href={`/editor?template=${template.id}`}>
                        <Button className="w-full h-10 shadow-sm group-hover:shadow group-hover:bg-primary/90">
                          Use This Template
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-20 text-muted-foreground">
              <p className="text-lg">No templates found in this category.</p>
              <Button variant="link" onClick={() => setSelectedCategory("All")}>
                View all templates
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
