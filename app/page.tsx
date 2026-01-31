import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import {
  FileText,
  EyeOff,
  WifiOff,
  Layout,
  Download,
  CheckCircle2,
  ArrowRight,
  Zap,
  Menu,
} from "lucide-react";

export default function Home() {
  const navLinks = [
    { href: "#features", label: "Features" },
    { href: "/templates", label: "Templates" },
    { href: "/how-to-use", label: "How to Use" },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "PrivateCV",
    url: "https://privatecv.vercel.app",
    image: "https://privatecv.vercel.app/opengraph-image",
    operatingSystem: "Web Browser",
    applicationCategory: "BusinessApplication",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "A privacy-first, offline-capable resume builder that runs entirely in your browser. No data leaves your device.",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "120",
    },
    featureList:
      "Offline mode, ATS-friendly templates, PDF export, Privacy focused, No sign-up required",
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-backdrop-filter:bg-background/60">
        <div className="landing-container mx-auto flex h-16 items-center px-4 md:px-6">
          {/* Logo - Left */}
          <div className="flex flex-1 items-center justify-start">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                <FileText className="h-5 w-5" />
              </div>
              <span className="font-bold text-xl tracking-tight">
                PrivateCV
              </span>
            </div>
          </div>

          {/* Desktop Nav - Center */}
          <nav className="hidden md:flex flex-1 items-center justify-center gap-8 text-sm font-medium">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-muted-foreground transition-all hover:text-primary hover:scale-105"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions - Right */}
          <div className="flex flex-1 items-center justify-end gap-4">
            <ThemeToggle />
            <Link href="/templates" className="hidden md:block">
              <Button
                size="sm"
                className="font-semibold shadow-sm hover:shadow transition-all cursor-pointer"
              >
                Get Started
              </Button>
            </Link>

            {/* Mobile Menu */}
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="w-[300px] sm:w-[350px] px-0 border-l flex flex-col bg-background/95 backdrop-blur-md"
                >
                  <div className="flex flex-col h-full">
                    {/* Drawer Header */}
                    <SheetHeader className="px-6 py-6 border-b text-left space-y-0">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col">
                          <SheetTitle className="font-bold text-xl tracking-tight leading-none text-foreground">
                            PrivateCV
                          </SheetTitle>
                          <SheetDescription className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1 font-semibold">
                            Privacy-First
                          </SheetDescription>
                        </div>
                      </div>
                    </SheetHeader>

                    {/* Navigation Links */}
                    <div className="flex-1 overflow-y-auto py-6 px-4">
                      <nav className="flex flex-col gap-2">
                        {navLinks.map((link) => {
                          const Icon =
                            link.label === "Features"
                              ? Layout
                              : link.label === "Templates"
                                ? FileText
                                : Zap;
                          return (
                            <Link
                              key={link.href}
                              href={link.href}
                              className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground group"
                            >
                              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                <Icon className="h-4 w-4" />
                              </div>
                              {link.label}
                            </Link>
                          );
                        })}
                      </nav>

                      <div className="mt-8 px-4">
                        <Link href="/templates" className="w-full">
                          <Button
                            className="w-full font-bold h-12 text-base shadow-lg hover:shadow-xl transition-all"
                            size="lg"
                          >
                            Get Started Free
                          </Button>
                        </Link>
                      </div>
                    </div>

                    {/* Drawer Footer */}
                    <div className="mt-auto p-6 border-t bg-muted/30">
                      <p className="text-xs text-muted-foreground mb-4">
                        Build your professional resume without any tracking.
                        Your data stays on your device.
                      </p>
                      <div className="flex items-center justify-between">
                        <Link
                          href="https://github.com/1arunjyoti/resume-builder"
                          target="_blank"
                          className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                        >
                          GitHub Repository
                        </Link>
                        <span className="text-[10px] text-muted-foreground/60">
                          v1.0.0
                        </span>
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 md:py-24 lg:py-28 bg-linear-to-b from-background to-muted/50">
          <div className="landing-container mx-auto px-4 md:px-6 relative z-10">
            <div className="flex flex-col items-center space-y-8 text-center">
              <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium transition-colors focus:outline-none border-transparent bg-primary/10 text-primary hover:bg-primary/20">
                <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
                v1.0 Now Available
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl max-w-5xl leading-[1.1]">
                Build Your Professional Resume{" "}
                <span className="bg-clip-text text-transparent bg-linear-to-r from-primary to-blue-600 block sm:inline">
                  Without sharing your data
                </span>
              </h1>
              <p className="mx-auto max-w-2xl text-muted-foreground text-lg md:text-xl leading-relaxed">
                A privacy-first resume builder that runs entirely in your
                browser. No servers, no data storing, no tracking, just you and
                your data. Offline capable.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto pt-4">
                <Link href="/templates" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto h-12 px-8 text-base shadow-lg hover:shadow-xl transition-all cursor-pointer"
                  >
                    Start Building Now <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/how-to-use" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto h-12 px-8 text-base bg-background/50 backdrop-blur-sm cursor-pointer"
                  >
                    Learn More
                  </Button>
                </Link>
              </div>
              <div className="pt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm font-medium text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>Free Forever</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>No Sign-up</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>ATS Friendly</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-24 bg-background">
          <div className="landing-container mx-auto px-4 md:px-6">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                Everything You Need
              </h2>
              <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
                Powerful features designed to help you land your dream job, all
                while respecting your privacy.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 ">
              <FeatureCard
                icon={<EyeOff className="h-8 w-8 text-primary" />}
                title="Anonymous Analytics"
                description="We use anonymous page view tracking to improve the app. Your resume content and personal data remain 100% private and offline."
              />
              <FeatureCard
                icon={<WifiOff className="h-8 w-8 text-primary" />}
                title="Works Offline"
                description="Full PWA support means you can build and edit your resume even without an internet connection."
              />
              <FeatureCard
                icon={<Layout className="h-8 w-8 text-primary" />}
                title="ATS-Proof Templates"
                description="Clean, professional templates designed to pass Applicant Tracking Systems with ease."
              />
              <FeatureCard
                icon={<Zap className="h-8 w-8 text-primary" />}
                title="Instant Preview"
                description="See changes in real-time as you type. No loading spinners or server delays."
              />
              <FeatureCard
                icon={<CheckCircle2 className="h-8 w-8 text-primary" />}
                title="Job Matcher"
                description="Paste a job description to see how well your resume keywords match the requirements."
              />
              <FeatureCard
                icon={<Download className="h-8 w-8 text-primary" />}
                title="Easy Export"
                description="Download as PDF or export your raw JSON data for backup and portability."
              />
            </div>
          </div>
        </section>

        {/* Templates Teaser */}
        <section id="templates" className="py-24 bg-muted/30">
          <div className="landing-container mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <div className="space-y-8">
                <div className="space-y-4">
                  <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                    Professional Templates
                  </h2>
                  <p className="text-muted-foreground text-lg md:text-xl">
                    Choose between our ATS-optimized scanner template for
                    maximum compatibility, or our Creative template for a modern
                    look that stands out.
                  </p>
                </div>
                <ul className="space-y-6">
                  <TemplateFeature
                    number="1"
                    title="ATS Scanner"
                    description="Proven single-column layout parsers love."
                  />
                  <TemplateFeature
                    number="2"
                    title="Creative Sidebar"
                    description="Two-column layout with skill visualization."
                  />
                  <TemplateFeature
                    number="3"
                    title="Customizable"
                    description="Adjust theme colors to match your personal brand."
                  />
                </ul>
                <div className="pt-4">
                  <Link href="/templates">
                    <Button
                      size="lg"
                      className="h-12 px-8 text-base cursor-pointer"
                    >
                      Choose Template
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="relative aspect-video rounded-2xl bg-muted/20 shadow-2xl border p-3 group/mock hover:scale-[1.02] transition-all duration-500 overflow-hidden ring-1 ring-border/50">
                <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />

                <div className="flex h-full gap-3 overflow-hidden rounded-xl border bg-background shadow-sm relative">
                  {/* Left Sidebar Mock */}
                  <div className="w-14 shrink-0 border-r bg-muted/30 flex flex-col items-center py-4 gap-4">
                    <div className="h-2 w-8 rounded-full bg-primary/20" />
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                          i === 1
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground/30"
                        }`}
                      >
                        <div className="h-3 w-3 bg-current rounded-xs opacity-50" />
                      </div>
                    ))}
                    <div className="mt-auto h-8 w-8 rounded-full bg-muted/50" />
                  </div>

                  {/* Editor Side Mock */}
                  <div className="w-1/3 shrink-0 border-r p-4 space-y-4 bg-muted/5">
                    <div className="space-y-2">
                      <div className="h-2 w-12 bg-muted-foreground/20 rounded-full" />
                      <div className="h-8 w-full bg-background border rounded-lg" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-2 w-16 bg-muted-foreground/20 rounded-full" />
                      <div className="h-20 w-full bg-background border rounded-lg" />
                    </div>
                    <div className="space-y-2 pt-2">
                      <div className="h-2 w-full bg-muted-foreground/10 rounded-full" />
                      <div className="h-2 w-2/3 bg-muted-foreground/10 rounded-full" />
                    </div>
                  </div>

                  {/* Preview Container Mock */}
                  <div className="flex-1 bg-muted/40 p-6 flex flex-col items-center overflow-hidden">
                    {/* Floating Toolbar */}
                    <div className="mb-4 h-8 px-3 rounded-full bg-background border shadow-sm flex items-center gap-3">
                      <div className="h-2 w-8 bg-muted-foreground/20 rounded-full" />
                      <div className="h-3 w-px bg-border" />
                      <div className="flex gap-1.5 font-sans">
                        <div className="h-3 w-3 bg-muted-foreground/20 rounded-full" />
                        <div className="h-3 w-3 bg-muted-foreground/20 rounded-full" />
                      </div>
                    </div>

                    {/* Resume Document Mock */}
                    <div className="w-full h-[150%] bg-background rounded-sm shadow-xl border p-8 space-y-6 transform origin-top translate-y-2 group-hover/mock:translate-y-0 transition-transform duration-700">
                      {/* Header */}
                      <div className="space-y-3">
                        <div className="h-6 w-32 bg-foreground/10 rounded-xs" />
                        <div className="h-2 w-48 bg-muted-foreground/20 rounded-full" />
                        <div className="flex gap-3">
                          <div className="h-2 w-16 bg-primary/20 rounded-full" />
                          <div className="h-2 w-20 bg-muted-foreground/10 rounded-full" />
                        </div>
                      </div>

                      <div className="h-px bg-border" />

                      {/* Content Blocks */}
                      <div className="space-y-5">
                        <div className="space-y-2">
                          <div className="h-3 w-24 bg-foreground/10 rounded-xs" />
                          <div className="space-y-1.5">
                            <div className="h-2 w-full bg-muted-foreground/5 rounded-full" />
                            <div className="h-2 w-[90%] bg-muted-foreground/5 rounded-full" />
                            <div className="h-2 w-[95%] bg-muted-foreground/5 rounded-full" />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="h-3 w-28 bg-foreground/10 rounded-xs" />
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <div className="h-2 w-full bg-muted-foreground/5 rounded-full" />
                              <div className="h-2 w-5/6 bg-muted-foreground/5 rounded-full" />
                            </div>
                            <div className="space-y-2">
                              <div className="h-2 w-full bg-muted-foreground/5 rounded-full" />
                              <div className="h-2 w-4/6 bg-muted-foreground/5 rounded-full" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-background/5 opacity-0 group-hover/mock:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <div className="px-4 py-2 rounded-full bg-foreground text-background text-xs font-bold shadow-2xl scale-90 group-hover/mock:scale-100 transition-transform">
                      Live Editing Mode
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-muted/50">
          <div className="landing-container mx-auto px-4 md:px-6 text-center">
            <div className="max-w-3xl mx-auto space-y-8">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                Ready to Build Your Resume?
              </h2>
              <p className="text-muted-foreground/90 text-lg md:text-2xl leading-relaxed">
                Join thousands of privacy-conscious professionals.{" "}
                <br className="hidden sm:inline" />
                No account required. Open source. Free forever.
              </p>
              <div className="pt-4">
                <Link href="/templates">
                  <Button
                    size="lg"
                    variant="default"
                    className="h-14 px-10 text-lg shadow-xl hover:shadow-2xl transition-all cursor-pointer"
                  >
                    Create My Resume
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-6 bg-background">
        <div className="landing-container mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-sm text-muted-foreground text-center md:text-left">
            © {new Date().getFullYear()} PrivateCV. Open Source & Privacy-First.
          </div>
          <div className="flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <Link
              href="https://github.com/1arunjyoti/resume-builder"
              className="hover:text-foreground transition-colors"
              target="_blank"
            >
              GitHub
            </Link>

            <Link
              href="/privacy"
              className="hover:text-foreground transition-colors"
            >
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="group flex flex-col items-center text-center p-8 bg-card rounded-2xl border shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
      <div
        className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors"
        aria-hidden="true"
      >
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

function TemplateFeature({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <li className="flex items-start gap-4">
      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
        <span className="text-sm font-bold text-primary">{number}</span>
      </div>
      <div>
        <span className="font-semibold text-foreground block mb-1">
          {title}
        </span>
        <span className="text-muted-foreground">{description}</span>
      </div>
    </li>
  );
}
