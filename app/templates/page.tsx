import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { TemplatesGallery } from "./TemplatesGallery";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resume Templates",
  description:
    "Choose from our collection of professional, creative, and ATS-friendly resume templates. All templates are free and privacy-focused.",
  alternates: {
    canonical: "/templates",
  },
};

export default function TemplatesPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 landing-container mx-auto px-4 pt-28 pb-8 md:pt-32 md:pb-12">
        <TemplatesGallery />
      </main>

      <Footer />
    </div>
  );
}
